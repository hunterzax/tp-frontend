"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getCookie, setCookie } from "@/utils/cookie";
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import PriorityHighOutlinedIcon from '@mui/icons-material/PriorityHighOutlined';
import { getService } from "@/utils/postService";
import { clearCookiesAndLocalStorage } from "@/utils/generalFormatter";
import { decryptData, encryptData } from "@/utils/encryptionData";
// CWE-922 Fix: Use secure storage for user activity tracking
import { secureSessionStorage, memoryStorage } from "@/utils/secureStorage";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const API_URL = process.env.NEXT_PUBLIC_API_URL

import dynamic from 'next/dynamic';
import getCookieValue from "@/utils/getCookieValue";

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    //   border: '2px solid #000',
    //   boxShadow: 24,
    p: 4,
    borderRadius: '10px',
};

const updateLoginListen = async () => {
    try {
        // เอาไว้ update flag login จะได้รู้ว่า user ที่ login นี้ยังอยู่ จะได้เอาไปใช้เช็คตอนจะ login ซ้ำที่ device อื่น
        const res_update_login_listen: any = await getService(`/master/account-manage/update-login-listen`);
        // if (!res_update_login_listen) {
        //     const resUpdateFlagLogin: any = await getService(`/master/account-manage/update-flag-logout`);
        //     clearCookiesAndLocalStorage();
        //     // router.push("/en/signin");
        // }
    } catch (error) {
        // Error res_update_login_listen
    }
};

const InactivityTracker = () => {
    const WSClient = dynamic(() => import('@/components/other/wsClient'), { ssr: false });
    const timeout: any = process.env.NEXT_PUBLIC_SESSION_TIMEOUT

    const [inactive, setInactive] = useState(false);
    const router = useRouter();
    const currentPath = usePathname();

    // เมื่อ logout update auth
    const handleUpdateFlagLogOut = async () => {
        try {
            const res_update_flag_logout: any = await getService(`/master/account-manage/update-flag-logout`);
        } catch (error) {
            // error res_update_flag_logout
        }
    }

    // ยิงเส้น login_listen
    useEffect(() => {
        const intervalId = setInterval(async () => {
            const pathnameY = window.location.pathname;
            if (pathnameY !== "/en/signin" && pathnameY !== '/en/forgot-password') {
                try {
                    await updateLoginListen();
                } catch (error) {
                    // cannot update login listen
                }
            }
        }, 15 * 60 * 1000); // 15 minutes in milliseconds
        return () => clearInterval(intervalId);
    }, []);

    const handleLoginLocalOnce = async () => {
        try {
            const res_ = await getService(`/master/account-manage/account-local-once`);
        } catch (error) {

        }
    }

    useEffect(() => {
        const intervalId = setInterval(async () => {
            const pathnameY = window.location.pathname;
            if (pathnameY !== "/en/signin" && pathnameY !== '/en/forgot-password') {
                try {
                    await handleLoginLocalOnce();
                } catch (error) {
                    // cannot update login listen
                }
            }
            // }, 3 * 60 * 1000); // 3 minutes in milliseconds
        }, 17 * 60 * 1000); // 17 minutes in milliseconds
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const pathname = window.location.pathname;
        const excludedPaths = ['/en/signin', '/en/forgot-password', '/en/reset-password'];

        const isExcludedPath = excludedPaths.some(path => pathname.includes(path));

        const redirectPage = async () => {
            const redirectUrl: any = await getCookiename('redirectAfterLogin');

            if (redirectUrl) {
                router.push(redirectUrl);
            } else {
                router.push('/en/authorization');
            }
        };

        // ⛔️ เงื่อนไข Auto Login เฉพาะหน้า /en/signin เท่านั้น
        if (pathname === '/en/signin') {
            // CWE-922 Fix: Use secure sessionStorage instead of localStorage
            let tokenFromLocalStorage = secureSessionStorage.getItem("v4r2d9z5m3h0c1p0x7l");

            let userData: any = secureSessionStorage.getItem("x9f3w1m8q2y0u5d7v1z");

            let tacData: any = secureSessionStorage.getItem("p5n3b7j2k9s1a6wq8t0");

            let userCheck;
            try {
                userCheck = userData && userData !== "undefined" ? JSON.parse(userData) : null;
            } catch {
                userCheck = null;
            }

            let tacCheck;
            try {
                tacCheck = tacData && tacData !== "undefined" ? JSON.parse(tacData) : null;
            } catch {
                tacCheck = null;
            }

            const hasAcceptedTerms =
                userCheck?.f_t_and_c === true &&
                (userCheck?.t_a_c_url || '') === (tacCheck?.url || '') &&
                tokenFromLocalStorage &&
                userData &&
                tokenFromLocalStorage !== 'undefined' &&
                userData !== 'undefined';

            if (hasAcceptedTerms) {
                toast.dismiss();
                toast.info('User logged in. Redirecting to main menu...', {
                    position: 'bottom-right',
                    autoClose: 3000,
                });

                setTimeout(() => {
                    router.push('/en/authorization');
                }, 500);
                return;
            }

            if (tokenFromLocalStorage && userData) {
                redirectPage();
            }

            // ถ้าไม่มี token หรือ user → ปล่อยให้ login ปกติ
            return;
        }

        // ✅ ถ้า path ไม่ได้อยู่ใน excluded → เริ่มจับ inactivity
        if (!isExcludedPath) {
            const timeoutMs = timeout * 60 * 1000;
            let timeoutId: NodeJS.Timeout;

            const handleInactivity = async () => {
                const currentUser = getCurrentUser();
                let isSuperAdmin = false;

                if (process.env.NODE_ENV !== 'production' && currentUser) {
                    isSuperAdmin = currentUser.account_manage?.some((item: any) =>
                        item?.account_role?.some((role: any) =>
                            role?.role?.name === 'Super Admin Default' || role?.role?.id === 1
                        )
                    );
                }

                if (!isSuperAdmin) {
                    console.log('[Logout] Logging out due to inactivity');
                    await handleUpdateFlagLogOut();
                    await clearCookiesAndLocalStorage();
                    setCookie('redirectAfterLogin', pathname, 1);
                    setInactive(true);
                }
            };

            const resetTimeout = () => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(handleInactivity, timeoutMs);
                // CWE-922 Fix: Use memory storage for activity tracking (non-sensitive)
                memoryStorage.setItem('user-activity', Date.now().toString());
            };

            const syncActivityAcrossTabs = (e: StorageEvent) => {
                if (e.key === 'user-activity') {
                    resetTimeout();
                }
            };

            timeoutId = setTimeout(handleInactivity, timeoutMs);
            window.addEventListener('mousemove', resetTimeout);
            window.addEventListener('keydown', resetTimeout);
            window.addEventListener('storage', syncActivityAcrossTabs);

            return () => {
                clearTimeout(timeoutId);
                window.removeEventListener('mousemove', resetTimeout);
                window.removeEventListener('keydown', resetTimeout);
                window.removeEventListener('storage', syncActivityAcrossTabs);
            };
        }

    }, [router, currentPath]); // 👈 ทำให้ useEffect run ใหม่เมื่อ path เปลี่ยน

    async function getCookiename(name: string) {
        const redirectUrl: any = await getCookie(name);
        return redirectUrl;
    }

    // useEffect(() => {
    //     // Skip timeout logic if on auth-related routes
    //     const excludedPaths = ['en/signin', 'en/forgot-password', 'en/reset-password'];
    //     const currentPath = window.location.pathname;
    //     const pathname = window.location.pathname;

    //     if (excludedPaths.some(path => pathname.includes(path))) {
    //         return;
    //     }

    //     const timeoutMs = timeout * 60 * 1000;
    //     let timeoutId: NodeJS.Timeout;

    //     const handleInactivity = async () => {
    //         // Only allow super admin bypass in non-production environments
    //         let isSuperAdmin = false
    //         if (process.env.NODE_ENV !== 'production') {
    //             const currentUser = getCurrentUser();
    //             isSuperAdmin = currentUser?.account_manage?.some((item: any) =>
    //                 item?.account_role?.some((account_role: any) =>
    //                     account_role?.role?.name == 'Super Admin Default' || account_role?.role?.id == 1
    //                 )
    //             );
    //         }

    //         if (!isSuperAdmin) {
    //             await handleUpdateFlagLogOut();
    //             await clearCookiesAndLocalStorage();
    //             setCookie("redirectAfterLogin", pathname, 1); // ถ้าโดนเด้งออก เพราะ session expire ตอนกลับเข้ามาจะได้อยู่หน้าเดิม
    //             setInactive(true);
    //         }
    //     };

    //     const resetTimeout = () => {
    //         clearTimeout(timeoutId);
    //         timeoutId = setTimeout(handleInactivity, timeoutMs);
    //         localStorage.setItem('user-activity', Date.now().toString());
    //     };

    //     const syncActivityAcrossTabs = (e: StorageEvent) => {
    //         if (e.key === 'user-activity') {
    //             clearTimeout(timeoutId);
    //             timeoutId = setTimeout(handleInactivity, timeoutMs);
    //         }
    //     };

    //     window.addEventListener('mousemove', resetTimeout);
    //     window.addEventListener('keydown', resetTimeout);
    //     window.addEventListener('storage', syncActivityAcrossTabs);
    //     timeoutId = setTimeout(handleInactivity, timeoutMs);

    //     return () => {
    //         clearTimeout(timeoutId);
    //         window.removeEventListener('mousemove', resetTimeout);
    //         window.removeEventListener('keydown', resetTimeout);
    //         window.removeEventListener('storage', syncActivityAcrossTabs);
    //     };
    // }, []);


    // หน้า sign in ควร redirect ไปที่ หน้าเลือก Menu ในกรณีที่ Login แล้ว https://app.clickup.com/t/86er08ynj
    // เมื่อ user logout ควรเด้งไปที่หน้า Sign in https://app.clickup.com/t/86er08ynn
    // useEffect(() => {
    //     const intervalId = setInterval(() => {
    //         const pathname = window.location.pathname;

    //         // const tokenFromLocalStorage = localStorage.getItem("v4r2d9z5m3h0c1p0x7l");
    //         // const userData: any = localStorage.getItem("x9f3w1m8q2y0u5d7v1z");
    //         // const tacData: any = localStorage.getItem("p5n3b7j2k9s1a6wq8t0");
    //         let tokenFromLocalStorage = localStorage.getItem("v4r2d9z5m3h0c1p0x7l");
    //         tokenFromLocalStorage = tokenFromLocalStorage ? decryptData(tokenFromLocalStorage) : null;

    //         let userData: any = localStorage.getItem("x9f3w1m8q2y0u5d7v1z");
    //         userData = userData ? decryptData(userData) : null;

    //         let tacData: any = localStorage.getItem("p5n3b7j2k9s1a6wq8t0");
    //         tacData = tacData ? decryptData(tacData) : null;

    //         let userCheck;
    //         try {
    //             userCheck = userData && userData !== "undefined" ? JSON.parse(userData) : null;
    //         } catch (error) {
    //             // Invalid JSON
    //             userCheck = null;
    //         }
    //         let tacCheck;
    //         try {
    //             tacCheck = tacData && tacData !== "undefined" ? JSON.parse(tacData) : null;
    //         } catch (error) {
    //             // Invalid JSON
    //             tacCheck = null;
    //         }

    //         // ถ้าอยู่หน้า sign in หรือ reset password อยู่แล้วจะไม่ redirect
    //         if ((!tokenFromLocalStorage || !userData) && pathname !== "/en/signin" && pathname !== "/en/forgot-password" && pathname !== "/en/reset-password" && !currentPath.includes("/en/reset-password") && !currentPath.includes("en/reset-password?ref")) {
    //             // Only allow super admin bypass in non-production environments
    //             let isSuperAdmin = false
    //             const currentUser = getCurrentUser();
    //             if (process.env.NODE_ENV !== 'production') {
    //                 isSuperAdmin = currentUser?.account_manage?.some((item: any) =>
    //                     item?.account_role?.some((account_role: any) =>
    //                         account_role?.role?.name == 'Super Admin Default' || account_role?.role?.id == 1
    //                     )
    //                 );
    //             }

    //             if (!isSuperAdmin) {
    //                 if (!currentUser) {
    //                     clearCookiesAndLocalStorage(); // เติมมา ให้แน่ใจว่าทุกการ route ไป sign in จะโดนเคลียร์
    //                     clearInterval(intervalId);
    //                     setCookie("redirectAfterLogin", pathname, 1); // ถ้าโดนเด้งออก เพราะ session expire ตอนกลับเข้ามาจะได้อยู่หน้าเดิม
    //                     router.push(`/en/signin`);
    //                 }
    //             }
    //         }

    //         // ถ้ามี token แล้วยังไม่ได้กด accept t&c จะไม่ redirect
    //         if (userCheck && userCheck?.f_t_and_c == true &&
    //             (userCheck?.t_a_c_url || '') == (tacCheck?.url || '') &&
    //             tokenFromLocalStorage && userData &&
    //             tokenFromLocalStorage !== 'undefined' &&
    //             userData !== 'undefined' &&
    //             (pathname == "/en/signin" || pathname == "/en/forgot-password" || currentPath.includes("/en/reset-password"))
    //         ) {
    //             toast.dismiss();
    //             toast.info('User logged in. Redirecting to main menu...', {
    //                 position: 'bottom-right',
    //                 autoClose: 3000,
    //             });

    //             clearInterval(intervalId);
    //             setTimeout(() => {
    //                 // ตรงที่ auto เข้ามันอยู่นี่
    //                 // ปล่อย session expired แล้ว ปิดแถบ แล้ววันต่อมา มาเปิดใหม่ คีย์ user/password auto กำลังจะคีย์ captcha แล้วมันก็ login เข้ามา auto เลย แล้วพอระบบ auto login เข้ามาสักพักแล้ว ระบบก็ดีดออก https://app.clickup.com/t/86eub6d1q
    //                 // เดวทำเช็คว่าถ้า localStorage มันไม่มีของ จะไม่ route ไป
    //                 router.push(`/en/authorization`);
    //             }, 500);
    //         }
    //     }, 2000);


    //     return () => clearInterval(intervalId); // Cleanup on unmount
    // }, [router, currentPath]);

    useEffect(() => {
        const excludedPaths = [
            '/en/signin',
            '/en/forgot-password',
            '/en/reset-password',
        ];
        const currentPath = location.pathname;

        if (excludedPaths.includes(currentPath)) {
            return;
        }

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = ''; // Required for Chrome to show the dialog
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [location.pathname]);

    useEffect(() => {
        const handleOffline = () => {
            toast.warning('You are offline. All features will not work.', {
                position: 'bottom-right',
                autoClose: false,
            });
        };

        const handleOnline = () => {
            toast.dismiss(); // Remove offline warning
            toast.success('Back online!', {
                position: 'bottom-right',
                autoClose: 3000,
            });
        };

        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);

        // Initial check
        if (!navigator.onLine) {
            handleOffline();
        }

        return () => {
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
        };
    }, []);

    const handleLoginRedirect = () => {
        setInactive(false);
        router.push("/en/signin");
    };

    const getCurrentUser = () => {
        // CWE-922 Fix: Use secure sessionStorage instead of localStorage
        let userData: any = secureSessionStorage.getItem("x9f3w1m8q2y0u5d7v1z");

        let userCheck;
        try {
            userCheck = userData && userData !== "undefined" ? (typeof userData === 'string' ? JSON.parse(userData) : userData) : null;
            return userCheck;
        } catch (error) {
            // Invalid JSON at get user of inactivity tracker
            return null;
        }
    };

    return (
        <>
            <WSClient />
            <ToastContainer />
            <Modal open={inactive} onClose={handleLoginRedirect}>
                <Box sx={style}>
                    <div className="flex items-center justify-center pb-2">
                        <div className={`flex items-center justify-center w-12 h-12 bg-[#fff9cb] text-[#EED202]  rounded-full`}>
                            <PriorityHighOutlinedIcon />
                        </div>
                    </div>
                    <div className={`flex pb-2 justify-center text-[#EED202] text-2`}>
                        {`Session Expired`}
                    </div>
                    <div className="flex p-4 justify-center text-[#637381] text-ellipsis text-center">
                        {`Your session has expired due to inactivity. Please log in again to continue.`}
                    </div>
                    <div className='flex pt-4 justify-center'>
                        <button
                            type='button'
                            onClick={handleLoginRedirect}
                            className="w-[120px] h-[40px] bg-blue-500 text-white hover:bg-blue-600 rounded-md"
                        >
                            {`OK`}
                        </button>
                    </div>
                </Box>
            </Modal>
        </>

    );
};

export default InactivityTracker;