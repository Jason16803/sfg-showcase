/**
 * Charts.tsx
 *
 * Recharts-based chart components for the dashboard.
 * Colors reference CSS custom properties via JS variable lookups so they
 * respond to any future CSS-variable-based theme switching.
 *
 * TODO — RevenueChart: accept `data?: RevenueDataPoint[]` prop; use mock as fallback.
 * TODO — JobCompletionChart: accept `stats?: JobStats` prop from useJobs/stats.
 * TODO — CustomerGrowthChart: needs GET /api/v1/dashboard/customer-growth endpoint.
 */

import {
  AreaChart, Area,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts'
import './Charts.scss'

// ---------------------------------------------------------------------------
// Design tokens — match variables.scss
// Kept as constants so Recharts (which uses JS, not CSS) stays in sync.
// ---------------------------------------------------------------------------

const COLORS = {
  primary:       '#60a5fa',   // ice blue — was indigo #6366f1
  primaryLight:  '#93c5fd',   // blue-300 — was #818cf8
  success:       '#10b981',
  warning:       '#f59e0b',
  error:         '#ef4444',
  cyan:          '#67e8f9',   // ice cyan — was #06b6d4
  // Phase palette transition: updated to match new surface tokens
  grid:          '#1c2535',   // $surface-overlay — was #1e2d50
  axisText:      '#94a3b8',   // $color-text-muted — unchanged
  tooltipBg:     '#17222f',   // $glass-bg-tooltip — was #1a2740
  tooltipBorder: '#2d5070',   // $border-overlay approx — was #3d5080
  dot:           '#0d1118',   // $color-surface-bg — was #0f172a
}

// ---------------------------------------------------------------------------
// Custom tooltip
// ---------------------------------------------------------------------------

interface TooltipPayloadEntry {
  name?: string | number
  value?: string | number
  color?: string
}

interface ChartTooltipProps {
  active?: boolean
  payload?: TooltipPayloadEntry[]
  label?: string | number
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip__label">{String(label ?? '')}</div>
      {payload.map((entry, i) => (
        <div key={i} className="chart-tooltip__row">
          <span
            className="chart-tooltip__dot"
            style={{ backgroundColor: entry.color ?? COLORS.primary }}
          />
          <span className="chart-tooltip__name">{String(entry.name ?? '')}</span>
          <span className="chart-tooltip__value">
            {typeof entry.value === 'number' &&
             String(entry.name ?? '').toLowerCase().includes('revenue')
              ? `$${entry.value.toLocaleString()}`
              : String(entry.value ?? '')}
          </span>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Shared axis / grid props
// ---------------------------------------------------------------------------

const axisProps = {
  tick: { fill: COLORS.axisText, fontSize: 11 },
  axisLine: false as const,
  tickLine: false as const,
}

const gridProps = {
  strokeDasharray: '3 3' as const,
  stroke: COLORS.grid,
  vertical: false as const,
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const revenueData = [
  { month: 'Jan', revenue: 28400, target: 25000 },
  { month: 'Feb', revenue: 33200, target: 28000 },
  { month: 'Mar', revenue: 38700, target: 32000 },
  { month: 'Apr', revenue: 35100, target: 34000 },
  { month: 'May', revenue: 42850, target: 38000 },
  { month: 'Jun', revenue: 47300, target: 42000 },
]

const jobCompletionData = [
  { week: 'Wk 1', completed: 24, pending: 8, overdue: 2 },
  { week: 'Wk 2', completed: 28, pending: 6, overdue: 1 },
  { week: 'Wk 3', completed: 32, pending: 5, overdue: 0 },
  { week: 'Wk 4', completed: 35, pending: 4, overdue: 1 },
]

const customerGrowthData = [
  { month: 'Jan', active: 98,  new: 12 },
  { month: 'Feb', active: 118, new: 20 },
  { month: 'Mar', active: 139, new: 21 },
  { month: 'Apr', active: 158, new: 19 },
  { month: 'May', active: 183, new: 25 },
  { month: 'Jun', active: 214, new: 31 },
]

// ---------------------------------------------------------------------------
// RevenueChart — area + target line
// ---------------------------------------------------------------------------

export function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={revenueData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={COLORS.primary} stopOpacity={0.25} />
            <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}    />
          </linearGradient>
        </defs>

        <CartesianGrid {...gridProps} />
        <XAxis dataKey="month" {...axisProps} />
        <YAxis
          {...axisProps}
          tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`}
          width={44}
        />
        <Tooltip content={<ChartTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, color: COLORS.axisText, paddingTop: 8 }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          name="Actual Revenue"
          stroke={COLORS.primary}
          strokeWidth={2.5}
          fill="url(#gradRevenue)"
          dot={false}
          activeDot={{ r: 4, fill: COLORS.primary, stroke: COLORS.dot, strokeWidth: 2 }}
        />
        <Line
          type="monotone"
          dataKey="target"
          name="Target"
          stroke={COLORS.success}
          strokeWidth={1.5}
          strokeDasharray="5 4"
          dot={false}
          activeDot={{ r: 3, fill: COLORS.success, stroke: COLORS.dot, strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ---------------------------------------------------------------------------
// JobCompletionChart — grouped bar chart
// ---------------------------------------------------------------------------

export function JobCompletionChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={jobCompletionData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barSize={18}>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="week" {...axisProps} />
        <YAxis {...axisProps} width={28} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, color: COLORS.axisText, paddingTop: 8 }}
        />
        <Bar dataKey="completed" name="Completed" fill={COLORS.success} radius={[3, 3, 0, 0]} />
        <Bar dataKey="pending"   name="Pending"   fill={COLORS.warning}  radius={[3, 3, 0, 0]} />
        <Bar dataKey="overdue"   name="Overdue"   fill={COLORS.error}    radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ---------------------------------------------------------------------------
// CustomerGrowthChart — dual line
// ---------------------------------------------------------------------------

export function CustomerGrowthChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={customerGrowthData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="month" {...axisProps} />
        <YAxis {...axisProps} width={30} />
        <Tooltip content={<ChartTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, color: COLORS.axisText, paddingTop: 8 }}
        />
        <Line
          type="monotone"
          dataKey="active"
          name="Active Customers"
          stroke={COLORS.primary}
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4, fill: COLORS.primary, stroke: COLORS.dot, strokeWidth: 2 }}
        />
        <Line
          type="monotone"
          dataKey="new"
          name="New This Month"
          stroke={COLORS.cyan}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 3, fill: COLORS.cyan, stroke: COLORS.dot, strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
