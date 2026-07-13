import RightAbsoluteColumn from '@widgets/layout/RightAbsoluteColumn'
import StickyBookingCTA from '@widgets/layout/StickyBookingCTA'
import BottomNav from '@widgets/navigation/BottomNav'
import NavBar from '@widgets/navigation/NavBar'
import { lazy, type ReactNode, Suspense } from 'react'

const Footer = lazy(() => import('@widgets/layout/Footer'))

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface text-text-primary pb-14 min-[810px]:pb-0">
      <NavBar />
      <main id="main-content">{children}</main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      <RightAbsoluteColumn />
      <BottomNav />
      <StickyBookingCTA />
    </div>
  )
}
