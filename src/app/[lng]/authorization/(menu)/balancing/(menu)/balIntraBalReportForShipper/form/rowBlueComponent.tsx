import { formatNumberFourDecimal, formatNumberFourDecimalNom, getValidationColorClass, sumDetail } from "@/utils/generalFormatter";
import getUserValue from "@/utils/getuserValue";
import React from "react";

interface ContractRowProps {
    row: any;
    shipperItem: any;
    contract?: any;
    type?: any;
    shipperGroupData?: any;
    columnVisibility?: any;
    cIdx: number;
    index: number;
    table_row_style?: string;
}

const ContractRowBlueBase = ({
    row,
    shipperItem,
    contract,
    type,
    shipperGroupData,
    columnVisibility,
    cIdx,
    index,
    table_row_style = "",
}: ContractRowProps) => {
    const userDT: any = getUserValue();

    // let find_shipper_name = shipperGroupData?.find((item: any) => {
    //     let filtered = item?.id_name == shipperItem?.shipper
    //     return filtered
    // })

    return (
        <tr
            key={`contract-${row?.request_number}-${cIdx}-${index}`}
            className={table_row_style}
        >

            {/* {
                userDT?.account_manage?.[0]?.user_type_id !== 3 && <td className={` font-semibold  text-left text-[#004762] bg-[#83DDFF33]`} colSpan={1} scope="col"></td>
            } */}

            {columnVisibility.publicate && userDT?.account_manage?.[0]?.user_type_id !== 3 && (
                <td className={` font-semibold  text-left text-[#004762] bg-[#83DDFF33]`} colSpan={1} scope="col"></td>
            )}

            <td
                className={` py-1 pl-6 font-semibold  text-left text-[#004762] bg-[#83DDFF33]`}
                // colSpan={5}
                colSpan={4}
                scope="col"
            >
                {/* {`TOTAL : `}{find_shipper_name ? find_shipper_name?.name : shipperItem?.shipper} {`(`} {row?.gas_day ? dayjs(row?.gas_day).format("DD/MM/YYYY") : ''} {`)`} */}
                {/* {`TOTAL : `}{shipperItem?.contractData ? shipperItem?.contractData?.[0]?.shipper : ''} {`(`} {row?.gas_day ? dayjs(row?.gas_day).format("DD/MM/YYYY") : ''} {`)`} */}
                {/* {shipperItem?.totalShipper ? shipperItem?.totalShipper?.gas_day : ''} */}
                {shipperItem ? shipperItem?.gas_day : ''}
            </td>

            {columnVisibility.plan_actual && (
                <td className={` py-1 pl-1 font-semibold  text-left text-[#004762] bg-[#83DDFF33]`} colSpan={2} scope="col">
                    {type == 'planning' ? 'TOTAL PLANNING' : 'TOTAL ACTUAL'}
                </td>
            )}


            {/* UNDER Summary Pane */}
            {columnVisibility.summary_pane && (<>

                {/* "total_entry_east" */}
                {columnVisibility.east_total_entry_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper?.total_entry_east) : ''} */}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem?.total_entry_east) : ''} */}
                        {shipperItem?.total_entry_east !== null && shipperItem?.total_entry_east !== undefined ? formatNumberFourDecimalNom(shipperItem?.total_entry_east) : ''}
                    </td>
                )}

                {/* "total_entry_west" */}
                {columnVisibility.west_total_entry_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper?.total_entry_west) : ''} */}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem?.total_entry_west) : ''} */}
                        {shipperItem?.total_entry_west !== null && shipperItem?.total_entry_west !== undefined ? formatNumberFourDecimalNom(shipperItem?.total_entry_west) : ''}
                    </td>
                )}

                {/* "total_entry_east-west" */}
                {columnVisibility.east_west_total_entry_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["total_entry_east-west"]) : ''} */}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem["total_entry_east-west"]) : ''} */}
                        {shipperItem["total_entry_east-west"] !== null && shipperItem["total_entry_east-west"] !== undefined ? formatNumberFourDecimalNom(shipperItem["total_entry_east-west"]) : ''}

                    </td>
                )}

                {/* "total_exit_east" */}
                {columnVisibility.east_total_exit_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["total_exit_east"]) : ''} */}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem["total_exit_east"]) : ''} */}
                        {shipperItem["total_exit_east"] !== null && shipperItem["total_exit_east"] !== undefined ? formatNumberFourDecimalNom(shipperItem["total_exit_east"]) : ''}
                    </td>
                )}

                {/* "total_exit_west" */}
                {columnVisibility.west_total_exit_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["total_exit_west"]) : ''} */}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem["total_exit_west"]) : ''} */}
                        {shipperItem["total_exit_west"] !== null && shipperItem["total_exit_west"] !== undefined ? formatNumberFourDecimalNom(shipperItem["total_exit_west"]) : ''}
                    </td>
                )}

                {/* "total_exit_east-west" */}
                {columnVisibility.east_west_total_exit_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["total_exit_east-west"]) : ''} */}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem["total_exit_east-west"]) : ''} */}
                        {shipperItem["total_exit_east-west"] !== null && shipperItem["total_exit_east-west"] !== undefined ? formatNumberFourDecimalNom(shipperItem["total_exit_east-west"]) : ''}
                    </td>
                )}

                {/* "imbZone_east" */}
                {columnVisibility.east_imbalance_zone_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["imbZone_east"]) : ''} */}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem["imbZone_east"]) : ''} */}
                        {shipperItem["imbZone_east"] !== null && shipperItem["imbZone_east"] !== undefined ? formatNumberFourDecimalNom(shipperItem["imbZone_east"]) : ''}
                    </td>
                )}

                {/* "imbZone_west" */}
                {columnVisibility.west_imbalance_zone_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["imbZone_west"]) : ''} */}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem["imbZone_west"]) : ''} */}
                        {shipperItem["imbZone_west"] !== null && shipperItem["imbZone_west"] !== undefined ? formatNumberFourDecimalNom(shipperItem["imbZone_west"]) : ''}
                    </td>
                )}

                {/* "imbZone_total" */}
                {columnVisibility.total_imbalance_zone_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["imbZone_total"]) : ''} */}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem["imbZone_total"]) : ''} */}
                        {shipperItem["imbZone_total"] !== null && shipperItem["imbZone_total"] !== undefined ? formatNumberFourDecimalNom(shipperItem["imbZone_total"]) : ''}
                    </td>
                )}



                {/* "InstructedFlow_east" */}
                {columnVisibility.east_instructed_flow_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["InstructedFlow_east"]) : ''} */}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem["InstructedFlow_east"]) : ''} */}
                        {/* {shipperItem["InstructedFlow_east"] !== null && shipperItem["InstructedFlow_east"] !== undefined ? formatNumberFourDecimalNom(shipperItem["InstructedFlow_east"]) : ''} */}
                        {formatNumberFourDecimalNom(shipperItem["instructedFlow_east"])}
                    </td>
                )}

                {/* "InstructedFlow_west" */}
                {columnVisibility.west_instructed_flow_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["InstructedFlow_west"]) : ''} */}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem["InstructedFlow_west"]) : ''} */}
                        {/* {shipperItem["InstructedFlow_west"] !== null && shipperItem["InstructedFlow_west"] !== undefined ? formatNumberFourDecimalNom(shipperItem["InstructedFlow_west"]) : ''} */}
                        {formatNumberFourDecimalNom(shipperItem["instructedFlow_west"])}
                    </td>
                )}

                {/* ******************** "Instructed Flow EAST-WEST" ******************** */}
                {columnVisibility.east_west_instructed_flow_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["instructedFlow_east-west"])}
                    </td>
                )}

                {/* "shrinkage_east" */}
                {columnVisibility.east_shrinkage_volume_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["shrinkage_east"]) : ''} */}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem["shrinkage_east"]) : ''} */}
                        {shipperItem["shrinkage_east"] !== null && shipperItem["shrinkage_east"] !== undefined ? formatNumberFourDecimalNom(shipperItem["shrinkage_east"]) : ''}

                    </td>
                )}

                {/* "shrinkage_west" */}
                {columnVisibility.west_shrinkage_volume_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["shrinkage_west"]) : ''} */}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem["shrinkage_west"]) : ''} */}
                        {shipperItem["shrinkage_west"] !== null && shipperItem["shrinkage_west"] !== undefined ? formatNumberFourDecimalNom(shipperItem["shrinkage_west"]) : ''}

                    </td>
                )}

                {/* "park_east" */}
                {columnVisibility.east_park_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["park_east"]) : ''} */}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem["park_east"]) : ''} */}
                        {shipperItem["park_east"] !== null && shipperItem["park_east"] !== undefined ? formatNumberFourDecimalNom(shipperItem["park_east"]) : ''}

                    </td>
                )}

                {/* "park_west" */}
                {columnVisibility.west_park_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["park_west"]) : ''} */}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem["park_west"]) : ''} */}
                        {shipperItem["park_west"] !== null && shipperItem["park_west"] !== undefined ? formatNumberFourDecimalNom(shipperItem["park_west"]) : ''}

                    </td>
                )}

                {/* "Unpark_east" */}
                {columnVisibility.east_unpark_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["Unpark_east"]) : ''} */}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem["Unpark_east"]) : ''} */}
                        {shipperItem["Unpark_east"] !== null && shipperItem["Unpark_east"] !== undefined ? formatNumberFourDecimalNom(shipperItem["Unpark_east"]) : ''}

                    </td>
                )}

                {/* "Unpark_west" */}
                {columnVisibility.west_unpark_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["Unpark_west"]) : ''} */}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem["Unpark_west"]) : ''} */}
                        {shipperItem["Unpark_west"] !== null && shipperItem["Unpark_west"] !== undefined ? formatNumberFourDecimalNom(shipperItem["Unpark_west"]) : ''}

                    </td>
                )}

                {/* "SodPark_east" */}
                {columnVisibility.east_sod_park_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["SodPark_east"]) : ''} */}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem["SodPark_east"]) : ''} */}
                        {shipperItem["SodPark_east"] !== null && shipperItem["SodPark_east"] !== undefined ? formatNumberFourDecimalNom(shipperItem["SodPark_east"]) : ''}

                    </td>
                )}

                {/* "SodPark_west" */}
                {columnVisibility.west_sod_park_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["SodPark_west"]) : ''} */}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem["SodPark_west"]) : ''} */}
                        {shipperItem["SodPark_west"] !== null && shipperItem["SodPark_west"] !== undefined ? formatNumberFourDecimalNom(shipperItem["SodPark_west"]) : ''}

                    </td>
                )}

                {/* "EodPark_east" */}
                {columnVisibility.east_eod_park_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["EodPark_east"]) : ''} */}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem["EodPark_east"]) : ''} */}
                        {shipperItem["EodPark_east"] !== null && shipperItem["EodPark_east"] !== undefined ? formatNumberFourDecimalNom(shipperItem["EodPark_east"]) : ''}

                    </td>
                )}

                {/* "EodPark_west" */}
                {columnVisibility.west_eod_park_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["EodPark_west"]) : ''} */}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem["EodPark_west"]) : ''} */}
                        {shipperItem["EodPark_west"] !== null && shipperItem["EodPark_west"] !== undefined ? formatNumberFourDecimalNom(shipperItem["EodPark_west"]) : ''}

                    </td>
                )}

                {/* "minInventoryChange_east" */}
                {columnVisibility.east_min_inventory_change_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["minInventoryChange_east"]) : ''} */}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem["minInventoryChange_east"]) : ''} */}
                        {shipperItem["minInventoryChange_east"] !== null && shipperItem["minInventoryChange_east"] !== undefined ? formatNumberFourDecimalNom(shipperItem["minInventoryChange_east"]) : ''}

                    </td>
                )}

                {/* "minInventoryChange_west" */}
                {columnVisibility.west_min_inventory_change_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["minInventoryChange_west"]) : ''} */}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem["minInventoryChange_west"]) : ''} */}
                        {shipperItem["minInventoryChange_west"] !== null && shipperItem["minInventoryChange_west"] !== undefined ? formatNumberFourDecimalNom(shipperItem["minInventoryChange_west"]) : ''}

                    </td>
                )}

                {/* "reserveBal_east" */}
                {columnVisibility.east_reserve_bal_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["reserveBal_east"]) : ''} */}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem["reserveBal_east"]) : ''} */}
                        {shipperItem["reserveBal_east"] !== null && shipperItem["reserveBal_east"] !== undefined ? formatNumberFourDecimalNom(shipperItem["reserveBal_east"]) : ''}

                    </td>
                )}

                {/* "reserveBal_west" */}
                {columnVisibility.west_reserve_bal_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["reserveBal_west"]) : ''} */}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem["reserveBal_west"]) : ''} */}
                        {shipperItem["reserveBal_west"] !== null && shipperItem["reserveBal_west"] !== undefined ? formatNumberFourDecimalNom(shipperItem["reserveBal_west"]) : ''}

                    </td>
                )}

                {/* "adjustDailyImb_east" */}
                {columnVisibility.east_adjust_imbalance_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["adjustDailyImb_east"]) : ''} */}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem["adjustDailyImb_east"]) : ''} */}
                        {shipperItem["adjustDailyImb_east"] !== null && shipperItem["adjustDailyImb_east"] !== undefined ? formatNumberFourDecimalNom(shipperItem["adjustDailyImb_east"]) : ''}

                    </td>
                )}

                {/* "adjustDailyImb_west" */}
                {columnVisibility.west_adjust_imbalance_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["adjustDailyImb_west"]) : ''} */}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem["adjustDailyImb_west"]) : ''} */}
                        {shipperItem["adjustDailyImb_west"] !== null && shipperItem["adjustDailyImb_west"] !== undefined ? formatNumberFourDecimalNom(shipperItem["adjustDailyImb_west"]) : ''}

                    </td>
                )}

                {/* "ventGas_east" */}
                {columnVisibility.east_vent_gas && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["ventGas_east"]) : ''} */}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem["ventGas_east"]) : ''} */}
                        {shipperItem["ventGas_east"] !== null && shipperItem["ventGas_east"] !== undefined ? formatNumberFourDecimalNom(shipperItem["ventGas_east"]) : ''}

                    </td>
                )}

                {/* "ventGas_west" */}
                {columnVisibility.west_vent_gas && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["ventGas_west"]) : ''} */}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem["ventGas_west"]) : ''} */}
                        {shipperItem["ventGas_west"] !== null && shipperItem["ventGas_west"] !== undefined ? formatNumberFourDecimalNom(shipperItem["ventGas_west"]) : ''}

                    </td>
                )}

                {/* "commissioningGas_east" */}
                {columnVisibility.east_commissioning_gas && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["commissioningGas_east"]) : ''} */}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem["commissioningGas_east"]) : ''} */}
                        {shipperItem["commissioningGas_east"] !== null && shipperItem["commissioningGas_east"] !== undefined ? formatNumberFourDecimalNom(shipperItem["commissioningGas_east"]) : ''}

                    </td>
                )}

                {/* "commissioningGas_west" */}
                {columnVisibility.west_commissioning_gas && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["commissioningGas_west"]) : ''} */}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem["commissioningGas_west"]) : ''} */}
                        {shipperItem["commissioningGas_west"] !== null && shipperItem["commissioningGas_west"] !== undefined ? formatNumberFourDecimalNom(shipperItem["commissioningGas_west"]) : ''}

                    </td>
                )}

                {/* "otherGas_east" */}
                {columnVisibility.east_other_gas && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["otherGas_east"]) : ''} */}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem["otherGas_east"]) : ''} */}
                        {shipperItem["otherGas_east"] !== null && shipperItem["otherGas_east"] !== undefined ? formatNumberFourDecimalNom(shipperItem["otherGas_east"]) : ''}

                    </td>
                )}

                {/* "otherGas_west" */}
                {columnVisibility.west_other_gas && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["otherGas_west"]) : ''} */}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem["otherGas_west"]) : ''} */}
                        {shipperItem["otherGas_west"] !== null && shipperItem["otherGas_west"] !== undefined ? formatNumberFourDecimalNom(shipperItem["otherGas_west"]) : ''}

                    </td>
                )}

                {/* "dailyImb_east" */}
                {columnVisibility.east_daily_imb_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["dailyImb_east"]) : ''} */}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem["dailyImb_east"]) : ''} */}
                        {shipperItem["dailyImb_east"] !== null && shipperItem["dailyImb_east"] !== undefined ? formatNumberFourDecimalNom(shipperItem["dailyImb_east"]) : ''}

                    </td>
                )}

                {/* "dailyImb_west" */}
                {columnVisibility.west_daily_imb_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["dailyImb_west"]) : ''} */}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem["dailyImb_west"]) : ''} */}
                        {shipperItem["dailyImb_west"] !== null && shipperItem["dailyImb_west"] !== undefined ? formatNumberFourDecimalNom(shipperItem["dailyImb_west"]) : ''}

                    </td>
                )}

                {/* "aip" */}
                {columnVisibility.total_aip_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["aip"]) : ''} */}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem["aip"]) : ''} */}
                        {shipperItem["aip"] !== null && shipperItem["aip"] !== undefined ? formatNumberFourDecimalNom(shipperItem["aip"]) : ''}

                    </td>
                )}

                {/* "AIN (MMBTU/D)" */}
                {columnVisibility.total_ain_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["ain"]) : ''} */}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem["ain"]) : ''} */}
                        {shipperItem["ain"] !== null && shipperItem["ain"] !== undefined ? formatNumberFourDecimalNom(shipperItem["ain"]) : ''}

                    </td>
                )}

                {/* "% IMB" */}
                {columnVisibility.total_percentage_imb && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {/* {'no_data'} */}
                        {/* {``} */}
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["ain"]) : ''} */}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem["absimb"]) : ''} */}
                        {shipperItem["absimb"] !== null && shipperItem["absimb"] !== undefined ? formatNumberFourDecimalNom(shipperItem["absimb"]) : ''}
                    </td>
                )}

                {/* "absimb" */}
                {columnVisibility.total_percentage_abslmb && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["absimb"]) : ''} */}
                        {``}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem["absimb"]) : ''} */}
                    </td>
                )}

                {/* "accImbMonth_east" */}
                {columnVisibility.east_acc_imb_month_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["accImbMonth_east"]) : ''} */}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem["accImbMonth_east"]) : ''} */}
                        {shipperItem["accImbMonth_east"] !== null && shipperItem["accImbMonth_east"] !== undefined ? formatNumberFourDecimalNom(shipperItem["accImbMonth_east"]) : ''}
                    </td>
                )}

                {/* "accImbMonth_west" */}
                {columnVisibility.west_acc_imb_month_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["accImbMonth_west"]) : ''} */}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem["accImbMonth_west"]) : ''} */}
                        {shipperItem["accImbMonth_west"] !== null && shipperItem["accImbMonth_west"] !== undefined ? formatNumberFourDecimalNom(shipperItem["accImbMonth_west"]) : ''}
                    </td>
                )}


                {/* 
                    validation_accImb_east
                    validation_accImb_west
                    validation_accImbInv_east
                    validation_accImbInv_west 
                */}

                {/* "accImb_east" */}
                {columnVisibility.east_acc_imb_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right ${getValidationColorClass(row["validation_accImb_east"]?.toLowerCase(), 'bg-[#83DDFF33]')}`} scope="col">
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["accImb_east"]) : ''} */}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem["accImb_east"]) : ''} */}
                        {shipperItem["accImb_east"] !== null && shipperItem["accImb_east"] !== undefined ? formatNumberFourDecimalNom(shipperItem["accImb_east"]) : ''}
                    </td>
                )}

                {/* "accImb_west" */}
                {columnVisibility.west_acc_imb_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right ${getValidationColorClass(row["validation_accImb_west"]?.toLowerCase(), 'bg-[#83DDFF33]')}`} scope="col">
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["accImb_west"]) : ''} */}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem["accImb_west"]) : ''} */}
                        {shipperItem["accImb_west"] !== null && shipperItem["accImb_west"] !== undefined ? formatNumberFourDecimalNom(shipperItem["accImb_west"]) : ''}
                    </td>
                )}

                {/* "minInventory_east" */}
                {columnVisibility.east_min_inventory_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["minInventory_east"]) : ''} */}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem["minInventory_east"]) : ''} */}
                        {shipperItem["minInventory_east"] !== null && shipperItem["minInventory_east"] !== undefined ? formatNumberFourDecimalNom(shipperItem["minInventory_east"]) : ''}
                    </td>
                )}

                {/* "minInventory_west" */}
                {columnVisibility.west_min_inventory_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["minInventory_west"]) : ''} */}
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem["minInventory_west"]) : ''} */}
                        {shipperItem["minInventory_west"] !== null && shipperItem["minInventory_west"] !== undefined ? formatNumberFourDecimalNom(shipperItem["minInventory_west"]) : ''}
                    </td>
                )}

            </>)}





            {/* UNDER Detail Pane */}
            {columnVisibility.detail_pane && (
                <>
                    {/* "detail_entry_east_gsp" */}
                    {columnVisibility.gsp && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["detail_entry_east_gsp"]) : ''} */}
                            {/* {shipperItem ? formatNumberFourDecimal(shipperItem["detail_entry_east_gsp"]) : ''} */}
                            {shipperItem["detail_entry_east_gsp"] !== null && shipperItem["detail_entry_east_gsp"] !== undefined ? formatNumberFourDecimalNom(shipperItem["detail_entry_east_gsp"]) : ''}

                        </td>
                    )}

                    {/* "detail_entry_east_bypassGas" */}
                    {columnVisibility.bypass_gas && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["detail_entry_east_bypassGas"]) : ''} */}
                            {/* {shipperItem ? formatNumberFourDecimal(shipperItem["detail_entry_east_bypassGas"]) : ''} */}
                            {shipperItem["detail_entry_east_bypassGas"] !== null && shipperItem["detail_entry_east_bypassGas"] !== undefined ? formatNumberFourDecimalNom(shipperItem["detail_entry_east_bypassGas"]) : ''}

                        </td>
                    )}

                    {/* "detail_entry_east_lng" */}
                    {columnVisibility.lng && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["detail_entry_east_lng"]) : ''} */}
                            {/* {shipperItem ? formatNumberFourDecimal(shipperItem["detail_entry_east_lng"]) : ''} */}
                            {formatNumberFourDecimalNom(shipperItem["detail_entry_east_lng"])}
                        </td>
                    )}

                    {/* "detail_entry_east_others" */}
                    {columnVisibility.others_east && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {/* {`no_data`} */}
                            {formatNumberFourDecimal(sumDetail(shipperItem, 'detail_entry_east_', ['gsp', 'bypassGas', 'lng']))}
                        </td>
                    )}

                    {/* "detail_entry_west_yadana" */}
                    {columnVisibility.ydn && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["detail_entry_west_yadana"]) : ''} */}
                            {/* {shipperItem ? formatNumberFourDecimal(shipperItem["detail_entry_west_yadana"]) : ''} */}
                            {shipperItem["detail_entry_west_yadana"] !== null && shipperItem["detail_entry_west_yadana"] !== undefined ? formatNumberFourDecimalNom(shipperItem["detail_entry_west_yadana"]) : ''}

                        </td>
                    )}

                    {/* "detail_entry_west_yetagun" */}
                    {columnVisibility.ytg && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["detail_entry_west_yetagun"]) : ''} */}
                            {/* {shipperItem ? formatNumberFourDecimal(shipperItem["detail_entry_west_yetagun"]) : ''} */}
                            {shipperItem["detail_entry_west_yetagun"] !== null && shipperItem["detail_entry_west_yetagun"] !== undefined ? formatNumberFourDecimalNom(shipperItem["detail_entry_west_yetagun"]) : ''}

                        </td>
                    )}

                    {/* "detail_entry_west_zawtika" */}
                    {columnVisibility.ztk && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["detail_entry_west_zawtika"]) : ''} */}
                            {/* {shipperItem ? formatNumberFourDecimal(shipperItem["detail_entry_west_zawtika"]) : ''} */}
                            {shipperItem["detail_entry_west_zawtika"] !== null && shipperItem["detail_entry_west_zawtika"] !== undefined ? formatNumberFourDecimalNom(shipperItem["detail_entry_west_zawtika"]) : ''}

                        </td>
                    )}

                    {/* "detail_entry_west_others" */}
                    {columnVisibility.others_west && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {/* {`no_data`} */}
                            {formatNumberFourDecimal(sumDetail(shipperItem, 'detail_entry_west_', ['zawtika', 'yetagun', 'yadana']))}
                        </td>
                    )}

                    {/* "detail_entry_east-west_ra6East" */}
                    {columnVisibility.ra6_east && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["detail_entry_east-west_ra6East"]) : ''} */}
                            {/* {shipperItem ? formatNumberFourDecimal(shipperItem["detail_entry_east-west_ra6East"]) : ''} */}
                            {shipperItem["detail_entry_east-west_ra6East"] !== null && shipperItem["detail_entry_east-west_ra6East"] !== undefined ? formatNumberFourDecimalNom(shipperItem["detail_entry_east-west_ra6East"]) : ''}

                        </td>
                    )}

                    {/* "detail_entry_east-west_ra6West" */}
                    {columnVisibility.ra6_west && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["detail_entry_east-west_ra6West"]) : ''} */}
                            {/* {shipperItem ? formatNumberFourDecimal(shipperItem["detail_entry_east-west_ra6West"]) : ''} */}
                            {shipperItem["detail_entry_east-west_ra6West"] !== null && shipperItem["detail_entry_east-west_ra6West"] !== undefined ? formatNumberFourDecimalNom(shipperItem["detail_entry_east-west_ra6West"]) : ''}

                        </td>
                    )}

                    {/* "detail_entry_east-west_bvw10East" */}
                    {columnVisibility.bvw10_east && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["detail_entry_east-west_bvw10East"]) : ''} */}
                            {/* {shipperItem ? formatNumberFourDecimal(shipperItem["detail_entry_east-west_bvw10East"]) : ''} */}
                            {shipperItem["detail_entry_east-west_bvw10East"] !== null && shipperItem["detail_entry_east-west_bvw10East"] !== undefined ? formatNumberFourDecimalNom(shipperItem["detail_entry_east-west_bvw10East"]) : ''}

                        </td>
                    )}

                    {/* "detail_entry_east-west_bvw10West" */}
                    {columnVisibility.bvw10_West && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["detail_entry_east-west_bvw10West"]) : ''} */}
                            {/* {shipperItem ? formatNumberFourDecimal(shipperItem["detail_entry_east-west_bvw10West"]) : ''} */}
                            {shipperItem["detail_entry_east-west_bvw10West"] !== null && shipperItem["detail_entry_east-west_bvw10West"] !== undefined ? formatNumberFourDecimalNom(shipperItem["detail_entry_east-west_bvw10West"]) : ''}

                        </td>
                    )}

                    {/* "detail_exit_east_egat" */}
                    {columnVisibility.egat && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["detail_exit_east_egat"]) : ''} */}
                            {/* {shipperItem ? formatNumberFourDecimal(shipperItem["detail_exit_east_egat"]) : ''} */}
                            {shipperItem["detail_exit_east_egat"] !== null && shipperItem["detail_exit_east_egat"] !== undefined ? formatNumberFourDecimalNom(shipperItem["detail_exit_east_egat"]) : ''}

                        </td>
                    )}

                    {/* "detail_exit_east_ipp" */}
                    {columnVisibility.ipp && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["detail_exit_east_ipp"]) : ''} */}
                            {/* {shipperItem ? formatNumberFourDecimal(shipperItem["detail_exit_east_ipp"]) : ''} */}
                            {shipperItem["detail_exit_east_ipp"] !== null && shipperItem["detail_exit_east_ipp"] !== undefined ? formatNumberFourDecimalNom(shipperItem["detail_exit_east_ipp"]) : ''}

                        </td>
                    )}

                    {/* "detail_exit_east_others" */}
                    {columnVisibility.others_east_exit && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {/* {`no_data`} */}
                            {formatNumberFourDecimal(sumDetail(shipperItem, 'detail_exit_east_', ['egat', 'ipp']))}
                        </td>
                    )}

                    {/* "detail_exit_west_egat" */}
                    {columnVisibility.egat_west && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["detail_exit_west_egat"]) : ''} */}
                            {/* {shipperItem ? formatNumberFourDecimal(shipperItem["detail_exit_west_egat"]) : ''} */}
                            {shipperItem["detail_exit_west_egat"] !== null && shipperItem["detail_exit_west_egat"] !== undefined ? formatNumberFourDecimalNom(shipperItem["detail_exit_west_egat"]) : ''}

                        </td>
                    )}

                    {/* "detail_exit_west_ipp" */}
                    {columnVisibility.ipp_west && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["detail_exit_west_ipp"]) : ''} */}
                            {/* {shipperItem ? formatNumberFourDecimal(shipperItem["detail_exit_west_ipp"]) : ''} */}
                            {shipperItem["detail_exit_west_ipp"] !== null && shipperItem["detail_exit_west_ipp"] !== undefined ? formatNumberFourDecimalNom(shipperItem["detail_exit_west_ipp"]) : ''}

                        </td>
                    )}

                    {/* "detail_exit_west_others" */}
                    {columnVisibility.others_west_exit && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {/* {`no_data`} */}
                            {formatNumberFourDecimal(sumDetail(shipperItem, 'detail_exit_west_', ['egat', 'ipp']))}
                        </td>
                    )}

                    {/* "detail_exit_east-west_egat" */}
                    {columnVisibility.egat_east_west && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["detail_exit_east-west_egat"]) : ''} */}
                            {/* {shipperItem ? formatNumberFourDecimal(shipperItem["detail_exit_east-west_egat"]) : ''} */}
                            {shipperItem["detail_exit_east-west_egat"] !== null && shipperItem["detail_exit_east-west_egat"] !== undefined ? formatNumberFourDecimalNom(shipperItem["detail_exit_east-west_egat"]) : ''}

                        </td>
                    )}

                    {/* "detail_exit_east-west_ipp" */}
                    {columnVisibility.ipp_east_west && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["detail_exit_east-west_ipp"]) : ''} */}
                            {/* {shipperItem ? formatNumberFourDecimal(shipperItem["detail_exit_east-west_ipp"]) : ''} */}
                            {shipperItem["detail_exit_east-west_ipp"] !== null && shipperItem["detail_exit_east-west_ipp"] !== undefined ? formatNumberFourDecimalNom(shipperItem["detail_exit_east-west_ipp"]) : ''}

                        </td>
                    )}

                    {/* "detail_exit_east-west_others" */}
                    {columnVisibility.others_east_west_exit && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {/* {`no_data`} */}
                            {formatNumberFourDecimal(sumDetail(shipperItem, 'detail_exit_east-west_', ['egat', 'ipp']))}
                        </td>
                    )}

                    {/* "detail_exit_east_F2andG" */}
                    {columnVisibility.east_f2andg && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["detail_exit_east_F2andG"]) : ''} */}
                            {/* {shipperItem ? formatNumberFourDecimal(shipperItem["detail_exit_east_F2andG"]) : ''} */}
                            {shipperItem["detail_exit_east_F2andG"] !== null && shipperItem["detail_exit_east_F2andG"] !== undefined ? formatNumberFourDecimalNom(shipperItem["detail_exit_east_F2andG"]) : ''}

                        </td>
                    )}

                    {/* "detail_exit_west_F2andG" */}
                    {columnVisibility.west_f2andg && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["detail_exit_west_F2andG"]) : ''} */}
                            {/* {shipperItem ? formatNumberFourDecimal(shipperItem["detail_exit_west_F2andG"]) : ''} */}
                            {shipperItem["detail_exit_west_F2andG"] !== null && shipperItem["detail_exit_west_F2andG"] !== undefined ? formatNumberFourDecimalNom(shipperItem["detail_exit_west_F2andG"]) : ''}

                        </td>
                    )}

                    {/* "detail_exit_E_east" */}
                    {columnVisibility.east_e && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["detail_exit_E_east"]) : ''} */}
                            {/* {shipperItem ? formatNumberFourDecimal(shipperItem["detail_exit_E_east"]) : ''} */}
                            {shipperItem["detail_exit_E_east"] !== null && shipperItem["detail_exit_E_east"] !== undefined ? formatNumberFourDecimalNom(shipperItem["detail_exit_E_east"]) : ''}

                        </td>
                    )}

                    {/* "detail_exit_E_west" */}
                    {columnVisibility.west_e && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {/* {shipperItem?.totalShipper ? formatNumberFourDecimal(shipperItem?.totalShipper["detail_exit_E_west"]) : ''} */}
                            {/* {shipperItem ? formatNumberFourDecimal(shipperItem["detail_exit_E_west"]) : ''} */}
                            {shipperItem["detail_exit_E_west"] !== null && shipperItem["detail_exit_E_west"] !== undefined ? formatNumberFourDecimalNom(shipperItem["detail_exit_E_west"]) : ''}

                        </td>
                    )}

                </>)}
        </tr>
    );
};


export const ContractRowBlue = React.memo(
    ContractRowBlueBase,
    // areEqual  // (optional) comparator
);