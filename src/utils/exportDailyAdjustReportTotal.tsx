import XLSX from "xlsx-js-style";

const uniq = <T, K extends keyof any>(arr: T[], by: (x: T) => K) => {
    const set = new Set<K>();
    return arr.filter((x) => (set.has(by(x)) ? false : (set.add(by(x)), true)));
};

const valueAtTime = (item: any, t: string): number | null => {
    const f = Array.isArray(item?.timeShow)
        ? item?.timeShow?.find((x: any) => x.time === t)
        : item?.timeShow && item?.timeShow?.time === t
            ? item.timeShow
            : null;
    // return f ? Number(f.value) : null;
    return (f?.valueMmscfd && f?.valueMmscfd !== 0) ? Number(`${f.valueMmscfd}`.replace(/,/g, '').trim()) : null;
};

const to3 = (n: number | null | undefined) => (n == null) ? null : Number((+n).toFixed(3));

function buildAOASection(
    data_table_: any[],
    timeHeaderLabel: string
): {
    aoa: any[][];
    blocks: { point: string; startCol: number; endCol: number }[];
    colCount: number;
} {
    if (!Array.isArray(data_table_) || data_table_.length === 0) {
        return { aoa: [], blocks: [], colCount: 0 };
    }

    // ลำดับ point เอาจาก groups ของแถวแรก
    const firstRowGroups = data_table_[0]?.groups ?? [];
    const points: string[] = firstRowGroups?.map((g: any) => g.point);

    // map point → [shipper1, shipper2, ...] (unique และคงลำดับ)
    const pointToShippers: Record<string, string[]> = {};
    for (const tRow of data_table_) {
        for (const g of tRow.groups || []) {
            const names = (g.items || [])?.map((it: any) => it.shipper_name || "");
            const uniqNames = uniq(names, (x: any) => x);
            if (!pointToShippers[g.point]) pointToShippers[g.point] = [];
            for (const n of uniqNames) {
                if (n && !pointToShippers[g.point].includes(n)) {
                    pointToShippers[g.point].push(n);
                }
            }
        }
    }

    // ---------- สร้างหัวตาราง 2 แถว ----------
    const headerTop: any[] = [timeHeaderLabel];
    const headerBottom: any[] = [""];

    type BlockInfo = { point: string; startCol: number; endCol: number };
    const blocks: BlockInfo[] = [];

    let colCursor = 1; // c0 = Time
    for (const p of points) {
        const shippers =
            pointToShippers[p] && pointToShippers[p].length > 0
                ? pointToShippers[p]
                : ["Shipper"]; // fallback (กันค่าว่าง)

        const subCols = shippers.length + 1; // +1 = Total

        headerTop.push(p, ...Array(subCols - 1).fill(""));
        for (const s of shippers) headerBottom.push(s);
        headerBottom.push("Total");

        blocks.push({ point: p, startCol: colCursor, endCol: colCursor + subCols - 1 });
        colCursor += subCols;
    }

    const aoa: any[][] = [headerTop, headerBottom];

    const times: string[] = data_table_.map((r) => r.time);
    for (const t of times) {
        const rowForTime = data_table_.find((r) => r.time === t);
        const row: any[] = [t];

        for (const p of points) {
            const group = rowForTime?.groups?.find((g: any) => g.point === p);
            const shippers =
                pointToShippers[p] && pointToShippers[p].length > 0
                    ? pointToShippers[p]
                    : ["Shipper"];

            let total = 0;
            let hasAny = false;

            for (const s of shippers) {
                const item = group?.items?.find((it: any) =>
                    s === "Shipper" ? true : it.shipper_name === s
                );
                const val = valueAtTime(item, t);
                const n = val == null ? null : to3(val);
                if (n != null) {
                    total += n;
                    hasAny = true;
                }
                row.push(n);
            }

            row.push(hasAny ? to3(total) : null);
        }

        aoa.push(row);
    }

    return { aoa, blocks, colCount: colCursor }; // colCursor เป็นจำนวนคอลัมน์ทั้งหมด (รวม Time)
}

export const exportDailyAdjustReportTabTotal = (
    data_table_: any[],
    fileName = "table.xlsx",
    // รองรับทั้งการส่งเข้ามา หรือถ้าไม่ส่งจะลองอ่านจาก globalThis เพื่อให้ signature เดิมยังใช้ได้
    _topData: any[] | null = (globalThis as any)?.data_table_top ?? null
) => {
    if (!Array.isArray(data_table_) || data_table_.length === 0) return;

    // ===== สร้างส่วนบน (Current Time) ถ้ามี =====
    const hasTop = Array.isArray(_topData) && _topData.length > 0;
    const topSec = hasTop
        ? buildAOASection(_topData, "Current Time")
        : { aoa: [], blocks: [], colCount: 0 };

    // ===== สร้างส่วนล่าง (ตารางเดิม) =====
    const bottomSec = buildAOASection(data_table_, "Time");

    // ===== รวม AOA =====
    const combinedAOA: any[][] = [];
    const merges: XLSX.Range[] = [];

    // 1) top section
    let rowCursor = 0;
    if (hasTop) {
        combinedAOA.push(...topSec.aoa);
        // merges ของหัว top (แถว 0..1)
        merges.push(
            { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } }, // merge "Current Time"
            ...topSec.blocks.map((b) => ({
                s: { r: 0, c: b.startCol },
                e: { r: 0, c: b.endCol },
            }))
        );
        rowCursor = topSec.aoa.length;
        // 2) blank row
        combinedAOA.push([]);
        rowCursor += 1;
    }

    // base row index ของหัว bottom
    const bottomBaseRow = rowCursor;

    // 3) bottom section (ตารางเดิม)
    combinedAOA.push(...bottomSec.aoa);

    // merges ของหัว bottom (ชดเชยด้วย bottomBaseRow)
    merges.push(
        { s: { r: bottomBaseRow + 0, c: 0 }, e: { r: bottomBaseRow + 1, c: 0 } }, // merge "Time"
        ...bottomSec.blocks.map((b) => ({
            s: { r: bottomBaseRow + 0, c: b.startCol },
            e: { r: bottomBaseRow + 0, c: b.endCol },
        }))
    );

    // ===== ทำ sheet จากทั้งก้อน =====
    const ws = XLSX.utils.aoa_to_sheet(combinedAOA);

    // merges
    ws["!merges"] = merges;

    // ความกว้างคอลัมน์ (อิงจำนวนคอลัมน์ของส่วนล่างถ้ามี ไม่งั้นของส่วนบน)
    const totalCols =
        Math.max(topSec.colCount || 0, bottomSec.colCount || 0) || bottomSec.colCount || 1;
    const cols: XLSX.ColInfo[] = [];
    for (let c = 0; c < totalCols; c++) {
        cols.push({ wch: c === 0 ? 8 : 12 }); // Time/Current Time = 8, ที่เหลือ 12
    }
    ws["!cols"] = cols;

    // แถวหัวของตารางล่างเริ่มที่ bottomBaseRow
    const headerRowsToCenter = hasTop
        ? [0, 1, bottomBaseRow + 0, bottomBaseRow + 1]
        : [0, 1];

    const maxCol = totalCols - 1;

    for (const r of headerRowsToCenter) {
        for (let c = 0; c <= maxCol; c++) {
            const addr = XLSX.utils.encode_cell({ r, c });
            const cell = ws[addr];
            if (!cell) continue; // ถ้าไม่มีเซลล์ (เช่น แถวว่าง) ก็ข้าม
            // จัดกลางแนวตั้ง/แนวนอน และทำหัวตัวหนา
            cell.s = {
                alignment: { horizontal: "center", vertical: "center" },
                font: { bold: true },
            };
        }
    }

    // ใส่ number format "#,##0.000" ให้ทุก cell ที่เป็น number
    const ref = ws["!ref"];
    if (ref) {
        const range = XLSX.utils.decode_range(ref);
        for (let R = 0; R <= range.e.r; ++R) {
            for (let C = 0; C <= range.e.c; ++C) {
                const addr = XLSX.utils.encode_cell({ r: R, c: C });
                const cell = ws[addr];
                if (cell && typeof cell.v === "number") {
                    cell.z = "#,##0.000";
                }
            }
        }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Export");
    XLSX.writeFile(wb, fileName);
};