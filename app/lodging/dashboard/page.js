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

const COLORS = ['#6B2D3F', '#8B3A4D', '#C4637A', '#2D4A3E', '#5B7C6F', '#8FA99E', '#C9A962', '#B8A99A', '#4A4A50', '#E8E0D5']

export default function LodgingDashboard() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [lastRefresh, setLastRefresh] = useState(null)
  
  // Filters
  const [typeFilter, setTypeFilter] = useState('all')
  const [priceTierFilter, setPriceTierFilter] = useState('all')
  const [activeFilter, setActiveFilter] = useState('all')

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
    const { data: lodgings, error } = await supabase
      .from('lodging')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching data:', error)
    } else {
      setData(lodgings || [])
    }
    setLastRefresh(new Date())
    setLoading(false)
  }

  useEffect(() => {
    if (authenticated) {
      fetchData()
    }
  }, [authenticated])

  // Get unique lodging types for filter
  const uniqueTypes = useMemo(() => {
    const types = new Set(data.map((l) => l.lodging_type).filter(Boolean))
    return Array.from(types)
  }, [data])

  // Get unique price tiers for filter
  const uniquePriceTiers = useMemo(() => {
    const tiers = new Set(data.map((l) => l.price_tier).filter(Boolean))
    return Array.from(tiers)
  }, [data])

  // Filter data based on selections
  const filteredData = useMemo(() => {
    return data.filter((l) => {
      if (typeFilter !== 'all' && l.lodging_type !== typeFilter) return false
      if (priceTierFilter !== 'all' && l.price_tier !== priceTierFilter) return false
      if (activeFilter === 'active' && !l.active) return false
      if (activeFilter === 'inactive' && l.active) return false
      return true
    })
  }, [data, typeFilter, priceTierFilter, activeFilter])

  // Password screen
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full">
          <h1 className="text-2xl font-bold text-[#2C2C30] mb-2" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Lodging Dashboard</h1>
          <p className="text-[#4A4A50] mb-6">Enter password to view lodging data</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] focus:ring-2 focus:ring-[#C4637A]/20 outline-none mb-4"
            />
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-[#6B2D3F] hover:bg-[#8B3A4D] text-white font-medium rounded-lg transition-colors"
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
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="text-[#4A4A50]">Loading lodging data...</div>
      </div>
    )
  }

  // Calculate metrics
  const totalLodgings = filteredData.length
  const totalUnfiltered = data.length
  const activeLodgings = filteredData.filter((l) => l.active).length
  const featuredLodgings = filteredData.filter((l) => l.featured).length
  const wineryLodgings = filteredData.filter((l) => l.is_winery_lodging).length
  const winePackagesAvailable = filteredData.filter((l) => l.wine_packages_available).length
  const avgCompleteness = filteredData.length > 0 
    ? Math.round(filteredData.filter(l => l.data_completeness_score).reduce((sum, l) => sum + l.data_completeness_score, 0) / filteredData.filter(l => l.data_completeness_score).length)
    : 0

  // Count occurrences helper
  const countOccurrences = (field, isArray = false) => {
    const counts = {}
    filteredData.forEach((l) => {
      if (isArray && Array.isArray(l[field])) {
        l[field].forEach((item) => {
          counts[item] = (counts[item] || 0) + 1
        })
      } else if (l[field]) {
        counts[l[field]] = (counts[l[field]] || 0) + 1
      }
    })
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }

  // Prepare chart data
  const typeData = countOccurrences('lodging_type')
  const priceTierData = countOccurrences('price_tier')
  const cityData = countOccurrences('city')
  const amenitiesData = countOccurrences('amenities', true).slice(0, 10)
  const vibeTagsData = countOccurrences('vibe_tags', true)
  const bestForData = countOccurrences('best_for', true)

  // Room count distribution
  const roomCountRanges = {
    '1-5 rooms': 0,
    '6-15 rooms': 0,
    '16-30 rooms': 0,
    '30+ rooms': 0
  }
  filteredData.forEach(l => {
    if (l.room_count) {
      if (l.room_count <= 5) roomCountRanges['1-5 rooms']++
      else if (l.room_count <= 15) roomCountRanges['6-15 rooms']++
      else if (l.room_count <= 30) roomCountRanges['16-30 rooms']++
      else roomCountRanges['30+ rooms']++
    }
  })
  const roomCountData = Object.entries(roomCountRanges)
    .map(([name, value]) => ({ name, value }))
    .filter(d => d.value > 0)

  // Lodgings by creation date (by month)
  const lodgingsByMonth = {}
  filteredData.forEach((l) => {
    if (l.created_at) {
      const month = new Date(l.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      lodgingsByMonth[month] = (lodgingsByMonth[month] || 0) + 1
    }
  })
  const timelineData = Object.entries(lodgingsByMonth)
    .map(([date, count]) => ({ date, count }))
    .reverse()
    .slice(-12) // Last 12 months

  const isFiltered = typeFilter !== 'all' || priceTierFilter !== 'all' || activeFilter !== 'all'

  return (
    <div className="min-h-screen bg-[#FAF7F2] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#2C2C30]" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Lodging Dashboard</h1>
            <p className="text-[#4A4A50]">Yadkin Valley Lodging Data</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/lodging/review"
              className="px-4 py-2 bg-[#2D4A3E] hover:bg-[#5B7C6F] text-white text-sm font-medium rounded-lg transition-colors"
            >
              Review Lodgings
            </a>
            <a
              href="/lodging/analysis"
              className="px-4 py-2 bg-[#2D4A3E] hover:bg-[#5B7C6F] text-white text-sm font-medium rounded-lg transition-colors"
            >
              Analysis
            </a>
            <a
              href="/dashboard"
              className="px-4 py-2 bg-[#4A4A50] hover:bg-[#2C2C30] text-white text-sm font-medium rounded-lg transition-colors"
            >
              Survey Dashboard
            </a>
            <span className="text-sm text-[#B8A99A]">
              {lastRefresh?.toLocaleTimeString()}
            </span>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-[#6B2D3F] hover:bg-[#8B3A4D] text-white text-sm font-medium rounded-lg transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-[#2C2C30]">Filters:</span>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-sm border border-[#E8E0D5] rounded-lg px-3 py-2 focus:border-[#6B2D3F] outline-none"
            >
              <option value="all">All Types</option>
              {uniqueTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select
              value={priceTierFilter}
              onChange={(e) => setPriceTierFilter(e.target.value)}
              className="text-sm border border-[#E8E0D5] rounded-lg px-3 py-2 focus:border-[#6B2D3F] outline-none"
            >
              <option value="all">All Price Tiers</option>
              {uniquePriceTiers.map((tier) => (
                <option key={tier} value={tier}>{tier}</option>
              ))}
            </select>

            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="text-sm border border-[#E8E0D5] rounded-lg px-3 py-2 focus:border-[#6B2D3F] outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            {isFiltered && (
              <button
                onClick={() => {
                  setTypeFilter('all')
                  setPriceTierFilter('all')
                  setActiveFilter('all')
                }}
                className="text-sm text-[#6B2D3F] hover:text-[#8B3A4D] font-medium"
              >
                Clear Filters
              </button>
            )}

            {isFiltered && (
              <span className="text-sm text-[#4A4A50]">
                Showing {totalLodgings} of {totalUnfiltered} lodgings
              </span>
            )}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <MetricCard label="Total Lodgings" value={totalLodgings} />
          <MetricCard label="Active" value={activeLodgings} />
          <MetricCard label="Featured" value={featuredLodgings} />
          <MetricCard label="Winery Lodging" value={wineryLodgings} />
          <MetricCard label="Wine Packages" value={winePackagesAvailable} />
          <MetricCard label="Avg Completeness" value={`${avgCompleteness}%`} />
        </div>

        {/* Charts Row 1 */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold text-[#2C2C30] mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Lodging Types</h2>
            {typeData.length === 0 ? (
              <p className="text-[#B8A99A] text-sm">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold text-[#2C2C30] mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Price Tier Distribution</h2>
            {priceTierData.length === 0 ? (
              <p className="text-[#B8A99A] text-sm">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={priceTierData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D5" />
                  <XAxis type="number" stroke="#B8A99A" />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} stroke="#B8A99A" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6B2D3F" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <ChartCard title="By City" data={cityData} />
          <ChartCard title="Room Count Distribution" data={roomCountData} />
        </div>

        {/* Charts Row 3 */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <ChartCard title="Top Amenities" data={amenitiesData} />
          <ChartCard title="Vibe Tags" data={vibeTagsData} />
        </div>

        {/* Best For */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#2C2C30] mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Best For</h2>
          {bestForData.length === 0 ? (
            <p className="text-[#B8A99A] text-sm">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(200, bestForData.length * 35)}>
              <BarChart data={bestForData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D5" />
                <XAxis type="number" stroke="#B8A99A" />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={150} 
                  tick={{ fontSize: 12 }} 
                  stroke="#B8A99A"
                />
                <Tooltip />
                <Bar dataKey="value" fill="#2D4A3E" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Timeline */}
        {timelineData.length > 0 && (
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-[#2C2C30] mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Lodgings Added Over Time</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D5" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#B8A99A" />
                <YAxis tick={{ fontSize: 12 }} stroke="#B8A99A" />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#6B2D3F" strokeWidth={2} dot={{ fill: '#6B2D3F' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent Lodgings */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold text-[#2C2C30] mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Recently Added Lodgings</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredData.slice(0, 10).map((lodging) => (
              <div key={lodging.id} className="border-b border-[#E8E0D5] pb-3 last:border-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#2C2C30]">{lodging.name}</p>
                    <p className="text-sm text-[#4A4A50]">
                      {lodging.lodging_type} • {lodging.city}
                      {lodging.price_tier && ` • ${lodging.price_tier}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {lodging.featured && (
                      <span className="text-xs bg-[#C9A962] text-white px-2 py-1 rounded-full">Featured</span>
                    )}
                    {lodging.is_winery_lodging && (
                      <span className="text-xs bg-[#6B2D3F] text-white px-2 py-1 rounded-full">Winery</span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      lodging.active ? 'bg-[#2D4A3E] text-white' : 'bg-[#E8E0D5] text-[#4A4A50]'
                    }`}>
                      {lodging.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-[#B8A99A] mt-8">
          ValleySomm Lodging Management
        </p>
      </div>
    </div>
  )
}

function MetricCard({ label, value }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <p className="text-sm text-[#4A4A50] mb-1">{label}</p>
      <p className="text-3xl font-bold text-[#2C2C30]">{value}</p>
    </div>
  )
}

function ChartCard({ title, data }) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold text-[#2C2C30] mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>{title}</h2>
        <p className="text-[#B8A99A] text-sm">No data yet</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-lg font-semibold text-[#2C2C30] mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>{title}</h2>
      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 35)}>
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D5" />
          <XAxis type="number" stroke="#B8A99A" />
          <YAxis 
            type="category" 
            dataKey="name" 
            width={150} 
            tick={{ fontSize: 12 }} 
            stroke="#B8A99A"
          />
          <Tooltip />
          <Bar dataKey="value" fill="#6B2D3F" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}