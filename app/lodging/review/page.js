'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

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

const LODGING_TYPES = ['Hotel', 'Boutique Hotel', 'B&B', 'Inn', 'Cabin', 'Cottage', 'Winery Lodging', 'Vacation Rental', 'Campground', 'Resort', 'Guest House']
const PRICE_TIERS = ['budget', 'moderate', 'upscale', 'luxury']
const DEFAULT_VIBES = ['Romantic', 'Family-Friendly', 'Rustic', 'Modern', 'Historic', 'Scenic Views', 'Peaceful', 'Pet-Friendly', 'Wine Country', 'Cozy', 'Luxurious', 'Boutique', 'Charming', 'Secluded']
const DEFAULT_BEST_FOR = ['Couples', 'Families', 'Groups', 'Solo travelers', 'Wine enthusiasts', 'Nature lovers', 'Romantic getaway', 'Girls trip', 'Anniversary', 'Pet owners', 'Business travelers', 'Wedding parties', 'Bachelor/Bachelorette']
const DEFAULT_AMENITIES = ['WiFi', 'Free Parking', 'Pool', 'Hot Tub', 'Breakfast Included', 'Full Kitchen', 'Kitchenette', 'Air Conditioning', 'Fireplace', 'Balcony/Patio', 'Pet Friendly', 'EV Charging', 'Fitness Center', 'Restaurant On-site', 'Room Service', 'Laundry', 'Concierge', 'Wine Storage', 'Vineyard Views', 'Fire Pit', 'BBQ/Grill', 'Game Room', 'Spa Services']

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const correctPassword = process.env.NEXT_PUBLIC_DASHBOARD_PASSWORD || 'valleysomm2024'

  const handleLogin = (e) => {
    e.preventDefault()
    if (password === correctPassword) { setAuthenticated(true); setError('') }
    else { setError('Incorrect password') }
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

  // Password screen
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: `linear-gradient(135deg, ${BRAND_COLORS.wineDeep} 0%, ${BRAND_COLORS.valleyDeep} 100%)` }}>
        <div className="rounded-2xl shadow-2xl p-8 max-w-sm w-full" style={{ backgroundColor: BRAND_COLORS.cream }}>
          <div className="text-center mb-6">
            <h1 className="text-3xl font-medium mb-2" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              <span style={{ color: BRAND_COLORS.wineDeep }}>Valley</span><span style={{ color: BRAND_COLORS.valleyDeep }}>Somm</span>
            </h1>
            <p style={{ color: BRAND_COLORS.slate }}>Review Lodging</p>
          </div>
          <form onSubmit={handleLogin}>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"
              className="w-full p-3 rounded-lg border outline-none mb-4" style={{ borderColor: BRAND_COLORS.warmBeige, backgroundColor: 'white' }} />
            {error && <p className="text-sm mb-4" style={{ color: BRAND_COLORS.wineRose }}>{error}</p>}
            <button type="submit" className="w-full py-3 text-white font-medium rounded-lg hover:opacity-90" style={{ backgroundColor: BRAND_COLORS.wineDeep }}>Enter</button>
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
          <p style={{ color: BRAND_COLORS.slate }}>Loading...</p>
        </div>
      </div>
    )
  }

  const incompleteCount = lodgings.filter(l => !l.vibe_tags?.length || !l.best_for?.length).length

  return (
    <div className="min-h-screen" style={{ backgroundColor: BRAND_COLORS.cream }}>
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className={`bg-white border-r flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-80'}`} style={{ borderColor: BRAND_COLORS.warmBeige }}>
          <div className="p-4" style={{ borderBottom: `1px solid ${BRAND_COLORS.warmBeige}` }}>
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <div>
                  <h1 className="text-xl font-medium" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: BRAND_COLORS.wineDeep }}>Lodging</h1>
                  <p className="text-sm" style={{ color: BRAND_COLORS.slate }}>{lodgings.length} properties • {incompleteCount} incomplete</p>
                </div>
              )}
              <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2 rounded-lg hover:opacity-80" style={{ backgroundColor: BRAND_COLORS.cream }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BRAND_COLORS.slate} strokeWidth="2">
                  <path d={sidebarCollapsed ? "M9 18l6-6-6-6" : "M15 18l-6-6 6-6"} />
                </svg>
              </button>
            </div>
            {!sidebarCollapsed && (
              <>
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search..."
                  className="w-full mt-3 text-sm border rounded-lg px-3 py-2 outline-none" style={{ borderColor: BRAND_COLORS.warmBeige }} />
                <select value={filter} onChange={(e) => setFilter(e.target.value)}
                  className="w-full mt-3 text-sm border rounded-lg px-3 py-2 outline-none" style={{ borderColor: BRAND_COLORS.warmBeige }}>
                  <option value="all">All ({lodgings.length})</option>
                  <option value="incomplete">Incomplete ({incompleteCount})</option>
                  <option value="winery">Winery Lodging ({lodgings.filter(l => l.is_winery_lodging).length})</option>
                  <option value="featured">Featured ({lodgings.filter(l => l.featured).length})</option>
                  <option value="inactive">Inactive ({lodgings.filter(l => !l.active).length})</option>
                </select>
              </>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredLodgings.map((lodging) => (
              <button key={lodging.id} onClick={() => selectLodging(lodging)}
                className={`w-full p-4 text-left transition-colors ${selectedLodging?.id === lodging.id ? 'border-l-4' : ''}`}
                style={{
                  borderBottom: `1px solid ${BRAND_COLORS.warmBeige}`,
                  backgroundColor: selectedLodging?.id === lodging.id ? BRAND_COLORS.cream : 'transparent',
                  borderLeftColor: selectedLodging?.id === lodging.id ? BRAND_COLORS.wineDeep : 'transparent'
                }}>
                {!sidebarCollapsed ? (
                  <>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{
                        backgroundColor: lodging.is_winery_lodging ? BRAND_COLORS.wineDeep + '20' : BRAND_COLORS.warmBeige,
                        color: lodging.is_winery_lodging ? BRAND_COLORS.wineDeep : BRAND_COLORS.slate
                      }}>{lodging.lodging_type || 'Unknown'}</span>
                      <div className="flex gap-1">
                        {lodging.featured && <span className="text-xs">⭐</span>}
                        {!lodging.active && <span className="text-xs" style={{ color: BRAND_COLORS.wineRose }}>●</span>}
                      </div>
                    </div>
                    <p className="font-medium line-clamp-1" style={{ color: BRAND_COLORS.charcoal }}>{lodging.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: BRAND_COLORS.slate }}>{lodging.city} • {lodging.price_tier || 'No price'}</p>
                  </>
                ) : (
                  <div className="w-3 h-3 rounded-full mx-auto" style={{ backgroundColor: lodging.is_winery_lodging ? BRAND_COLORS.wineDeep : BRAND_COLORS.warmBeige }} />
                )}
              </button>
            ))}
          </div>

          {!sidebarCollapsed && (
            <div className="p-4 space-y-2" style={{ borderTop: `1px solid ${BRAND_COLORS.warmBeige}` }}>
              <a href="/lodging/dashboard" className="block text-center text-sm font-medium hover:opacity-80" style={{ color: BRAND_COLORS.wineDeep }}>← Dashboard</a>
              <a href="/lodging/analysis" className="block text-center text-sm hover:opacity-80" style={{ color: BRAND_COLORS.slate }}>Analysis →</a>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedLodging ? (
            <div className="max-w-4xl mx-auto">
              {/* Navigation */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <button onClick={goToPrev} disabled={currentIndex <= 0} className="px-3 py-1 text-sm disabled:opacity-50 hover:opacity-80" style={{ color: BRAND_COLORS.slate }}>← Prev</button>
                  <span className="text-sm" style={{ color: BRAND_COLORS.slate }}>{currentIndex + 1} of {filteredLodgings.length}</span>
                  <button onClick={goToNext} disabled={currentIndex >= filteredLodgings.length - 1} className="px-3 py-1 text-sm disabled:opacity-50 hover:opacity-80" style={{ color: BRAND_COLORS.slate }}>Next →</button>
                </div>
                <div className="flex items-center gap-3">
                  {error && <span className="text-sm" style={{ color: BRAND_COLORS.wineRose }}>{error}</span>}
                  <button onClick={saveReview} disabled={saving} className="px-6 py-2 text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: BRAND_COLORS.wineDeep }}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>

              {/* Basic Info */}
              <FormSection title="Basic Information" colors={BRAND_COLORS}>
                <div className="grid md:grid-cols-2 gap-4">
                  <FormInput label="Name *" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} colors={BRAND_COLORS} />
                  <FormInput label="Slug *" value={formData.slug} onChange={(v) => setFormData({ ...formData, slug: v })} colors={BRAND_COLORS} />
                  <FormInput label="Tagline" value={formData.tagline} onChange={(v) => setFormData({ ...formData, tagline: v })} placeholder="A short, catchy description..." className="md:col-span-2" colors={BRAND_COLORS} />
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1" style={{ color: BRAND_COLORS.slate }}>Description</label>
                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full p-3 rounded-lg border outline-none h-24 resize-none" style={{ borderColor: BRAND_COLORS.warmBeige }} />
                  </div>
                  <FormSelect label="Lodging Type *" value={formData.lodging_type} onChange={(v) => setFormData({ ...formData, lodging_type: v })} options={LODGING_TYPES} colors={BRAND_COLORS} />
                  <FormSelect label="Price Tier" value={formData.price_tier} onChange={(v) => setFormData({ ...formData, price_tier: v })} options={PRICE_TIERS} capitalize colors={BRAND_COLORS} />
                  <FormInput label="Price Range" value={formData.price_range} onChange={(v) => setFormData({ ...formData, price_range: v })} placeholder="$150-250/night" colors={BRAND_COLORS} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormInput label="Room Count" value={formData.room_count} onChange={(v) => setFormData({ ...formData, room_count: v })} type="number" colors={BRAND_COLORS} />
                    <FormInput label="Max Guests" value={formData.max_guests} onChange={(v) => setFormData({ ...formData, max_guests: v })} type="number" colors={BRAND_COLORS} />
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-6">
                  <Checkbox label="Active" checked={formData.active} onChange={(v) => setFormData({ ...formData, active: v })} colors={BRAND_COLORS} />
                  <Checkbox label="Featured" checked={formData.featured} onChange={(v) => setFormData({ ...formData, featured: v })} colors={BRAND_COLORS} />
                  <div className="flex items-center gap-2">
                    <label className="text-sm" style={{ color: BRAND_COLORS.slate }}>Priority:</label>
                    <input type="number" value={formData.priority_rank} onChange={(e) => setFormData({ ...formData, priority_rank: e.target.value })} min="1" max="100"
                      className="w-16 p-2 text-sm rounded-lg border outline-none text-center" style={{ borderColor: BRAND_COLORS.warmBeige }} />
                  </div>
                </div>
              </FormSection>

              {/* Location */}
              <FormSection title="Location" colors={BRAND_COLORS}>
                <div className="grid md:grid-cols-2 gap-4">
                  <FormInput label="Address" value={formData.address} onChange={(v) => setFormData({ ...formData, address: v })} className="md:col-span-2" colors={BRAND_COLORS} />
                  <FormInput label="City *" value={formData.city} onChange={(v) => setFormData({ ...formData, city: v })} colors={BRAND_COLORS} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormInput label="State" value={formData.state} onChange={(v) => setFormData({ ...formData, state: v })} colors={BRAND_COLORS} />
                    <FormInput label="Zip" value={formData.zip_code} onChange={(v) => setFormData({ ...formData, zip_code: v })} colors={BRAND_COLORS} />
                  </div>
                  <FormInput label="Latitude" value={formData.latitude} onChange={(v) => setFormData({ ...formData, latitude: v })} type="number" step="any" colors={BRAND_COLORS} />
                  <FormInput label="Longitude" value={formData.longitude} onChange={(v) => setFormData({ ...formData, longitude: v })} type="number" step="any" colors={BRAND_COLORS} />
                </div>
              </FormSection>

              {/* Contact & Booking */}
              <FormSection title="Contact & Booking" colors={BRAND_COLORS}>
                <div className="grid md:grid-cols-2 gap-4">
                  <FormInput label="Phone" value={formData.phone} onChange={(v) => setFormData({ ...formData, phone: v })} colors={BRAND_COLORS} />
                  <FormInput label="Email" value={formData.email} onChange={(v) => setFormData({ ...formData, email: v })} type="email" colors={BRAND_COLORS} />
                  <FormInput label="Website" value={formData.website} onChange={(v) => setFormData({ ...formData, website: v })} type="url" colors={BRAND_COLORS} />
                  <FormInput label="Booking URL" value={formData.booking_url} onChange={(v) => setFormData({ ...formData, booking_url: v })} type="url" colors={BRAND_COLORS} />
                </div>
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <FormInput label="Check-in Time" value={formData.check_in_time} onChange={(v) => setFormData({ ...formData, check_in_time: v })} placeholder="3:00 PM" colors={BRAND_COLORS} />
                  <FormInput label="Check-out Time" value={formData.check_out_time} onChange={(v) => setFormData({ ...formData, check_out_time: v })} placeholder="11:00 AM" colors={BRAND_COLORS} />
                  <FormInput label="Min Stay (nights)" value={formData.minimum_stay} onChange={(v) => setFormData({ ...formData, minimum_stay: v })} type="number" colors={BRAND_COLORS} />
                </div>
              </FormSection>

              {/* Winery Connection */}
              <FormSection title="🍷 Winery Connection" colors={BRAND_COLORS}>
                <div className="flex flex-wrap items-center gap-6 mb-4">
                  <Checkbox label="Is Winery Lodging" checked={formData.is_winery_lodging} onChange={(v) => setFormData({ ...formData, is_winery_lodging: v })} colors={BRAND_COLORS} />
                  <Checkbox label="Wine Packages Available" checked={formData.wine_packages_available} onChange={(v) => setFormData({ ...formData, wine_packages_available: v })} colors={BRAND_COLORS} />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {formData.is_winery_lodging && (
                    <FormSelect label="Associated Winery" value={formData.associated_winery_id} onChange={(v) => setFormData({ ...formData, associated_winery_id: v })}
                      options={wineries.map(w => ({ value: w.id, label: w.name }))} hasEmpty colors={BRAND_COLORS} />
                  )}
                  <FormSelect label="Nearest Winery" value={formData.nearest_winery_id} onChange={(v) => setFormData({ ...formData, nearest_winery_id: v })}
                    options={wineries.map(w => ({ value: w.id, label: w.name }))} hasEmpty colors={BRAND_COLORS} />
                  <FormInput label="Minutes to Nearest" value={formData.nearest_winery_minutes} onChange={(v) => setFormData({ ...formData, nearest_winery_minutes: v })} type="number" placeholder="10" colors={BRAND_COLORS} />
                  <FormInput label="Winery Distance Notes" value={formData.winery_distance_notes} onChange={(v) => setFormData({ ...formData, winery_distance_notes: v })} placeholder="Walking distance to 3 wineries..." className="md:col-span-2" colors={BRAND_COLORS} />
                </div>
              </FormSection>

              {/* Tags */}
              <TagSection title="Vibe Tags" items={DEFAULT_VIBES} selected={formData.vibe_tags || []} onToggle={(v) => toggleArrayField('vibe_tags', v)} colors={BRAND_COLORS} />
              <TagSection title="Best For" items={DEFAULT_BEST_FOR} selected={formData.best_for || []} onToggle={(v) => toggleArrayField('best_for', v)} colors={BRAND_COLORS} />
              <TagSection title="Amenities" items={DEFAULT_AMENITIES} selected={formData.amenities || []} onToggle={(v) => toggleArrayField('amenities', v)} colors={BRAND_COLORS} />

              {/* Internal Notes */}
              <FormSection title="Internal Notes" colors={BRAND_COLORS}>
                <textarea value={formData.internal_notes} onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })} placeholder="Any internal notes..."
                  className="w-full h-32 p-4 rounded-lg border outline-none resize-none" style={{ borderColor: BRAND_COLORS.warmBeige }} />
              </FormSection>

              <div className="flex justify-end">
                <button onClick={saveReview} disabled={saving} className="px-8 py-3 text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: BRAND_COLORS.wineDeep }}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full" style={{ color: BRAND_COLORS.slate }}>Select a property from the sidebar to review</div>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper Components
function FormSection({ title, children, colors }) {
  return (
    <div className="rounded-2xl shadow p-6 mb-6" style={{ backgroundColor: 'white', border: `1px solid ${colors.warmBeige}` }}>
      <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: colors.charcoal }}>{title}</h3>
      {children}
    </div>
  )
}

function FormInput({ label, value, onChange, type = 'text', placeholder = '', className = '', colors, ...props }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-1" style={{ color: colors.slate }}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full p-3 rounded-lg border outline-none" style={{ borderColor: colors.warmBeige }} {...props} />
    </div>
  )
}

function FormSelect({ label, value, onChange, options, capitalize = false, hasEmpty = false, colors }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1" style={{ color: colors.slate }}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full p-3 rounded-lg border outline-none" style={{ borderColor: colors.warmBeige }}>
        {hasEmpty && <option value="">Select...</option>}
        {!hasEmpty && <option value="">Select...</option>}
        {options.map(opt => {
          const val = typeof opt === 'object' ? opt.value : opt
          const lbl = typeof opt === 'object' ? opt.label : (capitalize ? opt.charAt(0).toUpperCase() + opt.slice(1) : opt)
          return <option key={val} value={val}>{lbl}</option>
        })}
      </select>
    </div>
  )
}

function Checkbox({ label, checked, onChange, colors }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 rounded" style={{ accentColor: colors.wineDeep }} />
      <span className="text-sm" style={{ color: colors.charcoal }}>{label}</span>
    </label>
  )
}

function TagSection({ title, items, selected, onToggle, colors }) {
  return (
    <div className="rounded-2xl shadow p-6 mb-6" style={{ backgroundColor: 'white', border: `1px solid ${colors.warmBeige}` }}>
      <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: colors.charcoal }}>{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map(item => (
          <button key={item} onClick={() => onToggle(item)}
            className="px-3 py-1 text-sm rounded-full transition-colors"
            style={{
              backgroundColor: selected.includes(item) ? colors.wineDeep : colors.cream,
              color: selected.includes(item) ? 'white' : colors.slate
            }}>{item}</button>
        ))}
      </div>
    </div>
  )
}