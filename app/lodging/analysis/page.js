'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'

const COLORS = ['#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f', '#fbbf24', '#fcd34d', '#fde68a']

export default function LodgingAnalysisPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [lodgings, setLodgings] = useState([])
  const [activeTab, setActiveTab] = useState('quality')

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
    const { data } = await supabase.from('lodging').select('*').order('name')
    setLodgings(data || [])
    setLoading(false)
  }

  useEffect(() => { if (authenticated) fetchData() }, [authenticated])

  // Data Quality Analysis
  const qualityMetrics = useMemo(() => {
    if (lodgings.length === 0) return null

    const fields = [
      { name: 'Name', key: 'name', weight: 10 },
      { name: 'Tagline', key: 'tagline', weight: 5 },
      { name: 'Description', key: 'description', weight: 5 },
      { name: 'Latitude', key: 'latitude', weight: 15 },
      { name: 'Longitude', key: 'longitude', weight: 15 },
      { name: 'Address', key: 'address', weight: 5 },
      { name: 'City', key: 'city', weight: 5 },
      { name: 'Lodging Type', key: 'lodging_type', weight: 10 },
      { name: 'Price Tier', key: 'price_tier', weight: 10 },
      { name: 'Vibe Tags', key: 'vibe_tags', weight: 5, isArray: true },
      { name: 'Best For', key: 'best_for', weight: 5, isArray: true },
      { name: 'Amenities', key: 'amenities', weight: 5, isArray: true },
      { name: 'Nearest Winery', key: 'nearest_winery_id', weight: 5 },
    ]

    const fieldStats = fields.map(field => {
      const filled = lodgings.filter(l => {
        if (field.isArray) return l[field.key]?.length > 0
        return l[field.key] != null && l[field.key] !== ''
      }).length
      return { ...field, filled, total: lodgings.length, pct: Math.round((filled / lodgings.length) * 100) }
    })

    const totalScore = fieldStats.reduce((sum, f) => sum + (f.pct / 100) * f.weight, 0)
    const maxScore = fieldStats.reduce((sum, f) => sum + f.weight, 0)
    const overallScore = Math.round((totalScore / maxScore) * 100)

    const needsAttention = lodgings.filter(l => 
      !l.latitude || !l.longitude || !l.vibe_tags?.length || !l.best_for?.length
    ).map(l => ({ name: l.name, city: l.city, issues: [] }))

    return { fieldStats, overallScore, needsAttention }
  }, [lodgings])

  // Geographic Analysis
  const geoAnalysis = useMemo(() => {
    if (lodgings.length === 0) return null

    const withCoords = lodgings.filter(l => l.latitude && l.longitude).length
    const withNearestWinery = lodgings.filter(l => l.nearest_winery_minutes).length
    const avgDistance = lodgings.filter(l => l.nearest_winery_minutes).length > 0
      ? Math.round(lodgings.filter(l => l.nearest_winery_minutes).reduce((s, l) => s + l.nearest_winery_minutes, 0) / withNearestWinery)
      : 0

    const byCityRaw = {}
    lodgings.forEach(l => {
      const city = l.city || 'Unknown'
      if (!byCityRaw[city]) byCityRaw[city] = { count: 0, types: {}, tiers: {} }
      byCityRaw[city].count++
      const type = l.lodging_type || 'Unknown'
      byCityRaw[city].types[type] = (byCityRaw[city].types[type] || 0) + 1
      const tier = l.price_tier || 'Unknown'
      byCityRaw[city].tiers[tier] = (byCityRaw[city].tiers[tier] || 0) + 1
    })

    const byCity = Object.entries(byCityRaw).map(([name, data]) => ({
      name, count: data.count,
      topType: Object.entries(data.types).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A',
      topTier: Object.entries(data.tiers).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A',
    })).sort((a, b) => b.count - a.count)

    return { withCoords, total: lodgings.length, withNearestWinery, avgDistance, byCity }
  }, [lodgings])

  // Segment Analysis
  const segmentAnalysis = useMemo(() => {
    if (lodgings.length === 0) return null

    // By Type
    const byTypeRaw = {}
    lodgings.forEach(l => {
      const type = l.lodging_type || 'Unknown'
      if (!byTypeRaw[type]) byTypeRaw[type] = { count: 0, vibes: {}, amenities: [], hasCoords: 0 }
      byTypeRaw[type].count++
      if (l.latitude && l.longitude) byTypeRaw[type].hasCoords++
      l.vibe_tags?.forEach(v => { byTypeRaw[type].vibes[v] = (byTypeRaw[type].vibes[v] || 0) + 1 })
      byTypeRaw[type].amenities.push(...(l.amenities || []))
    })

    const byType = Object.entries(byTypeRaw).map(([name, data]) => ({
      name, count: data.count, coordsPct: Math.round((data.hasCoords / data.count) * 100),
      topVibes: Object.entries(data.vibes).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([v]) => v),
    })).sort((a, b) => b.count - a.count)

    // By Price Tier
    const byTierRaw = {}
    lodgings.forEach(l => {
      const tier = l.price_tier || 'Unknown'
      if (!byTierRaw[tier]) byTierRaw[tier] = { count: 0, vibes: {}, amenities: {}, wineryLodging: 0 }
      byTierRaw[tier].count++
      if (l.is_winery_lodging) byTierRaw[tier].wineryLodging++
      l.vibe_tags?.forEach(v => { byTierRaw[tier].vibes[v] = (byTierRaw[tier].vibes[v] || 0) + 1 })
      l.amenities?.forEach(a => { byTierRaw[tier].amenities[a] = (byTierRaw[tier].amenities[a] || 0) + 1 })
    })

    const byTier = Object.entries(byTierRaw).map(([name, data]) => ({
      name, count: data.count, wineryPct: Math.round((data.wineryLodging / data.count) * 100),
      topVibes: Object.entries(data.vibes).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([v]) => v),
      topAmenities: Object.entries(data.amenities).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([a]) => a),
    })).sort((a, b) => b.count - a.count)

    // Winery vs Non-Winery
    const wineryLodging = lodgings.filter(l => l.is_winery_lodging)
    const nonWineryLodging = lodgings.filter(l => !l.is_winery_lodging)

    const getTopItems = (items, key) => {
      const counts = {}
      items.forEach(l => l[key]?.forEach(v => { counts[v] = (counts[v] || 0) + 1 }))
      return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }))
    }

    return {
      byType, byTier,
      winery: { count: wineryLodging.length, topVibes: getTopItems(wineryLodging, 'vibe_tags'), topAmenities: getTopItems(wineryLodging, 'amenities') },
      nonWinery: { count: nonWineryLodging.length, topVibes: getTopItems(nonWineryLodging, 'vibe_tags'), topAmenities: getTopItems(nonWineryLodging, 'amenities') },
    }
  }, [lodgings])

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full">
          <h1 className="text-2xl font-bold text-stone-800 mb-2">Lodging Analysis</h1>
          <p className="text-stone-500 mb-6">Enter password to access analysis tools</p>
          <form onSubmit={handleLogin}>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"
              className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 outline-none mb-4" />
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg">Enter</button>
          </form>
        </div>
      </div>
    )
  }

  if (loading) return <div className="min-h-screen bg-stone-100 flex items-center justify-center"><div className="text-stone-500">Loading...</div></div>

  return (
    <div className="min-h-screen bg-stone-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-stone-800">Lodging Analysis</h1>
            <p className="text-stone-500">Data quality, geographic coverage & segment insights</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-stone-500">{lodgings.length} properties</span>
            <a href="/lodging/review" className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white text-sm font-medium rounded-lg">Review</a>
            <a href="/lodging/dashboard" className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg">Dashboard</a>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[{ id: 'quality', label: 'Data Quality' }, { id: 'geo', label: 'Geographic' }, { id: 'segments', label: 'Segments' }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === tab.id ? 'bg-amber-500 text-white' : 'bg-white text-stone-600 hover:bg-stone-50'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Data Quality Tab */}
        {activeTab === 'quality' && qualityMetrics && (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="bg-white rounded-2xl shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-stone-800">Overall Data Quality</h2>
                <div className={`text-3xl font-bold ${qualityMetrics.overallScore >= 80 ? 'text-green-600' : qualityMetrics.overallScore >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                  {qualityMetrics.overallScore}%
                </div>
              </div>
              <div className="h-4 bg-stone-100 rounded-full overflow-hidden">
                <div className={`h-full ${qualityMetrics.overallScore >= 80 ? 'bg-green-500' : qualityMetrics.overallScore >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${qualityMetrics.overallScore}%` }} />
              </div>
            </div>

            {/* Field Completeness */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold text-stone-800 mb-4">Field Completeness</h2>
              <div className="space-y-3">
                {qualityMetrics.fieldStats.map(field => (
                  <div key={field.key} className="flex items-center gap-4">
                    <div className="w-32 text-sm text-stone-600">{field.name}</div>
                    <div className="flex-1 h-6 bg-stone-100 rounded-full overflow-hidden">
                      <div className={`h-full ${field.pct >= 90 ? 'bg-green-500' : field.pct >= 70 ? 'bg-amber-500' : 'bg-red-400'}`}
                        style={{ width: `${field.pct}%` }} />
                    </div>
                    <div className="w-20 text-sm text-right">
                      <span className="font-medium">{field.filled}</span>
                      <span className="text-stone-400">/{field.total}</span>
                      <span className="text-stone-500 ml-1">({field.pct}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Needs Attention */}
            {qualityMetrics.needsAttention.length > 0 && (
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-lg font-semibold text-stone-800 mb-4">Properties Needing Attention</h2>
                <p className="text-sm text-stone-500 mb-4">{qualityMetrics.needsAttention.length} properties missing critical data (coords, vibes, or best_for)</p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {qualityMetrics.needsAttention.slice(0, 12).map((p, i) => (
                    <div key={i} className="p-3 bg-red-50 rounded-lg border border-red-100">
                      <p className="font-medium text-stone-800">{p.name}</p>
                      <p className="text-xs text-stone-500">{p.city}</p>
                    </div>
                  ))}
                </div>
                {qualityMetrics.needsAttention.length > 12 && (
                  <p className="text-sm text-stone-500 mt-3">...and {qualityMetrics.needsAttention.length - 12} more</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Geographic Tab */}
        {activeTab === 'geo' && geoAnalysis && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl shadow p-6">
                <p className="text-sm text-stone-500 mb-1">With Coordinates</p>
                <p className="text-3xl font-bold text-stone-800">{geoAnalysis.withCoords}/{geoAnalysis.total}</p>
              </div>
              <div className="bg-white rounded-2xl shadow p-6">
                <p className="text-sm text-stone-500 mb-1">With Nearest Winery</p>
                <p className="text-3xl font-bold text-stone-800">{geoAnalysis.withNearestWinery}</p>
              </div>
              <div className="bg-white rounded-2xl shadow p-6">
                <p className="text-sm text-stone-500 mb-1">Avg to Winery</p>
                <p className="text-3xl font-bold text-stone-800">{geoAnalysis.avgDistance} min</p>
              </div>
              <div className="bg-white rounded-2xl shadow p-6">
                <p className="text-sm text-stone-500 mb-1">Cities Covered</p>
                <p className="text-3xl font-bold text-stone-800">{geoAnalysis.byCity.length}</p>
              </div>
            </div>

            {/* City Distribution Chart */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold text-stone-800 mb-4">Properties by City</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={geoAnalysis.byCity} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis type="number" stroke="#a8a29e" />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} stroke="#a8a29e" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* City Details Table */}
            <div className="bg-white rounded-2xl shadow overflow-hidden">
              <div className="p-6 border-b border-stone-100">
                <h2 className="text-lg font-semibold text-stone-800">City Details</h2>
              </div>
              <table className="w-full">
                <thead className="bg-stone-50">
                  <tr>
                    <th className="text-left p-4 font-medium text-stone-600">City</th>
                    <th className="text-center p-4 font-medium text-stone-600">Count</th>
                    <th className="text-left p-4 font-medium text-stone-600">Top Type</th>
                    <th className="text-left p-4 font-medium text-stone-600">Top Price Tier</th>
                  </tr>
                </thead>
                <tbody>
                  {geoAnalysis.byCity.map(city => (
                    <tr key={city.name} className="border-t border-stone-100">
                      <td className="p-4 font-medium text-stone-800">{city.name}</td>
                      <td className="p-4 text-center">{city.count}</td>
                      <td className="p-4"><span className="text-sm bg-stone-100 text-stone-600 px-2 py-1 rounded">{city.topType}</span></td>
                      <td className="p-4"><span className="text-sm bg-amber-100 text-amber-700 px-2 py-1 rounded">{city.topTier}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Segments Tab */}
        {activeTab === 'segments' && segmentAnalysis && (
          <div className="space-y-6">
            {/* By Type */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold text-stone-800 mb-4">By Lodging Type</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-stone-50">
                    <tr>
                      <th className="text-left p-3 font-medium text-stone-600">Type</th>
                      <th className="text-center p-3 font-medium text-stone-600">Count</th>
                      <th className="text-center p-3 font-medium text-stone-600">Coords %</th>
                      <th className="text-left p-3 font-medium text-stone-600">Top Vibes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {segmentAnalysis.byType.map(t => (
                      <tr key={t.name} className="border-t border-stone-100">
                        <td className="p-3 font-medium text-stone-800">{t.name}</td>
                        <td className="p-3 text-center">{t.count}</td>
                        <td className="p-3 text-center">
                          <span className={`text-sm px-2 py-0.5 rounded ${t.coordsPct >= 80 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {t.coordsPct}%
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {t.topVibes.map(v => <span key={v} className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">{v}</span>)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* By Price Tier */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold text-stone-800 mb-4">By Price Tier</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-stone-50">
                    <tr>
                      <th className="text-left p-3 font-medium text-stone-600">Tier</th>
                      <th className="text-center p-3 font-medium text-stone-600">Count</th>
                      <th className="text-center p-3 font-medium text-stone-600">Winery %</th>
                      <th className="text-left p-3 font-medium text-stone-600">Top Vibes</th>
                      <th className="text-left p-3 font-medium text-stone-600">Top Amenities</th>
                    </tr>
                  </thead>
                  <tbody>
                    {segmentAnalysis.byTier.map(t => (
                      <tr key={t.name} className="border-t border-stone-100">
                        <td className="p-3 font-medium text-stone-800 capitalize">{t.name}</td>
                        <td className="p-3 text-center">{t.count}</td>
                        <td className="p-3 text-center">
                          <span className={`text-sm px-2 py-0.5 rounded ${t.wineryPct > 0 ? 'bg-purple-100 text-purple-700' : 'bg-stone-100 text-stone-600'}`}>
                            {t.wineryPct}%
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {t.topVibes.map(v => <span key={v} className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">{v}</span>)}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {t.topAmenities.map(a => <span key={a} className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded">{a}</span>)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Winery vs Non-Winery */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow p-6">
                <h3 className="text-lg font-semibold text-stone-800 mb-2">🍷 Winery Lodging ({segmentAnalysis.winery.count})</h3>
                <div className="mb-4">
                  <p className="text-sm text-stone-500 mb-2">Top Vibes</p>
                  <div className="flex flex-wrap gap-2">
                    {segmentAnalysis.winery.topVibes.map(v => (
                      <span key={v.name} className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded">{v.name} ({v.count})</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-stone-500 mb-2">Top Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {segmentAnalysis.winery.topAmenities.map(a => (
                      <span key={a.name} className="text-sm bg-stone-100 text-stone-600 px-2 py-1 rounded">{a.name} ({a.count})</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow p-6">
                <h3 className="text-lg font-semibold text-stone-800 mb-2">🏨 Non-Winery Lodging ({segmentAnalysis.nonWinery.count})</h3>
                <div className="mb-4">
                  <p className="text-sm text-stone-500 mb-2">Top Vibes</p>
                  <div className="flex flex-wrap gap-2">
                    {segmentAnalysis.nonWinery.topVibes.map(v => (
                      <span key={v.name} className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">{v.name} ({v.count})</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-stone-500 mb-2">Top Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {segmentAnalysis.nonWinery.topAmenities.map(a => (
                      <span key={a.name} className="text-sm bg-stone-100 text-stone-600 px-2 py-1 rounded">{a.name} ({a.count})</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}