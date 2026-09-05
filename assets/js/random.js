// Taken from https://github.com/bryc/code/blob/master/jshash/PRNGs.md

const hashMap = {}
const toHash = (str) => {
  if (!hashMap[str]) {
    hashMap[str] = Array.from(str).reduce((hash, c) => {
      const char = c.charCodeAt(0)
      const next = ((hash << 5) - hash) + char
      return next & next
    }, 0)
  }
  return hashMap[str]
}

export const splitmix32 = (a) => {
  a |= 0
  a = a + 0x9e3779b9 | 0
  var t = a ^ a >>> 15
  t = Math.imul(t, 0x85ebca6b)
  t = t ^ t >>> 13
  t = Math.imul(t, 0xc2b2ae35)
  return ((t = t ^ t >>> 16) >>> 0) / 4294967296
}

export const getConsistentRand = (id, vars = [1]) => {
  const seed = toHash(id)
  const varSeed = vars.reduce((a, c) => a + splitmix32(c) * seed, 0)
  return () => splitmix32(varSeed)
}

export const randomUInt = ({ limit, rand }) => Math.round(rand() * limit)