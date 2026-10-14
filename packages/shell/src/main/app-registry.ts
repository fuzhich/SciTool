import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { dirname } from 'path'
import type { AppRecord } from '@scitool/sdk'
import { registryFile } from './paths'

let cache: AppRecord[] | null = null

export function loadRegistry(): AppRecord[] {
  if (cache) return cache
  try {
    if (existsSync(registryFile())) {
      cache = JSON.parse(readFileSync(registryFile(), 'utf-8')) as AppRecord[]
    } else {
      cache = []
    }
  } catch {
    cache = []
  }
  return cache
}

function persist(records: AppRecord[]): void {
  mkdirSync(dirname(registryFile()), { recursive: true })
  writeFileSync(registryFile(), JSON.stringify(records, null, 2), 'utf-8')
  cache = records
}

export function getAppRecord(appId: string): AppRecord | undefined {
  return loadRegistry().find((r) => r.id === appId)
}

export function addAppRecord(record: AppRecord): void {
  const records = loadRegistry().filter((r) => r.id !== record.id)
  records.push(record)
  persist(records)
}

export function removeAppRecord(appId: string): void {
  persist(loadRegistry().filter((r) => r.id !== appId))
}
