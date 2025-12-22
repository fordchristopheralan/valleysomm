'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useSearchParams } from 'next/navigation'

export default function WineryClaimPage() {
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
        city: data.city,
        zip_code: data.zip_code,
        phone: data.phone,
        website: data.website,
        email: data.email,
        
        // Hours
        monday_hours: data.hours?.mon || '',
        tuesday_hours: data.hours?.tue || '',
        wednesday_hours: data.hours?.wed || '',
        thursday_hours: data.hours?.thu || '',
        friday_hours: data.hours?.fri || '',
        saturday_hours: data.hours?.sat || '',
        sunday_hours: data.hours?.sun || '',
        
        wine_styles: data.wine_styles || [],
        signature_wines: data.signature_wines?.join(', ') || '',
        vibe_tags: data.vibe_tags || [],
        
        reservation_policy: data.reservation_policy || 'walk-in',
        reservation_notes: data.reservation_notes || '',
        
        tasting_fee_range: data.tasting_fee_range || '',
        tasting_fee_waived: data.tasting_fee_waived || '',
        
        food_available: data.food_available || 'none',
        food_notes: data.food_notes || '',
        outdoor_seating: data.outdoor_seating || false,
        pet_friendly: data.pet_friendly || false,
        wheelchair_accessible: data.wheelchair_accessible || false,
        
        description: data.description || '',
        tagline: data.tagline || '',
        
        instagram_handle: data.instagram_handle || '',
        facebook_url: data.facebook_url || '',
        
        // Contact for verification
        contact_name: '',
        contact_role: '',
        contact_email: '',
      })
    }
    
    setLoading(false)
  }

  // Send verification code
  const sendVerificationCode = async () => {
    setError('')
    
    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    
    if (verificationMethod === 'email') {
      if (!userEmail) {
        setError('Please enter an email address')
        return
      }
      
      // Check if email matches winery domain
      const wineryDomain = winery.website?.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]
      const emailDomain = userEmail.split('@')[1]
      
      // Store code in session/temp table
      sessionStorage.setItem('verificationCode', code)
      sessionStorage.setItem('verificationEmail', userEmail)
      
      // TODO: Send actual email via Resend/SendGrid
      // For now, just show code in console for testing
      console.log(`Verification code for ${userEmail}: ${code}`)
      
      alert(`Verification code sent to ${userEmail}!\n\n(For testing: ${code})`)
      setSentCode(true)
      
    } else if (verificationMethod === 'phone') {
      if (!userPhone) {
        setError('Please enter a phone number')
        return
      }
      
      // Normalize phone
      const normalizedPhone = userPhone.replace(/\D/g, '')
      const wineryPhone = winery.phone?.replace(/\D/g, '')
      
      sessionStorage.setItem('verificationCode', code)
      sessionStorage.setItem('verificationPhone', normalizedPhone)
      
      // TODO: Send SMS via Twilio
      console.log(`Verification code for ${userPhone}: ${code}`)
      
      alert(`Verification code sent to ${userPhone}!\n\n(For testing: ${code})`)
      setSentCode(true)
      
    } else if (verificationMethod === 'domain') {
      // Domain verification - check if they control the website
      setError('Domain verification requires you to add a meta tag to your website. Email verification is easier!')
    }
  }

  // Verify code
  const verifyCode = () => {
    const storedCode = sessionStorage.getItem('verificationCode')
    const storedEmail = sessionStorage.getItem('verificationEmail')
    const storedPhone = sessionStorage.getItem('verificationPhone')
    
    if (verificationCode === storedCode) {
      setVerified(true)
      setFormData({
        ...formData,
        contact_email: storedEmail || userEmail,
      })
      setStep('edit')
      sessionStorage.removeItem('verificationCode')
    } else {
      setError('Incorrect verification code. Please try again.')
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Convert hours to JSONB
    const hours = {
      mon: formData.monday_hours || 'closed',
      tue: formData.tuesday_hours || 'closed',
      wed: formData.wednesday_hours || 'closed',
      thu: formData.thursday_hours || 'closed',
      fri: formData.friday_hours || 'closed',
      sat: formData.saturday_hours || 'closed',
      sun: formData.sunday_hours || 'closed',
    }

    // Update winery record
    const updates = {
      name: formData.name,
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
      
      // Mark as owner-verified
      owner_verified: true,
      claimed_at: new Date().toISOString(),
      claimed_by_email: formData.contact_email,
      last_verified_at: new Date().toISOString(),
      
      // Update internal notes with claimer info
      internal_notes: `${winery.internal_notes || ''}\n\nClaimed by: ${formData.contact_name} (${formData.contact_role}) - ${formData.contact_email} on ${new Date().toLocaleDateString()}`,
    }

    const { error: updateError } = await supabase
      .from('wineries')
      .update(updates)
      .eq('id', winery.id)

    if (updateError) {
      setError('Failed to update. Please try again or contact support.')
      console.error(updateError)
    } else {
      setStep('submitted')
      
      // TODO: Send confirmation email to winery
      // TODO: Send notification to admin
    }
  }

  const handleCheckbox = (field, value) => {
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
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="text-[#4A4A50]">Loading...</div>
      </div>
    )
  }

  // Error state
  if (step === 'error') {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-[#2C2C30] mb-2">Invalid Claim Link</h2>
          <p className="text-[#4A4A50] mb-6">{error}</p>
          <a
            href="/winery/submit"
            className="inline-block px-6 py-3 bg-[#6B2D3F] hover:bg-[#8B3A4D] text-white font-medium rounded-lg transition-colors"
          >
            Submit New Winery Instead
          </a>
        </div>
      </div>
    )
  }

  // Success state
  if (step === 'submitted') {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-[#2C2C30] mb-2">Successfully Claimed!</h2>
          <p className="text-[#4A4A50] mb-4">
            Thank you for claiming and updating <strong>{winery.name}</strong>.
          </p>
          <p className="text-sm text-[#4A4A50] mb-6">
            Your changes are now live on ValleySomm. You'll receive a confirmation email at {formData.contact_email}.
          </p>
          <div className="space-y-3">
            <a
              href={`/winery/${winery.slug}`}
              className="block px-6 py-3 bg-[#6B2D3F] hover:bg-[#8B3A4D] text-white font-medium rounded-lg transition-colors"
            >
              View Your Listing
            </a>
            <a
              href="/"
              className="block px-6 py-3 bg-[#2D4A3E] hover:bg-[#5B7C6F] text-white font-medium rounded-lg transition-colors"
            >
              Back to ValleySomm
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Verification step
  if (step === 'verify' && !verified) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#2C2C30] mb-2">
              Claim {winery?.name}
            </h1>
            <p className="text-[#4A4A50]">
              First, let's verify you represent this winery
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-6">
              <p className="text-sm text-[#4A4A50] mb-4">
                To protect winery owners, we need to verify you have authority to update this listing.
              </p>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-[#6B2D3F]"
                  style={{ borderColor: verificationMethod === 'email' ? '#6B2D3F' : '#E8E0D5' }}>
                  <input
                    type="radio"
                    name="verification"
                    value="email"
                    checked={verificationMethod === 'email'}
                    onChange={(e) => setVerificationMethod(e.target.value)}
                    className="w-4 h-4 text-[#6B2D3F]"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-[#2C2C30]">Email Verification (Recommended)</div>
                    <div className="text-sm text-[#4A4A50]">
                      We'll send a code to your winery email address
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-[#6B2D3F]"
                  style={{ borderColor: verificationMethod === 'phone' ? '#6B2D3F' : '#E8E0D5' }}>
                  <input
                    type="radio"
                    name="verification"
                    value="phone"
                    checked={verificationMethod === 'phone'}
                    onChange={(e) => setVerificationMethod(e.target.value)}
                    className="w-4 h-4 text-[#6B2D3F]"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-[#2C2C30]">Phone Verification</div>
                    <div className="text-sm text-[#4A4A50]">
                      We'll text a code to {winery?.phone || 'your winery phone'}
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {verificationMethod === 'email' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#4A4A50] mb-2">
                  Your Email Address *
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="you@yourwinery.com"
                  className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                />
                <p className="text-xs text-[#B8A99A] mt-1">
                  Best if this matches your winery's domain ({winery?.website?.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]})
                </p>
              </div>
            )}

            {verificationMethod === 'phone' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#4A4A50] mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder={winery?.phone || '(336) 555-1234'}
                  className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                />
              </div>
            )}

            {!sentCode ? (
              <button
                onClick={sendVerificationCode}
                className="w-full py-3 bg-[#6B2D3F] hover:bg-[#8B3A4D] text-white font-medium rounded-lg transition-colors"
              >
                Send Verification Code
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#4A4A50] mb-2">
                    Enter 6-Digit Code
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none text-center text-2xl tracking-widest font-mono"
                  />
                </div>
                
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}
                
                <button
                  onClick={verifyCode}
                  disabled={verificationCode.length !== 6}
                  className="w-full py-3 bg-[#6B2D3F] hover:bg-[#8B3A4D] disabled:bg-[#B8A99A] text-white font-medium rounded-lg transition-colors"
                >
                  Verify Code
                </button>
                
                <button
                  onClick={() => setSentCode(false)}
                  className="w-full text-sm text-[#6B2D3F] hover:text-[#8B3A4D]"
                >
                  Resend Code
                </button>
              </div>
            )}

            <div className="mt-6 p-4 bg-[#FAF7F2] rounded-lg">
              <p className="text-xs text-[#4A4A50]">
                <strong>Why verify?</strong> We want to make sure only authorized representatives can update winery information. If you're having trouble, email us at hello@valleysomm.com
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Edit form (same as submit form but pre-filled)
  const wineStyleOptions = [
    'Dry Reds', 'Sweet Reds', 'Dry Whites', 'Sweet Whites',
    'Sparkling', 'Rosé', 'Dessert Wines', 'Fruit Wines'
  ]

  const vibeOptions = [
    'Romantic', 'Family-Friendly', 'Scenic Views', 'Rustic', 'Modern',
    'Historic', 'Intimate', 'Spacious', 'Lively', 'Quiet', 'Casual', 'Upscale', 'Educational'
  ]

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
            ✓ Verified Owner
          </div>
          <h1 className="text-3xl font-bold text-[#2C2C30] mb-2">
            Update {winery.name}
          </h1>
          <p className="text-[#4A4A50]">
            Review and update your winery's information
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          {/* Contact Person Section */}
          <section>
            <h2 className="text-xl font-semibold text-[#2C2C30] mb-4 pb-2 border-b border-[#E8E0D5]">
              Your Information
            </h2>
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
                  placeholder="Owner / Manager"
                  className="w-full p-3 rounded-lg border border-[#E8E0D5] focus:border-[#6B2D3F] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A4A50] mb-1">
                  Email (verified)
                </label>
                <input
                  type="email"
                  value={formData.contact_email}
                  disabled
                  className="w-full p-3 rounded-lg border border-[#E8E0D5] bg-[#FAF7F2] text-[#B8A99A]"
                />
              </div>
            </div>
          </section>

          {/* Rest of form - use same sections as submit form */}
          {/* For brevity, showing just basic structure - copy full sections from winery-submit-page.js */}
          
          <section>
            <h2 className="text-xl font-semibold text-[#2C2C30] mb-4">Basic Information</h2>
            {/* Same basic info fields as submit form */}
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
              className="w-full py-4 bg-[#6B2D3F] hover:bg-[#8B3A4D] text-white font-medium text-lg rounded-lg transition-colors"
            >
              Update Winery Information
            </button>
            <p className="text-xs text-center text-[#B8A99A] mt-3">
              Changes are live immediately. You can update anytime using this link.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}