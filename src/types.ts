export type Mode = 'typescript' | 'commonjs' | 'esm'

export type ImportedModule = {
  typeOnly: boolean | undefined
  value: string
  resolvedFileName: string | undefined
}
