// app/api/horoscope/route.ts
// นี่คือ Server-side API Route เพราะไม่มี 'use client'
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// ตรวจสอบ Google AI API Key จาก environment variable
const GEMINI_API_KEY = process.env.GOOGLE_AI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('GOOGLE_AI_API_KEY environment variable is not set.');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" }); // ใช้โมเดล gemini-pro สำหรับ text-only input

export async function POST(request: Request) {
  try {
    const { birthDate, birthTime, birthPlace } = await request.json();

    // Basic validation
    if (!birthDate || !birthTime || !birthPlace) {
      return NextResponse.json(
        { error: 'โปรดระบุ birthDate, birthTime, และ birthPlace' },
        { status: 400 }
      );
    }

    // สร้าง Prompt โหราศาสตร์โดยละเอียด
    const horoscopePrompt = `
      คุณคือหมอดูมืออาชีพที่เชี่ยวชาญโหราศาสตร์ไทย โปรดช่วยทำนายดวงชะตาโดยละเอียดจากการวิเคราะห์ข้อมูลเกิดดังต่อไปนี้:
      - วันที่เกิด: ${birthDate}
      - เวลาเกิด: ${birthTime}
      - สถานที่เกิด: ${birthPlace}

      โปรดบอกตำแหน่งดาวในเรือน และราศี เช็คตำแหน่งดาวให้ถูกต้อง พร้อมทำนายครอบคลุมหัวข้อหลักดังนี้ โดยให้ข้อมูลที่เป็นประโยชน์ ข้อแนะนำ และคำเตือนอย่างละเอียดและเข้าใจง่าย:
      1.  **การงาน:** โอกาส, อุปสรรค, อาชีพที่เหมาะสม, คำแนะนำในการพัฒนาตนเอง
      2.  **การเงิน:** รายรับ, รายจ่าย, โอกาสทางการลงทุน, คำแนะนำในการบริหารจัดการเงิน
      3.  **ความรัก:** สำหรับคนโสด, สำหรับคนมีคู่, แนวโน้มความสัมพันธ์, คำแนะนำในการสร้างความสัมพันธ์ที่ดี
      4.  **สุขภาพ:** แนวโน้มสุขภาพกาย, สุขภาพใจ, จุดอ่อน, คำแนะนำในการดูแลสุขภาพ

      โปรดเขียนคำทำนายในรูปแบบที่อ่านง่าย เป็นกันเอง และให้ความหวังเชิงบวก (แต่ยังคงความเป็นจริง) ในภาษาไทย
      และหากมีคำเตือน ควรแนะนำวิธีป้องกันหรือแก้ไขด้วย

      เริ่มต้นคำทำนายด้วยคำว่า "คำทำนายดวงชะตาสำหรับคุณ:" และจัดรูปแบบการตอบกลับให้สวยงามโดยใช้ Markdown (เช่น หัวข้อ, ลิสต์)
    `;

    // กำหนด safety settings เพื่อลดโอกาสในการบล็อกเนื้อหาที่ไม่เหมาะสม
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
    ];

    // เรียกใช้ Gemini API
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: horoscopePrompt }] }],
      safetySettings,
    });

    const response = result.response;
    const text = response.text();

    // ส่งผลลัพธ์กลับเป็น JSON
    return NextResponse.json({ horoscope: text }, { status: 200 });

  } catch (error: any) {
    console.error('Error generating horoscope:', error);
    // ตรวจจับข้อผิดพลาดเฉพาะจาก Gemini API หากมี (เช่น API Key ไม่ถูกต้อง, โควต้าหมด)
    if (error.message.includes('API key not valid')) {
      return NextResponse.json(
        { error: 'API Key สำหรับ Gemini AI ไม่ถูกต้อง โปรดตรวจสอบ GOOGLE_AI_API_KEY ของคุณ' },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสร้างคำทำนาย: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}