'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function WineryAdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [wineries, setWineries] = useState([])
  const [selectedWinery, setSelectedWinery] = useState(null)
  const [filter, setFilter] = useState('pending') // 'all', 'pending', 'approved', 'rejected'
  const [saving, setSaving] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const correctPassword = process.env.NEXT_PUBLIC_DASHBOARD_PASSWORD || 'valleysomm2024'

  // Form state for selected winery
  const [formData, setFormData] = useState({
    status: 'pending', // 'pending', 'approved', 'rejected'
    admin_notes: '',
    featured: false,
    active: true,
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
    
    // Fetch wineries from database
    const { data: wineryData, error: wineryError } = await supabase
      .from('wineries')
      .select('*')
      .order('created_at', { ascending: false })

    if (wineryError) {
      console.error('Error fetching wineries:', wineryError)
    } else {
      setWineries(wineryData || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    if (authenticated) {
      fetchData()
    }
  }, [authenticated])

  const selectWinery = (winery) => {
    setSelectedWinery(winery)
    setFormData({
      status: winery.status || 'pending',
      admin_notes: winery.admin_notes || '',
      featured: winery.featured || false,
      active: winery.active !== false,
    })
    // Close sidebar on mobile after selecting
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }

  const saveReview = async (newStatus) => {
    if (!selectedWinery) return
    
    setSaving(true)
    
    const updateData = {
      ...formData,
      status: newStatus || formData.status,
      reviewed_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('wineries')
      .update(updateData)
      .eq('id', selectedWinery.id)

    if (error) {
      console.error('Error saving review:', error)
      setError('Failed to save review')
    } else {
      // Update local state
      setWineries(wineries.map((w) => 
        w.id === selectedWinery.id 
          ? { ...w, ...updateData }
          : w
      ))
      setFormData({ ...formData, status: newStatus || formData.status })
      setSelectedWinery({ ...selectedWinery, ...updateData })
    }
    
    setSaving(false)
  }

  const goToNext = () => {
    const filtered = getFilteredWineries()
    const currentIndex = filtered.findIndex((w) => w.id === selectedWinery?.id)
    if (currentIndex < filtered.length - 1) {
      selectWinery(filtered[currentIndex + 1])
    }
  }

  const goToPrev = () => {
    const filtered = getFilteredWineries()
    const currentIndex = filtered.findIndex((w) => w.id === selectedWinery?.id)
    if (currentIndex > 0) {
      selectWinery(filtered[currentIndex - 1])
    }
  }

  const getFilteredWineries = () => {
    switch (filter) {
      case 'approved':
        return wineries.filter((w) => w.status === 'approved')
      case 'rejected':
        return wineries.filter((w) => w.status === 'rejected')
      case 'pending':
        return wineries.filter((w) => !w.status || w.status === 'pending')
      default:
        return wineries
    }
  }

  // Password screen
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full">
          <h1 className="text-2xl font-bold text-stone-800 mb-2">Winery Admin</h1>
          <p className="text-stone-500 mb-6">Enter password to review and approve wineries</p>
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
        <div className="text-stone-500">Loading wineries...</div>
      </div>
    )
  }

  const filteredWineries = getFilteredWineries()
  const pendingCount = wineries.filter((w) => !w.status || w.status === 'pending').length
  const approvedCount = wineries.filter((w) => w.status === 'approved').length
  const currentIndex = filteredWineries.findIndex((w) => w.id === selectedWinery?.id)

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-stone-200 p-4 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-bold text-stone-800">Winery Admin</h1>
              <p className="text-xs text-stone-500">{pendingCount} pending</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-screen lg:pt-0 pt-[73px]">
        {/* Sidebar - Winery List */}
        <div className={`
          fixed lg:static inset-0 z-30 lg:z-0
          w-full lg:w-80 bg-white border-r border-stone-200 
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 -z-10"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <div className="p-4 border-b border-stone-200 lg:block hidden">
            <h1 className="text-xl font-bold text-stone-800">Winery Admin</h1>
            <p className="text-sm text-stone-500">{approvedCount} approved • {pendingCount} pending</p>
            
            <div className="mt-3">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2 focus:border-amber-400 outline-none"
              >
                <option value="all">All Wineries ({wineries.length})</option>
                <option value="pending">Pending ({pendingCount})</option>
                <option value="approved">Approved ({approvedCount})</option>
                <option value="rejected">Rejected ({wineries.filter(w => w.status === 'rejected').length})</option>
              </select>
            </div>
          </div>

          {/* Mobile filter */}
          <div className="p-4 border-b border-stone-200 lg:hidden">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2 focus:border-amber-400 outline-none"
            >
              <option value="all">All ({wineries.length})</option>
              <option value="pending">Pending ({pendingCount})</option>
              <option value="approved">Approved ({approvedCount})</option>
              <option value="rejected">Rejected ({wineries.filter(w => w.status === 'rejected').length})</option>
            </select>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredWineries.map((winery) => (
              <button
                key={winery.id}
                onClick={() => selectWinery(winery)}
                className={`w-full p-4 text-left border-b border-stone-100 hover:bg-stone-50 transition-colors ${
                  selectedWinery?.id === winery.id ? 'bg-amber-50 border-l-4 border-l-amber-500' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-stone-800 text-sm">{winery.name}</h3>
                  {winery.status === 'approved' ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Approved</span>
                  ) : winery.status === 'rejected' ? (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Rejected</span>
                  ) : (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Pending</span>
                  )}
                </div>
                <p className="text-xs text-stone-500 mb-1">{winery.city}, {winery.state}</p>
                {winery.wine_styles && winery.wine_styles.length > 0 && (
                  <p className="text-xs text-stone-400">{winery.wine_styles.slice(0, 2).join(', ')}</p>
                )}
                {winery.featured && (
                  <span className="inline-block mt-1 text-xs bg-amber-500 text-white px-2 py-0.5 rounded">⭐ Featured</span>
                )}
              </button>
            ))}
            {filteredWineries.length === 0 && (
              <div className="p-8 text-center text-stone-400">
                <p>No wineries found</p>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-stone-200">
            <a
              href="/dashboard"
              className="block text-center text-sm text-amber-600 hover:text-amber-700 font-medium"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>

        {/* Main Content - Winery Detail */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {selectedWinery ? (
            <div className="max-w-4xl mx-auto">
              {/* Navigation - Desktop */}
              <div className="lg:flex items-center justify-between mb-6 hidden">
                <div className="flex items-center gap-4">
                  <button
                    onClick={goToPrev}
                    disabled={currentIndex <= 0}
                    className="px-3 py-1 text-sm text-stone-600 hover:text-stone-800 disabled:opacity-50"
                  >
                    ← Prev
                  </button>
                  <span className="text-sm text-stone-500">
                    {currentIndex + 1} of {filteredWineries.length}
                  </span>
                  <button
                    onClick={goToNext}
                    disabled={currentIndex >= filteredWineries.length - 1}
                    className="px-3 py-1 text-sm text-stone-600 hover:text-stone-800 disabled:opacity-50"
                  >
                    Next →
                  </button>
                </div>
              </div>

              {/* Navigation - Mobile */}
              <div className="lg:hidden flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPrev}
                    disabled={currentIndex <= 0}
                    className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-sm text-stone-600 font-medium">
                    {currentIndex + 1} / {filteredWineries.length}
                  </span>
                  <button
                    onClick={goToNext}
                    disabled={currentIndex >= filteredWineries.length - 1}
                    className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Winery Header */}
              <div className="bg-white rounded-2xl shadow p-4 lg:p-6 mb-4 lg:mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl lg:text-3xl font-bold text-stone-800 mb-2">{selectedWinery.name}</h2>
                    <p className="text-stone-600">{selectedWinery.address}</p>
                    <p className="text-stone-600">{selectedWinery.city}, {selectedWinery.state} {selectedWinery.zip}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {selectedWinery.status === 'approved' && (
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">✓ Approved</span>
                    )}
                    {selectedWinery.status === 'rejected' && (
                      <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">✗ Rejected</span>
                    )}
                    {(!selectedWinery.status || selectedWinery.status === 'pending') && (
                      <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">⏳ Pending</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-stone-500 block text-xs mb-1">Phone</span>
                    <p className="font-medium text-stone-800">{selectedWinery.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-xs mb-1">Website</span>
                    {selectedWinery.website ? (
                      <a href={selectedWinery.website} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-700 font-medium">
                        Visit →
                      </a>
                    ) : (
                      <p className="text-stone-400">N/A</p>
                    )}
                  </div>
                  <div>
                    <span className="text-stone-500 block text-xs mb-1">Submitted</span>
                    <p className="font-medium text-stone-800">{new Date(selectedWinery.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-xs mb-1">Status</span>
                    <p className="font-medium text-stone-800">{formData.active ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedWinery.description && (
                <div className="bg-white rounded-2xl shadow p-4 lg:p-6 mb-4 lg:mb-6">
                  <h3 className="text-lg font-semibold text-stone-800 mb-3">Description</h3>
                  <p className="text-stone-700 leading-relaxed">{selectedWinery.description}</p>
                </div>
              )}

              {/* Details Grid */}
              <div className="grid lg:grid-cols-2 gap-4 lg:gap-6 mb-4 lg:mb-6">
                {/* Wine Styles */}
                {selectedWinery.wine_styles && selectedWinery.wine_styles.length > 0 && (
                  <div className="bg-white rounded-2xl shadow p-4 lg:p-6">
                    <h3 className="text-lg font-semibold text-stone-800 mb-3">Wine Styles</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedWinery.wine_styles.map((style, i) => (
                        <span key={i} className="px-3 py-1 bg-stone-100 text-stone-700 rounded-full text-sm">
                          {style}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Amenities */}
                {selectedWinery.amenities && selectedWinery.amenities.length > 0 && (
                  <div className="bg-white rounded-2xl shadow p-4 lg:p-6">
                    <h3 className="text-lg font-semibold text-stone-800 mb-3">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedWinery.amenities.map((amenity, i) => (
                        <span key={i} className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Hours */}
              {selectedWinery.hours && (
                <div className="bg-white rounded-2xl shadow p-4 lg:p-6 mb-4 lg:mb-6">
                  <h3 className="text-lg font-semibold text-stone-800 mb-3">Hours</h3>
                  <p className="text-stone-700 whitespace-pre-line">{selectedWinery.hours}</p>
                </div>
              )}

              {/* Admin Controls */}
              <div className="bg-white rounded-2xl shadow p-4 lg:p-6 mb-4 lg:mb-6">
                <h3 className="text-lg font-semibold text-stone-800 mb-4">Admin Controls</h3>
                
                <div className="space-y-4">
                  {/* Featured Toggle */}
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-stone-200 hover:border-amber-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                    />
                    <div>
                      <span className="font-medium text-stone-800">Featured Winery</span>
                      <p className="text-xs text-stone-500">Highlight in app and recommendations</p>
                    </div>
                  </label>

                  {/* Active Toggle */}
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-stone-200 hover:border-amber-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                    />
                    <div>
                      <span className="font-medium text-stone-800">Active</span>
                      <p className="text-xs text-stone-500">Show in public listings</p>
                    </div>
                  </label>

                  {/* Admin Notes */}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Admin Notes</label>
                    <textarea
                      value={formData.admin_notes}
                      onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                      placeholder="Internal notes about this winery..."
                      className="w-full h-24 p-3 rounded-lg border border-stone-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none resize-none text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-white rounded-2xl shadow p-4 lg:p-6 mb-20 lg:mb-6">
                <div className="flex flex-col lg:flex-row gap-3">
                  <button
                    onClick={() => saveReview('approved')}
                    disabled={saving}
                    className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-medium rounded-lg transition-colors"
                  >
                    {saving ? 'Saving...' : '✓ Approve Winery'}
                  </button>
                  <button
                    onClick={() => saveReview('rejected')}
                    disabled={saving}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-medium rounded-lg transition-colors"
                  >
                    {saving ? 'Saving...' : '✗ Reject Winery'}
                  </button>
                  <button
                    onClick={() => saveReview()}
                    disabled={saving}
                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-medium rounded-lg transition-colors"
                  >
                    {saving ? 'Saving...' : '💾 Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-stone-400">
              <div className="text-center">
                <p className="text-lg mb-2">No winery selected</p>
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-amber-600 hover:text-amber-700 font-medium"
                >
                  Open menu to select
                </button>
                <p className="hidden lg:block text-sm">Select a winery from the sidebar to review</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}