# Lecture 07 — Web Workers

## ทำไมถึงต้องมี Web Workers?

JavaScript เป็น Single-Threaded ถ้าโค้ดคำนวณหนักบน main thread → UI ค้าง
Web Workers แก้ปัญหานี้โดยโยนงานหนักออกไปรันบน background thread แยกต่างหาก

---

## เปรียบเทียบ 3 ประเภท (ออกสอบแน่นอน)

| | Dedicated | Shared | Service |
|--|-----------|--------|---------|
| ความสัมพันธ์ | 1:1 กับ script | 1:หลาย scripts | Network proxy |
| จุดประสงค์ | คำนวณหนัก | แชร์ state ข้าม tabs | Offline / Cache |
| สื่อสารผ่าน | postMessage | MessagePort | fetch event |
| ต้องการ HTTPS | ไม่ | ไม่ | ✓ |
| มี Lifecycle | ไม่ | ไม่ | ✓ (ซับซ้อนมาก) |

---

## Service Worker Lifecycle (ต้องจำให้ได้)

```
No SW → Registration → Installation → [Waiting] → Activation → Idle ↔ Fetch
                                          ↓
                                        Error
```

- **install**: pre-cache ไฟล์ static, ใช้ `event.waitUntil()`
- **waiting**: SW ใหม่รอ SW เก่าออกจาก tabs ทั้งหมด (ป้องกัน V1+V2 ปนกัน)
- **activate**: ลบ cache เก่า, ใช้ `clients.claim()` เพื่อควบคุมทันที
- **fetch**: ดัก request ทุกตัว, เลือกตอบจาก cache หรือ network

---

## ไฟล์ในโฟลเดอร์นี้

| ไฟล์ | เนื้อหา |
|------|---------|
| `01-dedicated-worker/` | main.js + worker.js พร้อม terminate/error handling |
| `02-shared-worker/` | main.js + shared-worker.js นับ active tabs |
| `03-service-worker/` | register + sw.js ครบทุก lifecycle + Cache First strategy |
