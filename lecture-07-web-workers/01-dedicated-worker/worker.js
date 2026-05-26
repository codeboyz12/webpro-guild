// ============================================================
// LECTURE 07 — DEDICATED WORKER: WORKER THREAD
// ============================================================
// ไฟล์นี้รันบน Worker Thread แยกต่างหาก
// ไม่มี window, document, หรือ DOM ใดๆ
// ใช้ 'self' แทน 'window' ถ้าต้องการ global scope

// ---- รับ message จาก Main Thread ----
onmessage = (event) => {
  // event.data คือข้อมูลที่ main thread ส่งมาด้วย postMessage()
  const n = event.data;
  console.log('Worker ได้รับ n =', n);

  // คำนวณ Fibonacci แบบ recursive (ตั้งใจให้หนักเพื่อ demo)
  // ถ้ารันบน main thread ตัวนี้จะทำให้ UI ค้างสนิท
  const result = fibonacci(n);

  // ส่งผลกลับไปหา main thread
  // main thread จะรับได้ที่ worker.onmessage
  postMessage(result);
};

// ---- ฟังก์ชันคำนวณหนัก ----
function fibonacci(n) {
  if (n <= 1) return n;
  // O(2^n) — ช้ามากโดยเจตนา เพื่อแสดงว่า worker ช่วย unblock UI ได้จริง
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// ---- ยกเลิก Worker จากข้างใน ----
// self.close() คือการ terminate ตัวเองจากข้างใน worker
// ต่างจาก worker.terminate() ที่เรียกจาก main thread
function stopSelf() {
  self.close();
}

// ---- Error Handling ภายใน Worker ----
onerror = (error) => {
  console.error('เกิด error ภายใน worker:', error);
  // error นี้จะถูกส่งต่อไปหา main thread ผ่าน worker.onerror ด้วย
};
