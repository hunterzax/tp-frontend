# CWE-798: Hard-coded Secrets - Verification Report

## การตรวจสอบ Source Code ตามรายการใน CWE-798:UseofHard-coded.md

วันที่ตรวจสอบ: 29 ตุลาคม 2025

---

## สรุปผลการตรวจสอบ

จากการตรวจสอบ source code ทั้งหมดตามรายการที่ระบุในไฟล์ `CWE-798:UseofHard-coded.md` พบว่า:

### ✅ ไฟล์ที่ได้รับการแก้ไขแล้ว (ไม่พบ Hard-coded Secrets)

#### 1. `/src/utils/encryptionData.ts`
- **สถานะ**: ✅ **FIXED**
- **CID**: 41853, 42036
- **บรรทัดที่ถูกรายงาน**: 3, 27
- **ผลการตรวจสอบ**: 
  - ใช้ environment variables แทนการ hard-code
  - `const SECRET_KEY:any = process.env.NEXT_PUBLIC_RESPONSE_ENCRYPT_KEY`
  - `const KEY2:any = process.env.NEXT_PUBLIC_RESPONSE_ENCRYPT_KEY2`
  - `const SECRET_KEY_IV:any = process.env.NEXT_PUBLIC_RESPONSE_ENCRYPT_KEY_IV`

#### 2. `/src/components/other/googleMap.tsx`
- **สถานะ**: ✅ **FIXED**
- **CID**: 42222
- **บรรทัดที่ถูกรายงาน**: 96
- **ผลการตรวจสอบ**: 
  - ใช้ environment variable แทนการ hard-code
  - `const GG_TOKEN: any = process.env.NEXT_PUBLIC_GG_MAPS`
  - บรรทัด 28: อ่านค่าจาก environment variable

#### 3. `/src/app/[lng]/authorization/(menu)/dam/(menu)/userManagement/(menu)/users/form/modalPassword.tsx`
- **สถานะ**: ✅ **FIXED**
- **CID**: 42440
- **บรรทัดที่ถูกรายงาน**: 64
- **ผลการตรวจสอบ**: 
  - ไม่พบ hard-coded secrets
  - ใช้ dynamic password จาก API response
  - Password ถูก generate และส่งมาจาก backend

---

### ❌ ไฟล์ที่ถูกลบหรือไม่พบ (Not Found)

#### 4. `/src/app/[lng]/authorization/(menu)/dam/(menu)/userManagement/(menu)/users/form/data.tsx`
- **สถานะ**: ❌ **FILE NOT FOUND**
- **CID**: หลาย CID (41912, 41966, 41968, 41969, 41985, 42072, 42080, 42084, 42089, 42100, 42109, 42114, 42136, 42178, 42220, 42222, 42223, 42224, 42225, 42240, 42314, 42331, 42382, 42399, 42506, 42515)
- **หมายเหตุ**: 
  - ไฟล์นี้ไม่มีอยู่ในโครงสร้างปัจจุบัน
  - น่าจะถูกลบหรือ refactor แล้ว
  - ไฟล์ที่มีอยู่ใน directory นี้: modalAction.tsx, modalPassword.tsx, modalReason.tsx, modalRole.tsx, modalSummary.tsx, modalUpdateStat.tsx, table.tsx, tableHistory.tsx

#### 5. `/src/app/[lng]/authorization/(menu)/dam/(menu)/parameters/(menu)/systemConfiguration/(menu)/emailGroupForEvent/form/mockData.tsx`
- **สถานะ**: ❌ **FILE NOT FOUND**
- **CID**: 41863, 42331, 42382, 42399
- **หมายเหตุ**: 
  - ไฟล์นี้ไม่มีอยู่ในโครงสร้างปัจจุบัน
  - ไฟล์ที่มีอยู่ใน directory นี้: page.tsx, tableHistory.tsx, table.tsx, modalView.tsx, modalAction.tsx

#### 6. ไฟล์ที่มี path variant ([ing], [Ing])
- **สถานะ**: ❌ **FILE NOT FOUND**
- **หมายเหตุ**: 
  - path ที่ระบุเป็น `[ing]` หรือ `[Ing]` น่าจะเป็น typo
  - ในโครงสร้างจริงใช้ `[lng]` เท่านั้น

---

### 🚨 ไฟล์ที่ยังมี Hard-coded Secrets อยู่ (CRITICAL)

#### 7. `/src/app/api/webservice/route.ts`
- **สถานะ**: 🚨 **FOUND HARD-CODED SECRETS**
- **CID**: ไม่ได้ระบุในรายการ แต่พบจากการ scan
- **บรรทัดที่พบปัญหา**: 19, 20
- **ปัญหาที่พบ**:
  ```typescript
  // บรรทัดที่ 19
  const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJuYXRjaGFub25AcHJvbXB0LmNvLnRoIiwiZXhwIjoxNzYxMjIwMzYxfQ.Nxgd9L5LYeYaPFSwl_B6yk7wRiANvdXNj_T-idPlHqg";//process.env.TPA_ACCESS_TOKEN ?? "";
  
  // บรรทัดที่ 20
  const JWT_COOKIE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJuYXRjaGFub25AcHJvbXB0LmNvLnRoIiwiZXhwIjoxNzYxMjIwMzYxfQ.Nxgd9L5LYeYaPFSwl_B6yk7wRiANvdXNj_T-idPlHqg";///process.env.TPA_JWT_COOKIE ?? "";
  ```

- **ความเสี่ยง**: 
  - มี JWT token ที่ hard-code โดยตรงในโค้ด
  - Token มีข้อมูล email: natchanon@prompt.co.th
  - Token expire date: 1761220361 (Unix timestamp)
  - มี comment บอกว่าควรใช้ environment variable แต่ยัง hard-code อยู่

- **คำแนะนำในการแก้ไข**:
  ```typescript
  // แก้ไขเป็น
  const ACCESS_TOKEN = process.env.TPA_ACCESS_TOKEN ?? "";
  const JWT_COOKIE = process.env.TPA_JWT_COOKIE ?? "";
  ```

---

## สรุปภาพรวม

| สถานะ | จำนวนไฟล์ | รายละเอียด |
|-------|-----------|-----------|
| ✅ แก้ไขแล้ว | 3 ไฟล์ | encryptionData.ts, googleMap.tsx, modalPassword.tsx |
| ❌ ไม่พบไฟล์ | 2+ ไฟล์ | data.tsx, mockData.tsx และ variant paths |
| 🚨 ยังมีปัญหา | 1 ไฟล์ | webservice/route.ts |

---

## การดำเนินการที่แนะนำ

### ลำดับความสำคัญสูง (High Priority)
1. **แก้ไข `/src/app/api/webservice/route.ts`**
   - ลบ hard-coded JWT tokens ออก
   - ใช้ environment variables แทน
   - Revoke tokens เดิมและสร้าง tokens ใหม่

### ลำดับความสำคัญปานกลาง (Medium Priority)
2. **ตรวจสอบไฟล์ที่ถูกลบ**
   - ยืนยันว่าไฟล์ data.tsx และ mockData.tsx ถูกลบอย่างถูกต้องแล้ว
   - ตรวจสอบ git history ว่าไฟล์เหล่านี้ถูกลบไปเมื่อไหร่

### ลำดับความสำคัญต่ำ (Low Priority)
3. **อัพเดทเอกสาร CWE-798:UseofHard-coded.md**
   - อัพเดทสถานะของแต่ละ CID
   - ลบ CID ที่เกี่ยวข้องกับไฟล์ที่ถูกลบแล้ว

---

## ข้อมูลเพิ่มเติม

### Environment Variables ที่ใช้
- `NEXT_PUBLIC_RESPONSE_ENCRYPT_KEY`
- `NEXT_PUBLIC_RESPONSE_ENCRYPT_KEY2`
- `NEXT_PUBLIC_RESPONSE_ENCRYPT_KEY_IV`
- `NEXT_PUBLIC_GG_MAPS`
- `TPA_ACCESS_TOKEN` (ยังไม่ได้ใช้งาน)
- `TPA_JWT_COOKIE` (ยังไม่ได้ใช้งาน)

### วิธีการตรวจสอบ
1. อ่านไฟล์จากรายการใน CWE-798:UseofHard-coded.md
2. ค้นหา hard-coded secrets ด้วย regex patterns:
   - `password.*=.*["'][^$]`
   - `api[_-]?key.*=.*["'][A-Za-z0-9]{20,}`
   - `secret.*=.*["'][A-Za-z0-9]{10,}`
   - `token.*=.*["'][A-Za-z0-9]{20,}`
   - `eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}` (JWT tokens)
3. ตรวจสอบว่ามีการใช้ environment variables หรือไม่

---

## ผู้ตรวจสอบ
- AI Code Auditor
- Date: 29 October 2025
- Tool: Static Code Analysis

---

## การติดตามผล (Follow-up Actions)

- [ ] แก้ไข hard-coded secrets ใน webservice/route.ts
- [ ] Revoke JWT tokens ที่ถูก expose
- [ ] สร้าง tokens ใหม่และเก็บใน environment variables
- [ ] ตรวจสอบ git history สำหรับไฟล์ที่ถูกลบ
- [ ] อัพเดทเอกสาร security audit
- [ ] Run security scan อีกครั้งหลังแก้ไข

