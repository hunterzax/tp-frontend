"use client";
import { useEffect, useState } from "react";
import { Tune } from "@mui/icons-material";
import {
  findRoleConfigByMenuName,
  formatNumberThreeDecimal,
  formatNumberThreeDecimalNoComma,
  generateUserPermission,
  getCurrentWeekSundayYyyyMmDd,
  toDayjs,
} from "@/utils/generalFormatter";
import { InputSearch } from "@/components/other/SearchForm";
import SearchInput from "@/components/other/searchInput";
import { getService } from "@/utils/postService";
import BtnExport from "@/components/other/btnExport";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import getUserValue from "@/utils/getuserValue";
import ModalComponent from "@/components/other/ResponseModal";
import { decryptData } from "@/utils/encryptionData";
import { Tab, Tabs } from "@mui/material";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import { useForm } from "react-hook-form";
import { GeneralTable } from "@/components/table/GeneralTable";
import { ColumnDef, Row } from "@tanstack/react-table";
import { QualityPlanningData } from "@/app/types";
import { table_sort_header_style } from "@/utils/styles";
import { dayinWeek } from "@/utils/date/week";
import { mock_data_2 } from "./form/mockData";
import { myCustomSortingByDateFn } from "@/components/table/AppTable";
import { useSearchParams } from "next/navigation";
import dayjs from 'dayjs';

interface ClientProps {
    // params: {
    //     lng: string;
    // };
}

const ClientPage: React.FC<ClientProps> = () => {

  // route มาจาก nomination dashboard
  const searchParams = useSearchParams();
  const filter_gas_day_from_somewhere_else: any = searchParams.get("filter_gas_day");

  // useEffect(() => {
  //   if (filter_gas_day_from_somewhere_else) {
  //     // handleFieldSearchOnRoute(filter_gas_day_from_somewhere_else)
  //     // setSrchStartDate(dayjs(filter_gas_day_from_somewhere_else, 'YYYY-MM-DD').toDate)
  //   }
  // }, [filter_gas_day_from_somewhere_else])

  const { register, setValue, reset, formState: { errors }, watch, getValues, } = useForm<any>();

  useEffect(() => {
    const storedDashboard = localStorage.getItem(
      "nom_dashboard_route_mix_quality_obj"
    );
    const dashboardObject = storedDashboard ? JSON.parse(storedDashboard) : null;

    if (dashboardObject !== null) {
      // set วันที่ช่อง filter Gas Day
      let formattedGasDay = new Date(
        toDayjs(dashboardObject?.gas_day).format("YYYY-MM-DD")
      );
      setSrchStartDate(formattedGasDay);
      setDisplayGasDay(formattedGasDay);
      setIsSearch(true);
      if (dashboardObject.tab == "weekly") {
        setTabIndex(1);
      }
      localStorage.removeItem("nom_dashboard_route_mix_quality_obj");
    }
    setValue("filter_simulation", true);
  }, []);

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
        const permission = findRoleConfigByMenuName('Quality Evaluation', userDT)
        setUserPermission(permission);
      }
    } catch (error) {
      // Failed to parse user_permission:
    }
  }

  useEffect(() => {
    getPermission()
  }, [])

  // ############### FIELD SEARCH ###############
  const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
  const [key, setKey] = useState(0);
  const [isResetClick, setIsResetClick] = useState<boolean>(false);

  const [srchContractCode, setSrchContractCode] = useState<any>([]);
  const [srchStartDate, setSrchStartDate] = useState<Date>(filter_gas_day_from_somewhere_else ? dayjs(filter_gas_day_from_somewhere_else).toDate() : toDayjs().add(1, "day").toDate()); // วันที่ใช้ filter ข้อมูล default วันพรุ่งนี้

  const [displayGasDay, setDisplayGasDay] = useState<Date | null>(null); // วันที่แสดงใน datepicker
  const [displayGasDayInTabWeekly, setDisplayGasDayInTabWeekly] = useState<Date | undefined | null>(null); // วันที่แสดงใน tab weekly

  const [displaySrchContractCode, setDisplaySrchContractCode] = useState<any>([]);
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);

  const handleFieldSearch = async (param?: { dataToFilter?: QualityPlanningData[] }) => {
    setDisplayGasDayInTabWeekly(srchStartDate);

    setIsLoading(false)

    let url = `/master/quality-evaluation`;
    const response: any = await getService(url);

    // ถ้าเจอ parameter ที่ไม่ใช่ SG เพิ่มคีย์ "unit" แล้ว value คือ 'BTU/SCF'
    // ถ้าไม่ใช่ เพิ่มคีย์ unit แล้ว value เป็น ''
    const dailyWithUnit = response?.newDaily?.map((item: any) => ({
      ...item,
      unit: item.parameter == "SG" ? "" : "BTU/SCF"
    }));

    const weeklyWithUnit = response?.newWeekly?.map((item: any) => ({
      ...item,
      unit: item.parameter == "SG" ? "" : "BTU/SCF"
    }));

    setDataDailyOriginal(dailyWithUnit);
    setDataWeeklyOriginal(weeklyWithUnit);

    // let dataToFilter = (param?.dataToFilter?.length > 0 || param?.dataToFilter !== undefined) ? param?.dataToFilter
    //   : tabIndex === 0
    //     ? dailyWithUnit
    //     : weeklyWithUnit;

    const dataToFilter =
      Array.isArray(param?.dataToFilter) && param.dataToFilter.length > 0
        ? param.dataToFilter
        : tabIndex === 0
          ? dailyWithUnit
          : weeklyWithUnit;

    // const localDate = toDayjs(srchStartDate).tz("Asia/Bangkok").format("DD/MM/YYYY");
    const localDate = filter_gas_day_from_somewhere_else && !isFirstTime ? dayjs(filter_gas_day_from_somewhere_else, 'YYYY-MM-DD').format('DD/MM/YYYY') : toDayjs(srchStartDate).tz("Asia/Bangkok").format("DD/MM/YYYY");

    const queryLower = searchQuery?.replace(/\s+/g, "")?.toLowerCase()?.trim();
    const result_2 = dataToFilter?.filter((item: any) => {
      return (
        (srchContractCode?.length > 0 ? srchContractCode.includes(`${item?.contractCodeId?.id}`) : true) &&
        // (localDate !== "Invalid Date" ? localDate == item?.gasday : true) &&
        ((localDate !== "Invalid Date" && !Array.isArray(param?.dataToFilter)) ? localDate == item?.gasday : true) &&
        (
          queryLower ?
            (
              item?.gasday?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
              item?.zone?.name?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
              item?.area?.name?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
              item?.parameter?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||

              item?.unit?.toLowerCase().replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||

              item?.sunday?.value?.toString().replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
              item?.monday?.value?.toString().replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
              item?.tuesday?.value?.toString().replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
              item?.wednesday?.value?.toString().replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
              item?.thursday?.value?.toString().replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
              item?.friday?.value?.toString().replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
              item?.saturday?.value?.toString().replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
              item?.valueBtuScf?.toString().replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||

              formatNumberThreeDecimal(item?.sunday?.value)?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
              formatNumberThreeDecimal(item?.monday?.value)?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
              formatNumberThreeDecimal(item?.tuesday?.value)?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
              formatNumberThreeDecimal(item?.wednesday?.value)?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
              formatNumberThreeDecimal(item?.thursday?.value)?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
              formatNumberThreeDecimal(item?.friday?.value)?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
              formatNumberThreeDecimal(item?.saturday?.value)?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
              formatNumberThreeDecimal(item?.valueBtuScf)?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||

              formatNumberThreeDecimalNoComma(item?.sunday?.value)?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
              formatNumberThreeDecimalNoComma(item?.monday?.value)?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
              formatNumberThreeDecimalNoComma(item?.tuesday?.value)?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
              formatNumberThreeDecimalNoComma(item?.wednesday?.value)?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
              formatNumberThreeDecimalNoComma(item?.thursday?.value)?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
              formatNumberThreeDecimalNoComma(item?.friday?.value)?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
              formatNumberThreeDecimalNoComma(item?.saturday?.value)?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
              formatNumberThreeDecimalNoComma(item?.valueBtuScf)?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower)
            ) : true
        )
      );
    });

    setIsSearch(true);
    setFilteredDataTable(result_2);

    setTimeout(() => {
      setIsLoading(true)
    }, 300);
  }



  const handleFieldSearchTabChange = async (date_to_filter?: any) => {
    setIsLoading(false)

    let url = `/master/quality-evaluation`;
    const response: any = await getService(url);

    // ถ้าเจอ parameter ที่ไม่ใช่ SG เพิ่มคีย์ "unit" แล้ว value คือ 'BTU/SCF'
    // ถ้าไม่ใช่ เพิ่มคีย์ unit แล้ว value เป็น ''
    const dailyWithUnit = response?.newDaily?.map((item: any) => ({
      ...item,
      unit: item.parameter == "SG" ? "" : "BTU/SCF"
    }));

    const weeklyWithUnit = response?.newWeekly?.map((item: any) => ({
      ...item,
      unit: item.parameter == "SG" ? "" : "BTU/SCF"
    }));

    const dataToFilter = tabIndex === 0 ? dailyWithUnit : weeklyWithUnit;
    // const localDate = toDayjs(date_to_filter).tz("Asia/Bangkok").format("DD/MM/YYYY");
    const localDate = filter_gas_day_from_somewhere_else && !isFirstTime ? dayjs(filter_gas_day_from_somewhere_else, 'YYYY-MM-DD').format('DD/MM/YYYY') : toDayjs(date_to_filter).tz("Asia/Bangkok").format("DD/MM/YYYY");
    const result_2 = dataToFilter?.filter((item: any) => {
      return (
        (srchContractCode?.length > 0 ? srchContractCode.includes(`${item?.contractCodeId?.id}`) : true) &&
        (localDate !== "Invalid Date" ? localDate == item?.gasday : true)
      );
    });

    setIsSearch(true);
    setFilteredDataTable(result_2);

    setTimeout(() => {
      setIsLoading(true)
    }, 300);

    // MOCK
    // setFilteredDataTable(mock_data_2?.newDaily);

  };

  // เรียกใช้ตอน route มาจาก nom dashboard
  // const handleFieldSearchOnRoute = async (date_filter: any) => {
  //   const gas_day_filter = dayjs(date_filter).format("DD/MM/YYYY");

  //   let url = `/master/quality-evaluation`;
  //   const response: any = await getService(url);

  //   const result_3 = response?.newDaily?.filter((item: any) => {
  //     return (
  //       (gas_day_filter ? gas_day_filter == item?.gasday : true)
  //     );
  //   });

  //   setFilteredDataTable(result_3);
  // };


  const handleReset = async () => {
    // const dataToFilter = tabIndex === 0 ? dataDailyOriginal : dataTable;
    // setFilteredDataTable(dataToFilter);
    setIsLoading(false)
    setIsCheckAll(true);
    setDisplaySrchContractCode([]);
    setSrchContractCode([]);
    setIsSearch(false);
    let sun_day_fun_day = new Date(getCurrentWeekSundayYyyyMmDd());


    if (tabIndex === 0) {
      // Daily: filter gasDay = tomorrow
      setSrchStartDate(toDayjs().add(1, "day").toDate());
      setDisplayGasDay(toDayjs().add(1, "day").toDate());
      setConditionColumns({ gasday: true, valueBtuScf: true });
    } else {
      // ต้อง filter หา sunday.date == วันอาทิตย์ของสัปดาห์นี้

      setSrchStartDate(sun_day_fun_day);
      setDisplayGasDay(sun_day_fun_day);
      // setDisplayGasDayInTabWeekly(sun_day_fun_day);
      setConditionColumns({ gasday: false, valueBtuScf: false });
    }

    await fetchData(sun_day_fun_day);

    setTimeout(() => {
      setIsLoading(true)
    }, 400);

    setKey((prevKey) => prevKey + 1);
  };


  // ############### DATA TABLE ###############
  const [tabIndex, setTabIndex] = useState(
    localStorage.getItem("nom_dashboard_route_mix_quality_obj") ? JSON.parse(localStorage.getItem("nom_dashboard_route_mix_quality_obj") || "{}").tab == "weekly" ? 1 : 0 : 0
  ); // 0=daily, 1=weekly
  const [dataTable, setData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSearch, setIsSearch] = useState<boolean>(false);
  const [resetForm, setResetForm] = useState<() => void | null>();
  const [dataDailyOriginal, setDataDailyOriginal] = useState<any>([]);
  const [dataWeeklyOriginal, setDataWeeklyOriginal] = useState<any>([]);
  const [dataContractOriginal, setDataContractOriginal] = useState<any>([]);
  const [dataContract, setDataContract] = useState<any>([]);

  const fetchDataWithParams = async () => {

    try {
      let url = `/master/quality-evaluation`;

      if (filter_gas_day_from_somewhere_else) {
        const startDate = toDayjs(filter_gas_day_from_somewhere_else);
        url += `?gasDay=${startDate.isValid() ? startDate.format("YYYY-MM-DD") : filter_gas_day_from_somewhere_else}`;
      }
      const response: any = await getService(url);
      // setDataDailyOriginal(response?.newDaily);
      // setDataWeeklyOriginal(response?.newWeekly);

      // ถ้าเจอ parameter ที่ไม่ใช่ SG เพิ่มคีย์ "unit" แล้ว value คือ 'BTU/SCF'
      // ถ้าไม่ใช่ เพิ่มคีย์ unit แล้ว value เป็น ''
      const dailyWithUnit = response?.newDaily?.map((item: any) => ({
        ...item,
        unit: item.parameter == "SG" ? "" : "BTU/SCF"
      }));

      const weeklyWithUnit = response?.newWeekly?.map((item: any) => ({
        ...item,
        unit: item.parameter == "SG" ? "" : "BTU/SCF"
      }));

      // setDataDailyOriginal(response?.newDaily);
      setDataDailyOriginal(dailyWithUnit);
      setDataWeeklyOriginal(weeklyWithUnit);

      // DATA CONTRACT CODE
      const data_contract_code_de_dup = Array.from(
        new Map(dailyWithUnit?.map((item: any) => [item.contractCodeId, { contractCodeId: item.contractCodeId }])).values()
      );
      setDataContract(data_contract_code_de_dup);
      setDataContractOriginal(data_contract_code_de_dup)

      handleFieldSearch({
        dataToFilter: tabIndex === 0 ? response?.newDaily : response?.newWeekly
      });

      setTimeout(() => {
        setIsLoading(true);
      }, 500);
    } catch (err) {
      setData([]);
      setFilteredDataTable([]);

      setTimeout(() => {
        setIsLoading(true);
      }, 500);
    } finally {
      // setLoading(false);
    }

  }

  const fetchData = async (reset_date?: any) => {

    if (reset_date) {
      setDisplayGasDay(reset_date);
      setDisplayGasDayInTabWeekly(reset_date);
    }

    try {
      let url = `/master/quality-evaluation`;
      if (srchStartDate) {
        const startDate = toDayjs(srchStartDate);
        url += `?gasDay=${startDate.isValid() ? startDate.format("YYYY-MM-DD") : srchStartDate}`;
      }

      const response: any = await getService(url);
      // setDataDailyOriginal(response?.newDaily);
      // setDataWeeklyOriginal(response?.newWeekly);

      // ถ้าเจอ parameter ที่ไม่ใช่ SG เพิ่มคีย์ "unit" แล้ว value คือ 'BTU/SCF'
      // ถ้าไม่ใช่ เพิ่มคีย์ unit แล้ว value เป็น ''
      const dailyWithUnit = response?.newDaily?.map((item: any) => ({
        ...item,
        unit: item.parameter == "SG" ? "" : "BTU/SCF"
      }));

      const weeklyWithUnit = response?.newWeekly?.map((item: any) => ({
        ...item,
        unit: item.parameter == "SG" ? "" : "BTU/SCF"
      }));

      // setDataDailyOriginal(response?.newDaily);
      setDataDailyOriginal(dailyWithUnit);
      setDataWeeklyOriginal(weeklyWithUnit);


      // DATA CONTRACT CODE
      const data_contract_code_de_dup = Array.from(
        new Map(dailyWithUnit?.map((item: any) => [item.contractCodeId, { contractCodeId: item.contractCodeId }])).values()
      );
      setDataContract(data_contract_code_de_dup);
      setDataContractOriginal(data_contract_code_de_dup)

      // handleFieldSearch({
      //   dataToFilter: tabIndex === 0 ? response?.newDaily : response?.newWeekly
      // });
      handleFieldSearch();

      setTimeout(() => {
        setIsLoading(true);
      }, 500);
    } catch (err) {
      setData([]);
      setFilteredDataTable([]);

      setTimeout(() => {
        setIsLoading(true);
      }, 500);
    } finally {
      // setLoading(false);
    }

    setTimeout(() => {
      setIsLoading(true);
    }, 300);
  };

  useEffect(() => {
    fetchData();
  }, [resetForm]);

  useEffect(() => {
    let sun_day_fun_day = new Date(getCurrentWeekSundayYyyyMmDd());

    let date_to_filter: any
    let datatofiler: any = []

    if (tabIndex === 0) {
      // Daily: filter gasDay = tomorrow
      const tomorrow = toDayjs().add(1, "day");
      setSrchStartDate(tomorrow.toDate());
      setDisplayGasDay(tomorrow.toDate());
      setConditionColumns({ gasday: true, valueBtuScf: true });

      date_to_filter = tomorrow.toDate()
    } else if (tabIndex == 1) {
      // ต้อง filter หา sunday.date == วันอาทิตย์ของสัปดาห์นี้

      setSrchStartDate(sun_day_fun_day);
      setDisplayGasDay(sun_day_fun_day);
      setDisplayGasDayInTabWeekly(sun_day_fun_day);
      setConditionColumns({ gasday: false, valueBtuScf: false });

      date_to_filter = sun_day_fun_day

    }
    // fetchData();
    handleFieldSearchTabChange(date_to_filter);

    setValue("filter_simulation", true);
  }, [tabIndex]);

  // ############# NEW MODAL CREATE/EDIT/VIEW  #############
  // แปลงค่าให้เป็น number หรือ null (รองรับ "0", มีคอมมา ฯลฯ)
  const toNumberOrNull = (v: unknown): number | null => {
    if (v === null || v === undefined || v === '') return null;
    const n = typeof v === 'number' ? v : Number(String(v).replace(/,/g, ''));
    return Number.isFinite(n) ? n : null;
  };

  const myCustomSortingByDateFnK = (rowA: any, rowB: any, columnId: any) => {
    // ดึงค่าจริงจาก accessor (สำหรับคอลัมน์ day จะเป็น object { value: ... })
    const a = (rowA.getValue(columnId) as any)?.value ?? rowA.original?.[columnId]?.value;
    const b = (rowB.getValue(columnId) as any)?.value ?? rowB.original?.[columnId]?.value;

    const na = toNumberOrNull(a);
    const nb = toNumberOrNull(b);

    // เท่ากัน (รวมถึงทั้งคู่ null) → ไม่เปลี่ยนลำดับ
    if (na === nb) return 0;

    // ค่าว่างไปท้าย (ตอน ASC)
    if (na === null) return 1;
    if (nb === null) return -1;

    // เปรียบเทียบตัวเลขตรง ๆ (TanStack จะกลับสัญญาณเองตอน DESC)
    return na - nb;
  };


  // ############# NEW MODAL CREATE/EDIT/VIEW  #############
  const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
  const [modalModalSuccessMsg, setModalSuccessMsg] = useState("");
  const handleCloseModal = () => setModalSuccessOpen(false);
  const [modalErrorMsg, setModalErrorMsg] = useState("");
  const [isModalErrorOpen, setModalErrorOpen] = useState(false);

  // ############### COLUMN SHOW/HIDE ###############

  // กำหนดคอลัมน์ของตาราง
  const columns: ColumnDef<QualityPlanningData>[] = [
    // {
    //   accessorKey: "gasday",
    //   header: "Gas Day",
    //   size: 120,
    // },
    {
      accessorKey: "gasday",
      header: "Gas Day",
      enableSorting: true,
      accessorFn: (row: any) => row?.gasday || '',
      sortingFn: myCustomSortingByDateFn,
      // sortUndefined: -1,
      cell: (info) => {
        const row: any = info?.row?.original
        return (<div>{row?.gasday ? row?.gasday : null}</div>)
      }
    },
    {
      accessorKey: "zone.name",
      header: "Zone",
      size: 120,
      cell: ({ row }) => (
        <div
          className="flex  w-[100px] justify-center rounded-full p-1 text-[#464255]"
          style={{ backgroundColor: row.original.zone?.color }}
        >
          {row.original.zone?.name}
        </div>
      ),
    },
    {
      accessorKey: "area.name",
      header: "Area",
      size: 100,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <div
            className={`flex justify-center items-center p-1 text-[#464255] ${row.original.area?.entry_exit_id === 2
              ? "rounded-full"
              : "rounded-lg"
              }`}
            style={{
              backgroundColor: row.original.area?.color,
              width: "40px",
              height: "40px",
            }}
          >
            {row.original.area?.name}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "parameter",
      header: "Parameter",
      size: 120,
    },
    // {
    //   accessorKey: 'unit',
    //   header: 'Unit',
    //   size: 120,
    //   cell: (info) => {
    //     const row: any = info?.row?.original
    //     let unit_show = row?.parameter == "SG" ? '' : 'BTU/SCF'
    //     return (<div>{unit_show}</div>)
    //   }
    // },
    {
      accessorKey: 'unit',
      header: 'Unit',
      size: 120,
      accessorFn: (row: any) => {
        // ค่านี้จะถูกใช้ตอน sort/search
        return row?.parameter === "SG" ? '' : 'BTU/SCF'
      },
      cell: (info) => {
        const row: any = info?.row?.original
        let unit_show = row?.parameter === "SG" ? '' : 'BTU/SCF'
        return <div>{unit_show}</div>
      },
      enableSorting: true,
    },
    {
      accessorKey: "valueBtuScf",
      header: "Value (BTU/SCF)",
      size: 120,
      sortDescFirst: false,
      cell: ({
        getValue,
        row,
      }: {
        getValue: () => any;
        row: Row<QualityPlanningData>;
      }) => {
        const value = getValue();
        return (
          <span
            className={`${isOutOfRange(value, row) ? "text-[#ED1B24]" : "text-[#464255]"}`}
          >
            {value ? formatNumberThreeDecimal(value) : ""}
          </span>
        );
      },
    },
    ...dayinWeek.map((day, index) => {
      return {
        accessorKey: day,
        header: () => {
          let dayName = "";
          if (typeof day !== "string" || day.length === 0) {
            dayName = day; // Handle non-string or empty input
          }
          dayName = day.charAt(0).toUpperCase() + day.slice(1);
          // const currentDate = toDayjs(displayGasDayInTabWeekly).add(index, "day");

          let currentDate
          if (filter_gas_day_from_somewhere_else) {
            let to_day_js = toDayjs(filter_gas_day_from_somewhere_else).toDate()
            currentDate = toDayjs(filter_gas_day_from_somewhere_else).add(index, "day");
          } else {
            currentDate = toDayjs(displayGasDayInTabWeekly).add(index, "day");
          }

          let formattedDate = "";
          if (currentDate.isValid()) {
            formattedDate = currentDate.format("DD/MM/YYYY");
          }

          return (
            <div className={`${table_sort_header_style} text-center`}>
              <div>{dayName}</div>
              <div>{formattedDate}</div>
            </div>
          );
        },
        size: 120,
        enableSorting: true,
        sortDescFirst: false,
        cell: ({
          getValue,
          row,
        }: {
          getValue: () => any;
          row: Row<QualityPlanningData>;
        }) => {
          const value = getValue()?.value;
          return (
            <div className="w-full flex justify-end">
              <span className={`${isOutOfRange(value, row) ? "text-[#ED1B24]" : "text-[#464255]"}`}>
                {value !== null && value !== undefined ? formatNumberThreeDecimal(value) : ""}
              </span>
            </div>
          );
        },
        sortingFn: myCustomSortingByDateFnK,
      };
    }),
  ];

  const isOutOfRange = (value: any, row: Row<QualityPlanningData>) => {
    const parameter = row?.original.parameter || "";
    const zoneMasterQuality = row?.original.zone?.zone_master_quality || [];
    if (zoneMasterQuality && zoneMasterQuality.length > 0) {
      if (parameter === "HV") {
        const minHV = zoneMasterQuality[0]?.v2_sat_heating_value_min;
        const maxHV = zoneMasterQuality[0]?.v2_sat_heating_value_max;
        return value ? value < minHV || value > maxHV : false;
      }

      if (parameter === "WI") {
        const minWI = zoneMasterQuality[0]?.v2_wobbe_index_min;
        const maxWI = zoneMasterQuality[0]?.v2_wobbe_index_max;
        return value ? value < minWI || value > maxWI : false;
      }
    }
    return false;
  };

  const initialColumns: any = [
    {
      key: "gasday",
      label: tabIndex == 0 ? "Gas Day" : "Gas Week",
      visible: true,
    },
    { key: "zone_name", label: "Zone", visible: true },
    { key: "area_name", label: "Area", visible: true },
    { key: "parameter", label: "Parameter", visible: true },
    { key: "valueBtuScf", label: "Value (BTU/SCF)", visible: true },
    { key: 'sunday', label: 'Sunday', visible: true },
    { key: 'monday', label: 'Monday', visible: true },
    { key: 'tuesday', label: 'Tuesday', visible: true },
    { key: 'wednesday', label: 'Wednesday', visible: true },
    { key: 'thursday', label: 'Thursday', visible: true },
    { key: 'friday', label: 'Friday', visible: true },
    { key: 'saturday', label: 'Saturday', visible: true },
  ];

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [conditionColumns, setConditionColumns] = useState<Record<string, boolean>>({ gasday: true, valueBtuScf: true });
  // กำหนดการแสดง/ซ่อนคอลัมน์เริ่มต้น
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({
    zone_name: true,
    area_name: true,
    parameter: true
  });

  // ฟังก์ชันจัดการการคลิกปุ่ม show/hide columns
  const handleVisibilityClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleVisibilityClose = () => {
    setAnchorEl(null);
  };

  // ฟังก์ชันจัดการการแสดง/ซ่อนคอลัมน์
  const handleColumnVisibilityChange = (
    newVisibility: Record<string, boolean>
  ) => {
    setColumnVisibility(newVisibility);
  };

  // ############### TAB ###############
  const handleChange = (event: any, newValue: any) => {
    setIsLoading(false);
    setTabIndex(newValue);
  };

  const [isCheckAll, setIsCheckAll] = useState<any>(true);

  useEffect(() => {
    try {
      let url = `/master/quality-evaluation`;
      if (displayGasDay) {
        url += `?gasDay=${displayGasDay}`;
      }

      getService(url).then((response) => {
        setDataDailyOriginal(response?.newDaily);
        setDataWeeklyOriginal(response?.newWeekly);
        const data = tabIndex == 0 ? response?.newDaily : response?.newWeekly;
        if (data && Array.isArray(data) && !isCheckAll) {
          const uniqueContractCodeIDs = Array.from(
            new Set(
              data
                .map((item: any) => `${item?.contractCodeId?.id}`)
                .filter((id: any) => id != "undefined" && id != "null")
            )
          );

          setDisplaySrchContractCode(uniqueContractCodeIDs);
        }
      });
    } catch (err) { }
  }, [displayGasDay]);

  useEffect(() => {

    if (tabIndex == 0) {
      const tomorrow = toDayjs().add(1, "day");
      setSrchStartDate(tomorrow.toDate());
      setDisplayGasDay(tomorrow.toDate());
    } else if (tabIndex == 1) {
      let sun_day_fun_day = new Date(getCurrentWeekSundayYyyyMmDd());

      setSrchStartDate(sun_day_fun_day);
      setDisplayGasDay(sun_day_fun_day);
    }

    setTimeout(() => {
      setIsLoading(true)
    }, 300);
  }, [tabIndex])

  // useEffect(() => {
  //   fetchData();
  // }, [srchStartDate]);

  const [isFirstTime, setIsFirstTime] = useState<any>(false);

  useEffect(() => {
    if (filter_gas_day_from_somewhere_else && !isFirstTime) {
      // case 1
      fetchDataWithParams();
      setIsFirstTime(true)
      // setDisplayGasDay(toDayjs(filter_gas_day_from_somewhere_else).toDate());
    } else if (filter_gas_day_from_somewhere_else) {
      handleFieldSearch();
    } else {
      // case 2
      fetchData();
    }

  }, [filter_gas_day_from_somewhere_else]);

  // useEffect(() => {
  //   handleFieldSearch();
  // }, [searchQuery, srchContractCode]);

  // useEffect(() => {
  //   let to_day_js = toDayjs(filter_gas_day_from_somewhere_else).toDate()
  //   setDisplayGasDay(to_day_js);
  // }, [filter_gas_day_from_somewhere_else])

  // useEffect(() => {
  //   if (filter_gas_day_from_somewhere_else) {
  //      // case have params
  //     fetchDataWithParams();
  //   } else {
  //      // case normal
  //     fetchData();
  //   }
  // }, [])

  return (
    <div className=" space-y-2">
      <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl  flex flex-col sm:flex-row gap-2">
        <aside className="flex flex-wrap sm:flex-row gap-2 w-full">
          {/* <DatePickaSearch
            key={"start" + key}
            label={tabIndex == 0 ? "Gas Day" : "Gas Week"}
            // modeSearch={tabIndex == 0 ? "xx" : "sunday"}
            modeSearch={tabIndex == 1 && "sunday"}

            isGasWeek={tabIndex == 0 ? false : true}
            placeHolder={tabIndex == 0 ? "Select Gas Day" : "Select Gas Week"}
            allowClear
            // dateToFix={displayGasDay}
            // isFixDay={!!displayGasDay}

            // defaultValue={displayGasDay}
            // defaultValue={filter_gas_day_from_somewhere_else  ? filter_gas_day_from_somewhere_else : displayGasDay}
            defaultValue={(filter_gas_day_from_somewhere_else && !isResetClick) ? filter_gas_day_from_somewhere_else : srchStartDate}

            // isGasWeek={tabIndex == 1 ? true : false}
            // isGasDay={tabIndex == 0 ? true : false}
            // onChange={(e: any) => setSrchStartDate(e ? e : null)}
            onChange={(e: any) => {
              setIsSearch(false);
              // setDisplayGasDay(e ? e : null);
              setSrchStartDate(e ? e : null);
            }}
          /> */}

          {
            tabIndex == 0 ?
              <DatePickaSearch
                key={"start" + key}
                label={"Gas Day"}
                isGasWeek={false}
                placeHolder={"Select Gas Day"}
                allowClear
                defaultValue={(filter_gas_day_from_somewhere_else && !isResetClick) ? filter_gas_day_from_somewhere_else : srchStartDate}
                onChange={(e: any) => {
                  setIsSearch(false);
                  // setDisplayGasDay(e ? e : null);
                  setSrchStartDate(e ? e : null);
                }}
              />
              :
              <DatePickaSearch
                key={"start" + key}
                label={"Gas Week"}
                // modeSearch={tabIndex == 0 ? "xx" : "sunday"}
                modeSearch={"sunday"}
                isGasWeek={true}
                placeHolder={"Select Gas Week"}
                allowClear
                defaultValue={(filter_gas_day_from_somewhere_else && !isResetClick) ? filter_gas_day_from_somewhere_else : srchStartDate}
                onChange={(e: any) => {
                  setIsSearch(false);
                  // setDisplayGasDay(e ? e : null);
                  setSrchStartDate(e ? e : null);
                }}
              />
          }

          <InputSearch
            id="searchContractCode"
            label="Contract Code"
            type="select-multi-checkbox"
            isCheckAll={false}
            value={displaySrchContractCode}
            // onChange={(e) => setSrchContractCode(e.target.value)}
            onChange={(e) => {
              setIsCheckAll(false);
              setDisplaySrchContractCode(e.target.value);
            }}
            canReplaceOptionsWithEmpty={true}
            isDisabled={
              ((tabIndex === 0 ? dataDailyOriginal : dataWeeklyOriginal) || []).length < 1
            }
            // DATA CONTRACT CODE
            // Daily Nomination File ที่อยู่ในสถานะ Waiting for response , Approved หรือ Approved by system จะต้องแสดงใน Dropdown https://app.clickup.com/t/86etu85ah
            // options={Array.from(
            //   new Map(
            //     // dataTable
            //     (tabIndex === 0 ? dataDailyOriginal : dataWeeklyOriginal)
            //       ?.filter((item: any) => userDT?.account_manage?.[0]?.user_type_id == 3 ? item?.contractCodeId?.group_id === userDT?.account_manage?.[0]?.group?.id : true)
            //       ?.map((item: any) => [item?.contractCodeId?.id, item]) // Use Map to keep unique IDs
            //   ).values() // Extract unique values
            // ).map((item: any) => ({
            //   value: item?.contractCodeId?.id.toString(),
            //   label: item?.contractCodeId?.contract_code,
            // }))}

            options={Array.from(
              new Map(
                (tabIndex === 0 ? dataContract : dataWeeklyOriginal)
                  ?.filter((item: any) => userDT?.account_manage?.[0]?.user_type_id == 3 ? item?.contractCodeId?.group_id === userDT?.account_manage?.[0]?.group?.id : true)
                  ?.map((item: any) => [item?.contractCodeId?.id, item]) // Use Map to keep unique IDs
              ).values() // Extract unique values
            ).map((item: any) => ({
              value: item?.contractCodeId?.id.toString(),
              label: item?.contractCodeId?.contract_code,
            }))}

          />

          {/* <CheckboxSearch2
            {...register("filter_simulation")}
            id="sim_search"
            label="Simulation"
            type="single-line"
            value={
              watch("filter_simulation") ? watch("filter_simulation") : false
            }
            onChange={(e: any) =>
              setValue("filter_simulation", e?.target?.checked)
            }
          /> */}

          <div className="pt-7">
            <BtnSearch
              handleFieldSearch={() => {
                setSrchContractCode(displaySrchContractCode)
                // setSrchStartDate(displayGasDay);
                setDisplayGasDayInTabWeekly(displayGasDay);
                handleFieldSearch();
              }}
            />
          </div>

          <div className="pt-7">
            <BtnReset
              handleReset={() => {
                setIsResetClick(true)
                handleReset();

              }}
            />
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
        {["Daily", "Weekly"]?.map((label, index) => (
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
        ))}
      </Tabs>

      <div className="border-[#DFE4EA] border-[1px] p-4 rounded-tl-none rounded-xl shadow-sm">
        <div className="text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
          <div className="flex items-center space-x-2">
            <div onClick={handleVisibilityClick}>
              <Tune
                className="cursor-pointer rounded-lg"
                style={{
                  fontSize: "18px",
                  color: "#2B2A87",
                  borderRadius: "4px",
                  width: "22px",
                  height: "22px",
                  border: "1px solid rgba(43, 42, 135, 0.4)",
                }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-end">
            <SearchInput onSearch={(query) => {
              const searchTerm = query.toLowerCase().trim();
              setSearchQuery(searchTerm);
            }}
            />

            <BtnExport
              textRender={"Export"}
              specificMenu={"quality-evaluation"}
              data={filteredDataTable}
              type={tabIndex == 0 ? 1 : 2}
              gasDay={srchStartDate}
              path="nomination/quality-evaluation"
              can_export={userPermission ? userPermission?.f_export : false}
              columnVisibility={columnVisibility}
              initialColumns={initialColumns}
            />
          </div>
        </div>

        {/* ตารางแสดงข้อมูล */}
        <GeneralTable
          data={filteredDataTable}
          columns={columns}
          anchorEl={anchorEl}
          isShowDayInWeek={tabIndex === 1}
          conditionColumns={conditionColumns}
          mainColumns={["area_name", "parameter"]}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={handleColumnVisibilityChange}
          onHandleVisibilityClose={handleVisibilityClose}
          isLoading={!isLoading}
        />
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
            <div className="text-center">{`${modalErrorMsg}`}</div>
          </div>
        }
        stat="error"
      />
    </div>
  );
};

export default ClientPage;

