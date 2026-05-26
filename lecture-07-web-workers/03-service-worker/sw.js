// ============================================================
// LECTURE 07 — SERVICE WORKER: FULL LIFECYCLE (sw.js)
// Cache First Strategy — เหมาะสำหรับ static assets
// ============================================================
// วางไฟล์นี้ที่ root ของ project (/sw.js)
// เพื่อให้ scope ครอบคลุมทุก path ใน app

const CACHE_NAME = 'my-app-v1';
// รายการไฟล์ที่จะ pre-cache ตอน install (App Shell)
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/offline.html',  // หน้าสำรองเมื่อ offline
];


// ============================================================
// Phase 2: INSTALL — pre-cache ไฟล์ static
// ============================================================
// ถูกเรียกครั้งเดียวเมื่อ SW ถูก register ครั้งแรก หรือมีการ update
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');

  // event.waitUntil() บอก browser ว่า "อย่าปิด install phase ก่อนที่ promise นี้จะ resolve"
  // ถ้าไม่ใช้ waitUntil browser อาจหยุด SW ก่อนที่ cache จะเสร็จ
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching App Shell');
      return cache.addAll(ASSETS_TO_CACHE); // download และ cache ทุกไฟล์ใน list
    })
  );

  // self.skipWaiting() บังคับให้ SW ใหม่ข้าม waiting phase
  // และเข้า activate ทันที (ใช้ด้วยความระวัง อาจทำให้ tab เก่ายังใช้ asset เก่า)
  self.skipWaiting();
});


// ============================================================
// Phase 3: WAITING (ไม่มีโค้ด — browser จัดการเอง)
// ============================================================
// SW ใหม่จะรอจนกว่า tabs ทั้งหมดที่ใช้ SW เก่าจะปิด
// เพื่อป้องกันไม่ให้ asset จาก v1 และ v2 ปนกัน


// ============================================================
// Phase 4: ACTIVATE — ลบ cache เก่าออก
// ============================================================
// ถูกเรียกเมื่อ SW เข้าควบคุมแทน SW เก่า
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          // หา cache ที่ไม่ใช่ version ปัจจุบัน
          .filter(name => name !== CACHE_NAME)
          // ลบทิ้งทั้งหมด เพื่อไม่ให้ disk เต็ม
          .map(name => {
            console.log('[SW] ลบ cache เก่า:', name);
            return caches.delete(name);
          })
      );
    })
  );

  // clients.claim() บังคับให้ SW ใหม่ควบคุมทุก tab ทันที
  // โดยไม่ต้องรอให้ user refresh
  self.clients.claim();
});


// ============================================================
// Phase 5: FETCH — ดัก network request ทุกตัว (Cache First Strategy)
// ============================================================
// ถูกเรียกทุกครั้งที่ page ส่ง request (fetch, img, CSS, JS ฯลฯ)
self.addEventListener('fetch', (event) => {

  // event.respondWith() "hijacks" request
  // แทนที่ browser จะไป network โดยตรง SW จะ intercept แล้วตอบเอง
  event.respondWith(

    // ขั้น 1: เช็คใน cache ก่อน
    caches.match(event.request).then((cachedResponse) => {

      // ถ้า cache มี → ตอบจาก cache ทันที (เร็วมาก ทำงานได้แม้ offline)
      if (cachedResponse) {
        console.log('[SW] ตอบจาก cache:', event.request.url);
        return cachedResponse;
      }

      // ถ้า cache ไม่มี → ไปดึงจาก network
      console.log('[SW] ไม่มีใน cache ไปดึงจาก network:', event.request.url);
      return fetch(event.request).then((networkResponse) => {

        // clone response ก่อนเสมอ เพราะ Response object อ่านได้ครั้งเดียวเท่านั้น
        // ถ้าไม่ clone แล้วเก็บ cache ก็จะเหลือแค่ response เปล่า
        const responseToCache = networkResponse.clone();

        // เก็บ response ลง cache ไว้สำหรับครั้งหน้า
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse; // ส่ง response จริงกลับให้ browser

      }).catch(() => {
        // Network ล้มเหลว และไม่มีใน cache → แสดงหน้า offline สำรอง
        return caches.match('/offline.html');
      });
    })
  );
});

// ============================================================
// NOTE: Network First Strategy (สำหรับ dynamic data เช่น API)
// ============================================================
// ใช้แทน Cache First เมื่อข้อมูลเปลี่ยนบ่อย เช่น API responses
//
// self.addEventListener('fetch', (event) => {
//   event.respondWith(
//     fetch(event.request)            // ลอง network ก่อน
//       .then((response) => {
//         const clone = response.clone();
//         caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
//         return response;
//       })
//       .catch(() => caches.match(event.request)) // ถ้า network ล้มเหลว ใช้ cache แทน
//   );
// });
