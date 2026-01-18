import { useEffect } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
import { calculateMonthDifference, filterStartEndDate, formatDateNoTime } from "@/utils/generalFormatter";
import { getService } from "@/utils/postService";
import getUserValue from "@/utils/getuserValue";

const TableChart: React.FC<any> = ({ srchStartDateTable, srchEndDateTable, srchShipperTable, isClickSearch }) => {
    const userDT: any = getUserValue();

    // ############### FETCH ###############
    const [dataMain, setDataMain] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [sortedData, setSortedData] = useState([]);
    const [sortState, setSortState] = useState({ column: null, direction: null });

    const fetchData = async () => {
        try {
            const response: any = await getService(`/master/capacity/capacity-request-management`);
            const updatedSortedData = response.map((row: any) => ({
                ...row, // Spread existing row data
                num_of_months: calculateMonthDifference(row?.contract_start_date, row?.contract_end_date)
            }));

            let filter_contract_only_shipper: any = []
            if (userDT?.account_manage?.[0]?.user_type_id == 3) {
                filter_contract_only_shipper = updatedSortedData?.filter((item: any) => {
                    return item?.group_id === userDT?.account_manage?.[0]?.group_id
                })

                setDataMain(filter_contract_only_shipper);
                setSortedData(filter_contract_only_shipper);
            } else {
                //https://app.clickup.com/t/86euzxxt5 เอาสถานะ reject ออก
                const filterReject: any = updatedSortedData?.filter((item: any) => item?.status_capacity_request_management?.id !== 3)
                setDataMain(filterReject);
                setSortedData(filterReject);
            }

            setIsLoading(true);
        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    };

    // FILTER ใช้อันเดียวกับ donut chart
    useEffect(() => {

        if (isClickSearch) {
            // const res_filtered_date: any = filterStartEndDateBooking(dataMain, srchStartDateTable, srchEndDateTable);
            const res_filtered_date: any = filterStartEndDate(dataMain, srchStartDateTable, srchEndDateTable);
            const result_2 = res_filtered_date?.filter((item: any) => {
                return (
                    (srchShipperTable ? item?.group_id == srchShipperTable : true)
                );
            });
            setSortedData(result_2);
        } else {
            setSortedData(dataMain);
        }
    }, [srchStartDateTable, srchEndDateTable, srchShipperTable, isClickSearch])

    useEffect(() => {
        // getPermission();
        fetchData();
        // setUserData(userDT?.account_manage?.[0]);
    }, []);

    useEffect(() => {
        if (dataMain && dataMain.length > 0) {
            setSortedData(dataMain);
        } else {
            setSortedData([]);
        }
    }, [dataMain]);

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    return (
        // <div className={`h-[calc(100vh-480px)] overflow-y-auto block rounded-t-md relative z-1`}>
        <div className={`h-auto min-h-[300px] overflow-y-auto block rounded-t-md relative z-1`}>
            {
                isLoading ?
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-1">
                            <tr className="h-9">
                                <th
                                    rowSpan={2}
                                    scope="col"
                                    className={`${table_sort_header_style}`}
                                    onClick={() => handleSort("group.name", sortState, setSortState, setSortedData, dataMain)}
                                >
                                    {`Shipper Name`}
                                    {getArrowIcon("group.name")}
                                </th>
                                <th
                                    rowSpan={2}
                                    scope="col"
                                    className={`${table_sort_header_style}`}
                                    onClick={() => handleSort("contract_code", sortState, setSortState, setSortedData, dataMain)}
                                >
                                    {`Contract Code`}
                                    {getArrowIcon("contract_code")}
                                </th>
                                <th
                                    rowSpan={2}
                                    scope="col"
                                    className={`${table_sort_header_style}`}
                                    onClick={() => handleSort("num_of_months", sortState, setSortState, setSortedData, dataMain)}
                                >
                                    {`No. of months Capacity Right`}
                                    {getArrowIcon("num_of_months")}
                                </th>
                                <th
                                    rowSpan={2}
                                    scope="col"
                                    className={`${table_sort_header_style}`}
                                    onClick={() => handleSort("contract_start_date", sortState, setSortState, setSortedData, dataMain)}
                                >
                                    {`Start Date`}
                                    {getArrowIcon("contract_start_date")}
                                </th>
                                <th
                                    rowSpan={2}
                                    scope="col"
                                    className={`${table_sort_header_style}`}
                                    onClick={() => handleSort("contract_end_date", sortState, setSortState, setSortedData, dataMain)}
                                >
                                    {`End Date`}
                                    {getArrowIcon("contract_end_date")}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedData?.length > 0 && sortedData.map((row: any, index: any) => {
                                return (<>
                                    <tr
                                        key={row?.id}
                                        className={`border-b bg-white  h-12`}
                                    >
                                        <td className="px-2 py-1 text-[#464255] text-left">{row?.group ? row?.group?.name : ''}</td>
                                        <td className="px-2 py-1 text-[#464255] text-left">{row?.contract_code ? row?.contract_code : ''}</td>
                                        <td className="px-2 py-1 text-[#464255] text-right">
                                            {/* {
                                                row?.contract_start_date && row?.contract_end_date ? calculateMonthDifference(row?.contract_start_date, row?.contract_end_date) : '0'
                                            } */}
                                            {
                                                row?.num_of_months
                                            }
                                        </td>
                                        <td className="px-2 py-1 text-[#464255] text-center">{row?.contract_start_date ? formatDateNoTime(row?.contract_start_date) : ''}</td>
                                        <td className="px-2 py-1 text-[#0DA2A2] text-center">{row?.contract_end_date ? formatDateNoTime(row?.contract_end_date) : ''}</td>
                                    </tr>
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

export default TableChart;