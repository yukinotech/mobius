import * as swc from '@swc/core'
import fs from 'fs/promises'
import path from 'path'
import ts from 'typescript'
import type { CompilerOptions } from 'typescript'
import { debug } from './debug'
import { isCodeFile } from './utils'
import type { ImportedModule } from './types'

const host = ts.createCompilerHost({})

const findImportFileList = (ast: swc.Module): ImportedModule[] => {
  const list = []
  for (let i = 0; i < ast.body.length; i++) {
    const item = ast.body[i]
    if (item.type === 'ImportDeclaration') {
      // import A from './A'
      // import * as A from './A'
      // import { A } from './A'
      // import './A'
      list.push({
        value: item.source.value,
        typeOnly: item.typeOnly,
        resolvedFileName: undefined,
      })
    } else if (item.type === 'ExportAllDeclaration') {
      // export * from './A'
      list.push({
        value: item.source.value,
        // @ts-ignore
        typeOnly: item.typeOnly,
        resolvedFileName: undefined,
      })
    } else if (item.type === 'ExportNamedDeclaration' && item.source) {
      // export { a as A } from './A'
      // export { A } from './A'
      // export * as A from './A'
      list.push({
        value: item.source.value,
        typeOnly: item.typeOnly,
        resolvedFileName: undefined,
      })
    } else if (
      // import A = require('./A')
      item.type === 'TsImportEqualsDeclaration' &&
      item?.moduleRef?.type === 'TsExternalModuleReference'
    ) {
      list.push({
        value: item.moduleRef?.expression.value,
        typeOnly: undefined,
        resolvedFileName: undefined,
      })
    }
  }
  return list
}

export const parseTsSingleFile = async (
  codePath: string,
  tsCompilerOption: CompilerOptions | undefined,
): Promise<ImportedModule[]> => {
  const sourceCode = await fs.readFile(codePath, {
    encoding: 'utf-8',
  })

  const res = await swc.parse(sourceCode, {
    syntax: 'typescript',
    tsx: codePath?.endsWith('.tsx') ? true : false,
  })

  const importFile = findImportFileList(res)

  for (let i = 0; i < importFile.length; i++) {
    let namedModule: undefined | ts.ResolvedModuleWithFailedLookupLocations
    try {
      namedModule = ts.resolveModuleName(
        importFile[i].value,
        codePath,
        tsCompilerOption || {},
        host,
      )
      debug('resolvedFileName', namedModule?.resolvedModule?.resolvedFileName)
    } catch (e) {
      debug('resolvedFileName error', e)
    }

    importFile[i].resolvedFileName = namedModule?.resolvedModule?.resolvedFileName
      ? path.resolve(namedModule?.resolvedModule?.resolvedFileName)
      : undefined
  }

  const importFileClean = importFile
    // can add dynamic filter logic here
    .filter((item) => {
      // filter only type import
      return item.typeOnly !== true
    })
    .filter((item) => {
      // filter node_modules import
      return item.resolvedFileName?.indexOf('node_modules') === -1
    })
    .filter((item) => {
      // filter ts unsuccess import
      return item.resolvedFileName !== undefined
    })
    .filter((item) => {
      // filter which is not js or ts,such as import img，import css
      return isCodeFile(item.resolvedFileName, 'typescript')
    })

  debug('importFileClean', importFileClean)

  return importFileClean
}
