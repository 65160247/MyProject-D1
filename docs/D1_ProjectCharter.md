# Project Charter  
## โครงการพัฒนาเว็บแอปพลิเคชันตัวกลางเพื่อการค้นหาและบริหารจัดการที่พักอาศัย

---

## ส่วนที่ 1: ตั้งค่าทีม (Team Setup)

### ชื่อทีม
**สี่ตัวบาทกับเว็บตัวกลาง**

### สมาชิกและบทบาท

#### 1. กฤตภาส ศิริภภาวรรณ  
- **Name (EN):** Kittaphat Siriphaphawan  
- **Email:** 65160110@go.buu.ac.th  
- **Phone:** 062-572-5774  
- **บทบาท:** Product Owner  
- **หน้าที่:**  
  - กำหนดวิสัยทัศน์ทางธุรกิจ  
  - วิเคราะห์และจัดลำดับความสำคัญของ Requirement  

#### 2. ระพีพันธุ์ ศิริบุญคง  
- **Name (EN):** Rapepan Siriboonkong  
- **Email:** 65160121@go.buu.ac.th  
- **Phone:** 098-276-9502  
- **บทบาท:** Developer  
- **หน้าที่:**  
  - ออกแบบสถาปัตยกรรมระบบ  
  - Tech Lead  
  - Code Review  

#### 3. ทศภาค จันทร์โชตะ  
- **Name (EN):** Thodsapark Chanchota  
- **Email:** 65160247@go.buu.ac.th  
- **Phone:** 062-374-2446  
- **บทบาท:** Scrum Master  
- **หน้าที่:**  
  - ประสานงานภายในทีม  
  - กำหนด Timeline  
  - ขจัดอุปสรรคในการทำงาน  

#### 4. ภูมิรพี ปิยะ  
- **Name (EN):** Phumrapee Piya  
- **Email:** 65160262@buu.ac.th  
- **Phone:** 092-920-3291  
- **บทบาท:** Quality Assurance / Tester  
- **หน้าที่:**  
  - Test Planning  
  - Quality Assurance  

---

## ส่วนที่ 2: Project Charter

### 1. ชื่อโครงการและภาพรวม

#### ชื่อโครงการ
**การพัฒนาเว็บแอปพลิเคชันตัวกลางเพื่อการค้นหาและบริหารจัดการที่พักอาศัย**

#### ภาพรวมโครงการ
เว็บแอปพลิเคชันรูปแบบ **Marketplace** ที่ทำหน้าที่เป็นศูนย์กลางรวบรวมข้อมูลหอพักบริเวณรอบมหาวิทยาลัย  
แก้ปัญหาข้อมูลที่กระจัดกระจาย ช่วยให้ผู้เช่าสามารถค้นหาและเปรียบเทียบห้องพักได้ในที่เดียว  
ลดขั้นตอนและระยะเวลาในการลงสำรวจพื้นที่จริง พร้อมฟังก์ชันรีวิวจากผู้ใช้งานจริงเพื่อช่วยในการตัดสินใจ

#### ตลาดเป้าหมาย

**กลุ่มผู้เช่า**
- กลุ่มเป้าหมายหลัก: นักศึกษามหาวิทยาลัยที่ต้องการที่พักอาศัยรอบมหาวิทยาลัย  
- กลุ่มเป้าหมายรอง: บุคลากรในมหาวิทยาลัย และผู้ปกครอง  

**กลุ่มผู้ให้เช่า**
- กลุ่มเป้าหมายหลัก: ผู้ประกอบการหอพัก อพาร์ตเมนต์ แมนชั่น รอบมหาวิทยาลัย  
- กลุ่มเป้าหมายรอง: เจ้าของคอนโดหรือที่พักส่วนบุคคลที่ปล่อยเช่ารายเดือน  

---

## 2. วัตถุประสงค์และเกณฑ์ความสำเร็จ

### 2.1 รองรับผู้ใช้งาน 3 กลุ่มหลัก
**(ผู้เช่า, ผู้ให้เช่า, ผู้ดูแลระบบ)**

**เกณฑ์ความสำเร็จ**
- ระบบลงทะเบียนและเข้าสู่ระบบ พร้อมแยกสิทธิ์ได้ถูกต้อง 100%  
- ฟังก์ชันหลักผ่านการทดสอบครบถ้วนตาม User Journey  

---

### 2.2 เครื่องมือค้นหาและคัดกรองที่พัก
**เกณฑ์ความสำเร็จ**
- ระบบค้นหาและตัวกรองทำงานได้จริง (ราคา, ประเภทห้อง, สิ่งอำนวยความสะดวก)  
- ผู้เช่าสามารถดูรายละเอียดและติดต่อผู้ให้เช่าได้โดยไม่เกิดข้อผิดพลาด  

---

### 2.3 ระบบบริหารจัดการที่พัก (Self-Service Dashboard)
**เกณฑ์ความสำเร็จ**
- ผู้ให้เช่าสามารถเพิ่ม แก้ไข และลบประกาศได้เอง  
- ฟังก์ชัน **Toggle Availability (ว่าง/เต็ม)** แสดงผลแบบ Real-time  

---

### 2.4 การคัดกรองความถูกต้องของข้อมูล
**เกณฑ์ความสำเร็จ**
- Admin มี Dashboard ตรวจสอบและอนุมัติ/ปฏิเสธประกาศ  
- ระบบสามารถระงับบัญชีผู้ใช้งานที่ทำผิดกฎได้  

---

## 3. บทบาททีมและความรับผิดชอบ

### Product Owner – กฤตภาส ศิริภภาวรรณ
- เขียน User Stories (As a… I want… So that…)  
- จัดทำ Use Case Diagram  
- เขียน SRS ส่วนที่ 1–2  

### Developer – ระพีพันธุ์ ศิริบุญคง
- ออกแบบ ER Diagram  
- จัดทำ Data Dictionary  
- รีวิว Activity Diagram ร่วมกับ QA  

### Scrum Master – ทศภาค จันทร์โชตะ
- รวบรวมและจัดการเอกสาร SRS  
- จัดทำ Diagram ตามมาตรฐาน  
- ควบคุม Timeline โครงการ  

### Quality Assurance – ภูมิรพี ปิยะ
- กำหนด Acceptance Criteria  
- เขียน Activity Diagram  
- เขียน Non-Functional Requirements  

---

## 4. ตารางเวลาและ Milestones

**ระยะเวลาโครงการ:** 11 สัปดาห์ (3 เดือน)  
- **เริ่มต้น:** 15 ธันวาคม 2568  
- **สิ้นสุด:** 22 กุมภาพันธ์ 2568  

### PHASE 1: Initiation & Planning (Week 1–5)
- วิเคราะห์ปัญหา และเขียน Project Charter  
- **Milestone (D1):** Project Charter & Requirements  

### PHASE 2: System Design (Week 6)
- ER Diagram, Tech Stack, Architecture  
- **Milestone (D2):** System Design Document  

### PHASE 3: Development & Implementation (Week 7–8)
- Login/Register, CRUD Listing, Search  
- CI/CD & Testing  
- **Milestone (D3):** Testing & CI/CD Setup  

### PHASE 4: QA & Security (Week 9)
- UAT & Security Audit  
- **Milestone (D4):** Quality & Security Report  

### PHASE 5: Finalization (Week 10)
- Final Report, Manual, Presentation  
- **Milestone (D5):** Final Documentation & Release Plan  

---

## 5. ความเสี่ยง (Top 5 Risks)

| Risk | Severity | Probability | Score | Level |
|----|----|----|----|----|
| Solo Developer Bottleneck | 90 | 60% | 54 | CRITICAL |
| Feature Creep | 80 | 70% | 56 | CRITICAL |
| Data & Privacy Issues | 60 | 50% | 30 | HIGH |
| Deployment Issues | 70 | 40% | 28 | HIGH |
| QA Delay | 50 | 50% | 25 | MEDIUM |

---

## 6. ผู้เกี่ยวข้องและการสื่อสาร (Stakeholders)

### 1. Project Advisor
- **ชื่อ:** อ.วิทวัส พันธุมจินดา  
- **Channel:** On-site, Microsoft Teams, Line  
- **ความถี่:** รายสัปดาห์  
- **Email:** wittawas@buu.ac.th  

### 2. Dormitory Owners
- **Channel:** On-site, โทรศัพท์, Line  
- **ความถี่:** ช่วงเก็บ Requirement และ UAT  

### 3. Students / Tenants
- **Channel:** Google Forms, Social Media  
- **เวลาตอบกลับ:** 24–48 ชั่วโมง  
- **Support:** In-App Help, Facebook Page, Email  

---
