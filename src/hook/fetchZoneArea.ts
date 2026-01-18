import { fetchAreaMaster } from "@/utils/store/slices/areaMasterSlice";
import { fetchZoneMasterSlice } from "@/utils/store/slices/zoneMasterSlice";

export const fetchAllZoneArea = async (dispatch:any, token?:any) => {

    const apiCalls = [
        fetchZoneMasterSlice(), 
        fetchAreaMaster(), 
    ];

    // const apiCalls = [
    //     fetchAreaMaster(),
    // ];

    for (const apiCall of apiCalls) {
        try {
            await dispatch(apiCall);
            await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
            // Error fetching data from API:
        }
    }
};