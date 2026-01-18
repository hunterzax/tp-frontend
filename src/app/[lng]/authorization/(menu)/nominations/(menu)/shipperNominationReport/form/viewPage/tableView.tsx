import { useEffect } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import { addTotalPerRow, formatNumberFourDecimal } from '@/utils/generalFormatter';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
import NodataTable from "@/components/other/nodataTable";
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import dayjs from 'dayjs';


const TableView: React.FC<any> = ({ tableData, openViewForm, columnVisibility, isLoading, userPermission, tabEntry, openDetailForm, tabIndex, subTabIndex, subTabIndexview }) => {

    const dayKeys = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const [sortedData, setSortedData] = useState<any>([]);

    const sortKeyCapRight = tabIndex === 2 && subTabIndex >= 0 && subTabIndex <= 6
        ? `weeklyDay.${dayKeys[subTabIndex]}.capacityRightMMBTUD`
        : "capacityRightMMBTUD";

    const sortKeyNominated = tabIndex === 2 && subTabIndex >= 0 && subTabIndex <= 6
        ? `weeklyDay.${dayKeys[subTabIndex]}.nominatedValueMMBTUD`
        : "nominatedValueMMBTUD";

    const sortKeyOverusage = tabIndex === 2 && subTabIndex >= 0 && subTabIndex <= 6
        ? `weeklyDay.${dayKeys[subTabIndex]}.overusageMMBTUD`
        : "overusageMMBTUD";


    useEffect(() => {
        const sum_val_ = addTotalPerRow(tableData?.dataRow)
        setSortedData(sum_val_);
        // setSortedData(tableData?.dataRow);

        // setSortedData(tableData);
        // setSortedData([
        //     {
        //         gas_day: '2025-01-01',
        //         capacity_right: '20000',
        //         nominated_value: '10000',
        //         overusage: '34000',
        //     }
        // ]);

        if (tabIndex == 2) {
            // ถ้า tabIndex == 2 (weekly)
            // ต้องดู subTabIndex ว่ากดวันไหนมา
            // แล้วเอา gas_day ตั้งต้น + subTabIndex + 1
        }

    }, [tableData])

    const [sortState, setSortState] = useState({ column: null, direction: null });

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    return (
        <div className={`relative h-[calc(100vh-340px)] overflow-y-auto block  rounded-t-md z-1`}>

            {
                isLoading ?
                    <table className={`w-full text-sm text-left rtl:text-right text-gray-500 `}>
                        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                            <tr className="h-9">

                                {columnVisibility.gas_day && (
                                    <th scope="col" className={`${table_sort_header_style} text-center max-w-[200px]`} onClick={() => handleSort("gas_day", sortState, setSortState, setSortedData, tableData.dataRow)}>
                                        {`Gas Day`}
                                        {getArrowIcon("gas_day")}
                                    </th>
                                )}

                                {columnVisibility.area && (
                                    <th scope="col" className={`${table_sort_header_style} text-center !min-w-[120px] !max-w-[200px]`} onClick={() => handleSort("area_text", sortState, setSortState, setSortedData, tableData.dataRow)}>
                                        {`Area`}
                                        {getArrowIcon("area_text")}
                                    </th>
                                )}

                                {/* {columnVisibility.capacity_right && (
                                    <th scope="col" className={`${table_sort_header_style} !min-w-[120px] !max-w-[200px] text-right`} onClick={() => handleSort("capacityRightMMBTUD", sortState, setSortState, setSortedData, tableData.dataRow)}>
                                        {`Capacity Right (MMBTU/D)`}
                                        {getArrowIcon("capacityRightMMBTUD")}
                                    </th>
                                )} */}

                                {/* {columnVisibility.nominated_value && (
                                    <th scope="col" className={`${table_sort_header_style} !min-w-[120px] !max-w-[200px] text-right`} onClick={() => handleSort("nominatedValueMMBTUD", sortState, setSortState, setSortedData, tableData.dataRow)}>
                                        {`Nominated Value (MMBTU/D)`}
                                        {getArrowIcon("nominatedValueMMBTUD")}
                                    </th>
                                )} */}

                                {/* {columnVisibility.overusage && (
                                    <th scope="col" className={`${table_sort_header_style} !min-w-[120px] !max-w-[200px] text-right`} onClick={() => handleSort("overusageMMBTUD", sortState, setSortState, setSortedData, tableData.dataRow)}>
                                        {`Overusage (MMBTU/D)`}
                                        {getArrowIcon("overusageMMBTUD")}
                                    </th>
                                )} */}

                                {columnVisibility.capacity_right && (
                                    <th
                                        scope="col"
                                        className={`${table_sort_header_style} !min-w-[120px] !max-w-[200px] text-right`}
                                        onClick={() =>
                                            handleSort(sortKeyCapRight, sortState, setSortState, setSortedData, tableData.dataRow)
                                        }
                                    >
                                        {`Capacity Right (MMBTU/D)`}
                                        {getArrowIcon(sortKeyCapRight)}
                                    </th>
                                )}

                                {columnVisibility.nominated_value && (
                                    <th
                                        scope="col"
                                        className={`${table_sort_header_style} !min-w-[120px] !max-w-[200px] text-right`}
                                        onClick={() =>
                                            handleSort(sortKeyNominated, sortState, setSortState, setSortedData, tableData.dataRow)
                                        }
                                    >
                                        {`Nominated Value (MMBTU/D)`}
                                        {getArrowIcon(sortKeyNominated)}
                                    </th>
                                )}



                                {columnVisibility.overusage && (
                                    <th
                                        scope="col"
                                        className={`${table_sort_header_style} !min-w-[120px] !max-w-[200px] text-right`}
                                        onClick={() =>
                                            handleSort(sortKeyOverusage, sortState, setSortState, setSortedData, tableData.dataRow)
                                        }
                                    >
                                        {`Overusage (MMBTU/D)`}
                                        {getArrowIcon(sortKeyOverusage)}
                                    </th>
                                )}

                                {/* {columnVisibility.total && (
                                    <th
                                        scope="col"
                                        className={`${table_sort_header_style} !min-w-[120px] !max-w-[200px] text-right`}
                                        onClick={() =>
                                            handleSort(sortKeyOverusage, sortState, setSortState, setSortedData, tableData.dataRow)
                                        }
                                    >
                                        {`Total`}
                                        {getArrowIcon(sortKeyOverusage)}
                                    </th>
                                )} */}

                                {columnVisibility.action && (
                                    <th scope="col" className={`${table_header_style} text-center`}>
                                        {`Detail`}
                                    </th>
                                )}

                            </tr>
                        </thead>

                        <tbody>
                            {
                                // sortedData?.dataRow?.length > 0 && sortedData?.dataRow?.map((row: any, index: any) => {
                                sortedData?.length > 0 && sortedData?.map((row: any, index: any) => {

                                    // sum ค่าของแต่ละ sort_data capacityRightMMBTUD, nominatedValueMMBTUD, overusageMMBTUD แล้วสร้างคีย์ใหม่เป็น total ของแต่ละ object
                                    // let sort_data = [
                                    //     {
                                    //         "gas_day": "02/10/2025",
                                    //         "shipper_name": "B.GRIMM",
                                    //         "area_text": "X3",
                                    //         "zone_text": "EAST",
                                    //         "contract_code_id_arr": [
                                    //             12
                                    //         ],
                                    //         "capacityRightMMBTUD": 25000,
                                    //         "nominatedValueMMBTUD": 1212005.726,
                                    //         "overusageMMBTUD": 1187005.726,
                                    //     },
                                    //     {
                                    //         "gas_day": "02/10/2025",
                                    //         "shipper_name": "B.GRIMM",
                                    //         "area_text": "X3",
                                    //         "zone_text": "EAST",
                                    //         "contract_code_id_arr": [
                                    //             12
                                    //         ],
                                    //         "capacityRightMMBTUD": 1230000,
                                    //         "nominatedValueMMBTUD": 240000.726,
                                    //         "overusageMMBTUD": 500000.726,
                                    //     },
                                    // ]

                                    return (
                                        <tr
                                            key={row?.id}
                                            className={`${table_row_style}`}
                                        >

                                            {columnVisibility.gas_day && (
                                                // <td className="px-2 py-1 text-[#464255] max-w-[60px]">{row?.gasday ? formatDateNoTime(row?.gasday) : ''}</td>
                                                <td className="px-2 py-1 text-[#464255] max-w-[60px] text-center">
                                                    {/* {row?.gas_day ? row?.gas_day : ''} */}
                                                    {row?.gas_day_text ? row?.gas_day_text : row?.gas_day}

                                                    {/* {tabIndex === 2 && row?.gas_day && subTabIndex < 7
                                                        ? dayjs(row.gas_day, "DD/MM/YYYY").add(subTabIndex, 'day').format('DD/MM/YYYY')
                                                        : subTabIndexview ? dayjs(row.gas_day, "DD/MM/YYYY").add(subTabIndexview, 'day').format('DD/MM/YYYY') : row?.gas_day || ''} */}
                                                </td>
                                            )}

                                            {columnVisibility.area && (
                                                <td className="px-2 py-1 justify-center flex min-w-[120px] text-center">
                                                    {
                                                        row?.areaObj ?
                                                            row?.areaObj?.entry_exit_id == 2 ?
                                                                <div
                                                                    className="flex justify-center items-center rounded-full p-1 text-[#464255]"
                                                                    style={{ backgroundColor: row?.areaObj?.color, width: '40px', height: '40px' }}
                                                                >
                                                                    {`${row?.areaObj?.name}`}
                                                                </div>
                                                                :
                                                                <div
                                                                    className="flex justify-center items-center rounded-lg p-1 text-[#464255]"
                                                                    style={{ backgroundColor: row?.areaObj?.color, width: '40px', height: '40px' }}
                                                                >
                                                                    {`${row?.areaObj?.name}`}
                                                                </div>
                                                            : null
                                                    }
                                                </td>
                                            )}

                                            {
                                                // กด tab weekly มา
                                                tabIndex == 2 ? <>
                                                    {columnVisibility.capacity_right && (
                                                        <td className="px-4 py-1 text-[#464255] max-w-[250px] text-right">  {
                                                            subTabIndex < 7 ?
                                                                formatNumberFourDecimal(row?.weeklyDay?.[
                                                                    ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][subTabIndex]
                                                                ]?.capacityRightMMBTUD) ?? "0.000"
                                                                : formatNumberFourDecimal(row?.weeklyDay?.[
                                                                    ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][subTabIndexview]
                                                                ]?.capacityRightMMBTUD) ?? "0.000"
                                                        }</td>
                                                    )}

                                                    {columnVisibility.nominated_value && (
                                                        <td className="px-4 py-1 text-[#464255] max-w-[250px] text-right">  {
                                                            subTabIndex < 7 ?
                                                                formatNumberFourDecimal(row?.weeklyDay?.[
                                                                    ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][subTabIndex]
                                                                ]?.nominatedValueMMBTUD) ?? "0.000"
                                                                : formatNumberFourDecimal(row?.weeklyDay?.[
                                                                    ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][subTabIndexview]
                                                                ]?.nominatedValueMMBTUD) ?? "0.000"
                                                        }</td>
                                                    )}

                                                    {columnVisibility.overusage && (
                                                        <td className="px-4 py-1 text-[#464255] max-w-[250px] text-right">  {
                                                            subTabIndex < 7 ?
                                                                formatNumberFourDecimal(row?.weeklyDay?.[
                                                                    ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][subTabIndex]
                                                                ]?.overusageMMBTUD) ?? "0.000"
                                                                : formatNumberFourDecimal(row?.weeklyDay?.[
                                                                    ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][subTabIndexview]
                                                                ]?.overusageMMBTUD) ?? "0.000"
                                                        }</td>
                                                    )}

                                                </>
                                                    :
                                                    <>
                                                        {columnVisibility.capacity_right && (
                                                            <td className="px-4 py-1 text-[#464255] max-w-[60px] text-right">{row?.capacityRightMMBTUD ? formatNumberFourDecimal(row?.capacityRightMMBTUD) : '0.0000'}</td>
                                                        )}

                                                        {columnVisibility.nominated_value && (
                                                            <td className="px-4 py-1 text-[#464255] max-w-[60px] text-right">{row?.nominatedValueMMBTUD ? formatNumberFourDecimal(row?.nominatedValueMMBTUD) : '0.0000'}</td>
                                                        )}

                                                        {columnVisibility.overusage && (
                                                            <td className="px-4 py-1 text-[#464255] max-w-[60px] text-right">{row?.overusageMMBTUD ? formatNumberFourDecimal(row?.overusageMMBTUD) : '0.0000'}</td>
                                                        )}
                                                    </>
                                            }
                                            {/* 
                                            {columnVisibility.total && (
                                                <td className="px-4 py-1 text-[#464255] max-w-[60px] text-right">
                                                    {row?.total ? formatNumberFourDecimal(row?.total) : '0.0000'}
                                                </td>
                                            )} */}

                                            {columnVisibility.action && (
                                                <td className="px-2 py-1 text-center">
                                                    <div className="inline-flex items-center justify-center relative">
                                                        <button
                                                            type="button"
                                                            // className="flex items-center justify-center px-[2px] py-[2px] rounded-md border border-none relative"
                                                            className="flex items-center justify-center px-[2px] py-[2px] rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative"
                                                            onClick={() => openDetailForm(row)}
                                                            // disabled={!userPermission?.f_view && true}
                                                            disabled={false}
                                                        >
                                                            <RemoveRedEyeOutlinedIcon sx={{ fontSize: 18, color: '#464255', '&:hover': { color: '#ffffff' } }} />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>

                                    )
                                })
                            }
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

export default TableView;