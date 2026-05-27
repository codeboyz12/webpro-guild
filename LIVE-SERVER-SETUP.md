# การติดตั้ง Live Server สำหรับทดสอบ Web Workers

## ทำไมถึงต้องใช้ Live Server?

เมื่อเปิดไฟล์ HTML โดยตรงจาก File Explorer URL จะขึ้นต้นด้วย `file://` แทนที่จะเป็น `http://`
Browser มองว่า `file://` เป็น origin ที่ไม่ปลอดภัย จึงปฏิเสธการสร้าง Web Worker ทันที

ถ้าลองใช้ Worker โดยไม่มี server จะเห็น error นี้ใน Console:
```
Uncaught SecurityError: Failed to construct 'Worker':
Script at 'file:///...' cannot be accessed from origin 'null'.
```

Live Server แก้ปัญหานี้โดยเปิด server จำลองบนเครื่อง ทำให้ URL กลายเป็น `http://127.0.0.1:5500`
ซึ่งเป็น origin ที่ถูกต้อง Worker ทุกประเภทจึงทำงานได้ตามปกติ

> **หมายเหตุสำหรับ Service Worker:** ต้องการ HTTPS ในการใช้งานจริง แต่ `localhost` และ
> `127.0.0.1` ได้รับการยกเว้นพิเศษ จึงทำงานได้โดยไม่ต้องตั้งค่า SSL เพิ่มเติม

---

## วิธีที่ 1 — Live Server Extension (แนะนำ)

วิธีนี้ง่ายที่สุดและเหมาะที่สุดสำหรับการสอบ เพราะไม่ต้องเปิด Terminal หรือรันคำสั่งใดๆ
และ **ควรติดตั้งไว้ล่วงหน้าก่อนสอบ** เพราะในห้องสอบอาจไม่มี internet

### ขั้นตอนการติดตั้ง

เปิด VS Code แล้วกด `Ctrl+Shift+X` เพื่อเปิด Extensions panel จากนั้นพิมพ์ `Live Server`
ในช่องค้นหา เลือก extension ที่ชื่อ **Live Server** ของ **Ritwick Dey** (ตัวที่มียอดดาวน์โหลดมากที่สุด)
แล้วกด **Install**

### ขั้นตอนการใช้งาน

**วิธีที่เร็วที่สุด:** มองที่ Status Bar ด้านล่างขวาของ VS Code จะเห็นปุ่ม **"Go Live"**
กดปุ่มนี้ browser จะเปิดขึ้นมาอัตโนมัติที่ `http://127.0.0.1:5500`

**วิธีสำรอง:** คลิกขวาที่ไฟล์ `index.html` ใน Explorer panel แล้วเลือก **"Open with Live Server"**

### สิ่งที่ต้องตรวจสอบหลังเปิด

ดูที่ address bar ของ browser ต้องขึ้นต้นด้วย `http://127.0.0.1:5500/...` ไม่ใช่ `file:///...`
ถ้าเห็น `http://` แสดงว่าพร้อมใช้งานแล้ว

```
✓  http://127.0.0.1:5500/index.html   ← Worker ทำงานได้
✗  file:///C:/project/index.html      ← Worker จะ error
```

### ปิด Server

กดปุ่ม **"Port: 5500"** ที่ Status Bar ด้านล่างขวา หรือคลิกขวาที่ไฟล์ HTML แล้วเลือก
**"Stop Live Server"**

---

## วิธีที่ 2 — npx http-server (สำรองกรณีไม่มี Extension)

ถ้าไม่ได้ติดตั้ง Live Server Extension ไว้ล่วงหน้า และเครื่องมี **Node.js** ติดตั้งอยู่
สามารถใช้คำสั่งนี้แทนได้โดยไม่ต้องติดตั้งอะไรเพิ่ม

### ขั้นตอนการใช้งาน

เปิด Terminal ใน VS Code ด้วย `Ctrl+`` ` (backtick) จากนั้น `cd` เข้าไปยัง folder ที่มีไฟล์ HTML
แล้วรันคำสั่งนี้:

```bash
npx http-server . -p 8080
```

`npx` จะ download และรัน `http-server` ชั่วคราวโดยอัตโนมัติ ไม่ต้องติดตั้งก่อน
เมื่อ server พร้อมแล้วจะเห็น output ประมาณนี้:

```
Starting up http-server, serving .
Available on:
  http://127.0.0.1:8080
  http://192.168.1.x:8080
Hit CTRL-C to stop the server
```

จากนั้นเปิด browser แล้วไปที่ `http://127.0.0.1:8080` ด้วยตัวเอง (วิธีนี้ไม่เปิด browser ให้อัตโนมัติ
ต่างจาก Live Server Extension)

### ปิด Server

กด `Ctrl+C` ใน Terminal

> **ข้อควรระวัง:** `npx` ต้องการ internet ครั้งแรกที่รัน ถ้าสอบแบบ offline ให้ติดตั้งแบบ global ไว้ก่อน:
> ```bash
> npm install -g http-server
> ```
> แล้วใช้คำสั่ง `http-server . -p 8080` แทน (ไม่ต้องมี npx)

---

## โครงสร้างไฟล์ที่ถูกต้อง

ไม่ว่าจะใช้วิธีไหน ไฟล์ทุกตัวต้องอยู่ใน folder เดียวกันและ serve ผ่าน server เดียวกัน

```
my-worker-project/         ← เปิด Live Server / http-server ที่ folder นี้
├── index.html
├── main.js
├── worker.js              ← Dedicated Worker
├── shared-worker.js       ← Shared Worker
└── sw.js                  ← Service Worker (ต้องอยู่ที่ root เสมอ)
```

> **สำคัญสำหรับ Service Worker:** `sw.js` ต้องอยู่ที่ root ของ project เสมอ
> ถ้าวางไว้ใน subfolder เช่น `/js/sw.js` scope จะครอบคลุมแค่ `/js/` เท่านั้น
> และจะ **ไม่สามารถ intercept request ของ `/index.html` ได้**

---

## Checklist ก่อนเริ่มเขียนโค้ด Worker ในห้องสอบ

ทำตามลำดับนี้ทุกครั้งเพื่อให้แน่ใจว่าทุกอย่างพร้อม:

1. สร้าง folder ใหม่และวางไฟล์ทั้งหมดไว้ในนั้น
2. เปิด folder นั้นใน VS Code (`File → Open Folder`)
3. เปิด Live Server หรือรัน `http-server`
4. ตรวจสอบว่า URL ใน browser ขึ้นต้นด้วย `http://` ไม่ใช่ `file://`
5. เปิด DevTools (`F12`) และไปที่แท็บ **Console** ไว้ตลอด เพราะ Worker error จะแสดงที่นี่เท่านั้น
6. สำหรับ Service Worker ให้เปิดแท็บ **Application → Service Workers** เพื่อดู lifecycle state
