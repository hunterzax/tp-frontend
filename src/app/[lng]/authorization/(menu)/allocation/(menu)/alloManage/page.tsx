"use client";
import { Button } from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ModalComponent from "@/components/other/ResponseModal";
import { InputSearch } from '@/components/other/SearchForm';
import { Search, Tune } from "@mui/icons-material"
import { getService, patchService, postService } from "@/utils/postService";
import SearchInput from "@/components/other/searchInput";
import ModalExecute from "./form/modalExecute";
import ConfirmModal from "@/components/other/confirmModal";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import TableAlloManage from "./form/table";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import BtnExport from "@/components/other/btnExport";
import ModalHistory from "@/components/other/modalHistory";
import { findRoleConfigByMenuName, formatDateNoTime, formatNumberFourDecimal, generateUserPermission, getDateRangeForApi, groupDataAlloManage, toDayjs } from "@/utils/generalFormatter";
import { allo_mgn_data_2, allo_mgn_data_3, allo_mgn_data_5, data_allo_mgn, mockDT } from "./form/data";
import ModalComment from "./form/modalComment";
import ModalRejectAllocReview from "./form/modalRejectAllocReview";
import PaginationComponent from "@/components/other/globalPagination";
import ModalSendEmail from "./form/modalSendEmail";
import { useFetchMasters } from "@/hook/fetchMaster";
import { decryptData } from "@/utils/encryptionData";
import dayjs from 'dayjs'; import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import getUserValue from "@/utils/getuserValue";
import BtnReset from "@/components/other/btnReset";
import { data_sort, mock_data_alloc_mgn_2 } from "./form/mockData";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Bangkok")


interface ClientProps {
    // params: {
    //     lng: string;
    // };
}

const ClientPage: React.FC<ClientProps> = () => {

    // ############### Check Authen ###############
    const router = useRouter();
    // const [csrfToken, setCsrfToken] = useState<any>(null);
    const userDT: any = getUserValue();
    const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
    // useRestrictedPage(token);

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
                const permission = findRoleConfigByMenuName('Allocation Management', userDT)
                setUserPermission(permission);
            }
        } catch (error) {
            // Failed to parse user_permission:
        }
    }

    // ############### REDUX DATA ###############
    const { allocationStatusMaster } = useFetchMasters();

    // ############### FIELD SEARCH ###############
    // const [srchGasDayFrom, setSrchGasDayFrom] = useState<Date | null>(null);
    // const [srchGasDayFrom, setSrchGasDayFrom] = useState<Date | null>(dayjs().add(1, 'day').toDate());
    const [srchGasDayFrom, setSrchGasDayFrom] = useState<Date | null>(dayjs().subtract(1, 'day').toDate());

    // const [srchGasDayTo, setSrchGasDayTo] = useState<Date | null>(null);
    const [srchGasDayTo, setSrchGasDayTo] = useState<Date | null>(dayjs().subtract(1, 'day').toDate());

    const [srchShipperName, setSrchShipperName] = useState<any>([]);
    const [srchContractCode, setSrchContractCode] = useState<any>([]);
    const [srchNomPoint, setSrchNomPoint] = useState<any>([]);
    const [srchStatus, setSrchStatus] = useState<any>([]);
    const [srchReviewCode, setSrchReviewCode] = useState('');

    // List : Filter Shipper Allocation ให้ Default เป็น incorrect ไว้ https://app.clickup.com/t/86et3mvzw
    // Incorrect คือ แสดงเฉพาะข้อมูลค่าที่เป็น แดง 
    // ค่าแดง หมายถึง ค่าของ Shipper Allocation Review และ ค่าของ Metering Value ไม่เท่ากัน มันจะแดงทั้งคู่ 
    const [srchShipperAlloc, setSrchShipperAlloc] = useState("");

    const getStartAndEndDateForApi = (gasDayFrom: any, gasDayTo: any) => {
        try {
            let from = srchGasDayFrom ? dayjs(srchGasDayFrom) : null;
            let to = srchGasDayTo ? dayjs(srchGasDayTo) : null;

            if (from && !to) {
                // ถ้าไม่มี to → set เป็นสิ้นปีเดียวกัน
                to = from.endOf("year");
            }

            if (to && !from) {
                // ถ้าไม่มี from → set เป็นต้นปีเดียวกัน
                from = to.startOf("year");
            }

            if (from && to) {
                // const { start_date, end_date } = getDateRangeForApi(srchGasDayFrom, srchGasDayTo);
                const { start_date, end_date } = getDateRangeForApi(from.toDate(), to.toDate());
                return {
                    start_date,
                    end_date
                }
            }
            return {
                start_date: from?.format("YYYY-MM-DD"),
                end_date: to?.format("YYYY-MM-DD")
            }
        } catch (error) {
            return {
                start_date: undefined,
                end_date: undefined
            }
        }
    }

    const funcSetDataContractCode = (res_alloc_mgn: any) => {
        const data_contract_code = Array.from(
            new Map(
                (res_alloc_mgn || [])?.map((item: any) => [item.contract, { contract_code: item.contract, group: item.group }])
            ).values()
        );
        if (data_contract_code?.length > 0) {
            setDataContract((prev: any[]) => {
                const existingModes = new Set(prev.map(item => item.contract_code));
                const newUniqueItems = data_contract_code.filter((item: any) => !existingModes.has(item.contract_code));
                return [...prev, ...newUniqueItems]; // เติมมันเข้าไป และเช็คซ้ำด้วย
            });
        }
    }

    const funcSetDataNomPoint = (res_alloc_mgn: any) => {
        const data_nom_point = Array.from(
            new Map(
                (res_alloc_mgn || [])?.map((item: any) => [item.point, { concept_point: item.point }])
            ).values()
        );
        if (data_nom_point?.length > 0) {
            setDataNomConcept((prev: any[]) => {
                const existingModes = new Set(prev.map(item => item.concept_point));
                const newUniqueItems = data_nom_point.filter((item: any) => !existingModes.has(item.concept_point));
                return [...prev, ...newUniqueItems]; // เติมมันเข้าไป และเช็คซ้ำด้วย
            });
        }
    }

    const handleFieldSearch = async () => {
        setIsLoading(false);

        let filteredResult: any[] = [];

        // v2.0.89 filter gas day แล้วข้อมูลไม่ขึ้น แม้ว่าตอนเข้ามามีค่า default แสดงอยู่ https://app.clickup.com/t/86eumvxdq
        const { start_date, end_date } = getStartAndEndDateForApi(srchGasDayFrom, srchGasDayTo);

        if (start_date && end_date) {
            const res_alloc_mgn: any = await getService(`/master/allocation/allocation-management?start_date=${start_date}&end_date=${end_date}&skip=0&limit=100`);
            setDataBeforeGroup(res_alloc_mgn)

            // DATA CONTRACT CODE
            funcSetDataContractCode(res_alloc_mgn);

            // DATA NOM POINT / CONCEPT POINT
            funcSetDataNomPoint(res_alloc_mgn);

            filteredResult = res_alloc_mgn?.filter((item: any) => {
                return (
                    (srchShipperName?.length > 0 ? srchShipperName.includes(item?.shipper) : true) &&
                    (srchContractCode?.length > 0 ? srchContractCode.includes(item?.contract) : true) &&
                    (srchNomPoint?.length > 0 ? srchNomPoint.includes(item?.point) : true) &&
                    // (srchStatus ? item?.allocation_status?.id.toString() === srchStatus : true) &&
                    // (srchStatus ? item?.allocation_status?.id.toString() === srchStatus : true) &&
                    (srchStatus?.length > 0 ? srchStatus.includes(item?.allocation_status?.id.toString()) : true) && // Filter Status ปรับเป็น Multi Select https://app.clickup.com/t/86eu498k6
                    (srchShipperAlloc === 'correct' ? parseFloat(item?.allocation_management_shipper_review?.[0]?.shipper_allocation_review) === item?.meteringValue : true) &&
                    // (srchShipperAlloc === 'incorrect' ? parseFloat(item?.allocation_management_shipper_review?.[0]?.shipper_allocation_review) !== item?.meteringValue : true) &&

                    // ถ้า item?.allocation_management_shipper_review เป็น null เป็น false 
                    // List : Filter Shipper Allocation เป็น Incorrect แล้วข้อมูลขึ้นไม่ถูก https://app.clickup.com/t/86eub6d0z
                    (
                        srchShipperAlloc === 'incorrect'
                            ? item?.allocation_management_shipper_review
                                ? parseFloat(item.allocation_management_shipper_review[0]?.shipper_allocation_review) !== item?.meteringValue
                                : false
                            : true
                    ) &&
                    (srchReviewCode ? item?.review_code?.replace(/\s+/g, '').toLowerCase().includes(srchReviewCode.replace(/\s+/g, '').toLowerCase()) : true)
                );
            });
        } else {
            filteredResult = dataTable?.filter((item: any) => {
                return (
                    (srchShipperName?.length > 0 ? srchShipperName.includes(item?.shipper) : true) &&
                    (srchContractCode?.length > 0 ? srchContractCode.includes(item?.contract) : true) &&
                    (srchNomPoint?.length > 0 ? srchNomPoint.includes(item?.point) : true) &&
                    // (srchStatus ? item?.allocation_status?.id.toString() === srchStatus : true) &&
                    (srchStatus?.length > 0 ? srchStatus.includes(item?.allocation_status?.id.toString()) : true) && // Filter Status ปรับเป็น Multi Select https://app.clickup.com/t/86eu498k6
                    // (srchShipperAlloc === 'correct' ? parseFloat(item?.allocation_management_shipper_review?.[0]?.shipper_allocation_review || "0") === item?.meteringValue : true) &&
                    // (srchShipperAlloc === 'incorrect' ? parseFloat(item?.allocation_management_shipper_review?.[0]?.shipper_allocation_review || "0") !== item?.meteringValue : true) &&
                    (srchShipperAlloc === 'correct' ? parseFloat(item?.allocation_management_shipper_review?.[0]?.shipper_allocation_review) === item?.meteringValue : true) &&
                    (srchShipperAlloc === 'incorrect' ? parseFloat(item?.allocation_management_shipper_review?.[0]?.shipper_allocation_review) !== item?.meteringValue : true) &&
                    (srchReviewCode ? item?.review_code?.replace(/\s+/g, '').toLowerCase().includes(srchReviewCode.replace(/\s+/g, '').toLowerCase()) : true)
                );
            });
        }

        setData(filteredResult)
        setCurrentPage(1)
        const groupedByGasDayAndNominationPoint = groupDataAlloManage(filteredResult);
        setFilteredDataTable(groupedByGasDayAndNominationPoint);

        setTimeout(() => {
            setIsLoading(true);
        }, 300);

    };

    const handleReset = () => {
        setKey((prevKey) => prevKey + 1);

        setSrchGasDayFrom(dayjs().subtract(1, 'day').toDate())
        setSrchGasDayTo(dayjs().subtract(1, 'day').toDate())

        setSrchShipperName([]);
        setSrchContractCode([]);
        setSrchNomPoint([]);
        setSrchStatus([]);
        setSrchReviewCode('');
        setSrchShipperAlloc("");

        fetchData(); // Filter Gas Day From และ Gas Day To Reset ไม่ได้ https://app.clickup.com/t/86et8tw5b

        // const groupedByGasDayAndNominationPoint = groupDataAlloManage(dataTable);
        // setFilteredDataTable(groupedByGasDayAndNominationPoint);
    };

    // ############### LIKE SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const handleSearch = (query: string) => {
        const queryLower = query.replace(/\s+/g, '')?.toLowerCase().trim();
        const filtered = dataTable?.filter(
            (item: any) => {
                return (
                    item?.allocation_status?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatDateNoTime(item?.gas_day)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.shipper?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.contract?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.point?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.entry_exit?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.group?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    item?.nominationValue?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.systemAllocation?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.intradaySystem?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.previousAllocationTPAforReview?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.allocation_management_shipper_review.length > 0 && item?.allocation_management_shipper_review[0]?.allocation_management_shipper_review?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.meteringValue?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    formatNumberFourDecimal(item?.nominationValue)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.systemAllocation)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.intradaySystem)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.previousAllocationTPAforReview)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.allocation_management_shipper_review.length > 0 && formatNumberFourDecimal(item?.allocation_management_shipper_review[0]?.allocation_management_shipper_review)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.meteringValue)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    item?.review_code?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)
                )
            }
        );

        const groupedByGasDayAndNominationPoint = groupDataAlloManage(filtered);
        setCurrentPage(1)
        setFilteredDataTable(groupedByGasDayAndNominationPoint);
    };

    // ############### DATA TABLE ###############
    const [dataTable, setData] = useState<any>([]);
    const [closeBalanceData, setCloseBalanceData] = useState<any>();
    const [dataBeforeGroup, setDataBeforeGroup] = useState<any>([]);
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [dataShipper, setDataShipper] = useState<any>([]);
    const [dataContract, setDataContract] = useState<any>([]);
    const [dataNomConcept, setDataNomConcept] = useState<any>([]);

    const fetchData = async () => {
        try {
            setIsLoading(false);

            // กรณี shipper เข้ามาเห็นของตัวเอง
            if (userDT?.account_manage?.[0]?.user_type_id == 3) {
                setSrchShipperName([userDT?.account_manage?.[0]?.group?.id])
            }

            // GET CLOSE BALANCE DATA
            const res_ = await getService(`/master/balancing/closed-balancing-report`)
            setCloseBalanceData(res_)

            // Group (2 = TSO, 3 = Shipper, 4 = Other)
            const res_shipper_name = await getService(`/master/account-manage/group-master?user_type=3`);
            setDataShipper(res_shipper_name)

            // const gas_day_from = dayjs(srchGasDayFrom).format("YYYY-MM-DD")
            // const gas_day_to = dayjs(srchGasDayTo).format("YYYY-MM-DD")

            // const gas_day_from = dayjs().format("YYYY-MM-DD")
            // const gas_day_to = dayjs().format("YYYY-MM-DD")

            // filter มัน default day - 1
            const gas_day_from = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
            const gas_day_to = dayjs().subtract(1, 'day').format('YYYY-MM-DD');

            // *** ตัวอย่างการใช้ limit offset อยู่ที่ metering —> metering retrieving --> page.tsx
            // const response: any = await getService(`/master/allocation/allocation-management?start_date=2025-01-01&end_date=2025-02-28&skip=100&limit=100`); // มีข้อมูล
            const response: any = await getService(`/master/allocation/allocation-management?start_date=${gas_day_from}&end_date=${gas_day_to}&skip=0&limit=100`);
            // let response: any = mock_data_alloc_mgn_2;

            const filteredResult = response?.filter((item: any) => [2, 3, 4, 5].includes(item?.allocation_status?.id)); // Default Filter แสดงข้อมูลผิด มัน default ไว้ไม่ให้แสดงสถานะ Not Review แต่ตอนนี้ระบบแสดงแต่ Not Review https://app.clickup.com/t/86ev70b68

            setData(filteredResult);
            setDataBeforeGroup(filteredResult)
            // เอาไว้จัดกรุ๊บตาม gas_day กับ nomination point
            const groupedByGasDayAndNominationPoint = groupDataAlloManage(filteredResult);

            // data ของอิง
            setFilteredDataTable(groupedByGasDayAndNominationPoint);
            // setFilteredDataTable(mockDT);
            setIsLoading(true);

            // DATA CONTRACT CODE
            funcSetDataContractCode(response);

            // DATA NOM POINT / CONCEPT POINT
            funcSetDataNomPoint(response);

            defaultSelectStatus();

        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    };

    const defaultSelectStatus: any = () => {
        const filtered = allocationStatusMaster?.data?.filter((item: any) => item?.name !== 'Not Review');

        const result: any = [];
        filtered?.map((itemf: any) => {
            return result.push(itemf?.id.toString());
        })

        setSrchStatus(result);
    }

    useEffect(() => {
        getPermission();
        fetchData();
    }, [resetForm]);

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const handleCloseModal = () => setModalSuccessOpen(false);

    const [formOpen, setFormOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');

    const fdInterface: any = {
        mode_account: '',
        id_name: '',
        role: '',
        system_login_account: [],
    };

    const [formData, setFormData] = useState(fdInterface);
    const [viewData, setViewData] = useState<any>();

    const openEditForm = (id: any) => {
        setSelectedId(id);
        const filteredData = dataTable.find((item: any) => item.id === id);
        setFormMode('edit');
        setFormData(filteredData);
        setFormOpen(true);
    };

    const openViewForm = (id: any) => {
        const filteredData = dataTable.find((item: any) => item.id === id);
        setViewData(filteredData);
        setViewOpen(true);
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

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    const [mdExcuteOpen, setMdExecuteOpen] = useState(false);
    const [mdSendEmail, setMdSendEmail] = useState(false);
    const [mdRejectOpen, setMdRejectOpen] = useState(false);
    const [mdEditOpen, setMdEditOpen] = useState(false);
    const [mdRejectSuccessOpen, setMdRejectSuccessOpen] = useState(false);
    const [mdEmailSentSuccessOpen, setMdEmailSentSuccessOpen] = useState(false);
    const [mdAcceptSuccessOpen, setMdAcceptSuccessOpen] = useState(false);
    const [executeLoading, setExecuteLoading] = useState(false);

    const handleFormSubmitUpdate = async (data: any) => {
        setExecuteLoading(true)

        try {
            await postService('/master/allocation/execute-data', {});
        } catch (error) {
            // error alloc and bal
            // error alloc and bal
        }

        setMdEditOpen(false);
        setMdExecuteOpen(false);
        if (resetForm) resetForm();

        setTimeout(() => {
            setExecuteLoading(false)
            setModalSuccessOpen(true);
            // fetchData();
            handleFieldSearch();
        }, 500);
    }

    // MODAL EXECUTE OPEN
    const openExecuteForm = async () => {
        setTimeout(() => {
            setMdExecuteOpen(true);
        }, 300);
    };

    // GO TO PAGE CHANGE ALLOC MODE
    const gotoPageChangeAllocMode = () => {
        // setMdExecuteOpen(true);
        router.push("/en/authorization/dam/parameters/systemConfiguration/allocationMode");
    };

    // ============ MODAL ACCEPT OPEN ============
    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);

    const [modalWarningOpen, setModalWarningOpen] = useState(false);
    const [modalWarningMsg, setModalWarningMsg] = useState('');

    const [isAcceptClick, setIsAcceptClick] = useState(false);
    const openAccpetModal = (id?: any, data?: any) => {
        setIsAcceptClick(true)
    };

    const acceptHandle = async () => {
        // let find_item = selectedItem.filter((item: any) => item?.parent == true)
        // find_item = find_item?.flatMap((item: any) => item?.id)
        // const result = dataBeforeGroup.filter((item: any) => find_item.includes(item.id));

        const flat_id_selected = selectedItem?.flatMap((item: any) => item?.id)
        const result = dataBeforeGroup?.filter((item: any) => flat_id_selected.includes(item.id));

        let dynamicBody = {
            "status": 3,
            "comment": "",
            "rowArray": result
        }

        const res_patch: any = await patchService('/master/allocation/allocation-manage-change-status', dynamicBody)
        if (res_patch?.response?.data?.status === 400) {
            setModalErrorMsg(res_patch?.response?.data?.error ? res_patch?.response?.data?.error : 'Failed. Please try again later or contact support.');
            setModalErrorOpen(true)

        } else {
            setMdAcceptSuccessOpen(true);
        }

        setIsAcceptClick(false)
        setIsLoading(false)
        setselectedItem([])
        setModalWarningMsg('');
        setModalWarningOpen(false)

        // await fetchData();
        handleFieldSearch();
    };

    const validateHandle = async () => {
        // let find_item = selectedItem.filter((item: any) => item?.parent == true)
        // find_item = find_item?.flatMap((item: any) => item?.id)
        // const result = dataBeforeGroup.filter((item: any) => find_item.includes(item.id));

        const flat_id_selected = selectedItem?.flatMap((item: any) => item?.id)
        const result = dataBeforeGroup?.filter((item: any) => flat_id_selected.includes(item.id));

        let dynamicBody = {
            "status": 3,
            "comment": "",
            "rowArray": result
        }

        const resValidate: any = await patchService('/master/allocation/allocation-manage-change-status-validate', dynamicBody)
        if (resValidate?.response?.data?.error) {
            setModalWarningMsg(resValidate.response.data.error);
            setModalWarningOpen(true)

            setIsAcceptClick(false)
        }
        else {
            acceptHandle()
        }
    };

    // ============ MODAL REJECT OPEN ============
    const [isRejectClick, setIsRejectClick] = useState(false);
    const openRejectModal = (id?: any, data?: any) => {
        setIsRejectClick(true)
    };
    const [dataReject, setDataReject] = useState([]);

    // #region reject handle
    const rejectHandle = async () => {
        const flat_id_selected = selectedItem?.flatMap((item: any) => item?.id)
        const result = dataBeforeGroup?.filter((item: any) => flat_id_selected.includes(item.id));

        setDataReject(result)
        setIsRejectClick(false)
        setMdRejectOpen(true)
    };

    const modalRejectAllocReview = async (data?: any) => {
        let dynamicBody = {
            "status": 5,
            "comment": data?.reason ? data?.reason : '',
            "rowArray": dataReject
        }
        const res_patch: any = patchService('/master/allocation/allocation-manage-change-status', dynamicBody)
        setMdRejectSuccessOpen(true)
        setMdRejectOpen(false)
        setselectedItem([])

        setTimeout(async () => {
            // await fetchData();
            handleFieldSearch();
        }, 1000);
    }

    // ============ EMAIL SEND ============
    // MODAL SEND EMAIL
    const openSendEmail = () => {
        setMdSendEmail(true);
    };

    const handleSendEmail = async (data?: any) => {
        setIsLoading(false)
        const res_user_type = await getService(`/master/balancing/balance-intraday-dashboard/user-type`);
        const filter_type = res_user_type?.filter((item: any) => item?.id == data?.user_type)
        const filter_group = filter_type[0]?.group?.filter((item: any) => data.group.includes(item?.id))

        // ลบข้อมูล filter_groupx.account.email ที่ email ไม่มีใน data.user_mail
        const userEmails = data.user_mail;
        const cleaned_group = filter_group.map((group: any) => ({
            ...group,
            account: group.account.filter((acc: any) => userEmails.includes(acc.email))
        }));

        const { start_date, end_date } = getStartAndEndDateForApi(srchGasDayFrom, srchGasDayTo);

        if (start_date && end_date) {
            const body_post = {
                "subject": data?.subject,
                "detail": data?.detail,
                "userType": data?.user_type,
                "sendEmailGroup": cleaned_group,
                "exportFile": {
                    "bodys": {
                        "start_date": start_date,
                        "end_date": end_date,
                        "skip": 100,
                        "limit": 100
                    },
                    "filter": [
                        "Total",
                        "Status",
                        "Gas Day",
                        "Shipper Name",
                        "Contract Code",
                        "Nomination Point /Concept Point",
                        "Entry / Exit",
                        "Nominated Value (MMBTU/D)",
                        "System Allocation (MMBTU/D)",
                        "Intraday System Allocation",
                        "Previous Allocation TPA for Review (MMBTU/D)",
                        "Shipper Allocation Review (MMBTU/D)",
                        "Metering Value (MMBTU/D)",
                        "Review Code",
                        "Comment"
                    ]
                }
            }

            try {
                const res_post_email: any = await postService('/master/allocation/allocation-management/send-email', body_post)
                if (res_post_email?.id) {
                    setMdEmailSentSuccessOpen(true)
                }
                else {
                    setModalErrorMsg(res_post_email?.response?.data?.error ?? 'We could not send the email because the required data was not found. Please wait a moment and try again.')
                    setModalErrorOpen(true)
                }
                setMdSendEmail(false);
                setIsLoading(true)
            } catch (error) {

            }
        }
        else {
            setModalErrorMsg('Please select Gas Day From and Gas Day To before send email.');
            setModalErrorOpen(true)
        }
    }

    //state use
    const [key, setKey] = useState(0);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    // ############### PAGINATION ###############
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [paginatedData, setPaginatedData] = useState<any[]>([]);

    const initialColumns: any = [
        { key: 'total', label: 'Total', visible: true },
        { key: 'status', label: 'Status', visible: true },
        { key: 'gas_day', label: 'Gas Day', visible: true },
        { key: 'shipper', label: 'Shipper Name', visible: true },
        { key: 'contract', label: 'Contract Code', visible: true },
        { key: 'nompoint', label: 'Nomination Point /Concept Point', visible: true },
        { key: 'entryexit', label: 'Entry / Exit', visible: true },
        { key: 'nominatedval', label: 'Nominated Value (MMBTU/D)', visible: true },
        { key: 'system_allo', label: 'System Allocation (MMBTU/D)', visible: true },
        { key: 'intraday_allo', label: 'Intraday System Allocation', visible: true },
        { key: 'previous_allo', label: 'Previous Allocation TPA for Review (MMBTU/D)', visible: true },
        { key: 'shipper_allo', label: 'Shipper Allocation Review (MMBTU/D)', visible: true },
        { key: 'metering_allo', label: 'Metering Value (MMBTU/D)', visible: true },
        { key: 'review', label: 'Review Code', visible: true },
        { key: 'comment', label: 'Comment', visible: true },
        { key: 'action', label: 'Action', visible: true }
    ];

    const initialColumnsHistory: any = [
        { key: 'status', label: 'Status', visible: true },
        { key: 'nominated_value', label: 'Nominated Value (MMBTU/D)', visible: true },
        { key: 'system_allocation', label: 'System Allocation (MMBTU/D)', visible: true },
        { key: 'intraday_system_allocation', label: 'Intraday System Allocation', visible: true },
        { key: 'shipper_review_allocation', label: 'Shipper Review Allocation (MMBTU/D)', visible: true },
        { key: 'updated_by', label: 'Updated by', visible: true },
        // { key: 'created_by', label: 'Created by', visible: true },
        // { key: 'action', label: 'Action', visible: true }
    ];

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
            // setPaginatedData(filteredDataTable)
        }
    }, [filteredDataTable, currentPage, itemsPerPage])

    const [selectedItem, setselectedItem] = useState<any>([]);

    // ############### HISTORY MODAL ###############
    const [historyOpen, setHistoryOpen] = useState(false);
    // const handleCloseHistoryModal = () => setHistoryOpen(false);
    const handleCloseHistoryModal = () => {
        setHistoryOpen(false);
        setTimeout(() => {
            setHistoryData(undefined);
        }, 300);
    }
    const [historyData, setHistoryData] = useState<any>();
    const [headData, setHeadData] = useState<any>();

    const openHistoryForm = async (id: any) => {
        try {

            // ปั้น data หัว history
            const filteredData = dataTable?.find((item: any) => item.id === id);
            const find_shipper = dataShipper?.find((itemx: any) => itemx?.id_name == filteredData?.shipper)
            const res_for_header_of_history = [
                {
                    "title": "Shipper Name",
                    "value": find_shipper?.name
                },
                {
                    "title": "Gas Day",
                    "value": filteredData?.gas_day
                },
                {
                    "title": "Contract Code",
                    "value": filteredData?.contract
                },
                {
                    "title": "Nominations Point/Concept Point",
                    "value": filteredData?.point
                },
                {
                    "title": "Review Code",
                    "value": filteredData?.review_code
                }
            ]

            const response: any = await getService(`/master/account-manage/history?type=allocation-manage&method=all&id_value=${id}`);
            const valuesArray = response.map((item: any) => item.value);
            // let mappings = [
            //     { key: "shipper", title: "Shipper Name" },
            //     { key: "gas_day", title: "Gas Day" },
            //     { key: "contract", title: "Contract Code" },
            //     { key: "point", title: "Nominations Point/Concept Point" },
            //     { key: "review_code", title: "Review Code" }, // ตอนแรกเริ่มมันก็มีอยู่ละ 040725 : History เพิ่มให้แสดง Review Code ด้วย https://app.clickup.com/t/86eu29aqk
            // ];
            // let result = mappings.map(({ key, title }) => {
            //     const value = key.split('.').reduce((acc, part) => acc && acc[part], valuesArray[0]);
            //     return {
            //         title,
            //         value: value || "",
            //     };
            // });

            setHeadData(res_for_header_of_history)
            setHistoryData(valuesArray);
            setHistoryOpen(true);
        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    }

    return (
        <div className="space-y-2">
            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">
                    <DatePickaSearch
                        key={"gas_day_from" + key}
                        label="Gas Day From"
                        placeHolder="Select Gas Day From"
                        allowClear
                        isDefaultYesterday={true}
                        onChange={(e: any) => setSrchGasDayFrom(e ? e : null)}
                        customWidth={200}
                    />

                    <DatePickaSearch
                        key={"gas_day_to" + key}
                        label="Gas Day To"
                        placeHolder="Select Gas Day To"
                        allowClear
                        isDefaultYesterday={true}
                        onChange={(e: any) => setSrchGasDayTo(e ? e : null)}
                        customWidth={200}
                    />

                    {
                        userDT?.account_manage?.[0]?.user_type_id !== 3 ?
                            <InputSearch
                                id="searchShipperName"
                                label="Shipper Name"
                                // type="select"
                                type="select-multi-checkbox"
                                isDisabled={userDT?.account_manage?.[0]?.user_type_id == 3 ? true : false}
                                // value={srchShipperName}
                                value={userDT?.account_manage?.[0]?.user_type_id == 3 ? [userDT?.account_manage?.[0]?.group?.id_name] : srchShipperName}
                                onChange={(e) => setSrchShipperName(e.target.value)}
                                // options={dataShipper?.map((item: any) => ({
                                //     value: item.id.toString(),
                                //     label: item.name
                                // }))}
                                options={dataShipper
                                    ?.filter((item: any) => // เห็นแค่ชื่อตัวเอง
                                        userDT?.account_manage?.[0]?.user_type_id == 3
                                            ? item?.id === userDT?.account_manage?.[0]?.group?.id
                                            : true
                                    )
                                    .map((item: any) => ({
                                        value: item.id_name,
                                        label: item.name,
                                    }))
                                }
                            />
                            :
                            <InputSearch
                                id="searchShipperName"
                                label="Shipper Name"
                                type="select"
                                isDisabled={true}
                                value={userDT?.account_manage?.[0]?.group?.id_name}
                                onChange={(e) => setSrchShipperName(e.target.value)}
                                options={dataShipper
                                    ?.filter((item: any) => // เห็นแค่ชื่อตัวเอง
                                        userDT?.account_manage?.[0]?.user_type_id == 3
                                            ? item?.id === userDT?.account_manage?.[0]?.group?.id
                                            : true
                                    )
                                    .map((item: any) => ({
                                        // value: item.name,
                                        value: item.id_name,
                                        label: item.name,
                                    }))
                                }
                            />
                    }

                    <InputSearch
                        id="searchContractCode"
                        label="Contract Code"
                        // type="select"
                        type="select-multi-checkbox"
                        value={srchContractCode}
                        onChange={(e) => setSrchContractCode(e.target.value)}
                        // options={dataContract?.filter((item: any) => srchShipper ? item.group_id === srchShipper : true)
                        //     .map((item: any) => ({
                        //         value: item.contract_code_text,
                        //         label: item.contract_code_text
                        //     }))
                        // }
                        // options={dataContract?.map((item: any) => ({
                        //     value: item.contract_code,
                        //     label: item.contract_code
                        // }))}
                        options={dataContract?.filter((contract: any) => srchShipperName?.length > 0 ? contract?.group?.id_name == srchShipperName : true).map((item: any) => ({
                            value: item.contract_code,
                            label: item.contract_code
                        }))}
                    />

                    <InputSearch
                        id="searchNomPoint"
                        label="Nomination Point / Concept Point"
                        // type="select"
                        type="select-multi-checkbox"
                        value={srchNomPoint}
                        onChange={(e) => setSrchNomPoint(e.target.value)}
                        options={dataNomConcept?.map((item: any) => ({
                            value: item.concept_point,
                            label: item.concept_point
                        }))}
                        placeholder="Search Nomination Point / Concept Point"
                    />

                    {/* Filter Status ปรับเป็น Multi Select https://app.clickup.com/t/86eu498k6 */}
                    {/* <InputSearch
                        id="searchStatus"
                        label="Status"
                        type="select"
                        value={srchStatus}
                        onChange={(e) => setSrchStatus(e.target.value)}
                        options={allocationStatusMaster?.data?.map((item: any) => ({
                            value: item.id.toString(),
                            label: item.name
                        }))}
                    /> */}

                    <InputSearch
                        id="searchStatus"
                        label="Status"
                        type="select-multi-checkbox"
                        value={srchStatus}
                        onChange={(e) => setSrchStatus(e.target.value)}
                        options={allocationStatusMaster?.data?.map((item: any) => ({
                            value: item.id.toString(),
                            label: item.name
                        }))}
                    />

                    <InputSearch
                        id="searchShipperAllo"
                        label="Shipper Allocation Checking"
                        type="select"
                        customWidth={270}
                        value={srchShipperAlloc}
                        onChange={(e) => setSrchShipperAlloc(e.target.value)}
                        options={[
                            { value: "correct", label: "Correct" },
                            { value: "incorrect", label: "Incorrect" },
                        ]}
                    />

                    <InputSearch
                        id="searchReviewCode"
                        label="Review Code"
                        value={srchReviewCode}
                        onChange={(e) => setSrchReviewCode(e.target.value)}
                        placeholder="Search Review Code"
                    />

                    <section className="mt-2 sm:mt-auto">
                        <Button
                            className="flex items-center justify-center gap-3 px-2 w-[35px] h-[35px] bg-[#00ADEF]"
                            onClick={handleFieldSearch}
                        >
                            <Search style={{ fontSize: "16px" }} />
                        </Button>
                    </section>

                    <BtnReset handleReset={handleReset} />
                </aside>
                <aside className="mt-auto ml-1 w-full sm:w-auto">
                    <div className="flex gap-2">
                        <Button className="flex items-center justify-center px-2 h-[44px] bg-[#1473A1] font-light w-[120px] text-center" onClick={() => openSendEmail()}>
                            <span className="capitalize">{`Send Email`}</span>
                        </Button>
                        <Button className="flex items-center justify-center px-2 h-[44px] bg-[#3582D5] font-light w-[155px] text-center" onClick={() => gotoPageChangeAllocMode()}>
                            <span className="capitalize">{`Change Alloc Mode`}</span>
                        </Button>
                        <Button className="flex items-center justify-center px-2 h-[44px] bg-[#00ADEF] font-light w-[130px] text-center" onClick={() => openExecuteForm()}>
                            <span className="capitalize">{`Alloc & Bal`}</span>
                        </Button>
                    </div>
                </aside>
            </div>

            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl shadow-sm">
                <div>
                    <div className="text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-start pb-4">
                        <div className="w-[50%] flex flex-column items-center justify-start gap-4">
                            <div onClick={handleTogglePopover}>
                                <Tune
                                    className="cursor-pointer rounded-lg"
                                    style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                                />
                            </div>

                            <button
                                onClick={() => openAccpetModal()}
                                className="flex justify-center items-center px-5 py-2 rounded-md duration-300" style={{ cursor: selectedItem?.length == 0 ? 'not-allowed' : 'pointer', background: selectedItem?.length == 0 ? '#AEAEB2' : '#C2F5CA', color: selectedItem?.length == 0 ? '#FFF' : '#464255' }} disabled={selectedItem?.length == 0 ? true : false}>
                                <span className="mr-4">{'Accept'}</span> <CheckIcon sx={{ fontSize: '15px' }} />
                            </button>

                            <button
                                onClick={() => openRejectModal()}
                                className="flex justify-center items-center px-5 py-2 rounded-md duration-300"
                                style={{
                                    cursor: selectedItem?.length == 0 ? 'not-allowed' : 'pointer',
                                    background: selectedItem?.length == 0 ? '#FFF' : '#FFF3C8',
                                    border: selectedItem?.length == 0 ? '1px solid #AEAEB2' : 'none',
                                    color: selectedItem?.length == 0 ? '#AEAEB2' : '#464255'
                                }}
                                disabled={selectedItem?.length == 0 ? true : false}
                            >
                                <span className="mr-4">{'Reject'}</span>
                                <CloseIcon sx={{ fontSize: '15px' }} />
                            </button>

                        </div>
                        <div className="w-[50%] flex flex-wrap gap-2 justify-end">
                            <SearchInput onSearch={handleSearch} />
                            <BtnExport
                                textRender={"Export"}
                                data={filteredDataTable}
                                data2={getStartAndEndDateForApi((srchGasDayFrom ?? toDayjs().toISOString()), (srchGasDayTo ?? toDayjs().toISOString()))}
                                path="allocation/allocation-management"
                                specificMenu='allocation-mgn'
                                can_export={userPermission ? userPermission?.f_export : false}
                                columnVisibility={columnVisibility}
                                initialColumns={initialColumns}
                                specificData={
                                    {
                                        // skip: ,
                                        // limit: 
                                    }
                                }
                            />
                        </div>

                    </div>
                </div>
                <TableAlloManage
                    openEditForm={openEditForm}
                    openViewForm={openViewForm}
                    tableData={paginatedData}
                    isLoading={isLoading}
                    columnVisibility={columnVisibility}
                    selectedItem={selectedItem}
                    setselectedItem={setselectedItem}
                    openHistoryForm={openHistoryForm}
                    openReasonModal={openReasonModal}
                />
            </div>

            <PaginationComponent
                // totalItems={totalItems} // Use total count from API
                totalItems={filteredDataTable?.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                // onPageChange={(page) => setCurrentPage(page)}
                // onItemsPerPageChange={(perPage) => {
                //     setItemsPerPage(perPage);
                //     setCurrentPage(1); // Reset to first page when items per page changes
                // }}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
            />

            {/* 1. กด execute */}
            <ModalExecute
                data={[]}
                dataCloseBal={closeBalanceData}
                isLoading={executeLoading}
                open={mdExcuteOpen}
                onClose={() => {
                    setMdExecuteOpen(false);
                    if (resetForm) resetForm();
                }}
                onSubmitUpdate={handleFormSubmitUpdate}
            />

            {/* 2. แสดง */}
            <ModalComponent
                open={isModalSuccessOpen}
                handleClose={handleCloseModal}
                stat="process"
                title="Allocation and Balancing Execution"
                description={
                    <div>
                        <div className="text-center text-[17px]">
                            {`Your request is currently being processed. `}
                        </div>
                        <div className="text-center text-[17px]">
                            {`You will be notified when it's finished.`}
                        </div>
                    </div>
                }
            />

            {/* <ModalComponent
                open={mdExcuteSuccessOpen}
                handleClose={handleCloseModalExecute}
                title="Allocation and Balancing Execution"
                stat="process"
                // description="Non TPA Point has been added."
                description={
                    <div>
                        <div className="text-center text-[17px]">
                            {`Your request is currently being processed. `}
                        </div>
                        <div className="text-center text-[17px]">
                            {`You will be notified when it's finished.`}
                        </div>
                    </div>
                }
            /> */}

            <ModalComponent
                open={mdAcceptSuccessOpen}
                handleClose={() => setMdAcceptSuccessOpen(false)}
                title="Success"
                description={`Your selection have been accepted.`}
            />

            <ModalComponent
                open={mdRejectSuccessOpen}
                handleClose={() => setMdRejectSuccessOpen(false)}
                title="Success"
                description={`Your selection has been rejected.`}
            />

            <ModalComponent
                open={mdEmailSentSuccessOpen}
                handleClose={() => setMdEmailSentSuccessOpen(false)}
                title="Success"
                description={`The email has been sent.`}
            />

            <ConfirmModal
                open={isAcceptClick}
                handleClose={() => setIsAcceptClick(false)}
                handleConfirm={() => validateHandle()}
                // handleConfirm={() => closeConfirmModal()}
                // title={`${mdConfirmMsg}`}
                title="Confirm Acceptance"
                btnText='Accept'
                description="To proceed, click 'Accept'."
            />

            <ConfirmModal
                open={isRejectClick}
                handleClose={() => setIsRejectClick(false)}
                handleConfirm={() => rejectHandle()}
                // handleConfirm={() => closeConfirmModal()}
                // title={`${mdConfirmMsg}`}
                title="Confirm Rejection"
                btnText='Reject'
                description="To proceed, click 'Reject'."
            />

            <ConfirmModal
                open={modalWarningOpen}
                handleClose={() => setModalWarningOpen(false)}
                handleConfirm={() => acceptHandle()}
                stat='confirm'
                // handleConfirm={() => closeConfirmModal()}
                // title={`${mdConfirmMsg}`}
                title="Warning"
                btnText='Accept'
                description={modalWarningMsg}
            />

            <ModalRejectAllocReview
                open={mdRejectOpen}
                handleClose={() => setMdRejectOpen(false)}
                // onSubmitUpdate={() => handleSubmitAcceptReject('xxx', 'reject')}
                onSubmitUpdate={(e: any) => modalRejectAllocReview(e)}
                data={dataReject}
                mode={'reject'}
            />

            <ModalSendEmail
                open={mdSendEmail}
                handleClose={() => setMdSendEmail(false)}
                // onSubmitUpdate={() => handleSubmitAcceptReject('xxx', 'reject')}
                onSubmitUpdate={(e: any) => handleSendEmail(e)}
                data={dataReject}
                mode={'xxxx'}
            />

            <ColumnVisibilityPopover
                open={open}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                columnVisibility={columnVisibility}
                handleColumnToggle={handleColumnToggle}
                initialColumns={initialColumns}
            />

            <ModalComment
                data={dataReason}
                dataRow={dataReasonRow}
                open={mdReasonView}
                onClose={() => {
                    setMdReasonView(false);
                }}
            />

            <ModalHistory
                open={historyOpen}
                handleClose={handleCloseHistoryModal}
                tableType="allocation-management"
                title="History"
                data={historyData}
                head_data={headData}
                initialColumns={initialColumnsHistory}
                userPermission={userPermission}
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

        </div>
    )
}

export default ClientPage;