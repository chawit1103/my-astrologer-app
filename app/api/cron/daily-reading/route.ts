// app/api/cron/daily-reading/route.ts
// นี่คือ Server-side API Route สำหรับ Cron Job

import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // Import Supabase client instance ของคุณ

// ตรวจสอบ Google AI API Key และ Cron Secret จาก environment variables
const GEMINI_API_KEY = process.env.GOOGLE_AI_API_KEY;
const CRON_SECRET = process.env.CRON_SECRET; // Secret key สำหรับ Cron Job

if (!GEMINI_API_KEY) {
  throw new Error('GOOGLE_AI_API_KEY environment variable is not set.');
}
if (!CRON_SECRET) {
  throw new Error('CRON_SECRET environment variable is not set. Please set it in Vercel.');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
// ใช้โมเดล gemini-pro-vision เนื่องจากมักจะพร้อมใช้งานกว่าในบางภูมิภาค
// หากยังพบปัญหา 404 ให้ลองเปลี่ยนเป็น "text-bison-001"
const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

export async function GET(request: Request) {
  try {
    // 1. ความปลอดภัย: ตรวจสอบ Cron Secret Key
    // นี่เป็นสิ่งสำคัญมากเพื่อป้องกันการเรียก API จากภายนอกโดยไม่ได้รับอนุญาต
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${CRON_SECRET}`) {
      console.warn('Unauthorized access attempt to daily-reading cron API.');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    console.log('Cron Job: Daily Reading started at', new Date().toISOString());

    // 2. ดึงรายชื่อ user_id ทั้งหมดที่มีสถานะ 'active' จากตาราง 'subscriptions'
    const { data: activeSubscriptions, error: subscriptionsError } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('status', 'active');

    if (subscriptionsError) {
      console.error('Error fetching active subscriptions:', subscriptionsError);
      return new NextResponse('Error fetching active subscriptions', { status: 500 });
    }

    if (!activeSubscriptions || activeSubscriptions.length === 0) {
      console.log('No active subscriptions found. Skipping daily readings generation.');
      return new NextResponse('No active subscriptions', { status: 200 });
    }

    let successfulReadings = 0;
    const usersToProcess = Array.from(new Set(activeSubscriptions.map(sub => sub.user_id))); // ดึง user_id ที่ไม่ซ้ำกัน

    console.log(`Found ${usersToProcess.length} unique active users to generate readings for.`);

    // 3. วนลูปสำหรับแต่ละ user_id แล้วเรียก Gemini API
    for (const userId of usersToProcess) {
      try {
        // Prompt สั้นๆ ตามที่ร้องขอ
        const shortPrompt = "ขอคำแนะนำและข้อควรระวังสำหรับวันนี้ 1 ประโยคสั้นๆ";

        // กำหนด safety settings เพื่อลดโอกาสในการบล็อกเนื้อหาที่ไม่เหมาะสม
        const safetySettings = [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ];

        // เรียกใช้ Gemini API
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: shortPrompt }] }],
          safetySettings,
        });

        const response = result.response;
        const readingText = response.text();

        // 4. นำคำทำนายที่ได้ บันทึกลงในตาราง 'daily_readings'
        const { error: insertError } = await supabase
          .from('daily_readings')
          .insert({
            user_id: userId,
            reading_text: readingText,
            // created_at จะถูกตั้งค่าอัตโนมัติด้วย DEFAULT NOW()
          });

        if (insertError) {
          console.error(`Error saving daily reading for user ${userId}:`, insertError.message);
        } else {
          successfulReadings++;
          console.log(`Generated and saved reading for user ${userId}`);
        }

      } catch (innerError: any) {
        console.error(`Failed to generate/save reading for user ${userId}:`, innerError.message || innerError);
        // ตรวจจับข้อผิดพลาด Gemini API Key ไม่ถูกต้องที่นี่ด้วย
        if (innerError.message && innerError.message.includes('API key not valid')) {
          console.error('Critical: GOOGLE_AI_API_KEY might be invalid or quota exceeded.');
          // อาจจะส่งแจ้งเตือน admin ได้ที่นี่
        }
      }
    }

    console.log(`Cron Job: Daily Reading finished. Generated ${successfulReadings} readings successfully.`);

    return NextResponse.json({ message: `Daily readings generated for ${successfulReadings} active users.` });

  } catch (error: any) {
    console.error('Unhandled error in daily-reading cron job:', error.message || error);
    return new NextResponse('Internal Server Error in Cron Job', { status: 500 });
  }
}