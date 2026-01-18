import { useEffect, useMemo } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import { splitByGroupCopyCat } from '@/utils/generalFormatter';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
import NodataTable from "@/components/other/nodataTable";

const TableWeekly: React.FC<any> = ({ tableData, columnVisibility, isLoading, userPermission }) => {
    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [columnHeadDate, setColumnHeadDate] = useState<any>([]);

    const getWeeklyTotalsByType = (group_weekly: any[]) => {
        const result: any = {};

        group_weekly?.forEach(weekGroup => {
            weekGroup?.groupedByWeekly?.forEach((dayEntry: any) => {
                dayEntry?.data?.forEach((item: any) => {
                    const day = item.nomType;
                    const type = item.type;

                    if (!result[day]) {
                        result[day] = {};
                    }

                    if (!result[day][type]) {
                        result[day][type] = 0;
                    }

                    result[day][type] += item.value;
                });
            });
        });

        const groupedByWeekly = group_weekly?.[0]?.groupedByWeekly || [];
        const output = groupedByWeekly.slice(0, 7).map((entry: any, index: any) => ({
            day: dayNames?.[index] ?? '',
            gas_day: entry?.gas_day,
        }));
        setColumnHeadDate(output)

        return result
    };

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    const [sortTable, setsortTable] = useState([]);
    const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

    useEffect(() => {
        const output_data = splitByGroupCopyCat(tableData);
        getWeeklyTotalsByType(output_data);

        let newTableData: any = [];
        const chunkArray = (arr: any[], size: number) => {
            const chunks = [];
            for (let i = 0; i < arr?.length; i += size) {
                chunks.push(arr.slice(i, i + size));
            }
            return chunks;
        };

        tableData?.length > 0 && tableData?.map((item: any) => {
            const weeksRaw = chunkArray(item?.groupedByWeekly, 7);
            const checkAllValuesEqual = (arr: any, obj?: any) => {
                if (arr?.length === 0) return null;

                const firstValue = arr[0]?.[obj];
                // เช็คว่าแต่ละค่าทั้งหมดใน array เท่ากับ firstValue หรือไม่
                return arr.every((value: any) => value?.[obj] === firstValue) ? firstValue : null;
            };

            weeksRaw?.map((week: any) => {
                let contract: any = checkAllValuesEqual(week, 'contract_code');
                let group: any = checkAllValuesEqual(week, 'group');

                const dataAsObject = week?.reduce((acc: any, item: any, index: number) => {
                    const dayName = dayNames[index];

                    const dataArray = item?.data || [];

                    // หา object ที่ type ตรงตามต้องการ
                    const minItem = dataArray.find(
                        (d: any) => d?.type === "Min_Inventory_Change"
                    );
                    const exchangeItem = dataArray.find(
                        (d: any) => d?.type === "Exchange_Mininventory"
                    );

                    // ดึง value ถ้ามี ไม่มีก็ให้ null
                    const min_val = minItem?.value ?? null;
                    const exchange_val = exchangeItem?.value ?? null;

                    // ถ้ามีค่าใดค่าหนึ่งไม่เป็น null → คำนวณ total
                    const total =
                        min_val !== null || exchange_val !== null
                            ? (min_val ?? 0) + (exchange_val ?? 0)
                            : null;

                    acc[dayName] = {
                        ...item,
                        min_val,
                        exchange_val,
                        total,
                    };

                    return acc;
                }, {});

                function calculateWeeklyTotals(dataByDay: Record<string, any>) {
                    let sumMin = 0;
                    let sumExchange = 0;

                    Object.values(dataByDay).forEach((dayData: any) => {
                        if (typeof dayData?.min_val === 'number') {
                            sumMin += dayData.min_val;
                        }

                        if (typeof dayData?.exchange_val === 'number') {
                            sumExchange += dayData.exchange_val;
                        }
                    });

                    const total = sumMin + sumExchange;

                    return total || null;
                }

                const weeklyTotals = calculateWeeklyTotals(dataAsObject);

                return (
                    newTableData.push({
                        zone: item?.zone,
                        zoneObj: item?.zoneObj,
                        ...dataAsObject,
                        data: dataAsObject, // data จริง
                        week: week, // ใช้แค่ทำหัว columns
                        contract_code: contract,
                        group: group,
                        totalWeek: weeklyTotals || null
                    })
                )
            })
        })

        setsortTable(newTableData);
    }, [tableData])

    function summarizeWeeklyData(dataArray: any) {
        // เตรียม object สำหรับผลลัพธ์เริ่มต้น
        const result: any = {};

        dayNames.forEach(day => {
            result[`${day}_total_min`] = 0;
            result[`${day}_total_exchange`] = 0;
            result[`${day}_total_total`] = 0;
        });

        // วนลูปในแต่ละรายการของ data (เช่น zone)
        dataArray?.forEach((item: any) => {
            dayNames?.forEach(day => {
                const dayData = item[day];
                if (dayData) {
                    // คำนวณค่า min_val, exchange_val, และ total
                    const min = parseFloat(dayData?.min_val) || 0;
                    const exch = parseFloat(dayData?.exchange_val) || 0;
                    const total = parseFloat(dayData?.total) || 0;

                    // เพิ่มค่าลงในผลลัพธ์ตามวัน
                    result[`${day}_total_min`] += min;
                    result[`${day}_total_exchange`] += exch;
                    result[`${day}_total_total`] += total;
                }
            });

            const resulttotal = parseFloat(item?.totalWeek) || 0;

            result.totalWeek = (result?.totalWeek || 0) + resulttotal;
        });

        return result;
    }

    const mappedTable = useMemo(() => {
        if (!sortTable) return null;

        const resultDate: any = summarizeWeeklyData(sortTable)

        const totalList: any = [sortTable[0]]; // ถ้าต้องใช้ใน loop ก็ set นอก loop ไปเลย

        return sortTable?.length > 0 && totalList?.map((row: any, rowIndex: number) => {
            return (
                <tr key={`${rowIndex}-${rowIndex}`} className="!bg-[#D1F2FF] h-10">
                    {columnVisibility?.shipper_name && (
                        <td className="px-2 py-1 text-[#464255] font-[700]">
                            <div>{'TOTAL'}</div>
                        </td>
                    )}

                    {columnVisibility?.contract_code && (
                        <td className="px-2 py-1 text-[#464255]">
                            <div>{ }</div>
                        </td>
                    )}

                    {columnVisibility?.zone && (
                        <td className="px-2 py-1 text-[#464255]">
                            <div>{ }</div>
                        </td>
                    )}

                    {row?.week?.map((day: any, dayIndex: number) => {
                        const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
                        const dayName = dayNames[dayIndex];

                        return (
                            <React.Fragment key={dayIndex}>
                                {/* Change Min Inventory */}
                                {columnVisibility?.[`change_min_inventory_${dayName}`] && (
                                    <td className="px-2 py-1 text-right text-[#464255] font-semibold">
                                        {resultDate?.[`${dayName}_total_min`]?.toLocaleString(undefined, { minimumFractionDigits: 3 })}
                                    </td>
                                )}

                                {/* Exchange Min Inventory */}
                                {columnVisibility?.[`exchange_min_invent_${dayName}`] && (
                                    <td className="px-2 py-1 text-right text-[#464255] font-semibold">
                                        {resultDate?.[`${dayName}_total_exchange`]?.toLocaleString(undefined, { minimumFractionDigits: 3 })}
                                    </td>
                                )}

                                {/* Total */}
                                {columnVisibility?.[`total_${dayName}`] && (
                                    <td className="px-2 py-1 text-right text-[#464255] font-semibold">
                                        {resultDate?.[`${dayName}_total_total`]?.toLocaleString(undefined, { minimumFractionDigits: 3 })}
                                    </td>
                                )}
                            </React.Fragment>
                        );
                    })}

                    {columnVisibility?.total && (
                        <td className="px-2 py-1 text-[#464255] text-right font-semibold">
                            <div>{resultDate.totalWeek?.toLocaleString(undefined, { minimumFractionDigits: 3 }) || 0}</div>
                        </td>
                    )}
                </tr>
            )
        });
    }, [columnVisibility?.total, sortTable]);

    return (
        <div className={`relative h-[calc(100vh-380px)] overflow-y-auto block  rounded-t-md z-1`}>

            {
                isLoading ?
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500">

                        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                            <tr className="h-9">

                                {columnVisibility.shipper_name && (
                                    <th
                                        className={`${table_sort_header_style} `} rowSpan={3} scope="col" onClick={() => handleSort("shipper_name", sortState, setSortState, setsortTable, sortTable)}
                                    >
                                        {`Shipper Name`}
                                        {getArrowIcon("shipper_name")}
                                    </th>
                                )}

                                {columnVisibility.contract_code && (
                                    <th
                                        className={`${table_sort_header_style}  w-[300px]`} rowSpan={3} scope="col" onClick={() => handleSort("contract_code", sortState, setSortState, setsortTable, sortTable)}
                                    >
                                        {`Contract Code`}
                                        {getArrowIcon("contract_code")}
                                    </th>
                                )}

                                {columnVisibility.zone && (
                                    <th
                                        className={`${table_sort_header_style} text-center border-r-[1px] border-r-[#298EBF]`} rowSpan={3} scope="col" onClick={() => handleSort("zone", sortState, setSortState, setsortTable, sortTable)}
                                    >
                                        {`Zone`}
                                        {getArrowIcon("zone")}
                                    </th>
                                )}

                                {columnVisibility.mmbtud && (
                                    <th
                                        className={`${table_header_style} border-r-[1px] border-r-[#298EBF]`}
                                        // colSpan={21} 
                                        colSpan={22} // https://app.clickup.com/t/86etzch3z หัว Column Minimum Inventory Summary (MMBTU)ให้ Merge ไปถึง Column Total ด้วย
                                        scope="col"
                                    >
                                        {/* {`MMBTU/D`} */}
                                        {/* https://app.clickup.com/t/86etzch2p Tab Weekly : เปลี่ยนชื่อ Column จาก MMBTU/D เป็น Minimum Inventory Summary (MMBTU) */}
                                        {`Minimum Inventory Summary (MMBTU)`}
                                    </th>
                                )}
                            </tr>

                            {/* 2nd DAYYYYYY */}
                            <tr className="h-9">

                                {/* 
                                     if these 3 are all true columnVisibility.change_min_inventory_sunday, columnVisibility.exchange_min_invent_sunday, columnVisibility.total_sunday then colSpan={3}
                                     if 2 are true and 1 is false then colSpan={2}
                                     if 1 is true and 2 are false then colSpan={1}
                                */}

                                {columnVisibility.sunday && (
                                    <th
                                        className={`${table_header_style} text-center border-r-[1px] border-r-[#298EBF] border-t-[1px] border-t-[#298EBF]`}
                                        colSpan={
                                            [
                                                columnVisibility.change_min_inventory_sunday,
                                                columnVisibility.exchange_min_invent_sunday,
                                                columnVisibility.total_sunday,
                                            ].filter(Boolean).length || 1
                                        }
                                        scope="col"
                                    >
                                        {`Sunday`}
                                        <div>{columnHeadDate[0]?.gas_day}</div>
                                    </th>
                                )}

                                {columnVisibility.monday && (
                                    <th
                                        className={`${table_header_style} text-center border-r-[1px] border-r-[#298EBF] border-t-[1px] border-t-[#298EBF]`}
                                        colSpan={
                                            [
                                                columnVisibility.change_min_inventory_monday,
                                                columnVisibility.exchange_min_invent_monday,
                                                columnVisibility.total_monday,
                                            ].filter(Boolean).length || 1
                                        }
                                        scope="col"
                                    >
                                        {`Monday`}
                                        <div>{columnHeadDate[1]?.gas_day}</div>
                                    </th>
                                )}

                                {columnVisibility.tuesday && (
                                    <th
                                        className={`${table_header_style} text-center border-r-[1px] border-r-[#298EBF] border-t-[1px] border-t-[#298EBF]`}
                                        colSpan={
                                            [
                                                columnVisibility.change_min_inventory_tuesday,
                                                columnVisibility.exchange_min_invent_tuesday,
                                                columnVisibility.total_tuesday,
                                            ].filter(Boolean).length || 1
                                        }
                                        scope="col"
                                    >
                                        {`Tuesday`}
                                        <div>{columnHeadDate[2]?.gas_day}</div>
                                    </th>
                                )}

                                {columnVisibility.wednesday && (
                                    <th
                                        className={`${table_header_style} text-center border-r-[1px] border-r-[#298EBF] border-t-[1px] border-t-[#298EBF]`}
                                        colSpan={
                                            [
                                                columnVisibility.change_min_inventory_wednesday,
                                                columnVisibility.exchange_min_invent_wednesday,
                                                columnVisibility.total_wednesday,
                                            ].filter(Boolean).length || 1
                                        }
                                        scope="col"
                                    >
                                        {`Wednesday`}
                                        <div>{columnHeadDate[3]?.gas_day}</div>
                                    </th>
                                )}

                                {columnVisibility.thursday && (
                                    <th
                                        className={`${table_header_style} text-center border-r-[1px] border-r-[#298EBF] border-t-[1px] border-t-[#298EBF]`}
                                        colSpan={
                                            [
                                                columnVisibility.change_min_inventory_thursday,
                                                columnVisibility.exchange_min_invent_thursday,
                                                columnVisibility.total_thursday,
                                            ].filter(Boolean).length || 1
                                        }
                                        scope="col"
                                    >
                                        {`Thursday`}
                                        <div>{columnHeadDate[4]?.gas_day}</div>
                                    </th>
                                )}

                                {columnVisibility.friday && (
                                    <th
                                        className={`${table_header_style} text-center border-r-[1px] border-r-[#298EBF] border-t-[1px] border-t-[#298EBF]`}
                                        colSpan={
                                            [
                                                columnVisibility.change_min_inventory_friday,
                                                columnVisibility.exchange_min_invent_friday,
                                                columnVisibility.total_friday,
                                            ].filter(Boolean).length || 1
                                        }
                                        scope="col"
                                    >
                                        {`Friday`}
                                        <div>{columnHeadDate[5]?.gas_day}</div>
                                    </th>
                                )}

                                {columnVisibility.saturday && (
                                    <th
                                        className={`${table_header_style} text-center border-r-[1px] border-r-[#298EBF] border-t-[1px] border-t-[#298EBF]`}
                                        colSpan={
                                            [
                                                columnVisibility.change_min_inventory_saturday,
                                                columnVisibility.exchange_min_invent_saturday,
                                                columnVisibility.total_saturday,
                                            ].filter(Boolean).length || 1
                                        }
                                        scope="col"
                                    >
                                        {`Saturday`}
                                        <div>{columnHeadDate[6]?.gas_day}</div>
                                    </th>
                                )}

                                {columnVisibility.total && (
                                    <th className={`${table_sort_header_style} border border-t-[#298EBF]`} rowSpan={2} scope="col" onClick={() => handleSort("totalWeek", sortState, setSortState, setsortTable, sortTable)}>
                                        {`Total`}
                                        {getArrowIcon("totalWeek")}
                                    </th>
                                )}
                            </tr>

                            <tr className="h-9">
                                {dayNames?.map((dayName: any, dayIndex: number) => {
                                    const columns_min = `change_min_inventory_${dayName}`
                                    const columns_exchange = `exchange_min_invent_${dayName}`
                                    const columns_total = `total_${dayName}`
                                    return (
                                        <React.Fragment key={dayIndex}>
                                            {columnVisibility?.[columns_min] && (
                                                <th
                                                    className={`${table_sort_header_style} bg-[#00ADEF]`} onClick={() => handleSort(`${dayName}.min_val`, sortState, setSortState, setsortTable, sortTable)}
                                                >
                                                    {`Change Min Inventory`}
                                                    {getArrowIcon(`${dayName}.min_val`)}
                                                </th>
                                            )}
                                            {columnVisibility?.[columns_exchange] && (
                                                <th
                                                    className={`${table_sort_header_style} bg-[#00ADEF]`} onClick={() => handleSort(`${dayName}.exchange_val`, sortState, setSortState, setsortTable, sortTable)}
                                                >
                                                    {`Exchange Min Invent`}
                                                    {getArrowIcon(`${dayName}.exchange_val`)}
                                                </th>
                                            )}
                                            {columnVisibility?.[columns_total] && (
                                                <th
                                                    className={`${table_sort_header_style} bg-[#E3E9F0] text-[#58585A] hover:bg-[#d7dfe8] select-none`} onClick={() => handleSort(`${dayName}.total`, sortState, setSortState, setsortTable, sortTable)}
                                                >
                                                    {`Total`}
                                                    {getArrowIcon(`${dayName}.total`)}
                                                </th>
                                            )}
                                        </React.Fragment>
                                    )
                                })}
                            </tr>
                        </thead>

                        <tbody>
                            {sortTable && sortTable?.map((row: any, rowIndex: number) => {
                                return (
                                    <tr key={`${rowIndex}-${rowIndex}`}>
                                        {columnVisibility?.shipper_name && (
                                            <td className="px-2 py-1 text-[#464255]">
                                                <div>{row?.group || null}</div>
                                            </td>
                                        )}

                                        {columnVisibility?.contract_code && (
                                            <td className="px-2 py-1 text-[#464255]">
                                                <div>{row?.contract_code || null}</div>
                                            </td>
                                        )}

                                        {columnVisibility?.zone && (
                                            <td className="px-2 py-1 text-[#464255]">
                                                <div className="w-full flex justify-center items-center px-[20px]">
                                                    <div className="flex w-[120px] justify-center rounded-full px-1 py-2 text-[#464255]" style={{ backgroundColor: row?.zoneObj?.color }}>{`${row?.zoneObj?.name ? row?.zoneObj?.name : ''}`}</div>
                                                </div>
                                            </td>
                                        )}

                                        {row?.week?.map((day: any, dayIndex: number) => {
                                            const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
                                            const dayName = dayNames[dayIndex];

                                            const min_val = day?.minInven ?? (row?.[dayName]?.min_val ?? 0);
                                            const exchange_val = day?.exchangeMinInven ?? (row?.[dayName]?.exchange_val ?? 0);
                                            const total_val = row?.[dayName]?.total ?? 0;

                                            return (
                                                <React.Fragment key={dayIndex}>
                                                    {/* Change Min Inventory */}
                                                    {columnVisibility?.[`change_min_inventory_${dayName}`] && (
                                                        <td className="px-2 py-1 text-right text-[#464255]">
                                                            {min_val?.toLocaleString(undefined, { minimumFractionDigits: 3 })}
                                                            {/* {row?.data?.[dayName]?.group} */}
                                                        </td>
                                                    )}

                                                    {/* Exchange Min Inventory */}
                                                    {columnVisibility?.[`exchange_min_invent_${dayName}`] && (
                                                        <td className="px-2 py-1 text-right text-[#464255]">
                                                            {exchange_val?.toLocaleString(undefined, { minimumFractionDigits: 3 })}
                                                        </td>
                                                    )}

                                                    {/* Total */}
                                                    {columnVisibility?.[`total_${dayName}`] && (
                                                        <td className="px-2 py-1 text-right text-[#464255] font-semibold">
                                                            {total_val?.toLocaleString(undefined, { minimumFractionDigits: 3 })}
                                                        </td>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}

                                        {columnVisibility?.total && (
                                            <td className="px-2 py-1 text-[#464255] text-right font-semibold">
                                                <div>{row?.totalWeek?.toLocaleString(undefined, { minimumFractionDigits: 3 }) || 0}</div>
                                            </td>
                                        )}
                                    </tr>
                                )
                            })}

                            {mappedTable}
                        </tbody>

                    </table>
                    :
                    <TableSkeleton />
            }

            {
                isLoading && sortTable?.length == 0 && <NodataTable />
            }

        </div>
    )
}

export default TableWeekly;