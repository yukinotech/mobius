#!/usr/bin/env node
import commander from 'commander'
import chalk from 'chalk'
import main from '../index'
import { debug } from '../debug'
import path from 'path'
// @ts-ignore
import { LIB_VERSION } from '../version'

const program = new commander.Command()
const STRING_LOGO = String.raw`
              ___.   .__              
  _____   ____\_ |__ |__|__ __  ______
 /     \ /  _ \| __ \|  |  |  \/  ___/
|  Y Y  (  <_> ) \_\ \  |  |  /\___ \ 
|__|_|  /\____/|___  /__|____//____  >
      \/           \/              \/ 
`
const args = process.argv

if (args.length < 3 || args?.[2] === 'help' || args?.[2] === '-h') {
  console.log(chalk.yellowBright(STRING_LOGO))
}

program.version(LIB_VERSION).option('-h, --help', 'Show help')

program
  .command('run <codeDirPath>')
  .description('Run a script')
  .option('-t, --tsConfigPath <path>', 'Path to tsconfig.json')
  .option('-d, --debug', 'Enable debugging')
  .option('-s, --thread <threads>', 'thread number', (value) => {
    return parseInt(value)
  })

  .action(async (codeDirPath, cmdObj) => {
    if (cmdObj.debug) {
      // process.env.NODE_DEBUG = 'mobius'
      process.env.MOBIUS_CUSTOM_DEBUG = 'mobius'
      debug('cmdObj', cmdObj)
    }

    const tsConfigPath = cmdObj?.tsConfigPath

    if (typeof tsConfigPath !== 'string') {
      console.error('Error: tsConfigPath error, tsConfigPath is not string')
      process.exit(1)
    }
    if (typeof codeDirPath !== 'string') {
      console.error('Error: codeDirPath error, codeDirPath is not string')
      process.exit(1)
    }

    let threadNum
    if (!cmdObj?.thread) {
      threadNum = 4
    } else {
      threadNum = Number(cmdObj?.thread)
    }

    if (isNaN(threadNum) || threadNum < 1) {
      console.error('Error: thread is not a number')
      process.exit(1)
    }

    const absoluteTsConfigPath = path.resolve(process.cwd(), tsConfigPath)
    debug('absoluteTsConfigPath', absoluteTsConfigPath)
    const absoluteCodeDirPath = path.resolve(process.cwd(), codeDirPath)
    debug('absoluteCodeDirPath', absoluteCodeDirPath)

    const circle = await main({
      tsConfigPath: absoluteTsConfigPath,
      projectDir: absoluteCodeDirPath,
      threadNum,
    })
    if (circle.length !== 0) {
      console.log('circular dependency:')
      console.log(circle)
    } else {
      console.log('✅ congratulations , no circular dependency in project')
    }
  })

program.parse(process.argv)
