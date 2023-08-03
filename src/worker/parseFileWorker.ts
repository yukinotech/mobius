import { Worker, parentPort, workerData } from 'worker_threads'
import { ImportedModule, parseSingleFile } from '../parseSingleFile'
import type { CompilerOptions } from 'typescript'

const main = async () => {
  const typedWorkerData = workerData as {
    codePathList: string[]
    tsCompilerOption: CompilerOptions
  }

  const { codePathList, tsCompilerOption } = typedWorkerData
  const rtn: Record<string, ImportedModule[]> = {}
  for (let i = 0; i < codePathList.length; i++) {
    const value = await parseSingleFile({
      codePath: codePathList[i],
      tsCompilerOption,
    })
    rtn[codePathList[i]] = value
  }

  parentPort?.postMessage(rtn)
}

main()
