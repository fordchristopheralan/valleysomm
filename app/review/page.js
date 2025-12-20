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

// Wine drop logo SVG component
const WineLogo = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M40 8C40 8 20 28 20 48C20 59.046 28.954 68 40 68C51.046 68 60 59.046 60 48C60 28 40 8 40 8Z" stroke="currentColor" strokeWidth="3" fill="none"/>
    <path d="M30 52C30 52 35 44 40 44C45 44 50 52 50 52" stroke="#C9A962" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
  </svg>
)

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
  const [sidebarOpen, setSidebarOpen] = useState(false) // Mobile sidebar toggle

  const correctPassword = process.env.NEXT_PUBLIC_DASHBOARD_PASSWORD || 'valleysomm2024'

  // Form state for selected response
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
    
    // Fetch responses
    const { data: responseData, error: responseError } = await supabase
      .from('survey_responses')
      .select('*')
      .order('submitted_at', { ascending: false })

    if (responseError) {
      console.error('Error fetching responses:', responseError)
    } else {
      setResponses(responseData || [])
    }

    // Fetch themes
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
    // Close sidebar on mobile after selection
    setSidebarOpen(false)
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
      // If table doesn't exist, just add locally
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
      // Update local state
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
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full border border-warm-beige">
          <div className="flex justify-center mb-4">
            <WineLogo className="w-12 h-12 text-wine-burgundy" />
          </div>
          <h1 className="text-2xl font-display font-bold text-charcoal mb-2 text-center">Review Responses</h1>
          <p className="text-slate mb-6 text-center">Enter password to review and tag responses</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-3 rounded-lg border border-warm-beige focus:border-wine-rose focus:ring-2 focus:ring-wine-rose/20 outline-none mb-4"
            />
            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
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
      {/* Mobile Header with Hamburger */}
      <div className="md:hidden bg-white border-b border-warm-beige p-4 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-cream rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6 text-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            <h1 className="text-lg font-display font-bold text-charcoal">Review</h1>
          </div>
          <span className="text-xs text-slate">{reviewedCount}/{responses.length}</span>
        </div>
      </div>

      <div className="flex h-screen md:h-auto">
        {/* Sidebar - Hidden on mobile by default, overlay when open */}
        <div className={`
          fixed md:static inset-y-0 left-0 z-30
          w-80 bg-white border-r border-warm-beige
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          flex flex-col
          md:h-screen
        `}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-warm-beige">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-xl font-display font-bold text-charcoal hidden md:block">Review Responses</h1>
              {/* Close button for mobile */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-2 hover:bg-cream rounded-lg transition-colors ml-auto"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5 text-slate" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-slate mb-3">{reviewedCount} of {responses.length} reviewed</p>
            
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="flex-1 text-sm border border-warm-beige rounded-lg px-3 py-2 focus:border-wine-rose outline-none"
              >
                <option value="all">All ({responses.length})</option>
                <option value="unreviewed">Unreviewed ({responses.length - reviewedCount})</option>
                <option value="reviewed">Reviewed ({reviewedCount})</option>
              </select>
            </div>
          </div>

          {/* Response List */}
          <div className="flex-1 overflow-y-auto">
            {filteredResponses.map((response) => (
              <button
                key={response.id}
                onClick={() => selectResponse(response)}
                className={`w-full p-4 text-left border-b border-warm-beige hover:bg-cream transition-colors ${
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
                    <span className="text-xs bg-wine-rose/20 text-wine-burgundy px-2 py-0.5 rounded-full">Pending</span>
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

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-warm-beige">
            <a
              href="/dashboard"
              className="block text-center text-sm text-wine-burgundy hover:text-wine-deep font-medium mb-2"
            >
              ← Back to Dashboard
            </a>
            <a
              href="/analysis"
              className="block text-center text-sm text-wine-burgundy hover:text-wine-deep font-medium"
            >
              Feature Analysis →
            </a>
          </div>
        </div>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {selectedResponse ? (
            <div className="max-w-4xl mx-auto">
              {/* Navigation */}
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={goToPrev}
                    disabled={currentIndex <= 0}
                    className="px-3 py-1 text-sm text-slate hover:text-charcoal disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Prev
                  </button>
                  <span className="text-sm text-slate">
                    {currentIndex + 1} of {filteredResponses.length}
                  </span>
                  <button
                    onClick={goToNext}
                    disabled={currentIndex >= filteredResponses.length - 1}
                    className="px-3 py-1 text-sm text-slate hover:text-charcoal disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>
                <button
                  onClick={saveReview}
                  disabled={saving}
                  className="px-6 py-2 bg-wine-burgundy hover:bg-wine-deep disabled:bg-taupe text-white font-medium rounded-lg transition-colors text-sm md:text-base"
                >
                  {saving ? 'Saving...' : formData.reviewed ? 'Update Review' : 'Save Review'}
                </button>
              </div>

              {/* Response Meta */}
              <div className="bg-white rounded-2xl shadow p-4 md:p-6 mb-6 border border-warm-beige">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-sm">
                  <div>
                    <span className="text-slate text-xs md:text-sm">Date</span>
                    <p className="font-medium text-charcoal text-xs md:text-sm">
                      {new Date(selectedResponse.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate text-xs md:text-sm">Source</span>
                    <p className="font-medium text-charcoal text-xs md:text-sm">{selectedResponse.source || 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="text-slate text-xs md:text-sm">Group Type</span>
                    <p className="font-medium text-charcoal text-xs md:text-sm">{selectedResponse.group_type || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate text-xs md:text-sm">Confidence</span>
                    <p className="font-medium text-charcoal text-xs md:text-sm">{selectedResponse.confidence || 'N/A'}/5</p>
                  </div>
                  <div>
                    <span className="text-slate text-xs md:text-sm">Would Pay</span>
                    <p className="font-medium text-charcoal text-xs md:text-sm truncate">{selectedResponse.pay || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate text-xs md:text-sm">Planning</span>
                    <p className="font-medium text-charcoal text-xs md:text-sm truncate">{selectedResponse.planning_time || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate text-xs md:text-sm">Driver</span>
                    <p className="font-medium text-charcoal text-xs md:text-sm truncate">{selectedResponse.driver || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate text-xs md:text-sm">Email</span>
                    <p className="font-medium text-charcoal text-xs md:text-sm">{selectedResponse.email ? 'Yes' : 'Anonymous'}</p>
                  </div>
                </div>
              </div>

              {/* Open-Ended Responses with Theme Tagging */}
              {selectedResponse.hardest_part && (
                <div className="bg-white rounded-2xl shadow p-4 md:p-6 mb-6 border border-warm-beige">
                  <h3 className="text-base md:text-lg font-display font-semibold text-charcoal mb-2">Hardest Part of Planning</h3>
                  <p className="text-charcoal mb-4 p-3 md:p-4 bg-cream rounded-lg text-sm md:text-base">{selectedResponse.hardest_part}</p>
                  
                  <div className="mb-2 text-xs md:text-sm font-medium text-slate">Assign Themes:</div>
                  <div className="flex flex-wrap gap-2">
                    {themes.map((theme) => (
                      <button
                        key={theme.id || theme.name}
                        onClick={() => toggleTheme('hardest_part_themes', theme.name)}
                        className={`px-2 md:px-3 py-1 text-xs md:text-sm rounded-full transition-colors ${
                          formData.hardest_part_themes.includes(theme.name)
                            ? 'bg-wine-burgundy text-white'
                            : 'bg-warm-beige text-slate hover:bg-wine-rose/20'
                        }`}
                      >
                        {theme.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedResponse.easier && (
                <div className="bg-white rounded-2xl shadow p-4 md:p-6 mb-6 border border-warm-beige">
                  <h3 className="text-base md:text-lg font-display font-semibold text-charcoal mb-2">What Would Make It Easier</h3>
                  <p className="text-charcoal mb-4 p-3 md:p-4 bg-cream rounded-lg text-sm md:text-base">{selectedResponse.easier}</p>
                  
                  <div className="mb-2 text-xs md:text-sm font-medium text-slate">Assign Themes:</div>
                  <div className="flex flex-wrap gap-2">
                    {themes.map((theme) => (
                      <button
                        key={theme.id || theme.name}
                        onClick={() => toggleTheme('easier_themes', theme.name)}
                        className={`px-2 md:px-3 py-1 text-xs md:text-sm rounded-full transition-colors ${
                          formData.easier_themes.includes(theme.name)
                            ? 'bg-wine-burgundy text-white'
                            : 'bg-warm-beige text-slate hover:bg-wine-rose/20'
                        }`}
                      >
                        {theme.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedResponse.surprise && (
                <div className="bg-white rounded-2xl shadow p-4 md:p-6 mb-6 border border-warm-beige">
                  <h3 className="text-base md:text-lg font-display font-semibold text-charcoal mb-2">Surprises (Good & Bad)</h3>
                  <p className="text-charcoal mb-4 p-3 md:p-4 bg-cream rounded-lg text-sm md:text-base">{selectedResponse.surprise}</p>
                  
                  <div className="mb-2 text-xs md:text-sm font-medium text-slate">Assign Themes:</div>
                  <div className="flex flex-wrap gap-2">
                    {themes.map((theme) => (
                      <button
                        key={theme.id || theme.name}
                        onClick={() => toggleTheme('surprise_themes', theme.name)}
                        className={`px-2 md:px-3 py-1 text-xs md:text-sm rounded-full transition-colors ${
                          formData.surprise_themes.includes(theme.name)
                            ? 'bg-wine-burgundy text-white'
                            : 'bg-warm-beige text-slate hover:bg-wine-rose/20'
                        }`}
                      >
                        {theme.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Custom Theme */}
              <div className="bg-white rounded-2xl shadow p-4 md:p-6 mb-6 border border-warm-beige">
                <h3 className="text-base md:text-lg font-display font-semibold text-charcoal mb-4">Add Custom Theme</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTheme}
                    onChange={(e) => setNewTheme(e.target.value)}
                    placeholder="New theme name..."
                    className="flex-1 p-2 md:p-3 rounded-lg border border-warm-beige focus:border-wine-rose focus:ring-2 focus:ring-wine-rose/20 outline-none text-sm md:text-base"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addCustomTheme()
                      }
                    }}
                  />
                  <button
                    onClick={addCustomTheme}
                    disabled={!newTheme.trim()}
                    className="px-4 md:px-6 py-2 bg-valley-deep hover:bg-valley-sage disabled:bg-taupe text-white rounded-lg transition-colors font-medium text-sm md:text-base"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Intensity Score & Pain Category */}
              <div className="bg-white rounded-2xl shadow p-4 md:p-6 mb-6 border border-warm-beige">
                <h3 className="text-base md:text-lg font-display font-semibold text-charcoal mb-4">Pain Point Scoring</h3>
                
                <div className="mb-6">
                  <div className="mb-2 text-xs md:text-sm font-medium text-slate">
                    Intensity Score (based on emotional language)
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => setFormData({ ...formData, intensity_score: n })}
                        className={`flex-1 py-2 md:py-3 rounded-lg font-medium transition-all text-sm md:text-base ${
                          formData.intensity_score === n
                            ? 'bg-wine-burgundy text-white'
                            : 'bg-warm-beige text-slate hover:bg-wine-rose/20'
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
                  <div className="mb-2 text-xs md:text-sm font-medium text-slate">Primary Pain Category</div>
                  <select
                    value={formData.pain_category}
                    onChange={(e) => setFormData({ ...formData, pain_category: e.target.value })}
                    className="w-full p-2 md:p-3 rounded-lg border border-warm-beige focus:border-wine-rose outline-none text-sm md:text-base"
                  >
                    <option value="">Select primary category...</option>
                    {themes.map((theme) => (
                      <option key={theme.id || theme.name} value={theme.name}>{theme.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Review Notes */}
              <div className="bg-white rounded-2xl shadow p-4 md:p-6 mb-6 border border-warm-beige">
                <h3 className="text-base md:text-lg font-display font-semibold text-charcoal mb-4">Review Notes</h3>
                <textarea
                  value={formData.review_notes}
                  onChange={(e) => setFormData({ ...formData, review_notes: e.target.value })}
                  placeholder="Any observations, patterns, or follow-up ideas..."
                  className="w-full h-24 md:h-32 p-3 md:p-4 rounded-lg border border-warm-beige focus:border-wine-rose focus:ring-2 focus:ring-wine-rose/20 outline-none resize-none text-sm md:text-base"
                />
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={saveReview}
                  disabled={saving}
                  className="px-6 md:px-8 py-2 md:py-3 bg-wine-burgundy hover:bg-wine-deep disabled:bg-taupe text-white font-medium rounded-lg transition-colors text-sm md:text-base"
                >
                  {saving ? 'Saving...' : formData.reviewed ? 'Update Review' : 'Save Review'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-taupe p-6 text-center">
              <WineLogo className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-sm md:text-base">Select a response from the sidebar to review</p>
              <button
                onClick={() => setSidebarOpen(true)}
                className="mt-4 md:hidden px-4 py-2 bg-wine-burgundy text-white rounded-lg text-sm"
              >
                Open Response List
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}