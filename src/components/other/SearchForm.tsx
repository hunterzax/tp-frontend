"use client";
import React, { ChangeEvent, useEffect, useState } from 'react';
// import { Button } from './Button'; 
import { ArrowForwardIos, ArrowBackIos } from "@mui/icons-material"
import Datepicker from "tailwind-datepicker-react";
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import dayjs, { Dayjs } from "dayjs";
import { TextField, Typography, ListItemText, Checkbox, InputAdornment, ListSubheader } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';

interface InputSectionProps {
  id: string;
  label: any;
  type?: "text" | "select" | "select-new" | "select-multi-checkbox" | "select-multi-checkbox-for-date";
  mode?: any;
  showRequire?: any;
  isCheckAll?: any;
  selectboxMode?: any;
  placeholder?: string;
  options?: { value: string; label: string }[];
  value: string;
  isDisabled?: any;
  canReplaceOptionsWithEmpty?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  customWidth?: number | undefined;
  customWidthPopup?: number | undefined;
  specialMenu?: string | undefined;
  sortOptionBy?: "asc" | "desc" | "none" | "dateMin" | "dateMax"; //dateMin == วันที่น้อยไปมาก || dateMax == วันที่มากไปน้อย
}

interface DatePickerSectionProps {
  label: any;
  date: any;
  setDate: (date: Date | null) => void;
  placeholder: string;
}
interface DatePickerComponentProps {
  label: any;
  onChange: (date: Dayjs | null) => void;
  value: Dayjs | null;
}

// const selectboxClass = "!w-[150px] h-[35px] p-1 !rounded-lg text-gray-900 text-sm block outline-none"
// const selectboxClass = "w-full h-[35px] sm:w-[150px] w-auto max-w-[200px] p-1 !rounded-lg text-gray-900 text-sm block outline-none"; // 2025-03-06 เก็บไว้ก่อน ของเดิม original
// const selectboxClass = "w-auto h-[35px] min-w-[150px] max-w-[250px] p-1 !rounded-lg text-gray-900 text-sm block outline-none";
const selectboxClass = "w-auto h-[35px] min-w-[150px] max-w-[250px] p-1 !rounded-lg text-[#9BA3AF] text-sm block outline-none";

const selectboxClassNew = "h-[40px] w-auto max-w-[200px] p-1 !rounded-lg text-gray-900 text-sm block outline-none";
const textInputClass = "w-full h-[35px] sm:w-[150px] p-2 !ps-2 focus:!ps-2 hover:!ps-2 rounded-lg text-[#484558] text-xs block border border-[#DFE4EA] bg-white outline-none focus:border-[#d2d4d8]"

export const InputSearch: React.FC<InputSectionProps> = ({
  id,
  label,
  showRequire = false,
  isCheckAll,
  type = "text",
  placeholder = "",
  customWidth = undefined,
  customWidthPopup = undefined,
  options = [],
  value,
  mode,
  selectboxMode,
  isDisabled = false,
  canReplaceOptionsWithEmpty = false,
  specialMenu = undefined, // ---> ยังไม่ได้ใช้ที่หน้าไหนเลย
  sortOptionBy = "asc",
  onChange
}) => {

  const itemselectClass = "text-[#9CA3AF] text-[14px]";
  const valselectClass = "text-[#58585A] text-[14px]";
  const [displayedOptions, setdisplayedOptions] = useState<any>(options?.length == 0 ? [] : options);
  const [tk, settk] = useState<boolean>(true);

  useEffect(() => {
    if (!Array.isArray(options)) return;

    let itemOption: any = [];
    const format = 'DD/MM/YYYY HH:mm';

    if ((sortOptionBy == 'dateMax')) {
      itemOption = options?.sort((a: any, b: any) => {
        const dateA = dayjs(a.label, format);
        const dateB = dayjs(b.label, format);
        return dateB.valueOf() - dateA.valueOf(); // มาก → น้อย
      });
    } else if (sortOptionBy == 'dateMin') {
      itemOption = options?.sort((a: any, b: any) => {
        const dateA = dayjs(a.label, format);
        const dateB = dayjs(b.label, format);
        return dateA.valueOf() - dateB.valueOf(); // น้อย → มาก
      });
    } else {
      itemOption = options?.sort((a: any, b: any) => a?.label?.localeCompare(b.label))
    }

    setdisplayedOptions(options.length > 0 || canReplaceOptionsWithEmpty ? itemOption : []);

    // เงื่อนไขว่าเฉพาะตอน options เปลี่ยนอย่างมีนัยยะถึงจะ flip tk
    settk(prev => !prev);
  }, [JSON.stringify(options), canReplaceOptionsWithEmpty]);


  const onFilter = (string: any, mode: "search" | "clear") => {
    if (mode == "search") {
      let filterItems: any = options?.filter((f: any) => f?.label?.replace(/\s+/g, '').toLowerCase().trim().includes(string?.toLowerCase().replace(/\s+/g, '')?.trim()));
      setdisplayedOptions(filterItems);
    } else if (mode == "clear") {
      let filterItems: any = options;
      setdisplayedOptions(filterItems);
    }
    settk(!tk);
  }

  // =======================================================================================

  // const getDetailbyID: any = document?.getElementById(id); // ยังไม่ได้ใช้ function นี้ example == ใช้ในการเอาค่าของ select มา เพื่อไปทำต่อใน function ด้านล่าง
  // const getWidthbyID: any = window?.getComputedStyle(getDetailbyID); // ยังไม่ได้ใช้ function นี้  example == เอา id ของ select นั้นมา cal หาค่าความยาวของ select เพือ fix popup ไม่ให้เกินกว่า select

  // tutorial by banju here ================================================================
  // customWidth={180} // how to ใช้ ความยาวของ select
  // customWidthPopup={180} // how to ใช้ ความยาวของ popup select
  // ถ้าหาก ไม่ใส่ value ตัว select - popup ก็จะยาวตามขนาดของ value ที่เลือก / ที่มี

  // =======================================================================================

  const handleClearSelect: any = (e: any) => {
    onChange(e);
    // onFilter(undefined, 'clear')
  }

  const handleClearSelectMulti = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    e.stopPropagation(); // กันไม่ให้เมนูเด้งเปิด

    // สร้าง SelectChangeEvent ปลอม ๆ ที่มี target.value = []
    const fakeEvent: any = {
      target: { value: [] },
    } as unknown as SelectChangeEvent<string[]>;

    onChange(fakeEvent);
  };

  return (
    <section className="relative">
      <label htmlFor={id} className="block mb-2 text-[14px] text-[#58585A]">
        {showRequire && <span className=" text-red-500">*</span>}
        {label}
      </label>

      {type === 'text' ? (
        <div className="flex-1 relative">
          <SearchIcon
            className="absolute right-[8px] top-1/2 -translate-y-1/2"
            style={{
              fontSize: '18px',
              color: mode === 'drawer' ? '#B6B6B6' : '#58585A',
              cursor: mode === 'drawer' ? 'default' : 'pointer',
              pointerEvents: 'none',
            }}
          />

          <input
            type="text"
            id={id}
            value={value}
            onChange={onChange}
            className={`${textInputClass} placeholder:text-[14px] pr-8`}
            placeholder={placeholder}
            style={{
              width: customWidth ? `${customWidth}px` : mode == 'drawer' ? '250px' : '185px',
              height: mode == 'drawer' ? '44px' : '35px',
              fontSize: '14px',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden'
            }}
          />
        </div>
      ) : (
        <div className="flex-1" id={id}>
          {
            selectboxMode == 'multi' ?
              <Select
                id={value}
                IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                value={value}
                className={`${selectboxClass}`}
                sx={{
                  '.MuiOutlinedInput-notchedOutline': {
                    borderColor: '#DFE4EA', // Change the border color here
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#d2d4d8',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#d2d4d8',
                  },
                }}
                displayEmpty
                disabled={isDisabled}
                multiple
                onChange={(e: any) => onChange(e)}
                renderValue={(selected) => {
                  if (selected.length === 0) {
                    return <span className="text-[#9BA3AF] text-[14px]">{placeholder ? placeholder : "Select " + label}</span>;
                  }
                  const selectedOptions = options?.filter((item: any) => selected.includes(item.value));
                  return (
                    <span className="text-[#484558] text-xs">
                      {selectedOptions.map((option: any) => option.label).join(', ')}
                    </span>
                  );
                }}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 48 * 4.5 + 8, // Item height * 4.5 + padding
                      width: 150, // Adjust width as needed
                    },
                  },
                }}
              >
                {/* Optional placeholder menu item */}
                {/* <MenuItem value="" style={{ color: '#A0A0A0', height: '30px' }}>{""}</MenuItem> */}
                {
                  options?.map((item: any) => (
                    <MenuItem key={item.value} value={item.value} sx={{ fontSize: '14px', color: '#454255' }}>
                      {item.label}
                    </MenuItem>
                  ))
                }
              </Select>
              : type == "select-new" ?
                <Select
                  id={value}
                  IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                  value={value}
                  className={`${selectboxClassNew}`}
                  style={{ width: customWidth ? String(customWidth + "px") : "auto", maxWidth: customWidth ? String(customWidth + "px") : "auto" }}
                  sx={{
                    '.MuiOutlinedInput-notchedOutline': {
                      borderColor: '#DFE4EA', // Change the border color here
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#d2d4d8',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#d2d4d8',
                    },
                  }}
                  displayEmpty
                  disabled={isDisabled}
                  // placeholder={placeholder ? placeholder : label}
                  onChange={(e: any) => onChange(e)}
                  renderValue={(selected) => {
                    if (!selected) {
                      return <span className={itemselectClass}>{placeholder ? placeholder : "Select " + label}</span>;
                      // return <Typography color="#9CA3AF" sx={{paddingRight: "25px"}} fontSize={14}>{placeholder ? placeholder : "Select " + label}</Typography>;
                    }
                    const selectedOption = options?.find((item: any) => item.value === selected);
                    // return <span className="text-[#484558] text-xs">{selectedOption ? selectedOption?.label : ''}</span>
                    return <span className={valselectClass} style={{ paddingRight: "25px" }}>{selectedOption ? selectedOption?.label : ''}</span>;
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 48 * 4.5 + 8, // Item height * 4.5 + padding
                        width: 150, // Adjust width as needed
                      },
                    },
                  }}
                >
                  {/* <MenuItem value="" style={{ color: '#A0A0A0', height: '30px' }}>{""}</MenuItem> */}
                  {
                    options?.map((item: any) => (
                      <MenuItem key={item.value} value={item.value}>
                        <ListItemText primary={<Typography fontSize={14}>{item.label}</Typography>} />
                      </MenuItem>
                    ))
                  }
                </Select>
                : type == 'select-multi-checkbox' ?

                  // ถ้า isDisable == true เปลี่ยน text placeholder เป็นสี #9BA3AF
                  <Select
                    id={value}
                    multiple
                    displayEmpty
                    disabled={isDisabled}
                    IconComponent={(props) => <>{
                      value.length > 0 && !isDisabled ?
                        <CloseIcon fontSize="small" className=' absolute top-[10px] right-[5px] !text-[15px] cursor-pointer' onClick={(e) => handleClearSelectMulti(e)} />
                        : <ExpandMoreIcon {...props} fontSize="medium" />
                    }</>} // ถ้า isDisable == true จะไม่ให้กด closeIcon
                    // value={isCheckAll ? options?.map((item) => item.value) : value} // บางทีถ้า shipper ใช้งานมันไม่ได้ส่ง array เข้ามา
                    value={
                      isCheckAll
                        ? options?.map((item) => item.value) || []
                        : Array.isArray(value)
                          ? value
                          : value
                            ? [value]
                            : []
                    }
                    className={`for_filter ${selectboxClass}`}
                    sx={{
                      minWidth: 180,
                      width: 210,
                      maxWidth: 420,
                      ".MuiOutlinedInput-notchedOutline": { borderColor: "#DFE4EA" }, // #F174A9
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#d2d4d8" },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#d2d4d8" },
                      '&.Mui-disabled': {
                        backgroundColor: '#f1f1f1',
                        '.MuiOutlinedInput-notchedOutline': { borderColor: '#E0E0E0' },
                        '.select-placeholder': { color: '#9BA3AF' },
                        "&::placeholder": { "-webkit-text-fill-color": '#9BA3AF' },
                      },
                    }}
                    onChange={(e: any) => {
                      let selectedValues = e.target.value as string[];
                      let newValues;
                      if (selectedValues.includes("all")) {
                        newValues = value.length === options?.length ? [] : options?.map((item) => item.value);
                      } else {
                        newValues = selectedValues;
                      }

                      const event = {
                        target: { value: newValues },
                      } as unknown as ChangeEvent<HTMLInputElement>;

                      onChange(event);
                    }}
                    renderValue={(selected) => {
                      if (!selected || selected.length === 0) {
                        return <span className={`place_holder_txt text-[14px] !font-[500]`}>{placeholder || `Select ${label}`}</span>;
                      }
                      // const selectedOptions = options?.filter((item) => selected?.includes(item.value));
                      const selectedOptions = options?.filter((item) => Array.isArray(selected) && selected.includes(item.value));

                      // return <span className="text-[#484558] text-xs">{selectedOptions.map((option) => option.label).join(", ")}</span>;

                      // ถ้าเลือก select all ให้แสดงข้อความค้างไว้ว่า select all ไม่ต้องแสดงเป็นชื่อ https://app.clickup.com/t/86et0vtp9
                      // return <span className="text-[#484558] text-[14px]">
                      //   {/* ของเดิม 1 */}
                      //   {/* {selectedOptions?.length === options?.length ? "Selected All" : selectedOptions.map((option) => option.label).join(", ")} */}

                      //   {/* ของเดิม 2 */}
                      //   {/* {value.length === options.length ? "Selected All" : selectedOptions.map((option) => option.label).join(", ")} */}

                      //   {/* 140725 : Filter Contract Code เลือกรายการเดียว ในช่องต้องไม่แสดงเป็นคำว่า Select All https://app.clickup.com/t/86eu5dra7 */}
                      //   {
                      //     options.length > 1 && value.length === options.length ? "Selected All" : selectedOptions.map(option => option.label).join(", ")
                      //   }
                      // </span>;


                      return <div className="text-[#484558] text-[14px] max-w-[90%] whitespace-nowrap overflow-hidden text-ellipsis">
                        {/* ของเดิม 1 */}
                        {/* {selectedOptions?.length === options?.length ? "Selected All" : selectedOptions.map((option) => option.label).join(", ")} */}

                        {/* ของเดิม 2 */}
                        {/* {value.length === options.length ? "Selected All" : selectedOptions.map((option) => option.label).join(", ")} */}

                        {/* 140725 : Filter Contract Code เลือกรายการเดียว ในช่องต้องไม่แสดงเป็นคำว่า Select All https://app.clickup.com/t/86eu5dra7 */}
                        {
                          options.length > 1 && value.length === options.length ? "Selected All" : selectedOptions.map(option => option.label).join(", ")
                        }
                      </div>;
                    }}
                    MenuProps={{
                      autoFocus: false,
                      PaperProps: {
                        style: {
                          maxHeight: 48 * 4.5 + 8,
                          width: "auto",
                          minWidth: 180,
                          maxWidth: 420,
                        },
                      },
                    }}
                    onClose={() => setTimeout(() => {
                      onFilter(undefined, 'clear')
                    }, 300)} // clear filter on close select ==> bangjuu modify
                  >
                    {/* Tab Area and Tab Nomination : Filter Area หากข้อมูลมากกว่า 5 รายการเพิ่มให้ Search ได้ https://app.clickup.com/t/86etcny26 */}
                    {
                      options?.length > 5 && <ListSubheader style={{ width: '100%' }}>
                        <TextField
                          size="small"
                          // Autofocus on textfield
                          autoFocus={true}
                          focused
                          placeholder="Type to search..."
                          // fullWidth
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon sx={{ fontSize: 16 }} />
                              </InputAdornment>
                            ),
                            sx: {
                              fontSize: '14px', // 👈 change this to your desired font size
                            },
                          }}
                          className='inputSearchk'
                          // style={{ paddingLeft: '5px !important'}}
                          style={{ width: customWidthPopup ? customWidthPopup - (16 * 2) : '100%', height: 40 }}
                          // onChange={(e) => setSearchText(e.target.value)}
                          onChange={(e) => e.target.value ? onFilter(e.target.value, 'search') : onFilter(undefined, 'clear')}
                          onKeyDown={(e) => {
                            if (e.key !== "Escape") {
                              // Prevents autoselecting item while typing (default Select behaviour)
                              e.stopPropagation();
                            }
                          }}
                        />
                      </ListSubheader>
                    }

                    {/* Filter : ในกรณีที่ Filter ไหนมี Select All แต่ของที่เลือกมีแค่รายการเดียว Select All ควรซ่อนไป https://app.clickup.com/t/86et66n2k */}
                    {/* {options.length > 1 && ( */}
                    {
                      displayedOptions?.length > 1 && (
                        <MenuItem
                          value="all"
                          autoFocus={false}
                          sx={{ fontSize: "14px", color: "#454255" }}
                        >
                          <Checkbox checked={isCheckAll || value?.length === options?.length} sx={{ padding: "0px", marginRight: "8px" }} />
                          <ListItemText primary="Select All" autoFocus={false}
                            primaryTypographyProps={{
                              sx: { fontWeight: 'bold', fontSize: "14px" }
                            }}
                          />
                        </MenuItem>
                      )
                    }

                    {/* เรียงลำดับรายการในทุก dropdown ตามตัวอักษร (ถ้าเป็น timestamp เรียงตามเวลาล่าสุด) https://app.clickup.com/t/86et0vtp9 */}
                    {/* {options */}
                    {/* {
                      [...displayedOptions]
                        ?.slice() // Create a shallow copy to avoid mutating the original array
                        .sort((a, b) => a.label.localeCompare(b.label)) // Sort alphabetically by label
                        .map((item) => (
                          <MenuItem key={item.value} value={item.value} sx={{ fontSize: "14px", color: "#454255" }} autoFocus={false}>
                            <Checkbox checked={isCheckAll || value.includes(item.value)} sx={{ padding: "0px", marginRight: "8px" }} />
                            <ListItemText primary={item.label} primaryTypographyProps={{ sx: { fontSize: "14px" } }} autoFocus={false} />
                          </MenuItem>
                        ))
                    } */}

                    {
                      displayedOptions?.length > 0 && displayedOptions?.map((item: any) => (
                        <MenuItem key={item.value} value={item.value} sx={{ fontSize: "14px", color: "#454255" }} autoFocus={false}>
                          <Checkbox
                            // checked={isCheckAll || value?.includes(item.value)}
                            checked={
                              isCheckAll || (Array.isArray(value) && value.includes(item.value))
                            }
                            sx={{ padding: "0px", marginRight: "8px" }}
                          />
                          <ListItemText primary={item.label} primaryTypographyProps={{ sx: { fontSize: "14px" } }} autoFocus={false} />
                        </MenuItem>
                      ))
                    }
                  </Select>

                  // : type == 'select' &&
                  : type == 'select-multi-checkbox-for-date' ?

                    // ถ้า isDisable == true เปลี่ยน text placeholder เป็นสี #9BA3AF
                    <Select
                      id={value}
                      multiple
                      displayEmpty
                      disabled={isDisabled}
                      // IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                      IconComponent={(props) => <>{
                        value.length > 0 && !isDisabled ?
                          <CloseIcon fontSize="small" className=' absolute top-[10px] right-[5px] !text-[15px] cursor-pointer' onClick={(e) => handleClearSelectMulti(e)} />
                          : <ExpandMoreIcon {...props} fontSize="medium" />
                      }</>} // ถ้า isDisable == true จะไม่ให้กด closeIcon
                      value={isCheckAll ? options?.map((item) => item.value) : value}
                      // className={selectboxClass}
                      className={`for_filter ${selectboxClass}`}
                      sx={{
                        minWidth: 180,
                        width: 210,
                        maxWidth: 420,
                        ".MuiOutlinedInput-notchedOutline": { borderColor: "#DFE4EA" }, // #F174A9
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#d2d4d8" },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#d2d4d8" },
                        '&.Mui-disabled': {
                          backgroundColor: '#f1f1f1',
                          '.MuiOutlinedInput-notchedOutline': { borderColor: '#E0E0E0' },
                          '.select-placeholder': { color: '#9BA3AF' },
                          "&::placeholder": { "-webkit-text-fill-color": '#9BA3AF' },
                        },
                      }}
                      onChange={(e: any) => {
                        let selectedValues = e.target.value as string[];
                        let newValues;
                        if (selectedValues.includes("all")) {
                          newValues = value.length === options?.length ? [] : options?.map((item) => item.value);
                        } else {
                          newValues = selectedValues;
                        }

                        const event = {
                          target: { value: newValues },
                        } as unknown as ChangeEvent<HTMLInputElement>;

                        onChange(event);
                      }}
                      renderValue={(selected) => {
                        if (!selected || selected.length === 0) {
                          return <span className={`place_holder_txt text-[14px] !font-[500]`}>{placeholder || `Select ${label}`}</span>;
                        }
                        const selectedOptions = options?.filter((item) => selected.includes(item.value));
                        // return <span className="text-[#484558] text-xs">{selectedOptions.map((option) => option.label).join(", ")}</span>;

                        // ถ้าเลือก select all ให้แสดงข้อความค้างไว้ว่า select all ไม่ต้องแสดงเป็นชื่อ https://app.clickup.com/t/86et0vtp9
                        return <span className="text-[#484558] text-[14px] ">
                          {/* ของเดิม 1 */}
                          {/* {selectedOptions?.length === options?.length ? "Selected All" : selectedOptions.map((option) => option.label).join(", ")} */}

                          {/* ของเดิม 2 */}
                          {/* {value.length === options.length ? "Selected All" : selectedOptions.map((option) => option.label).join(", ")} */}

                          {/* 140725 : Filter Contract Code เลือกรายการเดียว ในช่องต้องไม่แสดงเป็นคำว่า Select All https://app.clickup.com/t/86eu5dra7 */}
                          {
                            options.length > 1 && value.length === options.length ? "Selected All" : selectedOptions.map(option => option.label).join(", ")
                          }
                        </span>;
                      }}
                      MenuProps={{
                        autoFocus: false,
                        PaperProps: {
                          style: {
                            maxHeight: 48 * 4.5 + 8,
                            width: "auto",
                            minWidth: 180,
                            maxWidth: 420,
                          },
                        },
                      }}
                      onClose={() => setTimeout(() => {
                        onFilter(undefined, 'clear')
                      }, 300)} // clear filter on close select ==> bangjuu modify
                    >
                      {/* Tab Area and Tab Nomination : Filter Area หากข้อมูลมากกว่า 5 รายการเพิ่มให้ Search ได้ https://app.clickup.com/t/86etcny26 */}
                      {
                        options?.length > 5 && <ListSubheader style={{ width: '100%' }}>
                          <TextField
                            size="small"
                            // Autofocus on textfield
                            autoFocus={true}
                            focused
                            placeholder="Type to search..."
                            // fullWidth
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <SearchIcon sx={{ fontSize: 16 }} />
                                </InputAdornment>
                              ),
                              sx: {
                                fontSize: '14px', // 👈 change this to your desired font size
                              },
                            }}
                            className='inputSearchk'
                            // style={{ paddingLeft: '5px !important'}}
                            style={{ width: customWidthPopup ? customWidthPopup - (16 * 2) : '100%', height: 40 }}
                            // onChange={(e) => setSearchText(e.target.value)}
                            onChange={(e) => e.target.value ? onFilter(e.target.value, 'search') : onFilter(undefined, 'clear')}
                            onKeyDown={(e) => {
                              if (e.key !== "Escape") {
                                // Prevents autoselecting item while typing (default Select behaviour)
                                e.stopPropagation();
                              }
                            }}
                          />
                        </ListSubheader>
                      }

                      {/* Filter : ในกรณีที่ Filter ไหนมี Select All แต่ของที่เลือกมีแค่รายการเดียว Select All ควรซ่อนไป https://app.clickup.com/t/86et66n2k */}
                      {/* {options.length > 1 && ( */}
                      {
                        displayedOptions?.length > 1 && (
                          <MenuItem
                            value="all"
                            autoFocus={false}
                            sx={{ fontSize: "14px", color: "#454255" }}
                          >
                            <Checkbox checked={isCheckAll || value?.length === options?.length} sx={{ padding: "0px", marginRight: "8px" }} />
                            <ListItemText primary="Select All" autoFocus={false}
                              primaryTypographyProps={{
                                sx: { fontWeight: 'bold', fontSize: "14px" }
                              }}
                            />
                          </MenuItem>
                        )
                      }

                      {/* เรียงลำดับรายการในทุก dropdown ตามตัวอักษร (ถ้าเป็น timestamp เรียงตามเวลาล่าสุด) https://app.clickup.com/t/86et0vtp9 */}
                      {/* {options */}
                      {/* {
                      [...displayedOptions]
                        ?.slice() // Create a shallow copy to avoid mutating the original array
                        .sort((a, b) => a.label.localeCompare(b.label)) // Sort alphabetically by label
                        .map((item) => (
                          <MenuItem key={item.value} value={item.value} sx={{ fontSize: "14px", color: "#454255" }} autoFocus={false}>
                            <Checkbox checked={isCheckAll || value.includes(item.value)} sx={{ padding: "0px", marginRight: "8px" }} />
                            <ListItemText primary={item.label} primaryTypographyProps={{ sx: { fontSize: "14px" } }} autoFocus={false} />
                          </MenuItem>
                        ))
                    } */}

                      {
                        displayedOptions?.length > 0 && displayedOptions?.map((item: any) => (
                          <MenuItem key={item.value} value={item.value} sx={{ fontSize: "14px", color: "#454255" }} autoFocus={false}>
                            <Checkbox checked={isCheckAll || value?.includes(item.value)} sx={{ padding: "0px", marginRight: "8px" }} />
                            <ListItemText primary={item.label} primaryTypographyProps={{ sx: { fontSize: "14px" } }} autoFocus={false} />
                          </MenuItem>
                        ))
                      }
                    </Select>

                    // : type == 'select' &&
                    :

                    // tutorial by banju here ================================================================
                    // customWidth={180} // how to ใช้ ความยาวของ select
                    // customWidthPopup={180} // how to ใช้ ความยาวของ popup select
                    // ถ้าหาก ไม่ใส่ value ตัว select - popup ก็จะยาวตามขนาดของ value ที่เลือก / ที่มี
                    // =======================================================================================
                    // IconComponent={(props) => <>{value ? <CloseIcon fontSize="small" className=' absolute top-[10px] right-[5px] !text-[15px] cursor-pointer' onClick={(e) => handleClearSelect(e)}/> : <ExpandMoreIcon {...props} fontSize="medium" />}</>}

                    <Select
                      id={value}
                      IconComponent={(props) => <>{value && !isDisabled ? <CloseIcon fontSize="small" className=' absolute top-[10px] right-[5px] !text-[15px] cursor-pointer' onClick={(e) => handleClearSelect(e)} /> : <ExpandMoreIcon {...props} fontSize="medium" />}</>} // ถ้า isDisable == true จะไม่ให้กด closeIcon
                      value={value}
                      disabled={isDisabled}
                      className={selectboxClass}
                      sx={{
                        minWidth: 180,
                        width: customWidth ? customWidth : 'auto',
                        maxWidth: customWidth ? customWidth : 320,
                        // paddingRight: 5,
                        '.MuiOutlinedInput-notchedOutline': {
                          borderColor: '#DFE4EA',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#d2d4d8',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#d2d4d8',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: '#EEECEC',
                          '.MuiOutlinedInput-notchedOutline': {
                            borderColor: '#E0E0E0',
                          },
                          '.select-placeholder': {
                            color: '#9BA3AF !important',
                          },
                          "&::placeholder": {
                            "-webkit-text-fill-color": '#9CA3AF !important',
                          },
                        },
                        '&.Mui-disabled .MuiSelect-select': {
                          opacity: 0.5, // ยกเลิกความจางของ MUI
                          color: '#B7BBC3', // สีที่คุณต้องการ
                        },
                        '.MuiSelect-select': {
                          display: 'flex',
                          alignItems: 'center',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis', // Adds "..." if text is too long
                        },
                      }}

                      displayEmpty
                      onChange={(e: any) => onChange(e)}
                      onClose={(e: any) => onFilter(undefined, 'clear')}
                      // renderValue={(selected) => {
                      //   if (!selected) {
                      //     return (
                      //       <span className={`select-placeholder text-[#9CA3AF] text-[14px] `}>{placeholder ? placeholder : "Select " + label}</span>
                      //     );
                      //   }
                      //   const selectedOption = options?.find((item: any) => item.value === selected);
                      //   return <span className="text-[#584945] text-[14px] whitespace-nowrap overflow-hidden text-ellipsis w-[100%]">{selectedOption ? selectedOption?.label : ''}</span>;
                      // }}
                      renderValue={(selected) => {
                        if (!selected) {
                          return (
                            <span
                              className="select-placeholder text-[14px]"
                              style={{ color: isDisabled ? '#B7BBC3' : '#9CA3AF' }}
                            >
                              {placeholder ? placeholder : "Select " + label}
                            </span>
                          );
                        }

                        const selectedOption = options?.find((item: any) => item.value === selected);
                        return (
                          <span className="text-[#584945] text-[14px] whitespace-nowrap overflow-hidden text-ellipsis w-[100%]">{selectedOption ? selectedOption?.label : ''}</span>
                        );
                      }}

                      MenuProps={{
                        autoFocus: false,
                        disableAutoFocus: false,
                        PaperProps: {
                          sx: {
                            maxHeight: 48 * 4.5 + 8,
                            width: customWidthPopup ? customWidthPopup : 'auto',
                            minWidth: 180,
                            maxWidth: customWidthPopup ? customWidthPopup : 320,
                          },
                        },
                      }}
                    >
                      {
                        options?.length > 5 && <ListSubheader style={{ width: '100%' }}>
                          <TextField
                            size="small"
                            // Autofocus on textfield
                            autoFocus
                            placeholder="Type to search..."
                            // fullWidth
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <SearchIcon sx={{ fontSize: 16 }} />
                                </InputAdornment>
                              ),
                              sx: {
                                fontSize: '14px', // 👈 change this to your desired font size
                                '.MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#DFE4EA',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#d2d4d8',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#d2d4d8',
                                },
                              },
                            }}
                            className='inputSearchk'
                            // style={{ paddingLeft: '5px !important'}}
                            style={{ width: customWidthPopup ? customWidthPopup - (16 * 2) : '100%', height: 40 }}
                            // onChange={(e) => setSearchText(e.target.value)}
                            onChange={(e) => e.target.value ? onFilter(e.target.value, 'search') : onFilter(undefined, 'clear')}
                            onKeyDown={(e) => {
                              if (e.key !== "Escape") {
                                // Prevents autoselecting item while typing (default Select behaviour)
                                e.stopPropagation();
                              }
                            }}
                          />
                        </ListSubheader>
                      }

                      {/* เรียงลำดับรายการในทุก dropdown ตามตัวอักษร (ถ้าเป็น timestamp เรียงตามเวลาล่าสุด) https://app.clickup.com/t/86et0vtp9 */}
                      {displayedOptions?.length > 0
                        ? [...displayedOptions]
                          .sort((a, b) => sortOptionBy === "asc" ? `${a.label ?? ''}`.localeCompare(`${b.label ?? ''}`) : sortOptionBy === "desc" ? `${b.label ?? ''}`.localeCompare(`${a.label ?? ''}`) : 0)
                          .map((item: any) => (
                            <MenuItem key={item.value} value={item.value}>
                              <ListItemText
                                primary={
                                  <Typography fontSize={14} className={`${customWidthPopup ? 'w-[99%] whitespace-nowrap overflow-hidden text-ellipsis' : ''}`}>
                                    {item.label}
                                  </Typography>
                                }
                              />
                            </MenuItem>
                          ))
                        : []
                      }

                    </Select>

          }

        </div>
      )}
    </section>
  );
};

interface CheckboxProps {
  id: string;
  title?: string;
  label: string;
  type?: "single-line" | "double-line";
  value: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  customWidth?: number | undefined;
}

export const CheckboxSearch: React.FC<CheckboxProps> = ({
  id,
  title,
  label,
  type = "single-line",
  value = false,
  onChange,
}) => {

  // const checkboxClass = "w-[20px] h-[20px] rounded-[10px]"
  // const checkboxClass = "w-[20px] h-[20px] rounded-[10px] border border-gray-400 peer";

  return (
    <div>
      <label className="block text-[14px] font-medium text-[#58585A]" style={{ opacity: type == "double-line" ? 1 : 0 }}>{type == "double-line" ? title : "none"}</label>
      <div className='py-[14px]'>
        <div key={id} className="w-auto flex items-center">
          <input
            id={id}
            type="checkbox"
            checked={value}
            onChange={onChange}
            className="form-checkbox w-5 h-5 border rounded-[8px] accent-[#1473A1] focus:ring-[#1473A1] disabled:opacity-100 disabled:cursor-not-allowed "
          />
          <div id={`${id}-${label}-checkbox-label`} className="ml-2 text-sm text-[#58585A]">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
};


type CheckboxSearchProps = {
  id: string;
  label: string;
  value: boolean;
  isDisable?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: 'single-line' | 'double-line';
  title?: string;
};

const CheckboxSearch2 = React.forwardRef<HTMLInputElement, CheckboxSearchProps>(
  ({ id, label, value, onChange, type = 'single-line', title, isDisable = false }, ref) => {
    return (
      <div>
        <label
          className="block text-[14px] font-medium text-[#58585A]"
          style={{ opacity: type === 'double-line' ? 1 : 0 }}
        >
          {type === 'double-line' ? title : 'none'}
        </label>
        <div className="py-[14px]">
          <div key={id} className="w-auto flex items-center">
            <input
              id={id}
              type="checkbox"
              checked={value}
              onChange={onChange}
              disabled={isDisable}
              ref={ref}
              className="form-checkbox w-5 h-5 border rounded-[8px] accent-[#1473A1] focus:ring-[#1473A1] disabled:opacity-100 disabled:cursor-not-allowed"
            />
            <div
              id={`${id}-${label}-checkbox-label`}
              className="ml-2 text-sm text-[#58585A]"
            >
              {label}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

CheckboxSearch2.displayName = 'CheckboxSearch2';
export default CheckboxSearch2;



export const DatePickerSearch: React.FC<DatePickerSectionProps> = ({
  label,
  date,
  setDate,
  placeholder,
}) => {

  const [show, setShow] = useState<boolean>(false);

  return (
    <section className="relative">
      <label className="block mb-2 text-sm">{label}</label>
      <Datepicker
        options={{
          title: "",
          autoHide: true,
          clearBtn: false,
          todayBtn: false,
          clearBtnText: "Clear",
          maxDate: new Date("2040-01-01"),
          minDate: new Date("2010-01-01"),
          theme: {
            background: "bg-[#ffffff] border-2 border-[#9b9fa4]",
            todayBtn: "",
            inputIcon: "",
            clearBtn: "bg-[#00ADEF] hover:bg-[#00ADEFa0] text-[#ffffff] font-bold",
            icons: "bg-[#f4f9ff] hover:bg-[#f4f9ff] hover:text-[#9b9fa4] text-[#9b9fa4]",
            text: "!text-[#7a7a7a]",
            disabledText: "!text-[#cacaca]",
            input: "w-full h-[35px] border border-[#DFE4EA] outline-none focus:border-[#00ADEF] text-[#58585A]",
            selected: "bg-[#00ADEF] hover:bg-[#00ADEFa0]",
          },
          icons: {
            prev: () => <ArrowBackIos style={{ fontSize: "16px" }} />,
            next: () => <ArrowForwardIos style={{ fontSize: "16px" }} />,
          },
          datepickerClassNames: "absolute top-full",
          defaultDate: null,
          language: "en",
          disabledDates: [],
          weekDays: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
          inputPlaceholderProp: placeholder,
          inputDateFormatProp: {
            day: "numeric",
            month: "long",
            year: "numeric",
          },
        }}
        onChange={(selectedDate: Date) => setDate(selectedDate)}
        // value={date || undefined}
        value={date !== null ? date : ''}
        //   show={date !== null}
        //   setShow={(state: boolean) => setDate(state ? date : null)}

        show={show}
        setShow={setShow}
      />

    </section>
  );
};