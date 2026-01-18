"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
} from "@mui/material";
import {
  VisibilityOutlined,
  KeyboardArrowLeft,
  KeyboardArrowRight,
} from "@mui/icons-material";
import AppTable, { myCustomSortingByDateFn } from "@/components/table/AppTable";
import { ColumnDef } from "@tanstack/react-table";
import BtnGeneral from "@/components/other/btnGeneral";
import { toDayjs } from "@/utils/generalFormatter";
import { markAllAsRead, markAsRead } from "@/components/other/notifyStorage";
import ModalNotification from "./form/modalNoti";

const moduleTabs = [
  { name: "DAM" },
  { name: "Capacity Management" },
  { name: "Planning" },
  { name: "Nomination" },
  { name: "Metering" },
  { name: "Allocation" },
  { name: "Balancing" },
  { name: "Tariff" },
  { name: "Event" },
];

const NotificationArea = React.forwardRef<HTMLDivElement, { data: any[] , onUpdateBadge?: () => void }>(({ data, onUpdateBadge }, ref) => {
  const [pagination, setPagination] = useState({
    pageIndex: 0, //initial page index
    pageSize: 10, //default page size
  });

  const initialColumns: any = [
    { key: 'isread', label: 'Acknowledge', visible: true },
    { key: 'id', label: 'ID', visible: true },
    { key: 'module', label: 'Module', visible: true },
    { key: 'message', label: 'Message', visible: true },
    { key: 'view', label: 'View', visible: true },
    { key: 'createdDate', label: 'Created Date', visible: true }
  ];

  const [columnVisibility, setColumnVisibility] = useState<any>(
    Object.fromEntries(initialColumns.filter((item: any) => item?.key !== 'gas_hour')?.map((column: any) => [column.key, column.visible]))
  );

  const handleColumnToggle = (columnKey: string) => {
    setColumnVisibility((prev: any) => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };

  const [notifications, setNotifications] = useState<any[]>(data ?? []);
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
  const [activeModule, setActiveModule] = useState("DAM");
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Handle individual notification selection
  const handleNotificationSelect = (id: number) => {
    setSelectedNotifications(prev =>
      prev.includes(id)
        ? prev.filter(notificationId => notificationId !== id)
        : [...prev, id]
    );
  };

  // Handle select all notifications
  const handleSelectAll = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n.id));
    }
  };

  // Handle acknowledge selected notifications
  const handleAcknowledge = () => {
    markAsRead(selectedNotifications)
    onUpdateBadge?.()
    setNotifications(prev =>
      prev.map(notification =>
        selectedNotifications.includes(notification.id)
          ? { ...notification, isRead: true }
          : notification
      )
    );
    setSelectedNotifications([]);
  };

  // Handle acknowledge all notifications
  const handleAcknowledgeAll = () => {
    markAllAsRead()
    onUpdateBadge?.()
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    setSelectedNotifications([]);
  };

  // Handle view notification
  const handleViewNotification = (id: number) => {
    const findDT: any = notifications?.find((item: any) => item?.id == id)
    if (findDT) {
      setdetailnotiOpen(true)
      setdetailnotiData(findDT)
    }
  };

  // Handle scroll left
  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -200,
        behavior: 'smooth'
      });
    }
  };

  // Handle scroll right
  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 200,
        behavior: 'smooth'
      });
    }
  };

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "isRead",
        header: (info) => {
          return (
            <div className="flex gap-2">
              <input
                type="checkbox"
                checked={selectedNotifications.length === notifications.length && notifications.length > 0}
                onChange={() => handleSelectAll()}
                className="form-checkbox w-5 h-5 border rounded-[8px] accent-[#1473A1] focus:ring-[#1473A1]"
              />
              <div>
                {`Acknowledge`}
              </div>
            </div>
          )
        },
        enableSorting: false,
        accessorFn: (row: any) => selectedNotifications.includes(row.id) ? 'Acknowledged' : 'Not Acknowledged',
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            <input
              type="checkbox"
              checked={selectedNotifications.includes(row.id)}
              onChange={() => handleNotificationSelect(row.id)}
              className="form-checkbox w-5 h-5 border rounded-[8px] accent-[#1473A1] focus:ring-[#1473A1] disabled:opacity-100 disabled:cursor-not-allowed ml-[-8px]"
            />
          )
        }
      },
      {
        accessorKey: "id",
        header: "ID",
        enableSorting: false,
        // accessorFn: (row: any) => row.id || '',
        // sortingFn: myCustomSortingByDateFn,
        // sortingFn: 'datetime', // recommended for date columns 
        // sortUndefined: -1,
        // cell: (info) => {
        //     const row: any = info?.row?.original
        //     return (<div>{row?.gas_day ? toDayjs(row?.gas_day).format('DD/MM/YYYY') : null}</div>)
        // }
      },
      {
        accessorKey: "title",
        header: "Module",
        enableSorting: false,
        meta: {
          width: 200,
        },
        // accessorFn: (row: any) => row?.module || '',
        // cell: (info) => {
        //     const row: any = info?.row?.original
        //     return (<div>{''}</div>)
        // }
      },
      {
        accessorKey: "message",
        header: "Message",
        enableSorting: false,
        // accessorFn: (row: any) => row?.message || '',
        // cell: (info) => {
        //     const row: any = info?.row?.original
        //     return (<div>{row?.message ? row?.message : null}</div>)
        // }
        cell: (info) => {
          const row: any = info?.row?.original
          return (<div className="two-line-ellipsis">{row?.message}</div>)
        }
      },
      {
        accessorKey: "view",
        header: "View",
        enableSorting: false,
        accessorFn: (row: any) => '',
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            <button
              type="button"
              className="flex items-center justify-center px-[2px] py-[2px] rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative"
              onClick={() => handleViewNotification(row.id)}
            >
              <VisibilityOutlined sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
            </button>
          )
        }
      },
      {
        accessorKey: "date",
        header: "Created Date",
        enableSorting: false,
        meta: {
          width: 150,
        },
        accessorFn: (row: any) => row.date ? toDayjs(row.date).format('DD/MM/YYYY HH:mm:ss') : '',
        sortingFn: myCustomSortingByDateFn,
        // sortingFn: 'datetime', // recommended for date columns 
        // sortUndefined: -1,
        // cell: (info) => {
        //     const row: any = info?.row?.original
        //     return (<div>{row?.", ? toDayjs(row?.",).format('DD/MM/YYYY HH:mm:ss') : null}</div>)
        // }
      },
    ], [selectedNotifications]
  )

  const [detailnotiOpen, setdetailnotiOpen] = useState(false);
  const [detailnotiData, setdetailnotiData] = useState<any>();

  return (
    <>
      <Box ref={ref} className="p-6 bg-white w-[1000px] !shadow-xl border-[2px] border-[#e0e0e0] z-40 rounded-md">
        {/* Header */}
        <div className="mb-5">
          <div className="text-[#00ADEF] text-lg font-bold">
            Notification Area
          </div>
          <div className="flex justify-end">
            <BtnGeneral
              textRender={"Acknowledge All"}
              iconNoRender={true}
              bgcolor={"#00ADEF"}
              generalFunc={() => handleAcknowledgeAll()}
              disable={false}
              customWidthSpecific={140}
              // can_create={userPermission ? userPermission?.f_create : false}
              can_create={true}
            />
          </div>
        </div>

        {/* Module Navigation Tabs */}
        <Box className="mb-2">
          <Box className="flex items-center">
            <div
              className={`border-[#DFE4EA] border-[1px] rounded-md cursor-pointer bg-white flex-shrink-0`}
              onClick={handleScrollLeft}
            >
              <KeyboardArrowLeft style={{ fontSize: "20px", marginBottom: "1px" }} />
            </div>

            <Box
              ref={scrollContainerRef}
              className="flex gap-2 overflow-x-auto no-scrollbar flex-1 px-4"
            >
              {moduleTabs.map((tab, index) => (
                <Box
                  key={index}
                  className={`flex items-center gap-2 px-4 py-2 cursor-pointer flex-shrink-0 ${tab.name === activeModule ? "border-b-2 border-[#464255]" : ""
                    }`}
                  onClick={() => setActiveModule(tab.name)}
                >
                  <div
                    className={`text-sm text-[#37352F] ${tab.name === activeModule ? "font-bold" : "font-normal"
                      }`}
                  >
                    {tab.name}
                  </div>
                  {
                    notifications?.some((notification: any) => (notification.title === tab.name) && (notification.isRead != true)) &&
                    <div
                      className={`flex items-center justify-center py-0.5 px-1.5 rounded-[6px] text-white ${tab.name === activeModule ? "bg-[#EB5757]" : "bg-[#9CA3AF]"
                        }`}
                    >
                      <span className="font-bold text-center normal-case text-xs">
                        {`${notifications.filter((notification: any) => (notification.title === tab.name) && (notification.isRead != true)).length}`}
                      </span>
                    </div>
                  }
                </Box>
              ))}
            </Box>

            <div
              className={`border-[#DFE4EA] border-[1px] rounded-md cursor-pointer bg-white flex-shrink-0`}
              onClick={handleScrollRight}
            >
              <KeyboardArrowRight style={{ fontSize: "20px", marginBottom: "1px" }} />
            </div>
          </Box>
        </Box>

        {/* Notification Table */}
        <div className="h-auto overflow-auto">
          <AppTable
            data={notifications.filter((notification: any) => notification.title === activeModule)}
            columns={columns}
            isLoading={true}
            exportBtn={
              <BtnGeneral
                textRender={"Acknowledge"}
                iconNoRender={true}
                bgcolor={"#24AB6A"}
                generalFunc={() => handleAcknowledge()}
                disable={selectedNotifications.length === 0}
                customWidthSpecific={120}
                // can_create={userPermission ? userPermission?.f_create : false}
                can_create={true}
              />
            }
            initialColumns={Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))}
            onColumnVisibilityChange={(columnKey: any) => handleColumnToggle(columnKey)}
            // onFilteredDataChange={(filteredData: any) => {
            //     const newData = filteredData || [];
            //     // Check if the filtered data is different from current dataExport
            //     if (JSON.stringify(dataExport) !== JSON.stringify(newData)) {
            //         setDataExport(newData);
            //     }
            // }}
            pagination={pagination}
            setPagination={setPagination}
            border={false}
            fixHeight={true}
            fullWidth={true}
            tuneOption={false}
            showPagesize={false}
          />
        </div>
      </Box>

      <ModalNotification
        data={detailnotiData}
        open={detailnotiOpen}
        onClose={() => {
          setdetailnotiOpen(false)
          setTimeout(() => {
            setdetailnotiData(null)
          }, 300);
        }}
      />
    </>
  );
});

NotificationArea.displayName = 'NotificationArea';

export default NotificationArea;
