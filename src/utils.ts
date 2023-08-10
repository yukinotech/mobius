import type { Mode } from './types'

export const isCodeFile = (filePath: string | undefined, mode: Mode) => {
  if (mode === 'typescript') {
    return filePath?.endsWith('.ts') || filePath?.endsWith('.tsx') || filePath?.endsWith('.mts')
  }
  if (mode === 'commonjs') {
    return filePath?.endsWith('.js') || filePath?.endsWith('.jsx')
  }
  if (mode === 'esm') {
    return filePath?.endsWith('.mjs') || filePath?.endsWith('.jsx') || filePath?.endsWith('.js')
  }
}
