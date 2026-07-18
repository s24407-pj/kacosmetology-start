import { useRouterState } from '@tanstack/react-router'
import { useEffect } from 'react'

const redirects = {
  efekty: { to: '/galeria', hash: 'efekty' },
  galeria: { to: '/galeria', hash: 'gabinet' },
  'services-vouchery': { to: '/', hash: 'voucher' },
  zabiegi: { to: '/kosmetologia' },
  services: { to: '/kosmetologia' },
} as const

export function useLegacyHashRedirect() {
  const { pathname, hash } = useRouterState({
    select: (state) => state.location,
  })
  useEffect(() => {
    if (pathname !== '/' || !hash) return
    const target = redirects[hash as keyof typeof redirects]
    if (!target) return
    const url = `${target.to}${'hash' in target && target.hash ? `#${target.hash}` : ''}`
    window.location.replace(url)
  }, [hash, pathname])
}
