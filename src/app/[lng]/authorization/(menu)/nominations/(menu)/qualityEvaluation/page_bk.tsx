"use client";
import { useTranslation } from "@/app/i18n/client";
import { useEffect, useState } from "react";
import { Tune } from "@mui/icons-material"
import { formatNumberThreeDecimal, generateUserPermission, getCurrentWeekSundayYyyyMmDd, toDayjs } from '@/utils/generalFormatter';
import CheckboxSearch2, { InputSearch } from '@/components/other/SearchForm';
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
import TableNomQualityEvaluation from "./form/table";
import TableNomQualityEvaluationWeekly from "./form/tableWeekly";
import { useForm } from "react-hook-form";
import { mock_data } from "./form/mockData";
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
            if (dashboardObject.tab == 'weekly') {
                setTabIndex(1)
            }
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

    const [dashboardObj, setDashboardObj] = useState<any>();

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
    const [srchContractCode, setSrchContractCode] = useState<any>([]);
    const [srchStartDate, setSrchStartDate] = useState<Date | null>(toDayjs().add(1, 'day').toDate());
    const [tk, settk] = useState<boolean>(false);

    const handleFieldSearch = () => {
        // let dataToFilter = tabIndex === 0 ? dataDailyOriginal : dataTable;
        let dataToFilter = tabIndex === 0 ? dataDailyOriginal : dataWeeklyOriginal;

        // if (tabIndex === 1) {
        //     dataToFilter = dataWeeklyOriginal
        // }

        const localDate = toDayjs(srchStartDate).format("DD/MM/YYYY");
        // const daysRange = Array.from({ length: 7 }, (_, i) =>
        //     dayjs(localDate, "DD/MM/YYYY")
        //         .add(tabIndex === 0 || tabIndex === 1 ? i : -i, "day") // Add days for tabIndex = 1, subtract for others
        //         .format("DD/MM/YYYY")
        // );

        const result_2 = dataToFilter?.filter((item: any) => {
            return (
                (srchContractCode?.length > 0 ? srchContractCode.includes(`${item?.contractCodeId?.id}`) : true) &&
                // (srchStartDate ? localDate == item?.gasday : true)
                (localDate !== 'Invalid Date' ? localDate == item?.gasday : true)
                // (srchStartDate ? daysRange.includes(item?.gasday) : true)
            );
        });

        setIsSearch(true)
        setCurrentPage(1)
        setFilteredDataTable(result_2);
    };

    const handleReset = async () => {
        // const dataToFilter = tabIndex === 0 ? dataDailyOriginal : dataTable;
        // setFilteredDataTable(dataToFilter);
        fetchData();

        setIsCheckAll(false);
        setSrchContractCode([]);
        setIsSearch(false)
        setSrchStartDate(toDayjs().add(1, 'day').toDate())
        renderContractCode()
        setKey((prevKey) => prevKey + 1);
    };

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {
        const filtered = dataTable?.filter(
            (item: any) => {
                const queryLower = query.replace(/\s+/g, '')?.toLowerCase().trim();

                return (
                    item?.gasday?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.zone?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.area?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.parameter?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

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

    const renderContractCode = () => {
        try {
            let url = `/master/quality-evaluation`
            // if (srchStartDate) {
            //     // url += `?gasDay=${srchStartDate}`
            // }
            getService(url).then(response => {
                setDataDailyOriginal(response?.newDaily || [])
                setDataWeeklyOriginal(response?.newWeekly || [])
                if (response?.newDaily && Array.isArray(response.newDaily) && !isCheckAll) {
                    const uniqueContractCodeIDs = Array.from(new Set(response.newDaily.map((item: any) => `${item?.contractCodeId?.id}`).filter((id: any) => id != 'undefined' && id != 'null')))
                    setSrchContractCode(uniqueContractCodeIDs)
                    setIsCheckAll(true);
                    settk(!tk)
                }
            });
        } catch (err) {
            setDataDailyOriginal([])
            setDataWeeklyOriginal([])
        }
    }

    // ############### DATA TABLE ###############
    const [tabIndex, setTabIndex] = useState(localStorage.getItem("nom_dashboard_route_mix_quality_obj") ? JSON.parse(localStorage.getItem("nom_dashboard_route_mix_quality_obj") || '{}').tab == 'weekly' ? 1 : 0 : 0); // 0=daily, 1=weekly
    const [dataTable, setData] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSearch, setIsSearch] = useState<boolean>(false);
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [dataDailyOriginal, setDataDailyOriginal] = useState<any>([]);
    const [dataWeeklyOriginal, setDataWeeklyOriginal] = useState<any>([]);

    const fetchData = async () => {
        try {
            const response: any = await getService(`/master/quality-evaluation`);
            let filtered_daily_weekly = tabIndex == 0 ? await response?.newDaily : await response?.newWeekly

            setDataDailyOriginal(response?.newDaily)
            setDataWeeklyOriginal(response?.newWeekly)

            if (filtered_daily_weekly) {
                if (tabIndex == 0) { // daily
                    const tomorrow = toDayjs().add(1, "day").format("DD/MM/YYYY");

                    // เสิชย้อนหลัง 7 วัน tab intraday
                    // เสิชเดินหน้า 7 วัน tab daily
                    // const daysRange = Array.from({ length: 7 }, (_, i) =>
                    //     dayjs(tomorrow, "DD/MM/YYYY")
                    //         .add(tabIndex === 0 ? i : -i, "day") // Add days for tabIndex = 1, subtract for others
                    //         .format("DD/MM/YYYY")
                    // );

                    const filteredData = filtered_daily_weekly?.filter((item: any) => {
                        return (
                            // (daysRange ? daysRange.includes(item?.gasday) : false) // old
                            (tomorrow ? item?.gasday == tomorrow : false)

                        );
                    });

                    // const filteredData = filtered_daily_weekly?.filter((item: any) => item.gasday === tomorrow);
                    // setDataDailyOriginal(response?.newDaily)
                    setDataDailyOriginal(response?.newDaily)
                    setData(filteredData);
                    setFilteredDataTable(filteredData);
                    // setPaginatedData(filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
                    settk(!tk)
                } else {
                    // setData(filtered_daily_weekly);
                    // setFilteredDataTable(filtered_daily_weekly);
                    // setDataWeeklyOriginal(response?.newWeekly)

                    // ต้อง filter หา sunday.date == วันอาทิตย์ของสัปดาห์นี้
                    let sunday_date = getCurrentWeekSundayYyyyMmDd()
                    const sundayyyyy = toDayjs(sunday_date).format("DD/MM/YYYY");
                    const filteredData = filtered_daily_weekly?.filter((item: any) => item.sunday?.date === sundayyyyy);
                    setData(filteredData);
                    setFilteredDataTable(filteredData);
                    setDataWeeklyOriginal(response?.newWeekly)
                }
            } else {
                setData([]);
                setFilteredDataTable([]);
            }

            setTimeout(() => {
                setIsLoading(true);
            }, 500);
        } catch (err) {
            setData([]);
            setFilteredDataTable([]);
        } finally {
            // setLoading(false);
        }
    };

    const fetchOnlyData = async () => {
        try {
            if (!dashboardObj && !(localStorage.getItem("nom_dashboard_route_mix_quality_obj"))) {
                setIsLoading(false);
                const response: any = await getService(`/master/quality-evaluation`);
                let filtered_daily_weekly = tabIndex === 0 ? response?.newDaily : response?.newWeekly;

                if (filtered_daily_weekly) {
                    if (tabIndex === 0) { // Daily: filter gasDay = tomorrow
                        const tomorrow = toDayjs().add(1, "day").format("DD/MM/YYYY");

                        // // เสิชย้อนหลัง 7 วัน tab intraday
                        // // เสิชเดินหน้า 7 วัน tab daily
                        // const daysRange = Array.from({ length: 7 }, (_, i) =>
                        //     dayjs(tomorrow, "DD/MM/YYYY")
                        //         .add(tabIndex === 0 ? i : -i, "day") // Add days for tabIndex = 1, subtract for others
                        //         .format("DD/MM/YYYY")
                        // );

                        // const filteredData = filtered_daily_weekly?.filter((item: any) => {
                        //     return (
                        //         (srchStartDate ? daysRange.includes(item?.gasday) : false)
                        //     );
                        // });

                        const filteredData = filtered_daily_weekly?.filter((item: any) => {
                            return (
                                // (daysRange ? daysRange.includes(item?.gasday) : false) // old
                                (tomorrow ? item?.gasday == tomorrow : false)

                            );
                        });

                        // const filteredData = filtered_daily_weekly?.filter((item: any) => item.gasday === tomorrow) || [];
                        setData(filteredData);
                        setFilteredDataTable(filteredData);
                    } else {
                        // setData(filtered_daily_weekly || []);
                        // setFilteredDataTable(filtered_daily_weekly || []);
                        let sun_day_fun_day = new Date(getCurrentWeekSundayYyyyMmDd());
                        setSrchStartDate(sun_day_fun_day)
                        // setSrchOldStartDate(null)

                        // ต้อง filter หา sunday.date == วันอาทิตย์ของสัปดาห์นี้
                        let sunday_date = getCurrentWeekSundayYyyyMmDd()
                        const sundayyyyy = toDayjs(sunday_date).format("DD/MM/YYYY");
                        const filteredData = filtered_daily_weekly?.filter((item: any) => item.sunday?.date === sundayyyyy);
                        setData(filteredData);
                        setFilteredDataTable(filteredData);
                        // setDataWeeklyOriginal(response?.newWeekly)
                    }
                } else {
                    setData([]);
                    setFilteredDataTable([]);
                    setIsLoading(true);
                }
            }
        } catch (error) {
            setData([]);
            setFilteredDataTable([]);
        }
    };

    useEffect(() => {
        fetchData();
    }, [resetForm]);

    useEffect(() => {
        fetchOnlyData();
        setValue('filter_simulation', true)
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
        }
    }, [filteredDataTable, currentPage, itemsPerPage])

    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [
        { key: 'gas_day', label: tabIndex == 0 ? 'Gas Day' : 'Gas Week', visible: true },
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

    // ############### TAB ###############
    const handleChange = (event: any, newValue: any) => {
        setIsLoading(false);
        setIsCheckAll(false);
        setTabIndex(newValue);
        handleReset();
    };

    const [isCheckAll, setIsCheckAll] = useState<any>(false);

    useEffect(() => {
        try {
            let url = `/master/quality-evaluation`
            // if (srchStartDate) {
            //     // url += `?gasDay=${srchStartDate}`
            // }
            getService(url).then(response => {
                setDataDailyOriginal(response?.newDaily || [])
                setDataWeeklyOriginal(response?.newWeekly || [])
                if (response?.newDaily && Array.isArray(response.newDaily) && !isCheckAll) {
                    const uniqueContractCodeIDs = Array.from(new Set(response.newDaily.map((item: any) => `${item?.contractCodeId?.id}`).filter((id: any) => id != 'undefined' && id != 'null')))
                    setSrchContractCode(uniqueContractCodeIDs)
                    setIsCheckAll(true);
                    settk(!tk)
                }
            });
        } catch (err) {
            setDataDailyOriginal([])
            setDataWeeklyOriginal([])
        }
    }, [srchStartDate])

    useEffect(() => {
        if (dashboardObj && ((dataTable && dataTable.length > 0) || (dataDailyOriginal && dataDailyOriginal.length > 0))) {
            if (dashboardObj.tab == 'weekly') {
                setTabIndex(1);
            }
            setDashboardObj(undefined)
            handleFieldSearch()
        }
    }, [dataTable, dataDailyOriginal, dashboardObj])
    
    return (
        <div className=" space-y-2">
            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl  flex flex-col sm:flex-row gap-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                    <DatePickaSearch
                        key={"start" + key}
                        label={tabIndex == 0 ? "Gas Day" : "Gas Week"}
                        modeSearch={tabIndex == 0 ? "xx" : "sunday"}
                        placeHolder={tabIndex == 0 ? "Select Gas Day" : "Select Gas Week"}
                        allowClear
                        isFixDay={dashboardObj ? true : false}
                        dateToFix={dashboardObj && srchStartDate}
                        isGasWeek={tabIndex == 1 ? true : false}
                        isGasDay={tabIndex == 0 ? true : false}
                        // onChange={(e: any) => setSrchStartDate(e ? e : null)}
                        onChange={(e: any) => {
                            setIsSearch(false)
                            setSrchStartDate(e ? e : null)
                        }}
                    />

                    <InputSearch
                        id="searchContractCode"
                        label="Contract Code"
                        type="select-multi-checkbox"
                        isCheckAll={isCheckAll}
                        value={srchContractCode}
                        // onChange={(e) => setSrchContractCode(e.target.value)}
                        onChange={(e) => {
                            setIsCheckAll(false)
                            setSrchContractCode(e.target.value)
                        }}
                        canReplaceOptionsWithEmpty={true}
                        isDisabled={(dataDailyOriginal || []).length < 1}
                        // remove duplicate
                        // DATA CONTRACT CODE
                        // Daily Nomination File ที่อยู่ในสถานะ Waiting for response , Approved หรือ Approved by system จะต้องแสดงใน Dropdown https://app.clickup.com/t/86etu85ah
                        options={Array.from(
                            new Map(
                                // dataTable
                                dataDailyOriginal
                                    ?.filter((item: any) =>
                                        userDT?.account_manage?.[0]?.user_type_id == 3
                                            ? item?.contractCodeId?.group_id === userDT?.account_manage?.[0]?.group?.id
                                            : true
                                    )
                                    .map((item: any) => [item?.contractCodeId?.id, item]) // Use Map to keep unique IDs
                            ).values() // Extract unique values
                        ).map((item: any) => ({
                            value: item?.contractCodeId?.id.toString(),
                            label: item?.contractCodeId?.contract_code
                        }))}
                    />

                    <CheckboxSearch2
                        {...register('filter_simulation')}
                        id="sim_search"
                        label="Simulation"
                        type="single-line"
                        value={watch('filter_simulation') ? watch('filter_simulation') : false}
                        onChange={(e: any) => setValue('filter_simulation', e?.target?.checked)}
                    />

                    <div className="pt-7">
                        <BtnSearch handleFieldSearch={handleFieldSearch} />
                    </div>

                    <div className="pt-7">
                        <BtnReset handleReset={handleReset} />
                    </div>
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
                    ["Daily", "Weekly"]?.map((label, index) => (
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
                <div className="text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
                    <div className="flex items-center space-x-2">
                        {
                            tabIndex == 0 ?
                                <div onClick={handleTogglePopover}>
                                    <Tune
                                        className="cursor-pointer rounded-lg"
                                        style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                                    />
                                </div>
                                :
                                <div onClick={handleTogglePopoverWeekly}>
                                    <Tune
                                        className="cursor-pointer rounded-lg"
                                        style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                                    />
                                </div>

                        }
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end">
                        <SearchInput onSearch={handleSearch} />

                        <BtnExport
                            textRender={"Export"}
                            specificMenu={'quality-evaluation'}
                            data={filteredDataTable}
                            type={tabIndex == 0 ? 1 : 2}
                            gasDay={srchStartDate}
                            path="nomination/quality-evaluation"
                            can_export={userPermission ? userPermission?.f_export : false}
                            // columnVisibility={columnVisibility}
                            columnVisibility={tabIndex == 0 ? columnVisibility : columnVisibilityWeekly}
                            // initialColumns={initialColumns}
                            initialColumns={tabIndex == 0 ? initialColumns : initialColumnsTabWeekly}
                        />
                    </div>
                </div>

                {/* {
                    tabIndex == 0 ?
                        <TableNomQualityEvaluation
                            tableData={paginatedData}
                            isLoading={isLoading}
                            gasWeekFilter={srchStartDate}
                            columnVisibility={columnVisibility}
                            userPermission={userPermission}
                            tabIndex={tabIndex}
                        />
                        :
                        <TableNomQualityEvaluationWeekly
                            tableData={paginatedData}
                            isLoading={isLoading}
                            isSearch={isSearch}
                            gasWeekFilter={srchStartDate}
                            columnVisibility={columnVisibilityWeekly}
                            userPermission={userPermission}
                            tabIndex={tabIndex}
                        />
                } */}

                {
                    !isLoading ? (
                        <TableSkeleton />
                    ) : tabIndex == 0 ?
                        <TableNomQualityEvaluation
                            tableData={paginatedData}
                            isLoading={isLoading}
                            gasWeekFilter={srchStartDate}
                            columnVisibility={columnVisibility}
                            userPermission={userPermission}
                            tabIndex={tabIndex}
                        />
                        :
                        <TableNomQualityEvaluationWeekly
                            tableData={paginatedData}
                            isLoading={isLoading}
                            isSearch={isSearch}
                            gasWeekFilter={srchStartDate}
                            columnVisibility={columnVisibilityWeekly}
                            userPermission={userPermission}
                            tabIndex={tabIndex}
                        />
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
