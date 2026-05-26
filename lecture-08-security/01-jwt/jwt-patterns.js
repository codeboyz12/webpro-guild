// ============================================================
// LECTURE 08 — JSON WEB TOKENS (JWT)
// โครงสร้าง, การใช้งาน, ช่องโหว่, Best Practices
// ============================================================

// ---- โครงสร้าง JWT ----
// JWT มี 3 ส่วน คั่นด้วย "." : header.payload.signature
//
// ตัวอย่าง JWT จริง:
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9     ← Header  (Base64URL)
// .eyJzdWIiOiIxMjM0IiwibmFtZSI6IkpvaG4ifQ  ← Payload (Base64URL — ไม่ใช่ encrypted!)
// .SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c ← Signature

// CRITICAL: Payload เป็นแค่ Base64 ถอดรหัสได้ง่ายมาก
// ใครก็สามารถ decode ได้ด้วย atob() หรือ jwt.io
// ดังนั้น อย่าเก็บ password, เลขบัตรเครดิต หรือข้อมูลลับใน payload เด็ดขาด

const examplePayload = {
  sub: '1234567890',    // subject — มักเป็น userId
  name: 'George White',
  admin: true,
  iat: 1516239022,      // issued at — timestamp ที่ออก token
  exp: 1516242622,      // expiration — timestamp ที่หมดอายุ
};


// ============================================================
// การใช้งาน JWT ในชีวิตจริง (Node.js + jsonwebtoken library)
// ============================================================
const jwt = require('jsonwebtoken');

// Secret key ต้องยาว ซับซ้อน และเก็บใน environment variable เท่านั้น
const SECRET_KEY = process.env.JWT_SECRET;

// ---- Sign (สร้าง Token) ----
function createToken(userId, role) {
  return jwt.sign(
    { sub: userId, role },       // payload
    SECRET_KEY,                  // secret สำหรับ sign
    { expiresIn: '15m' }        // access token ควรอายุสั้น (15 นาที)
  );
}

// ---- Verify (ตรวจสอบ Token) ----
function verifyToken(token) {
  try {
    // jwt.verify จะตรวจทั้ง signature และ expiration พร้อมกัน
    const decoded = jwt.verify(token, SECRET_KEY);
    return decoded; // คืน payload ถ้า valid
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token หมดอายุแล้ว กรุณา login ใหม่');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Token ไม่ถูกต้อง');
    }
    throw error;
  }
}


// ============================================================
// ช่องโหว่ที่ต้องรู้ (ออกสอบแน่นอน)
// ============================================================

// 1. "none" Algorithm Attack
// ----------------------------------------
// Attacker แก้ header จาก { "alg": "HS256" } เป็น { "alg": "none" }
// แล้วลบ signature ออก → ถ้า server ไม่เช็ค algorithm จะยอมรับ token ปลอม

// BAD: เชื่อ algorithm จาก token header โดยตรง
function verifyTokenUnsafe(token) {
  return jwt.verify(token, SECRET_KEY); // library บางตัวอาจยอมรับ "none"
}

// GOOD: ระบุ algorithm ที่อนุญาตไว้ชัดเจน
function verifyTokenSafe(token) {
  return jwt.verify(token, SECRET_KEY, {
    algorithms: ['HS256'], // อนุญาตแค่ HS256 เท่านั้น none จะถูก reject
  });
}

// 2. JWT Revocation Problem (Stateless = ยกเลิกยาก)
// ----------------------------------------
// เมื่อ user logout หรือ admin ban user JWT ที่ออกไปแล้วยังใช้ได้จนกว่าจะหมดอายุ
// แก้ไขได้ 3 วิธี:

// วิธีที่ 1: Short TTL (ง่ายสุด แต่ UX แย่)
const shortLivedToken = jwt.sign({ sub: userId }, SECRET_KEY, { expiresIn: '5m' });

// วิธีที่ 2: Refresh Token Pattern (ที่นิยมมากที่สุด)
// Access Token: อายุสั้น (15m) เก็บใน memory
// Refresh Token: อายุยาว (7d) เก็บใน DB เพื่อ revoke ได้
async function refreshAccessToken(refreshToken) {
  const stored = await db.findRefreshToken(refreshToken); // เช็คว่ายังไม่ถูก revoke
  if (!stored) throw new Error('Refresh token ถูกยกเลิกแล้ว');

  const payload = jwt.verify(refreshToken, REFRESH_SECRET);
  return createToken(payload.sub, payload.role); // ออก access token ใหม่
}

// วิธีที่ 3: Deny List ใน Redis (เร็ว แต่เพิ่ม state กลับเข้าระบบ)
async function revokeToken(jti, expiresAt) {
  // jti (JWT ID) คือ unique identifier ของ token
  // เก็บไว้ใน Redis จนกว่า token จะหมดอายุเอง
  const ttl = expiresAt - Math.floor(Date.now() / 1000);
  await redis.setex(`revoked:${jti}`, ttl, 'true');
}

async function isTokenRevoked(jti) {
  return await redis.exists(`revoked:${jti}`);
}


// ============================================================
// Best Practices สรุป
// ============================================================
// 1. ใช้ RS256 (asymmetric) แทน HS256 (symmetric) ในระบบ distributed
//    เพราะ RS256 ใช้ public key verify ได้โดยไม่ต้อง share private key
// 2. เก็บ secret ใน environment variable เท่านั้น ไม่ commit ลง git
// 3. Access token อายุสั้น (15m) + Refresh token อายุยาวกว่า (7d)
// 4. ระบุ algorithm ที่อนุญาตเสมอ อย่าเชื่อ alg จาก header
