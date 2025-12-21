'use client'

import { useState, useEffect } from 'react'
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

const COLORS = ['#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f']

export default function FunnelAnalytics() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [funnelData, setFunnelData] = useState([])
  const [dropOffData, setDropOffData] = useState([])
  const [sourceData, setSourceData] = useState([])
  const [deviceData, setDeviceData] = useState([])
  const [avgDuration, setAvgDuration] = useState(0)

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

  const analyzeFunnel = async () => {
    setLoading(true)

    // Fetch all analytics records
    const { data: sessions, error: sessionsError } = await supabase
      .from('survey_analytics')
      .select('*')

    if (sessionsError || !sessions) {
      console.error('Error fetching sessions:', sessionsError)
      setLoading(false)
      return
    }

    // Calculate funnel metrics
    const total = sessions.length
    const started = sessions.filter(s => s.step_events?.length > 0).length
    
    // Count sessions that reached each step
    const reachedStep = (stepNum) => {
      return sessions.filter(s => 
        s.step_events?.some(e => e.step >= stepNum)
      ).length
    }

    const step2 = reachedStep(2)
    const step3 = reachedStep(3)
    const step4 = reachedStep(4)
    const completed = sessions.filter(s => s.completed).length

    const funnel = [
      { 
        step: 'Started Survey', 
        count: total, 
        rate: 100,
        detail: 'Total sessions initiated'
      },
      { 
        step: 'Step 1: Experience', 
        count: started, 
        rate: total > 0 ? (started / total * 100) : 0,
        detail: 'Answered first question'
      },
      { 
        step: 'Step 2: Planning', 
        count: step2, 
        rate: started > 0 ? (step2 / started * 100) : 0,
        detail: 'Reached planning questions'
      },
      { 
        step: 'Step 3: Logistics', 
        count: step3, 
        rate: step2 > 0 ? (step3 / step2 * 100) : 0,
        detail: 'Reached logistics section'
      },
      { 
        step: 'Step 4: Insights', 
        count: step4, 
        rate: step3 > 0 ? (step4 / step3 * 100) : 0,
        detail: 'Reached final section'
      },
      { 
        step: 'Completed', 
        count: completed, 
        rate: step4 > 0 ? (completed / step4 * 100) : 0,
        detail: 'Successfully submitted'
      },
    ]

    setFunnelData(funnel)

    // Calculate drop-off rates
    const dropOffs = [
      { 
        step: 'Start → Step 1', 
        dropOff: total > 0 ? ((total - started) / total * 100) : 0,
        count: total - started
      },
      { 
        step: 'Step 1 → Step 2', 
        dropOff: started > 0 ? ((started - step2) / started * 100) : 0,
        count: started - step2
      },
      { 
        step: 'Step 2 → Step 3', 
        dropOff: step2 > 0 ? ((step2 - step3) / step2 * 100) : 0,
        count: step2 - step3
      },
      { 
        step: 'Step 3 → Step 4', 
        dropOff: step3 > 0 ? ((step3 - step4) / step3 * 100) : 0,
        count: step3 - step4
      },
      { 
        step: 'Step 4 → Complete', 
        dropOff: step4 > 0 ? ((step4 - completed) / step4 * 100) : 0,
        count: step4 - completed
      },
    ]

    setDropOffData(dropOffs)

    // Source breakdown
    const sourceCounts = {}
    sessions.forEach(s => {
      const source = s.source || 'Direct'
      if (!sourceCounts[source]) {
        sourceCounts[source] = { total: 0, completed: 0 }
      }
      sourceCounts[source].total++
      if (s.completed) sourceCounts[source].completed++
    })

    const sources = Object.entries(sourceCounts).map(([name, data]) => ({
      name,
      total: data.total,
      completed: data.completed,
      rate: data.total > 0 ? (data.completed / data.total * 100).toFixed(1) : 0,
    })).sort((a, b) => b.total - a.total)

    setSourceData(sources)

    // Device breakdown
    const deviceCounts = {}
    sessions.forEach(s => {
      const device = s.device_type || 'unknown'
      if (!deviceCounts[device]) {
        deviceCounts[device] = { total: 0, completed: 0 }
      }
      deviceCounts[device].total++
      if (s.completed) deviceCounts[device].completed++
    })

    const devices = Object.entries(deviceCounts).map(([name, data]) => ({
      name,
      value: data.total,
      completed: data.completed,
      rate: data.total > 0 ? (data.completed / data.total * 100).toFixed(1) : 0,
    }))

    setDeviceData(devices)

    // Average completion time
    const completedSessions = sessions.filter(s => s.completed && s.total_duration_seconds)
    if (completedSessions.length > 0) {
      const avgSeconds = completedSessions.reduce((sum, s) => sum + s.total_duration_seconds, 0) / completedSessions.length
      setAvgDuration(Math.round(avgSeconds / 60)) // Convert to minutes
    }

    setLoading(false)
  }

  useEffect(() => {
    if (authenticated) {
      analyzeFunnel()
    }
  }, [authenticated])

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full">
          <h1 className="text-2xl font-bold text-stone-800 mb-2">Funnel Analytics</h1>
          <p className="text-stone-500 mb-6">Enter password to view funnel data</p>
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
        <div className="text-stone-500">Analyzing funnel data...</div>
      </div>
    )
  }

  const overallConversion = funnelData.length > 0 && funnelData[0].count > 0
    ? ((funnelData[funnelData.length - 1].count / funnelData[0].count) * 100).toFixed(1)
    : 0

  return (
    <div className="min-h-screen bg-stone-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-stone-800">Survey Funnel Analytics</h1>
            <p className="text-stone-500">Conversion funnel & drop-off analysis</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={analyzeFunnel}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Refresh
            </button>
            <a
              href="/dashboard"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Dashboard
            </a>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-sm text-stone-500 mb-1">Total Sessions</p>
            <p className="text-3xl font-bold text-stone-800">{funnelData[0]?.count || 0}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-sm text-stone-500 mb-1">Completed</p>
            <p className="text-3xl font-bold text-stone-800">{funnelData[funnelData.length - 1]?.count || 0}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-sm text-stone-500 mb-1">Conversion Rate</p>
            <p className="text-3xl font-bold text-amber-600">{overallConversion}%</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-sm text-stone-500 mb-1">Avg Duration</p>
            <p className="text-3xl font-bold text-stone-800">{avgDuration} min</p>
          </div>
        </div>

        {/* Funnel Visualization */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">Conversion Funnel</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={funnelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis type="number" domain={[0, 100]} stroke="#a8a29e" />
              <YAxis type="category" dataKey="step" width={150} tick={{ fontSize: 11 }} stroke="#a8a29e" />
              <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
              <Bar dataKey="rate" fill="#f59e0b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
          
          <div className="mt-4 grid grid-cols-2 md:grid-cols-6 gap-3">
            {funnelData.map((item, i) => (
              <div key={i} className="text-center">
                <p className="text-xs text-stone-500 mb-1">{item.step}</p>
                <p className="text-2xl font-bold text-stone-800">{item.count}</p>
                <p className="text-xs text-stone-400">{item.rate.toFixed(1)}%</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Drop-off Analysis */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">Drop-off by Transition</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dropOffData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="step" tick={{ fontSize: 10 }} stroke="#a8a29e" />
                <YAxis stroke="#a8a29e" />
                <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                <Bar dataKey="dropOff" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            
            <div className="mt-4">
              <p className="text-sm font-medium text-stone-700 mb-2">Biggest Drop-offs:</p>
              <ul className="space-y-2">
                {dropOffData
                  .sort((a, b) => b.dropOff - a.dropOff)
                  .slice(0, 3)
                  .map((item, i) => (
                    <li key={i} className="flex items-center justify-between text-sm p-2 bg-red-50 rounded">
                      <span className="text-stone-700">{item.step}</span>
                      <div className="text-right">
                        <span className="font-bold text-red-700">{item.dropOff.toFixed(1)}%</span>
                        <span className="text-xs text-stone-500 ml-2">({item.count} users)</span>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          </div>

          {/* Device Performance */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">Device Breakdown</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="mt-4 space-y-2">
              {deviceData.map((device, i) => (
                <div key={i} className="flex items-center justify-between text-sm p-2 bg-stone-50 rounded">
                  <span className="font-medium text-stone-700 capitalize">{device.name}</span>
                  <div className="text-right">
                    <span className="text-stone-600">{device.value} total</span>
                    <span className="ml-2 text-amber-600 font-medium">{device.rate}% completed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Source Performance */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">Performance by Source</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50">
                <tr>
                  <th className="text-left p-4 font-medium text-stone-600">Source</th>
                  <th className="text-center p-4 font-medium text-stone-600">Sessions</th>
                  <th className="text-center p-4 font-medium text-stone-600">Completed</th>
                  <th className="text-center p-4 font-medium text-stone-600">Conversion Rate</th>
                </tr>
              </thead>
              <tbody>
                {sourceData.map((source, i) => (
                  <tr key={i} className="border-t border-stone-100">
                    <td className="p-4 font-medium text-stone-800">{source.name}</td>
                    <td className="p-4 text-center text-stone-600">{source.total}</td>
                    <td className="p-4 text-center text-stone-600">{source.completed}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        parseFloat(source.rate) >= 50 ? 'bg-green-100 text-green-700' :
                        parseFloat(source.rate) >= 30 ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {source.rate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}