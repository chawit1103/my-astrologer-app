// app/dashboard/page.tsx
'use client';

import React from 'react';
import { useState, useEffect } from 'react'; // Import useEffect
import { createClient } from '@/lib/supabaseClient'; // Import your Supabase client instance

const supabase = createClient();

export default function DashboardPage() {
  const [birthDate, setBirthDate] = useState<string>('');
  const [birthTime, setBirthTime] = useState<string>('');
  const [birthPlace, setBirthPlace] = useState<string>('');
  const [horoscopeResult, setHoroscopeResult] = useState<string | null>(null);
  const [latestDailyReading, setLatestDailyReading] = useState<string | null>(null); // New state for latest daily reading
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null); // State to store the logged-in user

  // --- useEffect สำหรับดึงข้อมูลผู้ใช้และคำทำนายล่าสุด ---
  useEffect(() => {
    const fetchUserAndDailyReading = async () => {
      // 1. ดึงข้อมูล User Session
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // 2. ดึงคำทำนายล่าสุดจาก 'daily_readings'
        const { data, error } = await supabase
          .from('daily_readings')
          .select('reading_text')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }) // เรียงจากใหม่สุดไปเก่าสุด
          .limit(1) // เอาแค่ 1 รายการล่าสุด
          .single(); // ดึงมาแค่ Object เดียว

        if (error && error.code !== 'PGRST116') { // PGRST116 คือ 'No rows found'
          console.error('Error fetching latest daily reading:', error.message);
        } else if (data) {
          setLatestDailyReading(data.reading_text);
        }
      }
    };

    fetchUserAndDailyReading();

    // Setup listener for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      setUser(session?.user || null);
      if (session?.user) {
        // Refetch latest reading if user logs in or session changes
        fetchUserAndDailyReading();
      } else {
        setLatestDailyReading(null); // Clear reading if logged out
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount

  // --- ฟังก์ชัน handlePredictHoroscope (เหมือนเดิม) ---
  const handlePredictHoroscope = async () => {
    setLoading(true);
    setError(null);
    setHoroscopeResult(null); // Clear previous result

    if (!user) { // เพิ่มการตรวจสอบว่ามีผู้ใช้ล็อกอินอยู่หรือไม่
        setError('คุณต้องเข้าสู่ระบบเพื่อขอคำทำนาย');
        setLoading(false);
        return;
    }

    // Basic validation
    if (!birthDate || !birthTime || !birthPlace) {
      setError('กรุณากรอกข้อมูล วันเกิด, เวลาเกิด, และสถานที่เกิด ให้ครบถ้วน');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/horoscope', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          birthDate,
          birthTime,
          birthPlace,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'เกิดข้อผิดพลาดในการรับคำทำนาย');
        console.error('API Error:', errorData.error);
        return;
      }

      const data = await response.json();
      setHoroscopeResult(data.horoscope);
      console.log('Horoscope received:', data.horoscope);

      // (Optional) บันทึกคำทำนายที่เพิ่งสร้างลงใน daily_readings ทันที
      // หากคุณต้องการให้คำทำนายที่ผู้ใช้กดขอเอง ถูกบันทึกทันทีด้วย
      const { error: insertError } = await supabase
        .from('daily_readings')
        .insert({
          user_id: user.id, // ใช้ user.id ที่เราดึงมา
          reading_text: data.horoscope,
        });

      if (insertError) {
        console.error('Error saving new horoscope to daily_readings:', insertError.message);
      } else {
        // อัปเดต latestDailyReading ทันทีหลังจากบันทึกสำเร็จ
        setLatestDailyReading(data.horoscope);
      }

    } catch (err: any) {
      setError(err.message || 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
      console.error('Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.16)*2)] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* ส่วนสำหรับแสดงคำทำนายล่าสุด */}
      {latestDailyReading && (
        <div className="mb-8 max-w-3xl w-full p-8 bg-white rounded-lg shadow-xl border border-blue-200 animate-fade-in-down">
          <h2 className="text-2xl font-bold text-blue-700 mb-4 text-center">
            คำทำนายประจำวันสำหรับคุณ
          </h2>
          <div className="prose max-w-none text-gray-700 text-lg leading-relaxed text-center">
            <div dangerouslySetInnerHTML={{ __html: latestDailyReading.replace(/\n/g, '<br/>') }} />
          </div>
        </div>
      )}

      {/* Form สำหรับขอคำทำนายใหม่ (ส่วนที่เหลือเหมือนเดิม) */}
      <div className="max-w-3xl w-full space-y-8 p-10 bg-white rounded-lg shadow-xl border border-gray-200">
        <h1 className="text-4xl font-extrabold text-gray-900 text-center">
          ขอคำทำนายดวงชะตา
        </h1>
        <p className="mt-2 text-center text-gray-600">
          กรุณากรอกข้อมูลวันเกิด, เวลาเกิด และสถานที่เกิด เพื่อรับคำทำนายที่แม่นยำ
        </p>

        <div className="space-y-6">
          {/* Birth Date Input */}
          <div>
            <label htmlFor="birthDate" className="block text-lg font-medium text-gray-700 mb-1">
              วัน/เดือน/ปีเกิด:
            </label>
            <input
              id="birthDate"
              name="birthDate"
              type="date"
              required
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              disabled={loading}
              className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-base"
            />
          </div>

          {/* Birth Time Input */}
          <div>
            <label htmlFor="birthTime" className="block text-lg font-medium text-gray-700 mb-1">
              เวลาเกิด:
            </label>
            <input
              id="birthTime"
              name="birthTime"
              type="time"
              required
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
              disabled={loading}
              className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-base"
            />
          </div>

          {/* Birth Place Input */}
          <div>
            <label htmlFor="birthPlace" className="block text-lg font-medium text-gray-700 mb-1">
              สถานที่เกิด:
            </label>
            <input
              id="birthPlace"
              name="birthPlace"
              type="text"
              placeholder="เช่น กรุงเทพมหานคร, ประเทศไทย"
              required
              value={birthPlace}
              onChange={(e) => setBirthPlace(e.target.value)}
              disabled={loading}
              className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-base"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">ข้อผิดพลาด: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              onClick={handlePredictHoroscope}
              disabled={loading || !birthDate || !birthTime || !birthPlace || !user}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-xl font-bold rounded-md text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังทำนายดวงชะตา...
                </>
              ) : (
                'ขอคำทำนาย'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Horoscope Result Display (สำหรับคำทำนายที่ผู้ใช้กดขอเอง) */}
      {horoscopeResult && (
        <div className="mt-8 max-w-3xl w-full p-10 bg-white rounded-lg shadow-xl border border-gray-200 animate-fade-in-up">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            ผลคำทำนายดวงชะตาสำหรับคุณ
          </h2>
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed text-justify">
            <div dangerouslySetInnerHTML={{ __html: horoscopeResult.replace(/\n/g, '<br/>') }} />
          </div>
        </div>
      )}
    </div>
  );
}
