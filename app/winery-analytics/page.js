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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts'

const WINE_COLORS = {
  primary: '#6B2D3F',
  secondary: '#8B3A4D',
  rose: '#C4637A',
  valley: '#2D4A3E',
  sage: '#5B7C6F',
  gold: '#C9A962',
  cream: '#FAF7F2',
  slate: '#4A4A50',
  charcoal: '#2C2C30',
}

const CHART_COLORS = [
  WINE_COLORS.primary,
  WINE_COLORS.valley,
  WINE_COLORS.gold,
  WINE_COLORS.rose,
  WINE_COLORS.sage,
  WINE_COLORS.secondary,
  '#E8E0D5',
  '#B8A99A',
]

export default function WineryAnalyticsPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [wineries, setWineries] = useState([])
  const [activeTab, setActiveTab] = useState('overview') // 'overview', 'quality', 'distribution', 'gaps'
  const [lastRefresh, setLastRefresh] = useState(null)

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
    const { data, error } = await supabase
      .from('wineries')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching wineries:', error)
    } else {
      setWineries(data || [])
    }
    setLastRefresh(new Date())
    setLoading(false)
  }

  useEffect(() => {
    if (authenticated) {
      fetchData()
    }
  }, [authenticated])

  // ============================================
  // DATA QUALITY CALCULATIONS
  // ============================================
  
  const criticalFields = ['name', 'address', 'city', 'latitude', 'longitude', 'phone', 'website']
  const importantFields = ['description', 'tagline', 'hours', 'wine_styles', 'vibe_tags', 'reservation_policy', 'tasting_fee_range']
  const niceToHaveFields = ['signature_wines', 'food_available', 'outdoor_seating', 'pet_friendly', 'best_for', 'instagram_handle']
  
  const calculateCompleteness = (winery) => {
    let score = 0
    let total = 0
    
    // Critical fields (weighted 3x)
    criticalFields.forEach(field => {
      total += 3
      if (winery[field] && (Array.isArray(winery[field]) ? winery[field].length > 0 : true)) {
        score += 3
      }
    })
    
    // Important fields (weighted 2x)
    importantFields.forEach(field => {
      total += 2
      if (winery[field] && (Array.isArray(winery[field]) ? winery[field].length > 0 : true)) {
        score += 2
      }
    })
    
    // Nice to have fields (weighted 1x)
    niceToHaveFields.forEach(field => {
      total += 1
      if (winery[field] && (Array.isArray(winery[field]) ? winery[field].length > 0 : true)) {
        score += 1
      }
    })
    
    return Math.round((score / total) * 100)
  }

  const dataQualityMetrics = useMemo(() => {
    if (wineries.length === 0) return null

    const completenessScores = wineries.map(w => ({
      ...w,
      completeness: calculateCompleteness(w)
    }))

    // Find wineries missing critical fields
    const missingCritical = wineries.filter(w => {
      return criticalFields.some(field => !w[field])
    })

    // Find wineries missing lat/long
    const missingLocation = wineries.filter(w => !w.latitude || !w.longitude)

    // Find wineries without wine styles
    const missingWineStyles = wineries.filter(w => !w.wine_styles || w.wine_styles.length === 0)

    // Find wineries without vibe tags
    const missingVibeTags = wineries.filter(w => !w.vibe_tags || w.vibe_tags.length === 0)

    // Find wineries without hours
    const missingHours = wineries.filter(w => !w.hours || Object.keys(w.hours).length === 0)

    // Stale data (not verified in 90+ days)
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
    const staleData = wineries.filter(w => {
      if (!w.last_verified_at) return true
      return new Date(w.last_verified_at) < ninetyDaysAgo
    })

    // Completeness distribution
    const completenessDistribution = [
      { range: '0-25%', count: completenessScores.filter(w => w.completeness <= 25).length },
      { range: '26-50%', count: completenessScores.filter(w => w.completeness > 25 && w.completeness <= 50).length },
      { range: '51-75%', count: completenessScores.filter(w => w.completeness > 50 && w.completeness <= 75).length },
      { range: '76-100%', count: completenessScores.filter(w => w.completeness > 75).length },
    ]

    const avgCompleteness = Math.round(
      completenessScores.reduce((sum, w) => sum + w.completeness, 0) / completenessScores.length
    )

    return {
      completenessScores,
      missingCritical,
      missingLocation,
      missingWineStyles,
      missingVibeTags,
      missingHours,
      staleData,
      completenessDistribution,
      avgCompleteness
    }
  }, [wineries])

  // ============================================
  // DISTRIBUTION CALCULATIONS
  // ============================================

  const distributions = useMemo(() => {
    if (wineries.length === 0) return null

    // Wine styles frequency
    const wineStyleCounts = {}
    wineries.forEach(w => {
      (w.wine_styles || []).forEach(style => {
        wineStyleCounts[style] = (wineStyleCounts[style] || 0) + 1
      })
    })
    const wineStylesData = Object.entries(wineStyleCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    // Vibe tags frequency
    const vibeTagCounts = {}
    wineries.forEach(w => {
      (w.vibe_tags || []).forEach(tag => {
        vibeTagCounts[tag] = (vibeTagCounts[tag] || 0) + 1
      })
    })
    const vibeTagsData = Object.entries(vibeTagCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    // Reservation policy breakdown
    const reservationCounts = {}
    wineries.forEach(w => {
      const policy = w.reservation_policy || 'Not specified'
      reservationCounts[policy] = (reservationCounts[policy] || 0) + 1
    })
    const reservationData = Object.entries(reservationCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    // City distribution
    const cityCounts = {}
    wineries.forEach(w => {
      const city = w.city || 'Unknown'
      cityCounts[city] = (cityCounts[city] || 0) + 1
    })
    const cityData = Object.entries(cityCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    // Best for distribution
    const bestForCounts = {}
    wineries.forEach(w => {
      (w.best_for || []).forEach(tag => {
        bestForCounts[tag] = (bestForCounts[tag] || 0) + 1
      })
    })
    const bestForData = Object.entries(bestForCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    // Food available breakdown
    const foodCounts = {}
    wineries.forEach(w => {
      const food = w.food_available || 'Not specified'
      foodCounts[food] = (foodCounts[food] || 0) + 1
    })
    const foodData = Object.entries(foodCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    // Amenities coverage
    const amenitiesData = [
      { name: 'Outdoor Seating', value: wineries.filter(w => w.outdoor_seating).length },
      { name: 'Pet Friendly', value: wineries.filter(w => w.pet_friendly).length },
      { name: 'Wheelchair Accessible', value: wineries.filter(w => w.wheelchair_accessible).length },
      { name: 'Tours Available', value: wineries.filter(w => w.tour_available).length },
      { name: 'Live Music', value: wineries.filter(w => w.live_music).length },
    ]

    // Data source breakdown
    const sourceCounts = {}
    wineries.forEach(w => {
      const source = w.data_source || 'Unknown'
      sourceCounts[source] = (sourceCounts[source] || 0) + 1
    })
    const sourceData = Object.entries(sourceCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    // Priority rank distribution
    const priorityBuckets = {
      'Top Tier (90+)': 0,
      'High (80-89)': 0,
      'Medium (70-79)': 0,
      'Standard (60-69)': 0,
      'Lower (<60)': 0,
      'Not Ranked': 0,
    }
    wineries.forEach(w => {
      const rank = w.priority_rank
      if (!rank) priorityBuckets['Not Ranked']++
      else if (rank >= 90) priorityBuckets['Top Tier (90+)']++
      else if (rank >= 80) priorityBuckets['High (80-89)']++
      else if (rank >= 70) priorityBuckets['Medium (70-79)']++
      else if (rank >= 60) priorityBuckets['Standard (60-69)']++
      else priorityBuckets['Lower (<60)']++
    })
    const priorityData = Object.entries(priorityBuckets)
      .map(([name, value]) => ({ name, value }))
      .filter(d => d.value > 0)

    return {
      wineStylesData,
      vibeTagsData,
      reservationData,
      cityData,
      bestForData,
      foodData,
      amenitiesData,
      sourceData,
      priorityData,
    }
  }, [wineries])

  // ============================================
  // GAP ANALYSIS
  // ============================================

  const gapAnalysis = useMemo(() => {
    if (wineries.length === 0 || !distributions) return null

    const activeWineries = wineries.filter(w => w.active)

    // Desired vibe coverage vs actual
    const desiredVibes = ['romantic', 'family-friendly', 'scenic-views', 'rustic', 'modern', 'intimate', 'upscale', 'casual']
    const vibeCoverage = desiredVibes.map(vibe => ({
      vibe,
      count: activeWineries.filter(w => (w.vibe_tags || []).includes(vibe)).length,
      percentage: Math.round((activeWineries.filter(w => (w.vibe_tags || []).includes(vibe)).length / Math.max(activeWineries.length, 1)) * 100)
    }))

    // Wine style gaps
    const desiredWineStyles = ['dry-reds', 'sweet-whites', 'dry-whites', 'rosé', 'sparkling', 'sweet-reds', 'dessert', 'fruit-wines']
    const wineStyleCoverage = desiredWineStyles.map(style => ({
      style,
      count: activeWineries.filter(w => (w.wine_styles || []).includes(style)).length,
      percentage: Math.round((activeWineries.filter(w => (w.wine_styles || []).includes(style)).length / Math.max(activeWineries.length, 1)) * 100)
    }))

    // Best-for scenario gaps
    const desiredScenarios = ['first-stop', 'lunch-spot', 'afternoon', 'grand-finale', 'hidden-gem', 'date-night', 'beginners', 'wine-nerds']
    const scenarioCoverage = desiredScenarios.map(scenario => ({
      scenario,
      count: activeWineries.filter(w => (w.best_for || []).includes(scenario)).length,
      percentage: Math.round((activeWineries.filter(w => (w.best_for || []).includes(scenario)).length / Math.max(activeWineries.length, 1)) * 100)
    }))

    // Reservation policy balance
    const walkInCount = activeWineries.filter(w => w.reservation_policy === 'walk-in').length
    const recommendedCount = activeWineries.filter(w => w.reservation_policy === 'recommended').length
    const requiredCount = activeWineries.filter(w => w.reservation_policy === 'required').length

    return {
      vibeCoverage,
      wineStyleCoverage,
      scenarioCoverage,
      reservationBalance: {
        walkIn: walkInCount,
        recommended: recommendedCount,
        required: requiredCount,
      }
    }
  }, [wineries, distributions])

  // ============================================
  // RENDER
  // ============================================

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full">
          <h1 className="text-2xl font-bold text-[#2C2C30] mb-2">Winery Analytics</h1>
          <p className="text-[#4A4A50] mb-6">Data quality & insights dashboard</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none mb-4"
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
        <div className="text-[#4A4A50]">Loading winery data...</div>
      </div>
    )
  }

  const activeCount = wineries.filter(w => w.active).length
  const pendingCount = wineries.filter(w => !w.active).length
  const verifiedCount = wineries.filter(w => w.owner_verified).length

  return (
    <div className="min-h-screen bg-[#FAF7F2] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#2C2C30]">Winery Analytics</h1>
            <p className="text-[#4A4A50]">Data quality, distribution, and gap analysis</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/winery/admin"
              className="px-4 py-2 bg-[#2D4A3E] hover:bg-[#5B7C6F] text-white text-sm font-medium rounded-lg transition-colors"
            >
              Review Pending
            </a>
            <a
              href="/dashboard"
              className="px-4 py-2 bg-[#2C2C30] hover:bg-[#4A4A50] text-white text-sm font-medium rounded-lg transition-colors"
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

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <MetricCard label="Total Wineries" value={wineries.length} />
          <MetricCard label="Active" value={activeCount} color="green" />
          <MetricCard label="Pending" value={pendingCount} color="amber" />
          <MetricCard label="Owner Verified" value={verifiedCount} color="blue" />
          <MetricCard 
            label="Avg Completeness" 
            value={`${dataQualityMetrics?.avgCompleteness || 0}%`} 
            color={dataQualityMetrics?.avgCompleteness >= 70 ? 'green' : dataQualityMetrics?.avgCompleteness >= 50 ? 'amber' : 'red'}
          />
          <MetricCard 
            label="Need Attention" 
            value={dataQualityMetrics?.staleData?.length || 0} 
            color="red"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['overview', 'quality', 'distribution', 'gaps'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-[#6B2D3F] text-white' 
                  : 'bg-white text-[#4A4A50] hover:bg-[#E8E0D5]'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Wine Styles Distribution */}
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-lg font-semibold text-[#2C2C30] mb-4">Wine Styles</h2>
                {distributions?.wineStylesData?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={distributions.wineStylesData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D5" />
                      <XAxis type="number" stroke="#B8A99A" />
                      <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} stroke="#B8A99A" />
                      <Tooltip />
                      <Bar dataKey="value" fill={WINE_COLORS.primary} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-[#B8A99A] text-sm">No wine style data yet</p>
                )}
              </div>

              {/* Vibe Tags Distribution */}
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-lg font-semibold text-[#2C2C30] mb-4">Vibe Tags</h2>
                {distributions?.vibeTagsData?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={distributions.vibeTagsData.slice(0, 8)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D5" />
                      <XAxis type="number" stroke="#B8A99A" />
                      <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} stroke="#B8A99A" />
                      <Tooltip />
                      <Bar dataKey="value" fill={WINE_COLORS.valley} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-[#B8A99A] text-sm">No vibe tag data yet</p>
                )}
              </div>

              {/* Reservation Policy */}
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-lg font-semibold text-[#2C2C30] mb-4">Reservation Policy</h2>
                {distributions?.reservationData?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={distributions.reservationData}
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={false}
                      >
                        {distributions.reservationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-[#B8A99A] text-sm">No reservation data yet</p>
                )}
              </div>

              {/* Geographic Distribution */}
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-lg font-semibold text-[#2C2C30] mb-4">By City/Area</h2>
                {distributions?.cityData?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={distributions.cityData.slice(0, 8)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D5" />
                      <XAxis type="number" stroke="#B8A99A" />
                      <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} stroke="#B8A99A" />
                      <Tooltip />
                      <Bar dataKey="value" fill={WINE_COLORS.gold} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-[#B8A99A] text-sm">No city data yet</p>
                )}
              </div>
            </div>

            {/* Data Quality Summary */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold text-[#2C2C30] mb-4">Data Quality Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QualityAlert 
                  label="Missing Location" 
                  count={dataQualityMetrics?.missingLocation?.length || 0}
                  severity={dataQualityMetrics?.missingLocation?.length > 0 ? 'error' : 'success'}
                />
                <QualityAlert 
                  label="Missing Wine Styles" 
                  count={dataQualityMetrics?.missingWineStyles?.length || 0}
                  severity={dataQualityMetrics?.missingWineStyles?.length > 3 ? 'error' : dataQualityMetrics?.missingWineStyles?.length > 0 ? 'warning' : 'success'}
                />
                <QualityAlert 
                  label="Missing Hours" 
                  count={dataQualityMetrics?.missingHours?.length || 0}
                  severity={dataQualityMetrics?.missingHours?.length > 3 ? 'error' : dataQualityMetrics?.missingHours?.length > 0 ? 'warning' : 'success'}
                />
                <QualityAlert 
                  label="Stale Data (90+ days)" 
                  count={dataQualityMetrics?.staleData?.length || 0}
                  severity={dataQualityMetrics?.staleData?.length > 5 ? 'error' : dataQualityMetrics?.staleData?.length > 0 ? 'warning' : 'success'}
                />
              </div>
            </div>
          </div>
        )}

        {/* Quality Tab */}
        {activeTab === 'quality' && (
          <div className="space-y-6">
            {/* Completeness Distribution */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold text-[#2C2C30] mb-4">Completeness Distribution</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dataQualityMetrics?.completenessDistribution || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D5" />
                  <XAxis dataKey="range" stroke="#B8A99A" />
                  <YAxis stroke="#B8A99A" />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {(dataQualityMetrics?.completenessDistribution || []).map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === 3 ? '#16a34a' : index === 2 ? WINE_COLORS.gold : index === 1 ? '#f59e0b' : '#dc2626'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Winery Completeness List */}
            <div className="bg-white rounded-2xl shadow overflow-hidden">
              <div className="p-6 border-b border-[#E8E0D5]">
                <h2 className="text-lg font-semibold text-[#2C2C30]">Winery Completeness Scores</h2>
                <p className="text-sm text-[#4A4A50]">Sorted by completeness (lowest first)</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#FAF7F2]">
                    <tr>
                      <th className="text-left p-4 font-medium text-[#4A4A50]">Winery</th>
                      <th className="text-left p-4 font-medium text-[#4A4A50]">City</th>
                      <th className="text-center p-4 font-medium text-[#4A4A50]">Completeness</th>
                      <th className="text-center p-4 font-medium text-[#4A4A50]">Status</th>
                      <th className="text-left p-4 font-medium text-[#4A4A50]">Missing Critical</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataQualityMetrics?.completenessScores
                      ?.sort((a, b) => a.completeness - b.completeness)
                      .map((winery) => {
                        const missingCrit = criticalFields.filter(f => !winery[f])
                        return (
                          <tr key={winery.id} className="border-t border-[#E8E0D5]">
                            <td className="p-4 font-medium text-[#2C2C30]">{winery.name}</td>
                            <td className="p-4 text-[#4A4A50]">{winery.city}</td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-20 h-2 bg-[#E8E0D5] rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${
                                      winery.completeness >= 75 ? 'bg-green-500' :
                                      winery.completeness >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${winery.completeness}%` }}
                                  />
                                </div>
                                <span className="text-sm text-[#4A4A50]">{winery.completeness}%</span>
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`px-2 py-1 rounded text-xs ${
                                winery.active ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {winery.active ? 'Active' : 'Pending'}
                              </span>
                            </td>
                            <td className="p-4">
                              {missingCrit.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {missingCrit.map(field => (
                                    <span key={field} className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                                      {field}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-green-600">✓ All critical fields</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Distribution Tab */}
        {activeTab === 'distribution' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Amenities Coverage */}
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-lg font-semibold text-[#2C2C30] mb-4">Amenities Coverage</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={distributions?.amenitiesData || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D5" />
                    <XAxis type="number" stroke="#B8A99A" />
                    <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} stroke="#B8A99A" />
                    <Tooltip />
                    <Bar dataKey="value" fill={WINE_COLORS.sage} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Data Source */}
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-lg font-semibold text-[#2C2C30] mb-4">Data Source</h2>
                {distributions?.sourceData?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={distributions.sourceData}
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={false}
                      >
                        {distributions.sourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-[#B8A99A] text-sm">No source data yet</p>
                )}
              </div>

              {/* Best For Distribution */}
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-lg font-semibold text-[#2C2C30] mb-4">Best For (Trip Planning Tags)</h2>
                {distributions?.bestForData?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={distributions.bestForData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D5" />
                      <XAxis type="number" stroke="#B8A99A" />
                      <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} stroke="#B8A99A" />
                      <Tooltip />
                      <Bar dataKey="value" fill={WINE_COLORS.rose} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-[#B8A99A] text-sm">No best-for tags yet</p>
                )}
              </div>

              {/* Priority Ranking */}
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-lg font-semibold text-[#2C2C30] mb-4">Priority Ranking Distribution</h2>
                {distributions?.priorityData?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={distributions.priorityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D5" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#B8A99A" />
                      <YAxis stroke="#B8A99A" />
                      <Tooltip />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {distributions.priorityData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={
                              entry.name.includes('Top') ? '#16a34a' :
                              entry.name.includes('High') ? WINE_COLORS.gold :
                              entry.name.includes('Medium') ? '#f59e0b' :
                              WINE_COLORS.secondary
                            } 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-[#B8A99A] text-sm">No priority data yet</p>
                )}
              </div>

              {/* Food Options */}
              <div className="bg-white rounded-2xl shadow p-6 md:col-span-2">
                <h2 className="text-lg font-semibold text-[#2C2C30] mb-4">Food Availability</h2>
                {distributions?.foodData?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={distributions.foodData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D5" />
                      <XAxis type="number" stroke="#B8A99A" />
                      <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} stroke="#B8A99A" />
                      <Tooltip />
                      <Bar dataKey="value" fill={WINE_COLORS.gold} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-[#B8A99A] text-sm">No food data yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Gaps Tab */}
        {activeTab === 'gaps' && (
          <div className="space-y-6">
            {/* Vibe Coverage */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold text-[#2C2C30] mb-2">Vibe Tag Coverage</h2>
              <p className="text-sm text-[#4A4A50] mb-4">Do we have enough variety for different customer preferences?</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {gapAnalysis?.vibeCoverage?.map(({ vibe, count, percentage }) => (
                  <div key={vibe} className="p-4 bg-[#FAF7F2] rounded-lg">
                    <div className="text-sm font-medium text-[#2C2C30] capitalize mb-1">
                      {vibe.replace('-', ' ')}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-[#6B2D3F]">{count}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        percentage >= 30 ? 'bg-green-100 text-green-700' :
                        percentage >= 15 ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {percentage}%
                      </span>
                    </div>
                    {percentage < 15 && (
                      <p className="text-xs text-red-600 mt-1">⚠️ Low coverage</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Wine Style Coverage */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold text-[#2C2C30] mb-2">Wine Style Coverage</h2>
              <p className="text-sm text-[#4A4A50] mb-4">Can we recommend wineries for all wine preferences?</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {gapAnalysis?.wineStyleCoverage?.map(({ style, count, percentage }) => (
                  <div key={style} className="p-4 bg-[#FAF7F2] rounded-lg">
                    <div className="text-sm font-medium text-[#2C2C30] capitalize mb-1">
                      {style.replace('-', ' ')}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-[#2D4A3E]">{count}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        percentage >= 30 ? 'bg-green-100 text-green-700' :
                        percentage >= 15 ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {percentage}%
                      </span>
                    </div>
                    {percentage < 10 && (
                      <p className="text-xs text-red-600 mt-1">⚠️ Gap</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Scenario Coverage */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold text-[#2C2C30] mb-2">Trip Scenario Coverage</h2>
              <p className="text-sm text-[#4A4A50] mb-4">Can we build complete itineraries for different occasions?</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {gapAnalysis?.scenarioCoverage?.map(({ scenario, count, percentage }) => (
                  <div key={scenario} className="p-4 bg-[#FAF7F2] rounded-lg">
                    <div className="text-sm font-medium text-[#2C2C30] capitalize mb-1">
                      {scenario.replace('-', ' ')}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-[#C9A962]">{count}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        percentage >= 20 ? 'bg-green-100 text-green-700' :
                        percentage >= 10 ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {percentage}%
                      </span>
                    </div>
                    {count === 0 && (
                      <p className="text-xs text-red-600 mt-1">⚠️ No wineries tagged</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Reservation Balance */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold text-[#2C2C30] mb-2">Reservation Policy Balance</h2>
              <p className="text-sm text-[#4A4A50] mb-4">Do we have options for spontaneous vs planned trips?</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <div className="text-3xl font-bold text-green-700">{gapAnalysis?.reservationBalance?.walkIn || 0}</div>
                  <div className="text-sm text-green-600">Walk-in Friendly</div>
                  <div className="text-xs text-green-500 mt-1">Great for spontaneous trips</div>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg text-center">
                  <div className="text-3xl font-bold text-amber-700">{gapAnalysis?.reservationBalance?.recommended || 0}</div>
                  <div className="text-sm text-amber-600">Recommended</div>
                  <div className="text-xs text-amber-500 mt-1">Book ahead for weekends</div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg text-center">
                  <div className="text-3xl font-bold text-red-700">{gapAnalysis?.reservationBalance?.required || 0}</div>
                  <div className="text-sm text-red-600">Required</div>
                  <div className="text-xs text-red-500 mt-1">Must book in advance</div>
                </div>
              </div>
            </div>

            {/* Actionable Insights */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold text-[#2C2C30] mb-4">🎯 Actionable Insights</h2>
              <div className="space-y-3">
                {gapAnalysis?.vibeCoverage?.filter(v => v.percentage < 15).length > 0 && (
                  <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                    <p className="font-medium text-amber-800">Low Vibe Coverage</p>
                    <p className="text-sm text-amber-700">
                      Consider adding more wineries tagged as: {' '}
                      {gapAnalysis.vibeCoverage.filter(v => v.percentage < 15).map(v => v.vibe.replace('-', ' ')).join(', ')}
                    </p>
                  </div>
                )}
                {gapAnalysis?.scenarioCoverage?.filter(s => s.count === 0).length > 0 && (
                  <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                    <p className="font-medium text-red-800">Missing Scenario Tags</p>
                    <p className="text-sm text-red-700">
                      No wineries are tagged for: {' '}
                      {gapAnalysis.scenarioCoverage.filter(s => s.count === 0).map(s => s.scenario.replace('-', ' ')).join(', ')}
                    </p>
                  </div>
                )}
                {(gapAnalysis?.reservationBalance?.walkIn || 0) < 3 && (
                  <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <p className="font-medium text-blue-800">Limited Walk-in Options</p>
                    <p className="text-sm text-blue-700">
                      Only {gapAnalysis?.reservationBalance?.walkIn || 0} wineries are walk-in friendly. Consider adding more for spontaneous trip planners.
                    </p>
                  </div>
                )}
                {dataQualityMetrics?.avgCompleteness < 70 && (
                  <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                    <p className="font-medium text-purple-800">Data Completeness Opportunity</p>
                    <p className="text-sm text-purple-700">
                      Average completeness is {dataQualityMetrics?.avgCompleteness}%. Focus on filling in missing fields to improve AI recommendations.
                    </p>
                  </div>
                )}
                {(!gapAnalysis?.vibeCoverage?.filter(v => v.percentage < 15).length && 
                  !gapAnalysis?.scenarioCoverage?.filter(s => s.count === 0).length &&
                  (gapAnalysis?.reservationBalance?.walkIn || 0) >= 3 &&
                  dataQualityMetrics?.avgCompleteness >= 70) && (
                  <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <p className="font-medium text-green-800">Looking Good! 🎉</p>
                    <p className="text-sm text-green-700">
                      Your winery database has good coverage and quality. Keep adding verified data to improve recommendations.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-sm text-[#B8A99A] mt-8">
          ValleySomm Winery Analytics • Data-driven wine trip planning
        </p>
      </div>
    </div>
  )
}

function MetricCard({ label, value, color = 'default' }) {
  const colorClasses = {
    default: 'text-[#2C2C30]',
    green: 'text-green-600',
    amber: 'text-amber-600',
    red: 'text-red-600',
    blue: 'text-blue-600',
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <p className="text-sm text-[#4A4A50] mb-1">{label}</p>
      <p className={`text-3xl font-bold ${colorClasses[color]}`}>{value}</p>
    </div>
  )
}

function QualityAlert({ label, count, severity }) {
  const severityClasses = {
    success: 'bg-green-50 border-green-200 text-green-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
    error: 'bg-red-50 border-red-200 text-red-700',
  }

  const icons = {
    success: '✓',
    warning: '⚠',
    error: '✗',
  }

  return (
    <div className={`p-4 rounded-lg border ${severityClasses[severity]}`}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{icons[severity]}</span>
        <div>
          <div className="font-medium">{label}</div>
          <div className="text-2xl font-bold">{count}</div>
        </div>
      </div>
    </div>
  )
}