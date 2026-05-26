// ============================================================
// LECTURE 07 — SHARED WORKER THREAD
// ============================================================
// Worker ตัวนี้มีอยู่ instance เดียว ไม่ว่าจะมีกี่ tabs เปิดมัน
// ทุก tab ที่ใช้ SharedWorker('shared-worker.js') จะ connect เข้ามาหา instance เดียวกัน
// ต่างกับ Dedicated Worker ที่แต่ละ tab สร้าง instance แยกกัน

// เก็บ array ของ port ทุกตัวที่ connect มา (= 1 port ต่อ 1 tab)
let connections = [];

// ---- onconnect จะถูกเรียกทุกครั้งที่มี tab ใหม่เปิด worker นี้ ----
onconnect = (connectEvent) => {
  // connectEvent.ports[0] คือ MessagePort ของ tab ที่เพิ่งเชื่อมต่อ
  const port = connectEvent.ports[0];
  port.start(); // เริ่มรับ message จาก port นี้

  // ---- รับ message จาก tab ที่เชื่อมต่ออยู่ ----
  port.onmessage = (messageEvent) => {
    const { type } = messageEvent.data;

    if (type === 'connect') {
      // tab ใหม่เปิด → เพิ่ม port เข้า connections
      connections.push(port);
      console.log(`Tab เชื่อมต่อ ตอนนี้มี ${connections.length} tabs`);

      // broadcast จำนวน tabs ให้ทุก tab รู้
      broadcast({ type: 'count', count: connections.length });
    }

    if (type === 'disconnect') {
      // tab กำลังปิด → ลบ port นี้ออกจาก array
      connections = connections.filter(p => p !== port);
      console.log(`Tab ตัดการเชื่อมต่อ ตอนนี้มี ${connections.length} tabs`);

      broadcast({ type: 'count', count: connections.length });
    }
  };
};

// ---- ส่ง message หาทุก tab พร้อมกัน ----
function broadcast(message) {
  // วนส่งหา port ทุกตัวใน connections array
  connections.forEach(port => {
    port.postMessage(message);
  });
}
