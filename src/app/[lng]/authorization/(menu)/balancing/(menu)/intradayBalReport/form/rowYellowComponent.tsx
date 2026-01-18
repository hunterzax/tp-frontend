import { formatNumberFourDecimal, formatNumberFourDecimalNom, getValidationColorClass, sumDetail } from "@/utils/generalFormatter";
import getUserValue from "@/utils/getuserValue";
import React from "react";

interface ContractRowProps {
    row: any;
    shipperItem?: any;
    contract?: any;
    type?: any;
    shipperGroupData?: any;
    columnVisibility?: any;
    cIdx?: number;
    index: number;
    table_row_style?: string;
}

export const ContractRowYellowBase = ({
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

    const getColCustom: any = () => {
        let countCol: number = 0;
        let listInitial = [
            'gas_day',
            'gas_hour',
            'timestamp',
            'shipper_name',
            'plan_actual',
        ]

        listInitial?.map((item: any) => {
            if(columnVisibility?.[item]){
                countCol = countCol + 1
            }
        })

        return countCol
    }

    return (
        <tr
            key={`contract-${row?.request_number}-${cIdx}-${index}`}
            className={table_row_style}
        >
            {columnVisibility.publicate && userDT?.account_manage?.[0]?.user_type_id !== 3 && (
                <td className={` font-semibold  text-left text-[#004762] bg-[#FFEAA033]`} colSpan={1} scope="col"></td>
            )}

            <td className={`px-2 py-1 pl-6 font-semibold text-[#5A4600] text-left bg-[#FFEAA033]`} colSpan={getColCustom()} scope="col">
                {row ? row?.gas_day : ''}
            </td>

            {columnVisibility.plan_actual && (
                <td className={` py-1 pl-1 font-semibold  text-left text-[#5A4600] bg-[#FFEAA033]`} colSpan={1} scope="col">
                    {type == 'planning' ? 'NOMINATION' : 'TOTAL'}
                </td>
            )}

            {columnVisibility.summary_pane && (<>
                {columnVisibility.east_total_entry_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row?.total_entry_east)}
                    </td>
                )}

                {columnVisibility.west_total_entry_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row?.total_entry_west)}
                    </td>
                )}

                {columnVisibility.east_west_total_entry_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["total_entry_east-west"])}
                    </td>
                )}

                {columnVisibility.east_total_exit_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["total_exit_east"])}
                    </td>
                )}

                {columnVisibility.west_total_exit_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["total_exit_west"])}
                    </td>
                )}

                {columnVisibility.east_west_total_exit_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["total_exit_east-west"])}
                    </td>
                )}

                {columnVisibility.east_imbalance_zone_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["imbZone_east"])}
                    </td>
                )}

                {columnVisibility.west_imbalance_zone_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["imbZone_west"])}
                    </td>
                )}

                {columnVisibility.total_imbalance_zone_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["imbZone_total"])}
                    </td>
                )}

                {columnVisibility.east_instructed_flow_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["instructedFlow_east"])}
                    </td>
                )}

                {columnVisibility.west_instructed_flow_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["instructedFlow_west"])}
                    </td>
                )}

                {columnVisibility.east_west_instructed_flow_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["instructedFlow_east-west"])}
                    </td>
                )}

                {columnVisibility.east_shrinkage_volume_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["shrinkage_east"])}
                    </td>
                )}

                {columnVisibility.west_shrinkage_volume_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["shrinkage_west"])}
                    </td>
                )}

                {columnVisibility.east_park_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["park_east"])}
                    </td>
                )}

                {columnVisibility.west_park_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["park_west"])}
                    </td>
                )}

                {columnVisibility.east_unpark_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["Unpark_east"])}
                    </td>
                )}

                {columnVisibility.west_unpark_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["Unpark_west"])}
                    </td>
                )}

                {columnVisibility.east_sod_park_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["SodPark_east"])}
                    </td>
                )}

                {columnVisibility.west_sod_park_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["SodPark_west"])}
                    </td>
                )}

                {columnVisibility.east_eod_park_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["EodPark_east"])}
                    </td>
                )}

                {columnVisibility.west_eod_park_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["EodPark_west"])}
                    </td>
                )}

                {columnVisibility.east_min_inventory_change_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["minInventoryChange_east"])}
                    </td>
                )}

                {columnVisibility.west_min_inventory_change_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["minInventoryChange_west"])}
                    </td>
                )}

                {columnVisibility.east_reserve_bal_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["reserveBal_east"])}
                    </td>
                )}

                {columnVisibility.west_reserve_bal_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["reserveBal_west"])}
                    </td>
                )}

                {columnVisibility.east_adjust_imbalance_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["adjustDailyImb_east"])}
                    </td>
                )}

                {columnVisibility.west_adjust_imbalance_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["adjustDailyImb_west"])}
                    </td>
                )}

                {columnVisibility.east_vent_gas && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["ventGas_east"])}
                    </td>
                )}

                {columnVisibility.west_vent_gas && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["ventGas_west"])}
                    </td>
                )}

                {columnVisibility.east_commissioning_gas && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["commissioningGas_east"])}
                    </td>
                )}

                {columnVisibility.west_commissioning_gas && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["commissioningGas_west"])}
                    </td>
                )}

                {columnVisibility.east_other_gas && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["otherGas_east"])}
                    </td>
                )}

                {columnVisibility.west_other_gas && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["otherGas_west"])}
                    </td>
                )}

                {columnVisibility.east_daily_imb_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["dailyImb_east"])}
                    </td>
                )}

                {columnVisibility.west_daily_imb_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["dailyImb_west"])}
                    </td>
                )}

                {columnVisibility.total_aip_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["aip"])}
                    </td>
                )}

                {columnVisibility.total_ain_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["ain"])}
                    </td>
                )}

                {columnVisibility.total_percentage_imb && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["absimb"])}
                    </td>
                )}

                {columnVisibility.total_percentage_abslmb && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {row["absimb"] ? formatNumberFourDecimalNom(Math.abs(row["absimb"])) : ''}
                    </td>
                )}

                {columnVisibility.east_acc_imb_month_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["accImbMonth_east"])}
                    </td>
                )}

                {columnVisibility.west_acc_imb_month_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["accImbMonth_west"])}
                    </td>
                )}

                {columnVisibility.east_acc_imb_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right ${getValidationColorClass(row["validation_accImb_east"]?.toLowerCase(), 'bg-[#FFEAA033]')}`} scope="col">
                        {formatNumberFourDecimalNom(row["accImb_east"])}
                    </td>
                )}

                {columnVisibility.west_acc_imb_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right ${getValidationColorClass(row["validation_accImb_west"]?.toLowerCase(), 'bg-[#FFEAA033]')}`} scope="col">
                        {formatNumberFourDecimalNom(row["accImb_west"])}
                    </td>
                )}

                {columnVisibility.east_acc_imb_inventory_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right ${getValidationColorClass(row["validation_accImbInv_east"]?.toLowerCase(), 'bg-[#FFEAA033]')}`} scope="col">
                        {formatNumberFourDecimalNom(row["accImbInv_east"])}
                    </td>
                )}

                {columnVisibility.west_acc_imb_inventory_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right ${getValidationColorClass(row["validation_accImbInv_west"]?.toLowerCase(), 'bg-[#FFEAA033]')}`} scope="col">
                        {formatNumberFourDecimalNom(row["accImbInv_west"])}
                    </td>
                )}

                {columnVisibility.east_min_inventory_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["minInventory_east"])}
                    </td>
                )}

                {columnVisibility.west_min_inventory_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["minInventory_west"])}
                    </td>
                )}

            </>)}

            {columnVisibility.detail_pane && (
                <>
                    {columnVisibility.gsp && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {formatNumberFourDecimalNom(row["detail_entry_east_gsp"])}
                        </td>
                    )}

                    {columnVisibility.bypass_gas && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {formatNumberFourDecimalNom(row["detail_entry_east_bypassGas"])}
                        </td>
                    )}

                    {columnVisibility.lng && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {formatNumberFourDecimalNom(row["detail_entry_east_lng"])}
                        </td>
                    )}

                    {columnVisibility.others_east && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {(() => { const sum = sumDetail(row, 'detail_entry_east_', ['gsp', 'bypassGas', 'lng']); return sum !== null ? formatNumberFourDecimal(sum) : ''; })()}
                        </td>
                    )}

                    {columnVisibility.ydn && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {formatNumberFourDecimalNom(row["detail_entry_west_yadana"])}
                        </td>
                    )}

                    {columnVisibility.ytg && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {formatNumberFourDecimalNom(row["detail_entry_west_yetagun"])}
                        </td>
                    )}

                    {columnVisibility.ztk && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {formatNumberFourDecimalNom(row["detail_entry_west_zawtika"])}
                        </td>
                    )}

                    {columnVisibility.others_west && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {(() => { const sum = sumDetail(row, 'detail_entry_west_', ['zawtika', 'yetagun', 'yadana']); return sum !== null ? formatNumberFourDecimal(sum) : ''; })()}
                        </td>
                    )}

                    {columnVisibility.ra6_east && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {formatNumberFourDecimalNom(row["detail_entry_east-west_ra6East"])}
                        </td>
                    )}

                    {columnVisibility.ra6_west && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {formatNumberFourDecimalNom(row["detail_entry_east-west_ra6West"])}
                        </td>
                    )}

                    {columnVisibility.bvw10_east && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {formatNumberFourDecimalNom(row["detail_entry_east-west_bvw10East"])}
                        </td>
                    )}

                    {columnVisibility.bvw10_West && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {formatNumberFourDecimalNom(row["detail_entry_east-west_bvw10West"])}
                        </td>
                    )}

                    {columnVisibility.egat && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {formatNumberFourDecimalNom(row["detail_exit_east_egat"])}
                        </td>
                    )}

                    {columnVisibility.ipp && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {formatNumberFourDecimalNom(row["detail_exit_east_ipp"])}
                        </td>
                    )}

                    {columnVisibility.others_east_exit && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {(() => { const sum = sumDetail(row, 'detail_exit_east_', ['egat', 'ipp']); return sum !== null ? formatNumberFourDecimal(sum) : ''; })()}
                        </td>
                    )}

                    {columnVisibility.egat_west && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {formatNumberFourDecimalNom(row["detail_exit_west_egat"])}
                        </td>
                    )}

                    {columnVisibility.ipp_west && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {formatNumberFourDecimalNom(row["detail_exit_west_ipp"])}
                        </td>
                    )}

                    {columnVisibility.others_west_exit && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {(() => { const sum = sumDetail(row, 'detail_exit_west_', ['egat', 'ipp']); return sum !== null ? formatNumberFourDecimal(sum) : ''; })()}
                        </td>
                    )}

                    {columnVisibility.egat_east_west && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {formatNumberFourDecimalNom(row["detail_exit_east-west_egat"])}
                        </td>
                    )}

                    {columnVisibility.ipp_east_west && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {formatNumberFourDecimalNom(row["detail_exit_east-west_ipp"])}
                        </td>
                    )}

                    {columnVisibility.others_east_west_exit && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {(() => { const sum = sumDetail(row, 'detail_exit_east-west_', ['egat', 'ipp']); return sum !== null ? formatNumberFourDecimal(sum) : ''; })()}
                        </td>
                    )}

                    {columnVisibility.east_f2andg && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {formatNumberFourDecimalNom(row["detail_exit_east_F2andG"])}
                        </td>
                    )}

                    {columnVisibility.west_f2andg && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {formatNumberFourDecimalNom(row["detail_exit_west_F2andG"])}
                        </td>
                    )}

                    {columnVisibility.east_e && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {formatNumberFourDecimalNom(row["detail_exit_E_east"])}
                        </td>
                    )}

                    {columnVisibility.west_e && (
                        <td className={`px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {formatNumberFourDecimalNom(row["detail_exit_E_west"])}
                        </td>
                    )}

                </>)}

        </tr>
    );
};

export const ContractRowYellow = React.memo(
    ContractRowYellowBase,
);
