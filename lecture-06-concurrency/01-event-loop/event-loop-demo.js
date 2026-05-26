// ============================================================
// LECTURE 06 — EVENT LOOP & TASK QUEUES
// Checkpoint คลาสสิกที่ออกสอบบ่อยมาก
// ============================================================

// ---- โจทย์จากสไลด์ ----
// ถามว่า output คืออะไร?

console.log('A');                              // (1) Synchronous — รันทันทีบน Call Stack
setTimeout(() => console.log('B'), 0);        // (2) ส่งไป Web API → Macrotask Queue
Promise.resolve().then(() => console.log('C')); // (3) Microtask Queue
console.log('D');                              // (4) Synchronous — รันทันทีบน Call Stack

// ---- คำตอบ: A → D → C → B ----
//
// Step-by-step อธิบาย:
// 1. console.log('A')      → อยู่บน Call Stack โดยตรง พิมพ์ A ทันที
// 2. setTimeout(...)       → ส่งไปให้ Web API จัดการ callback เข้า Macrotask Queue
// 3. Promise.resolve()     → resolved แล้ว .then() callback เข้า Microtask Queue ทันที
// 4. console.log('D')      → อยู่บน Call Stack โดยตรง พิมพ์ D ทันที
//
// ตอนนี้ Call Stack ว่าง → Event Loop เข้ามาทำงาน
// 5. Event Loop drain Microtask Queue ให้หมดก่อน → พิมพ์ C
// 6. Microtask Queue ว่างแล้ว → หยิบ Macrotask 1 งาน → พิมพ์ B
//
// GOLDEN RULE: Microtask (Promise) มี priority สูงกว่า Macrotask (setTimeout) เสมอ
//              แม้ setTimeout delay = 0ms ก็ยังรอ Microtask ก่อน


// ============================================================
// ตัวอย่างที่ซับซ้อนขึ้น — สำหรับฝึกความเข้าใจ
// ============================================================

console.log('--- ตัวอย่างที่ 2 ---');

setTimeout(() => {
  console.log('Macrotask 1');

  // Promise ที่อยู่ใน Macrotask จะเข้า Microtask Queue
  // และจะรันก่อน Macrotask ถัดไปเสมอ
  Promise.resolve().then(() => console.log('Microtask inside Macrotask'));
}, 0);

setTimeout(() => {
  console.log('Macrotask 2');
}, 0);

Promise.resolve().then(() => console.log('Microtask 1'));
Promise.resolve().then(() => console.log('Microtask 2'));

// Output:
// Microtask 1
// Microtask 2
// Macrotask 1
// Microtask inside Macrotask   ← drain microtask ก่อนทุกครั้งที่ macrotask จบ
// Macrotask 2
