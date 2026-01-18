import getCookieValue from '@/utils/getCookieValue';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { buildSafeApiUrl, isValidApiPath } from '@/utils/urlValidator';

const API_URL = process.env.NEXT_PUBLIC_API_URL
const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");

export const fetchAnnouncementMaster = createAsyncThunk(
    'announcement/fetchAnnouncementMaster',
    async () => {
        // CWE-918 Fix: Validate URL path before making request
        const apiPath = '/master/parameter/announcement-use';
        if (!isValidApiPath(apiPath)) {
            throw new Error('Invalid API path detected');
        }

        const safeUrl = buildSafeApiUrl(API_URL, apiPath);
        if (!safeUrl) {
            throw new Error('Failed to construct safe URL');
        }

        const response:any = await fetch(safeUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${token}`,
            },
        });
        const data = await response.json();
        return data;
    }
);

const announcementSlice = createSlice({
    name: 'announcement',
    initialState: {
        loading: false,
        data: null,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAnnouncementMaster.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAnnouncementMaster.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchAnnouncementMaster.rejected, (state: any, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export default announcementSlice.reducer;