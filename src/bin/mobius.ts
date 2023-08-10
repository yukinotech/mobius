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
  .option('-d, --debug', 'Enable debugging')
  .option('-e, --exclude <exclude files>', 'exclude file')
  .option('-t, --tsConfigPath <path>', 'Path to tsconfig.json')
  .option('-m, --mode <mode type>', 'mode type "typescript"|"commonjs"|"esm"')
  .option('-s, --thread <threads>', 'thread number', (value) => {
    return parseInt(value)
  })

  .action(async (codeDirPath, cmdObj) => {
    if (cmdObj.debug) {
      // process.env.NODE_DEBUG = 'mobius'
      process.env.MOBIUS_CUSTOM_DEBUG = 'mobius'
      debug('cmdObj', cmdObj)
    }

    const tsConfigPath = cmdObj?.tsConfigPath as string
    let mode = cmdObj.mode as string

    if (!mode) {
      if (typeof tsConfigPath !== 'string') {
        console.error('Error: must provide -m mode : "typescript" | "commonjs" | "esm"')
        process.exit(1)
      } else {
        mode = 'typescript'
      }
    }

    if (mode !== 'typescript' && mode !== 'commonjs' && mode !== 'esm') {
      console.error('Error: -m mode must be "typescript" | "commonjs" | "esm"')
      process.exit(1)
    }

    if (typeof tsConfigPath !== 'string' && mode === 'typescript') {
      console.error('Error: tsConfigPath error, tsConfigPath is not string')
      process.exit(1)
    }
    if (typeof codeDirPath !== 'string') {
      console.error('Error: codeDirPath error, codeDirPath is not string')
      process.exit(1)
    }

    // handle threadNum
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

    // handle exclude files
    const excludeFiles: string[] = []
    if (cmdObj?.exclude) {
      const splitValue =
        cmdObj?.exclude
          ?.split(',')
          ?.map((excludeFilePath: string) => {
            try {
              return path.resolve(process.cwd(), excludeFilePath)
            } catch (e) {
              return undefined
            }
          })
          ?.filter((path: string | undefined) => {
            return !!path
          }) || []

      // splitValue might include dir，which will be handle later
      excludeFiles.push(...splitValue)
    }

    debug('parse exclude files', excludeFiles)

    const absoluteTsConfigPath = tsConfigPath && path.resolve(process.cwd(), tsConfigPath)
    debug('absoluteTsConfigPath', absoluteTsConfigPath)
    const absoluteCodeDirPath = path.resolve(process.cwd(), codeDirPath)
    debug('absoluteCodeDirPath', absoluteCodeDirPath)

    const circle = await main({
      tsConfigPath: absoluteTsConfigPath,
      projectDir: absoluteCodeDirPath,
      threadNum,
      mode,
      excludeFiles,
    })
    if (circle.length !== 0) {
      console.log('circular dependency:')
      console.log(JSON.stringify(circle, null, 2))
    } else {
      console.log('✅ congratulations , no circular dependency in project')
    }
  })

program.parse(process.argv)
