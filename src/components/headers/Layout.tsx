"use client";
import Image from "next/image";
import getUserValue from "@/utils/getuserValue";
import Profile from "./Profile";
import { useRouter } from "next/navigation";
import LogoutIcon from "@mui/icons-material/Logout";
import ModalComponent from "../other/ResponseModal";
import { useState } from "react";
import { getService } from "@/utils/postService";
import { clearCookiesAndLocalStorage } from "@/utils/generalFormatter";

function LayoutHeader() {

  const router = useRouter();
  const userDT: any = getUserValue();
  const [isModalLogout, setisModalLogout] = useState<boolean>(false);

  async function mutateLogout() {

    try {
      // Initiating logout process...
      const resUpdateFlagLogout: any = await getService(`/master/account-manage/update-flag-logout`);
      if (resUpdateFlagLogout?.success) {
        // Logout flag successfully updated.
      } else {
        // Logout flag update failed
      }

      clearCookiesAndLocalStorage();

      setTimeout(() => {
        router.push("/en/signin");
      }, 300);
    } catch (error) {
      // Error during logout
    }
  }

  return (
    // <header className="fixed top-0 left-0 w-screen flex items-center justify-between px-[15px] sm:px-[15px] md:px-[30px] lg:px-[3rem] py-[10px] sm:py-[10px] md:py-[35px] lg:py-[2rem] h-[40px] sm:h-[60px] md:h-[100px] lg:h-[120px] xl:h-[150px]">
    <header className="h-full w-full flex items-center justify-between">
      <Image
        src={`/assets/icon/ptt-logo-2.svg`}
        width={60}
        height={26.25}
        alt={`/assets/icon/ptt-logo-2.svg`}
        priority
        className="w-[50px] sm:w-[70px] md:w-[100px] lg:w-[100px] xl:w-[8vw] h-auto duration-200 ease-in-out"
      />
      <div className="flex items-center gap-2">
        <Profile mode="out" />
        {/* <div className="ml-[10px]" onClick={() => mutateLogout()}> */}
        <div className="ml-[15px]" onClick={() => setisModalLogout(true)}>
          <LogoutIcon className="cursor-pointer text-[#1B1464] !text-[12px] sm:!text-[14px] md:!text-[18px] lg:!text-[20px] xl:!text-[24px]" />
        </div>

        <ModalComponent
          open={isModalLogout}
          handleClose={async (e: any) => {
            if (e == "submit") {
              await mutateLogout()
            } else {
              setisModalLogout(false);
            }
          }}
          title="Log out"
          description={
            <div className="text-center text-[16px]">
              {"Are you sure you want to log out ?"}
            </div>
          }
          stat="logout"
          btnmode="split"
          btnsplit1="Log out"
          btnsplit2="Cancel"
        />
      </div>
    </header>
  );
}

export default LayoutHeader;
