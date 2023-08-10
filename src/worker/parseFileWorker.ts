import { Worker, parentPort, workerData } from 'worker_threads'
import { parseSingleFile } from '../parseSingleFile'
import type { CompilerOptions } from 'typescript'
import type { ImportedModule, Mode } from '../types'

const main = async () => {
  const typedWorkerData = workerData as {
    codePathList: string[]
    tsCompilerOption: CompilerOptions | undefined
    mode: Mode
  }

  const { codePathList, tsCompilerOption, mode } = typedWorkerData
  const rtn: Record<string, ImportedModule[]> = {}
  for (let i = 0; i < codePathList.length; i++) {
    const value = await parseSingleFile({
      codePath: codePathList[i],
      tsCompilerOption,
      mode,
    })
    rtn[codePathList[i]] = value
  }

  parentPort?.postMessage(rtn)
}

main()
