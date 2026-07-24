import { describe, expect, it } from 'vitest'
import { getSensitivePathReason } from './check-staged-files.mjs'

describe('getSensitivePathReason', () => {
  it.each([
    '.env.example',
    'config/.env.sample',
    'config/.env.production.template',
    'src/components/normal source.tsx',
    'fixtures/app.db.json',
    'docs/env.example.md',
    'assets/monkey.svg',
    '.ssh/id_rsa.pub',
    'certificates/site.pem.txt',
  ])('allows harmless path %s', (path) => {
    expect(getSensitivePathReason(path)).toBeNull()
  })

  it.each([
    '.env',
    '.env.production',
    'config/.env.development local',
    'data/application.db',
    'data/application.sqlite',
    'data/application.sqlite3',
    'data/application.db-journal',
    'data/application.sqlite-wal',
    'data/application.sqlite3-shm',
    'keys/deployment.pem',
    'keys/deployment.key',
    'certificates/site.crt',
    'certificates/site.cer',
    'certificates/site.p12',
    'certificates/site.pfx',
    'certificates/site.jks',
    'certificates/site.keystore',
    '.ssh/id_rsa',
    '.ssh/id_ed25519',
    '.ssh/ssh_host_ed25519_key',
  ])('blocks sensitive path %s', (path) => {
    expect(getSensitivePathReason(path)).not.toBeNull()
  })
})
