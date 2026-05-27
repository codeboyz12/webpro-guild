// ============================================================
// app.js — Buggy Book Shop (Annotated Version)
// ============================================================
// ไฟล์นี้เป็นโค้ด frontend ของร้านหนังสือจำลอง
// อาจารย์ตั้งใจซ่อน bugs ไว้ 11 จุด (ทำเครื่องหมาย BUG 1–11)
// เพื่อให้นักศึกษาฝึกเขียน test เพื่อจับ bugs เหล่านั้น
//
// LEARNING GOAL:
//   ทุก BUG comment คือ test case ที่รอให้เขียน
//   อ่าน bug แต่ละตัว แล้วลองคิดก่อนว่าจะเขียน test ยังไง
//   ค่อย scroll ไปดู tests/example-bug-catching.spec.js
// ============================================================

// ──────────────────────────────────────────────
// DATA — รายการหนังสือทั้งหมดใน catalog
// ──────────────────────────────────────────────
const books = [
  { id: "b1", title: "Practical Web Testing",             category: "testing",  price: 29.99 },
  { id: "b2", title: "JavaScript for Frontend Apps",      category: "frontend", price: 24.50 },
  { id: "b3", title: "UX Basics for Developers",          category: "design",   price: 19.99 },
  { id: "b4", title: "Automation Patterns with Playwright",category: "testing",  price: 34.99 },
  { id: "b5", title: "CSS Layout Field Guide",            category: "frontend", price: 22.00 },
];

// state ของแอป — cart เก็บรายการที่ผู้ใช้เลือก
let cart = [];
// currentBooks เก็บผลลัพธ์หลังจากกรองและเรียงแล้ว
let currentBooks = [...books];

// ──────────────────────────────────────────────
// DOM REFERENCES — หา element ทุกตัวครั้งเดียวตอน load
// เพราะการ query DOM ซ้ำ ๆ ใน loop มี performance cost
// ──────────────────────────────────────────────
const bookList       = document.querySelector("#book-list");
const bookTemplate   = document.querySelector("#book-template");
const cartList       = document.querySelector("#cart-list");
const cartTemplate   = document.querySelector("#cart-template");
const searchInput    = document.querySelector("#search-input");
const categorySelect = document.querySelector("#category-select");
const sortSelect     = document.querySelector("#sort-select");
const resultCount    = document.querySelector("#result-count");
const emptyCatalog   = document.querySelector("#empty-catalog");
const cartCount      = document.querySelector("#cart-count");
const emptyCart      = document.querySelector("#empty-cart");
const subtotalText   = document.querySelector("#subtotal");
const discountText   = document.querySelector("#discount");
const totalText      = document.querySelector("#total");
const checkoutForm   = document.querySelector("#checkout-form");
const emailInput     = document.querySelector("#email-input");
const promoInput     = document.querySelector("#promo-input");
const checkoutMessage = document.querySelector("#checkout-message");
const resetBtn       = document.querySelector("#reset-btn");

// ──────────────────────────────────────────────
// EVENT LISTENERS
// ──────────────────────────────────────────────

// ทุกครั้งที่ search, category, หรือ sort เปลี่ยน → กรอง catalog ใหม่
searchInput.addEventListener("input",  applyFilters);
categorySelect.addEventListener("change", applyFilters);
sortSelect.addEventListener("change",  applyFilters);

// ปุ่ม Reset — เคลียร์ cart และ form ทั้งหมด
resetBtn.addEventListener("click", () => {
  cart = [];
  emailInput.value = "";
  promoInput.value = "";
  checkoutMessage.textContent = "";
  checkoutMessage.className = "message";
  renderCart();
});

// ──────────────────────────────────────────────
// CHECKOUT FORM HANDLER
// ──────────────────────────────────────────────
checkoutForm.addEventListener("submit", event => {
  // preventDefault ป้องกันไม่ให้ browser รีโหลดหน้าเมื่อ submit form
  event.preventDefault();

  // ตรวจว่า cart ไม่ว่างก่อน
  if (cart.length === 0) {
    showMessage("Your cart is empty.", "error");
    return;
  }

  // ════════════════════════════════════════════
  // BUG 1: Email validation อ่อนเกินไป
  // ════════════════════════════════════════════
  // โค้ดตรวจแค่ว่ามีเครื่องหมาย "@" อยู่หรือเปล่า
  // ดังนั้น "abc@" หรือ "student@example." ก็ผ่านได้ทั้งคู่
  //
  // วิธีแก้ที่ถูกต้อง: ใช้ regex ที่ครอบคลุมกว่านี้
  //   เช่น /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)
  //   หรือใช้ HTML5 input type="email" ร่วมกับ checkValidity()
  if (!emailInput.value.includes("@")) {
    showMessage("Please enter a valid email.", "error");
    return;
  }

  showMessage("Order placed successfully!", "success");

  // ════════════════════════════════════════════
  // BUG 2: Cart ไม่ถูกล้างหลัง checkout สำเร็จ
  // ════════════════════════════════════════════
  // หลังจาก order สำเร็จ ผู้ใช้ควรเห็นตะกร้าว่าง
  // แต่ไม่มีโค้ดใด ๆ ที่ reset cart ที่นี่เลย
  //
  // วิธีแก้: เพิ่ม 2 บรรทัดนี้ก่อน showMessage(...)
  //   cart = [];
  //   renderCart();
});

// helper สำหรับแสดงข้อความ feedback ใต้ form
function showMessage(text, type) {
  checkoutMessage.textContent = text;
  checkoutMessage.className = `message ${type}`; // "message success" หรือ "message error"
}

// ──────────────────────────────────────────────
// FILTERING & SORTING
// ──────────────────────────────────────────────
function applyFilters() {
  const keyword  = searchInput.value.trim();
  const category = categorySelect.value;
  const sort     = sortSelect.value;

  // กรองจาก books ต้นฉบับ ไม่ใช่จาก currentBooks
  // เพราะถ้ากรองซ้อนกัน currentBooks จะยิ่งน้อยลงเรื่อย ๆ
  currentBooks = books.filter(book => {
    const matchesCategory = category === "all" || book.category === category;

    // ════════════════════════════════════════════
    // BUG 3: Search เป็น case-sensitive
    // ════════════════════════════════════════════
    // String.includes() เปรียบเทียบแบบ exact case
    // ดังนั้นพิมพ์ "testing" ไม่เจอ "Practical Web Testing"
    // เพราะ "T" กับ "t" ต่างกัน
    //
    // วิธีแก้: แปลงทั้งสองด้านเป็น lowercase ก่อน
    //   book.title.toLowerCase().includes(keyword.toLowerCase())
    const matchesKeyword = !keyword || book.title.includes(keyword);

    return matchesCategory && matchesKeyword;
  });

  // ════════════════════════════════════════════
  // BUG 4: "Low to High" เรียงกลับหัว
  // ════════════════════════════════════════════
  // sort comparator: (a, b) => a - b → ascending (น้อยไปมาก) ✓
  //                  (a, b) => b - a → descending (มากไปน้อย) ✗
  //
  // โค้ดนี้ใช้ b.price - a.price ซึ่งเป็น descending
  // แต่ label บอกว่า "Low to High" (ascending)
  // วิธีแก้: เปลี่ยนเป็น a.price - b.price
  if (sort === "low-high")  currentBooks.sort((a, b) => b.price - a.price);

  // ════════════════════════════════════════════
  // BUG 5: "High to Low" เรียงกลับหัวเช่นกัน
  // ════════════════════════════════════════════
  // ด้วยเหตุผลเดียวกันกับ BUG 4 แต่กลับกัน
  // วิธีแก้: เปลี่ยนเป็น b.price - a.price
  if (sort === "high-low")  currentBooks.sort((a, b) => a.price - b.price);

  renderBooks();
}

// ──────────────────────────────────────────────
// RENDER CATALOG
// ──────────────────────────────────────────────
function renderBooks() {
  // ล้าง catalog เก่าออกก่อน แล้วค่อย render ใหม่
  bookList.innerHTML = "";

  // วนสร้าง book card ทีละเล่มจาก <template> ใน HTML
  // การใช้ template.content.cloneNode(true) มีประสิทธิภาพดีกว่า
  // การสร้าง innerHTML string ทีละตัว เพราะ browser parse HTML แค่ครั้งเดียว
  currentBooks.forEach(book => {
    const node      = bookTemplate.content.cloneNode(true);
    const card      = node.querySelector(".book-card");
    const title     = node.querySelector(".book-title");
    const meta      = node.querySelector(".book-meta");
    const price     = node.querySelector(".book-price");
    const addButton = node.querySelector(".add-btn");

    card.dataset.bookId = book.id;
    title.textContent   = book.title;
    meta.textContent    = `Category: ${book.category}`;
    price.textContent   = formatMoney(book.price);

    // aria-label ทำให้ screen reader อ่านได้ว่ากดปุ่มนี้แล้วเพิ่มหนังสือเล่มอะไร
    // Playwright ใช้ข้อมูลนี้ใน getByRole("button", { name: "Add X to cart" }) ด้วย
    addButton.setAttribute("aria-label", `Add ${book.title} to cart`);
    addButton.addEventListener("click", () => addToCart(book.id));

    bookList.appendChild(node);
  });

  resultCount.textContent = `${currentBooks.length} results`;

  // ════════════════════════════════════════════
  // BUG 6: Empty state ไม่แสดงเมื่อไม่มีผลลัพธ์
  // ════════════════════════════════════════════
  // ตั้ง hidden = true เสมอ ทำให้ "No books found." ไม่เคยแสดงเลย
  // ไม่ว่าจะค้นหาอะไรก็ตาม
  //
  // วิธีแก้: ตั้งค่าตาม currentBooks.length
  //   emptyCatalog.hidden = currentBooks.length > 0;
  emptyCatalog.hidden = true;
}

// ──────────────────────────────────────────────
// CART — เพิ่มสินค้า
// ──────────────────────────────────────────────
function addToCart(bookId) {
  const book     = books.find(item => item.id === bookId);
  // ตรวจว่าหนังสือเล่มนี้อยู่ใน cart แล้วหรือยัง
  const existing = cart.find(item => item.id === bookId);

  if (existing) {
    // ถ้ามีแล้ว → แค่เพิ่ม quantity
    existing.quantity += 1;
  } else {
    // ถ้ายังไม่มี → เพิ่มเป็น entry ใหม่ด้วย quantity = 1
    // spread operator (...book) copy properties ทั้งหมดของ book
    cart.push({ ...book, quantity: 1 });
  }

  renderCart();
}

// ──────────────────────────────────────────────
// RENDER CART
// ──────────────────────────────────────────────
function renderCart() {
  cartList.innerHTML = "";

  cart.forEach(item => {
    const node           = cartTemplate.content.cloneNode(true);
    const row            = node.querySelector(".cart-item");
    const title          = node.querySelector(".cart-title");
    const meta           = node.querySelector(".cart-meta");
    const decreaseButton = node.querySelector(".decrease-btn");
    const increaseButton = node.querySelector(".increase-btn");
    const removeButton   = node.querySelector(".remove-btn");
    const quantity       = node.querySelector(".quantity");

    row.dataset.bookId = item.id;
    title.textContent  = item.title;
    meta.textContent   = `${formatMoney(item.price)} each`;
    quantity.textContent = item.quantity;

    decreaseButton.setAttribute("aria-label", `Decrease ${item.title}`);
    increaseButton.setAttribute("aria-label", `Increase ${item.title}`);
    removeButton.setAttribute("aria-label",   `Remove ${item.title}`);

    // ════════════════════════════════════════════
    // BUG 7: Decrease ปล่อยให้ quantity ติดลบได้
    // ════════════════════════════════════════════
    // ลด quantity ลง 1 แต่ไม่มีการตรวจว่าต่ำกว่า 1 หรือเปล่า
    // ถ้ากด "-" ตอน quantity = 1 → quantity = 0 → -1 → ...
    //
    // วิธีแก้: ตรวจก่อนลด
    //   if (item.quantity > 1) { item.quantity -= 1; renderCart(); }
    //   else { cart = cart.filter(i => i.id !== item.id); renderCart(); }
    decreaseButton.addEventListener("click", () => {
      item.quantity -= 1;
      renderCart();
    });

    increaseButton.addEventListener("click", () => {
      item.quantity += 1;
      renderCart();
    });

    // ════════════════════════════════════════════
    // BUG 8: ปุ่ม "Remove" ไม่ลบสินค้าออก
    // ════════════════════════════════════════════
    // ปุ่มนี้ทำงานเหมือนปุ่ม "-" ทุกประการ คือแค่ลด quantity ลง 1
    // ไม่ได้ลบ item ออกจาก cart เลย
    //
    // วิธีแก้: กรอง item ที่ต้องการออกจาก array
    //   cart = cart.filter(i => i.id !== item.id);
    //   renderCart();
    removeButton.addEventListener("click", () => {
      item.quantity -= 1; // ← ผิด: ควรจะลบออกทั้งหมด ไม่ใช่ลด quantity
      renderCart();
    });

    cartList.appendChild(node);
  });

  // ════════════════════════════════════════════
  // BUG 9: Cart count นับ unique titles แทน total quantity
  // ════════════════════════════════════════════
  // cart.length คือจำนวน unique หนังสือในตะกร้า
  // เช่น เพิ่ม "Practical Web Testing" 2 ครั้ง → cart.length = 1 ไม่ใช่ 2
  //
  // วิธีแก้: sum quantity ของทุก item
  //   const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  //   cartCount.textContent = `${totalQty} ${totalQty === 1 ? "item" : "items"}`;
  cartCount.textContent = `${cart.length} ${cart.length === 1 ? "item" : "items"}`;

  // ถ้า cart ว่าง → แสดงข้อความ "Your cart is empty."
  emptyCart.hidden = cart.length > 0;

  // คำนวณยอดรวม
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // ════════════════════════════════════════════
  // BUG 10: Promo code ต้องพิมพ์ตัวใหญ่เท่านั้น
  // ════════════════════════════════════════════
  // เปรียบเทียบแบบ exact case match
  // "STUDENT10" ได้ส่วนลด แต่ "student10" หรือ "Student10" ไม่ได้
  //
  // วิธีแก้: normalize ก่อนเปรียบเทียบ
  //   promoInput.value.toUpperCase() === "STUDENT10"
  const discount = promoInput.value === "STUDENT10" ? subtotal * 0.1 : 0;

  // ════════════════════════════════════════════
  // BUG 11: ใช้ Math.floor แทน Math.round ในการปัดเศษ
  // ════════════════════════════════════════════
  // Math.floor ปัดลงเสมอ เช่น 29.995 → 29.99 (ผิด, ควรเป็น 30.00)
  // ทำให้ยอด total อาจต่ำกว่าความเป็นจริง 1 สตางค์
  //
  // วิธีแก้: ใช้ Math.round แทน
  //   const total = Math.round((subtotal - discount) * 100) / 100;
  //   หรือ parseFloat((subtotal - discount).toFixed(2))
  const total = Math.floor((subtotal - discount) * 100) / 100;

  subtotalText.textContent = formatMoney(subtotal);
  discountText.textContent = formatMoney(discount);
  totalText.textContent    = formatMoney(total);
}

// ──────────────────────────────────────────────
// UTILITIES
// ──────────────────────────────────────────────

// อัปเดต discount ทุกครั้งที่พิมพ์ promo code (real-time feedback)
promoInput.addEventListener("input", renderCart);

// formatMoney: แปลงตัวเลขเป็น string พร้อม $ และทศนิยม 2 ตำแหน่ง
// เช่น 29.9 → "$29.90"  |  34.99 → "$34.99"
function formatMoney(value) {
  return `$${value.toFixed(2)}`;
}

// ──────────────────────────────────────────────
// INIT — รัน render ครั้งแรกตอนโหลดหน้า
// ──────────────────────────────────────────────
applyFilters(); // เติมหนังสือทั้งหมดลงใน catalog
renderCart();   // แสดง cart ว่าง (เผื่อมี state ที่ persist อยู่)
