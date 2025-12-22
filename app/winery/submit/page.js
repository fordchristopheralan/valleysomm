'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function WinerySubmitPage() {
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    address: '',
    city: 'Elkin',
    zip_code: '',
    phone: '',
    website: '',
    email: '',
    
    // Contact Person
    contact_name: '',
    contact_role: '',
    contact_email: '',
    
    // Hours (simplified for form)
    monday_hours: '',
    tuesday_hours: '',
    wednesday_hours: '',
    thursday_hours: '',
    friday_hours: '',
    saturday_hours: '',
    sunday_hours: '',
    
    // Wine & Experience
    wine_styles: [],
    signature_wines: '',
    vibe_tags: [],
    
    // Reservations
    reservation_policy: 'walk-in',
    reservation_notes: '',
    
    // Pricing
    tasting_fee_range: '',
    tasting_fee_waived: '',
    
    // Food & Amenities
    food_available: 'none',
    food_notes: '',
    outdoor_seating: false,
    pet_friendly: false,
    wheelchair_accessible: false,
    
    // Experience
    description: '',
    tagline: '',
    best_time_to_visit: '',
    what_makes_special: '',
    
    // Social
    instagram_handle: '',
    facebook_url: '',
  })
  
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const wineStyleOptions = [
    'Dry Reds',
    'Sweet Reds', 
    'Dry Whites',
    'Sweet Whites',
    'Sparkling',
    'Rosé',
    'Dessert Wines',
    'Fruit Wines'
  ]

  const vibeOptions = [
    'Romantic',
    'Family-Friendly',
    'Scenic Views',
    'Rustic',
    'Modern',
    'Historic',
    'Intimate',
    'Spacious',
    'Lively',
    'Quiet',
    'Casual',
    'Upscale',
    'Educational'
  ]

  const handleCheckbox = (field, value) => {
    const current = formData[field] || []
    if (current.includes(value)) {
      setFormData({ ...formData, [field]: current.filter(v => v !== value) })
    } else {
      setFormData({ ...formData, [field]: [...current, value] })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    // Convert hours to JSONB format
    const hours = {
      mon: formData.monday_hours || 'closed',
      tue: formData.tuesday_hours || 'closed',
      wed: formData.wednesday_hours || 'closed',
      thu: formData.thursday_hours || 'closed',
      fri: formData.friday_hours || 'closed',
      sat: formData.saturday_hours || 'closed',
      sun: formData.sunday_hours || 'closed',
    }

    // Create slug from name
    const slug = formData.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Prepare submission data
    const submission = {
      name: formData.name,
      slug: slug,
      address: formData.address,
      city: formData.city,
      zip_code: formData.zip_code,
      phone: formData.phone,
      website: formData.website,
      email: formData.email,
      
      hours: hours,
      
      wine_styles: formData.wine_styles,
      signature_wines: formData.signature_wines.split(',').map(w => w.trim()).filter(Boolean),
      vibe_tags: formData.vibe_tags,
      
      reservation_policy: formData.reservation_policy,
      reservation_notes: formData.reservation_notes,
      
      tasting_fee_range: formData.tasting_fee_range,
      tasting_fee_waived: formData.tasting_fee_waived,
      
      food_available: formData.food_available,
      food_notes: formData.food_notes,
      outdoor_seating: formData.outdoor_seating,
      pet_friendly: formData.pet_friendly,
      wheelchair_accessible: formData.wheelchair_accessible,
      
      description: formData.description,
      tagline: formData.tagline,
      
      instagram_handle: formData.instagram_handle,
      facebook_url: formData.facebook_url,
      
      // Metadata
      data_source: 'owner-submitted',
      owner_verified: false, // Admin will verify
      active: false, // Admin will activate after review
      
      // Store contact info separately for admin follow-up
      internal_notes: `Contact: ${formData.contact_name} (${formData.contact_role}) - ${formData.contact_email}\n\nWhat makes us special: ${formData.what_makes_special}\n\nBest time to visit: ${formData.best_time_to_visit}`,
    }

    // Submit to Supabase
    const { error: submitError } = await supabase
      .from('wineries')
      .insert([submission])

    if (submitError) {
      console.error('Submission error:', submitError)
      setError('Something went wrong. Please try again or email us directly at hello@valleysomm.com')
    } else {
      setSubmitted(true)
      
      // Optional: Send notification email to admin
      // TODO: Implement email notification
    }

    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="text-5xl mb-4">🍷</div>
          <h2 className="text-2xl font-bold text-[#2C2C30] mb-2">Thank You!</h2>
          <p className="text-[#4A4A50] mb-4">
            We've received your winery information for <strong>{formData.name}</strong>.
          </p>
          <p className="text-sm text-[#4A4A50] mb-6">
            Our team will review it within 2-3 business days and reach out to {formData.contact_email} once it's live on ValleySomm.
          </p>
          <div className="space-y-3">
            <a
              href="/"
              className="block px-6 py-3 bg-[#6B2D3F] hover:bg-[#8B3A4D] text-white font-medium rounded-lg transition-colors"
            >
              Back to ValleySomm
            </a>
            <button
              onClick={() => {
                setSubmitted(false)
                setFormData({})
              }}
              className="block w-full px-6 py-3 bg-[#2D4A3E] hover:bg-[#5B7C6F] text-white font-medium rounded-lg transition-colors"
            >
              Submit Another Winery
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#2C2C30] mb-2">
            Add Your Winery to ValleySomm
          </h1>
          <p className="text-[#4A4A50]">
            Help wine lovers discover your winery. Takes about 10 minutes.
          </p>
          <p className="text-sm text-[#8B3A4D] mt-2">
            All submissions are reviewed before going live.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          
          {/* Basic Information */}
          <section>
            <h2 className="text-xl font-semibold text-[#2C2C30] mb-4 pb-2 border-b border-[#E8E0D5]">
              Basic Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#4A4A50] mb-1">
                  Winery Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] focus:ring-2 focus:ring-[#C4637A]/20 outline-none"
                  placeholder="Shelton Vineyards"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#4A4A50] mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                    placeholder="286 Cabernet Lane"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A4A50] mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#4A4A50] mb-1">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    value={formData.zip_code}
                    onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                    className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                    placeholder="28618"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A4A50] mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                    placeholder="(336) 555-1234"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A4A50] mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                    placeholder="https://yourwinery.com"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Contact Person */}
          <section>
            <h2 className="text-xl font-semibold text-[#2C2C30] mb-4 pb-2 border-b border-[#E8E0D5]">
              Contact Person
            </h2>
            <p className="text-sm text-[#4A4A50] mb-4">
              Who should we contact about this listing?
            </p>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#4A4A50] mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                  placeholder="Jane Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A4A50] mb-1">
                  Your Role *
                </label>
                <input
                  type="text"
                  required
                  value={formData.contact_role}
                  onChange={(e) => setFormData({ ...formData, contact_role: e.target.value })}
                  className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                  placeholder="Owner / Manager"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A4A50] mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                  placeholder="jane@winery.com"
                />
              </div>
            </div>
          </section>

          {/* Hours */}
          <section>
            <h2 className="text-xl font-semibold text-[#2C2C30] mb-4 pb-2 border-b border-[#E8E0D5]">
              Hours of Operation
            </h2>
            <p className="text-sm text-[#4A4A50] mb-4">
              Enter hours in format like "11am-5pm" or type "closed"
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                <div key={day}>
                  <label className="block text-sm font-medium text-[#4A4A50] mb-1">
                    {day}
                  </label>
                  <input
                    type="text"
                    value={formData[`${day.toLowerCase()}_hours`]}
                    onChange={(e) => setFormData({ ...formData, [`${day.toLowerCase()}_hours`]: e.target.value })}
                    className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                    placeholder="11am-5pm or closed"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Wine Styles */}
          <section>
            <h2 className="text-xl font-semibold text-[#2C2C30] mb-4 pb-2 border-b border-[#E8E0D5]">
              Your Wines
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#4A4A50] mb-2">
                  Wine Styles (select all that apply) *
                </label>
                <div className="grid md:grid-cols-3 gap-2">
                  {wineStyleOptions.map((style) => (
                    <label key={style} className="flex items-center gap-2 p-2 rounded-lg border border-[#E8E0D5] hover:border-[#6B2D3F] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.wine_styles.includes(style)}
                        onChange={() => handleCheckbox('wine_styles', style)}
                        className="w-4 h-4 text-[#6B2D3F] rounded focus:ring-[#C4637A]"
                      />
                      <span className="text-sm text-[#4A4A50]">{style}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4A4A50] mb-1">
                  Signature Wines
                </label>
                <input
                  type="text"
                  value={formData.signature_wines}
                  onChange={(e) => setFormData({ ...formData, signature_wines: e.target.value })}
                  className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                  placeholder="Cabernet Franc, Viognier, Norton (comma-separated)"
                />
                <p className="text-xs text-[#B8A99A] mt-1">What wines are you known for?</p>
              </div>
            </div>
          </section>

          {/* Vibe & Atmosphere */}
          <section>
            <h2 className="text-xl font-semibold text-[#2C2C30] mb-4 pb-2 border-b border-[#E8E0D5]">
              Vibe & Atmosphere
            </h2>
            <p className="text-sm text-[#4A4A50] mb-3">
              Help visitors know what to expect. Select all that apply.
            </p>
            
            <div className="grid md:grid-cols-3 gap-2">
              {vibeOptions.map((vibe) => (
                <label key={vibe} className="flex items-center gap-2 p-2 rounded-lg border border-[#E8E0D5] hover:border-[#6B2D3F] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.vibe_tags.includes(vibe)}
                    onChange={() => handleCheckbox('vibe_tags', vibe)}
                    className="w-4 h-4 text-[#6B2D3F] rounded focus:ring-[#C4637A]"
                  />
                  <span className="text-sm text-[#4A4A50]">{vibe}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Reservations */}
          <section>
            <h2 className="text-xl font-semibold text-[#2C2C30] mb-4 pb-2 border-[#E8E0D5]">
              Reservations
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#4A4A50] mb-2">
                  Reservation Policy *
                </label>
                <select
                  required
                  value={formData.reservation_policy}
                  onChange={(e) => setFormData({ ...formData, reservation_policy: e.target.value })}
                  className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                >
                  <option value="walk-in">Walk-ins welcome</option>
                  <option value="recommended">Reservations recommended</option>
                  <option value="required">Reservations required</option>
                  <option value="groups-only">Required for groups only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4A4A50] mb-1">
                  Reservation Notes
                </label>
                <textarea
                  value={formData.reservation_notes}
                  onChange={(e) => setFormData({ ...formData, reservation_notes: e.target.value })}
                  className="w-full h-20 p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none resize-none"
                  placeholder="e.g., 'Book 2 weeks ahead for weekends' or 'Groups of 6+ need reservations'"
                />
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section>
            <h2 className="text-xl font-semibold text-[#2C2C30] mb-4 pb-2 border-b border-[#E8E0D5]">
              Tasting Fees
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#4A4A50] mb-1">
                  Tasting Fee
                </label>
                <input
                  type="text"
                  value={formData.tasting_fee_range}
                  onChange={(e) => setFormData({ ...formData, tasting_fee_range: e.target.value })}
                  className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                  placeholder="$12-15 per person or Free"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A4A50] mb-1">
                  Fee Waived With...
                </label>
                <input
                  type="text"
                  value={formData.tasting_fee_waived}
                  onChange={(e) => setFormData({ ...formData, tasting_fee_waived: e.target.value })}
                  className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                  placeholder="bottle purchase, wine club"
                />
              </div>
            </div>
          </section>

          {/* Food & Amenities */}
          <section>
            <h2 className="text-xl font-semibold text-[#2C2C30] mb-4 pb-2 border-b border-[#E8E0D5]">
              Food & Amenities
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#4A4A50] mb-2">
                  Food Options
                </label>
                <select
                  value={formData.food_available}
                  onChange={(e) => setFormData({ ...formData, food_available: e.target.value })}
                  className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                >
                  <option value="none">No food</option>
                  <option value="cheese-charcuterie">Cheese & charcuterie plates</option>
                  <option value="light-menu">Light menu (snacks, apps)</option>
                  <option value="full-restaurant">Full restaurant</option>
                  <option value="food-trucks">Food trucks (sometimes)</option>
                  <option value="picnic-allowed">Picnic allowed (BYO)</option>
                </select>
              </div>

              {formData.food_available !== 'none' && (
                <div>
                  <label className="block text-sm font-medium text-[#4A4A50] mb-1">
                    Food Details
                  </label>
                  <input
                    type="text"
                    value={formData.food_notes}
                    onChange={(e) => setFormData({ ...formData, food_notes: e.target.value })}
                    className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                    placeholder="e.g., 'Artisan cheese plates, local charcuterie'"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.outdoor_seating}
                    onChange={(e) => setFormData({ ...formData, outdoor_seating: e.target.checked })}
                    className="w-4 h-4 text-[#6B2D3F] rounded focus:ring-[#C4637A]"
                  />
                  <span className="text-sm text-[#4A4A50]">Outdoor seating available</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.pet_friendly}
                    onChange={(e) => setFormData({ ...formData, pet_friendly: e.target.checked })}
                    className="w-4 h-4 text-[#6B2D3F] rounded focus:ring-[#C4637A]"
                  />
                  <span className="text-sm text-[#4A4A50]">Pet-friendly</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.wheelchair_accessible}
                    onChange={(e) => setFormData({ ...formData, wheelchair_accessible: e.target.checked })}
                    className="w-4 h-4 text-[#6B2D3F] rounded focus:ring-[#C4637A]"
                  />
                  <span className="text-sm text-[#4A4A50]">Wheelchair accessible</span>
                </label>
              </div>
            </div>
          </section>

          {/* Description */}
          <section>
            <h2 className="text-xl font-semibold text-[#2C2C30] mb-4 pb-2 border-b border-[#E8E0D5]">
              Tell Your Story
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#4A4A50] mb-1">
                  Tagline (One sentence) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                  placeholder="Award-winning reds with stunning mountain views"
                  maxLength={100}
                />
                <p className="text-xs text-[#B8A99A] mt-1">{formData.tagline.length}/100 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4A4A50] mb-1">
                  Description (2-3 sentences) *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full h-32 p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none resize-none"
                  placeholder="Tell visitors what makes your winery special..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4A4A50] mb-1">
                  What makes your winery special?
                </label>
                <textarea
                  value={formData.what_makes_special}
                  onChange={(e) => setFormData({ ...formData, what_makes_special: e.target.value })}
                  className="w-full h-24 p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none resize-none"
                  placeholder="What should first-time visitors know? What sets you apart?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4A4A50] mb-1">
                  Best time for first-timers to visit?
                </label>
                <input
                  type="text"
                  value={formData.best_time_to_visit}
                  onChange={(e) => setFormData({ ...formData, best_time_to_visit: e.target.value })}
                  className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                  placeholder="e.g., 'Weekday afternoons are less crowded' or 'Saturday mornings for tours'"
                />
              </div>
            </div>
          </section>

          {/* Social Media */}
          <section>
            <h2 className="text-xl font-semibold text-[#2C2C30] mb-4 pb-2 border-b border-[#E8E0D5]">
              Social Media (Optional)
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#4A4A50] mb-1">
                  Instagram Handle
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-[#E8E0D5] bg-[#FAF7F2] text-[#B8A99A]">
                    @
                  </span>
                  <input
                    type="text"
                    value={formData.instagram_handle}
                    onChange={(e) => setFormData({ ...formData, instagram_handle: e.target.value })}
                    className="flex-1 p-3 rounded-r-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                    placeholder="yourwinery"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A4A50] mb-1">
                  Facebook Page URL
                </label>
                <input
                  type="url"
                  value={formData.facebook_url}
                  onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                  className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                  placeholder="https://facebook.com/yourwinery"
                />
              </div>
            </div>
          </section>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-6 border-t border-[#E8E0D5]">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-[#6B2D3F] hover:bg-[#8B3A4D] disabled:bg-[#B8A99A] text-white font-medium text-lg rounded-lg transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Winery Information'}
            </button>
            <p className="text-xs text-center text-[#B8A99A] mt-3">
              By submitting, you agree to have your winery featured on ValleySomm once approved.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}