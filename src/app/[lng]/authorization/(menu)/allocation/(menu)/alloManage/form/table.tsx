import { useEffect, useRef } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import { formatNumberFourDecimal, iconButtonClass, toDayjs } from '@/utils/generalFormatter';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import BtnActionTable from "@/components/other/btnActionInTable";
import { handleSort, handleSortAllocMgn } from "@/utils/sortTable";

interface TableProps {
    openEditForm: (id: any) => void;
    openViewForm: (id: any) => void;
    openReasonModal: (id?: any, data_comment?: any, row?: any) => void;
    tableData: any;
    isLoading: any;
    columnVisibility: any;
    userPermission?: any;
    selectedItem?: any;
    setselectedItem?: any;
    openHistoryForm: (id: any) => void;
}


const TableAlloManage: React.FC<TableProps> = ({ openEditForm, openViewForm, tableData, isLoading, columnVisibility, userPermission, selectedItem, setselectedItem, openHistoryForm, openReasonModal }) => {

    const [tk, settk] = useState<boolean>(true);
    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(tableData);
    const [sortedDataTransform, setSortedDataTransform] = useState(tableData);
    const [toggleData, settoggleData] = useState<any>();
    const [checkedData, setcheckedData] = useState<any>();

    useEffect(() => {
        if (tableData && tableData.length > 0) {

            const transformed = tableData?.map((item: any) => ({
                ...item,
                data: item.data.map((d: any) => ({
                    ...d,
                    allocation_status_name: d.allocation_status?.name || null
                }))
            }));

            setSortedDataTransform(transformed)
            setSortedData(transformed);
            setcheckedAll(false)

            let toggleDT: any[] = [];
            let checkedDT: any[] = [];

            for (let index = 0; index < transformed.length; index++) {
                const id = transformed[index]?.id;

                // หา toggle เดิม
                const existingToggle = toggleData?.find((item: any) => item.id === id);

                toggleDT.push({
                    id,
                    toggle: existingToggle ? existingToggle.toggle : false
                });

                if (transformed[index]?.data?.length > 0) {
                    const dataSub = transformed[index]?.data;
                    const itemDT = dataSub.map((sub: any) => ({
                        parent: id,
                        id: sub.id,
                        allocation_status: sub.allocation_status,
                        checked: false
                    }));

                    checkedDT.push({
                        checked: false,
                        id,
                        allocation_status: transformed[index]?.status,
                        data: itemDT
                    });
                }
            }

            settoggleData(toggleDT);
            setcheckedData(checkedDT);
        } else {
            setSortedData([]);
        }

    }, [tableData]);

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    const [openPopoverId, setOpenPopoverId] = useState(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const togglePopover = (id: any) => {
        if (openPopoverId === id) {
            setOpenPopoverId(null); // Close the popover if it's already open
        } else {
            setOpenPopoverId(id); // Open the popover for the clicked row
        }
    };

    const toggleMenu = (mode: any, id: any) => {
        switch (mode) {
            case "history":
                openHistoryForm(id);
                setOpenPopoverId(null);
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

    const renderStatus: any = (data: any) => {
        let items: any = [
            {
                id: 0,
                label: 'Shipper Reviewed',
                color: '#D0E5FD'
            },
            {
                id: 1,
                label: 'Rejected',
                color: '#FFF1CE'
            },
            {
                id: 2,
                label: 'Accepted',
                color: '#C8FFD7'
            },
            {
                id: 3,
                label: 'Allocated',
                color: '#A7EFFF'
            },
            {
                id: 4,
                label: 'Not Review',
                color: '#DEDEDE'
            }
        ];

        let m11: any = data?.filter((item: any) => item?.allocation_status?.id == 2); //shipper
        let m13: any = data?.filter((item: any) => item?.allocation_status?.id == 3); //accepted
        let m14: any = data?.filter((item: any) => item?.allocation_status?.id == 4); //allowcated
        let m12: any = data?.filter((item: any) => item?.allocation_status?.id == 5); //rejected

        let renderColor: any = m11?.length > 0 ? items[0]?.color : m12?.length > 0 ? items[1]?.color : m13?.length > 0 ? items[2]?.color : m14?.length > 0 ? items[3]?.color : items[4]?.color;
        let renderTxt: any = m11?.length > 0 ? items[0]?.label : m12?.length > 0 ? items[1]?.label : m13?.length > 0 ? items[2]?.label : m14?.length > 0 ? items[3]?.label : items[4]?.label;

        return (<div className="w-[160px] p-1 text-center rounded-[50px]" style={{ background: renderColor }}>{renderTxt}</div>)
    }

    const [checkedAll, setcheckedAll] = useState<boolean>(false);

    const renderCheckedAll: any = (checked: any, mode: 'clickAll' | 'checkAll') => {
        if (mode == 'clickAll') {
            let checkFirst: any = checkedData;
            for (let i1 = 0; i1 < checkFirst?.length; i1++) {
                const currentData = checkFirst[i1]?.data;
                if (!currentData || !Array.isArray(currentData)) {
                    continue;
                }
                
                let checkedShipper: any = currentData.filter((item: any) => item?.allocation_status?.id == 2);

                if (checkedShipper?.length > 0) {
                    for (let i2 = 0; i2 < currentData.length; i2++) {
                        const item = currentData[i2];
                        if (item?.allocation_status?.id == 2 && item) {
                            item.checked = checked;

                            if (checked == true) {
                                const itemId = item.id;
                                if (itemId) {
                                    let itemPush: any = { id: itemId };
                                    setselectedItem((pre: any) => [...(pre ?? []), itemPush]);
                                }
                            } else if (checked == false) {
                                setselectedItem((pre: any) => []);
                            }
                        }
                    }

                    if (checkFirst[i1]) {
                        checkFirst[i1].checked = checked;
                    }
                }
            }
            setcheckedAll(checked);
        } else if (mode == 'checkAll') {
            if (checkedAll !== checked) {
                let checkFirst: any = checkedData;
                let checkResult: any = [];
                for (let i1 = 0; i1 < checkFirst?.length; i1++) {
                    const currentData = checkFirst[i1]?.data;
                    if (!currentData || !Array.isArray(currentData)) {
                        continue;
                    }
                    
                    let checkedShipper: any = currentData.filter((item: any) => item?.allocation_status?.id == 2);
                    if (checkedShipper?.length > 0) {
                        for (let i2 = 0; i2 < currentData.length; i2++) {
                            const item = currentData[i2];
                            if (item?.allocation_status?.id == 2 && item?.checked !== checked) {
                                checkResult.push({
                                    id: item?.id,
                                    checked: item?.checked
                                });
                            }
                        }
                    }
                }

                if (checkResult?.length == 0) {
                    setcheckedAll(checked);
                }
            }
        }
        settk(!tk);
    }

    const genManoStatus = (data: any[]) => {
        const priority = ["Shipper Reviewed", "Accepted", "Allocated", "Rejected", "Not Review"];

        // // สร้าง array ใหม่ ตามลำดับ priority โดย filter ทีละกลุ่ม
        // const orderedData = priority?.flatMap((status) =>
        //     data?.filter((item) => item.allocation_status?.name === status) || []
        // );
        // return orderedData;

        data.sort((a: any, b: any) => {
            const indexA = priority.indexOf(a.allocation_status_name);
            const indexB = priority.indexOf(b.allocation_status_name);
            // If not found in priority, put at the end (large number)
            const priorityA = indexA === -1 ? 999 : indexA;
            const priorityB = indexB === -1 ? 999 : indexB;

            return priorityA - priorityB;
        });

        return data;
    };

    return (
        <div className="h-[calc(100vh-380px)] overflow-y-auto overflow-x-auto rounded-t-md">
            {
                isLoading ?
                    <table className="table-auto min-w-full text-sm rtl:text-right text-gray-500 whitespace-nowrap">
                        <thead className="text-xs text-[#ffffff] sticky top-0 z-10">
                            <tr className="h-9">
                                {columnVisibility?.total && (
                                    <th scope="col" className={`${table_header_style} bg-[#1473A1]`}>
                                        <div className="flex justify-center items-center">
                                            <input
                                                type="checkbox"
                                                onChange={(e) => renderCheckedAll(e?.target?.checked, 'clickAll')}
                                                checked={checkedAll}
                                                className="form-checkbox w-5 h-5 border rounded-[8px] accent-[#1473A1] focus:ring-[#1473A1] disabled:opacity-100 disabled:cursor-not-allowed "
                                            />
                                        </div>
                                    </th>
                                )}
                                {columnVisibility?.status && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} text-center bg-[#1473A1]`}
                                        // onClick={() => handleSort("data.allocation_status.name", sortState, setSortState, setSortedData, tableData)}
                                        onClick={() => handleSortAllocMgn(
                                            // "data.allocation_status.name", // path
                                            "data.allocation_status_name", // path
                                            sortState,
                                            setSortState,
                                            setSortedData,
                                            // tableData,
                                            sortedDataTransform,
                                            "first" // ใช้ค่าของ sub-row ตัวแรก
                                        )}
                                    >
                                        {`Status`}
                                        {/* {getArrowIcon("data.allocation_status.name")} */}
                                        {getArrowIcon("data.allocation_status_name")}
                                    </th>
                                )}
                                {columnVisibility?.gas_day && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} bg-[#1473A1]`}
                                        // onClick={() => handleSort("data.gas_day", sortState, setSortState, setSortedData, tableData)}
                                        onClick={() => handleSort("data.gas_day", sortState, setSortState, setSortedData, sortedDataTransform)}
                                    >
                                        {`Gas Day`}
                                        {getArrowIcon("data.gas_day")}
                                    </th>
                                )}
                                {columnVisibility?.shipper && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} bg-[#1473A1]`}
                                        // onClick={() => handleSort("data.group.name", sortState, setSortState, setSortedData, tableData)}
                                        onClick={() => handleSort("data.group.name", sortState, setSortState, setSortedData, sortedDataTransform)}
                                    >
                                        {`Shipper Name`}
                                        {getArrowIcon("data.group.name")}
                                    </th>
                                )}
                                {columnVisibility?.contract && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} text-center bg-[#1473A1]`}
                                        // onClick={() => handleSort("data.contract_code.contract_code", sortState, setSortState, setSortedData, tableData)}
                                        onClick={() => handleSort("data.contract_code.contract_code", sortState, setSortState, setSortedData, sortedDataTransform)}
                                    >
                                        {`Contract Code`}
                                        {getArrowIcon("data.contract_code.contract_code")}
                                    </th>
                                )}
                                {columnVisibility?.nompoint && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} py-5 bg-[#1473A1]`}
                                        // onClick={() => handleSort("point_text", sortState, setSortState, setSortedData, tableData)}
                                        onClick={() => handleSort("point_text", sortState, setSortState, setSortedData, sortedDataTransform)}
                                    >
                                        <div>{`Nomination Point /`}</div>
                                        <div className="mt-[5px]">{`Concept Point`}</div>
                                        {getArrowIcon("point_text")}
                                    </th>
                                )}
                                {columnVisibility?.entryexit && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} text-center bg-[#1473A1]`}
                                        // onClick={() => handleSort("data.entry_exit", sortState, setSortState, setSortedData, tableData)}
                                        onClick={() => handleSort("data.entry_exit", sortState, setSortState, setSortedData, sortedDataTransform)}
                                    >
                                        {`Entry / Exit`}
                                        {getArrowIcon("data.entry_exit")}
                                    </th>
                                )}
                                {columnVisibility?.nominatedval && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} py-5 bg-[#1473A1]`}
                                        // onClick={() => handleSort("data.nominationValue", sortState, setSortState, setSortedData, tableData)}
                                        onClick={() => handleSort("data.nominationValue", sortState, setSortState, setSortedData, sortedDataTransform)}
                                    >
                                        <div>{`Nominated Value`}</div>
                                        <div className="mt-[5px]">{`(MMBTU/D)`}</div>
                                        {getArrowIcon("data.nominationValue")}
                                    </th>
                                )}
                                {columnVisibility?.system_allo && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} py-5 bg-[#1473A1]`}
                                        // onClick={() => handleSort("data.systemAllocation", sortState, setSortState, setSortedData, tableData)}
                                        // onClick={() => handleSort("system_allocation", sortState, setSortState, setSortedData, tableData)}
                                        onClick={() => handleSort("system_allocation", sortState, setSortState, setSortedData, sortedDataTransform)}
                                    >
                                        <div>{`System Allocation`}</div>
                                        <div className="mt-[5px]">{`(MMBTU/D)`}</div>
                                        {/* {getArrowIcon("data.systemAllocation")} */}
                                        {getArrowIcon("system_allocation")}
                                    </th>
                                )}
                                {columnVisibility?.intraday_allo && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} py-5 bg-[#1473A1]`}
                                        // onClick={() => handleSort("data.intradaySystem", sortState, setSortState, setSortedData, tableData)}
                                        onClick={() => handleSort("data.intradaySystem", sortState, setSortState, setSortedData, sortedDataTransform)}
                                    >
                                        <div>{`Intraday System Allocation`}</div>
                                        <div className="mt-[5px]">{`(MMBTU/D)`}</div>
                                        {getArrowIcon("data.intradaySystem")}
                                    </th>
                                )}
                                {columnVisibility?.previous_allo && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} py-5 bg-[#B8E6FE] text-[#1473A1] hover:text-[#ffffff]`}
                                        // onClick={() => handleSort("data.previousAllocationTPAforReview", sortState, setSortState, setSortedData, tableData)}
                                        // onClick={() => handleSort("previous_allocation_tpa_for_review", sortState, setSortState, setSortedData, tableData)}
                                        onClick={() => handleSort("previous_allocation_tpa_for_review", sortState, setSortState, setSortedData, sortedDataTransform)}
                                    >
                                        <div>{`Previous Allocation`}</div>
                                        <div className="mt-[5px]">{`(MMBTU/D)`}</div>
                                        {getArrowIcon("previous_allocation_tpa_for_review")}
                                    </th>
                                )}
                                {columnVisibility?.shipper_allo && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} py-1 bg-[#B8E6FE] text-[#1473A1] hover:text-[#ffffff]`}
                                        // onClick={() => handleSort("data.shipperAllocationReview", sortState, setSortState, setSortedData, tableData)}
                                        // onClick={() => handleSort("shipper_allocation_review", sortState, setSortState, setSortedData, tableData)}
                                        onClick={() => handleSort("shipper_allocation_review", sortState, setSortState, setSortedData, sortedDataTransform)}
                                    >
                                        <div>{`Shipper Allocation Review`}</div>
                                        <div className="mt-[5px]">{`(MMBTU/D)`}</div>
                                        {getArrowIcon("shipper_allocation_review")}
                                    </th>
                                )}
                                {columnVisibility?.metering_allo && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} py-1 bg-[#B8E6FE] text-[#1473A1] hover:text-[#ffffff]`}
                                        // onClick={() => handleSort("data.meteringValue", sortState, setSortState, setSortedData, tableData)}
                                        // onClick={() => handleSort("metering_value", sortState, setSortState, setSortedData, tableData)}
                                        onClick={() => handleSort("metering_value", sortState, setSortState, setSortedData, sortedDataTransform)}
                                    >
                                        {`Metering Value (MMBTU/D)`}
                                        {getArrowIcon("metering_value")}
                                    </th>
                                )}
                                {columnVisibility?.review && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} py-1 bg-[#B8E6FE] text-[#1473A1] hover:text-[#ffffff]`}
                                        // onClick={() => handleSort("data.reviewCode", sortState, setSortState, setSortedData, tableData)}
                                        onClick={() => handleSort("data.reviewCode", sortState, setSortState, setSortedData, sortedDataTransform)}
                                    >
                                        {`Review Code`}
                                        {getArrowIcon("data.reviewCode")}
                                    </th>
                                )}
                                {columnVisibility?.comment && (
                                    <th scope="col" className={`${table_header_style} py-1 bg-[#B8E6FE] text-[#1473A1]`}>
                                        {`Comment`}
                                    </th>
                                )}
                                {columnVisibility?.action && (
                                    <th scope="col" className="px-2 py-1 text-center bg-[#1473A1]">
                                        {`Action`}
                                    </th>
                                )}
                            </tr>
                        </thead>

                        <tbody>
                            {sortedData && sortedData?.map((row: any, key: any) => {

                                return (
                                    <>
                                        <tr
                                            key={'main-' + key}
                                            className={`${table_row_style} !bg-[#E8FFEE] cursor-pointer`}
                                            onClick={() => {
                                                let toggleIDX: any = toggleData?.findIndex((item: any) => item?.id == row?.id);

                                                // if (toggleIDX !== -1) {
                                                //     toggleData[toggleIDX].toggle = !toggleData[toggleIDX]?.toggle;
                                                //     settk(!tk);
                                                // }

                                                if (toggleIDX !== -1) {
                                                    settoggleData((prev: any) =>
                                                        prev.map((item: any, index: any) =>
                                                            index === toggleIDX ? { ...item, toggle: !item.toggle } : item
                                                        )
                                                    );
                                                    settk((prev) => !prev);
                                                }
                                            }}
                                        >
                                            {columnVisibility?.total && (
                                                // <td className="px-2 py-1 text-[#464255]">{row?.menus && row?.menus?.name}</td>
                                                <td className="px-2 py-1 text-[#464255]">
                                                    <div className="flex gap-2">
                                                        <div
                                                            className="cursor-pointer"
                                                        >
                                                            {toggleData?.find((item: any) => item?.id == row?.id)?.toggle == true ? <KeyboardArrowUpIcon className="mr-[13px]" /> : <KeyboardArrowDownIcon className="mr-[13px]" />}
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            onClick={(e) => e.stopPropagation()} // ⛔ ใส่ไว้เพื่อตอนติ๊ก checkbox จะไม่ทำงาน onClick ของ <tr>
                                                            onChange={(e) => {
                                                                if (!e || !e.target) return;
                                                                let itemChange: any = checkedData?.find((item: any) => item?.id == row?.id);
                                                                if (itemChange) {
                                                                    itemChange.checked = e.target.checked;

                                                                    if (e?.target?.checked == true) {
                                                                        const itemId = itemChange?.id;
                                                                        if (itemId) {
                                                                            let itemPush: any = { id: itemId };
                                                                            setselectedItem((pre: any) => [...pre, itemPush]);
                                                                        }
                                                                    } else if (e?.target?.checked == false) {
                                                                        let newItem: any = selectedItem;
                                                                        let findIDX: any = selectedItem?.findIndex((item: any) => item?.id == itemChange?.id);
                                                                        if (findIDX !== -1 || findIDX) {
                                                                            newItem?.splice(findIDX, 1);
                                                                            setselectedItem((pre: any) => [...newItem]);
                                                                        }
                                                                    }

                                                                    for (let index = 0; index < itemChange?.data?.length; index++) {
                                                                        if (itemChange?.data?.[index]?.allocation_status?.id == 2) {
                                                                            if (itemChange?.data?.[index]) {
                                                                                itemChange.data[index].checked = e?.target?.checked;

                                                                                if (e?.target?.checked == true) {
                                                                                    const subItemId = itemChange?.data?.[index]?.id;
                                                                                    if (subItemId) {
                                                                                        let itemPush: any = { id: subItemId, parent: true };
                                                                                        setselectedItem((pre: any) => [...pre, itemPush]);
                                                                                    }
                                                                                } else if (e?.target?.checked == false) {
                                                                                    let newItem: any = selectedItem ? [...selectedItem] : [];
                                                                                    let findIDX: any = selectedItem?.findIndex((item: any) => item?.id == itemChange?.data?.[index]?.id && item?.parent == true);
                                                                                    if (findIDX !== -1 && findIDX !== undefined) {
                                                                                        newItem.splice(findIDX, 1);
                                                                                        setselectedItem(() => newItem);
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                                settk(!tk);

                                                                renderCheckedAll(e?.target?.checked, 'checkAll');
                                                            }}
                                                            // disabled={tableData?.find((item: any) => item?.id == row?.id)?.data?.filter((searchitem: any) => searchitem?.allocation_status?.id == 2)?.length > 0 ? false : true}
                                                            disabled={sortedDataTransform?.find((item: any) => item?.id == row?.id)?.data?.filter((searchitem: any) => searchitem?.allocation_status?.id == 2)?.length > 0 ? false : true}
                                                            checked={checkedData?.find((item: any) => item?.id == row?.id)?.checked}
                                                            className="form-checkbox w-5 h-5 border rounded-[8px] accent-[#1473A1] focus:ring-[#1473A1] disabled:opacity-100 disabled:cursor-not-allowed "
                                                        />
                                                        <div className="text-[#06522E] font-bold">{'Total'}</div>
                                                    </div>
                                                </td>
                                            )}

                                            {columnVisibility?.status && (
                                                <td className="px-2 py-1 text-[#464255]">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {renderStatus(row?.data)}
                                                        {/* <div className="w-[160px] p-1 text-center rounded-[50px]" style={{background: row?.status ? row?.status?.color : '#FFF1CE'}}>{row?.status && row?.status?.name}</div> */}
                                                    </div>
                                                </td>
                                            )}

                                            {columnVisibility?.gas_day && (
                                                <td className="px-2 py-1 text-[#464255]">
                                                    {/* v2.0.33 รูปแบบวันที่ gas day ต้องเปลี่ยนเป็น dd/mm/yyyy ให้เหมือนเมนูอื่นๆ https://app.clickup.com/t/86etetaxc */}
                                                    {/* <div className="font-bold">{row?.gas_day ? row?.gas_day : null}</div> */}
                                                    <div className="font-bold">{row?.gas_day ? toDayjs(row?.gas_day, 'YYYY-MM-DD').format("DD/MM/YYYY") : null}</div>
                                                </td>
                                            )}

                                            {columnVisibility?.shipper && (
                                                <td className="px-2 py-1 text-[#464255]" />
                                            )}

                                            {columnVisibility?.contract && (
                                                <td className="px-2 py-1 text-[#464255]" />
                                            )}

                                            {columnVisibility?.nompoint && (
                                                <td className="px-2 py-1 text-[#06522E]">
                                                    <div className="font-bold">{row?.point_text ? row?.point_text : null}</div>
                                                </td>
                                            )}

                                            {/* {columnVisibility?.entryexit && (
                                                // <td className="px-2 py-1 text-[#464255] text-center" />
                                                <td className="px-2 py-1 text-[#464255] text-center" >
                                                    <div className="w-[120px] p-1 text-center rounded-[50px]"
                                                        style={{ background: row?.entry_exit == "Exit" ? '#FFF0CE' : '#C8FED7' }}>
                                                        {row?.entry_exit && row?.entry_exit}
                                                    </div>
                                                </td>
                                            )} */}

                                            {
                                                columnVisibility?.entryexit && row?.entry_exit ?
                                                    <td className="px-2 py-1 text-[#464255]">
                                                        <div className="flex items-center justify-center">
                                                            <div className="w-[120px] p-1 text-center rounded-[50px]" style={{ background: row?.entry_exit == "Exit" ? '#FFF3C8' : '#C8FED7' }}>{row?.entry_exit && row?.entry_exit}</div>
                                                        </div>
                                                    </td>
                                                    : columnVisibility?.entryexit && !row?.entry_exit && <td className="px-2 py-1 text-[#464255]">
                                                        <div className="flex items-center justify-center">
                                                            <div className="w-[120px] p-1 text-center rounded-[50px]" >{``}</div>
                                                        </div>
                                                    </td>
                                            }

                                            {columnVisibility?.nominatedval && (
                                                <td className="px-2 py-1 text-[#06522E] text-right">
                                                    {/* <div className="font-bold">{row?.nomination_value ? formatNumberFourDecimal(row?.nomination_value) : null}</div> */}
                                                    <div className="font-bold">{row?.nomination_value !== null && row?.nomination_value !== undefined ? formatNumberFourDecimal(row?.nomination_value) : null}</div>
                                                </td>
                                            )}

                                            {columnVisibility?.system_allo && (
                                                <td className="px-2 py-1 text-[#06522E] text-right">
                                                    <div className="font-bold">{row?.system_allocation !== null && row?.system_allocation !== undefined ? formatNumberFourDecimal(row?.system_allocation) : null}</div>
                                                </td>
                                            )}

                                            {columnVisibility?.intraday_allo && (
                                                <td className="px-2 py-1 text-[#06522E] text-right">
                                                    <div className="font-bold">{row?.intraday_system !== null && row?.intraday_system !== undefined ? formatNumberFourDecimal(row?.intraday_system) : null}</div>
                                                </td>
                                            )}

                                            {columnVisibility?.previous_allo && (
                                                <td className="px-2 py-1 text-[#06522E] text-right">
                                                    <div className="font-bold">{row?.previous_allocation_tpa_for_review !== null && row?.previous_allocation_tpa_for_review !== undefined ? formatNumberFourDecimal(row?.previous_allocation_tpa_for_review) : null}</div>
                                                </td>
                                            )}

                                            {columnVisibility?.shipper_allo && (
                                                <td className={`px-2 py-1  ${formatNumberFourDecimal(row?.shipper_allocation_review) !== formatNumberFourDecimal(row?.metering_value) ? 'text-[#ED1B24]' : 'text-[#06522E]'} text-right`}>
                                                    <div className="font-bold">{row?.shipper_allocation_review !== null && row?.shipper_allocation_review !== undefined ? formatNumberFourDecimal(row?.shipper_allocation_review) : null}</div>
                                                </td>
                                            )}

                                            {columnVisibility?.metering_allo && (
                                                <td className={`px-2 py-1  ${formatNumberFourDecimal(row?.shipper_allocation_review) !== formatNumberFourDecimal(row?.metering_value) ? 'text-[#ED1B24]' : 'text-[#06522E]'} text-right`}>
                                                    <div className="font-bold">{row?.metering_value !== null && row?.metering_value !== undefined ? formatNumberFourDecimal(row?.metering_value) : ''}</div>
                                                </td>
                                            )}

                                            {columnVisibility?.review && (
                                                <td className="px-2 py-1 text-[#464255]" />
                                            )}

                                            {columnVisibility?.comment && (
                                                <td className="px-2 py-1 text-[#464255]" />
                                            )}

                                            {columnVisibility?.action && (
                                                <td className="px-2 py-1 text-[#464255]" />
                                            )}
                                        </tr>

                                        {/* EXPAND */}
                                        {toggleData?.find((item: any) => item?.id == row?.id)?.toggle == true && row?.data && Array.isArray(row.data) && row.data.length > 0 && genManoStatus(row.data) && Array.isArray(genManoStatus(row.data)) ? genManoStatus(row.data).map((item: any, key: any) => {
                                            let thisCheckItem: any = checkedData?.find((item: any) => item?.id == row?.id);

                                            return (
                                                <tr
                                                    key={'sub-' + key}
                                                    className={`${table_row_style}`}
                                                >
                                                    {columnVisibility?.total && (
                                                        <td className="px-2 py-1 text-[#464255]">
                                                            <div className="flex gap-2 justify-center items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    onChange={(e) => {
                                                                        let itemChange: any = thisCheckItem?.data?.find((f: any) => f?.id == item?.id);
                                                                        if (itemChange) {
                                                                            itemChange.checked = e?.target?.checked;
                                                                            settk(!tk);

                                                                            let countData: any = thisCheckItem?.data?.filter((f: any) => f?.allocation_status?.id == 2)?.length;
                                                                            let countChecked: any = 0;

                                                                            if (e?.target?.checked == true) {
                                                                                const itemId = itemChange?.id;
                                                                                if (itemId) {
                                                                                    let itemPush: any = { id: itemId, parent: true };
                                                                                    setselectedItem((pre: any) => [...pre, itemPush]);
                                                                                }

                                                                                let checkParent: any = selectedItem?.find((item: any) => item?.id == thisCheckItem?.id);
                                                                                if (!checkParent && thisCheckItem?.id) {
                                                                                    let itempushParent: any = { id: thisCheckItem.id };
                                                                                    setselectedItem((pre: any) => [...pre, itempushParent]);
                                                                                }
                                                                            } else if (e && e.target && e.target.checked == false) {
                                                                                let newItem: any = selectedItem;
                                                                                let findIDX: any = selectedItem && Array.isArray(selectedItem) ? selectedItem.findIndex((item: any) => item?.id == itemChange?.id && item?.parent == true) : -1;

                                                                                if (findIDX !== -1 && findIDX !== null && findIDX !== undefined) {
                                                                                    if (newItem && Array.isArray(newItem)) {
                                                                                        newItem.splice(findIDX, 1);
                                                                                    setselectedItem((pre: any) => [...newItem]);
                                                                                    }
                                                                                }
                                                                            }

                                                                            if (thisCheckItem) {
                                                                                for (let index = 0; index < thisCheckItem?.data?.length; index++) {
                                                                                    if (thisCheckItem?.checked == true) {
                                                                                        if (thisCheckItem?.data?.[index]?.allocation_status?.id == 2 && thisCheckItem?.data?.[index]?.checked == false) {
                                                                                            countChecked = countChecked + 1;
                                                                                        }
                                                                                    } else if (thisCheckItem?.checked == false) {
                                                                                        if (thisCheckItem?.data?.[index]?.allocation_status?.id == 2 && thisCheckItem?.data?.[index]?.checked == true) {
                                                                                            countChecked = countChecked + 1;
                                                                                        }
                                                                                    }
                                                                                }

                                                                                if (thisCheckItem?.checked == true) {
                                                                                    thisCheckItem.checked = !thisCheckItem.checked;
                                                                                    let findIDX_MAIN: any = selectedItem?.findIndex((item: any) => item?.id == thisCheckItem?.id);

                                                                                    if (findIDX_MAIN !== -1 || findIDX_MAIN) {
                                                                                        let newItem: any = selectedItem;
                                                                                        newItem?.splice(findIDX_MAIN, 1);
                                                                                        setselectedItem((pre: any) => [...newItem]);
                                                                                    }
                                                                                } else if (thisCheckItem?.checked == false) {
                                                                                    if (countChecked == countData) {
                                                                                        thisCheckItem.checked = !thisCheckItem.checked
                                                                                    }
                                                                                }
                                                                            }

                                                                            settk(!tk);
                                                                            renderCheckedAll(e?.target?.checked, 'checkAll');
                                                                        }
                                                                    }}
                                                                    disabled={item?.allocation_status?.id !== 2 ? true : false}
                                                                    // disabled={false}
                                                                    checked={thisCheckItem?.data?.find((f: any) => f?.id == item?.id)?.checked}
                                                                    className="form-checkbox w-5 h-5 border rounded-[8px] accent-[#1473A1] focus:ring-[#1473A1] disabled:opacity-100 disabled:cursor-not-allowed "
                                                                />
                                                            </div>
                                                        </td>
                                                    )}

                                                    {columnVisibility?.status && (
                                                        <td className="px-2 py-1 text-[#464255]">
                                                            <div className="flex items-center justify-center">
                                                                <div className="w-[160px] p-1 text-center rounded-[50px]" style={{ background: item?.allocation_status ? item?.allocation_status?.color : '#FFF1CE' }}>{item?.allocation_status && item?.allocation_status?.name}</div>
                                                            </div>
                                                        </td>
                                                    )}

                                                    {columnVisibility?.gas_day && (
                                                        <td className="px-2 py-1 text-[#464255]">
                                                            {/* <div>{item?.gas_day ? item?.gas_day : ''}</div> */}
                                                            <div>{item?.gas_day ? toDayjs(item?.gas_day, 'YYYY-MM-DD').format("DD/MM/YYYY") : ''}</div>
                                                        </td>
                                                    )}

                                                    {columnVisibility?.shipper && (
                                                        <td className="px-2 py-1 text-[#464255]">
                                                            {/* <div>{item?.shipper_name_text ? item?.shipper_name_text : null}</div> */}
                                                            <div>{item?.group ? item?.group?.name : null}</div>
                                                        </td>
                                                    )}

                                                    {columnVisibility?.contract && (
                                                        <td className="px-2 py-1 text-[#464255] text-center">
                                                            {/* <div>{item?.contract_code ? item?.contract_code?.contract_code : null}</div> */}
                                                            {/* <div>{item?.contract_code_text ? item?.contract_code_text : null}</div> */}
                                                            <div>{item?.contract ? item?.contract : null}</div>
                                                        </td>
                                                    )}

                                                    {columnVisibility?.nompoint && (
                                                        <td className="px-2 py-1 text-[#464255]">
                                                            {/* <div>{item?.evidenUse ? item?.evidenUse?.data.point : null}</div> */}
                                                            {/* <div>{item?.point_text ? item?.point_text : null}</div> */}
                                                            <div>{item?.point ? item?.point : null}</div>
                                                        </td>
                                                    )}

                                                    {/* {columnVisibility?.entryexit && (
                                                        <td className="px-2 py-1 text-[#464255]">
                                                            <div className="flex items-center justify-center">
                                                                <div className="w-[120px] p-1 text-center rounded-[50px]" style={{ background: item?.entry_exit_obj ? item?.entry_exit_obj?.color : '#FFF1CE' }}>{item?.entry_exit_obj && item?.entry_exit_obj?.name}</div>
                                                            </div>
                                                        </td>
                                                    )} */}

                                                    {
                                                        columnVisibility?.entryexit && item?.entry_exit_obj ?
                                                            <td className="px-2 py-1 text-[#464255]">
                                                                <div className="flex items-center justify-center">
                                                                    <div className="w-[120px] p-1 text-center rounded-[50px]" style={{ background: item?.entry_exit_obj ? item?.entry_exit_obj?.color : '#FFF1CE' }}>{item?.entry_exit_obj && item?.entry_exit_obj?.name}</div>
                                                                </div>
                                                            </td>
                                                            : columnVisibility?.entryexit && !item?.entry_exit_obj && <td className="px-2 py-1 text-[#464255]">
                                                                <div className="flex items-center justify-center">
                                                                    <div className="w-[120px] p-1 text-center rounded-[50px]" >{``}</div>
                                                                </div>
                                                            </td>
                                                    }


                                                    {columnVisibility?.nominatedval && (
                                                        <td className="px-2 py-1 text-[#464255]">
                                                            {/* <div className="text-right">{item?.nominationValue !== null && item?.nominationValue !== undefined ? formatNumberFourDecimal(item?.nominationValue) : ''}</div> */}
                                                            {/* <div className="text-right">{item?.nominationValue !== null && item?.nominationValue !== undefined ? formatNumberFourDecimal(item?.nominationValue) : ''}</div> */}
                                                            <div className="text-right">{item?.nominationValue !== null && item?.nominationValue !== undefined ? formatNumberFourDecimal(Number(String(item?.nominationValue).replace(/,/g, '').trim())) : ''}</div>

                                                        </td>
                                                    )}

                                                    {columnVisibility?.system_allo && (
                                                        <td className="px-2 py-1 text-[#464255]">
                                                            <div className="text-right">{item?.systemAllocation !== null && item?.systemAllocation !== undefined ? formatNumberFourDecimal(item?.systemAllocation) : ''}</div>
                                                        </td>
                                                    )}

                                                    {columnVisibility?.intraday_allo && (
                                                        <td className="px-2 py-1 text-[#464255]">
                                                            <div className="text-right">{item?.intradaySystem !== null && item?.intradaySystem !== undefined ? formatNumberFourDecimal(item?.intradaySystem) : ''}</div>
                                                        </td>
                                                    )}

                                                    {columnVisibility?.previous_allo && (
                                                        <td className="px-2 py-1 text-[#464255]">
                                                            <div className="text-right">{item?.previousAllocationTPAforReview !== null && item?.previousAllocationTPAforReview !== undefined ? formatNumberFourDecimal(item?.previousAllocationTPAforReview) : ''}</div>
                                                        </td>
                                                    )}

                                                    {columnVisibility?.shipper_allo && (
                                                        <td className="px-2 py-1 text-[#464255]">
                                                            {/* <div className="text-right">{item?.shipperAllocationReview ? formatNumberFourDecimal(item?.shipperAllocationReview) : ''}</div> */}
                                                            <div className="text-right">{item?.allocation_management_shipper_review !== null && item?.allocation_management_shipper_review !== undefined ? formatNumberFourDecimal(item?.allocation_management_shipper_review?.[0]?.shipper_allocation_review) : ''}</div>
                                                        </td>
                                                    )}

                                                    {columnVisibility?.metering_allo && (
                                                        <td className="px-2 py-1 text-[#464255]">
                                                            {/* <div className="text-right">{item?.meteringValue ? formatNumberFourDecimal(item?.meteringValue) : ''}</div> */}
                                                            <div className="text-right"> </div>
                                                        </td>
                                                    )}

                                                    {columnVisibility?.review && (
                                                        <td className="px-2 py-1 text-[#464255]">
                                                            <div>{item?.review_code ? item?.review_code : null}</div>
                                                        </td>
                                                    )}

                                                    {columnVisibility?.comment && (
                                                        <td className="px-2 py-1 text-[#464255] text-center">
                                                            <div className="inline-flex items-center justify-center relative">
                                                                {/* <button
                                                                    type="button"
                                                                    className="flex items-center justify-center px-[2px] py-[2px] bg-white rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative"
                                                                    // onClick={() => openReasonModal()}
                                                                    onClick={() => openReasonModal(item?.id, item?.allocation_management_comment, item)}
                                                                >
                                                                    <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
                                                                </button> */}

                                                                <button
                                                                    type="button"
                                                                    className={iconButtonClass}
                                                                    onClick={() => openReasonModal(item?.id, item?.allocation_management_comment, item)}
                                                                >
                                                                    <ChatBubbleOutlineOutlinedIcon
                                                                        fontSize="inherit"
                                                                        className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                                                                        sx={{ color: 'currentColor', fontSize: 18 }}
                                                                    />
                                                                </button>

                                                                <span className="px-2 text-[#464255]">
                                                                    {item?.allocation_management_comment ? item?.allocation_management_comment?.length : null}
                                                                </span>
                                                            </div>
                                                            {/* <div>{item?.comment ? item?.comment?.length : null}</div> */}
                                                        </td>
                                                    )}

                                                    {columnVisibility?.action && (
                                                        <td className="px-2 py-1">
                                                            {/* <div className="relative inline-block text-left "> */}
                                                            <div className="relative inline-flex justify-center items-center w-full">
                                                                <BtnActionTable togglePopover={togglePopover} row_id={item?.id} />
                                                                {openPopoverId === item?.id && (
                                                                    <div ref={popoverRef}
                                                                        className="absolute left-[-9rem] top-[-10px] mt-2 w-36 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                                                                        <ul className="py-2">
                                                                            {
                                                                                <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("history", item?.id) }}><RestoreOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`History`}</li>
                                                                            }
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            )
                                        }) : null}
                                    </>
                                )
                            })}
                        </tbody>
                    </table>
                    :
                    <TableSkeleton />
            }
        </div>
    )
}

export default TableAlloManage;