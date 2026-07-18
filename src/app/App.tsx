import { scheduleDeferredWork } from '@libs/scheduleDeferredWork'
import { Outlet } from '@tanstack/react-router'
import { useEffect } from 'react'
import Layout from './layout/Layout'

function App() {
  useEffect(() => scheduleDeferredWork(), [])

  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

export default App
