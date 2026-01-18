"use client";
import { useTranslation } from "@/app/i18n/client";
import { useEffect, useMemo, useRef, useState } from "react";
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import { exportToExcel, formatDate, formatDateNoTime, formatDateTimeSec, formatTime, generateUserPermission, toDayjs, underDevelopment } from '@/utils/generalFormatter';
import SearchInput from "@/components/other/searchInput";
import { getService, patchService, postService, putService } from "@/utils/postService";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import getUserValue from "@/utils/getuserValue";
import { decryptData } from "@/utils/encryptionData";
import dayjs from "dayjs";
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import Spinloading from "@/components/other/spinLoading";
import BtnExport from "@/components/other/btnExport";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import AppTable, { sortingByDateFn } from "@/components/table/AppTable";
import { InputSearch } from "@/components/other/SearchForm";
import { ColumnDef } from "@tanstack/react-table";
import BtnGeneral from "@/components/other/btnGeneral";
import NodataTable from "@/components/other/nodataTable";
import { useParams } from "next/navigation";

dayjs.extend(isSameOrBefore);

interface ClientProps {
    // params: {
    //     lng: string;
    // };
}

const ClientPage: React.FC<ClientProps> = () => {
    const params = useParams();
    const lng = params.lng as string;
    const { t } = useTranslation(lng, "mainPage");

    // #region CHECK AUTHEN
    // ############### Check Authen ###############
    const userDT: any = getUserValue();
    const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
    useRestrictedPage(token);
    // #endregion CHECK AUTHEN


    // #region PERMISSION
    // ############### PERMISSION ###############
    const [userPermission, setUserPermission] = useState<any>();
    let user_permission: any = localStorage?.getItem("k3a9r2b6m7t0x5w1s8j");
    user_permission = user_permission ? decryptData(user_permission) : null;

    const getPermission = () => {
        if (user_permission) {
            try {
                user_permission = user_permission ? JSON.parse(user_permission) : null; // Convert JSON s
                const updatedUserPermission = generateUserPermission(user_permission);
                setUserPermission(updatedUserPermission);
            } catch (error) {
                // Failed to parse user_permission:
            }
        } else {
            // No user_permission found
        }
    }
    // #endregion PERMISSION


    // #region CHANGE TAB HANDLE
    // ############### CHANGE TAB HANDLE ###############
    const [activeButtonData, setActiveButtonData] = useState<any>({});
    const [activeButton, setActiveButton] = useState<number | null>(null);
    const [subMenu, setSubMenu] = useState<any[]>([]);

    // Configuration object for menu data mapping
    const MENU_CONFIG = {
        'CAPACITY MANAGEMENT': {
            keys: ['CAPACITY CONTRACT LIST', 'CAPACITY CONTRACT MANAGEMENT', 'RELEASE CAPACITY MANAGEMENT'],
            endpoints: [
                { path: 'contract', key: null },
                { path: 'release-capacity-management', key: 'Release Capacity Management' }
            ]
        },
        'NOMINATION': {
            keys: ['DAILY QUERY SHIPPER NOMINATION FILE', 'WEEKLY QUERY SHIPPER NOMINATION FILE', 'DAILY MANAGEMENT', 'WEEKLY MANAGEMENT', 'DAILY ADJUSTMENT'],
            endpoints: [
                { path: 'nomination', key: null },
                { path: 'nomination-adjustment', key: 'Daily Adjustment' }
            ]
        },
        'ALLOCATION': {
            keys: ['ALLOCATION REVIEW', 'ALLOCATION MANAGEMENT'],
            endpoints: [
                { path: 'allocation-review', key: 'Allocation Review' },
                { path: 'allocation-management', key: 'Allocation Management' }
            ]
        },
        'EVENT': {
            keys: ['OFFSPEC GAS', 'EMERGENCY/DIFFICULT DAY', 'OF/IF'],
            endpoints: [
                { path: 'offspec-gas', key: 'Offspec Gas' },
                { path: 'emer', key: 'Emergency/Difficult Day' },
                { path: 'ofo', key: 'OF/IF' }
            ]
        }
    };

    const handleClick = (id: number | undefined, row_id?: number) => {
        handleReset();

        setActiveButton(id || null);
        setsmartquery('')
        setClearSmartQuery(true)
        const menuName = subMenu?.find((item: any) => item.id === id)?.name?.trim()?.toUpperCase() ?? ''
        handleUpdateActiveButtonData({
            isFetchData: true,
            menuName: `${menuName}`
        })
    };

    function getSubMenu() {
        let userData: any = localStorage?.getItem("x9f3w1m8q2y0u5d7v1z");
        userData = userData ? decryptData(userData) : null;

        let account_manage;
        try {
            const parsedUserData = userData ? JSON.parse(userData) : null;
            account_manage = parsedUserData?.account_manage;
        } catch (error) {
            // Failed to parse userData
            account_manage = null;
        }

        const menus_config = account_manage?.[0]?.account_role?.[0]?.role?.menus_config ?? []

        if (Array.isArray(menus_config) && menus_config.length > 0) {
            const waitingListMenuConfig = menus_config.filter((item: any) => item.menus?.name?.trim()?.toUpperCase()?.includes("WAITING LIST")
                && item.menus?.name?.trim()?.toUpperCase() != "WAITING LIST"
                && item.b_manage === true
                && item.f_view === 1
            )
                .sort((a: any, b: any) => a.seq - b.seq)
                .map((item: any) => {
                    const menuName =
                        item.menus?.name
                            ?.trim()
                            ?.split(" ")
                            ?.filter(
                                (word: string) =>
                                    word.toUpperCase() !== "WAITING" &&
                                    word.toUpperCase() !== "LIST"
                            )
                            .join(" ")
                            ?.trim() ?? "";
                    return {
                        id: item.menus?.id,
                        name: menuName,
                    }
                })

            setSubMenu(waitingListMenuConfig)
            if (waitingListMenuConfig.length > 0) {
                handleClick(waitingListMenuConfig[0].id)
            }
        }
    }

    function handleUpdateActiveButtonData({
        isFetchData = true,
        newData,
        menuName,
        query
    }: { isFetchData?: boolean, newData?: any, menuName: string, query?: string }) {
        const menuConfig = MENU_CONFIG[menuName as keyof typeof MENU_CONFIG];
        if (!menuConfig) {
            return;
        }

        let data: any = {};
        const updateData = newData ?? waitingListData;

        let keys = Object.keys(waitingListData)
        if (newData) {
            const newskeys = Object.keys(newData)
            keys.push(...newskeys)
            keys = Array.from(new Set(keys))
        }

        // Filter and map data based on configuration
        menuConfig.keys.map((key: string) => {
            const targetKey = keys.find((k: string) => k.trim().toUpperCase() === key)
            if (targetKey) {
                const value = updateData[targetKey] ?? waitingListData[targetKey]
                if (query) {
                    if (key.includes(query.trim().toUpperCase()) || (value?.remainingTasks && `${value.remainingTasks}`.includes(query))) {
                        data[targetKey] = value;
                    }
                }
                else {
                    data[targetKey] = value;
                }
            }
        });

        // Fetch data if needed
        if (isFetchData) {
            menuConfig.endpoints.map(({ path }) => {
                fetchSubMenuData(path, menuName, query);
            });
        }

        setActiveButtonData(data);
        setWaitingListData((prev: any) => ({
            ...prev,
            ...data
        }));
    }
    // #endregion CHANGE TAB HANDLE

    // #region FIELD SEARCH
    // ############### FIELD SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [dataExport, setDataExport] = useState<any>([]);
    const [key, setKey] = useState(0);
    const [srchGroup, setSrchGroup] = useState<any>([]);
    const [srchType, setSrchType] = useState<any>([]);


    const handleFieldSearch = () => {
        const result = dataTable?.filter((item: any) => {
            return (
                (srchGroup?.length > 0 ? srchGroup.includes(item?.company_name || '') : true) &&
                (srchType?.length > 0 ? srchType.includes(item?.type_account?.name || '') : true)
            );
        });

        setFilteredDataTable(result);
    };

    const handleReset = async () => {
        setSrchGroup([]);
        setSrchType([])

        setKey((prevKey) => prevKey + 1);
    };

    useEffect(() => {
        handleFieldSearch()
    }, [srchGroup, srchType])

    // #endregion FIELD SEARCH



    // #region LIKE SEARCH
    // ############### LIKE SEARCH ###############
    const [smartquery, setsmartquery] = useState<string>('');
    const [clearSmartQuery, setClearSmartQuery] = useState<boolean>(false);

    useEffect(() => {
        const menuName = subMenu?.find((item: any) => item.id === activeButton)?.name?.trim()?.toUpperCase() ?? ''
        handleUpdateActiveButtonData({
            isFetchData: false,
            menuName: `${menuName}`,
            query: smartquery
        })
    }, [smartquery])

    // #endregion LIKE SEARCH


    // #region DATA TABLE
    // ############### DATA TABLE ###############
    const [waitingListData, setWaitingListData] = useState<any>({});
    const [dataTable, setDataTable] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [resetForm, setResetForm] = useState<() => void | null>();

    // #region ON LOAD
    const fetchData = async () => {
        try {
            setIsLoading(false);

            const response: any = await getService(`/master/account-manage/account`);

            const data_res_user = response.sort((a: { update_date: string }, b: { update_date: string }) => {
                return new Date(b.update_date).getTime() - new Date(a.update_date).getTime();
            });

            const newData: any = [];

            for (let index = 0; index < data_res_user?.length; index++) {
                // let findRole: any = data_res_user[index]?.account_manage[0]?.account_role[0]?.role;
                newData.push({
                    ...data_res_user[index],
                    // role: findRole,
                    // role_default: findRole?.name,
                    // company: data_res_user[index]?.account_manage[0]?.group,
                    company_id: data_res_user[index]?.account_manage[0]?.group?.id,
                    company_name: data_res_user[index]?.account_manage[0]?.group?.name,
                    user_type: data_res_user[index]?.account_manage[0]?.user_type,
                    // division: data_res_user[index]?.account_manage[0]?.division,
                    // division_name: data_res_user[index]?.account_manage[0]?.division?.division_name,
                })
            }

            setDataTable(newData);
            setFilteredDataTable(newData);

            // MAIN DATA
            getService(`/master/waiting-list`).then((res_main_data) => {
                setWaitingListData(res_main_data)
            })
            // const res_main_data = await getService(`/master/waiting-list`);
            // setWaitingListData(res_main_data)

        } catch (err) {
            // setError(err.message);
        } finally {
            setTimeout(() => {
                setIsLoading(true);
            }, 300);
        }
    };

    useEffect(() => {
        fetchData();
    }, [resetForm]);

    useEffect(() => {
        getPermission();
        getSubMenu()
    }, [])
    // #endregion ON LOAD

    const fetchSubMenuData = async (path: string, menuName: string, query?: string) => {
        try {
            setIsLoading(false);

            // Get the configuration for the current menu
            const menuConfig = MENU_CONFIG[menuName as keyof typeof MENU_CONFIG];
            if (!menuConfig) return;

            // Find the endpoint configuration
            const endpointConfig = menuConfig.endpoints.find(ep => ep.path === path);
            if (!endpointConfig) return;

            const res = await getService(`/master/waiting-list/${path}`);

            if (JSON.stringify(res).includes('remainingTasks')) {
                let newData: any;
                if (endpointConfig.key) {
                    // If there's a specific key, wrap the response
                    newData = { [endpointConfig.key]: res };
                } else {
                    // Otherwise, use the response directly
                    newData = res;
                }

                // Update the data
                handleUpdateActiveButtonData({
                    isFetchData: false,
                    newData: newData,
                    menuName: menuName,
                    query
                });
            }


        } catch (err) {
            // setError(err.message);
        } finally {
            setIsLoading(true);
        }
    };

    // #endregion DATA TABLE

    // #region COLUMN SHOW/HIDE POPOVER
    // ############### COLUMN SHOW/HIDE POPOVER ###############
    const initialColumns: any = [
        { key: 'login_mode', label: 'Login Mode', visible: true },
        { key: 'user_id', label: 'User ID', visible: true },
        { key: 'first_name', label: 'First Name', visible: true },
        { key: 'last_name', label: 'Last Name', visible: true },
        { key: 'type', label: 'Type', visible: true },
        { key: 'company_name', label: 'Company/Group Name', visible: true },
        { key: 'last_login', label: 'Lasted Login', visible: true },
        { key: 'last_login_duration', label: 'Last Login Duration', visible: true }
    ];

    const [columnVisibility, setColumnVisibility] = useState<any>(
        Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))
    );

    const handleColumnToggle = (columnKey: any) => {
        setColumnVisibility((prev: any) => ({
            ...prev,
            ...columnKey
        }));
    };

    const getLastLoginDuration = (row: any) => {
        let text = ''
        if (row?.login_logs?.length > 0) {
            const lastLogin = toDayjs(row?.login_logs[0]?.create_date)
            const now = toDayjs()
            let duration = now.diff(lastLogin, 'month')
            if (duration > 0) {
                if (duration >= 12) {
                    duration = now.diff(lastLogin, 'year')
                    text = `${duration} ${duration == 1 ? 'year' : 'years'}`
                }
                else {
                    text = `${duration} ${duration == 1 ? 'month' : 'months'}`
                }
            }
            else {
                duration = now.diff(lastLogin, 'day')
                text = `${duration} ${duration == 1 ? 'day' : 'days'}`
            }
        }
        return text
    }

    const columns = useMemo<ColumnDef<any>[]>(
        () => [
            {
                accessorKey: "login_mode",
                accessorFn: (row) => row?.account_manage?.[0]?.mode_account?.name || '',
                header: "Login Mode",
                align: 'center',
                enableSorting: true,
                cell: (info) => {
                    const row: any = info?.row?.original
                    const generateLowercase: any = row?.account_manage[0]?.mode_account?.name == 'SSO' ? row?.account_manage[0]?.mode_account?.name : row?.account_manage[0]?.mode_account?.name?.toLowerCase();
                    // return (
                    //     // <div className={`${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.id_name ? row?.id_name : ''}</div>
                    //     row?.account_manage[0]?.mode_account && <div className={`flex w-[100px] justify-center rounded-full p-1 ${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"} `} style={{ backgroundColor: row?.status ? row?.account_manage[0]?.mode_account.color : '#EFECEC' }}>{row?.account_manage[0]?.mode_account.name} Mode</div>
                    // )
                    return (
                        <div className="flex justify-start items-center absolute !w-auto" style={{ transform: 'translate(-8px, -13px)' }}>
                            <div
                                className="flex w-[100px] justify-center rounded-full p-1 text-[#464255] capitalize"
                                style={{ backgroundColor: row?.status ? row?.account_manage[0]?.mode_account.color : '#EFECEC' }}>{generateLowercase} Mode</div>
                        </div>
                    )
                }
            },
            {
                accessorKey: "user_id",
                accessorFn: (row) => row.user_id || '',
                header: "User ID",
                width: 150,
                enableSorting: true,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div className={`${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"} w-[150px]`}>{row?.user_id ? row?.user_id : ''}</div>)
                }
            },
            {
                accessorKey: "first_name",
                accessorFn: (row) => row.first_name || '',
                header: "First Name",
                enableSorting: true,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div className={`${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.first_name ? row?.first_name : ''}</div>)
                }
            },
            {
                accessorKey: "last_name",
                accessorFn: (row) => row.last_name || '',
                header: "Last Name",
                enableSorting: true,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div className={`${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.last_name ? row?.last_name : ''}</div>)
                }
            },
            {
                accessorKey: "type",
                accessorFn: (row) => row?.type_account ? (row?.type_account?.name || '') : '',
                header: "Type",
                align: 'center',
                enableSorting: true,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        row?.user_type &&
                        <div
                            className={`flex w-[100px] bg-[#EEE4FF] justify-center !text-[14px] rounded-full p-1 bg-opacity-50`}
                            style={{
                                backgroundColor: row?.status ? row?.type_account?.color : '#EFECEC',
                                color: row?.status ? row?.type_account?.color_text : '#9CA3AF'
                            }}
                        >
                            {row?.type_account?.name}
                        </div>
                    )
                }
            },
            {
                accessorKey: "company_name",
                accessorFn: (row) => row.company_name || '',
                header: "Company/Group Name",
                width: 180,
                enableSorting: true,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div className={`${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.company_name ?? ''}</div>)
                }
            },
            {
                accessorKey: "last_login",
                accessorFn: (row) => row?.login_logs?.length > 0 ? formatDate(row?.login_logs[0]?.create_date) : '',
                sortingFn: (rowA, rowB, columnId) => {

                    if (rowA.original.login_logs?.length < 1 && rowB.original.login_logs?.length < 1) return 0;
                    if (rowA.original.login_logs?.length < 1) return 1; // Valid dates come before nulls
                    if (rowB.original.login_logs?.length < 1) return -1;  // Nulls come before valid dates

                    return sortingByDateFn(rowA.original.login_logs[0]?.create_date, rowB.original.login_logs[0]?.create_date)
                },
                header: "Lasted Login",
                width: 150,
                enableSorting: true,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className={`${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.login_logs?.length > 0 ? formatDate(row?.login_logs[0]?.create_date) : ''}</div>
                    )
                }
            },
            {
                accessorKey: "last_login_duration",
                accessorFn: (row) => getLastLoginDuration(row),
                sortingFn: (rowA, rowB, columnId) => {

                    if (rowA.original.login_logs?.length < 1 && rowB.original.login_logs?.length < 1) return 0;
                    if (rowA.original.login_logs?.length < 1) return 1; // Valid dates come before nulls
                    if (rowB.original.login_logs?.length < 1) return -1;  // Nulls come before valid dates

                    return sortingByDateFn(rowA.original.login_logs[0]?.create_date, rowB.original.login_logs[0]?.create_date)
                },
                header: "Last Login Duration",
                width: 150,
                enableSorting: true,
                cell: (info) => {
                    const row: any = info?.row?.original
                    const duration = getLastLoginDuration(row)

                    return (
                        <div className={`${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>
                            {duration}
                        </div>
                    )
                }
            }
        ],
        [userPermission, user_permission, dataTable]
    );
    // #endregion COLUMN SHOW/HIDE POPOVER

    return (<div>

        <div className="flex h-[calc(100vh-100px)] gap-2 overflow-hidden">
            {/* Sidebar (20%) */}
            <div className="w-[20%] border-[#DFE4EA] border-[1px] rounded-xl p-8 m-[4px] flex flex-col shadow-[0_1px_3px_rgba(0,0,0,0.25)]">
                <div className="font-bold text-lg text-[#58585A] mb-8">
                    Menu list
                </div>
                {subMenu?.map(({ id, name }) => (
                    <div key={id} className="pb-2">
                        <div
                            onClick={() => handleClick(id)}
                            className={`flex justify-start items-center w-full h-[42px] px-4 rounded-[8px] cursor-pointer overflow-x-scroll
                                ${activeButton === id ? "bg-[#3083AC26] font-bold text-[#3083AC]" : "bg-[#FAFAFA] font-normal text-[#1C1D2280] hover:bg-[#3083AC26] hover:text-[#3083AC]"}
                            `}
                        >
                            {name ?? ''}
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content (80%) */}
            <div className="w-[80%] h-[100vh] border-[#DFE4EA] gap-2 pt-2 rounded-xl  flex flex-col overflow-hidden relative">
                <Spinloading spin={!isLoading} rounded={20} />
                {/* Content Section - Takes full remaining height */}
                <div className="flex-1 px-4 overflow-hidden">

                    <div className="space-y-2 ">
                        {
                            subMenu?.find((item: any) => item.id === activeButton)?.name?.trim()?.toUpperCase() === "LOGIN" ?
                                <>
                                    <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
                                        {/* <button type="button" onClick={() => testrenderMail()}>test</button> */}

                                        <aside className="flex flex-wrap sm:flex-row gap-2 w-full">
                                            <InputSearch
                                                id="searchGroup"
                                                label="Company/Group Name"
                                                type="select-multi-checkbox"
                                                value={srchGroup}
                                                onChange={(e) => setSrchGroup(e.target.value)}
                                                options={Array.from(new Map(
                                                    (dataTable ?? []).map((item: any) => [item.company_name, item])
                                                ).values()).map((item: any) => ({
                                                    value: item.company_name,
                                                    label: item.company_name
                                                }))}
                                                placeholder="Select Company/Group Name"
                                            />

                                            <InputSearch
                                                id="searchType"
                                                label="Type"
                                                type="select-multi-checkbox"
                                                value={srchType}
                                                onChange={(e) => setSrchType(e.target.value)}
                                                options={[
                                                    { value: "Manual", label: "Manual" },
                                                    { value: "PTT", label: "PTT" },
                                                    { value: "TPA Website", label: "TPA Website" },
                                                ]}
                                                placeholder="Select Type"
                                            />

                                            {/* <BtnSearch handleFieldSearch={handleFieldSearch} />
                                        <BtnReset handleReset={handleReset} /> */}

                                        </aside>
                                    </div>


                                    <AppTable
                                        data={filteredDataTable}
                                        columns={columns}
                                        isLoading={isLoading}
                                        exportBtn={
                                            <BtnExport
                                                textRender={"Export"}
                                                data={dataExport}
                                                path="dam/users"
                                                can_export={userPermission ? userPermission?.f_export : false}
                                                columnVisibility={columnVisibility}
                                                initialColumns={initialColumns}
                                                fileName="waitinglist_login"
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
                                </>
                                :
                                <div className="p-4">
                                    <div className="text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
                                        <div className="flex items-center space-x-2 font-bold text-lg text-[#1473A1]">
                                            Today, {toDayjs().format("DD/MM/YYYY")}
                                        </div>

                                        <div className="flex flex-wrap gap-2 justify-end">
                                            <SearchInput
                                                onSearch={setsmartquery}
                                                clear={clearSmartQuery}
                                                onClear={() => {
                                                    setClearSmartQuery(false)
                                                    setsmartquery('')
                                                }}
                                            />

                                            <BtnGeneral
                                                bgcolor={"#24AB6A"}
                                                modeIcon={'export'}
                                                textRender={"Export"}
                                                width={100}
                                                generalFunc={
                                                    () => {
                                                        const menuName =
                                                            subMenu
                                                                ?.find((item: any) => item.id === activeButton)
                                                                ?.name?.trim()
                                                                ?.toLowerCase()
                                                                ?.replaceAll(" ", "_") ?? "";


                                                        exportToExcel(
                                                            Object.keys(activeButtonData).map((key: any) => {
                                                                return {
                                                                    'Name': key,
                                                                    'Remaining tasks': activeButtonData[key]?.remainingTasks,
                                                                }
                                                            }),
                                                            `waitinglist_${menuName}`
                                                        )
                                                    }
                                                }
                                                can_export={userPermission ? userPermission?.f_export : false}
                                            />
                                        </div>
                                    </div>


                                    {isLoading && Object.keys(activeButtonData).length == 0 && <NodataTable />}

                                    <div className={`grid gap-4 ${Object.keys(activeButtonData).length === 1 ? 'grid-cols-1' :
                                            Object.keys(activeButtonData).length === 2 ? 'grid-cols-1 lg:grid-cols-2' :
                                                Object.keys(activeButtonData).length === 3 ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' :
                                                    'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
                                        }`}>
                                        {
                                            Object.keys(activeButtonData).map((key: any) => (
                                                <div key={key} className="border-[#1C1D220F] border-[2px] rounded-xl p-6 overflow-x-scroll">
                                                    <p className="font-bold text-md text-[#58585A] mb-8 min-h-11 line-clamp-2">
                                                        {key}
                                                    </p>
                                                    <div className="flex flex-column sm:flex-row flex-wrap items-center justify-between">
                                                        <div className="flex items-center space-x-2">
                                                            <FormatListBulletedIcon style={{ fontSize: "12px" }} />
                                                            <span className="text-sm text-[#1473A1]">Remaining tasks</span>
                                                        </div>

                                                        <div className="flex flex-wrap justify-end items-center font-bold text-5xl text-[#1473A1]">
                                                            {activeButtonData[key]?.remainingTasks}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                        }
                    </div>
                </div>
            </div>
        </div>

    </div>
    );
};

export default ClientPage;
