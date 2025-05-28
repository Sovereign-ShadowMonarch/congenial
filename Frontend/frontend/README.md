# Rotkehlchen Frontend

A modern, responsive frontend for Rotkehlchen, a cryptocurrency portfolio management application. Built with Next.js and TypeScript, this frontend provides a comprehensive interface for tracking cryptocurrency assets, transactions, and DeFi investments.

## Features

- **User Authentication**: Secure login, registration, and password management
- **Dashboard**: Overview of portfolio performance, asset allocation, and recent activity
- **Portfolio Tracking**: Detailed view of all assets with filtering and search capabilities
- **Transaction Management**: Record and view trades, asset movements, and ledger actions
- **Exchange Integration**: Connect to popular cryptocurrency exchanges via API keys
- **Blockchain Account Management**: Track assets across multiple blockchains and addresses
- **DeFi Protocol Support**: Monitor positions in protocols like MakerDAO, Aave, Compound, and more
- **Asset Management**: Add custom tokens and manage asset visibility
- **Theme Support**: Light and dark mode for user preference

## Tech Stack

- **Framework**: Next.js (React)
- **Language**: TypeScript
- **State Management**: React Query, Zustand
- **Styling**: Tailwind CSS with DaisyUI components
- **Form Handling**: React Hook Form with Zod validation
- **API Client**: Axios with interceptors for authentication
- **Charts**: Recharts for data visualization

## Project Structure

```
src/
├── api/         # API clients for backend communication
├── components/  # Reusable UI components
├── context/     # React context for global state
├── hooks/       # Custom React hooks
├── pages/       # Page components and routing
├── routes/      # Navigation configuration
└── styles/      # Global CSS and Tailwind configuration
```

## Getting Started

### Prerequisites

- Node.js 16+
- pnpm (recommended) or npm
- Rotkehlchen Backend running (See backend documentation)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
# or
npm install
```

3. Configure the environment variables:

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8081/api/1
```

4. Start the development server:

```bash
pnpm dev
# or
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Integration with Backend

This frontend is designed to work with the Rotkehlchen backend API. The backend should be running on `http://localhost:8081` with API endpoints available at `/api/1/`. The API client in `src/api/client.ts` is configured to communicate with the backend and handle authentication.

## Building for Production

```bash
pnpm build
# or
npm run build
```

The build output will be in the `.next` directory, which can be deployed to any static hosting service or served with a Node.js server.

## License

This project is licensed under the MIT License.
