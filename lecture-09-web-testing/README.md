# Lecture 09 — Web Testing

บทนี้สอนให้คิดแบบ "adversarial mindset" ต่อโค้ดของตัวเอง ทุกฟีเจอร์ที่เขียนมาต้องตั้งคำถามว่า
"มันพังได้อย่างไร?" ก่อนที่ผู้ใช้จริงจะเป็นคนค้นพบ

---

## โครงสร้างโฟลเดอร์

```
lecture-09-web-testing/
├── app/
│   ├── server.js              ← Express server เสิร์ฟ static files
│   ├── playwright.config.js   ← ตั้งค่า Playwright test runner
│   ├── package.json
│   └── public/
│       ├── index.html         ← UI ของ Buggy Book Shop
│       ├── app.js             ← Logic ที่มี 11 bugs ซ่อนอยู่ (annotated)
│       └── styles.css
└── tests/
    └── example-bug-catching.spec.js  ← Playwright tests (annotated)
```

---

## แนวคิดหลักที่ต้องเข้าใจให้แน่น

### เป้าหมายของการทดสอบไม่ใช่การกำจัด bugs ทั้งหมด

ข้อเท็จจริงที่น่าตกใจคือ Windows 2000 ถูกปล่อยออกมาพร้อม bugs กว่า 63,000 รายการ เพราะซอฟต์แวร์จริงมีโค้ดหลายสิบล้านบรรทัด และโดยเฉลี่ยทุก ๆ 1,000 บรรทัดจะมี bugs ประมาณ 15–50 ตัว เป้าหมายที่แท้จริงจึงเป็นการ **ลดจำนวนและความถี่** ของ bugs ให้อยู่ในระดับที่ผู้ใช้ยังทำงานได้โดยไม่ติดขัด

### Testing Levels — ลำดับชั้นของการทดสอบ

ให้คิดว่า testing levels เหมือนกับการตรวจสอบชิ้นส่วนของรถก่อนส่งมอบลูกค้า เริ่มจากทดสอบชิ้นส่วนแต่ละอัน (Unit) → ทดสอบว่าชิ้นส่วนประกอบเข้ากันได้ (Integration) → ทดสอบวิ่งรถจริงทั้งคัน (System) → ให้ลูกค้าทดลองขับ (Acceptance)

| ระดับ | ใครรัน | เป้าหมาย | เครื่องมือใน Lab |
|---|---|---|---|
| **Unit** | Developer | ทดสอบ function เดี่ยว ๆ ทันทีที่เขียนเสร็จ | PyTest, JUnit |
| **Integration** | Developer / Tester | ตรวจว่าโค้ดใหม่ทำงานร่วมกับส่วนอื่นได้ | Postman, JMeter |
| **System** | Tester | End-to-end run-through ของทั้งระบบ | Selenium, **Playwright** |
| **Acceptance** | ลูกค้า / Business Analyst | ตรงตาม requirements ที่ตกลงกันไว้หรือเปล่า | UAT, Alpha, Beta |

จุดสำคัญที่มักเข้าใจผิดคือ **Regression Testing** ไม่ใช่ level แยก แต่เป็นขั้นตอนที่ทำหลัง Integration Testing เพื่อตรวจว่าการเพิ่มโค้ดใหม่ไม่ได้ทำให้ส่วนอื่นที่เคยทำงานได้ดีพังไป

### Testing Techniques — 3 วิธีมองโค้ด

**Black-Box Testing** คือการทดสอบโดยไม่สนใจว่าข้างในทำงานอย่างไร สนใจแค่ input/output ข้อดีคือทดสอบได้เหมือนผู้ใช้จริง แต่อาจพลาด edge cases ที่ซ่อนอยู่ใน logic

**White-Box Testing** คือการใช้ความรู้เรื่องโครงสร้างโค้ดมาออกแบบ test ข้อระวังสำคัญคืออย่าข้ามการทดสอบส่วนที่ "คิดว่า" ไม่มีปัญหา เพราะนั่นแหละที่ bugs มักซ่อนตัวอยู่

**Gray-Box Testing** คือการผสมทั้งสองแบบ รู้บางส่วนของ implementation แต่ยังใช้ black-box tests ควบคู่ด้วย ซึ่งเป็นแนวทางที่ใช้จริงมากที่สุดในงาน

### Release Testing — การทดสอบก่อนส่งมอบลูกค้า

Release Testing ต้องทำโดย **ทีมแยกต่างหาก** ที่ไม่ใช่ผู้พัฒนา มี 3 แนวทางหลักคือ Requirements-based testing (ทดสอบตามที่ระบุใน spec), Scenario testing (สร้าง user journey จริง ๆ แล้วทดสอบ), และ Stress/Performance testing (ทดสอบว่าระบบทนโหลดสูงได้แค่ไหน)

---

## Automated Testing ด้วย Playwright

### mental model หลัก

Playwright จำลองพฤติกรรมของคนนั่งอยู่หน้าจอ แต่ละ test คือ "script" ที่บอกว่าต้องทำอะไร แล้วตรวจว่าผลลัพธ์ถูกต้องหรือไม่ โดย Playwright จะ **auto-wait** ในทุก assertion คือรอให้ UI อัปเดตก่อน (สูงสุด 5 วินาที) โดยไม่ต้องเขียน `setTimeout` เอง

### โครงสร้างของ test ทุกตัว

```
beforeEach → [setup: goto + reset]
    ↓
test body → [actions: click, fill, selectOption]
    ↓
assertions → [expect(locator).matcher()]
```

### Locators — วิธีหา element บนหน้าจอ

ลำดับความสำคัญในการเลือก locator ควรเป็นดังนี้ โดยเลือกตัวที่อยู่บนสุดก่อนเสมอ เพราะมัน stable ที่สุดเมื่อ HTML เปลี่ยน

```
getByRole()    ← ดีที่สุด — หาตามความหมาย (semantic)
getByLabel()   ← ดีมาก — หา input ตาม label
getByText()    ← ดี — หาตามข้อความที่แสดง
locator()      ← ใช้เป็น fallback เท่านั้น — fragile ถ้า HTML เปลี่ยน
```

### Assertions — วิธีตรวจสอบผลลัพธ์

```
expect(locator).toBeVisible()        ← มองเห็นบนหน้าจอ
expect(locator).not.toBeVisible()    ← ซ่อนหรือไม่อยู่แล้ว
expect(locator).toHaveText("...")    ← มีข้อความนี้อยู่
expect(locator).not.toHaveText("...") ← ไม่มีข้อความนี้
```

---

## Bug Report — การรายงานข้อผิดพลาดอย่างมืออาชีพ

Bug report ที่ดีต้องประกอบด้วย Bug ID, Title ที่อธิบายปัญหาได้ชัดเจน, Severity (Blocker/Critical/Major/Minor/Trivial), Priority (P1–P5), Environment, Steps to Reproduce ที่ทำตามแล้วเกิดปัญหาได้ซ้ำ, Expected vs Actual Result และ Screenshot

---

## จุดที่มักออกสอบ

| หัวข้อ | สิ่งที่ต้องรู้ |
|---|---|
| Testing Goal | ไม่ใช่กำจัด bugs ทั้งหมด แต่ลดให้อยู่ในระดับที่รับได้ |
| Unit vs Integration | Unit = ชิ้นเดี่ยว, Integration = ทำงานร่วมกัน |
| Regression Testing | รันหลัง Integration เพื่อเช็คว่าของเก่าไม่พัง |
| Black / White / Gray Box | ต่างกันตรงที่รู้ internal implementation แค่ไหน |
| Release Testing | ทำโดยทีมแยก, 3 แบบ: Requirements / Scenario / Stress |
| beforeEach | Hook ที่รันก่อนทุก test เพื่อ reset state |
| getByRole vs locator | Role = semantic + stable, locator = CSS = fragile |
| auto-wait | Playwright รอ UI อัปเดตเองโดยไม่ต้อง setTimeout |
| Bug Report fields | ID, Title, Severity, Priority, Steps, Expected vs Actual |
