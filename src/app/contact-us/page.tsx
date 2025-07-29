import Link from 'next/link';

export default function ContactUs() {
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
          <h1 className="text-4xl font-bold text-white mb-8">Contact Us</h1>
          
          <div className="bg-[#151925] rounded-xl p-8 border border-[#1d2232]">
            <h2 className="text-2xl font-semibold text-white mb-4">Contact Us</h2>
            <p className="text-gray-400 mb-6"><strong>Effective Date:</strong> 29 July 2025</p>
            
            <div className="space-y-6">
              <p className="text-gray-300 leading-relaxed">
                If you have any questions, suggestions, or support requests, please contact us:
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <span className="text-gray-400">Email:</span> {' '}
                    <a href="mailto:adarshkumar1711@gmail.com" className="text-blue-400 hover:text-blue-300 transition-colors">
                      adarshkumar1711@gmail.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9a9 9 0 009-9m-9 9a9 9 0 01-9-9" />
                  </svg>
                  <div>
                    <span className="text-gray-400">Website:</span> {' '}
                    <a href="https://sql-gpt-olive.vercel.app" className="text-blue-400 hover:text-blue-300 transition-colors">
                      https://sql-gpt-olive.vercel.app
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-[#0c101a] rounded-lg border border-[#1d2232]">
                <h3 className="text-lg font-semibold text-white mb-3">Need Help?</h3>
                <p className="text-gray-300 leading-relaxed">
                  We typically respond to all inquiries within 24 hours. For technical support, please include details about your issue and any error messages you've encountered.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 