import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const schema =
  process.env.SCHEDULER_OPENAPI_PATH ??
  '../scheduler-project/scheduler/build/generated/openapi.json'
if (!existsSync(schema))
  throw new Error(
    'Generate scheduler OpenAPI first or set SCHEDULER_OPENAPI_PATH',
  )
execFileSync(
  'pnpm',
  [
    '--dir',
    'tools/booking-api',
    'exec',
    'openapi-typescript',
    resolve(schema),
    '-o',
    resolve('src/libs/booking/schema.d.ts'),
  ],
  { stdio: 'inherit' },
)

execFileSync(
  'pnpm',
  ['exec', 'biome', 'format', '--write', 'src/libs/booking/schema.d.ts'],
  { stdio: 'inherit' },
)
