import { useEffect } from 'react'
import { useRouter } from 'next/router'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useAuth } from '@/context/AuthContext'

/**
 * Home page component that redirects to the appropriate page based on authentication status
 * - Authenticated users are redirected to the dashboard
 * - Unauthenticated users are redirected to the sign-in page
 */
const Home: NextPage = () => {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      // Once auth state is determined, redirect
      if (isAuthenticated) {
        router.replace('/dashboard')
      } else {
        router.replace('/auth/signin')
      }
    }
  }, [isAuthenticated, isLoading, router])

  // Show a simple loading indicator while checking auth status
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <Head>
        <title>Rotkehlchen - Portfolio Tracker</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-col items-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
        <p className="mt-4 text-base-content">Redirecting...</p>
      </div>
    </div>
  )
}

export default Home
