import { useEffect, useRef } from "react";
import React, { FC, useState } from 'react';
import TableSkeleton, { DefaultSkeleton } from '@/components/material_custom/DefaultSkeleton';
import { decorateRowsWithGroupSums, formatNumberThreeDecimal, formatNumberThreeDecimalNoComma, formatNumberThreeDecimalNom, formatNumberTwoDecimalNom, getContrastTextColor } from '@/utils/generalFormatter';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort, handleSortHOnly } from "@/utils/sortTable";
import NodataTable from "@/components/other/nodataTable";
import { Tab, Tabs } from "@mui/material";
import { Tune } from "@mui/icons-material"
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import PaginationComponent from "@/components/other/globalPagination";
import BtnExport from "@/components/other/btnExport";
import SearchInput from "@/components/other/searchInput";

// หน้านี้มี Tab Nomination, Area, Total System
// tab MMSCF, MMBTU
// tab hour ['All Day' ,'1-6 Hr.' , '7-12 Hr.' , '13-18 Hr.' , '19-24 Hr.']

const TableDailyNomination: React.FC<any> = ({ tableData, isLoading, userPermission, zoneText, tempData, setTempData, tempDataConcept, setTempDataConcept, areaMaster, entryExitMaster, setIsEdited, tabEntry, tabConcept, tabIndex2ndTab, nomData }) => {

    const [dataTable, setDataTable] = useState<any>([]);
    const [sortedData, setSortedData] = useState<any>([]);
    useEffect(() => {

        // v2.0.51 การคำนวณและ validate เพื่อแสดงสีแดง ยังผิดอยู่ ของทุก tab https://app.clickup.com/t/86ev8tun8
        // sum เพื่อ validate summary nom report
        const decorated = decorateRowsWithGroupSums(tableData);
        setDataTable(decorated)
        setSortedData(decorated?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))

        // setDataTable(tableData)
        // setSortedData(tableData?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
    }, [tableData])

    const [sortState, setSortState] = useState({ column: null, direction: null });

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    // ===================== TABLE HEADER MAP =====================
    const hours = Array.from({ length: 24 }, (_, i) => ({
        key: `h${i + 1}`,
        label: `H${i + 1}`,
        timeRange: `${String(i).padStart(2, "0")}:01 - ${String(i + 1).padStart(2, "0")}:00`
    }));

    // ############### TAB ###############
    const [tabIndexHour, setTabIndexHour] = useState(0);
    const handleChange = (event: any, newValue: any) => {
        // 0 = All Day
        // 1 = 1-6 Hr
        // 2 = 7-12 Hr
        // 3 = 13-18 Hr
        // 4 = 19-24 Hr
        setTabIndexHour(newValue);
    };

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

    // if tabIndex = 0 show all
    const initialColumnsTabEntryExit: any = [

        { key: 'gas_day', label: 'Gas Day', visible: true }, // always show
        // { key: 'total_cap', label: 'Total cap', visible: true }, // always show
        { key: 'total_cap', label: 'Total', visible: true }, // always show
        { key: 'nomination_point', label: 'Nomination Point', visible: true }, // always show
        { key: 'utilization', label: 'Utilization (%)', visible: true }, // always show

        { key: 'h1', label: 'H1 00:00 - 01:00', visible: true },
        { key: 'h2', label: 'H2 01:01 - 02:00', visible: true },
        { key: 'h3', label: 'H3 02:01 - 03:00', visible: true },
        { key: 'h4', label: 'H4 03:01 - 04:00', visible: true },
        { key: 'h5', label: 'H5 04:01 - 05:00', visible: true },
        { key: 'h6', label: 'H6 05:01 - 06:00', visible: true },

        { key: 'h7', label: 'H7 06:01 - 07:00', visible: true },
        { key: 'h8', label: 'H8 07:01 - 08:00', visible: true },
        { key: 'h9', label: 'H9 08:01 - 09:00', visible: true },
        { key: 'h10', label: 'H10 09:01 - 10:00', visible: true },
        { key: 'h11', label: 'H11 10:01 - 11:00', visible: true },
        { key: 'h12', label: 'H12 11:01 - 12:00', visible: true },

        { key: 'h13', label: 'H13 12:01 - 13:00', visible: true },
        { key: 'h14', label: 'H14 13:01 - 14:00', visible: true },
        { key: 'h15', label: 'H15 14:01 - 15:00', visible: true },
        { key: 'h16', label: 'H16 15:01 - 16:00', visible: true },
        { key: 'h17', label: 'H17 16:01 - 17:00', visible: true },
        { key: 'h18', label: 'H18 17:01 - 18:00', visible: true },

        { key: 'h19', label: 'H19 18:01 - 19:00', visible: true },
        { key: 'h20', label: 'H20 19:01 - 20:00', visible: true },
        { key: 'h21', label: 'H21 20:01 - 21:00', visible: true },
        { key: 'h22', label: 'H22 21:01 - 22:00', visible: true },
        { key: 'h23', label: 'H23 22:01 - 23:00', visible: true },
        { key: 'h24', label: 'H24 23:01 - 24:00', visible: true },

    ];

    const filterColumnsByTabIndex = (tabIndex: number) => {
        return initialColumnsTabEntryExit.filter((col: any) => {
            // Always show these columns
            // const alwaysVisibleKeys = [
            //     "gas_day", "total_cap", "nomination_point", "utilization"
            // ];

            // const alwaysVisibleKeys = tabIndex2ndTab == 0 ? ["gas_day", "total_cap", "nomination_point", "utilization"] : ["gas_day", "total_cap", "nomination_point"]
            const alwaysVisibleKeys = tabIndex2ndTab == 0 ? ["gas_day", "total_cap", "nomination_point"] : ["gas_day", "total_cap", "nomination_point"]

            if (alwaysVisibleKeys.includes(col.key)) {
                return true;
            }

            if (tabIndex === 0) {

                // if (col.key === 'utilization' && tabIndex2ndTab === 1) {
                //     return false;
                // }

                return true;
            }

            // Define hourly column visibility based on tab index
            const hourColumnMapping: { [key: number]: string[] } = {
                1: ["h1", "h2", "h3", "h4", "h5", "h6"],
                2: ["h7", "h8", "h9", "h10", "h11", "h12"],
                3: ["h13", "h14", "h15", "h16", "h17", "h18"],
                4: ["h19", "h20", "h21", "h22", "h23", "h24"],
            };

            return hourColumnMapping[tabIndex]?.includes(col.key) ?? false;
        });
    };

    // Usage
    const visibleColumns = filterColumnsByTabIndex(tabIndexHour);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    // const getInitialColumns = () => tabMain === 0 ? visibleColumns : initialColumnsTabConceptPoint;
    const getInitialColumns = () => visibleColumns;

    const [columnVisibility, setColumnVisibility] = useState<any>(
        Object.fromEntries(getInitialColumns().map((column: any) => [column.key, column.visible]))
    );

    // useEffect(() => {
    //     setColumnVisibility(
    //         Object.fromEntries(getInitialColumns().map((column: any) => [column.key, column.visible]))
    //     );

    //     if (tabMain == 0) {
    //         setSortedData(tempData)
    //     } else {
    //         setSortedData(tempDataConcept)
    //     }
    // }, [tabMain]); // Runs when tabMain changes

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

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (itemsPerPage: number) => {
        setItemsPerPage(itemsPerPage);
        setCurrentPage(1);
    };

    useEffect(() => {
        if (sortedData) {
            // setPaginatedData(sortedData?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)) //old
            setPaginatedData(dataTable?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)) // new
        }
    }, [sortedData, currentPage, itemsPerPage])

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {
        const queryLower = query.replace(/\s+/g, '')?.toLowerCase().trim();

        let filtered = dataTable.filter(
            (item: any) => {
                return (
                    item?.H1?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H2?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H3?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H4?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H5?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H6?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H7?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H8?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H9?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H10?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H11?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H12?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H13?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H14?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H15?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H16?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H17?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H18?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H19?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H20?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H21?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H22?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H23?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H24?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    formatNumberThreeDecimal(item?.H1)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H2)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H3)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H4)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H5)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H6)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H7)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H8)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H9)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H10)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H11)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H12)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H13)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H14)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H15)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H16)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H17)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H18)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H19)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H20)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H21)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H22)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H23)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H24)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    formatNumberThreeDecimalNom(item?.H1)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.H2)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.H3)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.H4)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.H5)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.H6)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.H7)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.H8)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.H9)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.H10)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.H11)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.H12)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.H13)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.H14)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.H15)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.H16)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.H17)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.H18)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.H19)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.H20)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.H21)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.H22)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.H23)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.H24)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    formatNumberThreeDecimalNoComma(item?.H1)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H2)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H3)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H4)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H5)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H6)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H7)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H8)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H9)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H10)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H11)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H12)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H13)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H14)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H15)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H16)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H17)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H18)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H19)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H20)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H21)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H22)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H23)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H24)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    item?.gas_day_text?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.totalCap?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.total?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.total)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.total)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    item?.nomination_point?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.utilization?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.utilization)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.utilization)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)

                )
            }
        );

        setSortedData(filtered);
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
    }

    return (
        // <div className={`relative h-[calc(100vh-340px)] overflow-y-auto block  rounded-t-md z-1`}>
        <div className={`relative h-[calc(100vh-230px)] overflow-y-hidden  block  rounded-t-md z-1`}>
            <div className="tabPlanning pb-2">
                <Tabs
                    value={tabIndexHour}
                    onChange={handleChange}
                    aria-label="tabs"
                    sx={{
                        marginBottom: '-19px !important',
                        '& .MuiTabs-indicator': {
                            display: 'none', // Remove the underline
                        },
                        '& .Mui-selected': {
                            color: '#58585A !important',
                        },
                    }}
                >
                    {['All Day', '1-6 Hr.', '7-12 Hr.', '13-18 Hr.', '19-24 Hr.'].map((label, index) => (
                        <Tab
                            key={label}
                            label={label}
                            id={`tab-${index}`}
                            sx={{
                                fontFamily: 'Tahoma !important',
                                border: '0.5px solid',
                                borderColor: '#DFE4EA',
                                borderBottom: 'none',
                                borderTopLeftRadius: '9px',
                                borderTopRightRadius: '9px',
                                textTransform: 'none',
                                padding: '8px 16px',
                                minWidth: '80px',
                                maxWidth: '80px',
                                flexShrink: 0, // Prevents shrinking
                                backgroundColor: tabIndexHour === index ? '#FFFFFF' : '#9CA3AF1A',
                                color: tabIndexHour === index ? '#58585A' : '#9CA3AF',
                                '&:hover': {
                                    backgroundColor: '#F3F4F6',
                                },
                            }}
                        />
                    ))}
                </Tabs>
            </div>

            <div className="w-full h-[82%] px-4 border-[#DFE4EA] border-[1px] rounded-tl-none gap-2 rounded-xl shadow-sm flex flex-col">

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
                            initialColumns={visibleColumns}
                            specificMenu='summary-nomination-report-all-nomi'
                            type={tabIndex2ndTab == 0 ? `['nomination']['daily']['MMSCFD']` : `['nomination']['daily']['MMBTUD']`}
                            specificData={paginatedData ? paginatedData?.[0]?.gas_day_text : ''}
                        />
                    </div>
                </div>

                <div className="overflow-y-auto overflow-x-auto w-full h-[54dvh]">
                    {
                        isLoading ? <>
                            <table className={`w-full text-sm text-left rtl:text-right text-gray-500 `}>
                                <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                                    <tr className="h-20">

                                        {/* ที่ handleSort ส่ง paginatedData แทน dataTable เพราะข้อนี้ */}
                                        {/* All > Weekly > Nomination > MMSCF > Smart Sear แล้ว Sort Column ทำให้ Smart Search หลุด https://app.clickup.com/t/86euy05du */}
                                        {columnVisibility.gas_day && (
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("gas_day_text", sortState, setSortState, setSortedData, paginatedData)}>
                                            <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("gas_day_text", sortState, setSortState, setSortedData, sortedData)}>
                                                {`Gas Day`}
                                                {getArrowIcon("gas_day_text")}
                                            </th>
                                        )}

                                        {columnVisibility.total_cap && (
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("totalCap", sortState, setSortState, setSortedData, paginatedData)}>
                                            <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("totalCap", sortState, setSortState, setSortedData, sortedData)}>
                                                {`Total`}
                                                {getArrowIcon("totalCap")}
                                            </th>
                                        )}

                                        {columnVisibility.nomination_point && (
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px] `} onClick={() => handleSort("nomination_point", sortState, setSortState, setSortedData, paginatedData)}>
                                            <th scope="col" className={`${table_sort_header_style} min-w-[120px] `} onClick={() => handleSort("nomination_point", sortState, setSortState, setSortedData, sortedData)}>
                                                {`Nomination Point`}
                                                {getArrowIcon("nomination_point")}
                                            </th>
                                        )}

                                        {/* {columnVisibility.utilization && tabIndex2ndTab == 0 && ( */}
                                        {columnVisibility.utilization && (
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("utilization", sortState, setSortState, setSortedData, paginatedData)}>
                                            <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("utilization", sortState, setSortState, setSortedData, sortedData)}>
                                                {`Utilization (%)`}
                                                {getArrowIcon("utilization")}
                                            </th>
                                        )}

                                        {getVisibleHours().map(({ key, label, timeRange }) =>
                                            columnVisibility[key] && (
                                                <th
                                                    key={key}
                                                    scope="col"
                                                    className={`${table_sort_header_style} min-w-[170px] text-center`}
                                                    // onClick={() => handleSort(key?.toUpperCase(), sortState, setSortState, setSortedData, paginatedData)}
                                                    // onClick={() => handleSortHOnly(key?.toUpperCase(), sortState, setSortState, setSortedData, paginatedData)}
                                                    onClick={() => handleSortHOnly(key?.toUpperCase(), sortState, setSortState, setSortedData, sortedData)}
                                                >
                                                    <div>{label}</div>
                                                    <div>{timeRange}</div>
                                                    {getArrowIcon(key?.toUpperCase())}
                                                </th>
                                            )
                                        )}

                                    </tr>
                                </thead>

                                <tbody>
                                    {
                                        sortedData?.length > 0 && sortedData?.map((row: any, index: any) => {
                                            // paginatedData?.length > 0 && paginatedData?.map((row: any, index: any) => {

                                            let find_validate = nomData?.find((item: any) => item?.nomination_point === row?.nomination_point)
                                            let total_cap_validate = find_validate?.maximum_capacity > row?.totalCap
                                            let h1_validate = find_validate?.maximum_capacity > row?.sum_H1
                                            let h2_validate = find_validate?.maximum_capacity > row?.sum_H2
                                            let h3_validate = find_validate?.maximum_capacity > row?.sum_H3
                                            let h4_validate = find_validate?.maximum_capacity > row?.sum_H4
                                            let h5_validate = find_validate?.maximum_capacity > row?.sum_H5
                                            let h6_validate = find_validate?.maximum_capacity > row?.sum_H6
                                            let h7_validate = find_validate?.maximum_capacity > row?.sum_H7
                                            let h8_validate = find_validate?.maximum_capacity > row?.sum_H8
                                            let h9_validate = find_validate?.maximum_capacity > row?.sum_H9
                                            let h10_validate = find_validate?.maximum_capacity > row?.sum_H10
                                            let h11_validate = find_validate?.maximum_capacity > row?.sum_H11
                                            let h12_validate = find_validate?.maximum_capacity > row?.sum_H12
                                            let h13_validate = find_validate?.maximum_capacity > row?.sum_H13
                                            let h14_validate = find_validate?.maximum_capacity > row?.sum_H14
                                            let h15_validate = find_validate?.maximum_capacity > row?.sum_H15
                                            let h16_validate = find_validate?.maximum_capacity > row?.sum_H16
                                            let h17_validate = find_validate?.maximum_capacity > row?.sum_H17
                                            let h18_validate = find_validate?.maximum_capacity > row?.sum_H18
                                            let h19_validate = find_validate?.maximum_capacity > row?.sum_H19
                                            let h20_validate = find_validate?.maximum_capacity > row?.sum_H20
                                            let h21_validate = find_validate?.maximum_capacity > row?.sum_H21
                                            let h22_validate = find_validate?.maximum_capacity > row?.sum_H22
                                            let h23_validate = find_validate?.maximum_capacity > row?.sum_H23
                                            let h24_validate = find_validate?.maximum_capacity > row?.sum_H24

                                            return (
                                                <tr
                                                    key={row?.id}
                                                    className={`${table_row_style}`}
                                                >

                                                    {columnVisibility.gas_day && (
                                                        <td className="px-2 py-1 text-[#464255] text-center">{row?.gas_day_text ? row?.gas_day_text : ''}</td>
                                                    )}

                                                    {columnVisibility.total_cap && (
                                                        // <td className={`px-2 py-1 ${total_cap_validate ? 'text-[#464255]' : 'text-red-600'} text-right font-bold`}>{row?.totalCap ? formatNumberThreeDecimalNom(row?.totalCap) : ''}</td>
                                                        <td className={`px-2 py-1 ${total_cap_validate ? 'text-[#464255]' : 'text-red-600'} text-right font-bold`}>{row?.totalCap !== null && row?.totalCap !== undefined ? formatNumberThreeDecimalNom(row?.totalCap) : ''}</td>
                                                    )}

                                                    {columnVisibility.nomination_point && (
                                                        <td className="px-2 py-1 text-[#464255] text-center">{row?.nomination_point ? row?.nomination_point : ''}</td>
                                                    )}

                                                    {columnVisibility.utilization && (
                                                        // <td className={`px-2 py-1 text-[#464255] ${row?.utilization > 100 && 'text-red-600'} text-right`}>{typeof row?.utilization === 'number' ? formatNumberTwoDecimalNom(row?.utilization) : ''}</td>
                                                        <td className={`px-2 py-1 text-[#464255] ${row?.utilization > 100 && 'text-red-600'} text-right`}>{row?.utilization !== null && row?.utilization !== undefined && row?.utilization !== '' ? formatNumberTwoDecimalNom(row?.utilization) : ''}</td>
                                                    )}

                                                    {columnVisibility.h1 && (tabIndexHour == 1 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h1_validate ? 'text-[#464255]' : 'text-red-600'} text-right `}>
                                                            {
                                                                // typeof row?.H1 === 'number' || !isNaN(Number(row?.H1))  ? formatNumberThreeDecimalNom(row?.H1) : ''
                                                                row?.H1 !== null && row?.H1 !== undefined && row?.H1 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H1).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h2 && (tabIndexHour == 1 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h2_validate ? 'text-[#464255]' : 'text-red-600'} text-right `}>
                                                            {
                                                                // typeof row?.H2 === 'number' || !isNaN(Number(row?.H2)) ? formatNumberThreeDecimalNom(row?.H2) : ''
                                                                row?.H2 !== null && row?.H2 !== undefined && row?.H2 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H2).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h3 && (tabIndexHour == 1 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h3_validate ? 'text-[#464255]' : 'text-red-600'} text-right`}>
                                                            {
                                                                // typeof row?.H3 === 'number' || !isNaN(Number(row?.H3)) ? formatNumberThreeDecimalNom(row?.H3) : ''
                                                                row?.H3 !== null && row?.H3 !== undefined && row?.H3 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H3).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h4 && (tabIndexHour == 1 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h4_validate ? 'text-[#464255]' : 'text-red-600'} text-right`}>
                                                            {
                                                                // typeof row?.H4 === 'number' || !isNaN(Number(row?.H4)) ? formatNumberThreeDecimalNom(row?.H4) : ''
                                                                row?.H4 !== null && row?.H4 !== undefined && row?.H4 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H4).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h5 && (tabIndexHour == 1 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h5_validate ? 'text-[#464255]' : 'text-red-600'} text-right `}>
                                                            {
                                                                // typeof row?.H5 === 'number' || !isNaN(Number(row?.H5)) ? formatNumberThreeDecimalNom(row?.H5) : ''
                                                                row?.H5 !== null && row?.H5 !== undefined && row?.H5 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H5).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h6 && (tabIndexHour == 1 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h6_validate ? 'text-[#464255]' : 'text-red-600'} text-right`}>
                                                            {
                                                                // typeof row?.H6 === 'number' || !isNaN(Number(row?.H6)) ? formatNumberThreeDecimalNom(row?.H6) : ''
                                                                row?.H6 !== null && row?.H6 !== undefined && row?.H6 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H6).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h7 && (tabIndexHour == 2 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h7_validate ? 'text-[#464255]' : 'text-red-600'} text-right `}>
                                                            {
                                                                // typeof row?.H7 === 'number' || !isNaN(Number(row?.H7)) ? formatNumberThreeDecimalNom(row?.H7) : ''
                                                                row?.H7 !== null && row?.H7 !== undefined && row?.H7 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H7).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h8 && (tabIndexHour == 2 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h8_validate ? 'text-[#464255]' : 'text-red-600'} text-right`}>
                                                            {
                                                                // typeof row?.H8 === 'number' || !isNaN(Number(row?.H8)) ? formatNumberThreeDecimalNom(row?.H8) : ''
                                                                row?.H8 !== null && row?.H8 !== undefined && row?.H8 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H8).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h9 && (tabIndexHour == 2 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h9_validate ? 'text-[#464255]' : 'text-red-600'} text-right`}>
                                                            {
                                                                // typeof row?.H9 === 'number' || !isNaN(Number(row?.H9)) ? formatNumberThreeDecimalNom(row?.H9) : ''
                                                                row?.H9 !== null && row?.H9 !== undefined && row?.H9 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H9).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h10 && (tabIndexHour == 2 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h10_validate ? 'text-[#464255]' : 'text-red-600'} text-right `}>
                                                            {
                                                                // typeof row?.H10 === 'number' || !isNaN(Number(row?.H10)) ? formatNumberThreeDecimalNom(row?.H10) : ''
                                                                row?.H10 !== null && row?.H10 !== undefined && row?.H10 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H10).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h11 && (tabIndexHour == 2 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h11_validate ? 'text-[#464255]' : 'text-red-600'} text-right`}>
                                                            {
                                                                // typeof row?.H11 === 'number' || !isNaN(Number(row?.H11)) ? formatNumberThreeDecimalNom(row?.H11) : ''
                                                                row?.H11 !== null && row?.H11 !== undefined && row?.H11 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H11).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h12 && (tabIndexHour == 2 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h12_validate ? 'text-[#464255]' : 'text-red-600'} text-right `}>
                                                            {
                                                                // typeof row?.H12 === 'number' || !isNaN(Number(row?.H12)) ? formatNumberThreeDecimalNom(row?.H12) : ''
                                                                row?.H12 !== null && row?.H12 !== undefined && row?.H12 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H12).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h13 && (tabIndexHour == 3 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h13_validate ? 'text-[#464255]' : 'text-red-600'} text-right`}>
                                                            {
                                                                // typeof row?.H13 === 'number' || !isNaN(Number(row?.H13)) ? formatNumberThreeDecimalNom(row?.H13) : ''
                                                                row?.H13 !== null && row?.H13 !== undefined && row?.H13 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H13).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h14 && (tabIndexHour == 3 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h14_validate ? 'text-[#464255]' : 'text-red-600'} text-right`}>
                                                            {
                                                                // typeof row?.H14 === 'number' || !isNaN(Number(row?.H14)) ? formatNumberThreeDecimalNom(row?.H14) : ''
                                                                row?.H14 !== null && row?.H14 !== undefined && row?.H14 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H14).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h15 && (tabIndexHour == 3 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h15_validate ? 'text-[#464255]' : 'text-red-600'} text-right `}>
                                                            {
                                                                // typeof row?.H15 === 'number' || !isNaN(Number(row?.H15)) ? formatNumberThreeDecimalNom(row?.H15) : ''
                                                                row?.H15 !== null && row?.H15 !== undefined && row?.H15 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H15).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h16 && (tabIndexHour == 3 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h16_validate ? 'text-[#464255]' : 'text-red-600'} text-right `}>
                                                            {
                                                                // typeof row?.H16 === 'number' || !isNaN(Number(row?.H16)) ? formatNumberThreeDecimalNom(row?.H16) : ''
                                                                row?.H16 !== null && row?.H16 !== undefined && row?.H16 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H16).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h17 && (tabIndexHour == 3 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h17_validate ? 'text-[#464255]' : 'text-red-600'} text-right`}>
                                                            {
                                                                // typeof row?.H17 === 'number' || !isNaN(Number(row?.H17)) ? formatNumberThreeDecimalNom(row?.H17) : ''
                                                                row?.H17 !== null && row?.H17 !== undefined && row?.H17 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H17).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h18 && (tabIndexHour == 3 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h18_validate ? 'text-[#464255]' : 'text-red-600'} text-right`}>
                                                            {
                                                                // typeof row?.H18 === 'number' || !isNaN(Number(row?.H18)) ? formatNumberThreeDecimalNom(row?.H18) : ''
                                                                row?.H18 !== null && row?.H18 !== undefined && row?.H18 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H18).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h19 && (tabIndexHour == 4 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h19_validate ? 'text-[#464255]' : 'text-red-600'} text-right`}>
                                                            {
                                                                // typeof row?.H19 === 'number' || !isNaN(Number(row?.H19)) ? formatNumberThreeDecimalNom(row?.H19) : ''
                                                                row?.H19 !== null && row?.H19 !== undefined && row?.H19 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H19).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h20 && (tabIndexHour == 4 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h20_validate ? 'text-[#464255]' : 'text-red-600'} text-right`}>
                                                            {
                                                                // typeof row?.H20 === 'number' || !isNaN(Number(row?.H20)) ? formatNumberThreeDecimalNom(row?.H20) : ''
                                                                row?.H20 !== null && row?.H20 !== undefined && row?.H20 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H20).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h21 && (tabIndexHour == 4 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h21_validate ? 'text-[#464255]' : 'text-red-600'} text-right`}>
                                                            {
                                                                // typeof row?.H21 === 'number' || !isNaN(Number(row?.H21)) ? formatNumberThreeDecimalNom(row?.H21) : ''
                                                                row?.H21 !== null && row?.H21 !== undefined && row?.H21 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H21).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h22 && (tabIndexHour == 4 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h22_validate ? 'text-[#464255]' : 'text-red-600'} text-right `}>
                                                            {
                                                                // typeof row?.H22 === 'number' || !isNaN(Number(row?.H22)) ? formatNumberThreeDecimalNom(row?.H22) : ''
                                                                row?.H22 !== null && row?.H22 !== undefined && row?.H22 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H22).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h23 && (tabIndexHour == 4 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h23_validate ? 'text-[#464255]' : 'text-red-600'} text-right`}>
                                                            {
                                                                // typeof row?.H23 === 'number' || !isNaN(Number(row?.H23)) ? formatNumberThreeDecimalNom(row?.H23) : ''
                                                                row?.H23 !== null && row?.H23 !== undefined && row?.H23 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H23).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h24 && (tabIndexHour == 4 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h24_validate ? 'text-[#464255]' : 'text-red-600'} text-right`}>
                                                            {
                                                                // typeof row?.H24 === 'number' || !isNaN(Number(row?.H24)) ? formatNumberThreeDecimalNom(row?.H24) : ''
                                                                row?.H24 !== null && row?.H24 !== undefined && row?.H24 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H24).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
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
                initialColumns={visibleColumns}
            />

        </div>
    )
}

export default TableDailyNomination;