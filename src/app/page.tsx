'use client';

import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from 'next/navigation';
import RazorpayPayment from '@/components/RazorpayPayment';
import { useRef, useState } from 'react';

export default function Home() {
  const router = useRouter();
  const pricingRef = useRef<HTMLElement>(null);
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const scrollToPricing = () => {
    pricingRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEnterpriseContact = () => {
    const subject = encodeURIComponent('Enterprise Plan Inquiry - SqlGPT');
    const body = encodeURIComponent(
      'Hi,\n\nI am interested in the Enterprise plan for SqlGPT. Could you please provide more details about:\n\n- Pricing\n- Features included\n- Implementation timeline\n- Support options\n\nThank you!'
    );
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=adarshkumar1711@gmail.com&su=${subject}&body=${body}`, '_blank');
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/send-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: feedbackEmail,
          message: feedbackMessage,
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFeedbackEmail('');
        setFeedbackMessage('');
        // Clear success message after 3 seconds
        setTimeout(() => setSubmitStatus('idle'), 3000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error sending feedback:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-screen text-center px-4 py-20 bg-[#0A0F1C] overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0F1C] via-[#1A1E2C] to-[#1C1A30] pointer-events-none"></div>
        
        {/* Decorative dots */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute h-2 w-2 bg-blue-400 rounded-full top-1/4 left-1/4"></div>
          <div className="absolute h-2 w-2 bg-purple-400 rounded-full top-1/3 right-1/4"></div>
          <div className="absolute h-2 w-2 bg-cyan-400 rounded-full bottom-1/4 left-1/3"></div>
          <div className="absolute h-1.5 w-1.5 bg-blue-400 rounded-full top-1/2 right-1/3"></div>
          <div className="absolute h-1.5 w-1.5 bg-purple-400 rounded-full bottom-1/3 left-1/4"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-white/5 rounded-full px-4 py-1.5 mb-16">
            <div className="flex -space-x-1">
              <div className="w-3 h-3 rounded-full bg-blue-400"></div>
              <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
              <div className="w-3 h-3 rounded-full bg-pink-400"></div>
            </div>
            <span className="text-sm text-gray-300 font-medium">Trusted by 10,000+ developers</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
            Understand Your Database
          </h1>
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 text-transparent bg-clip-text tracking-tight">
            with Natural Language
          </h2>

          {/* Subheading */}
          <div className="max-w-3xl mx-auto mb-6">
            <p className="text-xl text-gray-300 mb-2">
              Paste your schema. Ask questions. Get SQL queries instantly.
            </p>
            <p className="text-gray-500 text-lg">
              No SQL expertise required.
            </p>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-300">10,000+ Developers</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-300">99.9% Uptime</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-300">&lt;2s Response Time</span>
            </div>
          </div>

          {/* CTA Button */}
          <SignedOut>
            <SignInButton mode="redirect">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold text-lg px-8 py-4 rounded-full shadow-lg"
              >
                Try SqlGPT Free
                <svg className="w-5 h-5 ml-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Button 
              onClick={() => router.push('/dashboard')}
              size="lg" 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold text-lg px-8 py-4 rounded-full shadow-lg"
            >
              Go to Dashboard
              <svg className="w-5 h-5 ml-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Button>
          </SignedIn>
        </div>
      </section>

      {/* Powerful Features Section */}
      <section className="py-24 px-4 bg-[#0A0F1C]">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-gray-400 mb-16 max-w-3xl mx-auto">
            Everything you need to query your database with natural language, powered by advanced AI
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-[#151925] rounded-xl p-8 border border-[#1d2232] min-h-[320px] flex flex-col">
              <div className="w-14 h-14 rounded-lg bg-[#1a2137] flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 12a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">
                Paste your SQL schema
              </h3>
              <p className="text-gray-400 leading-relaxed text-lg">
                No setup needed. Simply paste your database schema and start asking questions immediately.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#151925] rounded-xl p-8 border border-[#1d2232] min-h-[320px] flex flex-col">
              <div className="w-14 h-14 rounded-lg bg-[#231a2d] flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-purple-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">
                Ask anything in plain English
              </h3>
              <p className="text-gray-400 leading-relaxed text-lg">
                Describe what you want to know about your data using natural language - no SQL knowledge required.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#151925] rounded-xl p-8 border border-[#1d2232] min-h-[320px] flex flex-col">
              <div className="w-14 h-14 rounded-lg bg-[#272316] flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">
                Instant SQL queries with explanations
              </h3>
              <p className="text-gray-400 leading-relaxed text-lg">
                Get accurate SQL queries instantly, complete with detailed explanations of how they work.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#151925] rounded-xl p-8 border border-[#1d2232] min-h-[320px] flex flex-col">
              <div className="w-14 h-14 rounded-lg bg-[#162323] flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 3v2H4v14h14v-5h2v7H2V3h7zm6.293-1.293l4 4a1 1 0 010 1.414l-9 9a1 1 0 01-.39.242l-3 1a1 1 0 01-1.243-1.243l1-3a1 1 0 01.242-.39l9-9a1 1 0 011.414 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">
                Complex multi-table joins
              </h3>
              <p className="text-gray-400 leading-relaxed text-lg">
                Supports sophisticated queries with joins, filters, and aggregations across multiple tables.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section ref={pricingRef} className="py-24 px-4 bg-[#0A0F1C]">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-white mb-4">
            Simple Pricing
          </h2>
          <p className="text-lg text-gray-400 mb-16">
            Choose the plan that works best for you and your team
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="bg-[#151925] rounded-xl p-8 border border-[#1d2232] relative">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-4">Free Plan</h3>
                <div className="flex items-baseline justify-center gap-0.5 mb-4">
                  <span className="text-5xl font-bold text-white">$0</span>
                  <span className="text-gray-400 ml-1">/mo</span>
                </div>
                <p className="text-gray-400">Perfect for trying out SqlGPT</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-gray-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  3 days trial
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  Basic query generation
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  Limited schema size
                </li>
              </ul>

              <SignedOut>
                <SignInButton mode="redirect">
                  <button className="w-full py-3 px-4 rounded-lg bg-[#1d2232] text-white font-medium hover:bg-[#252a3c] transition-colors">
                    Start Free Trial
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Button 
                  onClick={() => router.push('/dashboard')}
                  className="w-full py-3 px-4 rounded-lg bg-[#1d2232] text-white font-medium hover:bg-[#252a3c] transition-colors"
                >
                  Go to Dashboard
                </Button>
              </SignedIn>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-b from-[#1a1f42] to-[#1a1339] rounded-xl p-8 border border-[#1d2232] relative">
              {/* Most Popular Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              </div>

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-4">Pro Plan</h3>
                <div className="flex items-baseline justify-center gap-0.5 mb-4">
                  <span className="text-5xl font-bold text-white">₹1,565</span>
                  <span className="text-gray-300 ml-1">/mo</span>
                </div>
                <div className="text-sm text-gray-400 mb-4">
                  (~$19 USD)
                </div>
                <p className="text-gray-300">For professional developers</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-white">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                  750 queries/month
                </li>
                <li className="flex items-center gap-3 text-white">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                  Advanced features
                </li>
                <li className="flex items-center gap-3 text-white">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                  Saved sessions
                </li>
                <li className="flex items-center gap-3 text-white">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                  Priority support
                </li>
              </ul>

              <SignedOut>
                <SignInButton mode="redirect">
                  <button className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-colors">
                    Sign in for Pro
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <RazorpayPayment
                  planType="pro"
                  amount={1565}
                  buttonText="Upgrade to Pro"
                  onSuccess={() => {
                    router.push('/dashboard');
                  }}
                  className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-colors"
                />
              </SignedIn>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-[#151925] rounded-xl p-8 border border-[#1d2232] relative">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-4">Enterprise Plan</h3>
                <div className="flex items-baseline justify-center gap-0.5 mb-4">
                  <span className="text-5xl font-bold text-white">Custom</span>
                  <span className="text-gray-400 text-xl"> pricing</span>
                </div>
                <p className="text-gray-400">For teams and organizations</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-gray-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  Unlimited usage
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  Custom integrations
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  Team collaboration
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  Dedicated support
                </li>
              </ul>

              <Button 
                onClick={handleEnterpriseContact}
                className="w-full py-3 px-4 rounded-lg bg-[#1d2232] text-white font-medium hover:bg-[#252a3c] transition-colors"
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer with Feedback Form */}
      <section className="py-32 px-4 bg-[#0c101a]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">Have feedback or suggestions?</h2>
          <p className="text-lg text-gray-400 mb-12">We'd love to hear from you. Help us improve SqlGPT.</p>
          <form onSubmit={handleFeedbackSubmit} className="space-y-6">
            <Input
              type="email"
              placeholder="Your email address"
              value={feedbackEmail}
              onChange={(e) => setFeedbackEmail(e.target.value)}
              required
              className="bg-[#151925] border-none text-white placeholder:text-gray-400 rounded-xl py-6 px-5 text-base focus:ring-2 focus:ring-blue-500"
            />
            <Textarea
              placeholder="Your comment or feedback..."
              value={feedbackMessage}
              onChange={(e) => setFeedbackMessage(e.target.value)}
              required
              className="bg-[#151925] border-none text-white placeholder:text-gray-400 rounded-xl py-6 px-5 text-base min-h-[120px] focus:ring-2 focus:ring-blue-500"
            />
            <Button
              type="submit"
              disabled={isSubmitting || !feedbackEmail.trim() || !feedbackMessage.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold text-lg py-3 rounded-xl border-none mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending...' : 'Send Feedback'}
            </Button>
            
            {/* Status Messages */}
            {submitStatus === 'success' && (
              <div className="text-center p-3 bg-green-900/20 border border-green-500/20 rounded-lg text-green-400">
                ✅ Feedback sent successfully! Thank you for your input.
              </div>
            )}
            {submitStatus === 'error' && (
              <div className="text-center p-3 bg-red-900/20 border border-red-500/20 rounded-lg text-red-400">
                ❌ Failed to send feedback. Please try again.
              </div>
            )}
          </form>
        </div>
      </section>

    </div>
  );
}
