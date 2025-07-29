import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0A0F1C] text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Back to Home Link */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
          
          <div className="bg-[#151925] rounded-xl p-8 border border-[#1d2232]">
            <h2 className="text-2xl font-semibold text-white mb-4">Privacy Policy for SQL-GPT</h2>
            <p className="text-gray-400 mb-6"><strong>Effective Date:</strong> 29 July 2025</p>
            
            <div className="space-y-6">
              <p className="text-gray-300 leading-relaxed">
                SQL-GPT ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our website https://sql-gpt-olive.vercel.app.
              </p>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Information We Collect:</h3>
                <ul className="text-gray-300 space-y-2 list-disc list-inside">
                  <li>Personal information such as your name and email when you sign in using our authentication provider Clerk.</li>
                  <li>User-provided data like SQL schemas or queries.</li>
                  <li>General usage data such as feature usage and query logs for performance improvement.</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">How We Use Your Information:</h3>
                <ul className="text-gray-300 space-y-2 list-disc list-inside">
                  <li>To provide and personalize our service.</li>
                  <li>To process subscriptions and payments via Razorpay.</li>
                  <li>To improve accuracy and performance of our features.</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Data Storage and Security:</h3>
                <p className="text-gray-300 leading-relaxed">
                  We use industry-standard encryption and secure authentication. All data is stored securely and access is limited to authorized personnel only.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Third-Party Sharing:</h3>
                <p className="text-gray-300 leading-relaxed">
                  We do not sell or rent your personal information. We may share limited anonymized usage data with analytics services. Payment information is securely handled by Razorpay and not stored by us.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Your Rights:</h3>
                <p className="text-gray-300 leading-relaxed">
                  You may contact us at any time to request data deletion or access to your personal data.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Contact:</h3>
                <p className="text-gray-300">
                  <a href="mailto:adarshkumar1711@gmail.com" className="text-blue-400 hover:text-blue-300 transition-colors">
                    adarshkumar1711@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 