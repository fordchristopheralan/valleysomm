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
} from 'recharts'

const COLORS = ['#6B2D3F', '#8B3A4D', '#C4637A', '#2D4A3E', '#5B7C6F', '#8FA99E', '#C9A962', '#B8A99A']

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
    const { data: lodging, error } = await supabase
      .from('lodging')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching data:', error)
    } else {
      setData(lodging || [])
    }
    setLastRefresh(new Date())
    setLoading(false)
  }

  useEffect(() => {
    if (authenticated) {
      fetchData()
    }
  }, [authenticated])

  // Filter data
  const filteredData = useMemo(() => {
    return data.filter((l) => {
      if (typeFilter !== 'all' && l.lodging_type !== typeFilter) return false
      if (priceTierFilter !== 'all' && l.price_tier !== priceTierFilter) return false
      if (activeFilter === 'active' && !l.active) return false
      if (activeFilter === 'inactive' && l.active) return false
      return true
    })
  }, [data, typeFilter, priceTierFilter, activeFilter])

  // Get unique values for filters
  const uniqueTypes = useMemo(() => {
    const types = new Set(data.map((l) => l.lodging_type).filter(Boolean))
    return Array.from(types)
  }, [data])

  const uniquePriceTiers = useMemo(() => {
    const tiers = new Set(data.map((l) => l.price_tier).filter(Boolean))
    return Array.from(tiers)
  }, [data])

  // Calculate metrics
  const totalLodging = filteredData.length
  const activeLodging = filteredData.filter((l) => l.active).length
  const wineryLodging = filteredData.filter((l) => l.is_winery_lodging).length
  const withWinePackages = filteredData.filter((l) => l.wine_packages_available).length
  const featuredCount = filteredData.filter((l) => l.featured).length
  const avgNearestWinery = filteredData.filter((l) => l.nearest_winery_minutes).length > 0
    ? Math.round(filteredData.filter((l) => l.nearest_winery_minutes).reduce((sum, l) => sum + l.nearest_winery_minutes, 0) / filteredData.filter((l) => l.nearest_winery_minutes).length)
    : null

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
  const vibeData = countOccurrences('vibe_tags', true)
  const bestForData = countOccurrences('best_for', true)
  const amenitiesData = countOccurrences('amenities', true).slice(0, 10)

  // Password screen
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full">
          <h1 className="text-2xl font-bold text-stone-800 mb-2">Lodging Dashboard</h1>
          <p className="text-stone-500 mb-6">Enter password to view lodging data</p>
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
        <div className="text-stone-500">Loading lodging data...</div>
      </div>
    )
  }

  const isFiltered = typeFilter !== 'all' || priceTierFilter !== 'all' || activeFilter !== 'all'

  return (
    <div className="min-h-screen bg-stone-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-stone-800">Lodging Dashboard</h1>
            <p className="text-stone-500">Yadkin Valley Accommodations</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/lodging/review"
              className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Review Lodging
            </a>
            <a
              href="/lodging/analysis"
              className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Analysis
            </a>
            <a
              href="/dashboard"
              className="px-4 py-2 bg-stone-600 hover:bg-stone-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Survey Dashboard
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
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-sm border border-stone-200 rounded-lg px-3 py-2 focus:border-amber-400 outline-none"
            >
              <option value="all">All Types</option>
              {uniqueTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select
              value={priceTierFilter}
              onChange={(e) => setPriceTierFilter(e.target.value)}
              className="text-sm border border-stone-200 rounded-lg px-3 py-2 focus:border-amber-400 outline-none"
            >
              <option value="all">All Price Tiers</option>
              {uniquePriceTiers.map((tier) => (
                <option key={tier} value={tier}>{tier}</option>
              ))}
            </select>

            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="text-sm border border-stone-200 rounded-lg px-3 py-2 focus:border-amber-400 outline-none"
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
                className="text-sm text-amber-600 hover:text-amber-700 font-medium"
              >
                Clear Filters
              </button>
            )}

            {isFiltered && (
              <span className="text-sm text-stone-500">
                Showing {filteredData.length} of {data.length} properties
              </span>
            )}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <MetricCard label="Total Properties" value={totalLodging} />
          <MetricCard label="Active" value={activeLodging} />
          <MetricCard label="Featured" value={featuredCount} />
          <MetricCard label="Winery Lodging" value={wineryLodging} />
          <MetricCard label="Wine Packages" value={withWinePackages} />
          <MetricCard label="Avg to Winery" value={avgNearestWinery ? `${avgNearestWinery} min` : 'N/A'} />
        </div>

        {/* Type & Price Distribution */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">By Type</h2>
            {typeData.length === 0 ? (
              <p className="text-stone-400 text-sm">No data yet</p>
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
            <h2 className="text-lg font-semibold text-stone-800 mb-4">By Price Tier</h2>
            {priceTierData.length === 0 ? (
              <p className="text-stone-400 text-sm">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={priceTierData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis type="number" stroke="#a8a29e" />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} stroke="#a8a29e" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6B2D3F" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Location & Vibe Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <ChartCard title="By City" data={cityData} />
          <ChartCard title="Vibe Tags" data={vibeData} />
        </div>

        {/* Best For & Amenities */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <ChartCard title="Best For" data={bestForData} />
          <ChartCard title="Top Amenities" data={amenitiesData} />
        </div>

        {/* Lodging Table */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="p-6 border-b border-stone-100">
            <h2 className="text-lg font-semibold text-stone-800">All Properties</h2>
            <p className="text-sm text-stone-500">{filteredData.length} properties</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50">
                <tr>
                  <th className="text-left p-4 font-medium text-stone-600">Name</th>
                  <th className="text-left p-4 font-medium text-stone-600">City</th>
                  <th className="text-left p-4 font-medium text-stone-600">Type</th>
                  <th className="text-left p-4 font-medium text-stone-600">Price</th>
                  <th className="text-center p-4 font-medium text-stone-600">Rooms</th>
                  <th className="text-center p-4 font-medium text-stone-600">Nearest Winery</th>
                  <th className="text-center p-4 font-medium text-stone-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((lodging) => (
                  <tr key={lodging.id} className="border-t border-stone-100 hover:bg-stone-50">
                    <td className="p-4">
                      <div className="font-medium text-stone-800">{lodging.name}</div>
                      {lodging.tagline && (
                        <div className="text-xs text-stone-500 mt-0.5">{lodging.tagline}</div>
                      )}
                    </td>
                    <td className="p-4 text-stone-600">{lodging.city}</td>
                    <td className="p-4">
                      <span className={`text-sm px-2 py-1 rounded ${
                        lodging.is_winery_lodging ? 'bg-purple-100 text-purple-700' : 'bg-stone-100 text-stone-600'
                      }`}>
                        {lodging.lodging_type}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-sm px-2 py-1 rounded ${
                        lodging.price_tier === 'luxury' ? 'bg-amber-100 text-amber-700' :
                        lodging.price_tier === 'upscale' ? 'bg-purple-100 text-purple-700' :
                        lodging.price_tier === 'moderate' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {lodging.price_tier || 'N/A'}
                      </span>
                      {lodging.price_range && (
                        <span className="text-xs text-stone-500 ml-1">{lodging.price_range}</span>
                      )}
                    </td>
                    <td className="p-4 text-center text-stone-600">
                      {lodging.room_count || '-'}
                    </td>
                    <td className="p-4 text-center">
                      {lodging.nearest_winery_minutes ? (
                        <span className="text-sm text-green-600">{lodging.nearest_winery_minutes} min</span>
                      ) : (
                        <span className="text-stone-400">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {lodging.active ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Active</span>
                        ) : (
                          <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded">Inactive</span>
                        )}
                        {lodging.featured && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">★</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-stone-400 mt-8">
          ValleySomm Lodging Data
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
          <Bar dataKey="value" fill="#6B2D3F" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}