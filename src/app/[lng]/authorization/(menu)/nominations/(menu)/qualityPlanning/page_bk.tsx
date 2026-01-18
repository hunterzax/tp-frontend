"use client";
import { useTranslation } from "@/app/i18n/client";
import { useEffect, useState } from "react";
import { Tune } from "@mui/icons-material"
import { filterLast7Days, formatNumberThreeDecimal, generateUserPermission, getCurrentWeekSundayYyyyMmDd, toDayjs } from '@/utils/generalFormatter';
import { InputSearch } from '@/components/other/SearchForm';
import SearchInput from "@/components/other/searchInput";
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
import { Tab, Tabs } from "@mui/material";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import { useForm } from "react-hook-form";
import NodataTable from "@/components/other/nodataTable";
import TableNomQualityPlanningDaily from "./form/tableDaily";
import TableNomQualityPlanningWeekly from "./form/tableWeekly";
import TableIntraday from "./form/tableIntraday";
import { map24hour, map60mins } from "../../../dam/(menu)/parameters/data";
import { mock_data, mock_data_2 } from "./form/mockData";
import TableSkeleton from "@/components/material_custom/DefaultSkeleton";
import { useParams } from "next/navigation";

interface ClientProps {
    // params: {
    //     lng: string;
    // };
}

const ClientPage: React.FC<ClientProps> = () => {
    const params = useParams();
    const lng = params.lng as string;
    const { t } = useTranslation(lng, "mainPage");
    const [dataTable, setData] = useState<any>([]);

    const { register, setValue, reset, formState: { errors }, watch, getValues } = useForm<any>();

    useEffect(() => {
        const storedDashboard = localStorage.getItem("nom_dashboard_route_mix_quality_obj");
        const dashboardObject = storedDashboard ? JSON.parse(storedDashboard) : null;

        if (dashboardObject) {
            setDashboardObj(dashboardObject)
            // set วันที่ช่อง filter Gas Day
            let formattedGasDay = new Date(toDayjs(dashboardObject?.gas_day).format("YYYY-MM-DD"));
            setSrchStartDate(formattedGasDay)
            setIsSearch(true)
        }
        setValue('filter_simulation', true)
    }, [])

    // ############### Check Authen ###############
    const userDT: any = getUserValue();
    const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
    useRestrictedPage(token);

    // ############### PERMISSION ###############
    const [userPermission, setUserPermission] = useState<any>();
    let user_permission: any = localStorage?.getItem("k3a9r2b6m7t0x5w1s8j");
    user_permission = user_permission ? decryptData(user_permission) : null;

    const getPermission = () => {
        if (user_permission) {
            try {
                user_permission = user_permission ? JSON.parse(user_permission) : null; // Convert JSON string to object
                const updatedUserPermission = generateUserPermission(user_permission);
                setUserPermission(updatedUserPermission);
            } catch (error) {
                // Failed to parse user_permission:
            }
        } else {
            // No user_permission found
        }
    }

    // ############### CHECK ว่ามาจากหน้า nomination dashboard ป่าว ###############
    const [dashboardObj, setDashboardObj] = useState<any>();

    const checkIsRouted = async () => {
        const storedDashboard = localStorage.getItem("nom_dashboard_route_mix_quality_obj");
        const dashboardObject = storedDashboard ? JSON.parse(storedDashboard) : null;

        if (dashboardObject) {
            setDashboardObj(dashboardObject)

            const response: any = await getService(`/master/quality-planning`);
            setDataAllForTabChange(response)
            setDataDailyOriginal(response?.newDaily)
            setDataWeeklyOriginal(response?.newWeekly)
            let filtered_daily_weekly: any = []
            // set วันที่ช่อง filter Gas Day
            const gasDay = toDayjs(dashboardObject?.gas_day)
            // const formattedGasDay = new Date(gasDay.format("YYYY-MM-DD"));
            // // setSrchStartDate(formattedGasDay)

            // auto เปิดไป tab นั้น ๆ
            if (dashboardObject?.tab == 'daily') {
                filtered_daily_weekly = response?.newDaily
                setTabIndex(1)
            } else {
                filtered_daily_weekly = response?.newWeekly
                setTabIndex(2)
            }

            // // เสิชเดินหน้า 7 วัน tab daily
            // const daysRange = Array.from({ length: 7 }, (_, i) =>
            //     dayjs(formattedGasDay).add(i, "day").format("DD/MM/YYYY")
            // );
            // const filteredData = filtered_daily_weekly?.filter((item: any) => {
            //     return (
            //         (formattedGasDay ? daysRange.includes(item?.gasday) : false)
            //     );
            // });

            const filteredData = filtered_daily_weekly?.filter((item: any) => {
                return (
                    (gasDay.isValid() ? gasDay.format("DD/MM/YYYY") == item?.gasday : false)
                );
            });

            // เรียงข้อมูล gasday มากไปน้อย
            const sortedDataGasDay = filteredData?.sort((a: any, b: any) =>
                toDayjs(b.gasday, "DD/MM/YYYY").valueOf() - toDayjs(a.gasday, "DD/MM/YYYY").valueOf()
            );

            setData(sortedDataGasDay);
            setFilteredDataTable(sortedDataGasDay);

            setFirstTimeLoad(true)
            setIsLoading(true)

            // setSrchContractCode(dashboardObject?.contract_code?.id?.toString())
            // const result_2 = dataTable.filter((item: any) => {
            //     const localDate = dayjs(dashboardObject?.gas_day).tz("Asia/Bangkok").format("YYYY-MM-DD");
            //     const gasDay = dayjs(item?.gas_day).tz("Asia/Bangkok").format("YYYY-MM-DD");

            //     return (
            //         (dashboardObject?.contract_code?.id?.toString() ? item?.contract_code?.id.toString() == dashboardObject?.contract_code?.id?.toString() : true) &&
            //         (srchStartDate ? localDate == gasDay : true)
            //     );
            // });
            // setCurrentPage(1)
            // setFilteredDataTable(result_2);

            // มาถึง filter เสร็จสรรพ ลบทิ้งเลย
            localStorage.removeItem("nom_dashboard_route_mix_quality_obj")
        }
    }

    // useEffect(() => {
    //     // checkIsRouted();
    //     const storedDashboard = localStorage.getItem("nom_dashboard_route_mix_quality_obj");
    //     if (storedDashboard !== null) {
    //         checkIsRouted();
    //     }
    // }, [dataTable])

    // ############### REDUX DATA ###############
    const { shipperGroupData } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const dispatch = useAppDispatch();

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

    // ############### FIELD SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [key, setKey] = useState(0);
    const [srchContractCode, setSrchContractCode] = useState('');
    const [srchHour, setSrchHour] = useState('');
    const [srchMinute, setSrchMinute] = useState('');
    const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
    const [srchOldStartDate, setSrchOldStartDate] = useState<Date | null>(null);

    const handleFieldSearch = () => {
        setIsResetSearch(false)

        // let dataToFilter = tabIndex === 1 ? dataDailyOriginal : dataTable;
        let dataToFilter = tabIndex === 1 ? dataDailyOriginal : tabIndex == 2 ? dataWeeklyForLikeSearch : dataTable;

        if (tabIndex === 2) {
            dataToFilter = dataWeeklyOriginal
        }
         
        // Format the search date to DD/MM/YYYY
        const localDate = toDayjs(srchStartDate).format("DD/MM/YYYY");
        if (srchStartDate) {
            setSrchOldStartDate(srchStartDate)
        }

        // เสิชย้อนหลัง 7 วัน tab intraday
        // เสิชเดินหน้า 7 วัน tab daily
        const daysRange = Array.from({ length: 7 }, (_, i) =>
            toDayjs(localDate, "DD/MM/YYYY")
                .add(tabIndex === 1 || tabIndex === 2 ? i : -i, "day") // Add days for tabIndex = 1, subtract for others
                .format("DD/MM/YYYY")
        );

        // Daily > รายการมันไม่เรียงตาม Gas day มันดูข้ามไปข้ามมา https://app.clickup.com/t/86etuav6w
        const sortedGasdayData = [...dataToFilter].sort((a, b) => {
            const aDate = toDayjs(a.gasday, 'DD/MM/YYYY', true);
            const bDate = toDayjs(b.gasday, 'DD/MM/YYYY', true);

            if (!aDate.isValid()) return 1;
            if (!bDate.isValid()) return -1;

            return bDate.diff(aDate);
        });

        const result_2 = sortedGasdayData?.filter((item: any) => {
            return (
                // (srchContractCode?.length > 0 ? srchContractCode.includes(item?.contractCodeId?.id) : true) &&
                (srchStartDate ? daysRange.includes(item?.gasday) : false) ||
                (srchStartDate ? localDate == item?.gasday : true)
                // (srchStartDate ? last7Days.includes(item?.gasday) : true)
            );
        });

        setIsSearch(true);
        setCurrentPage(1);
        setFilteredDataTable(result_2);

        if (tabIndex == 2) { // tab weekly เอาไว้ใช้กับ like search
            setDataWeeklyForLikeSearch(result_2)
        }
    };

    const handleReset = async () => {
        // when call handleReset set setSrchStartDate with current week Sunday date in this format ---> Sun Mar 16 2025 16:59:54 GMT+0700 (Indochina Time)
        // const dataToFilter = tabIndex === 1 ? dataDailyOriginal : dataTable;
        // setFilteredDataTable(dataToFilter);
        setFilteredDataTable([]);
        fetchOnlyData();

        setSrchContractCode('');
        setSrchHour('');
        setSrchMinute('');
        setIsSearch(false)
        setIsResetSearch(true)
        let sun_day_fun_day = new Date(getCurrentWeekSundayYyyyMmDd());
        setSrchStartDate(sun_day_fun_day)
        setKey((prevKey) => prevKey + 1);
    };

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {
        const dataToFilter = tabIndex === 1 ? dataDailyOriginal : tabIndex == 2 ? dataWeeklyForLikeSearch : dataTable;

        const filtered = dataToFilter?.filter(
            (item: any) => {
                const queryLower = query.replace(/\s+/g, '')?.toLowerCase().trim();

                // เสิช h1 - h24
                const matchesQuery = Array.from({ length: 24 }, (_, i) => `h${i + 1}`).some(key => {
                    return item?.[key]?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower);
                });

                // เสิช h1 - h24 แบบ format decimal แล้ว
                const matchesQueryFormatted = Array.from({ length: 24 }, (_, i) => `h${i + 1}`).some(key => {
                    return formatNumberThreeDecimal(item?.[key])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower);
                });

                return (
                    matchesQuery ||
                    matchesQueryFormatted ||
                    item?.gasday?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.zone?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.area?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.parameter?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    item?.sunday?.value?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.monday?.value?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.tuesday?.value?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.wednesday?.value?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.thursday?.value?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.friday?.value?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.saturday?.value?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    formatNumberThreeDecimal(item?.sunday?.value)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.monday?.value)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.tuesday?.value)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.wednesday?.value)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.thursday?.value)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.friday?.value)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.saturday?.value)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    formatNumberThreeDecimal(item?.valueBtuScf)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)
                )
            }
        );
        setFilteredDataTable(filtered);
    };

    // ############### DATA TABLE ###############
    const [tabIndex, setTabIndex] = useState(0); // 0=daily, 1=weekly
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [firstTimeLoad, setFirstTimeLoad] = useState<boolean>(false);
    const [isSearch, setIsSearch] = useState<boolean>(false);
    const [isResetSearch, setIsResetSearch] = useState<boolean>(false);
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [dataAllForTabChange, setDataAllForTabChange] = useState<any>([]);
    const [dataDailyOriginal, setDataDailyOriginal] = useState<any>([]);
    const [dataWeeklyOriginal, setDataWeeklyOriginal] = useState<any>([]);
    const [dataWeeklyForLikeSearch, setDataWeeklyForLikeSearch] = useState<any>([]);
    const [dataIntradayOriginal, setDataIntradayOriginal] = useState<any>([]);

    const fetchData = async () => {
        try {
            setIsLoading(false);

            // let filtered_daily_weekly = tabIndex == 1 ? mock_data?.newDaily : tabIndex == 2 && mock_data?.newWeekly
            // setIsLoading(false)

            const storedDashboard = localStorage.getItem("nom_dashboard_route_mix_quality_obj");
            if (storedDashboard !== null) {
                checkIsRouted();
            } else {

                const response: any = await getService(`/master/quality-planning`);
                // let response:any = mock_data_2
                 
                setDataAllForTabChange(response)
                setDataDailyOriginal(response?.newDaily)
                setDataWeeklyOriginal(response?.newWeekly)

                let filtered_daily_weekly = tabIndex == 1 ? response?.newDaily : tabIndex == 2 ? response?.newWeekly : tabIndex == 0 && response?.intraday

                // daily เอาข้อมูล gasDay = today + 1
                if (filtered_daily_weekly) {
                    if (tabIndex == 1) { // daily
                        const tomorrow = toDayjs().add(1, "day").format("DD/MM/YYYY");

                        // เสิชย้อนหลัง 7 วัน tab intraday
                        // เสิชเดินหน้า 7 วัน tab daily
                        const daysRange = Array.from({ length: 7 }, (_, i) =>
                            toDayjs(tomorrow, "DD/MM/YYYY")
                                .add(tabIndex === 1 || tabIndex === 2 ? i : -i, "day") // Add days for tabIndex = 1, subtract for others
                                .format("DD/MM/YYYY")
                        );

                        // Daily > รายการมันไม่เรียงตาม Gas day มันดูข้ามไปข้ามมา https://app.clickup.com/t/86etuav6w
                        const sortedGasdayData = [...filtered_daily_weekly].sort((a, b) => {
                            const aDate = toDayjs(a.gasday, 'DD/MM/YYYY', true);
                            const bDate = toDayjs(b.gasday, 'DD/MM/YYYY', true);

                            if (!aDate.isValid()) return 1;
                            if (!bDate.isValid()) return -1;

                            return bDate.diff(aDate);
                        });

                        const filteredData = sortedGasdayData?.filter((item: any) => {
                            return (
                                (srchStartDate ? daysRange.includes(item?.gasday) : false)
                            );
                        });

                        // const filteredData = filtered_daily_weekly?.filter((item: any) => item.gasday === tomorrow);
                        setData(filteredData);
                        setDataDailyOriginal(response?.newDaily)
                        setFilteredDataTable(filteredData);

                    } else {

                        if (tabIndex == 0) { // intraday
                            // Tab Intraday : Default แสดงข้อมูล ณ วันที่ปัจจุบัน และย้อนหลังไป 7 วัน https://app.clickup.com/t/86erz8qmq
                            const filteredDataLast7 = filterLast7Days(filtered_daily_weekly, "gasday");
                            setData(filtered_daily_weekly);
                            setFilteredDataTable(filteredDataLast7);
                            setDataIntradayOriginal(response?.intraday)

                        } else {  // weekly
                            let sunday_date = getCurrentWeekSundayYyyyMmDd()
                            const sundayyyyy = toDayjs(sunday_date).format("DD/MM/YYYY");
                            const filteredData = filtered_daily_weekly?.filter((item: any) => item.sunday?.date === sundayyyyy);
                            setData(filteredData);
                            setFilteredDataTable(filteredData);
                            setDataWeeklyForLikeSearch(filteredData)
                            setDataWeeklyOriginal(response?.newWeekly)
                        }
                    }
                } else {
                    setData([]);
                    setFilteredDataTable([]);
                }

                setTimeout(() => {
                    setFirstTimeLoad(true)
                    setIsLoading(true);
                }, 500);

            }

        } catch (err) {
            // setError(err.message);
            setData([]);
            setFilteredDataTable([]);
        } finally {
            // setLoading(false);
        }
    };

    const fetchOnlyData = async () => {
        try {
            setIsLoading(false)

            // const response: any = await getService(`/master/quality-planning`);
            let response: any = dataAllForTabChange
            let filtered_daily_weekly = tabIndex == 1 ? response?.newDaily : tabIndex == 2 ? response?.newWeekly : tabIndex == 0 && response?.intraday
            // let filtered_daily_weekly = tabIndex == 1 ? dataTable?.newDaily : tabIndex == 2 ? dataTable?.newWeekly : tabIndex == 0 && dataTable?.intraday

            if (filtered_daily_weekly) {
                if (tabIndex == 1) { // daily เอาข้อมูล gasDay = today + 1 

                    const tomorrow = toDayjs().add(1, "day").format("DD/MM/YYYY");
                    // const tomorrow = dayjs().format("DD/MM/YYYY");
                    // เสิชย้อนหลัง 7 วัน tab intraday
                    // เสิชเดินหน้า 7 วัน tab daily
                    const daysRange = Array.from({ length: 7 }, (_, i) =>
                        toDayjs(tomorrow, "DD/MM/YYYY")
                            .add(tabIndex === 1 || tabIndex === 2 ? i : -i, "day") // Add days for tabIndex = 1, subtract for others
                            .format("DD/MM/YYYY")
                    );

                    // Daily > รายการมันไม่เรียงตาม Gas day มันดูข้ามไปข้ามมา https://app.clickup.com/t/86etuav6w
                    const sortedGasdayData = [...filtered_daily_weekly].sort((a, b) => {
                        const aDate = toDayjs(a.gasday, 'DD/MM/YYYY', true);
                        const bDate = toDayjs(b.gasday, 'DD/MM/YYYY', true);

                        if (!aDate.isValid()) return 1;
                        if (!bDate.isValid()) return -1;

                        return bDate.diff(aDate);
                    });

                    const filteredData = sortedGasdayData?.filter((item: any) => {
                        return (
                            (srchStartDate ? daysRange.includes(item?.gasday) : false)
                        );
                    });
                    // const filteredData = filtered_daily_weekly?.filter((item: any) => item.gasday === tomorrow);

                    setData(filteredData);
                    setFilteredDataTable(filteredData);
                } else {

                    if (tabIndex == 0) { // intraday
                        // Tab Intraday : Default แสดงข้อมูล ณ วันที่ปัจจุบัน และย้อนหลังไป 7 วัน https://app.clickup.com/t/86erz8qmq
                        const filteredDataLast7 = filterLast7Days(filtered_daily_weekly, "gasday");
                        setData(filtered_daily_weekly);
                        setFilteredDataTable(filteredDataLast7);
                        setDataIntradayOriginal(response?.intraday)
                    } else {  // weekly
                        let sun_day_fun_day = new Date(getCurrentWeekSundayYyyyMmDd());
                        setSrchStartDate(sun_day_fun_day)
                        setSrchOldStartDate(null)

                        // ต้อง filter หา sunday.date == วันอาทิตย์ของสัปดาห์นี้
                        let sunday_date = getCurrentWeekSundayYyyyMmDd()
                        const sundayyyyy = toDayjs(sunday_date).format("DD/MM/YYYY");
                        const filteredData = filtered_daily_weekly?.filter((item: any) => item.sunday?.date === sundayyyyy);
                        setData(filteredData);
                        setFilteredDataTable(filteredData);
                        setDataWeeklyOriginal(response?.newWeekly)
                    }

                }
            } else {
                setData([]);
                setFilteredDataTable([]);
                setIsLoading(true);
            }

            setIsLoading(true);

        } catch (error) {
            setData([]);
            setFilteredDataTable([]);
        }
    };

    useEffect(() => {
        if (!firstTimeLoad) {
            fetchData();
        }
    }, []);

    useEffect(() => {
        // localStorage.removeItem("nom_dashboard_route");
        // localStorage.removeItem("nom_dashboard_route_mix_quality_obj");

        // if(tabIndex !== 0){
        //     fetchOnlyData();
        // }
        if (firstTimeLoad) {
            fetchOnlyData();
        }

    }, [tabIndex])

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

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (itemsPerPage: number) => {
        setItemsPerPage(itemsPerPage);
        setCurrentPage(1);
    };

    useEffect(() => {
        if (filteredDataTable) {
            setPaginatedData(filteredDataTable.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
        } else {
            setPaginatedData([])
        }
    }, [filteredDataTable, currentPage, itemsPerPage])

    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [
        { key: 'gas_day', label: 'Gas Day', visible: true },
        { key: 'zone', label: 'Zone', visible: true },
        { key: 'area', label: 'Area', visible: true },
        { key: 'parameter', label: 'Parameter', visible: true },
        { key: 'value', label: 'Value (BTU/SCF)', visible: true },
    ];

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [columnVisibility, setColumnVisibility] = useState<any>(
        Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))
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

    // ############### COLUMN SHOW/HIDE WEEKLY ###############
    const initialColumnsTabWeekly: any = [
        { key: 'zone', label: 'Zone', visible: true },
        { key: 'area', label: 'Area', visible: true },
        { key: 'parameter', label: 'Parameter', visible: true },
        { key: 'sunday', label: 'Sunday', visible: true },
        { key: 'monday', label: 'Monday', visible: true },
        { key: 'tuesday', label: 'Tuesday', visible: true },
        { key: 'wednesday', label: 'Wednesday', visible: true },
        { key: 'thursday', label: 'Thursday', visible: true },
        { key: 'friday', label: 'Friday', visible: true },
        { key: 'saturday', label: 'Saturday', visible: true },
    ];

    const [anchorElWeekly, setAnchorElWeekly] = useState<null | HTMLElement>(null);
    const openWeekly = Boolean(anchorElWeekly);
    const getInitialColumnsWeekly = () => initialColumnsTabWeekly;

    const [columnVisibilityWeekly, setColumnVisibilityWeekly] = useState<any>(
        Object.fromEntries(getInitialColumnsWeekly().map((column: any) => [column.key, column.visible]))
    );

    const handleTogglePopoverWeekly = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElWeekly(anchorElWeekly ? null : event.currentTarget);
    };

    const handleColumnToggleWeekly = (columnKey: string) => {
        setColumnVisibilityWeekly((prev: any) => ({
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
    const handleChangeSubTab = (event: any, newValue: any) => {
        // 0 = 1-6 Hr
        // 1 = 7-12 Hr
        // 2 = 13-18 Hr
        // 3 = 19-24 Hr
        // 4 = All Day
        setSubTabIndex(newValue);
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
        if (dashboardObj) {
            setDashboardObj(undefined)
        }
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

    const handleTogglePopoverIntraday = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElIntraday(anchorElIntraday ? null : event.currentTarget);
    };

    const handleColumnToggleIntraday = (columnKey: string) => {
        setColumnVisibilityIntraday((prev: any) => ({
            ...prev,
            [columnKey]: !prev[columnKey]
        }));
    };

    // ############### TAB ###############
    const handleChange = (event: any, newValue: any) => {
        setIsLoading(false);
        setTabIndex(newValue);
        handleReset();
        setIsResetSearch(false);
    };

    return (
        <div className=" space-y-2">

            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl  flex flex-col sm:flex-row gap-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                    {/* Tab Weekly : Filter Gas Week Default Sunday of current week https://app.clickup.com/t/86erz1k4v */}
                    <DatePickaSearch
                        key={"start" + key}
                        label={tabIndex == 0 || tabIndex == 1 ? "Gas Day" : "Gas Week"}
                        // modeSearch={tabIndex == 0 || tabIndex == 1 ? "xx" : "sunday"}
                        modeSearch={tabIndex == 2 && "sunday"}
                        placeHolder={tabIndex == 0 || tabIndex == 1 ? "Select Gas Day" : "Select Gas Week"}
                        allowClear
                        isGasWeek={dashboardObj ? false : tabIndex == 2 ? true : false}
                        // isGasDay={dashboardObj ? false : tabIndex == 1 ? true : false}
                        isFixDay={dashboardObj ? srchStartDate ? true : false : false}
                        dateToFix={srchStartDate || new Date()}
                        // isGasDay={tabIndex == 1 || tabIndex == 0 ? true : false}
                        // isToday={tabIndex != 2 ? true : false}
                        isToday={tabIndex != 2 ? tabIndex == 1 ? false : true : false}
                        isDefaultTomorrow={tabIndex == 1 && true}
                        // onChange={(e: any) => setSrchStartDate(e ? e : null)}
                        onChange={(e: any) => {
                            setIsSearch(false)
                            setSrchStartDate(e ? e : null)
                        }}
                    />

                    {/* อย่าลบ ปิดเก็บไว้ก่อน */}
                    {/* {
                        tabIndex == 0 && <>
                            <InputSearch
                                id="searchHour"
                                label="Hour"
                                type="select-new"
                                value={srchHour}
                                onChange={(e) => setSrchHour(e.target.value)}
                                options={map24hour?.map((item: any) => ({
                                    value: item.id.toString(),
                                    label: item.name
                                }))}
                                customWidth={120}
                                customWidthPopup={75}
                            />

                            <InputSearch
                                id="searchMinute"
                                label="Minute"
                                type="select-new"
                                value={srchMinute}
                                onChange={(e) => setSrchMinute(e.target.value)}
                                options={map60mins?.map((item: any) => ({
                                    value: item.id.toString(),
                                    label: item.name
                                }))}
                                customWidth={120}
                                customWidthPopup={75}
                            />
                        </>
                    } */}

                    <BtnSearch handleFieldSearch={handleFieldSearch} />
                    <BtnReset handleReset={handleReset} />
                </aside>
                <aside className="mt-auto ml-1 w-full sm:w-auto">
                    {/* <BtnGeneral
                        bgcolor={"#00ADEF"}
                        // modeIcon={'nom-accept'}
                        textRender={"Simulation"}
                        // generalFunc={() => handleAcceptReject(selectedRoles, 'accept')}
                        can_create={userPermission ? userPermission?.f_create : false}
                    // disable={selectedRoles?.length > 0 ? false : true}
                    /> */}
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
                    ["Intraday", "Daily", "Weekly"]?.map((label, index) => (
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

                <div className="text-sm flex flex-wrap items-center justify-between pb-4">
                    <div className="flex items-center space-x-4">
                        <div onClick={tabIndex === 0 ? handleTogglePopoverIntraday : tabIndex === 1 ? handleTogglePopover : handleTogglePopoverWeekly}>
                            <Tune
                                className="cursor-pointer rounded-lg"
                                style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                            />
                        </div>

                        {tabIndex === 0 && (
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
                                        transform: 'translateX(30%)',
                                        bottom: '10px',
                                    },
                                    '& .MuiTab-root': {
                                        minWidth: 'auto !important',
                                    },
                                }}
                            >
                                {['1-6 Hr.', '7-12 Hr.', '13-18 Hr.', '19-24 Hr.', 'All Day'].map((label, index) => (
                                    <Tab
                                        key={label}
                                        label={label}
                                        id={`tab-${index}`}
                                        sx={{
                                            fontFamily: 'Tahoma !important',
                                            textTransform: 'none',
                                            padding: '8px 16px',
                                            minWidth: '35px',
                                            maxWidth: '103px',
                                            flexShrink: 0,
                                            color: subTabIndex === index ? '#58585A' : '#9CA3AF',
                                        }}
                                    />
                                ))}
                            </Tabs>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end">
                        <SearchInput onSearch={handleSearch} />
                        <BtnExport
                            textRender={"Export"}
                            specificMenu={'quality-planning'}
                            data={filteredDataTable}
                            type={tabIndex === 1 ? 1 : tabIndex === 2 ? 2 : 3}
                            path="nomination/quality-planning"
                            gasDay={srchStartDate}
                            can_export={userPermission ? userPermission?.f_export : false}
                            columnVisibility={
                                tabIndex === 1 ? columnVisibility : tabIndex === 2 ? columnVisibilityWeekly : columnVisibilityIntraday
                            }
                            initialColumns={
                                tabIndex === 1 ? initialColumns : tabIndex === 2 ? initialColumnsTabWeekly : initialColumnsTabIntraday
                            }
                        />
                    </div>
                </div>

                {
                    !isLoading ? (
                        <TableSkeleton />
                    ) : tabIndex == 0 ? (
                        <TableIntraday
                            tableData={paginatedData}
                            isLoading={isLoading}
                            gasWeekFilter={srchStartDate}
                            columnVisibility={columnVisibilityIntraday}
                            userPermission={userPermission}
                            subTabIndex={subTabIndex}
                        />
                    ) : tabIndex == 1 ? (
                        <TableNomQualityPlanningDaily
                            tableData={paginatedData}
                            isLoading={isLoading}
                            gasWeekFilter={srchStartDate}
                            columnVisibility={columnVisibility}
                            userPermission={userPermission}
                            tabIndex={tabIndex}
                        />
                    ) : (
                        <TableNomQualityPlanningWeekly
                            tableData={paginatedData}
                            isLoading={isLoading}
                            isSearch={isSearch}
                            isResetSearch={isResetSearch}
                            setIsResetSearch={setIsResetSearch}
                            gasWeekFilter={srchStartDate}
                            oldGasWeekFilter={srchOldStartDate}
                            columnVisibility={columnVisibilityWeekly}
                            userPermission={userPermission}
                            tabIndex={tabIndex}
                            setIsLoading={setIsLoading}
                        />
                    )
                }

            </div>

            <PaginationComponent
                totalItems={filteredDataTable?.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
            />

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

            <ColumnVisibilityPopover
                open={openWeekly}
                anchorEl={anchorElWeekly}
                setAnchorEl={setAnchorElWeekly}
                columnVisibility={columnVisibilityWeekly}
                handleColumnToggle={handleColumnToggleWeekly}
                initialColumns={initialColumnsTabWeekly}
            />

        </div>
    );
};

export default ClientPage;
