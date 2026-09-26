import { CookieBanner } from '@components/consent/CookieBanner'
import { ConsentProvider } from '@libs/consent'
import Footer from '@widgets/layout/Footer'
import RightAbsoluteColumn from '@widgets/layout/RightAbsoluteColumn'
import BottomNav from '@widgets/navigation/BottomNav'
import NavBar from '@widgets/navigation/NavBar'
import type { ReactNode } from 'react'
import { UIProvider } from '../providers/UIProvider'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <UIProvider>
      <ConsentProvider>
        <div className="flex min-h-screen flex-col bg-surface text-text-primary">
          <NavBar />
          <main id="main-content" className="flex flex-1 flex-col">
            {children}
          </main>
          <Footer />
          <RightAbsoluteColumn />
          <BottomNav />
          <CookieBanner />
        </div>
      </ConsentProvider>
    </UIProvider>
  )
}
