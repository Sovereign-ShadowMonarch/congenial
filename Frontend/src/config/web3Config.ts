import { createConfig, configureChains, Chain } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum, avalanche, bsc } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { infuraProvider } from 'wagmi/providers/infura';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { LedgerConnector } from 'wagmi/connectors/ledger';

// Get API keys from environment variables or use defaults
const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || '';
const infuraApiKey = process.env.NEXT_PUBLIC_INFURA_API_KEY || '';
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

// Configure supported chains with custom RPC URLs if needed
const supportedChains: Chain[] = [
  mainnet,
  polygon,
  optimism,
  arbitrum,
  avalanche,
  bsc,
];

// Configure providers with multiple fallbacks for reliability
const { chains, publicClient, webSocketPublicClient } = configureChains(
  supportedChains,
  [
    alchemyProvider({ apiKey: alchemyApiKey }),
    infuraProvider({ apiKey: infuraApiKey }),
    publicProvider(),
  ]
);

// Create wagmi config with multiple connector options
const config = createConfig({
  autoConnect: true,
  connectors: [
    new InjectedConnector({ 
      chains,
      options: { shimDisconnect: true },
    }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'Crypto Portfolio Manager',
        headlessMode: false,
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: walletConnectProjectId,
        metadata: {
          name: 'Crypto Portfolio Manager',
          description: 'Enterprise-grade cryptocurrency portfolio management platform',
          url: 'https://cryptoportfolio.app',
          icons: ['https://cryptoportfolio.app/icons/icon-512x512.png'],
        },
        showQrModal: true,
      },
    }),
    new LedgerConnector({
      chains,
      options: {
        walletConnectVersion: 2,
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
});

export { chains, config };
