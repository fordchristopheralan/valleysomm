'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function WineryAdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState(null)

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

  const fetchSubmissions = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('wineries')
      .select('*')
      .eq('active', false)
      .order('created_at', { ascending: false })

    if (!error) {
      setSubmissions(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    if (authenticated) {
      fetchSubmissions()
    }
  }, [authenticated])

  const approveSubmission = async (id) => {
    const { error } = await supabase
      .from('wineries')
      .update({ 
        active: true, 
        owner_verified: true,
        last_verified_at: new Date().toISOString()
      })
      .eq('id', id)

    if (!error) {
      // Remove from list
      setSubmissions(submissions.filter(s => s.id !== id))
      setSelectedSubmission(null)
      
      // TODO: Send approval email to winery contact
      alert('Winery approved! Consider sending confirmation email.')
    }
  }

  const rejectSubmission = async (id, reason) => {
    const confirmed = window.confirm(
      `Reject this submission?\n\nReason: ${reason}\n\nThis will delete the entry. You should email them first to explain why.`
    )
    
    if (confirmed) {
      const { error } = await supabase
        .from('wineries')
        .delete()
        .eq('id', id)

      if (!error) {
        setSubmissions(submissions.filter(s => s.id !== id))
        setSelectedSubmission(null)
      }
    }
  }

  const updateSubmission = async (id, updates) => {
    const { error } = await supabase
      .from('wineries')
      .update(updates)
      .eq('id', id)

    if (!error) {
      fetchSubmissions()
      alert('Updated successfully!')
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full">
          <h1 className="text-2xl font-bold text-stone-800 mb-2">Winery Admin</h1>
          <p className="text-stone-500 mb-6">Review & approve winery submissions</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 outline-none mb-4"
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
        <div className="text-stone-500">Loading submissions...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="flex h-screen">
        {/* Sidebar - Submission List */}
        <div className="w-80 bg-white border-r border-stone-200 flex flex-col">
          <div className="p-4 border-b border-stone-200">
            <h1 className="text-xl font-bold text-stone-800">Pending Wineries</h1>
            <p className="text-sm text-stone-500">{submissions.length} awaiting review</p>
            <a href="/dashboard" className="text-sm text-amber-600 hover:text-amber-700 mt-2 block">
              ← Back to Dashboard
            </a>
          </div>

          <div className="flex-1 overflow-y-auto">
            {submissions.length === 0 ? (
              <div className="p-8 text-center text-stone-400">
                No pending submissions
              </div>
            ) : (
              submissions.map((submission) => (
                <button
                  key={submission.id}
                  onClick={() => setSelectedSubmission(submission)}
                  className={`w-full p-4 text-left border-b border-stone-100 hover:bg-stone-50 transition-colors ${
                    selectedSubmission?.id === submission.id ? 'bg-amber-50 border-l-4 border-l-amber-500' : ''
                  }`}
                >
                  <div className="font-medium text-stone-800">{submission.name}</div>
                  <div className="text-sm text-stone-500">{submission.city}, NC</div>
                  <div className="text-xs text-stone-400 mt-1">
                    {new Date(submission.created_at).toLocaleDateString()}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main Content - Submission Detail */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedSubmission ? (
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="bg-white rounded-2xl shadow p-6 mb-6">
                <h2 className="text-2xl font-bold text-stone-800 mb-2">
                  {selectedSubmission.name}
                </h2>
                <p className="text-stone-500 mb-4">{selectedSubmission.tagline}</p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => approveSubmission(selectedSubmission.id)}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                  >
                    ✓ Approve & Publish
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Why are you rejecting this submission?')
                      if (reason) rejectSubmission(selectedSubmission.id, reason)
                    }}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white rounded-2xl shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-stone-800 mb-3">Contact Person</h3>
                {selectedSubmission.internal_notes && (
                  <div className="bg-amber-50 p-4 rounded-lg text-sm text-stone-700 whitespace-pre-wrap">
                    {selectedSubmission.internal_notes}
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="bg-white rounded-2xl shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-stone-800 mb-3">Basic Information</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-stone-500">Address:</span>
                    <p className="font-medium">{selectedSubmission.address}, {selectedSubmission.city}, NC {selectedSubmission.zip_code}</p>
                  </div>
                  <div>
                    <span className="text-stone-500">Phone:</span>
                    <p className="font-medium">{selectedSubmission.phone}</p>
                  </div>
                  <div>
                    <span className="text-stone-500">Website:</span>
                    <p className="font-medium">
                      {selectedSubmission.website ? (
                        <a href={selectedSubmission.website} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-700">
                          {selectedSubmission.website}
                        </a>
                      ) : 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <span className="text-stone-500">Email:</span>
                    <p className="font-medium">{selectedSubmission.email || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Hours */}
              <div className="bg-white rounded-2xl shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-stone-800 mb-3">Hours</h3>
                <div className="grid md:grid-cols-2 gap-2 text-sm">
                  {selectedSubmission.hours && Object.entries(selectedSubmission.hours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between">
                      <span className="text-stone-500 capitalize">{day}:</span>
                      <span className="font-medium">{hours}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Wine Profile */}
              <div className="bg-white rounded-2xl shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-stone-800 mb-3">Wine Profile</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-stone-500">Wine Styles:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedSubmission.wine_styles?.map(style => (
                        <span key={style} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                          {style}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-stone-500">Signature Wines:</span>
                    <p className="font-medium">{selectedSubmission.signature_wines?.join(', ') || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-stone-500">Vibe Tags:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedSubmission.vibe_tags?.map(vibe => (
                        <span key={vibe} className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs">
                          {vibe}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Reservations & Pricing */}
              <div className="bg-white rounded-2xl shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-stone-800 mb-3">Reservations & Pricing</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-stone-500">Reservation Policy:</span>
                    <p className="font-medium capitalize">{selectedSubmission.reservation_policy?.replace('-', ' ')}</p>
                  </div>
                  <div>
                    <span className="text-stone-500">Tasting Fee:</span>
                    <p className="font-medium">{selectedSubmission.tasting_fee_range || 'Not provided'}</p>
                  </div>
                  {selectedSubmission.reservation_notes && (
                    <div className="md:col-span-2">
                      <span className="text-stone-500">Notes:</span>
                      <p className="font-medium">{selectedSubmission.reservation_notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Food & Amenities */}
              <div className="bg-white rounded-2xl shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-stone-800 mb-3">Food & Amenities</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-stone-500">Food:</span>
                    <p className="font-medium capitalize">{selectedSubmission.food_available?.replace('-', ' ')}</p>
                    {selectedSubmission.food_notes && (
                      <p className="text-stone-600 mt-1">{selectedSubmission.food_notes}</p>
                    )}
                  </div>
                  <div className="flex gap-4">
                    {selectedSubmission.outdoor_seating && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        ✓ Outdoor Seating
                      </span>
                    )}
                    {selectedSubmission.pet_friendly && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        ✓ Pet Friendly
                      </span>
                    )}
                    {selectedSubmission.wheelchair_accessible && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        ✓ Accessible
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-stone-800 mb-3">Description</h3>
                <p className="text-stone-700">{selectedSubmission.description}</p>
              </div>

              {/* Social Media */}
              {(selectedSubmission.instagram_handle || selectedSubmission.facebook_url) && (
                <div className="bg-white rounded-2xl shadow p-6 mb-6">
                  <h3 className="text-lg font-semibold text-stone-800 mb-3">Social Media</h3>
                  <div className="space-y-2 text-sm">
                    {selectedSubmission.instagram_handle && (
                      <div>
                        <span className="text-stone-500">Instagram:</span>
                        <a 
                          href={`https://instagram.com/${selectedSubmission.instagram_handle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-amber-600 hover:text-amber-700 ml-2"
                        >
                          @{selectedSubmission.instagram_handle}
                        </a>
                      </div>
                    )}
                    {selectedSubmission.facebook_url && (
                      <div>
                        <span className="text-stone-500">Facebook:</span>
                        <a 
                          href={selectedSubmission.facebook_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-amber-600 hover:text-amber-700 ml-2"
                        >
                          View Page
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Admin Actions */}
              <div className="bg-white rounded-2xl shadow p-6">
                <h3 className="text-lg font-semibold text-stone-800 mb-3">Admin Actions</h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => approveSubmission(selectedSubmission.id)}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                  >
                    ✓ Approve & Publish
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Why are you rejecting this submission?')
                      if (reason) rejectSubmission(selectedSubmission.id, reason)
                    }}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                  >
                    ✗ Reject
                  </button>
                  <button
                    onClick={() => {
                      // Open edit modal or inline editing
                      alert('Edit functionality coming soon. For now, approve and edit via main dashboard.')
                    }}
                    className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
                  >
                    ✏️ Edit Before Approving
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-stone-400">
              Select a submission from the sidebar to review
            </div>
          )}
        </div>
      </div>
    </div>
  )
}