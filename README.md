# CSS234 Web Programming II — Exam Study Guide

คู่มือนี้รวบรวมโค้ดตัวอย่างและแนวคิดหลักจาก Lecture 06–08 สำหรับการสอบ Open Book

---

## โครงสร้าง Repo

```
css234-exam-guide/
├── lecture-06-concurrency/     ← JS Engine, Event Loop, Async/Await, Fetch API
├── lecture-07-web-workers/     ← Dedicated, Shared, Service Workers
└── lecture-08-security/        ← OWASP, JWT, Validation, Env Vars
```

---

## ภาพรวมทั้งสามบท

### Lecture 06 — JavaScript Concurrency & Network Foundations
บทนี้อธิบาย "ข้างใน" ของ JS ตั้งแต่ V8 Engine แปลงโค้ดอย่างไร ไปจนถึง Event Loop ทำงานอย่างไร
แนวคิดหลักที่ต้องเข้าใจให้แน่นคือ **Microtask Queue มี priority สูงกว่า Macrotask Queue เสมอ**
และการทำ Concurrent Fetch ด้วย `Promise.all()` ดีกว่า `await` ทีละบรรทัดอย่างไร

### Lecture 07 — Web Workers
บทนี้แก้ปัญหา Single-Threaded bottleneck ด้วย 3 ประเภท Worker
- **Dedicated Worker** → งานหนักใน background (1:1 กับ script)
- **Shared Worker** → Worker ตัวเดียวแชร์ข้ามหลาย tab
- **Service Worker** → Network proxy สำหรับ offline-first app (ต่างจากสองตัวแรกในระดับ concept)

### Lecture 08 — Security & Testing
บทนี้สอนให้คิดแบบ "adversarial mindset" ทุก input จากภายนอกต้องถือว่าอันตรายไว้ก่อน
แนวคิดหลัก: **Validate ที่ Server, Encode ที่ Output, Defense in Depth**

---

## จุดที่มักออกสอบ

| หัวข้อ | สิ่งที่ต้องรู้ |
|--------|--------------|
| Event Loop | ลำดับ output: Sync → Microtask → Macrotask |
| Promise.all vs await | Concurrent vs Sequential, เวลาต่างกันอย่างไร |
| Dedicated Worker | postMessage / onmessage, terminate vs close |
| Service Worker | Lifecycle ทั้ง 5 ขั้น, Cache First strategy |
| JWT | Header/Payload/Signature, "none" attack, stateless problem |
| SQL Injection | Parameterized queries คืออะไรและทำไมถึงต้องใช้ |
| Validation vs Sanitization | ต่างกันอย่างไร, ใช้เมื่อไหร่ |
| .env | ทำไมถึง never commit, .env.example คืออะไร |
