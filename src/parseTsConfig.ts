import ts from 'typescript'
import path from 'path'

export const parseTsConfig = (tsConfigPath: string | undefined) => {
  if (!tsConfigPath) {
    return {}
  }

  const tsParsedConfig = ts.readJsonConfigFile(tsConfigPath, ts.sys.readFile)

  const compilerOptions = ts.parseJsonSourceFileConfigFileContent(
    tsParsedConfig,
    ts.sys,
    path.dirname(tsConfigPath),
  ).options

  const parsedCompilerOptions = ts.convertCompilerOptionsFromJson(
    compilerOptions,
    tsConfigPath,
  ).options

  return parsedCompilerOptions
}
