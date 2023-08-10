import * as swc from '@swc/core'
import fs from 'fs/promises'
import path from 'path'
import ts from 'typescript'
import type { CompilerOptions } from 'typescript'
import { debug } from './debug'
import { isCodeFile } from './utils'
import type { Mode } from './interface'
import { parseTsSingleFile } from './parseTsSingleFile'
import { parseCommonjsSingleFile } from './parseCommonjsSingleFile'

export const parseSingleFile = async ({
  codePath,
  tsCompilerOption,
  mode,
}: {
  codePath: string
  tsCompilerOption: CompilerOptions | undefined
  mode: Mode
  // @ts-ignore
}): Promise<ImportedModule[]> => {
  if (mode === 'typescript') {
    return parseTsSingleFile(codePath, tsCompilerOption)
  } else if (mode === 'commonjs') {
    return parseCommonjsSingleFile(codePath)
  } else if (mode === 'esm') {
  } else {
    throw new Error('unknown mode in parseSingleFile')
  }
}
