import React, { useEffect, useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { formatDate, formatDay, formatMonth, formatNumber, formatSearchDate, generateDaysFromFutureMonth, generateNext24Months } from '@/utils/generalFormatter';
import { Line } from 'react-chartjs-2';

import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, BarElement } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-datalabels';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import ChartMedEachShipper from './chartMedTermEachShipper';
import ChartShortEachShipper from './chartShortTermEachShipper';
import DatePickaSearch from '@/components/library/dateRang/dateSearch';
import { InputSearch } from '@/components/other/SearchForm';
import BtnSearch from '@/components/other/btnSearch';
import BtnReset from '@/components/other/btnReset';
import MonthYearPickaSearch from '@/components/library/dateRang/monthYearPicker';

ChartJS.register(BarElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, annotationPlugin, ChartDataLabels);

type FormExampleProps = {
    data?: any;
    dataOriginal?: any;
    open?: boolean;
    isAll?: boolean;
    mode?: any;
    shipperGroupData?: any;
    entryExitMaster?: any;
    areaMaster?: any;
    onClose: () => void;
};

const ModalFullView: React.FC<FormExampleProps> = ({
    open,
    onClose,
    data,
    dataOriginal,
    isAll,
    shipperGroupData,
    entryExitMaster,
    areaMaster,
    mode
}) => {

    // ############### PROCESS DATA MEDIUM TERM EACH ###############
    const [filterDataMedEach, setFilterDataMedEach] = useState<any>();
    const [isFilter, setIsFilter] = useState<any>(false);

    const [transerData, settranserData] = useState<any>();

    // useEffect(() => {

    //     if (data && mode == "Medium term" && !isAll) {
    //         const { months, areas, seriesData } = processData(data?.data);

    //         let chartData: any

    //         chartData = {
    //             labels: months,
    //             datasets: areas?.map((areaId: any, index) => {
    //                 const areaData = areaMaster?.data.find((d: any) => d.name === areaId?.name);
    //                 return {
    //                     label: `${areaId?.name}`,
    //                     data: seriesData[index],
    //                     borderColor: areaData?.color,
    //                     backgroundColor: areaData?.color,
    //                     fill: false,
    //                     isEntry: areaData?.entry_exit_id == 1 ? true : false,
    //                 };
    //             })
    //         };

    //         settranserData(chartData);
    //     }

    // }, [mode == "Medium term", !isAll])

    useEffect(() => {
        if (mode && data) {
            // const { months, areas, seriesData } = processData(data?.data);
            const { months, areas, seriesData } = processData(data?.data);
            let chartData: any

            chartData = {
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

            settranserData(chartData);
        }

    }, [mode, data])



    const processData = (data: any) => {
        // const months = Array.from(new Set(data.flatMap((d: any) => d.month.map(formatMonth)))); // Unique months
        // const months = generateNext24Months(srchStartDate);

        // // รายเดือน
        // const months = generateNext24Months(srchStartDate);
        // const areas = Array.from(
        //     new Map(
        //         (data || []).flatMap((d: any) => d?.area ? [{ id: d.area.id, name: d.area.name }] : []) // Safeguard for null/undefined data and area
        //             ?.map((area: any) => [area.id, area]) // Use id as the key in the Map
        //     ).values() // Get unique area objects
        // );

        // const seriesData = areas?.map((areaId: any) => {
        //     return months.map(month => {
        //         const totalValue = data
        //             .filter((d: any) => d.area.id === areaId?.id)
        //             .reduce((sum: any, current: any) => {
        //                 const monthIndex = current?.month?.findIndex((m: any) => formatMonth(m) === month);
        //                 if (monthIndex >= 0) {
        //                     return sum + current?.value[monthIndex];
        //                 }
        //                 return sum;
        //             }, 0);
        //         return totalValue;
        //     });
        // });

        // return {
        //     months,
        //     areas,
        //     seriesData
        // };

        if (mode == "Long term" || mode == "Medium term") {
            // รายเดือน
            const months = generateNext24Months(srchStartDate);
            const areas = Array.from(
                new Map(
                    (data || []).flatMap((d: any) => d?.area ? [{ id: d.area.id, name: d.area.name }] : []) // Safeguard for null/undefined data and area
                        ?.map((area: any) => [area.id, area]) // Use id as the key in the Map
                ).values() // Get unique area objects
            );

            // const areas = Array.from(new Set(data.flatMap((d:any) => d.area))); // Unique areas
            const seriesData = areas?.map((areaId: any) => {
                return months.map(month => {
                    const totalValue = data
                        .filter((d: any) => d.area.id === areaId?.id)
                        .reduce((sum: any, current: any) => {
                            const monthIndex = current?.month?.findIndex((m: any) => formatMonth(m) === month);
                            if (monthIndex >= 0) {
                                return sum + current?.value[monthIndex];
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
        } else {
            const months = generateDaysFromFutureMonth(srchStartDate);

            const areas = Array.from(
                new Map(
                    (data || []).flatMap((d: any) => d?.area ? [{ id: d.area.id, name: d.area.name }] : []) // Safeguard for null/undefined data and area
                        ?.map((area: any) => [area.id, area]) // Use id as the key in the Map
                ).values() // Get unique area objects
            );

            const seriesData = areas.map((areaId: any) => {
                return months.map(month => {
                    const totalValue = data
                        .filter((d: any) => d.area.id === areaId?.id)
                        .reduce((sum: any, current: any) => {
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
        }
    };

    // const { months, areas, seriesData } = processData(data.flatMap((d: any) => d.data));
    // const chartData = {
    //     labels: months,

    //     datasets: areas.map((areaId: any, index) => {
    //         const areaData = areaMaster?.data.find((d: any) => d.name === areaId?.name);
    //         return {
    //             label: `${areaId?.name}`,
    //             data: seriesData[index],
    //             borderColor: areaData?.color,
    //             backgroundColor: areaData?.color,
    //             fill: false,
    //             isEntry: areaData?.entry_exit_id == 1 ? true : false,

    //         };
    //     })
    // };











    // ############### Doughnut SEARCH ###############
    const [key, setKey] = useState(0);
    const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
    const [srchShipper, setSrchShipper] = useState('');
    const [srchEntryExit, setSrchEntryExit] = useState('');
    const [srchArea, setSrchArea] = useState('');
    const [filterData, setFilterData] = useState<any>(data);

    // Helper function to compare month and year only
    function compareMonthYearTest(entryMonth: string, searchStartDate: string): boolean {
        const [entryDayPart, entryMonthPart, entryYear] = entryMonth.split('/');
        const [searchDay, searchMonth, searchYear] = searchStartDate.split('/');

        const entryDateValue = parseInt(entryYear) * 12 + parseInt(entryMonthPart); // MM/YYYY format as a number
        const searchDateValue = parseInt(searchYear) * 12 + parseInt(searchMonth); // MM/YYYY format as a number

        return entryDateValue >= searchDateValue; // Return true if entryMonth is equal or greater than searchStartDate
    }

    useEffect(() => {
        setFilterData(data)
    }, [data])

    let data_full_view = {
        "labels": [
            "Feb 2025",
            "Mar 2025",
            "Apr 2025",
            "May 2025",
            "Jun 2025",
            "Jul 2025",
            "Aug 2025",
            "Sep 2025",
            "Oct 2025",
            "Nov 2025",
            "Dec 2025",
            "Jan 2026",
            "Feb 2026",
            "Mar 2026",
            "Apr 2026",
            "May 2026",
            "Jun 2026",
            "Jul 2026",
            "Aug 2026",
            "Sep 2026",
            "Oct 2026",
            "Nov 2026",
            "Dec 2026",
            "Jan 2027"
        ],
        "datasets": [
            {
                "label": "Y",
                "data": [
                    1700,
                    0,
                    0,
                    600,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                "borderColor": "#c8ff8d",
                "backgroundColor": "#c8ff8d",
                "fill": false,
                "isEntry": true,
                "group": {
                    "id": 63,
                    "id_name": "BGRIMM-001-1",
                    "name": "B.GRIMM",
                    "company_name": "บริษัท บี.กริม เพาเวอร์ จำกัด (มหาชน)"
                }
            },
            {
                "label": "X1",
                "data": [
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                "borderColor": "#ffb3b3",
                "backgroundColor": "#ffb3b3",
                "fill": false,
                "isEntry": true,
                "group": {
                    "id": 67,
                    "id_name": "PTT-001",
                    "name": "PTT",
                    "company_name": "บริษัท ปตท. จำกัด"
                }
            },
            {
                "label": "A1",
                "data": [
                    1700,
                    0,
                    0,
                    600,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                "borderColor": "#fff0a0",
                "backgroundColor": "#fff0a0",
                "fill": false,
                "isEntry": false,
                "group": {
                    "id": 62,
                    "id_name": "EGAT-001-1",
                    "name": "EGAT",
                    "company_name": "การไฟฟ้าฝ่ายผลิตแห่งประเทศไทย (กฟผ.)"
                }
            }
        ]
    }

    // const { months, areas, seriesData } = processData(dataOriginal?.flatMap((d: any) => d.data));

    // const chartData = {
    //     labels: months,
    //     datasets: areas.map((areaId: any, index) => {
    //         const areaData = areaMaster?.data.find((d: any) => d.name === areaId?.name);
    //         return {
    //             label: `${areaId?.name}`,
    //             data: seriesData[index],
    //             borderColor: areaData?.color,
    //             backgroundColor: areaData?.color,
    //             fill: false,
    //             isEntry: areaData?.entry_exit_id == 1 ? true : false,
    //         };
    //     })
    // };

    const handleFieldSearch = () => {

        let data_to_filter: any
        if ((mode == "Medium term" || mode == "Short term") && isAll) {
            // const { months, areas, seriesData } = processData(dataOriginal?.flatMap((d: any) => d.data));
            // const chartData = {
            //     labels: months,
            //     datasets: areas.map((areaId: any, index) => {
            //         const areaData = areaMaster?.data.find((d: any) => d.name === areaId?.name);
            //         return {
            //             label: `${areaId?.name}`,
            //             data: seriesData[index],
            //             borderColor: areaData?.color,
            //             backgroundColor: areaData?.color,
            //             fill: false,
            //             isEntry: areaData?.entry_exit_id == 1 ? true : false,
            //         };
            //     })
            // };

            data_to_filter = data // old
            // data_to_filter = chartData
        } else {
            // each mode
            // ต้องเอา data จาก each mode แปลงที่ฟังก์ชั่น processDataMedEach ก่อน ทั้ง medium และ short
            // data_to_filter = data_full_view // mock old
            data_to_filter = transerData // mock new
        }

        // >>>>>>>>>>> FILTER MED TERM MAIN GRAPH <<<<<<<<<<
        // Step 1: Filter labels based on srchStartDate
        const filteredLabels = srchStartDate
            ? data_to_filter.labels.filter((label: any) => {
                const labelDate = new Date(label); // Convert label to date for comparison
                const startDate = srchStartDate ? (srchStartDate instanceof Date ? srchStartDate : new Date(srchStartDate)) : new Date();
                return labelDate >= startDate;
            })
            : data_to_filter.labels;

        // Step 2: Filter datasets based on srchEntryExit and srchArea
        const filteredDatasets = data_to_filter?.datasets
            .filter((item: any) => {
                // Step 2a: Check if dataset matches srchArea
                const areaCondition = srchArea ? item.label === srchArea : true;
                const shipperCondition = srchShipper ? item?.group?.id === srchShipper : true; //search shipper by name

                // Step 2b: Check if dataset matches srchEntryExit
                const entryExitCondition = srchEntryExit
                    ? (srchEntryExit.toString() === "1" ? item.isEntry === true : srchEntryExit.toString() === "2" ? item.isEntry === false : true)
                    : true;

                return areaCondition && shipperCondition && entryExitCondition;
            })
            ?.map((item: any) => {
                // Filter the data array for the dataset
                const filteredData = item.data.filter((_: any, index: any) => {
                    const labelDate = new Date(data_to_filter.labels[index]); // Get corresponding label's date
                    labelDate.setHours(0, 0, 0, 0); // Set time to midnight
                    const startDate = srchStartDate ? (srchStartDate instanceof Date ? srchStartDate : new Date(srchStartDate)) : new Date();
                    startDate.setHours(0, 0, 0, 0); // Set time to midnight
                    const startDateCondition = labelDate >= startDate;

                    return startDateCondition;
                });

                // Return the dataset with the filtered data
                return {
                    ...item,
                    data: filteredData
                };
            });

        // Step 3: Combine the filtered labels and datasets into the result
        const result = {
            labels: filteredLabels,
            datasets: filteredDatasets.filter((dataset: any) => dataset.data.length > 0) // Remove empty datasets
        };

        setFilterData(result)
        setIsFilter(true)
    };

    // update handleFieldSearch to support this data_full_view
    // srchStartDate == Thu Feb 06 2025 00:00:00 GMT+0700 (Indochina Time) ----> use for filter data_full_view.labels that >= srchStartDate
    // srchEntryExit == 1 ----> use for filter data_full_view.datasets.isEntry == true if srchEntryExit 2 use for filter data_full_view.datasets.isEntry == false
    // srchArea == Y ----> use for filter data_full_view.datasets.label == srchArea

    const handleReset = () => {
        setSrchStartDate(null);
        setSrchArea('');
        setSrchShipper('');
        setSrchEntryExit('');
        setFilterData(data)
        setIsFilter(false)
        // setFilteredDataTable(dataTable);
        setKey((prevKey) => prevKey + 1);
    };

    // Chart options
    const optionsAllmedium: any = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: "top",
                labels: {
                    usePointStyle: true,
                    font: {
                        size: 12,
                        weight: "bold",
                    },
                    boxWidth: 20,
                    boxHeight: 12,
                    padding: 18,
                    generateLabels: (chart: any) => {
                        return chart?.data?.datasets?.map((dataset: any, index: any) => ({
                            text: dataset.label,
                            fillStyle: dataset.backgroundColor,
                            strokeStyle: dataset.borderColor,
                            hidden: !chart.isDatasetVisible(index),
                            pointStyle: dataset.isEntry ? 'rect' : 'circle',
                        }));
                    }
                },
                zIndex: 10,
            },
            title: {
                display: true,
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
            datalabels: {
                display: false,
            },
            tooltip: {
                mode: 'index',
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
                    label: function (tooltipItem: any, data: any) {
                        return (tooltipItem?.raw === 0 ? null : tooltipItem?.dataset?.label)
                    },
                    afterLabel: function (tooltipItem: any, data: any) {
                        return (tooltipItem?.raw === 0 ? null : formatNumber(tooltipItem?.raw))
                    },
                    labelColor: function (context: any) {
                        return {
                            borderColor: context?.dataset?.backgroundColor,
                            backgroundColor: context?.dataset?.backgroundColor,
                            borderWidth: 2,
                            borderRadius: 2,
                        }
                    },
                },
            },
        },
        scales: {
            x: {
                title: {
                    display: false,
                    text: "Month",
                },
            },
            y: {
                title: {
                    display: false,
                    text: "Value (MMBtud)",
                },
                beginAtZero: true,
            },
        },
        animation: {
            onSuccess: () => {
                const chart = ChartJS.getChart('AllmediumLine');
                if (chart) {
                    const { legend }: any = chart;
                    legend.top = -8;
                }
            },
        }
    };

    let shortTermOption: any = {
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
                        return chart?.data?.datasets?.map((dataset: any, index: any) => ({
                            text: dataset.label,
                            fillStyle: dataset.backgroundColor,
                            strokeStyle: dataset.backgroundColor,
                            hidden: !chart.isDatasetVisible(index),
                            pointStyle: dataset.isEntry ? 'rect' : 'circle',
                        }));
                    }
                },
            },
            title: {
                display: true,
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
                mode: 'index',
                intersect: false,
                backgroundColor: 'white',
                titleColor: 'black',
                bodyColor: 'black',
                borderColor: '#cfcfd1',
                borderWidth: 1,
                callbacks: {
                    label: (tooltipItem: any) => {
                        const labelName = tooltipItem.dataset.label;
                        const value = formatNumber(tooltipItem.raw);
                        return `${labelName} : ${value}`;
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

    let shortTermEachOption: any = {
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
                        return chart?.data?.datasets?.map((dataset: any, index: any) => ({
                            text: dataset.label,
                            fillStyle: dataset.backgroundColor,
                            strokeStyle: dataset.backgroundColor,
                            hidden: !chart.isDatasetVisible(index),
                            pointStyle: dataset.isEntry ? 'rect' : 'circle',
                        }));
                    }
                },
            },
            title: {
                display: true,
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
                mode: 'index',
                intersect: false,
                backgroundColor: 'white',
                titleColor: 'black',
                bodyColor: 'black',
                borderColor: '#cfcfd1',
                borderWidth: 1,
                callbacks: {
                    label: (tooltipItem: any) => {
                        const labelName = tooltipItem.dataset.label;
                        const value = formatNumber(tooltipItem.raw);
                        return `${labelName} : ${value}`;
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
        // <Dialog open={open} onClose={onClose} className="relative z-20">
        //     <div className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity" />

        //     <div className="fixed inset-0 z-10 flex items-center justify-center">
        //         <DialogPanel
        //             className="flex w-auto transform transition-all bg-white rounded-lg text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
        //         >
        //             {/* Content */}
        //             <div className="flex w-[87.3dvw] h-[96dvh] overflow-hidden flex-col items-center gap-2 p-9">
        //                 <h2 className="text-xl font-bold text-[#58585A] mb-2 pb-2 self-start">{`Full View : ${mode}`}</h2>

        //                 <aside className="flex flex-wrap sm:flex-row gap-2 pb-2 w-full">
        //                     <DatePickaSearch
        //                         key={"start" + key}
        //                         label="Month"
        //                         placeHolder="Select Month"
        //                         allowClear
        //                         onChange={(e: any) => setSrchStartDate(e ? e : null)}
        //                     />

        //                     <InputSearch
        //                         id="searchShipper"
        //                         label="Shipper"
        //                         type="select"
        //                         value={srchShipper}
        //                         onChange={(e) => setSrchShipper(e.target.value)}
        //                         options={shipperGroupData?.data?.map((item: any) => ({
        //                             value: item.id,
        //                             label: item.name
        //                         }))}
        //                     />

        //                     <InputSearch
        //                         id="searchEntryExit"
        //                         label="Entry/Exit"
        //                         type="select"
        //                         value={srchEntryExit}
        //                         onChange={(e) => setSrchEntryExit(e.target.value)}
        //                         options={entryExitMaster?.data?.map((item: any) => ({
        //                             value: item.id,
        //                             label: item.name
        //                         }))}
        //                     />

        //                     <InputSearch
        //                         id="searchArea"
        //                         label="Area"
        //                         type="select"
        //                         value={srchArea}
        //                         onChange={(e) => setSrchArea(e.target.value)}
        //                         options={areaMaster?.data
        //                             ?.filter((item: any) => srchEntryExit === '' || item.entry_exit_id === srchEntryExit)
        //                             .map((item: any) => ({
        //                                 value: item.name,
        //                                 label: item.name,
        //                             }))
        //                         }
        //                     />

        //                     <BtnSearch handleFieldSearch={handleFieldSearch} />
        //                     <BtnReset handleReset={handleReset} />
        //                 </aside>

        //                 <div className='w-[83.5dvw] h-[65dvh]'>
        //                     {/* Scrollable Chart */}
        //                     {isAll && mode === "Medium term" && (
        //                         <div className="max-w-[4500px] w-full h-[65dvh] "> {/* Scrollable container */}
        //                             <Line id="AllmediumLine" data={filterData} options={optionsAllmedium} />
        //                         </div>
        //                     )}

        //                     {!isAll && mode === "Medium term" && (
        //                         <>
        //                             {
        //                                 !isFilter ?
        //                                     <ChartMedEachShipper dataChart={filterData} mode="view" />
        //                                     :
        //                                     <div className="max-w-[4500px] w-full h-[65dvh] "> {/* Scrollable container */}
        //                                         <Line id="AllmediumLine" data={filterData} options={optionsAllmedium} />
        //                                     </div>
        //                             }
        //                         </>
        //                     )}

        //                     {isAll && mode === "Short term" && (
        //                         <div className="w-full overflow-x-auto">
        //                             <div className="w-[4500px] h-[550px] p-2">
        //                                 <Line data={filterData} options={shortTermOption}
        //                                 />
        //                             </div>
        //                         </div>
        //                     )}

        //                     {!isAll && mode === "Short term" && (
        //                         <>
        //                             {
        //                                 !isFilter ?
        //                                     <ChartShortEachShipper dataChart={filterData} />
        //                                     :
        //                                     <div className="max-w-[4500px] w-full h-[65dvh] "> {/* Scrollable container */}
        //                                         <Line data={filterData} options={shortTermEachOption}
        //                                         />
        //                                     </div>
        //                             }
        //                         </>
        //                     )}
        //                 </div>

        //                 <div className="w-full flex justify-end pt-8 h-full items-end">
        //                     <div>
        //                         <button
        //                             onClick={onClose}
        //                             className="w-[167px] h-[40px] font-bold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
        //                         >
        //                             {'Close'}
        //                         </button>
        //                     </div>
        //                 </div>
        //             </div>
        //         </DialogPanel>
        //     </div>
        // </Dialog>

        <Dialog open={open} onClose={onClose} className="relative z-20">
            <div className="fixed inset-0 bg-black bg-opacity-45 transition-opacity" />

            <div className="fixed inset-0 z-10 flex items-center justify-center">
                <DialogPanel className="flex w-auto transform transition-all bg-white rounded-lg text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95">
                    {/* Content */}
                    <div className="flex w-[87.3dvw] h-[96dvh] overflow-hidden flex-col items-center gap-2 p-9">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-700 self-start">
                            {`Full View : ${mode}`}
                        </h2>

                        <aside className="flex flex-wrap gap-3 w-full">
                            {/* <DatePickaSearch
                                key={"start" + key}
                                label="Month"
                                placeHolder="Select Month"
                                allowClear
                                onChange={(e: any) => setSrchStartDate(e || null)}
                            /> */}

                            <MonthYearPickaSearch
                                key={"start" + key}
                                label={'Month'}
                                placeHolder={'Select Month'}
                                allowClear
                                // max={endOfMonth(new Date())} // เลือกได้สูงสุดคือ เดือนปีปัจจุบัน นับจากเดือน ที่ close ล่าสุด
                                // customWidth={200}
                                // customHeight={35}
                                onChange={(e: any) => setSrchStartDate(e || null)}
                            />

                            {isAll &&
                                <InputSearch
                                    id="searchShipper"
                                    label="Shipper"
                                    type="select"
                                    value={srchShipper}
                                    onChange={(e) => setSrchShipper(e.target.value)}
                                    options={shipperGroupData?.data?.map((item: any) => ({
                                        value: item.id,
                                        label: item.name
                                    }))}
                                />
                            }

                            <InputSearch
                                id="searchEntryExit"
                                label="Entry/Exit"
                                type="select"
                                value={srchEntryExit}
                                onChange={(e) => setSrchEntryExit(e.target.value)}
                                options={entryExitMaster?.data?.map((item: any) => ({
                                    value: item.id,
                                    label: item.name
                                }))}
                            />

                            <InputSearch
                                id="searchArea"
                                label="Area"
                                type="select"
                                value={srchArea}
                                onChange={(e) => setSrchArea(e.target.value)}
                                options={areaMaster?.data
                                    ?.filter((item: any) => !srchEntryExit || item.entry_exit_id === srchEntryExit)
                                    ?.map((item: any) => ({
                                        value: item.name,
                                        label: item.name,
                                    }))
                                }
                            />

                            <BtnSearch handleFieldSearch={handleFieldSearch} />
                            <BtnReset handleReset={handleReset} />
                        </aside>

                        <div className="w-full flex-grow overflow-x-auto">
                            {isAll && mode === "Medium term" && (
                                <div className="max-w-[4500px] w-full h-full">
                                    <Line id="AllmediumLine" data={filterData} options={optionsAllmedium} />
                                </div>
                            )}

                            {!isAll && mode === "Medium term" && (
                                isFilter ? (
                                    <div className="max-w-[4500px] w-full h-full">
                                        <Line id="AllmediumLine" data={filterData} options={optionsAllmedium} />
                                    </div>
                                ) : (
                                    <ChartMedEachShipper dataChart={filterData} mode="view" />
                                )
                            )}

                            {isAll && mode === "Short term" && (
                                <div className="w-full overflow-x-auto">
                                    <div className="w-[4500px] h-[550px] p-2">
                                        <Line data={filterData} options={shortTermOption} />
                                    </div>
                                </div>
                            )}

                            {!isAll && mode === "Short term" && (
                                isFilter ? (
                                    <div className="max-w-[4500px] w-full h-full">
                                        <Line data={filterData} options={shortTermEachOption} />
                                    </div>
                                ) : (
                                    <ChartShortEachShipper dataChart={filterData} />
                                )
                            )}
                        </div>

                        <div className="w-full flex justify-end pt-4 sticky bottom-0 bg-white p-4">
                            <button
                                onClick={onClose}
                                className="w-40 h-10 font-bold bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                            >
                                {`Close`}
                            </button>
                        </div>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>



    );
};

export default ModalFullView;