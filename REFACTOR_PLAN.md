# Super Admin Dashboard Refactor Plan

## 1. Refactored Route Map

The current `/admin` routes will be decomposed to separate responsibilities.

| Current Route | New Route | Component | Responsibility |
| :--- | :--- | :--- | :--- |
| `/admin/tenants` | `/admin/tenants` | `TenantListPage` | List, Search, Filter Tenants |
| `N/A` | `/admin/tenants/:id` | `TenantLayout` | Layout for Tenant Context (Sidebar/Tabs) |
| `N/A` | `/admin/tenants/:id/overview` | `TenantOverviewPage` | Metrics & Plan Details |
| `N/A` | `/admin/tenants/:id/users` | `TenantUsersPage` | List & Manage Tenant Users |
| `N/A` | `/admin/tenants/:id/activity` | `TenantActivityPage` | Audit Logs |
| `N/A` | `/admin/tenants/:id/settings` | `TenantSettingsPage` | Quotas, Features, Status |
| `/admin/console` | `/admin/console` | `SystemConsolePage` | Global Platform Control |

## 2. Updated Sidebar Structure

The sidebar will be updated to reflect the separate domains. We will introduce a second-level navigation or a context-sensitive sidebar when viewing a specific tenant.

**Global Admin Sidebar (Primary):**
*   **Operate**
    *   `Tenants` (/admin/tenants) - List of all tenants
*   **Observe**
    *   `System Console` (/admin/console) - Global platform health
    *   `Global Reports` (Future)

**Tenant Context Sidebar (Secondary - when inside /admin/tenants/:id):**
*   **Context**: [Tenant Name]
*   `Overview` (./overview)
*   `Users` (./users)
*   `Activity` (./activity)
*   `Settings` (./settings)
*   *Back to Tenant List*

## 3. Component Responsibility Diagram

**Before:**
*   `TenantsPage` (God)
    *   Fetches ALL data
    *   Manages List State
    *   Manages Detail State
    *   renders `TenantDetails` (God Sub)
        *   renders `TenantOverview`, `TenantUsers`, ...
    *   renders `TenantModal`

**After:**
*   `TenantListPage` -> `useTenantList()`
    *   Renders Table/Grid
    *   Creating Tenant -> `TenantModal`
*   `TenantLayout` -> `useTenantContext(id)`
    *   Provides context for child pages
*   `TenantOverviewPage` -> `TenantOverview` (Pure)
*   `TenantUsersPage` -> `useTenantUsers(id)` -> `TenantUsersTable` (Pure)
*   `TenantActivityPage` -> `useTenantActivity(id)` -> `ActivityList` (Pure)
*   `TenantSettingsPage` -> `useTenantSettings(id)` -> `SettingsForm` (Pure)

## 4. Suggested Folder Structure

```
src/
  pages/
    admin/
      tenants/
        TenantListPage.tsx      <-- The main list view
        TenantLayout.tsx        <-- Wrapper for single tenant views
        TenantContext.tsx       <-- Context provider for tenant data
        overview/
          TenantOverviewPage.tsx
        users/
          TenantUsersPage.tsx
        activity/
          TenantActivityPage.tsx
        settings/
          TenantSettingsPage.tsx
      console/
        SystemConsolePage.tsx
  components/
    admin/
      tenants/
        TenantListTable.tsx
        TenantOverviewCard.tsx
        TenantUsersTable.tsx
        TenantActivityLog.tsx
        TenantSettingsForm.tsx
        TenantModal.tsx         <-- Kept shared
      shared/
        StatusBadge.tsx
        AdminPageHeader.tsx
  hooks/
    admin/
      useAdminTenants.ts        <-- List only
      useAdminTenantDetails.ts  <-- Single tenant + stats
      useAdminPlatform.ts       <-- Console stats
```

## 5. Refactor Checklist

1.  **Preparation**
    - [ ] Create folder structure.
    - [ ] Split `useSuperAdminData` into granular hooks.
    - [ ] Create `TenantContext` to avoid prop drilling in sub-pages.

2.  **Decomposition (Safe Parallel Path)**
    - [ ] Create `TenantListPage.tsx` (reimplementing list view from `TenantsPage`).
    - [ ] Create `TenantLayout` and sub-pages.
    - [ ] Extract sub-components from `TenantDetails.tsx` into `components/admin/tenants/`.

3.  **Routing Updates**
    - [ ] Add new routes to `AppRouter.tsx` (keep old ones for now if needed, or replace if confident).
    - [ ] Update Sidebar links.

4.  **Verification**
    - [ ] Verify Tenant List loads.
    - [ ] Verify clicking a tenant opens the new Layout/Overview.
    - [ ] Verify sub-pages match original functionality.
    - [ ] Verify "Create Tenant" modal still works.

5.  **Cleanup**
    - [ ] Remove `TenantsPage.tsx`.
    - [ ] Remove `TenantDetails.tsx` (God component).
    - [ ] Remove `useSuperAdminData` (legacy hook).
