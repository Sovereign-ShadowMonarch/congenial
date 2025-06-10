import { createEntityAdapter } from '@reduxjs/toolkit';
import { Asset, AssetPrice } from '../apis/assetsApi';

/**
 * Entity adapter for normalizing asset data in Redux.
 * Provides standard methods for CRUD operations on assets.
 */
export const assetAdapter = createEntityAdapter<Asset>({
  // Use asset id as the primary key
  selectId: (asset) => asset.id,
  
  // Sort assets by symbol alphabetically
  sortComparer: (a, b) => a.symbol.localeCompare(b.symbol),
});

// Pre-defined selectors for asset entities
export const assetSelectors = assetAdapter.getSelectors();

/**
 * Initial state for the asset entities
 * Used to initialize asset slice state
 */
export const initialAssetsState = assetAdapter.getInitialState({
  // Additional state properties can be added here
  loading: false,
  selectedAsset: null as string | null,
  priceData: {} as Record<string, AssetPrice>,
  lastUpdated: 0,
});

/**
 * Entity adapter for asset prices
 * Separate from assets for better performance when prices update frequently
 */
export const assetPriceAdapter = createEntityAdapter<AssetPrice & { id: string }>({
  // Use asset id as the primary key
  selectId: (price) => price.id,
});

/**
 * Initial state for the asset price entities
 */
export const initialAssetPricesState = assetPriceAdapter.getInitialState({
  lastUpdated: 0,
});

/**
 * Select favorite/starred assets selector
 */
export const selectFavoriteAssets = (
  state: ReturnType<typeof initialAssetsState>,
  favoriteIds: string[]
) => {
  return favoriteIds
    .map(id => state.entities[id])
    .filter(Boolean);
};
