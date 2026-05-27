# CSS234 Web Programming II — Exam Study Guide

คู่มือนี้รวบรวมโค้ดตัวอย่างและแนวคิดหลักจาก Lecture 06–09 สำหรับการสอบ Open Book

---

## โครงสร้าง Repo

```
css234-exam-guide/
├── lecture-06-concurrency/     ← JS Engine, Event Loop, Async/Await, Fetch API
├── lecture-07-web-workers/     ← Dedicated, Shared, Service Workers
├── lecture-08-security/        ← OWASP, JWT, Validation, Env Vars
└── lecture-09-web-testing/     ← Testing Levels, Playwright, Bug Report
```

---

## ภาพรวมทั้งสี่บท

### Lecture 06 — JavaScript Concurrency & Network Foundations

บทนี้อธิบาย "ข้างใน" ของ JS ตั้งแต่ V8 Engine แปลงโค้ดอย่างไร ไปจนถึง Event Loop ทำงานอย่างไร
แนวคิดหลักที่ต้องเข้าใจให้แน่นคือ **Microtask Queue มี priority สูงกว่า Macrotask Queue เสมอ** และการทำ Concurrent Fetch ด้วย `Promise.all()` ดีกว่า `await` ทีละบรรทัดอย่างไร

### Lecture 07 — Web Workers

บทนี้แก้ปัญหา Single-Threaded bottleneck ด้วย 3 ประเภท Worker

- **Dedicated Worker** → งานหนักใน background (1:1 กับ script)
- **Shared Worker** → Worker ตัวเดียวแชร์ข้ามหลาย tab
- **Service Worker** → Network proxy สำหรับ offline-first app (ต่างจากสองตัวแรกในระดับ concept)

### Lecture 08 — Security & Testing

บทนี้สอนให้คิดแบบ "adversarial mindset" ทุก input จากภายนอกต้องถือว่าอันตรายไว้ก่อน
แนวคิดหลัก: **Validate ที่ Server, Encode ที่ Output, Defense in Depth**

### Lecture 09 — Web Testing

บทนี้สอนให้คิดแบบ "adversarial mindset" ต่อโค้ดของตัวเอง โดยถามว่า "มันพังได้อย่างไร?" ก่อนที่ผู้ใช้จริงจะเป็นคนค้นพบ แนวคิดหลัก: **เป้าหมายของการทดสอบไม่ใช่กำจัด bugs ทั้งหมด แต่ลดให้อยู่ในระดับที่รับได้** และการเขียน automated tests ด้วย Playwright ช่วยจับ regression bugs ได้ก่อนที่โค้ดจะถึงมือผู้ใช้

ตัวอย่างใน Lab คือ **Buggy Book Shop** ซึ่งซ่อน bugs 11 ตัวไว้โดยเจตนา ตั้งแต่ email validation อ่อนเกินไป, sort ทำงานกลับหัว, ไปจนถึงปุ่ม Remove ที่ไม่ remove จริง เพื่อให้ฝึกเขียน test จับ bugs เหล่านั้นทีละตัว

---

## จุดที่มักออกสอบ

| หัวข้อ | สิ่งที่ต้องรู้ |
|---|---|
| Event Loop | ลำดับ output: Sync → Microtask → Macrotask |
| Promise.all vs await | Concurrent vs Sequential, เวลาต่างกันอย่างไร |
| Dedicated Worker | postMessage / onmessage, terminate vs close |
| Service Worker | Lifecycle ทั้ง 5 ขั้น, Cache First strategy |
| JWT | Header/Payload/Signature, "none" attack, stateless problem |
| SQL Injection | Parameterized queries คืออะไรและทำไมถึงต้องใช้ |
| Validation vs Sanitization | ต่างกันอย่างไร, ใช้เมื่อไหร่ |
| .env | ทำไมถึง never commit, .env.example คืออะไร |
| Testing Goal | ไม่ใช่กำจัด bugs ทั้งหมด แต่ลดให้อยู่ในระดับที่รับได้ |
| Unit vs Integration vs System | ทดสอบต่างระดับกัน ใครรัน เครื่องมืออะไร |
| Regression Testing | รันหลัง Integration เพื่อเช็คว่าของเก่าไม่พัง |
| Black / White / Gray Box | ต่างกันตรงที่รู้ internal implementation แค่ไหน |
| Release Testing | ทำโดยทีมแยก, 3 แบบ: Requirements / Scenario / Stress |
| Playwright: beforeEach | Hook รันก่อนทุก test เพื่อ isolate state |
| Playwright: getByRole vs locator | Role = semantic + stable, locator = CSS = fragile |
| Playwright: auto-wait | รอ UI อัปเดตเองโดยไม่ต้อง setTimeout |
| Bug Report fields | ID, Title, Severity, Priority, Steps, Expected vs Actual |
