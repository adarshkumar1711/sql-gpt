import { SignIn } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <SignIn 
        appearance={{
          variables: {
            colorPrimary: '#10a37f',
          },
          elements: {
            formButtonPrimary: 'bg-[#10a37f] hover:bg-[#0d8f70] text-white border-0',
            card: 'shadow-lg',
          }
        }}
        redirectUrl="/dashboard"
        afterSignInUrl="/dashboard"
      />
    </div>
  );
} 