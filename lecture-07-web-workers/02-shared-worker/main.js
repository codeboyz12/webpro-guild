// ============================================================
// LECTURE 07 — SHARED WORKER: MAIN THREAD (ทุก tab ใช้ไฟล์นี้)
// ตัวอย่าง: นับจำนวน tabs ที่เปิดอยู่และ broadcast ให้ทุก tab รู้
// ============================================================
// สังเกตความต่างจาก Dedicated Worker:
// 1. ใช้ SharedWorker() แทน Worker()
// 2. ต้องสื่อสารผ่าน .port ไม่ใช่ตรงๆ กับ worker
// 3. ต้องเรียก port.start() ก่อนเสมอ

const sharedWorker = new SharedWorker('shared-worker.js');

// ---- ต้อง start port ก่อนเสมอ ----
// ถ้าลืมเรียก start() จะไม่ได้รับ message ใดๆ เลย
sharedWorker.port.start();

// ---- แจ้ง worker ว่า tab นี้เพิ่งเปิด ----
sharedWorker.port.postMessage({ type: 'connect' });

// ---- รับ message จาก Worker ผ่าน port ----
sharedWorker.port.onmessage = (event) => {
  const { type, count } = event.data;

  if (type === 'count') {
    // อัปเดต UI แสดงจำนวน tabs ทั้งหมด
    document.getElementById('tabCount').textContent = count;
    console.log(`ขณะนี้มี ${count} tabs เปิดอยู่`);
  }
};

// ---- แจ้ง worker เมื่อ tab กำลังจะปิด ----
window.addEventListener('beforeunload', () => {
  // ส่ง message แจ้ง worker ก่อน tab ปิด
  // worker จะลบ port นี้ออกจาก connections array
  sharedWorker.port.postMessage({ type: 'disconnect' });
});
