import { useQuery } from "@tanstack/react-query";
import { axiosInstance, axiosInstanceDemo } from "@/utils/axiosInstance";
import axios from "axios";
import useSWR from 'swr';

const API_URL = process.env.NEXT_PUBLIC_API_URL

// export const usePokemonAll = (name: string) => {
//   return useQuery({
//     queryKey: ["pokemonAll"],
//     queryFn: async () => {
//       const { data } = await axiosInstanceDemo.get(name);
//       return data;
//     },
//     enabled: !!name, // enable query only if name is not empty
//     staleTime: 1000 * 60, // 1 minute
//     refetchOnWindowFocus: 'always',
//   });
// };

export const fetchDivisionMasterX = async (token: any) => {
    // CWE-918 Fix: Validate URL path before making request
    const { buildSafeApiUrl, isValidApiPath } = await import('@/utils/urlValidator');
    const apiPath = '/master/account-manage/division-master';

    if (!isValidApiPath(apiPath)) {
        throw new Error('Invalid API path detected');
    }

    const safeUrl = buildSafeApiUrl(API_URL, apiPath);
    if (!safeUrl) {
        throw new Error('Failed to construct safe URL');
    }

    // CWE-644 Fix: Validate and sanitize token before using in header
    const { buildSafeAuthHeader } = await import('@/utils/headerValidator');
    const authHeader = buildSafeAuthHeader(token);
    if (!authHeader) {
        throw new Error('Invalid authentication token format');
    }

    const response: any = await fetch(safeUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader,
        },
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    return response.json();
};

export const useAreaData = () => {
    return useQuery({
        queryKey: ["area"],
        queryFn: async () => {
            // const { data } = await axiosInstanceDemo.get(`/area/xxxxx/${name}`);
            const { data } = await axiosInstance.get(`/area/xxxxx`);
            return data;
        },
        //   enabled: !!name, // enable query only if name is not empty
        staleTime: 1000 * 60, // 1 minute
    });
};

export const fetchAccMgnData = async (queryKey: any) => {
    const { data } = await axiosInstanceDemo.get(`/pokemon/mewtwo`);
    return data;
};

export const useAccMgnData = (queryKey: any) => {
    return useQuery({
        queryKey: ["accMgn", queryKey],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/master/account-manage/${queryKey}`);
            return data;
        },
        //   enabled: !!name, // enable query only if name is not empty
        staleTime: 1000 * 60, // 1 minute
    });
};

// Define a fetcher function using axios with URL validation
const fetcher = async (url: string) => {
    // CWE-918 Fix: Validate URL before fetching
    // Note: This fetcher accepts full URLs, so we validate differently
    try {
        const urlObj = new URL(url);
        // Only allow configured API URLs
        const allowedHosts = [
            process.env.NEXT_PUBLIC_API_URL,
            process.env.API_URL
        ].filter(Boolean).map(u => u ? new URL(u).host : '').filter(Boolean);

        if (!allowedHosts.includes(urlObj.host)) {
            throw new Error('URL host not allowed');
        }

        return axios.get(url, { timeout: 600000 }).then(res => res.data);
    } catch (error) {
        throw new Error('Invalid or disallowed URL');
    }
};

// Custom hook to fetch master data
export const useMasterData = (url: any) => {
    const { data, error, isLoading } = useSWR(`${url}`, fetcher, {
        revalidateOnFocus: false, // Optional: Prevents refetching when the window is refocused
        dedupingInterval: 60000,  // Optional: Cache the data for 1 minute
    });

    return {
        data,
        isLoading,
        error,
    };
};