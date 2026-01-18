"use client";
import { useEffect, useState } from "react";
import { findRoleConfigByMenuName, generateUserPermission } from '@/utils/generalFormatter';
import { postService } from "@/utils/postService";
import { useFetchMasters } from "@/hook/fetchMaster";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import PaginationComponent from "@/components/other/globalPagination";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import { useAppDispatch } from "@/utils/store/store";
import { fetchZoneMasterSlice } from "@/utils/store/slices/zoneMasterSlice";
import { fetchAreaMaster } from "@/utils/store/slices/areaMasterSlice";
import { fetchNominationPoint } from "@/utils/store/slices/nominationPointSlice";
import { fetchContractPoint } from "@/utils/store/slices/contractPointSlice";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { decryptData } from "@/utils/encryptionData";
import dayjs from 'dayjs';
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import getUserValue from "@/utils/getuserValue";
import { useForm } from "react-hook-form";
import ChartSystem from "./form/chart";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Bangkok");

interface ClientProps {
    // params: {
    //     lng: string;
    // };
}

const ClientPage: React.FC<ClientProps> = () => {

    const today: any = dayjs().format("YYYY-MM-DD");

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
                const permission = findRoleConfigByMenuName('System Acc. Imbalance Inventory', userDT)
                setUserPermission(permission);
            }
        } catch (error) {
            // Failed to parse user_permission:
        }
    }

    // ############### REDUX DATA ###############
    const { zoneMaster, areaMaster } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const dispatch = useAppDispatch();
    useEffect(() => {
        if (forceRefetch) {
            dispatch(fetchZoneMasterSlice());
            dispatch(fetchAreaMaster());
            dispatch(fetchNominationPoint());
            dispatch(fetchContractPoint());
        }
        if (forceRefetch) {
            setForceRefetch(false);
        }
        getPermission();
    }, [dispatch, zoneMaster, areaMaster, forceRefetch]);

    // ############### FIELD SEARCH ###############
    const { register, setValue, reset, formState: { errors }, watch, getValues } = useForm<any>();

    const [key, setKey] = useState(0);
    // const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [srchStartDate, setSrchDate] = useState<Date | null>(null);

    const handleFieldSearch = async () => {
        setIsLoading(true);

        fetchData(srchStartDate);

        setTimeout(() => {
            setIsLoading(false);
        }, 300);
    };

    // ############### DATA TABLE ###############
    const [dataTable, setData] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [resetForm, setResetForm] = useState<() => void | null>();

    const fetchData = async (date: any) => {
        try {
            const body_main = {
                "gas_day": dayjs(date).format("YYYY-MM-DD"), // fixed ไว้ ของ mock eviden 2025-01-01 to 2025-02-28
                "start_hour": 1, //fixed ไว้ ของ mock eviden
                "end_hour": 24, //fixed ไว้ ของ mock eviden
                "skip": 0, //fixed ไว้ ของ mock eviden
                "limit": 100 //fixed ไว้ ของ mock eviden
            }

            // MAIN DATA
            const response = await postService('/master/balancing/system-acc-imbalance-inventory', body_main);


            setData(response);
        } catch (error) {

        }
    };

    useEffect(() => {
        setSrchDate(today);
        fetchData(today);

    }, [resetForm]);

    const handleReset = () => {
        setSrchDate(today);
        fetchData(today);
        setKey((prevKey) => prevKey + 1);
    };

    return (
        <div className=" space-y-2">
            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
                <aside className="flex flex-wrap gap-2 w-full">
                    <DatePickaSearch
                        key={"start" + key}
                        label={"Gas Day"}
                        placeHolder={"Select Gas Day"}
                        isDefaultToday={true}
                        allowClear
                        onChange={(e: any) => setSrchDate(e ? dayjs(e).format("YYYY-MM-DD") : today)}
                        max={today}
                    />

                    <BtnSearch handleFieldSearch={handleFieldSearch} />
                    <BtnReset handleReset={handleReset} />
                </aside>
            </div>

            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl shadow-sm h-full">
                <ChartSystem data={dataTable} />
            </div>

        </div>
    );
};

export default ClientPage;