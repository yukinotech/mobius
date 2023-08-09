import type { CompilerOptions } from 'typescript'
import { findCycles } from './findCycles'
import { debug } from './debug'
import { parseFileWorkerTask } from './task/parseFileWorkerTask'
import type { ImportedModule } from './parseSingleFile'
import { parseTsConfig } from './parseTsConfig'
import { recursiveReadDir } from './recursiveReadDir'
import { isCodeFile } from './utils'

const processArrayWithWorker = async <T extends string>(
  data: T[],
  threadNum: number,
  tsCompilerOption: CompilerOptions,
): Promise<Record<string, ImportedModule[]>> => {
  const totalChunks = Math.min(threadNum, data.length)
  const chunkSize = Math.ceil(data.length / totalChunks)

  const promises: Promise<Record<string, ImportedModule[]>>[] = []

  for (let i = 0; i < totalChunks; i++) {
    const chunk = data.slice(i * chunkSize, (i + 1) * chunkSize)
    promises.push(traverseArray(chunk, tsCompilerOption))
  }

  // wait all Worker result
  const results = await Promise.all(promises)

  // merge all result
  const mergedResult = results.reduce(
    (pre, current) => {
      return Object.assign(pre, current)
    },
    {} as Record<string, ImportedModule[]>,
  )

  return mergedResult
}

const traverseArray = async <T extends string>(
  arr: T[],
  tsCompilerOption: CompilerOptions,
): Promise<Record<string, ImportedModule[]>> => {
  const res = await parseFileWorkerTask({
    tsCompilerOption,
    codePathList: arr,
  })

  return res
}

const mobius = async ({
  tsConfigPath,
  projectDir,
  threadNum,
}: {
  tsConfigPath?: string
  projectDir: string
  threadNum: number // thread number
}) => {
  debug('recursiveReadDir start')
  const fileList = await recursiveReadDir(projectDir)
  debug('recursiveReadDir end')
  debug('fileList', fileList)

  const filterFileList = fileList.filter((item) => {
    return isCodeFile(item)
  })
  debug('filterFileList', filterFileList)

  const parsedCompilerOptions = parseTsConfig(tsConfigPath)

  debug('parsedCompilerOptions', parsedCompilerOptions)

  const res = await processArrayWithWorker(filterFileList, threadNum, parsedCompilerOptions)

  const cycles = findCycles(res)
  return cycles
}

export default mobius
