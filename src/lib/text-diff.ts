/**
 * Minimal line-level diff (LCS based) for comparing two prompt versions.
 * Returns an ordered list of operations suitable for a unified diff view.
 * Pure and dependency-free so it is easy to unit-test.
 */

export type DiffOp = { type: 'same' | 'add' | 'remove'; text: string }

export function diffLines(a: string, b: string): DiffOp[] {
  const aLines = a.split('\n')
  const bLines = b.split('\n')
  const n = aLines.length
  const m = bLines.length

  // dp[i][j] = length of the LCS of aLines[i:] and bLines[j:]
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = aLines[i] === bLines[j]
        ? dp[i + 1][j + 1] + 1
        : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }

  const ops: DiffOp[] = []
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (aLines[i] === bLines[j]) {
      ops.push({ type: 'same', text: aLines[i] }); i++; j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ type: 'remove', text: aLines[i] }); i++
    } else {
      ops.push({ type: 'add', text: bLines[j] }); j++
    }
  }
  while (i < n) ops.push({ type: 'remove', text: aLines[i++] })
  while (j < m) ops.push({ type: 'add', text: bLines[j++] })
  return ops
}

/** True when the two texts are identical (no add/remove ops). */
export function isIdentical(ops: DiffOp[]): boolean {
  return ops.every((o) => o.type === 'same')
}
