// ============================================================
// LECTURE 08 — ENVIRONMENT VARIABLES ใน Node.js
// ============================================================
// Environment Variables คือ key-value pairs ที่เก็บนอก source code
// จุดประสงค์หลัก 3 อย่างตามสไลด์:
// 1. Security   — API keys ไม่ติดไปกับ code
// 2. Portability — code รันได้ทุก environment เปลี่ยนแค่ config
// 3. Flexibility — toggle features โดยไม่ต้อง rebuild

// ============================================================
// วิธีที่ 1: dotenv library (วิธีมาตรฐาน)
// ============================================================
// ติดตั้ง: npm install dotenv
// ต้องเรียก require('dotenv').config() ที่ต้นไฟล์ entry point เสมอ
// เช่น ใน index.js หรือ app.js ก่อนบรรทัดอื่นทั้งหมด

require('dotenv').config(); // โหลดค่าจาก .env เข้าสู่ process.env

// หลังจากนี้เข้าถึงได้ผ่าน process.env
const port       = process.env.PORT || 3000;         // fallback ถ้าไม่มีค่าใน .env
const dbUrl      = process.env.DATABASE_URL;
const jwtSecret  = process.env.JWT_SECRET;

// ---- ตรวจสอบว่า required variables มีครบก่อน start server ----
// ถ้าไม่มี secret สำคัญ ควร crash ทันทีแทนที่จะรันแบบไม่ปลอดภัย
function validateEnvVars() {
  const required = ['DATABASE_URL', 'JWT_SECRET', 'JWT_EXPIRES_IN'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    // crash แบบ explicit ดีกว่า run แบบ silent แล้วเกิด bug ลึกๆ
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

validateEnvVars(); // เรียกก่อน start server


// ============================================================
// วิธีที่ 2: Config module — รวม env vars ไว้ที่เดียว
// ============================================================
// Pattern นี้ดีกว่าการ scatter process.env ทั่ว codebase
// เพราะถ้าเปลี่ยนชื่อ variable แก้ที่ไฟล์นี้ที่เดียวพอ

const config = {
  server: {
    port: parseInt(process.env.PORT, 10) || 3000,
    env:  process.env.NODE_ENV || 'development',
  },
  db: {
    url:      process.env.DATABASE_URL,
    host:     process.env.DB_HOST,
    port:     parseInt(process.env.DB_PORT, 10) || 5432,
    name:     process.env.DB_NAME,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  jwt: {
    secret:     process.env.JWT_SECRET,
    expiresIn:  process.env.JWT_EXPIRES_IN || '15m',
  },
};

module.exports = config;

// ใช้งานในไฟล์อื่น:
// const config = require('./config');
// jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });


// ============================================================
// .gitignore — ต้องมีเสมอ
// ============================================================
// สร้างไฟล์ .gitignore ที่ root แล้วใส่:
//
// .env
// .env.local
// .env.production
// node_modules/
//
// NEVER commit .env จริง เพราะ:
// 1. GitHub scan bots คอย monitor repo สาธารณะหา credentials
// 2. ถ้าหลุดออกไปแล้ว ต้อง revoke และออก key ใหม่ทุกตัว
// 3. Git history เก็บ commit เก่าไว้เสมอ แม้จะ delete ไฟล์แล้วก็ตาม

// ============================================================
// NOTE: สำหรับ Production
// ============================================================
// ใน production ไม่ควรใช้ .env file
// ให้ใช้ secrets management service แทน เช่น:
// - AWS Secrets Manager
// - HashiCorp Vault
// - Kubernetes Secrets
// - Railway / Render / Vercel environment settings
