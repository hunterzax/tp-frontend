import { useRouter } from "next/navigation";
import { setCookie } from "@/utils/cookie";
import { getService } from "./postService";
import { clearCookiesAndLocalStorage } from "./generalFormatter";

export const useLogout = () => {
  const router = useRouter();

  const mutateLogout = async () => {
    // const res_update_flag_login: any = await getService(`/master/account-manage/update-flag-logout`);

    // localStorage.removeItem('x9f3w1m8q2y0u5d7v1z');
    // localStorage.removeItem('v4r2d9z5m3h0c1p0x7l');
    // setCookie('v4r2d9z5m3h0c1p0x7l', null, 0);
    // setCookie("redirectAfterLogin", null, 0);
    // router.push('/en/signin');

    try {
      // Initiating logout process...

      // update flag login to false
      const resUpdateFlagLogin: any = await getService(`/master/account-manage/update-flag-logout`);

      if (resUpdateFlagLogin?.success) {
        console.log("Logout successfully");
      } else {
        // Logout flag update failed:
      }

      clearCookiesAndLocalStorage();

      setTimeout(() => {
        router.push("/en/signin");
      }, 300);
    } catch (error) {
      // Error during logout
    }
  };

  return { mutateLogout };
};