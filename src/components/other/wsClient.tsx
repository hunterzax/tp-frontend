// components/WSClient.js
import { useEffect, useRef } from 'react';

export default function WSClient() {
  const ws: any = useRef(null);

  useEffect(() => {
    let notiInAppDomain = process.env.NEXT_PUBLIC_NOTI_IN_APP_DOMAIN ?? ''
    const notiInAppToken = process.env.NEXT_PUBLIC_NOTI_IN_APP_TOKEN ?? ''
    notiInAppDomain = notiInAppDomain.replace("https://", "")
    notiInAppDomain = notiInAppDomain.replace("http://", "")
    
    // ws.current = new WebSocket('wss://echo.websocket.events');
    ws.current = new WebSocket(`wss://${notiInAppDomain}//stream?token=${notiInAppToken}`);

    ws.current.onopen = () => {
      // WebSocket connected main
      // ws.current.send(JSON.stringify({ type: 'hello', payload: 'Hi Server!' }));
    };

    ws.current.onmessage = (message: any) => {
      // ตัวอย่าง response
      //   {
      //     "id": 18,
      //     "appid": 1,
      //     "message": "The allocation and balancing process for all shippers and the following period of time: {11/07/2025 to 11/07/2025} {has finished OK} {(process executed on Fri, 11 Jul 2025 08:51:43 GMT)}.",
      //     "title": "Execute EOD",
      //     "priority": 12,
      //     "extras": {
      //         "email": [
      //             "devk@gmail.com",
      //             "devk@gmail.com",
      //         ]
      //     },
      //     "date": "2025-07-11T08:51:44.180232879Z"
      // }

      // 1. หา email ของตัวเอง ใน extras.email
      // 2. เอา title กะ message ไปแสดง

    };

    // จะเก็บ reponse จาก websocket และนำไปแสดงผลใน 

    ws.current.onclose = () => {
      // WebSocket closed
    };

    ws.current.onerror = (error: any) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.current.close();
    };
  }, []);

  return <></>
}