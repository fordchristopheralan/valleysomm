'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'

// ValleySomm Brand Colors
const BRAND_COLORS = {
  wineDeep: '#6B2D3F',
  wineBurgundy: '#8B3A4D',
  wineRose: '#C4637A',
  valleyDeep: '#2D4A3E',
  valleySage: '#5B7C6F',
  valleyMist: '#8FA99E',
  cream: '#FAF7F2',
  warmBeige: '#E8E0D5',
  goldAccent: '#C9A962',
  slate: '#4A4A50',
  charcoal: '#2C2C30',
}

const CHART_COLORS = [
  BRAND_COLORS.wineDeep,
  BRAND_COLORS.wineBurgundy,
  BRAND_COLORS.valleyDeep,
  BRAND_COLORS.valleySage,
  BRAND_COLORS.goldAccent,
  BRAND_COLORS.wineRose,
  BRAND_COLORS.valleyMist,
  BRAND_COLORS.slate,
]

export default function Dashboard() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [lastRefresh, setLastRefresh] = useState(null)
  
  // Filters
  const [sourceFilter, setSourceFilter] = useState('all')
  const [emailFilter, setEmailFilter] = useState('all')
  const [timeFilter, setTimeFilter] = useState('all')

  const correctPassword = process.env.NEXT_PUBLIC_DASHBOARD_PASSWORD || 'valleysomm2024'

  const handleLogin = (e) => {
    e.preventDefault()
    if (password === correctPassword) {
      setAuthenticated(true)
      setError('')
    } else {
      setError('Incorrect password')
    }
  }

  const fetchData = async () => {
    setLoading(true)
    const { data: responses, error } = await supabase
      .from('survey_responses')
      .select('*')
      .order('submitted_at', { ascending: false })

    if (error) {
      console.error('Error fetching data:', error)
    } else {
      setData(responses || [])
    }
    setLastRefresh(new Date())
    setLoading(false)
  }

  useEffect(() => {
    if (authenticated) {
      fetchData()
    }
  }, [authenticated])

  // Calculate first week threshold
  const firstWeekThreshold = useMemo(() => {
    if (data.length === 0) return null
    const sorted = [...data].sort((a, b) => new Date(a.submitted_at) - new Date(b.submitted_at))
    const firstDate = new Date(sorted[0].submitted_at)
    return new Date(firstDate.getTime() + 7 * 24 * 60 * 60 * 1000)
  }, [data])

  // Filter data
  const filteredData = useMemo(() => {
    return data.filter((r) => {
      if (sourceFilter !== 'all' && r.source !== sourceFilter) return false
      if (emailFilter === 'with_email' && !r.email) return false
      if (emailFilter === 'anonymous' && r.email) return false
      if (timeFilter !== 'all' && firstWeekThreshold) {
        const responseDate = new Date(r.submitted_at)
        if (timeFilter === 'first_week' && responseDate > firstWeekThreshold) return false
        if (timeFilter === 'later' && responseDate <= firstWeekThreshold) return false
      }
      return true
    })
  }, [data, sourceFilter, emailFilter, timeFilter, firstWeekThreshold])

  const uniqueSources = useMemo(() => {
    const sources = new Set(data.map((r) => r.source).filter(Boolean))
    return Array.from(sources)
  }, [data])

  // Password screen
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: `linear-gradient(135deg, ${BRAND_COLORS.wineDeep} 0%, ${BRAND_COLORS.valleyDeep} 100%)` }}>
        <div className="rounded-2xl shadow-2xl p-8 max-w-sm w-full" style={{ backgroundColor: BRAND_COLORS.cream }}>
          <div className="text-center mb-6">
            <h1 className="text-3xl font-medium mb-2" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: BRAND_COLORS.charcoal }}>
              <span style={{ color: BRAND_COLORS.wineDeep }}>Valley</span>
              <span style={{ color: BRAND_COLORS.valleyDeep }}>Somm</span>
            </h1>
            <p style={{ color: BRAND_COLORS.slate }}>Dashboard Access</p>
          </div>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-3 rounded-lg border outline-none mb-4 transition-all"
              style={{ 
                borderColor: BRAND_COLORS.warmBeige,
                backgroundColor: 'white',
              }}
              onFocus={(e) => e.target.style.borderColor = BRAND_COLORS.wineDeep}
              onBlur={(e) => e.target.style.borderColor = BRAND_COLORS.warmBeige}
            />
            {error && <p className="text-sm mb-4" style={{ color: BRAND_COLORS.wineRose }}>{error}</p>}
            <button
              type="submit"
              className="w-full py-3 text-white font-medium rounded-lg transition-all hover:opacity-90"
              style={{ backgroundColor: BRAND_COLORS.wineDeep }}
            >
              Enter Dashboard
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BRAND_COLORS.cream }}>
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <svg width="48" height="48" viewBox="0 0 80 80" fill="none" className="mx-auto">
              <path d="M40 16C40 16 24 32 24 48C24 56.837 31.163 64 40 64C48.837 64 56 56.837 56 48C56 32 40 16 40 16Z" stroke={BRAND_COLORS.wineDeep} strokeWidth="2.5" fill="none"/>
              <path d="M32 50C32 50 36 44 40 44C44 44 48 50 48 50" stroke={BRAND_COLORS.goldAccent} strokeWidth="2" fill="none" strokeLinecap="round"/>
            </svg>
          </div>
          <p style={{ color: BRAND_COLORS.slate }}>Loading survey data...</p>
        </div>
      </div>
    )
  }

  // Calculate metrics
  const totalResponses = filteredData.length
  const totalUnfiltered = data.length
  const emailsCollected = filteredData.filter((r) => r.email).length
  const drawingEntries = filteredData.filter((r) => r.wants_drawing).length
  const wantsResults = filteredData.filter((r) => r.wants_results).length
  const reviewedCount = filteredData.filter((r) => r.reviewed).length
  const avgConfidence = filteredData.length > 0 
    ? (filteredData.filter(r => r.confidence).reduce((sum, r) => sum + r.confidence, 0) / filteredData.filter(r => r.confidence).length).toFixed(1)
    : 0

  // Count occurrences helper
  const countOccurrences = (field, isArray = false) => {
    const counts = {}
    filteredData.forEach((r) => {
      if (isArray && Array.isArray(r[field])) {
        r[field].forEach((item) => {
          counts[item] = (counts[item] || 0) + 1
        })
      } else if (r[field]) {
        counts[r[field]] = (counts[r[field]] || 0) + 1
      }
    })
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }

  // Prepare chart data
  const regionsData = countOccurrences('regions', true)
  const planningData = countOccurrences('planning_time')
  const groupData = countOccurrences('group_type')
  const discoveryData = countOccurrences('discovery', true)
  const driverData = countOccurrences('driver')
  const reservationsData = countOccurrences('reservations')
  const payData = countOccurrences('pay')
  const sourceData = countOccurrences('source')

  const confidenceData = [1, 2, 3, 4, 5].map((n) => ({
    name: n.toString(),
    value: filteredData.filter((r) => r.confidence === n).length,
  }))

  const responsesByDay = {}
  filteredData.forEach((r) => {
    const day = new Date(r.submitted_at).toLocaleDateString()
    responsesByDay[day] = (responsesByDay[day] || 0) + 1
  })
  const timelineData = Object.entries(responsesByDay)
    .map(([date, count]) => ({ date, count }))
    .reverse()

  const willingToPay = filteredData.filter(
    (r) => r.pay === 'Yes — take my money' || r.pay === 'Maybe, depending on cost'
  ).length
  const payPercentage = totalResponses > 0 ? Math.round((willingToPay / totalResponses) * 100) : 0

  // "Other" responses
  const otherRegionsUS = filteredData.filter((r) => r.regions_other_us).map((r) => r.regions_other_us)
  const otherRegionsIntl = filteredData.filter((r) => r.regions_international).map((r) => r.regions_international)
  const otherDiscovery = filteredData.filter((r) => r.discovery_other).map((r) => r.discovery_other)
  const otherDriver = filteredData.filter((r) => r.driver_other).map((r) => r.driver_other)
  const otherSource = filteredData.filter((r) => r.source_other).map((r) => r.source_other)

  // Open-ended responses
  const hardestParts = filteredData.filter((r) => r.hardest_part).map((r) => ({ text: r.hardest_part, date: r.submitted_at, source: r.source }))
  const easierResponses = filteredData.filter((r) => r.easier).map((r) => ({ text: r.easier, date: r.submitted_at, source: r.source }))
  const surprises = filteredData.filter((r) => r.surprise).map((r) => ({ text: r.surprise, date: r.submitted_at, source: r.source }))

  const isFiltered = sourceFilter !== 'all' || emailFilter !== 'all' || timeFilter !== 'all'

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: BRAND_COLORS.cream }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-medium mb-1" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: BRAND_COLORS.charcoal }}>
              <span style={{ color: BRAND_COLORS.wineDeep }}>Valley</span>
              <span style={{ color: BRAND_COLORS.valleyDeep }}>Somm</span>
              {' '}Dashboard
            </h1>
            <p style={{ color: BRAND_COLORS.slate }}>Wine Country Trip Survey Results</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/review"
              className="px-4 py-2 text-white text-sm font-medium rounded-lg transition-all hover:opacity-90"
              style={{ backgroundColor: BRAND_COLORS.valleyDeep }}
            >
              Review Responses
            </a>
            <a
              href="/analysis"
              className="px-4 py-2 text-white text-sm font-medium rounded-lg transition-all hover:opacity-90"
              style={{ backgroundColor: BRAND_COLORS.valleyDeep }}
            >
              Analysis
            </a>
            <span className="text-sm" style={{ color: BRAND_COLORS.slate }}>
              {lastRefresh?.toLocaleTimeString()}
            </span>
            <button
              onClick={fetchData}
              className="px-4 py-2 text-white text-sm font-medium rounded-lg transition-all hover:opacity-90"
              style={{ backgroundColor: BRAND_COLORS.wineDeep }}
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-2xl shadow p-4 mb-6" style={{ backgroundColor: 'white', border: `1px solid ${BRAND_COLORS.warmBeige}` }}>
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium" style={{ color: BRAND_COLORS.charcoal }}>Filters:</span>
            
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="text-sm border rounded-lg px-3 py-2 outline-none"
              style={{ borderColor: BRAND_COLORS.warmBeige }}
            >
              <option value="all">All Sources</option>
              {uniqueSources.map((source) => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>

            <select
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              className="text-sm border rounded-lg px-3 py-2 outline-none"
              style={{ borderColor: BRAND_COLORS.warmBeige }}
            >
              <option value="all">All Responses</option>
              <option value="with_email">With Email</option>
              <option value="anonymous">Anonymous Only</option>
            </select>

            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="text-sm border rounded-lg px-3 py-2 outline-none"
              style={{ borderColor: BRAND_COLORS.warmBeige }}
            >
              <option value="all">All Time</option>
              <option value="first_week">First Week</option>
              <option value="later">After First Week</option>
            </select>

            {isFiltered && (
              <button
                onClick={() => {
                  setSourceFilter('all')
                  setEmailFilter('all')
                  setTimeFilter('all')
                }}
                className="text-sm font-medium hover:opacity-80"
                style={{ color: BRAND_COLORS.wineDeep }}
              >
                Clear Filters
              </button>
            )}

            {isFiltered && (
              <span className="text-sm" style={{ color: BRAND_COLORS.slate }}>
                Showing {totalResponses} of {totalUnfiltered} responses
              </span>
            )}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <MetricCard label="Total Responses" value={totalResponses} color={BRAND_COLORS.wineDeep} />
          <MetricCard label="Reviewed" value={`${reviewedCount}/${totalResponses}`} color={BRAND_COLORS.valleyDeep} />
          <MetricCard label="Avg Confidence" value={`${avgConfidence}/5`} color={BRAND_COLORS.goldAccent} />
          <MetricCard label="Drawing Entries" value={drawingEntries} color={BRAND_COLORS.wineBurgundy} />
          <MetricCard label="Want Results" value={wantsResults} color={BRAND_COLORS.valleySage} />
          <MetricCard label="Would Pay" value={`${payPercentage}%`} color={BRAND_COLORS.wineDeep} />
        </div>

        {/* Source Breakdown + Timeline */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="rounded-2xl shadow p-6" style={{ backgroundColor: 'white', border: `1px solid ${BRAND_COLORS.warmBeige}` }}>
            <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: BRAND_COLORS.charcoal }}>Response Sources</h2>
            {sourceData.length === 0 ? (
              <p className="text-sm" style={{ color: BRAND_COLORS.slate }}>No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {timelineData.length > 0 && (
            <div className="rounded-2xl shadow p-6" style={{ backgroundColor: 'white', border: `1px solid ${BRAND_COLORS.warmBeige}` }}>
              <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: BRAND_COLORS.charcoal }}>Responses Over Time</h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={BRAND_COLORS.warmBeige} />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: BRAND_COLORS.slate }} stroke={BRAND_COLORS.warmBeige} />
                  <YAxis tick={{ fontSize: 12, fill: BRAND_COLORS.slate }} stroke={BRAND_COLORS.warmBeige} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke={BRAND_COLORS.wineDeep} strokeWidth={2} dot={{ fill: BRAND_COLORS.wineDeep }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Charts Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <ChartCard title="Wine Regions Visited" data={regionsData} colors={BRAND_COLORS} />
          <ChartCard title="Discovery Methods" data={discoveryData} colors={BRAND_COLORS} />
          <ChartCard title="Planning Timeline" data={planningData} colors={BRAND_COLORS} />
          <ChartCard title="Group Type" data={groupData} colors={BRAND_COLORS} />
          <ChartCard title="Designated Driver Solution" data={driverData} colors={BRAND_COLORS} />
          <ChartCard title="Reservation Approach" data={reservationsData} colors={BRAND_COLORS} />
        </div>

        {/* Confidence & Pay Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="rounded-2xl shadow p-6" style={{ backgroundColor: 'white', border: `1px solid ${BRAND_COLORS.warmBeige}` }}>
            <h2 className="text-lg font-semibold mb-2" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: BRAND_COLORS.charcoal }}>Confidence in Winery Selection</h2>
            <p className="text-sm mb-4" style={{ color: BRAND_COLORS.slate }}>1 = Total guesswork, 5 = Nailed it</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={confidenceData}>
                <CartesianGrid strokeDasharray="3 3" stroke={BRAND_COLORS.warmBeige} />
                <XAxis dataKey="name" stroke={BRAND_COLORS.slate} />
                <YAxis stroke={BRAND_COLORS.slate} />
                <Tooltip />
                <Bar dataKey="value" fill={BRAND_COLORS.wineDeep} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl shadow p-6" style={{ backgroundColor: 'white', border: `1px solid ${BRAND_COLORS.warmBeige}` }}>
            <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: BRAND_COLORS.charcoal }}>Willingness to Pay</h2>
            {payData.length === 0 ? (
              <p className="text-sm" style={{ color: BRAND_COLORS.slate }}>No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={payData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={BRAND_COLORS.warmBeige} />
                  <XAxis type="number" stroke={BRAND_COLORS.slate} />
                  <YAxis type="category" dataKey="name" width={180} tick={{ fontSize: 11, fill: BRAND_COLORS.slate }} stroke={BRAND_COLORS.slate} />
                  <Tooltip />
                  <Bar dataKey="value" fill={BRAND_COLORS.valleyDeep} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* "Other" Responses */}
        {(otherRegionsUS.length > 0 || otherRegionsIntl.length > 0 || otherDiscovery.length > 0 || otherDriver.length > 0 || otherSource.length > 0) && (
          <div className="rounded-2xl shadow p-6 mb-6" style={{ backgroundColor: 'white', border: `1px solid ${BRAND_COLORS.warmBeige}` }}>
            <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: BRAND_COLORS.charcoal }}>&quot;Other&quot; Responses</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherRegionsUS.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2" style={{ color: BRAND_COLORS.wineDeep }}>Other US Regions</h3>
                  <ul className="text-sm space-y-1" style={{ color: BRAND_COLORS.slate }}>
                    {otherRegionsUS.map((r, i) => <li key={i}>• {r}</li>)}
                  </ul>
                </div>
              )}
              {otherRegionsIntl.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2" style={{ color: BRAND_COLORS.wineDeep }}>International Regions</h3>
                  <ul className="text-sm space-y-1" style={{ color: BRAND_COLORS.slate }}>
                    {otherRegionsIntl.map((r, i) => <li key={i}>• {r}</li>)}
                  </ul>
                </div>
              )}
              {otherDiscovery.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2" style={{ color: BRAND_COLORS.wineDeep }}>Other Discovery Methods</h3>
                  <ul className="text-sm space-y-1" style={{ color: BRAND_COLORS.slate }}>
                    {otherDiscovery.map((r, i) => <li key={i}>• {r}</li>)}
                  </ul>
                </div>
              )}
              {otherDriver.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2" style={{ color: BRAND_COLORS.wineDeep }}>Other Driver Solutions</h3>
                  <ul className="text-sm space-y-1" style={{ color: BRAND_COLORS.slate }}>
                    {otherDriver.map((r, i) => <li key={i}>• {r}</li>)}
                  </ul>
                </div>
              )}
              {otherSource.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2" style={{ color: BRAND_COLORS.wineDeep }}>Other Sources</h3>
                  <ul className="text-sm space-y-1" style={{ color: BRAND_COLORS.slate }}>
                    {otherSource.map((r, i) => <li key={i}>• {r}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Open-Ended Responses */}
        <div className="grid md:grid-cols-3 gap-6">
          <OpenEndedCard title="Hardest Part of Planning" responses={hardestParts} colors={BRAND_COLORS} />
          <OpenEndedCard title="What Would Make It Easier" responses={easierResponses} colors={BRAND_COLORS} />
          <OpenEndedCard title="Surprises (Good & Bad)" responses={surprises} colors={BRAND_COLORS} />
        </div>

        {/* Footer */}
        <p className="text-center text-sm mt-8" style={{ color: BRAND_COLORS.slate }}>
          Drawing ends January 20, 2025
        </p>
      </div>
    </div>
  )
}

function MetricCard({ label, value, color }) {
  return (
    <div className="rounded-2xl shadow p-6" style={{ backgroundColor: 'white', border: `1px solid ${BRAND_COLORS.warmBeige}` }}>
      <p className="text-sm mb-1" style={{ color: BRAND_COLORS.slate }}>{label}</p>
      <p className="text-3xl font-bold" style={{ color: color || BRAND_COLORS.charcoal }}>{value}</p>
    </div>
  )
}

function ChartCard({ title, data, colors }) {
  if (data.length === 0) {
    return (
      <div className="rounded-2xl shadow p-6" style={{ backgroundColor: 'white', border: `1px solid ${colors.warmBeige}` }}>
        <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: colors.charcoal }}>{title}</h2>
        <p className="text-sm" style={{ color: colors.slate }}>No data yet</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl shadow p-6" style={{ backgroundColor: 'white', border: `1px solid ${colors.warmBeige}` }}>
      <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: colors.charcoal }}>{title}</h2>
      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 35)}>
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.warmBeige} />
          <XAxis type="number" stroke={colors.slate} />
          <YAxis 
            type="category" 
            dataKey="name" 
            width={150} 
            tick={{ fontSize: 12, fill: colors.slate }} 
            stroke={colors.slate}
          />
          <Tooltip />
          <Bar dataKey="value" fill={colors.wineDeep} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function OpenEndedCard({ title, responses, colors }) {
  return (
    <div className="rounded-2xl shadow p-6" style={{ backgroundColor: 'white', border: `1px solid ${colors.warmBeige}` }}>
      <h2 className="text-lg font-semibold mb-2" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: colors.charcoal }}>{title}</h2>
      <p className="text-sm mb-4" style={{ color: colors.slate }}>{responses.length} responses</p>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {responses.length === 0 ? (
          <p className="text-sm" style={{ color: colors.slate }}>No responses yet</p>
        ) : (
          responses.map((r, i) => (
            <div key={i} className="pb-3" style={{ borderBottom: `1px solid ${colors.warmBeige}` }}>
              <p className="text-sm" style={{ color: colors.charcoal }}>{r.text}</p>
              <p className="text-xs mt-1" style={{ color: colors.slate }}>
                {new Date(r.date).toLocaleDateString()}
                {r.source && <span className="ml-2">• {r.source}</span>}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}