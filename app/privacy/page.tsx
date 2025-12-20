'use client'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 sm:p-12">
        <div className="text-center mb-8">
          <div className="text-sm font-medium text-amber-700 mb-2">Valley Somm</div>
          <h1 className="text-3xl font-bold text-stone-800 mb-2">Privacy Policy</h1>
          <p className="text-sm text-stone-500">Last Updated: December 20, 2024</p>
        </div>

        <div className="prose prose-stone max-w-none">
          <h2>Introduction</h2>
          <p>
            Valley Somm ("we," "our," or "us") respects your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you participate in our wine country trip survey and use our services.
          </p>

          <h2>Information We Collect</h2>
          
          <h3>Survey Responses</h3>
          <p>When you complete our survey, we collect:</p>
          <ul>
            <li><strong>Wine trip information:</strong> Regions visited, planning timeline, group type, travel preferences</li>
            <li><strong>Open-ended feedback:</strong> Your experiences, pain points, and suggestions</li>
            <li><strong>Preferences:</strong> Discovery methods, confidence levels, willingness to pay for solutions</li>
            <li><strong>Source tracking:</strong> How you found our survey (e.g., Reddit, Facebook, friend referral)</li>
          </ul>

          <h3>Optional Contact Information</h3>
          <p>If you choose to provide it:</p>
          <ul>
            <li><strong>Email address:</strong> For gift card drawing entry and/or receiving survey results</li>
            <li><strong>Preferences:</strong> Whether you want to enter the drawing and/or receive results</li>
          </ul>

          <h3>Automatically Collected Information</h3>
          <ul>
            <li><strong>Timestamps:</strong> When you submitted the survey</li>
            <li><strong>Technical data:</strong> Browser type, device information (collected by our hosting provider)</li>
          </ul>

          <h2>How We Use Your Information</h2>
          
          <p>We use the information we collect to:</p>
          <ul>
            <li><strong>Product development:</strong> Understand pain points and build solutions for wine country trip planning</li>
            <li><strong>Research and analysis:</strong> Identify patterns, segment users, and prioritize features</li>
            <li><strong>Gift card drawing:</strong> Contact the winner and distribute the prize</li>
            <li><strong>Results sharing:</strong> Send aggregate survey findings to interested participants</li>
            <li><strong>Communication:</strong> Follow up about Valley Somm's product launch (only if you opted in)</li>
          </ul>

          <h2>How We Share Your Information</h2>
          
          <p>We do not sell your personal information. We may share your information with:</p>
          
          <h3>Service Providers</h3>
          <ul>
            <li><strong>Supabase:</strong> Database hosting for survey responses (data stored in US region)</li>
            <li><strong>Vercel:</strong> Web hosting and deployment platform</li>
          </ul>

          <h3>Legal Requirements</h3>
          <p>We may disclose your information if required by law, court order, or government request.</p>

          <h3>Aggregated Data</h3>
          <p>We may share anonymized, aggregated survey results publicly or with partners. This data cannot identify you personally.</p>

          <h2>Data Retention</h2>
          
          <p>We retain your survey responses and email address for:</p>
          <ul>
            <li><strong>Gift card drawing:</strong> Until January 31, 2025 (10 days after drawing date)</li>
            <li><strong>Survey analysis:</strong> Indefinitely for product development purposes</li>
            <li><strong>Marketing (if opted in):</strong> Until you unsubscribe or request deletion</li>
          </ul>

          <h2>Your Rights</h2>
          
          <p>You have the right to:</p>
          <ul>
            <li><strong>Access:</strong> Request a copy of your survey responses and personal data</li>
            <li><strong>Deletion:</strong> Request deletion of your email address and survey responses</li>
            <li><strong>Correction:</strong> Request correction of inaccurate information</li>
            <li><strong>Opt-out:</strong> Unsubscribe from future communications</li>
          </ul>

          <p>
            To exercise these rights, contact us at <a href="mailto:privacy@valleysomm.com" className="text-amber-600 hover:text-amber-700">privacy@valleysomm.com</a>
          </p>

          <h2>Data Security</h2>
          
          <p>
            We implement reasonable security measures to protect your information, including:
          </p>
          <ul>
            <li>Encrypted data transmission (HTTPS)</li>
            <li>Secure database with row-level security policies</li>
            <li>Password-protected admin access</li>
            <li>Regular security updates to our infrastructure</li>
          </ul>

          <p>
            However, no internet transmission is 100% secure. We cannot guarantee absolute security of your data.
          </p>

          <h2>Children's Privacy</h2>
          
          <p>
            Our survey is not intended for individuals under 21 years old. We do not knowingly collect information from minors. If we discover we have collected information from someone under 21, we will delete it promptly.
          </p>

          <h2>Third-Party Links</h2>
          
          <p>
            Our website may contain links to third-party sites (e.g., social media platforms). We are not responsible for the privacy practices of these sites. Please review their privacy policies.
          </p>

          <h2>Changes to This Policy</h2>
          
          <p>
            We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last Updated" date. Significant changes will be communicated via email to opted-in users.
          </p>

          <h2>Contact Us</h2>
          
          <p>
            If you have questions about this Privacy Policy or our data practices, contact us at:
          </p>
          <ul>
            <li><strong>Email:</strong> <a href="mailto:privacy@valleysomm.com" className="text-amber-600 hover:text-amber-700">privacy@valleysomm.com</a></li>
            <li><strong>Mail:</strong> Valley Somm, Elkin, NC 28621</li>
          </ul>

          <div className="mt-12 pt-8 border-t border-stone-200 text-center">
            <a href="/" className="text-amber-600 hover:text-amber-700 font-medium">
              ← Back to Survey
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}