'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const LODGING_TYPES = [
  'B&B / Inn',
  'Hotel',
  'Boutique Hotel',
  'Vacation Rental',
  'Cabin',
  'Cottage',
  'Farmhouse',
  'Campground',
  'Glamping',
  'Resort',
  'Winery Lodging'
]

const PRICE_TIERS = [
  'Budget ($)',
  'Moderate ($$)',
  'Upscale ($$$)',
  'Luxury ($$$$)'
]

const AMENITIES_OPTIONS = [
  'WiFi',
  'Pool',
  'Hot Tub',
  'Fireplace',
  'Kitchen',
  'Breakfast Included',
  'Pet Friendly',
  'Wheelchair Accessible',
  'Air Conditioning',
  'Heating',
  'Parking',
  'EV Charging',
  'Outdoor Space',
  'Patio/Deck',
  'Grill/BBQ',
  'Fire Pit',
  'Scenic Views',
  'Vineyard Views',
  'Private Entrance',
  'Concierge',
  'Spa Services',
  'Fitness Center',
  'Game Room',
  'Kids Activities'
]

const VIBE_TAGS = [
  'Romantic',
  'Family-Friendly',
  'Pet-Friendly',
  'Rustic',
  'Modern',
  'Historic',
  'Luxurious',
  'Cozy',
  'Scenic',
  'Secluded',
  'Central Location',
  'Wine Country',
  'Farm Stay',
  'Eco-Friendly',
  'Adults Only'
]

const BEST_FOR_OPTIONS = [
  'Couples',
  'Families',
  'Solo Travelers',
  'Groups',
  'Wine Enthusiasts',
  'Romantic Getaway',
  'Anniversary',
  'Wedding Party',
  'Girls Trip',
  'Guys Trip',
  'Business Travel',
  'Pet Owners',
  'Nature Lovers',
  'Budget Travelers',
  'Luxury Seekers'
]

export default function LodgingReviewPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [lodgings, setLodgings] = useState([])
  const [selectedLodging, setSelectedLodging] = useState(null)
  const [filter, setFilter] = useState('all') // 'all', 'incomplete', 'complete', 'featured'
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Form state for selected lodging
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
    
    const { data: lodgingData, error: lodgingError } = await supabase
      .from('lodging')
      .select('*')
      .order('name', { ascending: true })

    if (lodgingError) {
      console.error('Error fetching lodgings:', lodgingError)
    } else {
      setLodgings(lodgingData || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    if (authenticated) {
      fetchData()
    }
  }, [authenticated])

  const selectLodging = (lodging) => {
    setSelectedLodging(lodging)
    setFormData({
      name: lodging.name || '',
      slug: lodging.slug || '',
      description: lodging.description || '',
      tagline: lodging.tagline || '',
      address: lodging.address || '',
      city: lodging.city || '',
      state: lodging.state || 'NC',
      zip_code: lodging.zip_code || '',
      latitude: lodging.latitude || '',
      longitude: lodging.longitude || '',
      phone: lodging.phone || '',
      website: lodging.website || '',
      email: lodging.email || '',
      booking_url: lodging.booking_url || '',
      lodging_type: lodging.lodging_type || '',
      price_tier: lodging.price_tier || '',
      price_range: lodging.price_range || '',
      room_count: lodging.room_count || '',
      max_guests: lodging.max_guests || '',
      amenities: lodging.amenities || [],
      winery_distance_notes: lodging.winery_distance_notes || '',
      nearest_winery_minutes: lodging.nearest_winery_minutes || '',
      wine_packages_available: lodging.wine_packages_available || false,
      wine_package_notes: lodging.wine_package_notes || '',
      vibe_tags: lodging.vibe_tags || [],
      best_for: lodging.best_for || [],
      check_in_time: lodging.check_in_time || '',
      check_out_time: lodging.check_out_time || '',
      minimum_stay: lodging.minimum_stay || 1,
      partnership_notes: lodging.partnership_notes || '',
      is_winery_lodging: lodging.is_winery_lodging || false,
      active: lodging.active ?? true,
      featured: lodging.featured || false,
      priority_rank: lodging.priority_rank || 50,
      data_source: lodging.data_source || '',
      data_completeness_score: lodging.data_completeness_score || 0,
      internal_notes: lodging.internal_notes || '',
    })
  }

  const toggleArrayField = (field, value) => {
    const current = formData[field] || []
    if (current.includes(value)) {
      setFormData({ ...formData, [field]: current.filter((v) => v !== value) })
    } else {
      setFormData({ ...formData, [field]: [...current, value] })
    }
  }

  const saveChanges = async () => {
    if (!selectedLodging) return
    
    setSaving(true)
    setError('')
    
    // Calculate completeness score
    let completenessScore = 0
    const fields = ['name', 'address', 'city', 'phone', 'website', 'description', 'lodging_type', 'price_tier']
    fields.forEach(field => {
      if (formData[field]) completenessScore += 10
    })
    if (formData.amenities?.length > 0) completenessScore += 10
    if (formData.vibe_tags?.length > 0) completenessScore += 10
    
    const { error: updateError } = await supabase
      .from('lodging')
      .update({
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        tagline: formData.tagline,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        phone: formData.phone,
        website: formData.website,
        email: formData.email,
        booking_url: formData.booking_url,
        lodging_type: formData.lodging_type,
        price_tier: formData.price_tier,
        price_range: formData.price_range,
        room_count: formData.room_count ? parseInt(formData.room_count) : null,
        max_guests: formData.max_guests ? parseInt(formData.max_guests) : null,
        amenities: formData.amenities,
        winery_distance_notes: formData.winery_distance_notes,
        nearest_winery_minutes: formData.nearest_winery_minutes ? parseInt(formData.nearest_winery_minutes) : null,
        wine_packages_available: formData.wine_packages_available,
        wine_package_notes: formData.wine_package_notes,
        vibe_tags: formData.vibe_tags,
        best_for: formData.best_for,
        check_in_time: formData.check_in_time,
        check_out_time: formData.check_out_time,
        minimum_stay: formData.minimum_stay ? parseInt(formData.minimum_stay) : 1,
        partnership_notes: formData.partnership_notes,
        is_winery_lodging: formData.is_winery_lodging,
        active: formData.active,
        featured: formData.featured,
        priority_rank: formData.priority_rank ? parseInt(formData.priority_rank) : 50,
        data_source: formData.data_source,
        data_completeness_score: completenessScore,
        internal_notes: formData.internal_notes,
        last_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', selectedLodging.id)

    if (updateError) {
      console.error('Error saving lodging:', updateError)
      setError('Failed to save changes')
    } else {
      // Update local state
      setLodgings(lodgings.map((l) => 
        l.id === selectedLodging.id 
          ? { ...l, ...formData, data_completeness_score: completenessScore }
          : l
      ))
      setSelectedLodging({ ...selectedLodging, ...formData, data_completeness_score: completenessScore })
    }
    
    setSaving(false)
  }

  const goToNext = () => {
    const filtered = getFilteredLodgings()
    const currentIndex = filtered.findIndex((l) => l.id === selectedLodging?.id)
    if (currentIndex < filtered.length - 1) {
      selectLodging(filtered[currentIndex + 1])
    }
  }

  const goToPrev = () => {
    const filtered = getFilteredLodgings()
    const currentIndex = filtered.findIndex((l) => l.id === selectedLodging?.id)
    if (currentIndex > 0) {
      selectLodging(filtered[currentIndex - 1])
    }
  }

  const getFilteredLodgings = () => {
    let filtered = lodgings

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(l => 
        l.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.city?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    switch (filter) {
      case 'incomplete':
        return filtered.filter((l) => !l.data_completeness_score || l.data_completeness_score < 70)
      case 'complete':
        return filtered.filter((l) => l.data_completeness_score >= 70)
      case 'featured':
        return filtered.filter((l) => l.featured)
      case 'winery':
        return filtered.filter((l) => l.is_winery_lodging)
      default:
        return filtered
    }
  }

  // Password screen
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full">
          <h1 className="text-2xl font-bold text-[#2C2C30] mb-2" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Review Lodgings</h1>
          <p className="text-[#4A4A50] mb-6">Enter password to review and edit lodging data</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] focus:ring-2 focus:ring-[#C4637A]/20 outline-none mb-4"
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
        <div className="text-[#4A4A50]">Loading lodgings...</div>
      </div>
    )
  }

  const filteredLodgings = getFilteredLodgings()
  const completeCount = lodgings.filter((l) => l.data_completeness_score >= 70).length
  const currentIndex = filteredLodgings.findIndex((l) => l.id === selectedLodging?.id)

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="flex h-screen">
        {/* Sidebar - Lodging List */}
        <div className="w-80 bg-white border-r border-[#E8E0D5] flex flex-col">
          <div className="p-4 border-b border-[#E8E0D5]">
            <h1 className="text-xl font-bold text-[#2C2C30]" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Review Lodgings</h1>
            <p className="text-sm text-[#4A4A50]">{completeCount} of {lodgings.length} complete</p>
            
            <div className="mt-3 space-y-2">
              <input
                type="text"
                placeholder="Search lodgings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-sm border border-[#E8E0D5] rounded-lg px-3 py-2 focus:border-[#6B2D3F] outline-none"
              />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full text-sm border border-[#E8E0D5] rounded-lg px-3 py-2 focus:border-[#6B2D3F] outline-none"
              >
                <option value="all">All ({lodgings.length})</option>
                <option value="incomplete">Incomplete ({lodgings.length - completeCount})</option>
                <option value="complete">Complete ({completeCount})</option>
                <option value="featured">Featured ({lodgings.filter(l => l.featured).length})</option>
                <option value="winery">Winery Lodging ({lodgings.filter(l => l.is_winery_lodging).length})</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredLodgings.map((lodging) => (
              <button
                key={lodging.id}
                onClick={() => selectLodging(lodging)}
                className={`w-full p-4 text-left border-b border-[#E8E0D5] hover:bg-[#FAF7F2] transition-colors ${
                  selectedLodging?.id === lodging.id ? 'bg-[#FAF7F2] border-l-4 border-l-[#6B2D3F]' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[#B8A99A]">
                    {lodging.lodging_type || 'Uncategorized'}
                  </span>
                  <div className="flex items-center gap-1">
                    {lodging.featured && (
                      <span className="text-xs bg-[#C9A962] text-white px-1.5 py-0.5 rounded">★</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      lodging.data_completeness_score >= 70 
                        ? 'bg-[#2D4A3E] text-white' 
                        : 'bg-[#E8E0D5] text-[#4A4A50]'
                    }`}>
                      {lodging.data_completeness_score || 0}%
                    </span>
                  </div>
                </div>
                <p className="font-medium text-[#2C2C30] line-clamp-1">{lodging.name}</p>
                <p className="text-sm text-[#4A4A50]">{lodging.city}</p>
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-[#E8E0D5] space-y-2">
            <a
              href="/lodging/dashboard"
              className="block text-center text-sm text-[#6B2D3F] hover:text-[#8B3A4D] font-medium"
            >
              ← Lodging Dashboard
            </a>
            <a
              href="/lodging/analysis"
              className="block text-center text-sm text-[#6B2D3F] hover:text-[#8B3A4D] font-medium"
            >
              Lodging Analysis →
            </a>
          </div>
        </div>

        {/* Main Content - Lodging Detail */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedLodging ? (
            <div className="max-w-4xl mx-auto">
              {/* Navigation */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={goToPrev}
                    disabled={currentIndex <= 0}
                    className="px-3 py-1 text-sm text-[#4A4A50] hover:text-[#2C2C30] disabled:opacity-50"
                  >
                    ← Prev
                  </button>
                  <span className="text-sm text-[#4A4A50]">
                    {currentIndex + 1} of {filteredLodgings.length}
                  </span>
                  <button
                    onClick={goToNext}
                    disabled={currentIndex >= filteredLodgings.length - 1}
                    className="px-3 py-1 text-sm text-[#4A4A50] hover:text-[#2C2C30] disabled:opacity-50"
                  >
                    Next →
                  </button>
                </div>
                <button
                  onClick={saveChanges}
                  disabled={saving}
                  className="px-6 py-2 bg-[#6B2D3F] hover:bg-[#8B3A4D] disabled:bg-[#B8A99A] text-white font-medium rounded-lg transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Basic Information */}
              <div className="bg-white rounded-2xl shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-[#2C2C30] mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Basic Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#4A4A50] mb-1">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A4A50] mb-1">Slug</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A4A50] mb-1">Lodging Type</label>
                    <select
                      value={formData.lodging_type}
                      onChange={(e) => setFormData({ ...formData, lodging_type: e.target.value })}
                      className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                    >
                      <option value="">Select type...</option>
                      {LODGING_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#4A4A50] mb-1">Tagline</label>
                    <input
                      type="text"
                      value={formData.tagline}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      placeholder="A short, catchy description..."
                      className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#4A4A50] mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Location & Contact */}
              <div className="bg-white rounded-2xl shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-[#2C2C30] mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Location & Contact</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#4A4A50] mb-1">Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A4A50] mb-1">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A4A50] mb-1">ZIP Code</label>
                    <input
                      type="text"
                      value={formData.zip_code}
                      onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                      className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A4A50] mb-1">Latitude</label>
                    <input
                      type="text"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A4A50] mb-1">Longitude</label>
                    <input
                      type="text"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A4A50] mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A4A50] mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A4A50] mb-1">Website</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A4A50] mb-1">Booking URL</label>
                    <input
                      type="url"
                      value={formData.booking_url}
                      onChange={(e) => setFormData({ ...formData, booking_url: e.target.value })}
                      className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Capacity */}
              <div className="bg-white rounded-2xl shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-[#2C2C30] mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Pricing & Capacity</h3>
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#4A4A50] mb-1">Price Tier</label>
                    <select
                      value={formData.price_tier}
                      onChange={(e) => setFormData({ ...formData, price_tier: e.target.value })}
                      className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                    >
                      <option value="">Select tier...</option>
                      {PRICE_TIERS.map(tier => (
                        <option key={tier} value={tier}>{tier}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A4A50] mb-1">Price Range</label>
                    <input
                      type="text"
                      value={formData.price_range}
                      onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                      placeholder="e.g., $150-$300/night"
                      className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A4A50] mb-1">Room Count</label>
                    <input
                      type="number"
                      value={formData.room_count}
                      onChange={(e) => setFormData({ ...formData, room_count: e.target.value })}
                      className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A4A50] mb-1">Max Guests</label>
                    <input
                      type="number"
                      value={formData.max_guests}
                      onChange={(e) => setFormData({ ...formData, max_guests: e.target.value })}
                      className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A4A50] mb-1">Check-in Time</label>
                    <input
                      type="text"
                      value={formData.check_in_time}
                      onChange={(e) => setFormData({ ...formData, check_in_time: e.target.value })}
                      placeholder="e.g., 3:00 PM"
                      className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A4A50] mb-1">Check-out Time</label>
                    <input
                      type="text"
                      value={formData.check_out_time}
                      onChange={(e) => setFormData({ ...formData, check_out_time: e.target.value })}
                      placeholder="e.g., 11:00 AM"
                      className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A4A50] mb-1">Minimum Stay (nights)</label>
                    <input
                      type="number"
                      value={formData.minimum_stay}
                      onChange={(e) => setFormData({ ...formData, minimum_stay: e.target.value })}
                      min="1"
                      className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Winery Connection */}
              <div className="bg-white rounded-2xl shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-[#2C2C30] mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Winery Connection</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="is_winery_lodging"
                      checked={formData.is_winery_lodging}
                      onChange={(e) => setFormData({ ...formData, is_winery_lodging: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="is_winery_lodging" className="text-sm font-medium text-[#4A4A50]">
                      On-site winery lodging
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="wine_packages_available"
                      checked={formData.wine_packages_available}
                      onChange={(e) => setFormData({ ...formData, wine_packages_available: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="wine_packages_available" className="text-sm font-medium text-[#4A4A50]">
                      Wine packages available
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A4A50] mb-1">Nearest Winery (minutes)</label>
                    <input
                      type="number"
                      value={formData.nearest_winery_minutes}
                      onChange={(e) => setFormData({ ...formData, nearest_winery_minutes: e.target.value })}
                      className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A4A50] mb-1">Winery Distance Notes</label>
                    <input
                      type="text"
                      value={formData.winery_distance_notes}
                      onChange={(e) => setFormData({ ...formData, winery_distance_notes: e.target.value })}
                      placeholder="e.g., Walking distance to 3 wineries"
                      className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#4A4A50] mb-1">Wine Package Notes</label>
                    <textarea
                      value={formData.wine_package_notes}
                      onChange={(e) => setFormData({ ...formData, wine_package_notes: e.target.value })}
                      placeholder="Details about wine packages..."
                      rows={2}
                      className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none resize-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#4A4A50] mb-1">Partnership Notes</label>
                    <textarea
                      value={formData.partnership_notes}
                      onChange={(e) => setFormData({ ...formData, partnership_notes: e.target.value })}
                      placeholder="Notes about winery partnerships..."
                      rows={2}
                      className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="bg-white rounded-2xl shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-[#2C2C30] mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES_OPTIONS.map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleArrayField('amenities', amenity)}
                      className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                        formData.amenities?.includes(amenity)
                          ? 'bg-[#6B2D3F] text-white'
                          : 'bg-[#FAF7F2] text-[#4A4A50] hover:bg-[#E8E0D5]'
                      }`}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vibe Tags */}
              <div className="bg-white rounded-2xl shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-[#2C2C30] mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Vibe Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {VIBE_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleArrayField('vibe_tags', tag)}
                      className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                        formData.vibe_tags?.includes(tag)
                          ? 'bg-[#2D4A3E] text-white'
                          : 'bg-[#FAF7F2] text-[#4A4A50] hover:bg-[#E8E0D5]'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Best For */}
              <div className="bg-white rounded-2xl shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-[#2C2C30] mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Best For</h3>
                <div className="flex flex-wrap gap-2">
                  {BEST_FOR_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleArrayField('best_for', option)}
                      className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                        formData.best_for?.includes(option)
                          ? 'bg-[#C9A962] text-white'
                          : 'bg-[#FAF7F2] text-[#4A4A50] hover:bg-[#E8E0D5]'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status & Admin */}
              <div className="bg-white rounded-2xl shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-[#2C2C30] mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Status & Admin</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="active"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="active" className="text-sm font-medium text-[#4A4A50]">
                      Active
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="featured" className="text-sm font-medium text-[#4A4A50]">
                      Featured
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A4A50] mb-1">Priority Rank</label>
                    <input
                      type="number"
                      value={formData.priority_rank}
                      onChange={(e) => setFormData({ ...formData, priority_rank: e.target.value })}
                      min="1"
                      max="100"
                      className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A4A50] mb-1">Data Source</label>
                    <input
                      type="text"
                      value={formData.data_source}
                      onChange={(e) => setFormData({ ...formData, data_source: e.target.value })}
                      placeholder="e.g., Manual, Scraped, API"
                      className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#4A4A50] mb-1">Internal Notes</label>
                    <textarea
                      value={formData.internal_notes}
                      onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })}
                      placeholder="Notes for internal use..."
                      rows={2}
                      className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={saveChanges}
                  disabled={saving}
                  className="px-8 py-3 bg-[#6B2D3F] hover:bg-[#8B3A4D] disabled:bg-[#B8A99A] text-white font-medium rounded-lg transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-[#B8A99A]">
              Select a lodging from the sidebar to review
            </div>
          )}
        </div>
      </div>
    </div>
  )
}