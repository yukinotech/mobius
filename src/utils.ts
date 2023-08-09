export const isCodeFile = (filePath: string | undefined) => {
  return (
    filePath?.endsWith('.ts') ||
    filePath?.endsWith('.tsx') ||
    filePath?.endsWith('.mts') ||
    filePath?.endsWith('.mjs') ||
    filePath?.endsWith('.jsx') ||
    filePath?.endsWith('.js')
  )
}
