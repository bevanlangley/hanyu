import { describe, it, expect } from 'vitest'
import { getUniqueTags } from './seedsService'
import type { Seed } from '@/lib/database.types'

function makeSeed(overrides: Partial<Seed> = {}): Seed {
  return {
    id: 'test-id',
    name: 'Test Seed',
    source_url: null,
    tag: null,
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

describe('getUniqueTags', () => {
  it('returns empty array when no seeds have tags', () => {
    const seeds = [makeSeed({ tag: null }), makeSeed({ tag: null })]
    expect(getUniqueTags(seeds)).toEqual([])
  })

  it('returns unique tags sorted alphabetically', () => {
    const seeds = [
      makeSeed({ tag: 'youtube' }),
      makeSeed({ tag: 'hsk' }),
      makeSeed({ tag: 'youtube' }),
      makeSeed({ tag: 'podcast' }),
    ]
    expect(getUniqueTags(seeds)).toEqual(['hsk', 'podcast', 'youtube'])
  })

  it('filters out null tags', () => {
    const seeds = [
      makeSeed({ tag: 'hsk' }),
      makeSeed({ tag: null }),
    ]
    expect(getUniqueTags(seeds)).toEqual(['hsk'])
  })
})
