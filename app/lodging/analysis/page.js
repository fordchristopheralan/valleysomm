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

export default function AnalysisPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [responses, setResponses] = useState([])
  const [features, setFeatures] = useState([])
  const [activeTab, setActiveTab] = useState('matrix')
  
  // New feature form
  const [newFeature, setNewFeature] = useState({
    name: '',
    description: '',
    pain_point: '',
    impact: 5,
    confidence: 5,
    ease: 5,
  })
  const [editingFeature, setEditingFeature] = useState(null)

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
    
    const { data: responseData } = await supabase
      .from('survey_responses')
      .select('*')
      .order('submitted_at', { ascending: false })

    setResponses(responseData || [])

    const { data: featureData, error: featureError } = await supabase
      .from('feature_concepts')
      .select('*')
      .order('ice_score', { ascending: false })

    if (!featureError) {
      setFeatures(featureData || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    if (authenticated) {
      fetchData()
    }
  }, [authenticated])

  // Calculate pain point matrix data
  const painPointMatrix = useMemo(() => {
    const reviewed = responses.filter((r) => r.reviewed)
    if (reviewed.length === 0) return []

    const themeCounts = {}
    const themeIntensity = {}
    const themeWTP = {}

    reviewed.forEach((r) => {
      const allThemes = [
        ...(r.hardest_part_themes || []),
        ...(r.easier_themes || []),
        ...(r.surprise_themes || []),
      ]
      
      const uniqueThemes = [...new Set(allThemes)]
      uniqueThemes.forEach((theme) => {
        themeCounts[theme] = (themeCounts[theme] || 0) + 1
        
        if (r.intensity_score) {
          if (!themeIntensity[theme]) themeIntensity[theme] = []
          themeIntensity[theme].push(r.intensity_score)
        }
        
        const wouldPay = r.pay === 'Yes — take my money' || r.pay === 'Maybe, depending on cost'
        if (!themeWTP[theme]) themeWTP[theme] = { yes: 0, total: 0 }
        themeWTP[theme].total++
        if (wouldPay) themeWTP[theme].yes++
      })
    })

    return Object.keys(themeCounts).map((theme) => {
      const frequency = (themeCounts[theme] / reviewed.length) * 100
      const avgIntensity = themeIntensity[theme]?.length > 0
        ? themeIntensity[theme].reduce((a, b) => a + b, 0) / themeIntensity[theme].length
        : 0
      const wtpRate = themeWTP[theme]?.total > 0
        ? (themeWTP[theme].yes / themeWTP[theme].total) * 100
        : 0

      return {
        name: theme,
        frequency: Math.round(frequency),
        intensity: avgIntensity.toFixed(1),
        wtp: Math.round(wtpRate),
        count: themeCounts[theme],
      }
    }).sort((a, b) => b.frequency - a.frequency)
  }, [responses])

  // Segment analysis data
  const segmentAnalysis = useMemo(() => {
    const reviewed = responses.filter((r) => r.reviewed)
    if (reviewed.length === 0) return {}

    const segments = {
      byGroupType: {},
      byConfidence: { low: [], high: [] },
      byWTP: { yes: [], no: [] },
      bySource: {},
    }

    reviewed.forEach((r) => {
      const groupType = r.group_type || 'Unknown'
      if (!segments.byGroupType[groupType]) segments.byGroupType[groupType] = []
      segments.byGroupType[groupType].push(r)

      if (r.confidence <= 2) segments.byConfidence.low.push(r)
      else if (r.confidence >= 4) segments.byConfidence.high.push(r)

      const wouldPay = r.pay === 'Yes — take my money' || r.pay === 'Maybe, depending on cost'
      if (wouldPay) segments.byWTP.yes.push(r)
      else segments.byWTP.no.push(r)

      const source = r.source || 'Unknown'
      if (!segments.bySource[source]) segments.bySource[source] = []
      segments.bySource[source].push(r)
    })

    const getTopThemes = (responses) => {
      const counts = {}
      responses.forEach((r) => {
        const themes = [...(r.hardest_part_themes || []), ...(r.easier_themes || [])]
        themes.forEach((t) => {
          counts[t] = (counts[t] || 0) + 1
        })
      })
      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, count]) => ({ name, count, pct: Math.round((count / responses.length) * 100) }))
    }

    return {
      byGroupType: Object.entries(segments.byGroupType).map(([name, responses]) => ({
        name,
        count: responses.length,
        topThemes: getTopThemes(responses),
      })),
      byConfidence: {
        low: { count: segments.byConfidence.low.length, topThemes: getTopThemes(segments.byConfidence.low) },
        high: { count: segments.byConfidence.high.length, topThemes: getTopThemes(segments.byConfidence.high) },
      },
      byWTP: {
        yes: { count: segments.byWTP.yes.length, topThemes: getTopThemes(segments.byWTP.yes) },
        no: { count: segments.byWTP.no.length, topThemes: getTopThemes(segments.byWTP.no) },
      },
      bySource: Object.entries(segments.bySource).map(([name, responses]) => ({
        name,
        count: responses.length,
        topThemes: getTopThemes(responses),
      })),
    }
  }, [responses])

  const saveFeature = async () => {
    const iceScore = newFeature.impact * newFeature.confidence * newFeature.ease

    if (editingFeature) {
      const { error } = await supabase
        .from('feature_concepts')
        .update({
          name: newFeature.name,
          description: newFeature.description,
          pain_point: newFeature.pain_point,
          impact: newFeature.impact,
          confidence: newFeature.confidence,
          ease: newFeature.ease,
          ice_score: iceScore,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingFeature.id)

      if (!error) {
        setFeatures(features.map((f) => 
          f.id === editingFeature.id 
            ? { ...f, ...newFeature, ice_score: iceScore }
            : f
        ))
        setEditingFeature(null)
        resetFeatureForm()
      }
    } else {
      const { data, error } = await supabase
        .from('feature_concepts')
        .insert([{
          name: newFeature.name,
          description: newFeature.description,
          pain_point: newFeature.pain_point,
          impact: newFeature.impact,
          confidence: newFeature.confidence,
          ease: newFeature.ease,
          ice_score: iceScore,
        }])
        .select()

      if (!error && data) {
        setFeatures([...features, data[0]].sort((a, b) => b.ice_score - a.ice_score))
        resetFeatureForm()
      }
    }
  }

  const deleteFeature = async (id) => {
    const { error } = await supabase
      .from('feature_concepts')
      .delete()
      .eq('id', id)

    if (!error) {
      setFeatures(features.filter((f) => f.id !== id))
    }
  }

  const editFeature = (feature) => {
    setEditingFeature(feature)
    setNewFeature({
      name: feature.name,
      description: feature.description || '',
      pain_point: feature.pain_point || '',
      impact: feature.impact,
      confidence: feature.confidence,
      ease: feature.ease,
    })
  }

  const resetFeatureForm = () => {
    setNewFeature({
      name: '',
      description: '',
      pain_point: '',
      impact: 5,
      confidence: 5,
      ease: 5,
    })
    setEditingFeature(null)
  }

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
            <p style={{ color: BRAND_COLORS.slate }}>Feature Analysis</p>
          </div>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-3 rounded-lg border outline-none mb-4"
              style={{ borderColor: BRAND_COLORS.warmBeige, backgroundColor: 'white' }}
            />
            {error && <p className="text-sm mb-4" style={{ color: BRAND_COLORS.wineRose }}>{error}</p>}
            <button
              type="submit"
              className="w-full py-3 text-white font-medium rounded-lg transition-all hover:opacity-90"
              style={{ backgroundColor: BRAND_COLORS.wineDeep }}
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BRAND_COLORS.cream }}>
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <svg width="48" height="48" viewBox="0 0 80 80" fill="none" className="mx-auto">
              <path d="M40 16C40 16 24 32 24 48C24 56.837 31.163 64 40 64C48.837 64 56 56.837 56 48C56 32 40 16 40 16Z" stroke={BRAND_COLORS.wineDeep} strokeWidth="2.5" fill="none"/>
              <path d="M32 50C32 50 36 44 40 44C44 44 48 50 48 50" stroke={BRAND_COLORS.goldAccent} strokeWidth="2" fill="none" strokeLinecap="round"/>
            </svg>
          </div>
          <p style={{ color: BRAND_COLORS.slate }}>Loading analysis data...</p>
        </div>
      </div>
    )
  }

  const reviewedCount = responses.filter((r) => r.reviewed).length

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: BRAND_COLORS.cream }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-medium mb-1" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: BRAND_COLORS.charcoal }}>
              <span style={{ color: BRAND_COLORS.wineDeep }}>Valley</span>
              <span style={{ color: BRAND_COLORS.valleyDeep }}>Somm</span>
              {' '}Analysis
            </h1>
            <p style={{ color: BRAND_COLORS.slate }}>Pain point matrix & ICE prioritization</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm" style={{ color: BRAND_COLORS.slate }}>
              {reviewedCount} responses reviewed
            </span>
            <a
              href="/review"
              className="px-4 py-2 text-white text-sm font-medium rounded-lg transition-all hover:opacity-90"
              style={{ backgroundColor: BRAND_COLORS.valleyDeep }}
            >
              Review Responses
            </a>
            <a
              href="/dashboard"
              className="px-4 py-2 text-white text-sm font-medium rounded-lg transition-all hover:opacity-90"
              style={{ backgroundColor: BRAND_COLORS.wineDeep }}
            >
              Dashboard
            </a>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['matrix', 'segments', 'features'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: activeTab === tab ? BRAND_COLORS.wineDeep : 'white',
                color: activeTab === tab ? 'white' : BRAND_COLORS.slate,
                border: activeTab === tab ? 'none' : `1px solid ${BRAND_COLORS.warmBeige}`,
              }}
            >
              {tab === 'matrix' && 'Pain Point Matrix'}
              {tab === 'segments' && 'Segment Analysis'}
              {tab === 'features' && 'Feature Concepts (ICE)'}
            </button>
          ))}
        </div>

        {/* Pain Point Matrix Tab */}
        {activeTab === 'matrix' && (
          <div className="space-y-6">
            {reviewedCount === 0 ? (
              <div className="rounded-2xl shadow p-8 text-center" style={{ backgroundColor: 'white', border: `1px solid ${BRAND_COLORS.warmBeige}` }}>
                <p className="mb-4" style={{ color: BRAND_COLORS.slate }}>No reviewed responses yet.</p>
                <a href="/review" className="font-medium hover:opacity-80" style={{ color: BRAND_COLORS.wineDeep }}>
                  Start reviewing responses →
                </a>
              </div>
            ) : (
              <>
                {/* Matrix Table */}
                <div className="rounded-2xl shadow overflow-hidden" style={{ backgroundColor: 'white', border: `1px solid ${BRAND_COLORS.warmBeige}` }}>
                  <div className="p-6" style={{ borderBottom: `1px solid ${BRAND_COLORS.warmBeige}` }}>
                    <h2 className="text-lg font-semibold" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: BRAND_COLORS.charcoal }}>Pain Point Scoring Matrix</h2>
                    <p className="text-sm" style={{ color: BRAND_COLORS.slate }}>Based on {reviewedCount} reviewed responses</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead style={{ backgroundColor: BRAND_COLORS.cream }}>
                        <tr>
                          <th className="text-left p-4 font-medium" style={{ color: BRAND_COLORS.slate }}>Pain Point</th>
                          <th className="text-center p-4 font-medium" style={{ color: BRAND_COLORS.slate }}>Frequency</th>
                          <th className="text-center p-4 font-medium" style={{ color: BRAND_COLORS.slate }}>Avg Intensity</th>
                          <th className="text-center p-4 font-medium" style={{ color: BRAND_COLORS.slate }}>WTP Rate</th>
                          <th className="text-center p-4 font-medium" style={{ color: BRAND_COLORS.slate }}>Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {painPointMatrix.map((row, i) => (
                          <tr key={row.name} style={{ borderTop: `1px solid ${BRAND_COLORS.warmBeige}` }}>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full text-xs flex items-center justify-center font-medium text-white" style={{ backgroundColor: BRAND_COLORS.wineDeep }}>
                                  {i + 1}
                                </span>
                                <span className="font-medium" style={{ color: BRAND_COLORS.charcoal }}>{row.name}</span>
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <div className="inline-flex items-center gap-2">
                                <div className="w-24 h-2 rounded-full overflow-hidden" style={{ backgroundColor: BRAND_COLORS.warmBeige }}>
                                  <div 
                                    className="h-full" 
                                    style={{ width: `${row.frequency}%`, backgroundColor: BRAND_COLORS.wineDeep }}
                                  />
                                </div>
                                <span className="text-sm" style={{ color: BRAND_COLORS.slate }}>{row.frequency}%</span>
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <span className="px-2 py-1 rounded text-sm" style={{
                                backgroundColor: row.intensity >= 4 ? BRAND_COLORS.wineRose + '30' : row.intensity >= 3 ? BRAND_COLORS.goldAccent + '30' : BRAND_COLORS.warmBeige,
                                color: row.intensity >= 4 ? BRAND_COLORS.wineDeep : row.intensity >= 3 ? BRAND_COLORS.charcoal : BRAND_COLORS.slate
                              }}>
                                {row.intensity}/5
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <span className="px-2 py-1 rounded text-sm" style={{
                                backgroundColor: row.wtp >= 60 ? BRAND_COLORS.valleySage + '30' : row.wtp >= 40 ? BRAND_COLORS.goldAccent + '30' : BRAND_COLORS.warmBeige,
                                color: row.wtp >= 60 ? BRAND_COLORS.valleyDeep : row.wtp >= 40 ? BRAND_COLORS.charcoal : BRAND_COLORS.slate
                              }}>
                                {row.wtp}%
                              </span>
                            </td>
                            <td className="p-4 text-center" style={{ color: BRAND_COLORS.slate }}>{row.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Frequency Chart */}
                <div className="rounded-2xl shadow p-6" style={{ backgroundColor: 'white', border: `1px solid ${BRAND_COLORS.warmBeige}` }}>
                  <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: BRAND_COLORS.charcoal }}>Pain Point Frequency</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={painPointMatrix} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke={BRAND_COLORS.warmBeige} />
                      <XAxis type="number" domain={[0, 100]} stroke={BRAND_COLORS.slate} />
                      <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12, fill: BRAND_COLORS.slate }} stroke={BRAND_COLORS.slate} />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Bar dataKey="frequency" fill={BRAND_COLORS.wineDeep} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        )}

        {/* Segment Analysis Tab */}
        {activeTab === 'segments' && (
          <div className="space-y-6">
            {reviewedCount === 0 ? (
              <div className="rounded-2xl shadow p-8 text-center" style={{ backgroundColor: 'white', border: `1px solid ${BRAND_COLORS.warmBeige}` }}>
                <p className="mb-4" style={{ color: BRAND_COLORS.slate }}>No reviewed responses yet.</p>
                <a href="/review" className="font-medium hover:opacity-80" style={{ color: BRAND_COLORS.wineDeep }}>
                  Start reviewing responses →
                </a>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {/* By Group Type */}
                <SegmentCard 
                  title="By Group Type" 
                  segments={segmentAnalysis.byGroupType} 
                  colors={BRAND_COLORS}
                  themeColor={BRAND_COLORS.wineDeep}
                />

                {/* By Confidence */}
                <div className="rounded-2xl shadow p-6" style={{ backgroundColor: 'white', border: `1px solid ${BRAND_COLORS.warmBeige}` }}>
                  <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: BRAND_COLORS.charcoal }}>By Confidence Level</h2>
                  <div className="space-y-4">
                    <div className="pb-4" style={{ borderBottom: `1px solid ${BRAND_COLORS.warmBeige}` }}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium" style={{ color: BRAND_COLORS.charcoal }}>Low Confidence (1-2)</span>
                        <span className="text-sm" style={{ color: BRAND_COLORS.slate }}>{segmentAnalysis.byConfidence?.low?.count || 0} responses</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {segmentAnalysis.byConfidence?.low?.topThemes?.map((t) => (
                          <span key={t.name} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: BRAND_COLORS.wineRose + '30', color: BRAND_COLORS.wineDeep }}>
                            {t.name} ({t.pct}%)
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium" style={{ color: BRAND_COLORS.charcoal }}>High Confidence (4-5)</span>
                        <span className="text-sm" style={{ color: BRAND_COLORS.slate }}>{segmentAnalysis.byConfidence?.high?.count || 0} responses</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {segmentAnalysis.byConfidence?.high?.topThemes?.map((t) => (
                          <span key={t.name} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: BRAND_COLORS.valleySage + '30', color: BRAND_COLORS.valleyDeep }}>
                            {t.name} ({t.pct}%)
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* By WTP */}
                <div className="rounded-2xl shadow p-6" style={{ backgroundColor: 'white', border: `1px solid ${BRAND_COLORS.warmBeige}` }}>
                  <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: BRAND_COLORS.charcoal }}>By Willingness to Pay</h2>
                  <div className="space-y-4">
                    <div className="pb-4" style={{ borderBottom: `1px solid ${BRAND_COLORS.warmBeige}` }}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium" style={{ color: BRAND_COLORS.charcoal }}>Would Pay</span>
                        <span className="text-sm" style={{ color: BRAND_COLORS.slate }}>{segmentAnalysis.byWTP?.yes?.count || 0} responses</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {segmentAnalysis.byWTP?.yes?.topThemes?.map((t) => (
                          <span key={t.name} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: BRAND_COLORS.valleySage + '30', color: BRAND_COLORS.valleyDeep }}>
                            {t.name} ({t.pct}%)
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium" style={{ color: BRAND_COLORS.charcoal }}>{"Wouldn't Pay"}</span>
                        <span className="text-sm" style={{ color: BRAND_COLORS.slate }}>{segmentAnalysis.byWTP?.no?.count || 0} responses</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {segmentAnalysis.byWTP?.no?.topThemes?.map((t) => (
                          <span key={t.name} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: BRAND_COLORS.warmBeige, color: BRAND_COLORS.slate }}>
                            {t.name} ({t.pct}%)
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* By Source */}
                <SegmentCard 
                  title="By Source" 
                  segments={segmentAnalysis.bySource} 
                  colors={BRAND_COLORS}
                  themeColor={BRAND_COLORS.goldAccent}
                />
              </div>
            )}
          </div>
        )}

        {/* Feature Concepts Tab */}
        {activeTab === 'features' && (
          <div className="space-y-6">
            {/* Add/Edit Feature Form */}
            <div className="rounded-2xl shadow p-6" style={{ backgroundColor: 'white', border: `1px solid ${BRAND_COLORS.warmBeige}` }}>
              <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: BRAND_COLORS.charcoal }}>
                {editingFeature ? 'Edit Feature Concept' : 'Add Feature Concept'}
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: BRAND_COLORS.slate }}>Feature Name</label>
                    <input
                      type="text"
                      value={newFeature.name}
                      onChange={(e) => setNewFeature({ ...newFeature, name: e.target.value })}
                      placeholder="e.g., Wine Personality Quiz"
                      className="w-full p-3 rounded-lg border outline-none"
                      style={{ borderColor: BRAND_COLORS.warmBeige }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: BRAND_COLORS.slate }}>Description</label>
                    <textarea
                      value={newFeature.description}
                      onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                      placeholder="What does this feature do?"
                      className="w-full p-3 rounded-lg border outline-none h-24 resize-none"
                      style={{ borderColor: BRAND_COLORS.warmBeige }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: BRAND_COLORS.slate }}>Pain Point Addressed</label>
                    <select
                      value={newFeature.pain_point}
                      onChange={(e) => setNewFeature({ ...newFeature, pain_point: e.target.value })}
                      className="w-full p-3 rounded-lg border outline-none"
                      style={{ borderColor: BRAND_COLORS.warmBeige }}
                    >
                      <option value="">Select pain point...</option>
                      {painPointMatrix.map((p) => (
                        <option key={p.name} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <SliderInput 
                    label="Impact (1-10): How much does this reduce the pain?"
                    value={newFeature.impact}
                    onChange={(v) => setNewFeature({ ...newFeature, impact: v })}
                    lowLabel="Minimal"
                    highLabel="Game-changing"
                    colors={BRAND_COLORS}
                  />
                  <SliderInput 
                    label="Confidence (1-10): How sure are you this solves it?"
                    value={newFeature.confidence}
                    onChange={(v) => setNewFeature({ ...newFeature, confidence: v })}
                    lowLabel="Guessing"
                    highLabel="Validated"
                    colors={BRAND_COLORS}
                  />
                  <SliderInput 
                    label="Ease (1-10): How fast can you build an MVP?"
                    value={newFeature.ease}
                    onChange={(v) => setNewFeature({ ...newFeature, ease: v })}
                    lowLabel="Months"
                    highLabel="Weekend"
                    colors={BRAND_COLORS}
                  />

                  <div className="pt-4">
                    <div className="text-center p-4 rounded-lg" style={{ backgroundColor: BRAND_COLORS.cream }}>
                      <span className="text-sm" style={{ color: BRAND_COLORS.slate }}>ICE Score: </span>
                      <span className="text-2xl font-bold" style={{ color: BRAND_COLORS.wineDeep }}>
                        {newFeature.impact * newFeature.confidence * newFeature.ease}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                {editingFeature && (
                  <button
                    onClick={resetFeatureForm}
                    className="px-4 py-2 hover:opacity-80"
                    style={{ color: BRAND_COLORS.slate }}
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={saveFeature}
                  disabled={!newFeature.name}
                  className="px-6 py-2 text-white font-medium rounded-lg transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: BRAND_COLORS.wineDeep }}
                >
                  {editingFeature ? 'Update Feature' : 'Add Feature'}
                </button>
              </div>
            </div>

            {/* Feature List */}
            <div className="rounded-2xl shadow overflow-hidden" style={{ backgroundColor: 'white', border: `1px solid ${BRAND_COLORS.warmBeige}` }}>
              <div className="p-6" style={{ borderBottom: `1px solid ${BRAND_COLORS.warmBeige}` }}>
                <h2 className="text-lg font-semibold" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: BRAND_COLORS.charcoal }}>Feature Prioritization</h2>
                <p className="text-sm" style={{ color: BRAND_COLORS.slate }}>Ranked by ICE score (Impact × Confidence × Ease)</p>
              </div>
              
              {features.length === 0 ? (
                <div className="p-8 text-center" style={{ color: BRAND_COLORS.slate }}>
                  No feature concepts yet. Add one above!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead style={{ backgroundColor: BRAND_COLORS.cream }}>
                      <tr>
                        <th className="text-left p-4 font-medium" style={{ color: BRAND_COLORS.slate }}>Rank</th>
                        <th className="text-left p-4 font-medium" style={{ color: BRAND_COLORS.slate }}>Feature</th>
                        <th className="text-left p-4 font-medium" style={{ color: BRAND_COLORS.slate }}>Pain Point</th>
                        <th className="text-center p-4 font-medium" style={{ color: BRAND_COLORS.slate }}>I</th>
                        <th className="text-center p-4 font-medium" style={{ color: BRAND_COLORS.slate }}>C</th>
                        <th className="text-center p-4 font-medium" style={{ color: BRAND_COLORS.slate }}>E</th>
                        <th className="text-center p-4 font-medium" style={{ color: BRAND_COLORS.slate }}>ICE</th>
                        <th className="text-right p-4 font-medium" style={{ color: BRAND_COLORS.slate }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {features.map((feature, i) => (
                        <tr key={feature.id} style={{ borderTop: `1px solid ${BRAND_COLORS.warmBeige}` }}>
                          <td className="p-4">
                            <span className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" style={{
                              backgroundColor: i === 0 ? BRAND_COLORS.wineDeep : i === 1 ? BRAND_COLORS.wineBurgundy : i === 2 ? BRAND_COLORS.wineRose : BRAND_COLORS.warmBeige,
                              color: i < 3 ? 'white' : BRAND_COLORS.slate
                            }}>
                              {i + 1}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="font-medium" style={{ color: BRAND_COLORS.charcoal }}>{feature.name}</div>
                            {feature.description && (
                              <div className="text-sm mt-1" style={{ color: BRAND_COLORS.slate }}>{feature.description}</div>
                            )}
                          </td>
                          <td className="p-4">
                            <span className="text-sm px-2 py-1 rounded" style={{ backgroundColor: BRAND_COLORS.warmBeige, color: BRAND_COLORS.slate }}>
                              {feature.pain_point || 'Not set'}
                            </span>
                          </td>
                          <td className="p-4 text-center font-medium" style={{ color: BRAND_COLORS.charcoal }}>{feature.impact}</td>
                          <td className="p-4 text-center font-medium" style={{ color: BRAND_COLORS.charcoal }}>{feature.confidence}</td>
                          <td className="p-4 text-center font-medium" style={{ color: BRAND_COLORS.charcoal }}>{feature.ease}</td>
                          <td className="p-4 text-center">
                            <span className="text-lg font-bold" style={{ color: BRAND_COLORS.wineDeep }}>{feature.ice_score}</span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => editFeature(feature)}
                              className="text-sm mr-3 hover:opacity-80"
                              style={{ color: BRAND_COLORS.wineDeep }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteFeature(feature.id)}
                              className="text-sm hover:opacity-80"
                              style={{ color: BRAND_COLORS.wineRose }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SegmentCard({ title, segments, colors, themeColor }) {
  return (
    <div className="rounded-2xl shadow p-6" style={{ backgroundColor: 'white', border: `1px solid ${colors.warmBeige}` }}>
      <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: colors.charcoal }}>{title}</h2>
      <div className="space-y-4">
        {segments?.map((seg) => (
          <div key={seg.name} className="pb-4 last:pb-0" style={{ borderBottom: `1px solid ${colors.warmBeige}` }}>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium" style={{ color: colors.charcoal }}>{seg.name}</span>
              <span className="text-sm" style={{ color: colors.slate }}>{seg.count} responses</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {seg.topThemes.map((t) => (
                <span key={t.name} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: themeColor + '30', color: colors.charcoal }}>
                  {t.name} ({t.pct}%)
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SliderInput({ label, value, onChange, lowLabel, highLabel, colors }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: colors.slate }}>{label}</label>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full"
        style={{ accentColor: colors.wineDeep }}
      />
      <div className="flex justify-between text-xs" style={{ color: colors.slate }}>
        <span>{lowLabel}</span>
        <span className="font-medium" style={{ color: colors.charcoal }}>{value}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  )
}