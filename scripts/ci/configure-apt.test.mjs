// @vitest-environment node
import { spawnSync } from 'node:child_process'
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { expect, it } from 'vitest'

it.each(
  [
    'sources.list',
    'sources.list.d/ubuntu.list',
    'sources.list.d/ubuntu.sources',
  ].flatMap((layout) =>
    [false, true].map((mirrorList) => [layout, mirrorList]),
  ),
)(
  'reconfigures %s (mirror list: %s) without changing repository policy',
  (layout, mirrorList) => {
    const root = mkdtempSync(join(tmpdir(), 'booking-apt-'))
    try {
      const source = join(root, layout)
      mkdirSync(join(root, 'sources.list.d'), { recursive: true })
      mkdirSync(dirname(source), { recursive: true })
      const input = layout.endsWith('.sources')
        ? 'Types: deb\nURIs: http://azure.archive.ubuntu.com/ubuntu/ https://azure.archive.ubuntu.com/ubuntu/\nSuites: noble noble-updates noble-security\nComponents: main universe\nSigned-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg\n'
        : 'deb [signed-by=/usr/share/keyrings/ubuntu-archive-keyring.gpg] http://azure.archive.ubuntu.com/ubuntu/ noble main universe\ndeb https://azure.archive.ubuntu.com/ubuntu/ noble-security main\n'
      const expected = input.replaceAll(
        /https?:\/\/azure\.archive\.ubuntu\.com\//g,
        'https://archive.ubuntu.com/',
      )
      writeFileSync(
        source,
        mirrorList
          ? input.replaceAll(
              /https?:\/\/azure\.archive\.ubuntu\.com\/ubuntu\//g,
              'mirror+file:/etc/apt/apt-mirrors.txt',
            )
          : input,
      )
      const vendor = join(root, 'sources.list.d/vendor.list')
      const vendorContents =
        'deb https://packages.microsoft.com/repos/code stable main\n'
      writeFileSync(vendor, vendorContents)

      // Repeated setup must be safe without sudo or modifying the host's APT.
      for (let attempt = 0; attempt < 2; attempt++) {
        const result = spawnSync('bash', [
          new URL('./configure-apt.sh', import.meta.url).pathname,
          root,
        ])
        expect(result.status).toBe(0)
        expect(readFileSync(source, 'utf8')).toBe(expected)
        expect(readFileSync(vendor, 'utf8')).toBe(vendorContents)
        expect(
          readFileSync(join(root, 'apt.conf.d/99-ci-network'), 'utf8'),
        ).toBe(
          'Acquire::Retries "2";\nAcquire::http::Timeout "20";\nAcquire::https::Timeout "20";\n',
        )
      }
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  },
)
