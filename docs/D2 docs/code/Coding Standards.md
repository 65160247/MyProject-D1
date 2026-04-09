
# Coding Standards
# มาตรฐานการเขียนโค้ด

---

## 1. General Principles (หลักการทั่วไป)
- Write clean, readable, and self-explanatory code. (เขียนโค้ดให้อ่านง่าย เข้าใจง่าย)
- Use meaningful variable, function, and class names. (ตั้งชื่อให้สื่อความหมาย)
- Keep functions and files short and focused on a single responsibility. (ฟังก์ชัน/ไฟล์ควรสั้นและทำงานเดียว)
- Add comments for complex logic or non-obvious code. (ใส่คอมเมนต์เมื่อจำเป็น)
- Remove unused code and imports. (ลบโค้ด/อิมพอร์ตที่ไม่ได้ใช้)

---

## 2. JavaScript/React (Frontend)
- Use ES6+ syntax (ใช้ ES6+)
- Prefer `const` and `let` over `var` (ใช้ const/let แทน var)
- Use functional components and React hooks (ใช้ฟังก์ชันคอมโพเนนต์และ React hooks)
- Use PropTypes or TypeScript for type checking (ตรวจสอบชนิดข้อมูล)
- Organize components in `src/components/` (แยกไฟล์คอมโพเนนต์)
- Indent 2 spaces (ย่อหน้า 2 ช่อง)
- Use single quotes for strings (ใช้ ' ' สำหรับ string)
- Use semicolons (ใส่ ; ทุกบรรทัด)
- PascalCase for files/components (ชื่อไฟล์/คอมโพเนนต์ PascalCase)
- CSS แยกไฟล์ตามชื่อคอมโพเนนต์

---

## 3. Node.js/Express (Backend)
- Use ES6+ syntax (ใช้ ES6+)
- Use `const` and `let` (ใช้ const/let)
- แยกไฟล์ routes, controllers, middleware
- ใช้ async/await
- จัดการ error ด้วย try/catch
- ใช้ environment variables
- Indent 2 spaces (ย่อหน้า 2 ช่อง)
- Use single quotes (ใช้ ' ')
- Use semicolons (ใส่ ;)
- ชื่อไฟล์ camelCase

---

## 4. Git & Collaboration (การใช้ Git และทำงานร่วมกัน)
- Commit message สั้น ชัดเจน (เขียนเป็นคำสั่ง)
- ใช้ branch สำหรับแต่ละฟีเจอร์
- ดึงและรวมโค้ดล่าสุดก่อน push
- แก้ conflict ก่อน pull request
- ตรวจสอบโค้ดก่อน merge

---

## 5. Documentation (เอกสาร)
- อัปเดต README.md และเอกสารอื่นเมื่อมีการเปลี่ยนแปลง
- บันทึก API ใน API_Endpoints.md
- ใส่คอมเมนต์ในโค้ดที่ซับซ้อน

---

## 6. Testing (การทดสอบ)
- เขียน unit/integration test สำหรับ logic สำคัญ
- ตั้งชื่อ test ให้สื่อความหมาย
- เก็บไฟล์ test ในโฟลเดอร์ `tests/` หรือข้างไฟล์หลัก

---

## 7. Code Review Checklist (รายการตรวจสอบโค้ด)
- [ ] โค้ดอ่านง่าย
- [ ] ตั้งชื่อถูกหลัก
- [ ] ไม่มีโค้ด/อิมพอร์ตที่ไม่ได้ใช้
- [ ] จัดการ error ถูกต้อง
- [ ] มี test เพียงพอ
- [ ] เอกสารถูกอัปเดต
