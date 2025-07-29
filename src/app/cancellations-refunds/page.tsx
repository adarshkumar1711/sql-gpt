import Link from 'next/link';

export default function CancellationsRefunds() {
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
          <h1 className="text-4xl font-bold text-white mb-8">Cancellations and Refunds</h1>
          
          <div className="bg-[#151925] rounded-xl p-8 border border-[#1d2232]">
            <h2 className="text-2xl font-semibold text-white mb-4">Cancellations and Refunds Policy</h2>
            <p className="text-gray-400 mb-6"><strong>Effective Date:</strong> 29 July 2025</p>
            
            <div className="space-y-6">
              <p className="text-gray-300 leading-relaxed">
                SQL-GPT is a subscription-based digital product.
              </p>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Refunds:</h3>
                <p className="text-gray-300 leading-relaxed">
                  Users may request a full refund within 7 days of purchase if they have used fewer than 10 queries. Refunds are issued to the original payment method.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Cancellations:</h3>
                <p className="text-gray-300 leading-relaxed">
                  You may cancel your subscription at any time from your account dashboard. After cancellation, you will retain access to paid features until the end of your current billing cycle.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Contact for Refunds or Cancellations:</h3>
                <p className="text-gray-300">
                  For refund or cancellation requests, contact: {' '}
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