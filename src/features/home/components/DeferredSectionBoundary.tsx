import { Alert, Section } from '@components/ui'
import { Component, type ReactNode, Suspense } from 'react'

type SectionBackground = 'white' | 'gradient' | 'gray' | 'contact' | 'mesh'

interface DeferredSectionBoundaryProps {
  children: ReactNode
  sectionLabel: string
  sectionId?: string
  background?: SectionBackground
  loadingFallback?: ReactNode
}

interface DeferredSectionBoundaryState {
  hasError: boolean
}

export class DeferredSectionBoundary extends Component<
  DeferredSectionBoundaryProps,
  DeferredSectionBoundaryState
> {
  state: DeferredSectionBoundaryState = { hasError: false }

  static getDerivedStateFromError(): DeferredSectionBoundaryState {
    return { hasError: true }
  }

  private reloadPage = () => {
    window.location.reload()
  }

  render() {
    const {
      background = 'white',
      children,
      loadingFallback = null,
      sectionId,
      sectionLabel,
    } = this.props

    if (this.state.hasError) {
      return (
        <Section id={sectionId} background={background}>
          <Alert variant="error">
            <p>Nie udało się wczytać sekcji „{sectionLabel}”.</p>
            <p className="mt-1">Odśwież stronę, aby spróbować ponownie.</p>
            <button
              type="button"
              className="mt-3 min-h-11 rounded-md border border-current px-4 py-2 font-semibold transition-colors hover:bg-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2"
              onClick={this.reloadPage}
            >
              Odśwież stronę
            </button>
          </Alert>
        </Section>
      )
    }

    return <Suspense fallback={loadingFallback}>{children}</Suspense>
  }
}
