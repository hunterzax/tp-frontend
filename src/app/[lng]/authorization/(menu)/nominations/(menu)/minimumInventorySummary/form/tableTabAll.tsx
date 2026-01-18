import { useEffect } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import { formatNumberThreeDecimal } from '@/utils/generalFormatter';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
import NodataTable from "@/components/other/nodataTable";

interface TableProps {
  tableData?: any;
  isLoading: any;
  columnVisibility: any;
  userPermission?: any;
}

const TableAll: React.FC<TableProps> = ({ tableData, isLoading, columnVisibility, userPermission }) => {
  const [sortState, setSortState] = useState({ column: null, direction: null });
  const [sortedData, setSortedData] = useState(tableData);
  const [dataMain, setDataMain] = useState<any>([]);
  // const [closestTimeGroup, setClosestTimeGroup] = useState(tableData);
  // const [headerMap, setHeaderMap] = useState<Record<string, Set<string>>>({});
  // const [isNodata, setIsNodata] = useState<boolean>(true);

  useEffect(() => {

    // เอาออกมาข้างนอก
    const flattened = tableData.map((item: any) => ({
      ...item,
      min_inventory_change_value: item?.minInven ?? item?.data?.find((d: any) => d.type === "Min_Inventory_Change")?.value ?? null,
      exchange_min_inventory: item?.exchangeMinInven ?? item?.data?.find((d: any) => d.type === "Exchange_Mininventory")?.value ?? null
    }));

    const updated_total_rows = flattened?.map((obj: any) => ({
      ...obj,
      total_row: (obj.min_inventory_change_value || 0) + (obj.exchange_min_inventory || 0),
    }));

    // setDataMain(flattened)
    // setSortedData(flattened)
    setDataMain(updated_total_rows)
    setSortedData(updated_total_rows)

    const totalChangeMin = tableData.reduce((sum: any, row: any) => sum + (row?.minInven ?? (row?.data?.find((d: any) => d.type === "Min_Inventory_Change")?.value || 0)), 0);
    const totalExchangeMin = tableData.reduce((sum: any, row: any) => sum + (row?.exchangeMinInven ?? (row?.data?.find((d: any) => d.type === "Exchange_Mininventory")?.value || 0)), 0);

    setTotals({
      totalChangeMin,
      totalExchangeMin,
    });

  }, [tableData]);

  const getArrowIcon = (column: string) => {
    return <div className={`${table_col_arrow_sort_style}`}>
      <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
      <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
    </div>
  };

  const [totals, setTotals] = useState({
    totalChangeMin: 0,
    totalExchangeMin: 0,
  });

  return (
    <div className={`relative h-[calc(100vh-380px)] overflow-y-auto block  rounded-t-md z-1`}>
      {
        isLoading ?
          <table className="w-full text-sm text-left rtl:text-right text-gray-500">

            {/* #################################### TABLE CURRENT #################################### */}
            <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
              <tr className="h-9">
                {columnVisibility.gas_day && (
                  <th
                    className={`${table_sort_header_style} `}
                    onClick={() => handleSort("gas_day", sortState, setSortState, setSortedData, dataMain)}
                  >
                    {`Gas Day`}
                    {getArrowIcon("gas_day")}
                  </th>
                )}

                {columnVisibility.shipper_name && (
                  <th
                    className={`${table_sort_header_style} !w-[150px] !max-w-[250px]`}
                    onClick={() => handleSort("group", sortState, setSortState, setSortedData, dataMain)}
                  >
                    {`Shipper Name`}
                    {getArrowIcon("group")}
                  </th>
                )}

                {columnVisibility.contract_code && (
                  <th
                    className={`${table_sort_header_style} `}
                    onClick={() => handleSort("contract_code", sortState, setSortState, setSortedData, dataMain)}
                  >
                    {`Contract Code`}
                    {getArrowIcon("contract_code")}
                  </th>
                )}

                {columnVisibility.zone && (
                  <th
                    className={`${table_sort_header_style} text-center`}
                    onClick={() => handleSort("zoneObj.name", sortState, setSortState, setSortedData, dataMain)}
                  >
                    {`Zone`}
                    {getArrowIcon("zoneObj.name")}
                  </th>
                )}

                {columnVisibility.change_min_inventory && (
                  <th
                    className={`${table_sort_header_style} `}
                    onClick={() => handleSort("min_inventory_change_value", sortState, setSortState, setSortedData, dataMain)}
                  >
                    {`Change Min Inventory (MMBTU)`}
                    {getArrowIcon("min_inventory_change_value")}
                  </th>
                )}

                {columnVisibility.exchange_min_invent && (
                  <th
                    className={`${table_sort_header_style} `}
                    onClick={() => handleSort("exchange_min_inventory", sortState, setSortState, setSortedData, dataMain)}
                  >
                    {/* {`Exchange Min Invent (MMBTU/D)`} */}
                    {/* https://app.clickup.com/t/86etzcgtg Tab All > Column Exchange Min Invent (MMBTU) ปรับเป็น Exchange Min Inventory (MMBTU) */}
                    {`Exchange Min Inventory (MMBTU)`}
                    {getArrowIcon("exchange_min_inventory")}
                  </th>
                )}

                {columnVisibility.total && (
                  <th
                    className={`${table_sort_header_style} text-center`}
                    onClick={() => handleSort("total_row", sortState, setSortState, setSortedData, dataMain)}
                  >
                    {`Total`}
                    {getArrowIcon("total_row")}
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {sortedData && sortedData?.map((row: any, index: any) => {

                let min = row?.minInven ?? (row?.data?.find((d: any) => d.type === "Min_Inventory_Change")?.value || 0)
                let exchange = row?.exchangeMinInven ?? (row?.data?.find((d: any) => d.type === "Exchange_Mininventory")?.value || 0)
                let total = min + exchange

                return (
                  <tr
                    key={row?.id}
                    className={`${table_row_style}`}
                  >

                    {columnVisibility.gas_day && (
                      <td className="px-2 py-1 text-[#464255]">{row?.gas_day ? row?.gas_day : ''}</td>
                    )}

                    {columnVisibility?.shipper_name && (
                      <td className="px-2 py-1 text-[#464255] !w-[150px] !max-w-[250px]">
                        <div>{row?.group ? row?.group : null}</div>
                      </td>
                    )}

                    {columnVisibility?.contract_code && (
                      <td className="px-2 py-1 text-[#464255]">
                        <div>{row?.contract_code ? row?.contract_code : null}</div>
                      </td>
                    )}

                    {columnVisibility?.zone && (
                      <td className={`px-2 py-1`}>
                        <div className="w-full flex justify-center items-center px-[20px]">
                          <div className="flex w-[120px] justify-center rounded-full px-1 py-2 text-[#464255]" style={{ backgroundColor: row?.zoneObj?.color }}>{`${row?.zoneObj?.name ? row?.zoneObj?.name : ''}`}</div>
                        </div>
                      </td>
                    )}

                    {/* {columnVisibility?.change_min_inventory && (
                      <td className="px-2 py-1 text-[#464255]">
                        <div>{row?.data[0]?.type == "Min_Inventory_Change" ? row?.data[0]?.value : row?.data[0]?.type == "Exchange_Mininventory" && '0.000'}</div>
                      </td>
                    )}

                    {columnVisibility?.exchange_min_invent && (
                      <td className="px-2 py-1 text-[#464255]">
                        <div>{row?.data[0]?.type == "Exchange_Mininventory" ? row?.data[0]?.value : row?.data[1]?.type == "Exchange_Mininventory" ? row?.data[0]?.value : '0.000'}</div>
                      </td>
                    )} */}

                    {columnVisibility?.change_min_inventory && (
                      <td className="px-2 py-1 text-[#464255] text-right">
                        <div>
                          {/* {
                            row?.data?.find((d: any) => d.type === "Min_Inventory_Change")?.value ? formatNumberThreeDecimal(row?.data?.find((d: any) => d.type === "Min_Inventory_Change")?.value) : ""
                          } */}
                          {row?.min_inventory_change_value ? formatNumberThreeDecimal(row?.min_inventory_change_value) : ""}
                        </div>
                      </td>
                    )}

                    {columnVisibility?.exchange_min_invent && (
                      <td className="px-2 py-1 text-[#464255] text-right">
                        <div>
                          {/* {
                            row?.data?.find((d: any) => d.type === "Exchange_Mininventory")?.value ? formatNumberThreeDecimal(row?.data?.find((d: any) => d.type === "Exchange_Mininventory")?.value) : ""
                          } */}
                          {row?.exchangeMinInven ? formatNumberThreeDecimal(row?.exchangeMinInven) : ""}

                        </div>
                      </td>
                    )}

                    {columnVisibility?.total && (
                      <td className="px-2 py-1 text-[#464255] text-right font-semibold">
                        {/* <div>{total ? formatNumberThreeDecimal(total) : null}</div> */}

                        {/* <div>{(total || total === 0) ? formatNumberThreeDecimal(total) : ''}</div> */}
                        <div>{(row?.total_row || row?.total_row === 0) ? formatNumberThreeDecimal(row?.total_row) : ''}</div>
                      </td>
                    )}

                  </tr>
                )
              })}


              {/* Sum row */}
              {columnVisibility?.total && (
                sortedData?.length > 0 && <tr className={`${table_row_style} text-[15px] font-semibold !bg-[#D1F2FF]`}>

                  {columnVisibility.gas_day && (
                    <td className="px-2 py-1 text-[#464255] text-left" >{`Total`}</td>
                  )}

                  {columnVisibility?.shipper_name && (
                    <td className="px-2 py-1 text-[#464255] text-left" ></td>
                  )}

                  {columnVisibility?.contract_code && (
                    <td className="px-2 py-1 text-[#464255] text-left" ></td>
                  )}

                  {columnVisibility?.zone && (
                    <td className="px-2 py-1 text-[#464255] text-left" ></td>
                  )}

                  {columnVisibility?.change_min_inventory && (
                    <td className="px-2 py-1 text-[#464255] text-right">
                      {formatNumberThreeDecimal(totals.totalChangeMin)}
                    </td>
                  )}

                  {columnVisibility?.exchange_min_invent && (
                    <td className="px-2 py-1 text-[#464255] text-right">
                      {formatNumberThreeDecimal(totals.totalExchangeMin)}
                    </td>
                  )}

                  {columnVisibility?.total && (
                    <td className="px-2 py-1 text-[#464255] text-right" >{formatNumberThreeDecimal(totals.totalChangeMin + totals.totalExchangeMin)}</td>
                  )}

                </tr>
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

export default TableAll;