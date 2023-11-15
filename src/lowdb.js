import fs from 'fs-extra'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { JSONSyncPreset } from 'lowdb/node'

const __filename = fileURLToPath(import.meta.url)
const __dirname = resolve(__filename, '..')

export function openKeywordsDB() {
  const originalKeywords = fs.readFileSync(resolve(__dirname, './keywords.txt'), 'utf-8').split('\n').filter(Boolean)

  const db = JSONSyncPreset(resolve(__dirname, 'db/keywords.json'), {})
  const data = db.data

  originalKeywords.forEach(keyword => {
    if (!data[keyword]) data[keyword] = {}
  })

  db.write()

  return [db, data]
}