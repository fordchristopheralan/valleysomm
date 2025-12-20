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

// Wine drop logo SVG component
const WineLogo = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M40 8C40 8 20 28 20 48C20 59.046 28.954 68 40 68C51.046 68 60 59.046 60 48C60 28 40 8 40 8Z" stroke="currentColor" strokeWidth="3" fill="none"/>
    <path d="M30 52C30 52 35 44 40 44C45 44 50 52 50 52" stroke="#C9A962" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
  </svg>
)

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
    
    // Fetch responses
    const { data: responseData } = await supabase
      .from('survey_responses')
      .select('*')
      .order('submitted_at', { ascending: false })

    setResponses(responseData || [])

    // Fetch feature concepts
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
      <div className="min-h-screen bg-cream flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full">
          <div className="flex items-center gap-2 mb-4">
            <WineLogo className="w-6 h-6 text-wine-burgundy" />
            <h1 className="text-2xl font-display font-semibold text-charcoal">Feature Analysis</h1>
          </div>
          <p className="text-slate mb-6">Enter password to access analysis tools</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-3 rounded-lg border border-warm-beige focus:border-wine-rose focus:ring-2 focus:ring-wine-rose/20 outline-none mb-4"
            />
            {error && <p className="text-wine-deep text-sm mb-4">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-wine-burgundy hover:bg-wine-deep text-white font-medium rounded-lg transition-colors"
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
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-slate">Loading analysis data...</div>
      </div>
    )
  }

  const reviewedCount = responses.filter((r) => r.reviewed).length

  return (
    <div className="min-h-screen bg-cream p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <WineLogo className="w-6 h-6 text-wine-burgundy" />
              <h1 className="text-3xl font-display font-semibold text-charcoal">Feature Analysis</h1>
            </div>
            <p className="text-slate">Pain point matrix & ICE prioritization</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate">
              {reviewedCount} responses reviewed
            </span>
            <a
              href="/review"
              className="px-4 py-2 bg-valley-deep hover:bg-valley-sage text-white text-sm font-medium rounded-lg transition-colors"
            >
              Review Responses
            </a>
            <a
              href="/dashboard"
              className="px-4 py-2 bg-wine-burgundy hover:bg-wine-deep text-white text-sm font-medium rounded-lg transition-colors"
            >
              Dashboard
            </a>
          </div>
        </div>

        {/* Tabs - FIXED: All tab labels now visible */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'matrix' 
                ? 'bg-wine-burgundy text-white' 
                : 'bg-white text-slate hover:bg-cream border border-warm-beige'
            }`}
          >
            Pain Point Matrix
          </button>
          <button
            onClick={() => setActiveTab('segments')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'segments' 
                ? 'bg-wine-burgundy text-white' 
                : 'bg-white text-slate hover:bg-cream border border-warm-beige'
            }`}
          >
            Segment Analysis
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'features' 
                ? 'bg-wine-burgundy text-white' 
                : 'bg-white text-slate hover:bg-cream border border-warm-beige'
            }`}
          >
            Feature Concepts (ICE)
          </button>
        </div>

        {/* Pain Point Matrix Tab */}
        {activeTab === 'matrix' && (
          <div className="space-y-6">
            {reviewedCount === 0 ? (
              <div className="bg-white rounded-2xl shadow p-8 text-center">
                <p className="text-slate mb-4">No reviewed responses yet.</p>
                <a href="/review" className="text-wine-burgundy hover:text-wine-deep font-medium">
                  Start reviewing responses →
                </a>
              </div>
            ) : (
              <>
                {/* Matrix Table */}
                <div className="bg-white rounded-2xl shadow overflow-hidden">
                  <div className="p-6 border-b border-warm-beige">
                    <h2 className="text-lg font-display font-semibold text-charcoal">Pain Point Scoring Matrix</h2>
                    <p className="text-sm text-slate">Based on {reviewedCount} reviewed responses</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-cream">
                        <tr>
                          <th className="text-left p-4 font-medium text-slate">Pain Point</th>
                          <th className="text-center p-4 font-medium text-slate">Frequency</th>
                          <th className="text-center p-4 font-medium text-slate">Avg Intensity</th>
                          <th className="text-center p-4 font-medium text-slate">WTP Rate</th>
                          <th className="text-center p-4 font-medium text-slate">Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {painPointMatrix.map((row, i) => (
                          <tr key={row.name} className="border-t border-warm-beige">
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-wine-rose/20 text-wine-burgundy text-xs flex items-center justify-center font-medium">
                                  {i + 1}
                                </span>
                                <span className="font-medium text-charcoal">{row.name}</span>
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <div className="inline-flex items-center gap-2">
                                <div className="w-24 h-2 bg-warm-beige rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-wine-burgundy" 
                                    style={{ width: `${row.frequency}%` }}
                                  />
                                </div>
                                <span className="text-sm text-slate">{row.frequency}%</span>
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`px-2 py-1 rounded text-sm ${
                                row.intensity >= 4 ? 'bg-wine-deep/10 text-wine-deep' :
                                row.intensity >= 3 ? 'bg-gold/20 text-charcoal' :
                                'bg-warm-beige text-slate'
                              }`}>
                                {row.intensity}/5
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`px-2 py-1 rounded text-sm ${
                                row.wtp >= 60 ? 'bg-valley-sage/20 text-valley-deep' :
                                row.wtp >= 40 ? 'bg-gold/20 text-charcoal' :
                                'bg-warm-beige text-slate'
                              }`}>
                                {row.wtp}%
                              </span>
                            </td>
                            <td className="p-4 text-center text-slate">{row.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Frequency Chart */}
                <div className="bg-white rounded-2xl shadow p-6">
                  <h2 className="text-lg font-display font-semibold text-charcoal mb-4">Pain Point Frequency</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={painPointMatrix} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D5" />
                      <XAxis type="number" domain={[0, 100]} stroke="#B8A99A" />
                      <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12 }} stroke="#B8A99A" />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Bar dataKey="frequency" fill="#8B3A4D" radius={[0, 4, 4, 0]} />
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
              <div className="bg-white rounded-2xl shadow p-8 text-center">
                <p className="text-slate mb-4">No reviewed responses yet.</p>
                <a href="/review" className="text-wine-burgundy hover:text-wine-deep font-medium">
                  Start reviewing responses →
                </a>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {/* By Group Type */}
                <div className="bg-white rounded-2xl shadow p-6">
                  <h2 className="text-lg font-display font-semibold text-charcoal mb-4">By Group Type</h2>
                  <div className="space-y-4">
                    {segmentAnalysis.byGroupType?.map((seg) => (
                      <div key={seg.name} className="border-b border-warm-beige pb-4 last:border-0">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-charcoal">{seg.name}</span>
                          <span className="text-sm text-slate">{seg.count} responses</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {seg.topThemes.map((t) => (
                            <span key={t.name} className="text-xs bg-wine-rose/20 text-wine-burgundy px-2 py-1 rounded">
                              {t.name} ({t.pct}%)
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* By Confidence */}
                <div className="bg-white rounded-2xl shadow p-6">
                  <h2 className="text-lg font-display font-semibold text-charcoal mb-4">By Confidence Level</h2>
                  <div className="space-y-4">
                    <div className="border-b border-warm-beige pb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-charcoal">Low Confidence (1-2)</span>
                        <span className="text-sm text-slate">{segmentAnalysis.byConfidence?.low?.count || 0} responses</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {segmentAnalysis.byConfidence?.low?.topThemes?.map((t) => (
                          <span key={t.name} className="text-xs bg-wine-deep/10 text-wine-deep px-2 py-1 rounded">
                            {t.name} ({t.pct}%)
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-charcoal">High Confidence (4-5)</span>
                        <span className="text-sm text-slate">{segmentAnalysis.byConfidence?.high?.count || 0} responses</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {segmentAnalysis.byConfidence?.high?.topThemes?.map((t) => (
                          <span key={t.name} className="text-xs bg-valley-sage/20 text-valley-deep px-2 py-1 rounded">
                            {t.name} ({t.pct}%)
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* By WTP */}
                <div className="bg-white rounded-2xl shadow p-6">
                  <h2 className="text-lg font-display font-semibold text-charcoal mb-4">By Willingness to Pay</h2>
                  <div className="space-y-4">
                    <div className="border-b border-warm-beige pb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-charcoal">Would Pay</span>
                        <span className="text-sm text-slate">{segmentAnalysis.byWTP?.yes?.count || 0} responses</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {segmentAnalysis.byWTP?.yes?.topThemes?.map((t) => (
                          <span key={t.name} className="text-xs bg-valley-sage/20 text-valley-deep px-2 py-1 rounded">
                            {t.name} ({t.pct}%)
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-charcoal">{"Wouldn't Pay"}</span>
                        <span className="text-sm text-slate">{segmentAnalysis.byWTP?.no?.count || 0} responses</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {segmentAnalysis.byWTP?.no?.topThemes?.map((t) => (
                          <span key={t.name} className="text-xs bg-warm-beige text-slate px-2 py-1 rounded">
                            {t.name} ({t.pct}%)
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* By Source */}
                <div className="bg-white rounded-2xl shadow p-6">
                  <h2 className="text-lg font-display font-semibold text-charcoal mb-4">By Source</h2>
                  <div className="space-y-4">
                    {segmentAnalysis.bySource?.map((seg) => (
                      <div key={seg.name} className="border-b border-warm-beige pb-4 last:border-0">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-charcoal">{seg.name}</span>
                          <span className="text-sm text-slate">{seg.count} responses</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {seg.topThemes.map((t) => (
                            <span key={t.name} className="text-xs bg-wine-rose/20 text-wine-burgundy px-2 py-1 rounded">
                              {t.name} ({t.pct}%)
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Feature Concepts Tab */}
        {activeTab === 'features' && (
          <div className="space-y-6">
            {/* Add/Edit Feature Form */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-display font-semibold text-charcoal mb-4">
                {editingFeature ? 'Edit Feature Concept' : 'Add Feature Concept'}
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate mb-1">Feature Name</label>
                    <input
                      type="text"
                      value={newFeature.name}
                      onChange={(e) => setNewFeature({ ...newFeature, name: e.target.value })}
                      placeholder="e.g., Wine Personality Quiz"
                      className="w-full p-3 rounded-lg border border-warm-beige focus:border-wine-rose outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate mb-1">Description</label>
                    <textarea
                      value={newFeature.description}
                      onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                      placeholder="What does this feature do?"
                      className="w-full p-3 rounded-lg border border-warm-beige focus:border-wine-rose outline-none h-24 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate mb-1">Pain Point Addressed</label>
                    <select
                      value={newFeature.pain_point}
                      onChange={(e) => setNewFeature({ ...newFeature, pain_point: e.target.value })}
                      className="w-full p-3 rounded-lg border border-warm-beige focus:border-wine-rose outline-none"
                    >
                      <option value="">Select pain point...</option>
                      {painPointMatrix.map((p) => (
                        <option key={p.name} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate mb-2">
                      Impact (1-10): How much does this reduce the pain?
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={newFeature.impact}
                      onChange={(e) => setNewFeature({ ...newFeature, impact: parseInt(e.target.value) })}
                      className="w-full accent-wine-burgundy"
                    />
                    <div className="flex justify-between text-xs text-taupe">
                      <span>Minimal</span>
                      <span className="font-medium text-charcoal">{newFeature.impact}</span>
                      <span>Game-changing</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate mb-2">
                      Confidence (1-10): How sure are you this solves it?
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={newFeature.confidence}
                      onChange={(e) => setNewFeature({ ...newFeature, confidence: parseInt(e.target.value) })}
                      className="w-full accent-wine-burgundy"
                    />
                    <div className="flex justify-between text-xs text-taupe">
                      <span>Guessing</span>
                      <span className="font-medium text-charcoal">{newFeature.confidence}</span>
                      <span>Validated</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate mb-2">
                      Ease (1-10): How fast can you build an MVP?
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={newFeature.ease}
                      onChange={(e) => setNewFeature({ ...newFeature, ease: parseInt(e.target.value) })}
                      className="w-full accent-wine-burgundy"
                    />
                    <div className="flex justify-between text-xs text-taupe">
                      <span>Months</span>
                      <span className="font-medium text-charcoal">{newFeature.ease}</span>
                      <span>Weekend</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <div className="text-center p-4 bg-wine-rose/10 rounded-lg">
                      <span className="text-sm text-slate">ICE Score: </span>
                      <span className="text-2xl font-bold text-wine-burgundy">
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
                    className="px-4 py-2 text-slate hover:text-charcoal"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={saveFeature}
                  disabled={!newFeature.name}
                  className="px-6 py-2 bg-wine-burgundy hover:bg-wine-deep disabled:bg-taupe text-white font-medium rounded-lg transition-colors"
                >
                  {editingFeature ? 'Update Feature' : 'Add Feature'}
                </button>
              </div>
            </div>

            {/* Feature List */}
            <div className="bg-white rounded-2xl shadow overflow-hidden">
              <div className="p-6 border-b border-warm-beige">
                <h2 className="text-lg font-display font-semibold text-charcoal">Feature Prioritization</h2>
                <p className="text-sm text-slate">Ranked by ICE score (Impact × Confidence × Ease)</p>
              </div>
              
              {features.length === 0 ? (
                <div className="p-8 text-center text-slate">
                  No feature concepts yet. Add one above!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-cream">
                      <tr>
                        <th className="text-left p-4 font-medium text-slate">Rank</th>
                        <th className="text-left p-4 font-medium text-slate">Feature</th>
                        <th className="text-left p-4 font-medium text-slate">Pain Point</th>
                        <th className="text-center p-4 font-medium text-slate">I</th>
                        <th className="text-center p-4 font-medium text-slate">C</th>
                        <th className="text-center p-4 font-medium text-slate">E</th>
                        <th className="text-center p-4 font-medium text-slate">ICE</th>
                        <th className="text-right p-4 font-medium text-slate">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {features.map((feature, i) => (
                        <tr key={feature.id} className="border-t border-warm-beige">
                          <td className="p-4">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                              i === 0 ? 'bg-wine-burgundy text-white' :
                              i === 1 ? 'bg-wine-rose/30 text-wine-deep' :
                              i === 2 ? 'bg-wine-rose/20 text-wine-burgundy' :
                              'bg-warm-beige text-slate'
                            }`}>
                              {i + 1}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-charcoal">{feature.name}</div>
                            {feature.description && (
                              <div className="text-sm text-slate mt-1">{feature.description}</div>
                            )}
                          </td>
                          <td className="p-4">
                            <span className="text-sm bg-warm-beige text-slate px-2 py-1 rounded">
                              {feature.pain_point || 'Not set'}
                            </span>
                          </td>
                          <td className="p-4 text-center font-medium">{feature.impact}</td>
                          <td className="p-4 text-center font-medium">{feature.confidence}</td>
                          <td className="p-4 text-center font-medium">{feature.ease}</td>
                          <td className="p-4 text-center">
                            <span className="text-lg font-bold text-wine-burgundy">{feature.ice_score}</span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => editFeature(feature)}
                              className="text-sm text-wine-burgundy hover:text-wine-deep mr-3"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteFeature(feature.id)}
                              className="text-sm text-wine-deep hover:text-wine-burgundy"
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
