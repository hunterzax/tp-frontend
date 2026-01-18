"use client";
import { useEffect, useState } from "react";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import { Tune } from "@mui/icons-material"
import { InputSearch } from "@/components/other/SearchForm";
import BtnExport from "@/components/other/btnExport";
import SearchInput from "@/components/other/searchInput";
import ModalComponent from "@/components/other/ResponseModal";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import { findRoleConfigByMenuName, generateUserPermission, shiftTimeKeys, toDayjs } from "@/utils/generalFormatter";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import { decryptData } from "@/utils/encryptionData";
import PaginationComponent from "@/components/other/globalPagination";
import TableMtrChecking from "./form/table";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import dayjs from 'dayjs';
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { getService } from "@/utils/postService";
import getUserValue from "@/utils/getuserValue";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Bangkok");

interface ClientProps {
    // params: {
    //     lng: string;
    // };
}

const ClientPage: React.FC<ClientProps> = () => {

    // ############### Check Authen ###############
    const userDT: any = getUserValue();
    const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
    useRestrictedPage(token);

    //state
    const [key, setKey] = useState(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [selectedKey, setselectedKey] = useState<any>();
    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);
    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMsg, setModalSuccessMsg] = useState('Your file has been uploaded.');
    const [srchMeterRetriveId, setSrchMeterRetriveId] = useState('');
    const handleCloseModal = () => setModalSuccessOpen(false);
    const open = Boolean(anchorEl);
    const open2 = Boolean(anchorEl2);
    const [tabIndex, setTabIndex] = useState(0); // 0=Retrieving, 1=metering data check

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
                const permission = findRoleConfigByMenuName('Metering Checking', userDT)
                setUserPermission(permission);
            }
        } catch (error) {
            // Failed to parse user_permission:
        }
    }

    //class css
    const cardClass = "border-[#DFE4EA] border-[1px] p-4 rounded-lg ";

    // ############### FIELD SEARCH ###############
    const [srchGasDay, setSrchGasDay] = useState<Date | null>(null);
    const [srchMeterPointId, setSrchMeterPointId] = useState<any>([]);

    const handleFieldSearch = async () => {
        setIsLoading(false)
        try {
            const today = dayjs().format("YYYY-MM-DD");
            const localDate = srchGasDay ? toDayjs(srchGasDay).format("YYYY-MM-DD") : today;

            const applyFilters = (data: any[]) => {
                return data?.filter((itemf: any) => {
                    return srchMeterPointId?.length > 0 ? srchMeterPointId?.find((item: any) => item == itemf?.meteringPointId) : true
                });
            };
            setCurrentPage(1);

            if (srchGasDay) {
                // master/metering-management/metering-checking?gasDay=2025-03-10
                const response: any = await getService(`/master/metering-management/metering-checking?gasDay=${localDate}`);

                // แปลง key ของ res_ ปกติเริ่ม 00:00 - 23:00 เป็น 01:00 - 24:00W
                const time_key_change = shiftTimeKeys(response)

                const result_2 = applyFilters(time_key_change);
                setFilteredDataTable(result_2);
            } else {
                const result_2 = applyFilters(dataTable);
                setFilteredDataTable(result_2);
            }
        } catch (error) {
            // Error handling
            // Optionally show a user-friendly error message
        }

        setTimeout(() => {
            setIsLoading(true)
        }, 500);
    };

    const handleReset = () => {
        setSrchMeterPointId([])
        setSrchMeterRetriveId('')
        setSrchGasDay(null)
        setFilteredDataTable(dataTable);
        setKey((prevKey) => prevKey + 1);
    };

    // ############### DATA TABLE ###############
    const [dataTable, setData] = useState<any>([]);
    const fetchData = async () => {
        try {
            // DATA CUSTOMER TYPE
            // const res_cust_type: any = await getService(`/master/asset/customer-type`);

            // DATA 
            // const res_checking_condition_icon: any = await getService(`/master/parameter/checking-condition`);

            const today = dayjs().format("YYYY-MM-DD");
            const response: any = await getService(`/master/metering-management/metering-checking?gasDay=${today}`);

            // แปลง key ของ res_ ปกติเริ่ม 00:00 - 23:00 เป็น 01:00 - 24:00
            const time_key_change = shiftTimeKeys(response)

            const res_get_cust_type = time_key_change?.map((item: any) => ({
                ...item,
                customer_type_name: item.nomination_point?.customer_type?.name ?? null
            }));

            setData(res_get_cust_type);
            setFilteredDataTable(res_get_cust_type);

            setIsLoading(true);
        } catch (err) {
        } finally {
        }
    };

    useEffect(() => {
        getPermission();
        fetchData();
    }, [resetForm]);

    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [
        { key: 'gas_day', label: 'Gas Day', visible: true },
        { key: 'metering_point_id', label: 'Metering Point ID', visible: true },
        { key: 'customer_type', label: 'Customer Type', visible: true },
        // ...Array.from({ length: 25 }, (_, i) => ({ // 00:00 - 23:00
        //     key: `${i.toString().padStart(2, '0')}:00`,
        //     label: `${i.toString().padStart(2, '0')}:00`,
        //     visible: true
        // }))
        ...Array.from({ length: 24 }, (_, i) => {
            const hour = (i + 1).toString().padStart(2, '0'); // 01 … 24
            return {
                key: `${hour}:00`,
                label: `${hour}:00`,
                visible: true,
            };
        })
    ];

    const [columnVisibility, setColumnVisibility] = useState<any>(
        Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))
    );

    const handleColumnToggle = (columnKey: string) => {
        setColumnVisibility((prev: any) => ({
            ...prev,
            [columnKey]: !prev[columnKey]
        }));
    };

    const handleTogglePopover = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };


    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {
        const queryLower = query.toLowerCase().replace(/\s+/g, '')?.trim();
        const filtered = dataTable.filter(
            // const filtered = filteredDataTable.filter(
            (item: any) => {
                return (
                    item?.metered_point_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)
                )
            }
        );
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(filtered);
    };

    const handleFormSubmit = async (data: any) => { }

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

    return (
        <div className="space-y-2">
            {/* <div className={`${cardClass} grid grid-cols-[82%_18%]`}> */}
            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                    <DatePickaSearch
                        key={"start" + key}
                        label="Gas Day"
                        placeHolder="Select Gas Day"
                        allowClear
                        onChange={(e: any) => setSrchGasDay(e ? e : null)}
                    />

                    <InputSearch
                        id="meteringPointFilter"
                        label="Metering Point ID"
                        type="select-multi-checkbox"
                        value={srchMeterPointId}
                        onChange={(e) => setSrchMeterPointId(e.target.value)}
                        placeholder="Select Metering Point ID"
                        options={dataTable?.length > 0 ? dataTable?.map((item: any) => ({
                            value: item?.meteringPointId,
                            label: item?.meteringPointId
                        })) : []}
                    />

                    <BtnSearch handleFieldSearch={handleFieldSearch} />
                    <BtnReset handleReset={handleReset} />
                </aside>
            </div>

            {/* <div className={`${cardClass} rounded-tl-none`}> */}
            <div className={`${cardClass} `}>
                <div>
                    <div className="text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
                        <div className="flex items-center gap-4">
                            <div onClick={handleTogglePopover}>
                                <Tune
                                    className="cursor-pointer rounded-lg"
                                    style={{
                                        fontSize: "18px",
                                        color: "#2B2A87",
                                        borderRadius: "4px",
                                        width: "22px",
                                        height: "22px",
                                        border: "1px solid rgba(43, 42, 135, 0.4)"
                                    }}
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-end">
                            <SearchInput onSearch={handleSearch} />
                            <BtnExport
                                textRender={"Export"}
                                data={filteredDataTable}
                                path="metering/metering-data-check"
                                can_export={userPermission ? userPermission?.f_export : false}
                                columnVisibility={columnVisibility}
                                initialColumns={initialColumns}
                                specificData={srchGasDay ? dayjs(srchGasDay).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")}
                                specificMenu={'metering-checking'}
                            />
                        </div>
                    </div>
                </div>

                <TableMtrChecking
                    tableData={paginatedData}
                    isLoading={isLoading}
                    columnVisibility={columnVisibility}
                    setisLoading={setIsLoading}
                    selectedKey={selectedKey}
                    tabIndex={tabIndex}
                />
            </div>

            <ModalComponent
                open={isModalSuccessOpen}
                handleClose={handleCloseModal}
                title="Success"
                description={modalSuccessMsg}
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

            <PaginationComponent
                totalItems={filteredDataTable?.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
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
    )
}

export default ClientPage;