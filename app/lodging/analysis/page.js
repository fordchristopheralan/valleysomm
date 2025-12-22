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

const COLORS = ['#6B2D3F', '#8B3A4D', '#C4637A', '#2D4A3E', '#5B7C6F', '#8FA99E', '#C9A962', '#B8A99A', '#4A4A50', '#E8E0D5']

export default function LodgingAnalysisPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [lodgings, setLodgings] = useState([])
  const [activeTab, setActiveTab] = useState('overview')

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
    
    const { data: lodgingData } = await supabase
      .from('lodging')
      .select('*')
      .order('name', { ascending: true })

    setLodgings(lodgingData || [])
    setLoading(false)
  }

  useEffect(() => {
    if (authenticated) {
      fetchData()
    }
  }, [authenticated])

  // Analysis calculations
  const analysis = useMemo(() => {
    if (lodgings.length === 0) return null

    const activeLodgings = lodgings.filter(l => l.active)
    
    // Type distribution
    const typeDistribution = {}
    lodgings.forEach(l => {
      const type = l.lodging_type || 'Uncategorized'
      typeDistribution[type] = (typeDistribution[type] || 0) + 1
    })

    // Price tier distribution
    const priceTierDistribution = {}
    lodgings.forEach(l => {
      const tier = l.price_tier || 'Unspecified'
      priceTierDistribution[tier] = (priceTierDistribution[tier] || 0) + 1
    })

    // City distribution
    const cityDistribution = {}
    lodgings.forEach(l => {
      const city = l.city || 'Unknown'
      cityDistribution[city] = (cityDistribution[city] || 0) + 1
    })

    // Winery connection stats
    const wineryLodgings = lodgings.filter(l => l.is_winery_lodging).length
    const winePackagesCount = lodgings.filter(l => l.wine_packages_available).length
    const nearbyWineryCount = lodgings.filter(l => l.nearest_winery_minutes && l.nearest_winery_minutes <= 15).length

    // Amenity frequency
    const amenityFrequency = {}
    lodgings.forEach(l => {
      (l.amenities || []).forEach(amenity => {
        amenityFrequency[amenity] = (amenityFrequency[amenity] || 0) + 1
      })
    })

    // Vibe tag frequency
    const vibeTagFrequency = {}
    lodgings.forEach(l => {
      (l.vibe_tags || []).forEach(tag => {
        vibeTagFrequency[tag] = (vibeTagFrequency[tag] || 0) + 1
      })
    })

    // Best for frequency
    const bestForFrequency = {}
    lodgings.forEach(l => {
      (l.best_for || []).forEach(bf => {
        bestForFrequency[bf] = (bestForFrequency[bf] || 0) + 1
      })
    })

    // Data completeness analysis
    const completenessRanges = {
      'Complete (80-100%)': 0,
      'Good (60-79%)': 0,
      'Partial (40-59%)': 0,
      'Minimal (20-39%)': 0,
      'Empty (0-19%)': 0
    }
    lodgings.forEach(l => {
      const score = l.data_completeness_score || 0
      if (score >= 80) completenessRanges['Complete (80-100%)']++
      else if (score >= 60) completenessRanges['Good (60-79%)']++
      else if (score >= 40) completenessRanges['Partial (40-59%)']++
      else if (score >= 20) completenessRanges['Minimal (20-39%)']++
      else completenessRanges['Empty (0-19%)']++
    })

    // Missing data gaps
    const gaps = {
      noPhone: lodgings.filter(l => !l.phone).length,
      noWebsite: lodgings.filter(l => !l.website).length,
      noDescription: lodgings.filter(l => !l.description).length,
      noPricing: lodgings.filter(l => !l.price_tier && !l.price_range).length,
      noAmenities: lodgings.filter(l => !l.amenities || l.amenities.length === 0).length,
      noVibeTags: lodgings.filter(l => !l.vibe_tags || l.vibe_tags.length === 0).length,
      noBestFor: lodgings.filter(l => !l.best_for || l.best_for.length === 0).length,
      noCoordinates: lodgings.filter(l => !l.latitude || !l.longitude).length,
      noBookingUrl: lodgings.filter(l => !l.booking_url).length,
    }

    // Winery proximity analysis
    const proximityRanges = {
      'On-site (Winery Lodging)': lodgings.filter(l => l.is_winery_lodging).length,
      'Walking (< 5 min)': lodgings.filter(l => !l.is_winery_lodging && l.nearest_winery_minutes && l.nearest_winery_minutes < 5).length,
      'Very Close (5-10 min)': lodgings.filter(l => !l.is_winery_lodging && l.nearest_winery_minutes && l.nearest_winery_minutes >= 5 && l.nearest_winery_minutes <= 10).length,
      'Close (11-20 min)': lodgings.filter(l => !l.is_winery_lodging && l.nearest_winery_minutes && l.nearest_winery_minutes > 10 && l.nearest_winery_minutes <= 20).length,
      'Moderate (21-30 min)': lodgings.filter(l => !l.is_winery_lodging && l.nearest_winery_minutes && l.nearest_winery_minutes > 20 && l.nearest_winery_minutes <= 30).length,
      'Far (30+ min)': lodgings.filter(l => !l.is_winery_lodging && l.nearest_winery_minutes && l.nearest_winery_minutes > 30).length,
      'Unknown': lodgings.filter(l => !l.is_winery_lodging && !l.nearest_winery_minutes).length,
    }

    return {
      total: lodgings.length,
      active: activeLodgings.length,
      featured: lodgings.filter(l => l.featured).length,
      typeDistribution: Object.entries(typeDistribution)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
      priceTierDistribution: Object.entries(priceTierDistribution)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
      cityDistribution: Object.entries(cityDistribution)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
      wineryLodgings,
      winePackagesCount,
      nearbyWineryCount,
      amenityFrequency: Object.entries(amenityFrequency)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 15),
      vibeTagFrequency: Object.entries(vibeTagFrequency)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
      bestForFrequency: Object.entries(bestForFrequency)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
      completenessRanges: Object.entries(completenessRanges)
        .map(([name, value]) => ({ name, value }))
        .filter(d => d.value > 0),
      gaps,
      proximityRanges: Object.entries(proximityRanges)
        .map(([name, value]) => ({ name, value }))
        .filter(d => d.value > 0),
      avgCompleteness: lodgings.length > 0 
        ? Math.round(lodgings.reduce((sum, l) => sum + (l.data_completeness_score || 0), 0) / lodgings.length)
        : 0
    }
  }, [lodgings])

  // Password screen
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full">
          <h1 className="text-2xl font-bold text-[#2C2C30] mb-2" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Lodging Analysis</h1>
          <p className="text-[#4A4A50] mb-6">Enter password to access analytics</p>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="text-[#4A4A50]">Loading analysis data...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#2C2C30]" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Lodging Analysis</h1>
            <p className="text-[#4A4A50]">Data insights and coverage analysis</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#4A4A50]">
              {analysis?.total || 0} total lodgings
            </span>
            <a
              href="/lodging/review"
              className="px-4 py-2 bg-[#2D4A3E] hover:bg-[#5B7C6F] text-white text-sm font-medium rounded-lg transition-colors"
            >
              Review Lodgings
            </a>
            <a
              href="/lodging/dashboard"
              className="px-4 py-2 bg-[#6B2D3F] hover:bg-[#8B3A4D] text-white text-sm font-medium rounded-lg transition-colors"
            >
              Dashboard
            </a>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'overview' ? 'bg-[#6B2D3F] text-white' : 'bg-white text-[#4A4A50] hover:bg-[#FAF7F2]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('geographic')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'geographic' ? 'bg-[#6B2D3F] text-white' : 'bg-white text-[#4A4A50] hover:bg-[#FAF7F2]'
            }`}
          >
            Geographic
          </button>
          <button
            onClick={() => setActiveTab('winery')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'winery' ? 'bg-[#6B2D3F] text-white' : 'bg-white text-[#4A4A50] hover:bg-[#FAF7F2]'
            }`}
          >
            Winery Connection
          </button>
          <button
            onClick={() => setActiveTab('gaps')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'gaps' ? 'bg-[#6B2D3F] text-white' : 'bg-white text-[#4A4A50] hover:bg-[#FAF7F2]'
            }`}
          >
            Data Gaps
          </button>
        </div>

        {!analysis ? (
          <div className="bg-white rounded-2xl shadow p-8 text-center">
            <p className="text-[#4A4A50]">No lodging data available yet.</p>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <MetricCard label="Total Lodgings" value={analysis.total} />
                  <MetricCard label="Active" value={analysis.active} />
                  <MetricCard label="Featured" value={analysis.featured} />
                  <MetricCard label="Avg Completeness" value={`${analysis.avgCompleteness}%`} />
                  <MetricCard label="Wine Packages" value={analysis.winePackagesCount} />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Type Distribution */}
                  <div className="bg-white rounded-2xl shadow p-6">
                    <h2 className="text-lg font-semibold text-[#2C2C30] mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Lodging Types</h2>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={analysis.typeDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          labelLine={false}
                        >
                          {analysis.typeDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Price Tier Distribution */}
                  <div className="bg-white rounded-2xl shadow p-6">
                    <h2 className="text-lg font-semibold text-[#2C2C30] mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Price Tiers</h2>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={analysis.priceTierDistribution} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D5" />
                        <XAxis type="number" stroke="#B8A99A" />
                        <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} stroke="#B8A99A" />
                        <Tooltip />
                        <Bar dataKey="value" fill="#6B2D3F" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Vibe Tags & Best For */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl shadow p-6">
                    <h2 className="text-lg font-semibold text-[#2C2C30] mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Popular Vibe Tags</h2>
                    {analysis.vibeTagFrequency.length === 0 ? (
                      <p className="text-[#B8A99A] text-sm">No vibe tags yet</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={Math.max(200, analysis.vibeTagFrequency.length * 30)}>
                        <BarChart data={analysis.vibeTagFrequency} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D5" />
                          <XAxis type="number" stroke="#B8A99A" />
                          <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} stroke="#B8A99A" />
                          <Tooltip />
                          <Bar dataKey="value" fill="#2D4A3E" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl shadow p-6">
                    <h2 className="text-lg font-semibold text-[#2C2C30] mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Best For Categories</h2>
                    {analysis.bestForFrequency.length === 0 ? (
                      <p className="text-[#B8A99A] text-sm">No best for data yet</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={Math.max(200, analysis.bestForFrequency.length * 30)}>
                        <BarChart data={analysis.bestForFrequency} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D5" />
                          <XAxis type="number" stroke="#B8A99A" />
                          <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} stroke="#B8A99A" />
                          <Tooltip />
                          <Bar dataKey="value" fill="#C9A962" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Top Amenities */}
                <div className="bg-white rounded-2xl shadow p-6">
                  <h2 className="text-lg font-semibold text-[#2C2C30] mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Top Amenities</h2>
                  {analysis.amenityFrequency.length === 0 ? (
                    <p className="text-[#B8A99A] text-sm">No amenities data yet</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={Math.max(250, analysis.amenityFrequency.length * 28)}>
                      <BarChart data={analysis.amenityFrequency} layout="vertical" margin={{ left: 20, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D5" />
                        <XAxis type="number" stroke="#B8A99A" />
                        <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 11 }} stroke="#B8A99A" />
                        <Tooltip />
                        <Bar dataKey="value" fill="#5B7C6F" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            )}

            {/* Geographic Tab */}
            {activeTab === 'geographic' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <MetricCard label="Cities Covered" value={analysis.cityDistribution.length} />
                  <MetricCard label="With Coordinates" value={analysis.total - analysis.gaps.noCoordinates} />
                  <MetricCard label="Missing Location" value={analysis.gaps.noCoordinates} />
                </div>

                <div className="bg-white rounded-2xl shadow p-6">
                  <h2 className="text-lg font-semibold text-[#2C2C30] mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Lodgings by City</h2>
                  <ResponsiveContainer width="100%" height={Math.max(300, analysis.cityDistribution.length * 35)}>
                    <BarChart data={analysis.cityDistribution} layout="vertical" margin={{ left: 20, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D5" />
                      <XAxis type="number" stroke="#B8A99A" />
                      <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12 }} stroke="#B8A99A" />
                      <Tooltip />
                      <Bar dataKey="value" fill="#6B2D3F" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* City Details Table */}
                <div className="bg-white rounded-2xl shadow overflow-hidden">
                  <div className="p-6 border-b border-[#E8E0D5]">
                    <h2 className="text-lg font-semibold text-[#2C2C30]" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>City Coverage Details</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#FAF7F2]">
                        <tr>
                          <th className="text-left p-4 font-medium text-[#4A4A50]">City</th>
                          <th className="text-center p-4 font-medium text-[#4A4A50]">Count</th>
                          <th className="text-center p-4 font-medium text-[#4A4A50]">% of Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analysis.cityDistribution.map((city, i) => (
                          <tr key={city.name} className="border-t border-[#E8E0D5]">
                            <td className="p-4 font-medium text-[#2C2C30]">{city.name}</td>
                            <td className="p-4 text-center text-[#4A4A50]">{city.value}</td>
                            <td className="p-4 text-center text-[#4A4A50]">
                              {((city.value / analysis.total) * 100).toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Winery Connection Tab */}
            {activeTab === 'winery' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-4 gap-4">
                  <MetricCard label="Winery Lodgings" value={analysis.wineryLodgings} />
                  <MetricCard label="Wine Packages" value={analysis.winePackagesCount} />
                  <MetricCard label="< 15 min to Winery" value={analysis.nearbyWineryCount} />
                  <MetricCard 
                    label="Winery Connected %" 
                    value={`${Math.round(((analysis.wineryLodgings + analysis.winePackagesCount) / analysis.total) * 100)}%`} 
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl shadow p-6">
                    <h2 className="text-lg font-semibold text-[#2C2C30] mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Winery Proximity</h2>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={analysis.proximityRanges} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D5" />
                        <XAxis type="number" stroke="#B8A99A" />
                        <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} stroke="#B8A99A" />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8B3A4D" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white rounded-2xl shadow p-6">
                    <h2 className="text-lg font-semibold text-[#2C2C30] mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Wine Package Breakdown</h2>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-[#FAF7F2] rounded-lg">
                        <span className="text-[#4A4A50]">On-site Winery Lodging</span>
                        <span className="text-xl font-bold text-[#6B2D3F]">{analysis.wineryLodgings}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-[#FAF7F2] rounded-lg">
                        <span className="text-[#4A4A50]">Offers Wine Packages</span>
                        <span className="text-xl font-bold text-[#6B2D3F]">{analysis.winePackagesCount}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-[#FAF7F2] rounded-lg">
                        <span className="text-[#4A4A50]">Within 15 min of Winery</span>
                        <span className="text-xl font-bold text-[#6B2D3F]">{analysis.nearbyWineryCount}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-[#FAF7F2] rounded-lg">
                        <span className="text-[#4A4A50]">No Winery Data</span>
                        <span className="text-xl font-bold text-[#B8A99A]">
                          {analysis.total - analysis.wineryLodgings - lodgings.filter(l => l.nearest_winery_minutes).length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Winery Lodgings List */}
                <div className="bg-white rounded-2xl shadow p-6">
                  <h2 className="text-lg font-semibold text-[#2C2C30] mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Winery Lodging Properties</h2>
                  {analysis.wineryLodgings === 0 ? (
                    <p className="text-[#B8A99A]">No winery lodging properties found</p>
                  ) : (
                    <div className="space-y-3">
                      {lodgings.filter(l => l.is_winery_lodging).map(lodging => (
                        <div key={lodging.id} className="flex justify-between items-center p-4 border border-[#E8E0D5] rounded-lg">
                          <div>
                            <p className="font-medium text-[#2C2C30]">{lodging.name}</p>
                            <p className="text-sm text-[#4A4A50]">{lodging.city} • {lodging.lodging_type}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {lodging.wine_packages_available && (
                              <span className="text-xs bg-[#C9A962] text-white px-2 py-1 rounded-full">Wine Packages</span>
                            )}
                            <span className="text-xs bg-[#6B2D3F] text-white px-2 py-1 rounded-full">Winery</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Data Gaps Tab */}
            {activeTab === 'gaps' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <MetricCard label="Avg Completeness" value={`${analysis.avgCompleteness}%`} />
                  <MetricCard label="Complete (80%+)" value={analysis.completenessRanges.find(r => r.name.includes('80'))?.value || 0} />
                  <MetricCard label="Needs Work (<60%)" value={
                    (analysis.completenessRanges.find(r => r.name.includes('40'))?.value || 0) +
                    (analysis.completenessRanges.find(r => r.name.includes('20'))?.value || 0) +
                    (analysis.completenessRanges.find(r => r.name.includes('0-19'))?.value || 0)
                  } />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl shadow p-6">
                    <h2 className="text-lg font-semibold text-[#2C2C30] mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Data Completeness Distribution</h2>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={analysis.completenessRanges}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D5" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#B8A99A" />
                        <YAxis stroke="#B8A99A" />
                        <Tooltip />
                        <Bar dataKey="value" fill="#2D4A3E" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white rounded-2xl shadow p-6">
                    <h2 className="text-lg font-semibold text-[#2C2C30] mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Missing Data Summary</h2>
                    <div className="space-y-3">
                      <GapRow label="Missing Phone" count={analysis.gaps.noPhone} total={analysis.total} />
                      <GapRow label="Missing Website" count={analysis.gaps.noWebsite} total={analysis.total} />
                      <GapRow label="Missing Description" count={analysis.gaps.noDescription} total={analysis.total} />
                      <GapRow label="Missing Pricing" count={analysis.gaps.noPricing} total={analysis.total} />
                      <GapRow label="Missing Booking URL" count={analysis.gaps.noBookingUrl} total={analysis.total} />
                      <GapRow label="Missing Coordinates" count={analysis.gaps.noCoordinates} total={analysis.total} />
                      <GapRow label="No Amenities" count={analysis.gaps.noAmenities} total={analysis.total} />
                      <GapRow label="No Vibe Tags" count={analysis.gaps.noVibeTags} total={analysis.total} />
                      <GapRow label="No Best For" count={analysis.gaps.noBestFor} total={analysis.total} />
                    </div>
                  </div>
                </div>

                {/* Incomplete Lodgings */}
                <div className="bg-white rounded-2xl shadow p-6">
                  <h2 className="text-lg font-semibold text-[#2C2C30] mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Lodgings Needing Attention (Under 60%)</h2>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {lodgings
                      .filter(l => !l.data_completeness_score || l.data_completeness_score < 60)
                      .sort((a, b) => (a.data_completeness_score || 0) - (b.data_completeness_score || 0))
                      .slice(0, 20)
                      .map(lodging => (
                        <div key={lodging.id} className="flex justify-between items-center p-3 border border-[#E8E0D5] rounded-lg hover:bg-[#FAF7F2]">
                          <div>
                            <p className="font-medium text-[#2C2C30]">{lodging.name}</p>
                            <p className="text-sm text-[#4A4A50]">{lodging.city} • {lodging.lodging_type || 'No type'}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-sm px-2 py-1 rounded ${
                              (lodging.data_completeness_score || 0) < 20 
                                ? 'bg-red-100 text-red-700'
                                : (lodging.data_completeness_score || 0) < 40
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {lodging.data_completeness_score || 0}%
                            </span>
                            <a 
                              href={`/lodging/review?id=${lodging.id}`}
                              className="text-sm text-[#6B2D3F] hover:text-[#8B3A4D] font-medium"
                            >
                              Edit →
                            </a>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
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

function GapRow({ label, count, total }) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0
  const isHigh = percentage > 50
  const isMedium = percentage > 25 && percentage <= 50
  
  return (
    <div className="flex items-center justify-between p-3 bg-[#FAF7F2] rounded-lg">
      <span className="text-[#4A4A50]">{label}</span>
      <div className="flex items-center gap-3">
        <div className="w-24 h-2 bg-[#E8E0D5] rounded-full overflow-hidden">
          <div 
            className={`h-full ${isHigh ? 'bg-red-500' : isMedium ? 'bg-yellow-500' : 'bg-green-500'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className={`text-sm font-medium ${isHigh ? 'text-red-600' : isMedium ? 'text-yellow-600' : 'text-green-600'}`}>
          {count} ({percentage}%)
        </span>
      </div>
    </div>
  )
}