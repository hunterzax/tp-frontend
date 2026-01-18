"use client";
import { useEffect, useMemo, useState } from "react";
import { convertTimeStringToDate, cutUploadFileName, formatDateNoTime, formatFormDate, formatNumberSixDecimalNoComma, formatNumberThreeDecimalNoComma, generateUserPermission } from '@/utils/generalFormatter';
import dayjs from 'dayjs';
import { SubmitHandler, useForm } from "react-hook-form";
import ModalConfirmSave from "@/components/other/modalConfirmSave";
import { Button, Checkbox, ListItemText, MenuItem, Select, TextField, Typography } from "@mui/material";
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import DatePickaFormThai from "@/components/library/dateRang/dateSelectFormThai";
import { uploadFileService } from "@/utils/postService";
import SelectFormProps from "@/components/other/selectProps";
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import getUserValue from "@/utils/getuserValue";
import { NumericFormat } from "react-number-format";
import TimePickaForm from "@/components/library/dateRang/timePickerForm";
import BtnGeneral from "@/components/other/btnGeneral";
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import TableDocument6 from "../tableDocument6";

type FormExampleProps = {
    data?: Partial<any>;
    mode?: any;
    userDT?: any;
    shipperData?: any;
    emailGroupForEventData?: any;
    dataNomPointForDoc6?: any;
    refDocData?: any;
    maiHedDocHokLasted?: any;
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
// ref_document         // id runnumber
// longdo_dict          // สำเนา
// event_date           // วันที่ออกเอกสาร

// "doc_6_input_ref_doc_at": "บค.บคต./115/2567",    //อ้างอิงเอกสารเลขที่
// "doc_6_input_when_date": "2025-08-05",           //ช่วงเวลาของเหตุการณ์ วันที่
// "doc_6_input_when_time": "15:00",                //ช่วงเวลาของเหตุการณ์ เวลา 
// "doc_6_input_note": null,                        // หมายเหตุ


const FormDocument6: React.FC<FormExampleProps> = ({ mode, data, onSubmit, setIsOpenDocument, dataOpenDocument, modeOpenDocument, userDT, shipperData, emailGroupForEventData, dataNomPointForDoc6, refDocData, maiHedDocHokLasted }) => {
    const { control, register, handleSubmit, setValue, reset, clearErrors, formState: { errors }, watch, } = useForm<any>({ defaultValues: data, });
    const [tk, settk] = useState<boolean>(false); // ของคุ้นเคย
    const { onChange, ...restEmail } = register("email"); // register email

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

    const selectSx = {
        '.MuiOutlinedInput-notchedOutline': {
            borderColor: '#DFE4EA', // Change the border color here
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#d2d4d8',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#d2d4d8',
        },
        '&.Mui-disabled .MuiSelect-select': {
            opacity: 1, // ยกเลิกความจางของ MUI
            color: '#464255 !important', // สีที่คุณต้องการ
            WebkitTextFillColor: '#464255 !important'
        },
    }

    const [headerFormText, setHeaderFormText] = useState('');
    // const [fileNameEditText, setFileNameEditText] = useState(''); // เอาไว้แสดงชื่อไฟล์ตอนเข้ามา view หรือ edit
    // const [fileNameEditTextUrl, setFileNameEditUrl] = useState(''); // เอาไว้กดโหลดตอนเข้ามา view หรือ edit
    const [documentId, setDocumentId] = useState(''); // ID ของ Document 2
    const isReadOnly = mode === "view" || mode == 'edit';
    const isShipper = userDT?.account_manage?.[0]?.user_type_id === 3 ? true : false;

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [dataTable, setDataTable] = useState<any>([])


    // ชุดที่ 1
    const [defaultShippersRender1, setDefaultShippersRender1] = useState<any[]>([]); // SELECT SHIPPER สำหรับ mode edit ที่ไม่ให้ลบของเก่า
    const [defaultShippersId1, setDefaultShippersId1] = useState<any[]>([]); // SELECT SHIPPER สำหรับ mode edit ที่ไม่ให้ลบของเก่า
    const [fileNameEditText1, setFileNameEditText1] = useState(''); // เอาไว้แสดงชื่อไฟล์ตอนเข้ามา view หรือ edit
    const [fileNameEditTextUrl1, setFileNameEditUrl1] = useState(''); // เอาไว้กดโหลดตอนเข้ามา view หรือ edit

    // ชุดที่ 2
    const [defaultShippersRender2, setDefaultShippersRender2] = useState<any[]>([]);
    const [defaultShippersId2, setDefaultShippersId2] = useState<any[]>([]);
    const [fileNameEditText2, setFileNameEditText2] = useState(''); // เอาไว้แสดงชื่อไฟล์ตอนเข้ามา view หรือ edit
    const [fileNameEditTextUrl2, setFileNameEditUrl2] = useState(''); // เอาไว้กดโหลดตอนเข้ามา view หรือ edit

    // ชุดที่ 3
    const [defaultShippersRender3, setDefaultShippersRender3] = useState<any[]>([]);
    const [defaultShippersId3, setDefaultShippersId3] = useState<any[]>([]);
    const [fileNameEditText3, setFileNameEditText3] = useState(''); // เอาไว้แสดงชื่อไฟล์ตอนเข้ามา view หรือ edit
    const [fileNameEditTextUrl3, setFileNameEditUrl3] = useState(''); // เอาไว้กดโหลดตอนเข้ามา view หรือ edit

    // ชุดที่ 4
    const [defaultShippersRender4, setDefaultShippersRender4] = useState<any[]>([]);
    const [defaultShippersId4, setDefaultShippersId4] = useState<any[]>([]);
    const [fileNameEditText4, setFileNameEditText4] = useState(''); // เอาไว้แสดงชื่อไฟล์ตอนเข้ามา view หรือ edit
    const [fileNameEditTextUrl4, setFileNameEditUrl4] = useState(''); // เอาไว้กดโหลดตอนเข้ามา view หรือ edit

    // ชุดที่ 5
    const [defaultShippersRender5, setDefaultShippersRender5] = useState<any[]>([]);
    const [defaultShippersId5, setDefaultShippersId5] = useState<any[]>([]);
    const [fileNameEditText5, setFileNameEditText5] = useState(''); // เอาไว้แสดงชื่อไฟล์ตอนเข้ามา view หรือ edit
    const [fileNameEditTextUrl5, setFileNameEditUrl5] = useState(''); // เอาไว้กดโหลดตอนเข้ามา view หรือ edit


    const [defaultEmailGroupRender, setDefaultEmailGroupRender] = useState<any[]>([]); // EMAIL GROUP สำหรับ mode edit ที่ไม่ให้ลบของเก่า
    const [defaultEmailGrouId, setDefaultEmailGrouId] = useState<any[]>([]); // EMAIL GROUP สำหรับ mode edit ที่ไม่ให้ลบของเก่า

    const [defaultCcEmailRender, setDefaultCcEmailRender] = useState<any[]>([]); // CC EMAIL สำหรับ mode edit ที่ไม่ให้ลบของเก่า

    const inputPropsTextField = {
        style: {
            color: isReadOnly ? "#464255" : "inherit",
        },
        disableUnderline: true,
    }

    {/* Confirm Save */ }
    const [modaConfirmSave, setModaConfirmSave] = useState<any>(false)
    const [dataSubmit, setDataSubmit] = useState<any>()

    const [idChudTee1, setIdChudTee1] = useState<any>(null)
    const [idChudTee2, setIdChudTee2] = useState<any>(null)
    const [idChudTee3, setIdChudTee3] = useState<any>(null)
    const [idChudTee4, setIdChudTee4] = useState<any>(null)
    const [idChudTee5, setIdChudTee5] = useState<any>(null)

    // #region สำหรับตอน SET RESET
    const setDataChudTee = () => {
        // set ชื่อ shipper กลับที่เดิม
        const groupIds1 = dataOpenDocument?.event_doc_gas_shipper?.[0]?.event_doc_gas_shipper_match?.map((item: any) => item?.event_document_emer?.group_id);
        const groupIds2 = dataOpenDocument?.event_doc_gas_shipper?.[1]?.event_doc_gas_shipper_match?.map((item: any) => item?.event_document_emer?.group_id);
        const groupIds3 = dataOpenDocument?.event_doc_gas_shipper?.[2]?.event_doc_gas_shipper_match?.map((item: any) => item?.event_document_emer?.group_id);
        const groupIds4 = dataOpenDocument?.event_doc_gas_shipper?.[3]?.event_doc_gas_shipper_match?.map((item: any) => item?.event_document_emer?.group_id);
        const groupIds5 = dataOpenDocument?.event_doc_gas_shipper?.[4]?.event_doc_gas_shipper_match?.map((item: any) => item?.event_document_emer?.group_id);

        // ชุดที่ 1
        if (groupIds1) {
            // ชุด 1 มีของ
            getShipperOfNomPoint(dataOpenDocument?.event_doc_gas_shipper?.[0]?.nom_point, 1)
            const find_shipper_from_nom_point_chud_tee_1 = getShipperOfNomPointForOnload(dataOpenDocument?.event_doc_gas_shipper?.[0]?.nom_point, 1)
            const filteredShippers1 = find_shipper_from_nom_point_chud_tee_1?.filter((item: any) => groupIds1?.includes(item.id));
            const defaultIds1 = filteredShippers1?.map((s: any) => s.id); // เอา id 
            setDefaultShippersRender1(filteredShippers1); // ลบไม่ได้
            setDefaultShippersId1(defaultIds1) // ลบไม่ได้


            setIdChudTee1(dataOpenDocument?.event_doc_gas_shipper?.[0]?.id)
            setValue('doc_6_perm_lod_1', dataOpenDocument?.event_doc_gas_shipper?.[0].ir)
            setValue('doc_6_nom_point_1', dataOpenDocument?.event_doc_gas_shipper?.[0].nom_point)
            setValue('doc_6_nom_value_1', dataOpenDocument?.event_doc_gas_shipper?.[0].nom_value_mmscfh)
            setValue('doc_6_gas_command_1', dataOpenDocument?.event_doc_gas_shipper?.[0].gas_command)
            setValue('doc_6_gas_more_1', dataOpenDocument?.event_doc_gas_shipper?.[0].gas_more)

            setFileNameEditText1(dataOpenDocument?.event_doc_gas_shipper?.[0].event_doc_gas_shipper_file?.length > 0 ? cutUploadFileName(dataOpenDocument?.event_doc_gas_shipper?.[0].event_doc_gas_shipper_file?.[0]?.url) : '')
            setFileNameEditUrl1(dataOpenDocument?.event_doc_gas_shipper?.[0].event_doc_gas_shipper_file?.length > 0 ? dataOpenDocument?.event_doc_gas_shipper?.[0].event_doc_gas_shipper_file?.[0]?.url : '')
        }

        // ชุดที่ 2
        if (groupIds2) {
            // ชุด 2 มีของ
            getShipperOfNomPoint(dataOpenDocument?.event_doc_gas_shipper?.[1].nom_point, 2)
            const find_shipper_from_nom_point_chud_tee_2 = getShipperOfNomPointForOnload(dataOpenDocument?.event_doc_gas_shipper?.[1].nom_point, 2)
            const filteredShippers2 = find_shipper_from_nom_point_chud_tee_2?.filter((item: any) => groupIds2?.includes(item.id));
            const defaultIds2 = filteredShippers2?.map((s: any) => s.id); // เอา id 
            setDefaultShippersRender2(filteredShippers2); // ลบไม่ได้
            setDefaultShippersId2(defaultIds2) // ลบไม่ได้

            setIdChudTee2(dataOpenDocument?.event_doc_gas_shipper?.[1]?.id)
            setValue('doc_6_perm_lod_2', dataOpenDocument?.event_doc_gas_shipper?.[1].ir)
            setValue('doc_6_nom_point_2', dataOpenDocument?.event_doc_gas_shipper?.[1].nom_point)
            setValue('doc_6_nom_value_2', dataOpenDocument?.event_doc_gas_shipper?.[1].nom_value_mmscfh)
            setValue('doc_6_gas_command_2', dataOpenDocument?.event_doc_gas_shipper?.[1].gas_command)
            setValue('doc_6_gas_more_2', dataOpenDocument?.event_doc_gas_shipper?.[1].gas_more)

            setFileNameEditText2(dataOpenDocument?.event_doc_gas_shipper?.[1].event_doc_gas_shipper_file?.length > 0 ? cutUploadFileName(dataOpenDocument?.event_doc_gas_shipper?.[1].event_doc_gas_shipper_file?.[0]?.url) : '')
            setFileNameEditUrl2(dataOpenDocument?.event_doc_gas_shipper?.[1].event_doc_gas_shipper_file?.length > 0 ? dataOpenDocument?.event_doc_gas_shipper?.[1].event_doc_gas_shipper_file?.[0]?.url : '')

        }

        // ชุดที่ 3
        if (groupIds3) {
            // ชุด 3 มีของ
            getShipperOfNomPoint(dataOpenDocument?.event_doc_gas_shipper?.[2].nom_point, 3)
            const find_shipper_from_nom_point_chud_tee_3 = getShipperOfNomPointForOnload(dataOpenDocument?.event_doc_gas_shipper?.[2].nom_point, 3)
            const filteredShippers3 = find_shipper_from_nom_point_chud_tee_3?.filter((item: any) => groupIds3?.includes(item.id));
            const defaultIds3 = filteredShippers3?.map((s: any) => s.id); // เอา id 
            setDefaultShippersRender3(filteredShippers3); // ลบไม่ได้
            setDefaultShippersId3(defaultIds3) // ลบไม่ได้

            setIdChudTee3(dataOpenDocument?.event_doc_gas_shipper?.[2]?.id)
            setValue('doc_6_perm_lod_3', dataOpenDocument?.event_doc_gas_shipper?.[2].ir)
            setValue('doc_6_nom_point_3', dataOpenDocument?.event_doc_gas_shipper?.[2].nom_point)
            setValue('doc_6_nom_value_3', dataOpenDocument?.event_doc_gas_shipper?.[2].nom_value_mmscfh)
            setValue('doc_6_gas_command_3', dataOpenDocument?.event_doc_gas_shipper?.[2].gas_command)
            setValue('doc_6_gas_more_3', dataOpenDocument?.event_doc_gas_shipper?.[2].gas_more)

            setFileNameEditText3(dataOpenDocument?.event_doc_gas_shipper?.[2].event_doc_gas_shipper_file?.length > 0 ? cutUploadFileName(dataOpenDocument?.event_doc_gas_shipper?.[2].event_doc_gas_shipper_file?.[0]?.url) : '')
            setFileNameEditUrl3(dataOpenDocument?.event_doc_gas_shipper?.[2].event_doc_gas_shipper_file?.length > 0 ? dataOpenDocument?.event_doc_gas_shipper?.[2].event_doc_gas_shipper_file?.[0]?.url : '')
        }

        // ชุดที่ 4
        if (groupIds4) {
            // ชุด 4 มีของ
            getShipperOfNomPoint(dataOpenDocument?.event_doc_gas_shipper?.[3].nom_point, 4)
            const find_shipper_from_nom_point_chud_tee_4 = getShipperOfNomPointForOnload(dataOpenDocument?.event_doc_gas_shipper?.[3].nom_point, 4)
            const filteredShippers4 = find_shipper_from_nom_point_chud_tee_4?.filter((item: any) => groupIds4?.includes(item.id));
            const defaultIds4 = filteredShippers4?.map((s: any) => s.id); // เอา id 
            setDefaultShippersRender4(filteredShippers4); // ลบไม่ได้
            setDefaultShippersId4(defaultIds4) // ลบไม่ได้

            setIdChudTee4(dataOpenDocument?.event_doc_gas_shipper?.[3]?.id)
            setValue('doc_6_perm_lod_4', dataOpenDocument?.event_doc_gas_shipper?.[3].ir)
            setValue('doc_6_nom_point_4', dataOpenDocument?.event_doc_gas_shipper?.[3].nom_point)
            setValue('doc_6_nom_value_4', dataOpenDocument?.event_doc_gas_shipper?.[3].nom_value_mmscfh)
            setValue('doc_6_gas_command_4', dataOpenDocument?.event_doc_gas_shipper?.[3].gas_command)
            setValue('doc_6_gas_more_4', dataOpenDocument?.event_doc_gas_shipper?.[3].gas_more)

            setFileNameEditText4(dataOpenDocument?.event_doc_gas_shipper?.[3].event_doc_gas_shipper_file?.length > 0 ? cutUploadFileName(dataOpenDocument?.event_doc_gas_shipper?.[3].event_doc_gas_shipper_file?.[0]?.url) : '')
            setFileNameEditUrl4(dataOpenDocument?.event_doc_gas_shipper?.[3].event_doc_gas_shipper_file?.length > 0 ? dataOpenDocument?.event_doc_gas_shipper?.[3].event_doc_gas_shipper_file?.[0]?.url : '')
        }

        // ชุดที่ 5
        if (groupIds5) {
            // ชุด 5 มีของ
            getShipperOfNomPoint(dataOpenDocument?.event_doc_gas_shipper?.[4].nom_point, 5)
            const find_shipper_from_nom_point_chud_tee_5 = getShipperOfNomPointForOnload(dataOpenDocument?.event_doc_gas_shipper?.[4].nom_point, 5)
            const filteredShippers5 = find_shipper_from_nom_point_chud_tee_5?.filter((item: any) => groupIds5?.includes(item.id));
            const defaultIds5 = filteredShippers5?.map((s: any) => s.id); // เอา id 
            setDefaultShippersRender5(filteredShippers5); // ลบไม่ได้
            setDefaultShippersId5(defaultIds5) // ลบไม่ได้

            setIdChudTee5(dataOpenDocument?.event_doc_gas_shipper?.[4]?.id)
            setValue('doc_6_perm_lod_5', dataOpenDocument?.event_doc_gas_shipper?.[4].ir)
            setValue('doc_6_nom_point_5', dataOpenDocument?.event_doc_gas_shipper?.[4].nom_point)
            setValue('doc_6_nom_value_5', dataOpenDocument?.event_doc_gas_shipper?.[4].nom_value_mmscfh)
            setValue('doc_6_gas_command_5', dataOpenDocument?.event_doc_gas_shipper?.[4].gas_command)
            setValue('doc_6_gas_more_5', dataOpenDocument?.event_doc_gas_shipper?.[4].gas_more)

            setFileNameEditText5(dataOpenDocument?.event_doc_gas_shipper?.[4].event_doc_gas_shipper_file?.length > 0 ? cutUploadFileName(dataOpenDocument?.event_doc_gas_shipper?.[4].event_doc_gas_shipper_file?.[0]?.url) : '')
            setFileNameEditUrl5(dataOpenDocument?.event_doc_gas_shipper?.[4].event_doc_gas_shipper_file?.length > 0 ? dataOpenDocument?.event_doc_gas_shipper?.[4].event_doc_gas_shipper_file?.[0]?.url : '')
        }
    }

    // #region SET RESET for Shipper
    const setDataChudTeeForShipper = () => {
        // set ชื่อ shipper กลับที่เดิม
        const groupIds1 = dataOpenDocument?.event_doc_gas_shipper_match?.[0]?.event_document_emer?.group_id;
        const groupIds2 = dataOpenDocument?.event_doc_gas_shipper_match?.[1]?.event_document_emer?.group_id;
        const groupIds3 = dataOpenDocument?.event_doc_gas_shipper_match?.[2]?.event_document_emer?.group_id;
        const groupIds4 = dataOpenDocument?.event_doc_gas_shipper_match?.[3]?.event_document_emer?.group_id;
        const groupIds5 = dataOpenDocument?.event_doc_gas_shipper_match?.[4]?.event_document_emer?.group_id;

        // ชุดที่ 1
        if (groupIds1) {
            // ชุด 1 มีของ shipper
            const find_shipper_from_nom_point_chud_tee_1 = getShipperOfNomPointForOnload(dataOpenDocument?.event_doc_gas_shipper_match?.[0]?.event_doc_gas_shipper?.nom_point, 1)
            const filteredShippers1 = find_shipper_from_nom_point_chud_tee_1?.filter((item: any) => groupIds1 == item.id);
            const defaultIds1 = filteredShippers1?.map((s: any) => s.id); // เอา id 
            setDefaultShippersRender1(filteredShippers1); // ลบไม่ได้
            setDefaultShippersId1(defaultIds1) // ลบไม่ได้

            setIdChudTee1(dataOpenDocument?.event_doc_gas_shipper_match?.[0]?.event_doc_gas_shipper?.id)
            setValue('doc_6_perm_lod_1', dataOpenDocument?.event_doc_gas_shipper_match?.[0]?.event_doc_gas_shipper?.ir)
            setValue('doc_6_nom_point_1', dataOpenDocument?.event_doc_gas_shipper_match?.[0]?.event_doc_gas_shipper?.nom_point)
            setValue('doc_6_nom_value_1', dataOpenDocument?.event_doc_gas_shipper_match?.[0]?.event_doc_gas_shipper?.nom_value_mmscfh)
            setValue('doc_6_gas_command_1', dataOpenDocument?.event_doc_gas_shipper_match?.[0]?.event_doc_gas_shipper?.gas_command)
            setValue('doc_6_gas_more_1', dataOpenDocument?.event_doc_gas_shipper_match?.[0]?.event_doc_gas_shipper?.gas_more)

            setFileNameEditText1(dataOpenDocument?.event_doc_gas_shipper_match?.[0]?.event_doc_gas_shipper?.event_doc_gas_shipper_file?.length > 0 ? cutUploadFileName(dataOpenDocument?.event_doc_gas_shipper_match?.[0]?.event_doc_gas_shipper?.event_doc_gas_shipper_file?.[0]?.url) : '')
            setFileNameEditUrl1(dataOpenDocument?.event_doc_gas_shipper_match?.[0]?.event_doc_gas_shipper?.event_doc_gas_shipper_file?.length > 0 ? dataOpenDocument?.event_doc_gas_shipper_match?.[0]?.event_doc_gas_shipper?.event_doc_gas_shipper_file?.[0]?.url : '')
        }

        // ชุดที่ 2
        if (groupIds2) {
            // ชุด 2 มีของ shipper
            const find_shipper_from_nom_point_chud_tee_2 = getShipperOfNomPointForOnload(dataOpenDocument?.event_doc_gas_shipper_match?.[1]?.event_doc_gas_shipper?.nom_point, 2)
            const filteredShippers2 = find_shipper_from_nom_point_chud_tee_2?.filter((item: any) => groupIds2 == item.id);
            const defaultIds2 = filteredShippers2?.map((s: any) => s.id); // เอา id 
            setDefaultShippersRender2(filteredShippers2); // ลบไม่ได้
            setDefaultShippersId2(defaultIds2) // ลบไม่ได้

            setIdChudTee2(dataOpenDocument?.event_doc_gas_shipper_match?.[1]?.event_doc_gas_shipper?.id)
            setValue('doc_6_perm_lod_2', dataOpenDocument?.event_doc_gas_shipper_match?.[1]?.event_doc_gas_shipper?.ir)
            setValue('doc_6_nom_point_2', dataOpenDocument?.event_doc_gas_shipper_match?.[1]?.event_doc_gas_shipper?.nom_point)
            setValue('doc_6_nom_value_2', dataOpenDocument?.event_doc_gas_shipper_match?.[1]?.event_doc_gas_shipper?.nom_value_mmscfh)
            setValue('doc_6_gas_command_2', dataOpenDocument?.event_doc_gas_shipper_match?.[1]?.event_doc_gas_shipper?.gas_command)
            setValue('doc_6_gas_more_2', dataOpenDocument?.event_doc_gas_shipper_match?.[1]?.event_doc_gas_shipper?.gas_more)

            setFileNameEditText2(dataOpenDocument?.event_doc_gas_shipper_match?.[1]?.event_doc_gas_shipper?.event_doc_gas_shipper_file?.length > 0 ? cutUploadFileName(dataOpenDocument?.event_doc_gas_shipper_match?.[1]?.event_doc_gas_shipper?.event_doc_gas_shipper_file?.[0]?.url) : '')
            setFileNameEditUrl2(dataOpenDocument?.event_doc_gas_shipper_match?.[1]?.event_doc_gas_shipper?.event_doc_gas_shipper_file?.length > 0 ? dataOpenDocument?.event_doc_gas_shipper_match?.[1]?.event_doc_gas_shipper?.event_doc_gas_shipper_file?.[0]?.url : '')

        }

        // ชุดที่ 3
        if (groupIds3) {
            // ชุด 3 มีของ shipper
            const find_shipper_from_nom_point_chud_tee_3 = getShipperOfNomPointForOnload(dataOpenDocument?.event_doc_gas_shipper_match?.[2]?.event_doc_gas_shipper?.nom_point, 3)
            const filteredShippers3 = find_shipper_from_nom_point_chud_tee_3?.filter((item: any) => groupIds3 == item.id);
            const defaultIds3 = filteredShippers3?.map((s: any) => s.id); // เอา id 
            setDefaultShippersRender3(filteredShippers3); // ลบไม่ได้
            setDefaultShippersId3(defaultIds3) // ลบไม่ได้

            setIdChudTee3(dataOpenDocument?.event_doc_gas_shipper_match?.[2]?.event_doc_gas_shipper?.id)
            setValue('doc_6_perm_lod_3', dataOpenDocument?.event_doc_gas_shipper_match?.[2]?.event_doc_gas_shipper?.ir)
            setValue('doc_6_nom_point_3', dataOpenDocument?.event_doc_gas_shipper_match?.[2]?.event_doc_gas_shipper?.nom_point)
            setValue('doc_6_nom_value_3', dataOpenDocument?.event_doc_gas_shipper_match?.[2]?.event_doc_gas_shipper?.nom_value_mmscfh)
            setValue('doc_6_gas_command_3', dataOpenDocument?.event_doc_gas_shipper_match?.[2]?.event_doc_gas_shipper?.gas_command)
            setValue('doc_6_gas_more_3', dataOpenDocument?.event_doc_gas_shipper_match?.[2]?.event_doc_gas_shipper?.gas_more)

            setFileNameEditText3(dataOpenDocument?.event_doc_gas_shipper_match?.[2]?.event_doc_gas_shipper?.event_doc_gas_shipper_file?.length > 0 ? cutUploadFileName(dataOpenDocument?.event_doc_gas_shipper_match?.[2]?.event_doc_gas_shipper?.event_doc_gas_shipper_file?.[0]?.url) : '')
            setFileNameEditUrl3(dataOpenDocument?.event_doc_gas_shipper_match?.[2]?.event_doc_gas_shipper?.event_doc_gas_shipper_file?.length > 0 ? dataOpenDocument?.event_doc_gas_shipper_match?.[2]?.event_doc_gas_shipper?.event_doc_gas_shipper_file?.[0]?.url : '')
        }

        // ชุดที่ 4
        if (groupIds4) {
            // ชุด 4 มีของ shipper
            const find_shipper_from_nom_point_chud_tee_4 = getShipperOfNomPointForOnload(dataOpenDocument?.event_doc_gas_shipper_match?.[3]?.event_doc_gas_shipper?.nom_point, 4)
            const filteredShippers4 = find_shipper_from_nom_point_chud_tee_4?.filter((item: any) => groupIds4 == item.id);
            const defaultIds4 = filteredShippers4?.map((s: any) => s.id); // เอา id 
            setDefaultShippersRender4(filteredShippers4); // ลบไม่ได้
            setDefaultShippersId4(defaultIds4) // ลบไม่ได้

            setIdChudTee4(dataOpenDocument?.event_doc_gas_shipper_match?.[3]?.event_doc_gas_shipper?.id)
            setValue('doc_6_perm_lod_4', dataOpenDocument?.event_doc_gas_shipper_match?.[3]?.event_doc_gas_shipper?.ir)
            setValue('doc_6_nom_point_4', dataOpenDocument?.event_doc_gas_shipper_match?.[3]?.event_doc_gas_shipper?.nom_point)
            setValue('doc_6_nom_value_4', dataOpenDocument?.event_doc_gas_shipper_match?.[3]?.event_doc_gas_shipper?.nom_value_mmscfh)
            setValue('doc_6_gas_command_4', dataOpenDocument?.event_doc_gas_shipper_match?.[3]?.event_doc_gas_shipper?.gas_command)
            setValue('doc_6_gas_more_4', dataOpenDocument?.event_doc_gas_shipper_match?.[3]?.event_doc_gas_shipper?.gas_more)

            setFileNameEditText4(dataOpenDocument?.event_doc_gas_shipper_match?.[3]?.event_doc_gas_shipper?.event_doc_gas_shipper_file?.length > 0 ? cutUploadFileName(dataOpenDocument?.event_doc_gas_shipper_match?.[3]?.event_doc_gas_shipper?.event_doc_gas_shipper_file?.[0]?.url) : '')
            setFileNameEditUrl4(dataOpenDocument?.event_doc_gas_shipper_match?.[3]?.event_doc_gas_shipper?.event_doc_gas_shipper_file?.length > 0 ? dataOpenDocument?.event_doc_gas_shipper_match?.[3]?.event_doc_gas_shipper?.event_doc_gas_shipper_file?.[0]?.url : '')
        }

        // ชุดที่ 5
        if (groupIds5) {
            // ชุด 5 มีของ shipper
            const find_shipper_from_nom_point_chud_tee_5 = getShipperOfNomPointForOnload(dataOpenDocument?.event_doc_gas_shipper_match?.[4]?.event_doc_gas_shipper?.nom_point, 5)
            const filteredShippers5 = find_shipper_from_nom_point_chud_tee_5?.filter((item: any) => groupIds5 == item.id);
            const defaultIds5 = filteredShippers5?.map((s: any) => s.id); // เอา id 
            setDefaultShippersRender5(filteredShippers5); // ลบไม่ได้
            setDefaultShippersId5(defaultIds5) // ลบไม่ได้

            setIdChudTee5(dataOpenDocument?.event_doc_gas_shipper_match?.[4]?.event_doc_gas_shipper?.id)
            setValue('doc_6_perm_lod_5', dataOpenDocument?.event_doc_gas_shipper_match?.[4]?.event_doc_gas_shipper?.ir)
            setValue('doc_6_nom_point_5', dataOpenDocument?.event_doc_gas_shipper_match?.[4]?.event_doc_gas_shipper?.nom_point)
            setValue('doc_6_nom_value_5', dataOpenDocument?.event_doc_gas_shipper_match?.[4]?.event_doc_gas_shipper?.nom_value_mmscfh)
            setValue('doc_6_gas_command_5', dataOpenDocument?.event_doc_gas_shipper_match?.[4]?.event_doc_gas_shipper?.gas_command)
            setValue('doc_6_gas_more_5', dataOpenDocument?.event_doc_gas_shipper_match?.[4]?.event_doc_gas_shipper?.gas_more)

            setFileNameEditText5(dataOpenDocument?.event_doc_gas_shipper_match?.[4]?.event_doc_gas_shipper?.event_doc_gas_shipper_file?.length > 0 ? cutUploadFileName(dataOpenDocument?.event_doc_gas_shipper_match?.[4]?.event_doc_gas_shipper?.event_doc_gas_shipper_file?.[0]?.url) : '')
            setFileNameEditUrl5(dataOpenDocument?.event_doc_gas_shipper_match?.[4]?.event_doc_gas_shipper?.event_doc_gas_shipper_file?.length > 0 ? dataOpenDocument?.event_doc_gas_shipper_match?.[4]?.event_doc_gas_shipper?.event_doc_gas_shipper_file?.[0]?.url : '')
        }
    }


    // #region set data on load
    useEffect(() => {
        let text_header: any = 'สร้างเอกสารแจ้งปรับปริมาณก๊าซ (Doc6)'
        switch (modeOpenDocument) {
            case 'view':
                text_header = 'ดูเอกสารแจ้งปรับปริมาณก๊าซ (Doc6)'
                break;
            case 'edit':
                text_header = 'แก้ไขเอกสารแจ้งปรับปริมาณก๊าซ (Doc6)'
                break;
        }

        setHeaderFormText(text_header)
        // setDocumentId(dataOpenDocument?.document1?.id)
        setDocumentId(dataOpenDocument?.id)

        if (modeOpenDocument == 'edit' || modeOpenDocument == 'view') {
            setValue('ref_document', dataOpenDocument?.event_runnumber_emer_id)
            setValue('event_date', dataOpenDocument?.event_date)
            setValue('longdo_dict', dataOpenDocument?.longdo_dict)
            // สำหรับ TSO
            // event_doc_gas_shipper array ข้างนอกคือชุดที่ 1, 2, 3, 4, 5 ตาม array
            // event_doc_gas_shipper.event_doc_gas_shipper_match คือรายชื่อ shipper ใน select box shipper

            // เก็บไว้ดู
            // const xxxxx = dataOpenDocument?.event_runnumber_emer?.event_document_emer?.map((item: any) => item.group_id);

            if (dataNomPointForDoc6) {

                if (userDT?.account_manage?.[0]?.user_type_id !== 3) {
                    // #region SET DATA ชุดต่าง ๆ สำหรับ TSO
                    setDataChudTee();
                } else {
                    // SET DATA ชุดต่าง ๆ สำหรับ Shipper
                    setDataChudTeeForShipper();
                }
            }


            // set email group กลับที่เดิม
            const emailGroupForEventIds = dataOpenDocument?.event_document_emer_email_group_for_event?.map((item: any) => item.edit_email_group_for_event_id);
            const filter_email_group_for_event = emailGroupForEventData?.filter((item: any) => emailGroupForEventIds?.includes(item?.id))
            const defaultEmailGroupIds = filter_email_group_for_event?.map((s: any) => s.id); // เอา id 
            setDefaultEmailGroupRender(filter_email_group_for_event) // ลบไม่ได้
            setDefaultEmailGrouId(defaultEmailGroupIds) // ลบไม่ได้

            // set CC email กลับที่เดิม
            const ccEmail = dataOpenDocument?.event_document_emer_cc_email?.map((item: any) => item.email);
            setDefaultCcEmailRender(ccEmail)  // ลบไม่ได้

            // #region ข้อมูลใน TABLE ล่าง
            // ข้อมูลในตารางข้างล่าง
            setDataTable(dataOpenDocument?.event_runnumber_emer?.event_document_emer)

            // SET ข้อมูลลงฟอร์มนะ
            setValue('doc_6_input_ref_doc_at', dataOpenDocument?.doc_6_input_ref_doc_at) // อ้างอิงเอกสารเลขที่
            setValue('doc_6_input_when_date', dataOpenDocument?.doc_6_input_when_date) // ช่วงเวลาของเหตุการณ์ วันที่
            setValue('doc_6_input_when_time', dataOpenDocument?.doc_6_input_when_time ? convertTimeStringToDate(dataOpenDocument?.doc_6_input_when_time) : null) // ช่วงเวลาของเหตุการณ์ เวลา
            setValue('doc_6_input_note', dataOpenDocument?.doc_6_input_note)  // หมายเหตุ

        }


        // New : หมายเหตุ ให้มีการ Default ข้อความตามเอกสาร และเมื่อมีการแก้ไข ให้ยึดตัวล่าสุดเป็นตัว Default ในการ New ครั้งต่อไป https://app.clickup.com/t/86eum0nuj
        if (modeOpenDocument == 'create') {
            setValue('doc_6_input_note', maiHedDocHokLasted)  // หมายเหตุ
        }


    }, [mode, dataOpenDocument, dataNomPointForDoc6, shipperData, emailGroupForEventData])


    // #region handle Confirm Save
    {/* Confirm Save */ }
    const handleSaveConfirm = async (data?: any) => {
        if (mode == 'create') {

            {/* 
                key ในแต่ละชุด

                // ชุด 1 
                doc_6_perm_lod_1 : เพิ่ม = 1, ลด = 2
                doc_6_nom_point_1  : ปริมาณก๊าซที่
                doc_6_nom_value_1 : คิดเป็นปริมาณ (MMSCFH)
                shipper_id_1 : shipper
                doc_6_gas_command_1 : การสั่งการ
                doc_6_gas_more_1 : ข้อมูลเพิ่มเติม

            */}

            const payload_tso_create = {
                "ref_document": watch('ref_document'), // id runnumber
                "longdo_dict": data?.longdo_dict, //สำเนา
                "event_date": dayjs(watch('event_date')).format("YYYY-MM-DD"), // วันที่ออกเอกสาร

                "doc_6_input_ref_doc_at": data?.doc_6_input_ref_doc_at,                                                                     //อ้างอิงเอกสารเลขที่
                "doc_6_input_when_date": watch('doc_6_input_when_date') ? dayjs(watch('doc_6_input_when_date')).format("YYYY-MM-DD") : '',  //ช่วงเวลาของเหตุการณ์ วันที่
                "doc_6_input_when_time": data?.doc_6_input_when_time ? dayjs(data?.doc_6_input_when_time).format('HH:mm') : '',             //ช่วงเวลาของเหตุการณ์ เวลา 
                "doc_6_input_note": data?.doc_6_input_note,                                                                                 //หมายเหตุ 

                // gas_shipper อันนี้มันจะมีเต็มที่ 5 ตัว
                // "gas_shipper": [
                //     { // row 1 // ถ้าไม่มี shipper ห้ามส่ง row นี้มา
                //         "id": null, // ต้องใส่ ตอนเพิ่มครั้งแรกยังไม่มีจะเป็น null
                //         "ir": 1, // 1 เพิ่ม, 2 ลด
                //         "nom_point": 206, // (BPK1 มี shipper 62, 67) ปริมาณก๊าซ (id nom point)
                //         "nom_value_mmscfh": "200.000000", //คิดเป็นปริมาณ (MMSCFH) default มาจาก maximum_capacity nompoint
                //         "gas_command": "ดำเนินการตรวจสอบจุดที่ 1", // สั่งการ
                //         "gas_more": "เร่งดำเนินการตามจุด", // ข้อมูลเพิ่มเติม
                //         "shipper": [
                //             62
                //         ], // ต้องมี shipper
                //         "file": fileUrl1 !== '' ? [fileUrl1] : [],
                //     },
                // ],

                // gas_shipper อันนี้มันจะมีเต็มที่ 5 ตัว
                "gas_shipper": [
                    ...(watch('doc_6_perm_lod_1') && watch('shipper_id_1') ? [{
                        "id": null,
                        "ir": watch('doc_6_perm_lod_1') ? parseInt(watch('doc_6_perm_lod_1')) : null,
                        "nom_point": watch('doc_6_nom_point_1'),
                        "nom_value_mmscfh": watch('doc_6_nom_value_1') ? formatNumberSixDecimalNoComma(watch('doc_6_nom_value_1')) : '',
                        "gas_command": watch('doc_6_gas_command_1'),
                        "gas_more": watch('doc_6_gas_more_1'),
                        "shipper": Array.from(new Set([
                            ...selectedShippers1,
                            ...defaultShippersId1,
                        ])),
                        "file": fileUrl1 !== '' ? [fileUrl1] : [],
                    }] : []),
                    ...(watch('doc_6_perm_lod_2') && watch('shipper_id_2') ? [{
                        "id": null,
                        "ir": watch('doc_6_perm_lod_2') ? parseInt(watch('doc_6_perm_lod_2')) : null,
                        "nom_point": watch('doc_6_nom_point_2'),
                        "nom_value_mmscfh": watch('doc_6_nom_value_2') ? formatNumberSixDecimalNoComma(watch('doc_6_nom_value_2')) : '',
                        "gas_command": watch('doc_6_gas_command_2'),
                        "gas_more": watch('doc_6_gas_more_2'),
                        "shipper": Array.from(new Set([
                            ...selectedShippers2,
                            ...defaultShippersId2,
                        ])),
                        "file": fileUrl2 !== '' ? [fileUrl2] : [],
                    }] : []),
                    ...(watch('doc_6_perm_lod_3') && watch('shipper_id_3') ? [{
                        "id": null,
                        "ir": watch('doc_6_perm_lod_3') ? parseInt(watch('doc_6_perm_lod_3')) : null,
                        "nom_point": watch('doc_6_nom_point_3'),
                        "nom_value_mmscfh": watch('doc_6_nom_value_3') ? formatNumberSixDecimalNoComma(watch('doc_6_nom_value_3')) : '',
                        "gas_command": watch('doc_6_gas_command_3'),
                        "gas_more": watch('doc_6_gas_more_3'),
                        "shipper": Array.from(new Set([
                            ...selectedShippers3,
                            ...defaultShippersId3,
                        ])),
                        "file": fileUrl3 !== '' ? [fileUrl3] : [],
                    }] : []),
                    ...(watch('doc_6_perm_lod_4') && watch('shipper_id_4') ? [{
                        "id": null,
                        "ir": watch('doc_6_perm_lod_4') ? parseInt(watch('doc_6_perm_lod_4')) : null,
                        "nom_point": watch('doc_6_nom_point_4'),
                        "nom_value_mmscfh": watch('doc_6_nom_value_4') ? formatNumberSixDecimalNoComma(watch('doc_6_nom_value_4')) : '',
                        "gas_command": watch('doc_6_gas_command_4'),
                        "gas_more": watch('doc_6_gas_more_4'),
                        "shipper": Array.from(new Set([
                            ...selectedShippers4,
                            ...defaultShippersId4,
                        ])),
                        "file": fileUrl4 !== '' ? [fileUrl4] : [],
                    }] : []),
                    ...(watch('doc_6_perm_lod_5') && watch('shipper_id_5') ? [{
                        "id": null,
                        "ir": watch('doc_6_perm_lod_5') ? parseInt(watch('doc_6_perm_lod_5')) : null,
                        "nom_point": watch('doc_6_nom_point_5'),
                        "nom_value_mmscfh": watch('doc_6_nom_value_5') ? formatNumberSixDecimalNoComma(watch('doc_6_nom_value_5')) : '',
                        "gas_command": watch('doc_6_gas_command_5'),
                        "gas_more": watch('doc_6_gas_more_5'),
                        "shipper": Array.from(new Set([
                            ...selectedShippers5,
                            ...defaultShippersId5,
                        ])),
                        "file": fileUrl5 !== '' ? [fileUrl5] : [],
                    }] : []),
                ],
                "email_event_for_shipper": selectedEmailGroup,
                "cc_email": emailGroup
            }

            setDataSubmit(payload_tso_create)
            setModaConfirmSave(true)

        } else {
            let data_post_na: any = {}
            if (userDT?.account_manage?.[0]?.user_type_id !== 3) {
                // mode edit tso
                // data_post_na = {
                //     "document_id": documentId, // เอาไว้ใช้เส้น POST event/emer/doc5/edit/${id}
                //     "file": fileUrl !== '' ? [fileUrl] : [fileNameEditTextUrl], // ส่งมาแค่ 1 ถ้า หน้าบ้านอัพโหลด ส่าง url ใหม่ ถ้าไม่อัพส่ง url เก่ามา
                //     "shipper": Array.from(new Set([
                //         ...selectedShippers,
                //         ...defaultShippersId,
                //     ])),
                //     "email_event_for_shipper": Array.from(new Set([
                //         ...selectedEmailGroup,
                //         ...defaultEmailGrouId,
                //     ])),
                //     "cc_email": Array.from(new Set([
                //         ...emailGroup,
                //         ...defaultCcEmailRender,
                //     ]))
                // }
                data_post_na = {
                    "document_id": documentId, // เอาไว้ใช้เส้น POST event/emer/doc5/edit/${id}
                    "event_date": dayjs(watch('event_date')).format("YYYY-MM-DD"), // วันที่ออกเอกสาร
                    "gas_shipper": [
                        ...(watch('doc_6_perm_lod_1') ? [{
                            "id": idChudTee1,
                            "ir": watch('doc_6_perm_lod_1') ? parseInt(watch('doc_6_perm_lod_1')) : null,
                            "nom_point": watch('doc_6_nom_point_1'),
                            "nom_value_mmscfh": watch('doc_6_nom_value_1') ? formatNumberSixDecimalNoComma(watch('doc_6_nom_value_1')) : '',
                            "gas_command": watch('doc_6_gas_command_1'),
                            "gas_more": watch('doc_6_gas_more_1'),
                            "shipper": Array.from(new Set([
                                ...selectedShippers1,
                                ...defaultShippersId1,
                            ])),
                            "file": fileUrl1 !== '' ? [fileUrl1] : [],
                        }] : []),
                        ...(watch('doc_6_perm_lod_2') ? [{
                            "id": idChudTee2,
                            "ir": watch('doc_6_perm_lod_2') ? parseInt(watch('doc_6_perm_lod_2')) : null,
                            "nom_point": watch('doc_6_nom_point_2'),
                            "nom_value_mmscfh": watch('doc_6_nom_value_2') ? formatNumberSixDecimalNoComma(watch('doc_6_nom_value_2')) : '',
                            "gas_command": watch('doc_6_gas_command_2'),
                            "gas_more": watch('doc_6_gas_more_2'),
                            "shipper": Array.from(new Set([
                                ...selectedShippers2,
                                ...defaultShippersId2,
                            ])),
                            "file": fileUrl2 !== '' ? [fileUrl2] : [],
                        }] : []),
                        ...(watch('doc_6_perm_lod_3') ? [{
                            "id": idChudTee3,
                            "ir": watch('doc_6_perm_lod_3') ? parseInt(watch('doc_6_perm_lod_3')) : null,
                            "nom_point": watch('doc_6_nom_point_3'),
                            "nom_value_mmscfh": watch('doc_6_nom_value_3') ? formatNumberSixDecimalNoComma(watch('doc_6_nom_value_3')) : '',
                            "gas_command": watch('doc_6_gas_command_3'),
                            "gas_more": watch('doc_6_gas_more_3'),
                            "shipper": Array.from(new Set([
                                ...selectedShippers3,
                                ...defaultShippersId3,
                            ])),
                            "file": fileUrl3 !== '' ? [fileUrl3] : [],
                        }] : []),
                        ...(watch('doc_6_perm_lod_4') ? [{
                            "id": idChudTee4,
                            "ir": watch('doc_6_perm_lod_4') ? parseInt(watch('doc_6_perm_lod_4')) : null,
                            "nom_point": watch('doc_6_nom_point_4'),
                            "nom_value_mmscfh": watch('doc_6_nom_value_4') ? formatNumberSixDecimalNoComma(watch('doc_6_nom_value_4')) : '',
                            "gas_command": watch('doc_6_gas_command_4'),
                            "gas_more": watch('doc_6_gas_more_4'),
                            "shipper": Array.from(new Set([
                                ...selectedShippers4,
                                ...defaultShippersId4,
                            ])),
                            "file": fileUrl4 !== '' ? [fileUrl4] : [],
                        }] : []),
                        ...(watch('doc_6_perm_lod_5') ? [{
                            "id": idChudTee5,
                            "ir": watch('doc_6_perm_lod_5') ? parseInt(watch('doc_6_perm_lod_5')) : null,
                            "nom_point": watch('doc_6_nom_point_5'),
                            "nom_value_mmscfh": watch('doc_6_nom_value_5') ? formatNumberSixDecimalNoComma(watch('doc_6_nom_value_5')) : '',
                            "gas_command": watch('doc_6_gas_command_5'),
                            "gas_more": watch('doc_6_gas_more_5'),
                            "shipper": Array.from(new Set([
                                ...selectedShippers5,
                                ...defaultShippersId5,
                            ])),
                            "file": fileUrl5 !== '' ? [fileUrl5] : [],
                        }] : []),
                    ],
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
    const [fileName1, setFileName1] = useState('Maximum File 5 MB');
    const [fileName2, setFileName2] = useState('Maximum File 5 MB');
    const [fileName3, setFileName3] = useState('Maximum File 5 MB');
    const [fileName4, setFileName4] = useState('Maximum File 5 MB');
    const [fileName5, setFileName5] = useState('Maximum File 5 MB');

    const [fileUrl1, setFileUrl1] = useState<any>('');
    const [fileUrl2, setFileUrl2] = useState<any>('');
    const [fileUrl3, setFileUrl3] = useState<any>('');
    const [fileUrl4, setFileUrl4] = useState<any>('');
    const [fileUrl5, setFileUrl5] = useState<any>('');
    const [isUploading, setIsUploading] = useState(false);
    const [isUploading2, setIsUploading2] = useState(false);
    const [isUploading3, setIsUploading3] = useState(false);
    const [isUploading4, setIsUploading4] = useState(false);
    const [isUploading5, setIsUploading5] = useState(false);

    const [IsErrorChudTee, setIsErrorChudTee] = useState<any>('');

    const handleFileChange = async (e: any, chud_tee: number) => {
        setIsLoading(true);
        const file = e.target.files[0];
        const maxSizeInMB = 5;
        const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

        // เก็บ setter functions ตาม chud_tee index
        const fileNameSetters = [setFileName1, setFileName2, setFileName3, setFileName4, setFileName5];
        const fileUrlSetters = [setFileUrl1, setFileUrl2, setFileUrl3, setFileUrl4, setFileUrl5];

        // index array (chud_tee เริ่มจาก 1)
        const index = chud_tee - 1;

        if (!fileNameSetters[index] || !fileUrlSetters[index]) {
            // Invalid chud_tee value: chud_tee
            setIsLoading(false);
            return;
        }

        if (!file) {
            fileNameSetters[index]('No file chosen');
            setIsLoading(false);
            return;
        }

        switch (chud_tee) {
            case 1:
                setIsUploading(true);
                break;
            case 2:
                setIsUploading2(true);
                break;
            case 3:
                setIsUploading3(true);
                break;
            case 4:
                setIsUploading4(true);
                break;
            case 5:
                setIsUploading5(true);
                break;
        }


        if (file.size > maxSizeInBytes) {
            fileNameSetters[index]('The file is larger than 5 MB.');
            setIsLoading(false);
            setIsUploading(false);
            setIsUploading2(false);
            setIsUploading3(false);
            setIsUploading4(false);
            setIsUploading5(false);
            setIsErrorChudTee(chud_tee)
            // File size too large:
            return;
        }

        try {
            const response: any = await uploadFileService('/files/uploadfile/', file);
            fileNameSetters[index](file.name);
            fileUrlSetters[index](response?.file?.url);
        } catch (error) {
            // Upload failed:
            fileNameSetters[index]('Upload failed');
        }

        setTimeout(() => {
            setIsUploading(false);
            setIsLoading(false);
        }, 500);
    };
    // #endregion

    const handleRemoveFile = (chud_tee: any) => {
        setIsErrorChudTee('')
        switch (chud_tee) {
            case 1:
                setFileName1("Maximum File 5 MB");
                setFileUrl1('')
                break;
            case 2:
                setFileName2("Maximum File 5 MB");
                setFileUrl2('')
                break;
            case 3:
                setFileName3("Maximum File 5 MB");
                setFileUrl3('')
                break;
            case 4:
                setFileName4("Maximum File 5 MB");
                setFileUrl4('')
                break;
            case 5:
                setFileName5("Maximum File 5 MB");
                setFileUrl5('')
                break;
        }

        // setFileName("Maximum File 5 MB"); // Reset fileName
        // setFileUrl('')
        setValue('file', null);
    };

    // #region DOWNLOAD FILE
    // ############# DOWNLOAD FILE #############
    const downloadFile = async (chud_tee: any) => {

        let url_ = ''

        switch (chud_tee) {
            case 1:
                url_ = fileNameEditTextUrl1
                break;
            case 2:
                url_ = fileNameEditTextUrl2
                break;
            case 3:
                url_ = fileNameEditTextUrl3
                break;
            case 4:
                url_ = fileNameEditTextUrl4
                break;
            case 5:
                url_ = fileNameEditTextUrl5
                break;
        }

        try {
            const response = await fetch(url_);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const fileName = url_.split('/').pop() || 'image.jpg';

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
    const [selectedShippers1, setSelectedShippers1] = useState<string[]>([]);
    const [selectedShippers2, setSelectedShippers2] = useState<string[]>([]);
    const [selectedShippers3, setSelectedShippers3] = useState<string[]>([]);
    const [selectedShippers4, setSelectedShippers4] = useState<string[]>([]);
    const [selectedShippers5, setSelectedShippers5] = useState<string[]>([]);

    const [selectedShippersRender1, setSelectedShippersRender1] = useState<any[]>([]);
    const [selectedShippersRender2, setSelectedShippersRender2] = useState<any[]>([]);
    const [selectedShippersRender3, setSelectedShippersRender3] = useState<any[]>([]);
    const [selectedShippersRender4, setSelectedShippersRender4] = useState<any[]>([]);
    const [selectedShippersRender5, setSelectedShippersRender5] = useState<any[]>([]);

    const handleSelectChange = (event: any, chod_tee: any) => {
        const value = event.target.value;

        switch (chod_tee) {
            case 1: // ชุดที่ 1
                if (value.includes("all")) {
                    // เอาอันที่มีอยู่แล้วออกจาก option 
                    setSelectedShippers1(selectedShippers1.length === dataShipper1?.length ? [] : dataShipper1?.filter((item: any) => !defaultShippersId1?.includes(item.id)).map((item: any) => item.id));
                    setSelectedShippersRender1(selectedShippers1.length === dataShipper1?.length ? [] : dataShipper1?.filter((item: any) => !defaultShippersId1?.includes(item.id)).map((item: any) => item));
                    setValue("shipper_id_1", selectedShippers1.length === dataShipper1?.length ? [] : dataShipper1?.filter((item: any) => !defaultShippersId1?.includes(item.id)).map((item: any) => item.id));
                } else {
                    setSelectedShippers1(value);
                    setValue("shipper_id_1", value);

                    const filter_shipper = dataShipper1?.filter((item: any) => value.includes(item?.id))
                    setSelectedShippersRender1(filter_shipper)
                }
                clearErrors('shipper_id_1');
                break;
            case 2: // ชุดที่ 2
                if (value.includes("all")) {
                    // เอาอันที่มีอยู่แล้วออกจาก option 
                    setSelectedShippers2(selectedShippers2?.length === dataShipper2?.length ? [] : dataShipper2?.filter((item: any) => !defaultShippersId2?.includes(item.id)).map((item: any) => item.id));
                    setSelectedShippersRender2(selectedShippers2?.length === dataShipper2?.length ? [] : dataShipper2?.filter((item: any) => !defaultShippersId2?.includes(item.id)).map((item: any) => item));
                    setValue("shipper_id_2", selectedShippers2?.length === dataShipper2?.length ? [] : dataShipper2?.filter((item: any) => !defaultShippersId2?.includes(item.id)).map((item: any) => item.id));
                } else {
                    setSelectedShippers2(value);
                    setValue("shipper_id_2", value);

                    const filter_shipper = dataShipper2?.filter((item: any) => value.includes(item?.id))
                    setSelectedShippersRender2(filter_shipper)
                }
                clearErrors('shipper_id_2');
                break;
            case 3: // ชุดที่ 3
                if (value.includes("all")) {
                    // เอาอันที่มีอยู่แล้วออกจาก option 
                    setSelectedShippers3(selectedShippers3.length === dataShipper3.length ? [] : dataShipper3?.filter((item: any) => !defaultShippersId3?.includes(item.id)).map((item: any) => item.id));
                    setSelectedShippersRender3(selectedShippers3.length === dataShipper3.length ? [] : dataShipper3?.filter((item: any) => !defaultShippersId3?.includes(item.id)).map((item: any) => item));
                    setValue("shipper_id_3", selectedShippers3.length === dataShipper3.length ? [] : dataShipper3?.filter((item: any) => !defaultShippersId3?.includes(item.id)).map((item: any) => item.id));
                } else {
                    setSelectedShippers3(value);
                    setValue("shipper_id_3", value);

                    const filter_shipper = dataShipper3?.filter((item: any) => value.includes(item?.id))
                    setSelectedShippersRender3(filter_shipper)
                }
                clearErrors('shipper_id_3');
                break;
            case 4: // ชุดที่ 4
                if (value.includes("all")) {
                    // เอาอันที่มีอยู่แล้วออกจาก option 
                    setSelectedShippers4(selectedShippers4.length === dataShipper4.length ? [] : dataShipper4?.filter((item: any) => !defaultShippersId4?.includes(item.id)).map((item: any) => item.id));
                    setSelectedShippersRender4(selectedShippers4.length === dataShipper4.length ? [] : dataShipper4?.filter((item: any) => !defaultShippersId4?.includes(item.id)).map((item: any) => item));
                    setValue("shipper_id_4", selectedShippers4.length === dataShipper4.length ? [] : dataShipper4?.filter((item: any) => !defaultShippersId4?.includes(item.id)).map((item: any) => item.id));
                } else {
                    setSelectedShippers4(value);
                    setValue("shipper_id_4", value);

                    const filter_shipper = dataShipper4?.filter((item: any) => value.includes(item?.id))
                    setSelectedShippersRender4(filter_shipper)
                }
                clearErrors('shipper_id_4');
                break;
            case 5: // ชุดที่ 5
                if (value.includes("all")) {
                    // เอาอันที่มีอยู่แล้วออกจาก option 
                    setSelectedShippers5(selectedShippers5.length === dataShipper5.length ? [] : dataShipper5?.filter((item: any) => !defaultShippersId5?.includes(item.id)).map((item: any) => item.id));
                    setSelectedShippersRender5(selectedShippers5.length === dataShipper5.length ? [] : dataShipper5?.filter((item: any) => !defaultShippersId5?.includes(item.id)).map((item: any) => item));
                    setValue("shipper_id_5", selectedShippers5.length === dataShipper5.length ? [] : dataShipper5?.filter((item: any) => !defaultShippersId5?.includes(item.id)).map((item: any) => item.id));
                } else {
                    setSelectedShippers5(value);
                    setValue("shipper_id_5", value);

                    const filter_shipper = dataShipper5?.filter((item: any) => value.includes(item?.id))
                    setSelectedShippersRender5(filter_shipper)
                }
                clearErrors('shipper_id_5');
                break;
        }
    };

    const removeShipper = (idToRemove: number, chud_tee: any) => {

        switch (chud_tee) {
            case 1:
                setSelectedShippers1((prevGroup: any) => prevGroup.filter((data: any, index: number) => data !== idToRemove));
                setSelectedShippersRender1((prevGroup: any) => prevGroup.filter((data: any, index: number) => data?.id !== idToRemove));
                break;
            case 2:
                setSelectedShippers2((prevGroup: any) => prevGroup.filter((data: any, index: number) => data !== idToRemove));
                setSelectedShippersRender2((prevGroup: any) => prevGroup.filter((data: any, index: number) => data?.id !== idToRemove));
                break;
            case 3:
                setSelectedShippers3((prevGroup: any) => prevGroup.filter((data: any, index: number) => data !== idToRemove));
                setSelectedShippersRender3((prevGroup: any) => prevGroup.filter((data: any, index: number) => data?.id !== idToRemove));
                break;
            case 4:
                setSelectedShippers4((prevGroup: any) => prevGroup.filter((data: any, index: number) => data !== idToRemove));
                setSelectedShippersRender4((prevGroup: any) => prevGroup.filter((data: any, index: number) => data?.id !== idToRemove));
                break;
            case 5:
                setSelectedShippers5((prevGroup: any) => prevGroup.filter((data: any, index: number) => data !== idToRemove));
                setSelectedShippersRender5((prevGroup: any) => prevGroup.filter((data: any, index: number) => data?.id !== idToRemove));
                break;
        }
    };

    // ############# EMAIL GROUP SELECT #############
    const [selectedEmailGroup, setSelectedEmailGroup] = useState<string[]>([]);
    const [selectedEmailGroupRender, setSelectedEmailGroupRender] = useState<any[]>([]);

    const handleSelectEmailGroup = (event: any) => {
        const value = event.target.value;

        if (value.includes("all")) {
            setSelectedEmailGroup(selectedEmailGroup.length === emailGroupForEventData.length ? [] : emailGroupForEventData.map((item: any) => item.id));
            setSelectedEmailGroupRender(selectedEmailGroup.length === emailGroupForEventData.length ? [] : emailGroupForEventData.map((item: any) => item));
            // setValue("shipper_id", selectedEmailGroup.length === emailGroupForEventData.length ? [] : emailGroupForEventData.map((item: any) => item.id));
        } else {
            setSelectedEmailGroup(value);
            // setValue("shipper_id", value);

            const filter_shipper = emailGroupForEventData?.filter((item: any) => value.includes(item?.id))
            setSelectedEmailGroupRender(filter_shipper)
        }
        // clearErrors('shipper_id');
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

    const horizoneDivide = () => {
        return (<div className="my-2 col-span-2">
            <hr className="border-t border-[#DFE4EA] w-full mx-auto" />
        </div>)
    }

    // #region สำหรับปุ่ม RESET
    const resetPermLod = () => {
        if (mode == 'create') {
            // reset mode create
            // reset(); // อันนี้มัน set undefined เข้าทุก ๆ  register ของ react-hook-form

            // clear เพิ่ม = 1, ลด = 2
            setValue('doc_6_perm_lod_1', null)
            setValue('doc_6_perm_lod_2', null)
            setValue('doc_6_perm_lod_3', null)
            setValue('doc_6_perm_lod_4', null)
            setValue('doc_6_perm_lod_5', null)

            // clear ปริมาณก๊าซที่
            setValue('doc_6_nom_point_1', null)
            setValue('doc_6_nom_point_2', null)
            setValue('doc_6_nom_point_3', null)
            setValue('doc_6_nom_point_4', null)
            setValue('doc_6_nom_point_5', null)

            // clear คิดเป็นปริมาณ (MMSCFH)
            setValue('doc_6_nom_value_1', '') // จะเคลียร์ value ให้ numbericFormat ต้อง set string ไม่ใช่ undefined หรือ null
            setValue('doc_6_nom_value_2', '')
            setValue('doc_6_nom_value_3', '')
            setValue('doc_6_nom_value_4', '')
            setValue('doc_6_nom_value_5', '')

            // clear การสั่งการ
            setValue('doc_6_gas_command_1', null)
            setValue('doc_6_gas_command_2', null)
            setValue('doc_6_gas_command_3', null)
            setValue('doc_6_gas_command_4', null)
            setValue('doc_6_gas_command_5', null)

            // clear ข้อมูลเพิ่มเติม
            setValue('doc_6_gas_more_1', null)
            setValue('doc_6_gas_more_2', null)
            setValue('doc_6_gas_more_3', null)
            setValue('doc_6_gas_more_4', null)
            setValue('doc_6_gas_more_5', null)

            // clear selected shipper
            setSelectedShippers1([]);
            setSelectedShippers2([]);
            setSelectedShippers3([]);
            setSelectedShippers4([]);
            setSelectedShippers5([]);
            setSelectedShippersRender1([]);
            setSelectedShippersRender2([]);
            setSelectedShippersRender3([]);
            setSelectedShippersRender4([]);
            setSelectedShippersRender5([]);

            // clear file
            setFileUrl1('')
            setFileUrl2('')
            setFileUrl3('')
            setFileUrl4('')
            setFileUrl5('')
            setFileName1("Maximum File 5 MB");
            setFileName2("Maximum File 5 MB");
            setFileName3("Maximum File 5 MB");
            setFileName4("Maximum File 5 MB");
            setFileName5("Maximum File 5 MB");

        } else {
            // reset mode อื่น

            {/* 
                key ในแต่ละชุด

                // ชุด 1 
                doc_6_perm_lod_1 : เพิ่ม = 1, ลด = 2
                doc_6_nom_point_1  : ปริมาณก๊าซที่
                doc_6_nom_value_1 : คิดเป็นปริมาณ (MMSCFH)
                shipper_id_1 : shipper
                doc_6_gas_command_1 : การสั่งการ
                doc_6_gas_more_1 : ข้อมูลเพิ่มเติม

            */}

            // clear เพิ่ม = 1, ลด = 2
            setValue('doc_6_perm_lod_1', null)
            setValue('doc_6_perm_lod_2', null)
            setValue('doc_6_perm_lod_3', null)
            setValue('doc_6_perm_lod_4', null)
            setValue('doc_6_perm_lod_5', null)

            // clear ปริมาณก๊าซที่
            setValue('doc_6_nom_point_1', null)
            setValue('doc_6_nom_point_2', null)
            setValue('doc_6_nom_point_3', null)
            setValue('doc_6_nom_point_4', null)
            setValue('doc_6_nom_point_5', null)

            // clear คิดเป็นปริมาณ (MMSCFH)
            setValue('doc_6_nom_value_1', '') // จะเคลียร์ value ให้ numbericFormat ต้อง set string ไม่ใช่ undefined หรือ null
            setValue('doc_6_nom_value_2', '')
            setValue('doc_6_nom_value_3', '')
            setValue('doc_6_nom_value_4', '')
            setValue('doc_6_nom_value_5', '')

            // clear การสั่งการ
            setValue('doc_6_gas_command_1', null)
            setValue('doc_6_gas_command_2', null)
            setValue('doc_6_gas_command_3', null)
            setValue('doc_6_gas_command_4', null)
            setValue('doc_6_gas_command_5', null)

            // clear ข้อมูลเพิ่มเติม
            setValue('doc_6_gas_more_1', null)
            setValue('doc_6_gas_more_2', null)
            setValue('doc_6_gas_more_3', null)
            setValue('doc_6_gas_more_4', null)
            setValue('doc_6_gas_more_5', null)

            // clear selected shipper
            setSelectedShippers1([]);
            setSelectedShippers2([]);
            setSelectedShippers3([]);
            setSelectedShippers4([]);
            setSelectedShippers5([]);
            setSelectedShippersRender1([]);
            setSelectedShippersRender2([]);
            setSelectedShippersRender3([]);
            setSelectedShippersRender4([]);
            setSelectedShippersRender5([]);

            // clear file
            setFileUrl1('')
            setFileUrl2('')
            setFileUrl3('')
            setFileUrl4('')
            setFileUrl5('')
            setFileName1("Maximum File 5 MB");
            setFileName2("Maximum File 5 MB");
            setFileName3("Maximum File 5 MB");
            setFileName4("Maximum File 5 MB");
            setFileName5("Maximum File 5 MB");

            // ตรงนี้ต้อง set ของเดิมเข้า
            if (userDT?.account_manage?.[0]?.user_type_id !== 3) {
                // #region SET DATA ชุดต่าง ๆ สำหรับ TSO
                setDataChudTee();
            } else {
                // SET DATA ชุดต่าง ๆ สำหรับ Shipper
                setDataChudTeeForShipper();
            }
        }
    }

    // #region Shipper Of NomPoint
    const [dataShipper1, setDataShipper1] = useState<any>([])
    const [dataShipper2, setDataShipper2] = useState<any>([])
    const [dataShipper3, setDataShipper3] = useState<any>([])
    const [dataShipper4, setDataShipper4] = useState<any>([])
    const [dataShipper5, setDataShipper5] = useState<any>([])
    const getShipperOfNomPoint = (id?: any, chud_tee?: any) => {
        const filtered_ = dataNomPointForDoc6?.find((item: any) => item.id == id)

        switch (chud_tee) {
            case 1:
                setValue("shipper_id_1", null); // ตอนเปลี่ยน nom ให้เคลียร์ shipper
                setSelectedShippers1([]); // ตอนเปลี่ยน nom ให้เคลียร์ shipper
                setSelectedShippersRender1([]); // ตอนเปลี่ยน nom ให้เคลียร์ shipper
                setDataShipper1(filtered_?.shipper)
                break;
            case 2:
                setValue("shipper_id_2", null); // ตอนเปลี่ยน nom ให้เคลียร์ shipper
                setSelectedShippers2([]); // ตอนเปลี่ยน nom ให้เคลียร์ shipper
                setSelectedShippersRender2([]); // ตอนเปลี่ยน nom ให้เคลียร์ shipper
                setDataShipper2(filtered_?.shipper)
                break;
            case 3:
                setValue("shipper_id_3", null); // ตอนเปลี่ยน nom ให้เคลียร์ shipper
                setSelectedShippers3([]); // ตอนเปลี่ยน nom ให้เคลียร์ shipper
                setSelectedShippersRender3([]); // ตอนเปลี่ยน nom ให้เคลียร์ shipper
                setDataShipper3(filtered_?.shipper)
                break;
            case 4:
                setValue("shipper_id_4", null); // ตอนเปลี่ยน nom ให้เคลียร์ shipper
                setSelectedShippers4([]); // ตอนเปลี่ยน nom ให้เคลียร์ shipper
                setSelectedShippersRender4([]); // ตอนเปลี่ยน nom ให้เคลียร์ shipper
                setDataShipper4(filtered_?.shipper)
                break;
            case 5:
                setValue("shipper_id_5", null); // ตอนเปลี่ยน nom ให้เคลียร์ shipper
                setSelectedShippers5([]); // ตอนเปลี่ยน nom ให้เคลียร์ shipper
                setSelectedShippersRender5([]); // ตอนเปลี่ยน nom ให้เคลียร์ shipper
                setDataShipper5(filtered_?.shipper)
                break;
        }
    }

    const getShipperOfNomPointForOnload = (id?: any, chud_tee?: any) => {
        const filtered_ = dataNomPointForDoc6?.find((item: any) => item.id == id)
        return filtered_?.shipper
    }

    return (<>
        <span className="text-[20px] text-[#58585A] font-semibold">{headerFormText}</span>
        <form
            onSubmit={handleSubmit(handleSaveConfirm)}
            className='bg-white w-full max-w'
        >
            <div className="flex gap-4 pt-4">
                <div className="w-[560px]">
                    <label htmlFor="event_nember" className={labelClass}>
                        <span className="text-red-500">*</span>
                        {`อ้างอิงจากเอกสารแจ้งเหตุการณ์ฉุกเฉิน/เหตุการณ์ความไม่สมดุลอย่างรุนแรง (Doc 3.9)`}
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

                                    const find_doc1_data = refDocData?.find((item: any) => item?.id == e.target.value)
                                    setValue("event_date", find_doc1_data?.event_date); // ใส่วันที่จาก doc39
                                    setValue("event_doc_emer_type_id", find_doc1_data?.event_doc_emer_type_id); // ประเภทจาก doc39
                                    setValue("event_doc_emer_gas_tranmiss_id", find_doc1_data?.event_doc_emer_gas_tranmiss_id); // ระบบส่งก๊าซจาก doc39
                                    setValue("event_doc_emer_gas_tranmiss_other", find_doc1_data?.event_doc_emer_gas_tranmiss_other); // อื่น ๆ ในระบบส่งก๊าซจาก doc39

                                    setValue("longdo_dict", find_doc1_data?.event_document_emer?.[0].longdo_dict); // สำเนาจาก doc39

                                    clearErrors('ref_document')
                                    if (errors?.ref_document) { clearErrors('ref_document') }
                                }}
                                errors={errors?.ref_document}
                                errorsText={'Select Document 1'}
                                options={refDocData}
                                optionsKey={'id'}
                                optionsValue={'id'}
                                optionsText={'event_nember'}
                                optionsResult={'event_nember'}
                                placeholder={'Select Document 3.9'}
                                pathFilter={'event_nember'}
                            />
                            :
                            <div className="w-full h-[44px] p-3 text-[14px] text-[#464255] rounded-[9px] bg-[#EEECEC]"> {dataOpenDocument?.event_runnumber_emer.event_nember}</div>
                    }
                </div>

                {/* วันที่ออกเอกสาร */}
                <div className="pb-2 w-[200px]">
                    <label className={labelClass}>
                        <span className="text-red-500">*</span>
                        {`วันที่ออกเอกสาร`}
                    </label>
                    <DatePickaFormThai
                        {...register('event_date', { required: "เลือกวันที่" })}
                        readOnly={mode == 'edit' || mode == 'view' || isShipper}
                        placeHolder="เลือกวันที่"
                        mode={mode}
                        valueShow={watch("event_date") ? dayjs(watch("event_date")).format("DD/MM/YYYY") : undefined}
                        allowClear
                        isError={errors.event_date && !watch("event_date") ? true : false}
                        onChange={(e: any) => { setValue('event_date', formatFormDate(e)), e == undefined && setValue('event_date', null, { shouldValidate: true, shouldDirty: true }); }}
                    />
                    {errors.event_date && !watch("event_date") && <p className={`${textErrorClass}`}>{'เลือกวันที่'}</p>}
                </div>

                {/* เอกสารเลขที่ */}
                <div className="w-[190px]">
                    <label htmlFor="event_nember" className={labelClass}><span className="text-red-500">*</span>{`อ้างอิงเอกสารเลขที่`}</label>

                    <input
                        id="doc_6_input_ref_doc_at"
                        {...register("doc_6_input_ref_doc_at", { required: "กรอกเอกสาร" })}
                        type="text"
                        placeholder="กรอกเอกสาร"
                        readOnly={isReadOnly}
                        maxLength={25}
                        onChange={(e) => {
                            if (e.target.value.length <= 25) {
                                setValue('doc_6_input_ref_doc_at', e.target.value);
                            }
                        }}
                        className={`text-[14px] border-[1px] border-[#DFE4EA]  bg-white ps-[21px] h-[44px] w-full rounded-lg outline-none bg-opacity-100 focus:border-[#00ADEF] ${isReadOnly && '!bg-[#EFECEC]'}`}
                    />
                </div>

                {/* เมื่อวันที่ */}
                <div className="pb-2 w-[200px]">
                    <label className={labelClass}>
                        <span className="text-red-500">*</span>
                        {`เมื่อวันที่`}
                    </label>
                    <DatePickaFormThai
                        {...register('doc_6_input_when_date', { required: "เลือกวันที่" })}
                        readOnly={mode == 'view' || mode == 'edit'}
                        placeHolder="เลือกวันที่"
                        mode={mode}
                        valueShow={watch("doc_6_input_when_date") ? dayjs(watch("doc_6_input_when_date")).format("DD/MM/YYYY") : undefined}
                        allowClear
                        isError={errors.doc_6_input_when_date && !watch("doc_6_input_when_date") ? true : false}
                        onChange={(e: any) => { setValue('doc_6_input_when_date', formatFormDate(e)), e == undefined && setValue('doc_6_input_when_date', null, { shouldValidate: true, shouldDirty: true }); }}
                    />

                    {errors.doc_6_input_when_date && !watch("doc_6_input_when_date") && <p className={`${textErrorClass}`}>{'เลือกวันที่'}</p>}
                </div>

                {/* เวลา */}
                <div className="pb-2 w-[200px]">
                    <label className={labelClass}>
                        <span className="text-red-500">*</span>
                        {`เวลา`}
                    </label>
                    <TimePickaForm
                        {...register('doc_6_input_when_time', { required: false })}
                        readOnly={mode == 'view' || mode == 'edit'}
                        placeHolder="ระบุเวลา"
                        mode={mode}
                        valueShow={watch("doc_6_input_when_time") || undefined}
                        allowClear
                        isError={!!errors.doc_6_input_when_time && !watch("doc_6_input_when_time")}
                        onChange={(e: any) => {
                            setValue('doc_6_input_when_time', e);
                            if (e == undefined)
                                setValue('doc_6_input_when_time', null, { shouldValidate: true, shouldDirty: true });
                        }}
                    />
                    {errors.doc_6_input_when_time && !watch("doc_6_input_when_time") && <p className={`${textErrorClass}`}>{'ระบุเวลา'}</p>}
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

            {/* 
                key ในแต่ละชุด

                // ชุด 1 
                doc_6_perm_lod_1 : เพิ่ม = 1, ลด = 2
                doc_6_nom_point_1  : ปริมาณก๊าซที่
                doc_6_nom_value_1 : คิดเป็นปริมาณ (MMSCFH)
                shipper_id_1 : shipper
                doc_6_gas_command_1 : การสั่งการ
                doc_6_gas_more_1 : ข้อมูลเพิ่มเติม
            */}

            {/* =================================== เพิ่ม/ ลดปริมาณก๊าซ  ======================================== */}
            <div className="flex flex-wrap items-center justify-between pt-4">
                <div className="py-2 text-[14px] font-semibold text-[#58585A]">
                    {`เพิ่ม/ ลดปริมาณก๊าซ`}
                </div>

                {
                    userDT?.account_manage?.[0]?.user_type_id !== 3 &&
                    <Button
                        onClick={resetPermLod}
                        disabled={false}
                        sx={{
                            width: '120px',
                            height: '43px',
                            minWidth: '120px',
                            borderRadius: '6px',
                            border: '1px solid #00ADEF',
                            backgroundColor: '#FFFFFF',
                            color: '#00ADEF',
                            textTransform: 'none', // ไม่ให้ uppercase อัตโนมัติ
                            '&:hover': {
                                backgroundColor: '#00ADEF',
                                color: '#FFFFFF',
                                borderColor: '#008FCC',
                            },
                        }}
                        endIcon={<ReplayRoundedIcon />}
                    >
                        {`Reset`}
                    </Button>
                }

            </div>


            {/* =============== ชุด 1 ===============*/}
            <div className="pb-5">
                <div className="gap-2 w-full flex items-center">
                    <div className="grid grid-cols-2 gap-1 pt-4">
                        <label className="w-[100px] text-[#58585A]">
                            <input
                                type="radio"
                                // {...register("doc_6_perm_lod_1", { required: !watch("doc_6_perm_lod_1") ? true : false })}
                                {...register("doc_6_perm_lod_1", { required: false })}
                                value={1}
                                disabled={(mode == 'view' || isShipper || idChudTee1) ? true : false}
                                checked={watch("doc_6_perm_lod_1") == 1 || watch("doc_6_perm_lod_1") == "1"}
                                // defaultChecked={watch("doc_6_perm_lod_1") == 1}
                                onChange={(e) => {
                                    setValue('doc_6_perm_lod_1', e.target.value)
                                }}
                                className="mr-1 accent-[#1473A1]"
                            />
                            {`เพิ่ม`}
                        </label>

                        <label className="w-[100px] text-[#58585A]">
                            <input
                                type="radio"
                                // {...register("doc_6_perm_lod_1", { required: !watch("doc_6_perm_lod_1") ? true : false })}
                                {...register("doc_6_perm_lod_1", { required: false })}
                                value={2}
                                disabled={(mode == 'view' || isShipper || idChudTee1) ? true : false}
                                // checked={watch("doc_6_perm_lod_1") == 2}
                                checked={watch("doc_6_perm_lod_1") == 2 || watch("doc_6_perm_lod_1") == "2"}
                                onChange={(e) => {
                                    setValue('doc_6_perm_lod_1', e.target.value)
                                }}
                                className="mr-1 accent-[#1473A1]"
                            />
                            {`ลด`}
                        </label>
                    </div>

                    <div className="grid grid-cols-3 w-full gap-4">
                        <div className="flex flex-wrap flex-auto ">
                            <label className={`${labelClass}`}>{`ปริมาณก๊าซที่`}</label>
                            <SelectFormProps
                                id={'doc_6_nom_point_1'}
                                register={register("doc_6_nom_point_1", { required: false })}
                                // disabled={(mode == 'view' || mode == 'edit' || !watch('doc_6_perm_lod_1')) ? true : false}
                                // disabled={(idChudTee1 && mode == 'edit') || !watch('doc_6_perm_lod_1') ? true : false } // kom test
                                disabled={mode == 'view' || !watch('doc_6_perm_lod_1') || isShipper || idChudTee1 ? true : false} // kom test 2
                                valueWatch={watch("doc_6_nom_point_1") || ""}
                                handleChange={(e) => {
                                    setValue("doc_6_nom_point_1", e.target.value);
                                    getShipperOfNomPoint(e.target.value, 1)
                                    clearErrors('doc_6_nom_point_1')
                                    if (errors?.doc_6_nom_point_1) { clearErrors('doc_6_nom_point_1') }
                                }}
                                errors={errors?.doc_6_nom_point_1}
                                errorsText={'Select Point'}
                                options={dataNomPointForDoc6}
                                optionsKey={'id'}
                                optionsValue={'id'}
                                optionsText={'nomination_point'}
                                optionsResult={'nomination_point'}
                                placeholder={'Select Point'}
                                pathFilter={'nomination_point'}
                            />
                        </div>

                        <div className="flex flex-wrap flex-auto ">
                            <label className={`${labelClass} `}>{`คิดเป็นปริมาณ (MMSCFH)`}</label>
                            <NumericFormat
                                id="doc_6_nom_value_1"
                                placeholder="0.0000"
                                value={watch("doc_6_nom_value_1")}
                                // readOnly={(mode == 'view' || mode == 'edit' || !watch('doc_6_perm_lod_1')) ? true : false}
                                // readOnly={(idChudTee1 && mode == 'edit') || !watch('doc_6_perm_lod_1') ? true : false } // kom test
                                disabled={mode == 'view' || !watch('doc_6_perm_lod_1') || isShipper || idChudTee1 ? true : false} // kom test 2
                                {...register("doc_6_nom_value_1", { required: false })}
                                className={`${inputClass} ${errors.doc_6_nom_value_1 && "border-red-500"}  ${(mode == 'view' || isShipper) && '!bg-[#EFECEC]'} text-right`}
                                thousandSeparator={true}
                                decimalScale={4}
                                fixedDecimalScale={true}
                                allowNegative={false}
                                displayType="input"
                                onValueChange={(values) => {
                                    const { value } = values;
                                    setValue("doc_6_nom_value_1", value, { shouldValidate: true, shouldDirty: true });
                                }}
                            />
                        </div>

                        <div className="flex flex-wrap flex-auto">
                            <label className={`${labelClass}`}>{`Shipper`}</label>
                            <Select
                                id="shipper_id_1"
                                multiple
                                IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                {...register("shipper_id_1", { required: false })}
                                disabled={(mode == 'view' || !watch('doc_6_perm_lod_1') || isShipper) ? true : false}
                                value={selectedShippers1}
                                onChange={(e: any) => handleSelectChange(e, 1)}
                                className={`${selectboxClass} ${(mode == 'view') && "!bg-[#EFECEC]"}`}
                                // sx={{
                                //     ".MuiOutlinedInput-notchedOutline": { borderColor: errors.shipper_id_1 && selectedShippers1.length === 0 ? "#FF0000" : "#DFE4EA" },
                                //     "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#d2d4d8" },
                                //     "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#d2d4d8" },
                                // }}
                                sx={selectSx}
                                displayEmpty
                                renderValue={(selected) => {
                                    if (selected.length === 0) {
                                        return <Typography color="#9CA3AF" fontSize={14}>Select Shipper Name</Typography>;
                                    }
                                    // return selected.map((id) => dataShipper1.find((item: any) => item.id === id)?.name).join(", ");
                                    const shipper_data = dataShipper1?.filter((item: any) => !defaultShippersId1?.includes(item.id))
                                    return (
                                        <span className={`pl-[10px] text-[14px]`}>
                                            {shipper_data?.length == selectedShippers1?.length ? `Select All` : selected.map((id) => dataShipper1?.filter((item: any) => !defaultShippersId1?.includes(item.id)).find((item: any) => item.id === id)?.name).join(", ")}
                                        </span>
                                    );
                                }}
                                MenuProps={{ PaperProps: { style: { maxHeight: 48 * 4.5 + 8 } } }}
                            >
                                {userDT?.account_manage?.[0]?.user_type_id !== 3 && (
                                    <MenuItem value="all">
                                        <Checkbox checked={selectedShippers1?.length === dataShipper1?.length && dataShipper1?.length > 0} />
                                        <ListItemText
                                            primary="Select All"
                                            // sx={{ fontWeight: 'bold' }}
                                            primaryTypographyProps={{ sx: { fontWeight: 'bold' } }}
                                        />
                                    </MenuItem>
                                )}

                                {dataShipper1?.length > 0 && dataShipper1
                                    ?.filter((item: any) => !defaultShippersId1?.includes(item.id)) // เอาอันที่มีอยู่แล้วออกจาก option 
                                    ?.sort((a: any, b: any) => a.name.localeCompare(b.name)) // แล้วค่อย sort
                                    ?.map((item: any) => (
                                        <MenuItem
                                            key={item.id}
                                            value={item.id}
                                            disabled={false}
                                        >
                                            <Checkbox checked={selectedShippers1.includes(item.id)} />
                                            <ListItemText primary={item.name} />
                                        </MenuItem>
                                    ))
                                }
                            </Select>
                        </div>
                    </div>
                </div>

                {
                    watch('doc_6_perm_lod_1') && <>
                        <div className="gap-2 w-full flex items-center">

                            <div className="grid grid-cols-2 gap-1 pt-4">
                                <label className="w-[100px] text-[#58585A]"></label>
                                <label className="w-[100px] text-[#58585A]"></label>
                            </div>

                            <div className="grid grid-cols-3 w-full gap-4">
                                <div></div>
                                <div></div>
                                <div className="w-full flex flex-wrap items-end justify-end gap-4">
                                    <div className="flex flex-wrap gap-2 pt-2 mt-2 w-full max-h-[120px] overflow-y-auto">
                                        {/* ลบไม่ได้เว่ย */}
                                        {defaultShippersRender1?.map((item: any, index: number) => (
                                            <div
                                                key={`default-${index}`}
                                                className="relative w-fit h-[40px] p-2 text-[13px] bg-[#CFF2FF] border border-[#DFE4EA] rounded-[6px] text-[#58585A] break-all"
                                            >
                                                {item?.name}
                                            </div>
                                        ))}

                                        {
                                            selectedShippersRender1?.map((item: any, index: number) => (
                                                <div
                                                    key={index}
                                                    className="relative w-fit h-[40px] p-2 text-[13px] bg-[#CFF2FF] border border-[#DFE4EA] rounded-[6px] text-[#58585A] break-all"
                                                >
                                                    {item?.name}
                                                    <button
                                                        type="button"
                                                        className="absolute top-[-6px] right-[-4px] w-[15px] h-[15px] rounded-full bg-[#58585A] text-white flex justify-center items-center text-[8px]"
                                                        onClick={() => removeShipper(item?.id, 1)}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="gap-2 w-full flex items-center pt-4">

                            <div className="grid grid-cols-2 gap-1 pt-4">
                                <label className="w-[100px] text-[#58585A]"></label>
                                <label className="w-[100px] text-[#58585A]"></label>
                            </div>

                            <div className="grid grid-cols-2 w-full gap-4">
                                <div className="">
                                    <label htmlFor="doc_6_gas_command_1" className={labelClass}> {`การสั่งการ`}</label>
                                    <input
                                        id="doc_6_gas_command_1"
                                        type="text"
                                        placeholder="รายละเอียด"
                                        // readOnly={isReadOnly}
                                        // readOnly={(idChudTee1 && mode == 'edit') || !watch('doc_6_perm_lod_1') ? true : false } // kom test
                                        // readOnly={mode == 'view' || !watch('doc_6_perm_lod_1') || isShipper ? true : false} // kom test 2
                                        readOnly={mode == 'view' || !watch('doc_6_perm_lod_1') || (mode === 'edit' && watch('doc_6_perm_lod_1') && idChudTee1) || isShipper ? true : false} // kom test 3
                                        {...register("doc_6_gas_command_1", { required: false })}
                                        onChange={(e) => {
                                            if (e.target.value.length <= 255) {
                                                setValue('doc_6_gas_command_1', e.target.value);
                                            }
                                        }}
                                        maxLength={255}
                                        className={`${inputClass} ${errors.doc_6_gas_command_1 && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'}`}
                                    />
                                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1"><span className="text-[13px]">{watch('doc_6_gas_command_1')?.length || 0} / 255</span></div>
                                </div>

                                <div className="">
                                    <label htmlFor="doc_6_gas_more_1" className={labelClass}> {`ข้อมูลเพิ่มเติม`}</label>
                                    <input
                                        id="doc_6_gas_more_1"
                                        type="text"
                                        placeholder="รายละเอียด"
                                        // readOnly={isReadOnly}
                                        // readOnly={(idChudTee1 && mode == 'edit') || !watch('doc_6_perm_lod_1') ? true : false } // kom test
                                        // readOnly={mode == 'view' || !watch('doc_6_perm_lod_1') || isShipper ? true : false} // kom test 2
                                        readOnly={mode == 'view' || !watch('doc_6_perm_lod_1') || (mode === 'edit' && watch('doc_6_perm_lod_1') && idChudTee1) || isShipper ? true : false} // kom test 3
                                        {...register("doc_6_gas_more_1", { required: false })}
                                        onChange={(e) => {
                                            if (e.target.value.length <= 255) {
                                                setValue('doc_6_gas_more_1', e.target.value);
                                            }
                                        }}
                                        maxLength={255}
                                        className={`${inputClass} ${errors.doc_6_gas_more_1 && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'}`}
                                    />
                                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1"><span className="text-[13px]">{watch('doc_6_gas_more_1')?.length || 0} / 255</span></div>
                                </div>
                            </div>
                        </div>

                        <div className="gap-2 w-full flex items-center ">
                            <div className="grid grid-cols-2 gap-1 pt-4">
                                <label className="w-[100px] text-[#58585A]"></label>
                                <label className="w-[100px] text-[#58585A]"></label>
                            </div>

                            {/* File */}
                            {/* ถ้าเป็น create แสดงอันนี้ */}
                            {
                                // userDT?.account_manage?.[0]?.user_type_id !== 3 && mode == 'create' &&
                                userDT?.account_manage?.[0]?.user_type_id !== 3 && mode !== 'view' &&
                                <div className="grid grid-cols-2 w-full">
                                    <label className={`${labelClass}`}>{`File`}</label>
                                    <div className={`flex items-center col-span-2 ${IsErrorChudTee == '1' ? 'border  border-[#ff0000] rounded-r-lg rounded-l-lg' : ''}`}>
                                        <label className={`flex bg-[#00ADEF] text-white items-center justify-center font-light rounded-l-[6px] text-[16px] text-justify w-[20%] !h-[44px] px-2 cursor-pointer`}>
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
                                                // onChange={handleFileChange}
                                                onChange={(e) => handleFileChange(e, 1)}
                                            />
                                        </label>

                                        <div className="bg-white text-[#9CA3AF] text-sm w-[80%] !h-[44px] px-2 py-2 rounded-r-[6px] border-l-0 border border-gray-300 truncate overflow-hidden flex items-center">
                                            <span className="truncate">
                                                {fileName1}
                                            </span>
                                            {fileName1 !== "Maximum File 5 MB" && (
                                                <CloseOutlinedIcon
                                                    onClick={() => handleRemoveFile(1)}
                                                    className="cursor-pointer ml-2 text-[#9CA3AF] z-10"
                                                    sx={{ color: '#323232', fontSize: 18 }}
                                                    style={{ fontSize: 18 }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <div className={`w-full flex items-center justify-between text-[14px] text-red-500 `}>
                                        {IsErrorChudTee == '1' && 'The file is larger than 5 MB.'}
                                    </div>

                                </div>
                            }

                            {/* File */}
                            {/* ถ้าเป็น edit view แสดงอันนี้ */}
                            {
                                // (mode == 'edit' || mode == 'view') && fileNameEditTextUrl1 !== '' &&
                                (mode == 'view') && fileNameEditTextUrl1 !== '' &&
                                <div className="grid grid-cols-2 w-full gap-4 ">
                                    <div className="col-span-2 ">
                                        <label className={`${labelClass}`}>
                                            {`File`}
                                        </label>
                                        <div className="h-[46px] text-[#464255] p-3 rounded-[6px] bg-[#F3F2F2] flex justify-between w-full">
                                            <div className="flex items-center gap-2">
                                                <InsertDriveFileOutlinedIcon sx={{ fontSize: '20px' }} /> {fileNameEditText1}
                                            </div>

                                            <button
                                                type="button"
                                                className={`flex items-center justify-center px-[2px] py-[2px] rounded-[4px] relative ${fileNameEditTextUrl1 === '' ? 'bg-[#f0f0f0] cursor-not-allowed pointer-events-none' : 'hover:bg-[#DFE4EA] hover:border hover:border-[#DFE4EA]'}`}
                                                onClick={() => downloadFile(1)}
                                                disabled={fileNameEditTextUrl1 !== '' ? false : true}
                                            >
                                                <FileDownloadIcon sx={{ fontSize: 23, color: '#1473A1', backgroundColor: '#ffffff', borderRadius: '4px', borderColor: '#DFE4EA' }} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>

                    </>
                }
            </div>


            {horizoneDivide()}


            {/* =============== ชุด 2 ===============*/}
            <div className="pb-5 pt-2">
                <div className="gap-2 w-full flex items-center">
                    <div className="grid grid-cols-2 gap-1 pt-4">
                        <label className="w-[100px] text-[#58585A]">
                            <input
                                type="radio"
                                // {...register("doc_6_perm_lod_2", { required: !watch("doc_6_perm_lod_2") ? true : false })}
                                {...register("doc_6_perm_lod_2", { required: false })}
                                value={1}
                                disabled={(mode == 'view' || isShipper || idChudTee2) ? true : false || watch('doc_6_perm_lod_1') ? false : true}
                                checked={watch("doc_6_perm_lod_2") == 1}
                                onChange={(e) => {
                                    setValue('doc_6_perm_lod_2', e.target.value)
                                }}
                                className="mr-1 accent-[#1473A1]"
                            />
                            {`เพิ่ม`}
                        </label>

                        <label className="w-[100px] text-[#58585A]">
                            <input
                                type="radio"
                                // {...register("doc_6_perm_lod_2", { required: !watch("doc_6_perm_lod_2") ? true : false })}
                                {...register("doc_6_perm_lod_2", { required: false })}
                                value={2}
                                disabled={(mode == 'view' || isShipper || idChudTee2) ? true : false || watch('doc_6_perm_lod_1') ? false : true}
                                checked={watch("doc_6_perm_lod_2") == 2}
                                onChange={(e) => {
                                    setValue('doc_6_perm_lod_2', e.target.value)
                                }}
                                className="mr-1 accent-[#1473A1]"
                            />
                            {`ลด`}
                        </label>
                    </div>

                    <div className="grid grid-cols-3 w-full gap-4">
                        <div className="flex flex-wrap flex-auto ">
                            <label className={`${labelClass}`}>{`ปริมาณก๊าซที่`}</label>
                            <SelectFormProps
                                id={'doc_6_nom_point_2'}
                                register={register("doc_6_nom_point_2", { required: false })}
                                // disabled={(mode == 'view' || mode == 'edit' || !watch('doc_6_perm_lod_2')) ? true : false}
                                // disabled={(idChudTee2 && mode == 'edit') || !watch('doc_6_perm_lod_2') ? true : false } // kom test
                                disabled={mode == 'view' || !watch('doc_6_perm_lod_2') || isShipper || idChudTee2 ? true : false} // kom test 2

                                valueWatch={watch("doc_6_nom_point_2") || ""}
                                handleChange={(e) => {
                                    setValue("doc_6_nom_point_2", e.target.value);
                                    getShipperOfNomPoint(e.target.value, 2)
                                    clearErrors('doc_6_nom_point_2')
                                    if (errors?.doc_6_nom_point_2) { clearErrors('doc_6_nom_point_2') }
                                }}
                                errors={errors?.doc_6_nom_point_2}
                                errorsText={'Select Point'}
                                options={dataNomPointForDoc6}
                                optionsKey={'id'}
                                optionsValue={'id'}
                                optionsText={'nomination_point'}
                                optionsResult={'nomination_point'}
                                placeholder={'Select Point'}
                                pathFilter={'nomination_point'}
                            />
                        </div>

                        <div className="flex flex-wrap flex-auto ">
                            <label className={`${labelClass} `}>{`คิดเป็นปริมาณ (MMSCFH)`}</label>
                            <NumericFormat
                                id="doc_6_nom_value_2"
                                placeholder="0.0000"
                                value={watch("doc_6_nom_value_2")}
                                // readOnly={(mode == 'view' || mode == 'edit' || !watch('doc_6_perm_lod_2')) ? true : false}
                                // readOnly={(idChudTee2 && mode == 'edit') || !watch('doc_6_perm_lod_2') ? true : false } // kom test
                                disabled={mode == 'view' || !watch('doc_6_perm_lod_2') || isShipper || idChudTee2 ? true : false} // kom test 2
                                {...register("doc_6_nom_value_2", { required: false })}
                                className={`${inputClass} ${errors.doc_6_nom_value_2 && "border-red-500"}  ${(mode == 'view' || isShipper) && '!bg-[#EFECEC]'} text-right`}
                                thousandSeparator={true}
                                decimalScale={4}
                                fixedDecimalScale={true}
                                allowNegative={false}
                                displayType="input"
                                onValueChange={(values) => {
                                    const { value } = values;
                                    setValue("doc_6_nom_value_2", value, { shouldValidate: true, shouldDirty: true });
                                }}
                            />
                        </div>

                        <div className="flex flex-wrap flex-auto">
                            <label className={`${labelClass}`}>{`Shipper`}</label>
                            <Select
                                id="shipper_id_2"
                                multiple
                                IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                {...register("shipper_id_2", { required: false })}
                                disabled={(mode == 'view' || !watch('doc_6_perm_lod_2') || isShipper) ? true : false}
                                value={selectedShippers2}
                                onChange={(e: any) => handleSelectChange(e, 2)}
                                className={`${selectboxClass} ${(mode == 'view') && "!bg-[#EFECEC]"}`}
                                sx={selectSx}
                                displayEmpty
                                renderValue={(selected) => {
                                    if (selected.length === 0) {
                                        return <Typography color="#9CA3AF" fontSize={14}>Select Shipper Name</Typography>;
                                    }
                                    // return selected.map((id) => dataShipper2.find((item: any) => item.id === id)?.name).join(", ");
                                    const shipper_data = dataShipper2?.filter((item: any) => !defaultShippersId2?.includes(item.id))
                                    return (
                                        <span className={`pl-[10px] text-[14px]`}>
                                            {shipper_data?.length == selectedShippers2?.length ? `Select All` : selected.map((id) => dataShipper2?.filter((item: any) => !defaultShippersId2?.includes(item.id)).find((item: any) => item.id === id)?.name).join(", ")}
                                        </span>
                                    );
                                }}
                                MenuProps={{ PaperProps: { style: { maxHeight: 48 * 4.5 + 8 } } }}
                            >
                                {userDT?.account_manage?.[0]?.user_type_id !== 3 && (
                                    <MenuItem value="all">
                                        <Checkbox checked={selectedShippers2?.length === dataShipper2?.length && dataShipper2?.length > 0} />
                                        <ListItemText
                                            primary="Select All"
                                            // sx={{ fontWeight: 'bold' }}
                                            primaryTypographyProps={{ sx: { fontWeight: 'bold' } }}
                                        />
                                    </MenuItem>
                                )}

                                {dataShipper2?.length > 0 && dataShipper2
                                    ?.filter((item: any) => !defaultShippersId2?.includes(item.id)) // เอาอันที่มีอยู่แล้วออกจาก option 
                                    ?.sort((a: any, b: any) => a.name.localeCompare(b.name)) // แล้วค่อย sort
                                    ?.map((item: any) => (
                                        <MenuItem
                                            key={item.id}
                                            value={item.id}
                                            disabled={false}
                                        >
                                            <Checkbox checked={selectedShippers2.includes(item.id)} />
                                            <ListItemText primary={item.name} />
                                        </MenuItem>
                                    ))
                                }
                            </Select>
                        </div>
                    </div>
                </div>

                {
                    watch('doc_6_perm_lod_2') && <>
                        <div className="gap-2 w-full flex items-center">

                            <div className="grid grid-cols-2 gap-1 pt-4">
                                <label className="w-[100px] text-[#58585A]"></label>
                                <label className="w-[100px] text-[#58585A]"></label>
                            </div>

                            <div className="grid grid-cols-3 w-full gap-4">
                                <div></div>
                                <div></div>
                                <div className="w-full flex flex-wrap items-end justify-end gap-4">
                                    <div className="flex flex-wrap gap-2 pt-2 mt-2 w-full max-h-[120px] overflow-y-auto">
                                        {/* ลบไม่ได้เว่ย */}
                                        {defaultShippersRender2?.map((item: any, index: number) => (
                                            <div
                                                key={`default-${index}`}
                                                className="relative w-fit h-[40px] p-2 text-[13px] bg-[#CFF2FF] border border-[#DFE4EA] rounded-[6px] text-[#58585A] break-all"
                                            >
                                                {item?.name}
                                            </div>
                                        ))}

                                        {
                                            selectedShippersRender2?.map((item: any, index: number) => (
                                                <div
                                                    key={index}
                                                    className="relative w-fit h-[40px] p-2 text-[13px] bg-[#CFF2FF] border border-[#DFE4EA] rounded-[6px] text-[#58585A] break-all"
                                                >
                                                    {item?.name}
                                                    <button
                                                        type="button"
                                                        className="absolute top-[-6px] right-[-4px] w-[15px] h-[15px] rounded-full bg-[#58585A] text-white flex justify-center items-center text-[8px]"
                                                        onClick={() => removeShipper(item?.id, 2)}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="gap-2 w-full flex items-center pt-4">

                            <div className="grid grid-cols-2 gap-1 pt-4">
                                <label className="w-[100px] text-[#58585A]"></label>
                                <label className="w-[100px] text-[#58585A]"></label>
                            </div>

                            <div className="grid grid-cols-2 w-full gap-4">
                                <div className="">
                                    <label htmlFor="doc_6_gas_command_2" className={labelClass}> {`การสั่งการ`}</label>
                                    <input
                                        id="doc_6_gas_command_2"
                                        type="text"
                                        placeholder="รายละเอียด"
                                        // readOnly={isReadOnly}
                                        // readOnly={(idChudTee2 && mode == 'edit') || !watch('doc_6_perm_lod_2') ? true : false } // kom test
                                        // readOnly={mode == 'view' || !watch('doc_6_perm_lod_2') || isShipper ? true : false} // kom test 2
                                        readOnly={mode == 'view' || !watch('doc_6_perm_lod_2') || (mode === 'edit' && watch('doc_6_perm_lod_2') && idChudTee2) || isShipper ? true : false} // kom test 3
                                        {...register("doc_6_gas_command_2", { required: false })}
                                        onChange={(e) => {
                                            if (e.target.value.length <= 255) {
                                                setValue('doc_6_gas_command_2', e.target.value);
                                            }
                                        }}
                                        maxLength={255}
                                        className={`${inputClass} 
                                            ${mode === 'view' || (mode === 'edit' && !watch('doc_6_perm_lod_2')) || (mode === 'edit' && watch('doc_6_perm_lod_2') && idChudTee2) && '!bg-[#EFECEC]'}
                                        `}
                                    />
                                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1"><span className="text-[13px]">{watch('doc_6_gas_command_2')?.length || 0} / 255</span></div>
                                </div>

                                <div className="">
                                    <label htmlFor="doc_6_gas_more_2" className={labelClass}> {`ข้อมูลเพิ่มเติม`}</label>
                                    <input
                                        id="doc_6_gas_more_2"
                                        type="text"
                                        placeholder="รายละเอียด"
                                        // readOnly={isReadOnly}
                                        // readOnly={(idChudTee2 && mode == 'edit') || !watch('doc_6_perm_lod_2') ? true : false } // kom test
                                        readOnly={mode == 'view' || !watch('doc_6_perm_lod_2') || isShipper ? true : false} // kom test 2
                                        {...register("doc_6_gas_more_2", { required: false })}
                                        onChange={(e) => {
                                            if (e.target.value.length <= 255) {
                                                setValue('doc_6_gas_more_2', e.target.value);
                                            }
                                        }}
                                        maxLength={255}
                                        // className={`${inputClass} ${errors.doc_6_gas_more_2 && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'}`}
                                        className={`${inputClass} 
                                            ${mode === 'view' || (mode === 'edit' && !watch('doc_6_perm_lod_2')) || (mode === 'edit' && watch('doc_6_perm_lod_2') && idChudTee2) && '!bg-[#EFECEC]'}
                                        `}
                                    />
                                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1"><span className="text-[13px]">{watch('doc_6_gas_more_2')?.length || 0} / 255</span></div>
                                </div>
                            </div>
                        </div>

                        <div className="gap-2 w-full flex items-center ">
                            <div className="grid grid-cols-2 gap-1 pt-4">
                                <label className="w-[100px] text-[#58585A]"></label>
                                <label className="w-[100px] text-[#58585A]"></label>
                            </div>

                            {/* File */}
                            {/* ถ้าเป็น create แสดงอันนี้ */}
                            {
                                // userDT?.account_manage?.[0]?.user_type_id !== 3 && mode == 'create' &&
                                userDT?.account_manage?.[0]?.user_type_id !== 3 && mode !== 'view' &&
                                <div className="grid grid-cols-2 w-full">
                                    <label className={`${labelClass}`}>{`File`}</label>
                                    <div className={`flex items-center col-span-2 ${IsErrorChudTee == '2' ? 'border  border-[#ff0000] rounded-r-lg rounded-l-lg' : ''}`}>
                                        <label className={`flex bg-[#00ADEF] text-white items-center justify-center font-light rounded-l-[6px] text-[16px] text-justify w-[20%] !h-[44px] px-2 cursor-pointer`}>
                                            {`Choose File`}
                                            {isUploading2 && (
                                                <span className="ml-2 w-[14px] h-[14px] border-[2px] border-white border-t-transparent rounded-full animate-spin"></span>
                                            )}
                                            <input
                                                id="url"
                                                type="file"
                                                className="hidden"
                                                {...register('file')}
                                                // accept=".xls, .xlsx"
                                                // onChange={handleFileChange}
                                                onChange={(e) => handleFileChange(e, 2)}
                                            />
                                        </label>

                                        <div className="bg-white text-[#9CA3AF] text-sm w-[80%] !h-[44px] px-2 py-2 rounded-r-[6px] border-l-0 border border-gray-300 truncate overflow-hidden flex items-center">
                                            <span className="truncate">
                                                {fileName2}
                                            </span>
                                            {fileName2 !== "Maximum File 5 MB" && (
                                                <CloseOutlinedIcon
                                                    // onClick={handleRemoveFile}
                                                    onClick={() => handleRemoveFile(2)}
                                                    className="cursor-pointer ml-2 text-[#9CA3AF] z-10"
                                                    sx={{ color: '#323232', fontSize: 18 }}
                                                    style={{ fontSize: 18 }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <div className={`w-full flex items-center justify-between text-[14px] text-red-500 `}>
                                        {IsErrorChudTee == '2' && 'The file is larger than 5 MB.'}
                                    </div>
                                </div>
                            }

                            {/* File */}
                            {/* ถ้าเป็น edit view แสดงอันนี้ */}
                            {
                                // (mode == 'edit' || mode == 'view') && fileNameEditTextUrl2 !== '' &&
                                (mode == 'view') && fileNameEditTextUrl2 !== '' &&
                                <div className="grid grid-cols-2 w-full gap-4 ">
                                    <div className="col-span-2 ">
                                        <label className={`${labelClass}`}>
                                            {`File`}
                                        </label>
                                        <div className="h-[46px] text-[#464255] p-3 rounded-[6px] bg-[#F3F2F2] flex justify-between w-full">
                                            <div className="flex items-center gap-2">
                                                <InsertDriveFileOutlinedIcon sx={{ fontSize: '20px' }} /> {fileNameEditText2}
                                            </div>

                                            <button
                                                type="button"
                                                className={`flex items-center justify-center px-[2px] py-[2px] rounded-[4px] relative ${fileNameEditTextUrl2 === '' ? 'bg-[#f0f0f0] cursor-not-allowed pointer-events-none' : 'hover:bg-[#DFE4EA] hover:border hover:border-[#DFE4EA]'}`}
                                                onClick={() => downloadFile(2)}
                                                disabled={fileNameEditTextUrl2 !== '' ? false : true}
                                            >
                                                <FileDownloadIcon sx={{ fontSize: 23, color: '#1473A1', backgroundColor: '#ffffff', borderRadius: '4px', borderColor: '#DFE4EA' }} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>

                    </>
                }
            </div>


            {horizoneDivide()}


            {/* =============== ชุด 3 ===============*/}
            <div className="pb-5 pt-2">
                <div className="gap-2 w-full flex items-center">
                    <div className="grid grid-cols-2 gap-1 pt-4">
                        <label className="w-[100px] text-[#58585A]">
                            <input
                                type="radio"
                                // {...register("doc_6_perm_lod_3", { required: !watch("doc_6_perm_lod_3") ? true : false })}
                                {...register("doc_6_perm_lod_3", { required: false })}
                                value={1}
                                // disabled={(mode == 'view') ? true : false}
                                disabled={(mode == 'view' || isShipper || idChudTee3) ? true : false || watch('doc_6_perm_lod_2') ? false : true}
                                checked={watch("doc_6_perm_lod_3") == 1}
                                onChange={(e) => {
                                    setValue('doc_6_perm_lod_3', e.target.value)
                                }}
                                className="mr-1 accent-[#1473A1]"
                            />
                            {`เพิ่ม`}
                        </label>

                        <label className="w-[100px] text-[#58585A]">
                            <input
                                type="radio"
                                // {...register("doc_6_perm_lod_3", { required: !watch("doc_6_perm_lod_3") ? true : false })}
                                {...register("doc_6_perm_lod_3", { required: false })}
                                value={2}
                                disabled={(mode == 'view' || isShipper || idChudTee3) ? true : false || watch('doc_6_perm_lod_2') ? false : true}
                                checked={watch("doc_6_perm_lod_3") == 2}
                                onChange={(e) => {
                                    setValue('doc_6_perm_lod_3', e.target.value)
                                }}
                                className="mr-1 accent-[#1473A1]"
                            />
                            {`ลด`}
                        </label>
                    </div>

                    <div className="grid grid-cols-3 w-full gap-4">
                        <div className="flex flex-wrap flex-auto ">
                            <label className={`${labelClass}`}>{`ปริมาณก๊าซที่`}</label>
                            <SelectFormProps
                                id={'doc_6_nom_point_3'}
                                register={register("doc_6_nom_point_3", { required: false })}
                                // disabled={(mode == 'view' || mode == 'edit' || !watch('doc_6_perm_lod_3')) ? true : false}
                                // disabled={(idChudTee3 && mode == 'edit') || !watch('doc_6_perm_lod_3') ? true : false } // kom test
                                disabled={mode == 'view' || !watch('doc_6_perm_lod_3') || isShipper || idChudTee3 ? true : false} // kom test 2
                                valueWatch={watch("doc_6_nom_point_3") || ""}
                                handleChange={(e) => {
                                    setValue("doc_6_nom_point_3", e.target.value);
                                    getShipperOfNomPoint(e.target.value, 3)
                                    clearErrors('doc_6_nom_point_3')
                                    if (errors?.doc_6_nom_point_3) { clearErrors('doc_6_nom_point_3') }
                                }}
                                errors={errors?.doc_6_nom_point_3}
                                errorsText={'Select Point'}
                                options={dataNomPointForDoc6}
                                optionsKey={'id'}
                                optionsValue={'id'}
                                optionsText={'nomination_point'}
                                optionsResult={'nomination_point'}
                                placeholder={'Select Point'}
                                pathFilter={'nomination_point'}
                            />
                        </div>

                        <div className="flex flex-wrap flex-auto ">
                            <label className={`${labelClass} `}>{`คิดเป็นปริมาณ (MMSCFH)`}</label>
                            <NumericFormat
                                id="doc_6_nom_value_3"
                                placeholder="0.0000"
                                value={watch("doc_6_nom_value_3")}
                                // readOnly={(mode == 'view' || mode == 'edit' || !watch('doc_6_perm_lod_3')) ? true : false}
                                // readOnly={(idChudTee3 && mode == 'edit') || !watch('doc_6_perm_lod_3') ? true : false } // kom test
                                disabled={mode == 'view' || !watch('doc_6_perm_lod_3') || isShipper || idChudTee3 ? true : false} // kom test 2
                                {...register("doc_6_nom_value_3", { required: false })}
                                className={`${inputClass} ${errors.doc_6_nom_value_3 && "border-red-500"}  ${(mode == 'view' || isShipper) && '!bg-[#EFECEC]'} text-right`}
                                thousandSeparator={true}
                                decimalScale={4}
                                fixedDecimalScale={true}
                                allowNegative={false}
                                displayType="input"
                                onValueChange={(values) => {
                                    const { value } = values;
                                    setValue("doc_6_nom_value_3", value, { shouldValidate: true, shouldDirty: true });
                                }}
                            />
                        </div>

                        <div className="flex flex-wrap flex-auto">
                            <label className={`${labelClass}`}>{`Shipper`}</label>
                            <Select
                                id="shipper_id_3"
                                multiple
                                IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                {...register("shipper_id_3", { required: false })}
                                disabled={(mode == 'view' || !watch('doc_6_perm_lod_3') || isShipper) ? true : false}
                                value={selectedShippers3}
                                onChange={(e: any) => handleSelectChange(e, 3)}
                                className={`${selectboxClass} ${(mode == 'view') && "!bg-[#EFECEC]"}`}
                                sx={selectSx}
                                displayEmpty
                                renderValue={(selected) => {
                                    if (selected.length === 0) {
                                        return <Typography color="#9CA3AF" fontSize={14}>Select Shipper Name</Typography>;
                                    }
                                    // return selected.map((id) => dataShipper3.find((item: any) => item.id === id)?.name).join(", ");
                                    const shipper_data = dataShipper3?.filter((item: any) => !defaultShippersId3?.includes(item.id))
                                    return (
                                        <span className={`pl-[10px] text-[14px]`}>
                                            {shipper_data?.length == selectedShippers3?.length ? `Select All` : selected.map((id) => dataShipper3?.filter((item: any) => !defaultShippersId3?.includes(item.id)).find((item: any) => item.id === id)?.name).join(", ")}
                                        </span>
                                    );
                                }}
                                MenuProps={{ PaperProps: { style: { maxHeight: 48 * 4.5 + 8 } } }}
                            >
                                {userDT?.account_manage?.[0]?.user_type_id !== 3 && (
                                    <MenuItem value="all">
                                        <Checkbox checked={selectedShippers3?.length === dataShipper3?.length && dataShipper3?.length > 0} />
                                        <ListItemText
                                            primary="Select All"
                                            // sx={{ fontWeight: 'bold' }}
                                            primaryTypographyProps={{ sx: { fontWeight: 'bold' } }}
                                        />
                                    </MenuItem>
                                )}

                                {dataShipper3?.length > 0 && dataShipper3
                                    ?.filter((item: any) => !defaultShippersId3?.includes(item.id)) // เอาอันที่มีอยู่แล้วออกจาก option 
                                    ?.sort((a: any, b: any) => a.name.localeCompare(b.name)) // แล้วค่อย sort
                                    ?.map((item: any) => (
                                        <MenuItem
                                            key={item.id}
                                            value={item.id}
                                            disabled={false}
                                        >
                                            <Checkbox checked={selectedShippers3.includes(item.id)} />
                                            <ListItemText primary={item.name} />
                                        </MenuItem>
                                    ))
                                }
                            </Select>
                        </div>
                    </div>
                </div>

                {
                    watch('doc_6_perm_lod_3') && <>
                        <div className="gap-2 w-full flex items-center">

                            <div className="grid grid-cols-2 gap-1 pt-4">
                                <label className="w-[100px] text-[#58585A]"></label>
                                <label className="w-[100px] text-[#58585A]"></label>
                            </div>

                            <div className="grid grid-cols-3 w-full gap-4">
                                <div></div>
                                <div></div>
                                <div className="w-full flex flex-wrap items-end justify-end gap-4">
                                    <div className="flex flex-wrap gap-2 pt-2 mt-2 w-full max-h-[120px] overflow-y-auto">
                                        {/* ลบไม่ได้เว่ย */}
                                        {defaultShippersRender3?.map((item: any, index: number) => (
                                            <div
                                                key={`default-${index}`}
                                                className="relative w-fit h-[40px] p-2 text-[13px] bg-[#CFF2FF] border border-[#DFE4EA] rounded-[6px] text-[#58585A] break-all"
                                            >
                                                {item?.name}
                                            </div>
                                        ))}

                                        {
                                            selectedShippersRender3?.map((item: any, index: number) => (
                                                <div
                                                    key={index}
                                                    className="relative w-fit h-[40px] p-2 text-[13px] bg-[#CFF2FF] border border-[#DFE4EA] rounded-[6px] text-[#58585A] break-all"
                                                >
                                                    {item?.name}
                                                    <button
                                                        type="button"
                                                        className="absolute top-[-6px] right-[-4px] w-[15px] h-[15px] rounded-full bg-[#58585A] text-white flex justify-center items-center text-[8px]"
                                                        onClick={() => removeShipper(item?.id, 3)}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="gap-2 w-full flex items-center pt-4">

                            <div className="grid grid-cols-2 gap-1 pt-4">
                                <label className="w-[100px] text-[#58585A]"></label>
                                <label className="w-[100px] text-[#58585A]"></label>
                            </div>

                            <div className="grid grid-cols-2 w-full gap-4">
                                <div className="">
                                    <label htmlFor="doc_6_gas_command_3" className={labelClass}> {`การสั่งการ`}</label>
                                    <input
                                        id="doc_6_gas_command_3"
                                        type="text"
                                        placeholder="รายละเอียด"
                                        // readOnly={isReadOnly}
                                        // readOnly={(idChudTee3 && mode == 'edit') || !watch('doc_6_perm_lod_3') ? true : false } // kom test
                                        // readOnly={mode == 'view' || !watch('doc_6_perm_lod_3') || isShipper ? true : false} // kom test 2
                                        readOnly={mode == 'view' || !watch('doc_6_perm_lod_3') || (mode === 'edit' && watch('doc_6_perm_lod_3') && idChudTee3) || isShipper ? true : false} // kom test 3
                                        {...register("doc_6_gas_command_3", { required: false })}
                                        onChange={(e) => {
                                            if (e.target.value.length <= 255) {
                                                setValue('doc_6_gas_command_3', e.target.value);
                                            }
                                        }}
                                        maxLength={255}
                                        // className={`${inputClass} ${errors.doc_6_gas_command_3 && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'}`}
                                        className={`${inputClass} 
                                            ${mode === 'view' || (mode === 'edit' && !watch('doc_6_perm_lod_3')) || (mode === 'edit' && watch('doc_6_perm_lod_3') && idChudTee3) && '!bg-[#EFECEC]'}
                                        `}
                                    />
                                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1"><span className="text-[13px]">{watch('doc_6_gas_command_3')?.length || 0} / 255</span></div>
                                </div>

                                <div className="">
                                    <label htmlFor="doc_6_gas_more_3" className={labelClass}> {`ข้อมูลเพิ่มเติม`}</label>
                                    <input
                                        id="doc_6_gas_more_3"
                                        type="text"
                                        placeholder="รายละเอียด"
                                        // readOnly={isReadOnly}
                                        // readOnly={(idChudTee3 && mode == 'edit') || !watch('doc_6_perm_lod_3') ? true : false } // kom test
                                        readOnly={mode == 'view' || !watch('doc_6_perm_lod_3') || isShipper ? true : false} // kom test 2
                                        {...register("doc_6_gas_more_3", { required: false })}
                                        onChange={(e) => {
                                            if (e.target.value.length <= 255) {
                                                setValue('doc_6_gas_more_3', e.target.value);
                                            }
                                        }}
                                        maxLength={255}
                                        // className={`${inputClass} ${errors.doc_6_gas_more_3 && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'}`}
                                        className={`${inputClass} 
                                        ${mode === 'view' || (mode === 'edit' && !watch('doc_6_perm_lod_3')) || (mode === 'edit' && watch('doc_6_perm_lod_3') && idChudTee3) && '!bg-[#EFECEC]'}
                                        `}
                                    />
                                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1"><span className="text-[13px]">{watch('doc_6_gas_more_3')?.length || 0} / 255</span></div>
                                </div>
                            </div>
                        </div>

                        <div className="gap-2 w-full flex items-center ">
                            <div className="grid grid-cols-2 gap-1 pt-4">
                                <label className="w-[100px] text-[#58585A]"></label>
                                <label className="w-[100px] text-[#58585A]"></label>
                            </div>

                            {/* File */}
                            {/* ถ้าเป็น create แสดงอันนี้ */}
                            {
                                // userDT?.account_manage?.[0]?.user_type_id !== 3 && mode == 'create' &&
                                userDT?.account_manage?.[0]?.user_type_id !== 3 && mode !== 'view' &&
                                <div className="grid grid-cols-2 w-full">
                                    <label className={`${labelClass}`}>{`File`}</label>
                                    <div className={`flex items-center col-span-2 ${IsErrorChudTee == '3' ? 'border  border-[#ff0000] rounded-r-lg rounded-l-lg' : ''}`}>
                                        <label className={`flex bg-[#00ADEF] text-white items-center justify-center font-light rounded-l-[6px] text-[16px] text-justify w-[20%] !h-[44px] px-2 cursor-pointer`}>
                                            {`Choose File`}
                                            {isUploading3 && (
                                                <span className="ml-2 w-[14px] h-[14px] border-[2px] border-white border-t-transparent rounded-full animate-spin"></span>
                                            )}
                                            <input
                                                id="url"
                                                type="file"
                                                className="hidden"
                                                {...register('file')}
                                                // accept=".xls, .xlsx"
                                                // onChange={handleFileChange}
                                                onChange={(e) => handleFileChange(e, 3)}
                                            />
                                        </label>

                                        <div className="bg-white text-[#9CA3AF] text-sm w-[80%] !h-[44px] px-2 py-2 rounded-r-[6px] border-l-0 border border-gray-300 truncate overflow-hidden flex items-center">
                                            <span className="truncate">
                                                {fileName3}
                                            </span>
                                            {fileName3 !== "Maximum File 5 MB" && (
                                                <CloseOutlinedIcon
                                                    // onClick={handleRemoveFile}
                                                    onClick={() => handleRemoveFile(3)}
                                                    className="cursor-pointer ml-2 text-[#9CA3AF] z-10"
                                                    sx={{ color: '#323232', fontSize: 18 }}
                                                    style={{ fontSize: 18 }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <div className={`w-full flex items-center justify-between text-[14px] text-red-500 `}>
                                        {IsErrorChudTee == '3' && 'The file is larger than 5 MB.'}
                                    </div>
                                </div>
                            }

                            {/* File */}
                            {/* ถ้าเป็น edit view แสดงอันนี้ */}
                            {
                                // (mode == 'edit' || mode == 'view') && fileNameEditTextUrl3 !== '' &&
                                (mode == 'view') && fileNameEditTextUrl3 !== '' &&
                                <div className="grid grid-cols-2 w-full gap-4 ">
                                    <div className="col-span-2 ">
                                        <label className={`${labelClass}`}>
                                            {`File`}
                                        </label>
                                        <div className="h-[46px] text-[#464255] p-3 rounded-[6px] bg-[#F3F2F2] flex justify-between w-full">
                                            <div className="flex items-center gap-2">
                                                <InsertDriveFileOutlinedIcon sx={{ fontSize: '20px' }} /> {fileNameEditText3}
                                            </div>

                                            <button
                                                type="button"
                                                className={`flex items-center justify-center px-[2px] py-[2px] rounded-[4px] relative ${fileNameEditTextUrl3 === '' ? 'bg-[#f0f0f0] cursor-not-allowed pointer-events-none' : 'hover:bg-[#DFE4EA] hover:border hover:border-[#DFE4EA]'}`}
                                                onClick={() => downloadFile(3)}
                                                disabled={fileNameEditTextUrl3 !== '' ? false : true}
                                            >
                                                <FileDownloadIcon sx={{ fontSize: 23, color: '#1473A1', backgroundColor: '#ffffff', borderRadius: '4px', borderColor: '#DFE4EA' }} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>

                    </>
                }
            </div>


            {horizoneDivide()}


            {/* =============== ชุด 4 ===============*/}
            <div className="pb-5 pt-2">
                <div className="gap-2 w-full flex items-center">
                    <div className="grid grid-cols-2 gap-1 pt-4">
                        <label className="w-[100px] text-[#58585A]">
                            <input
                                type="radio"
                                // {...register("doc_6_perm_lod_4", { required: !watch("doc_6_perm_lod_4") ? true : false })}
                                {...register("doc_6_perm_lod_4", { required: false })}
                                value={1}
                                disabled={(mode == 'view' || isShipper || idChudTee4) ? true : false || watch('doc_6_perm_lod_3') ? false : true}
                                checked={watch("doc_6_perm_lod_4") == 1}
                                onChange={(e) => {
                                    setValue('doc_6_perm_lod_4', e.target.value)
                                }}
                                className="mr-1 accent-[#1473A1]"
                            />
                            {`เพิ่ม`}
                        </label>

                        <label className="w-[100px] text-[#58585A]">
                            <input
                                type="radio"
                                // {...register("doc_6_perm_lod_4", { required: !watch("doc_6_perm_lod_4") ? true : false })}
                                {...register("doc_6_perm_lod_4", { required: false })}
                                value={2}
                                disabled={(mode == 'view' || isShipper || idChudTee4) ? true : false || watch('doc_6_perm_lod_3') ? false : true}
                                checked={watch("doc_6_perm_lod_4") == 2}
                                onChange={(e) => {
                                    setValue('doc_6_perm_lod_4', e.target.value)
                                }}
                                className="mr-1 accent-[#1473A1]"
                            />
                            {`ลด`}
                        </label>
                    </div>

                    <div className="grid grid-cols-3 w-full gap-4">
                        <div className="flex flex-wrap flex-auto ">
                            <label className={`${labelClass}`}>{`ปริมาณก๊าซที่`}</label>
                            <SelectFormProps
                                id={'doc_6_nom_point_4'}
                                register={register("doc_6_nom_point_4", { required: false })}
                                // disabled={(mode == 'view' || mode == 'edit' || !watch('doc_6_perm_lod_4')) ? true : false}
                                // disabled={(idChudTee4 && mode == 'edit') || !watch('doc_6_perm_lod_4') ? true : false } // kom test
                                disabled={mode == 'view' || !watch('doc_6_perm_lod_4') || isShipper || idChudTee4 ? true : false} // kom test 2
                                valueWatch={watch("doc_6_nom_point_4") || ""}
                                handleChange={(e) => {
                                    setValue("doc_6_nom_point_4", e.target.value);
                                    getShipperOfNomPoint(e.target.value, 4)
                                    clearErrors('doc_6_nom_point_4')
                                    if (errors?.doc_6_nom_point_4) { clearErrors('doc_6_nom_point_4') }
                                }}
                                errors={errors?.doc_6_nom_point_4}
                                errorsText={'Select Point'}
                                options={dataNomPointForDoc6}
                                optionsKey={'id'}
                                optionsValue={'id'}
                                optionsText={'nomination_point'}
                                optionsResult={'nomination_point'}
                                placeholder={'Select Point'}
                                pathFilter={'nomination_point'}
                            />
                        </div>

                        <div className="flex flex-wrap flex-auto ">
                            <label className={`${labelClass} `}>{`คิดเป็นปริมาณ (MMSCFH)`}</label>
                            <NumericFormat
                                id="doc_6_nom_value_4"
                                placeholder="0.0000"
                                value={watch("doc_6_nom_value_4")}
                                // readOnly={(mode == 'view' || mode == 'edit' || !watch('doc_6_perm_lod_4')) ? true : false}
                                // readOnly={(idChudTee4 && mode == 'edit') || !watch('doc_6_perm_lod_4') ? true : false } // kom test
                                disabled={mode == 'view' || !watch('doc_6_perm_lod_4') || isShipper || idChudTee4 ? true : false} // kom test 2
                                {...register("doc_6_nom_value_4", { required: false })}
                                className={`${inputClass} ${errors.doc_6_nom_value_4 && "border-red-500"}  ${(mode == 'view' || isShipper) && '!bg-[#EFECEC]'} text-right`}
                                thousandSeparator={true}
                                decimalScale={4}
                                fixedDecimalScale={true}
                                allowNegative={false}
                                displayType="input"
                                onValueChange={(values) => {
                                    const { value } = values;
                                    setValue("doc_6_nom_value_4", value, { shouldValidate: true, shouldDirty: true });
                                }}
                            />
                        </div>

                        <div className="flex flex-wrap flex-auto">
                            <label className={`${labelClass}`}>{`Shipper`}</label>
                            <Select
                                id="shipper_id_4"
                                multiple
                                IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                {...register("shipper_id_4", { required: false })}
                                disabled={(mode == 'view' || !watch('doc_6_perm_lod_4') || isShipper) ? true : false}
                                value={selectedShippers4}
                                onChange={(e: any) => handleSelectChange(e, 4)}
                                className={`${selectboxClass} ${(mode == 'view') && "!bg-[#EFECEC]"}`}
                                sx={selectSx}
                                displayEmpty
                                renderValue={(selected) => {
                                    if (selected.length === 0) {
                                        return <Typography color="#9CA3AF" fontSize={14}>Select Shipper Name</Typography>;
                                    }
                                    // return selected.map((id) => dataShipper4.find((item: any) => item.id === id)?.name).join(", ");
                                    const shipper_data = dataShipper4?.filter((item: any) => !defaultShippersId4?.includes(item.id))
                                    return (
                                        <span className={`pl-[10px] text-[14px]`}>
                                            {shipper_data?.length == selectedShippers4?.length ? `Select All` : selected.map((id) => dataShipper4?.filter((item: any) => !defaultShippersId4?.includes(item.id)).find((item: any) => item.id === id)?.name).join(", ")}
                                        </span>
                                    );
                                }}
                                MenuProps={{ PaperProps: { style: { maxHeight: 48 * 4.5 + 8 } } }}
                            >
                                {userDT?.account_manage?.[0]?.user_type_id !== 3 && (
                                    <MenuItem value="all">
                                        <Checkbox checked={selectedShippers4?.length === dataShipper4?.length && dataShipper4?.length > 0} />
                                        <ListItemText
                                            primary="Select All"
                                            // sx={{ fontWeight: 'bold' }}
                                            primaryTypographyProps={{ sx: { fontWeight: 'bold' } }}
                                        />
                                    </MenuItem>
                                )}

                                {dataShipper4?.length > 0 && dataShipper4
                                    ?.filter((item: any) => !defaultShippersId4?.includes(item.id)) // เอาอันที่มีอยู่แล้วออกจาก option 
                                    ?.sort((a: any, b: any) => a.name.localeCompare(b.name)) // แล้วค่อย sort
                                    ?.map((item: any) => (
                                        <MenuItem
                                            key={item.id}
                                            value={item.id}
                                            disabled={false}
                                        >
                                            <Checkbox checked={selectedShippers4.includes(item.id)} />
                                            <ListItemText primary={item.name} />
                                        </MenuItem>
                                    ))
                                }
                            </Select>
                        </div>
                    </div>
                </div>

                {
                    watch('doc_6_perm_lod_4') && <>
                        <div className="gap-2 w-full flex items-center">

                            <div className="grid grid-cols-2 gap-1 pt-4">
                                <label className="w-[100px] text-[#58585A]"></label>
                                <label className="w-[100px] text-[#58585A]"></label>
                            </div>

                            <div className="grid grid-cols-3 w-full gap-4">
                                <div></div>
                                <div></div>
                                <div className="w-full flex flex-wrap items-end justify-end gap-4">
                                    <div className="flex flex-wrap gap-2 pt-2 mt-2 w-full max-h-[120px] overflow-y-auto">
                                        {/* ลบไม่ได้เว่ย */}
                                        {defaultShippersRender4?.map((item: any, index: number) => (
                                            <div
                                                key={`default-${index}`}
                                                className="relative w-fit h-[40px] p-2 text-[13px] bg-[#CFF2FF] border border-[#DFE4EA] rounded-[6px] text-[#58585A] break-all"
                                            >
                                                {item?.name}
                                            </div>
                                        ))}

                                        {
                                            selectedShippersRender4?.map((item: any, index: number) => (
                                                <div
                                                    key={index}
                                                    className="relative w-fit h-[40px] p-2 text-[13px] bg-[#CFF2FF] border border-[#DFE4EA] rounded-[6px] text-[#58585A] break-all"
                                                >
                                                    {item?.name}
                                                    <button
                                                        type="button"
                                                        className="absolute top-[-6px] right-[-4px] w-[15px] h-[15px] rounded-full bg-[#58585A] text-white flex justify-center items-center text-[8px]"
                                                        onClick={() => removeShipper(item?.id, 4)}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="gap-2 w-full flex items-center pt-4">

                            <div className="grid grid-cols-2 gap-1 pt-4">
                                <label className="w-[100px] text-[#58585A]"></label>
                                <label className="w-[100px] text-[#58585A]"></label>
                            </div>

                            <div className="grid grid-cols-2 w-full gap-4">
                                <div className="">
                                    <label htmlFor="doc_6_gas_command_4" className={labelClass}> {`การสั่งการ`}</label>
                                    <input
                                        id="doc_6_gas_command_4"
                                        type="text"
                                        placeholder="รายละเอียด"
                                        // readOnly={isReadOnly}
                                        // readOnly={(idChudTee4 && mode == 'edit') || !watch('doc_6_perm_lod_4') ? true : false } // kom test
                                        // readOnly={mode == 'view' || !watch('doc_6_perm_lod_4') || isShipper ? true : false} // kom test 2
                                        readOnly={mode == 'view' || !watch('doc_6_perm_lod_4') || (mode === 'edit' && watch('doc_6_perm_lod_4') && idChudTee4) || isShipper ? true : false} // kom test 4
                                        {...register("doc_6_gas_command_4", { required: false })}
                                        onChange={(e) => {
                                            if (e.target.value.length <= 255) {
                                                setValue('doc_6_gas_command_4', e.target.value);
                                            }
                                        }}
                                        maxLength={255}
                                        // className={`${inputClass} ${errors.doc_6_gas_command_4 && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'}`}
                                        className={`${inputClass} 
                                            ${mode === 'view' || (mode === 'edit' && !watch('doc_6_perm_lod_4')) || (mode === 'edit' && watch('doc_6_perm_lod_4') && idChudTee4) && '!bg-[#EFECEC]'}
                                        `}
                                    />
                                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1"><span className="text-[13px]">{watch('doc_6_gas_command_4')?.length || 0} / 255</span></div>
                                </div>

                                <div className="">
                                    <label htmlFor="doc_6_gas_more_4" className={labelClass}> {`ข้อมูลเพิ่มเติม`}</label>
                                    <input
                                        id="doc_6_gas_more_4"
                                        type="text"
                                        placeholder="รายละเอียด"
                                        // readOnly={isReadOnly}
                                        // readOnly={(idChudTee4 && mode == 'edit') || !watch('doc_6_perm_lod_4') ? true : false } // kom test
                                        readOnly={mode == 'view' || !watch('doc_6_perm_lod_4') || isShipper ? true : false} // kom test 2
                                        {...register("doc_6_gas_more_4", { required: false })}
                                        onChange={(e) => {
                                            if (e.target.value.length <= 255) {
                                                setValue('doc_6_gas_more_4', e.target.value);
                                            }
                                        }}
                                        maxLength={255}
                                        // className={`${inputClass} ${errors.doc_6_gas_more_4 && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'}`}
                                        className={`${inputClass} 
                                            ${mode === 'view' || (mode === 'edit' && !watch('doc_6_perm_lod_4')) || (mode === 'edit' && watch('doc_6_perm_lod_4') && idChudTee4) && '!bg-[#EFECEC]'}
                                        `}
                                    />
                                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1"><span className="text-[13px]">{watch('doc_6_gas_more_4')?.length || 0} / 255</span></div>
                                </div>
                            </div>
                        </div>

                        <div className="gap-2 w-full flex items-center ">
                            <div className="grid grid-cols-2 gap-1 pt-4">
                                <label className="w-[100px] text-[#58585A]"></label>
                                <label className="w-[100px] text-[#58585A]"></label>
                            </div>

                            {/* File */}
                            {/* ถ้าเป็น create แสดงอันนี้ */}
                            {
                                // userDT?.account_manage?.[0]?.user_type_id !== 3 && mode == 'create' &&
                                userDT?.account_manage?.[0]?.user_type_id !== 3 && mode !== 'view' &&
                                <div className="grid grid-cols-2 w-full">
                                    <label className={`${labelClass}`}>{`File`}</label>
                                    <div className={`flex items-center col-span-2 ${IsErrorChudTee == '4' ? 'border  border-[#ff0000] rounded-r-lg rounded-l-lg' : ''}`}>
                                        <label className={`flex bg-[#00ADEF] text-white items-center justify-center font-light rounded-l-[6px] text-[16px] text-justify w-[20%] !h-[44px] px-2 cursor-pointer`}>
                                            {`Choose File`}
                                            {isUploading4 && (
                                                <span className="ml-2 w-[14px] h-[14px] border-[2px] border-white border-t-transparent rounded-full animate-spin"></span>
                                            )}
                                            <input
                                                id="url"
                                                type="file"
                                                className="hidden"
                                                {...register('file')}
                                                // accept=".xls, .xlsx"
                                                // onChange={handleFileChange}
                                                onChange={(e) => handleFileChange(e, 4)}
                                            />
                                        </label>

                                        <div className="bg-white text-[#9CA3AF] text-sm w-[80%] !h-[44px] px-2 py-2 rounded-r-[6px] border-l-0 border border-gray-300 truncate overflow-hidden flex items-center">
                                            <span className="truncate">
                                                {fileName4}
                                            </span>
                                            {fileName4 !== "Maximum File 5 MB" && (
                                                <CloseOutlinedIcon
                                                    // onClick={handleRemoveFile}
                                                    onClick={() => handleRemoveFile(4)}
                                                    className="cursor-pointer ml-2 text-[#9CA3AF] z-10"
                                                    sx={{ color: '#323232', fontSize: 18 }}
                                                    style={{ fontSize: 18 }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <div className={`w-full flex items-center justify-between text-[14px] text-red-500 `}>
                                        {IsErrorChudTee == '4' && 'The file is larger than 5 MB.'}
                                    </div>
                                </div>
                            }

                            {/* File */}
                            {/* ถ้าเป็น edit view แสดงอันนี้ */}
                            {
                                // (mode == 'edit' || mode == 'view') && fileNameEditTextUrl4 !== '' &&
                                (mode == 'view') && fileNameEditTextUrl4 !== '' &&
                                <div className="grid grid-cols-2 w-full gap-4 ">
                                    <div className="col-span-2 ">
                                        <label className={`${labelClass}`}>
                                            {`File`}
                                        </label>
                                        <div className="h-[46px] text-[#464255] p-3 rounded-[6px] bg-[#F3F2F2] flex justify-between w-full">
                                            <div className="flex items-center gap-2">
                                                <InsertDriveFileOutlinedIcon sx={{ fontSize: '20px' }} /> {fileNameEditText4}
                                            </div>

                                            <button
                                                type="button"
                                                className={`flex items-center justify-center px-[2px] py-[2px] rounded-[4px] relative ${fileNameEditTextUrl4 === '' ? 'bg-[#f0f0f0] cursor-not-allowed pointer-events-none' : 'hover:bg-[#DFE4EA] hover:border hover:border-[#DFE4EA]'}`}
                                                onClick={() => downloadFile(4)}
                                                disabled={fileNameEditTextUrl4 !== '' ? false : true}
                                            >
                                                <FileDownloadIcon sx={{ fontSize: 23, color: '#1473A1', backgroundColor: '#ffffff', borderRadius: '4px', borderColor: '#DFE4EA' }} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>

                    </>
                }
            </div>


            {horizoneDivide()}


            {/* =============== ชุด 5 ===============*/}
            <div className="pt-2">
                <div className="gap-2 w-full flex items-center">
                    <div className="grid grid-cols-2 gap-1 pt-4">
                        <label className="w-[100px] text-[#58585A]">
                            <input
                                type="radio"
                                // {...register("doc_6_perm_lod_5", { required: !watch("doc_6_perm_lod_5") ? true : false })}
                                {...register("doc_6_perm_lod_5", { required: false })}
                                value={1}
                                disabled={(mode == 'view' || isShipper || idChudTee5) ? true : false || watch('doc_6_perm_lod_4') ? false : true}
                                checked={watch("doc_6_perm_lod_5") == 1}
                                onChange={(e) => {
                                    setValue('doc_6_perm_lod_5', e.target.value)
                                }}
                                className="mr-1 accent-[#1473A1]"
                            />
                            {`เพิ่ม`}
                        </label>

                        <label className="w-[100px] text-[#58585A]">
                            <input
                                type="radio"
                                // {...register("doc_6_perm_lod_5", { required: !watch("doc_6_perm_lod_5") ? true : false })}
                                {...register("doc_6_perm_lod_5", { required: false })}
                                value={2}
                                disabled={(mode == 'view' || isShipper || idChudTee5) ? true : false || watch('doc_6_perm_lod_4') ? false : true}
                                checked={watch("doc_6_perm_lod_5") == 2}
                                onChange={(e) => {
                                    setValue('doc_6_perm_lod_5', e.target.value)
                                }}
                                className="mr-1 accent-[#1473A1]"
                            />
                            {`ลด`}
                        </label>
                    </div>

                    <div className="grid grid-cols-3 w-full gap-4">
                        <div className="flex flex-wrap flex-auto ">
                            <label className={`${labelClass}`}>{`ปริมาณก๊าซที่`}</label>
                            <SelectFormProps
                                id={'doc_6_nom_point_5'}
                                register={register("doc_6_nom_point_5", { required: false })}
                                // disabled={(mode == 'view' || mode == 'edit' || !watch('doc_6_perm_lod_5')) ? true : false}
                                // disabled={(idChudTee5 && mode == 'edit') || !watch('doc_6_perm_lod_5') ? true : false } // kom test
                                disabled={mode == 'view' || !watch('doc_6_perm_lod_5') || isShipper || idChudTee5 ? true : false} // kom test 2
                                valueWatch={watch("doc_6_nom_point_5") || ""}
                                handleChange={(e) => {
                                    setValue("doc_6_nom_point_5", e.target.value);
                                    getShipperOfNomPoint(e.target.value, 5)
                                    clearErrors('doc_6_nom_point_5')
                                    if (errors?.doc_6_nom_point_5) { clearErrors('doc_6_nom_point_5') }
                                }}
                                errors={errors?.doc_6_nom_point_5}
                                errorsText={'Select Point'}
                                options={dataNomPointForDoc6}
                                optionsKey={'id'}
                                optionsValue={'id'}
                                optionsText={'nomination_point'}
                                optionsResult={'nomination_point'}
                                placeholder={'Select Point'}
                                pathFilter={'nomination_point'}
                            />
                        </div>

                        <div className="flex flex-wrap flex-auto ">
                            <label className={`${labelClass} `}>{`คิดเป็นปริมาณ (MMSCFH)`}</label>
                            <NumericFormat
                                id="doc_6_nom_value_5"
                                placeholder="0.0000"
                                value={watch("doc_6_nom_value_5")}
                                // readOnly={(mode == 'view' || mode == 'edit' || !watch('doc_6_perm_lod_5')) ? true : false}
                                // readOnly={(idChudTee5 && mode == 'edit') || !watch('doc_6_perm_lod_5') ? true : false } // kom test
                                disabled={mode == 'view' || !watch('doc_6_perm_lod_5') || isShipper || idChudTee5 ? true : false} // kom test 2
                                {...register("doc_6_nom_value_5", { required: false })}
                                className={`${inputClass} ${errors.doc_6_nom_value_5 && "border-red-500"}  ${(mode == 'view' || isShipper) && '!bg-[#EFECEC]'} text-right`}
                                thousandSeparator={true}
                                decimalScale={4}
                                fixedDecimalScale={true}
                                allowNegative={false}
                                displayType="input"
                                onValueChange={(values) => {
                                    const { value } = values;
                                    setValue("doc_6_nom_value_5", value, { shouldValidate: true, shouldDirty: true });
                                }}
                            />
                        </div>

                        <div className="flex flex-wrap flex-auto">
                            <label className={`${labelClass}`}>{`Shipper`}</label>
                            <Select
                                id="shipper_id_5"
                                multiple
                                IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                {...register("shipper_id_5", { required: false })}
                                disabled={(mode == 'view' || !watch('doc_6_perm_lod_5') || isShipper) ? true : false}
                                value={selectedShippers5}
                                onChange={(e: any) => handleSelectChange(e, 5)}
                                className={`${selectboxClass} ${(mode == 'view') && "!bg-[#EFECEC]"}`}
                                sx={selectSx}
                                displayEmpty
                                renderValue={(selected) => {
                                    if (selected.length === 0) {
                                        return <Typography color="#9CA3AF" fontSize={14}>Select Shipper Name</Typography>;
                                    }
                                    // return selected.map((id) => dataShipper5.find((item: any) => item.id === id)?.name).join(", ");

                                    const shipper_data = dataShipper5?.filter((item: any) => !defaultShippersId5?.includes(item.id))
                                    return (
                                        <span className={`pl-[10px] text-[14px]`}>
                                            {shipper_data?.length == selectedShippers5?.length ? `Select All` : selected.map((id) => dataShipper5?.filter((item: any) => !defaultShippersId5?.includes(item.id)).find((item: any) => item.id === id)?.name).join(", ")}
                                        </span>
                                    );

                                }}
                                MenuProps={{ PaperProps: { style: { maxHeight: 48 * 4.5 + 8 } } }}
                            >
                                {userDT?.account_manage?.[0]?.user_type_id !== 3 && (
                                    <MenuItem value="all">
                                        <Checkbox checked={selectedShippers5?.length === dataShipper5?.length && dataShipper5?.length > 0} />
                                        <ListItemText
                                            primary="Select All"
                                            // sx={{ fontWeight: 'bold' }}
                                            primaryTypographyProps={{ sx: { fontWeight: 'bold' } }}
                                        />
                                    </MenuItem>
                                )}

                                {dataShipper5?.length > 0 && dataShipper5
                                    ?.filter((item: any) => !defaultShippersId5?.includes(item.id)) // เอาอันที่มีอยู่แล้วออกจาก option 
                                    ?.sort((a: any, b: any) => a.name.localeCompare(b.name)) // แล้วค่อย sort
                                    ?.map((item: any) => (
                                        <MenuItem
                                            key={item.id}
                                            value={item.id}
                                            disabled={false}
                                        >
                                            <Checkbox checked={selectedShippers5.includes(item.id)} />
                                            <ListItemText primary={item.name} />
                                        </MenuItem>
                                    ))
                                }
                            </Select>
                        </div>
                    </div>
                </div>

                {
                    watch('doc_6_perm_lod_5') && <>
                        <div className="gap-2 w-full flex items-center">

                            <div className="grid grid-cols-2 gap-1 pt-4">
                                <label className="w-[100px] text-[#58585A]"></label>
                                <label className="w-[100px] text-[#58585A]"></label>
                            </div>

                            <div className="grid grid-cols-3 w-full gap-4">
                                <div></div>
                                <div></div>
                                <div className="w-full flex flex-wrap items-end justify-end gap-4">
                                    <div className="flex flex-wrap gap-2 pt-2 mt-2 w-full max-h-[120px] overflow-y-auto">
                                        {/* ลบไม่ได้เว่ย */}
                                        {defaultShippersRender5?.map((item: any, index: number) => (
                                            <div
                                                key={`default-${index}`}
                                                className="relative w-fit h-[40px] p-2 text-[13px] bg-[#CFF2FF] border border-[#DFE4EA] rounded-[6px] text-[#58585A] break-all"
                                            >
                                                {item?.name}
                                            </div>
                                        ))}

                                        {
                                            selectedShippersRender5?.map((item: any, index: number) => (
                                                <div
                                                    key={index}
                                                    className="relative w-fit h-[40px] p-2 text-[13px] bg-[#CFF2FF] border border-[#DFE4EA] rounded-[6px] text-[#58585A] break-all"
                                                >
                                                    {item?.name}
                                                    <button
                                                        type="button"
                                                        className="absolute top-[-6px] right-[-4px] w-[15px] h-[15px] rounded-full bg-[#58585A] text-white flex justify-center items-center text-[8px]"
                                                        onClick={() => removeShipper(item?.id, 5)}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="gap-2 w-full flex items-center pt-4">

                            <div className="grid grid-cols-2 gap-1 pt-4">
                                <label className="w-[100px] text-[#58585A]"></label>
                                <label className="w-[100px] text-[#58585A]"></label>
                            </div>

                            <div className="grid grid-cols-2 w-full gap-4">
                                <div className="">
                                    <label htmlFor="doc_6_gas_command_5" className={labelClass}> {`การสั่งการ`}</label>
                                    <input
                                        id="doc_6_gas_command_5"
                                        type="text"
                                        placeholder="รายละเอียด"
                                        // readOnly={isReadOnly}
                                        // readOnly={(idChudTee5 && mode == 'edit') || !watch('doc_6_perm_lod_5') ? true : false } // kom test
                                        // readOnly={mode == 'view' || !watch('doc_6_perm_lod_5') ? true : false} // kom test 2
                                        readOnly={mode == 'view' || !watch('doc_6_perm_lod_5') || (mode === 'edit' && watch('doc_6_perm_lod_5') && idChudTee5) ? true : false} // kom test 3
                                        {...register("doc_6_gas_command_5", { required: false })}
                                        onChange={(e) => {
                                            if (e.target.value.length <= 255) {
                                                setValue('doc_6_gas_command_5', e.target.value);
                                            }
                                        }}
                                        maxLength={255}
                                        // className={`${inputClass} ${errors.doc_6_gas_command_5 && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'}`}
                                        className={`${inputClass} 
                                            ${mode === 'view' || (mode === 'edit' && !watch('doc_6_perm_lod_5')) || (mode === 'edit' && watch('doc_6_perm_lod_5') && idChudTee5) && '!bg-[#EFECEC]'}
                                        `}
                                    />
                                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1"><span className="text-[13px]">{watch('doc_6_gas_command_5')?.length || 0} / 255</span></div>
                                </div>

                                <div className="">
                                    <label htmlFor="doc_6_gas_more_5" className={labelClass}> {`ข้อมูลเพิ่มเติม`}</label>
                                    <input
                                        id="doc_6_gas_more_5"
                                        type="text"
                                        placeholder="รายละเอียด"
                                        // readOnly={isReadOnly}
                                        // readOnly={(idChudTee5 && mode == 'edit') || !watch('doc_6_perm_lod_5') ? true : false } // kom test
                                        readOnly={mode == 'view' || !watch('doc_6_perm_lod_5') ? true : false} // kom test 2
                                        {...register("doc_6_gas_more_5", { required: false })}
                                        onChange={(e) => {
                                            if (e.target.value.length <= 255) {
                                                setValue('doc_6_gas_more_5', e.target.value);
                                            }
                                        }}
                                        maxLength={255}
                                        // className={`${inputClass} ${errors.doc_6_gas_more_5 && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'}`}
                                        className={`${inputClass} 
                                            ${mode === 'view' || (mode === 'edit' && !watch('doc_6_perm_lod_5')) || (mode === 'edit' && watch('doc_6_perm_lod_5') && idChudTee5) && '!bg-[#EFECEC]'}
                                        `}
                                    />
                                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1"><span className="text-[13px]">{watch('doc_6_gas_more_5')?.length || 0} / 255</span></div>
                                </div>
                            </div>
                        </div>

                        <div className="gap-2 w-full flex items-center ">
                            <div className="grid grid-cols-2 gap-1 pt-4">
                                <label className="w-[100px] text-[#58585A]"></label>
                                <label className="w-[100px] text-[#58585A]"></label>
                            </div>

                            {/* File */}
                            {/* ถ้าเป็น create แสดงอันนี้ */}
                            {
                                // userDT?.account_manage?.[0]?.user_type_id !== 3 && mode == 'create' &&
                                userDT?.account_manage?.[0]?.user_type_id !== 3 && mode !== 'view' &&
                                <div className="grid grid-cols-2 w-full">
                                    <label className={`${labelClass}`}>{`File`}</label>
                                    <div className={`flex items-center col-span-2 ${IsErrorChudTee == '5' ? 'border  border-[#ff0000] rounded-r-lg rounded-l-lg' : ''}`}>
                                        <label className={`flex bg-[#00ADEF] text-white items-center justify-center font-light rounded-l-[6px] text-[16px] text-justify w-[20%] !h-[44px] px-2 cursor-pointer`}>
                                            {`Choose File`}
                                            {isUploading5 && (
                                                <span className="ml-2 w-[14px] h-[14px] border-[2px] border-white border-t-transparent rounded-full animate-spin"></span>
                                            )}
                                            <input
                                                id="url"
                                                type="file"
                                                className="hidden"
                                                {...register('file')}
                                                // accept=".xls, .xlsx"
                                                // onChange={handleFileChange}
                                                onChange={(e) => handleFileChange(e, 5)}
                                            />
                                        </label>

                                        <div className="bg-white text-[#9CA3AF] text-sm w-[80%] !h-[44px] px-2 py-2 rounded-r-[6px] border-l-0 border border-gray-300 truncate overflow-hidden flex items-center">
                                            <span className="truncate">
                                                {fileName5}
                                            </span>
                                            {fileName5 !== "Maximum File 5 MB" && (
                                                <CloseOutlinedIcon
                                                    // onClick={handleRemoveFile}
                                                    onClick={() => handleRemoveFile(5)}
                                                    className="cursor-pointer ml-2 text-[#9CA3AF] z-10"
                                                    sx={{ color: '#323232', fontSize: 18 }}
                                                    style={{ fontSize: 18 }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <div className={`w-full flex items-center justify-between text-[14px] text-red-500 `}>
                                        {IsErrorChudTee == '5' && 'The file is larger than 5 MB.'}
                                    </div>
                                </div>
                            }

                            {/* File */}
                            {/* ถ้าเป็น edit view แสดงอันนี้ */}
                            {
                                // (mode == 'edit' || mode == 'view') && fileNameEditTextUrl5 !== '' &&
                                (mode == 'view') && fileNameEditTextUrl5 !== '' &&
                                <div className="grid grid-cols-2 w-full gap-4 ">
                                    <div className="col-span-2 ">
                                        <label className={`${labelClass}`}>
                                            {`File`}
                                        </label>
                                        <div className="h-[46px] text-[#464255] p-3 rounded-[6px] bg-[#F3F2F2] flex justify-between w-full">
                                            <div className="flex items-center gap-2">
                                                <InsertDriveFileOutlinedIcon sx={{ fontSize: '20px' }} /> {fileNameEditText5}
                                            </div>

                                            <button
                                                type="button"
                                                className={`flex items-center justify-center px-[2px] py-[2px] rounded-[4px] relative ${fileNameEditTextUrl5 === '' ? 'bg-[#f0f0f0] cursor-not-allowed pointer-events-none' : 'hover:bg-[#DFE4EA] hover:border hover:border-[#DFE4EA]'}`}
                                                onClick={() => downloadFile(5)}
                                                disabled={fileNameEditTextUrl5 !== '' ? false : true}
                                            >
                                                <FileDownloadIcon sx={{ fontSize: 23, color: '#1473A1', backgroundColor: '#ffffff', borderRadius: '4px', borderColor: '#DFE4EA' }} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>

                    </>
                }
            </div>













            {/* =================================== หมายเหตุ ======================================== */}
            <div className="grid grid-cols-2 gap-4 pt-20">

                {/* หมายเหตุ */}
                <div className="w-full col-span-2">
                    <label className={`${labelClass}`}>{`หมายเหตุ`}</label>
                    <TextField
                        {...register("doc_6_input_note")}
                        value={watch("doc_6_input_note") || ""}
                        label=""
                        multiline
                        onChange={(e) => {
                            if (e.target.value.length <= 500) {
                                setValue("doc_6_input_note", e.target.value);
                            }
                        }}
                        placeholder="ระบุรายละเอียด"
                        disabled={mode == 'view' || mode == 'edit'}
                        rows={2}
                        sx={textFieldSx}
                        className={`${mode == 'view' && 'bg-[#EFECEC] rounded-[8px]'}`}
                        InputProps={inputPropsTextField}
                        fullWidth
                    />
                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                        <span className="text-[13px]">
                            {watch("doc_6_input_note")?.length || 0} / 500
                        </span>
                    </div>
                </div>
            </div>

            {/* เลือก Email Group */}
            {
                // userDT?.account_manage?.[0]?.user_type_id !== 3 && (mode == 'create' || mode == 'edit') &&
                userDT?.account_manage?.[0]?.user_type_id !== 3 && // History > Detail > ส่วนของ Email Group กับ CC Mail หายไป https://app.clickup.com/t/86eum0p8x
                <div className="grid grid-cols-2 gap-4 pt-2">

                    <div className="w-full col-span-2">
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
                                        <ListItemText primary={item.name} />
                                    </MenuItem>
                                ))}
                        </Select>

                        {/* <div className="flex flex-wrap gap-3 pt-4 w-full h-[100px] max-h-[120px] overflow-y-auto"> */}
                        <div className="flex flex-wrap gap-2 pt-2 mt-2 w-full max-h-[120px] overflow-y-auto">
                            {/* ลบไม่ได้เว่ย */}
                            {defaultEmailGroupRender?.map((item: any, index: number) => (
                                <div
                                    key={`default-${index}`}
                                    className="relative w-fit h-[40px] p-2 text-[13px] bg-[#F3F2F2] border border-[#DFE4EA] rounded-[6px] text-[#58585A] break-all"
                                >
                                    {item?.name}
                                </div>
                            ))}

                            {
                                selectedEmailGroupRender?.map((item: any, index: number) => (
                                    <div
                                        key={index}
                                        className="relative w-fit h-[40px] p-2 text-[13px] bg-[#F3F2F2] border border-[#DFE4EA] rounded-[6px] text-[#58585A] break-all"
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
                // userDT?.account_manage?.[0]?.user_type_id !== 3 && (mode == 'create' || mode == 'edit') &&
                userDT?.account_manage?.[0]?.user_type_id !== 3 && // History > Detail > ส่วนของ Email Group กับ CC Mail หายไป https://app.clickup.com/t/86eum0p8x
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
                                        className="relative w-fit h-[40px] p-2 text-[13px] bg-[#FFFFFF] border border-[#DFE4EA] rounded-[6px] text-[#58585A] break-all"
                                    >
                                        {item}
                                    </div>
                                ))
                            }

                            {
                                emailGroup && emailGroup?.map((item: any, index: number) => (
                                    <div
                                        key={index}
                                        className="relative w-fit h-[40px] p-2 text-[13px] bg-[#FFFFFF] border border-[#DFE4EA] rounded-[6px] text-[#58585A] break-all"
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
                userDT?.account_manage?.[0]?.user_type_id !== 3 && (mode == 'edit' || mode == 'view') && <div className="pt-4"><TableDocument6 tableData={dataTable} dataOpenDocument={dataOpenDocument} /></div>
            }


            {(() => {
                const shouldHideButton = userDT?.account_manage?.[0]?.user_type_id === 3 && (dataOpenDocument?.event_doc_status_id === 1 || dataOpenDocument?.event_doc_status_id === 5);
                return (
                    <div className="flex justify-end pt-8">
                        {mode !== 'view' && !shouldHideButton && (
                            <button
                                type="submit"
                                className="w-[167px] h-[44px] font-semibold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                disabled={false}
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

export default FormDocument6;