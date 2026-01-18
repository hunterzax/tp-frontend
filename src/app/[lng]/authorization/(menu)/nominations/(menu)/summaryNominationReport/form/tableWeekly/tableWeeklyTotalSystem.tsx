import { useEffect, useRef } from "react";
import React, { FC, useState } from 'react';
import TableSkeleton, { DefaultSkeleton } from '@/components/material_custom/DefaultSkeleton';
import { formatNumberThreeDecimal, formatNumberThreeDecimalNoComma, formatNumberThreeDecimalNom, formatNumberTwoDecimalNom, getContrastTextColor, getCurrentWeekDatesYyyyMmDd, getCurrentWeekDatesYyyyMmDdFromDate, getCurrentWeekSundayYyyyMmDd } from '@/utils/generalFormatter';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
import NodataTable from "@/components/other/nodataTable";
import { Tune } from "@mui/icons-material"
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import PaginationComponent from "@/components/other/globalPagination";
import BtnExport from "@/components/other/btnExport";
import SearchInput from "@/components/other/searchInput";
import dayjs from 'dayjs';

// หน้านี้มี Tab Nomination, Area, Total System
// tab MMSCF, MMBTU
// tab hour ['All Day' ,'1-6 Hr.' , '7-12 Hr.' , '13-18 Hr.' , '19-24 Hr.']

const TableWeeklyTotalSystem: React.FC<any> = ({ tableData, isLoading, userPermission, zoneText, tempData, setTempData, tempDataConcept, setTempDataConcept, areaMaster, entryExitMaster, setIsEdited, tabEntry, tabConcept, zoneMaster, srchStartDate }) => {

    const [dataTable, setDataTable] = useState<any>([]);
    const [sortedData, setSortedData] = useState<any>([]);

    // useEffect(() => {
    //     let date_format = dayjs(srchStartDate).format('DD-MM-YYYY')

    //     let date_on_header = getCurrentWeekDatesYyyyMmDdFromDate(date_format)
    // }, [srchStartDate])


    useEffect(() => {
        // data weekly total system
        setDataTable(tableData)
        // setSortedData(tableData?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
        setSortedData(tableData)

    }, [tableData])
    const [sortState, setSortState] = useState({ column: null, direction: null });

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    // ===================== TABLE HEADER MAP =====================
    // const dayMapping = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    // const startKey = 14;
    // const endKey = 20;

    // ===================== TABLE HEADER MAP =====================
    const hours = Array.from({ length: 24 }, (_, i) => ({
        key: `h${i + 1}`,
        label: `H${i + 1}`,
        timeRange: `${String(i).padStart(2, "0")}:01 - ${String(i + 1).padStart(2, "0")}:00`
    }));

    // ############### TAB ###############
    const [tabIndexHour, setTabIndexHour] = useState(0);
    // const handleChange = (event: any, newValue: any) => {
    //     // 0 = All Day
    //     // 1 = 1-6 Hr
    //     // 2 = 7-12 Hr
    //     // 3 = 13-18 Hr
    //     // 4 = 19-24 Hr
    //     setTabIndexHour(newValue);
    // };

    const getVisibleHours = () => {

        switch (tabIndexHour) {
            case 0: return hours;  // H1 - H6
            case 1: return hours.slice(0, 6);  // H1 - H6
            case 2: return hours.slice(6, 12); // H7 - H12
            case 3: return hours.slice(12, 18); // H13 - H18
            case 4: return hours.slice(18, 24); // H19 - H24

            default: return [];
        }
    };

    useEffect(() => {
        getVisibleHours();
    }, [tabIndexHour])

    // ############### COLUMN SHOW/HIDE ENTRY / EXIT ###############

    const initialColumnsTabEntryExit: any = [
        { key: 'zone', label: 'Zone', visible: true }, // always show
        { key: 'entry_exit', label: 'Entry/Exit', visible: true }, // always show
        { key: 'area', label: 'Area', visible: true }, // always show
        { key: 'nomination_point', label: 'Nomination Point', visible: true },
        { key: 'park_unpark_instructed_flows', label: 'Park/Unpark-Instructed Flows', visible: true }, // always show
        { key: 'customer_type', label: 'Customer Type', visible: true }, // always show
        { key: 'unit', label: 'Units', visible: true }, // always show

        { key: 'wi', label: 'WI', visible: true }, // always show
        { key: 'hv', label: 'HV', visible: true }, // always show
        { key: 'sg', label: 'SG', visible: true }, // always show

        { key: 'sunday', label: 'Sunday', visible: true },
        { key: 'utilization_sunday', label: 'Utilization (%)', visible: true },
        { key: 'monday', label: 'Monday', visible: true },
        { key: 'utilization_monday', label: 'Utilization (%)', visible: true },
        { key: 'tuesday', label: 'Tuesday', visible: true },
        { key: 'utilization_tuesday', label: 'Utilization (%)', visible: true },
        { key: 'wednesday', label: 'Wednesday', visible: true },
        { key: 'utilization_wednesday', label: 'Utilization (%)', visible: true },
        { key: 'thursday', label: 'Thursday', visible: true },
        { key: 'utilization_thursday', label: 'Utilization (%)', visible: true },
        { key: 'friday', label: 'Friday', visible: true },
        { key: 'utilization_friday', label: 'Utilization (%)', visible: true },
        { key: 'saturday', label: 'Saturday', visible: true },
        { key: 'utilization_saturday', label: 'Utilization (%)', visible: true },
    ];

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const getInitialColumns = () => initialColumnsTabEntryExit;

    const [columnVisibility, setColumnVisibility] = useState<any>(
        Object.fromEntries(getInitialColumns().map((column: any) => [column.key, column.visible]))
    );

    useEffect(() => {
        setColumnVisibility(
            Object.fromEntries(getInitialColumns().map((column: any) => [column.key, column.visible]))
        );
    }, [tabIndexHour]); // Runs when tabIndex changes

    const handleTogglePopover = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const handleColumnToggle = (columnKey: string) => {
        setColumnVisibility((prev: any) => ({
            ...prev,
            [columnKey]: !prev[columnKey]
        }));
    };

    // ############### PAGINATION ###############
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [paginatedData, setPaginatedData] = useState<any[]>([]);

    const [dateOnHeader, setDateOnHeader] = useState<any>([]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (itemsPerPage: number) => {
        setItemsPerPage(itemsPerPage);
        setCurrentPage(1);
    };

    useEffect(() => {
        if (sortedData) {
            setPaginatedData(sortedData?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)) //old
            // setPaginatedData(dataTable?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)) // new
        }
    }, [sortedData, currentPage, itemsPerPage])

    // let date_next_sunday = getCurrentWeekDatesYyyyMmDd()

    useEffect(() => {
        if (tableData) {

            // "11/05/2025"
            // tableData[0].gas_day_text
            // setDateOnHeader(getCurrentWeekDatesYyyyMmDdFromDate(tableData[0]?.gas_day_text))

            let date_format = dayjs(srchStartDate).format('DD-MM-YYYY')
            let date_on_header = getCurrentWeekDatesYyyyMmDdFromDate(date_format)
            setDateOnHeader(date_on_header)
        }
    }, [tableData])

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {
        const queryLower = query.replace(/\s+/g, '')?.toLowerCase().trim();
        let filtered = dataTable.filter(
            (item: any) => {

                // const entryMatch = item?.entry_exit_id === 1 && queryLower.includes('entry');
                // const exitMatch = item?.entry_exit_id === 2 && queryLower.includes('exit');
                const entryMatch = item?.entry_exit_id === 1 && queryLower.includes('entry') || item?.entry_exit_id === 1 && queryLower.includes('entr') || item?.entry_exit_id === 1 && queryLower.includes('ent') || item?.entry_exit_id === 1 && queryLower.includes('try') || item?.entry_exit_id === 1 && queryLower.includes('ry')
                const exitMatch = item?.entry_exit_id === 2 && queryLower.includes('exit') || item?.entry_exit_id === 2 && queryLower.includes('exi') || item?.entry_exit_id === 2 && queryLower.includes('ex') || item?.entry_exit_id === 2 && queryLower.includes('xit') || item?.entry_exit_id === 2 && queryLower.includes('it');

                return (
                    entryMatch ||
                    exitMatch ||
                    item?.zone_text?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.area_text?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.nomination_point?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.customerType?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    item?.wi?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.wi)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.wi)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    item?.hv?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.hv)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.hv)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    item?.sg?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.sg)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.sg)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    item?.parkUnparkInstructedFlows?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.units?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    formatNumberThreeDecimalNoComma(item?.wi)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.hv)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.sg)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    item?.sunday?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.monday?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.tuesday?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.wednesday?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.thursday?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.friday?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.saturday?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    formatNumberThreeDecimalNom(item?.sunday)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.monday)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.tuesday)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.wednesday)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.thursday)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.friday)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.saturday)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    formatNumberThreeDecimalNoComma(item?.sunday)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.monday)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.tuesday)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.wednesday)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.thursday)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.friday)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.saturday)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||


                    item?.sunday_utilization?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.monday_utilization?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.tuesday_utilization?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.wednesday_utilization?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.thursday_utilization?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.friday_utilization?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.saturday_utilization?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.sunday_utilization)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.monday_utilization)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.tuesday_utilization)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.wednesday_utilization)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.thursday_utilization)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.friday_utilization)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.saturday_utilization)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    formatNumberThreeDecimalNoComma(item?.sunday_utilization)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.monday_utilization)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.tuesday_utilization)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.wednesday_utilization)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.thursday_utilization)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.friday_utilization)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.saturday_utilization)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)
                )
            }
        );

        setSortedData(filtered);
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
    }

    return (
        // <div className={`relative h-[calc(100vh-340px)] overflow-y-auto block  rounded-t-md z-1`}>
        <div className={`relative h-[calc(100vh-140px)] overflow-y-hidden  block  rounded-t-md z-1`}>

            <div className="w-full h-[82%] px-4 border-[#DFE4EA] border-[1px] gap-2 rounded-xl shadow-sm flex flex-col">
                <div className="flex items-center space-x-2 py-4 px-1">
                    <div onClick={handleTogglePopover}>
                        <Tune
                            className="cursor-pointer rounded-lg"
                            style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                        />
                    </div>

                    <div className="w-[100%] flex flex-wrap gap-2 justify-end">
                        <SearchInput onSearch={handleSearch} />
                        <BtnExport
                            textRender={"Export"}
                            data={sortedData}
                            path="nomination/summary-nomination-report"
                            can_export={userPermission ? userPermission?.f_export : false}
                            columnVisibility={columnVisibility}
                            initialColumns={initialColumnsTabEntryExit}
                            specificMenu='summary-nomination-report-total-weekly'
                            type={`['total']['weekly']`}
                            specificData={dateOnHeader}
                        />
                    </div>
                </div>

                <div className="overflow-y-auto overflow-x-auto w-full h-[70dvh]">
                    {
                        isLoading ? <>
                            <table className={`w-full text-sm text-left rtl:text-right text-gray-500 `}>
                                <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                                    <tr className="h-20">

                                        {/* ที่ handleSort ส่ง paginatedData แทน dataTable เพราะข้อนี้ */}
                                        {/* All > Weekly > Nomination > MMSCF > Smart Sear แล้ว Sort Column ทำให้ Smart Search หลุด https://app.clickup.com/t/86euy05du */}

                                        {columnVisibility.zone && (
                                            // <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("zone_text", sortState, setSortState, setSortedData, dataTable)}>
                                            <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("zone_text", sortState, setSortState, setSortedData, paginatedData)}>
                                                {`Zone`}
                                                {getArrowIcon("zone_text")}
                                            </th>
                                        )}

                                        {columnVisibility.entry_exit && (
                                            // <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("entry_exit_id", sortState, setSortState, setSortedData, dataTable)}>
                                            <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("entry_exit_id", sortState, setSortState, setSortedData, paginatedData)}>
                                                {`Entry / Exit`}
                                                {getArrowIcon("entry_exit_id")}
                                            </th>
                                        )}

                                        {columnVisibility.area && (
                                            // <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("area_text", sortState, setSortState, setSortedData, dataTable)}>
                                            <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("area_text", sortState, setSortState, setSortedData, paginatedData)}>
                                                {`Area`}
                                                {getArrowIcon("area_text")}
                                            </th>
                                        )}

                                        {columnVisibility.nomination_point && (
                                            // <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("nomination_point", sortState, setSortState, setSortedData, dataTable)}>
                                            <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("nomination_point", sortState, setSortState, setSortedData, paginatedData)}>
                                                {`Nomination Point`}
                                                {getArrowIcon("nomination_point")}
                                            </th>
                                        )}

                                        {columnVisibility.park_unpark_instructed_flows && (
                                            // <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("parkUnparkInstructedFlows", sortState, setSortState, setSortedData, dataTable)}>
                                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("parkUnparkInstructedFlows", sortState, setSortState, setSortedData, paginatedData)}>
                                                {`Park/Unpark-Instructed Flows`}
                                                {getArrowIcon("parkUnparkInstructedFlows")}
                                            </th>
                                        )}

                                        {columnVisibility.customer_type && (
                                            // <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("customerType", sortState, setSortState, setSortedData, dataTable)}>
                                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("customerType", sortState, setSortState, setSortedData, paginatedData)}>
                                                {`Customer Type`}
                                                {getArrowIcon("customerType")}
                                            </th>
                                        )}

                                        {columnVisibility.unit && (
                                            // <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("units", sortState, setSortState, setSortedData, dataTable)}>
                                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("units", sortState, setSortState, setSortedData, paginatedData)}>
                                                {`Units`}
                                                {getArrowIcon("units")}
                                            </th>
                                        )}

                                        {columnVisibility.wi && (
                                            // <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("wi", sortState, setSortState, setSortedData, dataTable)}>
                                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("wi", sortState, setSortState, setSortedData, paginatedData)}>
                                                {`WI`}
                                                {getArrowIcon("wi")}
                                            </th>
                                        )}

                                        {columnVisibility.hv && (
                                            // <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("hv", sortState, setSortState, setSortedData, dataTable)}>
                                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("hv", sortState, setSortState, setSortedData, paginatedData)}>
                                                {`HV`}
                                                {getArrowIcon("hv")}
                                            </th>
                                        )}

                                        {columnVisibility.sg && (
                                            // <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("sg", sortState, setSortState, setSortedData, dataTable)}>
                                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("sg", sortState, setSortState, setSortedData, paginatedData)}>
                                                {`SG`}
                                                {getArrowIcon("sg")}
                                            </th>
                                        )}

                                        {columnVisibility.sunday && (
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("sunday", sortState, setSortState, setSortedData, dataTable)}>
                                            <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("sunday", sortState, setSortState, setSortedData, paginatedData)}>
                                                <div>{`Sunday`}</div>
                                                {/* <div>{date_next_sunday[0]}</div> */}
                                                {/* <div>{dateOnHeader[0]}</div> */}
                                                <div>{dateOnHeader[0] !== 'Invalid Date' ? dateOnHeader[0] : ''}</div>

                                                {getArrowIcon("sunday")}
                                            </th>
                                        )}
                                        {columnVisibility.utilization_sunday && (
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("sunday_utilization", sortState, setSortState, setSortedData, dataTable)}>
                                            <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("sunday_utilization", sortState, setSortState, setSortedData, paginatedData)}>
                                                {`Utilization (%)`}
                                                {getArrowIcon("sunday_utilization")}
                                            </th>
                                        )}

                                        {columnVisibility.monday && (
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("monday", sortState, setSortState, setSortedData, dataTable)}>
                                            <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("monday", sortState, setSortState, setSortedData, paginatedData)}>
                                                <div>{`Monday`}</div>
                                                {/* <div>{date_next_sunday[1]}</div> */}
                                                {/* <div>{dateOnHeader[1]}</div> */}
                                                <div>{dateOnHeader[1] !== 'Invalid Date' ? dateOnHeader[1] : ''}</div>

                                                {getArrowIcon("monday")}
                                            </th>
                                        )}

                                        {columnVisibility.utilization_monday && (
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("monday_utilization", sortState, setSortState, setSortedData, dataTable)}>
                                            <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("monday_utilization", sortState, setSortState, setSortedData, paginatedData)}>
                                                {`Utilization (%)`}
                                                {getArrowIcon("monday_utilization")}
                                            </th>
                                        )}

                                        {columnVisibility.tuesday && (
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("tuesday", sortState, setSortState, setSortedData, dataTable)}>
                                            <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("tuesday", sortState, setSortState, setSortedData, paginatedData)}>
                                                <div>{`Tuesday`}</div>
                                                {/* <div>{date_next_sunday[2]}</div> */}
                                                {/* <div>{dateOnHeader[2]}</div> */}
                                                <div>{dateOnHeader[2] !== 'Invalid Date' ? dateOnHeader[2] : ''}</div>

                                                {getArrowIcon("tuesday")}
                                            </th>
                                        )}

                                        {columnVisibility.utilization_tuesday && (
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("tuesday_utilization", sortState, setSortState, setSortedData, dataTable)}>
                                            <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("tuesday_utilization", sortState, setSortState, setSortedData, paginatedData)}>
                                                {`Utilization (%)`}
                                                {getArrowIcon("tuesday_utilization")}
                                            </th>
                                        )}

                                        {columnVisibility.wednesday && (
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("wednesday", sortState, setSortState, setSortedData, dataTable)}>
                                            <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("wednesday", sortState, setSortState, setSortedData, paginatedData)}>
                                                <div>{`Wednesday`}</div>
                                                {/* <div>{date_next_sunday[3]}</div> */}
                                                {/* <div>{dateOnHeader[3]}</div> */}
                                                <div>{dateOnHeader[3] !== 'Invalid Date' ? dateOnHeader[3] : ''}</div>

                                                {getArrowIcon("wednesday")}
                                            </th>
                                        )}

                                        {columnVisibility.utilization_wednesday && (
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("wednesday_utilization", sortState, setSortState, setSortedData, dataTable)}>
                                            <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("wednesday_utilization", sortState, setSortState, setSortedData, paginatedData)}>
                                                {`Utilization (%)`}
                                                {getArrowIcon("wednesday_utilization")}
                                            </th>
                                        )}

                                        {columnVisibility.thursday && (
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("thursday", sortState, setSortState, setSortedData, dataTable)}>
                                            <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("thursday", sortState, setSortState, setSortedData, paginatedData)}>
                                                <div>{`Thursday`}</div>
                                                {/* <div>{date_next_sunday[4]}</div> */}
                                                {/* <div>{dateOnHeader[4]}</div> */}
                                                <div>{dateOnHeader[4] !== 'Invalid Date' ? dateOnHeader[4] : ''}</div>

                                                {getArrowIcon("thursday")}
                                            </th>
                                        )}

                                        {columnVisibility.utilization_thursday && (
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("thursday_utilization", sortState, setSortState, setSortedData, dataTable)}>
                                            <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("thursday_utilization", sortState, setSortState, setSortedData, paginatedData)}>
                                                {`Utilization (%)`}
                                                {getArrowIcon("thursday_utilization")}
                                            </th>
                                        )}

                                        {columnVisibility.friday && (
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("friday", sortState, setSortState, setSortedData, dataTable)}>
                                            <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("friday", sortState, setSortState, setSortedData, paginatedData)}>
                                                <div>{`Friday`}</div>
                                                {/* <div>{date_next_sunday[5]}</div> */}
                                                {/* <div>{dateOnHeader[5]}</div> */}
                                                <div>{dateOnHeader[5] !== 'Invalid Date' ? dateOnHeader[5] : ''}</div>

                                                {getArrowIcon("friday")}
                                            </th>
                                        )}

                                        {columnVisibility.utilization_friday && (
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("friday_utilization", sortState, setSortState, setSortedData, dataTable)}>
                                            <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("friday_utilization", sortState, setSortState, setSortedData, paginatedData)}>
                                                {`Utilization (%)`}
                                                {getArrowIcon("friday_utilization")}
                                            </th>
                                        )}

                                        {columnVisibility.saturday && (
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("saturday", sortState, setSortState, setSortedData, dataTable)}>
                                            <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("saturday", sortState, setSortState, setSortedData, paginatedData)}>
                                                <div>{`Saturday`}</div>
                                                {/* <div>{date_next_sunday[6]}</div> */}
                                                {/* <div>{dateOnHeader[6]}</div> */}
                                                <div>{dateOnHeader[6] !== 'Invalid Date' ? dateOnHeader[6] : ''}</div>

                                                {getArrowIcon("saturday")}
                                            </th>
                                        )}

                                        {columnVisibility.utilization_saturday && (
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px] `} onClick={() => handleSort("saturday_utilization", sortState, setSortState, setSortedData, dataTable)}>
                                            <th scope="col" className={`${table_sort_header_style} min-w-[120px] `} onClick={() => handleSort("saturday_utilization", sortState, setSortState, setSortedData, paginatedData)}>
                                                {`Utilization (%)`}
                                                {getArrowIcon("saturday_utilization")}
                                            </th>
                                        )}

                                    </tr>
                                </thead>

                                <tbody>
                                    {
                                        // renderIsus?.length > 0 && renderIsus?.map((row: any, index: any) => {
                                        // sortedData?.length > 0 && sortedData?.map((row: any, index: any) => {
                                        paginatedData.length > 0 && paginatedData?.map((row: any, index: any) => {
                                            return (
                                                <tr
                                                    key={index}
                                                    className={`${table_row_style}`}
                                                >

                                                    {columnVisibility.zone && (
                                                        <td className="px-2 py-1 justify-center">
                                                            {(() => {
                                                                const filter_zone = zoneMaster?.data?.find((item: any) => item.name === row?.zone_text?.trim());
                                                                return <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: filter_zone?.color }}>{`${filter_zone?.name}`}</div>
                                                            })()}
                                                        </td>
                                                    )}

                                                    {columnVisibility.entry_exit && (
                                                        <td className="px-2 py-1  justify-center ">{
                                                            row?.entry_exit_id == 1 ?
                                                                <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: '#C8FFD7' }}>{`Entry`}</div>
                                                                : row?.entry_exit_id == 2 ?
                                                                    <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: '#FFF3C8' }}>{`Exit`}</div>
                                                                    : <div></div>
                                                        }
                                                        </td>
                                                    )}

                                                    {columnVisibility?.area && (
                                                        <td className={`px-2 py-1 ${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"} !justify-center items-center text-center flex`}>

                                                            {(() => {
                                                                const filter_area = areaMaster?.data?.find((item: any) => item.name === row?.area_text?.trim());

                                                                return filter_area?.entry_exit_id == 2 ? (
                                                                    <div
                                                                        className="flex justify-center items-center rounded-full p-1 text-[#464255]"
                                                                        style={{ backgroundColor: filter_area?.color, width: '40px', height: '40px', color: getContrastTextColor(filter_area?.color) }}
                                                                    >
                                                                        {`${filter_area?.name}`}
                                                                    </div>
                                                                ) : filter_area?.entry_exit_id == 1 ? (
                                                                    <div
                                                                        className="flex justify-center items-center rounded-lg p-1 text-[#464255]"
                                                                        style={{ backgroundColor: filter_area?.color, width: '40px', height: '40px', color: getContrastTextColor(filter_area?.color) }}
                                                                    >
                                                                        {`${filter_area?.name}`}
                                                                    </div>
                                                                )
                                                                    : null;
                                                            })()}
                                                        </td>
                                                    )}

                                                    {columnVisibility.nomination_point && (
                                                        <td className="px-2 py-1 text-[#464255] text-center">{row?.nomination_point ? row?.nomination_point : ''}</td>
                                                    )}

                                                    {columnVisibility.park_unpark_instructed_flows && (
                                                        <td className="px-2 py-1 text-[#464255] text-right">{row?.parkUnparkInstructedFlows ? row?.parkUnparkInstructedFlows : ''}</td>
                                                    )}

                                                    {columnVisibility.customer_type && (
                                                        <td className="px-2 py-1 text-[#464255] text-center">{row?.customerType ? row?.customerType : ''}</td>
                                                    )}

                                                    {columnVisibility.unit && (
                                                        <td className="px-2 py-1 text-[#464255] text-center">{row?.units ? row?.units : ''}</td>
                                                    )}

                                                    {columnVisibility.wi && (
                                                        <td className="px-2 py-1 text-[#464255] text-right">{row?.wi !== null && row?.wi !== undefined ? formatNumberThreeDecimalNom(row?.wi) : ''}</td>
                                                    )}

                                                    {columnVisibility.hv && (
                                                        <td className="px-2 py-1 text-[#464255] text-right">{row?.hv !== null && row?.hv !== undefined ? formatNumberThreeDecimalNom(row?.hv) : ''}</td>
                                                    )}

                                                    {columnVisibility.sg && (
                                                        <td className="px-2 py-1 text-[#464255] text-right">{row?.sg !== null && row?.sg !== undefined ? formatNumberThreeDecimalNom(row?.sg) : ''}</td>
                                                    )}

                                                    {columnVisibility.sunday && (
                                                        <td className="px-2 py-1 text-[#464255] text-right">{row?.sunday !== null && row?.sunday !== undefined ? formatNumberThreeDecimalNom(row?.sunday) : ''}</td>
                                                    )}

                                                    {columnVisibility.utilization_sunday && (
                                                        <td className="px-2 py-1 text-[#464255] text-right">{row?.sunday_utilization !== null && row?.sunday_utilization !== undefined ? formatNumberTwoDecimalNom(row?.sunday_utilization) : ''}</td>
                                                    )}

                                                    {columnVisibility.monday && (
                                                        <td className="px-2 py-1 text-[#464255] text-right">{row?.monday ? formatNumberThreeDecimalNom(row?.monday) : ''}</td>
                                                    )}

                                                    {columnVisibility.utilization_monday && (
                                                        <td className="px-2 py-1 text-[#464255] text-right">{row?.monday_utilization !== null && row?.monday_utilization !== undefined ? formatNumberTwoDecimalNom(row?.monday_utilization) : ''}</td>
                                                    )}

                                                    {columnVisibility.tuesday && (
                                                        <td className="px-2 py-1 text-[#464255] text-right">{row?.tuesday ? formatNumberThreeDecimalNom(row?.tuesday) : ''}</td>
                                                    )}

                                                    {columnVisibility.utilization_tuesday && (
                                                        <td className="px-2 py-1 text-[#464255] text-right">{row?.tuesday_utilization !== null && row?.tuesday_utilization !== undefined ? formatNumberTwoDecimalNom(row?.tuesday_utilization) : ''}</td>
                                                    )}

                                                    {columnVisibility.wednesday && (
                                                        <td className="px-2 py-1 text-[#464255] text-right">{row?.wednesday ? formatNumberThreeDecimalNom(row?.wednesday) : ''}</td>
                                                    )}

                                                    {columnVisibility.utilization_wednesday && (
                                                        <td className="px-2 py-1 text-[#464255] text-right">{row?.wednesday_utilization !== null && row?.wednesday_utilization !== undefined ? formatNumberTwoDecimalNom(row?.wednesday_utilization) : ''}</td>
                                                    )}

                                                    {columnVisibility.thursday && (
                                                        <td className="px-2 py-1 text-[#464255] text-right">{row?.thursday ? formatNumberThreeDecimalNom(row?.thursday) : ''}</td>
                                                    )}

                                                    {columnVisibility.utilization_thursday && (
                                                        <td className="px-2 py-1 text-[#464255] text-right">{row?.thursday_utilization !== null && row?.thursday_utilization !== undefined ? formatNumberTwoDecimalNom(row?.thursday_utilization) : ''}</td>
                                                    )}

                                                    {columnVisibility.friday && (
                                                        <td className="px-2 py-1 text-[#464255] text-right">{row?.friday ? formatNumberThreeDecimalNom(row?.friday) : ''}</td>
                                                    )}

                                                    {columnVisibility.utilization_friday && (
                                                        <td className="px-2 py-1 text-[#464255] text-right">{row?.friday_utilization !== null && row?.friday_utilization !== undefined ? formatNumberTwoDecimalNom(row?.friday_utilization) : ''}</td>
                                                    )}

                                                    {columnVisibility.saturday && (
                                                        <td className="px-2 py-1 text-[#464255] text-right">{row?.saturday ? formatNumberThreeDecimalNom(row?.saturday) : ''}</td>
                                                    )}

                                                    {columnVisibility.utilization_saturday && (
                                                        <td className="px-2 py-1 text-[#464255] text-right">{row?.saturday_utilization !== null && row?.saturday_utilization !== undefined ? formatNumberTwoDecimalNom(row?.saturday_utilization) : ''}</td>
                                                    )}

                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </table>
                        </>
                            :
                            <TableSkeleton />
                    }

                    {
                        isLoading && sortedData?.length == 0 && <NodataTable />
                    }
                </div>



            </div>

            <div>
                {/* <PaginationComponent
                    totalItems={5}
                    itemsPerPage={10}
                    currentPage={1}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                /> */}
                <PaginationComponent
                    totalItems={sortedData?.length}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                />
            </div>

            <ColumnVisibilityPopover
                open={open}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                columnVisibility={columnVisibility}
                handleColumnToggle={handleColumnToggle}
                // initialColumns={initialColumnsTabEntryExit}
                initialColumns={initialColumnsTabEntryExit}
            />

        </div>
    )
}

export default TableWeeklyTotalSystem;