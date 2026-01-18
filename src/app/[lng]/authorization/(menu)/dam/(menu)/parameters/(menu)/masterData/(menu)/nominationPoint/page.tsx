"use client";
import { Button } from "@material-tailwind/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AddCircle } from "@mui/icons-material"
import TableNominationPoint from "./form/table";
import ModalComponent from "@/components/other/ResponseModal";
import { filterStartEndDate, filterStartEndDateInRange, findRoleConfigByMenuName, formatDateNoTime, formatNumberThreeDecimal, generateUserPermission, getContrastTextColor, toDayjs, toNumberGeneral } from '@/utils/generalFormatter';
import { InputSearch } from '@/components/other/SearchForm';
import { getService, postService, putService } from "@/utils/postService";
import ModalAction from "./form/modalAction";
import BtnExport from "@/components/other/btnExport";
import { useFetchMasters } from "@/hook/fetchMaster";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import PaginationComponent from "@/components/other/globalPagination";
import ModalHistory from "@/components/other/modalHistory";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import { useAppDispatch } from "@/utils/store/store";
import { fetchNominationPoint } from "@/utils/store/slices/nominationPointSlice";
import { fetchEntryExit } from "@/utils/store/slices/entryExitSlice";
import { fetchZoneMasterSlice } from "@/utils/store/slices/zoneMasterSlice";
import { fetchAreaMaster } from "@/utils/store/slices/areaMasterSlice";
import { fetchContractPoint } from "@/utils/store/slices/contractPointSlice";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { decryptData } from "@/utils/encryptionData";
import dayjs from "dayjs";
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import ModalViewContractPoint from "./form/modalViewContract";
import AppTable, { myCustomSortingByDateFn } from "@/components/table/AppTable";
import { ColumnDef, VisibilityState } from "@tanstack/react-table";
import BtnActionTable from "@/components/other/btnActionInTable";
import { Popover } from "@mui/material";
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import AdjustIcon from '@mui/icons-material/Adjust';
import getUserValue from "@/utils/getuserValue";

// Extend dayjs with the plugins
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
interface ClientProps {
  // params: {
  //     lng: string;
  // };
}

const ClientPage: React.FC<ClientProps> = () => {

  const todayStart = toDayjs().startOf('day')
  const todayEnd = toDayjs().add(1, 'day').startOf('day')

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
        const permission = findRoleConfigByMenuName('Nomination Point', userDT)
        setUserPermission(permission);
      }
    } catch (error) {
      // Failed to parse user_permission:
    }
  }

  // ############### REDUX DATA ###############
  const { entryExitMaster, zoneMaster, areaMaster, nominationPointData, contractPointData } = useFetchMasters();
  const [forceRefetch, setForceRefetch] = useState(true);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (forceRefetch || !entryExitMaster?.data) {
      dispatch(fetchEntryExit());
    }
    if (forceRefetch || !zoneMaster?.data) {
      dispatch(fetchZoneMasterSlice());
    }
    if (forceRefetch || !areaMaster?.data) {
      dispatch(fetchAreaMaster());
    }
    if (forceRefetch || !contractPointData?.data) {
      dispatch(fetchContractPoint());
    }
    if (forceRefetch || !nominationPointData?.data) {
      dispatch(fetchNominationPoint());
    }
    // Reset forceRefetch after fetching
    if (forceRefetch) {
      setForceRefetch(false); // Reset the flag after triggering the fetch
    }
    getPermission();
  }, [dispatch, nominationPointData, forceRefetch]); // Watch for forceRefetch changes

  useEffect(() => {
    if (contractPointData?.data) {
      const today = toDayjs().startOf('day')
      const activeContractPoint = contractPointData.data.filter((item: any) => (!!!item.contract_point_end_date || toDayjs(item.contract_point_end_date).isAfter(today)) && toDayjs(item.contract_point_start_date).isSameOrBefore(today))
    }
  }, [contractPointData]); // Watch for forceRefetch changes

  // ############### FIELD SEARCH ###############
  const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
  const [dataExport, setDataExport] = useState<any>([]);
  const [key, setKey] = useState(0);
  const [sNomPointId, setSNomPointId] = useState('');
  const [srchEntryExit, setSrchEntryExit] = useState('');
  const [srchZone, setSrchZone] = useState('');
  const [srchArea, setSrchArea] = useState('');
  const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
  const [srchEndDate, setSrchEndDate] = useState<Date | null>(null);

  const handleFieldSearch = () => {
    // const result = filterDataTableByDateRange(dataTable, srchStartDate, srchEndDate);
    const res_filtered_date: any = filterStartEndDate(dataTable, srchStartDate, srchEndDate);
    const result_2 = res_filtered_date?.filter((item: any) => {

      return (
        (sNomPointId ? item?.id == sNomPointId : true) &&
        (srchEntryExit ? item?.entry_exit_id == srchEntryExit : true) &&
        (srchZone ? item?.zone_id == srchZone : true) &&
        (srchArea ? item?.area_id == srchArea : true)
        // (srchStartDate ? formatSearchDate(item?.start_date) === formatSearchDate(srchStartDate) : true) &&
        // (srchEndDate ? formatSearchDate(item?.end_date) === formatSearchDate(srchEndDate) : true)
      );
    });
    setCurrentPage(1); // ตอน filter กลับไปหน้าแรก

    setFilteredDataTable(result_2);
  };

  const handleReset = () => {
    setSNomPointId('')
    setSrchEntryExit('')
    setSrchZone('')
    setSrchArea('')
    setSrchStartDate(null);
    setSrchEndDate(null);
    setFilteredDataTable(dataTable);
    setKey((prevKey) => prevKey + 1);
  };

  // ############### LIKE SEARCH ###############
  const handleSearch = (query: string) => {

    const filtered = dataTable.filter((item: any) => {
      const queryLower = query.toLowerCase().replace(/\s+/g, '')?.trim();
      return (
        item?.nomination_point?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
        item?.area?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
        item?.zone?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
        item?.customer_type?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
        item?.description?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
        item?.create_by_account?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) ||
        item?.create_by_account?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) || // เผื่อ search นามสกุล
        item?.create_by_account?.first_name && item?.create_by_account?.last_name && (item?.create_by_account?.first_name + item?.create_by_account?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) || // เผื่อ search ชื่อ - นามสกุล พร้อมกัน
        formatDateNoTime(item?.start_date)?.toLowerCase().includes(queryLower) ||
        formatDateNoTime(item?.end_date)?.toLowerCase().includes(queryLower) ||
        item?.entry_exit?.name?.toLowerCase().includes(queryLower) ||
        item?.contract_point?.contract_point?.toLowerCase().includes(queryLower) ||
        formatNumberThreeDecimal(item?.maximum_capacity).toString().toLowerCase().includes(queryLower) ||
        formatNumberThreeDecimal(item?.maximum_capacity).toString().toLowerCase().includes(formatNumberThreeDecimal(queryLower)) ||
        formatNumberThreeDecimal(item?.maximum_capacity)?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
        item?.maximum_capacity?.toString().toLowerCase().includes(queryLower)
      )
    }
    );
    setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
    setFilteredDataTable(filtered);
  };

  const [isModalOpen, setModalOpen] = useState(false);
  const handleOpenModal = () => setModalOpen(true);

  // ############### DATA TABLE ###############
  const [dataTable, setData] = useState<any>([]);
  const [dataCustType, setDataCustType] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resetForm, setResetForm] = useState<() => void | null>();

  const fetchData = async () => {
    try {
      const response: any = await getService(`/master/asset/nomination-point`);
      const response_cust_type: any = await getService(`/master/asset/customer-type`);
      const response_contract_code: any = await getService(`/master/asset/contract-code-for-point-and-nomination`);
      setDataCustType(response_cust_type);
      setData(response);
      setFilteredDataTable(response);
      setValidationContractList(response_contract_code)
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

  // const [csrfToken, setCsrfToken] = useState<any>(null);

  // ############# NEW MODAL CREATE/EDIT/VIEW  #############
  const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
  const handleCloseModal = () => setModalSuccessOpen(false);
  const [modalErrorMsg, setModalErrorMsg] = useState('');
  const [isModalErrorOpen, setModalErrorOpen] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | 'period'>();
  const [validationContractList, setValidationContractList] = useState<any[]>([]);
  const fdInterface: any = {
    nomination_point: '',
    description: '',
    entry_exit_id: '',
    contract_point_id: '',
    customer_type_id: '',
    zone_id: '',
    area_id: '',
    maximum_capacity: '',
    // start_date: new Date(),
    // end_date: new Date(),
    start_date: undefined,
    end_date: undefined,
    ref_id: null
  };

  const [formData, setFormData] = useState(fdInterface);

  const handleFormSubmit = async (data: any) => {

    if (formMode == "create") {
      data.ref_id = null
    } else if (formMode == "period") {
      // ปิดไว้เพราะส่ง free text
      // const filteredData = nominationPointData?.data?.filter((item: any) => item.id === data.ref_id);
      // data.nomination_point = filteredData[0]?.nomination_point
    }

    if (typeof data.end_date !== 'string' || data.end_date == 'Invalid Date') {
      data.end_date = null;
    }

    // data.maximum_capacity = parseInt(data.maximum_capacity)
    data.maximum_capacity = parseFloat(data.maximum_capacity)

    //handle m-n-relation
    if (data?.contract_point_id && Array.isArray(data.contract_point_id)) {
      data.contract_nomination_point = data.contract_point_id.map((id: any) => {
        return {
          nomination_point_id: selectedId,
          contract_point_id: id
        }
      })
      delete data.contract_point_id
    }

    switch (formMode) {
      case "create":
        const res_create = await postService('/master/asset/nomination-point-create', data);
        if (res_create?.response?.data?.status === 400 || res_create?.response?.status === 500) {
          // setFormOpen(false);
          setModalErrorMsg(res_create?.response?.data?.error ? res_create?.response?.data?.error : 'Something went wrong');
          setModalErrorOpen(true)
        } else {
          setFormOpen(false);
          setModalSuccessOpen(true);
          await fetchData();
          if (resetForm) resetForm(); // reset form
        }
        break;
      case "period":
        delete data.id

        const res_period = await postService('/master/asset/nomination-point-new-period', data);
        // setFormOpen(false);
        // setModalSuccessOpen(true);
        // if (res_period?.response?.data?.status === 400) {
        if (res_period?.response?.data?.status === 400 || res_period?.response?.status === 500) {
          // setFormOpen(false);
          // setModalErrorMsg(res_period?.response?.data?.error);
          setModalErrorMsg(res_period?.response?.data?.error ? res_period?.response?.data?.error : 'Something went wrong');
          setModalErrorOpen(true)
        } else {
          setFormOpen(false);
          setModalSuccessOpen(true);
          await fetchData();
          if (resetForm) resetForm(); // reset form
        }
        break;
      case "edit":
        delete data.nomination_point_id;
        // delete data.maximum_capacity;
        delete data.ref_id;
        // delete data.description;
        delete data.id;

        const res_edit = await putService(`/master/asset/nomination-point-edit/${selectedId}`, data);
        if (res_edit?.response?.data?.status === 400) {
          // setFormOpen(false);
          setModalErrorMsg(res_edit?.response?.data?.error);
          setModalErrorOpen(true)
        } else {
          setFormOpen(false);
          setModalSuccessOpen(true);
          await fetchData();
          if (resetForm) resetForm(); // reset form
        }
        break;
    }
  };

  const openCreateForm = (mode: any) => {
    setSelectedId(null);
    if (mode == "create") {
      setFormMode('create');
    } else {
      setFormMode('period');
    }
    setFormData(fdInterface);
    setFormOpen(true);
  };

  const openEditForm = (id: any) => {
    //  fetchDataDiv(id);
    setSelectedId(id);
    const filteredData = dataTable.find((item: any) => item.id === id);
    if (filteredData) {
      fdInterface.nomination_point = filteredData.nomination_point;
      fdInterface.description = filteredData.description;
      fdInterface.entry_exit_id = filteredData.entry_exit_id;
      fdInterface.contract_point_id = filteredData.contract_point_id;
      fdInterface.customer_type_id = filteredData.customer_type_id;
      fdInterface.zone_id = filteredData.zone_id;
      fdInterface.area_id = filteredData.area_id;
      fdInterface.ref_id = filteredData.ref_id;
      fdInterface.id = filteredData.id;
      fdInterface.maximum_capacity = filteredData.maximum_capacity;
      fdInterface.start_date = new Date(filteredData.start_date);
      fdInterface.end_date = filteredData.end_date ? new Date(filteredData.end_date) : null;
      fdInterface.contract_point_list = filteredData?.contract_point_list || []
    }
    setFormMode('edit');
    setFormData(fdInterface);
    setFormOpen(true);
  };

  const openViewForm = (id: any) => {
    const filteredData = dataTable.find((item: any) => item.id === id);
    if (filteredData) {
      fdInterface.nomination_point = filteredData.nomination_point;
      fdInterface.description = filteredData.description;
      fdInterface.entry_exit_id = filteredData.entry_exit_id;
      fdInterface.contract_point_id = filteredData.contract_point_id;
      fdInterface.customer_type_id = filteredData.customer_type_id;
      fdInterface.zone_id = filteredData.zone_id;
      fdInterface.area_id = filteredData.area_id;
      fdInterface.ref_id = filteredData.ref_id;
      fdInterface.id = filteredData.id;
      fdInterface.maximum_capacity = filteredData.maximum_capacity;
      fdInterface.start_date = new Date(filteredData.start_date);
      fdInterface.end_date = filteredData.end_date ? new Date(filteredData.end_date) : null;
      fdInterface.contract_point_list = filteredData?.contract_point_list || []

    }
    setFormMode('view');
    setFormData(fdInterface);
    setFormOpen(true);
  };

  const openDiv = (id: any, dataDiv: any, dataGroup: any) => {
  };

  // ############### MODAL CONTRACT POINT VIEW ###############
  const [mdContractView, setMdContractView] = useState<any>(false);
  const [dataContractModal, setDataContractModal] = useState<any>([]);

  const openContractViewModal = (id?: any, group_data?: any, data?: any) => {

    const filtered = dataTable?.find((item: any) => item.id === id);
    setDataContractModal(filtered)
    setMdContractView(true)
  };

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
      const response: any = await getService(`/master/account-manage/history?type=nomination-point&method=all&id_value=${id}`);

      const valuesArray = response.map((item: any) => item.value);

      let mappings = [
        // { key: "entry_exit.name", title: "Entry/Exit" },
        { key: "nomination_point", title: "Nomination Point" },
        // { key: "description", title: "Description" },
      ];
      let result = mappings.map(({ key, title }) => {
        const value = key.split('.').reduce((acc, part) => acc && acc[part], valuesArray[0]);
        return {
          title,
          value: value || "",
        };
      });

      setHeadData(result)
      setHistoryData(valuesArray);
      setHistoryOpen(true);
    } catch (err) {
      // setError(err.message);
    } finally {
      // setLoading(false);
    }
  }

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

  // const paginatedData = filteredDataTable?.slice(
  //   (currentPage - 1) * itemsPerPage,
  //   currentPage * itemsPerPage
  // );
  useEffect(() => {
    if (filteredDataTable && Array.isArray(filteredDataTable) && filteredDataTable?.length > 0) {
      setPaginatedData(filteredDataTable.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      ))
    }
    else {
      setPaginatedData([])
    }
  }, [filteredDataTable, currentPage, itemsPerPage])

  //   useEffect(() => {
  //     if (filteredDataTable) {
  //         setPaginatedData(filteredDataTable.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
  //         // setPaginatedData(filteredDataTable)
  //     }
  // }, [filteredDataTable, currentPage, itemsPerPage])


  // ############### COLUMN SHOW/HIDE ###############
  const initialColumns: any = [
    { key: 'entry_exit', label: 'Entry / Exit', visible: true },
    { key: 'zone', label: 'Zone', visible: true },
    { key: 'area', label: 'Area', visible: true },
    { key: 'contract_point', label: 'Contract Point', visible: true },
    { key: 'nom_point', label: 'Nomination Point', visible: true },
    { key: 'desc', label: 'Description', visible: true },
    { key: 'customer_type', label: 'Customer Type', visible: true },
    { key: 'max_cap', label: 'Maximum Capacity (MMSCFD)', visible: true },
    { key: 'start_date', label: 'Start Date', visible: true },
    { key: 'end_date', label: 'End Date', visible: true },
    // { key: 'create_by', label: 'Created by', visible: true },
    // { key: 'updated_by', label: 'Updated by', visible: true },
    { key: 'action', label: 'Action', visible: true }
  ];

  const initialColumnsHistory: any = [
    { key: 'entry_exit', label: 'Entry / Exit', visible: true },
    { key: 'zone', label: 'Zone', visible: true },
    { key: 'area', label: 'Area', visible: true },
    { key: 'contract_point', label: 'Contract Point', visible: true },
    { key: 'nomination_point', label: 'Nomination Point', visible: true },
    { key: 'description', label: 'Description', visible: true },
    { key: 'customer_type', label: 'Customer Type', visible: true },
    { key: 'maximum_capacity', label: 'Maximum Capacity (MMBTU/D)', visible: true },
    { key: 'start_date', label: 'Start Date', visible: true },
    { key: 'end_date', label: 'End Date', visible: true },
    { key: 'updated_by', label: 'Updated by', visible: true },
  ];

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [columnVisibility, setColumnVisibility] = useState<any>(
    Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))
  );

  const handleTogglePopover = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

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

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "entry_exit",
        header: "Entry / Exit",
        enableSorting: true,
        accessorFn: (row: any) => row?.entry_exit?.name || '',
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            <div className="flex justify-start items-center">
              <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.entry_exit?.color }}>
                {row?.entry_exit?.name}
              </div>
            </div>
          )
        }
      },
      {
        accessorKey: "zone",
        header: "Zone",
        enableSorting: true,
        accessorFn: (row: any) => row?.zone?.name || '',
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            <div className="flex justify-center items-center">
              {/* <div
                className="flex justify-center items-center rounded-full p-1 text-[#464255] text-center"
                style={{
                  backgroundColor: row?.zone?.color,
                  minWidth: '130px',
                  maxWidth: 'max-content',
                  wordWrap: 'break-word',
                  whiteSpace: 'normal',
                }}
              >
                {`${row?.zone?.name}`}
              </div> */}
              <div
                className="flex w-[140px] justify-center rounded-full p-1"
                style={{
                  backgroundColor: row?.zone?.color,
                  color: getContrastTextColor(row?.zone?.color), // Dynamic text color
                }}
              >
                {`${row?.zone?.name}`}
              </div>
            </div>
          )
        }
      },
      {
        accessorKey: "area",
        header: "Area",
        enableSorting: true,
        accessorFn: (row: any) => row?.area?.name || '',
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            <div className="flex justify-center items-center">
              {
                row?.area.entry_exit_id == 2 ?
                  <div
                    className="flex justify-center items-center rounded-full p-1 text-[#464255]"
                    style={{
                      backgroundColor: row?.area?.color,
                      width: '40px',
                      height: '40px',
                      color: getContrastTextColor(row?.area?.color),
                    }}
                  >
                    {`${row?.area?.name}`}
                  </div>
                  :
                  <div
                    className="flex justify-center items-center rounded-lg p-1 text-[#464255]"
                    style={{
                      backgroundColor: row?.area?.color,
                      width: '40px',
                      height: '40px',
                      color: getContrastTextColor(row?.area?.color),
                    }}
                  >
                    {`${row?.area?.name}`}
                  </div>
              }
            </div>
          )
        }
      },
      {
        accessorKey: "contract_point",
        header: "Contract Point",
        align: 'center',
        enableSorting: false,
        size: 160,
        cell: ({ row, getValue }) => {
          const original = row.original as any;
          const disabled = !userPermission?.f_view || (original?.daily_adjustment_group?.length ?? 0) === 0;

          const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            e.stopPropagation(); // กันไม่ให้ row‑click ซ้อนทับ
            openContractViewModal(
              original.id,
              original.daily_adjustment_group,
              original
            );
          };

          return (
            <div className="flex justify-center items-center">
              <div className="inline-flex items-center justify-center relative">
                <button
                  type="button"
                  disabled={!disabled}
                  onClick={handleClick}
                  className={`
                    pointer-events-auto 
                    flex items-center justify-center
                    px-[2px] py-[2px] rounded-md
                    border border-[#DFE4EA]
                    ${!disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-blue-600'}`}
                >
                  <AdjustIcon
                    sx={{
                      fontSize: 18,
                      color: disabled ? '#A0A0A0' : '#1473A1',
                      '&:hover': { color: '#ffffff' },
                    }}
                  />
                </button>

                <span className="px-2 text-[#464255]">
                  {original?.contract_point_list?.length ?? 0}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "nomination_point",
        header: "Nomination Point",
        enableSorting: true,
        accessorFn: (row: any) => row?.nomination_point || '',
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            <div>{row?.nomination_point ? row?.nomination_point : ''}</div>
          )
        }
      },
      {
        accessorKey: "desc",
        header: "Description",
        enableSorting: true,
        accessorFn: (row: any) => row?.description || '',
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            <div>{row?.description ? row?.description : ''}</div>
          )
        }
      },
      {
        accessorKey: "customer_type",
        header: "Customer Type",
        enableSorting: true,
        accessorFn: (row: any) => row?.customer_type?.name || '',
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            <div>{row?.customer_type?.name ? row?.customer_type?.name : ''}</div>
          )
        }
      },
      {
        accessorKey: "maximum_capacity",
        header: "Maximum Capacity (MMSCFD)",
        enableSorting: true,
        // accessorFn: (row: any) => formatNumberThreeDecimal(row?.maximum_capacity) || '',
        accessorFn: (row: any) => {
          const raw = row?.maximum_capacity;
          if (!raw) return '';

          const fixed = formatNumberThreeDecimal(raw); // เช่น 10,000.0000
          const noComma = fixed.replace(/,/g, '');    // เช่น 10000.0000
          const rounded = parseFloat(raw).toString(); // เช่น 10000

          return `${fixed} ${noComma} ${rounded}`;
        },
        sortingFn: (rowA, rowB, columnId) => {
          const a = toNumberGeneral(rowA.getValue(columnId));
          const b = toNumberGeneral(rowB.getValue(columnId));
          // จัดการค่า null ให้ไปท้ายๆ
          if (a === null && b === null) return 0;
          if (a === null) return 1;
          if (b === null) return -1;
          return a - b;
        },

        cell: (info) => {
          const row: any = info?.row?.original
          return (
            <div className="text-right">{row?.maximum_capacity ? formatNumberThreeDecimal(row?.maximum_capacity) : ''}</div>
          )
        }
      },
      {
        accessorKey: "start_date",
        header: "Start Date",
        enableSorting: true,
        accessorFn: (row: any) => formatDateNoTime(row?.start_date) || '',
        sortingFn: myCustomSortingByDateFn,
        // sortingFn: 'datetime', // recommended for date columns 
        // sortUndefined: -1,
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            <div className={`text-[#464255]`}>{row?.start_date ? formatDateNoTime(row?.start_date) : ''}</div>
          )
        }
      },
      {
        accessorKey: "end_date",
        header: "End Date",
        enableSorting: true,
        accessorFn: (row: any) => formatDateNoTime(row?.end_date) || '',
        sortingFn: myCustomSortingByDateFn,
        // sortingFn: 'datetime', // recommended for date columns 
        // sortUndefined: -1,
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            <div className={`text-[#0DA2A2]`}>{row?.end_date ? formatDateNoTime(row?.end_date) : ''}</div>
          )
        }
      },
      {
        accessorKey: "action",
        id: 'actions',
        header: "Action",
        align: 'center',
        enableSorting: false,
        cell: (info) => {
          const row: any = info?.row?.original;
          return (
            <BtnActionTable
              togglePopover={togglePopover}
              row_id={row?.id}
              disable={userPermission?.f_view == true && userPermission?.f_edit == true ? false : true}
            />
          )
        }
      },
    ]
    , [filteredDataTable, user_permission, userPermission]
  )

  const [tk, settk] = useState(false);

  const togglePopover = (id: any, anchor: any) => {
    if (openPopoverId === id) {
      setOpenPopoverId(null); // Close the popover if it's already open
      setAnchorPopover(null)
    } else {
      setOpenPopoverId(id); // Open the popover for the clicked row
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

  const renderPermission: any = () => {
    let permission: any = undefined;
    try {
      const updatedUserPermission = generateUserPermission(user_permission);
      permission = updatedUserPermission;
    } catch (error) {
      // Failed to parse user_permission:
    }

    return permission
  }

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

  const toggleMenu = (mode: any, id: any) => {
    switch (mode) {
      case "view":
        openViewForm(id);
        setOpenPopoverId(null); // close popover
        setAnchorPopover(null)
        break;
      case "edit":
        openEditForm(id);
        setOpenPopoverId(null);
        setAnchorPopover(null)
        break;
      case "history":
        openHistoryForm(id);
        setOpenPopoverId(null);
        setAnchorPopover(null)
        break;
    }
  }

  return (
    <div className=" space-y-2">
      <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
        <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

          <InputSearch
            id="searchEntryExit"
            label="Entry/Exit"
            type="select"
            value={srchEntryExit}
            onChange={(e) => setSrchEntryExit(e.target.value)}
            options={entryExitMaster?.data?.map((item: any) => ({
              value: item.id.toString(),
              label: item.name
            }))}
          />

          <InputSearch
            id="searchZoneMaster"
            label="Zone"
            type="select"
            value={srchZone}
            onChange={(e) => setSrchZone(e.target.value)}
            options={zoneMaster?.data?.filter((item: any) => srchEntryExit ? item?.entry_exit?.id == srchEntryExit : item?.entry_exit?.id !== null)?.map((item: any) => ({
              value: item.id.toString(),
              label: item.name
            }))}
          />

          <InputSearch
            id="searchArea"
            label="Area"
            type="select"
            value={srchArea}
            onChange={(e) => setSrchArea(e.target.value)}
            options={areaMaster?.data?.filter((item: any) =>
              srchEntryExit && srchZone ? item?.entry_exit?.id == srchEntryExit && item?.zone?.id == srchZone :
                srchEntryExit || srchZone ? item?.entry_exit?.id == srchEntryExit || item?.zone?.id == srchZone :
                  item !== null)?.map((item: any) => (
                    {
                      value: item.id.toString(),
                      label: item.name
                    }))}
          />

          <InputSearch
            id="searchNomPoint"
            label="Nomination Point"
            type="select"
            value={sNomPointId}
            onChange={(e) => setSNomPointId(e.target.value)}
            // options={nominationPointData?.data?.map((item: any) => ({
            //   value: item.id.toString(),
            //   label: item.nomination_point
            // }))}
            options={nominationPointData?.data
              ?.filter((item: any) => srchArea === '' || item.area.id.toString() === srchArea) // ถ้าไม่ได้กด search area ไม่ต้องกรอง
              .map((item: any) => ({
                value: item.id.toString(),
                label: item.nomination_point,
              }))
            }
          />

          <DatePickaSearch
            key={"start" + key}
            label="Start Date"
            placeHolder="Select Start Date"
            allowClear
            onChange={(e: any) => setSrchStartDate(e ? e : null)}
          />

          <DatePickaSearch
            key={"end" + key}
            label="End Date"
            placeHolder="Select End Date"
            allowClear
            onChange={(e: any) => setSrchEndDate(e ? e : null)}
          />

          <BtnSearch handleFieldSearch={handleFieldSearch} />
          <BtnReset handleReset={handleReset} />
        </aside>

        <aside className="mt-auto pl-2">
          <div className="flex gap-2">
            {
              userPermission?.f_create && <>
                <Button className="flex items-center justify-center gap-3 px-2 h-[40px] w-[140px] bg-[#36B1AB] font-light normal-case" onClick={() => openCreateForm('create-period')}>
                  <span>{`New Period`}</span>
                  <AddCircle style={{ fontSize: "16px" }} />
                </Button>

                <Button className="flex items-center justify-center gap-3 px-2 h-[40px] w-[120px] bg-[#00ADEF] font-light" onClick={() => openCreateForm('create')}>
                  <span className="font-light normal-case">{`New`}</span>
                  <AddCircle style={{ fontSize: "16px" }} />
                </Button>
              </>
            }
          </div>
        </aside>
      </div>

      {/* ================== NEW TABLE ==================*/}
      <AppTable
        data={filteredDataTable}
        columns={columns}
        isLoading={isLoading}
        exportBtn={
          <BtnExport
            textRender={"Export"}
            data={dataExport}
            path="dam/nomination-point"
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

      <ModalAction
        mode={formMode}
        data={formData}
        open={formOpen}
        dataTable={dataTable}
        // zoneMasterData={zoneMaster?.data}
        // areaMasterData={areaMaster?.data}
        zoneMasterData={filterStartEndDateInRange(zoneMaster?.data)}
        areaMasterData={filterStartEndDateInRange(areaMaster?.data)}
        entryExitMasterData={entryExitMaster?.data}
        contractPointData={contractPointData?.data}
        nominationPointData={dataTable?.filter((item: any) => {
          let startDate: dayjs.Dayjs | undefined
          let endDate: dayjs.Dayjs | undefined
          try {
            if (item?.start_date) {
              startDate = toDayjs(item.start_date)
              if (!startDate.isValid()) {
                startDate = undefined
              }
            }
          } catch (error) {
            startDate = undefined
          }
          try {
            if (item?.end_date) {
              endDate = toDayjs(item.end_date)
              if (!endDate.isValid()) {
                endDate = undefined
              }
            }
          } catch (error) {
            endDate = undefined
          }
          return item?.nomination_point, (startDate?.isSameOrBefore(todayStart) || false) && (endDate ? endDate.isAfter(todayEnd) : true)
        })}
        validationContractList={validationContractList}
        dataCustType={dataCustType}
        onClose={() => {
          setFormOpen(false);
          if (resetForm) {
            setTimeout(() => {
              resetForm();
              setFormData(null);
            }, 300);
          }
        }}
        onSubmit={handleFormSubmit}
        setResetForm={setResetForm}
      />

      <ModalComponent
        open={isModalSuccessOpen}
        handleClose={handleCloseModal}
        title="Success"
        description="Nomination point has been added."
      />

      <ModalComponent
        open={isModalErrorOpen}
        handleClose={() => {
          setModalErrorOpen(false);
          // if (resetForm) resetForm();
        }}
        title="Failed"
        description={
          <div>
            {
              modalErrorMsg?.split('<br/>').length > 1 ?
                <ul className="text-start list-disc">
                  {
                    modalErrorMsg.split('<br/>').map((item, index) => {
                      return (
                        <li key={index}>{item}</li>
                      )
                    })
                  }
                </ul>
                :
                <div className="text-center">
                  {`${modalErrorMsg}`}
                </div>
            }
          </div>
        }
        stat="error"
      />

      <ModalHistory
        open={historyOpen}
        handleClose={handleCloseHistoryModal}
        tableType="nomination-point"
        title="History"
        data={historyData}
        head_data={headData}
        initialColumns={initialColumnsHistory}
        userPermission={userPermission}
      />

      <ModalViewContractPoint
        data={dataContractModal}
        open={mdContractView}
        onClose={() => {
          setMdContractView(false);
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
              userPermission?.f_view && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("view", openPopoverId) }}><RemoveRedEyeOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`View`}</li>
            }
            {
              userPermission?.f_edit && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("edit", openPopoverId) }}><EditOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`Edit`}</li>
            }
            {
              userPermission?.f_view && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("history", openPopoverId) }}><RestoreOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`History`}</li>
            }
          </ul>
        </div>
      </Popover>
    </div>
  );
};

export default ClientPage;