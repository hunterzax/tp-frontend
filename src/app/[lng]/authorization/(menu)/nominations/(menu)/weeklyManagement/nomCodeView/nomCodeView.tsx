"use client";
import { useEffect, useMemo, useState } from "react";
import { findRoleConfigByMenuName, formatDateNoTime, generateUserPermission, isDisabledByContractEnd, shouldDisableByDeadline, toDayjs } from '@/utils/generalFormatter';
import { getService, postService } from "@/utils/postService";
import { useFetchMasters } from "@/hook/fetchMaster";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import BtnGeneral from "@/components/other/btnGeneral";
import { useAppDispatch } from "@/utils/store/store";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import getUserValue from "@/utils/getuserValue";
import ModalComponent from "@/components/other/ResponseModal";
import { decryptData } from "@/utils/encryptionData";
import ArrowBackIos from '@mui/icons-material/ArrowBackIosOutlined';
import BtnNomination from "@/components/other/btnNomination";
import TableEntryComposition from "./tableEntryComposition";
import PageComment from "./pageComment";
import PageViewFile from "./pageViewFile";
import TableEachZone from "./tableEachZone";
import { fetchAreaMaster } from "@/utils/store/slices/areaMasterSlice";
import { fetchEntryExit } from "@/utils/store/slices/entryExitSlice";
import { fetchZoneMasterSlice } from "@/utils/store/slices/zoneMasterSlice";
import ModalAcceptReject from "../form/modalAcceptReject";

const NomCodeView: React.FC<any> = ({ setDivMode, dataNomCode, dataMasterZone, dataNomDeadline }) => {

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
                const permission = findRoleConfigByMenuName('Daily Management', userDT)
                setUserPermission(permission);
            }
        } catch (error) {
            // Failed to parse user_permission:
        }
    }

    useEffect(() => {
        getPermission();
    }, [])

    const [dataNomCodeX, setDataNomCodeX] = useState<any>(null);
    const [dataValidate, setDataValidate] = useState<any>(null);

    useEffect(() => {
        const getValidateData = async (body?: any) => {
            try {
                const res_ = await postService('/master/weekly-management/version-validate', body);
                return res_;
            } catch (error) {
                // Error fetching validation data
            }
        };

        const fetchData = async () => {
            let body_validate = {
                "nomination_type_id": dataNomCode.nomination_type_id,
                "contract_code_id": dataNomCode.contract_code_id,
                "nomination_version_id": dataNomCode.nomination_version[0]?.id
            };

            let res = await getValidateData(body_validate);
            setDataValidate(res);
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (!dataNomCode) return; // Prevent execution if dataNomCode is null/undefined

        // ปั่นดาต้า ปั้น data
        const newDataNomCodeX = {
            ...dataNomCode,
            nomination_version: dataNomCode.nomination_version ? [...dataNomCode.nomination_version] : [],
        };

        // เอาไว้ยัดข้อมูลจากเส้น validate เพื่อไว้ใช้ทำตัวแดง ตัวดำ ตอนแสดงผลใน table
        newDataNomCodeX.nomination_version[0].nomination_row_json = newDataNomCodeX?.nomination_version[0]?.nomination_row_json?.map((row: any) => {
            const matchingData = dataValidate?.find((item: any) => item.id === row.id);
            return matchingData ? { ...row, newObj: matchingData.newObj } : row;
        });

        if (newDataNomCodeX.nomination_version[0]) {
            newDataNomCodeX.nomination_version[0].nomination_full_json =
                dataNomCode?.nomination_version[0]?.nomination_full_json?.map((item: any) => ({
                    ...item,
                    data_temp2: JSON.parse(item.data_temp || "{}"),
                }));

            newDataNomCodeX.nomination_version[0].nomination_row_json =
                dataNomCode?.nomination_version[0]?.nomination_row_json?.map((item: any) => {
                    let data_k = JSON.parse(item.data_temp || "{}")
                    return ({
                        ...item,
                        data_temp2: data_k,
                        supply_demand_text: data_k['1'],
                        nomination_point_text: data_k['3'],
                        unit_text: data_k['9'],
                        type_text: data_k['6'],
                        entry_exit_text: data_k['10'],
                        wi_text: data_k['11'],
                        hv_text: data_k['12'],
                        sg_text: data_k['13'],
                        Sunday: data_k['14'],
                        Monday: data_k['15'],
                        Tuesday: data_k['16'],
                        Wednesday: data_k['17'],
                        Thursday: data_k['18'],
                        Friday: data_k['19'],
                        Saturday: data_k['20'],
                    })
                });

            newDataNomCodeX.nomination_version[0].nomination_full_json_sheet2 =
                dataNomCode?.nomination_version[0]?.nomination_full_json_sheet2?.map((item: any) => {
                    let data_k = JSON.parse(item.data_temp || "{}")
                    return ({
                        ...item,
                        data_temp2: data_k,
                        supply_demand_text: data_k['1'],
                        nomination_point_text: data_k['3'],
                        unit_text: data_k['9'],
                        type_text: data_k['6'],
                        entry_exit_text: data_k['10'],
                        wi_text: data_k['11'],
                        hv_text: data_k['12'],
                        sg_text: data_k['13'],
                        Sunday: data_k['14'],
                        Monday: data_k['15'],
                        Tuesday: data_k['16'],
                        Wednesday: data_k['17'],
                        Thursday: data_k['18'],
                        Friday: data_k['19'],
                        Saturday: data_k['20'],
                    })
                });
        }

        setDataNomCodeX(newDataNomCodeX);
        // }, [dataNomCode]);
    }, [dataValidate]); // ใหม่

    // ############### REDUX DATA ###############
    const { entryExitMaster, zoneMaster, areaMaster } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const dispatch = useAppDispatch();

    useEffect(() => {

        if (forceRefetch || !areaMaster?.data) {
            dispatch(fetchAreaMaster());
        }
        if (forceRefetch || !entryExitMaster?.data) {
            dispatch(fetchEntryExit());
        }
        if (forceRefetch || !zoneMaster?.data) {
            dispatch(fetchZoneMasterSlice());
        }

        // Reset forceRefetch after fetching
        if (forceRefetch) {
            setForceRefetch(false); // Reset the flag after triggering the fetch
        }
    }, [dispatch, forceRefetch, areaMaster, entryExitMaster, zoneMaster]); // Watch for forceRefetch changes


    // ############### DATA TABLE ###############
    const [isEdited, setIsEdited] = useState<boolean>(false); // เอาไว้จับว่ากด edit หรือยัง เพื่อไว้เปิดปุ่ม submit
    const [dataTable, setData] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [dataContractOriginal, setDataContractOriginal] = useState<any>([]);
    const [dataContract, setDataContract] = useState<any>([]);
    const [dataShipper, setDataShipper] = useState<any>([]);

    const fetchData = async () => {
        try {

            const res_contract_code = await getService(`/master/release-capacity-submission/contract-code`);
            setDataContract(res_contract_code);
            setDataContractOriginal(res_contract_code)

            const res_shipper_approve = await getService(`/master/upload-template-for-shipper/shipper-contract-approved`);
            setDataShipper(res_shipper_approve);

            const response: any = await getService(`/master/upload-template-for-shipper`);

            setData(response);
            // setFilteredDataTable(response);
            setIsLoading(true);
        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [resetForm]);

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

    // useEffect(() => {
    //     if (filteredDataTable) {
    //         setPaginatedData(filteredDataTable.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
    //     }
    // }, [filteredDataTable, currentPage, itemsPerPage])

    // ############### COLUMN SHOW/HIDE ###############

    const initialColumns: any = [
        { key: 'zone', label: 'Zone', visible: true },
        { key: 'point', label: 'Point', visible: true },
        { key: 'co2', label: 'CO2', visible: true },
        { key: 'c1', label: 'C1', visible: true },
        { key: 'c2', label: 'C2', visible: true },
        { key: 'c3', label: 'C3', visible: true },
        { key: 'ic4', label: 'IC4', visible: true },
        { key: 'nc4', label: 'nC4', visible: true },
        { key: 'ic5', label: 'IC5', visible: true },
        { key: 'nc5', label: 'nC5', visible: true },
        { key: 'c6', label: 'C6', visible: true },
        { key: 'c7', label: 'C7', visible: true },
        { key: 'c2_plus', label: 'C2+', visible: true },
        { key: 'n2', label: 'N2', visible: true },
        { key: 'o2', label: 'O2', visible: true },
        { key: 'h2s', label: 'H2S', visible: true },
        { key: 's', label: 'S', visible: true },
        { key: 'hg', label: 'HG', visible: true },
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

    // ############### ACCEPT REJECT ###############
    const [modeUpdateStat, setModeUpdateStat] = useState<any>('');
    const [mdStatType, setMdStatType] = useState<any>('all');
    const [mdUpdateStat, setMdUpdateStat] = useState(false);
    const [idUpdateStat, setIdUpdateStat] = useState([]);
    const [dataModalAcceptReject, setDataModalAcceptReject] = useState<any>([]);

    const handleAccept = (data?: any) => {
        setDataModalAcceptReject([data])
        setMdStatType('one')

        setIdUpdateStat(data?.id)
        setModeUpdateStat('accept')
        setMdUpdateStat(true)
    }

    const handleReject = (data?: any) => {
        setDataModalAcceptReject([data])
        setMdStatType('one')

        setIdUpdateStat(data?.id)
        setModeUpdateStat('reject')
        setMdUpdateStat(true)
    }

    const updateAcceptReject = async (data?: any) => {
        let body_post = {
            id: [idUpdateStat],
            status: modeUpdateStat == 'accept' ? 2 : 3,
            comment: data.reason
        }


        try {
            const res_ = await postService('/master/daily-management/update-status', body_post);
            if (res_?.response?.data?.status === 400) {
                // setFormOpen(false);
                setMdUpdateStat(false)
                setModalErrorMsg(res_?.response?.data?.error);
                setModalErrorOpen(true)
            } else {
                // setFormOpen(false);
                setMdUpdateStat(false)
                const action = modeUpdateStat === 'accept' ? 'approved' : 'rejected';
                const fileType = mdStatType === 'all' ? 'All File' : 'File';

                setModalSuccessMsg(`${fileType} has been ${action}.`);
                setModalSuccessOpen(true);

                // setDivMode('1')
                // setSelectedRoles([]) // clear ที่ select re-gen
            }

        } catch (error) {
            // error
        }
    }

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
    const [mdSubmissionView, setMdSubmissionView] = useState<any>(false);
    const [dataSubmission, setDataSubmission] = useState<any>([]);

    const openSubmissionModal = (id?: any, data?: any) => {
        const filtered = dataTable?.find((item: any) => item.id === id);
        setDataSubmission(filtered)
        setMdSubmissionView(true)
    };

    const [activeButton, setActiveButton] = useState<number | null>(null);

    const handleClick = (id: number | undefined, row_id?: number) => {
        // if (!userPermission?.f_view) return;
        setActiveButton(id || null);
        openSubmissionModal(row_id);
    };

    const buttons = useMemo(() => {
        const baseButtons = [
            { text: "Entry Composition", id: 1 },
            { text: "Comment", id: 2 },
            { text: "File", id: 3 }
        ];

        // Extract unique, non-null zone_text values
        const zoneTexts = Array.from(
            new Set(dataNomCodeX?.nomination_version[0].nomination_row_json
                .map((item: any) => item.zone_text)
                .filter((zone: any) => zone !== null)
            )
        );

        // Create a stable mapping of zone_text to ID
        const zoneButtons = zoneTexts.map((zone) => ({
            text: zone,
            id: Math.floor((crypto.getRandomValues(new Uint32Array(1))[0] / 0xffffffff) * 90000) + 1,
        })).filter((item: any) => item.text !== '');;

        setActiveButton(zoneButtons ? zoneButtons[0]?.id : null)

        return [...zoneButtons, ...baseButtons]; // Append zone buttons before existing ones
        // }, [mod_data_mock.nominationRowJson]); // Runs only when `mod_data_mock.nominationRowJson` changes
    }, [dataNomCodeX?.nomination_version[0].nomination_row_json]); // Runs only when `mod_data_mock.nominationRowJson` changes


    // ############### SUBMIT HANDLE ###############
    const [tempData, setTempData] = useState<Record<string, any>[]>([]);
    const [tempDataConcept, setTempDataConcept] = useState<Record<string, any>[]>([]);

    // const handleCloseModal = () => setModalSuccessOpen(false);
    const handleCloseModal = () => {
        setDivMode('1')
        setModalSuccessOpen(false);
    }

    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);
    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMsg, setModalSuccessMsg] = useState('');

    const submitData = async (item?: any) => {

        //kom 7 month disaled
        const transformedData = {
            rowChange: [
                ...tempData.map(item => ({
                    id: item.id,
                    old_index: item.old_index,
                    data_temp: JSON.stringify(item.data_temp2)
                })),
                ...tempDataConcept.map(item => ({
                    id: item.id,
                    old_index: item.old_index,
                    data_temp: JSON.stringify(item.data_temp2)
                }))
            ]
        };

        // master/daily-management/edit-row/11 param คือ id ของตัวหลัก
        let res_edit = await postService(`/master/weekly-management/edit-row/${dataNomCodeX.nomination_version[0]?.id}`, transformedData);

        if (res_edit?.response?.data?.status === 400 || res_edit?.response?.data?.status === 500 || res_edit?.response?.data?.statusCode === 500) {
            setModalErrorMsg(res_edit?.response?.data?.error ? res_edit?.response?.data?.error : "Something went wrong.");
            setModalErrorOpen(true)
        } else {
            // setFormOpen(false);
            // await fetchData();
            setModalSuccessMsg('File has been submitted.')
            setModalSuccessOpen(true);
        }
    }

    const [isAfterGasDay, setIsAfterGasDay] = useState<any>(false)
    useEffect(() => {
        setIsAfterGasDay(toDayjs(dataNomCode?.gas_day).isBefore(toDayjs(), 'day'))
    }, [dataNomCode])

    const [isDisableAction, setIsDisableAction] = useState<any>(false)
    useEffect(() => {
        let isDisable = false

        // check case terminate date ของ contract
        if (dataNomCode?.contract_code?.status_capacity_request_management_id == 5) { // 5 = terminate
            // priority terminate --> extend --> contract_end_date
            // เช็คว่า dataNomCode.contract_code มีข้อมูลวันจบสัญญาตามระดับความสำคัญนี้หรือไม่
            // 1. dataNomCode.contract_code.terminate_date
            // 2. dataNomCode.contract_code.extend_deadline
            // 3. dataNomCode.contract_code.contract_end_date

            // แล้วมาเช็คกับ dataNomCode.gas_day ถ้า dataNomCode.gas_day เกินวันจบสัญญา ให้ set isDisable == true
            const { isDisableAction, endDateKey, gasDayLocalDate, endDateLocalDate } = isDisabledByContractEnd(dataNomCode, 7);
            isDisable = isDisableAction
        }

        if (!isDisable && dataNomDeadline?.length > 0) {
            // const dl = dataNomDeadline[0];
            const dl = dataNomDeadline?.find((item: any) => {
                if (dataNomCode?.query_shipper_nomination_file_renom_id == 2) {  // renom == NO
                    return item?.process_type_id == 2 // 2 = management
                } else {
                    return item?.process_type_id == 4 // 4 = "Validity response of renomination"
                }
            });

            isDisable = shouldDisableByDeadline(dataNomCode?.gas_day, dl, { tzOffsetHours: 7 });
        }

        setIsDisableAction(isDisable)
    }, [dataNomDeadline])


    return (<>
        <div className="space-y-2">
            <div className="text-[#464255] px-4 text-[14px] font-bold pb-4">
                <div className="cursor-pointer" onClick={() => {
                    setDivMode("1")
                    // setIsEditing(false) // ตอนกด back ปิด edit
                    // setExpandedRow(null)
                    // setExpandedEntry(null)
                    // setModeEditing(undefined)
                }}
                >
                    <ArrowBackIos style={{ fontSize: "14px" }} /> {` Back`}
                </div>
            </div>

            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">
                    <div className="mb-4 w-[60%]">
                        <div className="grid grid-cols-[170px_90px_150px_120px] text-[#58585A]">
                            <p className="!text-[14px] font-semibold">{`Nominations Code`}</p>
                            <p className="!text-[14px] font-semibold">{`Gas Week`}</p>
                            <p className="!text-[14px] font-semibold">{`Contract Code`}</p>
                            <p className="!text-[14px] font-semibold">{`Shipper Name`}</p>
                        </div>

                        <div className="grid grid-cols-[170px_90px_150px_120px] !text-[10px] font-light text-[#58585A]">
                            <p>{dataNomCode?.nomination_code || ''}</p>
                            <p>{formatDateNoTime(dataNomCode?.gas_day) || ''}</p>
                            <p>{dataNomCode?.contract_code?.contract_code || ''}</p>
                            <p>{dataNomCode?.group?.name || ''}</p>
                        </div>
                    </div>
                </aside>

                <aside className="mt-auto ml-1 w-full sm:w-auto">
                    <div className="flex flex-nowrap gap-2 justify-end">

                        {/* <BtnGeneral
                            bgcolor={"#17AC6B"}
                            modeIcon={'nom-action'}
                            textRender={"Action"}
                            handleAccept={() => handleAccept(dataNomCode)}
                            handleReject={() => handleReject(dataNomCode)}
                            can_create={userPermission ? userPermission?.f_create : false}
                            disable={[2, 3, 4, 5].includes(dataNomCode?.query_shipper_nomination_status?.id)}
                        /> */}

                        {/* v2.0.16 ต้องไม่สามารถ edit, accept, reject nomination file ได้ หากเลยวัน gas day มาแล้ว ตามการ setting ที่ nomination deadline (Weekly management) https://app.clickup.com/t/86et2uwc3 */}
                        <BtnGeneral
                            bgcolor={"#17AC6B"}
                            modeIcon={'nom-action'}
                            textRender={"Action"}
                            handleAccept={() => handleAccept(dataNomCode)}
                            handleReject={() => handleReject(dataNomCode)}
                            can_create={userPermission ? userPermission?.f_approved : false}
                            // can_create={true} // dev mode
                            // disable={[2, 3, 4, 5].includes(dataNomCode?.query_shipper_nomination_status?.id)}
                            disable={
                                [2, 3, 4, 5].includes(dataNomCode?.query_shipper_nomination_status?.id) ||  // 2 = approved, 3 = rejected, 4 = cancelled, 5 = approve by system
                                // toDayjs(dataNomCode?.gas_day).isBefore(toDayjs(), 'day')
                                isDisableAction
                            }
                        />

                        <BtnGeneral
                            bgcolor={"#00ADEF"}
                            textRender={"Submit"}
                            generalFunc={() => submitData()}
                            can_create={userPermission ? userPermission?.f_approved : false}
                            disable={isEdited ? false : true}
                        // disable={false} // for dev
                        // can_create={true} // for dev
                        />
                    </div>
                </aside>
            </div>
        </div>

        {/* <div className="flex h-[calc(100vh-300px)] gap-2 pt-2 overflow-hidden"> */}
        {/* <div className="flex h-[calc(100vh-240px)] gap-2 pt-2 overflow-hidden"> */}
        <div className="flex h-[calc(100vh-100px)] gap-2 pt-2 overflow-hidden">
            {/* Sidebar (15%) */}
            <div className="w-[15%] p-2 flex flex-col">
                {buttons.map(({ text, id }) => (
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
            <div className="w-[85%] h-full border-[#DFE4EA] border-[1px] gap-2 pt-2 rounded-xl shadow-sm flex flex-col overflow-hidden">
                <div className="flex-1 px-4 overflow-hidden">

                    {buttons.map((button) => {
                        if (activeButton === button.id) {

                            const filter_tab_entry = dataNomCodeX?.nomination_version[0].nomination_row_json?.filter(
                                (item: any) => item?.zone_text == button.text && item?.query_shipper_nomination_type_id === 1
                            );

                            switch (button.text) {
                                case "Entry Composition":
                                    // return <TableEntryComposition key={button.id} isLoading={true} columnVisibility={columnVisibility} tableData={mod_data_mock} />;
                                    return <TableEntryComposition
                                        key={button.id}
                                        isLoading={true}
                                        columnVisibility={columnVisibility}
                                        tableData={dataNomCodeX.nomination_version[0].nomination_full_json_sheet2[0]}
                                        zoneMaster={zoneMaster}
                                        dataMasterZone={dataMasterZone}
                                    />;
                                case "Comment":
                                    return <PageComment
                                        key={button.id}
                                        data={dataNomCodeX}
                                    />;
                                case "File":
                                    return <PageViewFile
                                        key={button.id}
                                        data={dataNomCodeX}
                                    />;
                                default:
                                    // return <TableEachZone key={button.id} zoneText={button.text} tableData={mod_data_mock} isLoading={isLoading} columnVisibility={columnVisibilityEntryExit} />;
                                    return <TableEachZone
                                        key={button.id}
                                        zoneText={button.text}
                                        areaMaster={areaMaster}
                                        entryExitMaster={entryExitMaster}
                                        tableData={dataNomCodeX.nomination_version[0].nomination_row_json}
                                        tableHeader={dataNomCodeX.nomination_version[0].nomination_full_json}
                                        nomVersionData={dataNomCodeX.nomination_version[0]}
                                        isLoading={isLoading}
                                        columnVisibility={columnVisibilityEntryExit}
                                        tabEntry={filter_tab_entry}
                                        readOnly={dataNomCodeX.disabledFlag == true}
                                        tempData={tempData}
                                        setTempData={setTempData}
                                        tempDataConcept={tempDataConcept}
                                        setTempDataConcept={setTempDataConcept}
                                        setIsEdited={setIsEdited}

                                        isAfterGasDay={isAfterGasDay}
                                        isDisableAction={isDisableAction}

                                        dataNomCode={dataNomCodeX}
                                    />;
                            }
                        }
                        return null; // Render nothing if not active
                    })}
                </div>
            </div>
        </div>

        {(activeButton !== 2 && activeButton !== 3) && (
            <div className="flex h-auto gap-2 overflow-hidden">
                {/* Sidebar (15%) */}
                <div className="w-[15%] flex flex-col"></div>

            </div>
        )}

        <ModalComponent
            open={isModalErrorOpen}
            handleClose={() => {
                setModalErrorOpen(false);
                // if (resetForm) resetForm();
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

        <ModalComponent
            open={isModalSuccessOpen}
            handleClose={handleCloseModal}
            title="Success"
            description={
                <div>
                    <div className="text-center">
                        {`${modalSuccessMsg}`}
                    </div>
                </div>
            }
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

export default NomCodeView;