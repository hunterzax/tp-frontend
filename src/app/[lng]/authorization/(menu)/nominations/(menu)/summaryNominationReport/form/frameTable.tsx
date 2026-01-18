import { useEffect } from "react";
import React, { useState } from 'react';
import { Tab, Tabs } from "@mui/material";
import TableAllNomination from "./tableAll/tableAllNom";
import TableAllArea from "./tableAll/tableAllArea";
import TableAllTotalSystem from "./tableAll/tableAllTotalSystem";
import TableWeeklyNomination from "./tableWeekly/tableWeeklyNom";
import TableWeeklyArea from "./tableWeekly/tableWeeklyArea";
import TableWeeklyTotalSystem from "./tableWeekly/tableWeeklyTotalSystem";
import TableDailyNomination from "./tableDaily/tableDailyNom";
import TableDailyArea from "./tableDaily/tableDailyArea";
import TableDailyTotalSystem from "./tableDaily/tableDailyTotalSystem";


// ********************************************************************************************************************
// ทุก Tab ของเมนูนี้ Column Utilization แสดงทศนิยมแค่สองตำแหน่ง ทั้งหน้า UI และใน Excel https://app.clickup.com/t/86etzcgv7
// ********************************************************************************************************************


// หน้านี้มี Tab Nomination, Area, Total System
// tab MMSCF, MMBTU
// tab hour ['All Day' ,'1-6 Hr.' , '7-12 Hr.' , '13-18 Hr.' , '19-24 Hr.']

const FrameTable: React.FC<any> = ({ activeButton, tableData, isLoading, userPermission, zoneText, tempData, setTempData, tempDataConcept, setTempDataConcept, areaMaster, zoneMaster, entryExitMaster, setIsEdited, tabEntry, tabConcept, setCheckIsAllAreaImbalance, srchStartDate }) => {

    // ############### TAB NOM, AREA, TOTAL SYSTEM ###############
    const [tabIndexNomAreaTotal, setTabIndexNomAreaTotal] = useState(0);
    const handleChange = (event: any, newValue: any) => {
        // 0 = Nomination
        // 1 = Area
        // 2 = Total System
        setTabIndexNomAreaTotal(newValue);
    };

    // ############### TAB MMSCF, MMBTU, Imbalance ###############
    const [tabIndex2ndTab, setTabIndex2ndTab] = useState(0);
    const handleChange2ndTab = (event: any, newValue: any) => {
        // 0 = MMSCF
        // 1 = MMBTU, Imbalance
        setTabIndex2ndTab(newValue);
    };

    // activeButton == 1 && tabIndexNomAreaTotal == 1 && tabIndex2ndTab == 1

    useEffect(() => {
        if (activeButton == 1 && tabIndexNomAreaTotal == 1 && tabIndex2ndTab == 1) { // tab all
            setCheckIsAllAreaImbalance(true)
        } else if (activeButton == 1 && tabIndexNomAreaTotal == 2) {
            setCheckIsAllAreaImbalance(true) // All > Total System > เอา Check Box Over Total Cap ออก https://app.clickup.com/t/86euy3aub
        } else if (activeButton == 3 && tabIndexNomAreaTotal == 2) {
            setCheckIsAllAreaImbalance(true) // Daily > Total System > เอา Check Box Total Cap ออก https://app.clickup.com/t/86euy3pjd
        } else if (activeButton == 3 && tabIndexNomAreaTotal == 1 && tabIndex2ndTab == 1) { // tab daily
            setCheckIsAllAreaImbalance(true)
        } else {
            setCheckIsAllAreaImbalance(false)
        }
    }, [tabIndexNomAreaTotal, tabIndex2ndTab, activeButton])

    return (
        <>
            {/* Tab หลัก */}
            <div className="tabPlanning pb-2 ">
                <Tabs
                    value={tabIndexNomAreaTotal}
                    onChange={handleChange}
                    aria-label="tabs"
                    sx={{
                        marginBottom: '-19px !important',
                        '& .MuiTabs-indicator': {
                            display: 'none', // Remove the underline
                        },
                        '& .Mui-selected': {
                            color: '#58585A !important',
                        },
                    }}
                >
                    {['Nomination', 'Area', 'Total System'].map((label, index) => (
                        <Tab
                            key={label}
                            label={label}
                            id={`tab-${index}`}
                            sx={{
                                fontFamily: 'Tahoma !important',
                                border: '0.5px solid',
                                borderColor: '#DFE4EA',
                                borderBottom: 'none',
                                borderTopLeftRadius: '9px',
                                borderTopRightRadius: '9px',
                                textTransform: 'none',
                                padding: '8px 16px',
                                minWidth: '80px',
                                maxWidth: '80px',
                                flexShrink: 0, // Prevents shrinking
                                backgroundColor: tabIndexNomAreaTotal === index ? '#FFFFFF' : '#9CA3AF1A',
                                color: tabIndexNomAreaTotal === index ? '#58585A' : '#9CA3AF',
                                '&:hover': {
                                    backgroundColor: '#F3F4F6',
                                },
                            }}
                        />
                    ))}
                </Tabs>
            </div>

            {/* <div className="w-full h-[calc(100vh-300px)]  border-[#DFE4EA] border-[1px] rounded-tl-none gap-2 rounded-xl shadow-sm flex flex-col overflow-hidden"> */}
            <div className="w-full h-[calc(100vh-180px)] border-[#DFE4EA] border-[1px] rounded-tl-none gap-2 rounded-xl shadow-sm flex flex-col overflow-hidden">

                {/* Tab ย่อยสีฟ้า ๆ */}
                <div className="pt-2 px-2">
                    {tabIndexNomAreaTotal !== 2 && ( // แสดงเฉพาะ tab 'Nomination', 'Area'
                        <Tabs
                            value={tabIndex2ndTab}
                            onChange={handleChange2ndTab}
                            aria-label="wrapped label tabs example"
                            sx={{
                                '& .Mui-selected': {
                                    color: '#00ADEF !important',
                                    fontWeight: 'bold !important',
                                },
                                '& .MuiTabs-indicator': {
                                    backgroundColor: '#00ADEF !important',
                                    width: '59px !important',
                                    transform: 'translateX(35%)',
                                    bottom: '10px',
                                },
                                '& .MuiTab-root': {
                                    minWidth: 'auto !important',
                                },
                            }}
                        >
                            {(tabIndexNomAreaTotal === 0 ? ['MMSCF', 'MMBTU'] : ['MMBTU', 'Imbalance']).map((label, index) => (
                                <Tab
                                    key={label}
                                    label={label}
                                    id={`tab-${index}`}
                                    sx={{
                                        fontFamily: 'Tahoma !important',
                                        textTransform: 'none',
                                        padding: '8px 16px',
                                        minWidth: '35px',
                                        maxWidth: '103px',
                                        flexShrink: 0,
                                        color: tabIndex2ndTab === index ? '#58585A' : '#9CA3AF',
                                    }}
                                />
                            ))}

                        </Tabs>
                    )}
                </div>


                {/* แสดง table */}
                <div className="pt-2 px-2">
                    {
                        // TABLE ALL --> NOMINATION --> MMSCF
                        activeButton == 1 && tabIndexNomAreaTotal == 0 && tabIndex2ndTab == 0 && <TableAllNomination tabIndex2ndTab={tabIndex2ndTab} isLoading={true} tableData={tableData?.nomination?.all?.MMSCFD} nomData={tableData?.nomData} userPermission={userPermission} />
                    }

                    {
                        // TABLE ALL --> NOMINATION --> MMBTU
                        activeButton == 1 && tabIndexNomAreaTotal == 0 && tabIndex2ndTab == 1 && <TableAllNomination tabIndex2ndTab={tabIndex2ndTab} isLoading={true} tableData={tableData?.nomination?.all?.MMBTUD} nomData={tableData?.nomData} userPermission={userPermission} />
                    }

                    {
                        // TABLE ALL --> AREA --> MMSCF
                        activeButton == 1 && tabIndexNomAreaTotal == 1 && tabIndex2ndTab == 0 && <TableAllArea tabIndex2ndTab={tabIndex2ndTab} isLoading={true} tableData={tableData?.area?.all?.MMBTUD} areaMaster={areaMaster} nomData={tableData?.nomData} userPermission={userPermission} />
                    }

                    {
                        // TABLE ALL --> AREA --> IMBALANCE
                        activeButton == 1 && tabIndexNomAreaTotal == 1 && tabIndex2ndTab == 1 && <TableAllArea tabIndex2ndTab={tabIndex2ndTab} isLoading={true} tableData={tableData?.area?.all?.Imbalance} areaMaster={areaMaster} nomData={tableData?.nomData} userPermission={userPermission} />
                    }

                    {
                        // TABLE ALL --> TOTAL SYSTEM
                        activeButton == 1 && tabIndexNomAreaTotal == 2 && <TableAllTotalSystem isLoading={true} tableData={tableData?.total?.all} areaMaster={areaMaster} zoneMaster={zoneMaster} userPermission={userPermission} srchStartDate={srchStartDate}/>
                    }


                    {/* ============================================================================================================================== */}
                    {/* ============================================================================================================================== */}

                    {
                        // TABLE WEEKLY --> NOMINATION --> MMSCF
                        activeButton == 2 && tabIndexNomAreaTotal == 0 && tabIndex2ndTab == 0 && <TableWeeklyNomination tabIndex2ndTab={tabIndex2ndTab} isLoading={true} tableData={tableData?.nomination?.weekly?.MMSCFD} nomData={tableData?.nomData} userPermission={userPermission} />
                    }

                    {
                        // TABLE WEEKLY --> NOMINATION --> MMBTU
                        activeButton == 2 && tabIndexNomAreaTotal == 0 && tabIndex2ndTab == 1 && <TableWeeklyNomination tabIndex2ndTab={tabIndex2ndTab} isLoading={true} tableData={tableData?.nomination?.weekly?.MMBTUD} nomData={tableData?.nomData} userPermission={userPermission} />
                    }

                    {
                        // TABLE WEEKLY --> AREA --> MMBTU
                        activeButton == 2 && tabIndexNomAreaTotal == 1 && tabIndex2ndTab == 0 && <TableWeeklyArea isLoading={true} tabIndex2ndTab={tabIndex2ndTab} tableData={tableData?.area?.weekly?.MMBTUD} areaMaster={areaMaster} userPermission={userPermission} />
                    }

                    {
                        // TABLE WEEKLY --> AREA --> IMBALANCE
                        activeButton == 2 && tabIndexNomAreaTotal == 1 && tabIndex2ndTab == 1 && <TableWeeklyArea isLoading={true} tabIndex2ndTab={tabIndex2ndTab} tableData={tableData?.area?.weekly?.Imbalance} areaMaster={areaMaster} userPermission={userPermission} />
                    }

                    {
                        // TABLE WEEKLY --> TOTAL SYSTEM
                        activeButton == 2 && tabIndexNomAreaTotal == 2 && <TableWeeklyTotalSystem isLoading={true} tableData={tableData?.total?.weekly} areaMaster={areaMaster} zoneMaster={zoneMaster} userPermission={userPermission} srchStartDate={srchStartDate} />
                    }


                    {/* ============================================================================================================================== */}
                    {/* ============================================================================================================================== */}

                    {
                        // TABLE DAILY --> NOMINATION --> MMSCF
                        activeButton == 3 && tabIndexNomAreaTotal == 0 && tabIndex2ndTab == 0 && <TableDailyNomination isLoading={true} tabIndex2ndTab={tabIndex2ndTab} tableData={tableData?.nomination?.daily?.MMSCFD} nomData={tableData?.nomData} userPermission={userPermission} />
                    }

                    {
                        // TABLE DAILY --> NOMINATION --> MMBTU
                        activeButton == 3 && tabIndexNomAreaTotal == 0 && tabIndex2ndTab == 1 && <TableDailyNomination isLoading={true} tabIndex2ndTab={tabIndex2ndTab} tableData={tableData?.nomination?.daily?.MMBTUD} nomData={tableData?.nomData} userPermission={userPermission} />
                    }

                    {
                        // TABLE DAILY --> AREA --> MMBTU
                        activeButton == 3 && tabIndexNomAreaTotal == 1 && tabIndex2ndTab == 0 && <TableDailyArea isLoading={true} tabIndex2ndTab={tabIndex2ndTab} tableData={tableData?.area?.daily?.MMBTUD} areaMaster={areaMaster} userPermission={userPermission} />
                    }

                    {
                        // TABLE DAILY --> AREA --> IMBALANCE
                        activeButton == 3 && tabIndexNomAreaTotal == 1 && tabIndex2ndTab == 1 && <TableDailyArea isLoading={true} tabIndex2ndTab={tabIndex2ndTab} tableData={tableData?.area?.daily?.Imbalance} areaMaster={areaMaster} userPermission={userPermission} />
                    }

                    {
                        // TABLE DAILY --> TOTAL SYSTEM
                        activeButton == 3 && tabIndexNomAreaTotal == 2 && <TableDailyTotalSystem isLoading={true} tableData={tableData?.total?.daily} areaMaster={areaMaster} zoneMaster={zoneMaster} userPermission={userPermission} srchStartDate={srchStartDate} />
                    }

                </div>
            </div>

        </>
    )
}

export default FrameTable;