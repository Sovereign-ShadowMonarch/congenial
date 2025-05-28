import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAuth } from '@/context/AuthContext'
import { portfolioApi } from '@/api/portfolio'
import { useQuery } from '@tanstack/react-query'

import SidebarToggle from '@/components/Header/SidebarToggle'
import UserMenu from '@/components/Header/UserMenu'
import dynamic from 'next/dynamic'

const ThemeSelector = dynamic(
  () => import('@/components/Header/ThemeSelector'),
  {
    ssr: false,
  }
)

interface HeaderProps {
  title?: string
}

const Header = ({ title }: HeaderProps) => {
  const { isAuthenticated } = useAuth()

  // Fetch portfolio total value if authenticated
  const { data: portfolioSummary } = useQuery({
    queryKey: ['portfolioSummary'],
    queryFn: () => portfolioApi.getPortfolioSummary(),
    enabled: isAuthenticated,
    staleTime: 60 * 1000, // 1 minute
  })

  const totalValue = portfolioSummary?.result?.total_value_usd || 0
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(totalValue)

  return (
    <div className="navbar sticky top-0 z-50 bg-base-200 bg-opacity-30 p-4 backdrop-blur-md">
      <div className="flex flex-grow justify-between gap-3">
        <div className="flex flex-row gap-3">
          <div className="flex lg:hidden">
            <SidebarToggle />
          </div>
          <div className="flex flex-auto items-center">
            <h1 className="text-md align-middle font-bold leading-none text-primary sm:text-2xl">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex flex-auto items-center justify-end gap-3">
          {isAuthenticated && (
            <div className="badge badge-lg badge-primary font-medium mr-2">
              {formattedValue}
            </div>
          )}
          <ThemeSelector className="pt-1" />
          <ConnectButton />
          <UserMenu />
        </div>
      </div>
    </div>
  )
}

export default Header
