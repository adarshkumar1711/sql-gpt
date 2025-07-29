import Link from 'next/link';

export default function TermsConditions() {
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
          <h1 className="text-4xl font-bold text-white mb-8">Terms and Conditions</h1>
          
          <div className="bg-[#151925] rounded-xl p-8 border border-[#1d2232]">
            <h2 className="text-2xl font-semibold text-white mb-4">Terms and Conditions for SQL-GPT</h2>
            <p className="text-gray-400 mb-6"><strong>Effective Date:</strong> 29 July 2025</p>
            
            <div className="space-y-6">
              <p className="text-gray-300 leading-relaxed">
                By accessing or using our services at https://sql-gpt-olive.vercel.app, you agree to the terms outlined below.
              </p>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Service Overview:</h3>
                <p className="text-gray-300 leading-relaxed">
                  SQL-GPT allows users to convert natural language input into SQL queries using artificial intelligence. It is intended for developers, analysts, and database professionals.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">User Conduct:</h3>
                <p className="text-gray-300 leading-relaxed">
                  You agree not to use SQL-GPT for any illegal or unauthorized purpose. You are responsible for the data you submit and for ensuring that it does not contain confidential or production-sensitive information.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Payments and Subscriptions:</h3>
                <p className="text-gray-300 leading-relaxed">
                  Paid plans are available on our platform. Payments are securely processed via Razorpay. Pricing and features are clearly displayed on our website.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Intellectual Property:</h3>
                <p className="text-gray-300 leading-relaxed">
                  All platform content, design, models, and features belong to SQL-GPT and may not be copied or redistributed without permission.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Termination:</h3>
                <p className="text-gray-300 leading-relaxed">
                  We may suspend or terminate your access if you violate these terms or misuse the service.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Changes to Terms:</h3>
                <p className="text-gray-300 leading-relaxed">
                  These terms may be updated at any time. Your continued use after changes constitutes acceptance.
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