export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        <p className="text-sm text-gray-600 mb-8">Last updated: December 15, 2024</p>

        <div className="prose prose-purple max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">1.1 Information You Provide</h3>
            <p className="text-gray-700 leading-relaxed">
              When you use Valley Somm, we collect information you provide through our questionnaire:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Wine preferences (e.g., red, white, sparkling)</li>
              <li>Group size and composition</li>
              <li>Visit duration and timeframe</li>
              <li>Starting location/city</li>
              <li>Desired experience vibe</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-2">1.2 Automatically Collected Information</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>IP address and approximate location</li>
              <li>Device information (browser type, operating system)</li>
              <li>Usage data (pages visited, time spent, features used)</li>
              <li>Analytics events (quiz starts, completions, trail shares)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Generate personalized wine trail recommendations</li>
              <li>Improve our AI matching algorithm</li>
              <li>Analyze usage patterns and optimize user experience</li>
              <li>Track trail popularity and winery performance</li>
              <li>Provide aggregate analytics to partner wineries (no personal data)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Data Storage and Security</h2>
            <p className="text-gray-700 leading-relaxed">
              Your data is stored securely using industry-standard encryption:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Database hosted on Neon (serverless PostgreSQL) with encryption at rest</li>
              <li>Secure HTTPS connections for all data transmission</li>
              <li>Regular security audits and updates</li>
              <li>No payment information stored (we don't process payments)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Sharing</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We do NOT sell your personal information. We share data only in these limited circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>With Wineries:</strong> Aggregate, anonymized statistics only (e.g., "300 trails included your winery this month")</li>
              <li><strong>Service Providers:</strong> Groq (AI), Neon (database), Vercel (hosting)</li>
              <li><strong>Legal Requirements:</strong> If required by law or to protect rights/safety</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cookies and Tracking</h2>
            <p className="text-gray-700 leading-relaxed">
              We use cookies and similar technologies for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Session management (keeping you logged in if applicable)</li>
              <li>Analytics (Google Analytics to understand usage patterns)</li>
              <li>Performance monitoring</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              You can control cookies through your browser settings. Disabling cookies may limit functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Access your data (trails you've created)</li>
              <li>Request deletion of your trails</li>
              <li>Opt out of analytics tracking</li>
              <li>Request information about how your data is used</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              To exercise these rights, contact us at privacy@valleysomm.com
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Valley Somm is intended for users 21 and older (legal drinking age). We do not knowingly collect information from anyone under 21.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of significant changes by updating the "Last updated" date and, if appropriate, posting a notice on our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have questions about this privacy policy or our data practices:
            </p>
            <ul className="list-none space-y-2 text-gray-700 mt-4">
              <li>Email: privacy@valleysomm.com</li>
              <li>Website: valleysomm.com</li>
            </ul>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <a
            href="/"
            className="inline-block bg-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}