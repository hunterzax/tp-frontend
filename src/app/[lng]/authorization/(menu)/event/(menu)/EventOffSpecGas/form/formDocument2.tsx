"use client";
import { useEffect, useMemo, useState } from "react";
import { cutUploadFileName, formatDateNoTime, formatFormDate, generateUserPermission } from '@/utils/generalFormatter';
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
import getUserValue from "@/utils/getuserValue";
import TableDocument2 from "./tableInDocument2";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type FormExampleProps = {
    data?: Partial<any>;
    mode?: any;
    userDT?: any;
    shipperData?: any;
    emailGroupForEventData?: any;
    refDoc1Data?: any;
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
// doc2_input_delivery_point_at_the_scene                                String? // doc2 จุดส่งเข้าที่ก๊าซไม่อยู่ในข้อกำหนดคุณภาพก๊าซ
// doc2_input_date_time_of_the_incident                                  String? // doc2 วัน/เวลาที่ก๊าซไม่อยู่ในข้อกำหนดคุณภาพก๊าซ
// doc2_input_gas_quality_is_not_in_the_gas_quality_requirements         String? // doc2 ประเภทและค่าของคุณภาพก๊าซไม่อยู่ในข้อกำหนดคุณภาพก๊าซ
// doc2_input_reason_the_gas_quality_requirements String? // doc2 สาเหตุที่ทำให้ก๊าซไม่อยู่ในข้อกำหนดคุณภาพก๊าซ
// doc2_input_duration_that_is_expected_to_be_completed                  String? // doc2 ระยะเวลาที่คาดว่าจะแก้ไขแล้วเสร็จ
// doc2_input_duration_of_the_gas_travel_to_various_points               String? // doc2 ระยะเวลาที่ก๊าซฯ  เดินทางถึงจุดต่างๆ 
// doc2_input_note                                                       String? // doc2 หมายเหตุ

const FormDocument2: React.FC<FormExampleProps> = ({ mode, data, onSubmit, setIsOpenDocument, dataOpenDocument, modeOpenDocument, userDT, shipperData, emailGroupForEventData, refDoc1Data }) => {
    const { control, register, handleSubmit, setValue, reset, clearErrors, formState: { errors }, watch, } = useForm<any>({ defaultValues: data, });
    const [tk, settk] = useState<boolean>(false); // ของคุ้นเคย

    const { onChange, ...restEmail } = register("email"); // register email

    const [headerFormText, setHeaderFormText] = useState('');
    const [fileNameEditText, setFileNameEditText] = useState(''); // เอาไว้แสดงชื่อไฟล์ตอนเข้ามา view หรือ edit
    const [fileNameEditTextUrl, setFileNameEditUrl] = useState(''); // เอาไว้กดโหลดตอนเข้ามา view หรือ edit
    const [documentId, setDocumentId] = useState(''); // ID ของ Document 2
    const isReadOnly = mode === "view" || mode == 'edit';
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [dataTable, setDataTable] = useState<any>([])
    const [isTsoEdited, setIsTsoEdited] = useState<boolean>(false); // Edit : ถ้าไม่มีข้อมูลอะไร update ให้ disable ปุ่ม save ไว้ https://app.clickup.com/t/86eupj5fu

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

    useEffect(() => {
        let text_header: any = 'สร้างเอกสารแจ้งเตือนคุณภาพก๊าซฯ 2'
        switch (modeOpenDocument) {
            case 'view':
                text_header = 'ดูข้อมูลเอกสารแจ้งเตือนคุณภาพก๊าซฯ 2'
                break;
            case 'edit':
                text_header = 'แก้ไขเอกสารแจ้งเตือนคุณภาพก๊าซฯ 2'
                break;
        }
        setHeaderFormText(text_header)
        // setDocumentId(dataOpenDocument?.document1?.id)
        setDocumentId(dataOpenDocument?.id)

        if (modeOpenDocument == 'edit' || modeOpenDocument == 'view') {
            setValue('ref_doc_1', dataOpenDocument?.event_runnumber_id)
            // setValue('event_date', dataOpenDocument?.event_runnumber?.event_date)
            setValue('event_date', dataOpenDocument?.event_date)
            setValue('longdo_dict', dataOpenDocument?.longdo_dict)

            // set ชื่อ shipper กลับที่เดิม
            const groupIds = dataOpenDocument?.event_runnumber?.event_document?.map((item: any) => item.group_id);
            // setSelectedShippers(groupIds);
            // setValue("shipper_id", groupIds);
            const filteredShippers = shipperData?.filter((item: any) => groupIds?.includes(item.id));
            const defaultIds = filteredShippers?.map((s: any) => s.id); // เอา id 
            // setSelectedShippersRender([...filteredShippers]);
            setDefaultShippersRender(filteredShippers); // ลบไม่ได้
            setDefaultShippersId(defaultIds) // ลบไม่ได้


            // set email group กลับที่เดิม
            const emailGroupForEventIds = dataOpenDocument?.event_document_email_group_for_event?.map((item: any) => item.edit_email_group_for_event_id);
            // setSelectedEmailGroup(emailGroupForEventIds);
            // setValue("shipper_id", emailGroupForEventIds);
            const filter_email_group_for_event = emailGroupForEventData?.filter((item: any) => emailGroupForEventIds?.includes(item?.id))
            const defaultEmailGroupIds = filter_email_group_for_event?.map((s: any) => s.id); // เอา id 
            // setSelectedEmailGroupRender([...filter_email_group_for_event]);
            setDefaultEmailGroupRender(filter_email_group_for_event) // ลบไม่ได้
            setDefaultEmailGrouId(defaultEmailGroupIds) // ลบไม่ได้

            // set CC email กลับที่เดิม
            const ccEmail = dataOpenDocument?.event_document_cc_email?.map((item: any) => item.email);
            // setEmailGroup(ccEmail);
            // setValue("email_arr", ccEmail);
            setDefaultCcEmailRender(ccEmail)  // ลบไม่ได้


            // ข้อมูลที่ shipper กด accept หรือ reject ในตารางข้างล่าง
            setDataTable(dataOpenDocument?.event_runnumber?.event_document)


            // SET ข้อมูลลงฟอร์มนะ
            setValue('doc2_input_delivery_point_at_the_scene', dataOpenDocument?.doc2_input_delivery_point_at_the_scene) // doc2 จุดส่งเข้าที่ก๊าซไม่อยู่ในข้อกำหนดคุณภาพก๊าซ
            setValue('doc2_input_date_time_of_the_incident', dataOpenDocument?.doc2_input_date_time_of_the_incident) // doc2 วัน/เวลาที่ก๊าซไม่อยู่ในข้อกำหนดคุณภาพก๊าซ
            setValue('doc2_input_gas_quality_is_not_in_the_gas_quality_requirements', dataOpenDocument?.doc2_input_gas_quality_is_not_in_the_gas_quality_requirements) // doc2 ประเภทและค่าของคุณภาพก๊าซไม่อยู่ในข้อกำหนดคุณภาพก๊าซ
            setValue('doc2_input_reason_the_gas_quality_requirements', dataOpenDocument?.doc2_input_reason_the_gas_quality_requirements)  // doc2 สาเหตุที่ทำให้ก๊าซไม่อยู่ในข้อกำหนดคุณภาพก๊าซ
            setValue('doc2_input_duration_that_is_expected_to_be_completed', dataOpenDocument?.doc2_input_duration_that_is_expected_to_be_completed)  // doc2 ระยะเวลาที่คาดว่าจะแก้ไขแล้วเสร็จ
            setValue('doc2_input_duration_of_the_gas_travel_to_various_points', dataOpenDocument?.doc2_input_duration_of_the_gas_travel_to_various_points) // doc2 ระยะเวลาที่ก๊าซฯ  เดินทางถึงจุดต่างๆ 
            setValue('doc2_input_note', dataOpenDocument?.doc2_input_note) // doc2 หมายเหตุ

            setValue('event_doc_status_id', dataOpenDocument?.event_doc_status_id == 3 ? 'accepted' : dataOpenDocument?.event_doc_status_id == 4 ? 'rejected' : dataOpenDocument?.event_doc_status_id == 5 ? 'acknowledge' : '')
            setFileNameEditText(dataOpenDocument?.event_document_file?.length > 0 ? cutUploadFileName(dataOpenDocument?.event_document_file[0]?.url) : '')
            setFileNameEditUrl(dataOpenDocument?.event_document_file?.length > 0 ? dataOpenDocument?.event_document_file[0]?.url : '')
        }


    }, [mode, dataOpenDocument, shipperData, emailGroupForEventData])


    {/* Confirm Save */ }
    const handleSaveConfirm = async (data?: any) => {
        if (mode == 'create') {
            const tso_create = {
                "ref_document": watch('ref_doc_1'), // id runnumber ไม่ ref null
                "event_date": dayjs(watch('event_date')).format("YYYY-MM-DD"), // ถ้า ref เอามาจาก ref
                "longdo_dict": data?.longdo_dict, //สำเนา
                "doc2_input_delivery_point_at_the_scene": data?.doc2_input_delivery_point_at_the_scene,
                "doc2_input_date_time_of_the_incident": data?.doc2_input_date_time_of_the_incident,
                "doc2_input_gas_quality_is_not_in_the_gas_quality_requirements": data?.doc2_input_gas_quality_is_not_in_the_gas_quality_requirements,
                "doc2_input_reason_the_gas_quality_requirements": data?.doc2_input_reason_the_gas_quality_requirements,
                "doc2_input_duration_that_is_expected_to_be_completed": data?.doc2_input_duration_that_is_expected_to_be_completed,
                "doc2_input_duration_of_the_gas_travel_to_various_points": data?.doc2_input_duration_of_the_gas_travel_to_various_points,
                "doc2_input_note": data?.doc2_input_note ? data?.doc2_input_note : null,
                "file": fileUrl !== '' ? [fileUrl] : [],
                "shipper": selectedShippers,
                "email_event_for_shipper": selectedEmailGroup,
                "cc_email": emailGroup
            }
            setDataSubmit(tso_create)
            setModaConfirmSave(true)

            // await onSubmit(tso_create); // ไป submit ตอนกดเฟิร์ม
        } else {

            let data_post_na: any = {}
            if (userDT?.account_manage?.[0]?.user_type_id !== 3) {
                // mode edit tso
                data_post_na = {
                    "event_date": watch('event_date'),
                    "document_id": documentId, // เอาไว้ใช้เส้น POST master/event/offspec-gas/doc2/edit/${id}
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
                let stat_shipper_edit: any = 3
                switch (data?.event_doc_status_id) {
                    case 'accepted':
                        stat_shipper_edit = 3
                        break;
                    case 'rejected':
                        stat_shipper_edit = 4
                        break;
                    case 'acknowledge':
                        stat_shipper_edit = 5
                        break;
                }

                data_post_na = {
                    "document_id": documentId, // เอาไว้ใช้เส้น POST master/event/offspec-gas/doc2/edit/${id}
                    "event_doc_status_id": stat_shipper_edit, // 3 Accept, 4 Reject, 5 Acknowledge
                    "doc2_input_note": data?.doc2_input_note
                }
            }

            setDataSubmit(data_post_na)
            setModaConfirmSave(true)
        }
    }

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

    // ############# SHIPPER SELECT #############
    const [selectedShippers, setSelectedShippers] = useState<string[]>([]);
    const [selectedShippersRender, setSelectedShippersRender] = useState<any[]>([]);

    const handleSelectChange = (event: any) => {
        const value = event.target.value;
        setIsTsoEdited(true)

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

    // ############# EMAIL GROUP SELECT #############
    const [selectedEmailGroup, setSelectedEmailGroup] = useState<string[]>([]);
    const [selectedEmailGroupRender, setSelectedEmailGroupRender] = useState<any[]>([]);

    const handleSelectEmailGroup = (event: any) => {
        const value = event.target.value;

        setIsTsoEdited(true)

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
                <div className="w-[350px]">
                    <label htmlFor="event_nember" className={labelClass}>
                        {`อ้างอิงจากเอกสารแจ้งเตือนคุณภาพก๊าซฯ 1`}
                    </label>

                    {
                        mode == 'create' ?
                            <SelectFormProps
                                id={'ref_doc_1'}
                                register={register("ref_doc_1", { required: false })}
                                disabled={mode == 'edit' ? true : false}
                                valueWatch={watch("ref_doc_1") || ""}
                                handleChange={(e) => {
                                    setValue("ref_doc_1", e.target.value);

                                    // ปิดเพราะให้ user เลือกวันที่เองได้ ไม่เอาจาก ref
                                    // const find_doc1_data = refDoc1Data?.find((item: any) => item?.id == e.target.value)
                                    // setValue("event_date", find_doc1_data?.event_date); // ใส่วันที่จาก doc1

                                    clearErrors('ref_doc_1')
                                    if (errors?.ref_doc_1) { clearErrors('ref_doc_1') }
                                }}
                                errors={errors?.ref_doc_1}
                                errorsText={'Select Document 1'}
                                options={refDoc1Data}
                                optionsKey={'id'}
                                optionsValue={'id'}
                                optionsText={'event_nember'}
                                optionsResult={'event_nember'}
                                placeholder={'Select Document 1'}
                                pathFilter={'event_nember'}
                            />
                            :
                            <div className="w-full h-[44px] p-3 text-[14px] text-[#464255] rounded-[9px] bg-[#EEECEC]"> {dataOpenDocument?.ref_runnumber_flag && dataOpenDocument?.event_runnumber.event_nember}</div>
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
                        // readOnly={watch('ref_doc_1') || mode == 'view' ? true : false} // ปิดเพราะตอนเลือก ref doc 
                        readOnly={(mode == 'edit' || mode == 'view') ? true : false}
                        placeHolder="เลือกวันที่"
                        // mode={watch('ref_doc_1') ? 'view' : 'create'}
                        mode={mode}
                        valueShow={watch("event_date") ? dayjs(watch("event_date")).format("DD/MM/YYYY") : undefined}
                        // min={new Date()}
                        allowClear
                        isError={errors.event_date && !watch("event_date") ? true : false}
                        onChange={(e: any) => { setValue('event_date', formatFormDate(e)), e == undefined && setValue('event_date', null, { shouldValidate: true, shouldDirty: true }); }}
                    />
                    {errors.event_date && !watch("event_date") && <p className={`${textErrorClass}`}>{'เลือกวันที่'}</p>}
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
                        disabled={isReadOnly}
                        rows={2}
                        sx={textFieldSx}
                        className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
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


            <div className="py-2 text-[14px] font-semibold text-[#58585A]">
                {`ส่วนของผู้ให้บริการ`}
            </div>

            {/* จุดส่งเข้าที่ก๊าซไม่อยู่ในข้อกำหนดคุณภาพก๊าซ */}
            <div className="grid grid-cols-2 gap-4 pt-3">
                <div className="w-full">
                    <label className={`${labelClass}`}>{`จุดส่งเข้าที่ก๊าซไม่อยู่ในข้อกำหนดคุณภาพก๊าซ`}</label>
                    <TextField
                        {...register("doc2_input_delivery_point_at_the_scene")}
                        value={watch("doc2_input_delivery_point_at_the_scene") || ""}
                        label=""
                        multiline
                        onChange={(e) => {
                            if (e.target.value.length <= 255) {
                                setValue("doc2_input_delivery_point_at_the_scene", e.target.value);
                            }
                        }}
                        placeholder="ระบุรายละเอียด"
                        disabled={isReadOnly}
                        rows={2}
                        sx={textFieldSx}
                        className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                        InputProps={inputPropsTextField}
                        fullWidth
                    />
                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                        <span className="text-[13px]">
                            {watch("doc2_input_delivery_point_at_the_scene")?.length || 0} / 255
                        </span>
                    </div>
                </div>


                <div className="w-full">
                    <label className={labelClass}>{`วัน/เวลาที่ก๊าซไม่อยู่ในข้อกำหนดคุณภาพก๊าซ`}</label>
                    <TextField
                        {...register("doc2_input_date_time_of_the_incident")}
                        value={watch("doc2_input_date_time_of_the_incident") || ""}
                        label=""
                        multiline
                        onChange={(e) => {
                            if (e.target.value.length <= 255) {
                                setValue("doc2_input_date_time_of_the_incident", e.target.value);
                            }
                        }}
                        placeholder="ระบุรายละเอียด"
                        disabled={isReadOnly}
                        rows={2}
                        sx={textFieldSx}
                        className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                        InputProps={inputPropsTextField}
                        fullWidth
                    />
                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                        <span className="text-[13px]">
                            {watch("doc2_input_date_time_of_the_incident")?.length || 0} / 255
                        </span>
                    </div>
                </div>
            </div>

            {/* ประเภทและค่าของคุณภาพก๊าซไม่อยู่ในข้อกำหนดคุณภาพก๊าซ */}
            <div className="grid grid-cols-2 gap-4 pt-3">
                <div className="w-full col-span-2">
                    <label className={labelClass}>{`ประเภทและค่าของคุณภาพก๊าซไม่อยู่ในข้อกำหนดคุณภาพก๊าซ`}</label>
                    <TextField
                        {...register("doc2_input_gas_quality_is_not_in_the_gas_quality_requirements")}
                        value={watch("doc2_input_gas_quality_is_not_in_the_gas_quality_requirements") || ""}
                        label=""
                        multiline
                        onChange={(e) => {
                            if (e.target.value.length <= 500) {
                                setValue("doc2_input_gas_quality_is_not_in_the_gas_quality_requirements", e.target.value);
                            }
                        }}
                        placeholder="ระบุรายละเอียด"
                        disabled={isReadOnly}
                        rows={2}
                        sx={textFieldSx}
                        className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                        InputProps={inputPropsTextField}
                        fullWidth
                    />
                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                        <span className="text-[13px]">
                            {watch("doc2_input_gas_quality_is_not_in_the_gas_quality_requirements")?.length || 0} / 500
                        </span>
                    </div>
                </div>
            </div>

            {/* สาเหตุที่ทำให้ก๊าซไม่อยู่ในข้อกำหนดคุณภาพก๊าซ */}
            <div className="grid grid-cols-2 gap-4 pt-3">
                <div className="w-full col-span-2">
                    <label className={labelClass}>{`สาเหตุที่ทำให้ก๊าซไม่อยู่ในข้อกำหนดคุณภาพก๊าซ`}</label>
                    <TextField
                        {...register("doc2_input_reason_the_gas_quality_requirements")}
                        value={watch("doc2_input_reason_the_gas_quality_requirements") || ""}
                        label=""
                        multiline
                        onChange={(e) => {
                            if (e.target.value.length <= 500) {
                                setValue("doc2_input_reason_the_gas_quality_requirements", e.target.value);
                            }
                        }}
                        placeholder="ระบุรายละเอียด"
                        disabled={isReadOnly}
                        rows={2}
                        sx={textFieldSx}
                        className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                        InputProps={inputPropsTextField}
                        fullWidth
                    />
                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                        <span className="text-[13px]">
                            {watch("doc2_input_reason_the_gas_quality_requirements")?.length || 0} / 500
                        </span>
                    </div>
                </div>
            </div>

            {/* ระยะเวลาที่คาดว่าจะแก้ไขแล้วเสร็จ */}
            <div className="grid grid-cols-2 gap-4 pt-3">
                <div className="w-full ">
                    <label className={labelClass}>{`ระยะเวลาที่คาดว่าจะแก้ไขแล้วเสร็จ`}</label>
                    <TextField
                        {...register("doc2_input_duration_that_is_expected_to_be_completed")}
                        value={watch("doc2_input_duration_that_is_expected_to_be_completed") || ""}
                        label=""
                        multiline
                        onChange={(e) => {
                            if (e.target.value.length <= 255) {
                                setValue("doc2_input_duration_that_is_expected_to_be_completed", e.target.value);
                            }
                        }}
                        placeholder="ระบุรายละเอียด"
                        disabled={isReadOnly}
                        rows={2}
                        sx={textFieldSx}
                        className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                        InputProps={inputPropsTextField}
                        fullWidth
                    />
                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                        <span className="text-[13px]">
                            {watch("doc2_input_duration_that_is_expected_to_be_completed")?.length || 0} / 255
                        </span>
                    </div>
                </div>

                <div className="w-full ">
                    <label className={labelClass}>{`ระยะเวลาที่ก๊าซฯ เดินทางถึงจุดต่างๆ`}</label>
                    <TextField
                        {...register("doc2_input_duration_of_the_gas_travel_to_various_points")}
                        value={watch("doc2_input_duration_of_the_gas_travel_to_various_points") || ""}
                        label=""
                        multiline
                        onChange={(e) => {
                            if (e.target.value.length <= 255) {
                                setValue("doc2_input_duration_of_the_gas_travel_to_various_points", e.target.value);
                            }
                        }}
                        placeholder="ระบุรายละเอียด"
                        disabled={isReadOnly}
                        rows={2}
                        sx={textFieldSx}
                        className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                        InputProps={inputPropsTextField}
                        fullWidth
                    />
                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                        <span className="text-[13px]">
                            {watch("doc2_input_duration_of_the_gas_travel_to_various_points")?.length || 0} / 255
                        </span>
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
                                        <ListItemText
                                            primary={item.name}
                                            primaryTypographyProps={{ fontSize: 14 }} // <-- ตรงนี้คือ font size ของข้อความ
                                        />
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
                                        <ListItemText
                                            primary={item.name}
                                            primaryTypographyProps={{ fontSize: 14 }} // <-- ตรงนี้คือ font size ของข้อความ
                                        />
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

                        {/* {errors.event_date && !watch("event_date") && <p className={`${textErrorClass}`}>{'เลือกวันที่'}</p>} */}


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
                userDT?.account_manage?.[0]?.user_type_id !== 3 && (mode == 'edit' || mode == 'view') && <div className="pt-2"><TableDocument2 tableData={dataTable} dataOpenDocument={dataOpenDocument} /></div>
            }



            {/* ส่วนของผู้ให้บริการ แค่ shipper เห็น */}
            {
                userDT?.account_manage?.[0]?.user_type_id === 3 && (mode == 'edit' || mode == 'view') &&
                <div className="grid grid-cols-2 gap-4 pt-3">
                    <span className="text-[#58585A] font-semibold"><span className="text-red-500">*</span>ส่วนของผู้ให้บริการ</span>
                    <div className="w-full col-span-2">
                        <label className="mr-8 text-[#58585A]">
                            <input
                                type="radio"
                                {...register("event_doc_status_id", { required: mode == 'edit' ? true : false })}
                                value="accepted"
                                disabled={mode == 'view' ? true : false}
                                // checked={watch("status") === "1"}
                                // onChange={handleChange}
                                onChange={(e) => { setValue('event_doc_status_id', 'accepted') }}
                                className="mr-1 accent-[#1473A1]"
                            />
                            <span className="font-semibold text-[#464255]">{` รับ`}</span>{` ก๊าซไม่อยู่ในข้อกำหนด/เกณฑ์ที่กำหนด`}
                        </label>

                        <label className="mr-8 text-[#58585A]">
                            <input
                                type="radio"
                                {...register("event_doc_status_id", { required: mode == 'edit' ? true : false })}
                                value="rejected"
                                disabled={mode == 'view' ? true : false}
                                onChange={(e) => { setValue('event_doc_status_id', 'rejected') }}
                                className="mr-1 accent-[#1473A1]"
                            />
                            <span className="font-semibold text-[#464255]">{` ปฏิเสธ`}</span>{` ก๊าซไม่อยู่ในข้อกำหนด/เกณฑ์ที่กำหนด`}
                        </label>

                        {/* <label className="mr-8 text-[#58585A]">
                            <input
                                type="radio"
                                {...register("event_doc_status_id", { required: mode == 'edit' ? true : false })}
                                value="acknowledge"
                                disabled={mode == 'view' ? true : false}
                                onChange={(e) => { setValue('event_doc_status_id', 'acknowledge') }}
                                className="mr-1 accent-[#1473A1]"
                            />
                            <span className="font-semibold text-[#464255]">{` รับทราบ`}</span>
                        </label> */}

                    </div>
                </div>
            }


            {/* หมายเหตุ แค่ shipper เห็น */}
            {
                userDT?.account_manage?.[0]?.user_type_id === 3 && (mode == 'edit' || mode == 'view') &&
                <div className="grid grid-cols-2 gap-4 pt-3">
                    <div className="w-full col-span-2">
                        <label className={`${labelClass} !font-light`}>{`หมายเหตุ`}</label>
                        <TextField
                            {...register("doc2_input_note")}
                            value={watch("doc2_input_note") || ""}
                            label=""
                            multiline
                            onChange={(e) => {
                                if (e.target.value.length <= 500) {
                                    setValue("doc2_input_note", e.target.value);
                                }
                            }}
                            placeholder="ระบุหมายเหตุ"
                            disabled={mode == 'view' ? true : false}
                            rows={2}
                            sx={textFieldSx}
                            className={`${mode == 'view' && 'bg-[#EFECEC] rounded-[8px]'}`}
                            InputProps={inputPropsTextField}
                            fullWidth
                        />
                        <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                            <span className="text-[13px]">
                                {watch("doc2_input_note")?.length || 0} / 500
                            </span>
                        </div>
                    </div>
                </div>
            }

            <div className="flex justify-end pt-8">
                {mode !== 'view' && (
                    // <button
                    //     type="submit"
                    //     className="w-[167px] h-[44px] font-semibold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    //     // disabled={false}
                    //     disabled={(mode == 'edit' && isTsoEdited) || mode == 'create' ? false : true} // Edit : ถ้าไม่มีข้อมูลอะไร update ให้ disable ปุ่ม save ไว้ https://app.clickup.com/t/86eupj5fu
                    // >
                    //     {mode === 'create' ? 'Submit' : 'Save'}
                    // </button>

                    // เพิ่มเงื่อนไขถ้า userDT?.account_manage?.[0]?.user_type_id == 3 ให้ disable เป็น false
                    <button
                        type="submit"
                        className="w-[167px] h-[44px] font-semibold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        // disabled={(mode == 'edit' && isTsoEdited) || mode == 'create' ? false : true}
                        disabled={!(
                            (userDT?.account_manage?.[0]?.user_type_id === 3) ||
                            (mode === 'edit' && isTsoEdited) ||
                            mode === 'create'
                        )}
                    >
                        {mode === 'create' ? 'Submit' : 'Save'}
                    </button>
                )}

            </div>
        </form >


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
            // title="Confirm Save"
            title={mode == 'create' ? "Confirm Submission" : "Confirm Save"}
            description={
                mode == 'create' ?
                    <div>
                        <div className="text-center">
                            {`Do you want to submit now ?`}
                        </div>
                    </div >
                    :
                    <div>
                        <div className="text-center">
                            {`Do you want to save the changes ?`}
                        </div>
                    </div >
            }
            menuMode="confirm-save"
            btnmode="split"
            // btnsplit1="Save"
            btnsplit1={mode == 'create' ? "Submit" : "Save"}
            btnsplit2="Cancel"
            stat="none"
        />

    </>
    );
};

export default FormDocument2;