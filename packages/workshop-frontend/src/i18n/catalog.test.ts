import { describe, expect, it } from 'vitest'
import en from './en'
import ko from './ko'
import type { MessageTree } from './types'

const flatten = (tree: MessageTree, prefix = ''): Record<string, string> =>
  Object.fromEntries(Object.entries(tree).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    return typeof value === 'string' ? [[path, value]] : Object.entries(flatten(value, path))
  }))

const english = flatten(en)
const korean = flatten(ko)
const variables = (message: string) => [...message.matchAll(/\{(\w+)\}/g)]
  .map(match => match[1]).toSorted()

describe('translation catalogs', () => {
  it('provides Korean entries for every English key, with no orphan keys', () => {
    expect(Object.keys(korean).toSorted()).toEqual(Object.keys(english).toSorted())
  })

  it('preserves interpolation variables in every Korean message', () => {
    const mismatches = Object.keys(english).filter(key =>
      JSON.stringify(variables(english[key])) !== JSON.stringify(variables(korean[key] ?? '')),
    )
    expect(mismatches).toEqual([])
  })

  it('defines every statically referenced UI message', () => {
    const sources = import.meta.glob<string>(['../**/*.{ts,tsx}', '!../i18n/**'], {
      query: '?raw', import: 'default', eager: true,
    })
    const missing = new Set<string>()
    for (const source of Object.values(sources)) {
      for (const match of source.matchAll(/\bt\(['"]([^'"]+)['"]/g)) {
        if (!(match[1] in english)) missing.add(match[1])
      }
    }
    expect([...missing].toSorted()).toEqual([])
  })
})
