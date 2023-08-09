import { Worker } from 'worker_threads'
import path from 'path'
import type { ImportedModule } from '../parseSingleFile'
import { debug } from '../debug'
import type { CompilerOptions } from 'typescript'

export const parseFileWorkerTask = async ({
  codePathList,
  tsCompilerOption,
}: {
  codePathList: string[]
  tsCompilerOption: CompilerOptions
}): Promise<Record<string, ImportedModule[]>> => {
  debug('call parseSingleFileWorker')

  const worker = new Worker(path.join(__dirname, '../worker/parseFileWorker.js'), {
    workerData: {
      codePathList,
      tsCompilerOption,
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
