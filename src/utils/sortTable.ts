import dayjs from "dayjs";

export const sortTableData = (data: any, columnKey: any, direction = 'asc') => {
    return [...data].sort((a, b) => {
        if (a[columnKey] < b[columnKey]) {
            return direction === 'asc' ? -1 : 1;
        }
        if (a[columnKey] > b[columnKey]) {
            return direction === 'asc' ? 1 : -1;
        }
        return 0;
    });
};

export const handleSortGasDay = (
    column: string,
    sortState: any,
    setSortState: any,
    setSortedData: any,
    tableData: any[]
) => {
    let direction: 'asc' | 'desc' | null = 'asc';

    if (sortState.column === column) {
        direction = sortState.direction === 'asc' ? 'desc' : sortState.direction === 'desc' ? null : 'asc';
    }
    setSortState({ column, direction });

    if (!direction) {
        setSortedData(tableData);
        return;
    }

    const sorted = [...tableData].sort((a, b) => {
        const aDate = dayjs(a.gas_day, 'DD/MM/YYYY');
        const bDate = dayjs(b.gas_day, 'DD/MM/YYYY');

        if (!aDate.isValid()) return direction === 'asc' ? -1 : 1;
        if (!bDate.isValid()) return direction === 'asc' ? 1 : -1;

        return direction === 'asc' ? aDate.diff(bDate) : bDate.diff(aDate);
    });

    setSortedData(sorted);
};

export const handleSortFatherModify = (
    column: string,
    parent: string,
    tableData: any[],
    index: any,
) => {

    const startKey = 7;
    tableData.forEach((row, rowIndex) => {
        Object.entries(row).forEach(([key, value]) => {
            if (!isNaN(Number(key)) && Number(key) >= startKey) {
                // ทำ logic ที่คุณต้องการกับ key >= 7 ที่นี่
            }
        });
    });
}


// ช่วยให้ค่าที่จะเอาไป sort สะอาดขึ้น (trim + ตัดคอมม่า + แปลงเป็น number ถ้าเป็นตัวเลข)
const normalizeForSort = (val: any) => {
    if (val == null) return val;

    // ถ้าเป็น array เอาตัวแรก (คงพฤติกรรมเดิมของคุณ)
    if (Array.isArray(val)) val = val[0];

    if (typeof val === 'string') {
        const trimmed = val.trim();
        // ตัดคอมม่าออก เพื่อ parse เป็นตัวเลขได้
        const numericCandidate = trimmed.replace(/,/g, '');
        // ถ้าเป็นตัวเลขจริง ให้แปลงเป็น number
        if (numericCandidate !== '' && !isNaN(Number(numericCandidate))) {
            return Number(numericCandidate);
        }
        return trimmed; // ไม่ใช่ตัวเลข ให้คืนเป็นสตริงที่ trim แล้ว
    }

    return val; // number / boolean / object อื่น ๆ คงเดิม
};

export const handleSort = (
    column: string,
    sortState: any,
    setSortState: any,
    setSortedData: any,
    tableData: any[]
) => {

    const getNestedValue = (obj: any, path: string) => {
        return path.split('.').reduce((acc, key) => {
            if (Array.isArray(acc)) {
                return acc.map(item => item?.[key]).filter(value => value !== undefined);
            }
            return acc?.[key];
        }, obj);
    };

    const isDataColumn = column.startsWith("data.");
    // const isDataColumn = column.includes(".");
    let direction: 'asc' | 'desc' | null = 'asc';

    if (sortState.column === column) {
        direction = sortState.direction === 'asc' ? 'desc' : sortState.direction === 'desc' ? null : 'asc';
    }

    setSortState({ column, direction });

    if (!direction || direction == null) {
        // setSortedData([...tableData]);
        setSortedData(tableData);
        return;
    }

    if (isDataColumn) {
        const field = column.replace(/^data\./, '');

        const sorted: any = tableData.map((group: any) => {
            const sortedData = [...(group.data || [])].sort((a, b) => {
                const aValue = getNestedValue(a, field);
                const bValue = getNestedValue(b, field);

                const getFirstValue = (val: any) => (Array.isArray(val) ? val[0] : val);
                // const aVal = getFirstValue(aValue);
                // const bVal = getFirstValue(bValue);

                const aVal = normalizeForSort(getFirstValue(aValue));
                const bVal = normalizeForSort(getFirstValue(bValue));


                if (aVal == null) return direction === 'asc' ? -1 : 1;
                if (bVal == null) return direction === 'asc' ? 1 : -1;

                const aDate = new Date(aVal);
                const bDate = new Date(bVal);

                if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
                    return direction === 'asc' ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
                }

                if (!isNaN(aVal) && !isNaN(bVal)) {
                    return direction === 'asc' ? aVal - bVal : bVal - aVal;
                }

                return direction === 'asc'
                    ? String(aVal).localeCompare(String(bVal), undefined, { sensitivity: 'base' })
                    : String(bVal).localeCompare(String(aVal), undefined, { sensitivity: 'base' });
            });

            return { ...group, data: sortedData };
        });

        setSortedData(sorted);
    } else {
        // เพิ่มมา check case กรณี ข้อมูลทั้งหมดเป็น null
        const allNull = tableData.every(row => {
            const val = getNestedValue(row, column);
            const firstVal = Array.isArray(val) ? val[0] : val;
            return firstVal == null;
        });

        const sorted = allNull
            ? tableData // do nothing, return original
            : [...tableData].sort((a, b) => {
                const aValue = getNestedValue(a, column);
                const bValue = getNestedValue(b, column);

                const getFirstValue = (val: any) => (Array.isArray(val) ? val[0] : val);
                // const aVal = getFirstValue(aValue);
                // const bVal = getFirstValue(bValue);

                const aVal = normalizeForSort(getFirstValue(aValue));
                const bVal = normalizeForSort(getFirstValue(bValue));

                const aDay = dayjs(aVal, 'DD/MM/YYYY');
                const bDay = dayjs(bVal, 'DD/MM/YYYY');

                if (aDay.isValid() && bDay.isValid()) {
                    return direction === 'asc' ? aDay.diff(bDay) : bDay.diff(aDay);
                }

                if (aVal == null) return direction === 'asc' ? -1 : 1;
                if (bVal == null) return direction === 'asc' ? 1 : -1;

                // Check if both aVal and bVal are valid numbers (e.g., 123, 45.67)
                if (!isNaN(aVal) && !isNaN(bVal)) {
                    return direction === 'asc' ? aVal - bVal : bVal - aVal;
                }

                // Default string comparison (handling non-date strings)
                return direction === 'asc'
                    ? String(aVal).localeCompare(String(bVal), undefined, { sensitivity: 'base' })
                    : String(bVal).localeCompare(String(aVal), undefined, { sensitivity: 'base' });

            });

        setSortedData(sorted);
    }
};


// export const handleSortBalReport = (
//     column: string,
//     sortState: { column: string | null; direction: 'asc' | 'desc' | null },
//     setSortState: (s: any) => void,
//     setSortedData: (d: any[]) => void,
//     tableData: any[]
// ) => {
//     // === helper: อ่านค่าได้ทั้ง path ปกติ และ values.tag === column ===
//     // const getValue = (row: any, key: string) => {
//     //     // 1) ถ้า key อยู่ใน values[].tag → คืนค่า value
//     //     if (Array.isArray(row?.values)) {
//     //         const hit = row.values.find((v: any) => v?.tag === key);
//     //         if (hit) return hit.value ?? null;
//     //     }

//     //     // 2) รองรับ path ปกติ (เช่น "gas_day" หรือ "foo.bar")
//     //     return key.split('.').reduce((acc: any, k: string) => (acc == null ? acc : acc[k]), row);
//     // };

//     // ดึงค่าจากแถว รองรับ 3 เคสหลัก: values[].tag, shipper_data.shipper, และ path ปกติ
//     const getValue = (row: any, key: string) => {
//         // 1) จาก values[].tag
//         if (Array.isArray(row?.values)) {
//             const hit = row.values.find((v: any) => v?.tag === key);
//             if (hit) return hit.value ?? null;
//         }

//         // 2) จาก shipper_data.shipper → คืนค่าเป็น array ของ string
//         if (key === "shipper_data.shipper") {
//             const arr = Array.isArray(row?.shipper_data) ? row.shipper_data : [];
//             const ships = arr
//                 .map((s: any) => s?.shipper)
//                 .filter((s: any) => s != null);
//             return ships.length ? ships : null;
//         }

//         // 3) path ปกติ (รองรับ index ตัวเลขใน path ด้วย เช่น "shipper_data.0.shipper")
//         return key.split(".").reduce((acc: any, part: string) => {
//             if (acc == null) return acc;
//             if (Array.isArray(acc) && /^\d+$/.test(part)) {
//                 const idx = Number(part);
//                 return acc[idx];
//             }
//             return acc?.[part];
//         }, row);
//     };

//     // === ควบคุมทิศทางการ sort (วน asc → desc → null) ===
//     let direction: 'asc' | 'desc' | null = 'asc';
//     if (sortState.column === column) {
//         direction = sortState.direction === 'asc' ? 'desc' : sortState.direction === 'desc' ? null : 'asc';
//     }
//     setSortState({ column, direction });

//     // reset กลับข้อมูลเดิมเมื่อ direction เป็น null
//     if (!direction) {
//         setSortedData(tableData);
//         return;
//     }

//     // === ตรวจว่าทุกแถวเป็น null ทั้งหมดไหม ถ้าใช่ ไม่ต้อง sort ===
//     const allNull = tableData.every((row) => {
//         const v = getValue(row, column);
//         return v == null;
//     });

//     if (allNull) {
//         setSortedData(tableData);
//         return;
//     }

//     // === เปรียบเทียบค่า (รองรับ date, number, string) ===
//     const cmp = (a: any, b: any) => {
//         const av = getValue(a, column);
//         const bv = getValue(b, column);

//         // null มาก่อนเวลา asc
//         if (av == null && bv == null) return 0;
//         if (av == null) return direction === 'asc' ? -1 : 1;
//         if (bv == null) return direction === 'asc' ? 1 : -1;

//         // date (ลอง parse ทั้งแบบ DD/MM/YYYY และ ISO)
//         const aDay = dayjs(av, 'DD/MM/YYYY', true);
//         const bDay = dayjs(bv, 'DD/MM/YYYY', true);
//         const aIso = dayjs(av);
//         const bIso = dayjs(bv);

//         const isDate =
//             (aDay.isValid() && bDay.isValid()) ||
//             (aIso.isValid() && bIso.isValid());

//         if (isDate) {
//             const aTime = aDay.isValid() ? aDay.valueOf() : aIso.valueOf();
//             const bTime = bDay.isValid() ? bDay.valueOf() : bIso.valueOf();
//             return direction === 'asc' ? aTime - bTime : bTime - aTime;
//         }

//         // number
//         const aNum = typeof av === 'string' ? Number(av) : av;
//         const bNum = typeof bv === 'string' ? Number(bv) : bv;
//         const bothNumber = !Number.isNaN(aNum as number) && !Number.isNaN(bNum as number);

//         if (bothNumber) {
//             return direction === 'asc' ? (aNum as number) - (bNum as number) : (bNum as number) - (aNum as number);
//         }

//         // string
//         const aStr = String(av);
//         const bStr = String(bv);
//         return direction === 'asc'
//             ? aStr.localeCompare(bStr, undefined, { sensitivity: 'base' })
//             : bStr.localeCompare(aStr, undefined, { sensitivity: 'base' });
//     };

//     const sorted = [...tableData].sort((a, b) => {
//         const res = cmp(a, b);
//         if (res !== 0) return res;

//         // tie-breaker: ถ้าค่าคอลัมน์เท่ากัน ให้เรียงตาม gas_day (ล่าสุดท้าย)
//         const aGas = dayjs(a?.gas_day);
//         const bGas = dayjs(b?.gas_day);
//         if (aGas.isValid() && bGas.isValid()) {
//             return direction === 'asc' ? aGas.valueOf() - bGas.valueOf() : bGas.valueOf() - aGas.valueOf();
//         }
//         return 0;
//     });

//     setSortedData(sorted);
// };


type SortDir = 'asc' | 'desc' | null;

export const handleSortBalReport = (
    column: string,
    sortState: { column: string | null; direction: SortDir },
    setSortState: (s: any) => void,
    setSortedData: (d: any[]) => void,
    tableData: any[],
    shipperGroupData?: any[],
) => {

    // ===== helpers =====
    const isEmptyVal = (v: any) => v == null || (Array.isArray(v) && v.length === 0);

    // รวม contract ทั้งหมดจากทุก shipper ภายในแถวเดียว
    const collectContracts = (row: any) => {
        if (!Array.isArray(row?.shipper_data)) return [];
        const out: string[] = [];
        for (const sh of row.shipper_data) {
            if (!Array.isArray(sh?.contract_data)) continue;
            for (const c of sh.contract_data) {
                if (c?.contract != null) out.push(String(c.contract));
            }
        }
        return out;
    };

    // คืนค่าเพื่อใช้เป็นคีย์ sort รองรับ:
    // 1) values[].tag === column
    // 2) shipper_data.shipper  -> array ของ shipper
    // 3) shipper_data.contract_data.contract -> array ของ contract (ใหม่)
    // 4) path ปกติ (รองรับ index)
    const getValue = (row: any, key: string) => {
        // 1) จาก values[].tag
        if (Array.isArray(row?.values)) {
            const hit = row.values.find((v: any) => v?.tag === key);
            if (hit) return hit.value ?? null;
        }

        // 2) จาก shipper_data.shipper
        if (key === "shipper_data.shipper") {
            const arr = Array.isArray(row?.shipper_data) ? row.shipper_data : [];
            const ships = arr.map((s: any) => s?.shipper).filter((s: any) => s != null);

            // add new
            if (shipperGroupData && shipperGroupData?.length > 0) {
                const shipsResult = ships?.map((item: any) => {
                    const itemships = shipperGroupData?.find((items: any) => items?.id_name == item)?.name || null
                    return { name: itemships, id_name: item }
                })

                return shipsResult
            }
            return ships.length ? ships : null;
        }

        // 3) จาก shipper_data.contract_data.contract  (ใหม่)
        if (key === "shipper_data.contract_data.contract") {
            const contracts = collectContracts(row);
            return contracts.length ? contracts : null;
        }

        // 4) path ปกติ
        return key.split(".").reduce((acc: any, part: string) => {
            if (acc == null) return acc;
            if (Array.isArray(acc) && /^\d+$/.test(part)) {
                const idx = Number(part);
                return acc[idx];
            }
            return acc?.[part];
        }, row);
    };

    // วนสถานะทิศทาง asc → desc → clear
    let direction: SortDir = 'asc';
    if (sortState.column === column) {
        direction = sortState.direction === 'asc' ? 'desc'
            : sortState.direction === 'desc' ? null
                : 'asc';
    }
    setSortState({ column, direction });

    if (!direction) {
        setSortedData(tableData);
        return;
    }

    // ทุกแถวเป็น null/ว่าง? (ไม่ต้อง sort)
    const allNull = tableData.every((row) => isEmptyVal(getValue(row, column)));
    if (allNull) {
        setSortedData(tableData);
        return;
    }

    // แปลง array → string เพื่อเทียบง่าย (รักษาลำดับเดิม)
    const normalizeForCompare = (v: any) => {
        if (Array.isArray(v)) {
            return v.map((x) => (x == null ? "" : String(x))).join(" | ");
        }
        return v;
    };

    // แปลง array → string เพื่อเทียบง่าย (ไม่รักษาลำดับเดิม)
    const normalizeForCompareX = (v: any) => {
        if (Array.isArray(v)) {
            return v
                .map((x) => (x == null ? "" : String(x)))
                .sort((a, b) => a.localeCompare(b)) // 🔹 เพิ่มบรรทัดนี้
                .join(" | ");
        }
        return v;
    };

    const cmp = (aRow: any, bRow: any) => {
        let av: any = getValue(aRow, column);
        let bv: any = getValue(bRow, column);

        const aEmpty = isEmptyVal(av);
        const bEmpty = isEmptyVal(bv);
        if (aEmpty && bEmpty) return 0;
        if (aEmpty) return direction === 'asc' ? -1 : 1;
        if (bEmpty) return direction === 'asc' ? 1 : -1;

        if (av?.length > 0 || bv?.length > 0) {
            const transfer = tableData;  // ข้อมูลหลักที่ต้องการจัดการ
            if (column == 'shipper_data.shipper') {
                const nameToIdMap: any = {};  // สร้างแผนที่ของชื่อและ id_name
                av.forEach((item: any) => {
                    nameToIdMap[item.name] = item.id_name;
                });

                // Sort shipper_data โดยอิงจาก name
                transfer?.forEach((data) => {
                    // ทำการ sort shipper_data โดยใช้ name จาก av
                    data?.shipper_data.sort((a: any, b: any) => {
                        const nameA = av.find((item: any) => item.id_name === a.shipper)?.name;
                        const nameB = av.find((item: any) => item.id_name === b.shipper)?.name;

                        // ตรวจสอบว่าพบชื่อแล้วหรือไม่
                        if (nameA && nameB) {
                            // ถ้า direction เป็น 'asc' ให้เรียงจาก A-Z
                            if (direction === 'asc') {
                                return nameA.localeCompare(nameB);
                            }
                            // ถ้า direction เป็น 'desc' ให้เรียงจาก Z-A
                            else if (direction === 'desc') {
                                return nameB.localeCompare(nameA);
                            }
                        }
                        return 0;  // หากไม่พบชื่อ ให้ไม่ทำการ sort
                    });

                    // แปลงค่าใน shipper_data เป็น id_name แทน name
                    if (data?.shipper_data && Array.isArray(data.shipper_data)) {
                        data.shipper_data = data.shipper_data.map((item: any) => {
                            const id_name = nameToIdMap[item?.shipper];
                            if (id_name) {
                                return {
                                    ...item,
                                    shipper: id_name,  // แทนที่ด้วย id_name
                                };
                            }
                            return item;  // หากไม่พบ id_name ก็เก็บข้อมูลเดิม
                        });
                    }
                });
            } else if (column == "shipper_data.contract_data.contract") {
                transfer?.forEach((data: any) => {
                    // 1. Sort contract_data ภายในแต่ละ shipper_data
                    data.shipper_data.forEach((shipper: any) => {
                        if (Array.isArray(shipper.contract_data) && shipper.contract_data.length > 1) {
                            // สร้าง array ใหม่เพื่อความแน่นอน
                            shipper.contract_data = shipper.contract_data.slice().sort((a: any, b: any) => {
                                const contractA = (a.contract ?? '').toUpperCase();
                                const contractB = (b.contract ?? '').toUpperCase();

                                if (direction === 'asc') {
                                    return contractA.localeCompare(contractB);
                                } else {
                                    return contractB.localeCompare(contractA);
                                }
                            });
                        }
                    });

                    // 2. Sort shipper_data โดยดูจาก contract_data[0].contract
                    data.shipper_data.sort((a: any, b: any) => {
                        const contractA = (a.contract_data?.[0]?.contract ?? '').toUpperCase();
                        const contractB = (b.contract_data?.[0]?.contract ?? '').toUpperCase();

                        if (direction === 'asc') {
                            return contractA.localeCompare(contractB);
                        } else {
                            return contractB.localeCompare(contractA);
                        }
                    });
                });
            }
        }

        // av = normalizeForCompareX(av);
        // bv = normalizeForCompareX(bv);

        // date (ลอง parse ทั้งแบบ DD/MM/YYYY และ ISO)
        const aDay = dayjs(av, 'DD/MM/YYYY', true);
        const bDay = dayjs(bv, 'DD/MM/YYYY', true);
        const aIso = dayjs(av);
        const bIso = dayjs(bv);

        const isDate =
            (aDay.isValid() && bDay.isValid()) ||
            (aIso.isValid() && bIso.isValid());

        if (isDate) {
            const aTime = aDay.isValid() ? aDay.valueOf() : aIso.valueOf();
            const bTime = bDay.isValid() ? bDay.valueOf() : bIso.valueOf();
            return direction === 'asc' ? aTime - bTime : bTime - aTime;
        }

        // number
        const aNum = (typeof av === 'string' || typeof av === 'number') ? Number(av) : NaN;
        const bNum = (typeof bv === 'string' || typeof bv === 'number') ? Number(bv) : NaN;
        const bothNumber = !Number.isNaN(aNum) && !Number.isNaN(bNum);
        if (bothNumber) {
            return direction === 'asc' ? aNum - bNum : bNum - aNum;
        }

        // string
        const aStr = String(av);
        const bStr = String(bv);
        return direction === 'asc'
            ? aStr.localeCompare(bStr, undefined, { sensitivity: 'base' })
            : bStr.localeCompare(aStr, undefined, { sensitivity: 'base' });
    };

    const sorted = [...tableData].sort((a, b) => {
        const res = cmp(a, b);
        if (res !== 0) return res;

        // tie-breaker: gas_day (ถ้ามี)
        const aGas = dayjs(a?.gas_day);
        const bGas = dayjs(b?.gas_day);
        if (aGas.isValid() && bGas.isValid()) {
            return direction === 'asc' ? aGas.valueOf() - bGas.valueOf() : bGas.valueOf() - aGas.valueOf();
        }
        return 0;
    });

    setSortedData(sorted);
};

export const handleSortTimeStamp = (
    column: string,
    sortState: any,
    setSortState: any,
    setSortedData: any,
    tableData: any[]
) => {
    const getNestedValue = (obj: any, path: string) => {
        return path.split('.').reduce((acc, key) => {
            if (Array.isArray(acc)) {
                return acc.map(item => item?.[key]).filter(value => value !== undefined);
            }
            return acc?.[key];
        }, obj);
    };

    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortState.column === column) {
        direction =
            sortState.direction === 'asc'
                ? 'desc'
                : sortState.direction === 'desc'
                    ? null
                    : 'asc';
    }

    setSortState({ column, direction });

    if (!direction) {
        setSortedData(tableData);
        return;
    }

    const sorted = [...tableData].sort((a, b) => {
        let aVal = getNestedValue(a, column);
        let bVal = getNestedValue(b, column);

        // ถ้าเป็น array ให้ใช้ last index
        const getLast = (val: any) => (Array.isArray(val) ? val[val.length - 1] : val);
        aVal = getLast(aVal);
        bVal = getLast(bVal);

        // ถ้าเป็น timestamp ให้ parse ด้วย format DD/MM/YYYY HH:mm
        const aDate = dayjs(aVal, "DD/MM/YYYY HH:mm", true);
        const bDate = dayjs(bVal, "DD/MM/YYYY HH:mm", true);

        if (aDate.isValid() && bDate.isValid()) {
            return direction === 'asc' ? aDate.valueOf() - bDate.valueOf() : bDate.valueOf() - aDate.valueOf();
        }

        // ถ้าไม่ใช่ date แต่เป็นตัวเลข
        if (!isNaN(aVal) && !isNaN(bVal)) {
            return direction === 'asc' ? aVal - bVal : bVal - aVal;
        }

        // เทียบเป็น string
        return direction === 'asc'
            ? String(aVal).localeCompare(String(bVal), undefined, { sensitivity: 'base' })
            : String(bVal).localeCompare(String(aVal), undefined, { sensitivity: 'base' });
    });

    setSortedData(sorted);
};

export const handleSortTimeShow = (
    column: string,
    sortState: any,
    setSortState: any,
    setSortedData: any,
    tableData: any[]
) => {
    const getNestedValue = (obj: any, path: string) => {
        return path.split('.').reduce((acc, key) => {
            if (Array.isArray(acc)) {
                return acc.map(item => item?.[key]).filter(value => value !== undefined);
            }
            return acc?.[key];
        }, obj);
    };

    const isDataColumn = column.startsWith("data.");
    let direction: 'asc' | 'desc' | null = 'asc';

    if (sortState.column === column) {
        direction = sortState.direction === 'asc' ? 'desc' : sortState.direction === 'desc' ? null : 'asc';
    }

    setSortState({ column, direction });

    if (!direction || direction == null) {
        setSortedData(tableData);
        return;
    }

    if (isDataColumn) {
        // ... (unchanged block)
    } else if (column === "timeShow") {
        // ✅ กรณีพิเศษ: sort ตาม timeShowZero
        const sorted = [...tableData].sort((a, b) => {
            const timeZeroA = a.timeShowZero;
            const timeZeroB = b.timeShowZero;

            const valueA = a.timeShow?.find((t: any) => t.time === timeZeroA)?.value ?? null;
            const valueB = b.timeShow?.find((t: any) => t.time === timeZeroB)?.value ?? null;

            if (valueA == null) return direction === 'asc' ? -1 : 1;
            if (valueB == null) return direction === 'asc' ? 1 : -1;

            return direction === 'asc' ? valueA - valueB : valueB - valueA;
        });

        setSortedData(sorted);
    } else {
        // ✅ default sort
        const allNull = tableData.every(row => {
            const val = getNestedValue(row, column);
            const firstVal = Array.isArray(val) ? val[0] : val;
            return firstVal == null;
        });

        const sorted = allNull
            ? tableData
            : [...tableData].sort((a, b) => {
                const aValue = getNestedValue(a, column);
                const bValue = getNestedValue(b, column);

                const getFirstValue = (val: any) => (Array.isArray(val) ? val[0] : val);
                const aVal = getFirstValue(aValue);
                const bVal = getFirstValue(bValue);
                const aDay = dayjs(aVal, 'DD/MM/YYYY');
                const bDay = dayjs(bVal, 'DD/MM/YYYY');

                if (aDay.isValid() && bDay.isValid()) {
                    return direction === 'asc' ? aDay.diff(bDay) : bDay.diff(aDay);
                }

                if (aVal == null) return direction === 'asc' ? -1 : 1;
                if (bVal == null) return direction === 'asc' ? 1 : -1;

                if (!isNaN(aVal) && !isNaN(bVal)) {
                    return direction === 'asc' ? aVal - bVal : bVal - aVal;
                }

                return direction === 'asc'
                    ? String(aVal).localeCompare(String(bVal), undefined, { sensitivity: 'base' })
                    : String(bVal).localeCompare(String(aVal), undefined, { sensitivity: 'base' });
            });

        setSortedData(sorted);
    }
};

// export const handleSortMinimum2 = (
export const handleSortMinimumOldSchool = (
    column: string,
    sortState: any,
    setSortState: any,
    setSortedData: any,
    tableData: any[]
) => {
    const [_, ...rest] = column.split('_');
    const targetNomType = rest[rest.length - 1].toLowerCase();
    const typePrefix = rest.slice(0, rest.length - 1).join('_');

    // 🔧 แผนที่ชื่อคอลัมน์ไปยัง type ใน .data[]
    const typeMap: any = {
        min_invent: "Min_Inventory_Change",
        exchange_min_invent: "Exchange_Mininventory",
        // เพิ่มได้ตามต้องการ
    };

    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortState.column === column) {
        direction = sortState.direction === 'asc'
            ? 'desc'
            : sortState.direction === 'desc'
                ? null
                : 'asc';
    }

    setSortState({ column, direction });
    if (!direction || direction === null) {
        setSortedData(tableData); // reset
        return;
    }

    const getTargetValue = (weeklyGroup: any[]) => {
        for (const day of weeklyGroup || []) {
            const dayName = dayjs(day.gas_day).format("dddd").toLowerCase();
            if (dayName !== targetNomType) continue;

            // ✅ กรณี group หรือ contract_code
            if (typePrefix === "group") return day.group ?? null;
            if (typePrefix === "contract_code") return day.contract_code ?? null;

            const targetType = typeMap[typePrefix];
            if (!targetType) return null;

            const found = day.data?.find(
                (entry: any) =>
                    entry.type === targetType &&
                    entry.nomType?.toLowerCase() === targetNomType
            );
            if (found) return found.value;
        }
        return null;
    };

    const deepClone = (obj: any) => JSON.parse(JSON.stringify(obj));

    const sortByValue = (arr: any[]) => {
        return [...arr].sort((a, b) => {
            const aVal = getTargetValue(a.groupedByWeekly);
            const bVal = getTargetValue(b.groupedByWeekly);

            // 🔧 Handle string sort (e.g., group or contract_code)
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return direction === 'asc'
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            }

            if (aVal == null) return direction === 'asc' ? -1 : 1;
            if (bVal == null) return direction === 'asc' ? 1 : -1;

            return direction === 'asc' ? aVal - bVal : bVal - aVal;
        });
    };

    let sorted;

    if (tableData[0]?.shipperData && tableData[0]?.shipperData[0]?.contractData) {
        // 🌟 Case: shipperData -> contractData
        sorted = deepClone(tableData).map((shipper: any) => ({
            ...shipper,
            shipperData: shipper.shipperData.map((shipperEntry: any) => ({
                ...shipperEntry,
                contractData: sortByValue(shipperEntry.contractData),
            })),
        }));
    } else if (tableData[0]?.contractData) {
        // 🌟 Case: shipper level only
        sorted = deepClone(tableData).map((entry: any) => ({
            ...entry,
            contractData: sortByValue(entry.contractData),
        }));
    } else {
        // 🌟 Case: flat tableData
        sorted = sortByValue(tableData);
    }

    setSortedData(sorted);
};


export const handleSortMinimum2 = (
    column: string,
    sortState: any,
    setSortState: any,
    setSortedData: any,
    tableData: any[]
) => {
    const parts = column.split('_');
    const dayName = parts[parts.length - 1]; // เช่น "sunday"
    const prefix = parts[0]; // "change" หรือ "exchange"

    const typeKey = column.includes("change_min_inventory")
        ? "Min_Inventory_Change"
        : column.includes("exchange_min_invent")
            ? "Exchange_Mininventory"
            : null;

    const dayIndexMap: Record<string, number> = {
        sunday: 0,
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6
    };

    const dayIndex = dayIndexMap[dayName.toLowerCase()];
    if (dayIndex == null || typeKey == null) return;

    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortState.column === column) {
        direction = sortState.direction === 'asc'
            ? 'desc'
            : sortState.direction === 'desc'
                ? null
                : 'asc';
    }

    setSortState({ column, direction });

    if (!direction) {
        setSortedData(tableData); // reset
        return;
    }

    const getValue = (row: any): number | null => {
        const dailyData = row?.groupedByWeekly?.[dayIndex]?.data || [];
        const found = dailyData.find((d: any) => d.type === typeKey);
        return found?.value ?? null;
    };

    const sorted = [...tableData].sort((a, b) => {
        const aVal = getValue(a);
        const bVal = getValue(b);

        if (aVal == null) return direction === 'asc' ? -1 : 1;
        if (bVal == null) return direction === 'asc' ? 1 : -1;

        return direction === 'asc' ? aVal - bVal : bVal - aVal;
    });

    setSortedData(sorted);
};

export const handleSortMeterRetriving = (
    column: string,
    sortState: any,
    setSortState: any,
    setSortedData: any,
    tableData: any[]
) => {
    const getNestedValue = (obj: any, path: string) => {
        return path.split('.').reduce((acc, key) => acc?.[key], obj);
    };

    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortState.column === column) {
        direction = sortState.direction === 'asc' ? 'desc' : sortState.direction === 'desc' ? null : 'asc';
    }

    setSortState({ column, direction });

    if (!direction) {
        setSortedData(tableData);
        return;
    }

    const sorted = [...tableData].sort((a, b) => {
        const aValue = getNestedValue(a, column);
        const bValue = getNestedValue(b, column);

        // 🧠 ตัวแปลงเพื่อเอาค่าแรกถ้าเป็น array
        const getVal = (val: any) => (Array.isArray(val) ? val[0] : val);

        const aVal = getVal(aValue);
        const bVal = getVal(bValue);

        // 🕐 ถ้าเป็นวันที่ → sort ด้วย dayjs
        const aDate = dayjs(aVal);
        const bDate = dayjs(bVal);

        if (aDate.isValid() && bDate.isValid()) {
            return direction === 'asc' ? aDate.diff(bDate) : bDate.diff(aDate);
        }

        // 🔢 ถ้าเป็น number → sort ตัวเลข
        if (!isNaN(aVal) && !isNaN(bVal)) {
            return direction === 'asc' ? aVal - bVal : bVal - aVal;
        }

        // 🔤 ถ้าเป็น string → sort ตัวอักษร
        return direction === 'asc'
            ? String(aVal).localeCompare(String(bVal), undefined, { sensitivity: 'base' })
            : String(bVal).localeCompare(String(aVal), undefined, { sensitivity: 'base' });
    });

    setSortedData(sorted);
};


export const handleSortBalMonthlyReport = (
    column: string,
    sortState: any,
    setSortState: any,
    setSortedData: any,
    tableData: any[],
    currentPage?: any,
    itemsPerPage?: any
) => {
    // #################### utils ####################
    /** ดึงค่าที่ซ่อนอยู่หลัง path เช่น "value.total" */
    const getValue = (obj: any, path: string) =>
        path.split('.').reduce((acc, key) => acc?.[key], obj);

    /** ตรวจว่าเป็นวันที่ (รองรับ DD/MM/YYYY, YYYY‑MM‑DD, ISO) */
    const parseDate = (val: any) => {
        const d = dayjs(val, ['DD/MM/YYYY', 'YYYY-MM-DD'], true);
        return d.isValid() ? d.valueOf() : null;
    };
    // ################################################

    // --- ตัดสินทิศทาง sort (tri‑state) ---
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortState.column === column) {
        direction =
            sortState.direction === 'asc'
                ? 'desc'
                : sortState.direction === 'desc'
                    ? null
                    : 'asc';
    }
    setSortState({ column, direction });

    // --- ไม่ sort (คลิกรอบที่ 3) ---
    if (!direction) {

        tableData = tableData?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

        setSortedData(tableData);
        return;
    }

    // --- sort ---
    const sorted = [...tableData].sort((a, b) => {
        const aVal = getValue(a, column);
        const bVal = getValue(b, column);

        // ให้ null/undefined อยู่หัวท้าย
        if (aVal == null) return direction === 'asc' ? -1 : 1;
        if (bVal == null) return direction === 'asc' ? 1 : -1;

        // วันที่
        const aDate = parseDate(aVal);
        const bDate = parseDate(bVal);
        if (aDate !== null && bDate !== null) {
            return direction === 'asc' ? aDate - bDate : bDate - aDate;
        }

        // ตัวเลข
        const aNum = Number(aVal);
        const bNum = Number(bVal);
        if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
            return direction === 'asc' ? aNum - bNum : bNum - aNum;
        }

        // สตริง
        return direction === 'asc'
            ? String(aVal).localeCompare(String(bVal), undefined, {
                sensitivity: 'base',
            })
            : String(bVal).localeCompare(String(aVal), undefined, {
                sensitivity: 'base',
            });
    });

    let data_pagi = sorted
    if (currentPage && itemsPerPage) {
        data_pagi = sorted?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    }

    setSortedData(data_pagi);
};


export const handleSortNomCode = (
    column: string,
    sortState: any,
    setSortState: any,
    setSortedData: any,
    tableData: any[]
) => {
    const getNestedValue = (obj: any, path: string) => {
        return path.split('.').reduce((acc, key) => {
            if (Array.isArray(acc)) {
                return acc.map(item => item?.[key]).filter(value => value !== undefined);
            }
            return acc?.[key];
        }, obj);
    };

    const isDataColumn = column.startsWith("data.");
    let direction: 'asc' | 'desc' | null = 'asc';

    if (sortState.column === column) {
        direction = sortState.direction === 'asc' ? 'desc' : sortState.direction === 'desc' ? null : 'asc';
    }

    setSortState({ column, direction });

    if (!direction || direction == null) {
        setSortedData(tableData);
        return;
    }

    if (isDataColumn) {
        const field = column.replace(/^data\./, '');
        const sorted: any = tableData.map((group: any) => {
            const sortedData = [...(group.data || [])].sort((a, b) => {
                const aValue = getNestedValue(a, field);
                const bValue = getNestedValue(b, field);

                const getFirstValue = (val: any) => (Array.isArray(val) ? val[0] : val);
                const aVal = getFirstValue(aValue);
                const bVal = getFirstValue(bValue);

                if (aVal == null) return direction === 'asc' ? -1 : 1;
                if (bVal == null) return direction === 'asc' ? 1 : -1;

                const aDate = new Date(aVal);
                const bDate = new Date(bVal);
                if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
                    return direction === 'asc' ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
                }

                if (!isNaN(aVal) && !isNaN(bVal)) {
                    return direction === 'asc' ? aVal - bVal : bVal - aVal;
                }

                return direction === 'asc'
                    ? String(aVal).localeCompare(String(bVal), undefined, { sensitivity: 'base' })
                    : String(bVal).localeCompare(String(aVal), undefined, { sensitivity: 'base' });
            });

            return { ...group, data: sortedData };
        });

        setSortedData(sorted);
    } else {

        // เพิ่มมา check case กรณี ข้อมูลทั้งหมดเป็น null
        const allNull = tableData.every(row => {
            const val = getNestedValue(row, column);
            const firstVal = Array.isArray(val) ? val[0] : val;
            return firstVal == null;
        });

        const sorted = allNull
            ? tableData // do nothing, return original
            : [...tableData].sort((a, b) => {
                const aValue = getNestedValue(a, column);
                const bValue = getNestedValue(b, column);

                const getFirstValue = (val: any) => (Array.isArray(val) ? val[0] : val);
                const aVal = getFirstValue(aValue);
                const bVal = getFirstValue(bValue);

                if (aVal == null) return direction === 'asc' ? -1 : 1;
                if (bVal == null) return direction === 'asc' ? 1 : -1;

                // ✅ Special case for nomination_code
                if (column === 'nomination_code' && typeof aVal === 'string' && typeof bVal === 'string') {
                    const parseCode = (code: string) => {
                        const [datePart, , runPart] = code.split('-');
                        return {
                            date: datePart,
                            run: parseInt(runPart, 10),
                        };
                    };

                    const aParsed = parseCode(aVal);
                    const bParsed = parseCode(bVal);

                    if (aParsed.date !== bParsed.date) {
                        return direction === 'asc'
                            ? aParsed.date.localeCompare(bParsed.date)
                            : bParsed.date.localeCompare(aParsed.date);
                    }

                    return direction === 'asc'
                        ? aParsed.run - bParsed.run
                        : bParsed.run - aParsed.run;
                }

                // 👇 fallback: normal string/date/number sorting
                const aDay = dayjs(aVal, 'DD/MM/YYYY');
                const bDay = dayjs(bVal, 'DD/MM/YYYY');

                if (aDay.isValid() && bDay.isValid()) {
                    return direction === 'asc' ? aDay.diff(bDay) : bDay.diff(aDay);
                }

                if (!isNaN(aVal) && !isNaN(bVal)) {
                    return direction === 'asc' ? aVal - bVal : bVal - aVal;
                }

                return direction === 'asc'
                    ? String(aVal).localeCompare(String(bVal), undefined, { sensitivity: 'base' })
                    : String(bVal).localeCompare(String(aVal), undefined, { sensitivity: 'base' });
            });

        setSortedData(sorted);
    }
};

export const handleSortConcept = (
    column: string | string[], // ให้รองรับทั้ง string เดี่ยว หรือ array ของ key
    sortState: any,
    setSortState: any,
    setSortedData: any,
    tableData: any[]
) => {
    const columns = Array.isArray(column) ? column : [column];

    let direction: 'asc' | 'desc' | null = 'asc';

    if (sortState.column === column.toString()) {
        direction =
            sortState.direction === 'asc'
                ? 'desc'
                : sortState.direction === 'desc'
                    ? null
                    : 'asc';
    }

    setSortState({ column: column.toString(), direction });

    if (!direction) {
        setSortedData(tableData);
        return;
    }

    const getFirstNotNullValue = (row: any) => {
        for (let col of columns) {
            const val = row?.[col];
            if (val != null && val !== '') return val;
        }
        return null;
    };

    const allNull = tableData.every(row => getFirstNotNullValue(row) == null);

    if (allNull) {
        setSortedData(tableData);
        return;
    }

    const sorted = [...tableData].sort((a, b) => {
        const aVal = getFirstNotNullValue(a);
        const bVal = getFirstNotNullValue(b);

        const aDay = dayjs(aVal, 'DD/MM/YYYY');
        const bDay = dayjs(bVal, 'DD/MM/YYYY');

        if (aDay.isValid() && bDay.isValid()) {
            return direction === 'asc' ? aDay.diff(bDay) : bDay.diff(aDay);
        }

        if (aVal == null) return direction === 'asc' ? -1 : 1;
        if (bVal == null) return direction === 'asc' ? 1 : -1;

        const numA = parseFloat(aVal);
        const numB = parseFloat(bVal);

        if (!isNaN(numA) && !isNaN(numB)) {
            return direction === 'asc' ? numA - numB : numB - numA;
        }

        return direction === 'asc'
            ? String(aVal).localeCompare(String(bVal), undefined, { sensitivity: 'base' })
            : String(bVal).localeCompare(String(aVal), undefined, { sensitivity: 'base' });
    });

    setSortedData(sorted);
};


export const handleSortMinimum = (
    column: string,
    sortState: any,
    setSortState: any,
    setSortedData: any,
    tableData: any[]
) => {
    let direction: 'asc' | 'desc' | null = 'asc';

    if (sortState.column === column) {
        direction = sortState.direction === 'asc' ? 'desc' : sortState.direction === 'desc' ? null : 'asc';
    }

    setSortState({ column, direction });

    if (!direction) {
        setSortedData(tableData);
        return;
    }

    const sorted = [...tableData].map((group: any) => {
        const sortedInner = [...group.data].sort((a: any, b: any) => {
            const getValueByType = (entry: any, type: string) => {
                const target = entry.data?.find((d: any) => d.type === type);
                const rawVal = target?.value;
                const numVal = typeof rawVal === 'string' ? parseFloat(rawVal.replace(/,/g, '')) : rawVal;
                return !isNaN(numVal) ? numVal : null;
            };

            const aVal = getValueByType(a, column);
            const bVal = getValueByType(b, column);

            if (aVal == null) return direction === 'asc' ? -1 : 1;
            if (bVal == null) return direction === 'asc' ? 1 : -1;

            return direction === 'asc' ? aVal - bVal : bVal - aVal;
        });

        return {
            ...group,
            data: sortedInner
        };
    });

    setSortedData(sorted);
};

// ฟังก์ชั่น handleSortAllocMonthlyReport รองรับการ sort ข้อมูล data_alloc[0].data.total
export const handleSortAllocMonthlyReport = (
    column: string, // format: "2025-02-20"
    sortState: any,
    setSortState: any,
    setSortedData: any,
    tableData: any[]
) => {
    let direction: 'asc' | 'desc' | null = 'asc';

    if (sortState.column === column) {
        direction = sortState.direction === 'asc' ? 'desc' : sortState.direction === 'desc' ? null : 'asc';
    }

    setSortState({ column, direction });

    if (!direction) {
        setSortedData([...tableData]);
        return;
    }

    const sorted = [...tableData].map((group: any) => {
        const sortedInner = [...group.data].sort((a: any, b: any) => {
            // หาค่าใน a.total และ b.total ที่มี date ตรงกับ column
            const aVal = a.total?.find((d: any) => d.date === column)?.value ?? null;
            const bVal = b.total?.find((d: any) => d.date === column)?.value ?? null;

            const valA = typeof aVal === 'string' ? parseFloat(aVal.replace(/,/g, '')) : aVal;
            const valB = typeof bVal === 'string' ? parseFloat(bVal.replace(/,/g, '')) : bVal;

            if (valA == null) return direction === 'asc' ? -1 : 1;
            if (valB == null) return direction === 'asc' ? 1 : -1;

            return direction === 'asc' ? valA - valB : valB - valA;
        });

        return {
            ...group,
            data: sortedInner
        };
    });

    setSortedData(sorted);
};

export const handleSortParkingAllocation = (
    column: string, // e.g., "unpark_nominations"
    sortState: any,
    setSortState: any,
    setSortedData: any,
    tableData: any[]
) => {
    let direction: 'asc' | 'desc' | null = 'asc';

    if (sortState.column === column) {
        direction = sortState.direction === 'asc' ? 'desc' : sortState.direction === 'desc' ? null : 'asc';
    }

    setSortState({ column, direction });

    if (!direction) {
        setSortedData(tableData);
        return;
    }

    if (column == 'zoneObj.name') {
        const sorted = tableData.sort((a: any, b: any) => {
            // Convert zone values to strings and use localeCompare for proper string comparison
            const zoneA = String(a.zone).toLowerCase();
            const zoneB = String(b.zone).toLowerCase();
            return direction === 'asc'
                ? zoneA.localeCompare(zoneB)
                : zoneB.localeCompare(zoneA);
        })

        setSortedData(sorted);
    }
    else {
        const getUnparkValue = (entry: any) => {
            // const unparkObj = entry.data?.find((d: any) => d.type === 'Unpark');
            // const val = unparkObj?.value;

            const valueFind = entry.data?.find((d: any) => d.type === column);
            const val = valueFind?.value
            // const unparkObj = entry.data?.find((d: any) => d.type === column);
            // const parkObj = entry.data?.find((d: any) => d.type === column);
            // const val = unparkObj?.value ?? parkObj?.value;

            const numVal = typeof val === 'string' ? parseFloat(val.replace(/,/g, '')) : val;
            return !isNaN(numVal) ? numVal : null;
        };


        const innerSort = (data: any) => {
            return data.sort((a: any, b: any) => {
                switch (column) {
                    case 'shipper_name':
                        const shipperA = String((a.data?.find((subData: any) => subData?.group?.name)?.group?.name || '').toLowerCase());
                        const shipperB = String((b.data?.find((subData: any) => subData?.group?.name)?.group?.name || '').toLowerCase());
                        return direction === 'asc'
                            ? shipperA.localeCompare(shipperB)
                            : shipperB.localeCompare(shipperA);
                    case 'contract_code.contract_code':
                        const contractA = String((a.data?.find((subData: any) => subData?.contract_code?.contract_code)?.contract_code?.contract_code || '').toLowerCase());
                        const contractB = String((b.data?.find((subData: any) => subData?.contract_code?.contract_code)?.contract_code?.contract_code || '').toLowerCase());
                        return direction === 'asc'
                            ? contractA.localeCompare(contractB)
                            : contractB.localeCompare(contractA);
                    case 'nominations_code':
                        const nominationCodeA = String((a.data?.find((subData: any) => subData?.nomination_code)?.nomination_code || '').toLowerCase());
                        const nominationCodeB = String((b.data?.find((subData: any) => subData?.nomination_code)?.nomination_code || '').toLowerCase());
                        return direction === 'asc'
                            ? nominationCodeA.localeCompare(nominationCodeB)
                            : nominationCodeB.localeCompare(nominationCodeA);
                    case 'version.version':
                        const versionA = String((a.data?.find((subData: any) => subData?.version?.version)?.version?.version || '').toLowerCase());
                        const versionB = String((b.data?.find((subData: any) => subData?.version?.version)?.version?.version || '').toLowerCase());
                        return direction === 'asc'
                            ? versionA.localeCompare(versionA)
                            : versionB.localeCompare(versionB);
                    case 'park_allocation':
                        const parkAllocationA = String((a.data?.find((subData: any) => subData?.parkAllocatedMMBTUD)?.parkAllocatedMMBTUD || '').toLowerCase());
                        const parkAllocationB = String((b.data?.find((subData: any) => subData?.parkAllocatedMMBTUD)?.parkAllocatedMMBTUD || '').toLowerCase());
                        return direction === 'asc'
                            ? parkAllocationA.localeCompare(parkAllocationA)
                            : parkAllocationB.localeCompare(parkAllocationB);
                    case 'EODPark':
                        const EODParkA = String((a.data?.find((subData: any) => subData?.EODPark)?.EODPark || '').toLowerCase());
                        const EODParkB = String((b.data?.find((subData: any) => subData?.EODPark)?.EODPark || '').toLowerCase());
                        return direction === 'asc'
                            ? EODParkA.localeCompare(EODParkB)
                            : EODParkB.localeCompare(EODParkA);
                    default:
                        const aVal = getUnparkValue(a);
                        const bVal = getUnparkValue(b);

                        if (aVal == null && bVal == null) return 0;
                        if (aVal == null) return direction === 'asc' ? 1 : -1;
                        if (bVal == null) return direction === 'asc' ? -1 : 1;

                        return direction === 'asc' ? aVal - bVal : bVal - aVal;
                }
            })
        }

        const sorted = tableData.map((group: any) => {
            const data = innerSort([...(group.data || [])])
            const sortedGroup = {
                ...group,
                data
            };

            return sortedGroup;
        });

        setSortedData(sorted);
    }
};

// #region ใช้ sort H1 - H24 ใน nomination --> summary nomination report
// ใช้ sort H1 - H24 ใน nomination --> summary nomination report
const HOUR_COL_RE = /^H([1-9]|1[0-9]|2[0-4])$/i;

const toNumberSafe = (value: any): number | null => {
    if (value == null || value === "") return null;
    const cleaned = String(value).replace(/,/g, "").trim();
    const num = Number(cleaned);
    return Number.isNaN(num) ? null : num;
};

const toTimestampSafe = (value: any): number | null => {
    if (value == null || value === "") return null;

    // Date object
    if (value instanceof Date) {
        const ts = dayjs(value).valueOf();
        return Number.isNaN(ts) ? null : ts;
    }

    const s = String(value).trim();
    // ISO / RFC
    let d = dayjs(s);
    if (d.isValid()) return d.valueOf();

    // DD/MM/YYYY HH:mm
    d = dayjs(s, "DD/MM/YYYY HH:mm", true);
    if (d.isValid()) return d.valueOf();

    // DD/MM/YYYY
    d = dayjs(s, "DD/MM/YYYY", true);
    if (d.isValid()) return d.valueOf();

    return null;
};

export const handleSortHOnly = (
    column: string,
    sortState: { column: string | null; direction: "asc" | "desc" | null },
    setSortState: (s: any) => void,
    setSortedData: (rows: any[]) => void,
    tableData: any[]
) => {
    // จังหวะคลิก: ครั้งแรก desc, ครั้งสอง asc, ครั้งสาม default
    // let direction: "asc" | "desc" | null = "desc";
    // if (sortState.column === column) {
    //     direction =
    //         sortState.direction === "desc"
    //             ? "asc"
    //             : sortState.direction === "asc"
    //                 ? null
    //                 : "desc";
    // }
    let direction: "asc" | "desc" | null = "asc";
    if (sortState.column === column) {
        direction = sortState.direction === "asc" ? "desc" : sortState.direction === "desc" ? null : "asc";
    }

    setSortState({ column, direction });

    // if (!direction) {
    if (!direction || direction == null) {
        setSortedData(tableData);
        return;
    }

    const isHourCol = HOUR_COL_RE.test(column);

    const getVal = (row: any, col: string) => row?.[col];

    const cmp = (a: any, b: any) => {
        const aRaw = getVal(a, column);
        const bRaw = getVal(b, column);

        // 1) คอลัมน์ H1–H24 → เป็นตัวเลข (รองรับ " 1,901.064 ")
        if (isHourCol) {
            const aNum = toNumberSafe(aRaw);
            const bNum = toNumberSafe(bRaw);
            if (aNum == null && bNum == null) return 0;
            if (aNum == null) return direction === "asc" ? -1 : 1;
            if (bNum == null) return direction === "asc" ? 1 : -1;
            return direction === "asc" ? aNum - bNum : bNum - aNum;
        }

        // 2) พยายามเทียบเป็นวันที่ก่อน (รองรับ ISO / DD/MM/YYYY / DD/MM/YYYY HH:mm)
        const aTs = toTimestampSafe(aRaw);
        const bTs = toTimestampSafe(bRaw);
        if (aTs != null && bTs != null) {
            return direction === "asc" ? aTs - bTs : bTs - aTs;
        }

        // 3) ตัวเลขทั่วไป (รองรับคอมมา/ช่องว่าง)
        const aNum = toNumberSafe(aRaw);
        const bNum = toNumberSafe(bRaw);
        if (aNum != null && bNum != null) {
            return direction === "asc" ? aNum - bNum : bNum - aNum;
        }

        // 4) null-handling
        if (aRaw == null && bRaw == null) return 0;
        if (aRaw == null) return direction === "asc" ? -1 : 1;
        if (bRaw == null) return direction === "asc" ? 1 : -1;

        // 5) สุดท้ายเทียบเป็นสตริง
        const aStr = String(aRaw);
        const bStr = String(bRaw);
        const res = aStr.localeCompare(bStr, undefined, { sensitivity: "base" });
        return direction === "asc" ? res : -res;
    };

    const sorted = [...tableData].sort(cmp);
    setSortedData(sorted);
};


// 3 WORK!
// export const handleSortBalanceReport = (
//     column: string,
//     sortState: any,
//     setSortState: any,
//     setSortedData: any,
//     tableData: any[]
// ) => {
//     const path = column.split('.');

//     const getDeepValues = (obj: any, keys: string[]): any[] => {
//         let results: any[] = [];

//         const recurse = (current: any, index: number) => {
//             if (index >= keys.length || current == null) {
//                 results.push(current);
//                 return;
//             }

//             const key = keys[index];
//             const next = current[key];

//             if (Array.isArray(next)) {
//                 next.forEach(item => recurse(item, index + 1));
//             } else {
//                 recurse(next, index + 1);
//             }
//         };

//         recurse(obj, 0);
//         return results.filter(v => v != null);
//     };

//     let direction: 'asc' | 'desc' | null = 'asc';
//     if (sortState.column === column) {
//         direction = sortState.direction === 'asc' ? 'desc' : sortState.direction === 'desc' ? null : 'asc';
//     }

//     setSortState({ column, direction });

//     if (!direction) {
//         setSortedData([...tableData]);
//         return;
//     }

//     // 1. Sort each shipperData[] inside each root item
//     const newData = tableData.map(item => {
//         const sortedShipperData = [...item.shipperData].sort((a, b) => {
//             const aVal = String(a.shipper || '');
//             const bVal = String(b.shipper || '');
//             return direction === 'asc'
//                 ? aVal.localeCompare(bVal, undefined, { sensitivity: 'base' })
//                 : bVal.localeCompare(aVal, undefined, { sensitivity: 'base' });
//         });
//         return {
//             ...item,
//             shipperData: sortedShipperData
//         };
//     });

//     // 2. Sort root level by first shipperData.shipper
//     const withValues = newData.map(item => {
//         const shipperNames = item.shipperData?.map((s: any) => s.shipper).filter(Boolean) || [];
//         const sortedNames = [...shipperNames].sort((a, b) =>
//             a.localeCompare(b, undefined, { sensitivity: 'base' })
//         );
//         const value = direction === 'asc' ? sortedNames[0] : sortedNames[sortedNames.length - 1];
//         return { item, value };
//     });

//     withValues.sort((a, b) => {
//         const aVal = a.value;
//         const bVal = b.value;

//         if (aVal == null) return direction === 'asc' ? -1 : 1;
//         if (bVal == null) return direction === 'asc' ? 1 : -1;

//         return direction === 'asc'
//             ? aVal.localeCompare(bVal, undefined, { sensitivity: 'base' })
//             : bVal.localeCompare(aVal, undefined, { sensitivity: 'base' });
//     });

//     setSortedData(withValues.map(entry => entry.item));
// };


// 4 FIXING SLOW SORT
// export const handleSortBalanceReport = (
//     column: string,
//     sortState: any,
//     setSortState: any,
//     setSortedData: any,
//     tableData: any[]
// ) => {
//     const path = column.split('.');

//     // Determine direction
//     let direction: 'asc' | 'desc' | null = 'asc';
//     if (sortState.column === column) {
//         direction = sortState.direction === 'asc' ? 'desc' : sortState.direction === 'desc' ? null : 'asc';
//     }

//     setSortState({ column, direction });

//     if (!direction) {
//         setSortedData([...tableData]);
//         return;
//     }

//     // Step 1: Cache sort values from shipperData
//     const dataWithKey = tableData.map((item) => {
//         const firstShipper = item.shipperData?.[0]?.shipper?.toString() || null;
//         return {
//             item,
//             value: firstShipper,
//         };
//     });

//     // Step 2: Sort top-level
//     dataWithKey.sort((a, b) => {
//         if (!a.value) return direction === 'asc' ? -1 : 1;
//         if (!b.value) return direction === 'asc' ? 1 : -1;
//         return direction === 'asc'
//             ? a.value.localeCompare(b.value, undefined, { sensitivity: 'base' })
//             : b.value.localeCompare(a.value, undefined, { sensitivity: 'base' });
//     });

//     // Step 3: Sort each shipperData only once
//     const sorted = dataWithKey.map(({ item }) => {
//         const sortedShipperData = [...(item.shipperData || [])].sort((a, b) => {
//             return direction === 'asc'
//                 ? a.shipper.localeCompare(b.shipper, undefined, { sensitivity: 'base' })
//                 : b.shipper.localeCompare(a.shipper, undefined, { sensitivity: 'base' });
//         });

//         return {
//             ...item,
//             shipperData: sortedShipperData,
//         };
//     });

//     setSortedData(sorted);
// };


// 5. fix slow sort
// --- เตรียม collator 1 ตัว ใช้ซ้ำทุกครั้ง ---
// const collator = new Intl.Collator(undefined, { sensitivity: 'base' });

// const preIndexed: any = tableData.map((item: any) => ({
//     item,
//     topKey: item.shipperData?.[0]?.shipper ?? '',
//     subKeys: (item.shipperData ?? []).map((s: any) => s.shipper)
// }));

// export const handleSortBalanceReport = (
//     column: string,
//     sortState: any,
//     setSortState: any,
//     setSortedData: any,
//     tableData: any[]
// ) => {

//     // --- cache ค่า key ล่วงหน้า (ทำครั้งเดียว) ---

//     let dir: 'asc' | 'desc' | null =
//         sortState.column === column
//             ? sortState.direction === 'asc'
//                 ? 'desc'
//                 : sortState.direction === 'desc'
//                     ? null
//                     : 'asc'
//             : 'asc';

//     setSortState({ column, direction: dir });
//     if (!dir) return setSortedData(preIndexed.map((i: any) => i.item));

//     const asc = dir === 'asc';

//     // --- sort top level (ใช้ key ที่คำนวณไว้แล้ว + collator) ---
//     const topSorted = [...preIndexed].sort((a, b) =>
//         asc ? collator.compare(a.topKey, b.topKey) : collator.compare(b.topKey, a.topKey)
//     );

//     // --- sort shipperData ของแต่ละแถว (ใช้ key list ที่ cache ไว้) ---
//     const sorted = topSorted.map(({ item, subKeys }) => {
//         // zip shipperData กับ key เพื่อไม่ต้องหาใหม่ใน comparator
//         const paired = subKeys.map((k: any, i: any) => [k, item.shipperData[i]]);
//         paired.sort((a: any, b: any) => (asc ? collator.compare(a[0], b[0]) : collator.compare(b[0], a[0])));
//         return { ...item, shipperData: paired.map((p: any) => p[1]) };
//     });

//     setSortedData(sorted);
// };



// เอาไว้ sort Intraday dashboard
export const handleSortIntradayDashboard = (
    column: string,
    sortState: any,
    setSortState: any,
    setSortedData: any,
    tableData: any[],
) => {
    const path = column.split(".");

    // Toggle direction
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortState.column === column) {
        direction = sortState.direction === 'asc'
            ? 'desc'
            : sortState.direction === 'desc'
                ? null
                : 'asc';
    }

    setSortState({ column, direction });

    if (!direction) {
        setSortedData([...tableData]);
        return;
    }

    // Helper to get nested value
    const getNestedValue = (obj: any, path: string[]) => {
        return path.reduce((acc, key) => acc?.[key], obj);
    };

    // Sort the data
    const sorted = [...tableData].sort((a, b) => {
        const aValue = getNestedValue(a, path);
        const bValue = getNestedValue(b, path);

        if (aValue == null && bValue != null) return direction === 'asc' ? -1 : 1;
        if (aValue != null && bValue == null) return direction === 'asc' ? 1 : -1;
        if (aValue == null && bValue == null) return 0;

        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return direction === 'asc'
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        }

        // Assume number comparison
        return direction === 'asc'
            ? aValue - bValue
            : bValue - aValue;
    });

    setSortedData(sorted);
};

// เอาไว้ sort Intraday dashboard Modify หาก เคสที่ plan มี value เท่ากันหมด จะไป sort ตัว actual แทน
export const handleSortIntradayDashboardModify = (
    column: string,
    sortState: any,
    setSortState: any,
    setSortedData: any,
    tableData: any[],
    columnSecond?: string
) => {
    const path = column.split(".");
    const pathSecond = columnSecond?.split(".");

    // Toggle direction
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortState.column === column) {
        direction = sortState.direction === 'asc'
            ? 'desc'
            : sortState.direction === 'desc'
                ? null
                : 'asc';
    }

    setSortState({ column, direction });

    if (!direction) {
        setSortedData([...tableData]);
        return;
    }

    // Helper to get nested value
    const getNestedValue = (obj: any, path: string[]) => {
        return path.reduce((acc, key) => acc?.[key], obj);
    };

    const sorted = [...tableData].sort((a, b) => {
        const aValue = getNestedValue(a, path);
        const bValue = getNestedValue(b, path);

        // Step 1: เปรียบเทียบ primary (column)
        if (aValue == null && bValue != null) return direction === 'asc' ? -1 : 1;
        if (aValue != null && bValue == null) return direction === 'asc' ? 1 : -1;

        let primaryCompare: number | null = null;

        if (aValue == null && bValue == null) {
            primaryCompare = 0; // ไปเช็ค columnSecond ต่อ
        } else if (typeof aValue === 'string' && typeof bValue === 'string') {
            primaryCompare = aValue.localeCompare(bValue);
        } else {
            primaryCompare = aValue - bValue;
        }

        if (primaryCompare !== 0) {
            return direction === 'asc' ? primaryCompare : -primaryCompare;
        }

        // Step 2: ถ้า column เท่ากันหรือเป็น null ทั้งคู่ → เช็ค columnSecond
        if (pathSecond) {
            const aSecond = getNestedValue(a, pathSecond);
            const bSecond = getNestedValue(b, pathSecond);

            if (aSecond == null && bSecond != null) return direction === 'asc' ? -1 : 1;
            if (aSecond != null && bSecond == null) return direction === 'asc' ? 1 : -1;

            if (aSecond == null && bSecond == null) {
                // ✅ ทั้ง column และ columnSecond เป็น null → ไม่ต้อง sort
                return 0;
            }

            if (typeof aSecond === 'string' && typeof bSecond === 'string') {
                return direction === 'asc'
                    ? aSecond.localeCompare(bSecond)
                    : bSecond.localeCompare(aSecond);
            }

            return direction === 'asc'
                ? aSecond - bSecond
                : bSecond - aSecond;
        }

        return 0;
    });

    setSortedData(sorted);
};


export const handleSortYear = (
    column: string, // Date column key (e.g., "2025-05-01")
    sortState: any,
    setSortState: any,
    setSortedData: any,
    tableData: any[],
    dataType: 'year_data' | 'month_data' | 'day_data'
) => {
    let direction: string | null = 'asc';

    if (sortState.column === column && sortState.direction === 'asc') {
        direction = 'desc';
    } else if (sortState.column === column && sortState.direction === 'desc') {
        direction = null;
    }

    setSortState({ column, direction });

    if (direction) {
        const sortedData = [...tableData].sort((a, b) => {
            // Extract numeric values safely
            const aEntry = a[dataType]?.find((entry: any) => entry[column]);
            const bEntry = b[dataType]?.find((entry: any) => entry[column]);

            const aValue = aEntry ? parseFloat(aEntry[column]?.area_nominal_capacity) || 0 : 0;
            const bValue = bEntry ? parseFloat(bEntry[column]?.area_nominal_capacity) || 0 : 0;

            return direction === 'asc' ? aValue - bValue : bValue - aValue;
        });

        setSortedData(sortedData);
    } else {
        setSortedData([...tableData]); // Reset to original order if no sorting
    }
};

export const handleSortAllocShipperReport = (
    columnKey: any,
    sortState: any,
    setSortState: any,
    setSortedData: any,
    tableData: any
) => {
    // Determine direction
    let direction: any = 'asc';
    if (sortState.column === columnKey) {
        direction = sortState.direction === 'asc' ? 'desc' : sortState.direction === 'desc' ? null : 'asc';
    }

    setSortState({ column: columnKey, direction });

    if (!direction) {
        setSortedData([...tableData]);
        return;
    }

    // Handle gas day column
    if (columnKey === 'current_time') {
        const sorted = [...tableData].sort((a, b) => {
            const dateA: any = new Date(a.gas_day);
            const dateB: any = new Date(b.gas_day);
            return direction === 'asc' ? dateA - dateB : dateB - dateA;
        });
        setSortedData(sorted);
        return;
    }

    // Handle nomPoint shipper/total/meter columns
    const [pointKey, indexStr] = columnKey.split('-');
    const index = parseInt(indexStr);

    const sorted = [...tableData].sort((a, b) => {
        const pointA = a.nomPoint.find((p: any) => p.point === pointKey);
        const pointB = b.nomPoint.find((p: any) => p.point === pointKey);

        const getValue = (point: any, idx: any) => {
            if (!point) return -Infinity;
            // If shipper
            if (idx < point.data?.length) {
                return point.data[idx]?.allocatedValue ?? -Infinity;
            }
            // If Total (second to last index)
            if (idx === point.data?.length) {
                return point.total ?? -Infinity;
            }
            // If Meter (last index)
            if (idx === point.data?.length + 1) {
                return point.meterValue ?? -Infinity;
            }
            return -Infinity;
        };

        const valA = getValue(pointA, index);
        const valB = getValue(pointB, index);

        if (valA === valB) return 0;
        if (valA === -Infinity) return 1;
        if (valB === -Infinity) return -1;

        return direction === 'asc' ? valA - valB : valB - valA;
    });

    setSortedData(sorted);
};

export const handleSortAllocShipperReport2 = (
    column: string,
    sortState: any,
    setSortState: any,
    setSortedData: any,
    tableData: any[]
) => {
    let direction: 'asc' | 'desc' | null = 'asc';

    if (sortState.column === column) {
        direction = sortState.direction === 'asc' ? 'desc' : sortState.direction === 'desc' ? null : 'asc';
    }

    setSortState({ column, direction });

    if (!direction) {
        setSortedData([...tableData]);
        return;
    }

    const sorted = [...tableData].sort((a, b) => {
        const getValue = (row: any) => {
            // -----------------------
            // Case 1: sort by gas_day
            // -----------------------
            if (column === "gas_day") return row.gas_day;

            // -----------------------------
            // Extract point & target name
            // -----------------------------
            const [point, name] = column.split("-");

            const pointObj = row.nomPoint?.find((p: any) => p.point === point);
            if (!pointObj) return 0;

            if (name === "total") return pointObj.total ?? 0;
            if (name === "meter") return pointObj.meterValue ?? 0;

            // shipper
            const shipperObj = pointObj.data?.find((d: any) => d.shipper_name === name);
            return shipperObj?.allocatedValue ?? 0;
        };

        const valA = getValue(a);
        const valB = getValue(b);

        if (valA == null) return direction === 'asc' ? -1 : 1;
        if (valB == null) return direction === 'asc' ? 1 : -1;

        return direction === 'asc' ? valA - valB : valB - valA;
    });

    setSortedData(sorted);
};

export const handleSortUseItMonth = (
    column: string, // The specific date to sort by (e.g., "10/01/2025")
    sortState: any,
    setSortState: any,
    setSortedData: any,
    tableData: any[],
) => {

    // Toggle sort direction
    let direction: string | null = 'asc';
    if (sortState.column === column && sortState.direction === 'asc') {
        direction = 'desc';
    } else if (sortState.column === column && sortState.direction === 'desc') {
        direction = null;
    }

    setSortState({ column, direction });

    if (direction === 'asc') {
        setSortedData([...tableData].sort((a, b) => {
            const aValue = extractValue(a, column);
            const bValue = extractValue(b, column);

            return aValue - bValue;
        }));
    } else if (direction === 'desc') {
        setSortedData([...tableData].sort((a, b) => {
            const aValue = extractValue(a, column);
            const bValue = extractValue(b, column);

            return bValue - aValue;
        }));
    } else {
        setSortedData([...tableData]); // Reset to original data
    }

};

// Helper function to extract the value for the given column
const extractValue = (item: any, column: string): number => {
    return item.data?.reduce((sum: number, dataItem: any) => {
        const value = dataItem.entryData?.valueBefor12Month?.[column]?.value || 0;
        return sum + Number(value);
    }, 0) || 0;
};


// sorting allocation mgn
// --- helper ---
const getValueByPath = (obj: any, path: string) => {
    if (!obj || !path) return null;

    return path.split(".").reduce((acc, key) => (acc ? acc[key] : null), obj);
};

const normalizeValue = (val: any) => {
    if (val === null || val === undefined) return "";
    if (!isNaN(val) && val !== "" && typeof val !== "boolean") {
        return Number(val);
    }
    if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}/.test(val)) {
        return new Date(val).getTime();
    }
    return String(val).toLowerCase();
};

const deriveFromSubRows = (
    row: any,
    key: string,
    mode: "first" | "min" | "max" | "avg" = "first"
) => {
    if (!row?.data || row.data.length === 0) return null;

    const values = row.data.map((d: any) =>
        normalizeValue(getValueByPath(d, key))
    );
    switch (mode) {
        case "min":
            return Math.min(...values);
        case "max":
            return Math.max(...values);
        case "avg":
            return values.reduce((a: any, b: any) => a + b, 0) / values.length;
        case "first":
        default:
            return values[0];
    }
};

// --- main handleSort ---
export const handleSortAllocMgn = (
    column: string,
    sortState: any,
    setSortState: any,
    setSortedData: any,
    tableData: any,
    mode: "first" | "min" | "max" | "avg" = "first"
) => {

    let direction: string | null = 'asc';
    if (sortState.column === column && sortState.direction === 'asc') {
        direction = 'desc';
    } else if (sortState.column === column && sortState.direction === 'desc') {
        direction = null;
    }

    const newData = [...tableData].map((row: any) => {
        const derivedVal = deriveFromSubRows(row, column, mode);
        return { ...row, _sortVal: derivedVal };
    });

    newData.sort((a: any, b: any) => {
        if (a._sortVal < b._sortVal) return direction === "asc" ? -1 : 1;
        if (a._sortVal > b._sortVal) return direction === "asc" ? 1 : -1;
        return 0;
    });

    setSortedData(newData);
    setSortState({ column, direction });
};