'use client';

/**
 * StoreSelector - Component to switch between stores
 */

import { useStore } from '@/contexts/StoreContext';

export function StoreSelector() {
  const { currentStore, stores, selectStore, loading } = useStore();

  if (loading || stores.length === 0) {
    return null;
  }

  if (stores.length === 1) {
    // If only one store, just show the name
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg">
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <span className="font-medium text-foreground">{currentStore?.name}</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <select
        value={currentStore?.id || ''}
        onChange={(e) => selectStore(e.target.value)}
        className="appearance-none bg-card border border-border rounded-lg pl-10 pr-10 py-2 text-foreground font-medium focus-contrast cursor-pointer hover:border-border-light hover:bg-card-hover transition-all"
      >
        {stores.map((store) => (
          <option key={store.id} value={store.id}>
            {store.name} ({store.role})
          </option>
        ))}
      </select>

      {/* Store icon */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>

      {/* Dropdown arrow */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="w-4 h-4 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

