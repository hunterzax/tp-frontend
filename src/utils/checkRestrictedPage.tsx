"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { decryptData } from "./encryptionData";

// import { usePathname, useRouter } from "next/navigation";

// const restrictedPages = ["/restricted-page", "/another-restricted-page"];

// let authorize_url: any = localStorage?.getItem("o8g4z3q9f1v5e2n7k6t");
// const isRestrictedPage = (pathname: any) => JSON.parse(authorize_url).includes(pathname);
// export default useRestrictedPage;

const useRestrictedPage = (token: any) => {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (typeof window === "undefined") return;

        // const authorize_url = localStorage.getItem("o8g4z3q9f1v5e2n7k6t");
        let authorize_url = localStorage.getItem("o8g4z3q9f1v5e2n7k6t");
        authorize_url = authorize_url ? decryptData(authorize_url) : null;
        if (!authorize_url) return;

        const isRestrictedPage = (pathname: string) =>
            JSON.parse(authorize_url || "[]").includes(pathname);

        if (isRestrictedPage(pathname) && !token) {
            // Access denied. Redirecting to signin...
            router.push(`/en/signin`);
        } else if (!isRestrictedPage(pathname) && token) {
            // Access restricted. Redirecting to authorization...
            router.push(`/en/authorization`);
        }
    }, [pathname, token, router]);
};

export default useRestrictedPage;