'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const LODGING_TYPES = [
  'Hotel', 'Boutique Hotel', 'B&B', 'Inn', 'Cabin', 'Cottage',
  'Winery Lodging', 'Vacation Rental', 'Campground', 'Resort', 'Guest House',
]

const PRICE_TIERS = ['budget', 'moderate', 'upscale', 'luxury']

const DEFAULT_VIBES = [
  'Romantic', 'Family-Friendly', 'Rustic', 'Modern', 'Historic', 'Scenic Views',
  'Peaceful', 'Pet-Friendly', 'Wine Country', 'Cozy', 'Luxurious', 'Boutique', 'Charming', 'Secluded',
]

const DEFAULT_BEST_FOR = [
  'Couples', 'Families', 'Groups', 'Solo travelers', 'Wine enthusiasts', 'Nature lovers',
  'Romantic getaway', 'Girls trip', 'Anniversary', 'Pet owners', 'Business travelers',
  'Wedding parties', 'Bachelor/Bachelorette',
]

const DEFAULT_AMENITIES = [
  'WiFi', 'Free Parking', 'Pool', 'Hot Tub', 'Breakfast Included', 'Full Kitchen',
  'Kitchenette', 'Air Conditioning', 'Fireplace', 'Balcony/Patio', 'Pet Friendly',
  'EV Charging', 'Fitness Center', 'Restaurant On-site', 'Room Service', 'Laundry',
  'Concierge', 'Wine Storage', 'Vineyard Views', 'Fire Pit', 'BBQ/Grill', 'Game Room', 'Spa Services',
]

export default function LodgingReviewPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [lodgings, setLodgings] = useState([])
  const [wineries, setWineries] = useState([])
  const [selectedLodging, setSelectedLodging] = useState(null)
  const [filter, setFilter] = useState('all')
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({})

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
    const { data: lodgingData } = await supabase.from('lodging').select('*').order('name')
    setLodgings(lodgingData || [])
    const { data: wineryData } = await supabase.from('wineries').select('id, name').eq('active', true).order('name')
    setWineries(wineryData || [])
    setLoading(false)
  }

  useEffect(() => { if (authenticated) fetchData() }, [authenticated])

  const selectLodging = (lodging) => {
    setSelectedLodging(lodging)
    setFormData({
      name: lodging.name || '', slug: lodging.slug || '', tagline: lodging.tagline || '',
      description: lodging.description || '', lodging_type: lodging.lodging_type || '',
      price_tier: lodging.price_tier || '', price_range: lodging.price_range || '',
      address: lodging.address || '', city: lodging.city || '', state: lodging.state || 'NC',
      zip_code: lodging.zip_code || '', latitude: lodging.latitude || '', longitude: lodging.longitude || '',
      phone: lodging.phone || '', email: lodging.email || '', website: lodging.website || '',
      booking_url: lodging.booking_url || '', room_count: lodging.room_count || '',
      max_guests: lodging.max_guests || '', check_in_time: lodging.check_in_time || '',
      check_out_time: lodging.check_out_time || '', minimum_stay: lodging.minimum_stay || 1,
      vibe_tags: lodging.vibe_tags || [], best_for: lodging.best_for || [], amenities: lodging.amenities || [],
      is_winery_lodging: lodging.is_winery_lodging || false, associated_winery_id: lodging.associated_winery_id || '',
      nearest_winery_id: lodging.nearest_winery_id || '', nearest_winery_minutes: lodging.nearest_winery_minutes || '',
      winery_distance_notes: lodging.winery_distance_notes || '', wine_packages_available: lodging.wine_packages_available || false,
      wine_package_notes: lodging.wine_package_notes || '', partnership_notes: lodging.partnership_notes || '',
      active: lodging.active !== false, featured: lodging.featured || false,
      priority_rank: lodging.priority_rank || 50, internal_notes: lodging.internal_notes || '',
    })
  }

  const toggleArrayField = (field, value) => {
    const current = formData[field] || []
    setFormData({ ...formData, [field]: current.includes(value) ? current.filter(v => v !== value) : [...current, value] })
  }

  const saveReview = async () => {
    if (!selectedLodging) return
    setSaving(true)
    const updateData = {
      ...formData,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      room_count: formData.room_count ? parseInt(formData.room_count) : null,
      max_guests: formData.max_guests ? parseInt(formData.max_guests) : null,
      minimum_stay: formData.minimum_stay ? parseInt(formData.minimum_stay) : 1,
      nearest_winery_minutes: formData.nearest_winery_minutes ? parseInt(formData.nearest_winery_minutes) : null,
      priority_rank: formData.priority_rank ? parseInt(formData.priority_rank) : 50,
      associated_winery_id: formData.associated_winery_id || null,
      nearest_winery_id: formData.nearest_winery_id || null,
    }
    const { error } = await supabase.from('lodging').update(updateData).eq('id', selectedLodging.id)
    if (error) { setError('Failed to save: ' + error.message) } 
    else {
      setLodgings(lodgings.map(l => l.id === selectedLodging.id ? { ...l, ...updateData } : l))
      setSelectedLodging({ ...selectedLodging, ...updateData })
      setError('')
    }
    setSaving(false)
  }

  const getFilteredLodgings = () => {
    let filtered = lodgings
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(l => l.name?.toLowerCase().includes(term) || l.city?.toLowerCase().includes(term))
    }
    switch (filter) {
      case 'incomplete': return filtered.filter(l => !l.vibe_tags?.length || !l.best_for?.length || !l.amenities?.length)
      case 'winery': return filtered.filter(l => l.is_winery_lodging)
      case 'featured': return filtered.filter(l => l.featured)
      case 'inactive': return filtered.filter(l => !l.active)
      default: return filtered
    }
  }

  const filteredLodgings = getFilteredLodgings()
  const currentIndex = filteredLodgings.findIndex(l => l.id === selectedLodging?.id)
  const goToNext = () => { if (currentIndex < filteredLodgings.length - 1) selectLodging(filteredLodgings[currentIndex + 1]) }
  const goToPrev = () => { if (currentIndex > 0) selectLodging(filteredLodgings[currentIndex - 1]) }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full">
          <h1 className="text-2xl font-bold text-stone-800 mb-2">Review Lodging</h1>
          <p className="text-stone-500 mb-6">Enter password to review and edit lodging</p>
          <form onSubmit={handleLogin}>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"
              className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 outline-none mb-4" />
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg">Enter</button>
          </form>
        </div>
      </div>
    )
  }

  if (loading) return <div className="min-h-screen bg-stone-100 flex items-center justify-center"><div className="text-stone-500">Loading...</div></div>

  const incompleteCount = lodgings.filter(l => !l.vibe_tags?.length || !l.best_for?.length).length

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-stone-200 flex flex-col">
          <div className="p-4 border-b border-stone-200">
            <h1 className="text-xl font-bold text-stone-800">Review Lodging</h1>
            <p className="text-sm text-stone-500">{lodgings.length} properties • {incompleteCount} incomplete</p>
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search..."
              className="w-full mt-3 text-sm border border-stone-200 rounded-lg px-3 py-2 focus:border-amber-400 outline-none" />
            <select value={filter} onChange={(e) => setFilter(e.target.value)}
              className="w-full mt-3 text-sm border border-stone-200 rounded-lg px-3 py-2 focus:border-amber-400 outline-none">
              <option value="all">All ({lodgings.length})</option>
              <option value="incomplete">Incomplete ({incompleteCount})</option>
              <option value="winery">Winery Lodging ({lodgings.filter(l => l.is_winery_lodging).length})</option>
              <option value="featured">Featured ({lodgings.filter(l => l.featured).length})</option>
              <option value="inactive">Inactive ({lodgings.filter(l => !l.active).length})</option>
            </select>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredLodgings.map((lodging) => (
              <button key={lodging.id} onClick={() => selectLodging(lodging)}
                className={`w-full p-4 text-left border-b border-stone-100 hover:bg-stone-50 ${selectedLodging?.id === lodging.id ? 'bg-amber-50 border-l-4 border-l-amber-500' : ''}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${lodging.is_winery_lodging ? 'bg-purple-100 text-purple-700' : 'bg-stone-100 text-stone-600'}`}>
                    {lodging.lodging_type || 'Unknown'}
                  </span>
                  <div className="flex gap-1">
                    {lodging.featured && <span className="text-xs">⭐</span>}
                    {!lodging.active && <span className="text-xs text-red-500">●</span>}
                  </div>
                </div>
                <p className="font-medium text-stone-800 line-clamp-1">{lodging.name}</p>
                <p className="text-xs text-stone-500 mt-0.5">{lodging.city} • {lodging.price_tier || 'No price'}</p>
              </button>
            ))}
          </div>
          <div className="p-4 border-t border-stone-200 space-y-2">
            <a href="/lodging/dashboard" className="block text-center text-sm text-amber-600 hover:text-amber-700 font-medium">← Dashboard</a>
            <a href="/lodging/analysis" className="block text-center text-sm text-stone-500 hover:text-stone-700">Analysis →</a>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedLodging ? (
            <div className="max-w-4xl mx-auto">
              {/* Navigation */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <button onClick={goToPrev} disabled={currentIndex <= 0} className="px-3 py-1 text-sm text-stone-600 hover:text-stone-800 disabled:opacity-50">← Prev</button>
                  <span className="text-sm text-stone-500">{currentIndex + 1} of {filteredLodgings.length}</span>
                  <button onClick={goToNext} disabled={currentIndex >= filteredLodgings.length - 1} className="px-3 py-1 text-sm text-stone-600 hover:text-stone-800 disabled:opacity-50">Next →</button>
                </div>
                <div className="flex items-center gap-3">
                  {error && <span className="text-sm text-red-500">{error}</span>}
                  <button onClick={saveReview} disabled={saving} className="px-6 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-medium rounded-lg">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>

              {/* Basic Info */}
              <div className="bg-white rounded-2xl shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-stone-800 mb-4">Basic Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1">Name *</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1">Slug *</label>
                    <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-stone-600 mb-1">Tagline</label>
                    <input type="text" value={formData.tagline} onChange={(e) => setFormData({ ...formData, tagline: e.target.value })} placeholder="A short, catchy description..."
                      className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-stone-600 mb-1">Description</label>
                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 outline-none h-24 resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1">Lodging Type *</label>
                    <select value={formData.lodging_type} onChange={(e) => setFormData({ ...formData, lodging_type: e.target.value })}
                      className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 outline-none">
                      <option value="">Select type...</option>
                      {LODGING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1">Price Tier</label>
                    <select value={formData.price_tier} onChange={(e) => setFormData({ ...formData, price_tier: e.target.value })}
                      className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 outline-none">
                      <option value="">Select tier...</option>
                      {PRICE_TIERS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1">Price Range</label>
                    <input type="text" value={formData.price_range} onChange={(e) => setFormData({ ...formData, price_range: e.target.value })} placeholder="$150-250/night"
                      className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-600 mb-1">Room Count</label>
                      <input type="number" value={formData.room_count} onChange={(e) => setFormData({ ...formData, room_count: e.target.value })}
                        className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-600 mb-1">Max Guests</label>
                      <input type="number" value={formData.max_guests} onChange={(e) => setFormData({ ...formData, max_guests: e.target.value })}
                        className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 outline-none" />
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} className="w-4 h-4 text-amber-600 rounded" />
                    <span className="text-sm text-stone-700">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} className="w-4 h-4 text-amber-600 rounded" />
                    <span className="text-sm text-stone-700">Featured ⭐</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-stone-600">Priority:</label>
                    <input type="number" value={formData.priority_rank} onChange={(e) => setFormData({ ...formData, priority_rank: e.target.value })}
                      className="w-16 p-1 text-sm rounded border border-stone-200 focus:border-amber-400 outline-none" />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-white rounded-2xl shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-stone-800 mb-4">Location & Contact</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-stone-600 mb-1">Address *</label>
                    <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1">City *</label>
                    <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-600 mb-1">State</label>
                      <input type="text" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-600 mb-1">ZIP</label>
                      <input type="text" value={formData.zip_code} onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                        className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1">Latitude *</label>
                    <input type="text" value={formData.latitude} onChange={(e) => setFormData({ ...formData, latitude: e.target.value })} placeholder="36.2440"
                      className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1">Longitude *</label>
                    <input type="text" value={formData.longitude} onChange={(e) => setFormData({ ...formData, longitude: e.target.value })} placeholder="-80.8484"
                      className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 outline-none" />
                  </div>
                  <div><label className="block text-sm font-medium text-stone-600 mb-1">Phone</label>
                    <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 outline-none" /></div>
                  <div><label className="block text-sm font-medium text-stone-600 mb-1">Email</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 outline-none" /></div>
                  <div><label className="block text-sm font-medium text-stone-600 mb-1">Website</label>
                    <input type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 outline-none" /></div>
                  <div><label className="block text-sm font-medium text-stone-600 mb-1">Booking URL</label>
                    <input type="url" value={formData.booking_url} onChange={(e) => setFormData({ ...formData, booking_url: e.target.value })} className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 outline-none" /></div>
                </div>
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <div><label className="block text-sm font-medium text-stone-600 mb-1">Check-in Time</label>
                    <input type="text" value={formData.check_in_time} onChange={(e) => setFormData({ ...formData, check_in_time: e.target.value })} placeholder="3:00 PM" className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 outline-none" /></div>
                  <div><label className="block text-sm font-medium text-stone-600 mb-1">Check-out Time</label>
                    <input type="text" value={formData.check_out_time} onChange={(e) => setFormData({ ...formData, check_out_time: e.target.value })} placeholder="11:00 AM" className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 outline-none" /></div>
                  <div><label className="block text-sm font-medium text-stone-600 mb-1">Min Stay (nights)</label>
                    <input type="number" value={formData.minimum_stay} onChange={(e) => setFormData({ ...formData, minimum_stay: e.target.value })} className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 outline-none" /></div>
                </div>
              </div>

              {/* Winery Connection */}
              <div className="bg-white rounded-2xl shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-stone-800 mb-4">🍷 Winery Connection</h3>
                <div className="flex flex-wrap items-center gap-6 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.is_winery_lodging} onChange={(e) => setFormData({ ...formData, is_winery_lodging: e.target.checked })} className="w-4 h-4 text-purple-600 rounded" />
                    <span className="text-sm text-stone-700">Is Winery Lodging</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.wine_packages_available} onChange={(e) => setFormData({ ...formData, wine_packages_available: e.target.checked })} className="w-4 h-4 text-purple-600 rounded" />
                    <span className="text-sm text-stone-700">Wine Packages Available</span>
                  </label>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {formData.is_winery_lodging && (
                    <div><label className="block text-sm font-medium text-stone-600 mb-1">Associated Winery</label>
                      <select value={formData.associated_winery_id} onChange={(e) => setFormData({ ...formData, associated_winery_id: e.target.value })} className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 outline-none">
                        <option value="">Select winery...</option>
                        {wineries.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                      </select></div>
                  )}
                  <div><label className="block text-sm font-medium text-stone-600 mb-1">Nearest Winery</label>
                    <select value={formData.nearest_winery_id} onChange={(e) => setFormData({ ...formData, nearest_winery_id: e.target.value })} className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 outline-none">
                      <option value="">Select winery...</option>
                      {wineries.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select></div>
                  <div><label className="block text-sm font-medium text-stone-600 mb-1">Minutes to Nearest</label>
                    <input type="number" value={formData.nearest_winery_minutes} onChange={(e) => setFormData({ ...formData, nearest_winery_minutes: e.target.value })} placeholder="10" className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 outline-none" /></div>
                  <div className="md:col-span-2"><label className="block text-sm font-medium text-stone-600 mb-1">Winery Distance Notes</label>
                    <input type="text" value={formData.winery_distance_notes} onChange={(e) => setFormData({ ...formData, winery_distance_notes: e.target.value })} placeholder="Walking distance to 3 wineries..." className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 outline-none" /></div>
                  {formData.wine_packages_available && (
                    <div className="md:col-span-2"><label className="block text-sm font-medium text-stone-600 mb-1">Wine Package Notes</label>
                      <textarea value={formData.wine_package_notes} onChange={(e) => setFormData({ ...formData, wine_package_notes: e.target.value })} placeholder="Description of wine packages..." className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 outline-none h-20 resize-none" /></div>
                  )}
                  <div className="md:col-span-2"><label className="block text-sm font-medium text-stone-600 mb-1">Partnership Notes</label>
                    <textarea value={formData.partnership_notes} onChange={(e) => setFormData({ ...formData, partnership_notes: e.target.value })} placeholder="Partnership arrangements..." className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 outline-none h-20 resize-none" /></div>
                </div>
              </div>

              {/* Vibe Tags */}
              <div className="bg-white rounded-2xl shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-stone-800 mb-4">Vibe Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_VIBES.map(v => (
                    <button key={v} onClick={() => toggleArrayField('vibe_tags', v)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${formData.vibe_tags?.includes(v) ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>{v}</button>
                  ))}
                </div>
              </div>

              {/* Best For */}
              <div className="bg-white rounded-2xl shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-stone-800 mb-4">Best For</h3>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_BEST_FOR.map(b => (
                    <button key={b} onClick={() => toggleArrayField('best_for', b)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${formData.best_for?.includes(b) ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>{b}</button>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div className="bg-white rounded-2xl shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-stone-800 mb-4">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_AMENITIES.map(a => (
                    <button key={a} onClick={() => toggleArrayField('amenities', a)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${formData.amenities?.includes(a) ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>{a}</button>
                  ))}
                </div>
              </div>

              {/* Internal Notes */}
              <div className="bg-white rounded-2xl shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-stone-800 mb-4">Internal Notes</h3>
                <textarea value={formData.internal_notes} onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })} placeholder="Any internal notes..."
                  className="w-full h-32 p-4 rounded-lg border border-stone-200 focus:border-amber-400 outline-none resize-none" />
              </div>

              <div className="flex justify-end">
                <button onClick={saveReview} disabled={saving} className="px-8 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-medium rounded-lg">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-stone-400">Select a property from the sidebar to review</div>
          )}
        </div>
      </div>
    </div>
  )
}