// ============================================================
// LECTURE 06 — PROMISE COMBINATORS
// Promise.all / Promise.race / Promise.allSettled
// ============================================================

// ---- Helper: จำลอง API call ที่ใช้เวลา ----
const fakeApi = (name, ms, shouldFail = false) =>
  new Promise((resolve, reject) =>
    setTimeout(() => {
      if (shouldFail) reject(new Error(`${name} failed`));
      else resolve(`${name} done`);
    }, ms)
  );


// ============================================================
// 1. Promise.all — รอทุกตัว resolve ถ้าตัวใดตัวหนึ่ง reject จะ reject ทั้งหมด
// ============================================================
// ใช้เมื่อ: ต้องการผลของทุก Promise และถ้าตัวไหนพังก็ถือว่าพังหมด
// ตัวอย่าง: โหลด user + posts พร้อมกัน ถ้า API ใดล้มเหลว แสดง error

async function demoPromiseAll() {
  try {
    // ทั้งสองเริ่มพร้อมกัน ใช้เวลารวม = ตัวที่ช้าสุด (2s) ไม่ใช่ 1+2=3s
    const [user, posts] = await Promise.all([
      fakeApi('user', 1000),   // เสร็จใน 1 วินาที
      fakeApi('posts', 2000),  // เสร็จใน 2 วินาที
    ]);
    console.log(user, posts);  // "user done" "posts done"
  } catch (err) {
    // ถ้า fakeApi ตัวใดตัวหนึ่ง reject จะเข้า catch นี้ทันที
    console.error('ล้มเหลว:', err.message);
  }
}

// ---- เปรียบเทียบ Sequential vs Concurrent ----
async function sequential() {
  const user  = await fakeApi('user', 2000);   // รอ 2s ก่อน
  const posts = await fakeApi('posts', 2000);  // แล้วค่อยรออีก 2s
  // รวม: 4s ← ช้าโดยไม่จำเป็น
}

async function concurrent() {
  const [user, posts] = await Promise.all([
    fakeApi('user', 2000),   // เริ่มพร้อมกัน
    fakeApi('posts', 2000),  // เริ่มพร้อมกัน
  ]);
  // รวม: 2s ← เร็วกว่า 2 เท่า
}


// ============================================================
// 2. Promise.race — resolve/reject ตามตัวแรกที่ settle
// ============================================================
// ใช้เมื่อ: ต้องการ timeout หรือ fallback กรณีรอนานเกินไป

async function demoPromiseRace() {
  const TIMEOUT_MS = 3000;

  const result = await Promise.race([
    fakeApi('mainApi', 2000),                // ตัวจริง ใช้เวลา 2s
    fakeApi('timeout', TIMEOUT_MS, true),    // timeout 3s → reject ถ้าช้าเกิน
  ]);
  // ถ้า mainApi เสร็จก่อน timeout → result = "mainApi done"
  // ถ้า timeout ถึงก่อน → throw error
  console.log(result);
}


// ============================================================
// 3. Promise.allSettled — รอทุกตัวจบ ไม่ว่าจะ resolve หรือ reject
// ============================================================
// ใช้เมื่อ: ต้องการรู้ผลของทุกตัว แม้บางตัวจะล้มเหลว
// ตัวอย่าง: ส่ง notification หลาย channel พร้อมกัน อยากรู้ว่าตัวไหนสำเร็จบ้าง

async function demoPromiseAllSettled() {
  const results = await Promise.allSettled([
    fakeApi('email', 1000),          // สำเร็จ
    fakeApi('sms', 500, true),       // ล้มเหลว
    fakeApi('push', 1500),           // สำเร็จ
  ]);

  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      console.log('✓ สำเร็จ:', result.value);    // "email done", "push done"
    } else {
      console.log('✗ ล้มเหลว:', result.reason.message); // "sms failed"
    }
  });
  // ต่างจาก Promise.all ตรงที่ไม่ abort กลางคัน รอให้ครบทุกตัวก่อนเสมอ
}
