import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const APPROVED_ENV_TEMPLATE_PATTERN =
  /^\.env(?:\.[^.]+)*\.(?:example|sample|template)$/i
const ENVIRONMENT_FILE_PATTERN = /^\.env/i
const SQLITE_FILE_PATTERN =
  /\.(?:db|sqlite|sqlite3)(?:[-.](?:journal|wal|shm))?$/i
const PRIVATE_KEY_OR_CERTIFICATE_PATTERN =
  /\.(?:pem|key|crt|cer|der|p12|pfx|jks|keystore)$/i
const SSH_PRIVATE_KEY_FILENAMES = new Set([
  'id_rsa',
  'id_dsa',
  'id_ecdsa',
  'id_ed25519',
  'id_ecdsa_sk',
  'id_ed25519_sk',
  'id_xmss',
  'identity',
])
const SSH_HOST_PRIVATE_KEY_PATTERN = /^ssh_host_.+_key$/i

const getBasename = (path) => path.slice(path.lastIndexOf('/') + 1)

export const getSensitivePathReason = (path) => {
  const filename = getBasename(path)

  if (
    ENVIRONMENT_FILE_PATTERN.test(filename) &&
    !APPROVED_ENV_TEMPLATE_PATTERN.test(filename)
  ) {
    return 'plik środowiskowy'
  }
  if (SQLITE_FILE_PATTERN.test(filename)) return 'plik bazy SQLite'
  if (PRIVATE_KEY_OR_CERTIFICATE_PATTERN.test(filename)) {
    return 'klucz prywatny, certyfikat lub magazyn kluczy'
  }
  if (
    SSH_PRIVATE_KEY_FILENAMES.has(filename.toLowerCase()) ||
    SSH_HOST_PRIVATE_KEY_PATTERN.test(filename)
  ) {
    return 'prywatny klucz SSH'
  }

  return null
}

const splitNullDelimited = (value) => {
  const entries = []
  let start = 0

  for (let index = 0; index < value.length; index += 1) {
    if (value[index] !== 0) continue
    entries.push(value.subarray(start, index).toString())
    start = index + 1
  }

  if (start < value.length) entries.push(value.subarray(start).toString())
  return entries
}

export const getStagedFilePaths = () => {
  const output = execFileSync(
    'git',
    ['diff', '--cached', '--name-status', '-z', '--diff-filter=ACMR'],
    { encoding: 'buffer' },
  )
  const entries = splitNullDelimited(output)
  const paths = []

  for (let index = 0; index < entries.length; ) {
    const status = entries[index]
    index += 1

    if (!status) continue
    if (/^[CR]/.test(status)) {
      index += 1
      const renamedPath = entries[index]
      index += 1
      if (renamedPath) paths.push(renamedPath)
      continue
    }

    const path = entries[index]
    index += 1
    if (path) paths.push(path)
  }

  return paths
}

export const findSensitiveStagedPaths = (paths) =>
  paths.flatMap((path) => {
    const reason = getSensitivePathReason(path)
    return reason ? [{ path, reason }] : []
  })

export const main = () => {
  const blockedPaths = findSensitiveStagedPaths(getStagedFilePaths())
  if (blockedPaths.length === 0) return

  process.stderr.write(
    'Zablokowano potencjalnie wrażliwe pliki w indeksie Git:\n',
  )
  for (const { path, reason } of blockedPaths) {
    process.stderr.write(`- ${path} (${reason})\n`)
  }
  process.stderr.write(
    '\nUsuń je z indeksu lub użyj zatwierdzonego szablonu .env.example, .env.sample albo .env.template.\n',
  )
  process.exitCode = 1
}

const isMainModule =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isMainModule) main()
