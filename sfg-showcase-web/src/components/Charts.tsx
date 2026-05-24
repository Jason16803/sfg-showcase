/**
 * Charts.tsx
 *
 * Recharts-based chart components for the dashboard.
 *
 * CURRENT STATE: all three charts use internal mock data.
 *
 * TODO — RevenueChart:
 *   Wire to Floe financial API when a tenant revenue summary endpoint exists.
 *   Accept `data?: RevenueDataPoint[]` prop; fall back to revenueData when absent.
 *
 * TODO — JobCompletionChart:
 *   Accept `stats?: JobStats` prop from useJobs/stats hook.
 *   Transform JobStats { completed, 'in-progress', scheduled, ... } into weekly bar data.
 *   Fall back to jobCompletionData when prop is absent.
 *
 * TODO — CustomerGrowthChart:
 *   No SFO Core endpoint provides customer growth over time.
 *   A dedicated GET /api/v1/dashboard/customer-growth endpoint would be needed.
 *   Until then, chart stays on internal mock data.
 */

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import './Charts.scss'

// ---------------------------------------------------------------------------
// Internal mock data
// Move to dashboard.mock.ts and accept as props when real endpoints are ready
// ---------------------------------------------------------------------------

const revenueData = [
  { month: 'Jan', revenue: 4000, target: 3000 },
  { month: 'Feb', revenue: 5200, target: 3500 },
  { month: 'Mar', revenue: 6100, target: 4000 },
  { month: 'Apr', revenue: 5800, target: 4200 },
  { month: 'May', revenue: 7200, target: 4800 },
  { month: 'Jun', revenue: 8100, target: 5200 },
]

const jobCompletionData = [
  { week: 'W1', completed: 24, pending: 8, overdue: 2 },
  { week: 'W2', completed: 28, pending: 6, overdue: 1 },
  { week: 'W3', completed: 32, pending: 5, overdue: 0 },
  { week: 'W4', completed: 35, pending: 4, overdue: 1 },
]

const customerGrowthData = [
  { month: 'Jan', active: 120, new: 12 },
  { month: 'Feb', active: 142, new: 22 },
  { month: 'Mar', active: 165, new: 23 },
  { month: 'Apr', active: 189, new: 24 },
  { month: 'May', active: 218, new: 29 },
  { month: 'Jun', active: 252, new: 34 },
]

// ---------------------------------------------------------------------------
// Chart components
// ---------------------------------------------------------------------------

export function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={revenueData}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="month" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
        <Legend />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#6366f1"
          fillOpacity={1}
          fill="url(#colorRevenue)"
          name="Actual Revenue"
        />
        <Line
          type="monotone"
          dataKey="target"
          stroke="#10b981"
          strokeDasharray="5 5"
          name="Target"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function JobCompletionChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={jobCompletionData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="week" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
        <Legend />
        <Bar dataKey="completed" fill="#10b981" name="Completed" />
        <Bar dataKey="pending"   fill="#f59e0b" name="Pending" />
        <Bar dataKey="overdue"   fill="#ef4444" name="Overdue" />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function CustomerGrowthChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={customerGrowthData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="month" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
        <Legend />
        <Line
          type="monotone"
          dataKey="active"
          stroke="#6366f1"
          strokeWidth={2}
          dot={{ fill: '#6366f1', r: 4 }}
          name="Active Customers"
        />
        <Line
          type="monotone"
          dataKey="new"
          stroke="#06b6d4"
          strokeWidth={2}
          dot={{ fill: '#06b6d4', r: 4 }}
          name="New Customers"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
