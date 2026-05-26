// ============================================================
// LECTURE 08 — VALIDATION & SANITIZATION
// ความแตกต่าง, กลยุทธ์, และ Golden Rules
// ============================================================

// ---- ความแตกต่างที่ต้องจำ ----
// VALIDATION  = "ข้อมูลถูกต้องไหม?" → ถ้าไม่ถูก ให้ REJECT
// SANITIZATION = "ข้อมูลปลอดภัยไหม?" → ทำความสะอาดหรือ ENCODE ก่อนใช้


// ============================================================
// 1. INPUT VALIDATION — ตรวจสอบรูปแบบและความถูกต้อง
// ============================================================

// Allow-listing (White-list) — อนุญาตเฉพาะที่รู้ว่าดี (แนะนำมากกว่า)
function validatePhoneNumber(phone) {
  // regex นี้อนุญาตแค่ตัวเลข 9–10 หลัก ที่ขึ้นต้นด้วย 0
  const allowedPattern = /^0[0-9]{8,9}$/;
  if (!allowedPattern.test(phone)) {
    throw new Error('เบอร์โทรศัพท์ไม่ถูกต้อง');
  }
  return phone;
}

// Block-listing (Black-list) — block สิ่งที่รู้ว่าแย่ (อ่อนแอกว่า)
// เพราะ attacker หาวิธีเลี่ยงรายการที่ block ได้เสมอ เช่น ใช้ encoding แปลกๆ
function validateUsernameUnsafe(username) {
  const blockedChars = ['<', '>', '"', "'", ';']; // attacker อาจใช้ %3C แทน < ได้
  if (blockedChars.some(char => username.includes(char))) {
    throw new Error('Username มีอักขระที่ไม่อนุญาต');
  }
  return username;
}

// ตัวอย่าง validation แบบ comprehensive
function validateUserInput(data) {
  const errors = [];

  // เช็ค email
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(data.email)) {
    errors.push('Email ไม่ถูกต้อง');
  }

  // เช็ค password ความแข็งแกร่ง
  if (data.password.length < 8) {
    errors.push('Password ต้องมีอย่างน้อย 8 ตัวอักษร');
  }

  // เช็ค age เป็นตัวเลขและอยู่ในช่วงที่สมเหตุสมผล
  const age = parseInt(data.age);
  if (isNaN(age) || age < 0 || age > 150) {
    errors.push('อายุไม่ถูกต้อง');
  }

  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }

  return true;
}


// ============================================================
// 2. INPUT SANITIZATION — ทำความสะอาดข้อมูลก่อนใช้
// ============================================================

// วิธีที่ 1: Stripping — ลบ HTML tags ออกทั้งหมด
function stripHtmlTags(input) {
  // ลบ tag ทุกอย่างออก เหลือแค่ text
  return input.replace(/<[^>]*>/g, '');
  // "Hello <script>alert('xss')</script> World" → "Hello  World"
}

// วิธีที่ 2: Escaping — แปลง special characters ให้ browser อ่านเป็น text
function escapeHtml(input) {
  const escapeMap = {
    '&': '&amp;',
    '<': '&lt;',   // < กลายเป็น &lt; browser จะแสดงเป็น < แต่ไม่รันเป็น tag
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
  };
  return input.replace(/[&<>"']/g, char => escapeMap[char]);
  // "<script>alert('xss')</script>" → "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;"
}

// วิธีที่ 3: Type Casting — บังคับชนิดข้อมูล
function sanitizeAge(input) {
  // parseInt ทำให้ "25; DROP TABLE users" กลายเป็นแค่ 25
  const age = parseInt(input, 10);
  if (isNaN(age)) throw new Error('อายุต้องเป็นตัวเลข');
  return age;
}

// วิธีที่ 4: ใช้ Library ที่ผ่านการทดสอบแล้ว (แนะนำมากที่สุด)
// อย่าเขียน sanitization เองสำหรับ HTML ซับซ้อน เพราะพลาดได้ง่ายมาก
//
// Frontend: DOMPurify — https://github.com/cure53/DOMPurify
// const clean = DOMPurify.sanitize(dirtyHtml);
//
// Backend:  sanitize-html — https://www.npmjs.com/package/sanitize-html
// const sanitizeHtml = require('sanitize-html');
// const clean = sanitizeHtml(dirtyHtml, { allowedTags: ['b', 'i', 'p'] });


// ============================================================
// 3. GOLDEN RULES — ใช้ทั้งสามอย่างร่วมกัน (Defense in Depth)
// ============================================================

// Rule 1: Validate ที่ SERVER เสมอ
// Client-side validation ใช้เพื่อ UX (feedback เร็ว) ไม่ใช่ security
// เพราะ user สามารถ disable JavaScript หรือส่ง request ตรงผ่าน Postman ได้

async function createComment(req, res) {
  const { userId, content } = req.body;

  // ถึงแม้ frontend validate แล้ว ต้อง validate ที่ server อีกครั้งเสมอ
  if (!content || content.length > 500) {
    return res.status(400).json({ error: 'ความคิดเห็นต้องมี 1–500 ตัวอักษร' });
  }

  // Rule 2: Sanitize ที่ input — ทำความสะอาดก่อนเก็บ
  const sanitizedContent = DOMPurify.sanitize(content);

  // Rule 3: Encode ที่ output — encode อีกครั้งเมื่อ render เป็น HTML
  // React ทำให้อัตโนมัติผ่าน JSX
  // แต่ถ้าใช้ innerHTML ต้อง escape เอง
  // element.innerHTML = escapeHtml(sanitizedContent); // ✓
  // element.innerHTML = sanitizedContent;             // ✗ อันตราย

  await db.saveComment(userId, sanitizedContent);
  res.json({ success: true });
}
