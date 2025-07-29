import Link from 'next/link';

export default function ShippingPolicy() {
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
          <h1 className="text-4xl font-bold text-white mb-8">Shipping Policy</h1>
          
          <div className="bg-[#151925] rounded-xl p-8 border border-[#1d2232]">
            <h2 className="text-2xl font-semibold text-white mb-4">Shipping Policy</h2>
            <p className="text-gray-400 mb-6"><strong>Effective Date:</strong> 29 July 2025</p>
            
            <div className="space-y-6">
              <p className="text-gray-300 leading-relaxed">
                SQL-GPT is a software-as-a-service product delivered entirely online.
              </p>
              
              <div>
                <ul className="text-gray-300 space-y-3 list-disc list-inside">
                  <li>There is no physical shipping involved.</li>
                  <li>Access to the service is granted immediately after successful payment confirmation.</li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      If you do not receive access within 5 minutes, contact us at: {' '}
                      <a href="mailto:adarshkumar1711@gmail.com" className="text-blue-400 hover:text-blue-300 transition-colors">
                        adarshkumar1711@gmail.com
                      </a>
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 