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

const COLORS = ['#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f', '#fbbf24', '#fcd34d', '#fde68a', '#fef3c7', '#451a03']

export default function Dashboard() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [lastRefresh, setLastRefresh] = useState(null)
  
  // Filters
  const [sourceFilter, setSourceFilter] = useState('all')
  const [emailFilter, setEmailFilter] = useState('all') // 'all', 'with_email', 'anonymous'
  const [timeFilter, setTimeFilter] = useState('all') // 'all', 'first_week', 'later'

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

  // Calculate first week threshold (first response + 7 days)
  const firstWeekThreshold = useMemo(() => {
    if (data.length === 0) return null
    const sorted = [...data].sort((a, b) => new Date(a.submitted_at) - new Date(b.submitted_at))
    const firstDate = new Date(sorted[0].submitted_at)
    return new Date(firstDate.getTime() + 7 * 24 * 60 * 60 * 1000)
  }, [data])

  // Filter data based on selections
  const filteredData = useMemo(() => {
    return data.filter((r) => {
      // Source filter
      if (sourceFilter !== 'all' && r.source !== sourceFilter) return false
      
      // Email filter
      if (emailFilter === 'with_email' && !r.email) return false
      if (emailFilter === 'anonymous' && r.email) return false
      
      // Time filter
      if (timeFilter !== 'all' && firstWeekThreshold) {
        const responseDate = new Date(r.submitted_at)
        if (timeFilter === 'first_week' && responseDate > firstWeekThreshold) return false
        if (timeFilter === 'later' && responseDate <= firstWeekThreshold) return false
      }
      
      return true
    })
  }, [data, sourceFilter, emailFilter, timeFilter, firstWeekThreshold])

  // Get unique sources for filter dropdown
  const uniqueSources = useMemo(() => {
    const sources = new Set(data.map((r) => r.source).filter(Boolean))
    return Array.from(sources)
  }, [data])

  // Password screen
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full">
          <h1 className="text-2xl font-bold text-stone-800 mb-2">Dashboard</h1>
          <p className="text-stone-500 mb-6">Enter password to view survey results</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none mb-4"
            />
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="text-stone-500">Loading survey data...</div>
      </div>
    )
  }

  // Calculate metrics (using filtered data)
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

  // Confidence distribution
  const confidenceData = [1, 2, 3, 4, 5].map((n) => ({
    name: n.toString(),
    value: filteredData.filter((r) => r.confidence === n).length,
  }))

  // Responses over time (by day)
  const responsesByDay = {}
  filteredData.forEach((r) => {
    const day = new Date(r.submitted_at).toLocaleDateString()
    responsesByDay[day] = (responsesByDay[day] || 0) + 1
  })
  const timelineData = Object.entries(responsesByDay)
    .map(([date, count]) => ({ date, count }))
    .reverse()

  // Willingness to pay percentage
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
    <div className="min-h-screen bg-stone-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-stone-800">Valley Somm Dashboard</h1>
            <p className="text-stone-500">Wine Country Trip Survey Results</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/review"
              className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Review Responses
            </a>
            <a
              href="/analysis"
              className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Analysis
            </a>
            <span className="text-sm text-stone-400">
              {lastRefresh?.toLocaleTimeString()}
            </span>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-stone-700">Filters:</span>
            
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="text-sm border border-stone-200 rounded-lg px-3 py-2 focus:border-amber-400 outline-none"
            >
              <option value="all">All Sources</option>
              {uniqueSources.map((source) => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>

            <select
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              className="text-sm border border-stone-200 rounded-lg px-3 py-2 focus:border-amber-400 outline-none"
            >
              <option value="all">All Responses</option>
              <option value="with_email">With Email</option>
              <option value="anonymous">Anonymous Only</option>
            </select>

            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="text-sm border border-stone-200 rounded-lg px-3 py-2 focus:border-amber-400 outline-none"
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
                className="text-sm text-amber-600 hover:text-amber-700 font-medium"
              >
                Clear Filters
              </button>
            )}

            {isFiltered && (
              <span className="text-sm text-stone-500">
                Showing {totalResponses} of {totalUnfiltered} responses
              </span>
            )}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <MetricCard label="Total Responses" value={totalResponses} />
          <MetricCard label="Reviewed" value={`${reviewedCount}/${totalResponses}`} />
          <MetricCard label="Avg Confidence" value={`${avgConfidence}/5`} />
          <MetricCard label="Drawing Entries" value={drawingEntries} />
          <MetricCard label="Want Results" value={wantsResults} />
          <MetricCard label="Would Pay" value={`${payPercentage}%`} />
        </div>

        {/* Source Breakdown + Timeline */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">Response Sources</h2>
            {sourceData.length === 0 ? (
              <p className="text-stone-400 text-sm">No data yet</p>
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
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {timelineData.length > 0 && (
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold text-stone-800 mb-4">Responses Over Time</h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#a8a29e" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#a8a29e" />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Charts Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <ChartCard title="Wine Regions Visited" data={regionsData} />
          <ChartCard title="Discovery Methods" data={discoveryData} />
          <ChartCard title="Planning Timeline" data={planningData} />
          <ChartCard title="Group Type" data={groupData} />
          <ChartCard title="Designated Driver Solution" data={driverData} />
          <ChartCard title="Reservation Approach" data={reservationsData} />
        </div>

        {/* Confidence & Pay Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">Confidence in Winery Selection</h2>
            <p className="text-sm text-stone-500 mb-4">1 = Total guesswork, 5 = Nailed it</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={confidenceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="name" stroke="#a8a29e" />
                <YAxis stroke="#a8a29e" />
                <Tooltip />
                <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">Willingness to Pay</h2>
            {payData.length === 0 ? (
              <p className="text-stone-400 text-sm">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={payData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis type="number" stroke="#a8a29e" />
                  <YAxis type="category" dataKey="name" width={180} tick={{ fontSize: 11 }} stroke="#a8a29e" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* "Other" Responses */}
        {(otherRegionsUS.length > 0 || otherRegionsIntl.length > 0 || otherDiscovery.length > 0 || otherDriver.length > 0 || otherSource.length > 0) && (
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">&quot;Other&quot; Responses</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherRegionsUS.length > 0 && (
                <div>
                  <h3 className="font-medium text-stone-700 mb-2">Other US Regions</h3>
                  <ul className="text-sm text-stone-600 space-y-1">
                    {otherRegionsUS.map((r, i) => <li key={i}>• {r}</li>)}
                  </ul>
                </div>
              )}
              {otherRegionsIntl.length > 0 && (
                <div>
                  <h3 className="font-medium text-stone-700 mb-2">International Regions</h3>
                  <ul className="text-sm text-stone-600 space-y-1">
                    {otherRegionsIntl.map((r, i) => <li key={i}>• {r}</li>)}
                  </ul>
                </div>
              )}
              {otherDiscovery.length > 0 && (
                <div>
                  <h3 className="font-medium text-stone-700 mb-2">Other Discovery Methods</h3>
                  <ul className="text-sm text-stone-600 space-y-1">
                    {otherDiscovery.map((r, i) => <li key={i}>• {r}</li>)}
                  </ul>
                </div>
              )}
              {otherDriver.length > 0 && (
                <div>
                  <h3 className="font-medium text-stone-700 mb-2">Other Driver Solutions</h3>
                  <ul className="text-sm text-stone-600 space-y-1">
                    {otherDriver.map((r, i) => <li key={i}>• {r}</li>)}
                  </ul>
                </div>
              )}
              {otherSource.length > 0 && (
                <div>
                  <h3 className="font-medium text-stone-700 mb-2">Other Sources</h3>
                  <ul className="text-sm text-stone-600 space-y-1">
                    {otherSource.map((r, i) => <li key={i}>• {r}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Open-Ended Responses */}
        <div className="grid md:grid-cols-3 gap-6">
          <OpenEndedCard title="Hardest Part of Planning" responses={hardestParts} />
          <OpenEndedCard title="What Would Make It Easier" responses={easierResponses} />
          <OpenEndedCard title="Surprises (Good & Bad)" responses={surprises} />
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-stone-400 mt-8">
          Drawing ends January 20, 2025
        </p>
      </div>
    </div>
  )
}

function MetricCard({ label, value }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <p className="text-sm text-stone-500 mb-1">{label}</p>
      <p className="text-3xl font-bold text-stone-800">{value}</p>
    </div>
  )
}

function ChartCard({ title, data }) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold text-stone-800 mb-4">{title}</h2>
        <p className="text-stone-400 text-sm">No data yet</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-lg font-semibold text-stone-800 mb-4">{title}</h2>
      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 35)}>
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
          <XAxis type="number" stroke="#a8a29e" />
          <YAxis 
            type="category" 
            dataKey="name" 
            width={150} 
            tick={{ fontSize: 12 }} 
            stroke="#a8a29e"
          />
          <Tooltip />
          <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function OpenEndedCard({ title, responses }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-lg font-semibold text-stone-800 mb-2">{title}</h2>
      <p className="text-sm text-stone-400 mb-4">{responses.length} responses</p>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {responses.length === 0 ? (
          <p className="text-stone-400 text-sm">No responses yet</p>
        ) : (
          responses.map((r, i) => (
            <div key={i} className="border-b border-stone-100 pb-3 last:border-0">
              <p className="text-stone-700 text-sm">{r.text}</p>
              <p className="text-stone-400 text-xs mt-1">
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
