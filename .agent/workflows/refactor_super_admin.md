---
description: Refactor Super Admin Dashboard
---
1. Create new directory structure in `src/pages/admin/tenants` and `src/components/admin/tenants`.
// turbo
2. Split `useSuperAdminData.ts` into `useAdminTenants.ts`, `useAdminTenantDetails.ts` and `useAdminPlatform.ts`.
3. Create `TenantListPage.tsx`
4. Create `TenantLayout.tsx` and sub-pages (`Overview`, `Users`, `Activity`, `Settings`).
5. Update `AppRouter.tsx` to include new routes.
6. Verify and Cleanup.
