// app/login/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter for redirection
import { createClient } from '@/lib/supabaseClient'; // Import your Supabase client instance

export default function LoginPage() {
  const [email, setEmail] = useState<string>('');
  const supabase = createClient();
  const [password, setPassword] = useState<string>('');
  const [isLoginMode, setIsLoginMode] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false); // State for loading indicator
  const [error, setError] = useState<string | null>(null); // State for error messages

  const router = useRouter(); // Initialize router for redirection

  // Function to handle user sign up
  const handleSignUp = async (emailToSignUp: string, passwordToSignUp: string) => {
    setLoading(true);
    setError(null); // Clear previous errors

    try {
      const { data, error } = await supabase.auth.signUp({
        email: emailToSignUp,
        password: passwordToSignUp,
        // options: {
        //   emailRedirectTo: `${window.location.origin}/auth/confirm`, // Optional: Redirect user after signup for email confirmation
        // }
      });

      if (error) {
        setError(error.message);
        console.error('Signup Error:', error.message);
        return;
      }

      if (data.user) {
        alert('สมัครสมาชิกสำเร็จ! โปรดตรวจสอบอีเมลของคุณเพื่อยืนยัน');
        console.log('User signed up:', data.user);
        // Optionally redirect or show a success message
        // router.push('/dashboard'); // Example: Redirect to a dashboard page after successful signup
      } else {
        // This case might happen if email confirmation is required and no user object is returned immediately
        alert('สมัครสมาชิกสำเร็จ! โปรดตรวจสอบอีเมลของคุณเพื่อยืนยัน');
      }

    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
      console.error('Unexpected Signup Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle user sign in
  const handleSignIn = async (emailToSignIn: string, passwordToSignIn: string) => {
    setLoading(true);
    setError(null); // Clear previous errors

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToSignIn,
        password: passwordToSignIn,
      });

      if (error) {
        setError(error.message);
        console.error('Sign In Error:', error.message);
        return;
      }

      if (data.user) {
        alert('เข้าสู่ระบบสำเร็จ!');
        console.log('User signed in:', data.user);
        router.push('/dashboard'); // Redirect to a dashboard page after successful login
      } else {
        // This case generally shouldn't happen with signInWithPassword if no error.
        // But good to have a fallback.
        setError('ไม่สามารถเข้าสู่ระบบได้ โปรดลองอีกครั้ง');
      }

    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      console.error('Unexpected Sign In Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Basic validation
    if (!email || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    if (isLoginMode) {
      handleSignIn(email, password);
    } else {
      handleSignUp(email, password);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-theme(spacing.16)*2)] bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-lg shadow-xl border border-gray-200">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLoginMode ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            หรือ{' '}
            <button
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setError(null); // Clear error when switching modes
              }}
              className="font-medium text-indigo-600 hover:text-indigo-500 transition duration-300 ease-in-out"
            >
              {isLoginMode ? 'สมัครสมาชิกตอนนี้' : 'เข้าสู่ระบบแทน'}
            </button>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Error Message Display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="อีเมล"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading} // Disable input while loading
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="รหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading} // Disable input while loading
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out"
              disabled={loading} // Disable button while loading
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังโหลด...
                </>
              ) : (
                isLoginMode ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'
              )}
            </button>
          </div>
        </form>

        {isLoginMode && (
          <div className="text-sm text-center">
            <Link href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
              ลืมรหัสผ่าน?
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
