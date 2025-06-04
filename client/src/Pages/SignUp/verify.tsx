import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../supabase/supabase'

export const Verify = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get the token from URL parameters
        const token = searchParams.get('token');
        const type = searchParams.get('type');

        if (!token || type !== 'signup') {
          setVerificationStatus('error');
          setErrorMessage('Invalid verification link');
          return;
        }

        // Verify the email with Supabase
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'signup'
        });

        if (error) {
          setVerificationStatus('error');
          setErrorMessage(error.message);
        } else {
          setVerificationStatus('success');
          
          // Optional: Auto-redirect after 3 seconds
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }
      } catch (err: any) {
        setVerificationStatus('error');
        setErrorMessage('An unexpected error occurred');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  const handleLoginClick = () => {
    navigate('/login');
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        {verificationStatus === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Verifying your email...</h2>
            <p className="text-gray-600">Please wait while we verify your account.</p>
          </>
        )}

        {verificationStatus === 'success' && (
          <>
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h2 className="text-xl font-semibold text-green-600 mb-2">Email Verified Successfully!</h2>
            <p className="text-gray-600 mb-6">Your account has been verified. You can now log in.</p>
            <button 
              onClick={handleLoginClick}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Go to Login
            </button>
            <p className="text-sm text-gray-500 mt-3">You will be redirected automatically in a few seconds...</p>
          </>
        )}

        {verificationStatus === 'error' && (
          <>
            <div className="text-red-500 text-5xl mb-4">✗</div>
            <h2 className="text-xl font-semibold text-red-600 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-4">{errorMessage}</p>
            <div className="space-y-2">
              <button 
                onClick={handleLoginClick}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors w-full"
              >
                Go to Login
              </button>
              <button 
                onClick={() => navigate('/signup')}
                className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg transition-colors w-full"
              >
                Back to Sign Up
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Verify