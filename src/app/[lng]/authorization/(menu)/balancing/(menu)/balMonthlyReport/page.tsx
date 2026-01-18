"use client";

import { useEffect, useState } from "react";
import ModalComponent from "@/components/other/ResponseModal";
import { InputSearch } from '@/components/other/SearchForm';
import { Tune } from "@mui/icons-material"
import { getService } from "@/utils/postService";
import SearchInput from "@/components/other/searchInput";
import { Tab, Tabs } from '@mui/material';
import { TabTable } from '@/components/other/tabPanel';
import TableReport from "./form/tableReport";
import TableDownload from "./form/tableDownload";
import BtnGeneral from "@/components/other/btnGeneral";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { decryptData } from "@/utils/encryptionData";
import getUserValue from "@/utils/getuserValue";
import BtnExport from "@/components/other/btnExport";
import { findRoleConfigByMenuName, formatDate, formatNumberFourDecimal, formatNumberFourDecimalNoComma, formatTime, generateUserPermission, sleep, toDayjs } from "@/utils/generalFormatter";
import PaginationComponent from "@/components/other/globalPagination";
import NodataTable from "@/components/other/nodataTable";
import { fetchAreaMaster } from "@/utils/store/slices/areaMasterSlice";
import { useAppDispatch } from "@/utils/store/store";
import { useFetchMasters } from "@/hook/fetchMaster";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import MonthYearPickaSearch from "@/components/library/dateRang/monthYearPicker";
import dayjs from 'dayjs';

interface ClientProps {
    // params: {
    //     lng: string;
    // };
}

const ClientPage: React.FC<ClientProps> = () => {
    // const { params: { lng } } = props;
    const userDT: any = getUserValue();
    // const [csrfToken, setCsrfToken] = useState<any>(null);
    const [tk, settk] = useState<boolean>(true);

    // ############### Check Authen ###############
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
                const permission = findRoleConfigByMenuName('Monthly Report', userDT)
                setUserPermission(permission);
            }
        } catch (error) {
            // Failed to parse user_permission:
        }
    }

    // ############### REDUX DATA ###############
    const { areaMaster } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (forceRefetch || !areaMaster?.data) {
            dispatch(fetchAreaMaster());
        }

        // Reset forceRefetch after fetching
        if (forceRefetch) {
            setForceRefetch(false); // Reset the flag after triggering the fetch
        }
        getPermission();
    }, [dispatch, forceRefetch, areaMaster]); // Watch for forceRefetch changes

    // ############### FIELD SEARCH ###############
    const [key, setKey] = useState(0);
    const [isFilter, setIsFilter] = useState<any>(false);
    const [srchGasDay, setSrchGasDay] = useState<any>(null);
    const [srchShipperName, setSrchShipperName] = useState<any>('');
    const [srchContractCode, setSrchContractCode] = useState('');
    const [srchVersion, setSrchVersion] = useState('');
    const [urlForApprove, setUrlForApprove] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [disableApprove, setDisableApprove] = useState(true);
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [dataSummary, setDataSummary] = useState<any>({});

    const handleFieldSearch = async () => {
        setIsLoading(false)
        setIsFilter(true)

        // TABLE REPORT
        // if (srchGasDay !== null && tabIndex == 0) {
        if (tabIndex == 0) {
            const month = srchGasDay ? String(srchGasDay.getMonth() + 1).padStart(2, '0') : dayjs().format("MM");
            const year = srchGasDay ? String(srchGasDay.getFullYear()) : dayjs().format("YYYY");
            setMonth(month)
            setYear(year)

            let new_url = `/master/balancing/balancing-monthly-report?skip=0&limit=100` // skip, limit fix ของ eviden
            let new_url_approve = `/master/balancing/balancing-monthly-report-approved?skip=0&limit=100`
            if (srchShipperName) {
                new_url += `&shipperId=${srchShipperName}`
                new_url_approve += `&shipperId=${srchShipperName}`

                // ถ้าไม่เลือก shipper ห้ามส่ง contract
                if (srchContractCode) {
                    new_url += `&contractCode=${srchContractCode}`
                    new_url_approve += `&contractCode=${srchContractCode}`
                }
            }
            new_url += `&month=${month}`
            new_url += `&year=${year}`
            new_url_approve += `&month=${month}`
            new_url_approve += `&year=${year}`
            setUrlForApprove(new_url_approve)

            const res_new_data = await getService(new_url);

            if (res_new_data?.setDataUse?.length > 0) {

                // ถ้า res_new_data.typeReport == "Summary" แสดงว่าไม่ได้กรอง shipper มา
                // ให้หา res_new_data.setDataUse.key ที่เท่ากับ res_new_data.typeReport แล้วเอาไปแสดงผล
                if (srchShipperName == '' && srchContractCode == '') { // ไม่ได้เสิช shipper กับ contract
                    let filter_summary: any = res_new_data?.setDataUse?.filter((item: any) => item.keys == "Summary")

                    // หา sum เพื่อเอาไปแสดงผล total
                    // "gas_day": "sum" คือแถบเขียว
                    let find_data_sum = filter_summary?.[0]?.value?.find((item: any) => item.gas_day == 'sum')
                    setDataSummary(find_data_sum)

                    // กันแตก
                    if (!Array.isArray(filter_summary)) filter_summary = [];
                    if (!filter_summary[0]) filter_summary[0] = { value: [] };

                    // ลบ sum ออกจาก filter_summary
                    filter_summary[0].value = filter_summary?.[0]?.value?.filter((row: any) => row.gas_day !== 'sum');

                    // ทำให้ value อยู่ชั้นเดียวกับ gas_day
                    const flatData = filter_summary?.[0]?.value.map(({ gas_day, value }: any) => ({ gas_day, ...value }));

                    setData(flatData)
                    setFilteredDataTable(flatData);
                } else {

                    let type_report = res_new_data.typeReport;
                    let filter_shipper_or_contract: any = res_new_data?.setDataUse && Array.isArray(res_new_data.setDataUse) ? res_new_data.setDataUse.filter((item: any) => item?.keys == type_report) : [];

                    // หา sum เพื่อเอาไปแสดงผล total
                    let find_data_sum = filter_shipper_or_contract?.[0]?.value && Array.isArray(filter_shipper_or_contract[0].value) ? filter_shipper_or_contract[0].value.find((item: any) => item?.gas_day == 'sum') : null;
                    setDataSummary(find_data_sum);

                    // ลบ sum ออกจาก filter_shipper_or_contract
                    if (filter_shipper_or_contract && filter_shipper_or_contract[0] && filter_shipper_or_contract[0].value && Array.isArray(filter_shipper_or_contract[0].value)) {
                        filter_shipper_or_contract[0].value = filter_shipper_or_contract[0].value.filter((row: any) => row?.gas_day !== 'sum');
                    }

                    // ทำให้ value อยู่ชั้นเดียวกับ gas_day
                    const flatData = filter_shipper_or_contract?.[0]?.value.map(({ gas_day, value }: any) => ({ gas_day, ...value }));

                    setData(flatData);
                    setFilteredDataTable(flatData);
                }

                // Active เมื่อ filter Gas Month และ Shipper Name 
                // if (srchGasDay == null || srchShipperName == '' || res_new_data?.setDataUse?.length <= 0) {
                if (srchShipperName == '' || res_new_data?.setDataUse?.length <= 0) {
                    setDisableApprove(true)
                } else {
                    setDisableApprove(false)
                }

            } else {
                setData([]);
                setFilteredDataTable([]);
                setDataSummary({})
                setDisableApprove(true)
            }

            setIsFilter(true)
        } else { // table download

            const localDate = toDayjs(srchGasDay).format("MMMM");
            const result_2 = dataTabDownloadOriginal.filter((item: any) => {
                return (
                    (srchGasDay ? localDate == item?.monthText : true) &&
                    (srchContractCode ? srchContractCode == item?.contractCode : true)
                );
            });

            setDataTabDownload(result_2)
        }

        setTimeout(() => {
            setIsLoading(true)
        }, 500);
    };

    const handleReset = () => {
        setIsFilter(false)
        setSrchGasDay(null);
        setSrchContractCode('')
        setSrchShipperName('')
        setSrchVersion('')
        setUrlForApprove('')
        setDisableApprove(true)

        setFilteredDataTable([]);

        if (tabIndex == 1) {
            const localDate = toDayjs().format("MMMM");
            const fitered_current_month = dataTabDownloadOriginal.filter((item: any) => {
                return (
                    (localDate ? localDate == item?.monthText : true)
                );
            });
            setDataTabDownload(fitered_current_month)
        }
        setKey((prevKey) => prevKey + 1);
    };

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {
        const queryLower = query?.replace(/\s+/g, '')?.toLowerCase().trim();

        // table report
        if (tabIndex == 0) {
            if (!queryLower) {
                setFilteredDataTable(dataTable);
                return;
            }

            const filtered = dataTable?.filter(
                (item: any) => {

                    return (
                        item?.gas_day?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item["Entry Point"]?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item["Exit"]?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item["Entry - Exit"]?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item["Fuel Gas"]?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item["Balancing Gas"]?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item["Change Min Inventory"]?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item["Shrinkagate"]?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item["Commissioning"]?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item["Gas Vent"]?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item["Other Gas"]?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item["Imbalance"]?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item["Acc. Imbqalance"]?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item["Min Inventory"]?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                        formatNumberFourDecimal(item["Entry Point"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimal(item["Exit"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimal(item["Entry - Exit"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimal(item["Fuel Gas"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimal(item["Balancing Gas"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimal(item["Change Min Inventory"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimal(item["Shrinkagate"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimal(item["Commissioning"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimal(item["Gas Vent"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimal(item["Other Gas"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimal(item["Imbalance"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimal(item["Acc. Imbqalance"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimal(item["Min Inventory"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                        formatNumberFourDecimalNoComma(item["Entry Point"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimalNoComma(item["Exit"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimalNoComma(item["Entry - Exit"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimalNoComma(item["Fuel Gas"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimalNoComma(item["Balancing Gas"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimalNoComma(item["Change Min Inventory"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimalNoComma(item["Shrinkagate"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimalNoComma(item["Commissioning"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimalNoComma(item["Gas Vent"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimalNoComma(item["Other Gas"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimalNoComma(item["Imbalance"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimalNoComma(item["Acc. Imbqalance"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimalNoComma(item["Min Inventory"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)

                    )
                }
            );

            setFilteredDataTable(filtered);
        } else { // table download
            if (!queryLower) {
                setDataTabDownload(dataTabDownloadOriginal);
                return;
            }

            const filtered = dataTabDownloadOriginal?.filter(
                (item: any) => {
                    return (
                        item?.monthText?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item?.contractCode?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item?.file?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item?.version?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item?.typeReport?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item?.create_by_account?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower.trim()) ||
                        item?.create_by_account?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower.trim()) || // เผื่อ search นามสกุล
                        item?.create_by_account?.first_name && item?.create_by_account?.last_name && (item?.create_by_account?.first_name + item?.create_by_account?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower.trim()) || // เผื่อ search ชื่อ - นามสกุล พร้อมกัน
                        formatTime(item?.create_date)?.toLowerCase().includes(queryLower) ||
                        formatDate(item?.create_date)?.replace(/\s+/g, '').toLowerCase().includes(queryLower)
                    )
                }
            );

            setDataTabDownload(filtered)
        }
    };

    // ############### DATA TABLE ###############
    const [tabIndex, setTabIndex] = useState(0);
    const [dataTable, setData] = useState<any>([]);
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [dataContractOriginal, setDataContractOriginal] = useState<any>([]);
    const [dataContract, setDataContract] = useState<any>([]);
    const [dataShipper, setDataShipper] = useState<any>([]);
    const [dataTabDownloadOriginal, setDataTabDownloadOriginal] = useState<any>([]);
    const [dataTabDownload, setDataTabDownload] = useState<any>([]);
    const [dataVersion, setDataVersion] = useState<any>([]);

    const handleChange = (event: any, newValue: any) => {
        setTabIndex(newValue);
        handleReset();
    };

    const fetchData = async () => {
        try {
            // ถ้า user เป็น shipper
            // https://app.clickup.com/t/86ert2k28 ตามที่คุยกัน หากเป็น shipper user ถ้ามี filter ชื่อ shipper ให้ค้างชื่อ shipper ตัวเองไว้เลย ไม่ต้องขึ้นเป็น dropdown ให้เลือก - ปรับทั้ง system
            if (userDT?.account_manage?.[0]?.user_type_id == 3) {
                setSrchShipperName(userDT?.account_manage?.[0]?.group?.id_name)
            }

            // Group (2 = TSO, 3 = Shipper, 4 = Other)
            const res_shipper_name = await getService(`/master/account-manage/group-master?user_type=3`);
            setDataShipper(res_shipper_name)

            // DATA TAB DOWNLAOD
            const res_tab_download = await getService(`/master/balancing/balancing-monthly-report-download`);
            setDataTabDownloadOriginal(res_tab_download)
            setDataTabDownload(res_tab_download)
            // setDataTabDownloadOriginal(mock_data_tab_download_bal_monthly_report) // ----> mock
            // setDataTabDownload(mock_data_tab_download_bal_monthly_report) // ----> mock

            // DATA SELECT VERSION
            const res_master_version = await getService(`/master/allocation/version-exe`);
            setDataVersion(res_master_version)

            // DATA CONTRACT CODE
            // const res_contract_code = await getService(`/master/release-capacity-submission/contract-code`);
            const res_contract_code: any = await getService(`/master/capacity/capacity-request-management`);
            setDataContract(res_contract_code);
            setDataContractOriginal(res_contract_code)

            // DATA MAIN
            let new_url = `/master/balancing/balancing-monthly-report?skip=0&limit=100` // skip, limit fix ของ eviden
            const monthx = dayjs().format('MM');   // 01‑12 มี 0 นำหน้า
            const yearx = dayjs().format('YYYY'); // 4 หลัก

            new_url += `&month=${monthx}`
            new_url += `&year=${yearx}`

            const res_new_data = await getService(new_url);
            if (res_new_data?.setDataUse?.length > 0) {
                let filter_summary: any = res_new_data?.setDataUse?.filter((item: any) => item.keys == "Summary")

                // หา sum เพื่อเอาไปแสดงผล total
                // "gas_day": "sum" คือแถบเขียว
                let find_data_sum = filter_summary[0]?.value?.find((item: any) => item.gas_day == 'sum')
                setDataSummary(find_data_sum)

                // กันแตก
                if (!Array.isArray(filter_summary)) filter_summary = [];
                if (!filter_summary[0]) filter_summary[0] = { value: [] };

                // ลบ sum ออกจาก filter_summary
                filter_summary[0].value = filter_summary[0]?.value?.filter((row: any) => row.gas_day !== 'sum');

                // ทำให้ value อยู่ชั้นเดียวกับ gas_day
                const flatData = filter_summary[0]?.value.map(({ gas_day, value }: any) => ({ gas_day, ...value }));

                setData(flatData)
                setFilteredDataTable(flatData);
                setIsFilter(true)

            } else {
                setData([]);
                setFilteredDataTable([]);
                setDataSummary({})
            }

            setTimeout(() => {
                setIsLoading(true);
            }, 500);
        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    };

    const fetchDataDownload = async () => {
        // DATA TAB DOWNLOAD
        try {
            const res_tab_download = await getService(`/master/balancing/balancing-monthly-report-download`);
            setDataTabDownloadOriginal(res_tab_download)
            setDataTabDownload(res_tab_download)

            settk(!tk);

        } catch (error) {
            setDataTabDownloadOriginal([])
            setDataTabDownload([])
        }
    }

    useEffect(() => {
        fetchData();
        getPermission();
    }, [resetForm]);

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const handleCloseModal = () => setModalSuccessOpen(false);

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    // const openApproveModal = (id: any, data: any) => {
    //     setIsLoading(false)
    //     setDisableApprove(true)

    //     approveMonthlyReport();

    //     setTimeout(() => { // ยื้อเวลาให้มันทำงานหน่อย
    //         fetchDataDownload();
    //     }, 2000);

    //     setTimeout(() => {
    //         setModalSuccessOpen(true);
    //         setIsLoading(true)
    //         setTabIndex(1)
    //     }, 1000);
    // };

    const openApproveModal = async (id: any, data: any) => {
        setIsLoading(false);
        setDisableApprove(true);

        try {
            const resApprove = await approveMonthlyReport();
            await sleep(800);

            await fetchDataDownload();

            setModalSuccessOpen(true);
            setTabIndex(1);

            await sleep(400);
            setIsLoading(true)
        } catch (err) {
            // approve failed
            // TODO: แจ้ง error ให้ผู้ใช้ เช่น toast/error state
        } finally {
            // approve ok
            settk(!tk);
            setIsLoading(true);
            setDisableApprove(false);
        }

        try {
            const res_tab_download = await getService(`/master/balancing/balancing-monthly-report-download`);
            setDataTabDownloadOriginal(res_tab_download)
            setDataTabDownload(res_tab_download)
        } catch (error) {
        }

        setTimeout(() => {
            handleFieldSearch();
        }, 1000);
    };

    const approveMonthlyReport = async () => {
        // const res_approve = await getService(urlForApprove);
        return await getService(urlForApprove);
    };

    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [
        { key: 'date', label: 'Date', visible: true },
        { key: 'entry_point', label: 'Entry Point', visible: true },
        { key: 'exit_point', label: 'Exit Point', visible: true },
        { key: 'entry_exit', label: 'Entry - Exit', visible: true },
        { key: 'fuel_gas', label: 'Fuel Gas', visible: true },
        { key: 'balancing_gas', label: 'Balancing Gas', visible: true },
        { key: 'change_min_inventory', label: 'Change Min Inventory', visible: true },
        { key: 'shrinkagate', label: 'Shrinkage', visible: true },
        { key: 'commissioning', label: 'Commissioning', visible: true },
        { key: 'gas_vent', label: 'Gas Vent', visible: true },
        { key: 'other_gas', label: 'Other Gas', visible: true },
        { key: 'imbalance', label: 'Imbalance', visible: true },
        { key: 'acc_imbalance', label: 'Acc. Imbalance', visible: true },
        { key: 'min_inventory', label: 'Min Inventory', visible: true },
    ];

    const initialColumnsDownload: any = [
        { key: 'month', label: 'Month', visible: true },
        { key: 'contract_code', label: 'Contract Code', visible: true },
        { key: 'file', label: 'File', visible: true },
        { key: 'report_version', label: 'Report Version', visible: true },
        { key: 'type_report', label: 'Type Report', visible: true },
        { key: 'approved_by', label: 'Approved by', visible: true },
        { key: 'download', label: 'Download', visible: true },
    ];

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [columnVisibility, setColumnVisibility] = useState<any>(
        Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))
    );

    useEffect(() => {
        if (tabIndex == 0) {
            setColumnVisibility(Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible])))
        } else {
            setColumnVisibility(Object.fromEntries(initialColumnsDownload.map((column: any) => [column.key, column.visible])))
        }
    }, [tabIndex])

    const handleTogglePopover = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const handleColumnToggle = (columnKey: string) => {
        setColumnVisibility((prev: any) => ({
            ...prev,
            [columnKey]: !prev[columnKey]
        }));
    };

    // ############### PAGINATION ###############
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [paginatedData, setPaginatedData] = useState<any[]>([]);
    const [paginatedDataDownload, setPaginatedDataDownload] = useState<any[]>([]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (itemsPerPage: number) => {
        setItemsPerPage(itemsPerPage);
        setCurrentPage(1);
    };

    useEffect(() => {
        if (filteredDataTable) {
            setPaginatedData(filteredDataTable?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
            // setPaginatedData(filteredDataTable)
        }

        if (tabIndex == 1) {
            setPaginatedDataDownload(dataTabDownload?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
        }
    }, [filteredDataTable, currentPage, itemsPerPage, dataTabDownload])


    useEffect(() => {
        if (tabIndex == 1) {
            const localDate = toDayjs().format("MMMM");
            const fitered_current_month = dataTabDownloadOriginal.filter((item: any) => {
                return (
                    (localDate ? localDate == item?.monthText : true)
                );
            });
            setDataTabDownload(fitered_current_month)
        }

    }, [tabIndex])

    return (
        <div className=" space-y-2">
            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                    <MonthYearPickaSearch
                        key={"start" + key}
                        label={'Gas Month'}
                        placeHolder={'Select Gas Month'}
                        allowClear
                        min={dataTable?.date_balance}
                        isDefaultCurrentMonth={true}
                        // max={endOfMonth(new Date())} // เลือกได้สูงสุดคือ เดือนปีปัจจุบัน นับจากเดือน ที่ close ล่าสุด
                        // customWidth={200}
                        // customHeight={35}
                        onChange={(e: any) => {
                            // const formattedDate = dayjs(e).format('DD-MM-YYYY');
                            // setSrchGasDay(e ? formattedDate : null);
                            setSrchGasDay(e ? e : null)
                        }}
                    />

                    {
                        tabIndex == 0 && <InputSearch
                            id="searchShipper"
                            label="Shipper Name"
                            type="select"
                            value={srchShipperName}
                            // onChange={(e) => setSrchShipper(e.target.value)}
                            isDisabled={userDT?.account_manage?.[0]?.user_type_id == 3 ? true : false}
                            onChange={(e) => {
                                setSrchContractCode('')
                                if (e.target.value == undefined) {
                                    setSrchShipperName('')
                                } else {
                                    setSrchShipperName(e.target.value)
                                }
                            }}
                            options={dataShipper
                                ?.filter((item: any) => // เห็นแค่ชื่อตัวเอง
                                    userDT?.account_manage?.[0]?.user_type_id == 3 ? item?.id === userDT?.account_manage?.[0]?.group?.id : true
                                )
                                .map((item: any) => ({
                                    value: item.id_name,
                                    label: item.name,
                                }))
                            }
                        />
                    }

                    {/* <InputSearch
                        id="searchVersion"
                        label="Version"
                        type="select"
                        value={srchVersion}
                        onChange={(e) => setSrchVersion(e.target.value)}
                        options={dataVersion?.map((item: any) => ({
                            value: item?.execute_timestamp,
                            label: dayjs(item?.execute_timestamp * 1000).format('DD/MM/YYYY HH:mm')
                        }))}
                    /> */}

                    <InputSearch
                        id="searchContractCode"
                        label="Contract Code"
                        type="select"
                        value={srchContractCode}
                        onChange={(e) => setSrchContractCode(e.target.value)}
                        options={dataContract?.filter((contract: any) => srchShipperName !== '' ? contract.group.id_name === srchShipperName : true).map((item: any) => ({ // กรอง contract ตาม shipper
                            value: item.contract_code,
                            label: item.contract_code
                        }))}
                    />

                    <BtnSearch handleFieldSearch={handleFieldSearch} />
                    <BtnReset handleReset={handleReset} />
                </aside>

                <aside className="mt-auto ml-1 w-full sm:w-auto ">
                    <div className="flex flex-wrap gap-2 justify-end">
                        <BtnGeneral
                            textRender={"Approve"}
                            iconNoRender={true}
                            bgcolor={"#C8FFD7"}
                            generalFunc={() => openApproveModal('x', 'x')}
                            disable={disableApprove} // Active เมื่อ filter Gas Month และ Shipper Name
                            can_create={userPermission ? userPermission?.f_approved : false}
                        />
                    </div>
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
                    ["Report", "Download"]?.map((label, index) => (
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

            <div className="border-[#DFE4EA] border-[1px] p-2 rounded-tl-none rounded-tr-lg shadow-sm">
                <div>
                    <div className=" text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
                        <div onClick={handleTogglePopover}>
                            <Tune
                                className="cursor-pointer rounded-lg"
                                style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                            />
                        </div>

                        <div className="flex flex-wrap gap-2 justify-end">
                            <SearchInput onSearch={handleSearch} />
                            {
                                tabIndex == 0 &&
                                <BtnExport
                                    textRender={"Export"}
                                    data={filteredDataTable}
                                    path="balancing/balancing-monthly-report"
                                    can_export={userPermission ? userPermission?.f_export : false}
                                    columnVisibility={columnVisibility}
                                    initialColumns={initialColumns}
                                    disable={isFilter ? false : true}
                                    specificMenu={'balancing-monthly-report'}
                                    specificData={{
                                        "skip": 0, //fix
                                        "limit": 100,  //fix
                                        "month": month ? month : dayjs().format("MM"),
                                        "year": year ? year : dayjs().format("YYYY"),
                                        "shipperId": srchShipperName, //NGP-S01-001
                                        "contractCode": srchContractCode !== '' ? srchContractCode : "Summary" // Summary หรือ 2025-CNF-002 .....
                                    }}
                                />
                            }

                            {
                                tabIndex == 1 && <BtnExport
                                    textRender={"Export"}
                                    data={dataTabDownload}
                                    path="balancing/balancing-monthly-report-download"
                                    can_export={userPermission ? userPermission?.f_export : false}
                                    columnVisibility={columnVisibility}
                                    initialColumns={initialColumnsDownload}
                                    specificMenu={'balancing-monthly-report-download'}
                                    disable={dataTabDownload?.length > 0 ? false : true}
                                    specificData={{
                                        "idAr": dataTabDownload?.flatMap((item: any) => item?.id)
                                    }}
                                />
                            }

                        </div>
                    </div>
                </div>

                {
                    !isFilter && tabIndex == 0 ? <NodataTable textRender={'Please select filter to view the information.'} /> : <>
                        <TabTable value={tabIndex} index={0}>
                            <TableReport
                                tableData={paginatedData}
                                allData={filteredDataTable}
                                currentPage={currentPage}
                                itemsPerPage={itemsPerPage}
                                dataSummary={dataSummary}
                                isLoading={isLoading}
                                columnVisibility={columnVisibility}
                                userPermission={userPermission}
                                areaMaster={areaMaster}
                            />
                        </TabTable>
                    </>
                }

                <TabTable value={tabIndex} index={1}>
                    <TableDownload
                        // tableData={dataTable}
                        // tableData={dataTabDownload}
                        // tableData={dataTabDownload ? paginatedDataDownload : []}
                        tableData={paginatedDataDownload ? paginatedDataDownload : []}
                        isLoading={isLoading}
                        columnVisibility={columnVisibility}
                        userPermission={userPermission}
                    />
                </TabTable>
            </div>

            <PaginationComponent
                totalItems={tabIndex == 0 ? filteredDataTable ? filteredDataTable?.length : [] : dataTabDownload?.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
            />

            <ModalComponent
                open={isModalSuccessOpen}
                handleClose={handleCloseModal}
                title="Approved"
                description="Your report has been approved."
            />

            <ColumnVisibilityPopover
                open={open}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                columnVisibility={columnVisibility}
                handleColumnToggle={handleColumnToggle}
                initialColumns={tabIndex == 0 ? initialColumns : initialColumnsDownload}
            />

        </div>
    )
}

export default ClientPage;