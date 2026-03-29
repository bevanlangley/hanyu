import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import type { Seed, SeedWithCount } from '@/lib/database.types'
import type { z } from 'zod'
import type { seedSchema } from '@/lib/schemas/seeds'

export type SeedFormData = z.infer<typeof seedSchema>

export async function fetchSeeds(): Promise<SeedWithCount[]> {
  logger.info('Fetching seeds')

  const [seedsResult, phrasesResult] = await Promise.all([
    supabase.from('seeds').select('*').order('created_at', { ascending: false }),
    supabase.from('phrases').select('id, seed_id'),
  ])

  if (seedsResult.error) {
    logger.error('Failed to fetch seeds', seedsResult.error)
    throw seedsResult.error
  }
  if (phrasesResult.error) {
    logger.error('Failed to fetch phrase counts', phrasesResult.error)
    throw phrasesResult.error
  }

  const countMap = new Map<string, number>()
  for (const p of phrasesResult.data ?? []) {
    countMap.set(p.seed_id, (countMap.get(p.seed_id) ?? 0) + 1)
  }

  const seeds: SeedWithCount[] = (seedsResult.data ?? []).map(seed => ({
    ...seed,
    phraseCount: countMap.get(seed.id) ?? 0,
  }))

  logger.info('Seeds fetched', { count: seeds.length })
  return seeds
}

export async function fetchSeedById(id: string): Promise<Seed | null> {
  logger.info('Fetching seed', { id })
  const { data, error } = await supabase.from('seeds').select('*').eq('id', id).single()

  if (error) {
    logger.error('Failed to fetch seed', error)
    throw error
  }
  logger.info('Seed fetched', { id })
  return data
}

export async function createSeed(values: SeedFormData): Promise<Seed> {
  logger.info('Creating seed', { name: values.name })
  const { data, error } = await supabase
    .from('seeds')
    .insert({
      name: values.name,
      source_url: values.source_url || null,
      tag: values.tag || null,
    })
    .select()
    .single()

  if (error) {
    logger.error('Failed to create seed', error)
    throw error
  }
  logger.info('Seed created', { id: data.id })
  return data
}

export async function updateSeed(id: string, values: SeedFormData): Promise<Seed> {
  logger.info('Updating seed', { id })
  const { data, error } = await supabase
    .from('seeds')
    .update({
      name: values.name,
      source_url: values.source_url || null,
      tag: values.tag || null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    logger.error('Failed to update seed', error)
    throw error
  }
  logger.info('Seed updated', { id })
  return data
}

export async function deleteSeed(id: string): Promise<void> {
  logger.info('Deleting seed', { id })
  const { error } = await supabase.from('seeds').delete().eq('id', id)

  if (error) {
    logger.error('Failed to delete seed', error)
    throw error
  }
  logger.info('Seed deleted', { id })
}

export function getUniqueTags(seeds: Seed[]): string[] {
  const tags = seeds.map(s => s.tag).filter((t): t is string => Boolean(t))
  return [...new Set(tags)].sort()
}
