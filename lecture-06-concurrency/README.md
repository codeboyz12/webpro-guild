# Lecture 06 — JavaScript Concurrency & Network Foundations

## แนวคิดหลักที่ต้องเข้าใจ

JavaScript เป็น Single-Threaded language แต่ browser ช่วยด้วย Web APIs ทำให้ดูเหมือนทำหลายอย่างพร้อมกันได้
กุญแจสำคัญคือการเข้าใจว่า Event Loop จัดการ Queue ต่างๆ อย่างไร

---

## V8 Engine Pipeline (ออกสอบแน่นอน)

```
Source Code → Parser → AST → Ignition (Bytecode) → TurboFan (Machine Code)
```

- **Ignition**: แปลง AST เป็น Bytecode รันได้ทันที แต่ยังไม่ optimize
- **TurboFan**: จับ "Hot Code" (โค้ดที่ถูกเรียกบ่อย) มา compile เป็น Machine Code ที่เร็วกว่ามาก
- **De-optimization**: ถ้า TurboFan เดาชนิดตัวแปรผิด (เช่น ตัวแปรเปลี่ยนจาก number เป็น string) จะ "ทิ้ง" optimized code แล้วกลับไปใช้ Ignition — นี่คือเหตุผลที่การเขียน consistent types ทำให้ code เร็วกว่า

---

## The Golden Rule of Event Loop (ข้อนี้ออกสอบมาก)

**Microtask Queue จะถูก drain ให้หมดก่อน จึงจะหยิบ Macrotask มาทำ 1 งาน แล้ววนซ้ำ**

| Queue | สิ่งที่เข้า Queue นี้ |
|-------|----------------------|
| Microtask | `Promise.then/catch`, `async/await`, `queueMicrotask()` |
| Macrotask | `setTimeout`, `setInterval`, UI rendering, I/O |

---

## ไฟล์ในโฟลเดอร์นี้

| ไฟล์ | เนื้อหา |
|------|---------|
| `01-event-loop/event-loop-demo.js` | Checkpoint คลาสสิก + อธิบาย step-by-step |
| `02-promises/promise-combinators.js` | all, race, allSettled พร้อมตัวอย่างใช้งานจริง |
| `03-async-await/async-patterns.js` | Error handling, concurrent pattern |
| `04-fetch-api/fetch-patterns.js` | AbortController, CORS, POST request |
