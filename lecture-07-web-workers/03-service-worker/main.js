// ============================================================
// LECTURE 07 — SERVICE WORKER: REGISTRATION (main.js)
// ============================================================
// Service Worker แตกต่างจาก Dedicated/Shared Worker มาก
// มันไม่ได้มีไว้คำนวณ แต่เป็น "network proxy" ที่คั่นระหว่าง browser กับ network
// ต้องการ HTTPS เท่านั้น (หรือ localhost สำหรับ dev)

// ---- Phase 1: Registration ----
if ('serviceWorker' in navigator) {
  // Feature detection ก่อนเสมอ เพราะ browser เก่าบางตัวไม่รองรับ
  navigator.serviceWorker.register('/sw.js')
    .then((registration) => {
      // registration.scope บอกว่า SW นี้ควบคุม path อะไรบ้าง
      // ถ้า sw.js อยู่ที่ root (/sw.js) → scope คือ / ทั้งหมด
      console.log('SW ลงทะเบียนสำเร็จ! Scope:', registration.scope);

      // browser จะเช็คอัตโนมัติว่า sw.js มีการเปลี่ยนแปลงไหม (แม้แต่ 1 byte)
      // ถ้าเปลี่ยน จะเริ่ม lifecycle ใหม่ตั้งแต่ install
    })
    .catch((error) => {
      console.error('SW ลงทะเบียนล้มเหลว:', error);
    });
} else {
  console.log('Browser นี้ไม่รองรับ Service Workers');
}

// ---- ฟัง event จาก Service Worker ----
navigator.serviceWorker.addEventListener('controllerchange', () => {
  // ถูกเรียกเมื่อ SW ใหม่เข้าควบคุม (หลัง activate + clients.claim())
  // อาจ reload หน้าเพื่อให้ใช้ SW ใหม่ทันที
  console.log('SW ใหม่เข้าควบคุมแล้ว');
});
