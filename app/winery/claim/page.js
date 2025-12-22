'use client'

import { Suspense, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useSearchParams } from 'next/navigation'

function ClaimPageContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [step, setStep] = useState('verify') // 'verify', 'edit', 'submitted', 'error'
  const [winery, setWinery] = useState(null)
  const [loading, setLoading] = useState(true)
  const [verificationMethod, setVerificationMethod] = useState('email') // 'email', 'phone', 'domain'
  const [verificationCode, setVerificationCode] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userPhone, setUserPhone] = useState('')
  const [verified, setVerified] = useState(false)
  const [sentCode, setSentCode] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({})

  // Load winery data from claim token
  useEffect(() => {
    if (token) {
      loadWinery()
    } else {
      setError('Invalid claim link. Please check your email and try again.')
      setStep('error')
      setLoading(false)
    }
  }, [token])

  const loadWinery = async () => {
    const { data, error } = await supabase
      .from('wineries')
      .select('*')
      .eq('claim_token', token)
      .single()

    if (error || !data) {
      setError('This claim link is invalid or has expired. Please contact us at hello@valleysomm.com')
      setStep('error')
    } else {
      setWinery(data)
      
      // Pre-fill form with existing data
      setFormData({
        name: data.name,
        address: data.address,
        city: data.city || 'Elkin',
        zip_code: data.zip_code,
        phone: data.phone,
        website: data.website,
        email: data.email,
        
        // Hours
        monday_hours: data.hours?.monday || '',
        tuesday_hours: data.hours?.tuesday || '',
        wednesday_hours: data.hours?.wednesday || '',
        thursday_hours: data.hours?.thursday || '',
        friday_hours: data.hours?.friday || '',
        saturday_hours: data.hours?.saturday || '',
        sunday_hours: data.hours?.sunday || '',
        
        // Wine & Experience
        wine_styles: data.wine_styles || [],
        signature_wines: data.signature_wines || '',
        vibe_tags: data.vibe_tags || [],
        
        // Reservations
        reservation_policy: data.reservation_policy || 'walk-in',
        reservation_notes: data.reservation_notes || '',
        
        // Pricing
        tasting_fee_range: data.tasting_fee_range || '',
        tasting_fee_waived: data.tasting_fee_waived || '',
        
        // Food & Amenities
        food_available: data.food_available || 'none',
        food_notes: data.food_notes || '',
        outdoor_seating: data.outdoor_seating || false,
        pet_friendly: data.pet_friendly || false,
        wheelchair_accessible: data.wheelchair_accessible || false,
        
        // Description & Social
        description: data.description || '',
        facebook: data.facebook || '',
        instagram: data.instagram || '',
        twitter: data.twitter || '',
      })
    }
    
    setLoading(false)
  }

  const sendVerificationCode = async () => {
    setError('')
    
    // TODO: Implement actual email/SMS sending via Resend or Twilio
    // For now, just simulate the code being sent
    
    console.log('Would send verification code to:', verificationMethod === 'email' ? userEmail : userPhone)
    
    // PLACEHOLDER: In production, this would call your API route
    // const response = await fetch('/api/verify/send-code', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     winery_id: winery.id,
    //     method: verificationMethod,
    //     contact: verificationMethod === 'email' ? userEmail : userPhone,
    //   })
    // })
    
    setSentCode(true)
    alert('Verification code sent! (NOTE: Email sending not yet implemented - check console)')
  }

  const verifyCode = async () => {
    setError('')
    
    // TODO: Implement actual code verification
    // For now, accept '123456' as the test code
    
    if (verificationCode === '123456') {
      setVerified(true)
      setStep('edit')
    } else {
      setError('Invalid verification code. Please try again.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Convert hours to JSONB format
    const hours = {
      monday: formData.monday_hours,
      tuesday: formData.tuesday_hours,
      wednesday: formData.wednesday_hours,
      thursday: formData.thursday_hours,
      friday: formData.friday_hours,
      saturday: formData.saturday_hours,
      sunday: formData.sunday_hours,
    }

    const { error: updateError } = await supabase
      .from('wineries')
      .update({
        name: formData.name,
        address: formData.address,
        city: formData.city,
        zip_code: formData.zip_code,
        phone: formData.phone,
        website: formData.website,
        email: formData.email,
        hours: hours,
        wine_styles: formData.wine_styles,
        signature_wines: formData.signature_wines,
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
        facebook: formData.facebook,
        instagram: formData.instagram,
        twitter: formData.twitter,
        claimed_at: new Date().toISOString(),
        claimed_by_email: userEmail,
        owner_verified: true,
        active: true,
      })
      .eq('id', winery.id)

    if (updateError) {
      setError('Failed to update winery information. Please try again.')
    } else {
      setStep('submitted')
    }
  }

  const toggleMultiSelect = (field, value) => {
    const current = formData[field] || []
    if (current.includes(value)) {
      setFormData({ ...formData, [field]: current.filter(v => v !== value) })
    } else {
      setFormData({ ...formData, [field]: [...current, value] })
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="text-stone-500">Loading winery information...</div>
      </div>
    )
  }

  // Error state
  if (step === 'error') {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-stone-800 mb-2">Invalid Claim Link</h2>
          <p className="text-stone-600 mb-6">{error}</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
          >
            Return Home
          </a>
        </div>
      </div>
    )
  }

  // Success state
  if (step === 'submitted') {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-stone-800 mb-2">Winery Updated!</h2>
          <p className="text-stone-600 mb-6">
            Your winery information has been successfully updated and is now live on ValleySomm.
          </p>
          <div className="space-y-3">
            <a
              href={`/winery/${winery.slug || winery.id}`}
              className="block px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
            >
              View Your Listing
            </a>
            <a
              href="/"
              className="block px-6 py-3 text-stone-600 hover:text-stone-800 font-medium"
            >
              Return Home
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Step 1: Verification
  if (step === 'verify') {
    return (
      <div className="min-h-screen bg-stone-100 p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-stone-800 mb-2">Claim Your Winery</h1>
            <p className="text-stone-600">{winery?.name}</p>
          </div>

          {/* Verification Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-xl font-semibold text-stone-800 mb-4">Step 1: Verify Ownership</h2>
            <p className="text-stone-600 mb-6">
              To claim this winery listing, please verify that you represent {winery?.name}.
            </p>

            {!sentCode ? (
              <div className="space-y-6">
                {/* Verification Method Selection */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-3">
                    How would you like to verify?
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-4 rounded-lg border border-stone-200 hover:border-amber-300 hover:bg-amber-50 cursor-pointer transition-all">
                      <input
                        type="radio"
                        name="verificationMethod"
                        value="email"
                        checked={verificationMethod === 'email'}
                        onChange={(e) => setVerificationMethod(e.target.value)}
                        className="w-4 h-4 text-amber-600"
                      />
                      <div>
                        <div className="font-medium text-stone-800">Email Verification</div>
                        <div className="text-sm text-stone-500">We'll send a code to your email</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-4 rounded-lg border border-stone-200 hover:border-amber-300 hover:bg-amber-50 cursor-pointer transition-all">
                      <input
                        type="radio"
                        name="verificationMethod"
                        value="phone"
                        checked={verificationMethod === 'phone'}
                        onChange={(e) => setVerificationMethod(e.target.value)}
                        className="w-4 h-4 text-amber-600"
                      />
                      <div>
                        <div className="font-medium text-stone-800">Phone Verification</div>
                        <div className="text-sm text-stone-500">We'll send a code via SMS</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Contact Input */}
                {verificationMethod === 'email' ? (
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Your Email
                    </label>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none"
                      required
                    />
                    <p className="text-sm text-stone-500 mt-1">
                      Use an email associated with {winery?.name}
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Your Phone Number
                    </label>
                    <input
                      type="tel"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      placeholder="(336) 555-1234"
                      className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none"
                      required
                    />
                    <p className="text-sm text-stone-500 mt-1">
                      Use the phone number listed for {winery?.name}
                    </p>
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={sendVerificationCode}
                  disabled={verificationMethod === 'email' ? !userEmail : !userPhone}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-300 text-white font-medium rounded-lg transition-colors"
                >
                  Send Verification Code
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  ✓ Verification code sent to {verificationMethod === 'email' ? userEmail : userPhone}
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Enter Verification Code
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-center text-2xl tracking-widest"
                  />
                  <p className="text-sm text-stone-500 mt-1 text-center">
                    Code expires in 15 minutes
                  </p>
                  <p className="text-sm text-amber-600 mt-2 text-center">
                    TEST: Use code "123456" (email sending not yet implemented)
                  </p>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setSentCode(false)}
                    className="flex-1 py-3 text-stone-600 hover:text-stone-800 font-medium"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={verifyCode}
                    disabled={verificationCode.length !== 6}
                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-300 text-white font-medium rounded-lg transition-colors"
                  >
                    Verify Code
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Step 2: Edit Form (only shown after verification)
  if (step === 'edit') {
    const wineStyles = [
      'Dry Reds', 'Sweet Reds', 'Dry Whites', 'Sweet Whites', 'Rosé',
      'Sparkling', 'Dessert Wines', 'Fruit Wines', 'Muscadine'
    ]

    const vibeTags = [
      'Family-Friendly', 'Romantic', 'Scenic Views', 'Dog-Friendly',
      'Live Music', 'Educational', 'Rustic', 'Modern', 'Casual', 'Upscale'
    ]

    return (
      <div className="min-h-screen bg-stone-100 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-stone-800 mb-2">Update Your Listing</h1>
            <p className="text-stone-600">{winery?.name}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-lg font-semibold text-stone-800 mb-4">Basic Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-stone-700 mb-2">Winery Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 outline-none"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-stone-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">ZIP Code</label>
                  <input
                    type="text"
                    value={formData.zip_code}
                    onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                    className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Wine Styles */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-lg font-semibold text-stone-800 mb-4">Wine Styles</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {wineStyles.map(style => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => toggleMultiSelect('wine_styles', style)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      formData.wine_styles?.includes(style)
                        ? 'bg-amber-500 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Signature Wines</label>
                <input
                  type="text"
                  value={formData.signature_wines}
                  onChange={(e) => setFormData({ ...formData, signature_wines: e.target.value })}
                  placeholder="e.g., Cabernet Sauvignon, Chardonnay"
                  className="w-full p-3 rounded-lg border border-stone-200 focus:border-amber-400 outline-none"
                />
              </div>
            </div>

            {/* Vibe */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-lg font-semibold text-stone-800 mb-4">Atmosphere & Vibe</h3>
              <div className="flex flex-wrap gap-2">
                {vibeTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleMultiSelect('vibe_tags', tag)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      formData.vibe_tags?.includes(tag)
                        ? 'bg-amber-500 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-lg font-semibold text-stone-800 mb-4">Description</h3>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Tell visitors what makes your winery special..."
                className="w-full h-32 p-4 rounded-lg border border-stone-200 focus:border-amber-400 outline-none resize-none"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('verify')}
                className="px-6 py-3 text-stone-600 hover:text-stone-800 font-medium"
              >
                ← Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
              >
                Update Winery Information
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return null
}

// Wrap the content in Suspense to handle useSearchParams
export default function WineryClaimPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="text-stone-500">Loading...</div>
      </div>
    }>
      <ClaimPageContent />
    </Suspense>
  )
}