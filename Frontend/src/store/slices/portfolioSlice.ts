import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ValueDistribution } from '../apis/portfolioApi';

export interface AllocationData {
  distribution: ValueDistribution[];
  lastUpdated: number;
}

export interface PerformanceData {
  times: number[];
  values: string[];
  lastUpdated: number;
}

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  amount: string;
  value_usd: string;
  price_usd: string;
  price_change_24h: string;
  allocation_percentage: number;
  locations: Array<{
    type: 'exchange' | 'blockchain' | 'defi';
    name: string;
    amount: string;
  }>;
}

interface PortfolioState {
  totalValue: string;
  totalChange24h: string;
  totalChangePercentage24h: string;
  assetCount: number;
  assets: Asset[];
  allocation: AllocationData;
  performance: PerformanceData;
  lastUpdated: number;
  isLoaded: boolean;
}

const initialState: PortfolioState = {
  totalValue: '0',
  totalChange24h: '0',
  totalChangePercentage24h: '0',
  assetCount: 0,
  assets: [],
  allocation: {
    distribution: [],
    lastUpdated: 0,
  },
  performance: {
    times: [],
    values: [],
    lastUpdated: 0,
  },
  lastUpdated: 0,
  isLoaded: false,
};

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    setPortfolioSummary: (state, action: PayloadAction<{
      totalValue: string;
      totalChange24h: string;
      totalChangePercentage24h: string;
      assetCount: number;
    }>) => {
      const { totalValue, totalChange24h, totalChangePercentage24h, assetCount } = action.payload;
      state.totalValue = totalValue;
      state.totalChange24h = totalChange24h;
      state.totalChangePercentage24h = totalChangePercentage24h;
      state.assetCount = assetCount;
      state.lastUpdated = Date.now();
    },
    
    setAssets: (state, action: PayloadAction<Asset[]>) => {
      state.assets = action.payload;
      state.assetCount = action.payload.length;
      state.lastUpdated = Date.now();
      state.isLoaded = true;
    },
    
    setAllocation: (state, action: PayloadAction<ValueDistribution[]>) => {
      state.allocation = {
        distribution: action.payload,
        lastUpdated: Date.now(),
      };
    },
    
    setPerformance: (state, action: PayloadAction<{ times: number[]; values: string[] }>) => {
      state.performance = {
        ...action.payload,
        lastUpdated: Date.now(),
      };
    },
    
    updateAssetPrice: (state, action: PayloadAction<{ assetId: string; price: string; priceChange24h: string }>) => {
      const { assetId, price, priceChange24h } = action.payload;
      const asset = state.assets.find(a => a.id === assetId);
      
      if (asset) {
        // Update the price
        asset.price_usd = price;
        asset.price_change_24h = priceChange24h;
        
        // Recalculate the value based on new price
        const amount = parseFloat(asset.amount);
        const newPrice = parseFloat(price);
        if (!isNaN(amount) && !isNaN(newPrice)) {
          asset.value_usd = (amount * newPrice).toString();
        }
        
        // Recalculate total portfolio value and allocation percentages
        const totalValue = state.assets.reduce(
          (sum, asset) => sum + parseFloat(asset.value_usd || '0'), 
          0
        );
        
        state.totalValue = totalValue.toString();
        
        // Update allocation percentages for all assets
        state.assets.forEach(asset => {
          const value = parseFloat(asset.value_usd || '0');
          asset.allocation_percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
        });
      }
    },
    
    resetPortfolio: () => initialState,
  },
});

export const {
  setPortfolioSummary,
  setAssets,
  setAllocation,
  setPerformance,
  updateAssetPrice,
  resetPortfolio,
} = portfolioSlice.actions;

export default portfolioSlice.reducer;
