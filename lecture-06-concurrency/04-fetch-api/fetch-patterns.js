// ============================================================
// LECTURE 06 — FETCH API PATTERNS
// GET, POST, AbortController, CORS
// ============================================================

// ============================================================
// 1. Basic GET Request
// ============================================================
async function getUser(id) {
  const response = await fetch(`/api/users/${id}`);

  // fetch ไม่ throw เมื่อ server ตอบ 4xx หรือ 5xx
  // response.ok จะเป็น true เมื่อ status อยู่ใน 200–299 เท่านั้น
  if (!response.ok) {
    throw new Error(`Server ตอบ ${response.status}: ${response.statusText}`);
  }

  return response.json(); // แปลง JSON body → JS object
}


// ============================================================
// 2. POST Request — ส่งข้อมูลขึ้น server
// ============================================================
async function createUser(userData) {
  const response = await fetch('/api/users', {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',  // บอก server ว่าส่ง JSON มา
      'Authorization': `Bearer ${getToken()}`, // ส่ง JWT token
    },

    // ต้อง JSON.stringify เสมอ เพราะ body รับได้แค่ string/FormData/Blob
    body: JSON.stringify(userData),
  });

  if (!response.ok) throw new Error('สร้าง user ไม่สำเร็จ');
  return response.json();
}


// ============================================================
// 3. AbortController — ยกเลิก request กลางคัน
// ============================================================
// Use Case สำคัญ: search box ที่ user พิมพ์เร็ว
// ถ้าไม่ cancel request เก่า อาจได้ผลลัพธ์ผิดลำดับ
// เช่น พิมพ์ "ap" แล้วพิมพ์ "apple" แต่ผล "ap" มาทีหลัง

let currentController = null; // เก็บ controller ปัจจุบันไว้

async function search(query) {
  // ถ้ายังมี request เก่าค้างอยู่ ให้ยกเลิกก่อน
  if (currentController) {
    currentController.abort();
    console.log('ยกเลิก request เก่าแล้ว');
  }

  // สร้าง controller ใหม่สำหรับ request นี้
  currentController = new AbortController();

  try {
    const response = await fetch(`/api/search?q=${query}`, {
      signal: currentController.signal, // เชื่อม signal เข้ากับ fetch
    });
    const results = await response.json();
    displayResults(results);

  } catch (error) {
    if (error.name === 'AbortError') {
      // AbortError ไม่ใช่ error จริง แค่บอกว่า request ถูกยกเลิก
      console.log('Request ถูกยกเลิกตามที่ตั้งใจ');
    } else {
      console.error('เกิดข้อผิดพลาด:', error);
    }
  }
}

// เรียกใช้ใน event listener
document.getElementById('searchInput').addEventListener('input', (e) => {
  search(e.target.value);
});


// ============================================================
// 4. CORS — Cross-Origin Resource Sharing
// ============================================================
// CORS เป็น security mechanism ของ browser
// Browser จะ block request ข้าม origin โดยอัตโนมัติ
// ยกเว้น server จะส่ง header มาบอกว่าอนุญาต

// ตัวอย่าง: app อยู่ที่ https://myapp.com แต่ fetch ไป https://api.other.com
// Browser จะส่ง OPTIONS request ก่อน (Preflight) เพื่อถามว่าอนุญาตไหม
// ถ้า server ตอบว่าอนุญาต (Access-Control-Allow-Origin header) จึงจะส่ง request จริง

// ตัวอย่าง request ที่ระบุ CORS mode ชัดเจน
async function fetchFromExternalApi() {
  const response = await fetch('https://api.external.com/data', {
    mode: 'cors',        // default คือ cors อยู่แล้ว แต่เขียนชัดเพื่อความชัดเจน
    credentials: 'include', // ส่ง cookie ไปด้วย (ต้องการ server อนุญาต explicitly)
  });
  return response.json();
}
