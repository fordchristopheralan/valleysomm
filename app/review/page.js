'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const DEFAULT_THEMES = [
  'Discovery / Matching',
  'Logistics / Routing',
  'Transportation / DD',
  'Reservations',
  'Group Coordination',
  'Information Gaps',
  'Food / Lodging',
  'Budget / Pricing',
  'Time Management',
  'Overwhelm / Too Many Options',
]

export default function ReviewPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [responses, setResponses] = useState([])
  const [selectedResponse, setSelectedResponse] = useState(null)
  const [themes, setThemes] = useState([])
  const [filter, setFilter] = useState('unreviewed')
  const [saving, setSaving] = useState(false)
  const [newTheme, setNewTheme] = useState('')

  const correctPassword = process.env.NEXT_PUBLIC_DASHBOARD_PASSWORD || 'valleysomm2024'

  const [formData, setFormData] = useState({
    hardest_part_themes: [],
    easier_themes: [],
    surprise_themes: [],
    intensity_score: null,
    pain_category: '',
    review_notes: '',
    reviewed: false,
  })

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
    
    const { data: responseData, error: responseError } = await supabase
      .from('survey_responses')
      .select('*')
      .order('submitted_at', { ascending: false })

    if (responseError) {
      console.error('Error fetching responses:', responseError)
    } else {
      setResponses(responseData || [])
    }

    const { data: themeData, error: themeError } = await supabase
      .from('themes')
      .select('*')
      .order('name')

    if (themeError) {
      console.error('Error fetching themes:', themeError)
      setThemes(DEFAULT_THEMES.map((name, i) => ({ id: i, name })))
    } else if (themeData && themeData.length > 0) {
      setThemes(themeData)
    } else {
      setThemes(DEFAULT_THEMES.map((name, i) => ({ id: i, name })))
    }

    setLoading(false)
  }

  useEffect(() => {
    if (authenticated) {
      fetchData()
    }
  }, [authenticated])

  const selectResponse = (response) => {
    setSelectedResponse(response)
    setFormData({
      hardest_part_themes: response.hardest_part_themes || [],
      easier_themes: response.easier_themes || [],
      surprise_themes: response.surprise_themes || [],
      intensity_score: response.intensity_score || null,
      pain_category: response.pain_category || '',
      review_notes: response.review_notes || '',
      reviewed: response.reviewed || false,
    })
  }

  const toggleTheme = (field, theme) => {
    const current = formData[field] || []
    if (current.includes(theme)) {
      setFormData({ ...formData, [field]: current.filter((t) => t !== theme) })
    } else {
      setFormData({ ...formData, [field]: [...current, theme] })
    }
  }

  const addCustomTheme = async () => {
    if (!newTheme.trim()) return
    
    const { data, error } = await supabase
      .from('themes')
      .insert([{ name: newTheme.trim() }])
      .select()

    if (!error && data) {
      setThemes([...themes, data[0]])
      setNewTheme('')
    } else {
      setThemes([...themes, { id: Date.now(), name: newTheme.trim() }])
      setNewTheme('')
    }
  }

  const saveReview = async () => {
    if (!selectedResponse) return
    
    setSaving(true)
    
    const { error } = await supabase
      .from('survey_responses')
      .update({
        hardest_part_themes: formData.hardest_part_themes,
        easier_themes: formData.easier_themes,
        surprise_themes: formData.surprise_themes,
        intensity_score: formData.intensity_score,
        pain_category: formData.pain_category,
        review_notes: formData.review_notes,
        reviewed: true,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', selectedResponse.id)

    if (error) {
      console.error('Error saving review:', error)
      setError('Failed to save review')
    } else {
      setResponses(responses.map((r) => 
        r.id === selectedResponse.id 
          ? { ...r, ...formData, reviewed: true }
          : r
      ))
      setFormData({ ...formData, reviewed: true })
      setSelectedResponse({ ...selectedResponse, ...formData, reviewed: true })
    }
    
    setSaving(false)
  }

  const goToNext = () => {
    const filtered = getFilteredResponses()
    const currentIndex = filtered.findIndex((r) => r.id === selectedResponse?.id)
    if (currentIndex < filtered.length - 1) {
      selectResponse(filtered[currentIndex + 1])
    }
  }

  const goToPrev = () => {
    const filtered = getFilteredResponses()
    const currentIndex = filtered.findIndex((r) => r.id === selectedResponse?.id)
    if (currentIndex > 0) {
      selectResponse(filtered[currentIndex - 1])
    }
  }

  const getFilteredResponses = () => {
    switch (filter) {
      case 'reviewed':
        return responses.filter((r) => r.reviewed)
      case 'unreviewed':
        return responses.filter((r) => !r.reviewed)
      default:
        return responses
    }
  }

  // Password screen
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full">
          <div className="flex items-center justify-center gap-2 mb-4">
            <svg width="28" height="28" viewBox="0 0 80 80" fill="none">
              <path d="M40 16C40 16 24 32 24 48C24 56.837 31.163 64 40 64C48.837 64 56 56.837 56 48C56 32 40 16 40 16Z" stroke="#6B2D3F" strokeWidth="2.5" fill="none"/>
              <path d="M32 50C32 50 36 44 40 44C44 44 48 50 48 50" stroke="#C9A962" strokeWidth="2" fill="none" strokeLinecap="round"/>
            </svg>
            <span className="font-display text-xl font-medium">
              <span className="text-wine-deep">Valley</span>
              <span className="text-valley-deep">Somm</span>
            </span>
          </div>
          <h1 className="font-display text-2xl font-medium text-charcoal mb-2 text-center">Review Responses</h1>
          <p className="text-slate text-center mb-6">Enter password to review and tag responses</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-3 rounded-lg border border-beige focus:border-wine-burgundy focus:ring-2 focus:ring-wine-rose/20 outline-none mb-4"
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
        <div className="text-slate">Loading responses...</div>
      </div>
    )
  }

  const filteredResponses = getFilteredResponses()
  const reviewedCount = responses.filter((r) => r.reviewed).length
  const currentIndex = filteredResponses.findIndex((r) => r.id === selectedResponse?.id)

  return (
    <div className="min-h-screen bg-cream">
      <div className="flex h-screen">
        {/* Sidebar - Response List */}
        <div className="w-80 bg-white border-r border-beige flex flex-col">
          <div className="p-4 border-b border-beige">
            <div className="flex items-center gap-2 mb-2">
              <svg width="24" height="24" viewBox="0 0 80 80" fill="none">
                <path d="M40 16C40 16 24 32 24 48C24 56.837 31.163 64 40 64C48.837 64 56 56.837 56 48C56 32 40 16 40 16Z" stroke="#6B2D3F" strokeWidth="2.5" fill="none"/>
                <path d="M32 50C32 50 36 44 40 44C44 44 48 50 48 50" stroke="#C9A962" strokeWidth="2" fill="none" strokeLinecap="round"/>
              </svg>
              <h1 className="font-display text-xl font-medium text-charcoal">Review Responses</h1>
            </div>
            <p className="text-sm text-slate">{reviewedCount} of {responses.length} reviewed</p>
            
            <div className="mt-3 flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="flex-1 text-sm border border-beige rounded-lg px-3 py-2 focus:border-wine-burgundy outline-none"
              >
                <option value="all">All ({responses.length})</option>
                <option value="unreviewed">Unreviewed ({responses.length - reviewedCount})</option>
                <option value="reviewed">Reviewed ({reviewedCount})</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredResponses.map((response) => (
              <button
                key={response.id}
                onClick={() => selectResponse(response)}
                className={`w-full p-4 text-left border-b border-beige/50 hover:bg-cream transition-colors ${
                  selectedResponse?.id === response.id ? 'bg-wine-rose/10 border-l-4 border-l-wine-burgundy' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-taupe">
                    {new Date(response.submitted_at).toLocaleDateString()}
                  </span>
                  {response.reviewed ? (
                    <span className="text-xs bg-valley-sage/20 text-valley-deep px-2 py-0.5 rounded-full">Reviewed</span>
                  ) : (
                    <span className="text-xs bg-beige text-slate px-2 py-0.5 rounded-full">Pending</span>
                  )}
                </div>
                <p className="text-sm text-charcoal line-clamp-2">
                  {response.hardest_part || response.easier || 'No open-ended responses'}
                </p>
                {response.source && (
                  <span className="text-xs text-taupe mt-1 block">{response.source}</span>
                )}
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-beige">
            <a
              href="/dashboard"
              className="block text-center text-sm text-wine-burgundy hover:text-wine-deep font-medium"
            >
              ← Back to Dashboard
            </a>
            <a
              href="/analysis"
              className="block text-center text-sm text-wine-burgundy hover:text-wine-deep font-medium mt-2"
            >
              Feature Analysis →
            </a>
          </div>
        </div>

        {/* Main Content - Response Detail */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedResponse ? (
            <div className="max-w-4xl mx-auto">
              {/* Navigation */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={goToPrev}
                    disabled={currentIndex <= 0}
                    className="px-3 py-1 text-sm text-slate hover:text-charcoal disabled:opacity-50"
                  >
                    ← Prev
                  </button>
                  <span className="text-sm text-slate">
                    {currentIndex + 1} of {filteredResponses.length}
                  </span>
                  <button
                    onClick={goToNext}
                    disabled={currentIndex >= filteredResponses.length - 1}
                    className="px-3 py-1 text-sm text-slate hover:text-charcoal disabled:opacity-50"
                  >
                    Next →
                  </button>
                </div>
                <button
                  onClick={saveReview}
                  disabled={saving}
                  className="px-6 py-2 bg-wine-burgundy hover:bg-wine-deep disabled:bg-taupe text-white font-medium rounded-lg transition-colors"
                >
                  {saving ? 'Saving...' : formData.reviewed ? 'Update Review' : 'Save Review'}
                </button>
              </div>

              {/* Response Meta */}
              <div className="bg-white rounded-2xl shadow p-6 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-slate">Date</span>
                    <p className="font-medium text-charcoal">
                      {new Date(selectedResponse.submitted_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate">Source</span>
                    <p className="font-medium text-charcoal">{selectedResponse.source || 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="text-slate">Group Type</span>
                    <p className="font-medium text-charcoal">{selectedResponse.group_type || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate">Confidence</span>
                    <p className="font-medium text-charcoal">{selectedResponse.confidence || 'N/A'}/5</p>
                  </div>
                  <div>
                    <span className="text-slate">Would Pay</span>
                    <p className="font-medium text-charcoal">{selectedResponse.pay || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate">Planning</span>
                    <p className="font-medium text-charcoal">{selectedResponse.planning_time || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate">Driver</span>
                    <p className="font-medium text-charcoal">{selectedResponse.driver || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate">Email</span>
                    <p className="font-medium text-charcoal">{selectedResponse.email ? 'Yes' : 'Anonymous'}</p>
                  </div>
                </div>
              </div>

              {/* Open-Ended Responses with Theme Tagging */}
              {selectedResponse.hardest_part && (
                <div className="bg-white rounded-2xl shadow p-6 mb-6">
                  <h3 className="font-display text-lg font-medium text-charcoal mb-2">Hardest Part of Planning</h3>
                  <p className="text-charcoal mb-4 p-4 bg-cream rounded-lg">{selectedResponse.hardest_part}</p>
                  
                  <div className="mb-2 text-sm font-medium text-slate">Assign Themes:</div>
                  <div className="flex flex-wrap gap-2">
                    {themes.map((theme) => (
                      <button
                        key={theme.id || theme.name}
                        onClick={() => toggleTheme('hardest_part_themes', theme.name)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                          formData.hardest_part_themes.includes(theme.name)
                            ? 'bg-wine-burgundy text-white'
                            : 'bg-beige text-slate hover:bg-wine-rose/20'
                        }`}
                      >
                        {theme.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedResponse.easier && (
                <div className="bg-white rounded-2xl shadow p-6 mb-6">
                  <h3 className="font-display text-lg font-medium text-charcoal mb-2">What Would Make It Easier</h3>
                  <p className="text-charcoal mb-4 p-4 bg-cream rounded-lg">{selectedResponse.easier}</p>
                  
                  <div className="mb-2 text-sm font-medium text-slate">Assign Themes:</div>
                  <div className="flex flex-wrap gap-2">
                    {themes.map((theme) => (
                      <button
                        key={theme.id || theme.name}
                        onClick={() => toggleTheme('easier_themes', theme.name)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                          formData.easier_themes.includes(theme.name)
                            ? 'bg-wine-burgundy text-white'
                            : 'bg-beige text-slate hover:bg-wine-rose/20'
                        }`}
                      >
                        {theme.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedResponse.surprise && (
                <div className="bg-white rounded-2xl shadow p-6 mb-6">
                  <h3 className="font-display text-lg font-medium text-charcoal mb-2">Surprises (Good & Bad)</h3>
                  <p className="text-charcoal mb-4 p-4 bg-cream rounded-lg">{selectedResponse.surprise}</p>
                  
                  <div className="mb-2 text-sm font-medium text-slate">Assign Themes:</div>
                  <div className="flex flex-wrap gap-2">
                    {themes.map((theme) => (
                      <button
                        key={theme.id || theme.name}
                        onClick={() => toggleTheme('surprise_themes', theme.name)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                          formData.surprise_themes.includes(theme.name)
                            ? 'bg-wine-burgundy text-white'
                            : 'bg-beige text-slate hover:bg-wine-rose/20'
                        }`}
                      >
                        {theme.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Custom Theme */}
              <div className="bg-white rounded-2xl shadow p-6 mb-6">
                <h3 className="font-display text-lg font-medium text-charcoal mb-4">Add Custom Theme</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTheme}
                    onChange={(e) => setNewTheme(e.target.value)}
                    placeholder="New theme name..."
                    className="flex-1 p-3 rounded-lg border border-beige focus:border-wine-burgundy focus:ring-2 focus:ring-wine-rose/20 outline-none"
                  />
                  <button
                    onClick={addCustomTheme}
                    className="px-4 py-2 bg-valley-deep hover:bg-charcoal text-white rounded-lg transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Intensity Score & Pain Category */}
              <div className="bg-white rounded-2xl shadow p-6 mb-6">
                <h3 className="font-display text-lg font-medium text-charcoal mb-4">Pain Point Scoring</h3>
                
                <div className="mb-6">
                  <div className="mb-2 text-sm font-medium text-slate">
                    Intensity Score (based on emotional language)
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => setFormData({ ...formData, intensity_score: n })}
                        className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                          formData.intensity_score === n
                            ? 'bg-wine-burgundy text-white'
                            : 'bg-cream text-slate hover:bg-wine-rose/10'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-taupe mt-1">
                    <span>Mild frustration</span>
                    <span>Trip-ruining</span>
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-sm font-medium text-slate">Primary Pain Category</div>
                  <select
                    value={formData.pain_category}
                    onChange={(e) => setFormData({ ...formData, pain_category: e.target.value })}
                    className="w-full p-3 rounded-lg border border-beige focus:border-wine-burgundy outline-none"
                  >
                    <option value="">Select primary category...</option>
                    {themes.map((theme) => (
                      <option key={theme.id || theme.name} value={theme.name}>{theme.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Review Notes */}
              <div className="bg-white rounded-2xl shadow p-6 mb-6">
                <h3 className="font-display text-lg font-medium text-charcoal mb-4">Review Notes</h3>
                <textarea
                  value={formData.review_notes}
                  onChange={(e) => setFormData({ ...formData, review_notes: e.target.value })}
                  placeholder="Any observations, patterns, or follow-up ideas..."
                  className="w-full h-32 p-4 rounded-lg border border-beige focus:border-wine-burgundy focus:ring-2 focus:ring-wine-rose/20 outline-none resize-none"
                />
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={saveReview}
                  disabled={saving}
                  className="px-8 py-3 bg-wine-burgundy hover:bg-wine-deep disabled:bg-taupe text-white font-medium rounded-lg transition-colors"
                >
                  {saving ? 'Saving...' : formData.reviewed ? 'Update Review' : 'Save Review'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-taupe">
              Select a response from the sidebar to review
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
