import HomePage from '@features/home/page/HomePage'
import Layout from './layout/Layout'
import { UIProvider } from './providers/UIProvider'

function App() {
  return (
    <UIProvider>
      <Layout>
        <HomePage />
      </Layout>
    </UIProvider>
  )
}

export default App
