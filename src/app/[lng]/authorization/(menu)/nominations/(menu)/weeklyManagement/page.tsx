"use client";
import { useEffect, useState } from "react";
import { Tune } from "@mui/icons-material"
import { filterActiveToday, findRoleConfigByMenuName, formatDate, formatDateNoTime, formatTime, generateUserPermission, getCurrentWeekSundayYyyyMmDd, isSameWeekByK, toDayjs } from '@/utils/generalFormatter';
import CheckboxSearch2, { InputSearch } from '@/components/other/SearchForm';
import SearchInput from "@/components/other/searchInput";
import { getService, postService } from "@/utils/postService";
import ModalAction from "./form/modalAction";
import BtnExport from "@/components/other/btnExport";
import { useFetchMasters } from "@/hook/fetchMaster";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import PaginationComponent from "@/components/other/globalPagination";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import BtnGeneral from "@/components/other/btnGeneral";
import { useAppDispatch } from "@/utils/store/store";
import { fetchShipperGroup } from "@/utils/store/slices/shipperGroupSlice";
import ModalFiles from "./form/modalFiles";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { fetchNominationType } from "@/utils/store/slices/nominationTypeSlice";
import ModalComment from "./form/modalComment";
import getUserValue from "@/utils/getuserValue";
import ModalComponent from "@/components/other/ResponseModal";
import { decryptData } from "@/utils/encryptionData";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import TableNomDailyMgn from "./form/table";
import ModalSubmissionDetails from "./form/modalSubmissionDetail";
import NomCodeView from "./nomCodeView/nomCodeView";
import ModalAcceptReject from "./form/modalAcceptReject";
import dayjs from 'dayjs';
import timezone from "dayjs/plugin/timezone";
import weekday from "dayjs/plugin/weekday";
import { useSearchParams } from "next/navigation";

dayjs.extend(weekday);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Bangkok");

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
    const [dataTable, setData] = useState<any>([]);
    const [isNomCodeClick, setIsNomCodeClick] = useState<any>(false)

    // route มาจาก nomination dashboard
    const searchParams = useSearchParams();
    const filter_gas_week_from_somewhere_else: any = searchParams.get("filter_gas_week");
    const filter_contract_code_from_somewhere_else: any = searchParams.get("contract_code");
    const filter_group_id_from_somewhere_else: any = searchParams.get("group_id");

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
                const permission = findRoleConfigByMenuName('Weekly Management', userDT)
                setUserPermission(permission);
            }
        } catch (error) {
            // Failed to parse user_permission:
        }
    }

    useEffect(() => {
        getPermission();
    }, [])


    // ############### CHECK ว่ามาจากหน้า nomination dashboard ป่าว ###############
    const [dashboardObj, setDashboardObj] = useState<any>();
    // const checkIsRouted = () => {
    //     const storedDashboard = localStorage.getItem("nom_dashboard_route_obj_weekly");
    //     const dashboardObject = storedDashboard ? JSON.parse(storedDashboard) : null;

    //     if (dashboardObject) {
    //         setDashboardObj(dashboardObject)

    //         let formattedGasDay = new Date(toDayjs(dashboardObject?.gas_day).format("YYYY-MM-DD"));
    //         setSrchStartDate(formattedGasDay)

    //         setSrchContractCode(dashboardObject?.contract_code?.id?.toString())

    //         const result_2 = dataTable.filter((item: any) => {
    //             const localDate = toDayjs(dashboardObject?.gas_day).format("YYYY-MM-DD");
    //             const gasDay = toDayjs(item?.gas_day).format("YYYY-MM-DD");

    //             return (
    //                 (dashboardObject?.contract_code?.id?.toString() ? item?.contract_code?.id.toString() == dashboardObject?.contract_code?.id?.toString() : true) &&
    //                 (srchStartDate ? localDate == gasDay : true)
    //             );
    //         });
    //         setCurrentPage(1)
    //         setFilteredDataTable(result_2);

    //         // มาถึง filter เสร็จสรรพ ลบทิ้งเลย
    //         // localStorage.removeItem("nom_dashboard_route_obj_weekly")
    //     }
    // }

    useEffect(() => {
        // checkIsRouted();
        const storedDashboard = localStorage.getItem("nom_dashboard_route_obj");
        const dashboardObject = storedDashboard ? JSON.parse(storedDashboard) : null;
        if (dashboardObject) {
            // มาถึง filter เสร็จสรรพ ลบทิ้งเลย
            localStorage.removeItem("nom_dashboard_route_obj")
            setDashboardObj(dashboardObject)
            let formattedGasDay = new Date(toDayjs(dashboardObject?.gas_day).format("YYYY-MM-DD"));

            setSrchStartDate(formattedGasDay)
            fetchData(dashboardObject).then(_ => {
            });
        }
    }, [dataTable])

    // ############### REDUX DATA ###############
    const { shipperGroupData, nominationTypeMaster, nominationStatMaster } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (forceRefetch || !shipperGroupData?.data) {
            dispatch(fetchShipperGroup());
        }

        if (forceRefetch || !nominationTypeMaster?.data) {
            dispatch(fetchNominationType());
        }
        if (forceRefetch || !nominationStatMaster?.data) {
            dispatch(fetchNominationType());
        }

        // Reset forceRefetch after fetching
        if (forceRefetch) {
            setForceRefetch(false); // Reset the flag after triggering the fetch
        }
    }, [dispatch, forceRefetch, nominationTypeMaster, nominationStatMaster]); // Watch for forceRefetch changes

    const handleGetMaster = async () => {
        // DATA NOM DEADLINE
        const res_nom_deadline: any = await getService(`/master/parameter/nomination-deadline`);

        // type weekly, user_type == userDT
        // process_type -> "Validity response of renomination" กับ "Management" 
        // process_type = "Validity response of renomination" ใช้กับ row ที่ renom = yes
        // process_type = "Management" ใช้กับ row ที่ renom = no
        let filter_nom_deadline_3 = res_nom_deadline?.filter((item?: any) => (item?.process_type_id === 2 || item?.process_type_id === 4) && item?.nomination_type?.id === 2);

        // filter USER TYPE
        if (userDT?.account_manage?.[0]?.user_type_id !== 3) {
            filter_nom_deadline_3 = res_nom_deadline?.filter((item?: any) => (item?.process_type_id === 2 || item?.process_type_id === 4) && item?.nomination_type?.id === 2 && item?.user_type?.id !== 3);
        } else {
            filter_nom_deadline_3 = res_nom_deadline?.filter((item?: any) => (item?.process_type_id === 2 || item?.process_type_id === 4) && item?.nomination_type?.id === 2 && item?.user_type?.id == 3);
        }

        // กรอง filtered_nom_daily ที่วันปัจจุบันอยู่ในช่วง start_date และ end_date
        const activeNomDaily = filterActiveToday(filter_nom_deadline_3);
        setDataNomDeadline(activeNomDaily)

        // DATA ZONE
        const res_zone: any = await getService(`/master/asset/zone`);
        setDataMasterZone(res_zone)

        // DATA SHIPPER
        const res_shipper_approve = await getService(`/master/upload-template-for-shipper/shipper-contract-approved`);
        setDataShipper(res_shipper_approve);

    }

    // ############### MODE SHOW DATA ###############
    // 1 = table, 2 = nomination code view
    const [divMode, setDivMode] = useState<any>('1'); // 1 == table, 2 == nom_code click

    // ############### FIELD SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [key, setKey] = useState(0);
    const [srchShipper, setSrchShipper] = useState('');
    const [srchContractCode, setSrchContractCode] = useState('');
    const [srchTypeDocument, setSrchTypeDocument] = useState('');
    // const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
    const [srchStartDate, setSrchStartDate] = useState<Date>(() => toDayjs().weekday(0).startOf("day").toDate());
    const [srchStatus, setSrchStatus] = useState('');
    const [srchCheckbox, setSrchCheckbox] = useState(false);

    const [datalog, setdatalog] = useState<any>([]);

    const handleFieldSearch = async () => {
        setIsLoading(false)
        handleGetMaster();
        // const current_week = getCurrentWeekSundayYyyyMmDd();

        // const searchDate = toDayjs(srchStartDate).format("YYYY-MM-DD");
        let searchDate = toDayjs(srchStartDate).format("YYYY-MM-DD");
        if (filter_gas_week_from_somewhere_else) {
            const date_from = dayjs(filter_gas_week_from_somewhere_else).toDate();
            setSrchStartDate(new Date(date_from))
            searchDate = toDayjs(new Date(date_from)).format("YYYY-MM-DD");
        }

        // DATA MAIN
        const response: any = await getService(`/master/query-shipper-nomination-file`);
        let filtered_daily_weekly = response?.filter((item: any) => item?.nomination_type_id == 2) // 1 == Daily, 2 == Weekly

        // const result_2 = dataAll?.filter((item: any) => {
        const result_2 = filtered_daily_weekly?.filter((item: any) => {
            const gasDay = toDayjs(item?.gas_day).format("YYYY-MM-DD");

            return (
                (srchShipper ? item?.group_id == srchShipper : true) &&
                (!srchCheckbox || (item?.submission_comment_query_shipper_nomination_file?.length > 0)) &&
                (srchStatus ? item?.query_shipper_nomination_status?.id.toString() == srchStatus : true) &&
                (srchContractCode ? item?.contract_code?.id.toString() == srchContractCode : true) &&
                (srchTypeDocument ? item?.nomination_type?.name == srchTypeDocument : true) &&
                // (!srchStartDate ? dayjs(item?.gas_day).format("DD/MM/YYYY") == current_week : isSameWeekByK(gasDay, searchDate))
                (srchStartDate ? isSameWeekByK(gasDay, searchDate) : true)
            );
        });

        // const result_log = dataAll?.filter((item: any) => {
        const result_log = filtered_daily_weekly?.filter((item: any) => {
            const searchDate = toDayjs(srchStartDate).format("YYYY-MM-DD");
            const gasDay = toDayjs(item?.gas_day).format("YYYY-MM-DD");
            const current_week = getCurrentWeekSundayYyyyMmDd();

            return (
                (srchShipper ? item?.group_id == srchShipper : true) &&
                (!srchCheckbox || (item?.submission_comment_query_shipper_nomination_file?.length > 0)) &&
                (srchStatus ? item?.query_shipper_nomination_status?.id.toString() == srchStatus : true) &&
                (srchTypeDocument ? item?.nomination_type?.name == srchTypeDocument : true) &&
                (!srchStartDate ? toDayjs(item?.gas_day).format("DD/MM/YYYY") == current_week : isSameWeekByK(gasDay, searchDate))
            );
        });

        setdatalog(result_log);
        setCurrentPage(1)

        setData(result_2);
        setFilteredDataTable(result_2);
        setIsNomCodeClick(false)

        setTimeout(() => {
            setIsLoading(true);
        }, 300);

    }

    const handleReset = async () => {
        setSrchShipper('');
        setSrchTypeDocument('');
        setSrchContractCode('');
        setSrchStatus('');
        setSrchCheckbox(false)
        setDataContract(dataContractOriginal)
        setSrchStartDate(() => toDayjs().weekday(0).startOf("day").toDate())
        // const current_week = getCurrentWeekSundayYyyyMmDd();

        // const response: any = await getService(`/master/query-shipper-nomination-file`);
        // let filtered_daily_weekly = response?.filter((item: any) => item?.nomination_type_id == 2) // 1 == Daily, 2 == Weekly

        // // let filter_only_this_week = dataAll?.filter((item: any) => toDayjs(item?.gas_day).format("DD/MM/YYYY") == current_week)
        // let filter_only_this_week = filtered_daily_weekly?.filter((item: any) => toDayjs(item?.gas_day).format("DD/MM/YYYY") == current_week)
        // setFilteredDataTable(filter_only_this_week);

        fetchData();

        setIsNomCodeClick(false)
        setKey((prevKey) => prevKey + 1);
    };

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {
        const queryLower = query.replace(/\s+/g, '')?.toLowerCase().trim();
        const filtered = dataTable?.filter(
            (item: any) => {
                return (
                    item?.nomination_code?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatDateNoTime(item?.gas_day)?.toLowerCase().includes(queryLower) ||

                    // formatDate(item?.gas_day)?.toLowerCase().includes(queryLower) ||
                    // formatTime(item?.gas_day)?.toLowerCase().includes(queryLower) ||
                    item?.query_shipper_nomination_file_renom?.name?.toLowerCase().includes(queryLower) ||
                    item?.query_shipper_nomination_status?.name?.toLowerCase().includes(queryLower) ||
                    item?.nomination_version[0]?.version?.toLowerCase().includes(queryLower) ||
                    item?.contract_code?.contract_code?.toLowerCase().includes(queryLower) ||
                    item?.group?.name?.toLowerCase().includes(queryLower) ||
                    formatDateNoTime(item?.submitted_timestamp)?.toLowerCase().includes(queryLower) ||
                    formatDate(item?.submitted_timestamp)?.toLowerCase().includes(queryLower) ||
                    formatDate(item?.submitted_timestamp)?.replace(/\s+/g, '')?.toLowerCase().includes(queryLower) || // for ==> https://app.clickup.com/t/86etzch1h
                    formatTime(item?.submitted_timestamp)?.toLowerCase().includes(queryLower)
                )
            }
        );
        setFilteredDataTable(filtered);
    };

    // ############### DATA TABLE ###############
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [dataContractOriginal, setDataContractOriginal] = useState<any>([]);
    const [dataContract, setDataContract] = useState<any>([]);
    const [dataShipper, setDataShipper] = useState<any>([]);
    const [dataNomDeadline, setDataNomDeadline] = useState<any>([]);
    const [dataMasterZone, setDataMasterZone] = useState<any>([]);
    const [dataAll, setDataAll] = useState<any>([]);

    const fetchData = async (dashboardObject?: any) => {
        setIsLoading(false)
        if (!isNomCodeClick) { // ถ้าคลิก nomcode เข้าไปไม่ต้อง fetch ใหม่ ข้อมูลจะได้ไม่หายเวลากลับออกมา
            // if (!isNomCodeClick && !filter_gas_week_from_somewhere_else) { // ถ้าคลิก nomcode เข้าไปไม่ต้อง fetch ใหม่ ข้อมูลจะได้ไม่หายเวลากลับออกมา แล้วก็ถ้าไม่มี param filter_gas_week_from_somewhere_else ตอนโหลดหน้าก็ไม่เข้า
            try {
                // DATA NOM DEADLINE || ZONE
                handleGetMaster();

                // const contractCodeId = dashboardObject?.contract_code?.id?.toString()
                // const groupId = dashboardObject?.group?.id
                // const gasDay = toDayjs(dashboardObject?.gas_day)
                // const gasDayFormatted = gasDay.isValid() ? gasDay.format('DD/MM/YYYY') : undefined;

                // const contractCodeId = filter_contract_code_from_somewhere_else
                const groupId = filter_group_id_from_somewhere_else
                const gasDay: any = toDayjs(filter_gas_week_from_somewhere_else)
                const gasDayFormatted = gasDay.isValid() ? gasDay.format('DD/MM/YYYY') : undefined;

                // ถ้า user เป็น shipper
                // https://app.clickup.com/t/86ert2k28 ตามที่คุยกัน หากเป็น shipper user ถ้ามี filter ชื่อ shipper ให้ค้างชื่อ shipper ตัวเองไว้เลย ไม่ต้องขึ้นเป็น dropdown ให้เลือก - ปรับทั้ง system
                if (groupId || userDT?.account_manage?.[0]?.user_type_id == 3) {

                    // setSrchShipper(groupId || userDT?.account_manage?.[0]?.group?.id)
                    setSrchShipper(groupId || userDT?.account_manage?.[0]?.group?.id)
                }

                const response: any = await getService(`/master/query-shipper-nomination-file`);
                let filtered_daily_weekly = response?.filter((item: any) => item?.nomination_type_id == 2) // 1 == Daily, 2 == Weekly
                // let filtered_daily_weekly = res_pre_pro_1_weekly?.filter((item: any) => item?.nomination_type_id == 2) // 1 == Daily, 2 == Weekly // mockkkkkkkk

                // // R1 : Filter Gas Week Default ข้อมูลไม่ขึ้นเลยจะต้องกด Search ก่อนถึงจะขึ้น https://app.clickup.com/t/86etzcgtm
                // const searchDate = dayjs(srchStartDate).tz("Asia/Bangkok").format("YYYY-MM-DD");
                // filtered_daily_weekly = filtered_daily_weekly?.filter((item: any) => {
                //     const gasDay = dayjs(item?.gas_day).tz("Asia/Bangkok").format("YYYY-MM-DD");
                //     return (srchStartDate ? isSameWeekByK(gasDay, searchDate) : true)
                //     ;
                // });

                setDataAll(filtered_daily_weekly)

                // DATA CONTRACT CODE
                getDataContractCode(filtered_daily_weekly);

                // กรณี Shipper เข้ามาจะต้องเห็นเฉพาะข้อมูล Weekly Nomination ของตัวเอง https://app.clickup.com/t/86et67brk
                // if (gasDayFormatted || groupId || (userDT?.account_manage?.[0]?.user_type_id) == 3) {
                if (gasDayFormatted && userDT?.account_manage?.[0]?.user_type_id == 3) {
                    const tragetgroupId = groupId || (userDT?.account_manage?.[0]?.group_id)

                    let filter_only_shipper_or_not: any = filtered_daily_weekly?.filter((item: any) => {
                        return (
                            (tragetgroupId ? (tragetgroupId === item?.group?.id) : true) &&
                            (gasDayFormatted ? (gasDayFormatted == toDayjs(item?.gas_day).format("DD/MM/YYYY")) : true)
                        );
                    })

                    setData(filter_only_shipper_or_not);
                    setFilteredDataTable(filter_only_shipper_or_not);
                } else {
                    const current_week = getCurrentWeekSundayYyyyMmDd();
                    let filter_only_this_week = filtered_daily_weekly?.filter((item: any) => toDayjs(item?.gas_day).format("YYYY-MM-DD") == current_week)
                    // filter เอาแค่ gas_week นี้
                    // วันที่วันอาทิตย์ของวีค
                    setData(filter_only_this_week);
                    setFilteredDataTable(filter_only_this_week);
                    // setData(filtered_daily_weekly);
                    // setFilteredDataTable(filtered_daily_weekly);
                }

                // setData(filtered_daily_weekly);
                // setFilteredDataTable(filtered_daily_weekly);

                setTimeout(() => {
                    setIsLoading(true);
                }, 300);

            } catch (err) {
                // setError(err.message);
            } finally {
                // setLoading(false);
            }
        } else {
            // หลังจาก submit มา

            const gasDay = toDayjs(srchStartDate).format("YYYY-MM-DD")
            const response: any = await getService(`/master/query-shipper-nomination-file`);
            let filtered_daily_weekly = response?.filter((item: any) => item?.nomination_type_id == 2) // 1 == Daily, 2 == Weekly
            let filter_only_submit_week = filtered_daily_weekly?.filter((item: any) => toDayjs(item?.gas_day).format("YYYY-MM-DD") == gasDay)
            setData(filter_only_submit_week);
            setFilteredDataTable(filter_only_submit_week);

            setTimeout(() => {
                setIsLoading(true);
            }, 300);
        }
    };

    const getDataContractCode = (filtered_daily_weekly: any) => {
        // DATA CONTRACT CODE
        const data_contract_code = Array.from(
            new Map(
                filtered_daily_weekly?.map((item: any) => [item.contract_code.contract_code, { contract_id: item.contract_code.id, contract_name: item.contract_code.contract_code, contract_code: item.contract_code, group: item.group }])
            ).values()
        );
        setDataContract(data_contract_code);
        setDataContractOriginal(data_contract_code)
    }

    // เอาไว้ fetch ตอน route มาจาก nomination dashboard
    const fetchDataWithParams = async () => {
        setIsLoading(false);

        const response: any = await getService(`/master/query-shipper-nomination-file`);

        // DATA SHIPPER
        const uniqueGroups = Array.from(
            new Map(response?.map((item: any) => [item.group.id, item.group])).values()
        );
        setDataShipper(uniqueGroups);

        let filtered_daily_weekly = response?.filter((item: any) => item?.nomination_type_id == 2) // 1 == Daily, 2 == Weekly
        setDataAll(filtered_daily_weekly)

        const gasDay = toDayjs(filter_gas_week_from_somewhere_else)
        const gasDayFormatted = gasDay.isValid() ? gasDay.format('DD/MM/YYYY') : undefined;
        setSrchContractCode(filter_contract_code_from_somewhere_else)
        setSrchShipper(filter_group_id_from_somewhere_else)

        if (filter_gas_week_from_somewhere_else) {
            let filter_only_shipper_or_not: any = filtered_daily_weekly?.filter((item: any) => {
                return (
                    (gasDayFormatted ? (gasDayFormatted == toDayjs(item?.gas_day).format("DD/MM/YYYY")) : true) &&
                    (filter_contract_code_from_somewhere_else ? item?.contract_code?.id.toString() == filter_contract_code_from_somewhere_else : true) &&
                    (filter_group_id_from_somewhere_else ? item?.group_id?.toString() == filter_group_id_from_somewhere_else : true)

                );
            })

            setData(filter_only_shipper_or_not);
            setFilteredDataTable(filter_only_shipper_or_not);
        }
        setTimeout(() => {
            setIsLoading(true);
        }, 300);

        // DATA CONTRACT CODE
        getDataContractCode(filtered_daily_weekly)
    }

    useEffect(() => {
        if (filter_gas_week_from_somewhere_else) {
            // case have params
            fetchDataWithParams();
        } else {
            // case normal
            fetchData();
        }
    }, [])

    // useEffect(() => {
    //     if (resetForm) {
    //         if (dashboardObj) {
    //             fetchData(dashboardObj);
    //             setDashboardObj(undefined)
    //         }
    //         else {
    //             fetchData();
    //         }
    //     }
    //     // }, [resetForm]);
    // }, []);

    // useEffect(() => {
    //     if (divMode) {
    //         // if (divMode && !filter_gas_week_from_somewhere_else) {
    //         if (dashboardObj) {
    //             fetchData(dashboardObj);
    //             setDashboardObj(undefined)
    //         }
    //         else {
    //             fetchData();
    //         }
    //     }
    // }, [divMode])

    useEffect(() => {
        // ต้องเช็คว่ามาจากหน้า submit ด้วยป่าว
        if (isNomCodeClick) {
            // after submit
            fetchData();
        }
    }, [divMode])

    // ############# RE-GENERATE  #############
    const [dataRegen, setDataReGen] = useState<any>([]);
    const [selectedRoles, setSelectedRoles] = useState<any[]>([]);

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalModalSuccessMsg, setModalSuccessMsg] = useState('');
    // const handleCloseModal = () => setModalSuccessOpen(false);
    const handleCloseModal = () => {
        setModalSuccessOpen(false);
    }
    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);

    const [formOpen, setFormOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | 'period'>();
    const [formData, setFormData] = useState<any>([]);

    // ไม่ใช้นะ
    const handleFormSubmit = async (data: any) => {
        // const url = '/master/upload-template-for-shipper/create';
        // const urlEdit = '/master/upload-template-for-shipper/edit';
        // const dynamicFields = {
        //     shipper_id: data?.shipper_id,
        //     contract_code_id: data?.contract_code_id,
        //     nomination_type_id: data?.document_type,
        //     comment: data?.comment ? data?.comment : null,
        // };

        // switch (formMode) {
        //     case "create":
        //         // const res_create = await postService('/master/asset/nomination-point-create', data);
        //         let res_create = await uploadFileServiceWithAuth2(url, data?.file_upload, dynamicFields);
        //         if (res_create?.response?.data?.status === 400) {
        //             setFormOpen(false);
        //             setModalErrorMsg(res_create?.response?.data?.error);
        //             setModalErrorOpen(true)
        //         } else {
        //             setFormOpen(false);
        //             setModalSuccessMsg('Template has been added.')
        //             setModalSuccessOpen(true);
        //         }
        //         break;
        //     case "edit":
        //         let res_edit = await uploadFileServiceWithAuth2(urlEdit, data?.file_upload, dynamicFields); // edit ให้ใช้เส้น upload เหมือนกัน by bank
        //         if (res_edit?.response?.data?.status === 400) {
        //             setFormOpen(false);
        //             setModalErrorMsg(res_edit?.response?.data?.error);
        //             setModalErrorOpen(true)
        //         } else {
        //             setFormOpen(false);
        //             setModalSuccessMsg('Your changes have been saved.')
        //             setModalSuccessOpen(true);
        //         }
        //         break;
        // }
        await fetchData();
        if (resetForm) resetForm(); // reset form
    };

    // const openEditForm = (id: any) => {
    //     setSelectedId(id);
    //     const filteredData = dataTable?.find((item: any) => item.id === id);
    //     setFormMode('edit');
    //     setFormData(filteredData);
    //     setFormOpen(true);
    // };

    // const openViewForm = (id: any) => {
    //     const filteredData = dataTable?.find((item: any) => item.id === id);
    //     setFormMode('view');
    //     setFormData(filteredData);
    //     setFormOpen(true);
    // };

    // ############### MODAL ALL FILES ###############
    const [mdFileView, setMdFileView] = useState<any>(false);
    const [dataFile, setDataFile] = useState<any>([]);

    const openAllFileModal = (id?: any, data?: any) => {

        // const filtered = dataTable?.find((item: any) => item.id === id);
        const filtered = paginatedData?.find((item: any) => item.id === id);
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

    // ############### MODAL SUBMISSION COMMENTS ###############
    const [mdSubmissionView, setMdSubmissionView] = useState<any>(false);
    const [dataSubmission, setDataSubmission] = useState<any>([]);
    const openSubmissionModal = (id?: any, data?: any) => {
        // const filtered = dataTable?.find((item: any) => item.id === id);
        const filtered = paginatedData?.find((item: any) => item.id === id);
        setDataSubmission(filtered)
        setMdSubmissionView(true)
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
        { key: 'check_box', label: 'Check Box', visible: true },
        { key: 'gas_week', label: 'Gas Week', visible: true },
        { key: 'nominations_code', label: 'Nomination Code', visible: true },
        { key: 'renominations', label: 'Renominations', visible: true },
        { key: 'status', label: 'Status', visible: true },
        { key: 'version', label: 'Version', visible: true },
        { key: 'contract_code', label: 'Contract Code', visible: true },
        { key: 'shipper_name', label: 'Shipper Name', visible: true },
        { key: 'submitted_timestamp', label: 'Submitted Timestamp', visible: true },
        { key: 'submission_comment', label: 'Submission Comment', visible: true },
        { key: 'comment', label: 'Comment', visible: true },
        { key: 'shipper_file', label: 'Shipper File', visible: true },
        // { key: 'created_by', label: 'Created by', visible: true },
        // { key: 'updated_by', label: 'Updated by', visible: true },
        // { key: 'action', label: 'Action', visible: true }
    ];

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [columnVisibility, setColumnVisibility] = useState<any>(
        Object.fromEntries(initialColumns?.map((column: any) => [column.key, column.visible]))
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

    // ############### ACCEPT REJECT ###############
    const [modeUpdateStat, setModeUpdateStat] = useState<any>('');
    const [mdStatType, setMdStatType] = useState<any>('all');
    const [mdUpdateStat, setMdUpdateStat] = useState(false);
    const [idUpdateStat, setIdUpdateStat] = useState([]);
    const [dataModalAcceptReject, setDataModalAcceptReject] = useState([]);

    const handleAcceptReject = async (id?: any, mode?: any) => {
        id = id.map((item: any) => item.id);
        if (id?.length > 1) {
            setMdStatType('all')
        } else {
            // const filter_data_x = dataTable?.filter((item: any) => item.id === id[0]);
            const filter_data_x: any = paginatedData?.filter((item: any) => item.id === id[0]);
            setDataModalAcceptReject(filter_data_x)
            setMdStatType('one')
        }
        setIdUpdateStat(id)
        setModeUpdateStat(mode)
        setMdUpdateStat(true)
    }

    const updateAcceptReject = async (data?: any) => {
        let body_post = {
            id: idUpdateStat,
            status: modeUpdateStat == 'accept' ? 2 : 3,
            comment: data.reason
        }

        try {
            const res_ = await postService('/master/weekly-management/update-status', body_post);
            if (res_?.response?.data?.status === 400) {
                setFormOpen(false);
                setModalErrorMsg(res_?.response?.data?.error);
                setModalErrorOpen(true)
            } else {
                setFormOpen(false);

                const action = modeUpdateStat === 'accept' ? 'approved' : 'rejected';
                const fileType = mdStatType === 'all' ? 'All File' : 'File';

                setModalSuccessMsg(`${fileType} has been ${action}.`);
                setModalSuccessOpen(true);
                setMdUpdateStat(false);
                // fetchData();
                handleFieldSearch() // List : เมื่อ checkbox approved รายการ เสร็จแล้ว หน้า list มันเปลี่ยนไปเป็นแสดงข้อมูลค่า default คือวันที่ 21 แทน ซึ่งมันต้องยังอยู่วันที่ 28 เมื่อเดิม https://app.clickup.com/t/86euxtvgf
                setSelectedRoles([]) // clear ที่ select re-gen
            }
        } catch (error) {
            // error
        }
    }

    const filterData = (id: any) => {
        // const filteredData = dataTable?.find((item: any) => item.id === id);
        const filteredData = paginatedData?.find((item: any) => item.id === id);
        return filteredData
    }

    const [dataNomCode, setDataNomCode] = useState()

    const handleNomCodeClick = (id?: any) => {
        setIsNomCodeClick(true)
        let data = filterData(id);
        // setDataContractTermType(data?.term_type)
        setDataNomCode(data)
        // setDataFileOriginal(data) // เอาไว้คืนค่าเวลา like search
        // setSelectedBookingTemplate(bookingTemplateList.find(item => item.term_type_id == data?.term_type_id))
        setDivMode('2');
    };

    const renderContractCodeFilter = () => {
        const renderdata = dataContract?.filter((item: any) => srchShipper ? item?.group?.id === srchShipper : true);

        if (datalog?.length > 0) {
            let newData: any = [];
            for (let index = 0; index < datalog?.length; index++) {
                let result = renderdata?.find((item: any) => item?.contract_name == datalog[index]?.contract_code?.contract_code);
                if (result) {
                    newData.push({
                        value: result?.contract_id?.toString(),
                        label: result?.contract_name
                    })
                }
            }
            return newData;
        }
        return []
    }

    const renderContractCodeFilterTwo = () => {
        let res_filter_contract = dataContract?.filter((item: any) => item.contract_id.toString() == filter_contract_code_from_somewhere_else)

        let newData: any = [];
        for (let index = 0; index < res_filter_contract?.length; index++) {
            newData.push({
                value: res_filter_contract[index]?.contract_id?.toString(),
                label: res_filter_contract[index]?.contract_name
            })
        }

        return newData?.length > 0 ? newData : []
    }

    useEffect(() => {
        setSrchContractCode(filter_contract_code_from_somewhere_else)
    }, [filter_contract_code_from_somewhere_else])

    useEffect(() => {
        setSrchShipper(filter_group_id_from_somewhere_else)
    }, [filter_group_id_from_somewhere_else])

    return (<>

        {/* ============== MAIN TABLE ============== */}
        {divMode === "1" && (
            <div className=" space-y-2">
                <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
                    <aside className="flex flex-wrap sm:flex-row gap-2 w-full">
                        <DatePickaSearch
                            key={"start" + key}
                            label={"Gas Week"}
                            placeHolder={"Select Gas Week"}
                            // isGasWeek={true}
                            modeSearch={'sunday'}
                            // isFixDay={dashboardObj ? true : false}
                            // dateToFix={dashboardObj && srchStartDate}
                            // defaultValue={filter_gas_week_from_somewhere_else ? filter_gas_week_from_somewhere_else : null}

                            // defaultValue={filter_gas_week_from_somewhere_else ? filter_gas_week_from_somewhere_else : dayjs().day(0).format("YYYY-MM-DD")}
                            defaultValue={
                                filter_gas_week_from_somewhere_else
                                    ? filter_gas_week_from_somewhere_else
                                    : srchStartDate
                                        ? srchStartDate
                                        : dayjs().day(0).format("YYYY-MM-DD")
                            }

                            allowClear
                            onChange={(e: any) => setSrchStartDate(e ? e : null)}
                        />

                        {/* let filter_string = `${userDT?.account_manage?.[0]?.user_type_id == 1 || userDT?.account_manage?.[0]?.user_type_id == 2 ? idsArray : userDT?.account_manage?.[0]?.group_id}` // ถ้าเป็น TSO เอา id shipper ทั้งหมดมาแสดง ถ้าเป็น shipper เอาแค่ของตัวเอง */}
                        <InputSearch
                            id="searchShipper"
                            label="Shipper Name"
                            type="select"
                            value={srchShipper}
                            // onChange={(e) => setSrchShipper(e.target.value)}
                            onChange={(e) => {
                                setSrchShipper(e.target.value)
                                // findContractCode(e.target.value, dataShipper)
                            }}
                            isDisabled={userDT?.account_manage?.[0]?.user_type_id == 3 ? true : false}
                            options={shipperGroupData?.data
                                ?.filter((item: any) => // เห็นแค่ชื่อตัวเอง
                                    userDT?.account_manage?.[0]?.user_type_id == 3
                                        ? item?.id === userDT?.account_manage?.[0]?.group?.id
                                        : true
                                )
                                .map((item: any) => ({
                                    // value: item.id,
                                    value: item.id.toString(),
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
                            // options={dataContract?.map((item: any) => ({
                            //     value: item.id.toString(),
                            //     label: item.contract_code
                            // }))}
                            // options={renderContractCodeFilter()}
                            options={filter_contract_code_from_somewhere_else ? renderContractCodeFilterTwo() : renderContractCodeFilter()}
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

                        <div className="w-auto relative">
                            <CheckboxSearch2
                                id="checkbox_filter"
                                label="Nominations With Submission Comment"
                                type="single-line"
                                value={srchCheckbox ? srchCheckbox : false}
                                onChange={(e: any) => setSrchCheckbox(e?.target?.checked)}
                            />
                        </div>

                        <BtnSearch handleFieldSearch={handleFieldSearch} />
                        <BtnReset handleReset={handleReset} />
                    </aside>
                    <aside className="mt-auto ml-1 w-full sm:w-auto">
                        {/* BTN ADD NEW */}
                    </aside>
                </div>

                <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl shadow-sm">
                    <div className="text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
                        {/* Group Tune and BtnGeneral */}
                        <div className="flex items-center space-x-2">
                            <div onClick={handleTogglePopover}>
                                <Tune
                                    className="cursor-pointer rounded-lg"
                                    style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                                />
                            </div>

                            {
                                // TSO Validity Response of Renom
                                // หน้า List > ปุ่ม Approve/Reject ต้องไม่สามารถกดได้ หากเลยเวลาที่ set ไว้ใน DAM > Nomination Deadline (TSO Validity Response of Renom) File Renom ที่ขึ้นเป็น YES https://app.clickup.com/t/86ettge1g

                                // กรณี Shipper เข้ามาจะต้องไม่เห็นปุ่ม Accept และ Reject https://app.clickup.com/t/86et67bda
                                userDT?.account_manage?.[0]?.user_type_id !== 3 && <>
                                    <BtnGeneral
                                        bgcolor={"#00ADEF"}
                                        modeIcon={'nom-accept'}
                                        textRender={"Approve"}
                                        generalFunc={() => handleAcceptReject(selectedRoles, 'accept')}
                                        // can_create={userPermission ? userPermission?.f_approved : false}
                                        can_create={true}
                                        disable={selectedRoles?.length > 0 ? false : true}
                                    />

                                    <BtnGeneral
                                        bgcolor={"#FFFFFF"}
                                        modeIcon={'nom-reject'}
                                        textRender={"Reject"}
                                        generalFunc={() => handleAcceptReject(selectedRoles, 'reject')}
                                        // can_create={userPermission ? userPermission?.f_approved : false}
                                        can_create={true}
                                        disable={selectedRoles?.length > 0 ? false : true}
                                    />
                                </>
                            }

                        </div>

                        <div className="flex flex-wrap gap-2 justify-end">
                            <SearchInput onSearch={handleSearch} />
                            <BtnExport
                                textRender={"Export"}
                                data={filteredDataTable}
                                path="nomination/weekly-management"
                                can_export={userPermission ? userPermission?.f_export : false}
                                columnVisibility={columnVisibility}
                                initialColumns={initialColumns}
                            />
                        </div>
                    </div>

                    <TableNomDailyMgn
                        // openEditForm={openEditForm}
                        // openViewForm={openViewForm}
                        openAllFileModal={openAllFileModal}
                        openReasonModal={openReasonModal}
                        openSubmissionModal={openSubmissionModal}
                        setDataReGen={setDataReGen}
                        dataNomDeadline={dataNomDeadline}
                        selectedRoles={selectedRoles}
                        setSelectedRoles={setSelectedRoles}
                        handleNomCodeClick={handleNomCodeClick}
                        // tableData={filteredDataTable}
                        tableData={paginatedData}
                        isLoading={isLoading}
                        columnVisibility={columnVisibility}
                        userPermission={userPermission}
                        userDT={userDT}
                    />
                </div>

                <PaginationComponent
                    totalItems={filteredDataTable?.length}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                />
            </div>
        )}

        {/* ============== NOMINATION CODE CLICK ============== */}
        {divMode === "2" && (
            <NomCodeView setDivMode={setDivMode} dataNomCode={dataNomCode} dataMasterZone={dataMasterZone} dataNomDeadline={dataNomDeadline} />
        )}

        <ModalAction
            mode={formMode}
            data={formData}
            open={formOpen}
            dataTable={dataTable}
            dataShipper={dataShipper}
            dataContractOriginal={dataContractOriginal}
            nominationTypeMaster={nominationTypeMaster?.data}
            onClose={() => {
                setFormOpen(false);
                if (resetForm) {
                    setTimeout(() => {
                        resetForm();
                        setFormData(null);
                    }, 200);
                }
            }}
            onSubmit={handleFormSubmit}
            setResetForm={setResetForm}
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

        <ModalSubmissionDetails
            data={dataSubmission}
            open={mdSubmissionView}
            onClose={() => {
                setMdSubmissionView(false);
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


        <ModalAcceptReject
            data={dataNomCode}
            dataModalAcceptReject={dataModalAcceptReject}
            mode={modeUpdateStat}
            open={mdUpdateStat}
            type={mdStatType}
            onClose={() => {
                setMdUpdateStat(false);
            }}
            // onSubmitUpdate={() => handleSubmitAcceptReject('xxx', modeUpdateStat)}
            onSubmit={updateAcceptReject}
        />
    </>

    );
};

export default ClientPage;