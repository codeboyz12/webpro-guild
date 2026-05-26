// ============================================================
// LECTURE 07 — DEDICATED WORKER: MAIN THREAD
// ตัวอย่าง: คำนวณ Fibonacci หนักๆ โดยไม่ block UI
// ============================================================
// สังเกต: worker ถูกสร้างครั้งเดียว และสื่อสารผ่าน message เท่านั้น
// Worker ไม่มีสิทธิ์จับ DOM เลย ทุกอย่างที่อยาก update UI ต้องส่ง message กลับมา

const worker = new Worker('worker.js');

// ---- ส่งข้อมูลไปให้ Worker ----
document.getElementById('btn').addEventListener('click', () => {
  const n = parseInt(document.getElementById('input').value);

  // postMessage ส่งข้อมูลไปหา worker
  // ข้อมูลจะถูก "copy" (Structured Clone Algorithm) ไม่ใช่ share reference
  // จึงปลอดภัย แต่ถ้าข้อมูลใหญ่มากอาจช้าได้
  worker.postMessage(n);

  console.log('ส่ง task ไปแล้ว UI ยังใช้งานได้ปกติ');
});

// ---- รับผลกลับจาก Worker ----
worker.onmessage = (event) => {
  // event.data คือข้อมูลที่ worker ส่งกลับมาด้วย postMessage()
  document.getElementById('result').textContent = event.data;
  console.log('ได้ผลลัพธ์จาก worker:', event.data);
};

// ---- จัดการ Error จาก Worker ----
worker.onerror = (error) => {
  // error object มี 3 property สำคัญตามสไลด์
  console.error('Worker error:', error.message);    // ข้อความ error
  console.error('ไฟล์:', error.filename);           // ไฟล์ที่เกิด error
  console.error('บรรทัด:', error.lineno);           // เลขบรรทัด
};

// ---- ยกเลิก Worker จาก Main Thread ----
document.getElementById('terminate').addEventListener('click', () => {
  // terminate() หยุด worker ทันทีแบบ hard stop
  // worker จะไม่มีโอกาส cleanup อะไร และจะ garbage collect ได้
  worker.terminate();
  console.log('Worker ถูก terminate แล้ว');
});
