// 'use client';
import axios from "axios";
import getCookieValue from "./getCookieValue";
import { decryptData, decryptResponse } from "./encryptionData";
import { buildSafeApiUrl, isValidApiPath, sanitizePath } from "./urlValidator";

const API_URL = process.env.NEXT_PUBLIC_API_URL
const API_URL2 = process.env.API_URL

export const getNoTokenService = async (url: string) => {
    try {
        let res
        const baseURL = API_URL2 || API_URL;

        if (!baseURL) {
            throw new Error('API URLs are not defined in the environment variables.');
        }

        // CWE-918 Fix: Validate URL path before making request
        if (!isValidApiPath(url)) {
            throw new Error('Invalid API path detected');
        }

        const safeUrl = buildSafeApiUrl(baseURL, url);
        if (!safeUrl) {
            throw new Error('Failed to construct safe URL');
        }

        await axios.get(safeUrl, { timeout: 600000 }).then((response) => {
            // const decryptedData = decryptResponse(response.data);
            res = response.data
            // res = decryptedData
        }).catch((error) => {
            return error;
        });
        return res;

    } catch (error) {
        throw error;
    }
};

export const getService = async (url: string) => {
    try {
        const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
        let res: any
        let tokenFromLcstr: any = localStorage?.getItem("v4r2d9z5m3h0c1p0x7l");
        tokenFromLcstr = tokenFromLcstr ? decryptData(tokenFromLcstr) : null;

        const auth_token = tokenFromLcstr ? tokenFromLcstr : token;

        // CWE-918 Fix: Validate URL path before making request
        if (!isValidApiPath(url)) {
            throw new Error('Invalid API path detected');
        }

        const safeUrl = buildSafeApiUrl(API_URL, url);
        if (!safeUrl) {
            throw new Error('Failed to construct safe URL');
        }

        await axios.get(safeUrl, {
            // headers: { Authorization: `Bearer ${auth_token}` },
            // headers: { Authorization: `Bearer ${auth_token.replace(/^"|"$/g, "")}` },
            headers: {
                Authorization: auth_token ? `Bearer ${auth_token.replace(/^"|"$/g, "")}` : null
            },
            timeout: 600000
        }).then((response) => {
            // const decryptedData = decryptResponse(response.data);
            // return decryptedData;
            res = response.data

        }).catch((error) => {
            res = error
            return error;
        });
        return res;
    } catch (error) {
        throw error;
    }
};

export const getServiceArrayBuffer = async (url: string) => {
    try {
        const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
        let tokenFromLcstr: any = localStorage?.getItem("v4r2d9z5m3h0c1p0x7l");
        tokenFromLcstr = tokenFromLcstr ? decryptData(tokenFromLcstr) : null;
        const auth_token = tokenFromLcstr ? tokenFromLcstr : token;

        // CWE-918 Fix: Validate URL path before making request
        if (!isValidApiPath(url)) {
            throw new Error('Invalid API path detected');
        }

        const safeUrl = buildSafeApiUrl(API_URL, url);
        if (!safeUrl) {
            throw new Error('Failed to construct safe URL');
        }

        const res = await axios.get(safeUrl, {
            headers: {
                Authorization: auth_token ? `Bearer ${auth_token.replace(/^"|"$/g, "")}` : null
            },
            timeout: 600000,
            responseType: 'arraybuffer'
        });

        return res;
    } catch (error) {
        // Fetch error
        throw error;
    }
};

export const deleteService = async (url: string) => {
    try {
        const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
        let res: any
        let tokenFromLcstr: any = localStorage?.getItem("v4r2d9z5m3h0c1p0x7l");
        tokenFromLcstr = tokenFromLcstr ? decryptData(tokenFromLcstr) : null;
        const auth_token = tokenFromLcstr ? tokenFromLcstr : token;

        // CWE-918 Fix: Validate URL path before making request
        if (!isValidApiPath(url)) {
            throw new Error('Invalid API path detected');
        }

        const safeUrl = buildSafeApiUrl(API_URL, url);
        if (!safeUrl) {
            throw new Error('Failed to construct safe URL');
        }

        await axios.delete(safeUrl, {
            headers: {
                Authorization: auth_token ? `Bearer ${auth_token.replace(/^"|"$/g, "")}` : null
            },
            timeout: 600000
        }).then((response) => {
            res = response.data
        }).catch((error) => {
            res = error
            return error;
        });
        return res;

    } catch (error) {
        throw error;
    }
};

export const deleteServiceWithPayload = async (url: string, payload: {} = {}) => {
    try {
        const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
        let tokenFromLcstr: any = localStorage?.getItem("v4r2d9z5m3h0c1p0x7l");
        tokenFromLcstr = tokenFromLcstr ? decryptData(tokenFromLcstr) : null;
        const auth_token = tokenFromLcstr ? tokenFromLcstr : token;

        // CWE-918 Fix: Validate URL path before making request
        if (!isValidApiPath(url)) {
            throw new Error('Invalid API path detected');
        }

        const safeUrl = buildSafeApiUrl(API_URL, url);
        if (!safeUrl) {
            throw new Error('Failed to construct safe URL');
        }

        const response = await axios.delete(safeUrl, {
            headers: {
                Authorization: auth_token ? `Bearer ${auth_token.replace(/^"|"$/g, "")}` : null
            },
            data: payload,
            timeout: 600000
        });

        return response.data;
    } catch (error) {
        return error;
    }
};

export const getServiceLimitOffset = async (url: string) => {
    try {
        const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
        let res: any
        let tokenFromLcstr: any = localStorage?.getItem("v4r2d9z5m3h0c1p0x7l");
        tokenFromLcstr = tokenFromLcstr ? decryptData(tokenFromLcstr) : null;

        const auth_token = tokenFromLcstr ? tokenFromLcstr : token;

        // CWE-918 Fix: Validate URL path before making request
        if (!isValidApiPath(url)) {
            throw new Error('Invalid API path detected');
        }

        const safeUrl = buildSafeApiUrl(API_URL, url);
        if (!safeUrl) {
            throw new Error('Failed to construct safe URL');
        }

        await axios.get(safeUrl, {
            headers: {
                Authorization: auth_token ? `Bearer ${auth_token.replace(/^"|"$/g, "")}` : null
            },
            timeout: 600000
        }).then((response) => {
            res = response.data
        }).catch((error) => {
            res = error
            return error;
        });
        return res;
    } catch (error) {
        throw error;
    }
};

export const downloadService = async (url: string, type?: any, fileName?: string) => {
    try {
        // type 4 = SHORT_NON_FIRM
        // type 3 = SHORT_FIRM
        // type 2 = MEDIUM
        // type 1 = LONG
        const date = new Date();
        const yyyymmddhhmmss = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}${date.getSeconds().toString().padStart(2, '0')}`;
        let typeString: any = '';

        switch (type) {
            case 1:
                typeString = 'LONG';
                break;
            case 2:
                typeString = 'MEDIUM';
                break;
            case 3:
                typeString = 'SHORT_FIRM';
                break;
            case 4:
                typeString = 'SHORT_NON_FIRM';
                break;
            default:
                typeString = '';
                break;
        }

        let filename = fileName || `${yyyymmddhhmmss}_${typeString}.xlsx`;

        if (type == 'bal-vent-commissioning') {
            filename = `Vent_comissioning_othergas_${yyyymmddhhmmss}.xlsx`
        }

        let tokenFromLcstr: any = localStorage.getItem("v4r2d9z5m3h0c1p0x7l");
        tokenFromLcstr = tokenFromLcstr ? decryptData(tokenFromLcstr) : null;

        const auth_token = tokenFromLcstr;

        // ส่งคำขอด้วย response type เป็น 'blob'
        let response: any
        try {
            // CWE-918 Fix: Validate URL path before making request
            if (!isValidApiPath(url)) {
                throw new Error('Invalid API path detected');
            }

            const safeUrl = buildSafeApiUrl(API_URL, url);
            if (!safeUrl) {
                throw new Error('Failed to construct safe URL');
            }

            response = await axios.get(safeUrl, {
                // headers: { Authorization: `Bearer ${auth_token}` },
                // headers: { Authorization: `Bearer ${auth_token.replace(/^"|"$/g, "")}` },
                headers: {
                    Authorization: auth_token ? `Bearer ${auth_token.replace(/^"|"$/g, "")}` : null
                },
                responseType: 'blob',
                timeout: 600000
            });
            // สร้าง blob จากข้อมูลใน response
            const blob = new Blob([response.data], { type: response.headers['content-type'] });

            // สร้างลิงก์
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);

            // พยายามดึงชื่อไฟล์จาก Content-Disposition header
            const contentDisposition = response.headers['content-disposition'];
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1].replace(/['"]/g, ''); // ลบเครื่องหมายคำพูดถ้ามี
                }
            }

            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            window.URL.revokeObjectURL(link.href);
        } catch (error) {
            return { "status": 400, "error": typeString == '' ? "Something went wrong." : "The selected time is outside the allowed booking period." }
        }

    } catch (error) {
        // Error during file download
        throw error;
    }
};

export const postService = async (url: string, payload?: any) => {
    try {
        const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
        let tokenFromLcstr: any = localStorage?.getItem("v4r2d9z5m3h0c1p0x7l");
        tokenFromLcstr = tokenFromLcstr ? decryptData(tokenFromLcstr) : null;

        const auth_token = tokenFromLcstr ? tokenFromLcstr : token;

        // CWE-918 Fix: Validate URL path before making request
        if (!isValidApiPath(url)) {
            throw new Error('Invalid API path detected');
        }

        const safeUrl = buildSafeApiUrl(API_URL, url);
        if (!safeUrl) {
            throw new Error('Failed to construct safe URL');
        }

        return await axios.post(safeUrl, payload, {
            headers: {
                Authorization: auth_token ? `Bearer ${auth_token.replace(/^"|"$/g, "")}` : null
            },
            timeout: 600000
        }).then((response) => {
            return response.data;
        }).catch((error) => {
            return error;
        });
    } catch (error) {
        throw error;
    }
};

export const postServiceNoAuth = async (url: string, payload: any) => {
    try {
        // CWE-918 Fix: Validate URL path before making request
        if (!isValidApiPath(url)) {
            throw new Error('Invalid API path detected');
        }

        const safeUrl = buildSafeApiUrl(API_URL, url);
        if (!safeUrl) {
            throw new Error('Failed to construct safe URL');
        }

        return await axios.post(safeUrl, payload, { timeout: 600000 }).then((response) => {
            return response.data;
        }).catch((error) => {
            return error;
        });
    } catch (error) {
        throw error;
    }
};

export const patchService = async (url: string, payload?: {}, timeout = 600000) => {
    try {
        const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
        let tokenFromLcstr: any = localStorage?.getItem("v4r2d9z5m3h0c1p0x7l");
        tokenFromLcstr = tokenFromLcstr ? decryptData(tokenFromLcstr) : null;

        const auth_token = tokenFromLcstr ? tokenFromLcstr : token;

        // CWE-918 Fix: Validate URL path before making request
        if (!isValidApiPath(url)) {
            throw new Error('Invalid API path detected');
        }

        const safeUrl = buildSafeApiUrl(API_URL, url);
        if (!safeUrl) {
            throw new Error('Failed to construct safe URL');
        }

        return await axios.patch(safeUrl, payload, {
            // headers: { Authorization: `Bearer ${auth_token}` },
            // headers: { Authorization: `Bearer ${auth_token.replace(/^"|"$/g, "")}` },
            headers: {
                Authorization: auth_token ? `Bearer ${auth_token.replace(/^"|"$/g, "")}` : null
            },
            timeout: timeout
        }).then((response) => {
            return response.data;
        }).catch((error) => {
            return error;
        });
    } catch (error) {
        throw error;
    }
};

export const patchServiceDownload = async (
    url: string,
    payload: {} = {},
    timeout = 600000,
    responseType: any = 'json' // default is 'json', but can be 'blob'
) => {
    try {
        const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
        let tokenFromLcstr: any = localStorage?.getItem("v4r2d9z5m3h0c1p0x7l");
        tokenFromLcstr = tokenFromLcstr ? decryptData(tokenFromLcstr) : null;

        const auth_token = tokenFromLcstr ? tokenFromLcstr : token;

        // CWE-918 Fix: Validate URL path before making request
        if (!isValidApiPath(url)) {
            throw new Error('Invalid API path detected');
        }

        const safeUrl = buildSafeApiUrl(API_URL, url);
        if (!safeUrl) {
            throw new Error('Failed to construct safe URL');
        }

        const response = await axios.patch(safeUrl, payload, {
            headers: {
                Authorization: auth_token ? `Bearer ${auth_token.replace(/^"|"$/g, "")}` : null,
            },
            timeout: timeout,
            responseType: responseType
        });

        return response;
    } catch (error) {
        throw error;
    }
};


export const uploadFileServiceWithAuth = async (url: string, file: File, id?: any, key?: any) => {
    try {
        const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
        let tokenFromLcstr: any = localStorage?.getItem("v4r2d9z5m3h0c1p0x7l");
        tokenFromLcstr = tokenFromLcstr ? decryptData(tokenFromLcstr) : null;

        const auth_token = tokenFromLcstr ? tokenFromLcstr : token;

        // CWE-918 Fix: Validate URL path before making request
        if (!isValidApiPath(url)) {
            throw new Error('Invalid API path detected');
        }

        const safeUrl = buildSafeApiUrl(API_URL, url);
        if (!safeUrl) {
            throw new Error('Failed to construct safe URL');
        }

        const formData = new FormData();
        formData.append('file', file);

        if (id && key) {
            formData.append(`${key}`, id);
        }

        const response: any = await axios.post(safeUrl, formData, {
            headers: {
                "content-type": "multipart/form-data",
                Authorization: auth_token ? `Bearer ${auth_token.replace(/^"|"$/g, "")}` : null
            },
            // timeout: 10000000
            timeout: 0 // ไม่จำกัดเวลา
        })

        return response
    } catch (error) {
        return error
    }
};

export const uploadFileServiceWithAuth2 = async (
    url: string,
    file: File,
    dynamicFields: Record<string, any> = {}
) => {

    try {
        const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
        let tokenFromLcstr: any = localStorage?.getItem("v4r2d9z5m3h0c1p0x7l");
        tokenFromLcstr = tokenFromLcstr ? decryptData(tokenFromLcstr) : null;

        const auth_token = tokenFromLcstr ? tokenFromLcstr : token;

        // CWE-918 Fix: Validate URL path before making request
        if (!isValidApiPath(url)) {
            throw new Error('Invalid API path detected');
        }

        const safeUrl = buildSafeApiUrl(API_URL, url);
        if (!safeUrl) {
            throw new Error('Failed to construct safe URL');
        }

        const formData = new FormData();
        formData.append("file", file);

        // Append dynamic fields to the form data
        Object.entries(dynamicFields).forEach(([key, value]) => {
            formData.append(key, value);
        });

        const response: any = await axios
            .post(safeUrl, formData, {
                // headers: {
                //     "content-type": "multipart/form-data",
                //     // Authorization: `Bearer ${auth_token}`,
                //     Authorization: `Bearer ${auth_token.replace(/^"|"$/g, "")}`
                // },
                headers: {
                    "content-type": "multipart/form-data",
                    Authorization: auth_token ? `Bearer ${auth_token.replace(/^"|"$/g, "")}` : null
                },
            })
            .then((response) => {
                return response.data;
            })
            .catch((error) => {
                return error;
            });

        return response;
    } catch (error) {
        // Upload failed
        throw error;
    }
};


export const uploadFileServiceWithAuth2UploadTemplateForShipper = async (
    url: string,
    // file?: File,
    file?: any,
    dynamicFields: Record<string, any> = {}
) => {

    try {
        const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
        let tokenFromLcstr: any = localStorage?.getItem("v4r2d9z5m3h0c1p0x7l");
        tokenFromLcstr = tokenFromLcstr ? decryptData(tokenFromLcstr) : null;

        const auth_token = tokenFromLcstr ? tokenFromLcstr : token;

        // CWE-918 Fix: Validate URL path before making request
        if (!isValidApiPath(url)) {
            throw new Error('Invalid API path detected');
        }

        const safeUrl = buildSafeApiUrl(API_URL, url);
        if (!safeUrl) {
            throw new Error('Failed to construct safe URL');
        }

        const formData = new FormData();
        if (file) {
            formData.append("file", file);
        }

        // Append dynamic fields to the form data
        Object.entries(dynamicFields).forEach(([key, value]) => {
            formData.append(key, value);
        });

        const response: any = await axios
            .post(safeUrl, formData, {
                // headers: {
                //     "content-type": "multipart/form-data",
                //     // Authorization: `Bearer ${auth_token}`,
                //     Authorization: `Bearer ${auth_token.replace(/^"|"$/g, "")}`
                // },
                headers: {
                    "content-type": "multipart/form-data",
                    Authorization: auth_token ? `Bearer ${auth_token.replace(/^"|"$/g, "")}` : null
                },
            })
            .then((response) => {
                return response.data;
            })
            .catch((error) => {
                return error;
            });

        return response;
    } catch (error) {
        throw error;
    }
};


export const uploadFileService = async (url: string, file: File) => {
    try {
        // CWE-918 Fix: Validate URL path before making request
        if (!isValidApiPath(url)) {
            throw new Error('Invalid API path detected');
        }

        const safeUrl = buildSafeApiUrl(API_URL, url);
        if (!safeUrl) {
            throw new Error('Failed to construct safe URL');
        }

        const formData = new FormData();
        formData.append('file', file);

        const response: any = await axios.post(safeUrl, formData, {
            headers: { "content-type": "multipart/form-data" },
            timeout: 600000
        }).then((response) => {
            return response.data;
        }).catch((error) => {
            return error;
        });

        return response
    } catch (error) {
        throw error;
    }
};

export const importTemplateService = async (url: string, file: File, terminate_date?: any, amd?: any) => {
    try {
        // CWE-918 Fix: Validate URL path before making request
        if (!isValidApiPath(url)) {
            throw new Error('Invalid API path detected');
        }

        const safeUrl = buildSafeApiUrl(API_URL, url);
        if (!safeUrl) {
            throw new Error('Failed to construct safe URL');
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('text', terminate_date);
        formData.append('text', amd);

        const response: any = await axios.post(safeUrl, formData, {
            headers: { "content-type": "multipart/form-data" },
            timeout: 600000
        }).then((response) => {
            return response.data;
        }).catch((error) => {
            return error;
        });

        return response
    } catch (error) {
        throw error;
    }
};

export const putService = async (url: string, payload: any) => {
    try {
        const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
        let tokenFromLcstr: any = localStorage?.getItem("v4r2d9z5m3h0c1p0x7l");
        tokenFromLcstr = tokenFromLcstr ? decryptData(tokenFromLcstr) : null;

        const auth_token = tokenFromLcstr ? tokenFromLcstr : token;

        // CWE-918 Fix: Validate URL path before making request
        if (!isValidApiPath(url)) {
            throw new Error('Invalid API path detected');
        }

        const safeUrl = buildSafeApiUrl(API_URL, url);
        if (!safeUrl) {
            throw new Error('Failed to construct safe URL');
        }

        return await axios.put(safeUrl, payload, {
            headers: {
                Authorization: auth_token ? `Bearer ${auth_token.replace(/^"|"$/g, "")}` : null
            },
            timeout: 600000
        }).then((response) => {
            return response.data;
        }).catch((error) => {
            return error;
        });
    } catch (error) {
        throw error;
    }
};