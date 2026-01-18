"use client";
import { useEffect, useMemo, useState } from "react";
import { cutUploadFileName, filterByDateRange, findRoleConfigByMenuName, formatDateNoTime, generateUserPermission, getDateRangeForApi, iconButtonClass, toDayjs } from '@/utils/generalFormatter';
import { InputSearch } from '@/components/other/SearchForm';
import { getService } from "@/utils/postService";
import BtnExport from "@/components/other/btnExport";
import { useFetchMasters } from "@/hook/fetchMaster";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import PaginationComponent from "@/components/other/globalPagination";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import { useAppDispatch } from "@/utils/store/store";
import ModalFiles from "./form/modalFiles";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { fetchNominationType } from "@/utils/store/slices/nominationTypeSlice";
import ModalComment from "./form/modalComment";
import getUserValue from "@/utils/getuserValue";
import ModalComponent from "@/components/other/ResponseModal";
import { decryptData } from "@/utils/encryptionData";
import TableNomQueryShipperNomFile from "./form/table";
import { Tab, Tabs } from "@mui/material";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import { ColumnDef, VisibilityState } from "@tanstack/react-table";
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import AppTable, { myCustomSortingByDateFn } from "@/components/table/AppTable";

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
                const permission = findRoleConfigByMenuName(`Query Shipper' Nomination File`, userDT)
                setUserPermission(permission);
            }
        } catch (error) {
            // Failed to parse user_permission:
        }
    }

    // ############### REDUX DATA ###############
    const { nominationStatMaster } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const dispatch = useAppDispatch();

    useEffect(() => {
        // if (forceRefetch || !shipperGroupData?.data) {
        //     dispatch(fetchShipperGroup());
        // }
        // if (forceRefetch || !termTypeMaster?.data) {
        //     dispatch(fetchTermType());
        // }
        // if (forceRefetch || !nominationTypeMaster?.data) {
        //     dispatch(fetchNominationType());
        // }
        if (forceRefetch || !nominationStatMaster?.data) {
            dispatch(fetchNominationType());
        }

        // Reset forceRefetch after fetching
        if (forceRefetch) {
            setForceRefetch(false); // Reset the flag after triggering the fetch
        }
        getPermission();
    }, [dispatch, forceRefetch, nominationStatMaster]); // Watch for forceRefetch changes

    // ############### FIELD SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [filteredDataTableInCommon, setFilteredDataTableInCommon] = useState<any>([]);
    const [key, setKey] = useState(0);
    const [srchShipper, setSrchShipper] = useState('');
    const [srchContractCode, setSrchContractCode] = useState('');
    const [srchStatus, setSrchStatus] = useState('');
    const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
    const [srchEndDate, setSrchEndDate] = useState<Date | null>(null);

    const handleFieldSearch = () => {
        const localDate = toDayjs(srchStartDate).format("YYYY-MM-DD");

        let result_gasday_from_to: any = dataTable
        // if ((srchStartDate || srchEndDate) && tabIndex == 1) {
        if ((srchStartDate || srchEndDate)) {
            const { start_date, end_date } = getDateRangeForApi(srchStartDate, srchEndDate);
            result_gasday_from_to = filterByDateRange(dataTable, start_date, end_date);
        }

        const result_2 = result_gasday_from_to?.filter((item: any) => {
            const gasDay = toDayjs(item?.gas_day).format("YYYY-MM-DD");

            return (
                (srchShipper ? item?.group_id == srchShipper : true) &&
                // (srchContractCode ? item?.contract_code?.id.toString() == srchContractCode : true) &&
                (srchContractCode ? item?.contract_code?.contract_code == srchContractCode : true) &&
                // (srchStatus ? item?.nomination_type?.name == srchStatus : true) &&
                (srchStatus ? item?.query_shipper_nomination_status?.id.toString() == srchStatus : true)
                // (srchStartDate && tabIndex == 0 ? localDate == gasDay : true)
            );
        });

        setCurrentPage(1)
        setFilteredDataTable(result_2);
        setFilteredDataTableInCommon(result_2);
    };

    const handleReset = async () => {

        if (userDT?.account_manage?.[0]?.user_type_id == 3) {
            setSrchShipper(userDT?.account_manage?.[0]?.group?.id)
        } else {
            setSrchShipper('');
        }

        setSrchStatus('');
        setSrchContractCode('');
        setSrchStartDate(null)
        setDataContract(dataContractOriginal)
        setFilteredDataTable(dataTable);
        setKey((prevKey) => prevKey + 1);
    };

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {

        // const filtered = dataTable.filter(
        const filtered = filteredDataTableInCommon?.filter(
            (item: any) => {
                const queryLower = query.replace(/\s+/g, '')?.toLowerCase().trim();
                let submission_comment = item?.submission_comment_query_shipper_nomination_file?.length
                let file_length = item?.query_shipper_nomination_file_url?.length

                return (
                    // item?.nomination_type?.document_type?.toLowerCase().includes(queryLower) ||
                    // item?.maximum_capacity?.toString().toLowerCase().includes(queryLower) ||

                    item?.query_shipper_nomination_status?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatDateNoTime(item?.gas_day)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.group?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.contract_code?.contract_code?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.query_shipper_nomination_file_url?.[0]?.url?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    submission_comment?.toString().trim().includes(query?.toString().trim()) ||
                    file_length?.toString().trim().includes(query?.toString().trim()) ||

                    (item?.create_by_account?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
                    (item?.create_by_account?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
                    (item?.create_by_account?.first_name && item?.create_by_account?.last_name && (item?.create_by_account?.first_name + item?.create_by_account?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) || // เผื่อ search ชื่อ - นามสกุล พร้อมกัน
                    (item?.update_by_account?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
                    (item?.update_by_account?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
                    (item?.update_by_account?.first_name && item?.update_by_account?.last_name && (item?.update_by_account?.first_name + item?.update_by_account?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) // เผื่อ search ชื่อ - นามสกุล พร้อมกัน
                )
            }
        );
        setFilteredDataTable(filtered);
    };

    // ############### DATA TABLE ###############
    const [tabIndex, setTabIndex] = useState(0); // 0=daily, 1=weekly
    const [dataTable, setData] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [dataContractOriginal, setDataContractOriginal] = useState<any>([]);
    const [dataContract, setDataContract] = useState<any>([]);
    const [dataShipper, setDataShipper] = useState<any>([]);

    useEffect(() => {
        if (userDT?.account_manage?.[0]?.user_type_id == 3) {
            setSrchShipper(userDT?.account_manage?.[0]?.group?.id)
        }
    }, [tabIndex])

    const fetchData = async () => {
        try {

            // ถ้า user เป็น shipper
            // https://app.clickup.com/t/86ert2k28 ตามที่คุยกัน หากเป็น shipper user ถ้ามี filter ชื่อ shipper ให้ค้างชื่อ shipper ตัวเองไว้เลย ไม่ต้องขึ้นเป็น dropdown ให้เลือก - ปรับทั้ง system
            if (userDT?.account_manage?.[0]?.user_type_id == 3) {

                setSrchShipper(userDT?.account_manage?.[0]?.group?.id)
            }

            const res_shipper_approve = await getService(`/master/upload-template-for-shipper/shipper-contract-approved`);
            setDataShipper(res_shipper_approve);

            const response: any = await getService(`/master/query-shipper-nomination-file`);

            let filtered_daily_weekly = response?.filter((item: any) => tabIndex == 0 ? item?.nomination_type_id == 1 : item?.nomination_type_id == 2);

            const updatedDataDaily = filtered_daily_weekly?.map((item: any) => ({
                ...item,
                k_file_name: cutUploadFileName(item?.query_shipper_nomination_file_url?.[0]?.url)
            }));

            // List > Shipper ต้องไม่เห็นรายการของคนอื่น https://app.clickup.com/t/86erwntdm
            if (userDT?.account_manage?.[0]?.user_type_id == 3) {
                let filter_only_shipper_or_not: any = updatedDataDaily?.filter((item: any) => {
                    return item?.group_id === userDT?.account_manage?.[0]?.group_id
                })
                setData(filter_only_shipper_or_not);
                setFilteredDataTable(filter_only_shipper_or_not);
            } else {
                setData(updatedDataDaily);
                setFilteredDataTable(updatedDataDaily);
            }

            // DATA CONTRACT CODE
            const data_contract_code = Array.from(
                new Map(
                    // response?.map((item: any) => [item.contract_code.contract_code, { contract_code: item.contract_code.contract_code }])
                    response?.map((item: any) => [item.contract_code.contract_code, { contract_code: item.contract_code }])
                ).values()
            );
            setDataContract(data_contract_code);
            setDataContractOriginal(data_contract_code)


            setIsLoading(true);
        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    };

    const fetchOnlyData = async () => {
        const response: any = await getService(`/master/query-shipper-nomination-file`);
        let filtered_daily_weekly = response?.filter((item: any) => tabIndex == 0 ? item?.nomination_type_id == 1 : item?.nomination_type_id == 2)

        if (userDT?.account_manage?.[0]?.user_type_id == 3) {
            let filter_only_shipper_or_not: any = filtered_daily_weekly?.filter((item: any) => {
                return item?.group_id === userDT?.account_manage?.[0]?.group_id
            })

            const updatedDataDaily = filter_only_shipper_or_not?.map((item: any) => ({
                ...item,
                k_file_name: cutUploadFileName(item?.query_shipper_nomination_file_url?.[0]?.url)
            }));

            setData(updatedDataDaily);
            setFilteredDataTable(updatedDataDaily);
        } else {

            const updatedDataDaily = filtered_daily_weekly?.map((item: any) => ({
                ...item,
                k_file_name: cutUploadFileName(item?.query_shipper_nomination_file_url?.[0]?.url)
            }));

            setData(updatedDataDaily);
            setFilteredDataTable(updatedDataDaily);
        }

        // setData(filtered_daily_weekly);
        // setFilteredDataTable(filtered_daily_weekly);
        setIsLoading(true);
    }

    useEffect(() => {
        fetchData();
    }, [resetForm]);

    useEffect(() => {
        fetchOnlyData();
    }, [tabIndex])

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalModalSuccessMsg, setModalSuccessMsg] = useState('');
    const handleCloseModal = () => setModalSuccessOpen(false);
    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);

    // ############### MODAL ALL FILES ###############
    const [mdFileView, setMdFileView] = useState<any>(false);
    const [dataFile, setDataFile] = useState<any>([]);

    const openAllFileModal = (id?: any, data?: any) => {

        const filtered = dataTable?.find((item: any) => item.id === id);
        setDataFile(filtered)
        setMdFileView(true)
    };

    // ############### REASON VIEW ###############
    const [mdReasonView, setMdReasonView] = useState(false);
    const [dataReason, setDataReason] = useState<any>([]);
    const [dataReasonRow, setDataReasonRow] = useState<any>([]);

    const openReasonModal = (id: any, data: any, row: any) => {

        setDataReason(data)
        setDataReasonRow(row)
        setMdReasonView(true)
    };

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
        { key: 'status', label: 'Status', visible: true },
        { key: 'gas_day', label: tabIndex == 0 ? 'Gas Day' : 'Gas Week', visible: true },
        { key: 'shipper_name', label: 'Shipper Name', visible: true },
        { key: 'contract_code', label: 'Contract Code', visible: true },
        { key: 'file_name', label: 'File Name', visible: true },
        { key: 'submission_comment', label: 'Submission Comment', visible: true },
        { key: 'file', label: 'File', visible: true },
        // { key: 'created_by', label: 'Created by', visible: true },
        // { key: 'updated_by', label: 'Updated by', visible: true },
        // { key: 'action', label: 'Action', visible: true }
    ];

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [columnVisibility, setColumnVisibility] = useState<any>(
        Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))
    );

    const handleTogglePopover = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    // const handleColumnToggle = (columnKey: string) => {
    //     setColumnVisibility((prev: any) => ({
    //         ...prev,
    //         [columnKey]: !prev[columnKey]
    //     }));
    // };

    const handleColumnToggle = (columnKey: string | VisibilityState) => {
        if (typeof columnKey === 'string') {
            // Handle string case - single column toggle
            setColumnVisibility((prev: any) => ({
                ...prev,
                [columnKey]: !prev[columnKey]
            }));
        } else if (typeof columnKey === 'object' && columnKey !== null) {
            // Handle VisibilityState object case - bulk column visibility update
            setColumnVisibility((prev: any) => ({
                ...prev,
                ...columnKey
            }));
        }
    };

    const findContractCode = (id?: any, data?: any) => {
        const filteredDataShipper = data.filter((shipper: any) => shipper.id === id);
        const filteredContract = dataContractOriginal?.filter((contract: any) =>
            filteredDataShipper?.[0]?.contract_code?.some((filtered: any) => filtered.id === contract.id)
        );
        setDataContract(filteredContract)
    }

    const handleChange = (event: any, newValue: any) => {
        setIsLoading(false);
        setTabIndex(newValue);

        handleReset();
    };

    // TEST FILTER
    // const [optionX, setOptionX] = useState(dataTable)

    // useEffect(() => {
    //     setOptionX(dataTable)
    // }, [dataTable])

    // useEffect(() => {
    //    let kk = dataTable?.filter((item: any) => userDT?.account_manage?.[0]?.user_type_id !== 3 && srchShipper ? item?.group?.id === srchShipper : true)

    //     setOptionX(kk)
    // }, [srchShipper])

    // { key: 'status', label: 'Status', visible: true },
    // { key: 'gas_day', label: tabIndex == 0 ? 'Gas Day' : 'Gas Week', visible: true },
    // { key: 'shipper_name', label: 'Shipper Name', visible: true },
    // { key: 'contract_code', label: 'Contract Code', visible: true },
    // { key: 'file_name', label: 'File Name', visible: true },
    // { key: 'submission_comment', label: 'Submission Comment', visible: true },
    // { key: 'file', label: 'File', visible: true },

    const [dataExport, setDataExport] = useState<any>([]);

    const columns = useMemo<ColumnDef<any>[]>(
        () => [
            {
                accessorKey: "status",
                header: "Status",
                enableSorting: true,
                align: 'center',
                accessorFn: (row: any) => row?.query_shipper_nomination_status?.name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="flex justify-center items-center">
                            <div className="flex min-w-[180px] max-w-[250px] w-auto text-center justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: String(row?.query_shipper_nomination_status?.color) }}>{row?.query_shipper_nomination_status?.name}</div>
                        </div>
                    )
                }
            },
            {
                accessorKey: "gas_day",
                header: tabIndex == 0 ? 'Gas Day' : 'Gas Week',
                enableSorting: true,
                accessorFn: (row: any) => formatDateNoTime(row?.gas_day) || '',
                sortingFn: myCustomSortingByDateFn,
                // sortingFn: 'datetime', // recommended for date columns 
                // sortUndefined: -1,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>{row?.gas_day ? formatDateNoTime(row?.gas_day) : ''}</div>
                    )
                }
            },
            {
                accessorKey: "shipper_name",
                header: "Shipper Name",
                enableSorting: true,
                accessorFn: (row: any) => row?.group?.name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>{row?.group ? row?.group?.name : ''}</div>
                    )
                }
            },
            {
                accessorKey: "contract_code",
                header: "Contract Code",
                enableSorting: true,
                width: 200,
                accessorFn: (row: any) => row?.contract_code?.contract_code || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>{row?.contract_code ? row?.contract_code?.contract_code : ''}</div>
                    )
                }
            },
            {
                accessorKey: "file_name",
                header: "File Name",
                enableSorting: true,
                accessorFn: (row: any) => row?.k_file_name || '',
                width: 500,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="flex items-center">
                            <span>{row?.query_shipper_nomination_file_url?.length > 0 && row?.k_file_name}</span>
                        </div>
                    )
                }
            },
            {
                accessorKey: "submission_comment",
                header: "Submission Comment",
                enableSorting: false,
                align: 'center',
                accessorFn: (row: any) => '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="inline-flex items-center justify-center relative">
                            {/* <button
                                type="button"
                                className={iconButtonClass}
                                onClick={() => openReasonModal(row?.id, row?.submission_comment_query_shipper_nomination_file, row)}
                                disabled={userPermission?.f_view == true ? false : true || row?.submission_comment_query_shipper_nomination_file?.length <= 0}
                            >
                                <ChatBubbleOutlineOutlinedIcon
                                    fontSize="inherit"
                                    className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                                    sx={{ color: 'currentColor', fontSize: 18 }}
                                />
                            </button> */}

                            <button
                                type="button"
                                className={iconButtonClass}
                                onClick={() => openReasonModal(row?.id, row?.submission_comment_query_shipper_nomination_file, row)}
                                disabled={userPermission?.f_view == true ? false : true || row?.submission_comment_query_shipper_nomination_file?.length <= 0}
                            >
                                <ChatBubbleOutlineOutlinedIcon
                                    fontSize="inherit"
                                    className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                                    sx={{ color: 'currentColor', fontSize: 18 }}
                                />
                            </button>

                            <span
                                className={`px-2 text-[#429D3A] ${row?.submission_comment_query_shipper_nomination_file?.length > 0 ? 'text-[#ED1B24]' : ''}`}
                            >
                                {row?.submission_comment_query_shipper_nomination_file?.length}
                            </span>

                        </div>
                    )
                }
            },
            {
                accessorKey: "file",
                header: "File",
                enableSorting: false,
                accessorFn: (row: any) => '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="inline-flex items-center justify-center relative">
                            {/* <button
                                type="button"
                                className="flex items-center justify-center px-[2px] py-[2px] rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative"
                                onClick={() => openAllFileModal(row?.id)}
                                disabled={userPermission?.f_view == true ? false : true || row?.query_shipper_nomination_file_url.length <= 0}
                            >
                                <AttachFileRoundedIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
                            </button> */}

                            <button
                                type="button"
                                aria-label="Open files"
                                onClick={() => openAllFileModal(row?.id)}
                                disabled={!userPermission?.f_view || row?.query_shipper_nomination_file_url.length <= 0}
                                className={iconButtonClass}
                            >
                                <AttachFileRoundedIcon
                                    fontSize="inherit"
                                    className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                                    sx={{ color: 'currentColor', fontSize: 18 }}
                                />
                            </button>
                            <span className="px-2 text-[#464255]">
                                {row?.query_shipper_nomination_file_url.length}
                            </span>
                        </div>
                    )
                }
            },
        ],
        [dataTable, userPermission, user_permission]
    )

    return (
        <div className=" space-y-2">

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

            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl rounded-tl-none flex flex-col sm:flex-row gap-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                    <DatePickaSearch
                        key={"start" + key}
                        label={tabIndex == 0 ? "Gas Day From" : "Gas Week From"}
                        placeHolder={tabIndex == 0 ? "Select Gas Day" : "Select Gas Week"}
                        modeSearch={tabIndex == 0 ? 'all_day' : 'sunday'}
                        allowClear
                        onChange={(e: any) => setSrchStartDate(e ? e : null)}
                    />

                    {
                        tabIndex == 0 ?
                            <DatePickaSearch
                                key={"gas_day_to" + key}
                                label="Gas Day To"
                                placeHolder="Select Gas Day To"
                                allowClear
                                onChange={(e: any) => setSrchEndDate(e ? e : null)}
                                customWidth={200}
                            />
                            : <DatePickaSearch
                                key={"end" + key}
                                label={"Gas Week To"}
                                placeHolder={"Select Gas Week"}
                                modeSearch={'sunday'}
                                allowClear
                                onChange={(e: any) => setSrchEndDate(e ? e : null)}
                            />
                    }

                    {/* let filter_string = `${userDT?.account_manage?.[0]?.user_type_id == 1 || userDT?.account_manage?.[0]?.user_type_id == 2 ? idsArray : userDT?.account_manage?.[0]?.group_id}` // ถ้าเป็น TSO เอา id shipper ทั้งหมดมาแสดง ถ้าเป็น shipper เอาแค่ของตัวเอง */}
                    <InputSearch
                        id="searchShipper"
                        label="Shipper Name"
                        type="select"
                        value={srchShipper}
                        // onChange={(e) => setSrchShipper(e.target.value)}
                        isDisabled={userDT?.account_manage?.[0]?.user_type_id == 3 ? true : false}
                        onChange={(e) => {
                            setSrchShipper(e.target.value)
                            // findContractCode(e.target.value, dataShipper)

                            // let filter_contract = dataContract?.filter((item: any) => item?.contract_code?.group_id == e.target.value)
                        }}
                        options={dataShipper?.filter((item: any) =>
                            userDT?.account_manage?.[0]?.user_type_id == 3
                                ? item?.id === userDT?.account_manage?.[0]?.group?.id
                                : true
                        ).map((item: any) => ({
                            value: item.id,
                            label: item.name,
                        }))
                        }
                    />

                    <InputSearch
                        id="searchContractCode"
                        label="Contract Code"
                        type="select"
                        value={srchContractCode}
                        onChange={(e) => setSrchContractCode(e.target.value)}

                        // options={dataTable?.filter((item: any) =>
                        //     userDT?.account_manage?.[0]?.user_type_id !== 3 && srchShipper ? item?.group?.id === srchShipper : true
                        // ).map((item: any) => ({
                        //     value: item.contract_code.id.toString(),
                        //     label: item.contract_code.contract_code
                        // }))}

                        options={dataContract?.filter((item: any) =>
                            srchShipper ? item?.contract_code?.group_id === srchShipper : true
                        ).map((item: any) => ({
                            value: item?.contract_code?.contract_code,
                            label: item?.contract_code?.contract_code
                        }))}
                    />

                    <InputSearch
                        id="searchStatus"
                        label="Status"
                        type="select"
                        value={srchStatus}
                        onChange={(e) => setSrchStatus(e.target.value)}
                        options={nominationStatMaster?.data?.map((item: any) => ({
                            value: item.id.toString(),
                            label: item.name
                        }))}
                    />

                    <BtnSearch handleFieldSearch={handleFieldSearch} />
                    <BtnReset handleReset={handleReset} />
                </aside>
                <aside className="mt-auto ml-1 w-full sm:w-auto">

                </aside>
            </div>

            {/* <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl shadow-sm">
                <div className="text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
                    <div className="flex items-center space-x-2">
                        <div onClick={handleTogglePopover}>
                            <Tune
                                className="cursor-pointer rounded-lg"
                                style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end">
                        <SearchInput onSearch={handleSearch} />
                        <BtnExport
                            textRender={"Export"}
                            data={filteredDataTable}
                            path="nomination/query-shipper-nomination-file"
                            can_export={userPermission ? userPermission?.f_export : false}
                            columnVisibility={columnVisibility}
                            initialColumns={initialColumns}
                        />
                    </div>
                </div>

                <TableNomQueryShipperNomFile
                    openAllFileModal={openAllFileModal}
                    openReasonModal={openReasonModal}
                    tableData={paginatedData}
                    isLoading={isLoading}
                    columnVisibility={columnVisibility}
                    userPermission={userPermission}
                    tabIndex={tabIndex}
                />
            </div>

            <PaginationComponent
                totalItems={filteredDataTable?.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
            /> */}

            {/* ================== NEW TABLE ==================*/}
            <AppTable
                data={filteredDataTable}
                columns={columns}
                isLoading={isLoading}
                exportBtn={
                    <BtnExport
                        textRender={"Export"}
                        data={dataExport}
                        path="nomination/query-shipper-nomination-file"
                        can_export={userPermission ? userPermission?.f_export : false} columnVisibility={columnVisibility} initialColumns={initialColumns}
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

            <ModalComment
                data={dataReason}
                dataRow={dataReasonRow}
                open={mdReasonView}
                onClose={() => {
                    setMdReasonView(false);
                }}
            />

            <ModalFiles
                data={dataFile}
                // dataGroup={dataGroup}
                // setModalMsg={setModalMsg}
                setModalSuccessOpen={setModalSuccessOpen}
                // setModalSuccessMsg={setModalSuccessMsg}
                open={mdFileView}
                onClose={() => {
                    setMdFileView(false);
                }}
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