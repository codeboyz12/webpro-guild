// ============================================================
// LECTURE 06 — ASYNC/AWAIT PATTERNS
// Error Handling + Real-World Patterns
// ============================================================

// ============================================================
// 1. try...catch กับ async function (pattern พื้นฐาน)
// ============================================================
// ทำไมต้องใช้ try...catch? เพราะ await ที่ reject จะ throw error
// ถ้าไม่จับ error โปรแกรมจะหยุดทำงาน (Unhandled Promise Rejection)

async function loadData() {
  try {
    const data = await fetchData();  // ถ้า reject จะ throw ลง catch ทันที
    renderUI(data);
  } catch (error) {
    // จัดการ error อย่างสวยงาม แทนที่จะปล่อยให้ app crash
    showFallbackUI();
    console.error('โหลดข้อมูลไม่สำเร็จ:', error.message);
  } finally {
    // finally รันเสมอ ไม่ว่าจะ success หรือ error
    // เหมาะสำหรับซ่อน loading spinner
    hideLoadingSpinner();
  }
}


// ============================================================
// 2. Error Handling แบบละเอียด — แยกประเภท error
// ============================================================
async function fetchUserProfile(userId) {
  try {
    const response = await fetch(`/api/users/${userId}`);

    // fetch() ไม่ throw error แม้ server ตอบ 404 หรือ 500
    // ต้องเช็ค response.ok เอง
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const user = await response.json();
    return user;

  } catch (error) {
    if (error.name === 'TypeError') {
      // TypeError มักเกิดจาก network ไม่มี internet
      console.error('ไม่มีการเชื่อมต่อ network');
    } else {
      // HTTP error หรือ error อื่นๆ
      console.error('เกิดข้อผิดพลาด:', error.message);
    }
    return null; // คืน null เพื่อให้ caller จัดการต่อได้
  }
}


// ============================================================
// 3. Concurrent vs Sequential — pattern ที่ออกสอบบ่อย
// ============================================================

// BAD: Sequential — รอทีละตัว รวม ~4s (ถ้าแต่ละ request ใช้เวลา 2s)
async function loadPageDataSlow() {
  const user    = await fetch('/api/user');    // รอ 2s
  const posts   = await fetch('/api/posts');   // รอ 2s อีก
  const friends = await fetch('/api/friends'); // รอ 2s อีก
  // รวม: ~6s ← ช้ามากโดยไม่จำเป็น เพราะ 3 request นี้ไม่ได้ depend กัน
}

// GOOD: Concurrent — รันพร้อมกัน รวมแค่ ~2s (เท่ากับตัวที่ช้าสุด)
async function loadPageDataFast() {
  const [user, posts, friends] = await Promise.all([
    fetch('/api/user'),     // เริ่มพร้อมกันทันที
    fetch('/api/posts'),    // เริ่มพร้อมกันทันที
    fetch('/api/friends'),  // เริ่มพร้อมกันทันที
  ]);
  // รวม: ~2s ← ดีกว่า 3 เท่า
}

// NOTE: ใช้ Sequential ก็ต่อเมื่อ request ที่สองต้องใช้ข้อมูลจาก request แรก
// เช่น: ต้องได้ userId จาก /api/user ก่อน ถึงจะ fetch /api/posts?userId=...
async function loadDependentData() {
  const user  = await fetch('/api/user').then(r => r.json()); // ต้องรอก่อน
  const posts = await fetch(`/api/posts?userId=${user.id}`);  // ใช้ user.id
}


// ============================================================
// 4. Async IIFE — รัน async code ใน top-level
// ============================================================
// ใช้เมื่อต้องการ await ใน scope ที่ไม่ใช่ async function
(async () => {
  const data = await loadData();
  console.log('ข้อมูล:', data);
})();
