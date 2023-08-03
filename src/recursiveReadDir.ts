import fs from 'fs/promises'
import path from 'path'

export const recursiveReadDir = async (
  folderPath: string,
  fileList: string[] = []
): Promise<string[]> => {
  const files = await fs.readdir(folderPath)

  for (const file of files) {
    const filePath = path.resolve(path.join(folderPath, file))
    const fileStats = await fs.stat(filePath)

    if (fileStats.isDirectory()) {
      await recursiveReadDir(filePath, fileList)
    } else {
      fileList.push(filePath)
    }
  }
  return fileList
}
