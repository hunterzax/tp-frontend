import { useEffect, useRef } from "react";
import React, { FC, useState } from 'react';
import TableSkeleton, { DefaultSkeleton } from '@/components/material_custom/DefaultSkeleton';
import { flattenWeeklyDay, formatDateYyyyMmDd, formatNumberFourDecimal, formatNumberThreeDecimal, getCurrentWeekSundayYyyyMmDd, getNextWeekSundayYyyyMmDd } from '@/utils/generalFormatter';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort, handleSortGasDay } from "@/utils/sortTable";
import NodataTable from "@/components/other/nodataTable";
import dayjs from 'dayjs';
import BtnActionTable from "@/components/other/btnActionInTable";
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';


interface TableProps {
    tableData: any;
    isLoading: any;
    isSearch: any;
    isResetSearch?: any;
    setIsResetSearch?: any;
    tabIndex: any;
    columnVisibility: any;
    gasWeekFilter?: any;
    oldGasWeekFilter?: any;
    userPermission?: any;
    subTabIndex?: any;
    openViewForm: (id: any) => void;
}

const TableWeekly: React.FC<TableProps> = ({ tableData, openViewForm, isLoading, isSearch, tabIndex, columnVisibility, userPermission, gasWeekFilter, oldGasWeekFilter, isResetSearch, setIsResetSearch, subTabIndex }) => {

    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(tableData);
    const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday",];

    // let date_next_sunday = gasWeekFilter && isSearch ? formatDateYyyyMmDd(gasWeekFilter) : getNextWeekSundayYyyyMmDd()
    let date_next_sunday = gasWeekFilter && isSearch ? formatDateYyyyMmDd(gasWeekFilter) : oldGasWeekFilter && !isResetSearch ? formatDateYyyyMmDd(oldGasWeekFilter) : getCurrentWeekSundayYyyyMmDd()

    useEffect(() => {
        // if (tableData && tableData.length > 0) {
        //     setSortedData(tableData);
        // }
        if (tableData?.length > 0) {
            if (subTabIndex == 7) {
                const output_data = flattenWeeklyDay(tableData);
                setSortedData(output_data);
            } else {
                setSortedData(tableData);
            }
        } else {
            setSortedData([]);
        }


    }, [tableData]);

    // useEffect(() => {
    //     if (tableData && tableData.length > 0) {
    //         let filteredData = tableData.filter((item: any) =>
    //             dayjs(item.sunday?.date, "DD/MM/YYYY").format("YYYY-MM-DD") === date_next_sunday
    //         );
    //         setSortedData(filteredData);
    //     }
    // }, [tableData]);

    // useEffect(() => {
    //     if (tableData && tableData.length > 0) {
    //         let filteredData = tableData.filter((item: any) =>
    //             dayjs(item.sunday?.date, "DD/MM/YYYY").format("YYYY-MM-DD") === date_next_sunday
    //         );
    //         setSortedData(filteredData);
    //     }
    //     // setSortedData(tableData);
    // }, [date_next_sunday]);

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    const [openPopoverId, setOpenPopoverId] = useState(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const togglePopover = (id?: any) => {
        if (openPopoverId === id) {
            setOpenPopoverId(null); // Close the popover if it's already open
        } else {
            setOpenPopoverId(id); // Open the popover for the clicked row
        }
    };

    const toggleMenu = (mode: any, id: any) => {
        switch (mode) {
            case "view":
                openViewForm(id);
                setOpenPopoverId(null); // close popover
                break;
        }
    }

    const handleClickOutside = (event: MouseEvent) => {
        if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
            setOpenPopoverId(null);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [popoverRef]);

    return (
        <div className={`relative h-[calc(100vh-380px)] overflow-y-auto block  rounded-t-md z-1`}>

            {
                isLoading ?
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                            <tr className="h-9">

                                {columnVisibility.gas_day && (
                                    <th scope="col" className={`${table_sort_header_style} text-center max-w-[200px]`} onClick={() => handleSortGasDay("gas_day", sortState, setSortState, setSortedData, tableData)}>
                                        {`Gas Day`}
                                        {getArrowIcon("gas_day")}
                                    </th>
                                )}

                                {columnVisibility.shipper_name && (
                                    <th scope="col" className={`${table_sort_header_style} text-center !min-w-[120px] !max-w-[200px]`} onClick={() => handleSort("shipper_name", sortState, setSortState, setSortedData, tableData)}>
                                        {`Shipper Name`}
                                        {getArrowIcon("shipper_name")}
                                    </th>
                                )}

                                {columnVisibility.capacity_right && (
                                    <th scope="col" className={`${table_sort_header_style} text-center !min-w-[120px] !max-w-[250px]`} onClick={() => handleSort("weeklyDay.friday.capacityRightMMBTUD", sortState, setSortState, setSortedData, tableData)}>
                                        {`Capacity Right (MMBTU/D)`}
                                        {getArrowIcon("weeklyDay.friday.capacityRightMMBTUD")}
                                    </th>
                                )}

                                {columnVisibility.nominated_value && (
                                    <th scope="col" className={`${table_sort_header_style} text-center !min-w-[120px] !max-w-[300px]`}
                                        // onClick={() => handleSort("nominatedValueMMBTUD", sortState, setSortState, setSortedData, tableData)}
                                        onClick={() => handleSort("weeklyDay.friday.nominatedValueMMBTUD", sortState, setSortState, setSortedData, tableData)}
                                    >
                                        {`Nominated Value (MMBTU/D)`}
                                        {getArrowIcon("weeklyDay.friday.nominatedValueMMBTUD")}
                                    </th>
                                )}

                                {columnVisibility.overusage && (
                                    <th scope="col" className={`${table_sort_header_style} text-center !min-w-[120px] !max-w-[300px]`} onClick={() => handleSort("weeklyDay.friday.overusageMMBTUD", sortState, setSortState, setSortedData, tableData)}>
                                        {`Overusage (MMBTU/D)`}
                                        {getArrowIcon("weeklyDay.friday.overusageMMBTUD")}
                                    </th>
                                )}

                                {columnVisibility.imbalance && (
                                    <th scope="col" className={`${table_sort_header_style} text-center !min-w-[120px] !max-w-[250px]`} onClick={() => handleSort("weeklyDay.friday.imbalanceMMBTUD", sortState, setSortState, setSortedData, tableData)}>
                                        {`Imbalance (MMBTU/D)`}
                                        {getArrowIcon("weeklyDay.friday.imbalanceMMBTUD")}
                                    </th>
                                )}

                                {columnVisibility.action && (
                                    <th scope="col" className={`${table_header_style} text-center`}>
                                        {`Action`}
                                    </th>
                                )}

                            </tr>
                        </thead>

                        <tbody>
                            {sortedData && subTabIndex !== 7 && sortedData?.map((row: any, index: any) => (
                                <tr
                                    key={row?.id}
                                    className={`${table_row_style}`}
                                >

                                    {columnVisibility.gas_day && (
                                        // <td className="px-2 py-1 text-[#464255] max-w-[60px]">{row?.gasday ? formatDateNoTime(row?.gasday) : ''}</td>
                                        // <td className="px-2 py-1 text-[#464255] max-w-[60px]">{row?.gas_day_text ? row?.gas_day_text : ''}</td>

                                        <td className="px-2 py-1 text-[#464255] max-w-[60px]">
                                            {row?.gas_day_text
                                                ? dayjs(row.gas_day_text, "DD/MM/YYYY").add(subTabIndex, "day").format("DD/MM/YYYY")
                                                : row?.gas_day_text ?? ''}
                                        </td>
                                    )}

                                    {columnVisibility.shipper_name && (
                                        <td className="px-2 py-1 text-[#464255] max-w-[60px]">{row?.shipper_name ? row?.shipper_name : ''}</td>
                                    )}

                                    {/* {columnVisibility.capacity_right && (
                                        <td className="px-4 py-1 text-[#464255] max-w-[250px] text-right">{row?.capacityRightMMBTUD ? formatNumberFourDecimal(row?.capacityRightMMBTUD) : '0.0000'}</td>
                                    )} */}

                                    {/* {columnVisibility.nominated_value && (
                                        <td className="px-4 py-1 text-[#464255] max-w-[300px] text-right">{row?.nominatedValueMMBTUD ? formatNumberFourDecimal(row?.nominatedValueMMBTUD) : '0.0000'}</td>
                                    )} */}

                                    {/* {columnVisibility.overusage && (
                                        <td className="px-4 py-1 text-[#464255] max-w-[300px] text-right">{row?.overusageMMBTUD ? formatNumberFourDecimal(row?.overusageMMBTUD) : '0.0000'}</td>
                                    )} */}

                                    {/* {columnVisibility.imbalance && (
                                        <td className="px-4 py-1 text-[#464255] max-w-[250px] text-right">{row?.imbalanceMMBTUD ? formatNumberFourDecimal(row?.imbalanceMMBTUD) : '0.0000'}</td>
                                    )} */}

                                    {columnVisibility.capacity_right && (
                                        <td className="px-4 py-1 text-[#464255] max-w-[250px] text-right">  {
                                            formatNumberFourDecimal(row?.weeklyDay?.[
                                                ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][subTabIndex]
                                            ]?.capacityRightMMBTUD) ?? "0.000"
                                        }</td>
                                    )}

                                    {columnVisibility.nominated_value && (
                                        <td className="px-4 py-1 text-[#464255] max-w-[250px] text-right">  {
                                            formatNumberFourDecimal(row?.weeklyDay?.[
                                                ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][subTabIndex]
                                            ]?.nominatedValueMMBTUD) ?? "0.000"
                                        }</td>
                                    )}

                                    {columnVisibility.overusage && (
                                        <td className="px-4 py-1 text-[#464255] max-w-[250px] text-right">  {
                                            formatNumberFourDecimal(row?.weeklyDay?.[
                                                ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][subTabIndex]
                                            ]?.overusageMMBTUD) ?? "0.000"
                                        }</td>
                                    )}

                                    {columnVisibility.imbalance && (
                                        <td className="px-4 py-1 text-[#464255] max-w-[250px] text-right">  {
                                            formatNumberFourDecimal(row?.weeklyDay?.[
                                                ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][subTabIndex]
                                            ]?.imbalanceMMBTUD) ?? "0.000"
                                        }</td>
                                    )}

                                    {columnVisibility.action && (
                                        <td className="px-2 py-1">
                                            <div className="relative inline-flex justify-center items-center w-full">
                                                <BtnActionTable
                                                    togglePopover={togglePopover}
                                                    row_id={row?.id}
                                                    // disable={!userPermission?.f_view ? true : false}
                                                    disable={!userPermission?.b_manage ? true : false}
                                                />
                                                {openPopoverId === row?.id && (
                                                    <div ref={popoverRef}
                                                        className="absolute left-[-8rem] top-[-10px] mt-2 w-36 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                                                        <ul className="py-2">
                                                            {
                                                                userPermission?.b_manage && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("view", row?.id) }}><RemoveRedEyeOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`View`}</li>
                                                            }
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    )}

                                </tr>
                            ))}

                            {sortedData && subTabIndex == 7 && sortedData?.flatMap((row: any) =>
                                Object.entries(row.weeklyDay ?? {}).map(([day, info]: any) => {
                                    // ถ้าอยากเรียงตาม index 0‑6 แทน Object.entries() → ใช้ dayNames.map(...)
                                    const dayIdx = dayNames.indexOf(day);           // ใช้ทำ key / class เพิ่มได้

                                    return (
                                        <tr key={`${row.id}-${day}`} className={table_row_style}>
                                            {/* วันที่ของวันนั้น */}
                                            {columnVisibility.gas_day && (
                                                <td className="px-2 py-1 text-[#464255] max-w-[80px]">
                                                    {dayjs(info.gas_day_text, "DD/MM/YYYY").format("DD/MM/YYYY")}
                                                </td>
                                            )}

                                            {columnVisibility.shipper_name && (
                                                <td className="px-2 py-1 text-[#464255] max-w-[120px]">
                                                    {row.shipper_name ?? "-"}
                                                </td>
                                            )}

                                            {columnVisibility.capacity_right && (
                                                <td className="px-4 py-1 text-[#464255] max-w-[250px] text-right">
                                                    {formatNumberFourDecimal(info.capacityRightMMBTUD)}
                                                </td>
                                            )}

                                            {columnVisibility.nominated_value && (
                                                <td className="px-4 py-1 text-[#464255] max-w-[250px] text-right">
                                                    {formatNumberFourDecimal(info.nominatedValueMMBTUD)}
                                                </td>
                                            )}

                                            {columnVisibility.overusage && (
                                                <td className="px-4 py-1 text-[#464255] max-w-[250px] text-right">
                                                    {formatNumberFourDecimal(info.overusageMMBTUD)}
                                                </td>
                                            )}

                                            {columnVisibility.imbalance && (
                                                <td className="px-4 py-1 text-[#464255] max-w-[250px] text-right">
                                                    {formatNumberFourDecimal(info.imbalanceMMBTUD)}
                                                </td>
                                            )}

                                            {columnVisibility.action && (
                                                <td className="px-2 py-1">
                                                    <div className="relative inline-flex justify-center items-center w-full">
                                                        <BtnActionTable
                                                            togglePopover={togglePopover}
                                                            // row_id={row?.id}
                                                            row_id={`${row.id}-${day}`}
                                                            // disable={!userPermission?.f_view ? true : false}
                                                            disable={!userPermission?.b_manage ? true : false}
                                                        />
                                                        {/* {openPopoverId === row?.id && ( */}
                                                        {openPopoverId === `${row.id}-${day}` && (
                                                            <div ref={popoverRef}
                                                                className="absolute left-[-8rem] top-[-10px] mt-2 w-36 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                                                                <ul className="py-2">
                                                                    {
                                                                        userPermission?.b_manage && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("view", row?.id) }}><RemoveRedEyeOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`View`}</li>
                                                                    }
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })
                            )}


                        </tbody>
                    </table>
                    :
                    <TableSkeleton />
            }

            {
                isLoading && sortedData?.length == 0 && <NodataTable />
            }

        </div>
    )
}

export default TableWeekly;