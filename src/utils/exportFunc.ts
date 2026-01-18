import getCookieValue from "./getCookieValue";
import dayjs from 'dayjs';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const API_URL = process.env.NEXT_PUBLIC_API_URL

export const exportFunc = async (path: any, data: any) => {
    try {
        const ids = data.map((item: any) => item.id);
        let url = `${API_URL}/master/export-files/${path}?id=[${ids}]`
        // window.open(`${API_URL}/master/export-files/${path}?id=[${ids}]`, '_blank');
        const link = document.createElement('a');
        link.href = url;
        link.download = '';
        link.click();
    } catch (error) {
        // Export error occurred
    }
};

export const newExportFunc = async (path: any, data: any, columnVisibility?: any, initialColumns?: any, fileName?: string) => {
    // let arr_of_col_1 = Object.keys(columnVisibility).filter(key => columnVisibility[key] && key !== "action");
    // const filtered = initialColumns.filter((item:any) => arr_of_col_1.includes(item.key));
    // let output = filtered.map((item:any) => item.label);
    // capacity/capacity-publication-detail

    let output = initialColumns
        .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
        .map((item: any) => item.label);

    let maxDay: dayjs.Dayjs | undefined;
    let minDay: dayjs.Dayjs | undefined;
    output = output.map((item: any) => item === "Area Nominal Capacity (MMBTU/D)" ? "Area Nominal Capacity (MMBTH/D)" : item);


    Object.keys(columnVisibility).map((key) => {
        const day = dayjs(key, 'MMM YYYY', true);
        if (day.isValid()) {
            if (maxDay == undefined || maxDay?.isBefore(day)) {
                maxDay = day;
            }
            if (minDay == undefined || minDay?.isAfter(day)) {
                minDay = day;
            }
        }
    });

    try {
        const ids = data.map((item: any) => item.id);
        const body = {
            id: ids,
            filter: output,
            maxDay: maxDay?.format('MMM YYYY'),
            minDay: minDay?.format('MMM YYYY')
        };
        postExport(path, body, fileName)

    } catch (error) {
        // Export error occurred
    }
};

// ใช้กับ nomination quality planning, quality evaluation
export const exportNomiEvaluaAndPlanning = async (path: any, data: any, columnVisibility?: any, initialColumns?: any, type?: any, gasday?: any) => {

    let output = initialColumns
        .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
        .map((item: any) => item.label);

    try {
        // const ids = data.map((item: any) => item.id);
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        let startDate = dayjs(gasday, "DD/MM/YYYY");

        // let date_next_sunday = gasWeekFilter && isSearch ? formatDateYyyyMmDd(gasday) : oldGasWeekFilter && !isResetSearch ? formatDateYyyyMmDd(oldGasWeekFilter) : getCurrentWeekSundayYyyyMmDd()
        // let date_next_sunday = formatDateYyyyMmDd(gasday)

        // for (let i = 0; i < 7; i++) {
        //     const date = startDate.add(i, "day").format("DD/MM/YYYY");
        //     output.push(`${daysOfWeek[i]} ${date}`);
        // }

        for (let i = 0; i < 7; i++) {
            const current = startDate.add(i, "day");
            const dayName = current.format("dddd"); // Full day name (e.g., Sunday)
            const fullLabel = `${dayName} ${current.format("DD/MM/YYYY")}`;
            output.push(fullLabel);
        }

        let body = {
            gasday: gasday ? gasday : null,
            type: type,
            filter: output
        };

        if (type == 2) { // type = 2 weekly
            // gasday = "21/09/2025"
            // เอาวันที่ gasday ไปต่อท้ายแบบ body ที่ส่งให้ดู
            const baseDate = dayjs(gasday, "DD/MM/YYYY"); // parse string -> dayjs

            body = {
                "gasday": gasday,
                "type": type,
                "filter": [
                    "Zone",
                    "Area",
                    "Parameter",
                    `Sunday ${baseDate.format("DD/MM/YYYY")}`,
                    `Monday ${baseDate.add(1, "day").format("DD/MM/YYYY")}`,
                    `Tuesday ${baseDate.add(2, "day").format("DD/MM/YYYY")}`,
                    `Wednesday ${baseDate.add(3, "day").format("DD/MM/YYYY")}`,
                    `Thursday ${baseDate.add(4, "day").format("DD/MM/YYYY")}`,
                    `Friday ${baseDate.add(5, "day").format("DD/MM/YYYY")}`,
                    `Saturday ${baseDate.add(6, "day").format("DD/MM/YYYY")}`,
                ]
            }
        }

         
        postExport(path, body)

    } catch (error) {
        // Export error occurred
    }
};

// ใช้กับ allocation review
export const exportAllocReview = async (path: any, data: any, data2: any, columnVisibility?: any, initialColumns?: any, type?: any, seletedId?: any) => {
    let flat_map_id = seletedId?.flatMap((item: any) => item?.id)

    const output = initialColumns
        .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
        .map((item: any) => item.label);

     
    try {
        // const ids = data.map((item: any) => item.id);
        const body = {
            bodys: {
                "start_date": data2?.start_date,
                "end_date": data2?.end_date,
                "skip": 100,
                "limit": 100,
                "idAr": flat_map_id
            },
            filter: output
        };
         

        postExport(path, body)
    } catch (error) {
        // Export error occurred
    }
};

export const exportAllocMgn = async (path: any, data: any, data2: any, columnVisibility?: any, initialColumns?: any, type?: any, seletedId?: any, specificData?:any) => {

    // let flat_map_id = data.flatMap((item: any) => item?.id)
    const flat_map_id = data
        .map((item: any) => item.data.map((d: any) => d.id))
        .flat();

    const output = initialColumns
        .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
        .map((item: any) => item.label);

     
    try {
        // const ids = data.map((item: any) => item.id);
        const body = {
            bodys: {
                "start_date": data2?.start_date,
                "end_date": data2?.end_date,
                "skip": 100,
                "limit": 100,
                "idAr": flat_map_id
            },
            filter: output
        };
         
        postExport(path, body)

    } catch (error) {
        // Export error occurred
    }
};

export const exportAllocQuery = async (path: any, data: any, data2: any, columnVisibility?: any, initialColumns?: any, type?: any, seletedId?: any, tabIndex?: any) => {
    const output = initialColumns
        .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
        .map((item: any) => item.label);

    try {
        const ids = data.map((item: any) => item.id);
        const body = {
            bodys: {
                "start_date": data2?.date?.start_date,
                "end_date": data2?.date?.end_date,
                "skip": 100,
                "limit": 100,
                "tab": tabIndex,
                "idAr": ids,
                "is_last_version": data2?.last_version
            },
            filter: output
        };
         
        postExport(path, body)

    } catch (error) {
        // Export error occurred
    }
};

export const exportAllocReport = async (path: any, data: any, data2: any, columnVisibility?: any, initialColumns?: any, type?: any, seletedId?: any, tabIndex?: any) => {
    const EXCLUDED_KEYS = new Set(["action", "publication"]);
    const output = initialColumns
        .filter((item: any) => !!columnVisibility?.[item.key] && !EXCLUDED_KEYS.has(item.key))
        .map((item: any) => item.label);

    try {
        const ids = data.map((item: any) => item.id);
        const body = {
            bodys: {
                ...data2,
                // "start_date": "2025-01-01",
                // "end_date": "2025-02-28",
                // "skip": 100,
                // "limit": 100,
                "tab": tabIndex,
                "idAr": ids
            },
            filter: output
        };
         
        postExport(path, body)

    } catch (error) {
        // Export error occurred
    }
};

// ใช้กับ balance --> adjustment --> adjust daily imbalance
export const exportAdjustDailyImbalance = async (path: any, data: any, data2: any, columnVisibility?: any, initialColumns?: any, type?: any, seletedId?: any) => {

    const output = initialColumns
        .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
        .map((item: any) => item.label);

    const body = {
        bodys: {
            "start_date": data2?.start_date,
            "end_date": data2?.end_date,
            "skip": 100,
            "limit": 100,
        },
        filter: output
    };
    postExport(path, body)
};



// ใช้กับ balance --> adjustment --> adjust accumulated imbalance
export const exportAdjustAccumulateImbalance = async (path: any, data: any, data2: any, columnVisibility?: any, initialColumns?: any, type?: any, seletedId?: any) => {
    const output = initialColumns?.filter((item: any) => columnVisibility[item.key] && item.key !== "action")?.map((item: any) => item.label);

    let filterx: string[] = [];
    columnVisibility.gas_day && filterx.push("Gas Day");
    columnVisibility.shipper_name && filterx.push("Shipper Name");
    columnVisibility.zone && filterx.push("Zone");
    columnVisibility.adjust_imbalance && filterx.push("Adjust Imbalance");
    columnVisibility.daily_initial_imbalance && filterx.push("Daily Initial Imbalance");
    columnVisibility.daily_final_imbalance && filterx.push("Daily Final Imbalance");
    columnVisibility.intraday_initial_imbalance && filterx.push("Intraday Initial Imbalance");
    columnVisibility.intraday_final_imbalance && filterx.push("Intraday Final Imbalance");
    columnVisibility.updated_by && filterx.push("Updated by");

    const body = {
        bodys: {
            "start_date": data2?.start_date,
            "end_date": data2?.end_date,
            "skip": 100,
            "limit": 100,
        },
        // filter: output
        filter: filterx
    };

    postExport(path, body)
};

// ใช้กับ nomination dashboard
export const exportNomDashboard = async (path: any, data: any, columnVisibility?: any, initialColumns?: any, type?: any, specificData?: any) => {
    const output = initialColumns
        .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
        .map((item: any) => item.label);

    try {
        const body = {
            key: type,
            gas_day: specificData?.gas_day,
            filter: output
        };
         
        postExport(path, body)

    } catch (error) {
        // Export error occurred
    }
};

export const exportParkingAllocation = async (path: any, data: any, columnVisibility?: any, initialColumns?: any, type?: any, seletedId?: any, specificData?: any) => {
    const formattedDate = dayjs(specificData).format('YYYY-MM-DD');
    const output = initialColumns
        .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
        .map((item: any) => item.label);

    const body = {
        gas_day: formattedDate ? formattedDate : '2025-05-02',
        filter: output
    };
    postExport(path, body)

};

export const exportAllocationMonthlyReport = async (path: any, data: any, columnVisibility?: any, initialColumns?: any, type?: any, seletedId?: any, specificData?: any) => {
    // specificData={{
    //     "start_date": "2025-01-01",
    //     "end_date": "2025-02-28",
    //     "skip": 100,
    //     "limit": 100,
    //     "shipperId": srchShipperName,
    //     "month": month,
    //     "year": year,
    //     "version": srchVersion,
    //     "contractCode": srchContractCode
    // }}

    const body = specificData
    postExport(path, body)
    // postExportAllocMonthlyReport(path, body)
};

export const exportBalancingMonthlyReport = async (path: any, data: any, columnVisibility?: any, initialColumns?: any, type?: any, seletedId?: any, specificData?: any) => {
    // specificData={{
    //     "skip": 0, //fix
    //     "limit": 100,  //fix
    //     "month": "02",
    //     "year": "2025",
    //     "shipperId": "", //NGP-S01-001
    //     "contractCode": "Summary" // Summary หรือ 2025-CNF-002 .....
    // }}
    const body = specificData
    postExport(path, body)
};


export const exportShipperNominationReport = async (path: any, data: any, columnVisibility?: any, initialColumns?: any, type?: any, seletedId?: any, specificData?: any) => {

    // let data_post = {
    //     "key": 2, // 0 all, 1 daily, 2 weekly, 
    //     "day":"sunday", // ถ้าใส่ key 2 ให้ ใส่มาด้วย // sunday // monday // tuesday // wednesday // thursday // friday // saturday
    //     "id":[10],
    //     "filter": [
    //         "Gas Day",
    //         "Shipper Name",
    //         "Capacity Right(MMBTU/D)",
    //         "Nominated Value(MMBTU/D)",
    //         "Overusage(MMBTU/D)",
    //         "Imbalance(MMBTU/D)"
    //     ]
    // }

     
    let flat_map_id = data?.flatMap((item: any) => item?.id)
    let day: any = 'sunday'

    switch (specificData?.day) {
        case 0:
            day = 'sunday'
            break;
        case 1:
            day = 'monday'
            break;
        case 2:
            day = 'tuesday'
            break;
        case 3:
            day = 'wednesday'
            break;
        case 4:
            day = 'thursday'
            break;
        case 5:
            day = 'friday'
            break;
        case 6:
            day = 'saturday'
            break;
    }

    const output = initialColumns
        .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
        .map((item: any) => item.label);

    const body = {
        key: specificData?.tabIndex,
        day: day,
        id: flat_map_id,
        filter: output
    };

     

    postExport(path, body)
};

export const exportCurtailsmentAlloc = async (path: any, data: any, columnVisibility?: any, initialColumns?: any, type?: any, seletedId?: any, specificData?: any, tabIndex?: any) => {
    // {
    //     "bodys": {
    //       "type": 1,
    //       "idAr":[18]
    //     },
    //     "filter": [
    //         "Case ID",
    //         "Gas Day",
    //         "Area",
    //         "Nomination Point",
    //         "Maximum Capacity",
    //         "Nomination Value",
    //         "Unit"
    //     ]
    // }

     

    let flat_map_id = data?.flatMap((item: any) => item?.id)
    const output = initialColumns
        .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
        .map((item: any) => item.label);

    const body = {
        bodys: {
            type: tabIndex,
            idAr: flat_map_id
        },
        filter: output
    };
     
    postExport(path, body)
};

export const exportHvForOperationFlow = async (path: any, data: any, columnVisibility?: any, initialColumns?: any) => {

    // {
    //     "id": [
    //         2
    //     ],
    //     "filter": [
    //         "Type",
    //         "Shipper Name",
    //         "Meter Point",
    //         "Start Date",
    //         "Created by"
    //     ]
    // }

    let flat_map_id = data?.flatMap((item: any) => item?.id)

    const output = initialColumns
        .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
        .map((item: any) => item.label);

    const body = {
        id: flat_map_id,
        filter: output
    };
     
    postExport(path, body)
};

// intraday-acc-imbalance-inventory-original
export const exportIntradayAccImbalanceInventoryOriginal = async (path: any, data: any, columnVisibility?: any, initialColumns?: any, specificData?: any) => {
    // {
    //     "bodys": {
    //         "gas_day": "2025-01-01", // fixed ไว้ ของ mock eviden 2025-01-01 to 2025-02-28
    //         "skip": 0, // fixed ไว้ ของ mock eviden
    //         "limit": 100 // fixed ไว้ ของ mock eviden
    //     },
    //     "filter": [ // ยังไม่ได้กรอกจริง ไม่ต้องส่งมาก็ได้
    //     ]
    // }
     

    const output = initialColumns?.filter((item: any) => columnVisibility[item.key] && item.key !== "action")?.map((item: any) => item.label);

    const body = {
        bodys: specificData,
        filter: output
    };
     
    postExport(path, body)
};


export const exportIntradayBaseInventory = async (path: any, data: any, columnVisibility?: any, initialColumns?: any, specificData?: any) => {

    // {
    //     "bodys": {
    //         "gas_day": "2025-02-20", // YYYY-MM-DD ต้องส่ง
    //         "zone": "", // EAST ไม่เลือก ส่ง ว่าง ""
    //         "mode": "", // E3 ไม่เลือก ส่ง ว่าง ""
    //         "timestamp": "", // 1739996400 ไม่เลือก ส่ง ว่าง "" จาก execute_timestamp
    //         "skip": 0,
    //         "limit": 100,
    //         "latest_daily_version": false,
    //         "latest_hourly_version": false
    //     },
    //     "filter": [
    //     ]
    // }
     

    const output = initialColumns?.filter((item: any) => columnVisibility[item.key] && item.key !== "action")?.map((item: any) => item.label);

    const body = {
        bodys: specificData,
        // filter: output
        filter: [
            "Gas Day",
            "Gas Hour",
            "Timestamp",
            "Zone",
            "Mode",
            "HV (BTU/SCF)",
            "Base Inventory Value (MMBTU)",
            "High Max (MMBTU)",
            "High Difficult Day",
            "High Red (MMBTU)",
            "High Orange (MMBTU)",
            "Alert High (MMBTU)",
            "Alert Low (MMBTU)",
            "Low Orange (MMBTU)",
            "Low Red (MMBTU)",
            "Low Difficult Day",
            "Low Max (MMBTU)"
        ]
    };
     
    postExport(path, body)
};

export const exportIntradayBalancingReport = async (path: any, data: any, columnVisibility?: any, initialColumns?: any, specificData?: any) => {
     
    // const output = initialColumns?.filter((item: any) => columnVisibility[item.key] && item.key !== "action")?.map((item: any) => item.label);

    // เก็บไว้ดูนะ
    let xxx = {
        "summary_pane": true,
        "detail_pane": false,

        // หัวฝั่ง summary
        "total_entry_mmbtud": true,
        "total_exit_mmbtud": true,
        "imbalance_zone_mmbtud": true,
        "instructed_flow_mmbtud": false,
        "shrinkage_volume_mmbtud": true,
        "park_mmbtud": false,
        "unpark_mmbtud": false,
        "sod_park_mmbtud": false,
        "eod_park_mmbtud": false,
        "min_inventory_change_mmbtud": true,
        "reserve_bal_mmbtud": false,
        "adjust_imbalance_mmbtud": true,
        "vent_gas": false,
        "commissioning_gas": false,
        "other_gas": false,
        "daily_imb_mmbtud": true,
        "aip_mmbtud": false,
        "ain_mmbtud": false,
        "percentage_imb": false,
        "percentage_abslmb": false,
        "acc_imb_month_mmbtud": false,
        "acc_imb_mmbtud": true,
        "acc_imb_inventory_mmbtud": false,
        "min_inventory_mmbtud": false,


        // สองคีย์นี้เหมือนไม่มีใน filter
        "east_acc_imb_inventory_mmbtud": false,
        "west_acc_imb_inventory_mmbtud": false,



        // หัวฝั่ง detail
        "entry": false,
        "exit": false,
        "east_entry_detail_pane": false,
        "west_entry_detail_pane": false,
        "east_west_entry_detail_pane": false,
        "east_exit_detail_pane": false,
        "west_exit_detail_pane": false,
        "east_west_exit_detail_pane": false,
        "f2_and_g": false,
        "e": false,
    }

    let filterx: string[] = [];

    // ฝั่ง summary
    columnVisibility.publicate && filterx.push("Publicate");
    columnVisibility.gas_day && filterx.push("Gas Day");
    columnVisibility.gas_hour && filterx.push("Gas Hour");
    columnVisibility.timestamp && filterx.push("Timestamp");
    columnVisibility.shipper_name && filterx.push("Summary Pane.Shipper Name");
    columnVisibility.plan_actual && filterx.push("Summary Pane.Plan / Actual");
    columnVisibility.contract_code && filterx.push("Summary Pane.Contract Code");
    columnVisibility.east_total_entry_mmbtud && filterx.push("Summary Pane.Total Entry (MMBTU/D).East");
    columnVisibility.west_total_entry_mmbtud && filterx.push("Summary Pane.Total Entry (MMBTU/D).West");
    columnVisibility.east_west_total_entry_mmbtud && filterx.push("Summary Pane.Total Entry (MMBTU/D).East-West");
    columnVisibility.east_total_exit_mmbtud && filterx.push("Summary Pane.Total Exit (MMBTU/D).East");
    columnVisibility.west_total_exit_mmbtud && filterx.push("Summary Pane.Total Exit (MMBTU/D).West");
    columnVisibility.east_west_total_exit_mmbtud && filterx.push("Summary Pane.Total Exit (MMBTU/D).East-West");
    columnVisibility.east_imbalance_zone_mmbtud && filterx.push("Summary Pane.Imbalance Zone (MMBTU/D).East");
    columnVisibility.west_imbalance_zone_mmbtud && filterx.push("Summary Pane.Imbalance Zone (MMBTU/D).West");
    columnVisibility.total_imbalance_zone_mmbtud && filterx.push("Summary Pane.Imbalance Zone (MMBTU/D).Total");
    columnVisibility.east_instructed_flow_mmbtud && filterx.push("Summary Pane.Instructed Flow (MMBTU/D).East");
    columnVisibility.west_instructed_flow_mmbtud && filterx.push("Summary Pane.Instructed Flow (MMBTU/D).West");
    columnVisibility.east_west_instructed_flow_mmbtud && filterx.push("Summary Pane.Instructed Flow (MMBTU/D).East-West");
    columnVisibility.east_shrinkage_volume_mmbtud && filterx.push("Summary Pane.Shrinkage Volume (MMBTU/D).East");
    columnVisibility.west_shrinkage_volume_mmbtud && filterx.push("Summary Pane.Shrinkage Volume (MMBTU/D).West");
    columnVisibility.east_park_mmbtud && filterx.push("Summary Pane.Park (MMBTU/D).East");
    columnVisibility.west_park_mmbtud && filterx.push("Summary Pane.Park (MMBTU/D).West");
    columnVisibility.east_unpark_mmbtud && filterx.push("Summary Pane.Unpark (MMBTU/D).East");
    columnVisibility.west_unpark_mmbtud && filterx.push("Summary Pane.Unpark (MMBTU/D).West");
    columnVisibility.east_sod_park_mmbtud && filterx.push("Summary Pane.SOD Park (MMBTU/D).East");
    columnVisibility.west_sod_park_mmbtud && filterx.push("Summary Pane.SOD Park (MMBTU/D).West");
    columnVisibility.east_eod_park_mmbtud && filterx.push("Summary Pane.EOD Park (MMBTU/D).East");
    columnVisibility.west_eod_park_mmbtud && filterx.push("Summary Pane.EOD Park (MMBTU/D).West");
    columnVisibility.east_min_inventory_change_mmbtud && filterx.push("Summary Pane.Change Min Inventory (MMBTU/D).East");
    columnVisibility.west_min_inventory_change_mmbtud && filterx.push("Summary Pane.Change Min Inventory (MMBTU/D).West");
    columnVisibility.east_reserve_bal_mmbtud && filterx.push("Summary Pane.Reserve Bal. (MMBTU/D).East");
    columnVisibility.west_reserve_bal_mmbtud && filterx.push("Summary Pane.Reserve Bal. (MMBTU/D).West");
    columnVisibility.east_adjust_imbalance_mmbtud && filterx.push("Summary Pane.Adjust Imbalance (MMBTU/D).East");
    columnVisibility.west_adjust_imbalance_mmbtud && filterx.push("Summary Pane.Adjust Imbalance (MMBTU/D).West");
    columnVisibility.east_vent_gas && filterx.push("Summary Pane.Vent Gas.East");
    columnVisibility.west_vent_gas && filterx.push("Summary Pane.Vent Gas.West");
    columnVisibility.east_commissioning_gas && filterx.push("Summary Pane.Commissioning Gas.East");
    columnVisibility.west_commissioning_gas && filterx.push("Summary Pane.Commissioning Gas.West");
    columnVisibility.east_other_gas && filterx.push("Summary Pane.Other Gas.East");
    columnVisibility.west_other_gas && filterx.push("Summary Pane.Other Gas.West");
    columnVisibility.east_daily_imb_mmbtud && filterx.push("Summary Pane.Daily IMB (MMBTU/D).East");
    columnVisibility.west_daily_imb_mmbtud && filterx.push("Summary Pane.Daily IMB (MMBTU/D).West");
    columnVisibility.total_aip_mmbtud && filterx.push("Summary Pane.AIP (MMBTU/D).Total");
    columnVisibility.total_ain_mmbtud && filterx.push("Summary Pane.AIN (MMBTU/D).Total");
    columnVisibility.total_percentage_imb && filterx.push("Summary Pane.%Imb.Total");
    columnVisibility.total_percentage_abslmb && filterx.push("Summary Pane.%Absimb.Total");
    columnVisibility.total_percentage_abslmb && filterx.push("Summary Pane.%Absimb.Total");
    columnVisibility.east_acc_imb_month_mmbtud && filterx.push("Summary Pane.Acc. IMB. (MONTH) (MMBTU/D).East");
    columnVisibility.west_acc_imb_month_mmbtud && filterx.push("Summary Pane.Acc. IMB. (MONTH) (MMBTU/D).West");
    columnVisibility.east_acc_imb_mmbtud && filterx.push("Summary Pane.Acc. IMB. (MMBTU/D).East");
    columnVisibility.west_acc_imb_mmbtud && filterx.push("Summary Pane.Acc. IMB. (MMBTU/D).West");
    columnVisibility.east_acc_imb_inventory_mmbtud && filterx.push("Summary Pane.Min. (MMBTU/D).East");
    // ตรงนี้มีคีย์หาย ของ summary

    columnVisibility.east_min_inventory_mmbtud && filterx.push("Summary Pane.Min. (MMBTU/D).East");
    columnVisibility.west_min_inventory_mmbtud && filterx.push("Summary Pane.Min. (MMBTU/D).West");

    // ฝั่ง detail
    columnVisibility.gsp && filterx.push("Detail Pane.Entry.East.GSP");
    columnVisibility.bypass_gas && filterx.push("Detail Pane.Entry.East.Bypass GSP");
    columnVisibility.lng && filterx.push("Detail Pane.Entry.East.LNG");
    columnVisibility.others_east && filterx.push("Detail Pane.Entry.East.Others");
    columnVisibility.ydn && filterx.push("Detail Pane.Entry.West.YDN");
    columnVisibility.ytg && filterx.push("Detail Pane.Entry.West.YTG");
    columnVisibility.ztk && filterx.push("Detail Pane.Entry.West.ZTK");
    columnVisibility.others_west && filterx.push("Detail Pane.Entry.West.Others");
    columnVisibility.ra6_east && filterx.push("Detail Pane.Entry.East-West.RA6 East");
    columnVisibility.ra6_west && filterx.push("Detail Pane.Entry.East-West.RA6 West");
    columnVisibility.bvw10_east && filterx.push("Detail Pane.Entry.East-West.BVW10 East");
    columnVisibility.bvw10_West && filterx.push("Detail Pane.Entry.East-West.BVW10 West");
    columnVisibility.egat && filterx.push("Detail Pane.Exit.East.EGAT");
    columnVisibility.ipp && filterx.push("Detail Pane.Exit.East.IPP");
    columnVisibility.others_east_exit && filterx.push("Detail Pane.Exit.East.Others");
    columnVisibility.egat_west && filterx.push("Detail Pane.Exit.West.EGAT");
    columnVisibility.ipp_west && filterx.push("Detail Pane.Exit.West.IPP");
    columnVisibility.others_west_exit && filterx.push("Detail Pane.Exit.West.Others");
    columnVisibility.egat_east_west && filterx.push("Detail Pane.Exit.East-West.EGAT");
    columnVisibility.ipp_east_west && filterx.push("Detail Pane.Exit.East-West.IPP");
    columnVisibility.others_east_west_exit && filterx.push("Detail Pane.Exit.East-West.Others");
    columnVisibility.east_f2andg && filterx.push("Detail Pane.Exit.F2&G.East");
    columnVisibility.west_f2andg && filterx.push("Detail Pane.Exit.F2&G.West");
    columnVisibility.east_e && filterx.push("Detail Pane.Exit.E.East");
    columnVisibility.west_e && filterx.push("Detail Pane.Exit.E.West");

    const body = {
        bodys: specificData,
        // filter: output
        filter: filterx,
        // filter: [
        //     "Publicate",
        //     "Gas Day",
        //     "Gas Hour",
        //     "Timestamp",
        //     "Summary Pane.Shipper Name",
        //     "Summary Pane.Plan / Actual",
        //     "Summary Pane.Contract Code",
        //     "Summary Pane.Total Entry (MMBTU/D).East",
        //     "Summary Pane.Total Entry (MMBTU/D).West",
        //     "Summary Pane.Total Entry (MMBTU/D).East-West",
        //     "Summary Pane.Total Exit (MMBTU/D).East",
        //     "Summary Pane.Total Exit (MMBTU/D).West",
        //     "Summary Pane.Total Exit (MMBTU/D).East-West",
        //     "Summary Pane.Imbalance Zone (MMBTU/D).East",
        //     "Summary Pane.Imbalance Zone (MMBTU/D).West",
        //     "Summary Pane.Imbalance Zone (MMBTU/D).Total",
        //     "Summary Pane.Instructed Flow (MMBTU/D).East",
        //     "Summary Pane.Instructed Flow (MMBTU/D).West",
        //     "Summary Pane.Instructed Flow (MMBTU/D).East-West",
        //     "Summary Pane.Shrinkage Volume (MMBTU/D).East",
        //     "Summary Pane.Shrinkage Volume (MMBTU/D).West",
        //     "Summary Pane.Park (MMBTU/D).East",
        //     "Summary Pane.Park (MMBTU/D).West",
        //     "Summary Pane.Unpark (MMBTU/D).East",
        //     "Summary Pane.Unpark (MMBTU/D).West",
        //     "Summary Pane.SOD Park (MMBTU/D).East",
        //     "Summary Pane.SOD Park (MMBTU/D).West",
        //     "Summary Pane.EOD Park (MMBTU/D).East",
        //     "Summary Pane.EOD Park (MMBTU/D).West",
        //     "Summary Pane.Change Min Inventory (MMBTU/D).East",
        //     "Summary Pane.Change Min Inventory (MMBTU/D).West",
        //     "Summary Pane.Reserve Bal. (MMBTU/D).East",
        //     "Summary Pane.Reserve Bal. (MMBTU/D).West",
        //     "Summary Pane.Adjust Imbalance (MMBTU/D).East", 
        //     "Summary Pane.Adjust Imbalance (MMBTU/D).West",
        //     "Summary Pane.Vent Gas.East",
        //     "Summary Pane.Vent Gas.West",
        //     "Summary Pane.Commissioning Gas.East",
        //     "Summary Pane.Commissioning Gas.West",
        //     "Summary Pane.Other Gas.East",
        //     "Summary Pane.Other Gas.West",
        //     "Summary Pane.Daily IMB (MMBTU/D).East",
        //     "Summary Pane.Daily IMB (MMBTU/D).West",
        //     "Summary Pane.AIP (MMBTU/D).Total",
        //     "Summary Pane.AIN (MMBTU/D).Total",
        //     "Summary Pane.%Imb.Total",
        //     "Summary Pane.%Absimb.Total",
        //     "Summary Pane.Acc. IMB. (MONTH) (MMBTU/D).East",
        //     "Summary Pane.Acc. IMB. (MONTH) (MMBTU/D).West",
        //     "Summary Pane.Acc. IMB. (MMBTU/D).East",
        //     "Summary Pane.Acc. IMB. (MMBTU/D).West",
        //     "Summary Pane.Min. (MMBTU/D).East",
        //     "Summary Pane.Min. (MMBTU/D).West",

        //     "Detail Pane.Entry.East.GSP",
        //     "Detail Pane.Entry.East.Bypass GSP",
        //     "Detail Pane.Entry.East.LNG",
        //     "Detail Pane.Entry.East.Others",
        //     "Detail Pane.Entry.West.YDN",
        //     "Detail Pane.Entry.West.YTG",
        //     "Detail Pane.Entry.West.ZTK",
        //     "Detail Pane.Entry.West.Others",
        //     "Detail Pane.Entry.East-West.RA6 East",
        //     "Detail Pane.Entry.East-West.RA6 West",
        //     "Detail Pane.Entry.East-West.BVW10 East",
        //     "Detail Pane.Entry.East-West.BVW10 West",
        //     "Detail Pane.Exit.East.EGAT",
        //     "Detail Pane.Exit.East.IPP",
        //     "Detail Pane.Exit.East.Others",
        //     "Detail Pane.Exit.West.EGAT",
        //     "Detail Pane.Exit.West.IPP",
        //     "Detail Pane.Exit.West.Others",
        //     "Detail Pane.Exit.East-West.EGAT",
        //     "Detail Pane.Exit.East-West.IPP",
        //     "Detail Pane.Exit.East-West.Others",
        //     "Detail Pane.Exit.F2&G.East",
        //     "Detail Pane.Exit.F2&G.West",
        //     "Detail Pane.Exit.E.East",
        //     "Detail Pane.Exit.E.West"
        // ]
    };

    postExport(path, body)

};

export const exportIntradayBaseInvenShipper = async (path: any, data: any, columnVisibility?: any, initialColumns?: any, specificData?: any) => {

    // {
    //     "bodys": {
    //         "gas_day":"2025-05-02", // YYYY-MM-DD ต้องส่ง
    //         "zone":"EAST", // ไม่เลือก ส่ง ว่าง ""
    //         "mode":"E3", // ไม่เลือก ส่ง ว่าง ""
    //         "timestamp":"1739996400", // ไม่เลือก ส่ง ว่าง "" จาก execute_timestamp

    //         // "start_date":"2025-05-02",
    //         // "end_date":"2025-05-02",
    //         "start_date":"2025-01-01", //จริงๆต้องส่งเหมือน gas_day แต่ mock eviden ต้อง fix วันนี้ไว้
    //         "end_date":"2025-02-28", //จริงๆต้องส่งเหมือน gas_day แต่ mock eviden ต้อง fix วันนี้ไว้
    //         "skip":100,
    //         "limit":100
    //     },
    //     "filter": [
    //     ]
    // }
     

    const output = initialColumns?.filter((item: any) => columnVisibility[item.key] && item.key !== "action")?.map((item: any) => item.label);

    const body = {
        bodys: specificData,
        // filter: output
        filter: [
            "Gas Day",
            "Gas Hour",
            "Timestamp",
            "Zone",
            "Mode",
            "Shipper Name",
            "HV (BTU/SCF)",
            "Base Inventory Value (MMBTU)",
            "High Max (MMBTU)",
            "High Difficult Day (MMBTU)",
            "High Red (MMBTU)",
            "High Orange (MMBTU)",
            "Alert High (MMBTU)",
            "Alert Low (MMBTU)",
            "Low Orange (MMBTU)",
            "Low Red (MMBTU)",
            "Low Difficult Day (MMBTU)",
            "Low Max (MMBTU)"
        ]
    };
     

    postExport(path, body)

};

export const exportBalanceIntradayDashboard = async (path: any, data: any, columnVisibility?: any, initialColumns?: any, specificData?: any) => {

    // {
    //     "bodys": {
    //         "gas_day": "2025-02-28", // fixed ไว้ ของ mock eviden
    //         "skip": 0, // fixed ไว้ ของ mock eviden
    //         "limit": 100, // fixed ไว้ ของ mock eviden
    //         "shipper_id": null, // NGP-S01-002 str ไม่มีใส่ null
    //         "execute_timestamp": null // 1740687600 int ไม่มีใส่ null
    //     },
    //     "filter": [ // ยังไม่ได้กรอกจริง ไม่ต้องส่งมาก็ได้
    //     ]
    // }

    const output = initialColumns?.filter((item: any) => columnVisibility[item.key] && item.key !== "action")?.map((item: any) => item.label);
    const body = {
        bodys: specificData,
        // filter: output
        filter: [
            "Time",
            "Plan/Actual", //fixed ต้องมี

            "Entry(MMBTU)",
            "Entry(MMBTU).East",
            "Entry(MMBTU).West",
            "Entry(MMBTU).East-West",

            "Exit(MMBTU)",
            "Exit(MMBTU).East",
            "Exit(MMBTU).West",
            "Exit(MMBTU).East-West",

            "Balancing Gas",
            "Balancing Gas.East",
            "Balancing Gas.West",
            "Balancing Gas.East-West",

            "Park/Unpark",
            "Park/Unpark.East",
            "Park/Unpark.West",

            "RA#6",
            "RA#6.Ratio",

            "BVW#10",
            "BVW#10.Ratio",

            "Shrinkage Gas & Others",
            "Shrinkage Gas & Others.East",
            "Shrinkage Gas & Others.West",
            "Shrinkage Gas & Others.East-West",

            "Change Min. Inventory",
            "Change Min. Inventory.East",
            "Change Min. Inventory.West",
            "Change Min. Inventory.East-West",

            "Imbalance",
            "Imbalance.East",
            "Imbalance.West",

            "Acc Imbalance (Meter) (MMBTU)",
            "Acc Imbalance (Meter) (MMBTU).East",
            "Acc Imbalance (Meter) (MMBTU).West",

            "Acc Imbalance (Inventory) (MMBTU)",
            "Acc Imbalance (Inventory) (MMBTU).East",
            "Acc Imbalance (Inventory) (MMBTU).West",

            "Total Imbalance",
            "% Total Imbalance",

            "System Level (East)",
            "System Level (East).Level",
            "System Level (East).%",

            "Order (East)",
            "Order (East).MMBTU",
            "Order (East).MMSCF",

            "System Level (West)",
            "System Level (West).Level",
            "System Level (West).%",

            "Order (West)",
            "Order (West).MMBTU",
            "Order (West).MMSCF",

            "Condition East",
            "Condition West"
        ]
    };
     
     
    postExport(path, body)

};

export const exportBalanceIntradayDashboardShipper = async (path: any, data: any, columnVisibility?: any, initialColumns?: any, specificData?: any) => {

    // {
    //     "bodys": {
    //         "gas_day": "2025-02-28", // fixed ไว้ ของ mock eviden
    //         "skip": 0, // fixed ไว้ ของ mock eviden
    //         "limit": 100, // fixed ไว้ ของ mock eviden
    //         "shipper_id": null, // NGP-S01-002 str ไม่มีใส่ null
    //         "execute_timestamp": null // 1740687600 int ไม่มีใส่ null
    //     },
    //     "filter": [ // ยังไม่ได้กรอกจริง ไม่ต้องส่งมาก็ได้
    //     ]
    // }

    const output = initialColumns?.filter((item: any) => columnVisibility[item.key] && item.key !== "action")?.map((item: any) => item.label);
    const body = {
        bodys: specificData,
        // filter: output
        filter: [
            "Time",
            "Plan/Actual", //fixed ต้องมี

            "Entry(MMBTU)",
            "Entry(MMBTU).East",
            "Entry(MMBTU).West",
            "Entry(MMBTU).East-West",

            "Exit(MMBTU)",
            "Exit(MMBTU).East",
            "Exit(MMBTU).West",
            "Exit(MMBTU).East-West",

            "Balancing Gas",
            "Balancing Gas.East",
            "Balancing Gas.West",
            "Balancing Gas.East-West",

            "Park/Unpark",
            "Park/Unpark.East",
            "Park/Unpark.West",

            "RA#6",
            "RA#6.Ratio",

            "BVW#10",
            "BVW#10.Ratio",

            "Shrinkage Gas & Others",
            "Shrinkage Gas & Others.East",
            "Shrinkage Gas & Others.West",
            "Shrinkage Gas & Others.East-West",

            "Change Min. Inventory",
            "Change Min. Inventory.East",
            "Change Min. Inventory.West",
            "Change Min. Inventory.East-West",

            "Imbalance",
            "Imbalance.East",
            "Imbalance.West",

            "Acc Imbalance (Meter) (MMBTU)",
            "Acc Imbalance (Meter) (MMBTU).East",
            "Acc Imbalance (Meter) (MMBTU).West",

            // Export แล้ว Column Acc.Imbalance Invent เกินมา ที่เมนูนี้ไม่มี column นี้ https://app.clickup.com/t/86eujrgnt
            // "Acc Imbalance (Inventory) (MMBTU)",
            // "Acc Imbalance (Inventory) (MMBTU).East",
            // "Acc Imbalance (Inventory) (MMBTU).West",

            "Total Imbalance",
            "% Total Imbalance",

            "System Level (East)",
            "System Level (East).Level",
            "System Level (East).%",

            "Order (East)",
            "Order (East).MMBTU",
            "Order (East).MMSCF",

            "System Level (West)",
            "System Level (West).Level",
            "System Level (West).%",

            "Order (West)",
            "Order (West).MMBTU",
            "Order (West).MMSCF",

            "Condition East",
            "Condition West"
        ]
    };
     
     
    postExport(path, body)

};


export const exportBalanceIntradayAccImbDashboard = async (path: any, data: any, columnVisibility?: any, initialColumns?: any, specificData?: any, fileName?: string) => {

    const body = {
        bodys: specificData,
        filter: [
            "Info",
            "Date",
            // "00:00",
            // "01:00",
            // "02:00",
            "03:00",
            // "04:00",
            // "05:00",
            "06:00",
            // "07:00",
            // "08:00",
            "09:00",
            // "10:00",
            // "11:00",
            "12:00",
            // "13:00",
            // "14:00",
            "15:00",
            // "16:00",
            // "17:00",
            "18:00",
            // "19:00",
            // "20:00",
            "21:00",
            // "22:00",
            // "23:00",
            "24:00"
        ]
    }
     
     
    postExport(path, body, fileName)

};

export const exportMeteringChecking = async (path: any, data: any, columnVisibility?: any, initialColumns?: any, specificData?: any) => {

    // {
    //     "gasDay": "2025-03-30",
    //     "filter": [
    //         "Gas Day",
    //         "Metering Point ID",
    //         "00:00",
    //         "01:00",
    //         "02:00",
    //         "03:00",
    //         "04:00",
    //         "05:00",
    //         "06:00",
    //         "07:00",
    //         "08:00",
    //         "09:00",
    //         "10:00",
    //         "11:00",
    //         "12:00",
    //         "13:00",
    //         "14:00",
    //         "15:00",
    //         "16:00",
    //         "17:00",
    //         "18:00",
    //         "19:00",
    //         "20:00",
    //         "21:00",
    //         "22:00",
    //         "23:00",
    //         "24:00"
    //     ]
    // }

    const output = initialColumns?.filter((item: any) => columnVisibility[item.key] && item.key !== "action")?.map((item: any) => item.label);
    const body = {
        gasDay: specificData,
        filter: output

    };

    postExport(path, body)
};

export const exportBalanceReport = async (path: any, data: any, columnVisibility?: any, initialColumns?: any, specificData?: any) => {

    // {
    //     "bodys": {
    //         "start_date": "2025-01-01", // fix วันนี้ไว้
    //         "end_date": "2025-02-28", // fix วันนี้ไว้
    //         "skip": 100,
    //         "limit": 100
    //     },
    //     "filter": [ // ยังไม่ได้กรอกจริง ไม่ต้องส่งมาก็ได้
    //         "Gas Day",
    //         "Summary Pane.Shipper Name",
    //         "Summary Pane.Contract Code",
    //         "Summary Pane.Total Entry (MMBTU/D).East",
    //         "Summary Pane.Total Entry (MMBTU/D).West",
    //         "Summary Pane.Total Entry (MMBTU/D).East-West",
    //         "Summary Pane.Total Exit (MMBTU/D).East",
    //         "Summary Pane.Total Exit (MMBTU/D).West",
    //         "Summary Pane.Total Exit (MMBTU/D).East-West",
    //         "Summary Pane.Imbalance Zone (MMBTU/D).East",
    //         "Summary Pane.Imbalance Zone (MMBTU/D).West",
    //         "Summary Pane.Imbalance Zone (MMBTU/D).Total",
    //         "Summary Pane.Instructed Flow (MMBTU/D).East",
    //         "Summary Pane.Instructed Flow (MMBTU/D).West",
    //         "Summary Pane.Instructed Flow (MMBTU/D).East-West",
    //         "Summary Pane.Shrinkage Volume (MMBTU/D).East",
    //         "Summary Pane.Shrinkage Volume (MMBTU/D).West",
    //         "Summary Pane.Park (MMBTU/D).East",
    //         "Summary Pane.Park (MMBTU/D).West",
    //         "Summary Pane.Unpark (MMBTU/D).East",
    //         "Summary Pane.Unpark (MMBTU/D).West",
    //         "Summary Pane.SOD Park (MMBTU/D).East",
    //         "Summary Pane.SOD Park (MMBTU/D).West",
    //         "Summary Pane.EOD Park (MMBTU/D).East",
    //         "Summary Pane.EOD Park (MMBTU/D).West",
    //         "Summary Pane.Min. Inventory Change (MMBTU/D).East",
    //         "Summary Pane.Min. Inventory Change (MMBTU/D).West",
    //         "Summary Pane.Reserve Bal. (MMBTU/D).East",
    //         "Summary Pane.Reserve Bal. (MMBTU/D).West",
    //         "Summary Pane.Adjust Imbalance (MMBTU/D).East",
    //         "Summary Pane.Adjust Imbalance (MMBTU/D).West",
    //         "Summary Pane.Vent Gas.East",
    //         "Summary Pane.Vent Gas.West",
    //         "Summary Pane.Commissioning Gas.East",
    //         "Summary Pane.Commissioning Gas.West",
    //         "Summary Pane.Other Gas.East",
    //         "Summary Pane.Other Gas.West",
    //         "Summary Pane.Daily IMB (MMBTU/D).East",
    //         "Summary Pane.Daily IMB (MMBTU/D).West",
    //         "Summary Pane.AIP (MMBTU/D).Total",
    //         "Summary Pane.AIN (MMBTU/D).Total",
    //         "Summary Pane.%Imb.Total",
    //         "Summary Pane.%Absimb.Total",
    //         "Summary Pane.Acc. IMB. (MONTH) (MMBTU/D).East",
    //         "Summary Pane.Acc. IMB. (MONTH) (MMBTU/D).West",
    //         "Summary Pane.Acc. IMB. (MMBTU/D).East",
    //         "Summary Pane.Acc. IMB. (MMBTU/D).West",
    //         "Summary Pane.Min. (MMBTU/D).East",
    //         "Summary Pane.Min. (MMBTU/D).West",
    //         "Detail Pane.Entry.East.GSP",
    //         "Detail Pane.Entry.East.Bypass GSP",
    //         "Detail Pane.Entry.East.LNG",
    //         "Detail Pane.Entry.East.Others",
    //         "Detail Pane.Entry.West.YDN",
    //         "Detail Pane.Entry.West.YTG",
    //         "Detail Pane.Entry.West.ZTK",
    //         "Detail Pane.Entry.West.Others",
    //         "Detail Pane.Entry.East-West.RA6 East",
    //         "Detail Pane.Entry.East-West.RA6 West",
    //         "Detail Pane.Entry.East-West.BVW10 East",
    //         "Detail Pane.Entry.East-West.BVW10 West",
    //         "Detail Pane.Exit.East.EGAT",
    //         "Detail Pane.Exit.East.IPP",
    //         "Detail Pane.Exit.East.Others",
    //         "Detail Pane.Exit.West.EGAT",
    //         "Detail Pane.Exit.West.IPP",
    //         "Detail Pane.Exit.West.Others",
    //         "Detail Pane.Exit.East-West.EGAT",
    //         "Detail Pane.Exit.East-West.IPP",
    //         "Detail Pane.Exit.East-West.Others",
    //         "Detail Pane.Exit.F2&G.East",
    //         "Detail Pane.Exit.F2&G.West",
    //         "Detail Pane.Exit.E.East",
    //         "Detail Pane.Exit.E.West"
    //     ]
    // }

    const output = initialColumns?.filter((item: any) => columnVisibility[item.key] && item.key !== "action")?.map((item: any) => item.label);

    const body = {
        bodys: specificData,
        // filter: output
        filter: []
    };
     
    postExport(path, body)
};


export const exportDailyAdjustSummary = async (path: any, data: any, columnVisibility?: any, initialColumns?: any, specificData?: any) => {
     

    const output = initialColumns
        .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
        .map((item: any) => item.label);

    const updatedOutput = output.map((item: any) => {
        return item === "Total" ? "totalH1ToH24Adjust" : item;
    });

    // ลบ 00:00 - 01:00 หลัง H1
    // const cleanedOutput = output.map((item:any) => {
    //     const match = item.match(/^(H\d+)\s/);
    //     return match ? match[1] : item;
    // });

    const body = {
        checkAdjustment: specificData?.checkAdjustment, // true adjust YES only 
        startDate: specificData?.startDate, // 27/03/2025 จะมี ข้อมูล YES ในเครื่อง SIT
        endDate: specificData?.endDate,
        contractCode: specificData?.contractCode, // ถ้าไม่ส่ง ให้ null หรือ ""
        filter: output
    };
    postExport(path, body)
};

export const exportAllocationMonthlyReportDownload = async (path: any, data: any, columnVisibility?: any, initialColumns?: any, type?: any, seletedId?: any, specificData?: any) => {
     
    const formattedDate = dayjs(specificData).format('YYYY-MM-DD');

    const output = initialColumns
        .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
        .map((item: any) => item.label);

    const body = {
        bodys: specificData,
        filter: output
    };
    postExport(path, body)
};

export const exportBalancingMonthlyReportDownload = async (path: any, data: any, columnVisibility?: any, initialColumns?: any, type?: any, seletedId?: any, specificData?: any) => {

    // {
    //     "bodys": {
    //      "idAr":[1]
    //     },
    //     "filter": [
    //         "Month",
    //         "Contract Code",
    //         "File",
    //         "Report Version",
    //         "Type Report",
    //         "Approved By"
    //     ]
    // }

    const output = initialColumns
        .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
        .map((item: any) => item.label);

    const body = {
        bodys: specificData,
        filter: output
    };
    postExport(path, body)
};


export const exportMeteringRetriving = async (path: any, data: any, columnVisibility?: any, initialColumns?: any, type?: any, seletedId?: any, specificData?: any) => {

    // {
    //     "bodys":{
    //         "limit":100,
    //         "offset":0,
    //         "startDate":"2025-06-27",
    //         "endDate":"2025-06-30",
    //         "metered_run_number_id": 6451
    //     },
    //     "filter": [
    //         "Gas Day",
    //         "Metering Retrieving ID",
    //         "Metering Point ID",
    //         "Energy (MMBTU)",
    //         "Timestamp",
    //         "Error Description"
    //     ]
    // }

    const output = initialColumns
        .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
        .map((item: any) => item.label);

    const body = {
        bodys: specificData,
        filter: output
    };

    postExport(path, body)
};

export const exportMeteringDataCheck = async (path: any, data: any, columnVisibility?: any, initialColumns?: any, type?: any, seletedId?: any, specificData?: any) => {

    // {
    //     "bodys":{
    //         "limit":100,
    //         "offset":0,
    //         "metered_run_number_id": 6451
    //     },
    //     "filter": [
    //         "Metering Point ID",
    //         "Met.Point Description"
    //     ]
    // }

    const output = initialColumns
        .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
        .map((item: any) => item.label);

    const body = {
        bodys: specificData,
        filter: output
    };

    postExport(path, body)
};


export const exportEventOffspecGas = async (path: any, data: any, columnVisibility?: any, initialColumns?: any, type?: any, seletedId?: any, specificData?: any) => {

    // {
    //     "bodys": {
    //         "eventCode": "",
    //         "eventDateFrom": "2025-08-13",
    //         "eventDateTo": "2025-08-13",
    //         "EventStatus": "",
    //         "offset": 0,
    //         "limit": 10
    //     },
    // "filter": [
    //   "Event Code",
    //   "Event Date",

    //   "Document 1",
    //   "Document 1.Status", // ถ้ามี Document 1
    //   "Document 2",
    //   "Document 2.Shipper", // ถ้ามี Document 2
    //   "Document 3",
    //   "Document 3.Shipper", // ถ้ามี Document 3
    //   "Created by",
    //   "Event Status"

    // ]
    // }

    let output = initialColumns
        .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
        .map((item: any) => item.label);

    const removeList = ["Info", "Status", "Shipper"];
    output = output.filter((item: any) => !removeList.includes(item));

    // 2. เตรียม array ใหม่สำหรับผลลัพธ์สุดท้าย
    let finalOutput: any = [];

    output.forEach((item: any) => {
        if (item === "Document 1") {
            finalOutput.push(item, "Document 1.Status");
        } else if (item === "Document 2") {
            finalOutput.push(item, "Document 2.Shipper");
        } else if (item === "Document 3") {
            finalOutput.push(item, "Document 3.Shipper");
        } else {
            finalOutput.push(item);
        }
    });

    const body = {
        bodys: specificData,
        filter: finalOutput
    };

     
    postExport(path, body)
};


export const exportEventEmergencyDiffDay = async (path: any, data: any, columnVisibility?: any, initialColumns?: any, type?: any, seletedId?: any, specificData?: any) => {

    // {
    //     "bodys": {
    //         "eventCode": "",
    //         "eventDateFrom": "2025-01-01",
    //         "eventDateTo": "2025-08-15",
    //         "EventStatus": "",
    //         "offset": 0,
    //         "limit": 10
    //     },
    //     "filter": [
    //       "Event Code",
    //       "Event Date",

    //       "Document 3.9",
    //       "Document 3.9.Shipper",
    //       "Document 3.9.Status",
    //       "Document 3.9.Acknowledge",
    //       "Document 4",
    //       "Document 4.Shipper",
    //       "Document 4.Status",
    //       "Document 4.Acknowledge",
    //       "Document 5",
    //       "Document 5.Shipper",
    //       "Document 5.Status",
    //       "Document 5.Acknowledge",
    //       "Document 6",
    //       "Document 6.Shipper",
    //       "Document 6.Status",
    //       "Document 6.Acknowledge",
    //       "Created by",
    //       "Event Status"

    //     ]
    // }

    let output = initialColumns
        .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
        .map((item: any) => item.label);

    const removeList = ["Info", "Status", "Shipper"];
    output = output.filter((item: any) => !removeList.includes(item));

    // 2. เตรียม array ใหม่สำหรับผลลัพธ์สุดท้าย
    let finalOutput: any = [];

    output.forEach((item: any) => {
        if (item === "Document 3.9") {
            finalOutput.push(item, "Document 3.9.Shipper", "Document 3.9.Status", "Document 3.9.Acknowledge");
            // finalOutput.push("Document 3.9.Status");
            // finalOutput.push("Document 3.9.Acknowledge");
        } else if (item === "Document 4") {
            finalOutput.push(item, "Document 4.Shipper", "Document 4.Status", "Document 4.Acknowledge");
            // finalOutput.push("Document 4.Status");
            // finalOutput.push("Document 4.Acknowledge");
        } else if (item === "Document 5") {
            finalOutput.push(item, "Document 5.Shipper", "Document 5.Status", "Document 5.Acknowledge");
            // finalOutput.push("Document 5.Status");
            // finalOutput.push("Document 5.Acknowledge");
        } else if (item === "Document 6") {
            finalOutput.push(item, "Document 6.Shipper", "Document 6.Status", "Document 6.Acknowledge");
            // finalOutput.push("Document 6.Status");
            // finalOutput.push("Document 6.Acknowledge");
        } else {
            finalOutput.push(item);
        }
    });

    const body = {
        bodys: specificData,
        filter: finalOutput
    };

     
    postExport(path, body)
};

export const exportEventOfo = async (path: any, data: any, columnVisibility?: any, initialColumns?: any, type?: any, seletedId?: any, specificData?: any) => {

    // {
    //     "bodys": {
    //         "eventCode": "",
    //         "eventDateFrom": "2025-01-01",
    //         "eventDateTo": "2025-08-15",
    //         "EventStatus": "",
    //         "offset": 0,
    //         "limit": 10
    //     },
    //     "filter": [
    //       "Event Code",
    //       "Event Date",

    //       "Document 7",
    //       "Document 7.Shipper",
    //       "Document 7.Status",
    //       "Document 7.Acknowledge",
    //       "Document 8",
    //       "Document 8.Shipper",
    //       "Document 8.Status",
    //       "Document 8.Acknowledge",

    //       "Created by",
    //       "Event Status"

    //     ]
    // }

    let output = initialColumns
        .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
        .map((item: any) => item.label);

    const removeList = ["Info", "Status", "Shipper"];
    output = output.filter((item: any) => !removeList.includes(item));

    // 2. เตรียม array ใหม่สำหรับผลลัพธ์สุดท้าย
    let finalOutput: any = [];

    output.forEach((item: any) => {
        if (item === "Document 7") {
            finalOutput.push(item, "Document 7.Shipper", "Document 7.Status", "Document 7.Acknowledge");
        } else if (item === "Document 8") {
            finalOutput.push(item, "Document 8.Shipper", "Document 8.Status", "Document 8.Acknowledge");
        } else {
            finalOutput.push(item);
        }
    });

    const body = {
        bodys: specificData,
        filter: finalOutput
    };

     
    postExport(path, body)
};


export const exportTariffChargeReportMain = async (path: any, data: any, columnVisibility?: any, initialColumns?: any, type?: any, seletedId?: any, specificData?: any) => {

    // "bodys": {
    //     "month_year_charge": "", // 2025-08-01
    //     "id": "", 
    //     "offset": 0,
    //     "limit": 10
    // },
    // "filter": [
    //   "Tariff ID",
    //   "Shipper Name",
    //   "Month/Year Charge",
    //   "Type",
    //   "Timestamp",
    //   "Invoice Sent",
    //   "Comment",
    //   "Created By",
    //   "Updated By"
    // ]

    // let flat_map_id = seletedId.flatMap((item: any) => item?.id)

    let output = initialColumns
        .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
        .map((item: any) => item.label);

    // 2. เตรียม array ใหม่สำหรับผลลัพธ์สุดท้าย

    const body = {
        bodys: specificData,
        filter: output
    };

     
    postExport(path, body)
};


export const exportTariffCreditDebitNote = async (path: any, data: any, columnVisibility?: any, initialColumns?: any, type?: any, seletedId?: any, specificData?: any) => {

    // {
    //     "bodys": { 
    //         "shipper_id": "",
    //         "month_year_charge": "", // 2025-08-01
    //         "cndn_id": "",
    //         "tariff_credit_debit_note_type_id": "", 
    //         "tariff_type_charge_id": "", 
    //         "offset": 0,
    //         "limit": 10
    //     },
    //     "filter": [
    //       "Shipper Name",
    //       "Month/Year",
    //       "CNCD ID",
    //       "Type Charge",
    //       "CNCD Type",
    //       "Comment"
    //     ]
    // }

    let output = initialColumns
        .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
        .map((item: any) => item.label);

    // 2. เตรียม array ใหม่สำหรับผลลัพธ์สุดท้าย
    const body = {
        bodys: specificData,
        filter: output
    };

     
    postExport(path, body)
};


export const exportMeteringManagement = async (path: any, data: any, columnVisibility?: any, initialColumns?: any, type?: any, startDate?: any, endDate?: any) => {
    // {
    //     "share": null,
    //     "start_date": "2025-03-10",
    //     "end_date": "2026-03-20",
    //     "filter": [
    //         "Gas Day",
    //         "Metering Point ID",
    //         "Zone",
    //         "Area",
    //         "Customer Type",
    //         "Volume (MMSCF)",
    //         "Heating Value (BTU/SCF)",
    //         "Energy (MMBTU)",
    //         "Received Timestamp",
    //         "TPA Insert Timestamp",
    //         "Metering Retrieving ID",
    //         "Source"
    //     ]
    // }

    const output = initialColumns
        .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
        .map((item: any) => item.label);

    try {
        const body = {
            share: null,
            // start_date: "2025-03-10",
            // end_date: "2026-03-20",
            start_date: startDate && dayjs(startDate).format('YYYY-MM-DD'),
            end_date: endDate && dayjs(endDate).format('YYYY-MM-DD'),
            filter: output
        };
         
        postExport(path, body)

    } catch (error) {
        // Export error occurred
    }
};

export const exportSummaryNomReport = async (path: any, data: any, columnVisibility?: any, initialColumns?: any, type?: any, specificData?: any) => {
    const output = initialColumns
        .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
        .map((item: any) => item.label);

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const cleanedOutput = output.map((item: any) => {
        return item.match(/^H\d+\s/) ? item.split(' ')[0] : item;
    });

    // R1 : แถบ Weekly > Nomination > MMSCF : Export ยังไม่ตรงกับหน้า UI https://app.clickup.com/t/86et68p7e
    // ตรง weekly หัววัน Sunday ใส่วันมาตอส export ให้ด้วยพี่ "Sunday 20/02/2025" แบบนี้

    // แก้ไข updatedCleanOutput ให้จับจากคำ Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday
    // แล้วเติมวันที่แทน ตามฟังก์ชั่นปัจจุบัน
    // ORIGINAL
    const updatedCleanOutput = cleanedOutput.map((item: any, index: any) => {
        if (index === 0) return item; // "Nomination Point"

        const dateIndex = Math.floor((index - 1) / 2);
        const dayName = cleanedOutput[index - (index % 2 === 0 ? 1 : 0)];

        if (index % 2 === 1) {
            // Weekday label: append date
            return `${item} ${specificData[dateIndex]}`;
        } else {
            // Utilization label: prefix weekday
            return `${dayName} Utilization (%)`;
        }
    });

    const updatedOutput = [];

    for (let i = 0; i < updatedCleanOutput.length; i++) {
        const current = updatedCleanOutput[i];
        const next = updatedCleanOutput[i + 1];

        // If current is a day and next is Utilization (%)
        if (days.includes(current) && next === "Utilization (%)") {

            updatedOutput.push(current);
            // updatedOutput.push(`${current} `);
            updatedOutput.push(`${current} Utilization (%)`);
            i++; // Skip next since it's already added
        } else {
            updatedOutput.push(current);
        }
    }

    try {
        const body = {
            key: type,
            gas_day_text: specificData?.[0],
            filter: updatedOutput
        };
         
        postExport(path, body)

    } catch (error) {
        // Export error occurred
    }
};


export const exportSummaryNomReportDailyTotalSystem = async (path: any, data: any, columnVisibility?: any, initialColumns?: any, type?: any, specificData?: any) => {

    const output = initialColumns
        .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
        .map((item: any) => item.label);

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const cleanedOutput = output.map((item: any) => {
        return item.match(/^H\d+\s/) ? item.split(' ')[0] : item;
    });

    const UpdatedFilter = cleanedOutput.map((h: any) => (h === "Total cap" ? "Total" : h)); // Total แทน Total Cap

    try {
        const body = {
            key: type,
            gas_day_text: specificData ? specificData : dayjs().format("DD/MM/YYYY"),
            // gas_day_text: '01/09/2025',
            // filter: cleanedOutput
            filter: UpdatedFilter
        };
         
        postExport(path, body)

    } catch (error) {
        // Export error occurred
    }
};


export const exportSummaryNomReportDailyArea = async (path: any, data: any, columnVisibility?: any, initialColumns?: any, type?: any, specificData?: any) => {
    const output = initialColumns
        .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
        .map((item: any) => item.label);

    const cleanedOutput = output.map((item: any) => {
        return item.match(/^H\d+\s/) ? item.split(' ')[0] : item;
    });

    // Daily > Area > MMBTU > Export Column Nomination Point เกินมา https://app.clickup.com/t/86etzchek
    const cleanedOutput2 = cleanedOutput.filter((item: any) => item !== "Nomination Point");

    try {
        const body = {
            key: type,
            gas_day_text: specificData,
            filter: cleanedOutput2
        };
         
        postExport(path, body)

    } catch (error) {
        // Export error occurred
    }
};

export const exportSummaryNomReportAllNom = async (path: any, data: any, columnVisibility?: any, initialColumns?: any, type?: any, specificData?: any) => {

    const output = initialColumns
        .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
        .map((item: any) => item.label);
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const cleanedOutput = output.map((item: any) => {
        return item.match(/^H\d+\s/) ? item.split(' ')[0] : item;
    });

    // All > Nomination > MMSCF > Excel File Column Total Cap ตัดคำว่า Cap ออก และ Head Column จัดกลาง และข้อมูลใน Row ถ้าเป็นตัวหนังสือชิดซ้าย พวกค่าจัดชิดขวา https://app.clickup.com/t/86euxuwqj
    const UpdatedFilter = cleanedOutput.map((h: any) => (h === "Total cap" ? "Total" : h)); // Total แทน Total Cap

    try {
        const body = {
            key: type,
            gas_day_text: specificData,
            // filter: cleanedOutput
            filter: UpdatedFilter
        };
         
        postExport(path, body)

    } catch (error) {
        // Export error occurred
    }
};

export const exportSummaryNomReportTotalWeekly = async (path: any, data: any, columnVisibility?: any, initialColumns?: any, type?: any, specificData?: any) => {
    const output = initialColumns
        .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
        .map((item: any) => item.label);

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const cleanedOutput = output.map((item: any) => {
        return item.match(/^H\d+\s/) ? item.split(' ')[0] : item;
    });

    const updatedCleanOutput = cleanedOutput.map((item: any, index: any) => {
        if (index === 0 || index === 1 || index === 2 || index === 3 || index === 4 || index === 5 || index === 6 || index === 7 || index === 8 || index === 9) return item; // "Nomination Point"
        const dayName = cleanedOutput[index - (index % 2 === 0 ? 1 : 0)];

        // if (index % 2 === 1) {
        if (index == 10 || index == 12 || index == 14 || index == 16 || index == 18 || index == 20 || index == 22) {
            let date_format

            switch (index) {
                case 10:
                    date_format = `${item} ${specificData[0]}`;
                    return date_format

                case 12:
                    date_format = `${item} ${specificData[1]}`;
                    return date_format

                case 14:
                    date_format = `${item} ${specificData[2]}`;
                    return date_format

                case 16:
                    date_format = `${item} ${specificData[3]}`;
                    return date_format

                case 18:
                    date_format = `${item} ${specificData[4]}`;
                    return date_format

                case 20:
                    date_format = `${item} ${specificData[5]}`;
                    return date_format

                case 22:
                    date_format = `${item} ${specificData[6]}`;
                    return date_format

                default:
                    return date_format
            }
        } else {
            switch (index) {
                case 11:
                    return `${days[0]} Utilization (%)`;

                case 13:
                    return `${days[1]} Utilization (%)`;

                case 15:
                    return `${days[2]} Utilization (%)`;

                case 17:
                    return `${days[3]} Utilization (%)`;

                case 19:
                    return `${days[4]} Utilization (%)`;

                case 21:
                    return `${days[5]} Utilization (%)`;

                case 23:
                    return `${days[6]} Utilization (%)`;

                default:
                    return `${dayName} Utilization (%)`;
            }
        }
    });

    try {
        const body = {
            key: type,
            gas_day_text: specificData?.[0],
            filter: updatedCleanOutput
        };
        postExport(path, body)

    } catch (error) {
        // Export error occurred
    }
};

export const exportSummaryNomReportWeeklyAreaMmbtu = async (path: any, data: any, columnVisibility?: any, initialColumns?: any, type?: any, specificData?: any) => {

    const output = initialColumns
        .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
        .map((item: any) => item.label);

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const cleanedOutput = output.map((item: any) => {
        return item.match(/^H\d+\s/) ? item.split(' ')[0] : item;
    });

    // R1 : แถบ Weekly > Nomination > MMSCF : Export ยังไม่ตรงกับหน้า UI https://app.clickup.com/t/86et68p7e
    // ตรง weekly หัววัน Sunday ใส่วันมาตอส export ให้ด้วยพี่ "Sunday 20/02/2025" แบบนี้


    // แก้ไข updatedCleanOutput ให้จับจากคำ Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday
    // แล้วเติมวันที่แทน ตามฟังก์ชั่นปัจจุบัน
    // ORIGINAL
    const updatedCleanOutput = cleanedOutput.map((item: any, index: any) => {
        // if (index === 0 || index === 1) return item; // "Nomination Point"
        if (index === 0) return item; // "Nomination Point"

        // const dateIndex = Math.floor((index - 1) / 2);
        const dayName = cleanedOutput[index - (index % 2 === 0 ? 1 : 0)];

        // if (index % 2 === 1) {
        if (index == 2 || index == 4 || index == 6 || index == 8 || index == 10 || index == 12 || index == 14) {
            let date_format

            switch (index) {
                case 2:
                    // date_format = `${item} ${specificData[0]}`;
                    date_format = `${item}`;
                    return date_format

                case 4:
                    // date_format = `${item} ${specificData[0]}`;
                    date_format = `${item}`;
                    return date_format

                case 6:
                    // date_format = `${item} ${specificData[1]}`;
                    date_format = `${item}`;
                    return date_format

                case 8:
                    // date_format = `${item} ${specificData[2]}`;
                    date_format = `${item}`;
                    return date_format

                case 10:
                    // date_format = `${item} ${specificData[3]}`;
                    date_format = `${item}`;
                    return date_format

                case 12:
                    // date_format = `${item} ${specificData[4]}`;
                    date_format = `${item}`;
                    return date_format

                case 14:
                    // date_format = `${item} ${specificData[5]}`;
                    date_format = `${item}`;
                    return date_format

                default:
                    return date_format
            }
        } else {
            switch (index) {
                case 3:
                    return `${days[0]} Utilization (%)`;

                case 5:
                    return `${days[0]} Utilization (%)`;

                case 7:
                    return `${days[1]} Utilization (%)`;

                case 9:
                    return `${days[2]} Utilization (%)`;

                case 11:
                    return `${days[3]} Utilization (%)`;

                case 13:
                    return `${days[4]} Utilization (%)`;

                case 15:
                    return `${days[5]} Utilization (%)`;

                default:
                    return `${dayName} Utilization (%)`;
            }

        }
    });

    // Weekly > Area > MMBTU >  Export File Column Nomination Point เกินมา https://app.clickup.com/t/86etzche6
    const cleanedOutput2 = updatedCleanOutput.filter((item: any) => item !== "Nomination Point Utilization (%)");

    try {
        const body = {
            key: type,
            gas_day_text: specificData?.[0],
            filter: cleanedOutput2
        };

        // เอา body.gas_day_text ต่อท้าย body.filter. "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" โดย + วันไปทีละ 1

        const start = dayjs(body.gas_day_text, "DD/MM/YYYY");
        const daysOfWeek = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ];

        // ต่อท้าย gas_day_text + ชื่อวัน (เพิ่มทีละ 1 วัน)
        const withDates = daysOfWeek.map((day, i) => {
            const date = start.add(i, "day").format("DD/MM/YYYY");
            return `${day} ${date}`;
        });

        body.filter = [...body.filter, ...withDates];

        postExport(path, body)

    } catch (error) {
        // Export error occurred
    }
};

export const exportCapacityRightTemplate = async (path: any, data: any, columnVisibility?: any, initialColumns?: any) => {
    // {
    //     "id": [
    //         8,
    //         7,
    //         6,
    //         5
    //     ],
    //     "filter": [
    //         "Term",
    //         "File Recurring Start Date",
    //         "File Period",
    //         "Period Min", ---->
    //         "Period Max", ---->
    //         "Shadow Time",
    //         "Unit",
    //         "Start Date",
    //         "End Date"
    //     ]
    // }

    const output = initialColumns
        .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
        .map((item: any) => item.label);

    try {
        const ids = data.map((item: any) => item.id);
        const body = {
            id: ids,
            filter: output
        };
        postExport(path, body)

    } catch (error) {
        // Export error occurred
    }
};

export const exportBalOperateAndInstruct = async (path: any, data: any, columnVisibility?: any, initialColumns?: any, specificData?: any) => {
    // {
    //     "bodys": {
    //         "gas_day": "2025-02-28", // fixed ไว้ ของ mock eviden
    //         "skip": 0, // fixed ไว้ ของ mock eviden
    //         "limit": 100 // fixed ไว้ ของ mock eviden
    //     },
    //     "filter": [ // ยังไม่ได้กรอกจริง ไม่ต้องส่งมาก็ได้
    //     ]
    // }

    const output = initialColumns
        .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
        .map((item: any) => item.label);

    try {
        // const ids = data.map((item: any) => item.id);
        const body = {
            bodys: specificData,
            filter: output
        };

         
        postExport(path, body)

    } catch (error) {
        // Export error occurred
    }
};

export const exportCapacityReleaseCapacityManagementDetail = async (path: any, data: any, data2: any, columnVisibility?: any, initialColumns?: any) => {
    // Convert array of objects to a single object for easier lookup
    const columnVisibilityMap = columnVisibility.reduce((acc: any, curr: any) => {
        return { ...acc, ...curr };
    }, {});

    const output = initialColumns
        .filter((item: any) => columnVisibilityMap[item.key] && item.key !== "action")
        .map((item: any) => item.label);

    try {
        const body = {
            data: data,
            filter: output
        };

        postExport(path, body)

    } catch (error) {
        // Export error occurred
    }
};

// ใช้กับ path mgn -> view -> export
export const newExportTest = async (path: any, data: any, data2: any, columnVisibility?: any, initialColumns?: any) => {
    const output = initialColumns
        .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
        .map((item: any) => item.label);

    try {
        const ids = data.map((item: any) => item.id);
        const body = {
            id: ids,
            idSub: data2,
            filter: output
        };

        postExport(path, body)

    } catch (error) {
        // Export error occurred
    }
};


export const newExportDivision = async (path: any, data: any, data2: any, columnVisibility?: any, initialColumns?: any) => {
    const output = initialColumns
        .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
        .map((item: any) => item.label);

    const ids = data.map((item: any) => item.id);

    try {
        const ids = data.map((item: any) => item.id);
        const body = {
            id: ids,
            filter: output
        };

        postExport(path, body)

    } catch (error) {
        // Export error occurred
    }
};

export const exportSpecific = async (path: any, data: any, columnVisibility?: any, initialColumns?: any, specificData?: any) => {
    // let arr_of_col_1 = Object.keys(columnVisibility).filter(key => columnVisibility[key] && key !== "action");
    // const filtered = initialColumns.filter((item:any) => arr_of_col_1.includes(item.key));
    // let output = filtered.map((item:any) => item.label);

    const output = initialColumns
        .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
        .map((item: any) => item.label);

    try {
        // const ids = data.map((item: any) => item.id);
        const body = {
            contractCode: parseInt(specificData),
            filter: output
        };
         
        postExport(path, body)

    } catch (error) {
        // Export error occurred
    }
};

export const exportCapaPublic = async (path: any, data: any, columnVisibility?: any, initialColumns?: any, specificData?: any) => {
    try {

        let filteredColumnVisibility = Object.keys(columnVisibility)
            .filter(key => columnVisibility[key] === true)
            .reduce((obj: any, key: any) => {
                obj[key] = columnVisibility[key];
                return obj;
            }, {});

        specificData.filter = [
            ...specificData.filter,
            ...Object.keys(filteredColumnVisibility)
                .filter(key => filteredColumnVisibility[key] === true && !["zone", "area", "avaliable_capacity_mmbtu_d"].includes(key))
                .map(key => key + " ") // Append space to each key
        ];
         
        // postExport(path, body)
        postExport(path, specificData)

    } catch (error) {
        // Export error occurred
    }
};


// #region postExport
const postExport = async (path?: any, body?: any, fileName?: any) => {
    try {
        const tenko = getCookieValue("v4r2d9z5m3h0c1p0x7l");

        if (!tenko) {
            throw new Error('Token is not available');
        }

        // CWE-918 Fix: Validate path parameter before using
        if (!path || typeof path !== 'string') {
            throw new Error('Invalid path parameter');
        }

        // Sanitize path to prevent path traversal
        const sanitizedPath = path.replace(/\.\./g, '').replace(/^\/+/, '');
        const fullPath = `/master/export-files/${sanitizedPath}`;

        // Validate the constructed path
        const { buildSafeApiUrl, isValidApiPath } = await import('@/utils/urlValidator');
        if (!isValidApiPath(fullPath)) {
            throw new Error('Invalid API path detected');
        }

        const safeUrl = buildSafeApiUrl(API_URL, fullPath);
        if (!safeUrl) {
            throw new Error('Failed to construct safe URL');
        }

        // CWE-644 Fix: Validate and sanitize token before using in header
        const { buildSafeAuthHeader } = await import('@/utils/headerValidator');
        const authHeader = buildSafeAuthHeader(tenko);
        if (!authHeader) {
            throw new Error('Invalid authentication token format');
        }

        const response = await fetch(safeUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`Export failed with status ${response.status}`);
        }

        // อ่าน header Content-Disposition
        // const disposition = response.headers.get("content-disposition");
        // let fileNameFromHeader = null;

        // if (disposition && disposition.includes("filename=")) {
        //     // ดึงค่า filename= ออกมา
        //     const fileNameMatch = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        //     if (fileNameMatch && fileNameMatch[1]) {
        //         fileNameFromHeader = fileNameMatch[1].replace(/['"]/g, "");
        //     }
        // }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName || path}.xlsx`; // Specify the file name (adjust extension as needed)
        document.body.appendChild(link);
        link.click();
        link.remove();

    } catch (error) {
        toast.error("Failed to export the file. Please try again.", {
            position: 'bottom-right',
            autoClose: 3000,
        });
    }
}


export const exportTariffChargeReport = async (path: any, body: any, file_name?: any) => {
    postExport(path, body, file_name)
};

// แบงค์บอกไม่ต้องส่ง token
const postExportAllocMonthlyReport = async (path?: any, body?: any) => {
    try {
        // CWE-918 Fix: Validate path parameter before using
        if (!path || typeof path !== 'string') {
            throw new Error('Invalid path parameter');
        }

        // Sanitize path to prevent path traversal
        const sanitizedPath = path.replace(/\.\./g, '').replace(/^\/+/, '');
        const fullPath = `/master/export-files/${sanitizedPath}`;

        // Validate the constructed path
        const { buildSafeApiUrl, isValidApiPath } = await import('@/utils/urlValidator');
        if (!isValidApiPath(fullPath)) {
            throw new Error('Invalid API path detected');
        }

        const safeUrl = buildSafeApiUrl(API_URL, fullPath);
        if (!safeUrl) {
            throw new Error('Failed to construct safe URL');
        }

        // CWE-644 Fix: Sanitize Content-Type header
        const { sanitizeContentType } = await import('@/utils/headerValidator');

        const response = await fetch(safeUrl, {
            method: 'POST',
            headers: {
                'Content-Type': sanitizeContentType('application/json'),
                // 'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`Export failed with status ${response.status}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `${path}.xlsx`; // Specify the file name (adjust extension as needed)
        document.body.appendChild(link);
        link.click();
        link.remove();

    } catch (error) {
        // Export error occurred
    }
}
