import React, { useRef } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
} from "@headlessui/react";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useEffect, useState } from "react";
import { getService } from "@/utils/postService";
import { filterStartEndDateInRange, formatFormDate, formatWatchFormDate, getMinDate } from "@/utils/generalFormatter";
import { ChromePicker, BlockPicker, SketchPicker } from 'react-color';
import { NumericFormat } from "react-number-format";
import DatePickaForm from "@/components/library/dateRang/dateSelectForm";
import dayjs from "dayjs";
import { ListItemText, TextField, Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Spinloading from "@/components/other/spinLoading";
import ModalConfirmSave from "@/components/other/modalConfirmSave";
import SelectFormProps from "@/components/other/selectProps";

type FormData = {
  name: string;
  description: string;
  entry_exit_id: string;
  zone_id: string;
  area_nominal_capacity: any;
  supply_reference_quality_area: any;
  start_date: Date;
  end_date: Date;
  color: string;
};

type FormExampleProps = {
  mode?: "create" | "edit" | "view";
  data?: Partial<FormData>;
  open: boolean;
  zoneMasterData: any;
  entryExitMasterData: any;
  onClose: () => void;
  onSubmit: SubmitHandler<FormData>;
  setResetForm: (reset: () => void) => void;
};

const ModalAction: React.FC<FormExampleProps> = ({
  mode = "create",
  data = {},
  zoneMasterData = {},
  entryExitMasterData = {},
  open,
  onClose,
  onSubmit,
  setResetForm,
}) => {
  const { control, register, handleSubmit, setValue, reset, clearErrors, formState: { errors }, watch, } = useForm<any>({ defaultValues: data });

  const [color, setColor] = useState('#fff'); // Initial color state
  const [blockPickerColor, setBlockPickerColor] = useState("#37d67a");
  const pickerRef = useRef<HTMLDivElement>(null);

  const labelClass = "block mb-2 text-[14px] font-light"
  const inputClass = "text-[14px] block md:w-full p-2 ps-5 focus:!ps-5 hover:!ps-5 pe-10 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]"
  const selectboxClass = "flex w-full h-[45px] p-2 ps-[7px] pe-10 !rounded-lg text-gray-900 text-[14px] block outline-none"
  const textErrorClass = "text-red-500 text-[14px]"
  const itemselectClass = "pl-[10px] text-[14px]"

  const isReadOnly = mode === "view";
  const startDate = watch("start_date");
  const formattedStartDate = formatWatchFormDate(startDate);

  {/* Confirm Save */ }
  const [modaConfirmSave, setModaConfirmSave] = useState<any>(false)
  const [dataSubmit, setDataSubmit] = useState<any>()

  const [areaEntry, setAreaEntry] = useState<any>([])
  const [zoneMasterDataInDate, setZoneMasterDataInDate] = useState<any>(zoneMasterData);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [disableAfterstartDate, setdisableAfterstartDate] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      const responseAreaEntry = await getService(`/master/asset/area-entry`);
      setAreaEntry(responseAreaEntry || [])
    } catch (err) {
    } finally {
    }

    // const today = new Date();
    // let xx = zoneMasterData.filter((item: any) => new Date(item.end_date) > today);
    // let xx = zoneMasterData.filter((item: any) =>
    //   !item.end_date || new Date(item.end_date) > today
    // );
    let xx2 = filterStartEndDateInRange(zoneMasterData)
    setZoneMasterDataInDate(xx2)
  };

  const entryExitId = watch("entry_exit_id");

  useEffect(() => {
    // setValue('entry_exit_id', 1);
  }, [setValue]);

  useEffect(() => {
    const fetchAndSetData = async () => {
      if (mode === 'create') {
        setValue("start_date", null);
        setValue("end_date", null);
        setIsLoading(false);
      }
      if (mode === "edit" || mode === "view") {
        setIsLoading(true);
        // setdisableAfterstartDate
        const formattedStartDate: any = formatFormDate(data?.start_date);
        if (isDateBeforeToday(data?.start_date) == true) {
          setdisableAfterstartDate(true);
        } else {
          setdisableAfterstartDate(false);
        }
        // const formattedEndDate: any = formatFormDate(data?.end_date);
        let formattedEndDate: any = 'Invalid Date'

        if (data?.end_date !== null) {
          formattedEndDate = formatFormDate(data?.end_date);
          setValue("end_date", formattedEndDate);
        } else {
          setValue("end_date", null);
        }

        // setValue("end_date", 'Invalid Date');
        setValue("name", data?.name || "");
        setValue("description", data?.description || "");
        setValue("entry_exit_id", data?.entry_exit_id || "");
        setValue("zone_id", data?.zone_id || "");
        setValue("area_nominal_capacity", data?.area_nominal_capacity ?? null);
        setValue("supply_reference_quality_area", data?.supply_reference_quality_area || null);
        setValue("start_date", formattedStartDate);
        setValue("color", data?.color || "");

        setTimeout(() => {
          if (data) { setIsLoading(false); }
        }, 300);
      }
    }

    fetchAndSetData();
  }, [data, mode, setValue]);

  function isDateBeforeToday(date: any) {
    return new Date(date?.toDateString()) <= new Date(new Date().toDateString());
  }

  useEffect(() => {
    setValue("start_date", null);
    setValue("end_date", null);
    setResetForm(() => reset);

  }, [reset, setResetForm]);

  useEffect(() => {
    fetchData();
  }, []);

  const [showPicker, setShowPicker] = useState(false); // State to control picker visibility

  const handleColorClick = () => {
    if (!isReadOnly) {
      setShowPicker((prev) => !prev); // Toggle the picker on div click
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowPicker(false); // Close picker if clicked outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [pickerRef]);


  {/* Confirm Save */ }
  const handleSaveConfirm = async (data?: any) => {
     
    // setDataSubmit(data)
    // setModaConfirmSave(true)
    if (mode == 'create') {
      await onSubmit(data);
    } else {
      setDataSubmit(data)
      setModaConfirmSave(true)
    }
  }

  const handleClose = () => {
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} className="relative z-30">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
        />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="flex transform transition-all inset-0 rounded-lg text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in  data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
            >
              <Spinloading spin={isLoading} rounded={20} /> {/* loading example here */}
              <div className="flex inset-0 items-center justify-center ">
                <div className="flex flex-col items-center justify-center gap-2 rounded-md ">
                  <form
                    // onSubmit={handleSubmit(onSubmit)}
                    // onSubmit={handleSubmit(async (data) => { // clear state when submit
                    //   setIsLoading(true);
                    //   setTimeout(() => {
                    //     onSubmit(data);
                    //   }, 100);
                    // })}
                    onSubmit={handleSubmit(handleSaveConfirm)}
                    className="bg-white p-8 rounded-[20px] shadow-lg max-w w-[600px]"
                  >
                    <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-5">{mode == "create" ? `New Area` : mode == "edit" ? "Edit Area" : "View Area"}</h2>
                    <div className="grid grid-cols-2 gap-5 pt-4">
                      <div>
                        <label
                          htmlFor="name"
                          className={labelClass}
                        >
                          <span className="text-red-500">*</span>
                          {`Area Name`}
                        </label>
                        {/* <input
                          id="name"
                          type="text"
                          placeholder="Enter Area Name"
                          readOnly={isReadOnly}
                          {...register("name", { required: "Select Area Name" })}
                          className={`${inputClass} ${errors.name && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'}`}
                        /> */}

                        {/* Area Name ต้องบังคับใส่ตัวพิมพ์ใหญ่เหมือน Zone https://app.clickup.com/t/86erctye4 */}
                        <input
                          id="name"
                          type="text"
                          placeholder="Enter Area Name"
                          readOnly={mode === 'view' && isReadOnly ? true : disableAfterstartDate ? true : false}
                          {...register("name", { required: "Select Area Name" })}
                          className={`${inputClass} ${errors.name && "border-red-500"} ${mode === 'view' && isReadOnly ? '!bg-[#EFECEC]' : disableAfterstartDate && '!bg-[#EFECEC]'}`}
                          onInput={(e) => (e.currentTarget.value = e.currentTarget.value.toUpperCase())}
                        />
                        {errors.name && (<p className="text-red-500 text-sm">{`Type Area Name`}</p>)}
                      </div>

                      {/* <div className="pb-2">
                        <label className={labelClass}>{`Color`}</label>
                        <div className="flex items-center gap-5">
                          <span
                            className={`mr-2 font-light text-sm `}
                          >{`Select your area color.`}</span>
                          <input
                            id="color"
                            type="color"
                            {...register("color")}
                            min={formattedStartDate || undefined}
                            placeholder={"Select Date"}
                            readOnly={isReadOnly}
                            disabled={isReadOnly}
                            className={`!w-[70px] ${isReadOnly && '!bg-[#EFECEC]'} `}
                          />
                        </div>
                      </div> */}

                      <div className="pb-2">
                        <label className={labelClass}>{`Color`}</label>
                        <div className="flex items-center gap-5">
                          <span className={`mr-2 font-light text-sm`}>{`Select your area color.`}</span>
                          <div className={`!w-[70px]`}>

                            {/* {disableAfterstartDate == false && !isReadOnly ? ( */}
                            {mode == 'edit' || mode == 'create' ? (
                              <>
                                <div
                                  className="w-full h-10 bg-[#DFE4EA] rounded-[6px] cursor-pointer border"
                                  style={{ backgroundColor: watch("color") }}
                                  onClick={handleColorClick}
                                ></div>

                                {/* {showPicker && !isReadOnly && !disableAfterstartDate && ( */}
                                {showPicker && (
                                  <div ref={pickerRef} className="absolute z-10 mt-0 -ml-20" >
                                    <SketchPicker
                                      color={watch("color")}
                                      presetColors={["#189bcc", "#2c6fc3", "#fbec5d", "#ea213a", "#eeeeee", "#ff7373", "#267de3", "#4ea27a", "#854442", "#3d4761", "#becc41", "#6b3fa0", "#324033", "#2bbcbb", "#1f2431", "#ff6600", "#ccffcc", "#ff99ff", "#00ffcc", "#663300", "#189bcc", "#2c6fc3", "#fbec5d", "#ea213a"]}
                                      {...register("color")}
                                      onChange={(color) => {
                                        setValue("color", color.hex)
                                        setBlockPickerColor(color.hex);
                                      }}
                                    />
                                  </div>
                                )}
                              </>
                            ) : (
                              <div
                                className="w-full h-10 bg-[#DFE4EA] rounded-[6px]"
                                style={{ backgroundColor: watch("color") }}
                              />
                            )}
                          </div>
                          <input
                            type="hidden"
                            {...register("color")}
                            value={color} // Pass the selected color to the form field
                          />
                        </div>
                      </div>

                      {/* <div className="col-span-2">
                      <label//app.clickup.com/t/86et8dx05
                        htmlFor="description"
                        className="block mb-2 text-sm font-light"
                      >
                        {`Description`}
                      </label>
                      <input
                        id="description"
                        type="text"
                        placeholder="Enter Description"
                        readOnly={isReadOnly}
                        {...register("description")}
                        className={`${inputClass} ${errors.description && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'}`}
                      />
                    </div> */}

                      <div className="col-span-2">
                        <label htmlFor="description" className={labelClass}>
                          {`Description`}
                        </label>
                        {/* {mode == "view" || disableAfterstartDate ? //for view only by bangju */}
                        {mode == "view" ? //for view only by bangju
                          <div className="h-[40px] bg-[#EFECEC] p-2 ps-4 rounded-lg text-[14px]">
                            {watch('description')}
                          </div>
                          :
                          <>
                            {/* <TextField
                            {...register('description')}
                            value={watch('description') || ''}
                            onChange={(e) => {
                              if (e.target.value.length <= 50) {
                                setValue('description', e.target.value);
                              }
                            }}
                            label=""
                            multiline={false}
                            placeholder='Enter Description'
                            disabled={isReadOnly}
                            rows={1}
                            sx={{
                              '.MuiOutlinedInput-root': {
                                borderRadius: '8px',
                              },
                              '.MuiOutlinedInput-notchedOutline': {
                                // borderColor: '#DFE4EA',
                                borderColor: errors.detail && !watch('detail') ? '#FF0000' : '#DFE4EA',
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#d2d4d8',
                              },
                              '&.Mui-focused .MuiOutlinedI nput-notchedOutline': {
                                borderColor: '#d2d4d8',
                              },
                              '& .MuiInputBase-input::placeholder': {
                                color: '#9CA3AF',
                                fontSize: '14px',
                                opacity: '1'
                              },
                              '& .MuiInputBase-input': {
                                height: "20px",
                                padding: "10px 20px"
                              },
                              '& .MuiInputBase-input:hover': {
                                padding: "10px 20px !important"
                              },
                              '& .MuiInputBase-input:focus': {
                                padding: "10px 20px !important"
                              }
                            }}
                            fullWidth
                            className={`${errors.description && "border-red-500"} ${isReadOnly && '!bg-[#EFECEC] h-[30px]'}`}
                          /> */}
                            <input
                              id="description"
                              type="text"
                              placeholder='Enter Description'
                              // {...register('description', { required: "Enter Description" })}
                              {...register('description')}
                              readOnly={isReadOnly}
                              onChange={(e) => {
                                if (e.target.value.length <= 50) {
                                  setValue('description', e.target.value);
                                }
                              }}
                              maxLength={50}
                              className={`${inputClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errors.description && 'border-red-500'}`}
                            />
                            <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                              <span className="text-[13px]">{watch('description')?.length || 0} / 50</span>
                            </div>
                          </>
                        }
                      </div>

                      <div>
                        <label
                          htmlFor="entry_exit_id"
                          className={labelClass}
                        >
                          <span className="text-red-500">*</span>
                          {`Entry/Exit`}
                        </label>
                        <SelectFormProps
                          id={'entry_exit_id'}
                          register={register("entry_exit_id", { required: "Select Entry / Exit" })}
                          disabled={isReadOnly || disableAfterstartDate}
                          valueWatch={watch("entry_exit_id") || ""}
                          handleChange={(e) => {
                            setValue("entry_exit_id", e.target.value);
                            setValue("supply_reference_quality_area", null);
                            if (errors?.entry_exit_id) { clearErrors('entry_exit_id') }
                          }}
                          errors={errors?.entry_exit_id}
                          errorsText={'Select Entry / Exit'}
                          options={entryExitMasterData}
                          optionsKey={'id'}
                          optionsValue={'id'}
                          optionsText={'name'}
                          optionsResult={'name'}
                          placeholder={'Select Entry / Exit'}
                          pathFilter={'name'}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="zone_id"
                          className={labelClass}
                        >
                          <span className="text-red-500">*</span>
                          {`Zone Name`}
                        </label>

                        <SelectFormProps
                          id={'zone_id'}
                          register={register("zone_id", { required: "Select Zone Name" })}
                          disabled={isReadOnly || disableAfterstartDate}
                          valueWatch={watch("zone_id") || ""}
                          handleChange={(e) => {
                            setValue("zone_id", e.target.value);
                            if (errors?.zone_id) { clearErrors('zone_id') }
                          }}
                          errors={errors?.zone_id}
                          errorsText={'Select Zone Name'}
                          options={zoneMasterDataInDate?.filter((zone: any) => zone.entry_exit_id === watch("entry_exit_id"))}
                          optionsKey={'id'}
                          optionsValue={'id'}
                          optionsText={'name'}
                          optionsResult={'name'}
                          placeholder={'Select Zone Name'}
                          pathFilter={'name'}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="area_nominal_capacity"
                          className={labelClass}
                        >
                          <span className="text-red-500">*</span>
                          {`Area Nominal Capacity (MMBTU/D)`}
                        </label>

                        <NumericFormat
                          id="area_nominal_capacity"
                          placeholder="0.000"
                          value={watch("area_nominal_capacity")}
                          disabled={isReadOnly || disableAfterstartDate}
                          {...register("area_nominal_capacity", { required: "Enter Area Nomination Capacity (MMBTU/D)" })}
                          className={`${inputClass} ${errors.area_nominal_capacity && "border-red-500"} ${isReadOnly ? '!bg-[#EFECEC]' : disableAfterstartDate && '!bg-[#EFECEC]'} text-right`}
                          thousandSeparator={true}
                          decimalScale={3}
                          fixedDecimalScale={true}
                          allowNegative={false}
                          displayType="input"
                          onValueChange={(values) => {
                            const { value } = values;
                            setValue("area_nominal_capacity", value, { shouldValidate: true, shouldDirty: true });
                          }}
                        />

                        {errors.area_nominal_capacity && (
                          <p className="text-red-500 text-sm">{`Enter Area Nomination Capacity (MMBTU/D)`}</p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="supply_reference_quality_area"
                          className={`${labelClass} mb-[9px]`}
                        >
                          {/* <span className="text-red-500">*</span> */}
                          {`Supply Reference Quality Area`}
                        </label>
                        {/* <Select
                          id="supply_reference_quality_area"
                          IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                          {...register("supply_reference_quality_area")}
                          disabled={isReadOnly || disableAfterstartDate || (entryExitId === 1 && true)}
                          value={watch("supply_reference_quality_area") || ""}
                          className={`${selectboxClass} ${isReadOnly ? '!bg-[#EFECEC]' : disableAfterstartDate && '!bg-[#EFECEC]'} ${errors.supply_reference_quality_area && "border-red-500"}`}
                          onChange={(e) => {
                            setValue("supply_reference_quality_area", e.target.value);
                          }}
                          style={{ background: entryExitId === 1 ? "#51515110" : "" }}
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
                          renderValue={(value: any) => {
                            if (!value) {
                              return <Typography className={isReadOnly ? 'opacity-0' : watch('entry_exit_id') == 2 ? 'opacity-100 text-[#9CA3AF] ' : watch('entry_exit_id') == 1 ? 'opacity-0' : disableAfterstartDate ? 'opacity-0' : 'opacity-100 text-[#9CA3AF]'} fontSize={14}>{`Select Supply Reference Quality Area`}</Typography>;
                            }
                            return <span className={itemselectClass}>{areaEntry?.find((item: any) => item.id === value)?.name || ''}</span>;
                          }}
                          MenuProps={{
                            PaperProps: {
                              style: {
                                maxHeight: 48 * 4.5 + 8, // Item height * 4.5 + padding
                                // width: 250, // Adjust width as needed
                              },
                            },
                          }}
                        >
                          {entryExitId === 2 && areaEntry?.map((e: any) => {
                            return (
                              <MenuItem key={e.id} value={e.id}>
                                <ListItemText primary={<Typography fontSize={14}>{e.name}</Typography>} />
                              </MenuItem>
                            )
                          })}
                        </Select>
                        {errors.supply_reference_quality_area && (<p className="text-red-500 text-sm">{`Enter Supply Reference Quality Area`}</p>)} */}

                        <SelectFormProps
                          id={'supply_reference_quality_area'}
                          register={register("supply_reference_quality_area", { required: false })}
                          disabled={isReadOnly || disableAfterstartDate || (entryExitId === 1 && true)}
                          valueWatch={watch("supply_reference_quality_area") || ""}
                          handleChange={(e) => {
                            setValue("supply_reference_quality_area", e.target.value);
                            if (errors?.supply_reference_quality_area) { clearErrors('supply_reference_quality_area') }
                          }}
                          errors={errors?.supply_reference_quality_area}
                          errorsText={'Select Supply Reference Quality Area'}
                          options={entryExitId === 2 ? areaEntry : []}
                          optionsKey={'id'}
                          optionsValue={'id'}
                          optionsText={'name'}
                          optionsResult={'name'}
                          placeholder={'Select Supply Reference Quality Area'}
                          pathFilter={'name'}
                        />
                      </div>

                      <div className="pb-2">
                        <label className={labelClass}>
                          <span className="text-red-500">*</span>
                          {`Start Date`}
                        </label>
                        <DatePickaForm
                          {...register('start_date', { required: "Select start date" })}
                          readOnly={isReadOnly || disableAfterstartDate}
                          placeHolder="Select Start Date"
                          mode={disableAfterstartDate ? 'view' : mode}
                          valueShow={watch("start_date") ? dayjs(watch("start_date")).format("DD/MM/YYYY") : undefined}
                          // min={formattedStartDate || undefined}
                          min={new Date()}
                          maxNormalForm={watch('end_date') && watch('end_date')} // ไม่ให้ start_date เกิน end_date
                          // valueShow={watch("start_date")}
                          allowClear
                          isError={errors.start_date && !watch("start_date") ? true : false}
                          onChange={(e: any) => { setValue('start_date', formatFormDate(e)), e == undefined && setValue('start_date', null, { shouldValidate: true, shouldDirty: true }); }}
                        />
                        {errors.start_date && !watch("start_date") && <p className={`${textErrorClass}`}>{'Select Start Date'}</p>}
                      </div>

                      <div className="pb-2">
                        <label className={`${labelClass} mb-[10px]`}>{`End Date`}</label>
                        <DatePickaForm
                          {...register('end_date')}
                          readOnly={!formattedStartDate ? true : isReadOnly}
                          placeHolder="Select End Date"
                          mode={mode}
                          // min={formattedStartDate || undefined}
                          min={getMinDate(formattedStartDate)}
                          // valueShow={watch("end_date") ? dayjs(watch("end_date")).format("DD/MM/YYYY") : undefined}
                          valueShow={watch("end_date") && watch("end_date") !== "Invalid Date" && dayjs(watch("end_date")).format("DD/MM/YYYY")}
                          allowClear
                          onChange={(e: any) => {
                            if (e) {
                              setValue('end_date', formatFormDate(e))
                            } else {
                              setValue('end_date', null, { shouldValidate: true, shouldDirty: true });
                            }
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-6">
                      {mode === "view" ? (
                        <button
                          type="button"
                          // onClick={onClose}
                          onClick={() => handleClose()}
                          className="w-[167px] font-light bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                        >
                          {`Close`}
                        </button>
                      ) : (
                        <button
                          type="button"
                          // onClick={onClose}
                          onClick={() => handleClose()}
                          className="w-[167px] font-light bg-slate-100 text-black py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500"
                        >
                          {`Cancel`}
                        </button>
                      )}

                      {mode !== "view" && (
                        <button
                          type="submit"
                          className="w-[167px] font-light bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                        >
                          {mode === "create" ? "Add" : "Save"}
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      {/* Confirm Save */}
      <ModalConfirmSave
        open={modaConfirmSave}
        handleClose={(e: any) => {
          setModaConfirmSave(false);
          if (e == "submit") {
            // onSubmit(dataSubmit)
            // setTimeout(async () => {
            //     handleClose();
            // }, 1000);

            // setValue('concept_point', null)
            // setValue('type_concept_point_id', null)

            setIsLoading(true);
            setTimeout(async () => {
              await onSubmit(dataSubmit);
            }, 100);

            setTimeout(async () => {
              handleClose();
            }, 1000);
          }
        }}
        title="Confirm Save"
        description={
          <div>
            <div className="text-center">
              {`Do you want to save the changes ? `}
            </div>
          </div>
        }
        menuMode="confirm-save"
        btnmode="split"
        btnsplit1="Save"
        btnsplit2="Cancel"
        stat="none"
      />
    </>
  );
};

export default ModalAction;