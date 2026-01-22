# Offline & Sync Implementation Plan

## Objective
Enable the POS system to function without an active internet connection, specifically allowing:
1.  **Sales Processing**: Cashiers can continue to ring up items.
2.  **Product Lookup**: Product catalog remains available.
3.  **Data Synchronization**: When connection is restored, offline sales are pushed to the server, and fresh data is pulled.

## Architecture

### 1. Local Database (Client-Side)
We will use **Dexie.js** (a wrapper for IndexedDB) to store:
*   `products`: Full copy of the product catalog.
*   `customers`: Frequently used customer profiles.
*   `offline_sales`: Queue of sales created while offline.
*   `sync_queue`: Other mutations (e.g., adding a customer).

### 2. Synchronization Service
A background (or effect-based) service that:
*   Monitors `navigator.onLine` status.
*   **On Load/On Reconnect**:
    1.  Push: Sends all pending `offline_sales` to the backend.
    2.  Pull: Fetches latest `products` and updates the local Dexie DB.

### 3. Frontend Logic Changes
*   **Product Fetching**:
    *   Modify `useProducts` query.
    *   Strategy: Try fetching from API. If fail, fall back to Dexie. Alternatively, always read from Dexie for speed, and background-sync Dexie with API.
*   **Order Processing (`orderApi.ts`)**:
    *   Intercept the `createOrder` call.
    *   Check Network Status.
    *   **If Online**: Send to API -> If success, we are done. If fail (network error), save to `offline_sales`.
    *   **If Offline**: Save directly to `offline_sales` and show "Saved Offline" toast.

## Implementation Steps

### Step 1: Install Dependencies
*   `npm install dexie`

### Step 2: Database Setup (`src/db/db.ts`)
*   Define `PosDatabase` class extending Dexie.
*   Define schemas for `products`, `customers`, `offlineSales`.

### Step 3: Offline Context (`src/context/OfflineContext.tsx`)
*   Provide `isOffline` boolean.
*   Provide `syncStatus` (idle, syncing, error).
*   Listen to `window.addEventListener('online')` and `'offline'`.

### Step 4: Sync Manager (`src/services/syncManager.ts`)
*   Function `syncProducts()`: API -> Dexie.
*   Function `processOfflineQueue()`: Dexie -> API.

### Step 5: Integration
*   Update `PosScreen.tsx` to read products from Dexie if offline.
*   Update `orderApi.ts` to retry/queue failed requests.
