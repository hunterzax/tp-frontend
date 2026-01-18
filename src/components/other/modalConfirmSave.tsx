"use client";
import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
interface ModalComponentProps {
  open: boolean;
  handleClose: (value: any) => void;
  title: string;
  description: any;
  stat?: string
  btntxt?: string
  btnmode?: string
  btnsplit1?: string
  btnsplit2?: string
  menuMode?: string
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 490,
  bgcolor: 'background.paper',
//   border: '2px solid #000',
//   boxShadow: 24,
  px : 3,
  py: 5,
  borderRadius: '20px',
};

const ModalConfirmSave: React.FC<ModalComponentProps> = ({ open, handleClose, title, description, stat = "success", btntxt = "OK", btnmode = "single", btnsplit1 = "OK", btnsplit2 = "Cancle", menuMode }) => {
  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        {/* ICON */}
        {/* <div className="flex items-center justify-center pb-2">
          <div className={`flex items-center justify-center w-[60px] h-[60px] mb-3 ${stat == "success" ? "bg-[#DAF8E6] text-[#1A8245]" : stat == "error" ? "bg-[#FEEBEB] text-[#E10E0E]" : (stat == "logout" || stat == 'confirm') && "bg-[#FFF7DB] text-[#D6AC16]"} rounded-full`}>
            {stat == "success" ? <CheckIcon /> : (stat === "error" || stat === "logout") ? <CloseRoundedIcon/> : stat === "confirm" && <WarningAmberRoundedIcon sx={{fontSize: '32px'}}/>}
          </div>
        </div> */}

        <div className={`flex pb-2 justify-center text-[#00ADEF] text-[24px] font-[700] mb-3`}>
          {title}
        </div>

        <div className="flex justify-center items-center text-center text-[#637381] h-full text-[16px]">
          {description}
        </div>
        <div className='flex pt-4 justify-center mt-5'>
          {btnmode == "single" ? 
            <button
              type='button'
              onClick={handleClose}
              className="w-[120px] h-[50px] bg-[#00ADEF] text-white hover:bg-blue-600 rounded-md"
            >
              {btntxt}
            </button>
            :
            btnmode == "split" &&
            <div className='flex pt-2 justify-center gap-[30px]'>
              <button
                type='button'
                onClick={() => handleClose("cancle")}
                className={`w-[190px] h-[46px] bg-[#fff] text-[#637381] border-[1px] border-[#dedede] hover:border-[#c9c9c9] rounded-md text-[16px]  ${menuMode == 'daily-adjust' && '!bg-[#1473A1] text-[#ffffff]'}`}
              >
                {btnsplit2}
              </button>

              <button
                type='button'
                onClick={() => handleClose("submit")}
                className="w-[190px] h-[46px] bg-[#00ADEF] text-white hover:bg-blue-600 rounded-md text-[16px]"
              >
                {btnsplit1}
              </button>
            </div>
          }
        </div>
      </Box>
    </Modal>
  );
};

export default ModalConfirmSave;