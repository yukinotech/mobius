import type { ImportedModule } from './types'

export const findCycles = (graph: Record<string, ImportedModule[]>): string[][] => {
  const cycles: string[][] = []
  const visited: Set<string> = new Set()
  const onStack: Set<string> = new Set()

  const dfs = (node: ImportedModule, path: string[]) => {
    if (onStack.has(node.resolvedFileName as string)) {
      cycles.push([...path, node.resolvedFileName as string])
      return
    }

    if (visited.has(node.resolvedFileName as string)) {
      return
    }

    visited.add(node.resolvedFileName as string)
    onStack.add(node.resolvedFileName as string)
    path.push(node.resolvedFileName as string)

    for (const neighbor of graph[node.resolvedFileName as string] ?? []) {
      dfs(neighbor, path)
    }

    path.pop()
    onStack.delete(node.resolvedFileName as string)
  }

  for (const node in graph) {
    if (!visited.has(node)) {
      dfs({ resolvedFileName: node, value: '', typeOnly: undefined }, [])
    }
  }

  return cycles
}
