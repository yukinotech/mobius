import { Worker } from 'worker_threads'
import path from 'path'
import { debug } from '../debug'
import type { CompilerOptions } from 'typescript'
import type { Mode, ImportedModule } from '../interface'

export const parseFileWorkerTask = async ({
  codePathList,
  tsCompilerOption,
  mode,
}: {
  codePathList: string[]
  tsCompilerOption: CompilerOptions | undefined
  mode: Mode
}): Promise<Record<string, ImportedModule[]>> => {
  debug('call parseSingleFileWorker')

  const worker = new Worker(path.join(__dirname, '../worker/parseFileWorker.js'), {
    workerData: {
      codePathList,
      tsCompilerOption,
      mode,
    },
  })

  return new Promise((resolve, reject) => {
    worker.once('message', (result) => {
      debug('worker message', result)
      resolve(result)
    })

    worker.on('error', (error) => {
      debug('worker error', error)
      reject(error)
    })

    worker.on('exit', (exitCode) => {
      debug('worker exit', exitCode)
    })
  })
}
