"use client"
import React from 'react'
import TimeCount from './TimeCount';
/* @ts-ignore */
import { Breadcrumbs } from "@material-tailwind/react";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { usePathname } from 'next/navigation';
import getUserValue from "@/utils/getuserValue";
import { decryptData } from '@/utils/encryptionData';


function BreadcrumbsMenu({ menu, goToUrl }: any) {
  const pathname = usePathname();
  const pathsplit = pathname.split("/");

  const gradient_tso = "linear-gradient(90deg, #0BACF2 0%, #4BB285 100%)"
  const gradient_shipper = "linear-gradient(90deg, #0BACF2 0%, #B24B89 100%)"

  // const userDT: any = getUserValue();
  let getuserDT: any = localStorage?.getItem("x9f3w1m8q2y0u5d7v1z");
  getuserDT = getuserDT ? decryptData(getuserDT) : null;
  const userDT: any = getuserDT ? JSON.parse(getuserDT) : {}

  const renderBreadcrumb = () => {
    return (
      <Breadcrumbs
        separator={
          !!pathname.split("/")[4] && <KeyboardArrowRightIcon
            className="h-4 w-4 text-white"
            strokeWidth={2.5}
          />
        }
        className="m-0 p-0 bg-inherit"
      >
        <div
          className=" cursor-pointer hover:opacity-80 text-white font-bold"
          onClick={() => {
            goToUrl(menu?.url);
          }}
        >
          {menu?.name || "-"}
        </div>
        {renderChildren()}
      </Breadcrumbs>
    )
  }

  const renderChildren = () => {
    for (let index = 0; index < pathsplit?.length; index++) {
      if (pathsplit?.length > 3 && index + 1 > 3) {
        // let test = await findItem(menu?.menu, pathsplit[index] + "/" + pathsplit[index + 1])
      } else {

      }
    }

    if (pathsplit[4]) {
      // let findChildren: any = menu?.menu.find((item: any) => item?.url == pathsplit[3] + "/" + pathsplit[4]);
   
      if (pathsplit[5]) {
        let findSubChild
        return (
          <>
            <div className=" cursor-not-allowed opacity-80 text-white font-bold">
              {findItem(menu?.menu, pathsplit[3] + "/" + pathsplit[4])}
            </div>
            {/* <div className=" cursor-not-allowed opacity-80 text-white font-bold">
            {findItem(menu?.menu, pathsplit[3] + "/" + pathsplit[4])} xxxx
          </div> */}
          </>
        )
      }
      return (
        <div className=" cursor-not-allowed opacity-80 text-white font-bold">
          {findItem(menu?.menu, pathsplit[3] + "/" + pathsplit[4])}
        </div>
      )
    } else {
      // nothing
    }
  }

  function findItem(items: any, path: any) {
    let findChildren: any = items?.find((item: any) => item?.url == path);
    return findChildren?.name
  }

  const renderItem = (mode: "group" | "normal") => {
    // return 
    if (mode == "group") {
      return (
        <Breadcrumbs
          separator={
            !!pathname.split("/")[4] && <KeyboardArrowRightIcon
              className="h-4 w-4 text-white"
              strokeWidth={2.5}
            />
          }
          className="m-0 p-0 bg-inherit"
        >
          <div
            className=" cursor-pointer hover:opacity-80 text-white font-bold"
            onClick={() => {
              goToUrl(menu?.url);
            }}
          >
            {menu?.name || "-"}
          </div>
          {!!pathname.split("/")[4] && (
            <>
              <div className=" cursor-not-allowed opacity-80 text-white font-bold">
                {menu?.menu.find((f: any) => {
                  return (f?.url === `${pathname.split("/")[3]}/${pathname.split("/")[4]}`);
                })?.name || null}
              </div>
            </>
          )}
          {!!pathname.split("/")[5] && (
            <>
              <div className=" cursor-not-allowed opacity-80 text-white font-bold">
                {menu?.menu
                  .find((f: any) => {
                    return (f?.url === `${pathname.split("/")[3]}/${pathname.split("/")[4]}`);
                  })
                  ?.menu.find((f: any) => {
                    return (
                      f?.url === `${pathname.split("/")[3]}/${pathname.split("/")[4]}/${pathname.split("/")[5]}`
                    );
                  })?.name || null}
              </div>
            </>
          )}
          <div className=" cursor-not-allowed opacity-80 text-white font-bold capitalize">
            {pathname.split("/")[6] + " group"}
          </div>
        </Breadcrumbs>
      )
    } else {
      return (
        <Breadcrumbs
          separator={
            !!pathname.split("/")[4] && <KeyboardArrowRightIcon
              className="h-4 w-4 text-white"
              strokeWidth={2.5}
            />
          }
          className="m-0 p-0 bg-inherit"
        >
          <div
            className=" cursor-pointer hover:opacity-80 text-white font-bold"
            onClick={() => {
              goToUrl(menu?.url);
            }}
          >
            {menu?.name || "-"}
          </div>
          {!!pathname.split("/")[4] && (
            <>
              <div className=" cursor-not-allowed opacity-80 text-white font-bold">
                {menu?.menu.find((f: any) => {
                  return (f?.url === `${pathname.split("/")[3]}/${pathname.split("/")[4]}`);
                })?.name || null}
              </div>
            </>
          )}
          {!!pathname.split("/")[5] && (
            <>
              <div className=" cursor-not-allowed opacity-80 text-white font-bold">
                {menu?.menu
                  .find((f: any) => {
                    return (f?.url === `${pathname.split("/")[3]}/${pathname.split("/")[4]}`);
                  })
                  ?.menu.find((f: any) => {
                    return (
                      f?.url === `${pathname.split("/")[3]}/${pathname.split("/")[4]}/${pathname.split("/")[5]}`
                    );
                  })?.name || null}
              </div>
            </>
          )}
          {/* {pathname.split("/")[6] == "Group" ? "x" : null} */}
        </Breadcrumbs>
      )
    }
  }

  if (pathname.split("/")[3] == "profile") {
    return (
      <section
        className=" flex justify-between items-center h-[55px] px-2 text-white"
        style={{
          // background: "linear-gradient(90deg, #0BACF2 0%, #4BB285 100%)", 
          // background: "linear-gradient(90deg, #0BACF2 0%, #B24B89 100%)",
          background: userDT?.account_manage[0]?.user_type?.id !== 3 ? gradient_tso : gradient_shipper,
        }}
      >
        <Breadcrumbs
          className="m-0 p-0 bg-inherit"
        >
          <div
            className=" cursor-pointer hover:opacity-80 text-white font-bold"
            onClick={() => {
              goToUrl(pathname);
            }}
          >
            {`My Profile`}
          </div>
        </Breadcrumbs>
        <TimeCount modeShow={`in`} className={`flex items-center font-light`} onSplit={true} />
      </section>
    )
  } else {
    return (
      <section
        className=" flex justify-between items-center h-[55px] px-2 text-white"
        style={{
          // background: "linear-gradient(90deg, #0BACF2 0%, #4BB285 100%)",
          // background: "linear-gradient(90deg, #0BACF2 0%, #B24B89 100%)",
          background: userDT?.account_manage[0]?.user_type?.id !== 3 ? gradient_tso : gradient_shipper,
        }}
      >
        {/* {pathname?.split("/")[5] !== "group" ? 
          renderItem("normal")
        :pathname?.split("/")[5] == "group" &&
          renderItem("group")
        } */}
        {renderBreadcrumb()}
        <TimeCount modeShow={`in`} className={`flex items-center font-light`} onSplit={true} />
      </section>
    )
  }

}

export default BreadcrumbsMenu