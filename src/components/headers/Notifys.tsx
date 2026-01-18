"use client";
import NotificationsIcon from "@mui/icons-material/Notifications";
import {
  /* @ts-ignore */
  Menu,
  /* @ts-ignore */
  MenuHandler,
  /* @ts-ignore */
  MenuList,
  /* @ts-ignore */
  MenuItem,
  /* @ts-ignore */
  Button,
  /* @ts-ignore */
  Badge,
} from "@material-tailwind/react";
import { useEffect, useRef, useState } from "react";
import { getStoredNotifications, markAllAsRead, storeNotification, storeNotificationList } from "@/components/other/notifyStorage";
import getUserValue from "@/utils/getuserValue";
import NotificationArea from "@/components/headers/NotificationArea";
import axios from "axios";

const Notifys = () => {

  const userDT: any = getUserValue();
  const userEmail = userDT?.email;
  const [notifList, setNotifList] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<any>();

  const refreshNotifications = async () => {

    try {
      const limit = 100;
      let size = 0;
      let since: any = null;

      do {
        // Wait 0.5 second before next loop
        await new Promise(resolve => setTimeout(resolve, 500)); // --> coverity security

        const response = await axios.get(
          `/api/notifications?limit=${limit}&userEmail=${encodeURIComponent(userEmail)}${since ? `&since=${since}` : ''
          }`,
          { timeout: 600000 }
        );

        const res = response?.data?.messages ?? [];
        const paging = response?.data?.paging;

        storeNotificationList(res);

        const uniqueNotifications = [...notifList, ...res].filter(
          (notification, index, self) =>
            index === self.findIndex(n => n.id === notification.id)
        );
        setNotifList(uniqueNotifications);

        if (!since) {
          const storedNotiList = getStoredNotifications();
          setUnreadCount(
            res?.filter((item: any) => {
              const exist = storedNotiList.find((n: any) => n.id === item.id);
              return exist ? !exist.isRead : true;
            }).length
          );
        }

        // Find the oldest ID from the current batch of notifications
        since = response?.data?.oldestId;
        size = paging?.size ?? 0;
      } while (size >= limit);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Axios error
      } else {
        // Unexpected error
      }

      // ❌ เอา throw error ออก → จะไม่โยน error ไปข้างนอกแล้วโค้ดไม่แตก
      // ✅ แทนด้วย return ค่า default
      setNotifList(getStoredNotifications());
    } finally {
      // Fallback to stored notifications
      const storedNotiList = getStoredNotifications();
      setNotifList(storedNotiList);
      setUnreadCount(storedNotiList?.filter((n: any) => !n.isRead).length);
    }

  };

  // const unreadCount:any = notifList.filter((n) => !n.isRead).length;

  // WEB SOCKET
  const ws: any = useRef(null);
  // ws.current = new WebSocket('wss://gotify.i24.dev//stream?token=Csj4oQ_rckZphe3');
  // ws.current.onopen = () => {
  //   // ws.current.send(JSON.stringify({ type: 'hello', payload: 'Hi Server!' }));
  // };

  // const userEmail = "devk@gmail.com"; // สมมุติ email ตัวเอง
  useEffect(() => {
    // WebSocket connected
    refreshNotifications(); // โหลดเมื่อเปิดหน้า
    let notiInAppDomain = process.env.NEXT_PUBLIC_NOTI_IN_APP_DOMAIN ?? ''
    const notiInAppToken = process.env.NEXT_PUBLIC_NOTI_IN_APP_TOKEN ?? ''
    notiInAppDomain = notiInAppDomain.replace("https://", "")
    notiInAppDomain = notiInAppDomain.replace("http://", "")
    ws.current = new WebSocket(`wss://${notiInAppDomain}//stream?token=${notiInAppToken}`);
    ws.current.onmessage = (message: any) => {
      const response = JSON.parse(message.data);
      const isTarget = response?.extras?.email?.includes(userEmail);

      if (isTarget) {
        storeNotification({
          id: response?.id,
          title: response?.title,
          message: response?.message,
          create_date: response?.date,
          date: response?.date,
          extras: response?.extras,
        });
        // refreshNotifications();
        const storedNotiList = getStoredNotifications()
        setNotifList(storedNotiList);
        setUnreadCount(storedNotiList?.filter((n: any) => !n.isRead).length)
      }
    };

    return () => ws.current?.close();
  }, []);

  const noti_example: any = [
    // {
    //   id: 1,
    //   first_name: "k",
    //   last_name: "",
    //   detail: "now I believe we live in hell.",
    //   create_date: "2024-10-01T00:00:00.000Z"
    // },
    // {
    //   id: 2,
    //   first_name: "G.",
    //   last_name: "prayuth",
    //   detail: "order 44",
    //   create_date: "2024-10-01T00:00:00.000Z"
    // },
  ]

  return (
    <Menu>
      <Badge
        content={unreadCount > 99 ? '99+' : unreadCount}
        placement="top-end"
        withBorder
        className={unreadCount > 0 ? '' : 'hidden'}
      >
        <MenuHandler>
          <Button
            variant="text"
            className="p-0 m-0 flex items-center gap-2"
            onClick={() => {
              markAllAsRead();
              try {
                refreshNotifications(); // refresh list from localStorage
              } catch (error) {
                // Failed to refresh notifications
              }
            }}
          >
            <NotificationsIcon className="text-[#58585A]" />
          </Button>
        </MenuHandler>
      </Badge>

      <div className="flex">
        <MenuList className="grid grid-cols-1 p-0 w-auto overflow-hidden">
          <NotificationArea data={notifList} onUpdateBadge={() => {
            const storedNotiList = getStoredNotifications()
            setUnreadCount(storedNotiList?.filter((n: any) => !n.isRead).length)
          }} />
          {/* <div className="text-[#374151] items-center justify-center col-span-3 px-4 py-3 font-bold"> {`Notification`} </div> */}

          {/* ของปลอม */}
          {/* {
              (noti_example.map((item: any, ix: number) => {
                return (
                  <MenuItem key={ix} className=" w-[300px] h-[100px] border rounded-none col-span-3 bg-[#ffffff] text-[#374151] text-xs">
                    <div className="grid font-bold text-[#1C2434] !text-[14px]">{item?.first_name}{` `}{item?.last_name}</div>
                    <div className="grid pt-2 text-[#66768C] !text-[14px]">{item?.detail}</div>
                    <div className="grid pt-2 text-[#00ADEF] font-bold !text-[12px]">{item?.create_date ? formatDateMonthName(item?.create_date) : ''}</div>
                  </MenuItem>
                )
              }))
            } */}


          {/* ของแท้ */}
          {/* {
              notifList.map((item: any, ix: number) => (
                <MenuItem key={ix} className="w-[300px] h-[100px] border rounded-none col-span-3 bg-white text-[#374151] text-xs">
                  <div className="font-bold text-[#1C2434] text-[14px]">{item.title}</div>
                  <div className="pt-2 text-[#66768C] text-[14px]">{item.message}</div>
                  <div className="pt-2 text-[#00ADEF] font-bold text-[12px]">
                    {item.create_date ? formatDateMonthName(item.create_date) : ''}
                  </div>
                </MenuItem>
              ))
            } */}

          {/* ของแท้ 2 */}
          {
            // notifList?.map((item: any, ix: number) => (
            //   <MenuItem
            //     key={ix}
            //     className="w-[300px] border rounded-none col-span-3 bg-white text-[#374151] text-pretty text-xs py-3"
            //   >
            //     <div className="font-bold text-[#1C2434] text-[14px]">{item.title}</div>
            //     {/* <div className="pt-2 text-[#66768C] text-[14px] whitespace-pre-line break-words">{item.message}</div> */}
            //     <div
            //       className="pt-2 text-[#66768C] text-[14px] whitespace-pre-line break-words line-clamp-3"
            //     >
            //       {item.message}
            //     </div>

            //     {/* Tooltip ครอบข้อความ */}
            //     {/* <Tooltip title={item.message} placement="top-start" arrow>
            //       <div
            //         className="pt-2 text-[#66768C] text-[14px] whitespace-pre-line break-words line-clamp-3 cursor-pointer"
            //       >
            //         {item.message}
            //       </div>
            //     </Tooltip> */}

            //     <div className="pt-2 text-[#00ADEF] font-bold text-[12px]">
            //       {item.create_date ? formatDateMonthName(item.create_date) : ''}
            //     </div>
            //   </MenuItem>
            // ))
          }

        </MenuList>
      </div>

    </Menu>
  );
}

export default Notifys;