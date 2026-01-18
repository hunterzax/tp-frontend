import { useEffect } from "react";
import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, BarElement } from 'chart.js';
import { InputSearch } from "@/components/other/SearchForm";
import { useFetchMasters } from "@/hook/fetchMaster";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import BtnGeneral from "@/components/other/btnGeneral";
import { useAppDispatch } from "@/utils/store/store";
import { fetchShipperGroup } from "@/utils/store/slices/shipperGroupSlice";
import { fetchAreaMaster } from "@/utils/store/slices/areaMasterSlice";
import { fetchEntryExit } from "@/utils/store/slices/entryExitSlice";
import annotationPlugin from 'chartjs-plugin-datalabels';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { exportToExcel, filterDataShortByMonth, formatDay, formatNumberThreeDecimal, formatSearchDate, generateDaysFromFutureMonth, getEarliestFirstDay, keepLatestPerGroupByPeriod, mergeDataByGroupMedTermVersionTwo } from "@/utils/generalFormatter";
import MonthYearPickaSearch from "@/components/library/dateRang/monthYearPicker";
import getUserValue from "@/utils/getuserValue";
import ModalFullViewShort from "./modalFullView_SHORT";
import NodataTable from "@/components/other/nodataTable";
import dayjs from "dayjs";

ChartJS.register(BarElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, annotationPlugin, ChartDataLabels);

interface TableProps {
    dataChart?: any;
    userPermission?: any;
    setFilterDataShortTerm?: any;
    filterDataShortTerm?: any;
    dataShortTermEachMain?: any; // short term เอามา filter
    setFilterDataShortTermEach?: any; // short term เอามา filter
    dataShortTermEachGroup?: any; // short term เอามา filter
    setDataShortTermEachGroup?: any; // short term เอามา filter
    setSrchStartDay?: any; // short term เอามา filter
    areaMasterDataFilter?: any; // area ที่กรองมาแล้ว
}

const ChartShortTermAll: React.FC<TableProps> = ({ dataChart, userPermission, setFilterDataShortTerm, filterDataShortTerm, dataShortTermEachMain, setFilterDataShortTermEach, setDataShortTermEachGroup, dataShortTermEachGroup, setSrchStartDay, areaMasterDataFilter }) => {

    // ############### REDUX DATA ###############
    const { shipperGroupData, areaMaster, entryExitMaster } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const dispatch = useAppDispatch();
    const userDT: any = getUserValue();

    // search panel
    const [key, setKey] = useState(0);
    const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
    const [srchStartYear, setSrchStartYear] = useState<any>('');

    const [srchShipper, setSrchShipper] = useState('');
    const [srchEntryExit, setSrchEntryExit] = useState('');
    const [srchArea, setSrchArea] = useState<any>([]);

    // for full view
    const [openView, setOpenView] = useState<any>(false);
    const [modeView, setModeView] = useState<any>();
    const [dataView, setDataView] = useState<any>();
    const [dataOriginalView, setdataOriginalView] = useState<any>();
    const [isAll, setIsAll] = useState<any>(false);

    const [originalDataChart, setoriginalDataChart] = useState<any>();
    const [genarateDataChart, setgenarateDataChart] = useState<any>();

    useEffect(() => {

        const dataFullview: any = geranateFullView()
        const { months, areas, seriesData } = processData(dataFullview?.data);

        let chartData: any

        chartData = {
            labels: months,
            datasets: areas?.map((areaId: any, index) => {
                const areaData = areaMaster?.data?.find((d: any) => d.name === areaId?.name);
                return {
                    label: `${areaId?.name}`,
                    data: seriesData[index],
                    borderColor: areaData?.color,
                    backgroundColor: areaData?.color,
                    fill: false,
                    isEntry: areaData?.entry_exit_id == 1 ? true : false,
                };
            })
        };

        setgenarateDataChart(chartData);
        setoriginalDataChart(chartData);
    }, [dataChart])

    useEffect(() => {
        if (forceRefetch) {
            dispatch(fetchShipperGroup());
            dispatch(fetchAreaMaster());
            dispatch(fetchEntryExit());
        }
        if (forceRefetch) {
            setForceRefetch(false);
        }
    }, [dispatch, shipperGroupData, areaMaster, entryExitMaster, forceRefetch]);

    useEffect(() => {
        // ถ้า user เป็น shipper
        // https://app.clickup.com/t/86ert2k28 ตามที่คุยกัน หากเป็น shipper user ถ้ามี filter ชื่อ shipper ให้ค้างชื่อ shipper ตัวเองไว้เลย ไม่ต้องขึ้นเป็น dropdown ให้เลือก - ปรับทั้ง system
        if (userDT?.account_manage?.[0]?.user_type_id == 3) {

            setSrchShipper(userDT?.account_manage?.[0]?.group?.id)
        }
    }, [])

    const geranateFullView = () => {

        // สำหรับแสดงข้อมูลใน modalFull -> short term ของอิง
        const areaMap = new Map<string, {
            id: number;
            nomination_point: string;
            customer: string;
            area: { id: number; name: string; color: string };
            unit: string;
            entry_exit_id: number;
            entry_exit: string;
            day: string[];
            value: number[];
        }>();

        // ตรงนี้ใส่ originalData
        dataChart?.forEach((entry: any) => {
            entry.data.forEach((item: any) => {
                const key = item.area.name;

                if (!areaMap.has(key)) {
                    areaMap.set(key, { ...item, value: [...item.value], day: [...item.day] });
                } else {
                    const existing = areaMap.get(key)!;
                    existing.value = existing.value.map((v, i) => v + item.value[i]);
                }
            });
        });

        const reducedDataAll = {
            ...dataChart[0],
            data: Array.from(areaMap.values()),
        };

        return reducedDataAll
    }

    const handleFieldSearch = () => {

        const dataforFilterShipper: any = dataChart?.filter((item: any) => { return (srchShipper ? item?.group?.id == srchShipper : true) });

        // data too
        // |
        // |
        // V

        //filter item => entry_exit
        const dataforFilterEntryExit = dataforFilterShipper?.map((item: any) => {
            const filterInnerData = item.data?.filter((innerFind: any) => {
                const entryExitMatch = srchEntryExit ? innerFind?.entry_exit_id == srchEntryExit : true;
                return entryExitMatch;
            }) || [];

            if (filterInnerData?.length > 0) {
                return {
                    ...item,
                    data: filterInnerData,
                };
            } else {
                return {
                    ...item,
                    data: []
                };
            }
        })

        // data too
        // |
        // |
        // V

        //filter item => area
        const dataforFilterArea = dataforFilterEntryExit?.map((item: any) => {
            if (srchArea && srchArea?.length > 0) {
                const filterInnerData = item?.data?.filter((innerFind: any) => {
                    let checked = srchArea?.find((itemFindSub: any) => itemFindSub == innerFind?.area?.name) || false;
                    return checked
                })

                if (filterInnerData?.length > 0) {
                    return {
                        ...item,
                        data: filterInnerData,
                    };
                } else {
                    return {
                        ...item,
                        data: []
                    };
                }
            } else {
                return { ...item }
            }
        })


        //finish data to render chart
        const resultFilterData: any = dataforFilterArea
        const latestPerGroupShortTerm = keepLatestPerGroupByPeriod(resultFilterData);
        let modifiedDataShort2 = mergeDataByGroupMedTermVersionTwo(latestPerGroupShortTerm);

        let data_filter_date = modifiedDataShort2
        if(srchStartDate !== null){
            // กรองข้อมูล data_short.data.day ให้ตรงกับเดือนใน srchStartDate
            data_filter_date = filterDataShortByMonth(modifiedDataShort2, srchStartDate)
        }

        // setFilterDataShortTermEach(modifiedDataShort2);
        setFilterDataShortTermEach(data_filter_date);

        //render data to chart
        const { months, areas, seriesData } = processData(resultFilterData?.flatMap((d: any) => d?.data));

        // data too
        // |
        // |
        // V

        const chartDataX = {
            labels: months,
            datasets: areas?.map((areaId: any, index) => {
                const areaData = areaMaster?.data.find((d: any) => d.name === areaId?.name);
                return {
                    label: `${areaId?.name}`,
                    data: seriesData[index],
                    borderColor: areaData?.color,
                    backgroundColor: areaData?.color,
                    fill: false,
                    isEntry: areaData?.entry_exit_id == 1 ? true : false,
                };
            })
        };

        setgenarateDataChart(chartDataX);
    };

    //OLD FUNCTION KOM
    const handleFieldSearchBackup = () => {
        // ===================== CHART MAIN =====================
        // ===================== CHART MAIN =====================
        let filteredDataShort: any = dataChart

        // Filter Entry Exit นะ
        if (srchEntryExit !== '') {
            filteredDataShort = filteredDataShort
                .map((dataObj: any) => {
                    const filteredData = dataObj.data.filter((entry: any) => entry.entry_exit_id === srchEntryExit);
                    return filteredData.length > 0 ? { ...dataObj, data: filteredData } : null;
                })
                .filter(Boolean);
        }
        const filteredResult2 = filteredDataShort?.filter((item: any) => {
            // ถ้าไม่เสิช ไม่ฟิลเตอร์
            if (srchShipper && item.group?.id !== srchShipper) {
                return false;
            }
            return true;
        }).map((item: any) => ({
            ...item,
            data: item.data
                .map((entry: any) => {
                    const formattedSearchMonthYear = srchStartYear !== '' ? formatSearchDate(srchStartYear) : ''; // Extract MM/YYYY or empty if not provided

                    // If srchStartYear is empty, don't filter by month
                    const isMonthMatch = srchStartYear !== ''
                        ? Array.isArray(entry?.day) &&
                        entry?.day.some((entryMonth: string) => {
                            if (!entryMonth) return false;
                            const entryMonthYear = entryMonth; // Extract MM/YYYY
                            return entryMonthYear >= formattedSearchMonthYear;
                        })
                        : true; // When srchStartYear is empty, skip month check

                    // Get valid indices where month >= srchStartYear (by MM/YYYY) if srchStartYear is not empty
                    const validIndices = srchStartYear !== ''
                        ? entry?.day
                            ?.map((month: string, index: number) => {
                                if (!month) return -1;
                                const entryMonthYear = month;
                                return entryMonthYear >= formattedSearchMonthYear ? index : -1;
                            })
                            .filter((index: any) => index !== -1) // Remove invalid indices
                        : entry?.day.map((_: any, index: any) => index); // Keep all indices if no filter (srchStartYear is empty)

                    // Area filter
                    const isAreaMatch = srchArea?.length > 0 ? srchArea.includes(entry?.area?.name) : true;

                    if (!isAreaMatch || !isMonthMatch) return null; // Remove entries that don't match

                    return {
                        ...entry,
                        month: validIndices.map((index: any) => entry.day[index]), // Keep only valid months
                        value: validIndices.map((index: any) => entry.value[index]), // Keep only matching values
                    };
                })
                .filter((entry: any) => entry && entry.day.length > 0) // Remove null/empty entries
            // .filter((entry: any) =>{ entry && entry.month.length > 0 || entry == null}) // Remove null/empty entries
        }));
        setFilterDataShortTerm(filteredResult2);


        // >>>>>>>>>>> FILTER SHORT TERM MAIN GRAPH <<<<<<<<<<
        // const result = dataChart.filter((item: any) => {
        //     return (
        //         (srchShipper ? item?.group?.id === srchShipper : true) &&
        //         (srchEntryExit ? item.data.some((entry: any) => entry?.entry_exit_id === srchEntryExit) : true) &&
        //         (srchArea ? item.data.some((entry: any) => entry?.area?.id === srchArea) : true)
        //     );
        // });

        // const filteredResult = result.map((item: any) => ({
        //     ...item,
        //     data: item.data.filter((entry: any) =>
        //         (srchEntryExit ? entry?.entry_exit_id === srchEntryExit : true) &&
        //         (srchArea ? entry?.area?.id === srchArea : true)
        //     ),
        // }));
        // setFilterDataShortTerm(filteredResult);



        // ===================== CHART SUB =====================
        // ===================== CHART SUB =====================
        let filteredDataShortEach: any = dataShortTermEachGroup
        if (srchEntryExit) {
            filteredDataShortEach = filteredDataShortEach
                .map((dataObj: any) => {
                    const filteredData = dataObj.data.filter((entry: any) => entry.entry_exit_id === srchEntryExit);
                    return filteredData.length > 0 ? { ...dataObj, data: filteredData } : null;
                })
                .filter(Boolean);
        }

        const result_each = filteredDataShortEach?.filter((item: any) => {
            // ถ้าไม่เสิช ไม่ฟิลเตอร์
            if (srchShipper && item.group?.id !== srchShipper) {
                return false;
            }
            return true;
        }).map((item: any) => ({
            ...item,
            data: item.data
                .map((entry: any) => {
                    const formattedSearchMonthYear = srchStartYear ? formatSearchDate(srchStartYear) : null; // Extract MM/YYYY

                    // Check if month matches MM/YYYY condition
                    const isMonthMatch = formattedSearchMonthYear
                        ? Array.isArray(entry?.day) &&
                        entry?.day.some((entryMonth: string) => {
                            if (!entryMonth) return false;
                            const entryMonthYear = entryMonth; // Extract MM/YYYY
                            return entryMonthYear >= formattedSearchMonthYear;
                        })
                        : true;

                    // Get valid indices where month >= srchStartYear (by MM/YYYY)
                    const validIndices = formattedSearchMonthYear
                        ? entry?.day
                            ?.map((month: string, index: number) => {
                                if (!month) return -1;
                                const entryMonthYear = month;
                                return entryMonthYear >= formattedSearchMonthYear ? index : -1;
                            })
                            .filter((index: any) => index !== -1) // Remove invalid indices
                        : entry?.day.map((_: any, index: any) => index); // Keep all indices if no filter

                    // Area filter
                    const isAreaMatch = srchArea?.length > 0 ? srchArea.includes(entry?.area?.name) : true;

                    if (!isAreaMatch || !isMonthMatch) return null; // Remove entries that don't match

                    return {
                        ...entry,
                        month: validIndices.map((index: any) => entry.day[index]), // Keep only valid months
                        value: validIndices.map((index: any) => entry.value[index]), // Keep only matching values
                    };
                })
                .filter((entry: any) => entry && entry.day.length > 0) // Remove null/empty entries
            // .filter((entry: any) =>{ entry && entry.month.length > 0 || entry == null}) // Remove null/empty entries
        }));
        setFilterDataShortTermEach(result_each)
    }

    const handleReset = () => {
        setSrchStartDay('')
        setSrchStartDate(null);
        setSrchArea([]);
        setSrchShipper('');
        setSrchStartYear('');
        setSrchEntryExit('');

        setFilterDataShortTerm(dataChart)

        setFilterDataShortTermEach(dataShortTermEachMain)

        // setFilteredDataTable(dataTable);
        setKey((prevKey) => prevKey + 1);

        setgenarateDataChart(originalDataChart);
    };

    // Process data
    const processData = (data: any) => {

        const earliestDay = getEarliestFirstDay(data); // หาวันที่น้อยที่สุด จะได้เอามาทำ label

        // const months = Array.from(new Set(data.flatMap((d: any) => d.day.map(formatDay)))); // Unique months
        const months = generateDaysFromFutureMonth(srchStartDate ? srchStartDate : dayjs(earliestDay, 'DD/MM/YYYY').toDate());

        const areas = Array.from(
            new Map(
                (data || []).flatMap((d: any) => d?.area ? [{ id: d?.area?.id, name: d?.area?.name }] : []) // Safeguard for null/undefined data and area
                    ?.map((area: any) => [area.id, area]) // Use id as the key in the Map
            ).values() // Get unique area objects
        );

        const seriesData = areas?.map((areaId: any) => {
            return months.map(month => {
                const totalValue = data
                    ?.filter((d: any) => d.area.id === areaId?.id)
                    ?.reduce((sum: any, current: any) => {
                        const monthIndex = current.day.findIndex((m: any) => formatDay(m) === month);
                        if (monthIndex >= 0) {
                            return sum + current.value[monthIndex];
                        }
                        return sum;
                    }, 0);
                return totalValue;
            });
        });

        return {
            months,
            areas,
            seriesData
        };
    };

    // onclick full view
    const handleOpenFullView = (mode?: any, data?: any, isAll?: any, originalData?: any) => {
        setIsAll(isAll);
        setOpenView(true);
        setModeView(mode);
        setDataView(data);
        if (originalData) {
            setdataOriginalView(originalData)
        }
    };

    // chart option tip
    let option_chart: any = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    font: {
                        size: 12,
                    },
                    boxWidth: 20,
                    boxHeight: 12,
                    padding: 18,
                    generateLabels: (chart: any) => {
                        return chart.data.datasets.map((dataset: any, index: any) => ({
                            text: dataset.label,
                            fillStyle: dataset.backgroundColor,
                            strokeStyle: dataset.borderColor,
                            hidden: !chart.isDatasetVisible(index),
                            pointStyle: dataset.isEntry ? 'rect' : 'circle',
                        }));
                    }
                },
                onClick: null
            },
            title: {
                display: false,
                // text: 'Total Supply (MMBTU)',
                text: 'Total Energy (MMBTU/D)', // v1.0.90 เปลี่ยนหัว Graph จาก "Total Supply (MMBTU)" เป็น "Total Energy (MMBTU/D)" https://app.clickup.com/t/86ert2k26
                align: 'start',
                position: 'top',
                font: {
                    size: 16,
                    // weight: 'normal',
                },
                padding: {
                    top: 5,
                    bottom: 1,
                },
                color: '#58585A',
            },
            tooltip: {
                // mode: 'index',
                mode: 'nearest',
                intersect: false,
                backgroundColor: 'white',
                titleColor: 'black',
                bodyColor: 'black', // Set body text color to black (optional)
                borderColor: '#cfcfd1',
                borderWidth: 1,
                callbacks: {
                    label: (tooltipItem: any) => {
                        // Access the label name and value
                        const labelName: any = tooltipItem?.dataset ? tooltipItem?.dataset?.label : '';  // Accessing the label name
                        const value = tooltipItem.raw ? formatNumberThreeDecimal(tooltipItem.raw) : 0;  // Formatting the value
                        return `${labelName} : ${value}`;  // Showing label name and value
                    },
                },

            },
            datalabels: {
                display: false,
            },
        },
        scales: {
            x: {
                title: {
                    display: false,
                    text: 'Month'
                }
            },
            y: {
                title: {
                    display: false,
                    text: 'Value'
                },
                beginAtZero: true
            }
        },
    }

    return (
        <div className={`h-auto min-h-[300px] overflow-y-auto  block rounded-t-md relative z-1 p-2`}>
            <div className="flex justify-between w-full">
                <div className="py-[7px] pl-[12px]">
                    <h2 className="text-[16px] font-bold text-[#58585A] ">{'Short term'}</h2>
                </div>

                {/* Align buttons to the right */}
                <div className="flex gap-2 justify-end">
                    <BtnGeneral
                        textRender={"Full View"}
                        iconNoRender={false}
                        modeIcon={'full_view'}
                        bgcolor={"#00ADEF"}
                        // can_view={userPermission ? userPermission?.f_view : false}
                        can_view={true} //ถ้า user มีสิทธิดูหน้านี้ก็มีสิทธิดู fullview ได้
                        generalFunc={() => handleOpenFullView('Short term', genarateDataChart, true, dataChart)}
                    />
                    <BtnGeneral
                        textRender={"Export"}
                        iconNoRender={false}
                        modeIcon={'export'}
                        bgcolor={"#17AC6B"}
                        generalFunc={() => exportToExcel(dataChart, "short_term_total")}
                        can_export={userPermission ? userPermission?.f_export : false}
                    />
                </div>
            </div>

            <aside className="flex flex-wrap sm:flex-row gap-2 pb-2 w-full pl-[12px]">
                <MonthYearPickaSearch
                    key={"start" + key}
                    label="Month"
                    placeHolder="Select Month"
                    allowClear
                    onChange={(e: any) => {
                        setSrchStartDate(e ? e : null)
                        setSrchStartDay(e ? e : null)
                        setSrchStartYear(e ? e : null)
                    }}
                />

                <InputSearch
                    id="searchShipper"
                    label="Shipper"
                    type="select"
                    value={srchShipper}
                    isDisabled={userDT?.account_manage?.[0]?.user_type_id == 3 ? true : false}
                    onChange={(e) => setSrchShipper(e.target.value)}
                    options={shipperGroupData?.data?.map((item: any) => ({
                        value: item.id,
                        label: item.name
                    }))}
                />

                <InputSearch
                    id="searchEntryExit"
                    label="Entry/Exit"
                    type="select"
                    value={srchEntryExit}
                    onChange={(e) => {
                        if (e?.target?.value) {
                            setSrchEntryExit(e.target.value)
                        } else {
                            setSrchEntryExit('')
                        }
                    }}
                    options={entryExitMaster?.data?.map((item: any) => ({
                        value: item.id,
                        label: item.name
                    }))}
                />

                <InputSearch
                    id="searchArea"
                    label="Area"
                    type="select-multi-checkbox"
                    value={srchArea}
                    onChange={(e) => setSrchArea(e.target.value)}
                    options={areaMasterDataFilter
                        ?.filter((item: any) => srchEntryExit === '' || item.entry_exit_id === srchEntryExit)
                        .map((item: any) => ({
                            value: item.name,
                            label: item.name,
                        }))
                    }
                />

                <BtnSearch handleFieldSearch={handleFieldSearch} />
                <BtnReset handleReset={handleReset} />
            </aside>

            <div className="overflow-x-auto mt-[15px]">
                <div className="w-[3500px] h-[350px] p-2">
                    <div className="font-semibold text-[16px] text-[#58585A] mb-2">
                        {/* {`Total Supply (MMBTU)`} */}
                        {/* v1.0.90 เปลี่ยนหัว Graph จาก "Total Supply (MMBTU)" เป็น "Total Energy (MMBTU/D)" https://app.clickup.com/t/86ert2k26 */}
                        {`Total Supply (MMBTU)`}
                    </div>
                    {genarateDataChart ? <Line data={genarateDataChart} options={option_chart} /> : <NodataTable />}
                </div>
            </div>

            <ModalFullViewShort
                mode={modeView}
                data={dataView}
                dataOriginal={dataOriginalView}
                open={openView}
                isAll={isAll}
                onClose={() => {
                    setOpenView(false);
                    setdataOriginalView(undefined);
                }}
                shipperGroupData={shipperGroupData}
                areaMaster={areaMaster}
                entryExitMaster={entryExitMaster}
            />


        </div>
    )
}

export default ChartShortTermAll;