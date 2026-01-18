import { useEffect } from "react";
import React, { FC, useState } from 'react';
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
import { exportToExcel, formatMonth, formatMonthX, formatNumberThreeDecimal, generateNext24Months, keepLatestPerGroupByPeriod, mergeDataByGroupMedTermVersionTwo } from "@/utils/generalFormatter";
import ModalFullView from "./modalFullView";
import NodataTable from "@/components/other/nodataTable";
import MonthYearPickaSearch from "@/components/library/dateRang/monthYearPicker";
import getUserValue from "@/utils/getuserValue";
import ModalFullViewMedium from "./modalFullview_MEDIUM";

ChartJS.register(BarElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, annotationPlugin, ChartDataLabels);

interface TableProps {
    dataChart?: any;
    userPermission?: any;
    setFilterDataMedTerm?: any;
    filterDataMedTerm?: any;
    setFilterDataMedTermEach?: any;
    dataMedTermEachGroup?: any;
    areaMasterDataFilter?: any;
    setSrchStartYearMedTerm?: any;
}

const ChartMediumTermAll: React.FC<TableProps> = ({ dataChart, userPermission, setFilterDataMedTerm, filterDataMedTerm, setFilterDataMedTermEach, dataMedTermEachGroup, areaMasterDataFilter, setSrchStartYearMedTerm }) => {

    const userDT: any = getUserValue();
    // ############### REDUX DATA ###############
    const { shipperGroupData, areaMaster, entryExitMaster } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const dispatch = useAppDispatch();

    // ############### Doughnut SEARCH ###############
    const [key, setKey] = useState(0);
    const [srchStartYear, setSrchStartYear] = useState<any>('');
    const [srchShipper, setSrchShipper] = useState('');
    const [srchEntryExit, setSrchEntryExit] = useState('');
    const [srchArea, setSrchArea] = useState<any>([]);

    // for full view
    const [openView, setOpenView] = useState<any>(false);
    const [isAll, setIsAll] = useState<any>(false);
    const [modeView, setModeView] = useState<any>();
    const [dataView, setDataView] = useState<any>();
    const [dataOriginalView, setdataOriginalView] = useState<any>();

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

        setgenarateDataChart(chartData)
        setoriginalDataChart(chartData)
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
            month: string[];
            value: number[];
        }>();

        // ตรงนี้ใส่ originalData
        dataChart?.forEach((entry: any) => {
            entry?.data.forEach((item: any) => {
                const key = item?.area?.name;

                if (!areaMap.has(key)) {
                    areaMap?.set(key, { ...item, value: item?.value && Array.isArray(item.value) ? [...item.value] : [], day: item?.month && Array.isArray(item.month) ? [...item.month] : [] });
                } else {
                    const existing = areaMap.get(key)!;
                    if (existing && existing.value && Array.isArray(existing.value) && item?.value && Array.isArray(item.value)) {
                        existing.value = existing.value.map((v, i) => v + (item.value[i] || 0));
                    }
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
        const latestPerGroupMedTerm = keepLatestPerGroupByPeriod(resultFilterData);
        let modifiedDataMed2 = mergeDataByGroupMedTermVersionTwo(latestPerGroupMedTerm);
        setFilterDataMedTermEach(resultFilterData);
        // setFilterDataMedTermEach(modifiedDataMed2);

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

    const handleReset = () => {
        setSrchArea([]);
        setSrchStartYear('');
        setSrchStartYearMedTerm('');
        setSrchShipper('');
        setSrchEntryExit('');
        setFilterDataMedTerm(dataChart)
        setFilterDataMedTermEach(dataMedTermEachGroup)
        // setFilteredDataTable(dataTable);
        setKey((prevKey) => prevKey + 1);
        setgenarateDataChart(originalDataChart);
    };

    // ############### SAVE IMAGE OF CHART ###############
    // const chartRef: any = useRef(null); // Create ref for the chart
    // const handleSaveImage = () => {
    //     if (chartRef.current) {
    //         // Get the canvas element from the chart reference
    //         const imageURI = chartRef.current.toBase64Image();  // Directly call on chartRef.current
    //         // Create a temporary <a> element to trigger download
    //         const link = document.createElement('a');
    //         link.href = imageURI;
    //         link.download = 'chart.png'; // Set the default file name
    //         link.click(); // Trigger the download
    //     }
    // };


    const processData = (data: any) => {

        let months = formatMonthX(data?.[0]?.month)

        if (srchStartYear) {
            months = generateNext24Months(srchStartYear);
        }

        // const months = generateNext24Months(srchStartYear);

        // const areas = Array.from(new Set(data.flatMap((d:any) => d.area.id))); // Unique areas

        // const areas = Array.from(
        //     new Map(
        //         data.flatMap((d: any) => [{ id: d.area.id, name: d.area.name }]) // Extract id and name pairs
        //             .map((area: any) => [area.id, area]) // Use id as the key in the Map
        //     ).values() // Get unique area objects
        // );

        const areas = Array.from(
            new Map(
                (data || []).flatMap((d: any) => d?.area ? [{ id: d.area.id, name: d.area.name }] : []) // Safeguard for null/undefined data and area
                    .map((area: any) => [area.id, area]) // Use id as the key in the Map
            ).values() // Get unique area objects
        );

        // const areas = Array.from(new Set(data.flatMap((d:any) => d.area))); // Unique areas
        const seriesData = areas?.map((areaId: any) => {
            return months.map((month: any) => {
                const totalValue = data
                    ?.filter((d: any) => d.area.id === areaId?.id)
                    ?.reduce((sum: any, current: any) => {
                        const monthIndex = current.month.findIndex((m: any) => formatMonth(m) === month);
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

    // Prepare chart data
    // const { months, areas, seriesData } = processData(dataChart.flatMap((d: any) => d.data));
    const { months, areas, seriesData } = processData(filterDataMedTerm?.flatMap((d: any) => d.data));

    const chartData = {
        labels: months,
        // datasets: areas.map((areaId: any, index) => ({
        //     // label: `Area ${areaId?.name}`,
        //     label: `${areaId?.name}`,
        //     data: seriesData[index],
        //     // borderColor: dataChart[0].data.find((d: any) => d.area.id === areaId?.id).area.color,
        //     // backgroundColor: dataChart[0].data.find((d: any) => d.area.id === areaId?.id).area.color,
        //     borderColor: filterDataMedTerm[0].data.find((d: any) => d.area.id === areaId?.id).area.color,
        //     backgroundColor: filterDataMedTerm[0].data.find((d: any) => d.area.id === areaId?.id).area.color,
        //     fill: false
        // }))
        datasets: areas.map((areaId: any, index) => {
            const areaData = areaMaster?.data?.find((d: any) => d.name === areaId?.name);
            return {
                label: `${areaId?.name}`,
                data: seriesData[index],
                // borderColor: filterDataMedTerm[0].data.find((d: any) => d.area.id === areaId?.id).area.color,
                // backgroundColor: filterDataMedTerm[0].data.find((d: any) => d.area.id === areaId?.id).area.color,
                borderColor: areaData?.color,
                backgroundColor: areaData?.color,
                fill: false,
                isEntry: areaData?.entry_exit_id == 1 ? true : false,
                // areaName: areaData?.area?.name, // Store area name
                // customStyle: { borderWidth: 2, lineTension: 0.4 }, // Custom styles
                // metaInfo: {
                //     unit: areaData?.unit,
                //     entryExit: areaData?.entry_exit,
                // }
            };
        })
    };

    const handleOpenFullView = (mode?: any, data?: any, isAll?: any, originalData?: any) => {
        setOpenView(true);
        setIsAll(isAll);
        setModeView(mode);
        setDataView(data);
        if (originalData) {
            setdataOriginalView(originalData)
        }
    };

    // Chart options
    const options: any = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: "top",
                labels: {
                    usePointStyle: true,
                    // pointStyle: 'circle',
                    font: {
                        size: 12,
                        weight: "bold",
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
                color: '#58585A',
                // text: 'Total Supply (MMBTU)',
                text: 'Total Energy (MMBTU/D)', // v1.0.90 เปลี่ยนหัว Graph จาก "Total Supply (MMBTU)" เป็น "Total Energy (MMBTU/D)" https://app.clickup.com/t/86ert2k26
                font: {
                    size: 15,
                    weight: "normal"
                },
                position: 'top',
                align: 'start',
                zIndex: 5,
                padding: {
                    top: 0,
                    bottom: -20,
                },
            },


            // mode: 'nearest',
            // intersect: false,
            // backgroundColor: 'white', // Set tooltip background color to white
            // titleColor: 'black', // Set title color to black (optional)
            // bodyColor: 'black', // Set body text color to black (optional)
            // borderColor: '#cfcfd1', // Set tooltip border color (e.g., black)
            // borderWidth: 1, // Set the width of the border
            // callbacks: {
            //     label: (tooltipItem: any) => {
            //         const labelName: any = tooltipItem?.dataset ? tooltipItem?.dataset?.label : '';  // Accessing the label name
            //         const value = tooltipItem.raw ? formatNumberThreeDecimal(tooltipItem.raw) : 0;  // Formatting the value
            //         return `${labelName} : ${value}`;  // Showing label name and value
            //     },
            // },

            tooltip: {
                // mode: 'index',
                mode: 'nearest',
                enabled: true,
                intersect: false,
                backgroundColor: 'white',
                title: false,
                titleColor: '#767676',
                bodyColor: '#767676',
                padding: 5,
                boxPadding: 5,
                usePointStyle: true,
                callbacks: {
                    title: () => null,
                    // label: function (tooltipItem: any, data: any) {
                    //     return (tooltipItem?.raw === 0 ? null : tooltipItem?.dataset?.label)
                    // },
                    // afterLabel: function (tooltipItem: any, data: any) {
                    //     return (tooltipItem?.raw === 0 ? null : formatNumberThreeDecimal(tooltipItem?.raw))
                    // },
                    label: (tooltipItem: any) => {
                        const labelName = tooltipItem?.dataset?.label;
                        const value = tooltipItem?.raw !== null && tooltipItem?.raw !== undefined ? formatNumberThreeDecimal(tooltipItem.raw) : '';
                        return `${labelName || ''} : ${value}`;
                    },
                    labelColor: function (context: any) {
                        return {
                            borderColor: context?.dataset?.backgroundColor,
                            backgroundColor: context?.dataset?.backgroundColor,
                            borderWidth: 0,
                            borderRadius: 2,
                        }
                    },
                },
                // Adjust font size for larger tooltip
                bodyFont: {
                    size: 15,  // Adjust font size for body text
                    family: 'Tahoma', // Optional: Change font family
                    weight: 'normal', // Optional: Change font weight
                },
                titleFont: {
                    size: 14, // Adjust title font size if you decide to enable title
                    family: 'Tahoma',
                    weight: 'bold',
                },
                // Optional: Adjust corner radius and shadow for tooltip appearance
                cornerRadius: 10,  // Make the corners of the tooltip rounded
                boxWidth: 50,  // Increase box width of the tooltip icon
                // Add stroke (border) to the tooltip
                borderColor: 'rgba(0, 0, 0, 0.2)', // Set border color (a soft black)
                borderWidth: 1, // Set border width (adjust to your preference)
                // Optionally adjust the border radius for rounded corners
                borderRadius: 5,
                // Add shadow to the tooltip as well (if you want both)
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
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
        animation: {
            onSuccess: () => {
                const chart = ChartJS.getChart('MediumtermChart');
                if (chart) {
                    const { legend }: any = chart;
                    legend.top = -8;
                }
            },
        }
    };

    return (
        <div className={`h-auto min-h-[300px] overflow-y-auto block rounded-t-md relative z-1 p-2`}>
            <div className="flex justify-between w-full">
                <div className="py-[7px] pl-[12px]">
                    <h2 className="text-[16px] font-bold text-[#58585A] ">{'Medium term'}</h2>
                </div>
                <div className="flex gap-2 justify-end">
                    <BtnGeneral
                        textRender={"Full View"}
                        iconNoRender={false}
                        modeIcon={'full_view'}
                        bgcolor={"#00ADEF"}
                        // can_view={userPermission ? userPermission?.f_view : false}
                        can_view={true} //ถ้า user มีสิทธิดูหน้านี้ก็มีสิทธิดู fullview ได้

                        generalFunc={() => handleOpenFullView('Medium term', chartData, true, dataChart)}
                    // generalFunc={() => handleSaveImage()}
                    />
                    <BtnGeneral
                        textRender={"Export"}
                        iconNoRender={false}
                        modeIcon={'export'}
                        bgcolor={"#17AC6B"}
                        // generalFunc={() => exportToExcel(dataChart, "medium_term_total")}
                        generalFunc={() => exportToExcel(filterDataMedTerm, "medium_term_total")}
                        can_export={userPermission ? userPermission?.f_export : false}
                    />
                    {/* <BtnExport textRender={"Export"} /> */}
                </div>
            </div>

            <aside className="flex flex-wrap sm:flex-row gap-2 pb-2 w-full pl-[12px]">
                <MonthYearPickaSearch
                    key={"start" + key}
                    label="Month"
                    placeHolder="Select Month"
                    allowClear
                    onChange={(e: any) => {

                        setSrchStartYear(e ? e : null)
                        setSrchStartYearMedTerm(e ? e : null)
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
                        ?.filter((item: any) => srchEntryExit === '' || item?.entry_exit_id === srchEntryExit)
                        .map((item: any) => ({
                            value: item.name,
                            label: item.name,
                        }))
                    }
                />

                <BtnSearch handleFieldSearch={handleFieldSearch} />
                <BtnReset handleReset={handleReset} />
            </aside>

            <div className="w-full h-[350px] p-2 mt-[15px]">
                <div className="font-semibold text-[16px] text-[#58585A] mb-2">
                    {/* {`Total Supply (MMBTU)`} */}
                    {/* v1.0.90 เปลี่ยนหัว Graph จาก "Total Supply (MMBTU)" เป็น "Total Energy (MMBTU/D)" https://app.clickup.com/t/86ert2k26 */}
                    {`Total Energy (MMBTU/D)`}
                </div>
                {genarateDataChart ? <Line id="MediumtermChart" data={genarateDataChart} options={options} /> : <NodataTable />}
            </div>

            <ModalFullViewMedium
                mode={modeView}
                data={dataView}
                dataOriginal={dataOriginalView}
                isAll={isAll}
                open={openView}
                onClose={() => {
                    setOpenView(false);
                }}
                shipperGroupData={shipperGroupData}
                areaMaster={areaMaster}
                entryExitMaster={entryExitMaster}
            />
        </div>
    )
}

export default ChartMediumTermAll;