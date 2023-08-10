import * as swc from '@swc/core'
import type { Node } from '@swc/core'
import * as resolve from 'resolve'
import fs from 'fs/promises'
import path from 'path'
import ts from 'typescript'
import type { CompilerOptions } from 'typescript'
import { debug } from './debug'
import { isCodeFile } from './utils'
import type { ImportedModule } from './interface'

const visit = (node: any, list: string[]) => {
  if (
    node?.type === 'CallExpression' &&
    node?.callee?.type === 'Identifier' &&
    node?.callee?.value === 'require'
  ) {
    const value = node?.arguments?.[0]?.expression?.value
    list.push(value)
  }

  for (const key of Object.keys(node)) {
    if (Array.isArray(node[key])) {
      node[key].map((item: any) => {
        visit(item, list)
      })
    } else if (typeof node[key] === 'object' && node[key] !== null) {
      visit(node[key], list)
    }
  }
}

const findImportFileList = (ast: swc.Module): string[] => {
  const list: string[] = []
  visit(ast, list)
  return list
}

const resolvePath = async (value: string, codeDirPath: string): Promise<string | undefined> => {
  return new Promise((res, rej) => {
    resolve.default(value, { basedir: codeDirPath }, (err, value) => {
      if (err) {
        debug('commonjs resolvePath error', err)
        res(undefined)
      } else {
        res(value)
      }
    })
  })
}

export const parseCommonjsSingleFile = async (codePath: string): Promise<ImportedModule[]> => {
  const sourceCode = await fs.readFile(codePath, {
    encoding: 'utf-8',
  })

  const res = await swc.parse(sourceCode, {
    syntax: 'ecmascript',
    jsx: true,
  })

  const importFile = findImportFileList(res)

  const codeDirPath = path.dirname(codePath)
  const resolvedImportList = await Promise.all(
    importFile.map((value) => {
      return resolvePath(value, codeDirPath)
    }),
  )

  debug('resolvedImportList', resolvedImportList)

  const filteredImportList: ImportedModule[] = resolvedImportList
    .filter((value) => {
      if (value === undefined) {
        return false
      }
      if (resolve.isCore(value)) {
        return false
      }
      if (!isCodeFile(value, 'commonjs')) {
        return false
      }
      return true
    })
    .map((item) => {
      return {
        typeOnly: false,
        value: '',
        resolvedFileName: item,
      }
    })

  return filteredImportList
}
