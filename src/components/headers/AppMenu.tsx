"use client";
import AppsIcon from "@mui/icons-material/Apps";
import { useEffect, useState } from "react";
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
} from "@material-tailwind/react";
import tempMenu from "./tempMenu";
import { useRouter } from "next/navigation";

function AppMenu() {
  const router = useRouter();
  const [menus, setMenus] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const result = await tempMenu();
        if (isMounted && Array.isArray(result)) {
          setMenus(result);
        }
      } catch (error) {
        if (isMounted) {
          setMenus([]);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleClick = async (data: any) => {
    if (data == 'pmis.pipeline.pttplc.com/smartTSO/login.php') {
      const href = /^https?:\/\//i.test(data) ? data : `https://${data}`;
      window.open(href, '_blank', 'noopener,noreferrer');
    } else {
      router.push(`/en/authorization/${data}`);
    }
  };

  return (
    <>
      <Menu>
        <MenuHandler>
          <Button variant="text" className="p-0 m-0 -ml-2 flex items-center gap-2">
            <AppsIcon className=" text-[#58585A]" />
          </Button>
        </MenuHandler>

        <div className="flex">
          <MenuList className="grid grid-cols-3 p-0">
            <div className="text-[#8A99AF] col-span-3 px-4 py-3 font-bold"> {`Menu`} </div>
            {
              menus.map((item: any, ix: number) => {

                return (
                  <MenuItem
                    key={ix}
                    className=" w-[120px] h-[80px] border rounded-none grid items-center justify-center bg-[#ffffff] text-[#374151] text-xs"
                    onClick={() => handleClick(item?.url)}
                  >
                    <div className="grid items-center justify-center text-[#9CA3AF]">{item?.icon}</div>
                    <div className="grid items-center justify-center text-center pt-2 text-[#374151]">{item?.name}</div>
                  </MenuItem>
                )
              })
            }
          </MenuList>
        </div>
      </Menu >
    </>
  );
}

export default AppMenu;
