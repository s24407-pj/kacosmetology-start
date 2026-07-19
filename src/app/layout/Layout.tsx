import RightAbsoluteColumn from '@widgets/layout/RightAbsoluteColumn'
import BottomNav from '@widgets/navigation/BottomNav'
import NavBar from '@widgets/navigation/NavBar'
import { lazy, type ReactNode, Suspense } from 'react'
import { UIProvider } from '../providers/UIProvider'

const Footer = lazy(() => import('@widgets/layout/Footer'))

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <UIProvider>
      <div className="flex min-h-screen flex-col bg-surface text-text-primary">
        <NavBar />
        <main id="main-content" className="flex flex-1 flex-col">
          {children}
        </main>
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
        <RightAbsoluteColumn />
        <BottomNav />
      </div>
    </UIProvider>
  )
}
