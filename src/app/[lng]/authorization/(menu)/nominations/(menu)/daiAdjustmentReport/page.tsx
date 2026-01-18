"use client";
import { useEffect, useState } from "react";
import { Tune } from "@mui/icons-material"
import { exportToExcelDailyAdjustReport, exportToExcelDailyAdjustReportTabDetail, findRoleConfigByMenuName, formatNumberThreeDecimal, formatNumberThreeDecimalNoComma, generateUserPermission, groupByTimeAndPoint, groupByTimeAndPointTabTotal } from '@/utils/generalFormatter';
import { InputSearch } from '@/components/other/SearchForm';
import SearchInput from "@/components/other/searchInput";
import { getService, postService } from "@/utils/postService";
import { useFetchMasters } from "@/hook/fetchMaster";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import PaginationComponent from "@/components/other/globalPagination";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import { useAppDispatch } from "@/utils/store/store";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import getUserValue from "@/utils/getuserValue";
import ModalComponent from "@/components/other/ResponseModal";
import { decryptData } from "@/utils/encryptionData";
import { Tab, Tabs } from "@mui/material";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import dayjs from 'dayjs';
import { useForm } from "react-hook-form";
import TableTabDetail from "./form/tableTabDetail";
import TableTabTotal from "./form/tableTabTotal";
import BtnGeneral from "@/components/other/btnGeneral";
import TabtotalDetail from "./tab-total";

// แปลง "HH:MM" -> จำนวนนาทีตั้งแต่ 00:00
const toMinutes = (t?: string | null) => {
    if (!t) return Number.POSITIVE_INFINITY; // ไม่มีค่า => ไปท้ายสุด
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
};

interface ClientProps {
    // params: {
    //     lng: string;
    // };
}

const ClientPage: React.FC<ClientProps> = () => {
    // const {
    //     params: { lng },
    // } = props;
    // const { t } = useTranslation(lng, "mainPage");
    const { register, setValue, reset, formState: { errors }, watch, getValues } = useForm<any>();

    useEffect(() => {
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
        try {
            user_permission = user_permission ? JSON.parse(user_permission) : null; // Convert JSON string to object

            if (user_permission?.role_config) {
                const updatedUserPermission = generateUserPermission(user_permission);
                setUserPermission(updatedUserPermission);
            } else {
                const permission = findRoleConfigByMenuName('Daily Adjustment Report', userDT)
                setUserPermission(permission);
            }
        } catch (error) {
            // Failed to parse user_permission:
        }
    }

    // ############### REDUX DATA ###############
    const { zoneMaster, nominationPointData } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const dispatch = useAppDispatch();

    useEffect(() => {

        // Reset forceRefetch after fetching
        if (forceRefetch) {
            setForceRefetch(false); // Reset the flag after triggering the fetch
        }
        getPermission();
    }, [dispatch, forceRefetch]); // Watch for forceRefetch changes

    // ############### FIELD SEARCH ###############
    const [key, setKey] = useState(0);
    const [srchStartDate, setSrchStartDate] = useState<Date | null>(new Date());
    const [srchShipperName, setSrchShipperName] = useState<any>([]);
    const [srchZone, setSrchZone] = useState<any>([]);

    const [srchNomConcept, setSrchNomConcept] = useState<any>(['LMPT1', 'LMPT2', 'GMTP']); // Filter Nomination Point : Default Filter เฉพาะ LMPT1 / LMPT2 / GMTP https://app.clickup.com/t/86etzch6z
    // const [srchNomConcept, setSrchNomConcept] = useState<any>([]); // Filter Nomination Point : Default Filter เฉพาะ LMPT1 / LMPT2 / GMTP https://app.clickup.com/t/86etzch6z

    const [dataDetailFilter, setDataDetailFilter] = useState<any>([]);
    const [dataDetailFilterOriginal, setDataDetailOriginal] = useState<any>([]);
    const [dataTotalFilter, setDataTotalFilter] = useState<any>([]);
    const [dataTotalFilterForSearch, setDataTotalFilterForSearch] = useState<any>([]);

    const fetchData = async () => {
        try {
            setIsLoading(false)

            // Group (2 = TSO, 3 = Shipper, 4 = Other)
            const res_shipper_name = await getService(`/master/account-manage/group-master?user_type=3`);
            setDataShipper(res_shipper_name)

            // DATA ZONE แบบไม่ซ้ำ
            const zone_master_de_dup = Array.from(
                new Map(
                    zoneMaster?.data?.map((item: any) => [item.name, { zone_name: item.name }])
                ).values()
            );
            setDataZoneMasterZ(zone_master_de_dup);

            const body_main = {
                "checkAdjustment": false, // true adjust YES only 
                "startDate": dayjs().format("DD/MM/YYYY"), // 27/03/2025 จะมี ข้อมูล YES ในเครื่อง SIT.
                "endDate": dayjs().format("DD/MM/YYYY"),
                // "startDate": '27/03/2025', // 27/03/2025 จะมี ข้อมูล YES ในเครื่อง SIT.
                // "endDate": '27/03/2025',
                "contractCode": ""
            }

            const res_ = await postService('/master/daily-adjustment/daily-adjustment-report', body_main);
            const res_now = await postService('/master/daily-adjustment/daily-adjustment-report-now', body_main);

            const result_now = res_now?.filter((item: any) => {
                return (
                    (srchShipperName?.length > 0 ? srchShipperName.includes(item?.shipper_name) : true) &&
                    (srchZone?.length > 0 ? srchZone.includes(item?.zone_text) : true) &&
                    (srchNomConcept?.length > 0 ? srchNomConcept.includes(item?.point) : true)
                );
            });

            const makeAshit: any = res_?.map((item: any) => {
                return ({
                    ...item,
                    timeShowZero: item?.timeShow[0]?.time
                })
            })

            const result_2 = makeAshit?.filter((item: any) => {
                return (
                    (srchShipperName?.length > 0 ? srchShipperName.includes(item?.shipper_name) : true) &&
                    (srchZone?.length > 0 ? srchZone.includes(item?.zone_text) : true) &&
                    (srchNomConcept?.length > 0 ? srchNomConcept.includes(item?.point) : true)
                );
            });

            setData(res_)
            setDataCurrent(res_)
            setDataRoot(res_)

            let mode: any = tabIndex == 0 ? 'detail' : tabIndex == 1 && 'total';

            if (mode == 'detail') {

                setDataDetailFilter(result_2)
                setDataDetailOriginal(result_2)
            } else if (mode == 'total') {
                const groupedDataTotal = await groupByTimeAndPointTabTotal(result_2);
                const sortedTotal = groupedDataTotal?.map((row: any) => ({
                    ...row,
                    groups: [...row.groups].sort((a, b) =>
                        a.point.localeCompare(b.point, "en", { sensitivity: "base" })
                    )
                }));
                setDataTotalFilter(sortedTotal)
                setDataTotalFilterForSearch(sortedTotal)

                const groupedData = await groupByTimeAndPoint(result_now);
                const sortedCurrent = groupedData?.map(row => ({
                    ...row,
                    groups: [...row.groups].sort((a, b) =>
                        a.point.localeCompare(b.point, 'en', { sensitivity: 'base' })
                    )
                }));

                setDataCurrentTotal(sortedCurrent)
                setDataCurrentTotalFilter(sortedCurrent)
            }

            const getOption = logSearch['detail'];
            handleFieldSearch('detail', getOption);

            setTimeout(() => {
                setIsLoading(true);
            }, 300);
        } catch (err) {
        } finally {
            // setLoading(false);
        }
    };

    const handleFieldSearch = async (tab: any, option: any) => {
        // master/daily-adjustment/daily-adjustment-report
        setIsLoading(false)

        let mode: any = tab == 0 ? 'detail' : tab == 1 && 'total';
        const getOption = logSearch[mode];

        const dateLog = getOption?.date
        const shipperLog = getOption?.shipper
        const zoneLog = getOption?.zone
        const nompointLog = getOption?.nompoint

        const body_ = {
            "checkAdjustment": false, // true adjust YES only 
            "startDate": dateLog ? dayjs(dateLog).format("DD/MM/YYYY") : dayjs().format("DD/MM/YYYY"), // 27/03/2025 จะมี ข้อมูล YES ในเครื่อง SIT.
            "endDate": dateLog ? dayjs(dateLog).format("DD/MM/YYYY") : dayjs().format("DD/MM/YYYY"),
            "contractCode": ""
        }
        const res_ = await postService('/master/daily-adjustment/daily-adjustment-report', body_);

        const makeAshit: any = res_?.map((item: any) => {
            return ({
                ...item,
                timeShowZero: item?.timeShow[0]?.time
            })
        })

        const result_2 = makeAshit?.filter((item: any) => {
            const optionShipper = shipperLog;
            const optionZone = zoneLog;
            const optionNompoint = nompointLog;

            return (
                (optionShipper?.length > 0 ? optionShipper.includes(item?.shipper_name) : true) &&
                (optionZone?.length > 0 ? optionZone.includes(item?.zone_text) : true) &&
                (optionNompoint?.length > 0 ? optionNompoint.includes(item?.point) : true)
            );
        });

        // tab detail data current
        const result_3 = dataRoot.filter((item: any) => {
            return (
                (shipperLog ? item?.shipper_name === shipperLog : true) &&
                (zoneLog ? item?.zone_text === zoneLog : true) &&
                (nompointLog ? item?.point === nompointLog : true)
            );
        });
        setDataCurrent(result_3)

        // TAB TOTAL DATA CURRRENT
        // แถบ Total > Filter ยังไม่มีผลกับตารางบน และมีบาง filter ที่พอกด Filter แล้วทำให้ตารางแหว่ง https://app.clickup.com/t/86etu4pju
        const body_main = {
            "checkAdjustment": false, // true adjust YES only 
            "startDate": dayjs().format("DD/MM/YYYY"), // 27/03/2025 จะมี ข้อมูล YES ในเครื่อง SIT.
            "endDate": dayjs().format("DD/MM/YYYY"),
            // "startDate": '27/03/2025', // 27/03/2025 จะมี ข้อมูล YES ในเครื่อง SIT.
            // "endDate": '27/03/2025',
            "contractCode": ""
        }

        const res_now = await postService('/master/daily-adjustment/daily-adjustment-report-now', body_main);

        const result_now = res_now?.filter((item: any) => {
            const optionShipper = shipperLog;
            const optionZone = zoneLog;
            const optionNompoint = nompointLog;

            return (
                (optionShipper?.length > 0 ? optionShipper.includes(item?.shipper_name) : true) &&
                (optionZone?.length > 0 ? optionZone.includes(item?.zone_text) : true) &&
                (optionNompoint?.length > 0 ? optionNompoint.includes(item?.point) : true)
            );
        });

        setCurrentPage(1);

        if (mode == 'detail') {
            setDataDetailFilter(result_2)
            setDataDetailOriginal(result_2)
        } else if (mode == 'total') {
            const groupedDataTotal = await groupByTimeAndPointTabTotal(result_2);
            const sortedTotal = groupedDataTotal?.map((row: any) => ({
                ...row,
                groups: [...row.groups].sort((a, b) =>
                    a.point.localeCompare(b.point, "en", { sensitivity: "base" })
                )
            }));

            setDataTotalFilter(sortedTotal)
            setDataTotalFilterForSearch(sortedTotal)

            const groupedDataCurrent = await groupByTimeAndPoint(result_now);
            const sortedCurrent = groupedDataCurrent?.map(row => ({
                ...row,
                groups: [...row.groups].sort((a, b) =>
                    a.point.localeCompare(b.point, 'en', { sensitivity: 'base' })
                )
            }));
            setDataCurrentTotal(sortedCurrent)
            setDataCurrentTotalFilter(sortedCurrent)
        }

        setTimeout(() => {
            setIsLoading(true)
        }, 500);
    };

    const handleReset = async (tab: any) => {
        setDataTotalFilter([])
        setDataDetailFilter([])

        setKey((prevKey) => prevKey + 1);
        let mode: any = tab == 0 ? 'detail' : tab == 1 && 'total';
        const getOption = logSearch[mode];

        if (mode == 'detail') {
            getOption.date = new Date();
            getOption.shipper = [];
            getOption.zone = [];
            getOption.nompoint = ['LMPT1', 'LMPT2', 'GMTP'];

            setlogSearch((pre: any) => ({
                ...pre,
                [mode]: original_logSearch[mode]
            }))

            setSrchStartDate(new Date())
            setSrchShipperName([])
            setSrchZone([])
            setSrchNomConcept(['LMPT1', 'LMPT2', 'GMTP'])
        } else if (mode == 'total') {
            getOption.date = new Date();
            getOption.shipper = [];
            getOption.zone = [];
            getOption.nompoint = [];

            setlogSearch((pre: any) => ({
                ...pre,
                [mode]: original_logSearch[mode]
            }))

            setSrchStartDate(new Date())
            setSrchShipperName([])
            setSrchZone([])
            setSrchNomConcept([])
        }
        handleFieldSearch(tab, getOption);
    };

    // #region LIKE SEARCH
    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {
        const queryLower = query.replace(/\s+/g, '')?.toLowerCase().trim();
        // const dataToFilter = tabIndex === 1 ? dataDailyOriginal : dataTable;

        // ######################## TABLE 1 ########################
        const filtered = dataTable?.filter(
            (item: any) => {
                return (
                    item?.timeShow[0]?.time?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.shipper_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.point?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    formatNumberThreeDecimal(item?.timeShow?.value)?.toLowerCase()?.trim()?.includes(queryLower)
                )
            }
        );

        setDataCurrent(filtered);

        // ######################## TABLE 2 ########################
        const filteredTable2 = dataDetailFilterOriginal
            .map((item: any) => {
                const shipperMatch = item?.shipper_name?.replace(/\s+/g, '').toLowerCase().includes(queryLower);
                const pointMatch = item?.point?.replace(/\s+/g, '').toLowerCase().includes(queryLower);

                // Filter timeShow based on query
                const filteredTimeShow = item?.timeShow?.filter((ts: any) => {
                    const timeMatch = ts?.time?.replace(/\s+/g, '').toLowerCase().includes(queryLower);
                    const valueMatch = formatNumberThreeDecimal(ts?.value)?.toString().replace(/\s+/g, '').toLowerCase().includes(queryLower);
                    return timeMatch || valueMatch;
                });

                // const filteredValue = filteredTimeShow?.filter((ts: any) => {
                //     const valueMatch = formatNumberThreeDecimal(ts?.value)?.toString().replace(/\s+/g, '').toLowerCase().includes(queryLower);
                //     return valueMatch;
                // });

                // Case 1: Matches shipper or point → include all timeShow
                if (shipperMatch || pointMatch) {
                    return { ...item };
                }

                // Case 2: Only matches timeShow → include filtered timeShow
                if (filteredTimeShow.length > 0) {
                    return {
                        ...item,
                        timeShow: filteredTimeShow
                    };
                }

                // Case 3: No match at all → exclude
                return null;
            }).filter(Boolean); // remove nulls

        setDataDetailFilter(filteredTable2);
    };

    const formatNumberWithComma = (num: number) => {
        return num.toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 3,
        });
    };

    const handleSearchTabTotal = (query: string) => {
        const queryLower = query.replace(/\s+/g, '').toLowerCase().trim();

        if (!queryLower) {
            return setDataTotalFilter(dataTotalFilterForSearch)
        }

        let allowtimeQuery: any = [];
        function checkQuery(obj: any) {
            // ถ้ายังไม่มีค่า timeShowZero ที่เหมือนกันเลย → push
            if (!allowtimeQuery.some((item: any) => item === obj?.time)) {
                allowtimeQuery.push(obj?.time);
            }
        }

        dataTotalFilterForSearch?.length > 0 && dataTotalFilterForSearch?.map((row: any, index: any) => {
            row?.groups?.map((group: any) => {
                const filteredItems = group?.items?.find((item: any) => {
                    // ✅ เช็คว่ามีค่าใน timeShow.value ที่ match ไหม
                    const valueMatch = item?.timeShow?.some((ts: any) => {
                        const valueStr = formatNumberWithComma(ts?.value).toLowerCase();
                        return valueStr.includes(queryLower);
                    });

                    const valueMatchNoComma = item?.timeShow?.some((ts: any) => {
                        const valueStr = formatNumberThreeDecimalNoComma(ts?.value).toLowerCase();
                        return valueStr.includes(queryLower);
                    });

                    const valueMatchComma = item?.timeShow?.some((ts: any) => {
                        const valueStr = formatNumberThreeDecimal(ts?.value).toLowerCase();
                        return valueStr.includes(queryLower);
                    });

                    return (
                        valueMatch ||
                        valueMatchNoComma ||
                        valueMatchComma
                    );
                })

                if (filteredItems) {
                    const findResult = filteredItems?.timeShow?.filter((item: any) => {
                        return (
                            formatNumberWithComma(item?.value).toLowerCase().includes(queryLower) ||
                            formatNumberThreeDecimalNoComma(item?.value).toLowerCase().includes(queryLower) ||
                            formatNumberThreeDecimal(item?.value).toLowerCase().includes(queryLower)
                        )
                    })

                    if (findResult?.length > 0) {
                        findResult?.map((item: any) => checkQuery(item))
                    }
                }
            })
        })

        if (allowtimeQuery?.length > 0) {
            const result_2x = dataTotalFilterForSearch?.filter((item: any) => {
                return (
                    (allowtimeQuery?.includes(item?.time))
                );
            });

            setDataTotalFilter(result_2x)
        } else {
            setDataTotalFilter([]);
        }
    };

    // ############### DATA TABLE ###############
    const [tabIndex, setTabIndex] = useState(0); // 0=daily, 1=weekly
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [dataShipper, setDataShipper] = useState<any>([]);
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [dataTable, setData] = useState<any>([]);
    const [dataRoot, setDataRoot] = useState<any>([]);
    const [dataZoneMasterZ, setDataZoneMasterZ] = useState<any>([]);

    const [dataCurrent, setDataCurrent] = useState<any>([]);
    const [dataCurrentTotal, setDataCurrentTotal] = useState<any>([]);
    const [dataCurrentTotalFilter, setDataCurrentTotalFilter] = useState<any>([]); // เอาไว้ก่อน ถ้าได้ทำ filter current time เดียวมายำต่อ

    useEffect(() => {
        fetchData();
    }, [resetForm]);

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalModalSuccessMsg, setModalSuccessMsg] = useState('');
    const handleCloseModal = () => setModalSuccessOpen(false);
    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);

    // ############### PAGINATION TAB DETAIL CURRENT ###############
    const [currentPageCurrent, setCurrentPageCurrent] = useState(1);
    const [itemsPerPageCurrent, setItemsPerPageCurrent] = useState(10);
    const [paginatedDataCurrent, setPaginatedDataCurrent] = useState<any[]>([]);

    const handlePageChangeCurrent = (page: number) => {
        setCurrentPageCurrent(page);
    };

    const handleItemsPerPageChangeCurrent = (itemsPerPage: number) => {
        setItemsPerPageCurrent(itemsPerPage);
        setCurrentPageCurrent(1);
    };

    // ############### PAGINATION DETAIL TOTAL ###############
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [paginatedData, setPaginatedData] = useState<any[]>([]);
    const [paginatedDataRender, setPaginatedDataRender] = useState<any[]>([]);
    const [totalData, setTotalData] = useState<any[]>([]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (itemsPerPage: number) => {
        setItemsPerPage(itemsPerPage);
        setCurrentPage(1);
    };

    useEffect(() => {

        // SET PAGINATION CURRENT TAB DETAIL
        if (dataCurrent && Array.isArray(dataCurrent) && tabIndex == 0) {
            setPaginatedDataCurrent(dataCurrent.slice((currentPageCurrent - 1) * itemsPerPageCurrent, currentPageCurrent * itemsPerPageCurrent))
        }

        if (tabIndex == 0) {

            const flatTimeRows = dataDetailFilter.flatMap((row: any) =>
                (row.timeShow || []).map((item: any) => ({
                    ...row,       // copy shipper info (point, shipper_name, etc.)
                    time: item.time,
                    value: item.value,
                    valueMmscfd: item.valueMmscfd,
                }))
            );
            const sorted_time = [...flatTimeRows].sort((a, b) => toMinutes(a.time) - toMinutes(b.time));
            setTotalData(sorted_time)
            setPaginatedDataRender(sorted_time.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))

            setPaginatedData(dataDetailFilter.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
        }
        // if (dataDetailFilter && tabIndex == 1) {
        //     // setPaginatedData(filteredDataTable.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
        // }

    }, [dataCurrent, dataDetailFilter, currentPage, itemsPerPage, currentPageCurrent, itemsPerPageCurrent])


    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [
        { key: 'current_time', label: 'Current Time', visible: true },
        { key: 'time', label: 'Time', visible: true },
        { key: 'shipper_name', label: 'Shipper Name', visible: true },
        { key: 'nomination_point', label: 'Nomination Point', visible: true },
        { key: 'nomination_value', label: 'Nomination Value (MMSCFD)', visible: true },
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

    // ############### COLUMN SHOW/HIDE TAB TOTAL ###############
    // const initialColumnsTotal: any = [
    //     { key: 'gas_day', label: 'Gas Day', visible: true },
    //     { key: 'shipper_name', label: 'Shipper Name', visible: true },
    //     { key: 'capacity_right', label: 'Capacity Right (MMBTU/D)', visible: true },
    //     { key: 'nominated_value', label: 'Nominated Value (MMBTU/D)', visible: true },
    //     { key: 'overusage', label: 'Overusage (MMBTU/D)', visible: true },
    //     { key: 'imbalance', label: 'Imbalance (MMBTU/D)', visible: true },
    //     { key: 'action', label: 'Action', visible: true },
    // ];

    // const [anchorElTotal, setAnchorElTotal] = useState<null | HTMLElement>(null);
    // const openTotal = Boolean(anchorEl);
    // const [columnVisibilityTotal, setColumnVisibilityTotal] = useState<any>(
    //     Object.fromEntries(initialColumnsTotal.map((column: any) => [column.key, column.visible]))
    // );

    // const handleTogglePopoverTotal = (event: React.MouseEvent<HTMLElement>) => {
    //     setAnchorElTotal(anchorEl ? null : event.currentTarget);
    // };

    // const handleColumnToggleTotal = (columnKey: string) => {
    //     setColumnVisibilityTotal((prev: any) => ({
    //         ...prev,
    //         [columnKey]: !prev[columnKey]
    //     }));
    // };

    // ############### TAB ###############
    const handleTabChange = (event: any, newValue: any) => {
        setTabIndex(newValue);

        let mode: any = newValue == 0 ? 'detail' : newValue == 1 && 'total';
        const getOption = logSearch[mode];

        setSrchStartDate((pre: any) => getOption?.date)
        setSrchShipperName((pre: any) => getOption?.shipper)
        setSrchZone((pre: any) => getOption?.zone)
        setSrchNomConcept((pre: any) => getOption?.nompoint)

        handleFieldSearch(newValue, getOption);
    };

    let original_logSearch: any = {
        detail: {
            date: new Date(),
            shipper: [],
            zone: [],
            nompoint: ['LMPT1', 'LMPT2', 'GMTP'],
        },
        total: {
            date: new Date(),
            shipper: [],
            zone: [],
            nompoint: [],
        }
    }

    const [logSearch, setlogSearch] = useState<any>(original_logSearch);
    const updateDynamiclogSearch = (tab: any) => {
        let mode: any = tab == 0 ? 'detail' : tab == 1 && 'total';

        const dateLog = srchStartDate
        const shipperLog = srchShipperName
        const zoneLog = srchZone
        const nompointLog = srchNomConcept

        const getOption = logSearch[mode];

        getOption.date = dateLog;
        getOption.shipper = shipperLog;
        getOption.zone = zoneLog;
        getOption.nompoint = nompointLog;

        setlogSearch((pre: any) => ({
            ...pre,
            [mode]: {
                date: dateLog,
                shipper: shipperLog,
                zone: zoneLog,
                nompoint: nompointLog,
            }
        }))

        handleFieldSearch(tab, getOption);
    }

    return (
        <div className=" space-y-2">

            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl  flex flex-col sm:flex-row gap-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                    <DatePickaSearch
                        key={"start" + key}
                        label={"Gas Day"}
                        placeHolder={"Select Gas Day"}
                        defaultValue={srchStartDate}
                        onChange={(e: any) => {
                            setSrchStartDate(e ? e : null)
                        }}
                    />

                    <InputSearch
                        id="searchShipperName"
                        label="Shipper Name"
                        type="select-multi-checkbox" // Filter ทั้งหมดปรับเป็น Multi Select https://app.clickup.com/t/86etzch70
                        value={srchShipperName}
                        placeholder="Select Shipper Name"
                        onChange={(e) => setSrchShipperName(e?.target?.value)}
                        options={dataShipper
                            ?.filter((item: any) => // เห็นแค่ชื่อตัวเอง
                                userDT?.account_manage?.[0]?.user_type_id == 3
                                    ? item?.id === userDT?.account_manage?.[0]?.group?.id
                                    : true
                            )
                            .map((item: any) => ({
                                // value: item.id,
                                value: item.name,
                                label: item.name,
                            }))
                        }
                    />

                    <InputSearch
                        id="searchZoneMaster"
                        label="Zone"
                        type="select-multi-checkbox" // Filter ทั้งหมดปรับเป็น Multi Select https://app.clickup.com/t/86etzch70
                        value={srchZone}
                        onChange={(e) => {
                            setSrchZone(e.target.value)

                            // v2.0.114 Filter เมื่อเลือก Zone Wording ตรง Select nom point หายไป ควรจะขึ้น Default ไว้ เมื่อ select nom point ยังไม่ได้เลือก https://app.clickup.com/t/86ev03wuu
                            if (e.target.value.length == 0) {
                                setSrchNomConcept(['LMPT1', 'LMPT2', 'GMTP'])
                            } else {
                                setSrchNomConcept([])
                            }
                        }}
                        options={dataZoneMasterZ?.map((item: any) => ({
                            // value: item.id.toString(),
                            value: item.zone_name,
                            label: item.zone_name
                        }))}
                    />

                    <InputSearch
                        id="searchNomPointConceptPoint"
                        label="Nomination Point"
                        type="select-multi-checkbox" // Filter ทั้งหมดปรับเป็น Multi Select https://app.clickup.com/t/86etzch70
                        value={srchNomConcept}
                        onChange={(e) => setSrchNomConcept(e.target.value)}

                        // Filter Nomination จะต้องขึ้นแค่ชื่อเดียว https://app.clickup.com/t/86etzchbk
                        options={nominationPointData?.data?.filter((item: any, index: any, self: any): any => index === self.findIndex((i: any) => i.nomination_point === item.nomination_point))
                            .filter((item: any) => srchZone.length > 0 ? item?.zone?.name?.toString() === srchZone : true) // ถ้าไม่ได้กด search zone ไม่ต้องกรอง
                            .map((item: any) => ({
                                value: item.nomination_point,
                                label: item.nomination_point
                            }))}
                    />

                    <BtnSearch handleFieldSearch={() => updateDynamiclogSearch(tabIndex)} />
                    <BtnReset handleReset={() => handleReset(tabIndex)} />
                </aside>
                <aside className="mt-auto ml-1 w-full sm:w-auto">
                    {/* BtnGeneral */}
                </aside>
            </div>

            <Tabs
                value={tabIndex}
                onChange={handleTabChange}
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
                    ["Detail", "Total"]?.map((label, index) => (
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
                        {/* <div onClick={tabIndex === 0 ? handleTogglePopoverIntraday : tabIndex === 1 ? handleTogglePopover : handleTogglePopoverWeekly}> */}
                        {
                            tabIndex == 0 && (<div onClick={handleTogglePopover}>
                                <Tune
                                    className="cursor-pointer rounded-lg"
                                    style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                                />
                            </div>)
                        }
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end">


                        <SearchInput onSearch={tabIndex == 0 ? handleSearch : handleSearchTabTotal} />

                        {
                            tabIndex == 0 && ( // EXPORT TAB DETAIL
                                <BtnGeneral
                                    bgcolor={"#24AB6A"}
                                    modeIcon={'export'}
                                    textRender={"Export"}
                                    // disable={paginatedDataCurrent.length == 0 || dataDetailFilter.length == 0 ? true : false}
                                    disable={paginatedDataCurrent.length == 0 && dataDetailFilter.length == 0 ? true : false}
                                    // generalFunc={() => exportToExcelDailyAdjustReport(dataCurrentTotal, paginatedData, 'tab-detail', columnVisibility)}
                                    // generalFunc={() => exportToExcelDailyAdjustReport(dataCurrentTotal, totalData, 'tab-detail', columnVisibility)}
                                    generalFunc={() => exportToExcelDailyAdjustReportTabDetail(dataCurrentTotal, totalData, 'tab-detail', columnVisibility)}
                                    can_export={userPermission ? userPermission?.f_export : false}
                                />
                            )
                        }

                        {
                            tabIndex == 1 && (  // EXPORT TAB TOTAL
                                <BtnGeneral
                                    bgcolor={"#24AB6A"}
                                    modeIcon={'export'}
                                    textRender={"Export"}
                                    disable={dataCurrentTotal.length == 0 && dataTotalFilter.length == 0 ? true : false}
                                    generalFunc={() => exportToExcelDailyAdjustReport(dataCurrentTotal, dataTotalFilter, 'tab-total', columnVisibility)}
                                    can_export={userPermission ? userPermission?.f_export : false}
                                />
                            )
                        }

                    </div>
                </div>

                {
                    tabIndex == 0 ? (<> {/* TAB DETAIL */}

                        {/* ++++++++++++++++ TABLE ALL ++++++++++++++++ */}
                        <TableTabDetail
                            tableDataAll={paginatedData}
                            tableDataRender={paginatedDataRender}
                            isLoading={isLoading}
                            columnVisibility={columnVisibility}
                            userPermission={userPermission}
                            tableType={'all'}
                        />
                        <PaginationComponent
                            // totalItems={dataDetailFilter?.length}
                            totalItems={totalData?.length}
                            itemsPerPage={itemsPerPage}
                            currentPage={currentPage}
                            onPageChange={handlePageChange}
                            onItemsPerPageChange={handleItemsPerPageChange}
                        />
                    </>
                    ) : tabIndex == 1 && (
                        <div>
                            {/* ตารางบน */}
                            {/* TAB TOTAL TABLE CURRENT*/}
                            <TableTabTotal
                                tableDataCurrent={dataCurrentTotal}
                                isLoading={isLoading}
                                columnVisibility={columnVisibility}
                                userPermission={userPermission}
                                tableType={'current'}
                                autoHeight={true}
                            />
                            {/* ตัด pagination ทั้ง Table บนและ Table ล่าง https://app.clickup.com/t/86etzch92 */}
                            {/* <PaginationComponent
                                totalItems={dataCurrentTotal?.length}
                                itemsPerPage={itemsPerPageCurrent}
                                currentPage={currentPageCurrent}
                                onPageChange={handlePageChangeCurrent}
                                onItemsPerPageChange={handleItemsPerPageChangeCurrent}
                            /> */}

                            {/* ตารางล่าง */}
                            {/* TAB TOTAL TABLE ALL*/}
                            <TableTabTotal
                                tableDataAll={dataTotalFilter}
                                isLoading={isLoading}
                                columnVisibility={columnVisibility}
                                userPermission={userPermission}
                                tableType={'all'}
                            />

                            {/* ตัด pagination ทั้ง Table บนและ Table ล่าง https://app.clickup.com/t/86etzch92 */}
                            {/* <PaginationComponent
                                totalItems={dataTotalFilter?.length}
                                itemsPerPage={itemsPerPageCurrent}
                                currentPage={currentPageCurrent}
                                onPageChange={handlePageChangeCurrent}
                                onItemsPerPageChange={handleItemsPerPageChangeCurrent}
                            /> */}

                            {/* <TableDaily
                                tableData={paginatedData}
                                isLoading={isLoading}
                                gasWeekFilter={srchStartDate}
                                columnVisibility={columnVisibility}
                                userPermission={userPermission}
                                tabIndex={tabIndex}
                                openViewForm={openViewForm}
                            /> */}
                        </div>
                    )
                }

            </div>

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
        </div>
    );
};

export default ClientPage;