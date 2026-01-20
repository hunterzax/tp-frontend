
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';
import { buildSafeApiUrl, isValidApiPath } from '@/utils/urlValidator';

const API_URL = process.env.NEXT_PUBLIC_API_URL
// const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");

export const fetchTermType = createAsyncThunk(
    'termtype/fetchTermType',
    async (_, thunkAPI) => {
        try {
            const token = Cookies.get("v4r2d9z5m3h0c1p0x7l");

            if (!token) {
                throw new Error('Token is not available');
            }

            // CWE-918 Fix: Validate URL path before making request
            const apiPath = '/master/parameter/term-type';
            if (!isValidApiPath(apiPath)) {
                throw new Error('Invalid API path detected');
            }

            const safeUrl = buildSafeApiUrl(API_URL, apiPath);
            if (!safeUrl) {
                throw new Error('Failed to construct safe URL');
            }

            const response: any = await axios.get(safeUrl, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                timeout: 600000
            });
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

const termTypeMasterSlice = createSlice({
    name: 'termtype',
    initialState: {
        loading: false,
        data: null,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTermType.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchTermType.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchTermType.rejected, (state: any, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export default termTypeMasterSlice.reducer;