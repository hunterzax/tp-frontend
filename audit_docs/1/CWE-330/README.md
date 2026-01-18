# CWE-330: Use of Insufficiently Random Values - Audit Report

## Overview
ตรวจสอบและแก้ไขปัญหาการใช้ Cryptographically weak PRNG (Pseudo-Random Number Generator) ในโปรเจค TPA-FRONT-END

## วันที่ตรวจสอบ
**29 ตุลาคม 2025**

## สถานะ
✅ **COMPLETED** - แก้ไขครบทุกจุดที่มีปัญหา

## จำนวนปัญหาที่พบ
- **ทั้งหมด**: 13 issues
- **ไฟล์ที่ได้รับการแก้ไข**: 7 ไฟล์
- **ไฟล์ที่ไม่พบ/ถูกลบแล้ว**: 3 รายการ (mockData.tsx, modalHistory.tsx)

## รายละเอียดการแก้ไข

### วิธีการแก้ไข
แทนที่ `Math.random()` ด้วย `crypto.getRandomValues()` ซึ่งเป็น Web Crypto API ที่ให้ความปลอดภัยทางการเข้ารหัสสูงกว่า

**ฟังก์ชัน Helper ที่ใช้:**
```javascript
// สำหรับสร้างตัวเลขสุ่มระหว่าง 0-1
const getSecureRandom = () => {
    return crypto.getRandomValues(new Uint32Array(1))[0] / (0xffffffff + 1);
};

// สำหรับสร้าง index สุ่ม
const randomIndex = crypto.getRandomValues(new Uint32Array(1))[0] % arrayLength;
```

## รายการไฟล์ที่แก้ไข

### 1. ✅ `/src/components/library/localCaptcha/localCapcha.tsx`
- **CID**: 41803, 42291
- **จำนวนจุดที่แก้**: 2 functions
- **รายละเอียด**:
  - แก้ `generateRandomLetter()` - สร้างตัวอักษรสุ่มสำหรับ CAPTCHA
  - แก้ `drawCaptcha()` - สร้างสีและตำแหน่งสุ่มสำหรับวาด CAPTCHA บน canvas
- **วิธีแก้**: สร้างฟังก์ชัน `getSecureRandom()` และแทนที่ `Math.random()` ทั้งหมด

### 2. ✅ `/src/utils/randomColor.ts`
- **CID**: 41944
- **จำนวนจุดที่แก้**: 1 function
- **รายละเอียด**: แก้ `getRandomColor()` - สร้างสีแบบ hex random
- **วิธีแก้**: ใช้ `crypto.getRandomValues()` สำหรับสุ่ม index ของอักษร hex

### 3. ✅ `/src/utils/generalFormatter.ts`
- **CID**: 42066, 42287, 42400, 6633
- **จำนวนจุดที่แก้**: 4 functions
- **รายละเอียด**:
  - แก้ `getRandomColor()` (line 58)
  - แก้ `getRandomColorForGroupInChart()` (lines 67, 70)
  - แก้ `generateRandomId()` (line 6074)
- **วิธีแก้**: แทนที่ทุกจุดที่ใช้ `Math.random()` ด้วย `crypto.getRandomValues()`

### 4. ✅ `/src/components/material_custom/ChartSkeleton.tsx`
- **CID**: 42098
- **จำนวนจุดที่แก้**: 1 function
- **รายละเอียด**: แก้การสร้างความสูงสุ่มของ skeleton bars
- **วิธีแก้**: ใช้ `crypto.getRandomValues()` สำหรับคำนวณความสูงแบบสุ่ม

### 5. ✅ `/src/app/[lng]/authorization/(menu)/nominations/(menu)/weeklyManagement/nomCodeView/nomCodeView.tsx`
- **CID**: 41848
- **จำนวนจุดที่แก้**: 1 function
- **รายละเอียด**: แก้การสร้าง ID สุ่มสำหรับ zone buttons
- **วิธีแก้**: ใช้ `crypto.getRandomValues()` แทน `Math.random()` ในการสร้าง ID

### 6. ✅ `/src/app/[lng]/authorization/(menu)/nominations/(menu)/dailyManagement/nomCodeView/nomCodeView.tsx`
- **CID**: (เพิ่มเติม - พบระหว่างการตรวจสอบ)
- **จำนวนจุดที่แก้**: 1 function
- **รายละเอียด**: แก้การสร้าง ID สุ่มสำหรับ zone buttons (เหมือนไฟล์ที่ 5)
- **วิธีแก้**: ใช้ `crypto.getRandomValues()` แทน `Math.random()` ในการสร้าง ID

### 7. ✅ `/src/app/[lng]/authorization/(menu)/dam/(menu)/parameters/(menu)/masterData/(menu)/configMasterPath/form/flow.tsx`
- **CID**: 41943
- **จำนวนจุดที่แก้**: 1 function
- **รายละเอียด**: แก้การสร้างตำแหน่งสุ่มของ node ใน flow diagram
- **วิธีแก้**: ใช้ `crypto.getRandomValues()` สำหรับสุ่มตำแหน่ง x, y

## รายการที่ไม่พบ/ไม่จำเป็นต้องแก้

### ❌ `/src/app/[ing]/authorization/(menu)/balancing/(menu)/intradayBaseinventory/form/mockData.tsx`
- **CID**: 42133
- **สถานะ**: ไม่พบไฟล์ (อาจถูกลบหรือ rename แล้ว)
- **หมายเหตุ**: Path มี typo `[ing]` แทน `[lng]`

### ❌ `/src/app/[lng]/authorization/(menu)/balancing/(menu)/intradayBaseInventory/form/mockData.tsx`
- **CID**: 42284
- **สถานะ**: ไม่พบไฟล์ (อาจถูกลบหรือ rename แล้ว)

### ❌ `/src/app/[lng]/authorization/(menu)/booking/(menu)/pathManagement/form/modalHistory.tsx`
- **CID**: 42523
- **สถานะ**: ไฟล์มีอยู่แต่ไม่พบการใช้ `Math.random()` (อาจถูกแก้ไขไปแล้วก่อนหน้า)

## การทดสอบหลังแก้ไข

✅ **ผลการตรวจสอบ**: ไม่พบ `Math.random()` เหลืออยู่ในโค้ดแล้ว

```bash
# คำสั่งตรวจสอบ
grep -r "Math.random()" src/
# ผลลัพธ์: No matches found
```

## ข้อแนะนำเพิ่มเติม

### การใช้ Crypto API ในสภาพแวดล้อมต่าง ๆ

1. **Browser Environment**: `crypto.getRandomValues()` รองรับในทุก modern browsers
2. **Node.js Environment**: ใช้ `crypto.randomBytes()` หรือ `crypto.getRandomValues()` (Node.js v15+)
3. **React Native**: อาจต้องใช้ polyfill เช่น `react-native-get-random-values`

### Best Practices

1. ✅ ใช้ `crypto.getRandomValues()` สำหรับ:
   - Session tokens
   - CAPTCHA generation
   - Unique IDs
   - CSRF tokens
   - API keys

2. ⚠️ `Math.random()` ยังใช้ได้สำหรับ:
   - Animation timing (ไม่เกี่ยวกับความปลอดภัย)
   - UI effects (ที่ไม่มีผลต่อการรักษาความปลอดภัย)
   - Mock data ในการ test (development only)

3. ❌ **อย่าใช้** `Math.random()` สำหรับ:
   - การสร้าง tokens
   - การเข้ารหัส
   - การพิสูจน์ตัวตน
   - ข้อมูลที่เกี่ยวกับความปลอดภัย

## สรุป

การแก้ไขปัญหา CWE-330 นี้ช่วยเพิ่มความปลอดภัยของระบบโดย:
- ป้องกันการคาดเดาค่าที่สร้างขึ้นมาได้ง่าย
- เพิ่มความแข็งแกร่งของ CAPTCHA
- สร้าง IDs และ tokens ที่มีความสุ่มสูงกว่า

**Impact Level**: Medium to High
- CAPTCHA มีความปลอดภัยมากขึ้น ยากต่อการ brute force
- ID generation มีความ unique สูงขึ้น ลด collision
- รองรับมาตรฐาน security best practices

---

**ผู้ตรวจสอบ**: AI Assistant (Claude Sonnet 4.5)  
**วันที่**: 29 ตุลาคม 2025  
**สถานะ**: ✅ COMPLETED

