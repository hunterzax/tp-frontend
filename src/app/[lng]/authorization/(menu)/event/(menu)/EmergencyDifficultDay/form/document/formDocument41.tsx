"use client";
import { useEffect, useState } from "react";
import { cutUploadFileName, formatFormDate } from '@/utils/generalFormatter';
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
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import TableDocument41 from "../tableDocument41";
import { mock_emergency_type } from "../mockData";
// import TableDocument7 from "../tableDocument7";

type FormExampleProps = {
    data?: Partial<any>;
    mode?: any;
    userDT?: any;
    shipperData?: any;
    ofoTypeData?: any;
    emailGroupForEventData?: any;
    dataNomPointForDoc7?: any;
    refDocData?: any;
    setIsOpenDocument?: any;
    dataOpenDocument?: any;
    modeOpenDocument?: any;
    maiHedDocSeeLasted?: any;
    onSubmit: SubmitHandler<any>;
};

const inputClass = "text-[14px] block md:w-full p-2 ps-5 focus:!ps-5 hover:!ps-5 pe-10 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]"
const labelClass = "block mb-2 text-[14px] text-[#464255] font-semibold"
const textErrorClass = "text-red-500 text-[14px] "
const selectboxClass = "flex w-full h-[44px] p-1 ps-1 pe-2 !rounded-lg text-gray-900 block outline-none";

// key ใน DB ตามฟอร์ม
// "generate": false, // true gen , false default
// "id_documents": null, // ตอนสร้าง null | ถ้าใส่ id_runnumber ใส่มาด้วย | ตอน edit version ส่งมาด้วย | (ถ้าตอน status generate ส่ง id มาด้วย )
// "id_runnumber": null, // ใส่มาตอน edit version 
// "longdo_dict": "ส่วนบริการสัญญาระบบท่อส่งก๊าซ (Transmission Contracts & Regulatory Management Division โทร 025372000,35063)", //สำเนา

// "event_date": "2025-08-01", // วันที่ออกเอกสาร
// "doc_7_input_date_time_of_the_incident": "วันที่ 9 มิ.ย. 2567 เวลา 17.20 และวันที่ 10 มิ.ย. 2567 เวลา 00.36 น.", //วัน/เวลาที่เกิดเหตุ
// "doc_7_input_detail_incident": "เนื่องด้วยในวันที่ 9/5/2567 เวลา 14:10 น. เกิดเหตุการณ์ไม่สมดุลอย่างรุนแรง / ภาวาวะฉุกเฉิน ซึ่งมีรายละเอียดดังนี้ \nรายละเอียดของเหตุการณ์ และผลกระทบต่อระบบส่งก๊าซ: เกิดเหตุไฟไหม้ถังเก็บสารเคมีของ Maptaphut Tank Terminalส่งผลให้หน่วยงาน ปฝ. อพยพ และ LNG ลดการส่งก๊าซ", //รายละเอียดของเหตุการณ์ และผลกระทบต่อระบบส่งก๊าซ
// "doc_7_input_time_event_start_date": "2025-03-01", //วันที่เริ่มดำเนินการ เริ่ม วัน
// "doc_7_input_time_event_start_time": "10:00", //วันที่เริ่มดำเนินการ เริ่ม เวลา
// "doc_7_input_time_event_end_date": "2025-03-01", //วันที่เริ่มดำเนินการ ถึง วัน
// "doc_7_input_time_event_end_time": "15:00", //วันที่เริ่มดำเนินการ ถึง เวลา
// "doc_7_input_note": "กรณีพื้นที่เกิดเหตุเป็นพื้นที่ให้บริการตาม TSO Code จะอ้างอิงการสั่งการจาก TSO Code ข้อที่ 8.10.2.6 เรื่องขั้นตอนการปฏิบัติงานในกรณีเหตุการณ์ไม่สมดุลอย่างรุนแรง และ 8.10.2.7 ขั้นตอนการด าเนินการในกรณีภาวะฉุกเฉิน", //หมายเหตุ
// "doc_7_input_ref_1_id": 1, // อ้างอิง อันแรก ติ้กใส่ 1 ไม่ติ๊ก null
// "doc_7_input_ref_2_id": null, // อ้างอิง อันแรก ติ้กใส่ 2 ไม่ติ๊ก null

// "doc_7_input_order_ir_id": 1, // เพิ่ม 1 , ลด 2, อื่นๆ ใส่ null 
// "doc_7_input_order_io_id": 3, // เข้า 3 , ออก 4, อื่นๆ ใส่ null 
// "doc_7_input_order_other_id": null, // อื่นๆ 5, ถ้าเลือก doc_4_input_order_ir_id, doc_4_input_order_io_id ใส่ null 
// "doc_7_input_order_other_value": null, // อื่นๆ ให้ใส่, นอกเหนือ null 

// "event_doc_ofo_type_id": 1, //ประเภท 
// "event_doc_ofo_gas_tranmiss_id": 1, //ระบบส่งก๊าซ 
// "event_doc_ofo_gas_tranmiss_other": null, // event_doc_ofo_gas_tranmiss_other 4 ใส่ด้วย

const FormDocument41: React.FC<FormExampleProps> = ({ mode, data, onSubmit, setIsOpenDocument, dataOpenDocument, modeOpenDocument, userDT, shipperData, ofoTypeData, emailGroupForEventData, dataNomPointForDoc7, refDocData, maiHedDocSeeLasted }) => {
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
    const [idRefDocRunnumber, setIDRefDocRunnumber] = useState('');
    const [documentId, setDocumentId] = useState(''); // ID ของ Document 2
    // const isReadOnly = mode === "view" || mode == 'edit';
    const isReadOnly = mode === "view";
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
    // เอาไว้ set onload และตอน reset
    const setDataChudTee = () => {
        // set ชื่อ shipper กลับที่เดิม
        const groupIds1 = dataOpenDocument?.event_doc_gas_shipper_41?.[0]?.event_doc_gas_shipper_match_41?.map((item: any) => item?.event_document_emer?.group_id);
        const groupIds2 = dataOpenDocument?.event_doc_gas_shipper_41?.[1]?.event_doc_gas_shipper_match_41?.map((item: any) => item?.event_document_emer?.group_id);
        const groupIds3 = dataOpenDocument?.event_doc_gas_shipper_41?.[2]?.event_doc_gas_shipper_match_41?.map((item: any) => item?.event_document_emer?.group_id);
        const groupIds4 = dataOpenDocument?.event_doc_gas_shipper_41?.[3]?.event_doc_gas_shipper_match_41?.map((item: any) => item?.event_document_emer?.group_id);
        const groupIds5 = dataOpenDocument?.event_doc_gas_shipper_41?.[4]?.event_doc_gas_shipper_match_41?.map((item: any) => item?.event_document_emer?.group_id);

        // ชุดที่ 1
        if (groupIds1) {
            // ชุด 1 มีของ
            // getShipperOfNomPoint(dataOpenDocument?.event_doc_gas_shipper_ofo?.[0].nom_point, 1)

            // let entry_exit = dataOpenDocument?.event_doc_gas_shipper_ofo?.[0].io == 3 ? 1 : 2
            // const filtered_1 = dataNomPointForDoc7?.filter((item: any) => item.entry_exit_id == entry_exit)
            // setDataAreaChud1(filtered_1)

            // const filtered_2 = filtered_1?.find((item: any) => item.id == dataOpenDocument?.event_doc_gas_shipper_ofo?.[0].area_id)
            // setDataNomPoint1(filtered_2?.nom)
            // const find_shipper_from_nom_point_chud_tee_1 = filtered_2?.nom?.find((item: any) => item.id == dataOpenDocument?.event_doc_gas_shipper_ofo?.[0].nom_point)

            const filteredShippers1 = dataShipperMaster?.filter((item: any) => groupIds1?.includes(item.id));
            const defaultIds1 = filteredShippers1?.map((s: any) => s.id); // เอา id 
            setDefaultShippersRender1(filteredShippers1); // ลบไม่ได้
            setDefaultShippersId1(defaultIds1) // ลบไม่ได้

            {/* 
                key ในแต่ละชุด

                // ชุด 1 
                doc_41_perm_lod_1 : เพิ่ม = 1, ลด = 2, อื่น ๆ = 5
                doc_41_jud_soong_kaw_ook_1 : เข้า = 3, ออก = 4
                doc_41_value_1  : ปริมาณ
                doc_41_more_1  : เพิ่มเติม
                shipper_id_1 : shipper


                // "id": null, // ต้องใส่ ตอนเพิ่มครั้งแรกยังไม่มีจะเป็น null
                // "ir": 1, // 1 เพิ่ม, 2 ลด
                // "io": 3, // 3 จุดส่งเข้า, 4 จุดส่งออก
                // "iother": 5, // 5 อื่นๆ ถ้าเลือก ir รน 1 - 4 ให้ null
            */}

            setIdChudTee1(dataOpenDocument?.event_doc_gas_shipper_41?.[0]?.id)
            setValue('doc_41_perm_lod_1', dataOpenDocument?.event_doc_gas_shipper_41?.[0].ir ? dataOpenDocument?.event_doc_gas_shipper_41?.[0].ir : 3) // ถ้่า ir เป็น null ให้ใส่ doc_41_perm_lod_1 == 3 (อื่น ๆ)
            setValue('doc_41_jud_soong_kaw_ook_1', dataOpenDocument?.event_doc_gas_shipper_41?.[0].io)
            setValue('doc_41_value_1', dataOpenDocument?.event_doc_gas_shipper_41?.[0].value)
            setValue('doc_41_more_1', dataOpenDocument?.event_doc_gas_shipper_41?.[0].more)

            setFileNameEditText1(dataOpenDocument?.event_doc_gas_shipper_41?.[0].event_doc_gas_shipper_file_41?.length > 0 ? cutUploadFileName(dataOpenDocument?.event_doc_gas_shipper_41?.[0].event_doc_gas_shipper_file_41[0]?.url) : '')
            setFileNameEditUrl1(dataOpenDocument?.event_doc_gas_shipper_41?.[0].event_doc_gas_shipper_file_41?.length > 0 ? dataOpenDocument?.event_doc_gas_shipper_41?.[0].event_doc_gas_shipper_file_41[0]?.url : '')
        }

        // ชุดที่ 2
        if (groupIds2) {
            // ชุด 2 มีของ

            const filteredShippers2 = dataShipperMaster?.filter((item: any) => groupIds2?.includes(item.id));
            const defaultIds2 = filteredShippers2?.map((s: any) => s.id); // เอา id 
            setDefaultShippersRender2(filteredShippers2); // ลบไม่ได้
            setDefaultShippersId2(defaultIds2) // ลบไม่ได้

            setIdChudTee2(dataOpenDocument?.event_doc_gas_shipper_41?.[1]?.id)
            setValue('doc_41_perm_lod_2', dataOpenDocument?.event_doc_gas_shipper_41?.[1].ir ? dataOpenDocument?.event_doc_gas_shipper_41?.[1].ir : 3) // ถ้่า ir เป็น null ให้ใส่ doc_41_perm_lod_2 == 3 (อื่น ๆ)
            setValue('doc_41_jud_soong_kaw_ook_2', dataOpenDocument?.event_doc_gas_shipper_41?.[1].io)
            setValue('doc_41_value_2', dataOpenDocument?.event_doc_gas_shipper_41?.[1].value)
            setValue('doc_41_more_2', dataOpenDocument?.event_doc_gas_shipper_41?.[1].more)

            setFileNameEditText2(dataOpenDocument?.event_doc_gas_shipper_41?.[1].event_doc_gas_shipper_file_41?.length > 0 ? cutUploadFileName(dataOpenDocument?.event_doc_gas_shipper_41?.[1].event_doc_gas_shipper_file_41[0]?.url) : '')
            setFileNameEditUrl2(dataOpenDocument?.event_doc_gas_shipper_41?.[1].event_doc_gas_shipper_file_41?.length > 0 ? dataOpenDocument?.event_doc_gas_shipper_41?.[1].event_doc_gas_shipper_file_41[0]?.url : '')
        }

        // ชุดที่ 3
        if (groupIds3) {
            // ชุด 3 มีของ

            const filteredShippers3 = dataShipperMaster?.filter((item: any) => groupIds3?.includes(item.id));
            const defaultIds3 = filteredShippers3?.map((s: any) => s.id); // เอา id 
            setDefaultShippersRender3(filteredShippers3); // ลบไม่ได้
            setDefaultShippersId3(defaultIds3) // ลบไม่ได้

            setIdChudTee3(dataOpenDocument?.event_doc_gas_shipper_41?.[2]?.id)
            setValue('doc_41_perm_lod_3', dataOpenDocument?.event_doc_gas_shipper_41?.[2].ir ? dataOpenDocument?.event_doc_gas_shipper_41?.[2].ir : 3) // ถ้่า ir เป็น null ให้ใส่ doc_41_perm_lod_3 == 3 (อื่น ๆ)
            setValue('doc_41_jud_soong_kaw_ook_3', dataOpenDocument?.event_doc_gas_shipper_41?.[2].io)
            setValue('doc_41_value_3', dataOpenDocument?.event_doc_gas_shipper_41?.[2].value)
            setValue('doc_41_more_3', dataOpenDocument?.event_doc_gas_shipper_41?.[2].more)

            setFileNameEditText3(dataOpenDocument?.event_doc_gas_shipper_41?.[2].event_doc_gas_shipper_file_41?.length > 0 ? cutUploadFileName(dataOpenDocument?.event_doc_gas_shipper_41?.[2].event_doc_gas_shipper_file_41[0]?.url) : '')
            setFileNameEditUrl3(dataOpenDocument?.event_doc_gas_shipper_41?.[2].event_doc_gas_shipper_file_41?.length > 0 ? dataOpenDocument?.event_doc_gas_shipper_41?.[2].event_doc_gas_shipper_file_41[0]?.url : '')
        }

        // ชุดที่ 4
        if (groupIds4) {
            // ชุด 4 มีของ

            const filteredShippers4 = dataShipperMaster?.filter((item: any) => groupIds4?.includes(item.id));
            const defaultIds4 = filteredShippers4?.map((s: any) => s.id); // เอา id 
            setDefaultShippersRender4(filteredShippers4); // ลบไม่ได้
            setDefaultShippersId4(defaultIds4) // ลบไม่ได้

            setIdChudTee4(dataOpenDocument?.event_doc_gas_shipper_41?.[3]?.id)
            setValue('doc_41_perm_lod_4', dataOpenDocument?.event_doc_gas_shipper_41?.[3].ir ? dataOpenDocument?.event_doc_gas_shipper_41?.[3].ir : 3) // ถ้่า ir เป็น null ให้ใส่ doc_41_perm_lod_4 == 3 (อื่น ๆ)
            setValue('doc_41_jud_soong_kaw_ook_4', dataOpenDocument?.event_doc_gas_shipper_41?.[3].io)
            setValue('doc_41_value_4', dataOpenDocument?.event_doc_gas_shipper_41?.[3].value)
            setValue('doc_41_more_4', dataOpenDocument?.event_doc_gas_shipper_41?.[3].more)

            setFileNameEditText4(dataOpenDocument?.event_doc_gas_shipper_41?.[3].event_doc_gas_shipper_file_41?.length > 0 ? cutUploadFileName(dataOpenDocument?.event_doc_gas_shipper_41?.[3].event_doc_gas_shipper_file_41[0]?.url) : '')
            setFileNameEditUrl4(dataOpenDocument?.event_doc_gas_shipper_41?.[3].event_doc_gas_shipper_file_41?.length > 0 ? dataOpenDocument?.event_doc_gas_shipper_41?.[3].event_doc_gas_shipper_file_41[0]?.url : '')
        }

        // ชุดที่ 5
        if (groupIds5) {
            // ชุด 5 มีของ

            const filteredShippers5 = dataShipperMaster?.filter((item: any) => groupIds5?.includes(item.id));
            const defaultIds5 = filteredShippers5?.map((s: any) => s.id); // เอา id 
            setDefaultShippersRender5(filteredShippers5); // ลบไม่ได้
            setDefaultShippersId5(defaultIds5) // ลบไม่ได้

            setIdChudTee5(dataOpenDocument?.event_doc_gas_shipper_41?.[4]?.id)
            setValue('doc_41_perm_lod_5', dataOpenDocument?.event_doc_gas_shipper_41?.[4].ir ? dataOpenDocument?.event_doc_gas_shipper_41?.[4].ir : 3) // ถ้่า ir เป็น null ให้ใส่ doc_41_perm_lod_5 == 3 (อื่น ๆ)
            setValue('doc_41_jud_soong_kaw_ook_5', dataOpenDocument?.event_doc_gas_shipper_41?.[4].io)
            setValue('doc_41_value_5', dataOpenDocument?.event_doc_gas_shipper_41?.[4].value)
            setValue('doc_41_more_5', dataOpenDocument?.event_doc_gas_shipper_41?.[4].more)

            setFileNameEditText5(dataOpenDocument?.event_doc_gas_shipper_41?.[4].event_doc_gas_shipper_file_41?.length > 0 ? cutUploadFileName(dataOpenDocument?.event_doc_gas_shipper_41?.[4].event_doc_gas_shipper_file_41[0]?.url) : '')
            setFileNameEditUrl5(dataOpenDocument?.event_doc_gas_shipper_41?.[4].event_doc_gas_shipper_file_41?.length > 0 ? dataOpenDocument?.event_doc_gas_shipper_41?.[4].event_doc_gas_shipper_file_41[0]?.url : '')
        }
    }

    // #region SET RESET for Shipper
    const setDataChudTeeForShipper = () => {
        // set ชื่อ shipper กลับที่เดิม
        const groupIds1 = dataOpenDocument?.event_doc_gas_shipper_match_41?.[0]?.event_document_emer?.group_id;
        const groupIds2 = dataOpenDocument?.event_doc_gas_shipper_match_41?.[1]?.event_document_emer?.group_id;
        const groupIds3 = dataOpenDocument?.event_doc_gas_shipper_match_41?.[2]?.event_document_emer?.group_id;
        const groupIds4 = dataOpenDocument?.event_doc_gas_shipper_match_41?.[3]?.event_document_emer?.group_id;
        const groupIds5 = dataOpenDocument?.event_doc_gas_shipper_match_41?.[4]?.event_document_emer?.group_id;

        // ชุดที่ 1
        if (groupIds1) {
            // ชุด 1 มีของ shipper

            const filteredShippers = dataShipperMaster?.filter((item: any) => groupIds1 == item.id);
            const defaultIds = filteredShippers?.map((s: any) => s.id); // เอา id 
            setDefaultShippersRender1(filteredShippers); // ลบไม่ได้
            setDefaultShippersId1(defaultIds) // ลบไม่ได้

            setIdChudTee1(dataOpenDocument?.event_doc_gas_shipper_match_41?.[0]?.event_doc_gas_shipper_41?.id)
            setValue('doc_41_perm_lod_1', dataOpenDocument?.event_doc_gas_shipper_match_41?.[0]?.event_doc_gas_shipper_41?.ir ? dataOpenDocument?.event_doc_gas_shipper_match_41?.[0]?.event_doc_gas_shipper_41?.ir : 3) // ถ้่า ir เป็น null ให้ใส่ doc_41_perm_lod_1 == 3 (อื่น ๆ)
            setValue('doc_41_jud_soong_kaw_ook_1', dataOpenDocument?.event_doc_gas_shipper_match_41?.[0]?.event_doc_gas_shipper_41?.io)
            setValue('doc_41_value_1', dataOpenDocument?.event_doc_gas_shipper_match_41?.[0]?.event_doc_gas_shipper_41?.value)
            setValue('doc_41_more_1', dataOpenDocument?.event_doc_gas_shipper_match_41?.[0]?.event_doc_gas_shipper_41?.more)

            setFileNameEditText1(dataOpenDocument?.event_doc_gas_shipper_match_41?.[0]?.event_doc_gas_shipper_41?.event_doc_gas_shipper_file?.length > 0 ? cutUploadFileName(dataOpenDocument?.event_doc_gas_shipper_match_41?.[0]?.event_doc_gas_shipper_41?.event_doc_gas_shipper_file[0]?.url) : '')
            setFileNameEditUrl1(dataOpenDocument?.event_doc_gas_shipper_match_41?.[0]?.event_doc_gas_shipper_41?.event_doc_gas_shipper_file?.length > 0 ? dataOpenDocument?.event_doc_gas_shipper_match_41?.[0]?.event_doc_gas_shipper_41?.event_doc_gas_shipper_file[0]?.url : '')

        }

        // ชุดที่ 2
        if (groupIds2) {
            // ชุด 2 มีของ shipper

            const filteredShippers2 = dataShipperMaster?.filter((item: any) => groupIds2 == item.id);
            const defaultIds2 = filteredShippers2?.map((s: any) => s.id); // เอา id 
            setDefaultShippersRender2(filteredShippers2); // ลบไม่ได้
            setDefaultShippersId2(defaultIds2) // ลบไม่ได้

            setIdChudTee2(dataOpenDocument?.event_doc_gas_shipper_match_41?.[1]?.event_doc_gas_shipper_41?.id)
            setValue('doc_41_perm_lod_2', dataOpenDocument?.event_doc_gas_shipper_match_41?.[1]?.event_doc_gas_shipper_41?.ir ? dataOpenDocument?.event_doc_gas_shipper_match_41?.[1]?.event_doc_gas_shipper_41?.ir : 3) // ถ้่า ir เป็น null ให้ใส่ doc_41_perm_lod_2 == 3 (อื่น ๆ)
            setValue('doc_41_jud_soong_kaw_ook_2', dataOpenDocument?.event_doc_gas_shipper_match_41?.[1]?.event_doc_gas_shipper_41?.io)
            setValue('doc_41_value_2', dataOpenDocument?.event_doc_gas_shipper_match_41?.[1]?.event_doc_gas_shipper_41?.value)
            setValue('doc_41_more_2', dataOpenDocument?.event_doc_gas_shipper_match_41?.[1]?.event_doc_gas_shipper_41?.more)

            setFileNameEditText2(dataOpenDocument?.event_doc_gas_shipper_match_41?.[1]?.event_doc_gas_shipper_41?.event_doc_gas_shipper_file?.length > 0 ? cutUploadFileName(dataOpenDocument?.event_doc_gas_shipper_match_41?.[1]?.event_doc_gas_shipper_41?.event_doc_gas_shipper_file[0]?.url) : '')
            setFileNameEditUrl2(dataOpenDocument?.event_doc_gas_shipper_match_41?.[1]?.event_doc_gas_shipper_41?.event_doc_gas_shipper_file?.length > 0 ? dataOpenDocument?.event_doc_gas_shipper_match_41?.[1]?.event_doc_gas_shipper_41?.event_doc_gas_shipper_file[0]?.url : '')

        }

        // ชุดที่ 3
        if (groupIds3) {
            // ชุด 3 มีของ shipper
            // const find_shipper_from_nom_point_chud_tee_3 = getShipperOfNomPointForOnload(dataOpenDocument?.event_doc_gas_shipper_match[2]?.event_doc_gas_shipper?.nom_point, 3)
            const filteredShippers3 = dataShipperMaster?.filter((item: any) => groupIds3 == item.id);
            const defaultIds3 = filteredShippers3?.map((s: any) => s.id); // เอา id 
            setDefaultShippersRender3(filteredShippers3); // ลบไม่ได้
            setDefaultShippersId3(defaultIds3) // ลบไม่ได้

            setIdChudTee3(dataOpenDocument?.event_doc_gas_shipper_match_41?.[2]?.event_doc_gas_shipper_41?.id)
            setValue('doc_41_perm_lod_3', dataOpenDocument?.event_doc_gas_shipper_match_41?.[2]?.event_doc_gas_shipper_41?.ir ? dataOpenDocument?.event_doc_gas_shipper_match_41?.[2]?.event_doc_gas_shipper_41?.ir : 3) // ถ้่า ir เป็น null ให้ใส่ doc_41_perm_lod_3 == 3 (อื่น ๆ)
            setValue('doc_41_jud_soong_kaw_ook_3', dataOpenDocument?.event_doc_gas_shipper_match_41?.[2]?.event_doc_gas_shipper_41?.io)
            setValue('doc_41_value_3', dataOpenDocument?.event_doc_gas_shipper_match_41?.[2]?.event_doc_gas_shipper_41?.value)
            setValue('doc_41_more_3', dataOpenDocument?.event_doc_gas_shipper_match_41?.[2]?.event_doc_gas_shipper_41?.more)

            setFileNameEditText3(dataOpenDocument?.event_doc_gas_shipper_match_41?.[2]?.event_doc_gas_shipper_41?.event_doc_gas_shipper_file?.length > 0 ? cutUploadFileName(dataOpenDocument?.event_doc_gas_shipper_match_41?.[2]?.event_doc_gas_shipper_41?.event_doc_gas_shipper_file[0]?.url) : '')
            setFileNameEditUrl3(dataOpenDocument?.event_doc_gas_shipper_match_41?.[2]?.event_doc_gas_shipper_41?.event_doc_gas_shipper_file?.length > 0 ? dataOpenDocument?.event_doc_gas_shipper_match_41?.[2]?.event_doc_gas_shipper_41?.event_doc_gas_shipper_file[0]?.url : '')

        }

        // ชุดที่ 4
        if (groupIds4) {
            // ชุด 4 มีของ shipper
            const filteredShippers4 = dataShipperMaster?.filter((item: any) => groupIds4 == item.id);
            const defaultIds4 = filteredShippers4?.map((s: any) => s.id); // เอา id 
            setDefaultShippersRender4(filteredShippers4); // ลบไม่ได้
            setDefaultShippersId4(defaultIds4) // ลบไม่ได้

            setIdChudTee4(dataOpenDocument?.event_doc_gas_shipper_match_41?.[3]?.event_doc_gas_shipper_41?.id)
            setValue('doc_41_perm_lod_4', dataOpenDocument?.event_doc_gas_shipper_match_41?.[3]?.event_doc_gas_shipper_41?.ir ? dataOpenDocument?.event_doc_gas_shipper_match_41?.[3]?.event_doc_gas_shipper_41?.ir : 3) // ถ้่า ir เป็น null ให้ใส่ doc_41_perm_lod_4 == 3 (อื่น ๆ)
            setValue('doc_41_jud_soong_kaw_ook_4', dataOpenDocument?.event_doc_gas_shipper_match_41?.[3]?.event_doc_gas_shipper_41?.io)
            setValue('doc_41_value_4', dataOpenDocument?.event_doc_gas_shipper_match_41?.[3]?.event_doc_gas_shipper_41?.value)
            setValue('doc_41_more_4', dataOpenDocument?.event_doc_gas_shipper_match_41?.[3]?.event_doc_gas_shipper_41?.more)

            setFileNameEditText4(dataOpenDocument?.event_doc_gas_shipper_match_41?.[3]?.event_doc_gas_shipper_41?.event_doc_gas_shipper_file?.length > 0 ? cutUploadFileName(dataOpenDocument?.event_doc_gas_shipper_match_41?.[3]?.event_doc_gas_shipper_41?.event_doc_gas_shipper_file[0]?.url) : '')
            setFileNameEditUrl4(dataOpenDocument?.event_doc_gas_shipper_match_41?.[3]?.event_doc_gas_shipper_41?.event_doc_gas_shipper_file?.length > 0 ? dataOpenDocument?.event_doc_gas_shipper_match_41?.[3]?.event_doc_gas_shipper_41?.event_doc_gas_shipper_file[0]?.url : '')
        }

        // ชุดที่ 5
        if (groupIds5) {
            // ชุด 5 มีของ shipper
            // const find_shipper_from_nom_point_chud_tee_5 = getShipperOfNomPointForOnload(dataOpenDocument?.event_doc_gas_shipper_match[4]?.event_doc_gas_shipper?.nom_point, 5)
            const filteredShippers5 = dataShipperMaster?.filter((item: any) => groupIds5 == item.id);
            const defaultIds5 = filteredShippers5?.map((s: any) => s.id); // เอา id 
            setDefaultShippersRender5(filteredShippers5); // ลบไม่ได้
            setDefaultShippersId5(defaultIds5) // ลบไม่ได้

            setIdChudTee5(dataOpenDocument?.event_doc_gas_shipper_match_41?.[4]?.event_doc_gas_shipper_41?.id)
            setValue('doc_41_perm_lod_5', dataOpenDocument?.event_doc_gas_shipper_match_41?.[4]?.event_doc_gas_shipper_41?.ir ? dataOpenDocument?.event_doc_gas_shipper_match_41?.[4]?.event_doc_gas_shipper_41?.ir : 3) // ถ้่า ir เป็น null ให้ใส่ doc_41_perm_lod_4 == 3 (อื่น ๆ)
            setValue('doc_41_jud_soong_kaw_ook_5', dataOpenDocument?.event_doc_gas_shipper_match_41?.[4]?.event_doc_gas_shipper_41?.io)
            setValue('doc_41_value_5', dataOpenDocument?.event_doc_gas_shipper_match_41?.[4]?.event_doc_gas_shipper_41?.value)
            setValue('doc_41_more_5', dataOpenDocument?.event_doc_gas_shipper_match_41?.[4]?.event_doc_gas_shipper_41?.more)

            setFileNameEditText5(dataOpenDocument?.event_doc_gas_shipper_match_41?.[4]?.event_doc_gas_shipper_41?.event_doc_gas_shipper_file?.length > 0 ? cutUploadFileName(dataOpenDocument?.event_doc_gas_shipper_match_41?.[4]?.event_doc_gas_shipper_41?.event_doc_gas_shipper_file[0]?.url) : '')
            setFileNameEditUrl5(dataOpenDocument?.event_doc_gas_shipper_match_41?.[4]?.event_doc_gas_shipper_41?.event_doc_gas_shipper_file?.length > 0 ? dataOpenDocument?.event_doc_gas_shipper_match_41?.[4]?.event_doc_gas_shipper_41?.event_doc_gas_shipper_file[0]?.url : '')
        }
    }


    // #region set data on load
    useEffect(() => {
        let text_header: any = 'สร้างเอกสารคำสั่งปรับปริมาณก๊าซจากเหตุการณ์ฉุกเฉิน/เหตุการณ์ความไม่สมดุลอย่างรุนแรง (Doc 4)'
        switch (modeOpenDocument) {
            case 'view':
                text_header = 'ดูเอกสารคำสั่งปรับปริมาณก๊าซจากเหตุการณ์ฉุกเฉิน/เหตุการณ์ความไม่สมดุลอย่างรุนแรง (Doc 4)'
                break;
            case 'edit':
                text_header = 'แก้ไขเอกสารคำสั่งปรับปริมาณก๊าซจากเหตุการณ์ฉุกเฉิน/เหตุการณ์ความไม่สมดุลอย่างรุนแรง (Doc 4)'
                break;
        }

        setHeaderFormText(text_header)
        // setDocumentId(dataOpenDocument?.document1?.id)
        setDocumentId(dataOpenDocument?.id)

        if (modeOpenDocument == 'edit' || modeOpenDocument == 'view') {
            setValue('ref_document', dataOpenDocument?.event_runnumber_emer_id)
            setValue('event_date', dataOpenDocument?.event_date)
            setValue('longdo_dict', dataOpenDocument?.longdo_dict)
            setValue('event_doc_emer_type_id', dataOpenDocument?.event_runnumber_emer?.event_doc_emer_type_id)

            if (userDT?.account_manage?.[0]?.user_type_id !== 3) {
                // #region SET DATA ชุดต่าง ๆ สำหรับ TSO
                setDataChudTee();
            } else {
                // SET DATA ชุดต่าง ๆ สำหรับ Shipper
                setDataChudTeeForShipper();
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
            setValue('event_doc_emer_gas_tranmiss_id', dataOpenDocument?.event_runnumber_emer?.event_doc_emer_gas_tranmiss_id)
            setValue('event_doc_emer_gas_tranmiss_other', dataOpenDocument?.event_runnumber_emer?.event_doc_emer_gas_tranmiss_other)

            setValue("doc_41_input_date_time_of_the_incident", dataOpenDocument?.doc_41_input_date_time_of_the_incident); //วัน/เวลาที่เกิดเหตุ
            setValue("doc_41_input_incident", dataOpenDocument?.doc_41_input_incident); // สถานที่เกิดเหตุ
            setValue("doc_41_input_detail_incident", dataOpenDocument?.doc_41_input_detail_incident);  //รายละเอียดของเหตุการณ์ และผลกระทบต่อระบบส่งก๊าซ
            setValue("doc_41_input_expected_day_time", dataOpenDocument?.doc_41_input_expected_day_time);//คาดว่าจะแก้ไขปัญหาแล้วเสร็จในวันที่/เวลา
            setValue("doc_41_input_note", dataOpenDocument?.doc_41_input_note); // หมายเหตุ
            // ของ shipper
            setValue("doc_41_input_shipper_operation", dataOpenDocument?.doc_41_input_shipper_operation); //การดำเนินการ
            setValue("doc_41_input_shipper_note", dataOpenDocument?.doc_41_input_shipper_note); // หมายเหตุ

        }

        // New : Field หมายเหตุ ของทุก Doc ต้อง Default ข้อความตามเอกสาร (ในครั้งแรก) มาให้อัตโนมัติ และเมื่อมีการแก้ไข ให้ยึดตามล่าสุดเป็น Default ในครั้งถัดไป https://app.clickup.com/t/86eum0nwd
        if (modeOpenDocument == 'create') {
            setValue('doc_41_input_note', maiHedDocSeeLasted)  // หมายเหตุ
        }

    }, [mode, dataOpenDocument, dataNomPointForDoc7, shipperData, emailGroupForEventData])

    // #region handle Confirm Save
    {/* Confirm Save */ }
    const handleSaveConfirm = async (data?: any) => {

        if (mode == 'create') {

            {/* 
                key ในแต่ละชุด
                // ชุด 1 
                doc_41_perm_lod_1 : เพิ่ม = 1, ลด = 2, อื่น ๆ = 5
                doc_41_jud_soong_kaw_ook_1 : เข้า = 3, ออก = 4
                doc_41_value_1  : ปริมาณ
                doc_41_more_1  : เพิ่มเติม
                shipper_id_1 : shipper

            */}

            const payload_tso_create = {
                "generate": false, // true gen , false default
                "id_runnumber": idRefDocRunnumber, // ใส่มา
                "id_documents": null, // ตอนสร้าง null | ถ้าใส่ id_runnumber ใส่มาด้วย | ตอน edit version ส่งมาด้วย | (ถ้าตอน status generate ส่ง id มาด้วย )

                "longdo_dict": watch('longdo_dict'), //สำเนา
                "event_date": dayjs(watch('event_date')).format("YYYY-MM-DD"), // วันที่ออกเอกสาร

                "doc_41_input_date_time_of_the_incident": watch('doc_41_input_date_time_of_the_incident'), //วัน/เวลาที่เกิดเหตุ
                "doc_41_input_incident": watch('doc_41_input_incident'), // สถานที่เกิดเหตุ
                "doc_41_input_detail_incident": watch('doc_41_input_detail_incident'), //รายละเอียดของเหตุการณ์ และผลกระทบต่อระบบส่งก๊าซ
                "doc_41_input_expected_day_time": watch('doc_41_input_expected_day_time'),  //คาดว่าจะแก้ไขปัญหาแล้วเสร็จในวันที่/เวลา
                "doc_41_input_note": watch('doc_41_input_note'),//หมายเหตุ 

                // gas_shipper_41 อันนี้มันจะมีเต็มที่ 5 ตัว
                "gas_shipper_41": [
                    ...(watch('doc_41_perm_lod_1') && watch('shipper_id_1') ? [{
                        "id": null,
                        "ir": (watch('doc_41_perm_lod_1') == 3 || watch('doc_41_perm_lod_1') == '3') ? null : parseInt(watch('doc_41_perm_lod_1')), // 1 เพิ่ม, 2 ลด
                        "iother": (watch('doc_41_perm_lod_1') == 3 || watch('doc_41_perm_lod_1') == '3') ? 5 : null, // 5 อื่นๆ ถ้าเลือก ir รน 1 - 4 ให้ null
                        "io": (watch('doc_41_perm_lod_1') == 3 || watch('doc_41_perm_lod_1') == '3') ? null : watch('doc_41_jud_soong_kaw_ook_1') ? parseInt(watch('doc_41_jud_soong_kaw_ook_1')) : null, // 3 จุดส่งเข้า, 4 จุดส่งออก
                        "value": watch('doc_41_value_1'),
                        "more": watch('doc_41_more_1'),
                        "shipper": Array.from(new Set([
                            ...selectedShippers1,
                            ...defaultShippersId1,
                        ])),
                        "file": fileUrl1 !== '' ? [fileUrl1] : [],
                    }] : []),
                    ...(watch('doc_41_perm_lod_2') && watch('shipper_id_2') ? [{
                        "id": null,
                        "ir": (watch('doc_41_perm_lod_2') == 3 || watch('doc_41_perm_lod_2') == '3') ? null : parseInt(watch('doc_41_perm_lod_2')), // 1 เพิ่ม, 2 ลด
                        "iother": (watch('doc_41_perm_lod_2') == 3 || watch('doc_41_perm_lod_2') == '3') ? 5 : null, // 5 อื่นๆ ถ้าเลือก ir รน 1 - 4 ให้ null
                        "io": (watch('doc_41_perm_lod_2') == 3 || watch('doc_41_perm_lod_2') == '3') ? null : watch('doc_41_jud_soong_kaw_ook_2') ? parseInt(watch('doc_41_jud_soong_kaw_ook_2')) : null, // 3 จุดส่งเข้า, 4 จุดส่งออก
                        "value": watch('doc_41_value_2'),
                        "more": watch('doc_41_more_2'),
                        "shipper": Array.from(new Set([
                            ...selectedShippers2,
                            ...defaultShippersId2,
                        ])),
                        "file": fileUrl2 !== '' ? [fileUrl2] : [],
                    }] : []),
                    ...(watch('doc_41_perm_lod_3') && watch('shipper_id_3') ? [{
                        "id": null,
                        "ir": (watch('doc_41_perm_lod_3') == 3 || watch('doc_41_perm_lod_3') == '3') ? null : parseInt(watch('doc_41_perm_lod_3')), // 1 เพิ่ม, 2 ลด
                        "iother": (watch('doc_41_perm_lod_3') == 3 || watch('doc_41_perm_lod_3') == '3') ? 5 : null, // 5 อื่นๆ ถ้าเลือก ir รน 1 - 4 ให้ null
                        "io": (watch('doc_41_perm_lod_3') == 3 || watch('doc_41_perm_lod_3') == '3') ? null : watch('doc_41_jud_soong_kaw_ook_3') ? parseInt(watch('doc_41_jud_soong_kaw_ook_3')) : null, // 3 จุดส่งเข้า, 4 จุดส่งออก
                        "value": watch('doc_41_value_3'),
                        "more": watch('doc_41_more_3'),
                        "shipper": Array.from(new Set([
                            ...selectedShippers3,
                            ...defaultShippersId3,
                        ])),
                        "file": fileUrl3 !== '' ? [fileUrl3] : [],
                    }] : []),
                    ...(watch('doc_41_perm_lod_4') && watch('shipper_id_4') ? [{
                        "id": null,
                        "ir": (watch('doc_41_perm_lod_4') == 3 || watch('doc_41_perm_lod_4') == '3') ? null : parseInt(watch('doc_41_perm_lod_4')), // 1 เพิ่ม, 2 ลด
                        "iother": (watch('doc_41_perm_lod_4') == 3 || watch('doc_41_perm_lod_4') == '3') ? 5 : null, // 5 อื่นๆ ถ้าเลือก ir รน 1 - 4 ให้ null
                        "io": (watch('doc_41_perm_lod_4') == 3 || watch('doc_41_perm_lod_4') == '3') ? null : watch('doc_41_jud_soong_kaw_ook_4') ? parseInt(watch('doc_41_jud_soong_kaw_ook_4')) : null, // 3 จุดส่งเข้า, 4 จุดส่งออก
                        "value": watch('doc_41_value_4'),
                        "more": watch('doc_41_more_4'),
                        "shipper": Array.from(new Set([
                            ...selectedShippers4,
                            ...defaultShippersId4,
                        ])),
                        "file": fileUrl4 !== '' ? [fileUrl4] : [],
                    }] : []),
                    ...(watch('doc_41_perm_lod_5') && watch('shipper_id_5') ? [{
                        "id": null,
                        "ir": (watch('doc_41_perm_lod_5') == 3 || watch('doc_41_perm_lod_5') == '3') ? null : parseInt(watch('doc_41_perm_lod_5')), // 1 เพิ่ม, 2 ลด
                        "iother": (watch('doc_41_perm_lod_5') == 3 || watch('doc_41_perm_lod_5') == '3') ? 5 : null, // 5 อื่นๆ ถ้าเลือก ir รน 1 - 4 ให้ null
                        "io": (watch('doc_41_perm_lod_5') == 3 || watch('doc_41_perm_lod_5') == '3') ? null : watch('doc_41_jud_soong_kaw_ook_5') ? parseInt(watch('doc_41_jud_soong_kaw_ook_5')) : null, // 3 จุดส่งเข้า, 4 จุดส่งออก
                        "value": watch('doc_41_value_5'),
                        "more": watch('doc_41_more_5'),
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
                data_post_na = {
                    // "document_id": documentId, // เอาไว้ใช้เส้น POST event/ofo/doc5/edit/${id}
                    "generate": dataOpenDocument?.event_doc_status_id == 6 ? true : false, // true gen , false default
                    "id_runnumber": dataOpenDocument?.event_runnumber_emer_id, // ใส่มาตอน edit version 
                    "id_documents": dataOpenDocument?.id, // ตอนสร้าง null | ถ้าใส่ id_runnumber ใส่มาด้วย | ตอน edit version ส่งมาด้วย | (ถ้าตอน status generate ส่ง id มาด้วย )

                    "longdo_dict": watch('longdo_dict'), //สำเนา
                    "event_date": dayjs(watch('event_date')).format("YYYY-MM-DD"), // วันที่ออกเอกสาร

                    "doc_41_input_date_time_of_the_incident": watch('doc_41_input_date_time_of_the_incident'), //วัน/เวลาที่เกิดเหตุ
                    "doc_41_input_incident": watch('doc_41_input_incident'), // สถานที่เกิดเหตุ
                    "doc_41_input_detail_incident": watch('doc_41_input_detail_incident'), //รายละเอียดของเหตุการณ์ และผลกระทบต่อระบบส่งก๊าซ
                    "doc_41_input_expected_day_time": watch('doc_41_input_expected_day_time'),  //คาดว่าจะแก้ไขปัญหาแล้วเสร็จในวันที่/เวลา
                    "doc_41_input_note": watch('doc_41_input_note'),//หมายเหตุ 

                    "gas_shipper_41": [
                        ...(watch('doc_41_perm_lod_1') ? [{
                            "id": dataOpenDocument?.event_doc_status_id == 6 ? idChudTee1 : null,
                            "ir": (watch('doc_41_perm_lod_1') == 3 || watch('doc_41_perm_lod_1') == '3') ? null : parseInt(watch('doc_41_perm_lod_1')), // 1 เพิ่ม, 2 ลด
                            "iother": (watch('doc_41_perm_lod_1') == 3 || watch('doc_41_perm_lod_1') == '3') ? 5 : null, // 5 อื่นๆ ถ้าเลือก ir รน 1 - 4 ให้ null
                            "io": (watch('doc_41_perm_lod_1') == 3 || watch('doc_41_perm_lod_1') == '3') ? null : watch('doc_41_jud_soong_kaw_ook_1') ? parseInt(watch('doc_41_jud_soong_kaw_ook_1')) : null, // 3 จุดส่งเข้า, 4 จุดส่งออก
                            "value": watch('doc_41_value_1'),
                            "more": watch('doc_41_more_1'),
                            "shipper": Array.from(new Set([
                                ...selectedShippers1,
                                ...defaultShippersId1,
                            ])),
                            "file": fileUrl1 !== '' ? [fileUrl1] : [],
                        }] : []),
                        ...(watch('doc_41_perm_lod_2') ? [{
                            "id": dataOpenDocument?.event_doc_status_id == 6 ? idChudTee2 : null,
                            "ir": (watch('doc_41_perm_lod_2') == 3 || watch('doc_41_perm_lod_2') == '3') ? null : parseInt(watch('doc_41_perm_lod_2')), // 1 เพิ่ม, 2 ลด
                            "iother": (watch('doc_41_perm_lod_2') == 3 || watch('doc_41_perm_lod_2') == '3') ? 5 : null, // 5 อื่นๆ ถ้าเลือก ir รน 1 - 4 ให้ null
                            "io": (watch('doc_41_perm_lod_2') == 3 || watch('doc_41_perm_lod_2') == '3') ? null : watch('doc_41_jud_soong_kaw_ook_2') ? parseInt(watch('doc_41_jud_soong_kaw_ook_2')) : null, // 3 จุดส่งเข้า, 4 จุดส่งออก
                            "value": watch('doc_41_value_2'),
                            "more": watch('doc_41_more_2'),
                            "shipper": Array.from(new Set([
                                ...selectedShippers2,
                                ...defaultShippersId2,
                            ])),
                            "file": fileUrl2 !== '' ? [fileUrl2] : [],
                        }] : []),
                        ...(watch('doc_41_perm_lod_3') ? [{
                            "id": dataOpenDocument?.event_doc_status_id == 6 ? idChudTee3 : null,
                            "ir": (watch('doc_41_perm_lod_3') == 3 || watch('doc_41_perm_lod_3') == '3') ? null : parseInt(watch('doc_41_perm_lod_3')), // 1 เพิ่ม, 2 ลด
                            "iother": (watch('doc_41_perm_lod_3') == 3 || watch('doc_41_perm_lod_3') == '3') ? 5 : null, // 5 อื่นๆ ถ้าเลือก ir รน 1 - 4 ให้ null
                            "io": (watch('doc_41_perm_lod_3') == 3 || watch('doc_41_perm_lod_3') == '3') ? null : watch('doc_41_jud_soong_kaw_ook_3') ? parseInt(watch('doc_41_jud_soong_kaw_ook_3')) : null, // 3 จุดส่งเข้า, 4 จุดส่งออก
                            "value": watch('doc_41_value_3'),
                            "more": watch('doc_41_more_3'),
                            "shipper": Array.from(new Set([
                                ...selectedShippers3,
                                ...defaultShippersId3,
                            ])),
                            "file": fileUrl3 !== '' ? [fileUrl3] : [],
                        }] : []),
                        ...(watch('doc_41_perm_lod_4') ? [{
                            "id": dataOpenDocument?.event_doc_status_id == 6 ? idChudTee4 : null,
                            "ir": (watch('doc_41_perm_lod_4') == 3 || watch('doc_41_perm_lod_4') == '3') ? null : parseInt(watch('doc_41_perm_lod_4')), // 1 เพิ่ม, 2 ลด
                            "iother": (watch('doc_41_perm_lod_4') == 3 || watch('doc_41_perm_lod_4') == '3') ? 5 : null, // 5 อื่นๆ ถ้าเลือก ir รน 1 - 4 ให้ null
                            "io": (watch('doc_41_perm_lod_4') == 3 || watch('doc_41_perm_lod_4') == '3') ? null : watch('doc_41_jud_soong_kaw_ook_4') ? parseInt(watch('doc_41_jud_soong_kaw_ook_4')) : null, // 3 จุดส่งเข้า, 4 จุดส่งออก
                            "value": watch('doc_41_value_4'),
                            "more": watch('doc_41_more_4'),
                            "shipper": Array.from(new Set([
                                ...selectedShippers4,
                                ...defaultShippersId4,
                            ])),
                            "file": fileUrl4 !== '' ? [fileUrl4] : [],
                        }] : []),
                        ...(watch('doc_41_perm_lod_5') ? [{
                            "id": dataOpenDocument?.event_doc_status_id == 6 ? idChudTee5 : null,
                            "ir": (watch('doc_41_perm_lod_5') == 3 || watch('doc_41_perm_lod_5') == '3') ? null : parseInt(watch('doc_41_perm_lod_5')), // 1 เพิ่ม, 2 ลด
                            "iother": (watch('doc_41_perm_lod_5') == 3 || watch('doc_41_perm_lod_5') == '3') ? 5 : null, // 5 อื่นๆ ถ้าเลือก ir รน 1 - 4 ให้ null
                            "io": (watch('doc_41_perm_lod_5') == 3 || watch('doc_41_perm_lod_5') == '3') ? null : watch('doc_41_jud_soong_kaw_ook_5') ? parseInt(watch('doc_41_jud_soong_kaw_ook_5')) : null, // 3 จุดส่งเข้า, 4 จุดส่งออก
                            "value": watch('doc_41_value_5'),
                            "more": watch('doc_41_more_5'),
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
                    "document_id": documentId, // เอาไว้ใช้เส้น PUT event/ofo/doc7/${id}
                    "event_doc_status_id": 5,
                    "doc_41_input_shipper_operation": watch('doc_41_input_shipper_operation'), //การดำเนินการ
                    "doc_41_input_shipper_note": watch('doc_41_input_shipper_note') //หมายเหตุ
                }
            }

            setDataSubmit(data_post_na)
            setModaConfirmSave(true)
        }
    }

    useEffect(() => {

        let test_k = {
            "id": null,
            "ir": (watch('doc_41_perm_lod_1') == 3 || watch('doc_41_perm_lod_1') == '3') ? null : parseInt(watch('doc_41_perm_lod_1')), // 1 เพิ่ม, 2 ลด
            "iother": (watch('doc_41_perm_lod_1') == 3 || watch('doc_41_perm_lod_1') == '3') ? 5 : null, // 5 อื่นๆ ถ้าเลือก ir รน 1 - 4 ให้ null
            "io": (watch('doc_41_perm_lod_1') == 3 || watch('doc_41_perm_lod_1') == '3') ? null : watch('doc_41_jud_soong_kaw_ook_1') ? parseInt(watch('doc_41_jud_soong_kaw_ook_1')) : null, // 3 จุดส่งเข้า, 4 จุดส่งออก
            "value": watch('doc_41_value_1'),
            "more": watch('doc_41_more_1'),
            "shipper": Array.from(new Set([
                ...selectedShippers1,
                ...defaultShippersId1,
            ])),
            "file": fileUrl1 !== '' ? [fileUrl1] : [],
        }

    }, [watch('doc_41_perm_lod_1')])


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

        setIsUploading(true);

        if (file.size > maxSizeInBytes) {
            fileNameSetters[index]('The file is larger than 5 MB.');
            setIsLoading(false);
            setIsUploading(false);
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

    // #region SHIPPER DATA
    const [dataShipperMaster, setDataShipperMaster] = useState<any>([])

    useEffect(() => {
        setDataShipperMaster(shipperData)
    }, [shipperData])


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
                    setSelectedShippers1(selectedShippers1.length === dataShipperMaster?.length ? [] : dataShipperMaster?.filter((item: any) => !defaultShippersId1?.includes(item.id)).map((item: any) => item.id));
                    setSelectedShippersRender1(selectedShippers1.length === dataShipperMaster?.length ? [] : dataShipperMaster?.filter((item: any) => !defaultShippersId1?.includes(item.id)).map((item: any) => item));
                    setValue("shipper_id_1", selectedShippers1.length === dataShipperMaster?.length ? [] : dataShipperMaster?.filter((item: any) => !defaultShippersId1?.includes(item.id)).map((item: any) => item.id));
                } else {
                    setSelectedShippers1(value);
                    setValue("shipper_id_1", value);

                    const filter_shipper = dataShipperMaster?.filter((item: any) => value.includes(item?.id))
                    setSelectedShippersRender1(filter_shipper)
                }
                clearErrors('shipper_id_1');
                break;
            case 2: // ชุดที่ 2
                if (value.includes("all")) {
                    // เอาอันที่มีอยู่แล้วออกจาก option 
                    setSelectedShippers2(selectedShippers2.length === dataShipperMaster.length ? [] : dataShipperMaster?.filter((item: any) => !defaultShippersId2?.includes(item.id)).map((item: any) => item.id));
                    setSelectedShippersRender2(selectedShippers2.length === dataShipperMaster.length ? [] : dataShipperMaster?.filter((item: any) => !defaultShippersId2?.includes(item.id)).map((item: any) => item));
                    setValue("shipper_id_2", selectedShippers2.length === dataShipperMaster.length ? [] : dataShipperMaster?.filter((item: any) => !defaultShippersId2?.includes(item.id)).map((item: any) => item.id));
                } else {
                    setSelectedShippers2(value);
                    setValue("shipper_id_2", value);

                    const filter_shipper = dataShipperMaster?.filter((item: any) => value.includes(item?.id))
                    setSelectedShippersRender2(filter_shipper)
                }
                clearErrors('shipper_id_2');
                break;
            case 3: // ชุดที่ 3
                if (value.includes("all")) {
                    // เอาอันที่มีอยู่แล้วออกจาก option 
                    setSelectedShippers3(selectedShippers3.length === dataShipperMaster.length ? [] : dataShipperMaster?.filter((item: any) => !defaultShippersId3?.includes(item.id)).map((item: any) => item.id));
                    setSelectedShippersRender3(selectedShippers3.length === dataShipperMaster.length ? [] : dataShipperMaster?.filter((item: any) => !defaultShippersId3?.includes(item.id)).map((item: any) => item));
                    setValue("shipper_id_3", selectedShippers3.length === dataShipperMaster.length ? [] : dataShipperMaster?.filter((item: any) => !defaultShippersId3?.includes(item.id)).map((item: any) => item.id));
                } else {
                    setSelectedShippers3(value);
                    setValue("shipper_id_3", value);

                    const filter_shipper = dataShipperMaster?.filter((item: any) => value.includes(item?.id))
                    setSelectedShippersRender3(filter_shipper)
                }
                clearErrors('shipper_id_3');
                break;
            case 4: // ชุดที่ 4
                if (value.includes("all")) {
                    // เอาอันที่มีอยู่แล้วออกจาก option 
                    setSelectedShippers4(selectedShippers4.length === dataShipperMaster.length ? [] : dataShipperMaster?.filter((item: any) => !defaultShippersId4?.includes(item.id)).map((item: any) => item.id));
                    setSelectedShippersRender4(selectedShippers4.length === dataShipperMaster.length ? [] : dataShipperMaster?.filter((item: any) => !defaultShippersId4?.includes(item.id)).map((item: any) => item));
                    setValue("shipper_id_4", selectedShippers4.length === dataShipperMaster.length ? [] : dataShipperMaster?.filter((item: any) => !defaultShippersId4?.includes(item.id)).map((item: any) => item.id));
                } else {
                    setSelectedShippers4(value);
                    setValue("shipper_id_4", value);

                    const filter_shipper = dataShipperMaster?.filter((item: any) => value.includes(item?.id))
                    setSelectedShippersRender4(filter_shipper)
                }
                clearErrors('shipper_id_4');
                break;
            case 5: // ชุดที่ 5
                if (value.includes("all")) {
                    // เอาอันที่มีอยู่แล้วออกจาก option 
                    setSelectedShippers5(selectedShippers5.length === dataShipperMaster.length ? [] : dataShipperMaster?.filter((item: any) => !defaultShippersId5?.includes(item.id)).map((item: any) => item.id));
                    setSelectedShippersRender5(selectedShippers5.length === dataShipperMaster.length ? [] : dataShipperMaster?.filter((item: any) => !defaultShippersId5?.includes(item.id)).map((item: any) => item));
                    setValue("shipper_id_5", selectedShippers5.length === dataShipperMaster.length ? [] : dataShipperMaster?.filter((item: any) => !defaultShippersId5?.includes(item.id)).map((item: any) => item.id));
                } else {
                    setSelectedShippers5(value);
                    setValue("shipper_id_5", value);

                    const filter_shipper = dataShipperMaster?.filter((item: any) => value.includes(item?.id))
                    setSelectedShippersRender5(filter_shipper)
                }
                clearErrors('shipper_id_5');
                break;
        }

        handletrickerEdit()
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
        handletrickerEdit()
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
            setValue('doc_41_perm_lod_1', null)
            setValue('doc_41_perm_lod_2', null)
            setValue('doc_41_perm_lod_3', null)
            setValue('doc_41_perm_lod_4', null)
            setValue('doc_41_perm_lod_5', null)

            // clear จุดส่งเข้า = 3, จุดส่งออก = 4
            setValue('doc_41_jud_soong_kaw_ook_1', null)
            setValue('doc_41_jud_soong_kaw_ook_2', null)
            setValue('doc_41_jud_soong_kaw_ook_3', null)
            setValue('doc_41_jud_soong_kaw_ook_4', null)
            setValue('doc_41_jud_soong_kaw_ook_5', null)

            // clear ปริมาณ
            setValue('doc_41_value_1', null)
            setValue('doc_41_value_2', null)
            setValue('doc_41_value_3', null)
            setValue('doc_41_value_4', null)
            setValue('doc_41_value_5', null)

            // clear ข้อมูลเพิ่มเติม
            setValue('doc_41_more_1', null)
            setValue('doc_41_more_2', null)
            setValue('doc_41_more_3', null)
            setValue('doc_41_more_4', null)
            setValue('doc_41_more_5', null)

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
                doc_41_perm_lod_1 : เพิ่ม = 1, ลด = 2, อื่น ๆ = 5
                doc_41_jud_soong_kaw_ook_1 : เข้า = 3, ออก = 4
                doc_41_value_1  : ปริมาณ
                doc_41_more_1  : เพิ่มเติม
                shipper_id_1 : shipper

            */}

            // clear เพิ่ม = 1, ลด = 2
            setValue('doc_41_perm_lod_1', null)
            setValue('doc_41_perm_lod_2', null)
            setValue('doc_41_perm_lod_3', null)
            setValue('doc_41_perm_lod_4', null)
            setValue('doc_41_perm_lod_5', null)

            // clear จุดส่งเข้า = 3, จุดส่งออก = 4
            setValue('doc_41_jud_soong_kaw_ook_1', null)
            setValue('doc_41_jud_soong_kaw_ook_2', null)
            setValue('doc_41_jud_soong_kaw_ook_3', null)
            setValue('doc_41_jud_soong_kaw_ook_4', null)
            setValue('doc_41_jud_soong_kaw_ook_5', null)

            // clear ปริมาณ
            setValue('doc_41_value_1', null)
            setValue('doc_41_value_2', null)
            setValue('doc_41_value_3', null)
            setValue('doc_41_value_4', null)
            setValue('doc_41_value_5', null)

            // clear ข้อมูลเพิ่มเติม
            setValue('doc_41_more_1', null)
            setValue('doc_41_more_2', null)
            setValue('doc_41_more_3', null)
            setValue('doc_41_more_4', null)
            setValue('doc_41_more_5', null)

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

    //#region SAVEBTN
    const [trickerEdit, settrickerEdit] = useState<boolean>(mode == 'edit' ? true : false)

    const handletrickerEdit = () => {
        if (trickerEdit == true && mode == 'edit') {
            settrickerEdit(false);
        }
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
                                    setIDRefDocRunnumber(find_doc1_data?.id)
                                    setValue("event_date", find_doc1_data?.event_date); // ใส่วันที่จาก doc39
                                    setValue("event_doc_emer_type_id", find_doc1_data?.event_doc_emer_type_id); // ประเภทจาก doc39

                                    setValue("event_doc_emer_gas_tranmiss_id", find_doc1_data?.event_doc_emer_gas_tranmiss_id); // ระบบส่งก๊าซจาก doc39
                                    setValue("event_doc_emer_gas_tranmiss_other", find_doc1_data?.event_doc_emer_gas_tranmiss_other); // อื่น ๆ ในระบบส่งก๊าซจาก doc39


                                    setValue("longdo_dict", find_doc1_data?.event_document_emer[0].longdo_dict); // สำเนาจาก doc39
                                    setValue("doc_41_input_date_time_of_the_incident", find_doc1_data?.event_document_emer[0].doc_39_input_date_time_of_the_incident); //จาก doc39
                                    setValue("doc_41_input_incident", find_doc1_data?.event_document_emer[0].doc_39_input_incident); //จาก doc39
                                    setValue("doc_41_input_detail_incident", find_doc1_data?.event_document_emer[0].doc_39_input_detail_incident); //จาก doc39
                                    setValue("doc_41_input_expected_day_time", find_doc1_data?.event_document_emer[0].doc_39_input_expected_day_time); //จาก doc39

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
                        readOnly={mode == 'view' || isShipper}
                        placeHolder="เลือกวันที่"
                        mode={mode}
                        valueShow={watch("event_date") ? dayjs(watch("event_date")).format("DD/MM/YYYY") : undefined}
                        allowClear
                        isError={errors.event_date && !watch("event_date") ? true : false}
                        onChange={(e: any) => {
                            setValue('event_date', formatFormDate(e)), e == undefined && setValue('event_date', null, { shouldValidate: true, shouldDirty: true });
                            handletrickerEdit()
                        }}
                    />
                    {errors.event_date && !watch("event_date") && <p className={`${textErrorClass}`}>{'เลือกวันที่'}</p>}
                </div>

                <div className="w-[350px]">
                    <label htmlFor="event_nember" className={labelClass}>
                        <span className="text-red-500">*</span>
                        {`ประเภท`}
                    </label>

                    <SelectFormProps
                        id={'event_doc_emer_type_id'}
                        register={register("event_doc_emer_type_id", { required: true })}
                        disabled={true}
                        valueWatch={watch("event_doc_emer_type_id") || ""}
                        handleChange={(e) => {
                            setValue("event_doc_emer_type_id", e.target.value);

                            clearErrors('event_doc_emer_type_id')
                            if (errors?.event_doc_emer_type_id) { clearErrors('event_doc_emer_type_id') }
                        }}
                        errors={errors?.event_doc_emer_type_id}
                        errorsText={'Select Type'}
                        options={mock_emergency_type}
                        optionsKey={'id'}
                        optionsValue={'id'}
                        optionsText={'name'}
                        optionsResult={'name'}
                        placeholder={'Select Type'}
                        pathFilter={'name'}
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
                            handletrickerEdit()
                        }}
                        placeholder="ระบุรายละเอียด"
                        // disabled={isReadOnly}
                        // disabled={(mode == 'view' || isShipper) ? true : false}
                        disabled={mode == 'view' || isShipper}
                        rows={2}
                        sx={textFieldSx}
                        // className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                        className={`${(mode == 'view') && 'bg-[#EFECEC] rounded-[8px]'}`}
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


            {/* ระบบส่งก๊าซ */}
            <div className="flex flex-wrap flex-auto gap-4 pt-2 pb-2">
                <div className="w-full">
                    <label className={`${labelClass}`}>
                        {`ระบบส่งก๊าซ`}
                    </label>

                    <div className="gap-2 w-full h-[44px] flex items-center ">
                        <label className="w-[180px] text-[#58585A]">
                            <input
                                type="radio"
                                {...register("event_doc_emer_gas_tranmiss_id", { required: false })}
                                value="1"
                                // disabled={isReadOnly || isShipper}
                                disabled={true}
                                checked={watch("event_doc_emer_gas_tranmiss_id") == 1}
                                className="mr-1 accent-[#1473A1]"
                            />
                            {`Onshore East`}
                        </label>

                        <label className="w-[180px] text-[#58585A]">
                            <input
                                type="radio"
                                {...register("event_doc_emer_gas_tranmiss_id", { required: false })}
                                value="2"
                                // disabled={isReadOnly || isShipper}
                                disabled={true}
                                checked={watch("event_doc_emer_gas_tranmiss_id") == 2}
                                className="mr-1 accent-[#1473A1]"
                            />
                            {`Onshore West`}
                        </label>

                        <label className="w-[250px] text-[#58585A]">
                            <input
                                type="radio"
                                {...register("event_doc_emer_gas_tranmiss_id", { required: false })}
                                value="3"
                                // disabled={isReadOnly || isShipper}
                                disabled={true}
                                checked={watch("event_doc_emer_gas_tranmiss_id") == 3}
                                className="mr-1 accent-[#1473A1]"
                            />
                            {`Onshore East - West`}
                        </label>

                        <label className="w-full flex items-center gap-2 text-[#58585A] mr-8">
                            <input
                                type="radio"
                                {...register("event_doc_emer_gas_tranmiss_id", { required: false })}
                                value="4"
                                // disabled={isReadOnly || isShipper}
                                disabled={true}
                                checked={watch("event_doc_emer_gas_tranmiss_id") == 4}
                                className="mr-1 accent-[#1473A1]"
                            />
                            {`Other`}

                            {
                                watch('event_doc_emer_gas_tranmiss_id') == 4 && <input
                                    type="text"
                                    // disabled={isReadOnly || isShipper}
                                    disabled={true}
                                    {...register('event_doc_ofo_gas_tranmiss_other', { required: false })}
                                    value={watch('event_doc_ofo_gas_tranmiss_other')}
                                    onChange={(e) => setValue('event_doc_ofo_gas_tranmiss_other', e.target.value)}
                                    className={`text-[14px] block md:w-full ps-5 focus:!ps-5 hover:!ps-5 pe-10 h-[34px] border-b-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF] ${errors.event_doc_ofo_gas_tranmiss_other && 'border-red-500'}`}
                                />
                            }

                        </label>
                    </div>
                </div>
            </div>

            {/* วัน/เวลาที่เกิดเหตุ */}
            {/* สถานที่เกิดเหตุ */}
            <div className="grid grid-cols-2 gap-4 pt-3">
                <div className="w-full">
                    <label className={`${labelClass}`}>
                        <span className="text-red-500">*</span>
                        {`วัน/เวลาที่เกิดเหตุ`}
                    </label>
                    <TextField
                        {...register("doc_41_input_date_time_of_the_incident", { required: true })}
                        value={watch("doc_41_input_date_time_of_the_incident") || ""}
                        label=""
                        multiline
                        onChange={(e) => {
                            if (e.target.value.length <= 255) {
                                setValue("doc_41_input_date_time_of_the_incident", e.target.value);
                            }
                            handletrickerEdit()
                        }}
                        placeholder="ระบุรายละเอียด"
                        // disabled={isReadOnly}
                        disabled={(mode == 'view' || isShipper) ? true : false}
                        rows={2}
                        sx={{
                            ...textFieldSx,
                            '.MuiOutlinedInput-notchedOutline': {
                                borderColor: errors.doc_41_input_date_time_of_the_incident && !watch('doc_41_input_date_time_of_the_incident') ? '#FF0000' : '#DFE4EA',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: errors.doc_41_input_date_time_of_the_incident && !watch("doc_41_input_date_time_of_the_incident") ? "#FF0000" : '#DFE4EA !important',
                            },
                        }}
                        // className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                        className={`${(mode == 'view' || isShipper) && 'bg-[#EFECEC] rounded-[8px]'}`}
                        InputProps={inputPropsTextField}
                        fullWidth
                    />
                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                        <span className="text-[13px]">{watch("doc_41_input_date_time_of_the_incident")?.length || 0} / 255</span>
                    </div>
                </div>


                {/* สถานที่เกิดเหตุ */}
                <div className="w-full">
                    <label className={labelClass}>
                        <span className="text-red-500">*</span>
                        {`สถานที่เกิดเหตุ`}
                    </label>
                    <TextField
                        {...register("doc_41_input_incident", { required: true })}
                        value={watch("doc_41_input_incident") || ""}
                        label=""
                        multiline
                        onChange={(e) => {
                            if (e.target.value.length <= 255) {
                                setValue("doc_41_input_incident", e.target.value);
                            }
                            handletrickerEdit()
                        }}
                        placeholder="ระบุรายละเอียด"
                        // disabled={isReadOnly}
                        disabled={(mode == 'view' || isShipper) ? true : false}
                        rows={2}
                        sx={{
                            ...textFieldSx,
                            '.MuiOutlinedInput-notchedOutline': {
                                borderColor: errors.doc_41_input_incident && !watch('doc_41_input_incident') ? '#FF0000' : '#DFE4EA',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: errors.doc_41_input_incident && !watch("doc_41_input_incident") ? "#FF0000" : '#DFE4EA !important',
                            },
                        }}
                        // className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                        className={`${(mode == 'view' || isShipper) && 'bg-[#EFECEC] rounded-[8px]'}`}
                        InputProps={inputPropsTextField}
                        fullWidth
                    />
                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                        <span className="text-[13px]">{watch("doc_41_input_incident")?.length || 0} / 255</span>
                    </div>
                </div>
            </div>


            {/* รายละเอียดของเหตุการณ์ และผลกระทบต่อระบบส่งก๊าซ */}
            <div className="grid grid-cols-2 gap-4 pt-3">
                <div className="w-full col-span-2">
                    <label className={labelClass}>
                        <span className="text-red-500">*</span>
                        {`รายละเอียดของเหตุการณ์ และผลกระทบต่อระบบส่งก๊าซ`}
                    </label>
                    <TextField
                        {...register("doc_41_input_detail_incident", { required: true })}
                        value={watch("doc_41_input_detail_incident") || ""}
                        label=""
                        multiline
                        onChange={(e) => {
                            if (e.target.value.length <= 500) {
                                setValue("doc_41_input_detail_incident", e.target.value);
                            }
                            handletrickerEdit()
                        }}
                        placeholder="ระบุรายละเอียด"
                        // disabled={isReadOnly}
                        disabled={(mode == 'view' || isShipper) ? true : false}
                        rows={2}
                        sx={{
                            ...textFieldSx,
                            '.MuiOutlinedInput-notchedOutline': {
                                borderColor: errors.doc_41_input_detail_incident && !watch('doc_41_input_detail_incident') ? '#FF0000' : '#DFE4EA',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: errors.doc_41_input_detail_incident && !watch("doc_41_input_detail_incident") ? "#FF0000" : '#DFE4EA !important',
                            },
                        }}
                        // className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                        className={`${(mode == 'view' || isShipper) && 'bg-[#EFECEC] rounded-[8px]'}`}
                        InputProps={inputPropsTextField}
                        fullWidth
                    />
                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                        <span className="text-[13px]">{watch("doc_41_input_detail_incident")?.length || 0} / 500</span>
                    </div>
                </div>
            </div>

            {/* คาดว่าจะแก้ไขปัญหาแล้วเสร็จในวันที่/เวลา: */}
            <div className="grid grid-cols-2 gap-4 pt-3">
                <div className="w-full col-span-2">
                    <label className={labelClass}>{`คาดว่าจะแก้ไขปัญหาแล้วเสร็จในวันที่/เวลา:`}</label>
                    <TextField
                        {...register("doc_41_input_expected_day_time")}
                        value={watch("doc_41_input_expected_day_time") || ""}
                        label=""
                        multiline
                        onChange={(e) => {
                            if (e.target.value.length <= 255) {
                                setValue("doc_41_input_expected_day_time", e.target.value);
                            }
                            handletrickerEdit()
                        }}
                        placeholder="ระบุรายละเอียด"
                        // disabled={isReadOnly}
                        disabled={(mode == 'view' || isShipper) ? true : false}
                        rows={2}
                        sx={textFieldSx}
                        // className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                        className={`${(mode == 'view' || isShipper) && 'bg-[#EFECEC] rounded-[8px]'}`}
                        InputProps={inputPropsTextField}
                        fullWidth
                    />
                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                        <span className="text-[13px]">{watch("doc_41_input_expected_day_time")?.length || 0} / 255</span>
                    </div>
                </div>
            </div>


            {/* {
                errors.doc_7_input_detail_incident && <span>asdasd</span>
            } */}

            {/* 
                key ในแต่ละชุด

                // ชุด 1 
                doc_41_perm_lod_1 : เพิ่ม = 1, ลด = 2, อื่น ๆ = 5
                doc_41_jud_soong_kaw_ook_1 : เข้า = 3, ออก = 4
                doc_41_value_1  : ปริมาณ
                doc_41_more_1  : เพิ่มเติม
                shipper_id_1 : shipper

            */}

            {/* =================================== เพิ่ม/ ลดปริมาณก๊าซ  ======================================== */}
            <div className="flex flex-wrap items-center justify-between pt-4">
                <div className="py-2 text-[14px] font-semibold text-[#58585A]">
                    {`การสั่งการ`}
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
                    {/* เพิ่ม - ลด */}
                    <div className="grid grid-cols-3 gap-1 pt-4">
                        <label className="w-[85px] text-[#58585A]">
                            <input
                                type="radio"
                                {...register("doc_41_perm_lod_1", { required: false })}
                                value={1}
                                disabled={(mode == 'view' || isShipper || idChudTee1) ? true : false}
                                checked={watch("doc_41_perm_lod_1") == 1 || watch("doc_41_perm_lod_1") == "1"}
                                onChange={(e) => {
                                    setValue('doc_41_perm_lod_1', e.target.value)
                                    handletrickerEdit()
                                }}
                                className="mr-1 accent-[#1473A1]"
                            />
                            {`เพิ่ม`}
                        </label>

                        <label className="w-[85px] text-[#58585A]">
                            <input
                                type="radio"
                                {...register("doc_41_perm_lod_1", { required: false })}
                                value={2}
                                disabled={(mode == 'view' || isShipper || idChudTee1) ? true : false}
                                checked={watch("doc_41_perm_lod_1") == 2 || watch("doc_41_perm_lod_1") == "2"}
                                onChange={(e) => {
                                    setValue('doc_41_perm_lod_1', e.target.value)
                                    handletrickerEdit()
                                }}
                                className="mr-1 accent-[#1473A1]"
                            />
                            {`ลด`}
                        </label>

                        <label className="w-[85px] text-[#58585A]">
                            <input
                                type="radio"
                                {...register("doc_41_perm_lod_1", { required: false })}
                                value={3}
                                disabled={(mode == 'view' || isShipper || idChudTee1) ? true : false}
                                checked={watch("doc_41_perm_lod_1") == 3 || watch("doc_41_perm_lod_1") == "3"}
                                onChange={(e) => {
                                    setValue('doc_41_perm_lod_1', e.target.value)
                                    handletrickerEdit()
                                }}
                                className="mr-1 accent-[#1473A1]"
                            />
                            {`อื่น ๆ`}
                        </label>
                    </div>

                    {/* จุดส่งเข้า - จุดส่งออก */}
                    {
                        (watch('doc_41_perm_lod_1') !== 3 && watch('doc_41_perm_lod_1') !== "3") && <div className="grid grid-cols-2 gap-1 pt-4">
                            <label className="w-[100px] text-[#58585A]">
                                <input
                                    type="radio"
                                    {...register("doc_41_jud_soong_kaw_ook_1", { required: false })}
                                    value={3}
                                    disabled={(mode == 'view' || isShipper || !watch('doc_41_perm_lod_1') || idChudTee1) ? true : false}
                                    checked={watch("doc_41_jud_soong_kaw_ook_1") == 3 || watch("doc_41_jud_soong_kaw_ook_1") == "3"}
                                    onChange={(e) => {
                                        setValue('doc_41_jud_soong_kaw_ook_1', e.target.value)
                                        handletrickerEdit()
                                    }}
                                    className="mr-1 accent-[#1473A1]"
                                />
                                {`จุดส่งเข้า`}
                            </label>

                            <label className="w-[100px] text-[#58585A]">
                                <input
                                    type="radio"
                                    {...register("doc_41_jud_soong_kaw_ook_1", { required: false })}
                                    value={4}
                                    disabled={(mode == 'view' || isShipper || !watch('doc_41_perm_lod_1') || idChudTee1) ? true : false}
                                    checked={watch("doc_41_jud_soong_kaw_ook_1") == 4 || watch("doc_41_jud_soong_kaw_ook_1") == "4"}
                                    onChange={(e) => {
                                        setValue('doc_41_jud_soong_kaw_ook_1', e.target.value)
                                        handletrickerEdit()
                                    }}
                                    className="mr-1 accent-[#1473A1]"
                                />
                                {`จุดส่งออก`}
                            </label>
                        </div>
                    }

                </div>


                {/* ปริมาณ */}
                {
                    (watch('doc_41_perm_lod_1') !== 3 && watch('doc_41_perm_lod_1') !== "3" && watch('doc_41_perm_lod_1')) &&
                    <div className="gap-2 w-full flex items-center pt-4">
                        <div className="w-full ">
                            <label className={labelClass}>{`ปริมาณ:`}</label>
                            <TextField
                                {...register("doc_41_value_1")}
                                value={watch("doc_41_value_1") || ""}
                                label=""
                                multiline
                                onChange={(e) => {
                                    if (e.target.value.length <= 255) {
                                        setValue("doc_41_value_1", e.target.value);
                                    }
                                    handletrickerEdit()
                                }}
                                placeholder="ระบุรายละเอียด"
                                // disabled={isReadOnly}
                                disabled={(mode == 'view' || isShipper) ? true : false}
                                rows={2}
                                sx={textFieldSx}
                                // className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                                className={`${(mode == 'view' || isShipper) && 'bg-[#EFECEC] rounded-[8px]'}`}
                                InputProps={inputPropsTextField}
                                fullWidth
                            />
                            <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                                <span className="text-[13px]">{watch("doc_41_value_1")?.length || 0} / 255</span>
                            </div>
                        </div>
                    </div>
                }

                {/* เพิ่มเติม */}
                {
                    watch('doc_41_perm_lod_1') &&
                    <div className="gap-2 w-full flex items-center pt-2">
                        <div className="w-full ">
                            <label className={labelClass}>{`เพิ่มเติม:`}</label>
                            <TextField
                                {...register("doc_41_more_1")}
                                value={watch("doc_41_more_1") || ""}
                                label=""
                                multiline
                                onChange={(e) => {
                                    if (e.target.value.length <= 255) {
                                        setValue("doc_41_more_1", e.target.value);
                                    }
                                    handletrickerEdit()
                                }}
                                placeholder="ระบุรายละเอียด"
                                // disabled={isReadOnly}
                                disabled={(mode == 'view' || isShipper) ? true : false}
                                rows={2}
                                sx={textFieldSx}
                                // className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                                className={`${(mode == 'view' || isShipper) && 'bg-[#EFECEC] rounded-[8px]'}`}
                                InputProps={inputPropsTextField}
                                fullWidth
                            />
                            <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                                <span className="text-[13px]">{watch("doc_41_more_1")?.length || 0} / 255</span>
                            </div>
                        </div>
                    </div>
                }

                {/* Shipper */}
                {
                    watch('doc_41_perm_lod_1') &&
                    <div className="flex flex-wrap flex-auto">
                        <div className="grid grid-cols-2 gap-4 pt-2 w-full">
                            <div>
                                <label className={`${labelClass}`}>{`Shipper`}</label>
                                <Select
                                    id="shipper_id_1"
                                    multiple
                                    IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                    {...register("shipper_id_1", { required: false })}
                                    disabled={(mode == 'view' || !watch('doc_41_perm_lod_1') || isShipper) ? true : false}
                                    value={selectedShippers1}
                                    onChange={(e: any) => handleSelectChange(e, 1)}
                                    className={`${selectboxClass} ${(mode == 'view') && "!bg-[#EFECEC]"}`}
                                    sx={selectSx}
                                    displayEmpty
                                    renderValue={(selected) => {
                                        if (selected.length === 0) {
                                            return <Typography color="#9CA3AF" fontSize={14}>Select Shipper Name</Typography>;
                                        }
                                        // return selected.map((id) => dataShipper1.find((item: any) => item.id === id)?.name).join(", ");
                                        const shipper_data = dataShipperMaster?.filter((item: any) => !defaultShippersId1?.includes(item.id))
                                        return (
                                            <span className={`pl-[10px] text-[14px]`}>
                                                {shipper_data?.length == selectedShippers1?.length ? `Select All` : selected.map((id) => dataShipperMaster?.filter((item: any) => !defaultShippersId1?.includes(item.id)).find((item: any) => item.id === id)?.name).join(", ")}
                                            </span>
                                        );
                                    }}
                                    MenuProps={{ PaperProps: { style: { maxHeight: 48 * 4.5 + 8 } } }}
                                >
                                    {userDT?.account_manage?.[0]?.user_type_id !== 3 && (
                                        <MenuItem value="all">
                                            <Checkbox checked={selectedShippers1.length === dataShipperMaster?.length && dataShipperMaster?.length > 0} />
                                            <ListItemText
                                                primary="Select All"
                                                // sx={{ fontWeight: 'bold' }}
                                                primaryTypographyProps={{ sx: { fontWeight: 'bold' } }}
                                            />
                                        </MenuItem>
                                    )}

                                    {dataShipperMaster?.length > 0 && dataShipperMaster
                                        ?.filter((item: any) => !defaultShippersId1?.includes(item.id)) // เอาอันที่มีอยู่แล้วออกจาก option 
                                        ?.filter((item: any) => !defaultShippersId2?.includes(item.id)) // เอาอันที่มีอยู่แล้วออกจาก option 
                                        ?.filter((item: any) => !defaultShippersId3?.includes(item.id)) // เอาอันที่มีอยู่แล้วออกจาก option 
                                        ?.filter((item: any) => !defaultShippersId4?.includes(item.id)) // เอาอันที่มีอยู่แล้วออกจาก option 
                                        ?.filter((item: any) => !defaultShippersId5?.includes(item.id)) // เอาอันที่มีอยู่แล้วออกจาก option 

                                        // ?.filter((item: any) => !selectedShippers1.includes(item.id)) // เอาอันที่เลือกอยู่แล้วออกจาก option 
                                        ?.filter((item: any) => !selectedShippers2.includes(item.id)) // เอาอันที่เลือกอยู่แล้วออกจาก option 
                                        ?.filter((item: any) => !selectedShippers3.includes(item.id)) // เอาอันที่เลือกอยู่แล้วออกจาก option 
                                        ?.filter((item: any) => !selectedShippers4.includes(item.id)) // เอาอันที่เลือกอยู่แล้วออกจาก option 
                                        ?.filter((item: any) => !selectedShippers5.includes(item.id)) // เอาอันที่เลือกอยู่แล้วออกจาก option 
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


                            {/* File */}
                            <div>
                                {/* ถ้าเป็น create แสดงอันนี้ */}
                                {
                                    userDT?.account_manage?.[0]?.user_type_id !== 3 && mode == 'create' &&
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
                                    (mode == 'edit' || mode == 'view') && fileNameEditTextUrl1 !== '' &&
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
                        </div>
                    </div>
                }

                {/* shipper render */}
                {
                    watch('doc_41_perm_lod_1') && <>
                        <div className="flex flex-wrap flex-auto">

                            <div className="grid grid-cols-2 w-full">
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
                    </>
                }


            </div>


            {horizoneDivide()}





            {/* =============== ชุด 2 ===============*/}
            <div className="pb-5">

                <div className="gap-2 w-full flex items-center">
                    {/* เพิ่ม - ลด */}
                    <div className="grid grid-cols-3 gap-1 pt-4">
                        <label className="w-[85px] text-[#58585A]">
                            <input
                                type="radio"
                                {...register("doc_41_perm_lod_2", { required: false })}
                                value={1}
                                disabled={(mode == 'view' || isShipper || idChudTee2) ? true : false || watch('doc_41_perm_lod_1') ? false : true}
                                checked={watch("doc_41_perm_lod_2") == 1 || watch("doc_41_perm_lod_2") == "1"}
                                onChange={(e) => {
                                    setValue('doc_41_perm_lod_2', e.target.value)
                                    handletrickerEdit()
                                }}
                                className="mr-1 accent-[#1473A1]"
                            />
                            {`เพิ่ม`}
                        </label>

                        <label className="w-[85px] text-[#58585A]">
                            <input
                                type="radio"
                                {...register("doc_41_perm_lod_2", { required: false })}
                                value={2}
                                disabled={(mode == 'view' || isShipper || idChudTee2) ? true : false || watch('doc_41_perm_lod_1') ? false : true}
                                checked={watch("doc_41_perm_lod_2") == 2 || watch("doc_41_perm_lod_2") == "2"}
                                onChange={(e) => {
                                    setValue('doc_41_perm_lod_2', e.target.value)
                                    handletrickerEdit()
                                }}
                                className="mr-1 accent-[#1473A1]"
                            />
                            {`ลด`}
                        </label>

                        <label className="w-[85px] text-[#58585A]">
                            <input
                                type="radio"
                                {...register("doc_41_perm_lod_2", { required: false })}
                                value={3}
                                disabled={(mode == 'view' || isShipper || idChudTee2) ? true : false || watch('doc_41_perm_lod_1') ? false : true}
                                checked={watch("doc_41_perm_lod_2") == 3 || watch("doc_41_perm_lod_2") == "3"}
                                onChange={(e) => {
                                    setValue('doc_41_perm_lod_2', e.target.value)
                                    handletrickerEdit()
                                }}
                                className="mr-1 accent-[#1473A1]"
                            />
                            {`อื่น ๆ`}
                        </label>
                    </div>

                    {/* จุดส่งเข้า - จุดส่งออก */}
                    {
                        (watch('doc_41_perm_lod_2') !== 3 && watch('doc_41_perm_lod_2') !== "3") && <div className="grid grid-cols-2 gap-1 pt-4">
                            <label className="w-[100px] text-[#58585A]">
                                <input
                                    type="radio"
                                    {...register("doc_7_jud_soong_kaw_ook_2", { required: false })}
                                    value={3}
                                    disabled={(mode == 'view' || isShipper || idChudTee2) ? true : false || watch('doc_41_perm_lod_1') ? false : true}
                                    checked={watch("doc_7_jud_soong_kaw_ook_2") == 3 || watch("doc_7_jud_soong_kaw_ook_2") == "3"}
                                    onChange={(e) => {
                                        setValue('doc_7_jud_soong_kaw_ook_2', e.target.value)
                                        handletrickerEdit()
                                    }}
                                    className="mr-1 accent-[#1473A1]"
                                />
                                {`จุดส่งเข้า`}
                            </label>

                            <label className="w-[100px] text-[#58585A]">
                                <input
                                    type="radio"
                                    {...register("doc_7_jud_soong_kaw_ook_2", { required: false })}
                                    value={4}
                                    disabled={(mode == 'view' || isShipper || idChudTee2) ? true : false || watch('doc_41_perm_lod_1') ? false : true}
                                    checked={watch("doc_7_jud_soong_kaw_ook_2") == 4 || watch("doc_7_jud_soong_kaw_ook_2") == "4"}
                                    onChange={(e) => {
                                        setValue('doc_7_jud_soong_kaw_ook_2', e.target.value)
                                        handletrickerEdit()
                                    }}
                                    className="mr-1 accent-[#1473A1]"
                                />
                                {`จุดส่งออก`}
                            </label>
                        </div>
                    }

                </div>


                {/* ปริมาณ */}
                {
                    (watch('doc_41_perm_lod_2') !== 3 && watch('doc_41_perm_lod_2') !== "3" && watch('doc_41_perm_lod_2')) &&
                    <div className="gap-2 w-full flex items-center pt-4">
                        <div className="w-full ">
                            <label className={labelClass}>{`ปริมาณ:`}</label>
                            <TextField
                                {...register("doc_41_value_2")}
                                value={watch("doc_41_value_2") || ""}
                                label=""
                                multiline
                                onChange={(e) => {
                                    if (e.target.value.length <= 255) {
                                        setValue("doc_41_value_2", e.target.value);
                                    }
                                }}
                                placeholder="ระบุรายละเอียด"
                                // disabled={isReadOnly}
                                disabled={(mode == 'view' || isShipper) ? true : false}
                                rows={2}
                                sx={textFieldSx}
                                // className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                                className={`${(mode == 'view' || isShipper) && 'bg-[#EFECEC] rounded-[8px]'}`}
                                InputProps={inputPropsTextField}
                                fullWidth
                            />
                            <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                                <span className="text-[13px]">{watch("doc_41_value_2")?.length || 0} / 255</span>
                            </div>
                        </div>
                    </div>
                }

                {/* เพิ่มเติม */}
                {
                    watch('doc_41_perm_lod_2') &&
                    <div className="gap-2 w-full flex items-center pt-2">
                        <div className="w-full ">
                            <label className={labelClass}>{`เพิ่มเติม:`}</label>
                            <TextField
                                {...register("doc_41_more_2")}
                                value={watch("doc_41_more_2") || ""}
                                label=""
                                multiline
                                onChange={(e) => {
                                    if (e.target.value.length <= 255) {
                                        setValue("doc_41_more_2", e.target.value);
                                    }
                                }}
                                placeholder="ระบุรายละเอียด"
                                // disabled={isReadOnly}
                                disabled={(mode == 'view' || isShipper) ? true : false}
                                rows={2}
                                sx={textFieldSx}
                                // className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                                className={`${(mode == 'view' || isShipper) && 'bg-[#EFECEC] rounded-[8px]'}`}
                                InputProps={inputPropsTextField}
                                fullWidth
                            />
                            <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                                <span className="text-[13px]">{watch("doc_41_more_2")?.length || 0} / 255</span>
                            </div>
                        </div>
                    </div>
                }

                {/* Shipper */}
                {
                    watch('doc_41_perm_lod_2') &&
                    <div className="flex flex-wrap flex-auto">
                        <div className="grid grid-cols-2 gap-4 pt-2 w-full">
                            <div>
                                <label className={`${labelClass}`}>{`Shipper`}</label>
                                <Select
                                    id="shipper_id_2"
                                    multiple
                                    IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                    {...register("shipper_id_2", { required: false })}
                                    disabled={(mode == 'view' || !watch('doc_41_perm_lod_2') || isShipper) ? true : false}
                                    value={selectedShippers2}
                                    onChange={(e: any) => handleSelectChange(e, 2)}
                                    className={`${selectboxClass} ${(mode == 'view') && "!bg-[#EFECEC]"}`}
                                    sx={selectSx}
                                    displayEmpty
                                    renderValue={(selected) => {
                                        if (selected.length === 0) {
                                            return <Typography color="#9CA3AF" fontSize={14}>Select Shipper Name</Typography>;
                                        }
                                        // return selected.map((id) => dataShipper1.find((item: any) => item.id === id)?.name).join(", ");
                                        const shipper_data = dataShipperMaster?.filter((item: any) => !defaultShippersId2?.includes(item.id))
                                        return (
                                            <span className={`pl-[10px] text-[14px]`}>
                                                {shipper_data?.length == selectedShippers2?.length ? `Select All` : selected.map((id) => dataShipperMaster?.filter((item: any) => !defaultShippersId2?.includes(item.id)).find((item: any) => item.id === id)?.name).join(", ")}
                                            </span>
                                        );
                                    }}
                                    MenuProps={{ PaperProps: { style: { maxHeight: 48 * 4.5 + 8 } } }}
                                >
                                    {userDT?.account_manage?.[0]?.user_type_id !== 3 && (
                                        <MenuItem value="all">
                                            <Checkbox checked={selectedShippers2.length === dataShipperMaster?.length && dataShipperMaster?.length > 0} />
                                            <ListItemText
                                                primary="Select All"
                                                // sx={{ fontWeight: 'bold' }}
                                                primaryTypographyProps={{ sx: { fontWeight: 'bold' } }}
                                            />
                                        </MenuItem>
                                    )}

                                    {dataShipperMaster?.length > 0 && dataShipperMaster
                                        ?.filter((item: any) => !defaultShippersId1?.includes(item.id)) // เอาอันที่มีอยู่แล้วออกจาก option 
                                        ?.filter((item: any) => !defaultShippersId2?.includes(item.id)) // เอาอันที่มีอยู่แล้วออกจาก option 
                                        ?.filter((item: any) => !defaultShippersId3?.includes(item.id)) // เอาอันที่มีอยู่แล้วออกจาก option 
                                        ?.filter((item: any) => !defaultShippersId4?.includes(item.id)) // เอาอันที่มีอยู่แล้วออกจาก option 
                                        ?.filter((item: any) => !defaultShippersId5?.includes(item.id)) // เอาอันที่มีอยู่แล้วออกจาก option 

                                        ?.filter((item: any) => !selectedShippers1.includes(item.id)) // เอาอันที่เลือกอยู่แล้วออกจาก option 
                                        // ?.filter((item: any) => !selectedShippers2.includes(item.id)) // เอาอันที่เลือกอยู่แล้วออกจาก option 
                                        ?.filter((item: any) => !selectedShippers3.includes(item.id)) // เอาอันที่เลือกอยู่แล้วออกจาก option 
                                        ?.filter((item: any) => !selectedShippers4.includes(item.id)) // เอาอันที่เลือกอยู่แล้วออกจาก option 
                                        ?.filter((item: any) => !selectedShippers5.includes(item.id)) // เอาอันที่เลือกอยู่แล้วออกจาก option 

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


                            {/* File */}
                            <div>
                                {/* ถ้าเป็น create แสดงอันนี้ */}
                                {
                                    userDT?.account_manage?.[0]?.user_type_id !== 3 && mode == 'create' &&
                                    <div className="grid grid-cols-2 w-full">
                                        <label className={`${labelClass}`}>{`File`}</label>
                                        <div className={`flex items-center col-span-2 ${IsErrorChudTee == '2' ? 'border  border-[#ff0000] rounded-r-lg rounded-l-lg' : ''}`}>
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
                                                    onChange={(e) => handleFileChange(e, 2)}
                                                />
                                            </label>

                                            <div className="bg-white text-[#9CA3AF] text-sm w-[80%] !h-[44px] px-2 py-2 rounded-r-[6px] border-l-0 border border-gray-300 truncate overflow-hidden flex items-center">
                                                <span className="truncate">
                                                    {fileName2}
                                                </span>
                                                {fileName2 !== "Maximum File 5 MB" && (
                                                    <CloseOutlinedIcon
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
                                    (mode == 'edit' || mode == 'view') && fileNameEditTextUrl2 !== '' &&
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
                        </div>
                    </div>
                }

                {/* shipper render */}
                {
                    watch('doc_41_perm_lod_2') && <>
                        <div className="flex flex-wrap flex-auto">

                            <div className="grid grid-cols-2 w-full">
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
                    </>
                }

            </div>


            {horizoneDivide()}





            {/* =============== ชุด 3 ===============*/}
            <div className="pb-5">
                <div className="gap-2 w-full flex items-center">
                    {/* เพิ่ม - ลด */}
                    <div className="grid grid-cols-3 gap-1 pt-4">
                        <label className="w-[85px] text-[#58585A]">
                            <input
                                type="radio"
                                {...register("doc_41_perm_lod_3", { required: false })}
                                value={1}
                                disabled={(mode == 'view' || isShipper || idChudTee3) ? true : false || watch('doc_41_perm_lod_2') ? false : true}
                                checked={watch("doc_41_perm_lod_3") == 1 || watch("doc_41_perm_lod_3") == "1"}
                                onChange={(e) => {
                                    setValue('doc_41_perm_lod_3', e.target.value)
                                    handletrickerEdit()
                                }}
                                className="mr-1 accent-[#1473A1]"
                            />
                            {`เพิ่ม`}
                        </label>

                        <label className="w-[85px] text-[#58585A]">
                            <input
                                type="radio"
                                {...register("doc_41_perm_lod_3", { required: false })}
                                value={2}
                                disabled={(mode == 'view' || isShipper || idChudTee3) ? true : false || watch('doc_41_perm_lod_2') ? false : true}
                                checked={watch("doc_41_perm_lod_3") == 2 || watch("doc_41_perm_lod_3") == "2"}
                                onChange={(e) => {
                                    setValue('doc_41_perm_lod_3', e.target.value)
                                    handletrickerEdit()
                                }}
                                className="mr-1 accent-[#1473A1]"
                            />
                            {`ลด`}
                        </label>

                        <label className="w-[85px] text-[#58585A]">
                            <input
                                type="radio"
                                {...register("doc_41_perm_lod_3", { required: false })}
                                value={3}
                                disabled={(mode == 'view' || isShipper || idChudTee3) ? true : false || watch('doc_41_perm_lod_2') ? false : true}
                                checked={watch("doc_41_perm_lod_3") == 3 || watch("doc_41_perm_lod_3") == "3"}
                                onChange={(e) => {
                                    setValue('doc_41_perm_lod_3', e.target.value)
                                    handletrickerEdit()
                                }}
                                className="mr-1 accent-[#1473A1]"
                            />
                            {`อื่น ๆ`}
                        </label>
                    </div>

                    {/* จุดส่งเข้า - จุดส่งออก */}
                    {
                        (watch('doc_41_perm_lod_3') !== 3 && watch('doc_41_perm_lod_3') !== "3") && <div className="grid grid-cols-2 gap-1 pt-4">
                            <label className="w-[100px] text-[#58585A]">
                                <input
                                    type="radio"
                                    {...register("doc_7_jud_soong_kaw_ook_3", { required: false })}
                                    value={3}
                                    disabled={(mode == 'view' || isShipper || idChudTee3) ? true : false || watch('doc_41_perm_lod_2') ? false : true}
                                    checked={watch("doc_7_jud_soong_kaw_ook_3") == 3 || watch("doc_7_jud_soong_kaw_ook_3") == "3"}
                                    onChange={(e) => {
                                        setValue('doc_7_jud_soong_kaw_ook_3', e.target.value)
                                    }}
                                    className="mr-1 accent-[#1473A1]"
                                />
                                {`จุดส่งเข้า`}
                            </label>

                            <label className="w-[100px] text-[#58585A]">
                                <input
                                    type="radio"
                                    {...register("doc_7_jud_soong_kaw_ook_3", { required: false })}
                                    value={4}
                                    disabled={(mode == 'view' || isShipper || idChudTee3) ? true : false || watch('doc_41_perm_lod_2') ? false : true}
                                    checked={watch("doc_7_jud_soong_kaw_ook_3") == 4 || watch("doc_7_jud_soong_kaw_ook_3") == "4"}
                                    onChange={(e) => {
                                        setValue('doc_7_jud_soong_kaw_ook_3', e.target.value)
                                    }}
                                    className="mr-1 accent-[#1473A1]"
                                />
                                {`จุดส่งออก`}
                            </label>
                        </div>
                    }

                </div>


                {/* ปริมาณ */}
                {
                    (watch('doc_41_perm_lod_3') !== 3 && watch('doc_41_perm_lod_3') !== "3" && watch('doc_41_perm_lod_3')) &&
                    <div className="gap-2 w-full flex items-center pt-4">
                        <div className="w-full ">
                            <label className={labelClass}>{`ปริมาณ:`}</label>
                            <TextField
                                {...register("doc_41_value_3")}
                                value={watch("doc_41_value_3") || ""}
                                label=""
                                multiline
                                onChange={(e) => {
                                    if (e.target.value.length <= 255) {
                                        setValue("doc_41_value_3", e.target.value);
                                    }
                                }}
                                placeholder="ระบุรายละเอียด"
                                // disabled={isReadOnly}
                                disabled={(mode == 'view' || isShipper) ? true : false}
                                rows={2}
                                sx={textFieldSx}
                                // className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                                className={`${(mode == 'view' || isShipper) && 'bg-[#EFECEC] rounded-[8px]'}`}
                                InputProps={inputPropsTextField}
                                fullWidth
                            />
                            <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                                <span className="text-[13px]">{watch("doc_41_value_3")?.length || 0} / 255</span>
                            </div>
                        </div>
                    </div>
                }

                {/* เพิ่มเติม */}
                {
                    watch('doc_41_perm_lod_3') &&
                    <div className="gap-2 w-full flex items-center pt-2">
                        <div className="w-full ">
                            <label className={labelClass}>{`เพิ่มเติม:`}</label>
                            <TextField
                                {...register("doc_41_more_3")}
                                value={watch("doc_41_more_3") || ""}
                                label=""
                                multiline
                                onChange={(e) => {
                                    if (e.target.value.length <= 255) {
                                        setValue("doc_41_more_3", e.target.value);
                                    }
                                }}
                                placeholder="ระบุรายละเอียด"
                                // disabled={isReadOnly}
                                disabled={(mode == 'view' || isShipper) ? true : false}
                                rows={2}
                                sx={textFieldSx}
                                // className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                                className={`${(mode == 'view' || isShipper) && 'bg-[#EFECEC] rounded-[8px]'}`}
                                InputProps={inputPropsTextField}
                                fullWidth
                            />
                            <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                                <span className="text-[13px]">{watch("doc_41_more_3")?.length || 0} / 255</span>
                            </div>
                        </div>
                    </div>
                }

                {/* Shipper */}
                {
                    watch('doc_41_perm_lod_3') &&
                    <div className="flex flex-wrap flex-auto">
                        <div className="grid grid-cols-2 gap-4 pt-2 w-full">
                            <div>
                                <label className={`${labelClass}`}>{`Shipper`}</label>
                                <Select
                                    id="shipper_id_3"
                                    multiple
                                    IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                    {...register("shipper_id_3", { required: false })}
                                    disabled={(mode == 'view' || !watch('doc_41_perm_lod_3') || isShipper) ? true : false}
                                    value={selectedShippers3}
                                    onChange={(e: any) => handleSelectChange(e, 3)}
                                    className={`${selectboxClass} ${(mode == 'view') && "!bg-[#EFECEC]"}`}
                                    sx={selectSx}
                                    displayEmpty
                                    renderValue={(selected) => {
                                        if (selected.length === 0) {
                                            return <Typography color="#9CA3AF" fontSize={14}>Select Shipper Name</Typography>;
                                        }
                                        // return selected.map((id) => dataShipper1.find((item: any) => item.id === id)?.name).join(", ");
                                        const shipper_data = dataShipperMaster?.filter((item: any) => !defaultShippersId3?.includes(item.id))
                                        return (
                                            <span className={`pl-[10px] text-[14px]`}>
                                                {shipper_data?.length == selectedShippers3?.length ? `Select All` : selected.map((id) => dataShipperMaster?.filter((item: any) => !defaultShippersId3?.includes(item.id)).find((item: any) => item.id === id)?.name).join(", ")}
                                            </span>
                                        );
                                    }}
                                    MenuProps={{ PaperProps: { style: { maxHeight: 48 * 4.5 + 8 } } }}
                                >
                                    {userDT?.account_manage?.[0]?.user_type_id !== 3 && (
                                        <MenuItem value="all">
                                            <Checkbox checked={selectedShippers3.length === dataShipperMaster?.length && dataShipperMaster?.length > 0} />
                                            <ListItemText
                                                primary="Select All"
                                                // sx={{ fontWeight: 'bold' }}
                                                primaryTypographyProps={{ sx: { fontWeight: 'bold' } }}
                                            />
                                        </MenuItem>
                                    )}

                                    {dataShipperMaster?.length > 0 && dataShipperMaster
                                        ?.filter((item: any) => !defaultShippersId1?.includes(item.id)) // เอาอันที่มีอยู่แล้วออกจาก option 
                                        ?.filter((item: any) => !defaultShippersId2?.includes(item.id)) // เอาอันที่มีอยู่แล้วออกจาก option 
                                        ?.filter((item: any) => !defaultShippersId3?.includes(item.id)) // เอาอันที่มีอยู่แล้วออกจาก option 
                                        ?.filter((item: any) => !defaultShippersId4?.includes(item.id)) // เอาอันที่มีอยู่แล้วออกจาก option 
                                        ?.filter((item: any) => !defaultShippersId5?.includes(item.id)) // เอาอันที่มีอยู่แล้วออกจาก option 

                                        ?.filter((item: any) => !selectedShippers1.includes(item.id)) // เอาอันที่เลือกอยู่แล้วออกจาก option 
                                        ?.filter((item: any) => !selectedShippers2.includes(item.id)) // เอาอันที่เลือกอยู่แล้วออกจาก option 
                                        // ?.filter((item: any) => !selectedShippers3.includes(item.id)) // เอาอันที่เลือกอยู่แล้วออกจาก option 
                                        ?.filter((item: any) => !selectedShippers4.includes(item.id)) // เอาอันที่เลือกอยู่แล้วออกจาก option 
                                        ?.filter((item: any) => !selectedShippers5.includes(item.id)) // เอาอันที่เลือกอยู่แล้วออกจาก option 

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


                            {/* File */}
                            <div>
                                {/* ถ้าเป็น create แสดงอันนี้ */}
                                {
                                    userDT?.account_manage?.[0]?.user_type_id !== 3 && mode == 'create' &&
                                    <div className="grid grid-cols-2 w-full">
                                        <label className={`${labelClass}`}>{`File`}</label>
                                        <div className={`flex items-center col-span-2 ${IsErrorChudTee == '3' ? 'border  border-[#ff0000] rounded-r-lg rounded-l-lg' : ''}`}>
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
                                                    onChange={(e) => handleFileChange(e, 3)}
                                                />
                                            </label>

                                            <div className="bg-white text-[#9CA3AF] text-sm w-[80%] !h-[44px] px-2 py-2 rounded-r-[6px] border-l-0 border border-gray-300 truncate overflow-hidden flex items-center">
                                                <span className="truncate">
                                                    {fileName3}
                                                </span>
                                                {fileName3 !== "Maximum File 5 MB" && (
                                                    <CloseOutlinedIcon
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
                                    (mode == 'edit' || mode == 'view') && fileNameEditTextUrl3 !== '' &&
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
                        </div>
                    </div>
                }

                {/* shipper render */}
                {
                    watch('doc_41_perm_lod_3') && <>
                        <div className="flex flex-wrap flex-auto">
                            <div className="grid grid-cols-2 w-full">
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
                    </>
                }
            </div>



            {horizoneDivide()}





            {/* =============== ชุด 4 ===============*/}
            <div className="pb-5">
                <div className="gap-2 w-full flex items-center">
                    {/* เพิ่ม - ลด */}
                    <div className="grid grid-cols-3 gap-1 pt-4">
                        <label className="w-[85px] text-[#58585A]">
                            <input
                                type="radio"
                                {...register("doc_41_perm_lod_4", { required: false })}
                                value={1}
                                disabled={(mode == 'view' || isShipper || idChudTee4) ? true : false || watch('doc_41_perm_lod_3') ? false : true}
                                checked={watch("doc_41_perm_lod_4") == 1 || watch("doc_41_perm_lod_4") == "1"}
                                onChange={(e) => {
                                    setValue('doc_41_perm_lod_4', e.target.value)
                                    handletrickerEdit()
                                }}
                                className="mr-1 accent-[#1473A1]"
                            />
                            {`เพิ่ม`}
                        </label>

                        <label className="w-[85px] text-[#58585A]">
                            <input
                                type="radio"
                                {...register("doc_41_perm_lod_4", { required: false })}
                                value={2}
                                disabled={(mode == 'view' || isShipper || idChudTee4) ? true : false || watch('doc_41_perm_lod_3') ? false : true}
                                checked={watch("doc_41_perm_lod_4") == 2 || watch("doc_41_perm_lod_4") == "2"}
                                onChange={(e) => {
                                    setValue('doc_41_perm_lod_4', e.target.value)
                                    handletrickerEdit()
                                }}
                                className="mr-1 accent-[#1473A1]"
                            />
                            {`ลด`}
                        </label>

                        <label className="w-[85px] text-[#58585A]">
                            <input
                                type="radio"
                                {...register("doc_41_perm_lod_4", { required: false })}
                                value={3}
                                disabled={(mode == 'view' || isShipper || idChudTee4) ? true : false || watch('doc_41_perm_lod_3') ? false : true}
                                checked={watch("doc_41_perm_lod_4") == 3 || watch("doc_41_perm_lod_4") == "3"}
                                onChange={(e) => {
                                    setValue('doc_41_perm_lod_4', e.target.value)
                                    handletrickerEdit()
                                }}
                                className="mr-1 accent-[#1473A1]"
                            />
                            {`อื่น ๆ`}
                        </label>
                    </div>

                    {/* จุดส่งเข้า - จุดส่งออก */}
                    {
                        (watch('doc_41_perm_lod_4') !== 3 && watch('doc_41_perm_lod_4') !== "3") && <div className="grid grid-cols-2 gap-1 pt-4">
                            <label className="w-[100px] text-[#58585A]">
                                <input
                                    type="radio"
                                    {...register("doc_7_jud_soong_kaw_ook_4", { required: false })}
                                    value={3}
                                    disabled={(mode == 'view' || isShipper || idChudTee4) ? true : false || watch('doc_41_perm_lod_3') ? false : true}
                                    checked={watch("doc_7_jud_soong_kaw_ook_4") == 3 || watch("doc_7_jud_soong_kaw_ook_4") == "3"}
                                    onChange={(e) => {
                                        setValue('doc_7_jud_soong_kaw_ook_4', e.target.value)
                                        handletrickerEdit()
                                    }}
                                    className="mr-1 accent-[#1473A1]"
                                />
                                {`จุดส่งเข้า`}
                            </label>

                            <label className="w-[100px] text-[#58585A]">
                                <input
                                    type="radio"
                                    {...register("doc_7_jud_soong_kaw_ook_4", { required: false })}
                                    value={4}
                                    disabled={(mode == 'view' || isShipper || idChudTee4) ? true : false || watch('doc_41_perm_lod_3') ? false : true}
                                    checked={watch("doc_7_jud_soong_kaw_ook_4") == 4 || watch("doc_7_jud_soong_kaw_ook_4") == "4"}
                                    onChange={(e) => {
                                        setValue('doc_7_jud_soong_kaw_ook_4', e.target.value)
                                        handletrickerEdit()
                                    }}
                                    className="mr-1 accent-[#1473A1]"
                                />
                                {`จุดส่งออก`}
                            </label>
                        </div>
                    }

                </div>


                {/* ปริมาณ */}
                {
                    (watch('doc_41_perm_lod_4') !== 3 && watch('doc_41_perm_lod_4') !== "3" && watch('doc_41_perm_lod_4')) &&
                    <div className="gap-2 w-full flex items-center pt-4">
                        <div className="w-full ">
                            <label className={labelClass}>{`ปริมาณ:`}</label>
                            <TextField
                                {...register("doc_41_value_4")}
                                value={watch("doc_41_value_4") || ""}
                                label=""
                                multiline
                                onChange={(e) => {
                                    if (e.target.value.length <= 255) {
                                        setValue("doc_41_value_4", e.target.value);
                                    }
                                }}
                                placeholder="ระบุรายละเอียด"
                                // disabled={isReadOnly}
                                disabled={(mode == 'view' || isShipper) ? true : false}
                                rows={2}
                                sx={textFieldSx}
                                // className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                                className={`${(mode == 'view' || isShipper) && 'bg-[#EFECEC] rounded-[8px]'}`}
                                InputProps={inputPropsTextField}
                                fullWidth
                            />
                            <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                                <span className="text-[13px]">{watch("doc_41_value_4")?.length || 0} / 255</span>
                            </div>
                        </div>
                    </div>
                }

                {/* เพิ่มเติม */}
                {
                    watch('doc_41_perm_lod_4') &&
                    <div className="gap-2 w-full flex items-center pt-2">
                        <div className="w-full ">
                            <label className={labelClass}>{`เพิ่มเติม:`}</label>
                            <TextField
                                {...register("doc_41_more_4")}
                                value={watch("doc_41_more_4") || ""}
                                label=""
                                multiline
                                onChange={(e) => {
                                    if (e.target.value.length <= 255) {
                                        setValue("doc_41_more_4", e.target.value);
                                    }
                                }}
                                placeholder="ระบุรายละเอียด"
                                // disabled={isReadOnly}
                                disabled={(mode == 'view' || isShipper) ? true : false}
                                rows={2}
                                sx={textFieldSx}
                                // className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                                className={`${(mode == 'view' || isShipper) && 'bg-[#EFECEC] rounded-[8px]'}`}
                                InputProps={inputPropsTextField}
                                fullWidth
                            />
                            <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                                <span className="text-[13px]">{watch("doc_41_more_4")?.length || 0} / 255</span>
                            </div>
                        </div>
                    </div>
                }

                {/* Shipper */}
                {
                    watch('doc_41_perm_lod_4') &&
                    <div className="flex flex-wrap flex-auto">
                        <div className="grid grid-cols-2 gap-4 pt-2 w-full">
                            <div>
                                <label className={`${labelClass}`}>{`Shipper`}</label>
                                <Select
                                    id="shipper_id_4"
                                    multiple
                                    IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                    {...register("shipper_id_4", { required: false })}
                                    disabled={(mode == 'view' || !watch('doc_41_perm_lod_4') || isShipper) ? true : false}
                                    value={selectedShippers4}
                                    onChange={(e: any) => handleSelectChange(e, 4)}
                                    className={`${selectboxClass} ${(mode == 'view') && "!bg-[#EFECEC]"}`}
                                    sx={selectSx}
                                    displayEmpty
                                    renderValue={(selected) => {
                                        if (selected.length === 0) {
                                            return <Typography color="#9CA3AF" fontSize={14}>Select Shipper Name</Typography>;
                                        }
                                        // return selected.map((id) => dataShipper1.find((item: any) => item.id === id)?.name).join(", ");
                                        const shipper_data = dataShipperMaster?.filter((item: any) => !defaultShippersId4?.includes(item.id))
                                        return (
                                            <span className={`pl-[10px] text-[14px]`}>
                                                {shipper_data?.length == selectedShippers4?.length ? `Select All` : selected.map((id) => dataShipperMaster?.filter((item: any) => !defaultShippersId4?.includes(item.id)).find((item: any) => item.id === id)?.name).join(", ")}
                                            </span>
                                        );
                                    }}
                                    MenuProps={{ PaperProps: { style: { maxHeight: 48 * 4.5 + 8 } } }}
                                >
                                    {userDT?.account_manage?.[0]?.user_type_id !== 3 && (
                                        <MenuItem value="all">
                                            <Checkbox checked={selectedShippers4.length === dataShipperMaster?.length && dataShipperMaster?.length > 0} />
                                            <ListItemText
                                                primary="Select All"
                                                // sx={{ fontWeight: 'bold' }}
                                                primaryTypographyProps={{ sx: { fontWeight: 'bold' } }}
                                            />
                                        </MenuItem>
                                    )}

                                    {dataShipperMaster?.length > 0 && dataShipperMaster
                                        ?.filter((item: any) => !defaultShippersId1?.includes(item.id)) // เอาอันที่มีอยู่แล้วออกจาก option 
                                        ?.filter((item: any) => !defaultShippersId2?.includes(item.id)) // เอาอันที่มีอยู่แล้วออกจาก option 
                                        ?.filter((item: any) => !defaultShippersId3?.includes(item.id)) // เอาอันที่มีอยู่แล้วออกจาก option 
                                        ?.filter((item: any) => !defaultShippersId4?.includes(item.id)) // เอาอันที่มีอยู่แล้วออกจาก option 
                                        ?.filter((item: any) => !defaultShippersId5?.includes(item.id)) // เอาอันที่มีอยู่แล้วออกจาก option 

                                        ?.filter((item: any) => !selectedShippers1.includes(item.id)) // เอาอันที่เลือกอยู่แล้วออกจาก option 
                                        ?.filter((item: any) => !selectedShippers2.includes(item.id)) // เอาอันที่เลือกอยู่แล้วออกจาก option 
                                        ?.filter((item: any) => !selectedShippers3.includes(item.id)) // เอาอันที่เลือกอยู่แล้วออกจาก option 
                                        // ?.filter((item: any) => !selectedShippers4.includes(item.id)) // เอาอันที่เลือกอยู่แล้วออกจาก option 
                                        ?.filter((item: any) => !selectedShippers5.includes(item.id)) // เอาอันที่เลือกอยู่แล้วออกจาก option 

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


                            {/* File */}
                            <div>
                                {/* ถ้าเป็น create แสดงอันนี้ */}
                                {
                                    userDT?.account_manage?.[0]?.user_type_id !== 3 && mode == 'create' &&
                                    <div className="grid grid-cols-2 w-full">
                                        <label className={`${labelClass}`}>{`File`}</label>
                                        <div className={`flex items-center col-span-2 ${IsErrorChudTee == '4' ? 'border  border-[#ff0000] rounded-r-lg rounded-l-lg' : ''}`}>
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
                                                    onChange={(e) => handleFileChange(e, 4)}
                                                />
                                            </label>

                                            <div className="bg-white text-[#9CA3AF] text-sm w-[80%] !h-[44px] px-2 py-2 rounded-r-[6px] border-l-0 border border-gray-300 truncate overflow-hidden flex items-center">
                                                <span className="truncate">
                                                    {fileName4}
                                                </span>
                                                {fileName4 !== "Maximum File 5 MB" && (
                                                    <CloseOutlinedIcon
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
                                    (mode == 'edit' || mode == 'view') && fileNameEditTextUrl4 !== '' &&
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
                        </div>
                    </div>
                }

                {/* shipper render */}
                {
                    watch('doc_41_perm_lod_4') && <>
                        <div className="flex flex-wrap flex-auto">
                            <div className="grid grid-cols-2 w-full">
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
                    </>
                }
            </div>

            {horizoneDivide()}



            {/* =============== ชุด 5 ===============*/}
            <div className="pb-5">
                <div className="gap-2 w-full flex items-center">
                    {/* เพิ่ม - ลด */}
                    <div className="grid grid-cols-3 gap-1 pt-4">
                        <label className="w-[85px] text-[#58585A]">
                            <input
                                type="radio"
                                {...register("doc_41_perm_lod_5", { required: false })}
                                value={1}
                                disabled={(mode == 'view' || isShipper || idChudTee5) ? true : false || watch('doc_41_perm_lod_3') ? false : true}
                                checked={watch("doc_41_perm_lod_5") == 1 || watch("doc_41_perm_lod_5") == "1"}
                                onChange={(e) => {
                                    setValue('doc_41_perm_lod_5', e.target.value)
                                }}
                                className="mr-1 accent-[#1473A1]"
                            />
                            {`เพิ่ม`}
                        </label>

                        <label className="w-[85px] text-[#58585A]">
                            <input
                                type="radio"
                                {...register("doc_41_perm_lod_5", { required: false })}
                                value={2}
                                disabled={(mode == 'view' || isShipper || idChudTee5) ? true : false || watch('doc_41_perm_lod_3') ? false : true}
                                checked={watch("doc_41_perm_lod_5") == 2 || watch("doc_41_perm_lod_5") == "2"}
                                onChange={(e) => {
                                    setValue('doc_41_perm_lod_5', e.target.value)
                                }}
                                className="mr-1 accent-[#1473A1]"
                            />
                            {`ลด`}
                        </label>

                        <label className="w-[85px] text-[#58585A]">
                            <input
                                type="radio"
                                {...register("doc_41_perm_lod_5", { required: false })}
                                value={3}
                                disabled={(mode == 'view' || isShipper || idChudTee5) ? true : false || watch('doc_41_perm_lod_3') ? false : true}
                                checked={watch("doc_41_perm_lod_5") == 3 || watch("doc_41_perm_lod_5") == "3"}
                                onChange={(e) => {
                                    setValue('doc_41_perm_lod_5', e.target.value)
                                }}
                                className="mr-1 accent-[#1473A1]"
                            />
                            {`อื่น ๆ`}
                        </label>
                    </div>

                    {/* จุดส่งเข้า - จุดส่งออก */}
                    {
                        (watch('doc_41_perm_lod_5') !== 3 && watch('doc_41_perm_lod_5') !== "3") && <div className="grid grid-cols-2 gap-1 pt-4">
                            <label className="w-[100px] text-[#58585A]">
                                <input
                                    type="radio"
                                    {...register("doc_7_jud_soong_kaw_ook_5", { required: false })}
                                    value={3}
                                    disabled={(mode == 'view' || isShipper || idChudTee5) ? true : false || watch('doc_41_perm_lod_3') ? false : true}
                                    checked={watch("doc_7_jud_soong_kaw_ook_5") == 3 || watch("doc_7_jud_soong_kaw_ook_5") == "3"}
                                    onChange={(e) => {
                                        setValue('doc_7_jud_soong_kaw_ook_5', e.target.value)
                                    }}
                                    className="mr-1 accent-[#1473A1]"
                                />
                                {`จุดส่งเข้า`}
                            </label>

                            <label className="w-[100px] text-[#58585A]">
                                <input
                                    type="radio"
                                    {...register("doc_7_jud_soong_kaw_ook_5", { required: false })}
                                    value={4}
                                    disabled={(mode == 'view' || isShipper || idChudTee5) ? true : false || watch('doc_41_perm_lod_3') ? false : true}
                                    checked={watch("doc_7_jud_soong_kaw_ook_5") == 4 || watch("doc_7_jud_soong_kaw_ook_5") == "4"}
                                    onChange={(e) => {
                                        setValue('doc_7_jud_soong_kaw_ook_5', e.target.value)
                                    }}
                                    className="mr-1 accent-[#1473A1]"
                                />
                                {`จุดส่งออก`}
                            </label>
                        </div>
                    }

                </div>


                {/* ปริมาณ */}
                {
                    (watch('doc_41_perm_lod_5') !== 3 && watch('doc_41_perm_lod_5') !== "3" && watch('doc_41_perm_lod_5')) &&
                    <div className="gap-2 w-full flex items-center pt-4">
                        <div className="w-full ">
                            <label className={labelClass}>{`ปริมาณ:`}</label>
                            <TextField
                                {...register("doc_41_value_5")}
                                value={watch("doc_41_value_5") || ""}
                                label=""
                                multiline
                                onChange={(e) => {
                                    if (e.target.value.length <= 255) {
                                        setValue("doc_41_value_5", e.target.value);
                                    }
                                }}
                                placeholder="ระบุรายละเอียด"
                                // disabled={isReadOnly}
                                disabled={(mode == 'view' || isShipper) ? true : false}
                                rows={2}
                                sx={textFieldSx}
                                // className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                                className={`${(mode == 'view' || isShipper) && 'bg-[#EFECEC] rounded-[8px]'}`}
                                InputProps={inputPropsTextField}
                                fullWidth
                            />
                            <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                                <span className="text-[13px]">{watch("doc_41_value_5")?.length || 0} / 255</span>
                            </div>
                        </div>
                    </div>
                }

                {/* เพิ่มเติม */}
                {
                    watch('doc_41_perm_lod_5') &&
                    <div className="gap-2 w-full flex items-center pt-2">
                        <div className="w-full ">
                            <label className={labelClass}>{`เพิ่มเติม:`}</label>
                            <TextField
                                {...register("doc_41_more_5")}
                                value={watch("doc_41_more_5") || ""}
                                label=""
                                multiline
                                onChange={(e) => {
                                    if (e.target.value.length <= 255) {
                                        setValue("doc_41_more_5", e.target.value);
                                    }
                                }}
                                placeholder="ระบุรายละเอียด"
                                // disabled={isReadOnly}
                                disabled={(mode == 'view' || isShipper) ? true : false}
                                rows={2}
                                sx={textFieldSx}
                                // className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                                className={`${(mode == 'view' || isShipper) && 'bg-[#EFECEC] rounded-[8px]'}`}
                                InputProps={inputPropsTextField}
                                fullWidth
                            />
                            <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                                <span className="text-[13px]">{watch("doc_41_more_5")?.length || 0} / 255</span>
                            </div>
                        </div>
                    </div>
                }

                {/* Shipper */}
                {
                    watch('doc_41_perm_lod_5') &&
                    <div className="flex flex-wrap flex-auto">
                        <div className="grid grid-cols-2 gap-4 pt-2 w-full">
                            <div>
                                <label className={`${labelClass}`}>{`Shipper`}</label>
                                <Select
                                    id="shipper_id_5"
                                    multiple
                                    IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                    {...register("shipper_id_5", { required: false })}
                                    disabled={(mode == 'view' || !watch('doc_41_perm_lod_5') || isShipper) ? true : false}
                                    value={selectedShippers5}
                                    onChange={(e: any) => handleSelectChange(e, 5)}
                                    className={`${selectboxClass} ${(mode == 'view') && "!bg-[#EFECEC]"}`}
                                    sx={selectSx}
                                    displayEmpty
                                    renderValue={(selected) => {
                                        if (selected.length === 0) {
                                            return <Typography color="#9CA3AF" fontSize={14}>Select Shipper Name</Typography>;
                                        }
                                        // return selected.map((id) => dataShipper1.find((item: any) => item.id === id)?.name).join(", ");
                                        const shipper_data = dataShipperMaster?.filter((item: any) => !defaultShippersId5?.includes(item.id))
                                        return (
                                            <span className={`pl-[10px] text-[14px]`}>
                                                {shipper_data?.length == selectedShippers5?.length ? `Select All` : selected.map((id) => dataShipperMaster?.filter((item: any) => !defaultShippersId5?.includes(item.id)).find((item: any) => item.id === id)?.name).join(", ")}
                                            </span>
                                        );
                                    }}
                                    MenuProps={{ PaperProps: { style: { maxHeight: 48 * 4.5 + 8 } } }}
                                >
                                    {userDT?.account_manage?.[0]?.user_type_id !== 3 && (
                                        <MenuItem value="all">
                                            <Checkbox checked={selectedShippers5.length === dataShipperMaster?.length && dataShipperMaster?.length > 0} />
                                            <ListItemText
                                                primary="Select All"
                                                // sx={{ fontWeight: 'bold' }}
                                                primaryTypographyProps={{ sx: { fontWeight: 'bold' } }}
                                            />
                                        </MenuItem>
                                    )}

                                    {dataShipperMaster?.length > 0 && dataShipperMaster
                                        ?.filter((item: any) => !defaultShippersId1?.includes(item.id)) // เอาอันที่มีอยู่แล้วออกจาก option 
                                        ?.filter((item: any) => !defaultShippersId2?.includes(item.id)) // เอาอันที่มีอยู่แล้วออกจาก option 
                                        ?.filter((item: any) => !defaultShippersId3?.includes(item.id)) // เอาอันที่มีอยู่แล้วออกจาก option 
                                        ?.filter((item: any) => !defaultShippersId4?.includes(item.id)) // เอาอันที่มีอยู่แล้วออกจาก option 
                                        ?.filter((item: any) => !defaultShippersId5?.includes(item.id)) // เอาอันที่มีอยู่แล้วออกจาก option 

                                        ?.filter((item: any) => !selectedShippers1.includes(item.id)) // เอาอันที่เลือกอยู่แล้วออกจาก option 
                                        ?.filter((item: any) => !selectedShippers2.includes(item.id)) // เอาอันที่เลือกอยู่แล้วออกจาก option 
                                        ?.filter((item: any) => !selectedShippers3.includes(item.id)) // เอาอันที่เลือกอยู่แล้วออกจาก option 
                                        ?.filter((item: any) => !selectedShippers4.includes(item.id)) // เอาอันที่เลือกอยู่แล้วออกจาก option 
                                        // ?.filter((item: any) => !selectedShippers5.includes(item.id)) // เอาอันที่เลือกอยู่แล้วออกจาก option 

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


                            {/* File */}
                            <div>
                                {/* ถ้าเป็น create แสดงอันนี้ */}
                                {
                                    userDT?.account_manage?.[0]?.user_type_id !== 3 && mode == 'create' &&
                                    <div className="grid grid-cols-2 w-full">
                                        <label className={`${labelClass}`}>{`File`}</label>
                                        <div className={`flex items-center col-span-2 ${IsErrorChudTee == '5' ? 'border  border-[#ff0000] rounded-r-lg rounded-l-lg' : ''}`}>
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
                                                    onChange={(e) => handleFileChange(e, 5)}
                                                />
                                            </label>

                                            <div className="bg-white text-[#9CA3AF] text-sm w-[80%] !h-[44px] px-2 py-2 rounded-r-[6px] border-l-0 border border-gray-300 truncate overflow-hidden flex items-center">
                                                <span className="truncate">
                                                    {fileName5}
                                                </span>
                                                {fileName5 !== "Maximum File 5 MB" && (
                                                    <CloseOutlinedIcon
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
                                    (mode == 'edit' || mode == 'view') && fileNameEditTextUrl5 !== '' &&
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
                        </div>
                    </div>
                }

                {/* shipper render */}
                {
                    watch('doc_41_perm_lod_5') && <>
                        <div className="flex flex-wrap flex-auto">
                            <div className="grid grid-cols-2 w-full">
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
                    </>
                }
            </div>



            {horizoneDivide()}







            {/* =================================== หมายเหตุ ======================================== */}
            <div className="grid grid-cols-2 gap-4 pt-4">

                {/* หมายเหตุ */}
                <div className="w-full col-span-2">
                    <label className={`${labelClass}`}>{`หมายเหตุ`}</label>
                    <TextField
                        {...register("doc_41_input_note")}
                        value={watch("doc_41_input_note") || ""}
                        label=""
                        multiline
                        onChange={(e) => {
                            if (e.target.value.length <= 500) {
                                setValue("doc_41_input_note", e.target.value);
                                handletrickerEdit()
                            }
                        }}
                        placeholder="ระบุรายละเอียด"
                        disabled={mode == 'view' || isShipper}
                        rows={2}
                        sx={textFieldSx}
                        className={`${mode == 'view' && 'bg-[#EFECEC] rounded-[8px]'}`}
                        InputProps={inputPropsTextField}
                        fullWidth
                    />
                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                        <span className="text-[13px]">
                            {watch("doc_41_input_note")?.length || 0} / 500
                        </span>
                    </div>
                </div>
            </div>

            {/* เลือก Email Group */}
            {
                userDT?.account_manage?.[0]?.user_type_id !== 3 && (mode == 'create' || mode == 'edit') &&
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
                                    handletrickerEdit()
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




            {/* ส่วนของผู้ให้บริการ แค่ shipper เห็น */}
            {
                userDT?.account_manage?.[0]?.user_type_id === 3 && (mode == 'edit' || mode == 'view') &&
                <div className="grid grid-cols-2 gap-4 pt-3">
                    <span className="text-[#58585A] font-semibold">ส่วนของผู้ใช้บริการ / คู่สัญญาของผู้ใช้บริการ</span>
                </div>
            }


            {/* การดำเนินการ แค่ shipper เห็น */}
            {
                userDT?.account_manage?.[0]?.user_type_id === 3 && (mode == 'edit' || mode == 'view') &&
                <div className="grid grid-cols-2 gap-4 pt-3">
                    <div className="w-full col-span-2">
                        <label className={`${labelClass} `}>{`การดำเนินการ`}</label>
                        <TextField
                            {...register("doc_41_input_shipper_operation")}
                            value={watch("doc_41_input_shipper_operation") || ""}
                            label=""
                            multiline
                            onChange={(e) => {
                                if (e.target.value.length <= 500) {
                                    setValue("doc_41_input_shipper_operation", e.target.value);
                                }
                            }}
                            placeholder="ระบุรายละเอียด"
                            disabled={mode == 'view' ? true : false}
                            rows={2}
                            sx={textFieldSx}
                            className={`${mode == 'view' && 'bg-[#EFECEC] rounded-[8px]'}`}
                            InputProps={inputPropsTextField}
                            fullWidth
                        />
                        <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                            <span className="text-[13px]">
                                {watch("doc_41_input_shipper_operation")?.length || 0} / 500
                            </span>
                        </div>
                    </div>
                </div>
            }


            {/* หมายเหตุ แค่ shipper เห็น */}
            {
                userDT?.account_manage?.[0]?.user_type_id === 3 && (mode == 'edit' || mode == 'view') &&
                <div className="grid grid-cols-2 gap-4 ">
                    <div className="w-full col-span-2">
                        <label className={`${labelClass} `}>{`หมายเหตุ`}</label>
                        <TextField
                            {...register("doc_41_input_shipper_note")}
                            value={watch("doc_41_input_shipper_note") || ""}
                            label=""
                            multiline
                            onChange={(e) => {
                                if (e.target.value.length <= 500) {
                                    setValue("doc_41_input_shipper_note", e.target.value);
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
                                {watch("doc_41_input_shipper_note")?.length || 0} / 500
                            </span>
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
                userDT?.account_manage?.[0]?.user_type_id !== 3 && (mode == 'edit' || mode == 'view') && <div className="pt-4"><TableDocument41 tableData={dataTable} dataOpenDocument={dataOpenDocument} /></div>
            }


            {(() => {
                const shouldHideButton = userDT?.account_manage?.[0]?.user_type_id === 3 && (dataOpenDocument?.event_doc_status_id === 1 || dataOpenDocument?.event_doc_status_id === 5);
                return (
                    <div className="flex justify-end pt-8">
                        {mode !== 'view' && !shouldHideButton && (
                            // <button
                            //     type="submit"
                            //     className="w-[167px] h-[44px] font-semibold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            //     disabled={trickerEdit || false}
                            // >
                            //     {mode === 'create' ? 'Submit' : userDT?.account_manage?.[0]?.user_type_id === 3 ? 'Acknowledge' : 'Save'}
                            // </button>


                            // เพิ่มเงื่อนไข ถ้า userDT?.account_manage?.[0]?.user_type_id == 3 ไม่ต้อง disable
                            <button
                                type="submit"
                                className="w-[167px] h-[44px] font-semibold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                // disabled={trickerEdit || false}
                                disabled={userDT?.account_manage?.[0]?.user_type_id === 3 ? false : !!trickerEdit}
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

export default FormDocument41;