import type { CompilerOptions } from 'typescript'
import { findCycles } from './findCycles'
import { debug } from './debug'
import { parseFileWorkerTask } from './task/parseFileWorkerTask'
import { parseTsConfig } from './parseTsConfig'
import { recursiveReadDir } from './recursiveReadDir'
import { isCodeFile } from './utils'
import type { ImportedModule, Mode } from './types'

const processArrayWithWorker = async <T extends string>(
  data: T[],
  threadNum: number,
  tsCompilerOption: CompilerOptions | undefined,
  mode: Mode,
): Promise<Record<string, ImportedModule[]>> => {
  const totalChunks = Math.min(threadNum, data.length)
  const chunkSize = Math.ceil(data.length / totalChunks)

  const promises: Promise<Record<string, ImportedModule[]>>[] = []

  for (let i = 0; i < totalChunks; i++) {
    const chunk = data.slice(i * chunkSize, (i + 1) * chunkSize)
    promises.push(traverseArray(chunk, tsCompilerOption, mode))
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
  tsCompilerOption: CompilerOptions | undefined,
  mode: Mode,
): Promise<Record<string, ImportedModule[]>> => {
  const res = await parseFileWorkerTask({
    tsCompilerOption,
    codePathList: arr,
    mode,
  })

  return res
}

const mobius = async ({
  tsConfigPath,
  projectDir,
  threadNum,
  mode,
}: {
  tsConfigPath?: string
  projectDir: string
  threadNum: number // thread number
  mode: Mode
}) => {
  debug('recursiveReadDir start')
  const fileList = await recursiveReadDir(projectDir)
  debug('recursiveReadDir end')
  debug('fileList', fileList)

  const filterFileList = fileList.filter((item) => {
    return isCodeFile(item, mode)
  })
  debug('filterFileList', filterFileList)

  const parsedCompilerOptions = mode === 'typescript' ? parseTsConfig(tsConfigPath) : undefined

  debug('parsedCompilerOptions', parsedCompilerOptions)

  const res = await processArrayWithWorker(filterFileList, threadNum, parsedCompilerOptions, mode)

  const cycles = findCycles(res)
  return cycles
}

export default mobius
