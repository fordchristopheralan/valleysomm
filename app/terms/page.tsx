'use client'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 sm:p-12">
        <div className="text-center mb-8">
          <div className="text-sm font-medium text-amber-700 mb-2">Valley Somm</div>
          <h1 className="text-3xl font-bold text-stone-800 mb-2">Terms of Service</h1>
          <p className="text-sm text-stone-500">Last Updated: December 20, 2024</p>
        </div>

        <div className="prose prose-stone max-w-none">
          <h2>Agreement to Terms</h2>
          <p>
            By accessing or using Valley Somm's website and survey ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, please do not use our Service.
          </p>

          <h2>Description of Service</h2>
          
          <p>
            Valley Somm provides a research survey to gather feedback about wine country trip planning experiences. We may use this feedback to develop products and services related to wine tourism planning.
          </p>

          <h2>Eligibility</h2>
          
          <p>You must be:</p>
          <ul>
            <li>At least 21 years old</li>
            <li>Capable of forming a binding contract</li>
            <li>Not prohibited from using the Service under applicable law</li>
          </ul>

          <h2>Survey Participation</h2>
          
          <h3>Voluntary Participation</h3>
          <p>
            Participation in our survey is completely voluntary. You may skip questions or stop at any time.
          </p>

          <h3>Accuracy of Information</h3>
          <p>
            You agree to provide truthful, accurate information to the best of your knowledge. Fraudulent or misleading responses may disqualify you from the gift card drawing.
          </p>

          <h3>One Submission Per Person</h3>
          <p>
            You may only submit one survey response. Multiple submissions from the same person may be removed and disqualified from the drawing.
          </p>

          <h2>Gift Card Drawing</h2>
          
          <p>
            The $50 gift card drawing is subject to our <a href="/rules" className="text-amber-600 hover:text-amber-700">Official Sweepstakes Rules</a>. Key points:
          </p>
          <ul>
            <li>Entry requires providing a valid email address and opting in to the drawing</li>
            <li>Drawing closes January 20, 2025 at 11:59 PM EST</li>
            <li>One winner will be selected randomly</li>
            <li>Prize is a $50 gift card (merchant to be determined)</li>
            <li>See full rules for complete details and restrictions</li>
          </ul>

          <h2>Intellectual Property</h2>
          
          <h3>Our Content</h3>
          <p>
            All content on Valley Somm, including text, graphics, logos, and software, is owned by Valley Somm or our licensors and protected by copyright and trademark laws.
          </p>

          <h3>Your Feedback</h3>
          <p>
            By submitting survey responses, you grant Valley Somm a perpetual, worldwide, royalty-free license to use, reproduce, modify, and analyze your feedback for product development and research purposes. We may share aggregated, anonymized data publicly.
          </p>

          <h2>Prohibited Activities</h2>
          
          <p>You may not:</p>
          <ul>
            <li>Use the Service for any unlawful purpose</li>
            <li>Submit false, misleading, or fraudulent information</li>
            <li>Attempt to manipulate or game the gift card drawing</li>
            <li>Use automated systems (bots) to submit surveys</li>
            <li>Reverse engineer, decompile, or access our source code</li>
            <li>Interfere with the Service's operation or security</li>
            <li>Harvest or collect user information without consent</li>
          </ul>

          <h2>Disclaimers</h2>
          
          <h3>No Warranties</h3>
          <p>
            The Service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, express or implied. We do not guarantee:
          </p>
          <ul>
            <li>Uninterrupted or error-free operation</li>
            <li>Accuracy or reliability of information</li>
            <li>Results from participating in the survey</li>
          </ul>

          <h3>Not Professional Advice</h3>
          <p>
            Valley Somm does not provide professional travel, financial, or legal advice. Any information provided is for research and informational purposes only.
          </p>

          <h2>Limitation of Liability</h2>
          
          <p>
            To the fullest extent permitted by law, Valley Somm, its owners, employees, and partners shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.
          </p>

          <p>
            Our total liability shall not exceed the value of the gift card prize ($50 USD).
          </p>

          <h2>Indemnification</h2>
          
          <p>
            You agree to indemnify and hold Valley Somm harmless from any claims, damages, or expenses arising from your violation of these Terms or misuse of the Service.
          </p>

          <h2>Privacy</h2>
          
          <p>
            Your use of the Service is also governed by our <a href="/privacy" className="text-amber-600 hover:text-amber-700">Privacy Policy</a>, which describes how we collect, use, and protect your information.
          </p>

          <h2>Changes to Terms</h2>
          
          <p>
            We may modify these Terms at any time. Changes will be posted on this page with an updated "Last Updated" date. Continued use of the Service after changes constitutes acceptance of the new Terms.
          </p>

          <h2>Termination</h2>
          
          <p>
            We reserve the right to suspend or terminate your access to the Service at any time, without notice, for any reason, including violation of these Terms.
          </p>

          <h2>Governing Law</h2>
          
          <p>
            These Terms are governed by the laws of the State of North Carolina, USA, without regard to conflict of law principles. Any disputes shall be resolved in the courts of Surry County, North Carolina.
          </p>

          <h2>Severability</h2>
          
          <p>
            If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.
          </p>

          <h2>Entire Agreement</h2>
          
          <p>
            These Terms, along with our Privacy Policy and Sweepstakes Rules, constitute the entire agreement between you and Valley Somm regarding use of the Service.
          </p>

          <h2>Contact Us</h2>
          
          <p>
            Questions about these Terms? Contact us at:
          </p>
          <ul>
            <li><strong>Email:</strong> <a href="mailto:legal@valleysomm.com" className="text-amber-600 hover:text-amber-700">legal@valleysomm.com</a></li>
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