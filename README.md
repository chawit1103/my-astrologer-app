# My Astro App

แอปพลิเคชันหมอดูที่สร้างด้วย Next.js และ Tailwind CSS โดยใช้ Supabase สำหรับ Authentication และ PostgreSQL Database รวมถึง Gemini AI สำหรับการทำนายดวงชะตา

## คุณสมบัติหลัก

* ระบบ Login/Signup
* โปรไฟล์ผู้ใช้
* การจัดการ Subscription Package
* การทำนายดวงชะตาประจำวัน (ผ่าน Cron Job)
* หน้า Dashboard สำหรับขอคำทำนายส่วนบุคคล
* Responsive UI ด้วย Tailwind CSS

## การติดตั้งและรันโปรเจกต์

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/new](https://github.com/new)
    cd my-astro-app
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # หรือ
    yarn install
    ```
3.  **ตั้งค่า Environment Variables:**
    สร้างไฟล์ `.env.local` ที่ root ของโปรเจกต์และเพิ่มข้อมูลดังนี้ (แทนที่ด้วยค่าจริงของคุณ):
    ```
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    GOOGLE_AI_API_KEY=YOUR_GEMINI_API_KEY
    CRON_SECRET=YOUR_CRON_JOB_SECRET
    ```
4.  **รัน Development Server:**
    ```bash
    npm run dev
    # หรือ
    yarn dev
    ```
    เปิด [http://localhost:3000](http://localhost:3000) ในเบราว์เซอร์ของคุณ