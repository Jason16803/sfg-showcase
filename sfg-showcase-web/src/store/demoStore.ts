/**
 * demoStore.ts
 *
 * Soft CRUD overlay for the SFG Showcase demo session (Week 3+).
 *
 * Architecture:
 *   - jobs / customers start null (not yet loaded from API)
 *   - Pages prime these on first successful API fetch via setJobs / setCustomers
 *   - add / update / remove mutate LOCAL state ONLY — no API calls are made
 *   - resetLocalChanges() resets arrays to null → pages re-prime on next render,
 *     restoring the MongoDB seeded baseline without a page reload
 *
 * RBAC enforcement:
 *   - demoStore itself is role-agnostic; role checks are in the consuming pages
 *   - The backend still enforces requireRole() on all write endpoints
 *   - Since soft CRUD never hits the API, role-gating lives entirely in the UI
 *
 * Usage (in a page component):
 *   const { jobs, setJobs, addJob } = useDemoStore()
 *   const { items, isLoading } = useJobs({ limit: 50 })
 *
 *   // Prime on first load
 *   useEffect(() => {
 *     if (!isLoading && jobs === null) setJobs(items)
 *   }, [items, isLoading, jobs, setJobs])
 *
 *   const display = jobs ?? items  // demoStore wins when populated
 */

import { create } from 'zustand'
import type { DashboardJob, DashboardCustomer } from '@/features/dashboard/dashboard.types'

let _softCounter = 0
const softId = () => `soft_${Date.now()}_${++_softCounter}`

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

export interface DemoState {
  /** null = not yet primed from API; array = working set (may include soft items) */
  jobs:      DashboardJob[]      | null
  customers: DashboardCustomer[] | null

  /** True after any add / update / remove since last reset */
  hasLocalChanges: boolean

  // ── Loaders ───────────────────────────────────────────────────────────────
  setJobs:      (jobs:      DashboardJob[])      => void
  setCustomers: (customers: DashboardCustomer[]) => void

  // ── Job soft CRUD ──────────────────────────────────────────────────────────
  addJob:    (payload: Pick<DashboardJob, 'title'> & Partial<Omit<DashboardJob, 'id'>>) => void
  updateJob: (id: string, patch: Partial<DashboardJob>) => void
  removeJob: (id: string) => void

  // ── Customer soft CRUD ─────────────────────────────────────────────────────
  addCustomer:    (payload: Pick<DashboardCustomer, 'name'> & Partial<Omit<DashboardCustomer, 'id'>>) => void
  updateCustomer: (id: string, patch: Partial<DashboardCustomer>) => void
  removeCustomer: (id: string) => void

  // ── Reset ──────────────────────────────────────────────────────────────────
  /** Clears jobs + customers to null; pages re-prime from API on next render */
  resetLocalChanges: () => void
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useDemoStore = create<DemoState>((set) => ({
  jobs:            null,
  customers:       null,
  hasLocalChanges: false,

  // ── Loaders ───────────────────────────────────────────────────────────────

  setJobs:      (jobs)      => set({ jobs }),
  setCustomers: (customers) => set({ customers }),

  // ── Job soft CRUD ─────────────────────────────────────────────────────────

  addJob: (payload) =>
    set((s) => ({
      jobs: [
        {
          id:            softId(),
          title:         payload.title,
          status:        payload.status        ?? 'created',
          customer:      payload.customer      ?? '—',
          assignee:      payload.assignee      ?? 'Unassigned',
          scheduledDate: payload.scheduledDate ?? null,
        },
        ...(s.jobs ?? []),
      ],
      hasLocalChanges: true,
    })),

  updateJob: (id, patch) =>
    set((s) => ({
      jobs: (s.jobs ?? []).map((j) => (j.id === id ? { ...j, ...patch } : j)),
      hasLocalChanges: true,
    })),

  removeJob: (id) =>
    set((s) => ({
      jobs: (s.jobs ?? []).filter((j) => j.id !== id),
      hasLocalChanges: true,
    })),

  // ── Customer soft CRUD ────────────────────────────────────────────────────

  addCustomer: (payload) =>
    set((s) => ({
      customers: [
        {
          id:       softId(),
          name:     payload.name,
          email:    payload.email    ?? '—',
          status:   payload.status   ?? 'active',
          joinDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        },
        ...(s.customers ?? []),
      ],
      hasLocalChanges: true,
    })),

  updateCustomer: (id, patch) =>
    set((s) => ({
      customers: (s.customers ?? []).map((c) => (c.id === id ? { ...c, ...patch } : c)),
      hasLocalChanges: true,
    })),

  removeCustomer: (id) =>
    set((s) => ({
      customers: (s.customers ?? []).filter((c) => c.id !== id),
      hasLocalChanges: true,
    })),

  // ── Reset ─────────────────────────────────────────────────────────────────

  resetLocalChanges: () => set({ jobs: null, customers: null, hasLocalChanges: false }),
}))
