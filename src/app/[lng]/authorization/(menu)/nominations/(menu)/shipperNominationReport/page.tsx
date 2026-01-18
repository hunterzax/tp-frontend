"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { exportToExcel, findRoleConfigByMenuName, formatNumberFourDecimal, formatNumberFourDecimalNoComma, formatNumberThreeDecimal, generateUserPermission, getCurrentWeekSundayYyyyMmDd, isAllWeekly, liftWeeklyForDate, mergeDaily_AddOuterAndRowsFromWeekly, toDayjs } from '@/utils/generalFormatter';
import { getService } from "@/utils/postService";
import BtnExport from "@/components/other/btnExport";
import { useFetchMasters } from "@/hook/fetchMaster";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import PaginationComponent from "@/components/other/globalPagination";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import { useAppDispatch } from "@/utils/store/store";
import { fetchShipperGroup } from "@/utils/store/slices/shipperGroupSlice";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import getUserValue from "@/utils/getuserValue";
import ModalComponent from "@/components/other/ResponseModal";
import { decryptData } from "@/utils/encryptionData";
import { Popover, Tab, Tabs } from "@mui/material";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import dayjs from 'dayjs';
import TableSkeleton from "@/components/material_custom/DefaultSkeleton";
import ViewPage from "./form/viewPage/viewPage";
import { InputSearch } from "@/components/other/SearchForm";
import AppTable from "@/components/table/AppTable";
import { ColumnDef } from "@tanstack/react-table";
import BtnActionTable from "@/components/other/btnActionInTable";
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import BtnGeneral from "@/components/other/btnGeneral";

interface ClientProps {
    // params: {
    //     lng: string;
    // };
}

const ClientPage: React.FC<ClientProps> = () => {
    // #region  Check Authen
    const userDT: any = getUserValue();
    const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
    useRestrictedPage(token);

    // #region STATE GENERAL AREA
    const [dataTable, setData] = useState<any>([]);
    const [tk, settk] = useState<boolean>(false);

    // #region REDUX DATA
    const { shipperGroupData } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const dispatch = useAppDispatch();

    // #region PERMISSION
    const [userPermission, setUserPermission] = useState<any>();
    let user_permission: any = localStorage?.getItem("k3a9r2b6m7t0x5w1s8j");
    user_permission = user_permission ? decryptData(user_permission) : null;

    const getPermission = () => {
        try {
            user_permission = user_permission ? JSON.parse(user_permission) : null; // Convert JSON string to object

            if (user_permission?.role_config) {
                const updatedUserPermission = generateUserPermission(user_permission);
                setUserPermission(updatedUserPermission);
            } else {
                const permission = findRoleConfigByMenuName(`Shipper Nomination Report`, userDT)
                setUserPermission(permission);
            }
        } catch (error) {
            // Failed to parse user_permission:
        }
    }

    // ############### CHECK ว่ามาจากหน้า nomination dashboard ป่าว ###############
    const [dashboardObj, setDashboardObj] = useState<any>();

    const checkIsRouted = () => {
        const storedDashboard = localStorage.getItem("nom_dashboard_route_mix_quality_obj");
        const dashboardObject = storedDashboard ? JSON.parse(storedDashboard) : null;

        if (dashboardObject) {
            setDashboardObj(dashboardObject)

            if (dashboardObject?.tab == 'daily') {
                setTabIndex(1)
            } else {
                setTabIndex(2)
            }
        }
    }

    useEffect(() => {
        // checkIsRouted();
        const storedDashboard = localStorage.getItem("nom_dashboard_route_mix_quality_obj");
        if (storedDashboard !== null) {
            checkIsRouted();
        }
    }, [dataTable])

    useEffect(() => {
        if (forceRefetch || !shipperGroupData?.data) {
            dispatch(fetchShipperGroup());
        }

        // Reset forceRefetch after fetching
        if (forceRefetch) {
            setForceRefetch(false); // Reset the flag after triggering the fetch
        }
        getPermission();
    }, [dispatch, forceRefetch, shipperGroupData]); // Watch for forceRefetch changes


    function sortByDate(resultAll: any[]) {
        return resultAll.sort((a, b) => {
            const dateA = new Date(a.gas_day_text.split('/').reverse().join('/')); // แปลงวันที่จาก 'DD/MM/YYYY' เป็น 'YYYY/MM/DD'
            const dateB = new Date(b.gas_day_text.split('/').reverse().join('/'));
            return dateA.getTime() - dateB.getTime(); // เปรียบเทียบวันที่
        });
    }

    function convertWeeklyDataToArray(item: any) {
        const dayIndexMap: Record<string, number> = {
            sunday: 0,
            monday: 1,
            tuesday: 2,
            wednesday: 3,
            thursday: 4,
            friday: 5,
            saturday: 6
        };

        return Object.entries(item?.weeklyDay).map(([day, data]: any) => ({
            day,
            ...data,
            shipper_name: item?.shipper_name || null,
            id: item?.id,
            tabIndex: dayIndexMap[day] ?? -1  // fallback เผื่อเจอชื่อวันแปลก
        })).sort((a, b) => a.tabIndex - b.tabIndex);
    }

    // ############### FIELD SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [filtered_weekly_all, set_filtered_weekly_all] = useState<any>([]);
    const [key, setKey] = useState(0);
    const [srchStartDate, setSrchStartDate] = useState<Date | null>(dayjs().add(1, "day").toDate()); // วันที่ใช้ filter ข้อมูล default วันพรุ่งนี้
    const [srchShipper, setSrchShipper] = useState('');

    // const handleFieldSearch = async () => {
    //     setIsLoading(false)
    //     // Format the search date to DD/MM/YYYY
    //     const localDate = dayjs(srchStartDate).tz("Asia/Bangkok").format("DD/MM/YYYY");


    //     let url = `/master/query-shipper-nomination-file/shipper-nomination-report`;
    //     if (srchStartDate) {
    //         const startDate = toDayjs(srchStartDate);
    //         url += `?gasDay=${startDate.isValid() ? startDate.format("YYYY-MM-DD") : srchStartDate}`;
    //     }
    //     const response: any = await getService(url);


    //     const filtered_daily = response?.filter((item: any) => item?.nomination_type.id == 1) // daily
    //     let dataToFilter = (filtered_daily && Array.isArray(filtered_daily) && filtered_daily.length > 0) ? filtered_daily : (tabIndex === 1 ? dataDailyOriginal : dataTable);

    //     if (tabIndex === 2) { // tab weekly
    //         const filtered_weekly = response?.filter((item: any) => item?.nomination_type.id == 2) // weekly
    //         dataToFilter = (filtered_weekly && Array.isArray(filtered_weekly) && filtered_weekly.length > 0) ? filtered_weekly : dataWeeklyOriginal
    //     }

    //     const result_2 = dataToFilter?.filter((item: any) => {
    //         return (
    //             (srchStartDate ? localDate == item?.gas_day_text : true) &&
    //             (srchShipper ? srchShipper == item?.shipper_name : true)
    //         );
    //     });
    //     setCurrentPage(1);

    //     if (result_2?.length > 0 && tabIndex === 2) { // tab weekly
    //         const resultAll = result_2?.map((item: any) => convertWeeklyDataToArray(item));
    //         const sortresult = sortByDate(resultAll.flat());
    //         set_filtered_weekly_all(sortresult)
    //     } else {
    //         set_filtered_weekly_all([]);
    //     }


    //     setselectprops((pre) => pre?.map((item: any) => item?.id == tabIndex ? { ...item, gas_props: srchStartDate, shipper: srchShipper } : item))
    //     setFilteredDataTable(result_2);


    //     setTimeout(() => {
    //         setIsLoading(true)
    //     }, 300);
    // };

    // #region field search
    const handleFieldSearchNew = async () => {
        setIsLoading(false)

        // Format the search date to DD/MM/YYYY
        const localDate = dayjs(srchStartDate).tz("Asia/Bangkok").format("DD/MM/YYYY");

        let url = `/master/query-shipper-nomination-file/shipper-nomination-report`;
        if (srchStartDate) {
            const startDate = toDayjs(srchStartDate);
            url += `?gasDay=${startDate.isValid() ? startDate.format("YYYY-MM-DD") : srchStartDate}`;
        }

        const response: any = await getService(url);
        let dataToFilter = response;

        switch (tabIndex) {
            case 0:

                // =========== ALL NEW ===========
                const merged: any = mergeDaily_AddOuterAndRowsFromWeekly(response);

                const res_is_all_weekly = isAllWeekly(merged); // true ถ้าทุกตัวมี nomination_type.id === 2
                if (res_is_all_weekly) {
                    dataToFilter = liftWeeklyForDate(merged, toDayjs(srchStartDate).format("DD/MM/YYYY")) // ถ้ามันเป็น weekly หมด จะเข้าไปเอาใน weeklyDay มาแสดง
                } else { // ถ้ามี daily เอาแค่ daily
                    const type_daily = merged?.filter((item: any) => item?.nomination_type?.id == 1) // เดิมโรงงาน
                    // ถ้าชื่อ shipper_name ไม่ซ้ำและเป็น nomination_type.id == 2 ให้เอามาด้วย
                    const nameCounts = (merged ?? []).reduce((acc: Record<string, number>, it: any) => {
                        const name = it?.shipper_name ?? "";
                        acc[name] = (acc[name] ?? 0) + 1;
                        return acc;
                    }, {});

                    const ddddd = (merged ?? []).filter((it: any) => {
                        const typeId = it?.nomination_type?.id;
                        const name = it?.shipper_name ?? "";
                        return typeId === 2 && nameCounts[name] === 1;
                    });
                    const only_one_shipper_type_weekly: any = liftWeeklyForDate(ddddd, toDayjs(srchStartDate).format("DD/MM/YYYY"))
                    dataToFilter = [...type_daily, ...only_one_shipper_type_weekly]
                }


                // เดิมโรงงาน
                // tab daily/weekly
                // ถ้ามี shipper เดียวกัน มีทั้งสอง daily กับ weekly ให้เอามาแค่ daily
                // 1) เก็บชนิดที่มีต่อ shipper_name
                // const typesByShipper = response?.reduce((acc: Record<string, Set<number>>, item: any) => {
                //     const key = item.shipper_name ?? "";
                //     if (!acc[key]) acc[key] = new Set<number>();
                //     const t = item.nomination_type?.id;
                //     if (typeof t === "number") acc[key].add(t);
                //     return acc;
                // }, {});

                // // 2) กรอง: ถ้า shipper นั้นมีทั้ง 1 และ 2 ให้เอาเฉพาะ id == 1
                // const filtered = response?.filter((item: any) => {
                //     const key = item.shipper_name ?? "";
                //     const set = typesByShipper[key];
                //     if (!set) return true;                  // เผื่อกรณีไม่เจอคีย์ (ไม่น่าเกิด)
                //     if (set.size === 1) return true;        // มีชนิดเดียว เอาไว้หมด
                //     return item.nomination_type?.id === 1;  // มีหลายชนิด -> เอาเฉพาะ id = 1
                // });
                // dataToFilter = filtered

                // // ถ้า data_filter.nomination_type.id == 2 ให้เอาค่าพวก capacityRightMMBTUD, nominatedValueMMBTUD, overusageMMBTUD, imbalanceMMBTUD ข้างใน weeklyDay ที่ gas_day_text == localDate ออกมาข้างนอก
                // // let localDate = 02/10/2025
                // dataToFilter = liftWeeklyForDate(filtered, localDate);

                break;
            case 1:
                const filtered_daily = response?.filter((item: any) => item?.nomination_type.id == 1) // daily
                setDataDailyOriginal(filtered_daily)
                dataToFilter = filtered_daily
                break;
            case 2:
                const filtered_weekly = response?.filter((item: any) => item?.nomination_type.id == 2) // weekly
                setDataWeeklyOriginal(filtered_weekly)
                dataToFilter = (filtered_weekly && Array.isArray(filtered_weekly) && filtered_weekly.length > 0) ? filtered_weekly : dataWeeklyOriginal
                break;
        }

        const result_2 = dataToFilter?.filter((item: any) => {
            return (
                // (srchStartDate ? localDate == item?.gas_day_text : true) &&
                (srchShipper ? srchShipper == item?.shipper_name : true)
            );
        });

        // if (result_2?.length > 0 && tabIndex === 2) { // tab weekly
        if (response?.length > 0 && tabIndex === 2) { // tab weekly
            const resultAll = result_2?.map((item: any) => convertWeeklyDataToArray(item));
            const sortresult = sortByDate(resultAll.flat());
            set_filtered_weekly_all(sortresult)
        } else {
            set_filtered_weekly_all([]);
        }

        setselectprops((pre) => pre?.map((item: any) => item?.id == tabIndex ? { ...item, gas_props: srchStartDate, shipper: srchShipper } : item))
        setData(result_2); // test เติมมา
        setFilteredDataTable(result_2);

        setCurrentPage(1);
        setTimeout(() => {
            setIsLoading(true)
        }, 300);
    };


    const handleReset = async (tabIDX: any) => {
        setSrchShipper('');

        if (tabIDX < 2) {
            const selectDate = dayjs().add(1, "day").toDate();
            setselectprops((pre) => pre?.map((item: any) => item?.id == tabIndex ? { ...item, gas_props: selectDate, shipper: null } : item))
            onchangeGasdate(dayjs().add(1, "day").toDate(), tabIDX)

            fetchOnlyData(tabIDX, selectDate); // กันโหลด data ซ้ำจากของเดิม
        } else {
            const selectDate = new Date(getCurrentWeekSundayYyyyMmDd());
            setselectprops((pre) => pre?.map((item: any) => item?.id == tabIndex ? { ...item, gas_props: selectDate, shipper: null } : item))
            onchangeGasdate(new Date(getCurrentWeekSundayYyyyMmDd()), tabIDX)

            fetchOnlyData(tabIDX, selectDate); // กันโหลด data ซ้ำจากของเดิม
        }
        settk(!tk);
        setKey((prevKey) => prevKey + 1);
    };

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string, tabIDX?: any) => {
        let tab: any = tabIDX || tabIndex;
        const queryLower = query.replace(/\s+/g, '')?.toLowerCase().trim();
        let filtered: any;

        if (tab === 0) {
            // filtered = dataTable?.filter(
            filtered = filteredDataTable?.filter(
                (item: any) => {
                    return (
                        item?.gas_day_text?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item?.shipper_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                        formatNumberFourDecimal(item?.capacityRightMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimal(item?.nominatedValueMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimal(item?.overusageMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimal(item?.imbalanceMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                        item?.capacityRightMMBTUD?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item?.nominatedValueMMBTUD?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item?.overusageMMBTUD?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item?.imbalanceMMBTUD?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)
                    )
                }
            );

        } else if (tab === 1) {
            // const tomorrowText = dayjs().add(1, 'day').format('DD/MM/YYYY'); // format '25/05/2025'
            // const tomorrowText = dayjs(srchStartDate).format('DD/MM/YYYY');
            // let filter_daily_tomorrow = dataDailyOriginal?.filter((item: any) => item?.gas_day_text == tomorrowText);

            filtered = filteredDataTable?.filter(
                (item: any) => {
                    return (
                        item?.gas_day_text?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item?.shipper_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                        formatNumberFourDecimal(item?.capacityRightMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimal(item?.nominatedValueMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimal(item?.overusageMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimal(item?.imbalanceMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                        item?.capacityRightMMBTUD?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item?.nominatedValueMMBTUD?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item?.overusageMMBTUD?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item?.imbalanceMMBTUD?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)
                    )
                }
            );

        } else if (tab === 2) {

            const tabdayIndex: any = [
                { id: 0, day: 'sunday' },
                { id: 1, day: 'monday' },
                { id: 2, day: 'tuesday' },
                { id: 3, day: 'wednesday' },
                { id: 4, day: 'thursday' },
                { id: 5, day: 'friday' },
                { id: 6, day: 'saturday' },
                { id: 7, day: 'all' },
            ]

            // let filter_weekly_sunday = dataWeeklyOriginal?.filter((item: any) => item?.gas_day_text == dayjs(srchStartDate).format("DD/MM/YYYY"))
            let filter_weekly_sunday = filteredDataTable?.filter((item: any) => item?.gas_day_text == dayjs(srchStartDate).format("DD/MM/YYYY"))
            filtered = filter_weekly_sunday?.filter(
                (item: any) => {

                    return (
                        item?.weeklyDay[tabdayIndex[subTabIndex]?.day]?.gas_day_text?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item?.shipper_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                        formatNumberFourDecimal(item?.weeklyDay[tabdayIndex[subTabIndex]?.day]?.capacityRightMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimal(item?.weeklyDay[tabdayIndex[subTabIndex]?.day]?.nominatedValueMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimal(item?.weeklyDay[tabdayIndex[subTabIndex]?.day]?.overusageMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimal(item?.weeklyDay[tabdayIndex[subTabIndex]?.day]?.imbalanceMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                        formatNumberFourDecimalNoComma(item?.weeklyDay[tabdayIndex[subTabIndex]?.day]?.capacityRightMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimalNoComma(item?.weeklyDay[tabdayIndex[subTabIndex]?.day]?.nominatedValueMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimalNoComma(item?.weeklyDay[tabdayIndex[subTabIndex]?.day]?.overusageMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimalNoComma(item?.weeklyDay[tabdayIndex[subTabIndex]?.day]?.imbalanceMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                        item?.weeklyDay[tabdayIndex[subTabIndex]?.day]?.capacityRightMMBTUD?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item?.weeklyDay[tabdayIndex[subTabIndex]?.day]?.nominatedValueMMBTUD?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item?.weeklyDay[tabdayIndex[subTabIndex]?.day]?.overusageMMBTUD?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item?.weeklyDay[tabdayIndex[subTabIndex]?.day]?.imbalanceMMBTUD?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)
                    )
                }
            );
        }

        setPaginatedData(filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
    };

    // ############### DATA TABLE ###############
    const [tabIndex, setTabIndex] = useState(0); // 0=daily, 1=weekly
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [dataOriginal, setDataOriginal] = useState<any>([]);
    const [dataDailyOriginal, setDataDailyOriginal] = useState<any>([]);
    const [dataWeeklyOriginal, setDataWeeklyOriginal] = useState<any>([]);
    const [dataShipper, setDataShipper] = useState<any>([]);
    const [rawData, setRawData] = useState<any>([]);

    const fetchData = async () => {
        setIsLoading(false)
        try {

            // Group (2 = TSO, 3 = Shipper, 4 = Other)
            const res_shipper_name = await getService(`/master/account-manage/group-master?user_type=3`);
            setDataShipper(res_shipper_name)

            let url = `/master/query-shipper-nomination-file/shipper-nomination-report`;
            if (srchStartDate) {
                const startDate = toDayjs(srchStartDate);
                url += `?gasDay=${startDate.isValid() ? startDate.format("YYYY-MM-DD") : srchStartDate}`;
            }
            const response: any = await getService(url);
            let filtered_daily = response?.filter((item: any) => item?.nomination_type.id == 1)
            let filtered_weekly = response?.filter((item: any) => item?.nomination_type.id == 2)

            setDataDailyOriginal(filtered_daily)
            setDataWeeklyOriginal(filtered_weekly)

            if (tabIndex == 0) { // TAB DAILY/WEEKLY

                // =========== ALL NEW ===========
                // const merged = mergeDaily_OuterTotalsFromWeekly(response);
                // 1. หา response.shipper ที่ตรงกันและมี contractAll ตรงกันตัวใดตัวหนึ่ง
                // 2. จากที่กรองให้ยึด  response.nomination_type.id == 1 เป็นหลัก
                // 3. จากที่หาใน response.nomination_type.id == 2 
                //    - เอา gas_day_text ของ response.nomination_type.id == 1 ไปหาใน .weeklyDay gas_day_text ที่ตรงกัน ของ response.nomination_type.id == 2 
                //    - จากนั้นเอาค่า capacityRightMMBTUD, imbalanceMMBTUD, nominatedValueMMBTUD, overusageMMBTUD ใน weeklyDay ที่หาเจอ ไปรวมกับ capacityRightMMBTUD, imbalanceMMBTUD, nominatedValueMMBTUD, overusageMMBTUD ชั้นนอกของ response.nomination_type.id == 1
                // 4. รวม dataRow ระหว่าง response.nomination_type.id == 1 และ response.nomination_type.id == 2 
                //      - เอา dataRow.area_text ของ response.nomination_type.id == 1 ไปหาใน dataRow.area_text ของ response.nomination_type.id == 2
                //      - จากนั้น เอา dataRow.gas_day ของ response.nomination_type.id == 1 ไปหาใน dataRow.weeklyDay ของ response.nomination_type.id == 2
                //      - จากนั้นเอาค่า capacityRightMMBTUD, imbalanceMMBTUD, nominatedValueMMBTUD, overusageMMBTUD ใน weeklyDay ที่หาเจอ ไปรวมกับ capacityRightMMBTUD, imbalanceMMBTUD, nominatedValueMMBTUD, overusageMMBTUD ใน dataRow ที่เทียบกับ ของ response.nomination_type.id == 1

                // เพิ่มเติม
                // - ถ้า dataRow.area_text ใน response.nomination_type.id == 2 ตัวที่ที่ไม่มีใน response.nomination_type.id == 1 ให้เอามาทั้ง obj ไปยัดใน dataRow ของ response.nomination_type.id == 1 เลย

                const merged: any = mergeDaily_AddOuterAndRowsFromWeekly(response);
                let data_ = merged
                const res_is_all_weekly = isAllWeekly(merged); // true ถ้าทุกตัวมี nomination_type.id === 2 (weekly)
                if (res_is_all_weekly) {
                    data_ = liftWeeklyForDate(merged, toDayjs(srchStartDate).format("DD/MM/YYYY")) // ถ้ามันเป็น weekly หมด จะเข้าไปเอาใน weeklyDay มาแสดง
                }

                setData(data_);
                setFilteredDataTable(data_);
                setDataOriginal(data_)

                // เช็ค data_test ใน dataRow.conceptPointZone[0].zone
                // ถ้าใน conceptPointZone[0].zone
                const data_test = [
                    {
                        id: 1,
                        dataRow: [
                            {
                                "gas_day": "28/10/2025",
                                "shipper_name": "EGAT",
                                "area_text": "X1",
                                "zone_text": "EAST",
                                "contract_code_id_arr": [
                                    20
                                ],
                                "conceptPointZone": [
                                    {
                                        "zone_text": "EAST",
                                        "zone": [
                                            {
                                                "contract_code_id": 20,
                                                "headData": {
                                                    "0": "Zone",
                                                    "1": "Supply/Demand",
                                                    "2": "Area",
                                                    "3": "POINT_ID",
                                                    "4": "WI/HV",
                                                    "5": "Park/UnparkInstructed Flows",
                                                    "6": "Type",
                                                    "7": "Area_Code",
                                                    "8": "Subarea_Code",
                                                    "9": "Unit",
                                                    "10": "Entry_Exit",
                                                    "11": "WI",
                                                    "12": "HV",
                                                    "13": "SG",
                                                    "14": "1",
                                                    "15": "2",
                                                    "16": "3",
                                                    "17": "4",
                                                    "18": "5",
                                                    "19": "6",
                                                    "20": "7",
                                                    "21": "8",
                                                    "22": "9",
                                                    "23": "10",
                                                    "24": "11",
                                                    "25": "12",
                                                    "26": "13",
                                                    "27": "14",
                                                    "28": "15",
                                                    "29": "16",
                                                    "30": "17",
                                                    "31": "18",
                                                    "32": "19",
                                                    "33": "20",
                                                    "34": "21",
                                                    "35": "22",
                                                    "36": "23",
                                                    "37": "24",
                                                    "38": "Total"
                                                },
                                                "entry_exit_text": "Entry",
                                                "id": 4945,
                                                "zone_text": "EAST",
                                                "area_text": null,
                                                "data_temp": {
                                                    "0": "EAST",
                                                    "1": "Supply",
                                                    "2": "",
                                                    "3": "",
                                                    "4": "East WI",
                                                    "5": "",
                                                    "6": "",
                                                    "7": "",
                                                    "8": "",
                                                    "9": "BTU/SCF",
                                                    "10": "Entry",
                                                    "11": "",
                                                    "12": "",
                                                    "13": "",
                                                    "14": "1020",
                                                    "15": "1020",
                                                    "16": "1020",
                                                    "17": "1020",
                                                    "18": "1020",
                                                    "19": "1020",
                                                    "20": "1020",
                                                    "21": "1020",
                                                    "22": "1020",
                                                    "23": "1020",
                                                    "24": "1020",
                                                    "25": "1020",
                                                    "26": "1020",
                                                    "27": "1020",
                                                    "28": "1020",
                                                    "29": "1020",
                                                    "30": "1020",
                                                    "31": "1020",
                                                    "32": "1020",
                                                    "33": "1020",
                                                    "34": "1020",
                                                    "35": "1020",
                                                    "36": "1020",
                                                    "37": "1020",
                                                    "38": "24480"
                                                },
                                                "old_index": 6,
                                                "nomination_version_id": 220,
                                                "entry_exit_id": 1,
                                                "create_date": "2025-10-25T19:06:22.213Z",
                                                "update_date": null,
                                                "create_date_num": 1761419182,
                                                "update_date_num": null,
                                                "create_by": 74,
                                                "update_by": null,
                                                "flag_use": true,
                                                "query_shipper_nomination_type_id": 2,
                                                "query_shipper_nomination_type": {
                                                    "id": 2,
                                                    "name": "columnPointIdConcept",
                                                    "color": null
                                                }
                                            },
                                        ]
                                    }

                                ],
                            },
                        ]
                    },
                    {
                        id: 2,
                        dataRow: [
                            {
                                "gas_day": "28/10/2025",
                                "shipper_name": "EGAT",
                                "area_text": "A3",
                                "zone_text": "EAST",
                                "contract_code_id_arr": [
                                    20
                                ],
                                "conceptPointZone": [
                                    {
                                        "zone_text": "EAST",
                                        "zone": [
                                            {
                                                "contract_code_id": 20,
                                                "headData": {
                                                    "0": "Zone",
                                                    "1": "Supply/Demand",
                                                    "2": "Area",
                                                    "3": "POINT_ID",
                                                    "4": "WI/HV",
                                                    "5": "Park/UnparkInstructed Flows",
                                                    "6": "Type",
                                                    "7": "Area_Code",
                                                    "8": "Subarea_Code",
                                                    "9": "Unit",
                                                    "10": "Entry_Exit",
                                                    "11": "WI",
                                                    "12": "HV",
                                                    "13": "SG",
                                                    "14": "1",
                                                    "15": "2",
                                                    "16": "3",
                                                    "17": "4",
                                                    "18": "5",
                                                    "19": "6",
                                                    "20": "7",
                                                    "21": "8",
                                                    "22": "9",
                                                    "23": "10",
                                                    "24": "11",
                                                    "25": "12",
                                                    "26": "13",
                                                    "27": "14",
                                                    "28": "15",
                                                    "29": "16",
                                                    "30": "17",
                                                    "31": "18",
                                                    "32": "19",
                                                    "33": "20",
                                                    "34": "21",
                                                    "35": "22",
                                                    "36": "23",
                                                    "37": "24",
                                                    "38": "Total"
                                                },
                                                "entry_exit_text": "Entry",
                                                "id": 4945,
                                                "zone_text": "EAST",
                                                "area_text": null,
                                                "data_temp": {
                                                    "0": "EAST",
                                                    "1": "Supply",
                                                    "2": "",
                                                    "3": "",
                                                    "4": "East WI",
                                                    "5": "",
                                                    "6": "",
                                                    "7": "",
                                                    "8": "",
                                                    "9": "BTU/SCF",
                                                    "10": "Entry",
                                                    "11": "",
                                                    "12": "",
                                                    "13": "",
                                                    "14": "1020",
                                                    "15": "1020",
                                                    "16": "1020",
                                                    "17": "1020",
                                                    "18": "1020",
                                                    "19": "1020",
                                                    "20": "1020",
                                                    "21": "1020",
                                                    "22": "1020",
                                                    "23": "1020",
                                                    "24": "1020",
                                                    "25": "1020",
                                                    "26": "1020",
                                                    "27": "1020",
                                                    "28": "1020",
                                                    "29": "1020",
                                                    "30": "1020",
                                                    "31": "1020",
                                                    "32": "1020",
                                                    "33": "1020",
                                                    "34": "1020",
                                                    "35": "1020",
                                                    "36": "1020",
                                                    "37": "1020",
                                                    "38": "24480"
                                                },
                                                "old_index": 6,
                                                "nomination_version_id": 220,
                                                "entry_exit_id": 1,
                                                "create_date": "2025-10-25T19:06:22.213Z",
                                                "update_date": null,
                                                "create_date_num": 1761419182,
                                                "update_date_num": null,
                                                "create_by": 74,
                                                "update_by": null,
                                                "flag_use": true,
                                                "query_shipper_nomination_type_id": 2,
                                                "query_shipper_nomination_type": {
                                                    "id": 2,
                                                    "name": "columnPointIdConcept",
                                                    "color": null
                                                }
                                            },
                                        ]
                                    }
                                ],
                            }
                        ]
                    }

                ]

















                // ---- เดิมโรงงาน
                // const nomination = (response || []).filter((nomination: any) => {
                //     if (nomination.nomination_type?.id === 2 || nomination.nomination_type?.name === "Weekly") { // If it's a week nomination
                //         // Calculate previous Sunday for weekly nominations
                //         const targetDate = dayjs(nomination.gas_day, 'DD/MM/YYYY').startOf('day');
                //         if (targetDate.isValid()) {
                //             const previousSunday = targetDate.subtract(targetDate.day(), 'day').startOf('day');
                //             // Check if there's a daily nomination for the same contract_code_id
                //             const hasDailyNomination = response.some((dailyNom: any) => {
                //                 if ((dailyNom.nomination_type?.id === 1 || dailyNom.nomination_type?.name === "Daily") && dailyNom.contract_code_id === nomination.contract_code_id) {
                //                     const dailtGasDay = dayjs(dailyNom.gas_day, 'DD/MM/YYYY').startOf('day');
                //                     if (dailtGasDay.isValid()) {
                //                         return previousSunday.isSame(dailtGasDay, 'day')
                //                     }
                //                 }
                //                 return false
                //             });
                //             return !hasDailyNomination; // Only keep weekly nominations that not have a corresponding daily nomination
                //         }
                //         return false
                //     }
                //     return true; // Keep all daily nominations
                // });

                // filtered_daily = nomination?.filter((item: any) => item?.nomination_type.id == 1)
                // filtered_weekly = nomination?.filter((item: any) => item?.nomination_type.id == 2)

                // Process weekly data
                // filtered_weekly?.map((item: any) => {
                //     if (item.weeklyDay) {
                //         Object.entries(item.weeklyDay).forEach(([day, data]: [string, any]) => {
                //             const weeklyItem = {
                //                 ...item,
                //                 gas_day: data.gas_day_text,
                //                 gas_day_text: data.gas_day_text,
                //                 capacityRightMMBTUD: data.capacityRightMMBTUD,
                //                 nominatedValueMMBTUD: data.nominatedValueMMBTUD,
                //                 overusageMMBTUD: data.overusageMMBTUD,
                //                 imbalanceMMBTUD: data.imbalanceMMBTUD
                //             }
                //             filtered_daily.push(weeklyItem)
                //         });
                //     }
                // })

                // Sort filtered_daily by gas_day
                // filtered_daily.sort((a: any, b: any) => {
                //     const dateA = dayjs(a.gas_day, 'DD/MM/YYYY');
                //     const dateB = dayjs(b.gas_day, 'DD/MM/YYYY');
                //     return dateA.diff(dateB);
                // });

                // const tomorrow = dayjs().add(1, 'day').format("DD/MM/YYYY")
                // const filter_tomorrow_data = filtered_daily.filter((item: any) => item?.gas_day_text == tomorrow)

                // setData(filtered_daily);
                // setFilteredDataTable(filter_tomorrow_data);
                // setDataOriginal(filtered_daily)

            } else if (tabIndex == 1) {
                setData(filtered_daily);
                setFilteredDataTable(filtered_daily);
            } else if (tabIndex == 2) {
                setData(filtered_weekly);
                setFilteredDataTable(filtered_weekly);
            }

            setTimeout(() => {
                setIsLoading(true);
            }, 500);
        } catch (err) {
            // setError(err.message);
            setData([]);
            setFilteredDataTable([]);
        } finally {
            // setLoading(false);
        }
    };

    // #region fetchOnlyData tab change
    const fetchOnlyData = async (tabIDX: any, isFixDay?: any) => {
        try {
            setIsLoading(false)
            const props = selectprops?.find((item) => item?.id == tabIDX);

            if (tabIDX == 0) {
                // เดิมโรงงาน
                // const filter_tomorrow_data = dataOriginal?.filter((item: any) => {
                //     return (
                //         (isFixDay ? dayjs(isFixDay)?.format('DD/MM/YYYY') == item?.gas_day_text : props?.gas_props ? dayjs(props?.gas_props).format('DD/MM/YYYY') == item?.gas_day_text : true) &&
                //         (props?.shipper ? props?.shipper == item?.shipper_name : true)
                //     );
                // });

                // setData(dataOriginal);
                // setFilteredDataTable(filter_tomorrow_data);

                // =========== ALL NEW ===========
                let url = `/master/query-shipper-nomination-file/shipper-nomination-report`;
                url += `?gasDay=${dayjs().add(1, 'day').format("YYYY-MM-DD")}`;
                const response: any = await getService(url);
                let dataToFilter = response;

                const merged: any = mergeDaily_AddOuterAndRowsFromWeekly(response);
                const res_is_all_weekly = isAllWeekly(merged); // true ถ้าทุกตัวมี nomination_type.id === 2
                const localDate = dayjs().add(1, 'day').format("DD/MM/YYYY");
                if (res_is_all_weekly) {
                    dataToFilter = liftWeeklyForDate(merged, localDate) // ถ้ามันเป็น weekly หมด จะเข้าไปเอาใน weeklyDay มาแสดง
                } else { // ถ้ามี daily เอาแค่ daily
                    // dataToFilter = merged?.filter((item: any) => item?.nomination_type?.id == 1)

                    const type_daily = merged?.filter((item: any) => item?.nomination_type?.id == 1) // เดิมโรงงาน
                    // ถ้าชื่อ shipper_name ไม่ซ้ำและเป็น nomination_type.id == 2 ให้เอามาด้วย
                    const nameCounts = (merged ?? []).reduce((acc: Record<string, number>, it: any) => {
                        const name = it?.shipper_name ?? "";
                        acc[name] = (acc[name] ?? 0) + 1;
                        return acc;
                    }, {});

                    const ddddd = (merged ?? []).filter((it: any) => {
                        const typeId = it?.nomination_type?.id;
                        const name = it?.shipper_name ?? "";
                        return typeId === 2 && nameCounts[name] === 1;
                    });
                    const only_one_shipper_type_weekly: any = liftWeeklyForDate(ddddd, toDayjs(srchStartDate).format("DD/MM/YYYY"))
                    dataToFilter = [...type_daily, ...only_one_shipper_type_weekly]
                }

                setData(dataToFilter);
                setFilteredDataTable(dataToFilter);

            } else if (tabIDX == 1) {
                // R : Tab Daily > List > Filter Gas Day Default เป็น D+1 https://app.clickup.com/t/86etbwtz0
                const filter_daily_tomorrow = dataDailyOriginal?.filter((item: any) => {
                    return (
                        (isFixDay ? dayjs(isFixDay)?.format('DD/MM/YYYY') == item?.gas_day_text : props?.gas_props ? dayjs(props?.gas_props).format('DD/MM/YYYY') == item?.gas_day_text : true) &&
                        (props?.shipper ? props?.shipper == item?.shipper_name : true)
                    );
                });

                setData(filter_daily_tomorrow);
                setFilteredDataTable(filter_daily_tomorrow);
            } else if (tabIDX == 2) {
                const filter_weekly_sunday = dataWeeklyOriginal?.filter((item: any) => {
                    return (
                        (isFixDay ? dayjs(isFixDay)?.format('DD/MM/YYYY') == item?.gas_day_text : props?.gas_props ? dayjs(props?.gas_props).format('DD/MM/YYYY') == item?.gas_day_text : true) &&
                        (props?.shipper ? props?.shipper == item?.shipper_name : true)
                    );
                });

                if (filter_weekly_sunday?.length > 0 && tabIDX === 2) {
                    const resultAll = filter_weekly_sunday?.map((item: any) => convertWeeklyDataToArray(item));
                    const sortresult = sortByDate(resultAll.flat());
                    set_filtered_weekly_all(sortresult)
                } else {
                    set_filtered_weekly_all([]);
                }

                setData(filter_weekly_sunday);
                setFilteredDataTable(filter_weekly_sunday);
            }

            setTimeout(() => {
                setIsLoading(true);
            }, 1000);

        } catch (error) {
            setData([]);
            setFilteredDataTable([]);
        }
    };

    useEffect(() => {
        fetchData();
    }, [resetForm]);

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalModalSuccessMsg, setModalSuccessMsg] = useState('');
    const handleCloseModal = () => setModalSuccessOpen(false);
    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);

    // ############### PAGINATION ###############
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [paginatedData, setPaginatedData] = useState<any[]>([]);

    useEffect(() => {
        if (filteredDataTable && tabIndex == 0) {
            // setPaginatedData(dataOriginal.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
            setPaginatedData(filteredDataTable.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
        }

        if (filteredDataTable && tabIndex == 1) {
            // setPaginatedData(dataDailyOriginal.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
            setPaginatedData(filteredDataTable.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
        }

        if (filteredDataTable && tabIndex == 2) {
            // setPaginatedData(dataWeeklyOriginal.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
            setPaginatedData(filteredDataTable?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
        }

    }, [filteredDataTable, currentPage, itemsPerPage, tabIndex])

    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [
        { key: 'gas_day', label: 'Gas Day', visible: true },
        { key: 'shipper_name', label: 'Shipper Name', visible: true },
        { key: 'capacity_right', label: 'Capacity Right (MMBTU/D)', visible: true },
        { key: 'nominated_value', label: 'Nominated Value (MMBTU/D)', visible: true },
        { key: 'overusage', label: 'Overusage (MMBTU/D)', visible: true },
        { key: 'imbalance', label: 'Imbalance (MMBTU/D)', visible: true },
        { key: 'action', label: 'Action', visible: true },
    ];
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [columnVisibility, setColumnVisibility] = useState<any>(
        Object.fromEntries((initialColumns ?? []).map((column: any) => [column?.key, column?.visible]))
    );

    const handleTogglePopover = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const handleColumnToggle = (columnKey: string) => {
        setColumnVisibility((prev: any) => ({
            ...prev,
            [columnKey]: !prev[columnKey]
        }));
    };

    // ===================== TABLE HEADER MAP =====================
    const hours = Array.from({ length: 24 }, (_, i) => ({
        key: `h${i + 1}`,
        label: `H${i + 1}`,
        timeRange: `${String(i).padStart(2, "0")}:01 - ${String(i + 1).padStart(2, "0")}:00`
    }));

    // ############### TAB HR ###############
    const [subTabIndex, setSubTabIndex] = useState(0);
    const [subTabIndexview, setsubTabIndexview] = useState(0);

    const handleChangeSubTab = (event: any, newValue: any) => {
        // 0 = 1-6 Hr
        // 1 = 7-12 Hr
        // 2 = 13-18 Hr
        // 3 = 19-24 Hr
        // 4 = All Day

        setSubTabIndex(newValue);

        //sub tab all
        handleSearch('');
    };

    const getVisibleHours = () => {
        switch (subTabIndex) {
            case 0: return hours.slice(0, 6);  // H1 - H6
            case 1: return hours.slice(6, 12); // H7 - H12
            case 2: return hours.slice(12, 18); // H13 - H18
            case 3: return hours.slice(18, 24); // H19 - H24
            case 4: return hours; // All hours
            default: return [];
        }
    };

    useEffect(() => {
        getVisibleHours();
    }, [subTabIndex])

    // ############### COLUMN SHOW/HIDE INTRADAY ###############
    const initialColumnsTabIntraday: any = [

        { key: 'gas_day', label: 'Gas Day', visible: true },
        { key: 'zone', label: 'Zone', visible: true },
        { key: 'area', label: 'Area', visible: true },
        { key: 'parameter', label: 'Parameter', visible: true },

        { key: 'h1', label: 'H1 00:00 - 01:00', visible: true }, // show if tabIndex = 0
        { key: 'h2', label: 'H2 01:01 - 02:00', visible: true }, // show if tabIndex = 0
        { key: 'h3', label: 'H3 02:01 - 03:00', visible: true }, // show if tabIndex = 0
        { key: 'h4', label: 'H4 03:01 - 04:00', visible: true }, // show if tabIndex = 0
        { key: 'h5', label: 'H5 04:01 - 05:00', visible: true }, // show if tabIndex = 0
        { key: 'h6', label: 'H6 05:01 - 06:00', visible: true }, // show if tabIndex = 0

        { key: 'h7', label: 'H7 06:01 - 07:00', visible: true }, // show if tabIndex = 1
        { key: 'h8', label: 'H8 07:01 - 08:00', visible: true }, // show if tabIndex = 1
        { key: 'h9', label: 'H9 08:01 - 09:00', visible: true }, // show if tabIndex = 1
        { key: 'h10', label: 'H10 09:01 - 10:00', visible: true }, // show if tabIndex = 1
        { key: 'h11', label: 'H11 10:01 - 11:00', visible: true }, // show if tabIndex = 1
        { key: 'h12', label: 'H12 11:01 - 12:00', visible: true }, // show if tabIndex = 1

        { key: 'h13', label: 'H13 12:01 - 13:00', visible: true }, // show if tabIndex = 2
        { key: 'h14', label: 'H14 13:01 - 14:00', visible: true }, // show if tabIndex = 2
        { key: 'h15', label: 'H15 14:01 - 15:00', visible: true }, // show if tabIndex = 2
        { key: 'h16', label: 'H16 15:01 - 16:00', visible: true }, // show if tabIndex = 2
        { key: 'h17', label: 'H17 16:01 - 17:00', visible: true }, // show if tabIndex = 2
        { key: 'h18', label: 'H18 17:01 - 18:00', visible: true }, // show if tabIndex = 2

        { key: 'h19', label: 'H19 18:01 - 19:00', visible: true }, // show if tabIndex = 3
        { key: 'h20', label: 'H20 19:01 - 20:00', visible: true }, // show if tabIndex = 3
        { key: 'h21', label: 'H21 20:01 - 21:00', visible: true }, // show if tabIndex = 3
        { key: 'h22', label: 'H22 21:01 - 22:00', visible: true }, // show if tabIndex = 3
        { key: 'h23', label: 'H23 22:01 - 23:00', visible: true }, // show if tabIndex = 3
        { key: 'h24', label: 'H24 23:01 - 24:00', visible: true }, // show if tabIndex = 3

    ];

    const filterColumnsByTabIndex = (subTabIndex: number) => {
        return initialColumnsTabIntraday.filter((col: any) => {
            // Always show these columns
            const alwaysVisibleKeys = [
                "gas_day", "zone", "area", "parameter"
            ];

            if (alwaysVisibleKeys.includes(col.key)) {
                return true;
            }

            if (subTabIndex === 4) {
                return true; // Show all columns if tabIndex = 4
            }

            // Define hourly column visibility based on tab index
            const hourColumnMapping: { [key: number]: string[] } = {
                0: ["h1", "h2", "h3", "h4", "h5", "h6"],
                1: ["h7", "h8", "h9", "h10", "h11", "h12"],
                2: ["h13", "h14", "h15", "h16", "h17", "h18"],
                3: ["h19", "h20", "h21", "h22", "h23", "h24"],
            };

            return hourColumnMapping[subTabIndex]?.includes(col.key) ?? false;
        });
    };

    const visibleColumns = filterColumnsByTabIndex(subTabIndex);
    const getInitialColumnsIntraday = () => visibleColumns;
    const [anchorElIntraday, setAnchorElIntraday] = useState<null | HTMLElement>(null);
    const openIntraday = Boolean(anchorElIntraday);

    const [columnVisibilityIntraday, setColumnVisibilityIntraday] = useState<any>(
        Object.fromEntries(getInitialColumnsIntraday().map((column: any) => [column.key, column.visible]))
    );

    useEffect(() => {
        setColumnVisibilityIntraday(Object.fromEntries(getInitialColumnsIntraday().map((column: any) => [column.key, column.visible])))
    }, [subTabIndex])

    const handleColumnToggleIntraday = (columnKey: string) => {
        setColumnVisibilityIntraday((prev: any) => ({
            ...prev,
            [columnKey]: !prev[columnKey]
        }));
    };

    // ############### TAB ###############
    const handleChange = (event: any, newValue: any) => {
        setIsLoading(false);

        let tabIDX: any = newValue;
        setTabIndex((pre: any) => tabIDX);
        settk(!tk);

        const props = selectprops?.find((item) => item?.id == tabIDX);
        onchangeGasdate(props?.gas_props, tabIDX)
        setSrchShipper(props?.shipper ? props?.shipper : '');

        fetchOnlyData(tabIDX);

        // if(tabIDX < 2){
        //     onchangeGasdate(tomorrowText, tabIDX)
        // }else{
        //     onchangeGasdate(sun_day_fun_day, tabIDX)
        // }

        // handleReset(tabIDX);
    };

    // ############# OPEN PAGE VIEW #############
    const [viewOpen, setViewOpen] = useState(false);
    const [viewDataMain, setViewDataMain] = useState<any>([]);

    const openViewForm = async (id: any) => {

        let filteredData: any;
        if (tabIndex === 0) {
            filteredData = dataTable?.find((item: any) => item?.id === id);
        } else if (tabIndex === 1) {
            filteredData = dataDailyOriginal?.find((item: any) => item?.id === id);
        } else if (tabIndex === 2) {
            filteredData = dataWeeklyOriginal?.find((item: any) => item?.id === id);
        }

        setViewDataMain(filteredData)
        setViewOpen(true);
    };

    const togglePopover = (id: any, anchor: any, subtab: any) => {

        // setsubTabIndexview(tabIDX);
        if (openPopoverId === id) {
            setOpenPopoverId(null); // Close the popover if it's already open
            setAnchorPopover(null)
        } else {
            setOpenPopoverId(id); // Open the popover for the clicked row
            setsubTabIndexview(subtab)
            if (anchor) {
                setAnchorPopover(anchor)
            }
            else {
                setAnchorPopover(null)
            }
        }

        settk(!tk)
    };

    const [openPopoverId, setOpenPopoverId] = useState(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const [anchorPopover, setAnchorPopover] = useState<null | HTMLElement>(null);
    const [dataExport, setDataExport] = useState<any>([]);

    const handleClickOutside = (event: MouseEvent) => {
        if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
            setOpenPopoverId(null);
            setAnchorPopover(null)
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [popoverRef]);

    const columns = useMemo<ColumnDef<any>[]>(
        () => [
            {
                accessorKey: "gas_day",
                header: "Gas Day",
                enableSorting: true,
                accessorFn: (row: any) => row?.gas_day_text || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>{row?.gas_day_text ? row?.gas_day_text : ''}</div>
                    )
                }
            },
            {
                accessorKey: "shipper_name",
                header: "Shipper Name",
                enableSorting: true,
                accessorFn: (row: any) => row?.shipper_name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>{row?.shipper_name ? row?.shipper_name : ''}</div>
                    )
                }
            },
            {
                accessorKey: "capacity_right",
                header: "Capacity Right (MMBTU/D)",
                enableSorting: true,
                // accessorFn: (row: any) => formatNumberThreeDecimal(row?.capacityRightMMBTUD) || '',
                accessorFn: (row: any) => {
                    const raw = row?.capacityRightMMBTUD;
                    if (!raw) return '';

                    const fixed = formatNumberFourDecimal(raw); // เช่น 10,000.0000
                    const noComma = fixed.replace(/,/g, '');    // เช่น 10000.0000
                    const rounded = parseFloat(raw).toString(); // เช่น 10000

                    return `${fixed} ${noComma} ${rounded}`;
                },
                sortDescFirst: false,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="text-right">{row?.capacityRightMMBTUD ? formatNumberThreeDecimal(row?.capacityRightMMBTUD) : '0.000'}</div>
                    )
                }
            },
            {
                accessorKey: "nominated_value",
                header: "Nominated Value (MMBTU/D)",
                enableSorting: true,
                // accessorFn: (row: any) => formatNumberThreeDecimal(row?.nominatedValueMMBTUD) || '',
                accessorFn: (row: any) => {
                    const raw = row?.nominatedValueMMBTUD;
                    if (!raw) return '';

                    const fixed = formatNumberFourDecimal(raw); // เช่น 10,000.0000
                    const noComma = fixed.replace(/,/g, '');    // เช่น 10000.0000
                    const rounded = parseFloat(raw).toString(); // เช่น 10000

                    return `${fixed} ${noComma} ${rounded}`;
                },
                sortDescFirst: true,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="text-right">{row?.nominatedValueMMBTUD ? formatNumberThreeDecimal(row?.nominatedValueMMBTUD) : '0.000'}</div>
                    )
                }
            },
            {
                accessorKey: "overusage",
                header: "Overusage (MMBTU/D)",
                enableSorting: true,
                // accessorFn: (row: any) => formatNumberThreeDecimal(row?.overusageMMBTUD) || '',
                accessorFn: (row: any) => {
                    const raw = row?.overusageMMBTUD;
                    if (!raw) return '';

                    const fixed = formatNumberFourDecimal(raw); // เช่น 10,000.0000
                    const noComma = fixed.replace(/,/g, '');    // เช่น 10000.0000
                    const rounded = parseFloat(raw).toString(); // เช่น 10000

                    return `${fixed} ${noComma} ${rounded}`;
                },
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="text-right">{row?.overusageMMBTUD ? formatNumberThreeDecimal(row?.overusageMMBTUD) : '0.000'}</div>
                    )
                }
            },
            {
                accessorKey: "imbalance",
                header: "Imbalance (MMBTU/D)",
                enableSorting: true,
                // accessorFn: (row: any) => formatNumberThreeDecimal(row?.imbalanceMMBTUD) || '',
                accessorFn: (row: any) => {
                    const raw = row?.imbalanceMMBTUD;
                    if (!raw) return '';

                    const fixed = formatNumberFourDecimal(raw); // เช่น 10,000.0000
                    const noComma = fixed.replace(/,/g, '');    // เช่น 10000.0000
                    const rounded = parseFloat(raw).toString(); // เช่น 10000

                    return `${fixed} ${noComma} ${rounded}`;
                },
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="text-right">{row?.imbalanceMMBTUD ? formatNumberThreeDecimal(row?.imbalanceMMBTUD) : '0.000'}</div>
                    )
                }
            },
            {
                accessorKey: "action",
                id: 'actions',
                header: "Action",
                align: 'center',
                enableSorting: false,
                size: 100,
                cell: (info) => {
                    const row: any = info?.row?.original;
                    return (
                        <BtnActionTable
                            togglePopover={togglePopover}
                            row_id={row?.id}
                            // disable={userPermission?.f_view == true && userPermission?.f_edit == true ? false : true}
                            disable={userPermission?.b_manage ? false : true}
                        />
                    )
                }
            },
        ],
        [userPermission, user_permission, tabIndex, subTabIndex]
    )

    const columnsWeekly = useMemo<ColumnDef<any>[]>(
        () => [
            {
                accessorKey: "gas_day",
                header: "Gas Day",
                enableSorting: true,
                accessorFn: (row: any) => {
                    return (
                        row?.gas_day_text && subTabIndex < 7 ?
                            dayjs(row.gas_day_text, "DD/MM/YYYY")?.add(subTabIndex, "day")?.format("DD/MM/YYYY")
                            : dayjs(row.gas_day_text, "DD/MM/YYYY")?.add(subTabIndex, "day")?.format("DD/MM/YYYY")
                            || row?.gas_day_text || ''
                    )
                },
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>
                            {row?.gas_day_text && subTabIndex < 7 ?
                                dayjs(row.gas_day_text, "DD/MM/YYYY")?.add(subTabIndex, "day")?.format("DD/MM/YYYY")
                                : row?.gas_day_text ?? ''}
                        </div>
                    )
                }
            },
            {
                accessorKey: "shipper_name",
                header: "Shipper Name",
                enableSorting: true,
                accessorFn: (row: any) => row?.shipper_name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>{row?.shipper_name ? row?.shipper_name : ''}</div>
                    )
                }
            },
            {
                accessorKey: "capacity_right",
                header: "Capacity Right (MMBTU/D)",
                enableSorting: true,
                // accessorFn: (row: any) => {
                //     return (
                //         subTabIndex < 7 ?
                //             formatNumberFourDecimal(row?.weeklyDay?.[["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][subTabIndex]]?.capacityRightMMBTUD)
                //             : formatNumberFourDecimal(row?.capacityRightMMBTUD)
                //             || ''
                //     )
                // },
                accessorFn: (row: any) => {
                    const dayKeys = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

                    // เลือกแหล่งค่า raw ตาม subTabIndex
                    const rawSrc = subTabIndex < 7 ? row?.weeklyDay?.[dayKeys[subTabIndex]]?.capacityRightMMBTUD : row?.capacityRightMMBTUD;

                    // อนุญาต 0 แต่ตัด null/undefined ออก
                    if (rawSrc == null) return "";

                    // แปลงเป็น number รองรับสตริงมีคอมมา/ช่องว่าง
                    const num =
                        typeof rawSrc === "number"
                            ? rawSrc
                            : Number(String(rawSrc).replace(/,/g, "").trim());

                    if (!Number.isFinite(num)) return "";

                    const fixed = formatNumberFourDecimal(num);     // เช่น "10,000.0000"
                    const noComma = fixed.replace(/,/g, "");          // เช่น "10000.0000"
                    const rounded = parseFloat(noComma).toString();   // เช่น "10000"

                    return `${fixed} ${noComma} ${rounded}`;
                },
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="text-right">{
                            subTabIndex < 7 ?
                                formatNumberFourDecimal(row?.weeklyDay?.[
                                    ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][subTabIndex]
                                ]?.capacityRightMMBTUD) ?? "0.000"
                                : formatNumberFourDecimal(row?.capacityRightMMBTUD) ?? "0.000"
                        }</div>
                    )
                }
            },
            {
                accessorKey: "nominated_value",
                header: "Nominated Value (MMBTU/D)",
                enableSorting: true,
                // accessorFn: (row: any) => {
                //     return (
                //         subTabIndex < 7 ?
                //             formatNumberFourDecimal(row?.weeklyDay?.[["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][subTabIndex]]?.nominatedValueMMBTUD)
                //             : formatNumberFourDecimal(row?.nominatedValueMMBTUD)
                //             || ''
                //     )
                // },
                accessorFn: (row: any) => {
                    const dayKeys = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
                    const rawSrc = subTabIndex < 7 ? row?.weeklyDay?.[dayKeys[subTabIndex]]?.nominatedValueMMBTUD : row?.nominatedValueMMBTUD;
                    if (rawSrc == null) return "";

                    const num =
                        typeof rawSrc === "number"
                            ? rawSrc
                            : Number(String(rawSrc).replace(/,/g, "").trim());

                    if (!Number.isFinite(num)) return "";

                    const fixed = formatNumberFourDecimal(num);     // เช่น "10,000.0000"
                    const noComma = fixed.replace(/,/g, "");          // เช่น "10000.0000"
                    const rounded = parseFloat(noComma).toString();   // เช่น "10000"

                    return `${fixed} ${noComma} ${rounded}`;
                },
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="text-right">{
                            subTabIndex < 7 ?
                                formatNumberFourDecimal(row?.weeklyDay?.[
                                    ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][subTabIndex]
                                ]?.nominatedValueMMBTUD) ?? "0.000"
                                : formatNumberFourDecimal(row?.nominatedValueMMBTUD) ?? "0.000"
                        }</div>
                    )
                }
            },
            {
                accessorKey: "overusage",
                header: "Overusage (MMBTU/D)",
                enableSorting: true,
                // accessorFn: (row: any) => {
                //     return (
                //         subTabIndex < 7 ?
                //             formatNumberFourDecimal(row?.weeklyDay?.[["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][subTabIndex]]?.overusageMMBTUD)
                //             : formatNumberFourDecimal(row?.overusageMMBTUD)
                //             || ''
                //     )
                // },
                accessorFn: (row: any) => {
                    const dayKeys = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
                    const rawSrc = subTabIndex < 7 ? row?.weeklyDay?.[dayKeys[subTabIndex]]?.overusageMMBTUD : row?.overusageMMBTUD;
                    if (rawSrc == null) return "";

                    const num =
                        typeof rawSrc === "number"
                            ? rawSrc
                            : Number(String(rawSrc).replace(/,/g, "").trim());

                    if (!Number.isFinite(num)) return "";

                    const fixed = formatNumberFourDecimal(num);     // เช่น "10,000.0000"
                    const noComma = fixed.replace(/,/g, "");          // เช่น "10000.0000"
                    const rounded = parseFloat(noComma).toString();   // เช่น "10000"

                    return `${fixed} ${noComma} ${rounded}`;
                },
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="text-right">{
                            subTabIndex < 7 ?
                                formatNumberFourDecimal(row?.weeklyDay?.[
                                    ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][subTabIndex]
                                ]?.overusageMMBTUD) ?? "0.000"
                                : formatNumberFourDecimal(row?.overusageMMBTUD) ?? "0.000"
                        }</div>
                    )
                }
            },
            {
                accessorKey: "imbalance",
                header: "Imbalance (MMBTU/D)",
                enableSorting: true,
                // accessorFn: (row: any) => {
                //     return (
                //         subTabIndex < 7 ?
                //             formatNumberFourDecimal(row?.weeklyDay?.[["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][subTabIndex]]?.imbalanceMMBTUD)
                //             : formatNumberFourDecimal(row?.imbalanceMMBTUD)
                //             || ''
                //     )
                // },
                accessorFn: (row: any) => {
                    const dayKeys = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
                    const rawSrc = subTabIndex < 7 ? row?.weeklyDay?.[dayKeys[subTabIndex]]?.imbalanceMMBTUD : row?.imbalanceMMBTUD;
                    if (rawSrc == null) return "";

                    const num =
                        typeof rawSrc === "number"
                            ? rawSrc
                            : Number(String(rawSrc).replace(/,/g, "").trim());

                    if (!Number.isFinite(num)) return "";

                    const fixed = formatNumberFourDecimal(num);     // เช่น "10,000.0000"
                    const noComma = fixed.replace(/,/g, "");          // เช่น "10000.0000"
                    const rounded = parseFloat(noComma).toString();   // เช่น "10000"

                    return `${fixed} ${noComma} ${rounded}`;
                },
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="text-right">{
                            subTabIndex < 7 ?
                                formatNumberFourDecimal(row?.weeklyDay?.[
                                    ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][subTabIndex]
                                ]?.imbalanceMMBTUD) ?? "0.000"
                                : formatNumberFourDecimal(row?.imbalanceMMBTUD) ?? "0.000"
                        }</div>
                    )
                }
            },
            {
                accessorKey: "action",
                id: 'actions',
                header: "Action",
                align: 'center',
                enableSorting: false,
                size: 100,
                cell: (info) => {
                    const row: any = info?.row?.original;
                    const tabIDX: any = row?.tabIndex;
                    return (
                        <BtnActionTable
                            togglePopover={togglePopover}
                            row_id={row?.id}
                            // disable={userPermission?.f_view == true && userPermission?.f_edit == true ? false : true}
                            disable={userPermission?.b_manage ? false : true}
                            subTabIndexview={tabIDX}
                        />
                    )
                }
            },
        ],
        [userPermission, user_permission, tabIndex, subTabIndex]
    )

    const toggleMenu = (mode: any, id: any) => {

        switch (mode) {
            case "view":
                openViewForm(id);
                setOpenPopoverId(null); // close popover
                setAnchorPopover(null);
                break;
        }
    }

    //#region logFilter
    const [selectprops, setselectprops] = useState([
        {
            id: 0,
            gas_props: dayjs().add(1, "day").toDate(),
            shipper: null,
        },
        {
            id: 1,
            gas_props: dayjs().add(1, "day").toDate(),
            shipper: null,
        },
        {
            id: 2,
            gas_props: new Date(getCurrentWeekSundayYyyyMmDd()),
            shipper: null,
        }
    ])

    const onchangeGasdate: any = (e: any, tabidx: any) => {
        let value = e ? e : null;
        setSrchStartDate(value ? value : '');
        settk(!tk);
        if (!value) {
            setKey((prevKey) => prevKey + 1);
        }
    }

    return (
        <div className=" space-y-2">

            {/* TABLE MAIN */}
            {
                !viewOpen && <>
                    <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl  flex flex-col sm:flex-row gap-2">
                        <aside className="flex flex-wrap sm:flex-row gap-2 w-full">
                            <DatePickaSearch
                                defaultValue={srchStartDate}
                                key={"start" + key}
                                label={tabIndex == 0 || tabIndex == 1 ? "Gas Day" : "Gas Week"}
                                modeSearch={tabIndex == 0 || tabIndex == 1 ? "xx" : "sunday"}
                                placeHolder={tabIndex == 0 || tabIndex == 1 ? "Select Gas Day" : "Select Gas Week"}
                                allowClear
                                // isGasWeek={tabIndex == 2 ? true : false}
                                // isDefaultTomorrow={tabIndex == 0 || tabIndex == 1 ? true : false} // https://app.clickup.com/t/86etbwtz0 R : Tab Daily > List > Filter Gas Day Default เป็น D+1 || https://app.clickup.com/t/86ettjxmk Daily/Weekly > List > ยังไม่ Default D+1
                                // onChange={(e: any) => setSrchStartDate(e ? e : null)}
                                onChange={(e: any) => {
                                    let value: any = e ? e : null
                                    setSrchStartDate(value ? value : '')
                                    // onchangeGasdate(value, tabIndex)
                                }}
                            // isDefaultTomorrow={true}
                            />

                            <InputSearch
                                id="searchShipper"
                                label="Shipper Name"
                                type="select"
                                value={srchShipper}
                                // onChange={(e) => setSrchShipper(e.target.value)}
                                isDisabled={userDT?.account_manage?.[0]?.user_type_id == 3 ? true : false}
                                onChange={(e) => {
                                    setSrchShipper(e.target.value)
                                }}
                                options={dataShipper?.filter((item: any) =>
                                    userDT?.account_manage?.[0]?.user_type_id == 3
                                        ? item?.id === userDT?.account_manage?.[0]?.group?.id
                                        : true
                                ).map((item: any) => ({
                                    value: item.name,
                                    label: item.name,
                                }))
                                }
                            />

                            {/* <BtnSearch handleFieldSearch={handleFieldSearch} /> */}
                            <BtnSearch handleFieldSearch={handleFieldSearchNew} />
                            <BtnReset handleReset={() => handleReset(tabIndex)} />
                        </aside>
                        <aside className="mt-auto ml-1 w-full sm:w-auto">
                            {/* BtnGeneral */}
                        </aside>
                    </div>

                    <Tabs
                        value={tabIndex}
                        onChange={handleChange}
                        aria-label="tabs"
                        sx={{
                            marginBottom: "-19px !important",
                            "& .MuiTabs-indicator": {
                                display: "none", // Remove the underline
                            },
                            "& .Mui-selected": {
                                color: "#58585A !important",
                            },
                        }}
                    >
                        {
                            ["Daily/Weekly", "Daily", "Weekly"]?.map((label, index) => (
                                <Tab
                                    key={label}
                                    label={label}
                                    id={`tab-${index}`}
                                    sx={{
                                        fontFamily: "Tahoma !important",
                                        border: "0.5px solid",
                                        borderColor: "#DFE4EA",
                                        borderBottom: "none",
                                        borderTopLeftRadius: "9px",
                                        borderTopRightRadius: "9px",
                                        textTransform: "none",
                                        padding: "8px 16px",
                                        backgroundColor: tabIndex === index ? "#FFFFFF" : "#9CA3AF1A",
                                        color: tabIndex === index ? "#58585A" : "#9CA3AF",
                                        "&:hover": {
                                            backgroundColor: "#F3F4F6",
                                        },
                                    }}
                                />
                            ))
                        }
                    </Tabs>

                    <div className="border-[#DFE4EA] border-[1px] p-4 rounded-tl-none rounded-xl shadow-sm">
                        {
                            !isLoading ? (
                                <TableSkeleton />
                            ) : tabIndex == 0 ? (
                                <>
                                    {/* <TableAll
                                        tableData={paginatedData}
                                        isLoading={isLoading}
                                        gasWeekFilter={srchStartDate}
                                        columnVisibility={columnVisibility}
                                        userPermission={userPermission}
                                        subTabIndex={subTabIndex}
                                        openViewForm={openViewForm}
                                    /> */}

                                    {/* ================== NEW TABLE ==================*/}
                                    <AppTable
                                        data={filteredDataTable}
                                        columns={columns}
                                        isLoading={isLoading}
                                        exportBtn={
                                            // <BtnExport
                                            //     textRender={"Export"}
                                            //     specificMenu={'shipper-nomination-report'}
                                            //     data={dataExport}
                                            //     type={1}
                                            //     path="nomination/shipper-nomination-report"
                                            //     gasDay={srchStartDate}
                                            //     can_export={userPermission ? userPermission?.f_export : false} columnVisibility={columnVisibility} initialColumns={initialColumns}
                                            //     specificData={
                                            //         {
                                            //             'tabIndex': tabIndex, // all, daily, weekly
                                            //             'day': subTabIndex // ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", 'All']
                                            //         }
                                            //     }
                                            // />

                                            <BtnGeneral
                                                bgcolor={"#24AB6A"}
                                                modeIcon={'export'}
                                                textRender={"Export"}
                                                generalFunc={() => exportToExcel(filteredDataTable, "shipper-nom-report-tab-0", columnVisibility)}
                                                can_export={userPermission ? userPermission?.f_export : false}
                                            />
                                        }
                                        initialColumns={Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))}
                                        onColumnVisibilityChange={(columnKey: any) => handleColumnToggle(columnKey)}
                                        onFilteredDataChange={(filteredData: any) => {
                                            const newData = filteredData || [];
                                            // Check if the filtered data is different from current dataExport
                                            if (JSON.stringify(dataExport) !== JSON.stringify(newData)) {
                                                setDataExport(newData);
                                            }
                                        }}
                                        border={false}
                                        fixHeight={false}
                                    />
                                </>
                            ) : tabIndex == 1 ? (
                                <AppTable
                                    data={filteredDataTable}
                                    columns={columns}
                                    isLoading={isLoading}
                                    exportBtn={
                                        <BtnExport
                                            textRender={"Export"}
                                            specificMenu={'shipper-nomination-report'}
                                            data={dataExport}
                                            type={2}
                                            path="nomination/shipper-nomination-report"
                                            gasDay={srchStartDate}
                                            can_export={userPermission ? userPermission?.f_export : false} columnVisibility={columnVisibility} initialColumns={initialColumns}
                                            specificData={
                                                {
                                                    'tabIndex': tabIndex, // all, daily, weekly
                                                    'day': subTabIndex // ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
                                                }
                                            }
                                        />
                                    }
                                    initialColumns={Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))}
                                    onColumnVisibilityChange={(columnKey: any) => handleColumnToggle(columnKey)}
                                    onFilteredDataChange={(filteredData: any) => {
                                        const newData = filteredData || [];
                                        // Check if the filtered data is different from current dataExport
                                        if (JSON.stringify(dataExport) !== JSON.stringify(newData)) {
                                            setDataExport(newData);
                                        }
                                    }}
                                    border={false}
                                    fixHeight={false}
                                />

                            ) : tabIndex == 2 ? (
                                <AppTable
                                    // data={subTabIndex == 7 ? filteredDataTable[0] && filteredDataTable[0]?.weeklyDay :filteredDataTable}
                                    data={subTabIndex == 7 ? filtered_weekly_all : filteredDataTable}
                                    columns={columnsWeekly}
                                    isLoading={isLoading}
                                    filterProps={
                                        tabIndex === 2 && (
                                            <Tabs
                                                value={subTabIndex}
                                                onChange={handleChangeSubTab}
                                                aria-label="wrapped label tabs example"
                                                sx={{
                                                    '& .Mui-selected': {
                                                        color: '#00ADEF !important',
                                                        fontWeight: 'bold !important',
                                                    },
                                                    '& .MuiTabs-indicator': {
                                                        backgroundColor: '#00ADEF !important',
                                                        width: '59px !important',
                                                        transform: 'translateX(17%)',
                                                        bottom: '10px',
                                                    },
                                                    '& .MuiTab-root': {
                                                        minWidth: 'auto !important',
                                                    },
                                                }}
                                            >
                                                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'All'].map((label, index) => (
                                                    <Tab
                                                        key={label}
                                                        label={label}
                                                        id={`tab-${index}`}
                                                        sx={{
                                                            fontFamily: 'Tahoma !important',
                                                            textTransform: 'none',
                                                            padding: '8px 16px',
                                                            minWidth: '35px',
                                                            maxWidth: '80px',
                                                            flexShrink: 0,
                                                            color: subTabIndex === index ? '#58585A' : '#9CA3AF',
                                                        }}
                                                    />
                                                ))}
                                            </Tabs>
                                        )
                                    }
                                    exportBtn={
                                        <BtnExport
                                            textRender={"Export"}
                                            specificMenu={'shipper-nomination-report'}
                                            data={dataExport}
                                            type={3}
                                            path="nomination/shipper-nomination-report"
                                            gasDay={srchStartDate}
                                            can_export={userPermission ? userPermission?.f_export : false} columnVisibility={columnVisibility} initialColumns={initialColumns}
                                            specificData={
                                                {
                                                    'tabIndex': tabIndex, // all, daily, weekly
                                                    'day': subTabIndex // ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
                                                }
                                            }
                                        />
                                    }
                                    initialColumns={Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))}
                                    onColumnVisibilityChange={(columnKey: any) => handleColumnToggle(columnKey)}
                                    onFilteredDataChange={(filteredData: any) => {
                                        const newData = filteredData || [];
                                        // Check if the filtered data is different from current dataExport
                                        if (JSON.stringify(dataExport) !== JSON.stringify(newData)) {
                                            setDataExport(newData);
                                        }
                                    }}
                                    border={false}
                                    fixHeight={false}
                                />
                            ) : (
                                <></>
                            )
                        }
                    </div>
                </>
            }


            {/* VIEW PAGE */}
            {
                viewOpen && <ViewPage
                    userPermission={userPermission}
                    tableData={viewDataMain}
                    setViewOpen={setViewOpen}
                    subTabIndex={subTabIndex} // ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
                    tabIndex={tabIndex} // all, daily, weekly
                    subTabIndexview={subTabIndexview}
                />
            }

            <ModalComponent
                open={isModalSuccessOpen}
                handleClose={handleCloseModal}
                title="Success"
                description={`${modalModalSuccessMsg}`}
            />

            <ModalComponent
                open={isModalErrorOpen}
                handleClose={() => {
                    setModalErrorOpen(false);
                    if (resetForm) resetForm();
                }}
                title="Failed"
                description={
                    <div>
                        <div className="text-center">
                            {`${modalErrorMsg}`}
                        </div>
                    </div>
                }
                stat="error"
            />

            <ColumnVisibilityPopover
                open={openIntraday}
                anchorEl={anchorElIntraday}
                setAnchorEl={setAnchorElIntraday}
                columnVisibility={columnVisibilityIntraday}
                handleColumnToggle={handleColumnToggleIntraday}
                // initialColumns={initialColumnsTabIntraday}
                initialColumns={visibleColumns}
            />

            <ColumnVisibilityPopover
                open={open}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                columnVisibility={columnVisibility}
                handleColumnToggle={handleColumnToggle}
                initialColumns={initialColumns}
            />

            <Popover
                id="action-menu-popover"
                open={!!anchorPopover}
                anchorEl={anchorPopover}
                onClose={() => setAnchorPopover(null)}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                sx={{
                    borderRadius: '20px',
                    overflow: 'hidden',
                }}
                className="z-50"
            >
                <div ref={popoverRef} className="w-50 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                    <ul className="py-2">
                        {
                            userPermission?.b_manage && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("view", openPopoverId) }}><RemoveRedEyeOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`View`}</li>
                        }
                    </ul>
                </div>
            </Popover>
        </div>
    );
};

export default ClientPage;