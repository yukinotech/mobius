#!/usr/bin/env node
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import main from '../index'
import { debug } from '../debug'
import path from 'path'

yargs(hideBin(process.argv))
  .usage('Usage: mobius [command] <options>')
  .alias('h', 'help')
  .command(
    'run [codeDirPath]',
    'find and log the list of all circular dependency"',
    (yargs) => {
      console.log()
      yargs.options('tsConfigPath', {
        type: 'string',
        describe: 'path of tsconfig.json',
        alias: 't',
      })
    },
    async (argv) => {
      debug('argv', argv)
      if (argv?.debug) {
        process.env.NODE_DEBUG = 'mobius'
      }
      const tsConfigPath = argv.tsConfigPath
      const codeDirPath = argv.codeDirPath
      if (typeof tsConfigPath !== 'string') {
        console.error('Error: tsConfigPath error, tsConfigPath is not string')
        process.exit(1)
      }
      if (typeof codeDirPath !== 'string') {
        console.error('Error: codeDirPath error, codeDirPath is not string')
        process.exit(1)
      }

      const absoluteTsConfigPath = path.resolve(process.cwd(), tsConfigPath)
      const absoluteCodeDirPath = path.resolve(process.cwd(), codeDirPath)
      const circle = await main({
        tsConfigPath: absoluteTsConfigPath,
        projectDir: absoluteCodeDirPath,
      })
      console.log(circle)
    }
  )
  .options('debug', {
    type: 'boolean',
    describe: 'debug mode',
    alias: 'd',
  }).argv
