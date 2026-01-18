"use client";
import { useEffect, useMemo, useState } from "react";
import { convertTimeStringToDate, cutUploadFileName, formatDateNoTime, formatFormDate, formatNumberThreeDecimalNoComma, generateUserPermission } from '@/utils/generalFormatter';
import dayjs from 'dayjs';
import { SubmitHandler, useForm } from "react-hook-form";
import ModalConfirmSave from "@/components/other/modalConfirmSave";
import { Checkbox, ListItemText, MenuItem, Select, TextField, Typography } from "@mui/material";
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import DatePickaFormThai from "@/components/library/dateRang/dateSelectFormThai";
import { uploadFileService } from "@/utils/postService";
import SelectFormProps from "@/components/other/selectProps";
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { mock_emergency_type } from "../mockData";
import TimePickaForm from "@/components/library/dateRang/timePickerForm";
import TableDocument8 from "../tableInDocument8";

type FormExampleProps = {
    data?: Partial<any>;
    mode?: any;
    userDT?: any;
    shipperData?: any;
    emailGroupForEventData?: any;
    refDocData?: any;
    setIsOpenDocument?: any;
    dataOpenDocument?: any;
    modeOpenDocument?: any;
    onSubmit: SubmitHandler<any>;
};

const inputClass = "text-[14px] block md:w-full p-2 ps-5 focus:!ps-5 hover:!ps-5 pe-10 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]"
const labelClass = "block mb-2 text-[14px] text-[#464255] font-semibold"
const textErrorClass = "text-red-500 text-[14px] "
const selectboxClass = "flex w-full h-[44px] p-1 ps-1 pe-2 !rounded-lg text-gray-900 block outline-none";

// key ใน DB ตามฟอร์ม
// "ref_document": 22,         // id runnumber
// "longdo_dict": "ส่วนบริการสัญญาระบบท่อส่งก๊าซ (Transmission Contracts & Regulatory Management Division โทร 025372000,35063)", //สำเนา
// "event_date": "2025-08-01", // วันที่ออกเอกสาร

// "doc_8_input_ref_doc_at": "บค.บคต./115/2567",   // doc8 ตามเอกสารเลขที่
// "doc_8_input_date": "2025-08-05",               // doc8 วันที่และเวลา วัน
// "doc_8_input_time": "15:00",                    // doc8 วันที่และเวลา เวลา
// "doc_8_input_summary": "กลับสู่สภาวะปกติ",          // doc8 สรุปการแก้ปัญหา
// "doc_8_input_summary_gas": "ด้านคุณภาพก๊าซหลุดกรอบ", // doc8 สรุปผลกระทบด้านปริมาณและด้านคุณภาพก๊าซ
// "doc_8_input_more": null,                       // doc8 ข้อมูลเพิ่มเติม


const FormDocument8: React.FC<FormExampleProps> = ({ mode, data, onSubmit, setIsOpenDocument, dataOpenDocument, modeOpenDocument, userDT, shipperData, emailGroupForEventData, refDocData }) => {
    const { control, register, handleSubmit, setValue, reset, clearErrors, formState: { errors }, watch, } = useForm<any>({ defaultValues: data, });
    const [tk, settk] = useState<boolean>(false); // ของคุ้นเคย
    const { onChange, ...restEmail } = register("email"); // register email

    const [headerFormText, setHeaderFormText] = useState('');
    const [fileNameEditText, setFileNameEditText] = useState(''); // เอาไว้แสดงชื่อไฟล์ตอนเข้ามา view หรือ edit
    const [fileNameEditTextUrl, setFileNameEditUrl] = useState(''); // เอาไว้กดโหลดตอนเข้ามา view หรือ edit
    const [documentId, setDocumentId] = useState(''); // ID ของ Document 2
    const isReadOnly = mode === "view" || mode == 'edit';
    const isShipper = userDT?.account_manage?.[0]?.user_type_id === 3 ? true : false;
    const [isTsoEdited, setIsTsoEdited] = useState<boolean>(false);


    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [dataTable, setDataTable] = useState<any>([])

    const [defaultShippersRender, setDefaultShippersRender] = useState<any[]>([]); // SELECT SHIPPER สำหรับ mode edit ที่ไม่ให้ลบของเก่า
    const [defaultShippersId, setDefaultShippersId] = useState<any[]>([]); // SELECT SHIPPER สำหรับ mode edit ที่ไม่ให้ลบของเก่า

    const [defaultEmailGroupRender, setDefaultEmailGroupRender] = useState<any[]>([]); // EMAIL GROUP สำหรับ mode edit ที่ไม่ให้ลบของเก่า
    const [defaultEmailGrouId, setDefaultEmailGrouId] = useState<any[]>([]); // EMAIL GROUP สำหรับ mode edit ที่ไม่ให้ลบของเก่า

    const [defaultCcEmailRender, setDefaultCcEmailRender] = useState<any[]>([]); // CC EMAIL สำหรับ mode edit ที่ไม่ให้ลบของเก่า

    const textFieldSx = {
        '.MuiOutlinedInput-root': {
            borderRadius: '8px',
            fontSize: "14px",
            color: '#464255 !important', // Disabled text color
        },
        '.MuiOutlinedInput-notchedOutline': {
            // borderColor: '#DFE4EA',
            borderColor: errors.remark && !watch('remark') ? '#FF0000' : '#DFE4EA',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: errors.remark && !watch("remark") ? "#FF0000" : '#DFE4EA !important',
        },
        '&.Mui-focused .MuiOutlinedI nput-notchedOutline': {
            borderColor: '#00ADEF',
        },
        '&.MuiInputBase-input::placeholder': {
            color: '#9CA3AF', // Placeholder color
            fontSize: '14px', // Placeholder font size
        },
        '& .Mui-disabled': {
            color: '#464255 !important', // Disabled text color
        },
        "& .MuiOutlinedInput-input::placeholder": {
            fontSize: "14px",
        },
        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#00ADEF !important", // 👈 force black border on focus
            borderWidth: '1px', // 👈 Force border 1px on focus
        },
    }

    const inputPropsTextField = {
        style: {
            color: isReadOnly ? "#464255" : "inherit",
        },
        disableUnderline: true,
    }

    {/* Confirm Save */ }
    const [modaConfirmSave, setModaConfirmSave] = useState<any>(false)
    const [dataSubmit, setDataSubmit] = useState<any>()

    // #region DATA on load
    useEffect(() => {
        let text_header: any = 'สร้างเอกสารแจ้งสิ้นสุดคำสั่งเพิ่ม/ลดปริมาณก๊าซ (Doc 8)'
        switch (modeOpenDocument) {
            case 'view':
                text_header = 'ดูข้อมูลเอกสารแจ้งสิ้นสุดคำสั่งเพิ่ม/ลดปริมาณก๊าซ (Doc 8)'
                break;
            case 'edit':
                text_header = 'แก้ไขเอกสารแจ้งสิ้นสุดคำสั่งเพิ่ม/ลดปริมาณก๊าซ (Doc 8)'
                break;
        }
        setHeaderFormText(text_header)
        // setDocumentId(dataOpenDocument?.document1?.id)
        setDocumentId(dataOpenDocument?.id)

        if (modeOpenDocument == 'edit' || modeOpenDocument == 'view') {
            setValue('ref_document', dataOpenDocument?.event_runnumber_ofo_id)
            setValue('longdo_dict', dataOpenDocument?.longdo_dict)
            setValue('event_date', dataOpenDocument?.event_date)

            // set ชื่อ shipper กลับที่เดิม
            const groupIds = dataOpenDocument?.event_runnumber_ofo?.event_document_ofo?.map((item: any) => item.group_id);
            const filteredShippers = shipperData?.filter((item: any) => groupIds?.includes(item.id));
            const defaultIds = filteredShippers?.map((s: any) => s.id); // เอา id 
            setDefaultShippersRender(filteredShippers); // ลบไม่ได้
            setDefaultShippersId(defaultIds) // ลบไม่ได้

            // set email group กลับที่เดิม
            const emailGroupForEventIds = dataOpenDocument?.event_document_ofo_email_group_for_event?.map((item: any) => item.edit_email_group_for_event_id);
            const filter_email_group_for_event = emailGroupForEventData?.filter((item: any) => emailGroupForEventIds?.includes(item?.id))
            const defaultEmailGroupIds = filter_email_group_for_event?.map((s: any) => s.id); // เอา id 
            setDefaultEmailGroupRender(filter_email_group_for_event) // ลบไม่ได้
            setDefaultEmailGrouId(defaultEmailGroupIds) // ลบไม่ได้

            // set CC email กลับที่เดิม
            const ccEmail = dataOpenDocument?.event_document_ofo_cc_email?.map((item: any) => item.email);
            setDefaultCcEmailRender(ccEmail)  // ลบไม่ได้

            // ข้อมูลในตารางข้างล่าง
            setDataTable(dataOpenDocument?.event_runnumber_ofo?.event_document_ofo)

            // SET ข้อมูลลงฟอร์มนะ
            setValue('doc_8_input_ref_doc_at', dataOpenDocument?.doc_8_input_ref_doc_at) // doc8 ตามเอกสารเลขที่
            setValue('doc_8_input_date', dataOpenDocument?.doc_8_input_date) // doc8 วันที่และเวลา วัน
            setValue('doc_8_input_time', dataOpenDocument?.doc_8_input_time ? convertTimeStringToDate(dataOpenDocument?.doc_8_input_time) : null) // doc8 วันที่และเวลา เวลา
            setValue('doc_8_input_summary', dataOpenDocument?.doc_8_input_summary) // doc8 สรุปการแก้ปัญหา
            setValue('doc_8_input_summary_gas', dataOpenDocument?.doc_8_input_summary_gas) // doc8 สรุปผลกระทบด้านปริมาณและด้านคุณภาพก๊าซ
            setValue('doc_8_input_more', dataOpenDocument?.doc_8_input_more) // doc8 ข้อมูลเพิ่มเติม

            setFileNameEditText(dataOpenDocument?.event_document_ofo_file?.length > 0 ? cutUploadFileName(dataOpenDocument?.event_document_ofo_file[0]?.url) : '')
            setFileNameEditUrl(dataOpenDocument?.event_document_ofo_file?.length > 0 ? dataOpenDocument?.event_document_ofo_file[0]?.url : '')
        }

    }, [mode, dataOpenDocument, shipperData, emailGroupForEventData])

    // #region Confirm Save
    {/* Confirm Save */ }
    const handleSaveConfirm = async (data?: any) => {
        if (mode == 'create') {
            const payload_tso_create = {
                "ref_document": watch('ref_document'), // id runnumber
                "longdo_dict": data?.longdo_dict, //สำเนา
                "event_date": dayjs(watch('event_date')).format("YYYY-MM-DD"), // วันที่ออกเอกสาร

                "doc_8_input_ref_doc_at": data?.doc_8_input_ref_doc_at, //doc8 ตามเอกสารเลขที่
                "doc_8_input_date": watch('doc_8_input_date') ? dayjs(watch('doc_8_input_date')).format("YYYY-MM-DD") : '', //doc8 วันที่และเวลา วัน
                "doc_8_input_time": data?.doc_8_input_time ? dayjs(data?.doc_8_input_time).format('HH:mm') : '', //doc8 วันที่และเวลา เวลา
                "doc_8_input_summary": data?.doc_8_input_summary, //doc8 สรุปการแก้ปัญหา
                "doc_8_input_summary_gas": data?.doc_8_input_summary_gas, //doc8 สรุปผลกระทบด้านปริมาณและด้านคุณภาพก๊าซ
                "doc_8_input_more": data?.doc_8_input_more, //doc8 ข้อมูลเพิ่มเติม

                "file": fileUrl !== '' ? [fileUrl] : [],
                "shipper": selectedShippers,
                "email_event_for_shipper": selectedEmailGroup,
                "cc_email": emailGroup
            }
            setDataSubmit(payload_tso_create)
            setModaConfirmSave(true)

        } else {
            let data_post_na: any = {}
            if (userDT?.account_manage?.[0]?.user_type_id !== 3) {
                // mode edit tso
                data_post_na = {
                    "document_id": documentId, // เอาไว้ใช้เส้น POST event/ofo/doc8/edit/${id}
                    "longdo_dict": dataOpenDocument?.longdo_dict,
                    "event_date": dataOpenDocument?.event_date,

                    "doc_8_input_ref_doc_at": dataOpenDocument?.doc_8_input_ref_doc_at, //doc8 ตามเอกสารเลขที่
                    "doc_8_input_date": dataOpenDocument?.doc_8_input_date, //doc8 วันที่และเวลา วัน
                    "doc_8_input_time": dataOpenDocument?.doc_8_input_time ? dataOpenDocument?.doc_8_input_time : null, //doc8 วันที่และเวลา เวลา
                    "doc_8_input_summary": dataOpenDocument?.doc_8_input_summary, //doc8 สรุปการแก้ปัญหา
                    "doc_8_input_summary_gas": dataOpenDocument?.doc_8_input_summary_gas, //doc8 สรุปผลกระทบด้านปริมาณและด้านคุณภาพก๊าซ
                    "doc_8_input_more": dataOpenDocument?.doc_8_input_more, //doc8 ข้อมูลเพิ่มเติม

                    "file": fileUrl !== '' ? [fileUrl] : [fileNameEditTextUrl], // ส่งมาแค่ 1 ถ้า หน้าบ้านอัพโหลด ส่าง url ใหม่ ถ้าไม่อัพส่ง url เก่ามา
                    "shipper": Array.from(new Set([
                        ...selectedShippers,
                        ...defaultShippersId,
                    ])),
                    "email_event_for_shipper": Array.from(new Set([
                        ...selectedEmailGroup,
                        ...defaultEmailGrouId,
                    ])),
                    "cc_email": Array.from(new Set([
                        ...emailGroup,
                        ...defaultCcEmailRender,
                    ]))
                }
            } else {
                // mode edit shipper
                data_post_na = {
                    "document_id": documentId, // เอาไว้ใช้เส้น PUT event/emer/doc5/${id}
                    "event_doc_status_id": 5,
                }
            }

            setDataSubmit(data_post_na)
            setModaConfirmSave(true)
        }
    }

    // #region UPLOAD FILE
    // ############# UPLOAD FILE #############
    const [fileName, setFileName] = useState('Maximum File 5 MB');
    const [fileUpload, setFileUpload] = useState<any>();
    const [fileUrl, setFileUrl] = useState<any>('');
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (e: any) => {
        setIsLoading(true);
        const file = e.target.files[0];
        if (file) {
            setIsUploading(true);

            const maxSizeInMB = 5; // Maximum file size in MB
            const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

            if (file.size > maxSizeInBytes) {
                setFileName('The file is larger than 5 MB.');
                setIsUploading(false)
                // File size too large:
                return;
            }

            const response: any = await uploadFileService('/files/uploadfile/', file);

            setFileName(file.name);
            setFileUpload(file);
            setFileUrl(response?.file?.url);

            setTimeout(() => {
                setIsUploading(false);
            }, 500);
            // setModalMsg("Your file has been uploaded")

        } else {
            setFileName('No file chosen');
        }

        setTimeout(() => {
            setIsLoading(false);
        }, 300);
    };

    const handleRemoveFile = () => {
        setFileName("Maximum File 5 MB"); // Reset fileName
        setFileUpload(undefined);
        setValue('file', null);
        // setFileUrl('')
    };

    // #region DOWNLOAD FILE
    // ############# DOWNLOAD FILE #############
    const downloadFile = async () => {
        try {
            const response = await fetch(fileNameEditTextUrl);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const fileName = fileNameEditTextUrl.split('/').pop() || 'image.jpg';

            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            // Error downloading image:
        }
    };

    // #region SHIPPER SELECT
    // ############# SHIPPER SELECT #############
    const [selectedShippers, setSelectedShippers] = useState<string[]>([]);
    const [selectedShippersRender, setSelectedShippersRender] = useState<any[]>([]);

    const handleSelectChange = (event: any) => {
        setIsTsoEdited(true)
        const value = event.target.value;

        if (value.includes("all")) {
            // setSelectedShippers(selectedShippers.length === shipperData.length ? [] : shipperData.map((item: any) => item.id));
            // setSelectedShippersRender(selectedShippers.length === shipperData.length ? [] : shipperData.map((item: any) => item));
            // setValue("shipper_id", selectedShippers.length === shipperData.length ? [] : shipperData.map((item: any) => item.id));

            // เอาอันที่มีอยู่แล้วออกจาก option 
            setSelectedShippers(selectedShippers.length === shipperData.length ? [] : shipperData?.filter((item: any) => !defaultShippersId?.includes(item.id)).map((item: any) => item.id));
            setSelectedShippersRender(selectedShippers.length === shipperData.length ? [] : shipperData?.filter((item: any) => !defaultShippersId?.includes(item.id)).map((item: any) => item));
            setValue("shipper_id", selectedShippers.length === shipperData.length ? [] : shipperData?.filter((item: any) => !defaultShippersId?.includes(item.id)).map((item: any) => item.id));
        } else {
            setSelectedShippers(value);
            setValue("shipper_id", value);

            const filter_shipper = shipperData?.filter((item: any) => value.includes(item?.id))
            setSelectedShippersRender(filter_shipper)
        }
        clearErrors('shipper_id');
    };

    const removeShipper = (idToRemove: number) => {
        setSelectedShippers((prevGroup: any) => prevGroup.filter((data: any, index: number) => data !== idToRemove));
        setSelectedShippersRender((prevGroup: any) => prevGroup.filter((data: any, index: number) => data?.id !== idToRemove));
    };

    // #region EMAIL GROUP SELECT
    // ############# EMAIL GROUP SELECT #############
    const [selectedEmailGroup, setSelectedEmailGroup] = useState<string[]>([]);
    const [selectedEmailGroupRender, setSelectedEmailGroupRender] = useState<any[]>([]);

    const handleSelectEmailGroup = (event: any) => {
        setIsTsoEdited(true)
        const value = event.target.value;

        if (value.includes("all")) {
            setSelectedEmailGroup(selectedEmailGroup.length === emailGroupForEventData.length ? [] : emailGroupForEventData.map((item: any) => item.id));
            setSelectedEmailGroupRender(selectedEmailGroup.length === emailGroupForEventData.length ? [] : emailGroupForEventData.map((item: any) => item));
            setValue("shipper_id", selectedEmailGroup.length === emailGroupForEventData.length ? [] : emailGroupForEventData.map((item: any) => item.id));
        } else {
            setSelectedEmailGroup(value);
            setValue("shipper_id", value);

            const filter_shipper = emailGroupForEventData?.filter((item: any) => value.includes(item?.id))
            setSelectedEmailGroupRender(filter_shipper)
        }
        clearErrors('shipper_id');
    };

    const removeEmailGroup = (idToRemove: number) => {
        setSelectedEmailGroup((prevGroup: any) => prevGroup.filter((data: any, index: number) => data !== idToRemove));
        setSelectedEmailGroupRender((prevGroup: any) => prevGroup.filter((data: any, index: number) => data?.id !== idToRemove));
    };

    // #region CC MAIL
    // ############# CC MAIL #############
    const [emailGroup, setEmailGroup] = useState<any>([]);
    const [alertDupMail, setAlertDupMail] = useState<any>(false);
    const addEmailGroup = (data: any) => {
         
        setEmailGroup((prev: any): any => [
            ...prev,
            data
        ]);

        setValue("email", "");
        setValue("email_arr", [...emailGroup, data]);
    };

    const removeEmail = (indexToRemove: number) => {
        setEmailGroup((prevGroup: any) => prevGroup.filter((_: any, index: number) => index !== indexToRemove));

        const currentEmails = watch("email_arr");
        const updatedEmails = currentEmails.filter((_: any, index: number) => index !== indexToRemove);
        setValue("email_arr", updatedEmails);
    };

    return (<>
        <span className="text-[20px] text-[#58585A] font-semibold">{headerFormText}</span>
        <form
            onSubmit={handleSubmit(handleSaveConfirm)}
            className='bg-white w-full max-w'
        >
            <div className="flex gap-4 pt-4">
                <div className="w-[360px]">
                    <label htmlFor="event_nember" className={labelClass}>
                        <span className="text-red-500">*</span>
                        {`อ้างอิงจากเอกสารคำสั่งเพิ่ม/ลดปริมาณก๊าซ (Doc 7)`}
                    </label>

                    {
                        mode == 'create' ?
                            <SelectFormProps
                                id={'ref_document'}
                                register={register("ref_document", { required: false })}
                                disabled={mode == 'edit' ? true : false}
                                valueWatch={watch("ref_document") || ""}
                                handleChange={(e) => {
                                    setValue("ref_document", e.target.value);
                                    const find_doc_data = refDocData?.find((item: any) => item?.id == e.target.value)
                                    setValue("longdo_dict", find_doc_data?.event_document_ofo?.[0]?.longdo_dict); // สำเนาจาก doc7
                                    setValue("event_date", find_doc_data?.event_date); // ใส่วันที่จาก doc7



                                    // New : ตอนเลือก Ref Doc 3.9 ข้อมูล Shipper / Email Group / CC Mail ต้องดึงมาจาก Doc 4 (ล่าสุด) ที่ผูกกับ Doc 3.9 ที่เลือกมาให้อัตโนมัติ โดยยังให้สามารถเพิ่ม ลดได้ https://app.clickup.com/t/86eum0nrv
                                    // set ชื่อ shipper กลับที่เดิม
                                    const groupIds = find_doc_data?.event_document_ofo?.map((item: any) => item?.group_id);
                                    const filteredShippers = shipperData?.filter((item: any) => groupIds?.includes(item?.id));
                                    const defaultIds = filteredShippers?.map((s: any) => s?.id); // เอา id 
                                    // setDefaultShippersRender(filteredShippers); // ลบไม่ได้
                                    // setDefaultShippersId(defaultIds) // ลบไม่ได้
                                    setSelectedShippersRender(filteredShippers);
                                    setSelectedShippers(defaultIds)


                                    // // set email group กลับที่เดิม
                                    const emailGroupForEventDataX = (find_doc_data?.event_document_ofo ?? []).filter((it: any) => Array.isArray(it?.event_document_ofo_email_group_for_event) && it.event_document_ofo_email_group_for_event.length > 0).flatMap((k: any) => k.event_document_ofo_email_group_for_event);
                                    const emailGroupForEventIds = emailGroupForEventDataX?.map((s: any) => s?.edit_email_group_for_event_id); // เอา id 
                                    const filter_email_group_for_event = emailGroupForEventData?.filter((item: any) => emailGroupForEventIds?.includes(item?.id))
                                    setSelectedEmailGroupRender(filter_email_group_for_event)
                                    setSelectedEmailGroup(emailGroupForEventIds)


                                    // // set CC email กลับที่เดิม
                                    // const ccEmail = dataOpenDocument?.event_document_ofo_cc_email?.map((item: any) => item.email);
                                    const ccEmailFind = (find_doc_data?.event_document_ofo ?? []).filter((it: any) => Array.isArray(it?.event_document_ofo_cc_email) && it.event_document_ofo_cc_email.length > 0).flatMap((k: any) => k.event_document_ofo_cc_email);
                                    const ccEmail = ccEmailFind?.map((s: any) => s?.email);
                                    // setDefaultCcEmailRender(ccEmail)  // ลบไม่ได้
                                    setEmailGroup(ccEmail)
                                    setValue("email_arr", [...ccEmail]);

                                    // ========================================



                                    clearErrors('ref_document')
                                    if (errors?.ref_document) { clearErrors('ref_document') }
                                }}
                                errors={errors?.ref_document}
                                errorsText={'Select Document 7'}
                                options={refDocData}
                                optionsKey={'id'}
                                optionsValue={'id'}
                                optionsText={'event_nember'}
                                optionsResult={'event_nember'}
                                placeholder={'Select  Document 7'}
                                pathFilter={'event_nember'}
                            />
                            :
                            <div className="w-full h-[44px] p-3 text-[14px] text-[#464255] rounded-[9px] bg-[#EEECEC]"> {dataOpenDocument?.event_runnumber_ofo?.event_nember}</div>
                    }
                </div>


                <div className="pb-2 w-[200px]">
                    <label className={labelClass}>
                        <span className="text-red-500">*</span>
                        {`วันที่ออกเอกสาร`}
                    </label>
                    <DatePickaFormThai
                        {...register('event_date', { required: "เลือกวันที่" })}
                        // readOnly={isReadOnly}
                        // readOnly={watch('ref_document') || mode == 'view' ? true : false} // ปิดเพราะตอนเลือก ref doc 
                        // readOnly={(mode == 'view' || isShipper) ? true : false}
                        readOnly={mode == 'view' || mode == 'edit'}
                        placeHolder="เลือกวันที่"
                        // mode={watch('ref_document') ? 'view' : 'create'}
                        mode={mode}
                        valueShow={watch("event_date") ? dayjs(watch("event_date")).format("DD/MM/YYYY") : undefined}
                        // min={new Date()}
                        allowClear
                        isError={errors.event_date && !watch("event_date") ? true : false}
                        onChange={(e: any) => { setValue('event_date', formatFormDate(e)), e == undefined && setValue('event_date', null, { shouldValidate: true, shouldDirty: true }); }}
                    />
                    {errors.event_date && !watch("event_date") && <p className={`${textErrorClass}`}>{'เลือกวันที่'}</p>}
                </div>

                {/* เอกสารเลขที่ */}
                <div className="w-[190px]">
                    <label htmlFor="event_nember" className={labelClass}><span className="text-red-500">*</span>{`ตามเอกสารเลขที่`}</label>

                    <input
                        id="doc_8_input_ref_doc_at"
                        {...register("doc_8_input_ref_doc_at", { required: "กรอกเอกสาร" })}
                        type="text"
                        placeholder="กรอกเอกสาร"
                        readOnly={isReadOnly}
                        maxLength={25}
                        onChange={(e) => {
                            if (e.target.value.length <= 25) {
                                setValue('doc_8_input_ref_doc_at', e.target.value);
                            }
                        }}
                        className={`text-[14px] border-[1px] border-[#DFE4EA]  bg-white ps-[21px] h-[44px] w-full rounded-lg outline-none bg-opacity-100 focus:border-[#00ADEF] ${isReadOnly && '!bg-[#EFECEC]'}`}
                    />
                </div>
            </div>


            {/* สำเนา */}
            <div className="flex flex-wrap flex-auto gap-4 pt-4">
                <div className="w-full">
                    <label className={`${labelClass}`}>{`สำเนา`}</label>
                    <TextField
                        {...register("longdo_dict")}
                        value={watch("longdo_dict") || ""}
                        label=""
                        multiline
                        onChange={(e) => {
                            if (e.target.value.length <= 255) {
                                setValue("longdo_dict", e.target.value);
                            }
                        }}
                        placeholder="ระบุรายละเอียด"
                        // disabled={isReadOnly}
                        // disabled={(mode == 'view' || isShipper) ? true : false}
                        disabled={mode == 'view' || mode == 'edit'}
                        rows={2}
                        sx={textFieldSx}
                        // className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                        className={`${(mode == 'view' || mode == 'edit') && 'bg-[#EFECEC] rounded-[8px]'}`}
                        InputProps={inputPropsTextField}
                        fullWidth
                    />
                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                        <span className="text-[13px]">
                            {watch("longdo_dict")?.length || 0} / 255
                        </span>
                    </div>
                </div>
            </div>


            {/* =================================== ช่วงเวลาของเหตุการณ์ ======================================== */}

            <div className="grid grid-cols-2 gap-4 pt-4">

                <div>
                    <label className={`${labelClass}`}>{`วันที่และเวลา`}</label>

                    {/* เริ่ม */}
                    <div className="flex flex-nowrap items-center gap-4">
                        <span className="text-[14px] font-light text-[#58585A]">{`วันที่`}</span>
                        <span className="text-[14px] w-[240px] text-[#58585A]">
                            <DatePickaFormThai
                                {...register('doc_8_input_date', { required: false })}
                                readOnly={mode == 'view' || mode == 'edit'}
                                placeHolder="ระบุวันที่"
                                mode={mode}
                                valueShow={watch("doc_8_input_date") ? dayjs(watch("doc_8_input_date")).format("DD/MM/YYYY") : undefined}
                                allowClear
                                isError={!!errors.doc_8_input_date && !watch("doc_8_input_date")}
                                onChange={(e: any) => {
                                    setValue('doc_8_input_date', formatFormDate(e));
                                    if (e == undefined)
                                        setValue('doc_8_input_date', null, { shouldValidate: true, shouldDirty: true });
                                }}
                            />
                        </span>

                        <span className="text-[14px] font-light text-[#58585A]">{`เวลา`}</span>
                        <span className="text-[14px] w-[240px] text-[#58585A]">
                            <TimePickaForm
                                {...register('doc_8_input_time', { required: false })}
                                readOnly={mode == 'view' || mode == 'edit'}
                                placeHolder="ระบุเวลา"
                                mode={mode}
                                valueShow={watch("doc_8_input_time") || undefined}
                                allowClear
                                isError={!!errors.doc_8_input_time && !watch("doc_8_input_time")}
                                onChange={(e: any) => {
                                    setValue('doc_8_input_time', e);
                                    if (e == undefined)
                                        setValue('doc_8_input_time', null, { shouldValidate: true, shouldDirty: true });
                                }}
                            />
                        </span>
                    </div>
                </div>


                {/* สรุปการแก้ไข */}
                <div className="w-full">
                    <label className={`${labelClass}`}>{`สรุปการแก้ไขปัญหา`}</label>
                    <TextField
                        {...register("doc_8_input_summary")}
                        value={watch("doc_8_input_summary") || ""}
                        label=""
                        multiline
                        onChange={(e) => {
                            if (e.target.value.length <= 500) {
                                setValue("doc_8_input_summary", e.target.value);
                            }
                        }}
                        placeholder="ระบุสรุปการแก้ไขปัญหา"
                        disabled={isReadOnly}
                        rows={2}
                        sx={textFieldSx}
                        className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                        InputProps={inputPropsTextField}
                        fullWidth
                    />
                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                        <span className="text-[13px]">
                            {watch("doc_8_input_summary")?.length || 0} / 500
                        </span>
                    </div>
                </div>
            </div>

            {/* สรุปผลกระทบด้านปริมาณก๊าซ และด้านคุณภาพก๊าซ */}
            <div className="grid grid-cols-2 gap-4 pt-3">
                <div className="w-full col-span-2">
                    <label className={labelClass}>
                        <span className="text-red-500">*</span>
                        {`สรุปผลกระทบด้านปริมาณและด้านคุณภาพก๊าซ`}
                    </label>
                    <TextField
                        {...register("doc_8_input_summary_gas", { required: true })}
                        value={watch("doc_8_input_summary_gas") || ""}
                        label=""
                        multiline
                        onChange={(e) => {
                            if (e.target.value.length <= 500) {
                                setValue("doc_8_input_summary_gas", e.target.value);
                            }
                        }}
                        placeholder="ระบุรายละเอียด"
                        // disabled={isReadOnly}
                        // disabled={(mode == 'view' || isShipper) ? true : false}
                        disabled={mode == 'view' || mode == 'edit'}
                        rows={2}
                        sx={{
                            ...textFieldSx,
                            '.MuiOutlinedInput-notchedOutline': {
                                borderColor: errors.doc_8_input_summary_gas && !watch('doc_8_input_summary_gas') ? '#FF0000' : '#DFE4EA',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: errors.doc_8_input_summary_gas && !watch("doc_8_input_summary_gas") ? "#FF0000" : '#DFE4EA !important',
                            },
                        }}
                        // className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                        className={`${(mode == 'view' || isShipper) && 'bg-[#EFECEC] rounded-[8px]'}`}
                        InputProps={inputPropsTextField}
                        fullWidth
                    />
                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                        <span className="text-[13px]">{watch("doc_8_input_summary_gas")?.length || 0} / 500</span>
                    </div>
                </div>
            </div>

            {/* ข้อมูลเพิ่มเติม */}
            <div className="grid grid-cols-2 gap-4 pt-3">
                <div className="w-full col-span-2">
                    <label className={labelClass}>{`ข้อมูลเพิ่มเติม`}</label>
                    <TextField
                        {...register("doc_8_input_more")}
                        value={watch("doc_8_input_more") || ""}
                        label=""
                        multiline
                        onChange={(e) => {
                            if (e.target.value.length <= 500) {
                                setValue("doc_8_input_more", e.target.value);
                            }
                        }}
                        placeholder="ระบุรายละเอียด"
                        // disabled={isReadOnly}
                        // disabled={(mode == 'view' || isShipper) ? true : false}
                        disabled={mode == 'view' || mode == 'edit'}
                        rows={2}
                        sx={textFieldSx}
                        // className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                        className={`${(mode == 'view' || isShipper) && 'bg-[#EFECEC] rounded-[8px]'}`}
                        InputProps={inputPropsTextField}
                        fullWidth
                    />
                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                        <span className="text-[13px]">{watch("doc_8_input_more")?.length || 0} / 500</span>
                    </div>
                </div>
            </div>

            {/* File */}
            {/* ถ้าเป็น edit view แสดงอันนี้ */}
            {
                (mode == 'edit' || mode == 'view') && fileNameEditTextUrl !== '' &&
                <div className="grid grid-cols-2 gap-4 pt-3">
                    <div className="col-span-2 ">
                        <label className={`${labelClass} !font-light`}>
                            {`File`}
                        </label>
                        <div className="h-[46px] text-[#464255] p-3 rounded-[6px] bg-[#F3F2F2] flex justify-between w-full">
                            <div className="flex items-center gap-2">
                                <InsertDriveFileOutlinedIcon sx={{ fontSize: '20px' }} /> {fileNameEditText}
                            </div>

                            <button
                                type="button"
                                className={`flex items-center justify-center px-[2px] py-[2px] rounded-[4px] relative ${fileNameEditTextUrl === '' ? 'bg-[#f0f0f0] cursor-not-allowed pointer-events-none' : 'hover:bg-[#DFE4EA] hover:border hover:border-[#DFE4EA]'}`}
                                onClick={() => downloadFile()}
                                disabled={fileNameEditTextUrl !== '' ? false : true}
                            >
                                <FileDownloadIcon sx={{ fontSize: 23, color: '#1473A1', backgroundColor: '#ffffff', borderRadius: '4px', borderColor: '#DFE4EA' }} />
                            </button>
                        </div>
                    </div>
                </div>
            }

            {/* File */}
            {/* ถ้าเป็น create แสดงอันนี้ */}
            {
                userDT?.account_manage?.[0]?.user_type_id !== 3 && mode == 'create' &&
                <div className="grid grid-cols-2 gap-4 pt-3">
                    <div>
                        <label className={`${labelClass}`}>{`File`}</label>
                        <div className={`flex items-center col-span-2 ${fileName == "Invalid file type. Please upload a Excel file." || fileName == 'The file is larger than 5 MB.' ? 'border  border-[#ff0000] rounded-r-lg rounded-l-lg' : ''}`}>
                            <label className={`flex bg-[#00ADEF] text-white items-center justify-center font-light rounded-l-[6px] text-[16px] text-justify w-[40%] !h-[44px] px-2 cursor-pointer`}>
                                {`Choose File`}
                                {isUploading && (
                                    <span className="ml-2 w-[14px] h-[14px] border-[2px] border-white border-t-transparent rounded-full animate-spin"></span>
                                )}
                                <input
                                    id="url"
                                    type="file"
                                    className="hidden"
                                    {...register('file')}
                                    // accept=".xls, .xlsx"
                                    onChange={handleFileChange}
                                />
                            </label>

                            <div className="bg-white text-[#9CA3AF] text-sm w-[70%] !h-[44px] px-2 py-2 rounded-r-[6px] border-l-0 border border-gray-300 truncate overflow-hidden flex items-center">
                                <span className="truncate">
                                    {fileName}
                                </span>
                                {fileName !== "Maximum File 5 MB" && (
                                    <CloseOutlinedIcon
                                        onClick={handleRemoveFile}
                                        className="cursor-pointer ml-2 text-[#9CA3AF] z-10"
                                        sx={{ color: '#323232', fontSize: 18 }}
                                        style={{ fontSize: 18 }}
                                    />
                                )}
                            </div>
                        </div>
                        <div className={`w-full flex items-center justify-between text-[14px] text-red-500 `}>
                            {fileName == 'The file is larger than 5 MB.' && fileName}
                            {fileName == 'Invalid file type. Please upload a Excel file.' && fileName}
                        </div>
                    </div>
                </div>
            }


            {/* เลือก shipper && Email Group */}
            {
                userDT?.account_manage?.[0]?.user_type_id !== 3 && (mode == 'create' || mode == 'edit') &&
                <div className="grid grid-cols-2 gap-4 pt-5">
                    <div className="w-full ">
                        <div className='pb-2'>
                            <span className="text-[#464255] font-semibold pb-2 mb-2">Shipper</span>
                        </div>
                        <Select
                            id="shipper_id"
                            multiple
                            IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                            {...register("shipper_id", { required: false })}
                            disabled={mode == 'view' ? true : false}
                            value={selectedShippers}
                            onChange={handleSelectChange}
                            className={`${selectboxClass} ${(mode == 'view') && "!bg-[#EFECEC]"} ${errors.shipper_id && "border-red-500"}`}
                            sx={{
                                ".MuiOutlinedInput-notchedOutline": { borderColor: errors.shipper_id && selectedShippers.length === 0 ? "#FF0000" : "#DFE4EA" },
                                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#d2d4d8" },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#d2d4d8" },
                                ".MuiSelect-multiple": {
                                    fontSize: 14 // ขนาดของ tag ที่แสดงรายการที่เลือก
                                },
                                ".MuiSelect-select": {
                                    fontSize: 14 // สำคัญที่สุด – ขนาดข้อความหลักของ Select
                                },
                                fontSize: 14
                            }}
                            displayEmpty
                            renderValue={(selected) => {
                                if (selected.length === 0) {
                                    return <Typography color="#9CA3AF" fontSize={14}>Select Shipper Name</Typography>;
                                }
                                // return selected.map((id) => shipperData.find((item: any) => item.id === id)?.name).join(", ");
                                const shipper_data = shipperData?.filter((item: any) => !defaultShippersId?.includes(item.id))
                                return (
                                    <span className={`pl-[10px] text-[14px]`}>
                                        {shipper_data?.length == selectedShippers?.length ? `Select All` : selected.map((id) => shipperData?.filter((item: any) => !defaultShippersId?.includes(item.id)).find((item: any) => item.id === id)?.name).join(", ")}
                                    </span>
                                );
                            }}
                            MenuProps={{ PaperProps: { style: { maxHeight: 48 * 4.5 + 8 } } }}
                        >
                            {userDT?.account_manage?.[0]?.user_type_id !== 3 && (
                                <MenuItem value="all">
                                    <Checkbox checked={selectedShippers.length === shipperData.length && shipperData.length > 0} />
                                    <ListItemText
                                        primary="Select All"
                                        // sx={{ fontWeight: 'bold' }}
                                        primaryTypographyProps={{ sx: { fontWeight: 'bold', fontSize: "14px" } }}
                                    />
                                </MenuItem>
                            )}

                            {shipperData
                                ?.filter((item: any) => !defaultShippersId?.includes(item.id)) // เอาอันที่มีอยู่แล้วออกจาก option 
                                ?.sort((a: any, b: any) => a.name.localeCompare(b.name)) // แล้วค่อย sort
                                ?.map((item: any) => (
                                    <MenuItem
                                        key={item.id}
                                        value={item.id}
                                        disabled={false}
                                    >
                                        <Checkbox checked={selectedShippers?.includes(item.id)} />
                                        <ListItemText primary={item.name} primaryTypographyProps={{ fontSize: 14 }} />
                                    </MenuItem>
                                ))
                            }
                        </Select>

                        {/* <div className="flex flex-wrap gap-3 pt-4 w-full h-[100px] max-h-[120px] overflow-y-auto"> */}
                        <div className="flex flex-wrap gap-2 pt-2 mt-2 w-full max-h-[120px] overflow-y-auto">

                            {/* ลบไม่ได้เว่ย */}
                            {defaultShippersRender?.map((item: any, index: number) => (
                                <div
                                    key={`default-${index}`}
                                    className="relative w-fit h-[40px] p-2 text-[14px] bg-[#CFF2FF] border border-[#DFE4EA] rounded-[6px] text-[#58585A] break-all"
                                >
                                    {item?.name}
                                </div>
                            ))}

                            {
                                selectedShippersRender?.map((item: any, index: number) => (
                                    <div
                                        key={index}
                                        className="relative w-fit h-[40px] p-2 text-[14px] bg-[#CFF2FF] border border-[#DFE4EA] rounded-[6px] text-[#58585A] break-all"
                                    >
                                        {item?.name}
                                        <button
                                            type="button"
                                            className="absolute top-[-6px] right-[-4px] w-[15px] h-[15px] rounded-full bg-[#58585A] text-white flex justify-center items-center text-[8px]"
                                            onClick={() => removeShipper(item?.id)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))
                            }
                        </div>
                    </div>

                    <div className="w-full ">
                        <div className='pb-2'>
                            <span className="text-[#464255] font-semibold pb-2 mb-2">Email Group</span>
                        </div>
                        <Select
                            id="email_group"
                            multiple
                            IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                            {...register("email_group", { required: false })}
                            disabled={mode == 'view' ? true : false}
                            value={selectedEmailGroup}
                            onChange={handleSelectEmailGroup}
                            className={`${selectboxClass} ${(mode == 'view') && "!bg-[#EFECEC]"} ${errors.email_group && "border-red-500"}`}
                            sx={{
                                ".MuiOutlinedInput-notchedOutline": { borderColor: errors.email_group && selectedEmailGroup.length === 0 ? "#FF0000" : "#DFE4EA" },
                                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#d2d4d8" },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#d2d4d8" },
                                ".MuiSelect-multiple": {
                                    fontSize: 14 // ขนาดของ tag ที่แสดงรายการที่เลือก
                                },
                                ".MuiSelect-select": {
                                    fontSize: 14 // สำคัญที่สุด – ขนาดข้อความหลักของ Select
                                },
                                fontSize: 14
                            }}
                            displayEmpty
                            renderValue={(selected) => {
                                if (selected.length === 0) {
                                    return <Typography color="#9CA3AF" fontSize={14}>Select Email Group</Typography>;
                                }
                                // return selected.map((id) => emailGroupForEventData.find((item: any) => item.id === id)?.name).join(", ");
                                const email_group_data = emailGroupForEventData?.filter((item: any) => !defaultEmailGrouId?.includes(item.id))
                                return (
                                    <span className={`pl-[10px] text-[14px]`}>
                                        {email_group_data?.length == selectedEmailGroup?.length ? `Select All` : selected.map((id) => emailGroupForEventData?.filter((item: any) => !defaultEmailGrouId?.includes(item.id)).find((item: any) => item.id === id)?.name).join(", ")}
                                    </span>
                                );
                            }}
                            MenuProps={{ PaperProps: { style: { maxHeight: 48 * 4.5 + 8 } } }}
                        >

                            <MenuItem value="all" sx={{ fontSize: "14px", color: "#454255" }}>
                                <Checkbox checked={selectedEmailGroup.length === emailGroupForEventData.length && emailGroupForEventData.length > 0} />
                                <ListItemText
                                    primary="Select All"
                                    // sx={{ fontWeight: 'bold' }}
                                    primaryTypographyProps={{ sx: { fontWeight: 'bold', fontSize: "14px" } }}
                                />
                            </MenuItem>

                            {emailGroupForEventData
                                ?.filter((item: any) => !defaultEmailGrouId?.includes(item.id)) // เอาอันที่มีอยู่แล้วออกจาก option 
                                .sort((a: any, b: any) => a.name.localeCompare(b.name))?.map((item: any) => (
                                    <MenuItem
                                        key={item.id}
                                        value={item.id}
                                        disabled={false}
                                    >
                                        <Checkbox checked={selectedEmailGroup?.includes(item.id)} />
                                        <ListItemText primary={item.name} primaryTypographyProps={{ fontSize: 14 }} />
                                    </MenuItem>
                                ))}
                        </Select>

                        {/* <div className="flex flex-wrap gap-3 pt-4 w-full h-[100px] max-h-[120px] overflow-y-auto"> */}
                        <div className="flex flex-wrap gap-2 pt-2 mt-2 w-full max-h-[120px] overflow-y-auto">
                            {/* ลบไม่ได้เว่ย */}
                            {defaultEmailGroupRender?.map((item: any, index: number) => (
                                <div
                                    key={`default-${index}`}
                                    className="relative w-fit h-[40px] p-2 text-[14px] bg-[#F3F2F2] border border-[#DFE4EA] rounded-[6px] text-[#58585A] break-all"
                                >
                                    {item?.name}
                                </div>
                            ))}

                            {
                                selectedEmailGroupRender?.map((item: any, index: number) => (
                                    <div
                                        key={index}
                                        className="relative w-fit h-[40px] p-2 text-[14px] bg-[#F3F2F2] border border-[#DFE4EA] rounded-[6px] text-[#58585A] break-all"
                                    >
                                        {item?.name}

                                        <button
                                            type="button"
                                            className="absolute top-[-6px] right-[-4px] w-[15px] h-[15px] rounded-full bg-[#58585A] text-white flex justify-center items-center text-[8px]"
                                            onClick={() => removeEmailGroup(item?.id)}
                                        >
                                            ✕
                                        </button>

                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            }


            {/* เลือก CC Email */}
            {
                userDT?.account_manage?.[0]?.user_type_id !== 3 && (mode == 'create' || mode == 'edit') &&
                <div className="grid grid-cols-2 gap-4 pt-3">
                    <div className="w-full col-span-2">
                        <div className='pb-2'>
                            <span className="text-[#464255] font-semibold pb-2 mb-2">CC Email</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                id="email"
                                type="email"
                                value={watch("email")}
                                placeholder="Enter Email"
                                readOnly={mode == 'view' ? true : false}
                                // {...register("email")}
                                onChange={(e) => {
                                    onChange(e);
                                    setAlertDupMail(false);
                                    setIsTsoEdited(true)
                                }}
                                {...restEmail}
                                className={`${inputClass} ${errors.email && "border-red-500"} ${mode == 'view' && '!bg-[#EFECEC]'}`}
                            />

                            <AddOutlinedIcon
                                sx={{ fontSize: 33, width: 44, height: 44 }}
                                className={`text-[#ffffff] border rounded-md p-1 cursor-pointer ${mode == 'view' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(watch("email")) ? 'bg-[#58585A] border-gray-500' : 'bg-[#24AB6A] border-[#24AB6A]'}`}
                                onClick={() => {
                                    const email: any = watch("email");
                                    if (mode !== 'view' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                                        if (!emailGroup?.includes(email) && !defaultCcEmailRender?.includes(email)) {
                                            setAlertDupMail(false);
                                            addEmailGroup(email);
                                        } else {
                                            setAlertDupMail(true);
                                            // alert("Email already exists!");
                                        }
                                    }
                                }}
                            />
                        </div>
                        {
                            alertDupMail && <p className={`${textErrorClass}`}>{'Email already exists'}</p>
                        }
                        {/* <div className="flex flex-wrap gap-2 pt-4 w-full h-[120px] overflow-y-auto"> */}
                        <div className="flex flex-wrap gap-2 pt-2 mt-2 w-full max-h-[120px] overflow-y-auto">
                            {
                                defaultCcEmailRender && defaultCcEmailRender?.map((item: any, index: number) => (
                                    <div
                                        key={index}
                                        className="relative w-fit h-[40px] p-2 text-[14px] bg-[#FFFFFF] border border-[#DFE4EA] rounded-[6px] text-[#58585A] break-all"
                                    >
                                        {item}
                                    </div>
                                ))
                            }

                            {
                                emailGroup && emailGroup?.map((item: any, index: number) => (
                                    <div
                                        key={index}
                                        className="relative w-fit h-[40px] p-2 text-[14px] bg-[#FFFFFF] border border-[#DFE4EA] rounded-[6px] text-[#58585A] break-all"
                                    >
                                        {item}
                                        <button
                                            type="button"
                                            className="absolute top-[-6px] right-[-4px] w-[15px] h-[15px] rounded-full bg-[#58585A] text-white flex justify-center items-center text-[8px]"
                                            onClick={() => removeEmail(index)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))
                            }
                        </div>
                    </div>

                </div>
            }


            {/* ตาราง แสดงเฉพาะ TSO edit view */}
            {/* 
                event_runnumber.event_document = เอามาใส่ใน table ของ doc2
                ใช้กับ select shipper เพื่อเช็คไม่ให้ลบอันที่มีอยู่แล้ว ด้วย 
            */}
            {
                userDT?.account_manage?.[0]?.user_type_id !== 3 && (mode == 'edit' || mode == 'view') && <div className="pt-4"><TableDocument8 tableData={dataTable} dataOpenDocument={dataOpenDocument} /></div>
            }



            {/* <div className="flex justify-end pt-8">
                {mode !== 'view' && (
                    <button
                        type="submit"
                        className="w-[167px] font-semibold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={false}
                    >
                        {mode === 'create' ? 'Submit' : 'Save'}
                    </button>
                )}
            </div> */}

            {(() => {
                const shouldHideButton = userDT?.account_manage?.[0]?.user_type_id === 3 && (dataOpenDocument?.event_doc_status_id === 1 || dataOpenDocument?.event_doc_status_id === 5);

                return (
                    <div className="flex justify-end pt-8">
                        {mode !== 'view' && !shouldHideButton && (
                            <button
                                type="submit"
                                className="w-[167px] h-[44px] font-semibold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                // disabled={false}
                                // disabled={(mode == 'edit' && isTsoEdited) || mode == 'create' ? false : true} // Edit : ถ้าไม่มีข้อมูลอะไร update ให้ disable ปุ่ม save ไว้ https://app.clickup.com/t/86eupj7bm
                                disabled={!(
                                    (userDT?.account_manage?.[0]?.user_type_id === 3) || (mode === 'edit' && !isTsoEdited) || mode === 'create' // Edit : ถ้าไม่มีข้อมูลอะไร update ให้ disable ปุ่ม save ไว้ https://app.clickup.com/t/86eupj7bm
                                )}
                            >
                                {mode === 'create' ? 'Submit' : userDT?.account_manage?.[0]?.user_type_id === 3 ? 'Acknowledge' : 'Save'}
                            </button>
                        )}
                    </div>
                )
            })()}
        </form>

        {/* Confirm Save */}
        <ModalConfirmSave
            open={modaConfirmSave}
            handleClose={(e: any) => {
                setModaConfirmSave(false);
                if (e == "submit") {
                    // setIsLoading(true);
                    setTimeout(async () => {
                        await onSubmit(dataSubmit);
                    }, 100);

                    setTimeout(async () => {
                        setIsOpenDocument(false); // สร้างแล้วปิดหน้า create doc 
                    }, 1000);
                }
            }}
            title={mode == 'create' ? "Confirm Submission" : isShipper ? "Confirm Acknowledge" : mode == 'edit' ? "Confirm Save" : 'Confirm'}
            description={
                mode == 'create' ?
                    <div>
                        <div className="text-center">
                            {`Do you want to submit now ?`}
                        </div>
                    </div >
                    : isShipper ? <div>
                        <div className="text-center">
                            {`Do you want to Acknowledge now ?`}
                        </div>
                    </div >
                        :
                        mode == 'edit' &&
                        <div>
                            <div className="text-center">
                                {`Do you want to save the changes ?`}
                            </div>
                        </div >
            }
            menuMode="confirm-save"
            btnmode="split"
            btnsplit1={mode == 'create' ? "Submit" : mode == 'edit' ? "Save" : "Acknowledge"}
            btnsplit2="Cancel"
            stat="none"
        />

    </>
    );
};

export default FormDocument8;