import { useEffect } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSortIntradayDashboard, handleSortIntradayDashboardModify } from "@/utils/sortTable";
import NodataTable from "@/components/other/nodataTable";
import { formatNumberFourDecimalNom, formatNumberTwoDecimal, formatNumberTwoDecimalNom } from "@/utils/generalFormatter";
import RowBlankPlan from "../../balIntradayDashboard/form/rowBlankPlan";
import RowBlankActual from "../../balIntradayDashboard/form/rowBlankActual";

const TableMain: React.FC<any> = ({ tableData, columnVisibility, initialColumns, isLoading, userPermission, shipperGroupData, srchType, isIncludePtt }) => {
    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState<any>([]);
    // const userDT: any = getUserValue();

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    // เอาไว้ span column แบบ dynamic เคสเปิด ปิดไส้ใน
    const getVisibleChildCount = (parentKey: string) => initialColumns?.filter((col: any) => col.parent_id === parentKey && columnVisibility[col.key]).length || 1;

    // เอาไว้ใส่สี bg
    const getValidationColorClass = (validation?: string): string => {
        // const map: Record<string, string> = {
        //     normal: 'bg-[#BEEB8E]',
        //     alert: 'bg-[#F8F889]',
        //     ofo: 'bg-[#FFC9C9]',
        //     dd: 'bg-[#E9D2FF]',
        //     if: 'bg-[#FD9965]',
        // };

        const map: Record<string, string> = {
            max: 'bg-[#E9D2FF]',
            normal: 'bg-[#E9FFD6]', // เขียว // alert กับ normal
            alert: 'bg-[#FFFFC4]', // เหลือง // alert กับ normal
            ofo: 'bg-[#FFC9C9]',
            dd: 'bg-[#E9D2FF]',
            if: 'bg-[#FFCEB5]',
        };

        return map[validation?.toLowerCase() ?? ''] ?? 'bg-[#EAF5F9]';
    };

    const formatText = (text?: any) => {
        // DD = DIFFICULT DAY FLOW,OFO = OPERATION FLOW, IF = INSTRACTED FLOW

        switch (text) {
            case 'DD':
                return "DIFFICULT DAY FLOW"
            case 'OFO':
                return "OPERATION FLOW"
            case 'IF':
                return "INSTRACTED FLOW"
            default:
                return text
        }
    }

    // VALIDATE ORDER EAST กับ WEST
    type VState = 'dd' | 'ofo' | 'if' | 'alert' | 'normal' | '-';

    const norm = (s: any): VState => {
        const t = String(s ?? '').trim().toLowerCase();
        if (['dd', 'ofo', 'if', 'alert', 'normal'].includes(t)) return t as VState;
        return '-';
    };

    // แกนตั้ง = Validate2 (system level), แกนนอน = Validate1
    // ค่าในช่อง = ผลลัพธ์ (ถ้าไม่มี = '-')
    const MATRIX: any = {
        // Validate2 ↓  \  Validate1 →
        dd: { dd: 'dd', ofo: 'dd', if: 'dd', alert: '-', normal: '-' },
        ofo: { dd: 'ofo', ofo: 'ofo', if: '-', alert: '-', normal: '-' },
        if: { dd: 'if', ofo: 'if', if: 'if', alert: '-', normal: '-' },
        alert: { dd: '-', ofo: '-', if: '-', alert: '-', normal: '-' },
        normal: { dd: '-', ofo: '-', if: '-', alert: '-', normal: '-' },
        '-': { dd: '-', ofo: '-', if: '-', alert: '-', normal: '-' },
    };

    const COLOR_MAP: Record<VState, string> = {
        dd: '#E9D2FF',
        ofo: '#FFC9C9',
        if: '#FFCEB5',
        alert: '#FFFFC4',
        normal: '#E9FFD6',
        '-': '#EAF5F9',
    };

    const validateOrderEastWest = (
        acc_imb_validate: any,          // Validate1 (Shipper) : DD/OFO/IF/Alert/Normal
        acc_imb_inven_validate: any,    // Validate1 (System)  : DD/OFO/IF/Alert/Normal
        system_level_validate: any,     // Validate2           : DD/OFO/IF/Alert/Normal
    ) => {

        if (acc_imb_validate == 'MAX') {
            acc_imb_validate = 'dd'
        }

        if (acc_imb_inven_validate == 'MAX') {
            acc_imb_inven_validate = 'dd'
        }

        // เลือก Validate1 ตามโหมด
        // const v1: VState = norm(srchType === 'System' && isIncludePtt ? acc_imb_inven_validate : acc_imb_validate);
        const v1: VState = norm((srchType === 'System' || isIncludePtt) ? acc_imb_inven_validate : acc_imb_validate);
        const v2: VState = norm(system_level_validate);

        // หาของในเดอะแมททริก
        const resultState: VState = (MATRIX[v2]?.[v1]) ?? '-';
        return 'bg-[' + COLOR_MAP[resultState] + ']'

    };

    useEffect(() => {
        if (tableData?.length > 0) {
            setSortedData(tableData)
        } else {
            setSortedData([])
        }
    }, [tableData]);

    return (
        <div className={`relative h-[calc(100vh-380px)] overflow-y-auto block  rounded-t-md z-1`}>

            {
                isLoading ?
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500">

                        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                            <tr className="h-10">

                                {columnVisibility.time && (
                                    <th
                                        className={`${table_header_style} text-center min-w-[120px] w-[130px] max-w-[150px] sticky left-0 bg-[#1473A1] z-[10]`} rowSpan={2} colSpan={2} scope="col"
                                    >
                                        {`Time`}
                                    </th>
                                )}

                                {columnVisibility.entry_mmbtu && (
                                    <th
                                        className={`${table_header_style} text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={1} colSpan={getVisibleChildCount("entry_mmbtu")} scope="col"
                                    >
                                        {`Entry (MMBTU)`}
                                    </th>
                                )}

                                {columnVisibility.exit_mmbtu && (
                                    <th
                                        className={`${table_header_style} text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={1} colSpan={getVisibleChildCount("exit_mmbtu")} scope="col"
                                    >
                                        {`Exit (MMBTU)`}
                                    </th>
                                )}

                                {columnVisibility.balancing_gas && (
                                    <th
                                        className={`${table_header_style} text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={1} colSpan={getVisibleChildCount("balancing_gas")} scope="col"
                                    >
                                        {`Balancing Gas`}
                                    </th>
                                )}

                                {columnVisibility.park_unpark && (
                                    <th
                                        className={`${table_header_style} text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={1} colSpan={getVisibleChildCount("park_unpark")} scope="col"
                                    >
                                        {`Park/Unpark`}
                                    </th>
                                )}

                                {columnVisibility.ra6 && (
                                    <th
                                        className={`${table_header_style} text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={1} colSpan={getVisibleChildCount("ra6")} scope="col"
                                    >
                                        {`RA#6`}
                                    </th>
                                )}

                                {columnVisibility.bvw10 && (
                                    <th
                                        className={`${table_header_style} text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={1} colSpan={getVisibleChildCount("bvw10")} scope="col"
                                    >
                                        {`BVW#10`}
                                    </th>
                                )}

                                {columnVisibility.shrinkage_gas_and_other && (
                                    <th
                                        className={`${table_header_style} text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={1} colSpan={getVisibleChildCount("shrinkage_gas_and_other")} scope="col"
                                    >
                                        {`Shrinkage Gas & Others`}
                                    </th>
                                )}

                                {columnVisibility.change_min_inventory && (
                                    <th
                                        className={`${table_header_style} text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={1} colSpan={getVisibleChildCount("change_min_inventory")} scope="col"
                                    >
                                        {`Change Min. Inventory`}
                                    </th>
                                )}

                                {columnVisibility.imbalance && (
                                    <th
                                        className={`${table_header_style} text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={1} colSpan={getVisibleChildCount("imbalance")} scope="col"
                                    >
                                        {`Imbalance`}
                                    </th>
                                )}

                                {columnVisibility.acc_imbalance_meter_mmbtu && (
                                    <th
                                        className={`${table_header_style} text-center min-w-[120px] w-[200px] max-w-[350px]`} rowSpan={1} colSpan={getVisibleChildCount("acc_imbalance_meter_mmbtu")} scope="col"
                                    >
                                        {`Acc. Imbalance (Meter) (MMBTU)`}
                                    </th>
                                )}

                                {columnVisibility.total_imbalance && (
                                    <th
                                        className={`${table_sort_header_style} text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col"
                                        // onClick={() => handleSortIntradayDashboard("plan_.dailyImb_total.value", sortState, setSortState, setSortedData, tableData)}
                                        onClick={() => handleSortIntradayDashboardModify(
                                            "plan_.dailyImb_total.value", sortState, setSortState, setSortedData, tableData, 'actual_.dailyImb_total.value'
                                        )}
                                    >
                                        <div>{`Total`}</div>
                                        <div>{`Imbalance`}</div>
                                        {getArrowIcon("plan_.dailyImb_total.value")}
                                    </th>
                                )}

                                {columnVisibility.percent_total_imbalance && (
                                    <th
                                        className={`${table_sort_header_style} text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col"
                                        // onClick={() => handleSortIntradayDashboard("plan_.absimb", sortState, setSortState, setSortedData, tableData)}
                                        onClick={() => handleSortIntradayDashboardModify(
                                            "plan_.absimb.value", sortState, setSortState, setSortedData, tableData, 'actual_.absimb.value'
                                        )}
                                    >
                                        <div>{`% Total`}</div>
                                        <div>{`Imbalance`}</div>
                                        {getArrowIcon("plan_.absimb.value")}
                                    </th>
                                )}

                                {columnVisibility.system_level_east && (
                                    <th
                                        className={`${table_header_style} text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={1} colSpan={getVisibleChildCount("system_level_east")} scope="col"
                                    >
                                        {`System Level (East)`}
                                    </th>
                                )}

                                {columnVisibility.order_east && (
                                    <th
                                        className={`${table_header_style} text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={1} colSpan={getVisibleChildCount("order_east")} scope="col"
                                    >
                                        {`Order (East)`}
                                    </th>
                                )}

                                {columnVisibility.system_level_west && (
                                    <th
                                        className={`${table_header_style} text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={1} colSpan={getVisibleChildCount("system_level_west")} scope="col"
                                    >
                                        {`System Level (West)`}
                                    </th>
                                )}

                                {columnVisibility.order_west && (
                                    <th
                                        className={`${table_header_style} text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={1} colSpan={getVisibleChildCount("order_west")} scope="col"
                                    >
                                        {`Order (West)`}
                                    </th>
                                )}

                                {columnVisibility.condition_east && (
                                    <th
                                        className={`${table_sort_header_style} text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col"
                                        onClick={() => handleSortIntradayDashboard("plan_.condition_east.value", sortState, setSortState, setSortedData, tableData)}
                                    >
                                        <div>{`Condition`}</div>
                                        <div>{`East`}</div>
                                        {getArrowIcon("plan_.condition_east.value")}
                                    </th>
                                )}

                                {columnVisibility.condition_west && (
                                    <th
                                        className={`${table_sort_header_style} text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col"
                                        onClick={() => handleSortIntradayDashboard("plan_.condition_west.value", sortState, setSortState, setSortedData, tableData)}
                                    >
                                        <div>{`Condition`}</div>
                                        <div>{`West`}</div>
                                        {getArrowIcon("plan_.condition_west.value")}
                                    </th>
                                )}
                            </tr>

                            <tr className="h-10">
                                {/* ###### UNDER Entry (MMBTU) ###### */}
                                {columnVisibility.entry_mmbtu && (<>
                                    {columnVisibility.east_total_entry_mmbtud && (
                                        <th
                                            className={`${table_sort_header_style}  text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                            rowSpan={1}
                                            scope="col"
                                            colSpan={1}
                                            onClick={() => handleSortIntradayDashboard("plan_.total_entry_east.value", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`East`}
                                            {getArrowIcon("plan_.total_entry_east.value")}
                                        </th>
                                    )}

                                    {columnVisibility.west_total_entry_mmbtud && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                            rowSpan={1}
                                            scope="col"
                                            colSpan={1}
                                            onClick={() => handleSortIntradayDashboard("plan_.total_entry_west.value", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`West`}
                                            {getArrowIcon("plan_.total_entry_west.value")}
                                        </th>
                                    )}

                                    {columnVisibility.east_west_total_entry_mmbtud && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#C8FFD7] hover:bg-[#a6f5bf] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                            rowSpan={1}
                                            scope="col"
                                            colSpan={1}
                                            onClick={() => handleSortIntradayDashboard("plan_.total_entry_east-west.value", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`East-West`}
                                            {getArrowIcon("plan_.total_entry_east-west.value")}
                                        </th>
                                    )}
                                </>
                                )}

                                {/* ###### UNDER Exit (MMBTU) ###### */}
                                {columnVisibility.exit_mmbtu && (<>
                                    {columnVisibility.east_total_exit_mmbtu && (
                                        <th
                                            className={`${table_sort_header_style}  text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                            rowSpan={1}
                                            scope="col"
                                            colSpan={1}
                                            onClick={() => handleSortIntradayDashboard("plan_.total_exit_east.value", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`East`}
                                            {getArrowIcon("plan_.total_exit_east.value")}
                                        </th>
                                    )}

                                    {columnVisibility.west_total_exit_mmbtu && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                            rowSpan={1}
                                            scope="col"
                                            colSpan={1}
                                            onClick={() => handleSortIntradayDashboard("plan_.total_exit_west.value", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`West`}
                                            {getArrowIcon("plan_.total_exit_west.value")}
                                        </th>
                                    )}

                                    {columnVisibility.east_west_total_exit_mmbtu && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#C8FFD7] hover:bg-[#a6f5bf] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                            rowSpan={1}
                                            scope="col"
                                            colSpan={1}
                                            onClick={() => handleSortIntradayDashboard("plan_.total_exit_east-west.value", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`East-West`}
                                            {getArrowIcon("plan_.total_exit_east-west.value")}
                                        </th>
                                    )}

                                </>
                                )}

                                {/* ###### UNDER Balancing Gas ###### */}
                                {columnVisibility.balancing_gas && (<>
                                    {columnVisibility.east_total_balancing_gas && (
                                        <th
                                            className={`${table_sort_header_style}  text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                            rowSpan={1}
                                            scope="col"
                                            colSpan={1}
                                            onClick={() => handleSortIntradayDashboard("plan_.revserveBal_east.value", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`East`}
                                            {getArrowIcon("plan_.revserveBal_east.value")}
                                        </th>
                                    )}

                                    {columnVisibility.west_total_balancing_gas && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                            rowSpan={1}
                                            scope="col"
                                            colSpan={1}
                                            onClick={() => handleSortIntradayDashboard("plan_.revserveBal_west.value", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`West`}
                                            {getArrowIcon("plan_.revserveBal_west.value")}
                                        </th>
                                    )}

                                    {columnVisibility.east_west_total_balancing_gas && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#C8FFD7] hover:bg-[#a6f5bf] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                            rowSpan={1}
                                            scope="col"
                                            colSpan={1}
                                            onClick={() => handleSortIntradayDashboard("plan_.revserveBal_east-west.value", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`East-West`}
                                            {getArrowIcon("plan_.revserveBal_east-west.value")}
                                        </th>
                                    )}
                                </>
                                )}

                                {/* ###### UNDER Park/Unpark ###### */}
                                {columnVisibility.park_unpark && (<>
                                    {columnVisibility.east_total_park_unpark && (
                                        <th
                                            className={`${table_sort_header_style}  text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                            rowSpan={1}
                                            scope="col"
                                            colSpan={1}
                                            onClick={() => handleSortIntradayDashboard("plan_.park/unpark_east", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`East`}
                                            {getArrowIcon("plan_.park/unpark_east")}
                                        </th>
                                    )}

                                    {columnVisibility.west_total_park_unpark && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                            rowSpan={1}
                                            scope="col"
                                            colSpan={1}
                                            onClick={() => handleSortIntradayDashboard("plan_.park/unpark_west", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`West`}
                                            {getArrowIcon("plan_.park/unpark_west")}
                                        </th>
                                    )}
                                </>
                                )}

                                {/* ###### UNDER RA#6 ###### */}
                                {columnVisibility.ra6 && (<>
                                    {columnVisibility.ra6_ratio && (
                                        <th
                                            className={`${table_sort_header_style}  text-[#58585A] bg-[#F2F2F2] hover:bg-[#f2f2f2ad] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                            rowSpan={1}
                                            scope="col"
                                            colSpan={1}
                                            onClick={() => handleSortIntradayDashboard("plan_.detail_entry_east-west_ra6Ratio.value", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`Ratio`}
                                            {getArrowIcon("plan_.detail_entry_east-west_ra6Ratio.value")}
                                        </th>
                                    )}
                                </>
                                )}

                                {/* ###### UNDER BVW#10 ###### */}
                                {columnVisibility.bvw10 && (<>
                                    {columnVisibility.bvw10_ratio && (
                                        <th
                                            className={`${table_sort_header_style}  text-[#58585A] bg-[#F2F2F2] hover:bg-[#f2f2f2ad] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                            rowSpan={1}
                                            scope="col"
                                            colSpan={1}
                                            onClick={() => handleSortIntradayDashboard("plan_.detail_entry_east-west_bvw10Ratio.value", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`Ratio`}
                                            {getArrowIcon("plan_.detail_entry_east-west_bvw10Ratio.value")}
                                        </th>
                                    )}
                                </>
                                )}

                                {/* ###### UNDER Shrinkage Gas & Others ###### */}
                                {columnVisibility.shrinkage_gas_and_other && (<>
                                    {columnVisibility.east_total_shrinkage_gas_and_other && (
                                        <th
                                            className={`${table_sort_header_style}  text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                            rowSpan={1}
                                            scope="col"
                                            colSpan={1}
                                            onClick={() => handleSortIntradayDashboard("plan_.shrinkage_others_east", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`East`}
                                            {getArrowIcon("plan_.shrinkage_others_east")}
                                        </th>
                                    )}

                                    {columnVisibility.west_total_shrinkage_gas_and_other && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                            rowSpan={1}
                                            scope="col"
                                            colSpan={1}
                                            onClick={() => handleSortIntradayDashboard("plan_.shrinkage_others_west", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`West`}
                                            {getArrowIcon("plan_.shrinkage_others_west")}
                                        </th>
                                    )}

                                    {columnVisibility.east_west_total_shrinkage_gas_and_other && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#C8FFD7] hover:bg-[#a6f5bf] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                            rowSpan={1}
                                            scope="col"
                                            colSpan={1}
                                            onClick={() => handleSortIntradayDashboard("plan_.shrinkage_others_east-west", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`East-West`}
                                            {getArrowIcon("plan_.shrinkage_others_east-west")}
                                        </th>
                                    )}
                                </>
                                )}

                                {/* ###### UNDER Change Min. Inventory ###### */}
                                {columnVisibility.change_min_inventory && (<>
                                    {columnVisibility.east_total_change_min_inventory && (
                                        <th
                                            className={`${table_sort_header_style}  text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                            rowSpan={1}
                                            scope="col"
                                            colSpan={1}
                                            // onClick={() => handleSortIntradayDashboard("plan_.minInventoryChange_east.value", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortIntradayDashboardModify(
                                                "plan_.minInventoryChange_east.value", sortState, setSortState, setSortedData, tableData, 'actual_.minInventoryChange_east.value'
                                            )}
                                        >
                                            {`East`}
                                            {getArrowIcon("plan_.minInventoryChange_east.value")}
                                        </th>
                                    )}

                                    {columnVisibility.west_total_change_min_inventory && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                            rowSpan={1}
                                            scope="col"
                                            colSpan={1}
                                            // onClick={() => handleSortIntradayDashboard("plan_.minInventoryChange_west.value", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortIntradayDashboardModify(
                                                "plan_.minInventoryChange_west.value", sortState, setSortState, setSortedData, tableData, 'actual_.minInventoryChange_west.value'
                                            )}
                                        >
                                            {`West`}
                                            {getArrowIcon("plan_.minInventoryChange_west.value")}
                                        </th>
                                    )}

                                    {columnVisibility.east_west_total_change_min_inventory && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#C8FFD7] hover:bg-[#a6f5bf] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                            rowSpan={1}
                                            scope="col"
                                            colSpan={1}
                                            // onClick={() => handleSortIntradayDashboard("plan_.minInventoryChange_east-west.value", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortIntradayDashboardModify(
                                                "plan_.minInventoryChange_east-west.value", sortState, setSortState, setSortedData, tableData, 'actual_.minInventoryChange_east-west.value'
                                            )}
                                        >
                                            {`East-West`}
                                            {getArrowIcon("plan_.minInventoryChange_east-west.value")}
                                        </th>
                                    )}
                                </>
                                )}

                                {/* ###### UNDER Imbalance ###### */}
                                {columnVisibility.imbalance && (<>
                                    {columnVisibility.east_total_imbalance && (
                                        <th
                                            className={`${table_sort_header_style}  text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                            rowSpan={1}
                                            scope="col"
                                            colSpan={1}
                                            // onClick={() => handleSortIntradayDashboard("plan_.dailyImb_east.value", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortIntradayDashboardModify(
                                                "plan_.dailyImb_east.value", sortState, setSortState, setSortedData, tableData, 'actual_.dailyImb_east.value'
                                            )}
                                        >
                                            {`East`}
                                            {getArrowIcon("plan_.dailyImb_east.value")}
                                        </th>
                                    )}

                                    {columnVisibility.west_total_imbalance && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                            rowSpan={1}
                                            scope="col"
                                            colSpan={1}
                                            // onClick={() => handleSortIntradayDashboard("plan_.dailyImb_west.value", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortIntradayDashboardModify(
                                                "plan_.dailyImb_west.value", sortState, setSortState, setSortedData, tableData, 'actual_.dailyImb_west.value'
                                            )}
                                        >
                                            {`West`}
                                            {getArrowIcon("plan_.dailyImb_west.value")}
                                        </th>
                                    )}

                                </>
                                )}

                                {/* ###### UNDER Acc. Imbalance (Meter) (MMBTU) ###### */}
                                {columnVisibility.acc_imbalance_meter_mmbtu && (<>
                                    {columnVisibility.east_total_acc_imbalance_meter_mmbtu && (
                                        <th
                                            className={`${table_sort_header_style}  text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                            rowSpan={1}
                                            scope="col"
                                            colSpan={1}
                                            // onClick={() => handleSortIntradayDashboard("plan_.accImb_east.value", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortIntradayDashboardModify(
                                                "plan_.accImb_east.value", sortState, setSortState, setSortedData, tableData, 'actual_.accImb_east.value'
                                            )}
                                        >
                                            {`East`}
                                            {getArrowIcon("plan_.accImb_east.value")}
                                        </th>
                                    )}

                                    {columnVisibility.west_total_acc_imbalance_meter_mmbtu && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                            rowSpan={1}
                                            scope="col"
                                            colSpan={1}
                                            // onClick={() => handleSortIntradayDashboard("plan_.accImb_west.value", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortIntradayDashboardModify(
                                                "plan_.accImb_west.value", sortState, setSortState, setSortedData, tableData, 'actual_.accImb_west.value'
                                            )}
                                        >
                                            {`West`}
                                            {getArrowIcon("plan_.accImb_west.value")}
                                        </th>
                                    )}
                                </>
                                )}

                                {/* ###### UNDER System Level (East) ###### */}
                                {columnVisibility.system_level_east && (<>
                                    {columnVisibility.level_system_level_east && (
                                        <th
                                            className={`${table_sort_header_style}  text-[#58585A] bg-[#F2F2F2] hover:bg-[#f2f2f2ad] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                            rowSpan={1}
                                            scope="col"
                                            colSpan={1}
                                            onClick={() => handleSortIntradayDashboard("plan_.system_level_east", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`Level`}
                                            {getArrowIcon("plan_.system_level_east")}
                                        </th>
                                    )}

                                    {columnVisibility.percent_system_level_east && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#F2F2F2] hover:bg-[#f2f2f2ad] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                            rowSpan={1}
                                            scope="col"
                                            colSpan={1}
                                            // srchType == 'Shipper' custom_level_percentage_east.value
                                            // onClick={() => handleSortIntradayDashboard("plan_.level_percentage_east.value", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => {
                                                handleSortIntradayDashboardModify("plan_.level_percentage_east.value", sortState, setSortState, setSortedData, tableData, srchType == 'Shipper' ? 'actual_.custom_level_percentage_east.value' : 'actual_.level_percentage_east.value')
                                            }}
                                        >
                                            {`%`}
                                            {getArrowIcon("plan_.level_percentage_east.value")}
                                        </th>
                                    )}
                                </>
                                )}

                                {/* ###### UNDER Order (East) ###### */}
                                {columnVisibility.order_east && (<>
                                    {columnVisibility.order_east_mmbtu && (
                                        <th
                                            className={`${table_sort_header_style}  text-[#58585A] bg-[#F2F2F2] hover:bg-[#f2f2f2ad] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                            rowSpan={1}
                                            scope="col"
                                            colSpan={1}
                                            // onClick={() => handleSortIntradayDashboard("plan_.energyAdjustIFOFO_east.value", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortIntradayDashboardModify(
                                                "plan_.energyAdjustIFOFO_east.value", sortState, setSortState, setSortedData, tableData, 'actual_.energyAdjustIFOFO_east.value'
                                            )}
                                        >
                                            {`MMBTU`}
                                            {getArrowIcon("plan_.energyAdjustIFOFO_east.value")}
                                        </th>
                                    )}

                                    {columnVisibility.order_east_mmscf && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#F2F2F2] hover:bg-[#f2f2f2ad] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                            rowSpan={1}
                                            scope="col"
                                            colSpan={1}
                                            // onClick={() => handleSortIntradayDashboard("plan_.volumeAdjustIFOFO_east.value", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortIntradayDashboardModify(
                                                "plan_.volumeAdjustIFOFO_east.value", sortState, setSortState, setSortedData, tableData, 'actual_.volumeAdjustIFOFO_east.value'
                                            )}
                                        >
                                            {`MMSCF`}
                                            {getArrowIcon("plan_.volumeAdjustIFOFO_east.value")}
                                        </th>
                                    )}
                                </>
                                )}

                                {/* ###### UNDER System Level (West) ###### */}
                                {columnVisibility.system_level_west && (<>
                                    {columnVisibility.level_system_level_west && (
                                        <th
                                            className={`${table_sort_header_style}  text-[#58585A] bg-[#F2F2F2] hover:bg-[#f2f2f2ad] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                            rowSpan={1}
                                            scope="col"
                                            colSpan={1}
                                            onClick={() => handleSortIntradayDashboard("plan_.system_level_west", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`Level`}
                                            {getArrowIcon("plan_.system_level_west")}
                                        </th>
                                    )}

                                    {columnVisibility.percent_system_level_west && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#F2F2F2] hover:bg-[#f2f2f2ad] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                            rowSpan={1}
                                            scope="col"
                                            colSpan={1}
                                            // onClick={() => handleSortIntradayDashboard("plan_.level_percentage_west.value", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortIntradayDashboardModify(
                                                "plan_.level_percentage_west.value", sortState, setSortState, setSortedData, tableData, srchType == 'Shipper' ? 'actual_.custom_level_percentage_west.value' : 'actual_.level_percentage_west.value'
                                            )}
                                        >
                                            {`%`}
                                            {getArrowIcon("plan_.level_percentage_west.value")}
                                        </th>
                                    )}
                                </>
                                )}

                                {/* ###### UNDER Order (West) ###### */}
                                {columnVisibility.order_west && (<>
                                    {columnVisibility.order_west_mmbtu && (
                                        <th
                                            className={`${table_sort_header_style}  text-[#58585A] bg-[#F2F2F2] hover:bg-[#f2f2f2ad] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                            rowSpan={1}
                                            scope="col"
                                            colSpan={1}
                                            // onClick={() => handleSortIntradayDashboard("plan_.energyAdjustIFOFO_west.value", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortIntradayDashboardModify(
                                                "plan_.energyAdjustIFOFO_west.value", sortState, setSortState, setSortedData, tableData, 'actual_.energyAdjustIFOFO_west.value'
                                            )}
                                        >
                                            {`MMBTU`}
                                            {getArrowIcon("plan_.energyAdjustIFOFO_west.value")}
                                        </th>
                                    )}

                                    {columnVisibility.order_west_mmscf && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#F2F2F2] hover:bg-[#f2f2f2ad] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                            rowSpan={1}
                                            scope="col"
                                            colSpan={1}
                                            // onClick={() => handleSortIntradayDashboard("plan_.volumeAdjustIFOFO_west.value", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortIntradayDashboardModify(
                                                "plan_.volumeAdjustIFOFO_west.value", sortState, setSortState, setSortedData, tableData, 'actual_.volumeAdjustIFOFO_west.value'
                                            )}
                                        >
                                            {`MMSCF`}
                                            {getArrowIcon("plan_.volumeAdjustIFOFO_west.value")}
                                        </th>
                                    )}
                                </>
                                )}

                            </tr>
                        </thead>

                        <tbody>
                            {sortedData && sortedData?.map((row: any, index: any) => (
                                <>
                                    {/* Plan */}
                                    {row?.plan_ ?
                                        <tr
                                            key={row?.id}
                                            className={`${table_row_style}`}
                                        >

                                            {columnVisibility?.time && (<>
                                                <td className={`px-2 py-1 text-[#464255] text-center sticky left-0 bg-[#ffffff] z-[5]`} rowSpan={2} >
                                                    {row?.gas_hour ? row?.gas_hour : ''}
                                                </td>

                                                <td className={`px-2 py-1 text-[#464255] sticky left-14 bg-[#ffffff] z-[5]`}>
                                                    {'Plan'}
                                                </td>
                                            </>
                                            )}


                                            {/* under ENTRY mmbtu */}
                                            {columnVisibility?.entry_mmbtu && columnVisibility?.east_total_entry_mmbtud && (
                                                <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                    {row?.plan_?.total_entry_east !== null && row?.plan_?.total_entry_east !== undefined ? formatNumberFourDecimalNom(row?.plan_?.total_entry_east?.value) : ''}
                                                </td>
                                            )}

                                            {columnVisibility?.entry_mmbtu && columnVisibility?.west_total_entry_mmbtud && (
                                                <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                    {row?.plan_?.total_entry_west !== null && row?.plan_?.total_entry_west !== undefined ? formatNumberFourDecimalNom(row?.plan_?.total_entry_west?.value) : ''}
                                                </td>
                                            )}

                                            {columnVisibility?.entry_mmbtu && columnVisibility?.east_west_total_entry_mmbtud && (
                                                <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                    {row?.plan_["total_entry_east-west"] !== null && row?.plan_["total_entry_east-west"] !== undefined ? formatNumberFourDecimalNom(row?.plan_["total_entry_east-west"]?.value) : ''}
                                                </td>
                                            )}


                                            {/* under EXIT mmbtu */}
                                            {columnVisibility?.exit_mmbtu && columnVisibility?.east_total_exit_mmbtu && (
                                                <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                    {row?.plan_?.total_exit_east !== null && row?.plan_?.total_exit_east !== undefined ? formatNumberFourDecimalNom(row?.plan_?.total_exit_east?.value) : ''}
                                                </td>
                                            )}

                                            {columnVisibility?.exit_mmbtu && columnVisibility?.west_total_exit_mmbtu && (
                                                <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                    {row?.plan_?.total_exit_west !== null && row?.plan_?.total_exit_west !== undefined ? formatNumberFourDecimalNom(row?.plan_?.total_exit_west?.value) : ''}
                                                </td>
                                            )}

                                            {columnVisibility?.exit_mmbtu && columnVisibility?.east_west_total_exit_mmbtu && (
                                                <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                    {row?.plan_["total_exit_east-west"] !== null && row?.plan_["total_exit_east-west"] !== undefined ? formatNumberFourDecimalNom(row?.plan_["total_exit_east-west"]?.value) : ''}
                                                </td>
                                            )}


                                            {/* UNDER Balancing Gas */}
                                            {columnVisibility?.balancing_gas && columnVisibility?.east_total_balancing_gas && (
                                                <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                    {row?.plan_?.revserveBal_east !== null && row?.plan_?.revserveBal_east !== undefined ? formatNumberFourDecimalNom(row?.plan_?.revserveBal_east?.value) : ''}
                                                </td>
                                            )}

                                            {columnVisibility?.balancing_gas && columnVisibility?.west_total_balancing_gas && (
                                                <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                    {row?.plan_?.revserveBal_west !== null && row?.plan_?.revserveBal_west !== undefined ? formatNumberFourDecimalNom(row?.plan_?.revserveBal_west?.value) : ''}
                                                </td>
                                            )}

                                            {columnVisibility?.balancing_gas && columnVisibility?.east_west_total_balancing_gas && (
                                                <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                    {row?.plan_["revserveBal_east-west"] !== null && row?.plan_["revserveBal_east-west"] !== undefined ? formatNumberFourDecimalNom(row?.plan_["revserveBal_east-west"]?.value) : ''}
                                                </td>
                                            )}


                                            {/* UNDER Park/Unpark */}
                                            {columnVisibility?.park_unpark && columnVisibility?.east_total_park_unpark && (
                                                <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                    {row?.plan_["park/unpark_east"] !== null && row?.plan_["park/unpark_east"] !== undefined ? formatNumberFourDecimalNom(row?.plan_["park/unpark_east"]) : ''}
                                                </td>
                                            )}

                                            {columnVisibility?.park_unpark && columnVisibility?.west_total_park_unpark && (
                                                <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                    {row?.plan_["park/unpark_west"] !== null && row?.plan_["park/unpark_west"] !== undefined ? formatNumberFourDecimalNom(row?.plan_["park/unpark_west"]) : ''}
                                                </td>
                                            )}


                                            {/* UNDER RA#6 */}
                                            {columnVisibility?.ra6 && columnVisibility?.ra6_ratio && (
                                                <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                    {row?.plan_["detail_entry_east-west_ra6Ratio"] !== null && row?.plan_["detail_entry_east-west_ra6Ratio"] !== undefined ? formatNumberFourDecimalNom(row?.plan_["detail_entry_east-west_ra6Ratio"]?.value) : ''}
                                                </td>
                                            )}


                                            {/* UNDER BVW#10 */}
                                            {columnVisibility?.bvw10 && columnVisibility?.bvw10_ratio && (
                                                <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                    {row?.plan_["detail_entry_east-west_bvw10Ratio"] !== null && row?.plan_["detail_entry_east-west_bvw10Ratio"] !== undefined ? formatNumberFourDecimalNom(row?.plan_["detail_entry_east-west_bvw10Ratio"]?.value) : ''}
                                                </td>
                                            )}


                                            {/* UNDER Shrinkage Gas & Others */}
                                            {columnVisibility?.shrinkage_gas_and_other && columnVisibility?.east_total_shrinkage_gas_and_other && (
                                                <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                    {row?.plan_?.shrinkage_others_east !== null && row?.plan_?.shrinkage_others_east !== undefined ? formatNumberFourDecimalNom(row?.plan_?.shrinkage_others_east) : ''}
                                                </td>
                                            )}

                                            {columnVisibility?.shrinkage_gas_and_other && columnVisibility?.west_total_shrinkage_gas_and_other && (
                                                <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                    {row?.plan_?.shrinkage_others_west !== null && row?.plan_?.shrinkage_others_west !== undefined ? formatNumberFourDecimalNom(row?.plan_?.shrinkage_others_west) : ''}
                                                </td>
                                            )}

                                            {columnVisibility?.shrinkage_gas_and_other && columnVisibility?.east_west_total_shrinkage_gas_and_other && (
                                                <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                    {row?.plan_["shrinkage_others_east-west"] !== null && row?.plan_["shrinkage_others_east-west"] !== undefined ? formatNumberFourDecimalNom(row?.plan_["shrinkage_others_east-west"]) : ''}
                                                </td>
                                            )}


                                            {/* UNDER Change Min. Inventory */}
                                            {columnVisibility?.change_min_inventory && columnVisibility?.east_total_change_min_inventory && (
                                                <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                    {row?.plan_?.minInventoryChange_east !== null && row?.plan_?.minInventoryChange_east !== undefined ? formatNumberFourDecimalNom(row?.plan_?.minInventoryChange_east?.value) : ''}
                                                </td>
                                            )}

                                            {columnVisibility?.change_min_inventory && columnVisibility?.west_total_change_min_inventory && (
                                                <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                    {row?.plan_?.minInventoryChange_west !== null && row?.plan_?.minInventoryChange_west !== undefined ? formatNumberFourDecimalNom(row?.plan_?.minInventoryChange_west?.value) : ''}
                                                </td>
                                            )}

                                            {columnVisibility?.change_min_inventory && columnVisibility?.east_west_total_change_min_inventory && (
                                                <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                    {row?.plan_["minInventoryChange_east-west"] !== null && row?.plan_["minInventoryChange_east-west"] !== undefined ? formatNumberFourDecimalNom(row?.plan_["minInventoryChange_east-west"]?.value) : ''}
                                                </td>
                                            )}


                                            {/* UNDER Imbalance */}
                                            {columnVisibility?.imbalance && columnVisibility?.east_total_imbalance && (
                                                <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                    {row?.plan_?.dailyImb_east !== null && row?.plan_?.dailyImb_east !== undefined ? formatNumberFourDecimalNom(row?.plan_?.dailyImb_east?.value) : ''}
                                                </td>
                                            )}

                                            {columnVisibility?.imbalance && columnVisibility?.west_total_imbalance && (
                                                <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                    {row?.plan_?.dailyImb_west !== null && row?.plan_?.dailyImb_west !== undefined ? formatNumberFourDecimalNom(row?.plan_?.dailyImb_west?.value) : ''}
                                                </td>
                                            )}


                                            {/* UNDER Acc. Imbalance (Meter) (MMBTU) */}
                                            {columnVisibility?.acc_imbalance_meter_mmbtu && columnVisibility?.east_total_acc_imbalance_meter_mmbtu && (
                                                <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                    {row?.plan_?.accImb_east !== null && row?.plan_?.accImb_east !== undefined ? formatNumberFourDecimalNom(row?.plan_?.accImb_east?.value) : ''}
                                                </td>
                                            )}

                                            {columnVisibility?.acc_imbalance_meter_mmbtu && columnVisibility?.west_total_acc_imbalance_meter_mmbtu && (
                                                <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                    {row?.plan_?.accImb_west !== null && row?.plan_?.accImb_west !== undefined ? formatNumberFourDecimalNom(row?.plan_?.accImb_west?.value) : ''}
                                                </td>
                                            )}


                                            {/* UNDER Total Imbalance */}
                                            {columnVisibility?.total_imbalance && (
                                                <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                    {row?.plan_?.dailyImb_total !== null && row?.plan_?.dailyImb_total !== undefined ? formatNumberFourDecimalNom(row?.plan_?.dailyImb_total?.value) : ''}
                                                </td>
                                            )}

                                            {/* UNDER Percent Total Imbalance */}
                                            {columnVisibility?.percent_total_imbalance && (
                                                <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                    {/* {row?.plan_?.absimb !== null && row?.plan_?.absimb !== undefined ? formatNumberFourDecimalNom(row?.plan_?.absimb?.value) + '%' : ''} */}
                                                    {row?.plan_?.absimb !== null && row?.plan_?.absimb !== undefined ? formatNumberTwoDecimalNom(row?.plan_?.absimb?.value) + '%' : ''}
                                                </td>
                                            )}


                                            {/* UNDER System Level (East) */}
                                            {columnVisibility?.system_level_east && columnVisibility?.level_system_level_east && (
                                                <td
                                                    className={`px-2 py-1 text-[#464255] text-center `}
                                                >
                                                    {row?.plan_?.system_level_east ? row?.plan_?.system_level_east : ''}
                                                </td>
                                            )}

                                            {columnVisibility?.system_level_east && columnVisibility?.percent_system_level_east && (
                                                <td
                                                    className={`px-2 py-1 text-[#464255] text-right `}
                                                >
                                                    {row?.plan_?.level_percentage_east !== null && row?.plan_?.level_percentage_east !== undefined ? formatNumberFourDecimalNom(row?.plan_?.level_percentage_east?.value) : ''}
                                                </td>
                                            )}

                                            {/* UNDER Order (East)  */}
                                            {columnVisibility?.order_east && columnVisibility?.order_east_mmbtu && (
                                                <td
                                                    className={`px-2 py-1 text-[#464255] text-right `}
                                                >
                                                    {row?.plan_?.energyAdjustIFOFO_east !== null && row?.plan_?.energyAdjustIFOFO_east !== undefined ? formatNumberFourDecimalNom(row?.plan_?.energyAdjustIFOFO_east?.value) : ''}
                                                </td>
                                            )}

                                            {columnVisibility?.order_east && columnVisibility?.order_east_mmscf && (
                                                <td
                                                    className={`px-2 py-1 text-[#464255] text-right `}
                                                >
                                                    {row?.plan_?.volumeAdjustIFOFO_east !== null && row?.plan_?.volumeAdjustIFOFO_east !== undefined ? formatNumberFourDecimalNom(row?.plan_?.volumeAdjustIFOFO_east?.value) : ''}
                                                </td>
                                            )}

                                            {/* UNDER System Level (West) */}
                                            {columnVisibility?.system_level_west && columnVisibility?.level_system_level_west && (
                                                <td
                                                    className={`px-2 py-1 text-[#464255] text-center `}
                                                >
                                                    {row?.plan_?.system_level_west ? row?.plan_?.system_level_west : ''}
                                                </td>
                                            )}

                                            {columnVisibility?.system_level_west && columnVisibility?.percent_system_level_west && (
                                                <td
                                                    className={`px-2 py-1 text-[#464255] text-right `}
                                                >
                                                    {/* {row?.plan_?.level_percentage_west !== null && row?.plan_?.level_percentage_west !== undefined ? formatNumberFourDecimalNom(row?.plan_?.level_percentage_west?.value) : ''} */}
                                                    {row?.plan_?.level_percentage_west !== null && row?.plan_?.level_percentage_west !== undefined ? formatNumberTwoDecimal(row?.plan_?.level_percentage_west?.value) : ''}
                                                </td>
                                            )}

                                            {/* UNDER Order (West) */}
                                            {columnVisibility?.order_west && columnVisibility?.order_west_mmbtu && (
                                                <td
                                                    className={`px-2 py-1 text-[#464255] text-right `}
                                                >
                                                    {row?.plan_?.energyAdjustIFOFO_west !== null && row?.plan_?.energyAdjustIFOFO_west !== undefined ? formatNumberFourDecimalNom(row?.plan_?.energyAdjustIFOFO_west?.value) : ''}
                                                </td>
                                            )}

                                            {columnVisibility?.order_west && columnVisibility?.order_west_mmscf && (
                                                <td
                                                    className={`px-2 py-1 text-[#464255] text-right `}
                                                >
                                                    {row?.plan_?.volumeAdjustIFOFO_west !== null && row?.plan_?.volumeAdjustIFOFO_west !== undefined ? formatNumberFourDecimalNom(row?.plan_?.volumeAdjustIFOFO_west?.value) : ''}
                                                </td>
                                            )}

                                            {/* Condition EAST */}
                                            {columnVisibility?.condition_east && (
                                                <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                    {row?.plan_?.condition_east ? row?.plan_?.condition_east?.value : ''}
                                                </td>
                                            )}

                                            {/* Condition WEST */}
                                            {columnVisibility?.condition_west && (
                                                <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                    {row?.plan_?.condition_west ? row?.plan_?.condition_west?.value : ''}
                                                </td>
                                            )}
                                        </tr>
                                        : <RowBlankPlan columnVisibility={columnVisibility} row={row} /> // Smart Search Plan or Actual ข้อมูลขึ้นซ้อน https://app.clickup.com/t/86eudxd06
                                    }

                                    {/* Actual */}
                                    {row?.actual_ ?
                                        <tr
                                            key={row?.id}
                                            className={`${table_row_style}`}
                                        >

                                            {columnVisibility?.time && (<>
                                                {/* <td className={`px-2 py-1 text-[#464255] text-center`} ></td> */}
                                                {row?.plan_ == undefined &&
                                                    <td className={`px-2 py-1 text-[#464255] text-center `} rowSpan={2} >
                                                        {row?.gas_hour ? row?.gas_hour : ''}
                                                    </td>
                                                }

                                                <td className={`px-2 py-1 text-[#464255] bg-[#EAF5F9] sticky left-14 z-[5]`}>
                                                    {'Actual'}
                                                </td>
                                            </>
                                            )}

                                            {/* under ENTRY mmbtu */}
                                            {columnVisibility?.entry_mmbtu && columnVisibility?.east_total_entry_mmbtud && (
                                                <td
                                                    className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}
                                                >
                                                    {formatNumberFourDecimalNom(row?.actual_?.total_entry_east?.value)}
                                                </td>
                                            )}

                                            {columnVisibility?.entry_mmbtu && columnVisibility?.west_total_entry_mmbtud && (
                                                <td
                                                    className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}
                                                >
                                                    {formatNumberFourDecimalNom(row?.actual_?.total_entry_west?.value)}
                                                </td>
                                            )}

                                            {columnVisibility?.entry_mmbtu && columnVisibility?.east_west_total_entry_mmbtud && (
                                                <td
                                                    className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}
                                                >
                                                    {formatNumberFourDecimalNom(row?.actual_["total_entry_east-west"]?.value)}
                                                </td>
                                            )}


                                            {/* under EXIT mmbtu */}
                                            {columnVisibility?.exit_mmbtu && columnVisibility?.east_total_exit_mmbtu && (
                                                <td
                                                    className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}
                                                >
                                                    {formatNumberFourDecimalNom(row?.actual_?.total_exit_east?.value)}
                                                </td>
                                            )}

                                            {columnVisibility?.exit_mmbtu && columnVisibility?.west_total_exit_mmbtu && (
                                                <td
                                                    className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}
                                                >
                                                    {formatNumberFourDecimalNom(row?.actual_?.total_exit_west?.value)}
                                                </td>
                                            )}

                                            {columnVisibility?.exit_mmbtu && columnVisibility?.east_west_total_exit_mmbtu && (
                                                <td
                                                    className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}
                                                >
                                                    {formatNumberFourDecimalNom(row?.actual_["total_exit_east-west"]?.value)}
                                                </td>
                                            )}


                                            {/* UNDER Balancing Gas */}
                                            {columnVisibility?.balancing_gas && columnVisibility?.east_total_balancing_gas && (
                                                <td
                                                    className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}
                                                >
                                                    {formatNumberFourDecimalNom(row?.actual_?.revserveBal_east?.value)}
                                                </td>
                                            )}

                                            {columnVisibility?.balancing_gas && columnVisibility?.west_total_balancing_gas && (
                                                <td
                                                    className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}
                                                >
                                                    {formatNumberFourDecimalNom(row?.actual_?.revserveBal_west?.value)}
                                                </td>
                                            )}

                                            {columnVisibility?.balancing_gas && columnVisibility?.east_west_total_balancing_gas && (
                                                <td
                                                    className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}
                                                >
                                                    {formatNumberFourDecimalNom(row?.actual_["revserveBal_east-west"]?.value)}
                                                </td>
                                            )}


                                            {/* UNDER Park/Unpark */}
                                            {columnVisibility?.park_unpark && columnVisibility?.east_total_park_unpark && (
                                                <td
                                                    className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}
                                                >
                                                    {formatNumberFourDecimalNom(row?.actual_["park/unpark_east"])}
                                                </td>
                                            )}

                                            {columnVisibility?.park_unpark && columnVisibility?.west_total_park_unpark && (
                                                <td
                                                    className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}
                                                >
                                                    {formatNumberFourDecimalNom(row?.actual_["park/unpark_west"])}
                                                </td>
                                            )}


                                            {/* UNDER RA#6 */}
                                            {columnVisibility?.ra6 && columnVisibility?.ra6_ratio && (
                                                <td
                                                    className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}
                                                >
                                                    {formatNumberFourDecimalNom(row?.actual_["detail_entry_east-west_ra6Ratio"]?.value)}
                                                </td>
                                            )}


                                            {/* UNDER BVW#10 */}
                                            {columnVisibility?.bvw10 && columnVisibility?.bvw10_ratio && (
                                                <td
                                                    className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}
                                                >
                                                    {formatNumberFourDecimalNom(row?.actual_["detail_entry_east-west_bvw10Ratio"]?.value)}
                                                </td>
                                            )}


                                            {/* UNDER Shrinkage Gas & Others */}
                                            {columnVisibility?.shrinkage_gas_and_other && columnVisibility?.east_total_shrinkage_gas_and_other && (
                                                <td
                                                    className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}
                                                >
                                                    {formatNumberFourDecimalNom(row?.actual_?.shrinkage_others_east)}
                                                </td>
                                            )}

                                            {columnVisibility?.shrinkage_gas_and_other && columnVisibility?.west_total_shrinkage_gas_and_other && (
                                                <td
                                                    className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}
                                                >
                                                    {formatNumberFourDecimalNom(row?.actual_?.shrinkage_others_west)}
                                                </td>
                                            )}

                                            {columnVisibility?.shrinkage_gas_and_other && columnVisibility?.east_west_total_shrinkage_gas_and_other && (
                                                <td
                                                    className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}
                                                >
                                                    {formatNumberFourDecimalNom(row?.actual_["shrinkage_others_east-west"])}
                                                </td>
                                            )}


                                            {/* UNDER Change Min. Inventory */}
                                            {columnVisibility?.change_min_inventory && columnVisibility?.east_total_change_min_inventory && (
                                                <td
                                                    className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}
                                                >
                                                    {formatNumberFourDecimalNom(row?.actual_?.minInventoryChange_east?.value)}
                                                </td>
                                            )}

                                            {columnVisibility?.change_min_inventory && columnVisibility?.west_total_change_min_inventory && (
                                                <td
                                                    className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}
                                                >
                                                    {formatNumberFourDecimalNom(row?.actual_?.minInventoryChange_west?.value)}
                                                </td>
                                            )}

                                            {columnVisibility?.change_min_inventory && columnVisibility?.east_west_total_change_min_inventory && (
                                                <td
                                                    className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}
                                                >
                                                    {formatNumberFourDecimalNom(row?.actual_["minInventoryChange_east-west"]?.value)}
                                                </td>
                                            )}


                                            {/* UNDER Imbalance */}
                                            {columnVisibility?.imbalance && columnVisibility?.east_total_imbalance && (
                                                <td
                                                    className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}
                                                >
                                                    {formatNumberFourDecimalNom(row?.actual_?.dailyImb_east?.value)}
                                                </td>
                                            )}

                                            {columnVisibility?.imbalance && columnVisibility?.west_total_imbalance && (
                                                <td
                                                    className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}
                                                >
                                                    {formatNumberFourDecimalNom(row?.actual_?.dailyImb_west?.value)}
                                                </td>
                                            )}


                                            {/* UNDER Acc. Imbalance (Meter) (MMBTU) */}
                                            {columnVisibility?.acc_imbalance_meter_mmbtu && columnVisibility?.east_total_acc_imbalance_meter_mmbtu && (
                                                <td className={`px-2 py-1 text-[#464255] text-right ${getValidationColorClass(row?.actual_?.accImb_east?.validation?.toLowerCase())}`}>
                                                    {formatNumberFourDecimalNom(row?.actual_?.accImb_east?.value)}
                                                </td>
                                            )}

                                            {columnVisibility?.acc_imbalance_meter_mmbtu && columnVisibility?.west_total_acc_imbalance_meter_mmbtu && (
                                                <td className={`px-2 py-1 text-[#464255] text-right ${getValidationColorClass(row?.actual_?.accImb_west?.validation?.toLowerCase())}`}>
                                                    {formatNumberFourDecimalNom(row?.actual_?.accImb_west?.value)}
                                                </td>
                                            )}


                                            {/* UNDER Acc. Imbalance (Inventory) (MMBTU) */}
                                            {columnVisibility?.acc_imbalance_inventory_mmbtu && columnVisibility?.east_total_acc_imbalance_inventory_mmbtu && (
                                                <td className={`px-2 py-1 text-[#464255] text-right ${getValidationColorClass(row?.actual_?.accImbInv_east?.validation?.toLowerCase())}`}>
                                                    {formatNumberFourDecimalNom(row?.actual_?.accImbInv_east?.value)}
                                                </td>
                                            )}

                                            {columnVisibility?.acc_imbalance_inventory_mmbtu && columnVisibility?.west_total_acc_imbalance_inventory_mmbtu && (
                                                <td className={`px-2 py-1 text-[#464255] text-right ${getValidationColorClass(row?.actual_?.accImbInv_west?.validation?.toLowerCase())}`}>
                                                    {formatNumberFourDecimalNom(row?.actual_?.accImbInv_west?.value)}
                                                </td>
                                            )}


                                            {/* UNDER Total Imbalance */}
                                            {columnVisibility?.total_imbalance && (
                                                <td className={`px-2 py-1 text-[#464255] text-right ${getValidationColorClass(row?.actual_?.dailyImb_total?.validation?.toLowerCase())}`}>
                                                    {formatNumberFourDecimalNom(row?.actual_?.dailyImb_total?.value)}
                                                </td>
                                            )}

                                            {/* UNDER Percent Total Imbalance */}
                                            {columnVisibility?.percent_total_imbalance && (
                                                <td className={`px-2 py-1 text-[#464255] text-right ${getValidationColorClass(row?.actual_?.absimb?.validation?.toLowerCase())}`}>
                                                    {/* {row?.actual_?.absimb !== null && row?.actual_?.absimb !== undefined ? formatNumberFourDecimalNom(row?.actual_?.absimb?.value) + '%' : ''} */}
                                                    {row?.actual_?.absimb !== null && row?.actual_?.absimb !== undefined ? formatNumberTwoDecimalNom(row?.actual_?.absimb?.value) + '%' : ''}
                                                </td>
                                            )}


                                            {/* UNDER System Level (East) */}
                                            {columnVisibility?.system_level_east && columnVisibility?.level_system_level_east && (
                                                <td className={`px-2 py-1 text-[#464255] text-center ${getValidationColorClass(row?.actual_?.system_level_east?.toLowerCase())}`}>
                                                    {/* {row?.actual_?.system_level_east ? row?.actual_?.system_level_east : ''} */}
                                                    {row?.actual_?.system_level_east ? formatText(row?.actual_?.system_level_east) : ''}
                                                </td>
                                            )}

                                            {columnVisibility?.system_level_east && columnVisibility?.percent_system_level_east && (
                                                // <td className={`px-2 py-1 text-[#464255] text-right ${getValidationColorClass(row?.actual_?.level_percentage_east?.validation?.toLowerCase())}`}>
                                                <td className={`px-2 py-1 text-[#464255] text-right ${getValidationColorClass(row?.actual_?.system_level_east?.toLowerCase())}`}>
                                                    {/* {row?.actual_?.level_percentage_east ? formatNumberFourDecimalNom(row?.actual_?.level_percentage_east?.value) : ''} */}
                                                    {/* {formatNumberFourDecimalNom(row?.actual_?.level_percentage_east?.value)} */}
                                                    {
                                                        srchType == 'Shipper' ?
                                                            row?.actual_?.custom_level_percentage_east !== null && row?.actual_?.custom_level_percentage_east !== undefined ? formatNumberTwoDecimal(row?.actual_?.custom_level_percentage_east?.value) : ''
                                                            :
                                                            row?.actual_?.level_percentage_east !== null && row?.actual_?.level_percentage_east !== undefined ? formatNumberTwoDecimal(row?.actual_?.level_percentage_east?.value) : ''
                                                    }
                                                    {/* {
                                                        srchType == 'Shipper' ?
                                                            row?.actual_?.custom_level_percentage_east !== null && row?.actual_?.custom_level_percentage_east !== undefined ? formatNumberTwoDecimalNom(row?.actual_?.custom_level_percentage_east?.value) : ''
                                                            :
                                                            row?.actual_?.level_percentage_east !== null && row?.actual_?.level_percentage_east !== undefined ? formatNumberTwoDecimalNom(row?.actual_?.level_percentage_east?.value) : ''
                                                    } */}
                                                </td>
                                            )}

                                            {/* UNDER Order (East)  */}
                                            {columnVisibility?.order_east && columnVisibility?.order_east_mmbtu && (
                                                // <td className={`px-2 py-1 text-[#464255] text-right ${getValidationColorClass(row?.actual_?.energyAdjustIFOFO_east?.validation?.toLowerCase())}`}>
                                                <td className={`px-2 py-1 text-[#464255] text-right ${validateOrderEastWest(row?.actual_?.accImb_east?.validation, row?.actual_?.accImbInv_east?.validation, row?.actual_?.system_level_east)}`}>
                                                    {formatNumberFourDecimalNom(row?.actual_?.energyAdjustIFOFO_east?.value)}
                                                </td>
                                            )}

                                            {columnVisibility?.order_east && columnVisibility?.order_east_mmscf && (
                                                // <td className={`px-2 py-1 text-[#464255] text-right ${getValidationColorClass(row?.actual_?.volumeAdjustIFOFO_east?.validation?.toLowerCase())}`}>
                                                <td className={`px-2 py-1 text-[#464255] text-right ${validateOrderEastWest(row?.actual_?.accImb_east?.validation, row?.actual_?.accImbInv_east?.validation, row?.actual_?.system_level_east)}`}>
                                                    {formatNumberFourDecimalNom(row?.actual_?.volumeAdjustIFOFO_east?.value)}
                                                </td>
                                            )}

                                            {/* UNDER System Level (West) */}
                                            {columnVisibility?.system_level_west && columnVisibility?.level_system_level_west && (
                                                <td className={`px-2 py-1 text-[#464255] text-center ${getValidationColorClass(row?.actual_?.system_level_west?.toLowerCase())}`}>
                                                    {/* {row?.actual_?.system_level_west ? row?.actual_?.system_level_west : ''} */}
                                                    {row?.actual_?.system_level_west ? formatText(row?.actual_?.system_level_west) : ''}

                                                </td>
                                            )}

                                            {columnVisibility?.system_level_west && columnVisibility?.percent_system_level_west && (
                                                // <td className={`px-2 py-1 text-[#464255] text-right ${getValidationColorClass(row?.actual_?.level_percentage_west?.validation?.toLowerCase())}`}>
                                                <td className={`px-2 py-1 text-[#464255] text-right ${getValidationColorClass(row?.actual_?.system_level_west?.toLowerCase())}`}>
                                                    {/* {row?.actual_?.level_percentage_west ? formatNumberFourDecimalNom(row?.actual_?.level_percentage_west?.value) : ''} */}
                                                    {/* {formatNumberFourDecimalNom(row?.actual_?.level_percentage_west?.value)} */}

                                                    {/* {
                                                        srchType == 'Shipper' ?
                                                            row?.actual_?.custom_level_percentage_west !== null && row?.actual_?.custom_level_percentage_west !== undefined ? formatNumberTwoDecimalNom(row?.actual_?.custom_level_percentage_west?.value) : ''
                                                            :
                                                            row?.actual_?.level_percentage_west !== null && row?.actual_?.level_percentage_west !== undefined ? formatNumberTwoDecimalNom(row?.actual_?.level_percentage_west?.value) : ''
                                                    } */}
                                                    {
                                                        srchType == 'Shipper' ?
                                                            row?.actual_?.custom_level_percentage_west !== null && row?.actual_?.custom_level_percentage_west !== undefined ? formatNumberTwoDecimal(row?.actual_?.custom_level_percentage_west?.value) : ''
                                                            :
                                                            row?.actual_?.level_percentage_west !== null && row?.actual_?.level_percentage_west !== undefined ? formatNumberTwoDecimal(row?.actual_?.level_percentage_west?.value) : ''
                                                    }
                                                </td>
                                            )}

                                            {/* UNDER Order (West) */}
                                            {columnVisibility?.order_west && columnVisibility?.order_west_mmbtu && (
                                                // <td className={`px-2 py-1 text-[#464255] text-right ${getValidationColorClass(row?.actual_?.energyAdjustIFOFO_west?.validation?.toLowerCase())}`}>
                                                <td className={`px-2 py-1 text-[#464255] text-right ${validateOrderEastWest(row?.actual_?.accImb_west?.validation, row?.actual_?.accImbInv_west?.validation, row?.actual_?.system_level_west)}`}>
                                                    {formatNumberFourDecimalNom(row?.actual_?.energyAdjustIFOFO_west?.value)}
                                                </td>
                                            )}

                                            {columnVisibility?.order_west && columnVisibility?.order_west_mmscf && (
                                                // <td className={`px-2 py-1 text-[#464255] text-right ${getValidationColorClass(row?.actual_?.volumeAdjustIFOFO_west?.validation?.toLowerCase())}`}>
                                                <td className={`px-2 py-1 text-[#464255] text-right ${validateOrderEastWest(row?.actual_?.accImb_west?.validation, row?.actual_?.accImbInv_west?.validation, row?.actual_?.system_level_west)}`}>
                                                    {formatNumberFourDecimalNom(row?.actual_?.volumeAdjustIFOFO_west?.value)}
                                                </td>
                                            )}

                                            {/* Condition EAST */}
                                            {columnVisibility?.condition_east && (
                                                <td className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}>
                                                    {row?.actual_?.condition_east ? row?.actual_?.condition_east?.value : ''}
                                                </td>
                                            )}

                                            {/* Condition WEST */}
                                            {columnVisibility?.condition_west && (
                                                <td className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}>
                                                    {row?.actual_?.condition_west ? row?.actual_?.condition_west?.value : ''}
                                                </td>
                                            )}

                                        </tr>
                                        : <RowBlankActual columnVisibility={columnVisibility} row={row} />  // Smart Search Plan or Actual ข้อมูลขึ้นซ้อน https://app.clickup.com/t/86eudxd06
                                    }
                                </>
                            ))}
                        </tbody>
                    </table>
                    :
                    <TableSkeleton />
            }

            {
                isLoading && sortedData?.length == 0 && <NodataTable />
            }

        </div >
    )
}

export default TableMain;