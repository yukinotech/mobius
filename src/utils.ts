import fs from 'fs/promises'
import path from 'path'
import type { Mode } from './interface'

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

export const recursiveReadDir = async (
  folderPath: string,
  fileList: string[] = [],
): Promise<string[]> => {
  const files = await fs.readdir(folderPath)

  for (const file of files) {
    const filePath = path.resolve(path.join(folderPath, file))
    const fileStats = await fs.stat(filePath)

    // exclude node_modules
    if (filePath.includes('node_modules')) {
      continue
    }
    if (fileStats.isDirectory()) {
      await recursiveReadDir(filePath, fileList)
    } else {
      fileList.push(filePath)
    }
  }
  return fileList
}

export const isFile = async (filePath: string) => {
  const fileStats = await fs.stat(filePath)
  if (fileStats.isDirectory()) {
    return true
  } else {
    return false
  }
}

export const isSubPath = (parentPath: string, childPath: string) => {
  const normalizedParent = path.resolve(parentPath)
  const normalizedChild = path.resolve(childPath)
  return normalizedChild.startsWith(normalizedParent) // include self
}
