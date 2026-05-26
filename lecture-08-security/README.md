# Lecture 08 — Security & Testing

## แนวคิดหลัก: "Adversarial Mindset"

สมมติเสมอว่ามีคนพยายามทำลายระบบ และทุก input จากภายนอกคืออันตราย

---

## OWASP Top 10 ที่ต้องรู้ (สรุป)

| ช่องโหว่ | สาเหตุหลัก | วิธีป้องกัน |
|---------|-----------|------------|
| Broken Access Control | ไม่ตรวจสิทธิ์ที่ server | Deny by default |
| Injection (SQL/XSS) | ไว้วางใจ user input | Parameterized queries, Sanitization |
| Cryptographic Failures | ใช้ MD5/SHA1, ส่งผ่าน HTTP | HTTPS, bcrypt, AES-256 |
| Vulnerable Components | library ไม่ update | ตรวจ dependencies สม่ำเสมอ |
| Security Misconfiguration | ปล่อย default settings | Hardening, ปิด feature ที่ไม่ใช้ |

---

## Golden Rules (ต้องจำ 3 ข้อนี้)

1. **Validate ที่ Server** — Client-side validation แค่ UX ไม่ใช่ Security
2. **Encode ที่ Output** — Sanitize ตอน input แต่ Encode ตอน render HTML
3. **Defense in Depth** — ใช้ Validation + Sanitization + Parameterized Queries พร้อมกัน

---

## JWT ที่ต้องเข้าใจ

- Payload เป็นแค่ Base64 — **ใครก็อ่านได้** อย่าเก็บข้อมูลลับ
- "none" algorithm attack — อย่าเชื่อ alg จาก header โดยไม่ตรวจ
- JWT stateless → การ logout ต้องใช้ Deny List (Redis) หรือ short TTL

---

## ไฟล์ในโฟลเดอร์นี้

| ไฟล์ | เนื้อหา |
|------|---------|
| `01-jwt/jwt-patterns.js` | โครงสร้าง JWT, การใช้งาน, ช่องโหว่, best practices |
| `02-input-validation/validation-sanitization.js` | Validation vs Sanitization, Allow-list vs Block-list |
| `03-sql-injection/parameterized-queries.js` | SQL Injection demo + Parameterized Queries |
| `04-env-vars/.env.example` | Template สำหรับ environment variables |
| `04-env-vars/env-usage.js` | วิธีโหลดและใช้ .env ใน Node.js |
