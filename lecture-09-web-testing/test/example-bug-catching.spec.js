// ============================================================
// example-bug-catching.spec.js — Playwright Test Suite (Annotated)
// ============================================================
// ไฟล์นี้รวบรวม automated tests ที่เขียนด้วย Playwright
// แต่ละ test ออกแบบมาเพื่อ "จับ" bug ที่ซ่อนอยู่ใน app.js
//
// วิธีรัน:
//   npm test              ← headless (ไม่เห็น browser)
//   npm run test:headed   ← เห็น browser เปิดจริง ๆ (ดีสำหรับ debug)
//   npm run test:ui       ← เปิด Playwright UI mode (แนะนำ)
//
// EXPECTED RESULT:
//   ทุก test ควร FAIL ตอนรันครั้งแรก เพราะ bugs ยังอยู่ครบ
//   หลังแก้ bug ใน app.js แล้ว test ที่ตรงกันควรเปลี่ยนเป็น PASS
// ============================================================

// import ฟังก์ชัน test และ expect จาก Playwright
// test  = ฟังก์ชันสำหรับนิยาม test case แต่ละตัว
// expect = ฟังก์ชันสำหรับทำ assertion (ตรวจสอบว่าผลลัพธ์ถูกต้อง)
const { test, expect } = require("@playwright/test");

// ──────────────────────────────────────────────
// SETUP — beforeEach hook
// ──────────────────────────────────────────────
// beforeEach รันโค้ดข้างในก่อน "ทุก" test โดยอัตโนมัติ
// เปรียบเหมือนการเตรียมโต๊ะทดลองให้สะอาดก่อนทุก experiment
//
// ทำไมต้อง reset ทุกครั้ง?
//   ถ้า test A เพิ่มหนังสือลง cart แล้วไม่ reset
//   test B จะเริ่มต้นด้วย cart ที่มีของอยู่แล้ว → ผลลัพธ์ของ test B ผิดพลาด
//   การ isolate state แต่ละ test ออกจากกันทำให้ test reliable มากขึ้น
test.beforeEach(async ({ page }) => {
  // ไปหน้าแรกของแอป (baseURL มาจาก playwright.config.js คือ http://localhost:3000)
  await page.goto("/");
  // กดปุ่ม Reset เพื่อล้าง cart และ form ให้สะอาด
  await page.getByRole("button", { name: "Reset cart" }).click();
});

// ──────────────────────────────────────────────
// TEST 1 — จับ BUG 3 (Case-Sensitive Search)
// ──────────────────────────────────────────────
// หลักการ: ผู้ใช้ไม่ควรต้องสนใจว่าพิมพ์ตัวใหญ่หรือตัวเล็ก
// search bar ควรหาเจอไม่ว่าจะพิมพ์ "testing", "TESTING", หรือ "Testing"
test("search should be case-insensitive", async ({ page }) => {
  // พิมพ์คำค้นหาด้วยตัวเล็กทั้งหมด
  // getByLabel หา <input> ที่อยู่ใน <label>Search books</label>
  await page.getByLabel("Search books").fill("testing");

  // ตรวจว่าหนังสือทั้งสองเล่มที่มี "Testing" ในชื่อแสดงขึ้นมา
  // toBeVisible() จะรอสูงสุด 5 วินาทีให้ element ปรากฏ (auto-wait)
  await expect(page.getByText("Practical Web Testing")).toBeVisible();
  await expect(page.getByText("Automation Patterns with Playwright")).toBeVisible();
  // TEST จะ FAIL เพราะ app.js ใช้ .includes() ซึ่ง case-sensitive
  // "Practical Web Testing".includes("testing") → false  ← bug ตรงนี้
});

// ──────────────────────────────────────────────
// TEST 2 — จับ BUG 4 (Low-High Sorting กลับหัว)
// ──────────────────────────────────────────────
// หลักการ: เลือก "Low to High" แล้วหนังสือราคาถูกสุดควรอยู่บนสุด
// หนังสือราคาถูกสุดคือ "UX Basics for Developers" ที่ $19.99
test("low-to-high sorting should show the cheapest book first", async ({ page }) => {
  // selectOption เลือก option ใน <select> ตาม value attribute
  // ดู index.html: <option value="low-high">Low to high</option>
  await page.getByLabel("Sort by price").selectOption("low-high");

  // .locator(".book-title") หา elements ทุกตัวที่มี class "book-title"
  // .first() เอาตัวแรกสุด (บนสุดของรายการ)
  // toHaveText ตรวจว่าข้อความข้างในตรงกับที่คาดไว้
  await expect(page.locator(".book-title").first()).toHaveText("UX Basics for Developers");
  // TEST จะ FAIL เพราะโค้ดเรียงจากมากไปน้อย ทำให้ $34.99 ขึ้นก่อน
});

// ──────────────────────────────────────────────
// TEST 3 — จับ BUG 6 (Empty State ไม่แสดง)
// ──────────────────────────────────────────────
// หลักการ: ถ้าค้นหาแล้วไม่เจอผลลัพธ์ ต้องแจ้งให้ผู้ใช้รู้
// ไม่ใช่แสดง catalog ว่างเปล่าโดยไม่บอกอะไร
test("empty state should be visible when search has no results", async ({ page }) => {
  // ค้นหาคำที่ไม่มีในฐานข้อมูลแน่นอน
  await page.getByLabel("Search books").fill("non-existing-book");

  // ตรวจว่าข้อความ "No books found." ปรากฏขึ้น
  await expect(page.getByText("No books found.")).toBeVisible();
  // TEST จะ FAIL เพราะโค้ดตั้ง emptyCatalog.hidden = true เสมอ
});

// ──────────────────────────────────────────────
// TEST 4 — จับ BUG 9 (Cart Count ผิด)
// ──────────────────────────────────────────────
// หลักการ: กดเพิ่มหนังสือเล่มเดิม 2 ครั้ง
// cart count ควรแสดง "2 items" ไม่ใช่ "1 items"
test("cart count should reflect total quantity, not just unique titles", async ({ page }) => {
  // กด "Add Practical Web Testing to cart" 2 ครั้ง
  // aria-label ที่ตั้งไว้ใน app.js ทำให้ getByRole หาปุ่มนี้ได้ถูกต้อง
  await page.getByRole("button", { name: "Add Practical Web Testing to cart" }).click();
  await page.getByRole("button", { name: "Add Practical Web Testing to cart" }).click();

  // ตรวจว่า element ที่แสดงจำนวน item แสดงตัวเลขที่ถูกต้อง
  await expect(page.getByText("2 items")).toBeVisible();
  // TEST จะ FAIL เพราะ cart.length = 1 (unique title) แทนที่จะเป็น 2 (total quantity)
});

// ──────────────────────────────────────────────
// TEST 5 — จับ BUG 7 (Decrease ติดลบได้)
// ──────────────────────────────────────────────
// หลักการ: quantity ขั้นต่ำควรเป็น 1
// ถ้ากด "-" ที่ quantity = 1 ควร remove item ออก หรืออย่างน้อยหยุดที่ 1
// ไม่ควรปล่อยให้ติดลบ
test("quantity should not go below 1 when decreasing", async ({ page }) => {
  // เพิ่มหนังสือ 1 เล่ม (quantity = 1)
  await page.getByRole("button", { name: "Add Practical Web Testing to cart" }).click();

  // กด "-" ทันที (quantity ตอนนี้ควรหยุดที่ 1 หรือ remove item ออก)
  await page.getByRole("button", { name: "Decrease Practical Web Testing" }).click();

  // ตรวจว่า quantity ไม่ตกเป็น 0 หรือ -1
  // not.toHaveText คือ assertion แบบ "ต้องไม่มีข้อความนี้"
  await expect(page.locator(".quantity")).not.toHaveText("0");
  await expect(page.locator(".quantity")).not.toHaveText("-1");
  // TEST จะ FAIL เพราะ quantity ลดเป็น 0 และ item ยังอยู่ใน cart
});

// ──────────────────────────────────────────────
// TEST 6 — จับ BUG 8 (Remove ไม่ลบออกจริง)
// ──────────────────────────────────────────────
// หลักการ: กดปุ่ม "Remove" ควรลบสินค้านั้นออกจากตะกร้าทั้งหมด
// ไม่ใช่แค่ลด quantity ลง 1
test("remove should remove item completely", async ({ page }) => {
  // เพิ่มหนังสือ 2 ครั้งเพื่อให้ quantity = 2 ก่อน
  // (เพื่อให้แน่ใจว่า "Remove" ไม่ใช่แค่ทำงานเหมือน "-")
  await page.getByRole("button", { name: "Add Practical Web Testing to cart" }).click();
  await page.getByRole("button", { name: "Add Practical Web Testing to cart" }).click();

  // กดปุ่ม Remove
  await page.getByRole("button", { name: "Remove Practical Web Testing" }).click();

  // ตรวจว่าหนังสือเล่มนี้หายไปจาก cart หมดแล้ว (ไม่ใช่แค่ลด quantity)
  await expect(page.getByText("Practical Web Testing")).not.toBeVisible();
  // และต้องแสดง empty state ด้วย
  await expect(page.getByText("Your cart is empty.")).toBeVisible();
  // TEST จะ FAIL เพราะ Remove แค่ลด quantity จาก 2 → 1 หนังสือยังอยู่ใน cart
});

// ──────────────────────────────────────────────
// TEST 7 — จับ BUG 10 (Promo Code Case-Sensitive)
// ──────────────────────────────────────────────
// หลักการ: promo code ไม่ควร case-sensitive
// ผู้ใช้อาจพิมพ์ "student10" หรือ "Student10" ก็ควรได้ส่วนลดเช่นกัน
test("lowercase promo code should still apply student discount", async ({ page }) => {
  // เพิ่มหนังสือ $29.99 เพื่อให้มียอดที่คำนวณส่วนลดได้
  await page.getByRole("button", { name: "Add Practical Web Testing to cart" }).click();

  // พิมพ์ promo code ด้วยตัวเล็กทั้งหมด
  await page.getByLabel("Promo code").fill("student10");

  // ตรวจว่า discount แสดงเป็น 10% ของ $29.99 = $3.00 (ปัดเศษ)
  // locator("#discount") หา element ที่มี id="discount"
  await expect(page.locator("#discount")).toHaveText("$3.00");
  // TEST จะ FAIL เพราะโค้ดเช็ค === "STUDENT10" ซึ่งไม่ match กับ "student10"
});

// ──────────────────────────────────────────────
// TEST 8 — จับ BUG 1 (Email Validation อ่อนเกินไป)
// ──────────────────────────────────────────────
// หลักการ: "abc@" ไม่ใช่ email จริง ๆ ต้องมี domain ด้วย
// ระบบควรปฏิเสธ input นี้และแสดง error message
test("invalid email should not be accepted at checkout", async ({ page }) => {
  // เพิ่มหนังสือก่อน (จำเป็นต้องมี item ใน cart ก่อน checkout)
  await page.getByRole("button", { name: "Add Practical Web Testing to cart" }).click();

  // กรอก email ที่ไม่สมบูรณ์ (มี @ แต่ไม่มี domain)
  await page.getByLabel("Email").fill("abc@");

  // กดปุ่ม Place order
  await page.getByRole("button", { name: "Place order" }).click();

  // ตรวจว่า error message แสดงขึ้น
  await expect(page.getByText("Please enter a valid email.")).toBeVisible();
  // TEST จะ FAIL เพราะ "abc@".includes("@") → true
  // ทำให้ validation ผ่านและ order ถูกวางแทนที่จะแสดง error
});

// ──────────────────────────────────────────────
// TEST 9 — จับ BUG 2 (Cart ไม่ถูกล้างหลัง Checkout)
// ──────────────────────────────────────────────
// หลักการ: หลังจาก order สำเร็จ ตะกร้าควรว่างเปล่าเสมอ
// เพราะ order ถูก "ส่งไปแล้ว" สินค้าไม่ควรยังอยู่ใน cart
test("successful checkout should clear the cart", async ({ page }) => {
  // เพิ่มหนังสือและกรอก email ที่ถูกต้อง
  await page.getByRole("button", { name: "Add Practical Web Testing to cart" }).click();
  await page.getByLabel("Email").fill("student@example.com");

  // กด Place order
  await page.getByRole("button", { name: "Place order" }).click();

  // ASSERTION 1: ต้องเห็นข้อความ success ก่อน
  await expect(page.getByText("Order placed successfully!")).toBeVisible();

  // ASSERTION 2: cart ต้องว่างหลัง checkout สำเร็จ
  // นี่คือ assertion หลักที่จับ BUG 2
  await expect(page.getByText("Your cart is empty.")).toBeVisible();
  // TEST จะ FAIL เพราะหลัง showMessage() ไม่มีโค้ดล้าง cart
  // ทำให้สินค้ายังอยู่ใน cart แม้ order จะสำเร็จแล้ว
});
