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
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
} from 'recharts'

const COLORS = ['#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f', '#fbbf24', '#fcd34d', '#fde68a']

export default function AnalysisPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [responses, setResponses] = useState([])
  const [features, setFeatures] = useState([])
  const [activeTab, setActiveTab] = useState('matrix') // 'matrix', 'features', 'segments'
  
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

    // Count themes across all open-ended fields
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
        
        // Track intensity
        if (r.intensity_score) {
          if (!themeIntensity[theme]) themeIntensity[theme] = []
          themeIntensity[theme].push(r.intensity_score)
        }
        
        // Track willingness to pay
        const wouldPay = r.pay === 'Yes — take my money' || r.pay === 'Maybe, depending on cost'
        if (!themeWTP[theme]) themeWTP[theme] = { yes: 0, total: 0 }
        themeWTP[theme].total++
        if (wouldPay) themeWTP[theme].yes++
      })
    })

    // Calculate scores for each theme
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
      // By group type
      const groupType = r.group_type || 'Unknown'
      if (!segments.byGroupType[groupType]) segments.byGroupType[groupType] = []
      segments.byGroupType[groupType].push(r)

      // By confidence (low = 1-2, high = 4-5)
      if (r.confidence <= 2) segments.byConfidence.low.push(r)
      else if (r.confidence >= 4) segments.byConfidence.high.push(r)

      // By WTP
      const wouldPay = r.pay === 'Yes — take my money' || r.pay === 'Maybe, depending on cost'
      if (wouldPay) segments.byWTP.yes.push(r)
      else segments.byWTP.no.push(r)

      // By source
      const source = r.source || 'Unknown'
      if (!segments.bySource[source]) segments.bySource[source] = []
      segments.bySource[source].push(r)
    })

    // Calculate top themes for each segment
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
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full">
          <h1 className="text-2xl font-bold text-stone-800 mb-2">Feature Analysis</h1>
          <p className="text-stone-500 mb-6">Enter password to access analysis tools</p>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="text-stone-500">Loading analysis data...</div>
      </div>
    )
  }

  const reviewedCount = responses.filter((r) => r.reviewed).length

  return (
    <div className="min-h-screen bg-stone-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-stone-800">Feature Analysis</h1>
            <p className="text-stone-500">Pain point matrix & ICE prioritization</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-stone-500">
              {reviewedCount} responses reviewed
            </span>
            <a
              href="/review"
              className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Review Responses
            </a>
            <a
              href="/dashboard"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Dashboard
            </a>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'matrix' ? 'bg-amber-500 text-white' : 'bg-white text-stone-600 hover:bg-stone-50'
            }`}
          >
            Pain Point Matrix
          </button>
          <button
            onClick={() => setActiveTab('segments')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'segments' ? 'bg-amber-500 text-white' : 'bg-white text-stone-600 hover:bg-stone-50'
            }`}
          >
            Segment Analysis
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'features' ? 'bg-amber-500 text-white' : 'bg-white text-stone-600 hover:bg-stone-50'
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
                <p className="text-stone-500 mb-4">No reviewed responses yet.</p>
                <a href="/review" className="text-amber-600 hover:text-amber-700 font-medium">
                  Start reviewing responses →
                </a>
              </div>
            ) : (
              <>
                {/* Matrix Table */}
                <div className="bg-white rounded-2xl shadow overflow-hidden">
                  <div className="p-6 border-b border-stone-100">
                    <h2 className="text-lg font-semibold text-stone-800">Pain Point Scoring Matrix</h2>
                    <p className="text-sm text-stone-500">Based on {reviewedCount} reviewed responses</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-stone-50">
                        <tr>
                          <th className="text-left p-4 font-medium text-stone-600">Pain Point</th>
                          <th className="text-center p-4 font-medium text-stone-600">Frequency</th>
                          <th className="text-center p-4 font-medium text-stone-600">Avg Intensity</th>
                          <th className="text-center p-4 font-medium text-stone-600">WTP Rate</th>
                          <th className="text-center p-4 font-medium text-stone-600">Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {painPointMatrix.map((row, i) => (
                          <tr key={row.name} className="border-t border-stone-100">
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs flex items-center justify-center font-medium">
                                  {i + 1}
                                </span>
                                <span className="font-medium text-stone-800">{row.name}</span>
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <div className="inline-flex items-center gap-2">
                                <div className="w-24 h-2 bg-stone-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-amber-500" 
                                    style={{ width: `${row.frequency}%` }}
                                  />
                                </div>
                                <span className="text-sm text-stone-600">{row.frequency}%</span>
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`px-2 py-1 rounded text-sm ${
                                row.intensity >= 4 ? 'bg-red-100 text-red-700' :
                                row.intensity >= 3 ? 'bg-amber-100 text-amber-700' :
                                'bg-stone-100 text-stone-600'
                              }`}>
                                {row.intensity}/5
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`px-2 py-1 rounded text-sm ${
                                row.wtp >= 60 ? 'bg-green-100 text-green-700' :
                                row.wtp >= 40 ? 'bg-amber-100 text-amber-700' :
                                'bg-stone-100 text-stone-600'
                              }`}>
                                {row.wtp}%
                              </span>
                            </td>
                            <td className="p-4 text-center text-stone-600">{row.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Frequency Chart */}
                <div className="bg-white rounded-2xl shadow p-6">
                  <h2 className="text-lg font-semibold text-stone-800 mb-4">Pain Point Frequency</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={painPointMatrix} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                      <XAxis type="number" domain={[0, 100]} stroke="#a8a29e" />
                      <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12 }} stroke="#a8a29e" />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Bar dataKey="frequency" fill="#f59e0b" radius={[0, 4, 4, 0]} />
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
                <p className="text-stone-500 mb-4">No reviewed responses yet.</p>
                <a href="/review" className="text-amber-600 hover:text-amber-700 font-medium">
                  Start reviewing responses →
                </a>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {/* By Group Type */}
                <div className="bg-white rounded-2xl shadow p-6">
                  <h2 className="text-lg font-semibold text-stone-800 mb-4">By Group Type</h2>
                  <div className="space-y-4">
                    {segmentAnalysis.byGroupType?.map((seg) => (
                      <div key={seg.name} className="border-b border-stone-100 pb-4 last:border-0">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-stone-800">{seg.name}</span>
                          <span className="text-sm text-stone-500">{seg.count} responses</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {seg.topThemes.map((t) => (
                            <span key={t.name} className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
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
                  <h2 className="text-lg font-semibold text-stone-800 mb-4">By Confidence Level</h2>
                  <div className="space-y-4">
                    <div className="border-b border-stone-100 pb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-stone-800">Low Confidence (1-2)</span>
                        <span className="text-sm text-stone-500">{segmentAnalysis.byConfidence?.low?.count || 0} responses</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {segmentAnalysis.byConfidence?.low?.topThemes?.map((t) => (
                          <span key={t.name} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                            {t.name} ({t.pct}%)
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-stone-800">High Confidence (4-5)</span>
                        <span className="text-sm text-stone-500">{segmentAnalysis.byConfidence?.high?.count || 0} responses</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {segmentAnalysis.byConfidence?.high?.topThemes?.map((t) => (
                          <span key={t.name} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            {t.name} ({t.pct}%)
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* By WTP */}
                <div className="bg-white rounded-2xl shadow p-6">
                  <h2 className="text-lg font-semibold text-stone-800 mb-4">By Willingness to Pay</h2>
                  <div className="space-y-4">
                    <div className="border-b border-stone-100 pb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-stone-800">Would Pay</span>
                        <span className="text-sm text-stone-500">{segmentAnalysis.byWTP?.yes?.count || 0} responses</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {segmentAnalysis.byWTP?.yes?.topThemes?.map((t) => (
                          <span key={t.name} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            {t.name} ({t.pct}%)
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-stone-800">{"Wouldn't Pay"}</span>
                        <span className="text-sm text-stone-500">{segmentAnalysis.byWTP?.no?.count || 0} responses</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {segmentAnalysis.byWTP?.no?.topThemes?.map((t) => (
                          <span key={t.name} className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded">
                            {t.name} ({t.pct}%)
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* By Source */}
                <div className="bg-white rounded-2xl shadow p-6">
                  <h2 className="text-lg font-semibold text-stone-800 mb-4">By Source</h2>
                  <div className="space-y-4">
                    {segmentAnalysis.bySource?.map((seg) => (
                      <div key={seg.name} className="border-b border-stone-100 pb-4 last:border-0">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-stone-800">{seg.name}</span>
                          <span className="text-sm text-stone-500">{seg.count} responses</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {seg.topThemes.map((t) => (
                            <span key={t.name} className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
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
              <h2 className="text-lg font-semibold text-stone-800 mb-4">
                {editingFeature ? 'Edit Feature Concept' : 'Add Feature Concept'}
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1">Feature Name</label>
                    <input
                      type="text"
                      value={newFeature.name}
                      onChange={(e) => setNewFeature({ ...newFeature, name: e.target.value })}
                      placeholder="e.g., Wine Personality Quiz"
                      className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1">Description</label>
                    <textarea
                      value={newFeature.description}
                      onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                      placeholder="What does this feature do?"
                      className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 outline-none h-24 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1">Pain Point Addressed</label>
                    <select
                      value={newFeature.pain_point}
                      onChange={(e) => setNewFeature({ ...newFeature, pain_point: e.target.value })}
                      className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 outline-none"
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
                    <label className="block text-sm font-medium text-stone-600 mb-2">
                      Impact (1-10): How much does this reduce the pain?
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={newFeature.impact}
                      onChange={(e) => setNewFeature({ ...newFeature, impact: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-stone-400">
                      <span>Minimal</span>
                      <span className="font-medium text-stone-700">{newFeature.impact}</span>
                      <span>Game-changing</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-2">
                      Confidence (1-10): How sure are you this solves it?
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={newFeature.confidence}
                      onChange={(e) => setNewFeature({ ...newFeature, confidence: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-stone-400">
                      <span>Guessing</span>
                      <span className="font-medium text-stone-700">{newFeature.confidence}</span>
                      <span>Validated</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-2">
                      Ease (1-10): How fast can you build an MVP?
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={newFeature.ease}
                      onChange={(e) => setNewFeature({ ...newFeature, ease: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-stone-400">
                      <span>Months</span>
                      <span className="font-medium text-stone-700">{newFeature.ease}</span>
                      <span>Weekend</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <div className="text-center p-4 bg-amber-50 rounded-lg">
                      <span className="text-sm text-stone-600">ICE Score: </span>
                      <span className="text-2xl font-bold text-amber-600">
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
                    className="px-4 py-2 text-stone-600 hover:text-stone-800"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={saveFeature}
                  disabled={!newFeature.name}
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-300 text-white font-medium rounded-lg transition-colors"
                >
                  {editingFeature ? 'Update Feature' : 'Add Feature'}
                </button>
              </div>
            </div>

            {/* Feature List */}
            <div className="bg-white rounded-2xl shadow overflow-hidden">
              <div className="p-6 border-b border-stone-100">
                <h2 className="text-lg font-semibold text-stone-800">Feature Prioritization</h2>
                <p className="text-sm text-stone-500">Ranked by ICE score (Impact × Confidence × Ease)</p>
              </div>
              
              {features.length === 0 ? (
                <div className="p-8 text-center text-stone-500">
                  No feature concepts yet. Add one above!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-stone-50">
                      <tr>
                        <th className="text-left p-4 font-medium text-stone-600">Rank</th>
                        <th className="text-left p-4 font-medium text-stone-600">Feature</th>
                        <th className="text-left p-4 font-medium text-stone-600">Pain Point</th>
                        <th className="text-center p-4 font-medium text-stone-600">I</th>
                        <th className="text-center p-4 font-medium text-stone-600">C</th>
                        <th className="text-center p-4 font-medium text-stone-600">E</th>
                        <th className="text-center p-4 font-medium text-stone-600">ICE</th>
                        <th className="text-right p-4 font-medium text-stone-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {features.map((feature, i) => (
                        <tr key={feature.id} className="border-t border-stone-100">
                          <td className="p-4">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                              i === 0 ? 'bg-amber-500 text-white' :
                              i === 1 ? 'bg-amber-200 text-amber-800' :
                              i === 2 ? 'bg-amber-100 text-amber-700' :
                              'bg-stone-100 text-stone-600'
                            }`}>
                              {i + 1}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-stone-800">{feature.name}</div>
                            {feature.description && (
                              <div className="text-sm text-stone-500 mt-1">{feature.description}</div>
                            )}
                          </td>
                          <td className="p-4">
                            <span className="text-sm bg-stone-100 text-stone-600 px-2 py-1 rounded">
                              {feature.pain_point || 'Not set'}
                            </span>
                          </td>
                          <td className="p-4 text-center font-medium">{feature.impact}</td>
                          <td className="p-4 text-center font-medium">{feature.confidence}</td>
                          <td className="p-4 text-center font-medium">{feature.ease}</td>
                          <td className="p-4 text-center">
                            <span className="text-lg font-bold text-amber-600">{feature.ice_score}</span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => editFeature(feature)}
                              className="text-sm text-amber-600 hover:text-amber-700 mr-3"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteFeature(feature.id)}
                              className="text-sm text-red-600 hover:text-red-700"
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
