import { useEffect } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import { formatNumberFourDecimal } from '@/utils/generalFormatter';
import { table_col_arrow_sort_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { handleSortBalMonthlyReport } from "@/utils/sortTable";
import NodataTable from "@/components/other/nodataTable";

interface TableProps {
    openViewForm?: (id: any) => void;
    tableData: any;
    allData: any;
    currentPage: any;
    itemsPerPage: any;
    dataSummary: any;
    isLoading: any;
    columnVisibility: any;
    userPermission?: any;
    areaMaster?: any;
}

const TableReport: React.FC<TableProps> = ({ openViewForm, tableData, allData, currentPage, itemsPerPage, dataSummary, isLoading, columnVisibility, userPermission, areaMaster }) => {
    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(tableData);

    useEffect(() => {
        if (tableData && tableData.length > 0) {
            setSortedData(tableData);
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

    return (<>
        <div className="h-[calc(100vh-380px)] overflow-y-auto overflow-x-auto rounded-t-md">
            {/* <table className="min-w-full text-sm text-left rtl:text-right text-gray-500 whitespace-nowrap"> */}
            {
                isLoading ?
                    <table className="table-auto min-w-full text-sm rtl:text-right text-gray-500 whitespace-nowrap">
                        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                            <tr className="h-9">

                                {columnVisibility.date && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} min-w-[120px] max-w-[200px] text-center`}
                                        onClick={() => handleSortBalMonthlyReport("gas_day", sortState, setSortState, setSortedData, allData, currentPage, itemsPerPage)}
                                    >
                                        {`Date`}
                                        {getArrowIcon("gas_day")}
                                    </th>
                                )}

                                {columnVisibility.entry_point && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} min-w-[120px] max-w-[200px] text-center`}
                                        onClick={() => handleSortBalMonthlyReport("Entry Point", sortState, setSortState, setSortedData, allData, currentPage, itemsPerPage)}
                                    >
                                        {`Entry Point`}
                                        {getArrowIcon("Entry Point")}
                                    </th>
                                )}

                                {columnVisibility.exit_point && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} min-w-[120px] max-w-[200px] text-center`}
                                        onClick={() => handleSortBalMonthlyReport("Exit", sortState, setSortState, setSortedData, allData, currentPage, itemsPerPage)}
                                    >
                                        {`Exit Point`}
                                        {getArrowIcon("Exit")}
                                    </th>
                                )}

                                {columnVisibility.entry_exit && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} min-w-[120px] max-w-[200px] text-center`}
                                        onClick={() => handleSortBalMonthlyReport("Entry - Exit", sortState, setSortState, setSortedData, allData, currentPage, itemsPerPage)}
                                    >
                                        {`Entry - Exit`}
                                        {getArrowIcon("Entry - Exit")}
                                    </th>
                                )}

                                {columnVisibility.fuel_gas && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} min-w-[120px] max-w-[200px] text-center`}
                                        onClick={() => handleSortBalMonthlyReport("Fuel Gas", sortState, setSortState, setSortedData, allData, currentPage, itemsPerPage)}
                                    >
                                        {`Fuel Gas`}
                                        {getArrowIcon("Fuel Gas")}
                                    </th>
                                )}

                                {columnVisibility.balancing_gas && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} min-w-[120px] max-w-[200px] text-center`}
                                        onClick={() => handleSortBalMonthlyReport("Balancing Gas", sortState, setSortState, setSortedData, allData, currentPage, itemsPerPage)}
                                    >
                                        {`Balancing Gas`}
                                        {getArrowIcon("Balancing Gas")}
                                    </th>
                                )}

                                {columnVisibility.change_min_inventory && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} min-w-[120px] max-w-[270px] text-center`}
                                        onClick={() => handleSortBalMonthlyReport("Change Min Inventory", sortState, setSortState, setSortedData, allData, currentPage, itemsPerPage)}
                                    >
                                        {`Change Min Inventory`}
                                        {getArrowIcon("Change Min Inventory")}
                                    </th>
                                )}

                                {columnVisibility.shrinkagate && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} min-w-[120px] max-w-[200px] text-center`}
                                        onClick={() => handleSortBalMonthlyReport("Shrinkagate", sortState, setSortState, setSortedData, allData, currentPage, itemsPerPage)}
                                    >
                                        {`Shrinkage`}
                                        {getArrowIcon("Shrinkagate")}
                                    </th>
                                )}

                                {columnVisibility.commissioning && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} min-w-[120px] max-w-[200px] text-center`}
                                        onClick={() => handleSortBalMonthlyReport("Commissioning", sortState, setSortState, setSortedData, allData, currentPage, itemsPerPage)}
                                    >
                                        {`Commissioning`}
                                        {getArrowIcon("Commissioning")}
                                    </th>
                                )}

                                {columnVisibility.gas_vent && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} min-w-[120px] max-w-[200px] text-center`}
                                        onClick={() => handleSortBalMonthlyReport("Gas Vent", sortState, setSortState, setSortedData, allData, currentPage, itemsPerPage)}
                                    >
                                        {`Gas Vent`}
                                        {getArrowIcon("Gas Vent")}
                                    </th>
                                )}

                                {columnVisibility.other_gas && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} min-w-[120px] max-w-[200px] text-center`}
                                        onClick={() => handleSortBalMonthlyReport("Other Gas", sortState, setSortState, setSortedData, allData, currentPage, itemsPerPage)}
                                    >
                                        {`Other Gas`}
                                        {getArrowIcon("Other Gas")}
                                    </th>
                                )}

                                {columnVisibility.imbalance && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} min-w-[120px] max-w-[200px] text-center`}
                                        onClick={() => handleSortBalMonthlyReport("Imbalance", sortState, setSortState, setSortedData, allData, currentPage, itemsPerPage)}
                                    >
                                        {`Imbalance`}
                                        {getArrowIcon("Imbalance")}
                                    </th>
                                )}

                                {columnVisibility.acc_imbalance && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} min-w-[120px] max-w-[200px] text-center`}
                                        onClick={() => handleSortBalMonthlyReport("Acc. Imbqalance", sortState, setSortState, setSortedData, allData, currentPage, itemsPerPage)}
                                    >
                                        {`Acc. Imbalance`}
                                        {getArrowIcon("Acc. Imbqalance")}
                                    </th>
                                )}

                                {columnVisibility.min_inventory && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} min-w-[120px] max-w-[200px] text-center`}
                                        onClick={() => handleSortBalMonthlyReport("Min Inventory", sortState, setSortState, setSortedData, allData, currentPage, itemsPerPage)}
                                    >
                                        {`Min Inventory`}
                                        {getArrowIcon("Min Inventory")}
                                    </th>
                                )}

                            </tr>
                        </thead>

                        <tbody>
                            {sortedData && sortedData?.map((row: any, index: any) => {
                                return (
                                    <tr
                                        key={row?.id}
                                        className={`${table_row_style}`}
                                    >
                                        {columnVisibility.date && (
                                            <td className="px-2 py-1 text-[#464255] text-right">{row?.gas_day ? row?.gas_day : ''}</td>
                                        )}

                                        {columnVisibility.entry_point && (
                                            <td className="px-2 py-1 text-[#464255] text-right">{row["Entry Point"] !== null && row["Entry Point"] !== undefined ? formatNumberFourDecimal(row["Entry Point"]) : ''}</td>
                                        )}

                                        {columnVisibility.exit_point && (
                                            <td className="px-2 py-1 text-[#464255] text-right">{row["Exit"] !== null && row["Exit"] !== undefined ? formatNumberFourDecimal(row["Exit"]) : ''}</td>
                                        )}

                                        {columnVisibility.entry_exit && (
                                            <td className="px-2 py-1 text-[#464255] text-right">{row["Entry - Exit"] !== null && row["Entry - Exit"] !== undefined ? formatNumberFourDecimal(row["Entry - Exit"]) : ''}</td>
                                        )}

                                        {columnVisibility.fuel_gas && (
                                            <td className="px-2 py-1 text-[#464255] text-right">{row["Fuel Gas"] !== null && row["Fuel Gas"] !== undefined ? formatNumberFourDecimal(row["Fuel Gas"]) : ''}</td>
                                        )}

                                        {columnVisibility.balancing_gas && (
                                            <td className="px-2 py-1 text-[#464255] text-right">{row["Balancing Gas"] !== null && row["Balancing Gas"] !== undefined ? formatNumberFourDecimal(row["Balancing Gas"]) : ''}</td>
                                        )}

                                        {columnVisibility.change_min_inventory && (
                                            <td className="px-2 py-1 text-[#464255] text-right">{row["Change Min Inventory"] !== null && row["Change Min Inventory"] !== undefined ? formatNumberFourDecimal(row["Change Min Inventory"]) : ''}</td>
                                        )}

                                        {columnVisibility.shrinkagate && (
                                            <td className="px-2 py-1 text-[#464255] text-right">{row["Shrinkagate"] !== null && row["Shrinkagate"] !== undefined ? formatNumberFourDecimal(row["Shrinkagate"]) : ''}</td>
                                        )}

                                        {columnVisibility.commissioning && (
                                            <td className="px-2 py-1 text-[#464255] text-right">{row["Commissioning"] !== null && row["Commissioning"] !== undefined ? formatNumberFourDecimal(row["Commissioning"]) : ''}</td>
                                        )}

                                        {columnVisibility.gas_vent && (
                                            <td className="px-2 py-1 text-[#464255] text-right">{row["Gas Vent"] !== null && row["Gas Vent"] !== undefined ? formatNumberFourDecimal(row["Gas Vent"]) : ''}</td>
                                        )}

                                        {columnVisibility.other_gas && (
                                            <td className="px-2 py-1 text-[#464255] text-right">{row["Other Gas"] !== null && row["Other Gas"] !== undefined ? formatNumberFourDecimal(row["Other Gas"]) : ''}</td>
                                        )}

                                        {columnVisibility.imbalance && (
                                            <td className="px-2 py-1 text-[#464255] text-right">{row["Imbalance"] !== null && row["Imbalance"] !== undefined ? formatNumberFourDecimal(row["Imbalance"]) : ''}</td>
                                        )}

                                        {columnVisibility.acc_imbalance && (
                                            <td className="px-2 py-1 text-[#464255] text-right">{row["Acc. Imbqalance"] !== null && row["Acc. Imbqalance"] !== undefined ? formatNumberFourDecimal(row["Acc. Imbqalance"]) : ''}</td>
                                        )}

                                        {columnVisibility.min_inventory && (
                                            <td className="px-2 py-1 text-[#464255] text-right">{row["Min Inventory"] !== null && row["Min Inventory"] ? formatNumberFourDecimal(row["Min Inventory"]) : ''}</td>
                                        )}

                                    </tr>
                                )

                            })}

                            {dataSummary && typeof dataSummary === 'object' && Object.keys(dataSummary).length > 0 &&
                                <tr
                                    key={'summary'}
                                    className={`border-b h-12 bg-[#E8FFEE]`}
                                >
                                    {columnVisibility.date && (
                                        <td className="px-2 py-1 text-[#06522E] font-semibold text-right">{`SUM`}</td>
                                    )}

                                    {columnVisibility.entry_point && (
                                        <td className="px-2 py-1 text-[#06522E] font-semibold text-right">{dataSummary?.value["Entry Point"] !== null && dataSummary?.value["Entry Point"] !== undefined ? formatNumberFourDecimal(dataSummary?.value["Entry Point"]) : ''}</td>
                                    )}

                                    {columnVisibility.exit_point && (
                                        <td className="px-2 py-1 text-[#06522E] font-semibold text-right">{dataSummary?.value["Exit"] !== null && dataSummary?.value["Exit"] !== undefined ? formatNumberFourDecimal(dataSummary?.value["Exit"]) : ''}</td>
                                    )}

                                    {columnVisibility.entry_exit && (
                                        <td className="px-2 py-1 text-[#06522E] font-semibold text-right">{dataSummary?.value["Entry - Exit"] !== null && dataSummary?.value["Entry - Exit"] !== undefined ? formatNumberFourDecimal(dataSummary?.value["Entry - Exit"]) : ''}</td>
                                    )}

                                    {columnVisibility.fuel_gas && (
                                        <td className="px-2 py-1 text-[#06522E] font-semibold text-right">{dataSummary?.value["Fuel Gas"] !== null && dataSummary?.value["Fuel Gas"] !== undefined ? formatNumberFourDecimal(dataSummary?.value["Fuel Gas"]) : ''}</td>
                                    )}

                                    {columnVisibility.balancing_gas && (
                                        <td className="px-2 py-1 text-[#06522E] font-semibold text-right">{dataSummary?.value["Balancing Gas"] !== null && dataSummary?.value["Balancing Gas"] !== undefined ? formatNumberFourDecimal(dataSummary?.value["Balancing Gas"]) : ''}</td>
                                    )}

                                    {columnVisibility.change_min_inventory && (
                                        <td className="px-2 py-1 text-[#06522E] font-semibold text-right">{dataSummary?.value["Change Min Inventory"] !== null && dataSummary?.value["Change Min Inventory"] !== undefined ? formatNumberFourDecimal(dataSummary?.value["Change Min Inventory"]) : ''}</td>
                                    )}

                                    {columnVisibility.shrinkagate && (
                                        <td className="px-2 py-1 text-[#06522E] font-semibold text-right">{dataSummary?.value["Shrinkagate"] !== null && dataSummary?.value["Shrinkagate"] !== undefined ? formatNumberFourDecimal(dataSummary?.value["Shrinkagate"]) : ''}</td>
                                    )}

                                    {columnVisibility.commissioning && (
                                        <td className="px-2 py-1 text-[#06522E] font-semibold text-right">{dataSummary?.value["Commissioning"] !== null && dataSummary?.value["Commissioning"] !== undefined ? formatNumberFourDecimal(dataSummary?.value["Commissioning"]) : ''}</td>
                                    )}

                                    {columnVisibility.gas_vent && (
                                        <td className="px-2 py-1 text-[#06522E] font-semibold text-right">{dataSummary?.value["Gas Vent"] !== null && dataSummary?.value["Gas Vent"] !== undefined ? formatNumberFourDecimal(dataSummary?.value["Gas Vent"]) : ''}</td>
                                    )}

                                    {columnVisibility.other_gas && (
                                        <td className="px-2 py-1 text-[#06522E] font-semibold text-right">{dataSummary?.value["Other Gas"] !== null && dataSummary?.value["Other Gas"] !== undefined ? formatNumberFourDecimal(dataSummary?.value["Other Gas"]) : ''}</td>
                                    )}

                                    {columnVisibility.imbalance && (
                                        <td className="px-2 py-1 text-[#06522E] font-semibold text-right">{dataSummary?.value["Imbalance"] !== null && dataSummary?.value["Imbalance"] !== undefined ? formatNumberFourDecimal(dataSummary?.value["Imbalance"]) : ''}</td>
                                    )}

                                    {columnVisibility.acc_imbalance && (
                                        <td className="px-2 py-1 text-[#06522E] font-semibold text-right">{dataSummary?.value["Acc. Imbqalance"] !== null && dataSummary?.value["Acc. Imbqalance"] !== undefined ? formatNumberFourDecimal(dataSummary?.value["Acc. Imbqalance"]) : ''}</td>
                                    )}

                                    {columnVisibility.min_inventory && (
                                        <td className="px-2 py-1 text-[#06522E] font-semibold text-right">{dataSummary?.value["Min Inventory"] !== null && dataSummary?.value["Min Inventory"] !== undefined ? formatNumberFourDecimal(dataSummary?.value["Min Inventory"]) : ''}</td>
                                    )}
                                </tr>
                            }
                        </tbody>

                    </table>
                    :
                    <TableSkeleton />
            }

            {
                isLoading && sortedData?.length <= 0 && <NodataTable />
            }
        </div>
    </>
    )
}

export default TableReport;