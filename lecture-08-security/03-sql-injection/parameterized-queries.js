// ============================================================
// LECTURE 08 — SQL INJECTION & PARAMETERIZED QUERIES
// ============================================================

// ============================================================
// 1. ตัวอย่าง SQL Injection (เพื่อความเข้าใจ — อย่าทำจริง)
// ============================================================

// BAD: string concatenation โดยตรง — อันตรายมาก
function loginUnsafe(username, password) {
  // ถ้า username = "admin'--"
  // query กลายเป็น: SELECT * FROM users WHERE username='admin'--' AND password='...'
  // -- คือ comment ใน SQL → ส่วน AND password ถูกตัดออก → login สำเร็จโดยไม่รู้ password!
  const query = `SELECT * FROM users 
                 WHERE username='${username}' 
                 AND password='${password}'`;
  return db.execute(query);
}

// ตัวอย่างจากสไลด์: อีก pattern ที่อันตราย
// username = "badguy';update users set password='letmein' where user='administrator'--"
// กลายเป็น 2 คำสั่งรันพร้อมกัน:
// 1. SELECT * FROM users WHERE username='badguy'
// 2. UPDATE users SET password='letmein' WHERE user='administrator'


// ============================================================
// 2. Parameterized Queries (Prepared Statements) — วิธีที่ถูกต้อง
// ============================================================
// แทนที่จะ interpolate string ตรงๆ ให้ใช้ placeholder (? หรือ $1)
// database จะแยก "structure of query" กับ "data" ออกจากกันชัดเจน
// ทำให้ malicious SQL ถูกมองเป็นแค่ string ธรรมดา ไม่ใช่คำสั่ง

// ตัวอย่างกับ mysql2 (Node.js)
async function loginSafe_mysql(username, password) {
  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
  // ค่าที่ส่งใน array จะถูก escape อัตโนมัติโดย library
  // "admin'--" จะถูกมองเป็น string ธรรมดา ไม่ใช่ SQL syntax
  const [rows] = await mysql.execute(query, [username, password]);
  return rows[0] || null;
}

// ตัวอย่างกับ pg (PostgreSQL)
async function loginSafe_postgres(username, password) {
  const query = 'SELECT * FROM users WHERE username = $1 AND password = $2';
  const result = await pool.query(query, [username, password]);
  return result.rows[0] || null;
}

// ตัวอย่างกับ ORM (Sequelize/Prisma) — safe by default
async function loginSafe_orm(username, password) {
  // ORM จัดการ parameterization ให้อัตโนมัติ ไม่ต้องเขียน query string เอง
  const user = await User.findOne({
    where: { username, password }
  });
  return user;
}


// ============================================================
// 3. Input Validation เพิ่มเติมก่อน Query (Defense in Depth)
// ============================================================
async function loginWithFullProtection(username, password) {
  // ชั้นที่ 1: Validate — เช็ครูปแบบก่อน
  if (typeof username !== 'string' || username.length > 50) {
    throw new Error('Username ไม่ถูกต้อง');
  }
  if (typeof password !== 'string' || password.length < 8) {
    throw new Error('Password ไม่ถูกต้อง');
  }

  // ชั้นที่ 2: Parameterized Query — ป้องกัน SQL Injection
  const query = 'SELECT id, username, role FROM users WHERE username = ?';
  const [rows] = await mysql.execute(query, [username]);

  if (rows.length === 0) return null;

  // ชั้นที่ 3: เปรียบเทียบ password ด้วย bcrypt (ไม่ควรเก็บ plaintext password)
  const isValid = await bcrypt.compare(password, rows[0].hashedPassword);
  return isValid ? rows[0] : null;
}
