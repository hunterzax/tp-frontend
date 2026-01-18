# ตัวอย่างการแก้ไข NULL Pointer Issues

## ไฟล์ที่ควรแก้ไขก่อน (Priority High)

### 1. `/src/utils/generalFormatter.ts` (19 issues)

#### CID 41835 - Line 182
```typescript
// ❌ ก่อนแก้
export const calDatePeriod = (date: any, period: any, type: any, mode: any, term_type?: any) => {
    const parsedDate = toDayjs(date, format);
    return parsedDate.subtract(period, 'year').format('DD/MM/YYYY'); // parsedDate อาจเป็น invalid
}

// ✅ หลังแก้
export const calDatePeriod = (date: any, period: any, type: any, mode: any, term_type?: any) => {
    const parsedDate = toDayjs(date, format);
    
    // ตรวจสอบว่า parsedDate valid หรือไม่
    if (!parsedDate || !parsedDate.isValid()) {
        return null; // หรือค่า default ที่เหมาะสม
    }
    
    return parsedDate.subtract(period, 'year').format('DD/MM/YYYY');
}
```

#### CID 41838 - Line 193
```typescript
// ✅ เพิ่มการตรวจสอบทั้งหมดในฟังก์ชัน
export const calDatePeriod = (date: any, period: any, type: any, mode: any, term_type?: any) => {
    // Validate inputs
    if (!date) return null;
    if (period === null || period === undefined) return null;
    
    const format = "DD/MM/YYYY";
    const parsedDate = toDayjs(date, format);
    
    if (!parsedDate?.isValid()) {
        return null;
    }
    
    if (mode === 'end_date') {
        if (type === 'year') {
            return parsedDate.subtract(period, 'year').format('DD/MM/YYYY');
        } else if (type === 'month') {
            return parsedDate.subtract(period, 'month').format('DD/MM/YYYY');
        }
    }
    
    return parsedDate.format('DD/MM/YYYY');
}
```

---

### 2. `/src/components/layout/NavMenu.tsx` (3 issues)

#### CID 41908 - Line 149
```typescript
// ❌ ก่อนแก้
<div className={`... ${isHightLight(item.url) && "!text-[#000000]"}`}>
    {item?.name || "-"}
</div>

// ✅ หลังแก้
<div className={`... ${item?.url && isHightLight(item.url) && "!text-[#000000]"}`}>
    {item?.name || "-"}
</div>
```

#### CID 41908, 42012, 42196 - Lines 138, 149, 151
```typescript
// ✅ แก้ไขทั้งส่วน
{items?.map((item, index) => {
    // ตรวจสอบ item ก่อนใช้งาน
    if (!item) return null;
    
    return (
        <li key={index} onClick={() => {
            if (item.sub?.length > 0) {
                toggleMenuXX(item.url || '');
            } else if (item.url) {
                // เก็บข้อมูลและ navigate
                localStorage.setItem("k3a9r2b6m7t0x5w1s8j", encryptData(item));
                router.push("/en/authorization/" + item.url);
            }
        }}>
            <section className="flex items-center gap-2 py-1">
                {(toggleNav && item?.icon) || null}
                {toggleNav ? (
                    <h1 className={`break-words whitespace-normal text-[#757575] ${level === 0 ? "text-[14px]" : "text-[12px]"}`}>
                        <div className={`flex justify-center items-center px-2 h-[26px] text-[#757575] ${(item?.url && isHightLight(item.url) || isMenuExpanded) && "!text-[#000000]"} ${level === 0 ? "text-[14px]" : "text-[12px]"}`}>
                            {item?.name || "-"}
                        </div>
                    </h1>
                ) : null}
            </section>
        </li>
    );
})}
```

---

### 3. `/src/components/table/AppTable.tsx` (3 issues)

#### CID 41904 - Line 289
```typescript
// ❌ ก่อนแก้
className={`... ${index == 0 ? 'rounded-tl-md' : (headerGroup?.headers?.length - 1 == index) && 'rounded-tr-md'}`}

// ✅ หลังแก้
className={`... ${index == 0 ? 'rounded-tl-md' : (headerGroup?.headers && headerGroup.headers.length - 1 === index) && 'rounded-tr-md'}`}
```

#### CID 42113 - Line 322
```typescript
// ❌ ก่อนแก้
{table?.getAllLeafColumns()?.map((column) => {
    return (
        <div key={column.id}>
            <input
                checked={column?.getIsVisible()}
                onChange={column?.getToggleVisibilityHandler()}
            />
        </div>
    )
})}

// ✅ หลังแก้
{table?.getAllLeafColumns()?.map((column) => {
    if (!column) return null;
    
    return (
        <div key={column.id}>
            <input
                checked={column?.getIsVisible?.() ?? false}
                onChange={column?.getToggleVisibilityHandler?.() ?? (() => {})}
            />
        </div>
    )
})}
```

---

### 4. `/src/utils/transformHistoryData.tsx` (5 issues)

#### CID 42512 - Line 39
```typescript
// ❌ ก่อนแก้
case 'updated_by':
    filteredItem[key] = item.update_by_account
        ? `${item.update_by_account.first_name} ${item.update_by_account.last_name} ${formatDateTimeSec(item?.update_date) || ''}`
        : null;
    break;

// ✅ หลังแก้
case 'updated_by':
    if (item?.update_by_account) {
        const firstName = item.update_by_account.first_name ?? '';
        const lastName = item.update_by_account.last_name ?? '';
        const updateDate = item.update_date ? formatDateTimeSec(item.update_date) : '';
        filteredItem[key] = `${firstName} ${lastName} ${updateDate}`.trim();
    } else {
        filteredItem[key] = null;
    }
    break;
```

#### CID 41959, 42030 - Lines 96, 140
```typescript
// ✅ แก้ไขทั้งฟังก์ชัน
export const transformData = (dataMain: any, column?: any) => {
    if (!dataMain || !Array.isArray(dataMain)) {
        return [];
    }
    
    return dataMain.map((item: any) => {
        if (!item) return {};
        
        const filteredItem: any = {};
        
        column?.forEach((col: any) => {
            if (!col?.key) return;
            
            const key = col.key;
            
            if (key in item) {
                switch (key) {
                    case 'start_date':
                        filteredItem[key] = item?.start_date ? formatDateNoTime(item.start_date) : null;
                        break;
                    case 'end_date':
                        filteredItem[key] = item?.end_date ? formatDateNoTime(item.end_date) : null;
                        break;
                    case 'updated_by':
                        if (item?.update_by_account) {
                            const firstName = item.update_by_account?.first_name ?? '';
                            const lastName = item.update_by_account?.last_name ?? '';
                            const updateDate = item.update_date ? formatDateTimeSec(item.update_date) : '';
                            filteredItem[key] = `${firstName} ${lastName} ${updateDate}`.trim();
                        } else {
                            filteredItem[key] = null;
                        }
                        break;
                    default:
                        filteredItem[key] = item[key];
                }
            }
        });

        return filteredItem;
    });
};
```

---

### 5. `/src/components/other/confirmModal.tsx` (1 issue)

#### CID 42137 - Line 33
```typescript
// ❌ ก่อนแก้
const ConfirmModal: React.FC<ModalComponentProps> = ({ 
    open, 
    handleClose, 
    handleConfirm, 
    title, 
    description, 
    stat = "success", 
    btnText = "ok" 
}) => {
    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={style}>
                {/* content */}
            </Box>
        </Modal>
    );
};

// ✅ หลังแก้
const ConfirmModal: React.FC<ModalComponentProps> = ({ 
    open, 
    handleClose, 
    handleConfirm, 
    title, 
    description, 
    stat = "success", 
    btnText = "ok" 
}) => {
    // Validate required props
    if (!handleClose || !handleConfirm) {
        console.error('ConfirmModal: handleClose and handleConfirm are required');
        return null;
    }
    
    return (
        <Modal 
            open={open ?? false} 
            onClose={handleClose}
        >
            <Box sx={style}>
                <h2>{title ?? 'Confirmation'}</h2>
                <p>{description ?? 'Are you sure?'}</p>
                <button onClick={handleConfirm}>
                    {btnText}
                </button>
            </Box>
        </Modal>
    );
};
```

---

## Pattern การแก้ไขทั่วไป

### Pattern 1: Array Access
```typescript
// ❌ ก่อน
const firstItem = array[0];

// ✅ หลัง
const firstItem = array?.[0];
// หรือ
const firstItem = Array.isArray(array) && array.length > 0 ? array[0] : null;
```

### Pattern 2: Object Property Access
```typescript
// ❌ ก่อน
const name = user.profile.name;

// ✅ หลัง
const name = user?.profile?.name;
// หรือ
const name = user?.profile?.name ?? 'Unknown';
```

### Pattern 3: Method Call
```typescript
// ❌ ก่อน
const result = data.map(item => item.value);

// ✅ หลัง
const result = data?.map(item => item?.value) ?? [];
```

### Pattern 4: Function Call with Null Check
```typescript
// ❌ ก่อน
onClick={column.getToggleVisibilityHandler()}

// ✅ หลัง
onClick={column?.getToggleVisibilityHandler?.() ?? (() => {})}
```

### Pattern 5: Conditional Rendering
```typescript
// ❌ ก่อน
{items.map(item => <div>{item.name}</div>)}

// ✅ หลัง
{items?.map(item => item ? <div>{item?.name}</div> : null) ?? null}
```

### Pattern 6: String Concatenation
```typescript
// ❌ ก่อน
const fullName = user.firstName + ' ' + user.lastName;

// ✅ หลัง
const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();
```

### Pattern 7: Nested Array/Object Operations
```typescript
// ❌ ก่อน
const total = data.reduce((sum, item) => sum + item.value, 0);

// ✅ หลัง
const total = data?.reduce((sum, item) => sum + (item?.value ?? 0), 0) ?? 0;
```

---

## Automated Fix Script (ระวัง: ต้อง Review ก่อนใช้)

```bash
# ค้นหาและแสดง patterns ที่อาจมีปัญหา
grep -r "\.map(" src/ --include="*.tsx" --include="*.ts" | grep -v "?."
grep -r "\[0\]" src/ --include="*.tsx" --include="*.ts" | grep -v "?."
```

---

## Checklist การแก้ไข

### ก่อนแก้ไข
- [ ] Backup code ปัจจุบัน
- [ ] สร้าง branch ใหม่สำหรับแก้ไข
- [ ] อ่าน context ของ code ที่จะแก้
- [ ] ทำความเข้าใจ business logic

### ขณะแก้ไข
- [ ] ใช้ optional chaining (?.) เมื่อเหมาะสม
- [ ] ใช้ nullish coalescing (??) สำหรับ default values
- [ ] เพิ่ม null checks สำหรับ critical paths
- [ ] เพิ่ม type annotations ถ้าเป็นไปได้

### หลังแก้ไข
- [ ] Test ฟังก์ชันที่แก้ไข
- [ ] ตรวจสอบว่าไม่มี regression bugs
- [ ] Run linter และ type checker
- [ ] Code review กับทีม
- [ ] Update documentation ถ้าจำเป็น

---

## สรุป

การแก้ไข NULL Pointer Issues ต้องทำอย่างระมัดระวัง:

1. **อ่าน Context**: เข้าใจ business logic ก่อนแก้ไข
2. **Test Thoroughly**: ทดสอบทุก edge case
3. **Review Carefully**: ให้ทีม review code
4. **Document Changes**: บันทึกการเปลี่ยนแปลงสำคัญ

**หมายเหตุ**: ไม่ควรใช้ automated fix scripts โดยไม่มีการ review เพราะอาจทำให้เกิด bugs ใหม่

