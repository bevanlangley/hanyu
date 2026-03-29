import { describe, it, expect } from 'vitest'
import { phraseSchema } from './phrases'

describe('phraseSchema', () => {
  it('accepts a valid phrase', () => {
    const result = phraseSchema.safeParse({
      mandarin: '你好',
      pinyin: 'nǐ hǎo',
      english: 'Hello',
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing mandarin', () => {
    const result = phraseSchema.safeParse({ mandarin: '', pinyin: 'nǐ hǎo', english: 'Hello' })
    expect(result.success).toBe(false)
  })

  it('rejects missing pinyin', () => {
    const result = phraseSchema.safeParse({ mandarin: '你好', pinyin: '', english: 'Hello' })
    expect(result.success).toBe(false)
  })

  it('rejects missing english', () => {
    const result = phraseSchema.safeParse({ mandarin: '你好', pinyin: 'nǐ hǎo', english: '' })
    expect(result.success).toBe(false)
  })

  it('trims all fields', () => {
    const result = phraseSchema.safeParse({
      mandarin: '  你好  ',
      pinyin: '  nǐ hǎo  ',
      english: '  Hello  ',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.mandarin).toBe('你好')
      expect(result.data.pinyin).toBe('nǐ hǎo')
      expect(result.data.english).toBe('Hello')
    }
  })
})
