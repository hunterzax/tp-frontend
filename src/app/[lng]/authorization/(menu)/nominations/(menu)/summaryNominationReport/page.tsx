"use client";
import { useEffect, useMemo, useState } from "react";
import { findRoleConfigByMenuName, formatDateNoTime, generateUserPermission, getCurrentWeekDatesYyyyMmDd, getCurrentWeekDatesYyyyMmDdFromDate, getCurrentWeekSundayYyyyMmDd, getNextWeekSundayYyyyMmDd, getWeekDatesFromStartDate, toDayjs } from '@/utils/generalFormatter';
import { getService, postService, putService, uploadFileServiceWithAuth, uploadFileServiceWithAuth2 } from "@/utils/postService";
import { useFetchMasters } from "@/hook/fetchMaster";
import { useAppDispatch } from "@/utils/store/store";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { decryptData, encryptData } from "@/utils/encryptionData";
import BtnNomination from "@/components/other/btnNomination";
import { fetchAreaMaster } from "@/utils/store/slices/areaMasterSlice";
import { fetchZoneMasterSlice } from "@/utils/store/slices/zoneMasterSlice";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import CheckboxSearch2, { CheckboxSearch } from "@/components/other/SearchForm";
import FrameTable from "./form/frameTable";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import Spinloading from "@/components/other/spinLoading";
import getUserValue from "@/utils/getuserValue";
import { useSearchParams } from "next/navigation";

dayjs.extend(utc);
dayjs.extend(timezone);

interface ClientProps {
    // params: {
    //     lng: string;
    // };
}

const ClientPage: React.FC<ClientProps> = () => {

    // route มาจาก nomination dashboard
    const searchParams = useSearchParams();
    const filter_gas_day_from_somewhere_else: any = searchParams.get("filter_gas_day");
    const filter_tab_from_somewhere_else: any = searchParams.get("tab_filter");

    // All > Area > Imbalance > Check Box Over Total Cap สามารถปิดได้มั้ย เพราะว่าแถบนี้ไม่ได้ใช้ฟังก์ชั่น https://app.clickup.com/t/86ettyub8
    const [checkIsAllAreaImbalance, setCheckIsAllAreaImbalance] = useState<any>(false);
    const [dataTable, setData] = useState<any>([]);

    // ############### Check Authen ###############
    const userDT: any = getUserValue();
    const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
    useRestrictedPage(token);

    // ############### PERMISSION ###############
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
                const permission = findRoleConfigByMenuName('Summary Nomination Report', userDT)
                setUserPermission(permission);
            }
        } catch (error) {
            // Failed to parse user_permission:
        }
    }

    // ############### CHECK ว่ามาจากหน้า nomination dashboard ป่าว ###############
    const [dashboardObj, setDashboardObj] = useState<any>();

    const checkIsRouted = async () => {
        const storedDashboard = localStorage.getItem("nom_dashboard_route_quantity_obj");
        const dashboardObject = storedDashboard ? JSON.parse(storedDashboard) : null;

        if (dashboardObject) {
            setDashboardObj(dashboardObject)

            // set วันที่ช่อง filter Gas Day
            let formattedGasDay = new Date(toDayjs(dashboardObject?.gas_day).format("YYYY-MM-DD"));
            setSrchStartDate(formattedGasDay)

            // auto เปิดไป tab นั้น ๆ
            if (dashboardObject?.tab == 'daily') {
                setActiveButton(3)
            } else {
                setActiveButton(2)
            }

            const gas_gas_day = toDayjs(dashboardObject?.gas_day).format('DD/MM/YYYY'); // format '25/05/2025'

            const response: any = await getService(`/master/summary-nomination-report?gas_day_text=${gas_gas_day}`);

            const filteredMock = {
                ...response,
                nomination: {
                    ...response.nomination,
                    daily: {
                        ...response?.nomination.daily,
                        MMSCFD: response?.nomination?.daily?.MMSCFD?.filter(
                            (item: any) => item?.gas_day_text === gas_gas_day
                        ),
                        MMBTUD: response?.nomination?.daily?.MMBTUD?.filter(
                            (item: any) => item?.gas_day_text === gas_gas_day
                        ),
                    },

                },
                area: {
                    ...response.area,
                    daily: {
                        ...response.area.daily,
                        MMBTUD: response?.area.daily?.MMBTUD?.filter(
                            (item: any) => item?.gas_day_text === gas_gas_day
                        ),
                        Imbalance: response?.area.daily.Imbalance?.filter(
                            (item: any) => item?.gas_day_text === gas_gas_day
                        ),
                    },

                },
                total: {
                    ...response.total,
                    daily: response?.total.daily?.filter((item: any) => item?.gas_day_text === gas_gas_day),
                },
            };

            setData(response);
            setFilteredDataTable(filteredMock);

            setIsLoading(true)

            // มาถึง filter เสร็จสรรพ ลบทิ้งเลย
            localStorage.removeItem("nom_dashboard_route_quantity_obj")
        }
    }

    useEffect(() => {
        const storedDashboard = localStorage.getItem("nom_dashboard_route_quantity_obj");
        const dashboardObject = storedDashboard ? JSON.parse(storedDashboard) : null;

        if (dashboardObject) {
            setDashboardObj(dashboardObject)

            // set วันที่ช่อง filter Gas Day
            let formattedGasDay = new Date(toDayjs(dashboardObject?.gas_day).format("YYYY-MM-DD"));
            setSrchStartDate(formattedGasDay)
        }
    }, [])

    const [dataNomCodeX, setDataNomCodeX] = useState<any>(null);

    // ############### REDUX DATA ###############
    const { zoneMaster, areaMaster } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const dispatch = useAppDispatch();

    useEffect(() => {

        if (forceRefetch || !areaMaster?.data) {
            dispatch(fetchAreaMaster());
        }
        if (forceRefetch || !zoneMaster?.data) {
            dispatch(fetchZoneMasterSlice());
        }
        // Reset forceRefetch after fetching
        if (forceRefetch) {
            setForceRefetch(false); // Reset the flag after triggering the fetch
        }
        getPermission();
    }, [dispatch, forceRefetch, areaMaster, zoneMaster]); // Watch for forceRefetch changes

    // ############### DATA TABLE ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [dataNomPointMaster, setDataNomPointMaster] = useState<any>([]);

    const fetchData = async (active_btn?: any) => {

        setTimeout(() => {
            setIsLoading(false)
        }, 300);

        try {
            const today = toDayjs();

            // DATA NOMINATION POINT
            const response_nom_point: any = await getService(`/master/asset/nomination-point`);
            const activeNominationPoints = response_nom_point.filter((point: any) => {
                const startDate = point?.start_date ? toDayjs(point?.start_date) : null;
                const endDate = point?.end_date ? toDayjs(point?.end_date) : null;

                if (startDate && today.isBefore(startDate, 'day')) {
                    return false;
                }
                if (endDate && today.isAfter(endDate, 'day')) {
                    return false;
                }
                return true;
            });
            setDataNomPointMaster(activeNominationPoints)

            const storedDashboard = localStorage.getItem("nom_dashboard_route_quantity_obj");
            if (storedDashboard !== null) {
                checkIsRouted();
            } else {
                let days_of_this_week = getCurrentWeekDatesYyyyMmDd(); // ใช้กับข้อมูล tab weekly --> area --> imbalance

                // activeButton == 1 || activeButton == 3 ให้ filter gas_day tomorrow
                const tomorrowText = dayjs().add(1, 'day').format('DD/MM/YYYY');

                // const response: any = await getService(`/master/summary-nomination-report?gas_day_text=${days_of_this_week?.[0]}`);
                const response: any = await getService(`/master/summary-nomination-report?gas_day_text=${tomorrowText}`);

                let date_next_week: any = getCurrentWeekSundayYyyyMmDd() // วันอาทิตย์ของวีคนี้

                if (active_btn == 2) { // weekly 
                    // date_next_week = getNextWeekSundayYyyyMmDd(); // วันอาทิตย์ของวีคหน้า
                    date_next_week = getCurrentWeekSundayYyyyMmDd(); // วันอาทิตย์ของวีคหน้า
                }

                // const date_next_week = getNextWeekSundayYyyyMmDd() // วันอาทิตย์ของวีคหน้า
                // const date_next_week = getCurrentWeekSundayYyyyMmDd() // วันอาทิตย์ของวีคนี้

                const response_default_gas_week: any = await getService(`/master/summary-nomination-report?gas_day_text=${dayjs(date_next_week, "YYYY-MM-DD").format("DD/MM/YYYY")}`);

                // ของเดิม ของดี เก็บไว้ก่อน
                // const filteredMock = {
                //     ...response,
                //     nomination: {
                //         ...response.nomination,
                //         daily: {
                //             ...response?.nomination.daily,
                //             MMSCFD: response?.nomination.daily.MMSCFD.filter(
                //                 (item: any) => item.gas_day_text === tomorrowText
                //             ),
                //             MMBTUD: response?.nomination.daily.MMBTUD.filter(
                //                 (item: any) => item.gas_day_text === tomorrowText
                //             ),
                //         },
                //     },
                //     area: {
                //         ...response.area,
                //         daily: {
                //             ...response.area.daily,
                //             MMBTUD: response?.area.daily.MMBTUD.filter(
                //                 (item: any) => item.gas_day_text === tomorrowText
                //             ),
                //             Imbalance: response?.area.daily.Imbalance.filter(
                //                 (item: any) => item.gas_day_text === tomorrowText
                //             ),
                //         },
                //         weekly: {
                //             ...response.area.weekly,
                //             Imbalance: response?.area.weekly.Imbalance.filter(
                //                 (item: any) => days_of_this_week.includes(item.gas_day_text)
                //             ),
                //         },
                //     },
                //     total: {
                //         ...response.total,
                //         daily: response?.total.daily.filter((item: any) => item.gas_day_text === tomorrowText),
                //     },
                // };

                const filteredMock = {
                    ...response,
                    nomination: {
                        ...response?.nomination,
                        daily: {
                            ...response?.nomination.daily,
                            MMSCFD: response?.nomination.daily.MMSCFD.filter(
                                (item: any) => item?.gas_day_text === tomorrowText
                            ),
                            MMBTUD: response?.nomination.daily.MMBTUD.filter(
                                (item: any) => item?.gas_day_text === tomorrowText
                            ),
                        },
                        weekly: {
                            ...response_default_gas_week?.nomination.weekly,
                            MMSCFD: response_default_gas_week?.nomination.weekly.MMSCFD.filter(
                                (item: any) => item?.gas_day_text === dayjs(date_next_week, "YYYY-MM-DD").format("DD/MM/YYYY")
                            ),
                            MMBTUD: response_default_gas_week?.nomination.weekly.MMBTUD.filter(
                                (item: any) => item?.gas_day_text === dayjs(date_next_week, "YYYY-MM-DD").format("DD/MM/YYYY")
                            ),
                        },
                    },
                    area: {
                        ...response?.area,
                        daily: {
                            ...response?.area?.daily,
                            MMBTUD: response?.area.daily.MMBTUD.filter(
                                (item: any) => item?.gas_day_text === tomorrowText
                            ),
                            Imbalance: response?.area.daily.Imbalance.filter(
                                (item: any) => item?.gas_day_text === tomorrowText
                            ),
                        },
                        weekly: {
                            ...response_default_gas_week?.area.weekly,
                            // Imbalance: response_default_gas_week?.area.weekly.Imbalance.filter(
                            //     (item: any) => days_of_this_week.includes(item.gas_day_text)
                            // ),
                            Imbalance: response_default_gas_week?.area?.weekly?.Imbalance,
                        },
                    },
                    total: {
                        // ...response.total,
                        ...response_default_gas_week?.total,
                        // daily: response?.total.daily.filter((item: any) => item.gas_day_text === tomorrowText),
                        daily: response?.total.daily,
                        // weekly: response_default_gas_week?.total.weekly.filter((item: any) => item.gas_day_text === dayjs(date_next_week, "YYYY-MM-DD").format("DD/MM/YYYY")),
                        weekly: response_default_gas_week?.total.weekly,
                    },
                };

                setData(response);
                // setFilteredDataTable(response);
                setFilteredDataTable(filteredMock);

                setTimeout(() => {
                    setIsLoading(true);
                }, 1500);
            }

        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // useEffect(() => {
    //     if (filteredDataTable) {
    //         setPaginatedData(filteredDataTable.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
    //     }
    // }, [filteredDataTable, currentPage, itemsPerPage])

    // ############### COLUMN SHOW/HIDE EACH ZONE ###############
    const initialColumnsTabEntryExit: any = [
        { key: 'supply_demand', label: 'Supply/Demand', visible: true },
        { key: 'area', label: 'Area', visible: true },
        { key: 'nomination_point', label: 'Nomination Point', visible: true },
        { key: 'unit', label: 'Unit', visible: true },
        { key: 'type', label: 'Type', visible: true },
        { key: 'entry_exit', label: 'Entry/Exit', visible: true },
        { key: 'wi', label: 'WI', visible: true },
        { key: 'hv', label: 'HV', visible: true },
        { key: 'sg', label: 'SG', visible: true },
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
        { key: 'total', label: 'Total', visible: true },
        { key: 'edit', label: 'Edit', visible: true },
    ];

    const [columnVisibilityEntryExit, setColumnVisibilityEntryExit] = useState<any>(
        Object.fromEntries(initialColumnsTabEntryExit.map((column: any) => [column.key, column.visible]))
    );

    // ############### CHANGE TAB HANDLE ###############
    const [activeButton, setActiveButton] = useState<number | null>(null);
    const handleClick = (id: number | undefined, row_id?: number) => {
        // if (!userPermission?.f_view) return;
        handleReset(id); // Daily > Filter Gas Day ถ้าไป Filter จาก All มาก่อนหน้า แล้วกดไป Tab ของ Daily ข้อมูลและ filter จะค้างของจากหน้า All) พอกดกลับไปกลับมา ตรง filter gas day default กลับไปค่าตั้งต้น แต่ข้อมูลยังค้างอยู่ที่เดิม ตามคลิป https://app.clickup.com/t/86etzchdr

        setActiveButton(id || null);
        // openSubmissionModal(row_id);
    };

    const buttons = useMemo(() => {
        const baseButtons = [
            { text: "All", id: 1 },
            { text: "Weekly", id: 2 },
            { text: "Daily", id: 3 }
        ];
        setActiveButton(1)
        return [...baseButtons];
    }, [dataNomCodeX?.nomination_version[0].nomination_row_json]);

    // ############### FIELD SEARCH ###############
    const [key, setKey] = useState(0);
    // const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
    const [srchStartDate, setSrchStartDate] = useState<Date | null>(dayjs().tz("Asia/Bangkok").add(1, "day").toDate());
    const [srchCheckbox, setSrchCheckbox] = useState(false);
    const [isChangeSearchStartDate, setIsChangeSearchStartDate] = useState(false); // เอาไว้ใช้ตอนกดเสิช
    const [dataSearch, setDataSearch] = useState<any>([]);
    const [isResetClick, setIsResetClick] = useState<boolean>(false);

    // const fetchSearch = async () => {

    //     setIsLoading(false)
    //     if (srchStartDate) { // กดเสิช เคส all กับ daily
    //         const searchDate = dayjs(srchStartDate).format('DD/MM/YYYY');
    //         const response: any = await getService(`/master/summary-nomination-report?gas_day_text=${searchDate}`);

    //         if (response) {
    //             // setData(response);
    //             setDataSearch(response);
    //             setData(response)
    //             // setFilteredDataTable(response);
    //             setIsLoading(true); // แสดงผลเมื่อได้ response จริง
    //         }

    //         setTimeout(() => {
    //             setIsLoading(true)
    //         }, 1000);

    //         return response
    //     } else {
    //         const searchDate = dayjs().format('DD/MM/YYYY');
    //         const response: any = await getService(`/master/summary-nomination-report?gas_day_text=${searchDate}`);

    //         if (response) {
    //             // setData(response);
    //             setDataSearch(response);
    //             setData(response)
    //             // setFilteredDataTable(response);
    //             setIsLoading(true); // แสดงผลเมื่อได้ response จริง
    //         }

    //         setTimeout(() => {
    //             setIsLoading(true)
    //         }, 1000);

    //         return response
    //     }
    // }

    const fetchSearch = async (is_reset_click?: any) => {
        setIsLoading(false);
        setIsResetClick(false)
        // ถ้ามีใช้ srchStartDate ไม่งั้นใช้ today
        // const searchDate = srchStartDate ? dayjs(srchStartDate).format("DD/MM/YYYY") : dayjs().format("DD/MM/YYYY");

        // ====== ใหม่
        let gas_day_search: any = filter_gas_day_from_somewhere_else
        if (!filter_gas_day_from_somewhere_else) {
            gas_day_search = srchStartDate ? dayjs(srchStartDate).format("DD/MM/YYYY") : dayjs().format("DD/MM/YYYY");
        } else {
            gas_day_search = filter_gas_day_from_somewhere_else
        }

        try {
            // const response: any = await getService(`/master/summary-nomination-report?gas_day_text=${searchDate}`);
            const response: any = await getService(`/master/summary-nomination-report?gas_day_text=${gas_day_search}`);

            if (response) {
                setDataSearch(response);
                setData(response);
                // setIsLoading(true); // แสดงผลเมื่อได้ response จริง
            }

            // fallback กัน UI ค้าง
            setTimeout(() => setIsLoading(true), 1000);

            return response;
        } catch (error) {
            // fetchSearch error
            // setIsLoading(true); // เผื่อ error ก็ไม่ให้ค้าง
            return null;
        }
    };


    useEffect(() => {
        // if (dataSearch) {
        //     setData(dataSearch)
        //     setFilteredDataTable(dataSearch);
        // }

        if (dashboardObj) {
            setDashboardObj(undefined)
        }
    }, [dataSearch])

    // #region handleFieldSearch
    const handleFieldSearch = async () => {
        const res_x = await fetchSearch(); // res_x เอามาแทนที่ dataTable

        let filteredMockDataForFilter: any = []
        // let filteredMockDataForFilter: any = response

        // tab weekly --> area --> imbalance

        // 2. map (nomination_point -> maximum_capacity)
        const pointCapacityMap = dataNomPointMaster?.reduce((map: any, point: any) => {
            map[point.nomination_point] = point?.maximum_capacity;
            return map;
        }, {} as Record<string, number>);

        if (srchCheckbox) {
            // case search over total cap

            // 3. Filter ข้อมูลข้างใน mock_data_for_filter แต่ยังรักษาโครงสร้างเดิมไว้
            filteredMockDataForFilter = {
                ...res_x, // copy โครงสร้างเดิมไว้ก่อน
                nomination: {
                    ...res_x?.nomination,
                    daily: {
                        ...res_x?.nomination.daily,
                        MMSCFD: (res_x?.nomination.daily.MMSCFD || []).filter((item: any) => {
                            const maxCap = pointCapacityMap[item?.nomination_point];
                            if (!maxCap) return false;
                            const totalCapNumber = parseFloat(item?.totalCap?.toString().replace(/,/g, '').trim() || "0");
                            if (totalCapNumber === 0) return false;

                            return totalCapNumber > maxCap;
                        }),
                        MMBTUD: (res_x?.nomination.daily.MMBTUD || []).filter((item: any) => {
                            const maxCap = pointCapacityMap[item?.nomination_point];
                            if (!maxCap) return false;
                            const totalCapNumber = parseFloat(item?.totalCap?.toString().replace(/,/g, '').trim() || "0");
                            if (totalCapNumber === 0) return false;

                            return totalCapNumber > maxCap;
                        }),
                    },
                    all: {
                        ...res_x?.nomination.all,
                        MMSCFD: (res_x?.nomination.all.MMSCFD || []).filter((item: any) => {
                            const maxCap = pointCapacityMap[item?.nomination_point];
                            if (!maxCap) return false;
                            const totalCapNumber = parseFloat(item?.totalCap?.toString().replace(/,/g, '').trim() || "0");
                            if (totalCapNumber === 0) return false;

                            return totalCapNumber > maxCap;
                        }),
                        MMBTUD: (res_x?.nomination.all.MMBTUD || []).filter((item: any) => {
                            const maxCap = pointCapacityMap[item?.nomination_point];
                            if (!maxCap) return false;
                            const totalCapNumber = parseFloat(item?.totalCap?.toString().replace(/,/g, '').trim() || "0");
                            if (totalCapNumber === 0) return false;

                            return totalCapNumber > maxCap;
                        }),
                    },
                    weekly: {
                        ...res_x?.nomination.weekly,
                        MMSCFD: (res_x?.nomination.weekly.MMSCFD || []).filter((item: any) => {
                            const maxCap = pointCapacityMap[item?.nomination_point];
                            if (!maxCap) return false;
                            const sum_all_days = parseFloat(item?.sunday) + parseFloat(item?.monday) + parseFloat(item?.tuesday) + parseFloat(item?.wednesday) + parseFloat(item?.thursday) + parseFloat(item?.friday)
                            const totalCapNumber = sum_all_days;
                            if (totalCapNumber === 0) return false;

                            return totalCapNumber > maxCap;
                        }),
                        MMBTUD: (res_x?.nomination.weekly.MMBTUD || []).filter((item: any) => {
                            const maxCap = pointCapacityMap[item?.nomination_point];
                            if (!maxCap) return false;
                            const sum_all_days = parseFloat(item?.sunday) + parseFloat(item?.monday) + parseFloat(item?.tuesday) + parseFloat(item?.wednesday) + parseFloat(item?.thursday) + parseFloat(item?.friday)
                            const totalCapNumber = sum_all_days;
                            if (totalCapNumber === 0) return false;

                            return totalCapNumber > maxCap;
                        }),
                    },
                },
                area: {
                    ...res_x?.area,
                    daily: {
                        ...res_x?.area.daily,
                        MMBTUD: (res_x?.area?.daily?.MMBTUD || []).filter((item: any) => {
                            // All > Area > MMBTU > Check Box Over Total Cap ยังไม่กรองข้อมูลให้ https://app.clickup.com/t/86etty0ze
                            const item_total_cap = parseFloat(item?.totalCap?.toString().replace(/,/g, '').trim() || "0");
                            const area_nom_cap = areaMaster?.data?.find((area: any) => area?.name == item?.area_text)
                            if (!item_total_cap) return false;
                            return item_total_cap > area_nom_cap?.area_nominal_capacity;
                        }),
                    }
                }
            };

        } else if (srchStartDate) {
            // case search gas day | gas week
            if (activeButton == 2) { // tab weekly

                // All > Weekly > Nomination > MMSCF > Filter Default Next Week แต่พอกด Search ซ้ำ (ไม่เปลี่ยนอ่ะไร) ข้อมูลในตารางกลับแสดงของ This Week https://app.clickup.com/t/86euy02xr
                // เสิชใหม่เลยดีมั้ย

                let date_next_week = dayjs(srchStartDate).format("YYYY-MM-DD") 
                if (isChangeSearchStartDate) { // ถ้ากดเลือก filter gas_week มาให้ใช้ srchStartDate
                    date_next_week = dayjs(srchStartDate).format("YYYY-MM-DD")
                }

                if(!srchStartDate){
                    date_next_week = getNextWeekSundayYyyyMmDd() // วันที่วันอาทิตย์ที่จะถึง
                }

                if (filter_gas_day_from_somewhere_else) { // ถ้าบน url มี param ให้ใช้อันนี้
                    date_next_week = filter_gas_day_from_somewhere_else
                }

                let days_of_this_week = getWeekDatesFromStartDate(dayjs(date_next_week).toDate()); // รายการวันที่ในอาทิตย์ที่จะถึง
                const response: any = await getService(`/master/summary-nomination-report?gas_day_text=${dayjs(date_next_week, "YYYY-MM-DD").format("DD/MM/YYYY")}`);

                filteredMockDataForFilter = {
                    ...response,
                    area: {
                        ...response?.area,
                        weekly: {
                            ...response?.area?.weekly,
                            Imbalance: response?.area?.weekly?.Imbalance.filter(
                                (item: any) => days_of_this_week.includes(item.gas_day_text)
                            ),
                        },
                    },
                };


                // ของเดิม 2025-09-22
                // let days_of_this_week = getCurrentWeekDatesYyyyMmDd();
                // let days_of_this_week = getWeekDatesFromStartDate(srchStartDate);

                // filteredMockDataForFilter = {
                //     ...res_x,
                //     area: {
                //         ...res_x?.area,
                //         weekly: {
                //             ...res_x?.area?.weekly,
                //             Imbalance: res_x?.area.weekly.Imbalance.filter(
                //                 (item: any) => days_of_this_week.includes(item.gas_day_text)
                //             ),
                //         },
                //     },
                // };
            } else if (activeButton == 3) {
                // case search daily!
                let search_date = dayjs(srchStartDate).format("DD/MM/YYYY")

                const response: any = await getService(`/master/summary-nomination-report?gas_day_text=${search_date}`);

                filteredMockDataForFilter = {
                    ...response, // copy โครงสร้างเดิมไว้ก่อน
                    nomination: {
                        ...response?.nomination,
                        daily: {
                            ...response?.nomination.daily,
                            MMSCFD: response?.nomination.daily.MMSCFD.filter(
                                (item: any) => search_date == item.gas_day_text
                            ),
                            MMBTUD: response?.nomination.daily.MMBTUD.filter(
                                (item: any) => search_date == item.gas_day_text
                            ),
                        },
                    },
                    area: {
                        ...response?.area,
                        daily: {
                            ...response?.area.daily,
                            Imbalance: response?.area.daily.Imbalance.filter(
                                (item: any) => search_date == item.gas_day_text
                            ),
                            MMBTUD: response?.area.daily.MMBTUD.filter(
                                (item: any) => search_date == item.gas_day_text
                            ),
                        }
                    }
                };
            } else {
                // case search nothing!
                let search_date = dayjs(srchStartDate).format("DD/MM/YYYY")

                filteredMockDataForFilter = {
                    ...res_x, // copy โครงสร้างเดิมไว้ก่อน
                    nomination: {
                        ...res_x?.nomination,
                        daily: {
                            ...res_x?.nomination.daily,
                            MMSCFD: res_x?.nomination.daily.MMSCFD.filter(
                                (item: any) => search_date == item.gas_day_text
                            ),
                            MMBTUD: res_x?.nomination.daily.MMBTUD.filter(
                                (item: any) => search_date == item.gas_day_text
                            ),
                        },
                    },
                    area: {
                        ...res_x?.area,
                        daily: {
                            ...res_x?.area.daily,
                            Imbalance: res_x?.area.daily.Imbalance.filter(
                                (item: any) => search_date == item.gas_day_text
                            ),
                            MMBTUD: res_x?.area.daily.MMBTUD.filter(
                                (item: any) => search_date == item.gas_day_text
                            ),
                        }
                    }
                };
            }

        } else {
            // case default
            filteredMockDataForFilter = res_x
        }

        // setFilteredDataTable(result_2);
        setFilteredDataTable(filteredMockDataForFilter);
    };

    // #region handle reset
    const handleReset = async (active_btn?: any) => {
        setIsResetClick(true)
        setSrchCheckbox(false)
        // setFilteredDataTable([]);
        setIsChangeSearchStartDate(false) // reset 
        setIsLoading(false)

        // ถ้าอยู่ tab weekly set setSrchStartDate เป็นต้นสัปดาห์
        if (active_btn == 2) {
            const lastSunday = dayjs().day(0).isAfter(dayjs()) ? dayjs().subtract(1, 'week').day(0) : dayjs().day(0);
            setSrchStartDate(lastSunday.toDate());
        } else {
            // ถ้าอยู่ tab daily หรือ all set setSrchStartDate เป็น tomorrow
            setSrchStartDate(dayjs().tz("Asia/Bangkok").add(1, "day").toDate())
        }

        fetchData(active_btn);

        setKey((prevKey) => prevKey + 1);
    };

    return (<div>
        <div className="space-y-2 ">
            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">
                    {/* <DatePickaSearch
                        key={"start" + key}
                        label={activeButton == 1 || activeButton == 3 ? "Gas Day" : "Gas Week"}
                        placeHolder={activeButton == 1 || activeButton == 3 ? "Select Gas Day" : "Select Gas Week"}
                        isFixDay={dashboardObj ? true : false}
                        dateToFix={dashboardObj && srchStartDate}
                        isGasWeek={dashboardObj ? false : activeButton == 1 || activeButton == 3 ? false : true}
                        isGasWeekPlusOne={dashboardObj ? false : activeButton == 1 || activeButton == 3 ? false : true}
                        modeSearch={activeButton == 1 || activeButton == 3 ? 'not a day' : 'sunday'}
                        isDefaultTomorrow={dashboardObj ? false : activeButton == 1 || activeButton == 3 ? true : false}
                        allowClear
                        // onChange={(e: any) => setSrchStartDate(e ? e : null)}
                        onChange={(e: any) => {
                            setIsChangeSearchStartDate(true)
                            setSrchStartDate(e ? e : null)
                        }}
                    /> */}

                    {
                        (activeButton == 1 || activeButton == 3) ? // tab all and daily
                            <DatePickaSearch
                                key={"start" + key}
                                label={"Gas Day"}
                                placeHolder={"Select Gas Day"}
                                isFixDay={dashboardObj ? true : false}
                                dateToFix={dashboardObj && srchStartDate}
                                isGasWeek={false}
                                isGasWeekPlusOne={false}
                                isDefaultTomorrow={true}
                                allowClear
                                onChange={(e: any) => {
                                    setIsChangeSearchStartDate(true)
                                    setSrchStartDate(e ? e : null)
                                }}
                            />
                            : // tab weekly
                            <DatePickaSearch
                                key={"start" + key}
                                label={"Gas Week"}
                                placeHolder={"Select Gas Week"}
                                // isFixDay={dashboardObj ? true : false}
                                // dateToFix={dashboardObj && srchStartDate}
                                // dateToFix={filter_gas_day_from_somewhere_else ? filter_gas_day_from_somewhere_else : srchStartDate}
                                defaultValue={(filter_gas_day_from_somewhere_else && !isResetClick) ? filter_gas_day_from_somewhere_else : srchStartDate}
                                isGasWeek={true}
                                // isGasWeekPlusOne={true}
                                modeSearch={'sunday'}
                                isDefaultTomorrow={false}
                                allowClear
                                onChange={(e: any) => {
                                    setIsChangeSearchStartDate(true)
                                    setSrchStartDate(e ? e : null)
                                }}
                            />
                    }

                    {
                        !checkIsAllAreaImbalance && <div className="w-auto relative">
                            <CheckboxSearch2
                                id="checkbox_filter"
                                label="Over Total Cap"
                                type="single-line"
                                value={srchCheckbox ? srchCheckbox : false}
                                onChange={(e: any) => setSrchCheckbox(e?.target?.checked)}
                            />
                        </div>
                    }

                    <BtnSearch handleFieldSearch={handleFieldSearch} />
                    <BtnReset handleReset={handleReset} />
                </aside>
            </div>
        </div>

        <div className="flex h-[calc(100vh-100px)] gap-2 pt-2 overflow-hidden">
            {/* Sidebar (15%) */}
            <div className="w-[15%] p-2 flex flex-col">
                {buttons?.map(({ text, id }) => (
                    <div key={id} className="pb-2">
                        <BtnNomination
                            idToggle={id}
                            btnText={text}
                            // disable={!userPermission?.f_view}
                            disable={false}
                            isActive={activeButton === id}
                            onClick={() => handleClick(id)}
                        />
                    </div>
                ))}
            </div>

            {/* Main Content (85%) */}
            {/* <div className="w-[85%] h-full border-[#DFE4EA] border-[1px] gap-2 pt-2 rounded-xl shadow-sm flex flex-col overflow-hidden"> */}
            {/* <div className="w-[85%] h-[calc(100vh-100px)] border-[#DFE4EA] gap-2 pt-2 rounded-xl  flex flex-col overflow-hidden"> */}
            <div className="w-[85%] h-[100vh] border-[#DFE4EA] gap-2 pt-2 rounded-xl  flex flex-col overflow-hidden relative">
                <Spinloading spin={!isLoading} rounded={20} />
                {/* Content Section - Takes full remaining height */}
                <div className="flex-1 px-4 overflow-hidden">
                    {buttons?.map((button) => {
                        if (activeButton === button.id) {
                            switch (button.text) {
                                case "All":
                                    return <FrameTable
                                        activeButton={activeButton}
                                        tableData={filteredDataTable}
                                        areaMaster={areaMaster}
                                        zoneMaster={zoneMaster}
                                        userPermission={userPermission}
                                        setCheckIsAllAreaImbalance={setCheckIsAllAreaImbalance}
                                        srchStartDate={srchStartDate} // ส่งไปใช้ใน all -> total system
                                    />

                                case "Daily":
                                    return <FrameTable
                                        activeButton={activeButton}
                                        isLoading={true}
                                        tableData={filteredDataTable}
                                        areaMaster={areaMaster}
                                        zoneMaster={zoneMaster}
                                        userPermission={userPermission}
                                        setCheckIsAllAreaImbalance={setCheckIsAllAreaImbalance}
                                        srchStartDate={srchStartDate} // ส่งไปใช้ใน daily -> total system
                                    />

                                case "Weekly":
                                    return <FrameTable
                                        activeButton={activeButton}
                                        isLoading={true}
                                        tableData={filteredDataTable}
                                        areaMaster={areaMaster}
                                        zoneMaster={zoneMaster}
                                        userPermission={userPermission}
                                        setCheckIsAllAreaImbalance={setCheckIsAllAreaImbalance}
                                        srchStartDate={srchStartDate} // ส่งไปใช้ใน weekly -> total system
                                    />

                                default:

                                    // return <TableEachZone key={button.id} zoneText={button.text} tableData={mod_data_mock} isLoading={isLoading} columnVisibility={columnVisibilityEntryExit} />;
                                    return <></>
                            }
                        }
                        return null; // Render nothing if not active
                    })}
                </div>
            </div>
        </div>

    </div>
    );
};

export default ClientPage;