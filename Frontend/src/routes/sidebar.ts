import {
  HomeIcon,
  ChartPieIcon,
  CurrencyDollarIcon,
  BuildingLibraryIcon,
  CubeIcon,
  GlobeAltIcon,
  Cog8ToothIcon,
  RectangleStackIcon,
} from '@heroicons/react/24/outline';

/**
 * Interface for sidebar navigation items
 */
export interface NavigationItem {
  path: string;
  icon: any;
  name: string;
}

/**
 * Main navigation items for the sidebar
 */
const navigation: NavigationItem[] = [
  {
    path: '/dashboard',
    icon: HomeIcon,
    name: 'Dashboard',
  },
  {
    path: '/portfolio',
    icon: ChartPieIcon,
    name: 'Portfolio',
  },
  {
    path: '/transactions',
    icon: CurrencyDollarIcon,
    name: 'Transactions',
  },
  {
    path: '/exchanges',
    icon: BuildingLibraryIcon,
    name: 'Exchanges',
  },
  {
    path: '/blockchain',
    icon: CubeIcon,
    name: 'Blockchain',
  },
  {
    path: '/defi',
    icon: GlobeAltIcon,
    name: 'DeFi',
  },
  {
    path: '/assets',
    icon: RectangleStackIcon,
    name: 'Assets',
  },
];

/**
 * Bottom navigation items for the sidebar
 */
export const bottomNavigation: NavigationItem[] = [
  {
    path: '/settings',
    icon: Cog8ToothIcon,
    name: 'Settings',
  },
];

export default navigation;
