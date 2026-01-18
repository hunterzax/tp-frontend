import { useEffect, useRef } from "react";
import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { darkenColor, exportChartToExcel, filterDataChartByMonthRange, formatDateNoTime, formatNumber, generateUserPermission, hexToRgba, toDayjs } from "@/utils/generalFormatter";
import { InputSearch } from "@/components/other/SearchForm";
import { useFetchMasters } from "@/hook/fetchMaster";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import BtnGeneral from "@/components/other/btnGeneral";
import { useAppDispatch } from "@/utils/store/store";
import { fetchShipperGroup } from "@/utils/store/slices/shipperGroupSlice";
import { fetchAreaMaster } from "@/utils/store/slices/areaMasterSlice";
import getUserValue from "@/utils/getuserValue";
import { getService } from "@/utils/postService";
import MonthYearPickaSearch from "@/components/library/dateRang/monthYearPicker";
import { decryptData } from "@/utils/encryptionData";
import Spinloading2 from "@/components/other/spinLoading2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const ChartEntry: React.FC<any> = ({ }) => {
    const userDT: any = getUserValue();

    // ############### SAVE IMAGE OF CHART ###############
    const chartRef: any = useRef(null); // Create ref for the chart
    const handleSaveImage = () => {
        if (chartRef.current) {
            const chart = chartRef.current;
            const canvas = chart.canvas;

            // Create a new canvas with the same size
            const newCanvas = document.createElement("canvas");
            const ctx = newCanvas.getContext("2d");

            if (!ctx) return;

            newCanvas.width = canvas.width;
            newCanvas.height = canvas.height;

            // Fill the new canvas with white background
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);

            // Draw the chart's existing canvas on top
            ctx.drawImage(canvas, 0, 0);

            // Convert the final image to base64
            const imageURI = newCanvas.toDataURL("image/png");

            // Create a temporary <a> element to trigger download
            const link = document.createElement("a");
            link.href = imageURI;
            link.download = "chart.png"; // Set the default file name
            link.click(); // Trigger the download
        }
    };

    // ############### REDUX DATA ###############
    const { shipperGroupData, areaMaster, termTypeMaster } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const dispatch = useAppDispatch();
    useEffect(() => {
        if (forceRefetch) {
            dispatch(fetchShipperGroup());
            dispatch(fetchAreaMaster());
            // dispatch(fetchEntryExit());
        }
        if (forceRefetch) {
            setForceRefetch(false);
        }
    }, [dispatch, shipperGroupData, areaMaster, forceRefetch]);

    // ############### PERMISSION ###############
    const [userPermission, setUserPermission] = useState<any>();
    let user_permission: any = localStorage?.getItem("k3a9r2b6m7t0x5w1s8j");
    user_permission = user_permission ? decryptData(user_permission) : null;

    const getPermission = () => {
        if (user_permission) {
            try {
                user_permission = user_permission ? JSON.parse(user_permission) : null; // Convert JSON string to object
                const updatedUserPermission = generateUserPermission(user_permission);
                setUserPermission(updatedUserPermission);
            } catch (error) {
                // Failed to parse user_permission:
            }
        } else {
            // // No user_permission found
        }
    }

    // ############### FETCH ###############
    const [userData, setUserData] = useState<any>([]);
    const [dataMain, setDataMain] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [filteredDataMain, setFilteredDataMain] = useState<any>([]); // ข้อมูลกราฟหลัก

    const [srchStartDate, setSrchStartDate] = useState<Date | null>(new Date('Mon Jan 04 2024 00:00:00 GMT+0700 (Indochina Time)'));
    // const [srchEndDate, setSrchEndDate] = useState<Date | null>(new Date('Sat Jan 02 2050 00:00:00 GMT+0700 (Indochina Time)'));
    const [srchEndDate, setSrchEndDate] = useState<Date | null>(toDayjs().add(1, 'year').endOf('year').toDate());
    const [filteredDataMainGraph, setFilteredDataMainGraph] = useState<any>();

    const fetchData = async () => {
        setIsLoading(false)

        const idsArray = shipperGroupData?.data?.map((item: any) => item.id);

        // กรอง area ที่หมด end_date และ start_date
        const presentDate = new Date(); // Get current date
        const filteredAreas = areaMaster?.data.filter((item: any) => {
            const startDate = new Date(item.start_date);
            const endDate = item.end_date ? new Date(item.end_date) : null;
            return startDate <= presentDate && (endDate === null || endDate >= presentDate);
        });

        let filter_string = `${userDT?.account_manage?.[0]?.user_type_id == 1 || userDT?.account_manage?.[0]?.user_type_id == 2 ? idsArray : userDT?.account_manage?.[0]?.group_id}` // ถ้าเป็น TSO เอา id shipper ทั้งหมดมาแสดง ถ้าเป็น shipper เอาแค่ของตัวเอง
        try {
            const response_area_chart: any = await getService(`/master/capacity-dashboard/area-data-graph?id=[${filter_string}]&start_date=${formatDateNoTime(srchStartDate)}&end_date=${formatDateNoTime(srchEndDate)}`);

            const filteredAreaNames = new Set(filteredAreas.map((area: any) => area.name));
            const filteredResData = response_area_chart.map((item: any) => ({
                // const filteredResData = mock_xxxxx?.map((item: any) => ({
                ...item,
                area: item.area.filter((area: any) => filteredAreaNames.has(area.name))
            })).filter((item: any) => item.area.length > 0);

            // filter ข้อมูลตาม start - end
            const filtered_entry_data = filterDataChartByMonthRange(
                filteredResData?.[0],
                formatDateNoTime(srchStartDate),
                formatDateNoTime(srchEndDate),
                {
                    // เปรียบเทียบระดับ 'month' จะตรงกับความหมายของคีย์ "month" ที่เป็น "MMM YYYY"
                    compareUnit: 'month',
                    // ถ้าอยากลบ item ที่ nsetData ว่างหลังกรอง:
                    removeEmptyDataItem: false,
                    // ถ้าอยากลบ conditions ที่ว่าง:
                    removeEmptyConditions: false,
                }
            );

            // setDataMain(filteredResData?.[0]); // set เอาแค่ entry
            // setFilteredDataMain(filteredResData?.[0]); // set เอาแค่ entry
            // setFilteredDataMainGraph(filteredResData?.[0]);

            setDataMain(filtered_entry_data); // set เอาแค่ entry
            setFilteredDataMain(filtered_entry_data); // set เอาแค่ entry
            setFilteredDataMainGraph(filtered_entry_data);

            setTimeout(() => {
                setIsLoading(true)
            }, 500);
        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    };

    useEffect(() => {
        // setSrchStartDate(new Date('Mon Jan 04 2010 00:00:00 GMT+0700 (Indochina Time)'))
        // setSrchEndDate(new Date('Sat Jan 02 2055 00:00:00 GMT+0700 (Indochina Time)'))
        getPermission();
        fetchData();
        setUserData(userDT?.account_manage?.[0]);
    }, []);

    // ############### SEARCH ###############
    const [key, setKey] = useState(0);
    const [srchEntry, setSrchEntry] = useState('');
    const [srchShipper, setSrchShipper] = useState<any>([]);
    const [srchArea, setSrchArea] = useState<any>([]);
    const [srchTermType, setSrchTermType] = useState<any>([]);
    // const [srchStartDateMain, setSrchStartDateMain] = useState<Date | null>(null);
    // const [srchEndDateMain, setSrchEndDateMain] = useState<Date | null>(null);
    const [srchStartDateMain, setSrchStartDateMain] = useState<Date | null>(new Date('Mon Jan 04 2024 00:00:00 GMT+0700 (Indochina Time)'));
    const [srchEndDateMain, setSrchEndDateMain] = useState<Date | null>(toDayjs().add(1, 'year').endOf('year').toDate());

    useEffect(() => {
        setFilteredDataMainGraph(dataMain)
    }, [])

    const handleFieldSearch = async () => {
        setIsLoading(false)

        // ใหม่
        const idsArray = shipperGroupData?.data?.map((item: any) => item.id);
        let filter_string = `${userDT?.account_manage?.[0]?.user_type_id == 1 || userDT?.account_manage?.[0]?.user_type_id == 2 ? idsArray : userDT?.account_manage?.[0]?.group_id}` // ถ้าเป็น TSO เอา id shipper ทั้งหมดมาแสดง ถ้าเป็น shipper เอาแค่ของตัวเอง
        // const response_area_chart: any = await getService(`/master/capacity-dashboard/area-data-graph?id=[${srchShipper?.length > 0 ? srchShipper : filter_string}]&start_date=${srchStartDateMain ? formatDateNoTime(srchStartDateMain) : formatDateNoTime(new Date('Mon Jan 04 2024 00:00:00 GMT+0700 (Indochina Time)'))}&end_date=${srchEndDateMain ? formatDateNoTime(srchEndDateMain) : formatDateNoTime(new Date('Sat Jan 02 2050 00:00:00 GMT+0700 (Indochina Time)'))}`);
        const response_area_chart: any = await getService(`/master/capacity-dashboard/area-data-graph?id=[${srchShipper?.length > 0 ? srchShipper : filter_string}]&start_date=${srchStartDateMain ? formatDateNoTime(srchStartDateMain) : formatDateNoTime(new Date('Mon Jan 04 2024 00:00:00 GMT+0700 (Indochina Time)'))}&end_date=${srchEndDateMain ? formatDateNoTime(srchEndDateMain) : formatDateNoTime(toDayjs().add(1, 'year').endOf('year').toDate())}`);

        // ** กรอง data_for_filter จาก data_for_filter.area โดยใช้ srchTermType และ srchArea
        // ** เงื่อนไขการกรอง srchArea
        // ดูใน array area.name ถ้าไม่มีใน srchArea ให้เอา object area นั้นออก

        // ** เงื่อนไขการกรอง srchTermType
        // ดูใน array area.term_type.id ถ้าไม่มีใน srchTermType ให้เอา object term_type นั้นออก

        // ถ้า srchTermType length เป็น 0 ไม่ต้องกรอง
        // ถ้า srchArea length เป็น 0 ไม่ต้องกรอง
        const filterDataTermArea = (data: any, srchArea: string[], srchTermType: number[]) => {
            return {
                ...data,
                area: data.area
                    // กรอง Area
                    .filter((a: any) => {
                        if (srchArea.length === 0) return true;
                        return srchArea.includes(a.name);
                    })
                    // กรอง term_type
                    .map((a: any) => ({
                        ...a,
                        term_type:
                            srchTermType.length === 0
                                ? a.term_type
                                : a.term_type.filter((t: any) => srchTermType.includes(t.id)),
                    })),
            };
        };

        const result_filtered_term_area = filterDataTermArea(response_area_chart?.[0], srchArea, srchTermType); // .[0] คือเอาแค่ entry

        // filter ข้อมูลตาม start - end
        const filtered_entry_data = filterDataChartByMonthRange(
            result_filtered_term_area,
            formatDateNoTime(srchStartDateMain),
            formatDateNoTime(srchEndDateMain),
            {
                // เปรียบเทียบระดับ 'month' จะตรงกับความหมายของคีย์ "month" ที่เป็น "MMM YYYY"
                compareUnit: 'month',
                // ถ้าอยากลบ item ที่ nsetData ว่างหลังกรอง:
                removeEmptyDataItem: false,
                // ถ้าอยากลบ conditions ที่ว่าง:
                removeEmptyConditions: false,
            }
        );

        // setDataMain(result_filtered_term_area);
        // setFilteredDataMain(result_filtered_term_area);
        // setFilteredDataMainGraph(result_filtered_term_area);
        setDataMain(filtered_entry_data);
        setFilteredDataMain(filtered_entry_data);
        setFilteredDataMainGraph(filtered_entry_data);

        setTimeout(() => {
            setIsLoading(true)
        }, 500);

        // เดิม
        // let filteredAreas = dataMain.area.filter((area: any) => (srchArea.length ? srchArea.includes(area.name) : true)) // Condition 5
        //     .map((area: any) => ({
        //         ...area,
        //         term_type: area.term_type
        //             .filter((term: any) => (srchTermType.length ? srchTermType.includes(term.id) : true)) // Condition 7
        //             .map((term: any) => ({
        //                 ...term,
        //                 data: term.data.filter((item: any) =>
        //                     srchShipper.length ? srchShipper.includes(item.shipper.id) : true // Condition 6
        //                 ),
        //                 conditions: term.conditions.filter((cond: any) => {
        //                     const condDate = new Date(cond.month);
        //                     return (
        //                         (!srchStartDateMain || condDate >= new Date(srchStartDateMain)) && // Condition 1
        //                         (!srchEndDateMain || condDate <= new Date(srchEndDateMain)) // Condition 2 & 3
        //                     );
        //                 })
        //             }))
        //             .filter((term: any) => term.data.length > 0) // Remove term_type if data is empty
        //     }))
        // // .filter((item: any) => item?.sumCondition?.length > 0);
        // // filteredAreas = filteredAreas.filter((item: any) => item?.sumCondition?.length > 0);

        // let data_xxx = {
        //     "area": filteredAreas.filter((item: any) => item?.sumCondition?.length > 0),
        //     "color": dataMain.color,
        //     "create_by": dataMain.create_by,
        //     "create_date": dataMain.create_date,
        //     "create_date_num": dataMain.create_date_num,
        //     "id": dataMain.id,
        //     "name": dataMain.name,
        //     "update_by": dataMain.update_by,
        //     "update_date": dataMain.update_date,
        //     "update_date_num": dataMain.update_date_num,
        // }

        // setFilteredDataMainGraph(data_xxx);
    };

    const handleReset = () => {
        setSrchStartDate(null);
        setSrchEndDate(null);

        setSrchStartDateMain(null);
        setSrchEndDateMain(null);

        setSrchEntry('');
        setSrchShipper([]);
        setSrchArea([]);
        setSrchTermType([]);
        // setFilteredDataMainGraph(area_data)
        // setFilteredDataMainGraph(dataMain)

        fetchData();

        setKey((prevKey) => prevKey + 1);
    };

    // ############### SUM DATA CONDITION ###############
    const sumConditionsByMonth = (data: any) => {
        // Iterate through all areas
        data.area.forEach((area: any) => {
            // Use a Map to group values by month for the specific area
            const monthSums = new Map<string, number>();

            // Iterate through all term types in the area
            area.term_type.forEach((termType: any) => {
                // Iterate through all conditions and sum them by month
                termType.conditions.forEach((condition: any) => {
                    const { month, value } = condition;
                    if (monthSums.has(month)) {
                        monthSums.set(month, monthSums.get(month)! + value);
                    } else {
                        monthSums.set(month, value);
                    }
                });
            });

            // Convert the Map into the desired array format
            const sumCondition = Array.from(monthSums.entries()).map(([month, value]) => ({ month, value }));

            // Sort the results by month for better readability (optional)
            sumCondition.sort((a, b) => new Date(`01-${a.month}`).getTime() - new Date(`01-${b.month}`).getTime());

            const areaDetail = areaMaster?.data?.find((item: any) => item.name === area?.name);
            area.areaDetail = areaDetail;

            // Add sumCondition to the specific area
            area.sumCondition = sumCondition;
        });

        return data;
    };

    // ############### TEST 3 ###############
    const [chartData, setChartData] = useState<any>(null);
    const [maxPercent, setMaxPercent] = useState<any>(0);


    const processChartData = (dataReal?: any, showEntryOrExit?: any, areaName?: any) => {
        const datasets: any = [];
        let labels: any = new Set();
        // let labels: any = []

        const ResSumConditionData = sumConditionsByMonth(dataReal);

        // ของแบงค์
        // sumCondition?.area?.forEach((item: any) => {
        //     labels = Array.from(item.sumCondition.map((sd: any) => sd?.month)).sort((a, b) => new Date(`01-${a}`).getTime() - new Date(`01-${b}`).getTime());
        //     datasets.push({
        //         label: item.name,
        //         data: labels.map((condition: any) => {
        //             // labels.add(condition.month); // Collect unique labels
        //             let nums = 0
        //             for (let i = 0; i < item?.term_type.length; i++) {
        //                 for (let ii = 0; ii < item?.term_type[i]?.data.length; ii++) {
        //                     for (let iii = 0; iii < item?.term_type[i]?.data[ii]?.nsetData?.length; iii++) {
        //                         if (item?.term_type[i]?.data[ii]?.nsetData[iii]?.month === condition) {
        //                             nums = nums + item?.term_type[i]?.data[ii]?.nsetData[iii]?.value
        //                         }
        //                     }
        //                 }
        //             }

        //             const percentage = item?.areaDetail?.area_nominal_capacity > 0 ? ((nums / item?.areaDetail?.area_nominal_capacity) * 100).toFixed(2) : "0.00";
        //             setMaxPercent((prevMax:any) => Math.max(prevMax, parseFloat(percentage)));
        //             return parseFloat(percentage);
        //         }),

        //         backgroundColor: hexToRgba(item.color, 0.1), // original 0.5
        //         borderColor: item.color,
        //         borderWidth: 3, // original = 1
        //         pointRadius: 0,
        //         tension: 0.1, // Smooth the line chart
        //         fill: true,
        //     });
        // });

        // labels = Array.from(labels).sort((a, b) => new Date(`01-${a}`).getTime() - new Date(`01-${b}`).getTime());
        // return { labels, datasets };

        ResSumConditionData?.area?.forEach((item: any) => {
            // Collect labels without overwriting
            item.sumCondition.forEach((sd: any) => labels.add(sd?.month));

            datasets.push({
                label: item.name,
                data: Array.from(labels).sort((a, b) => new Date(`01-${a}`).getTime() - new Date(`01-${b}`).getTime()
                ).map((condition: any) => {
                    let nums = 0;

                    for (let i = 0; i < item?.term_type.length; i++) {
                        // for (let ii = 0; ii < item?.term_type[i]?.data.length; ii++) {
                        //     for (let iii = 0; iii < item?.term_type[i]?.data[ii]?.nsetData?.length; iii++) {
                        //         if (item?.term_type[i]?.data[ii]?.nsetData[iii]?.month === condition) {
                        //             nums += item?.term_type[i]?.data[ii]?.nsetData[iii]?.value;
                        //         } else {
                        //             nums += 0
                        //         }
                        //     }
                        // }

                        for (let ii = 0; ii < item?.term_type[i]?.data.length; ii++) {
                            const term = item?.term_type[i];

                            // Check if the term type is "Short Term (Non-firm)" or id === 4
                            // if (term?.name === "Short Term (Non-firm)" || term?.id === 4) {
                            const nsetData = term?.data[ii]?.nsetData;

                            // Find the maximum value where month matches the condition
                            let maxValue = 0;
                            for (let iii = 0; iii < nsetData?.length; iii++) {
                                if (nsetData[iii]?.month === condition) {
                                    maxValue = Math.max(maxValue, nsetData[iii]?.value);
                                }
                            }

                            // Add only the highest value for the condition month
                            nums += maxValue;
                            // } 
                        }
                    }

                    const percentage = item?.areaDetail?.area_nominal_capacity > 0 ? ((nums / item?.areaDetail?.area_nominal_capacity) * 100).toFixed(2) : "0.00";

                    setMaxPercent((prevMax: any) => Math.max(prevMax, parseFloat(percentage)));
                    return parseFloat(percentage);
                }),
                backgroundColor: hexToRgba(item.color, 0.1),
                borderColor: item.color,
                borderWidth: 3,
                pointRadius: 0,
                tension: 0.1,
                fill: true,
            });
        });

        const sortedLabels = Array.from(labels).sort((a, b) =>
            new Date(`01-${a}`).getTime() - new Date(`01-${b}`).getTime()
        );

        return { labels: sortedLabels, datasets };
    };

    useEffect(() => {
        if (dataMain && typeof dataMain === "object" && !Array.isArray(dataMain)) {

            // Usage example:
            // const { labels, datasets } = processChartData(dataMain, false, false); // param ตัวสอง ถ้าเป็น entry ส่ง false, exit ส่ง true
            const { labels, datasets } = processChartData(filteredDataMainGraph, false, false); // param ตัวสอง ถ้าเป็น entry ส่ง false, exit ส่ง true

            setChartData({ labels, datasets });
        }
    }, [dataMain, filteredDataMainGraph]);

    const { labels = [], datasets = [] } = chartData || {};

    useEffect(() => {
        setMaxPercent(maxPercent)
    }, [maxPercent])

    // กรองเอาข้อมูล area ที่ไม่มี data ออก จุด area ให้แสดงเฉพาะ จุดที่มีข้อมูลในกราฟ https://app.clickup.com/t/86erjz69n
    const filteredDatasets = datasets.filter((dataset?: any) => dataset.data.length > 0);

    const [dataFiltered, setDataFiltered] = useState<any>([])
    useEffect(() => {
        if (datasets) {
            const data_filter = datasets.filter((dataset?: any) => dataset.data.length > 0)
            setDataFiltered(data_filter)
        }
    }, [datasets])

    const options: any = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                align: 'start',
                labels: {
                    // usePointStyle: true, // Use circular legend markers
                    // pointStyle: 'rect', // Set legend point style to square
                    font: {
                        size: 10, // Adjust the font size (indirectly affects point size)
                    },
                    boxWidth: 12, // Set the width of the point style
                    boxHeight: 12, // Set the height of the point style
                    padding: 18, // Adjust padding between labels
                    generateLabels: (chart: any) => chart?.data?.datasets?.map((item: any, i: any) => {
                        const backgroundColor = chart.data.datasets[i].backgroundColor;
                        const darkerBorderColor = darkenColor(backgroundColor, 20);
                        return {
                            datasetIndex: i,
                            text: item?.label,
                            hidden: chart.getDatasetMeta(i).hidden,
                            fillStyle: backgroundColor,
                            strokeStyle: darkerBorderColor,
                            fontColor: '#787486',
                            borderWidth: 10,
                            borderRadius: 3,
                        };
                    }),
                },
            },
            tooltip: {
                mode: 'index',
                enabled: true,
                intersect: false,
                backgroundColor: 'white',
                titleColor: '#767676',
                bodyColor: '#767676',
                padding: 10,
                boxPadding: 5,
                callbacks: {
                    title: () => null, // Hides the title
                    // label: (tooltipItem: any) => tooltipItem?.dataset?.label || '', // Returns dataset label
                    label: (tooltipItem: any) => {
                        return tooltipItem?.dataset?.label + ': ' + `${formatNumber(tooltipItem?.raw)} %`
                    }, // Returns dataset label
                    // afterLabel: (tooltipItem: any) => `${formatNumber(tooltipItem?.raw)} %`, // Formats value with '%'
                    labelColor: (context: any) => {
                        const backgroundColor = context?.dataset?.backgroundColor;
                        const darkerBorderColor = darkenColor(backgroundColor, 20);
                        return (
                            {
                                borderColor: darkerBorderColor || '#000',
                                backgroundColor: context?.dataset?.backgroundColor || '#000',
                                borderWidth: 0,
                                borderRadius: 3,
                            }
                        )
                    },
                },
            },
        },
        elements: {
            line: {
                fill: true
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Years',
                    font: {
                        weight: 'bold', // Make title font bold
                    },
                },
                type: 'category',
                labels: labels,
                grid: {
                    display: false, // Disable vertical grid lines (x-axis)
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Capacity Right (%)',
                    font: {
                        weight: 'bold', // Make title font bold
                    },
                },
                // max: 100, // max % เต็มร้อย
                max: (maxPercent + 20 <= 100) ? 100 : maxPercent + 20, // max % เต็มร้อย
                beginAtZero: true,
                grid: {
                    display: true, // Enable horizontal grid lines (y-axis)
                    color: 'rgba(243, 244, 246, 0.8)', // Set grid line color with opacity
                },
            },
        },
        animation: {
            onSuccess: () => {
                const chart = ChartJS.getChart('entryChart');
                if (chart) {
                    const { legend }: any = chart;
                    legend.top = -15;
                }
            },
        }
    };

    return (
        <div className={`h-auto min-h-[300px] overflow-y-auto block rounded-t-md relative z-1 p-2`}>
            <aside className="mt-auto ml-1 w-full sm:w-auto pb-2">
                <div className="flex justify-between w-full">
                    {/* text to the left */}
                    <div>
                        <h2 className="text-[16px] font-bold text-[#00ADEF] ">{`Entry`}</h2>
                    </div>

                    {/* buttons to the right */}
                    <div className="flex gap-2 justify-end">
                        <BtnGeneral
                            textRender={"Export Image"}
                            iconNoRender={false}
                            modeIcon={'export_image_chart'}
                            bgcolor={"#1473A1"}
                            generalFunc={() => handleSaveImage()}
                            can_export={userPermission ? userPermission?.f_export : false}
                        />
                        <BtnGeneral
                            bgcolor={"#24AB6A"}
                            modeIcon={'export'}
                            textRender={"Export"}
                            // generalFunc={() => exportChartToExcel(filteredDatasets, labels, 'entry_chart')} // old
                            generalFunc={() => exportChartToExcel(dataFiltered, labels, 'entry_chart')} // new
                            can_export={userPermission ? userPermission?.f_export : false}
                        />
                    </div>
                </div>
            </aside>

            <aside className="flex flex-wrap sm:flex-row gap-2 pb-2 w-full">

                <MonthYearPickaSearch
                    key={"start" + key}
                    label={"Start From"}
                    placeHolder="Select Start From"
                    allowClear
                    onChange={(e: any) => {
                        setSrchStartDateMain(e ? e : null)
                    }}
                />

                <MonthYearPickaSearch
                    key={"end" + key}
                    label={"Start To"}
                    placeHolder="Select Start To"
                    allowClear
                    onChange={(e: any) => {
                        setSrchEndDateMain(e ? e : null)
                    }}
                />

                <InputSearch
                    id="searchArea"
                    label="Area"
                    // type="select"
                    value={srchArea}
                    // selectboxMode="multi"
                    type="select-multi-checkbox"
                    onChange={(e) => setSrchArea(e.target.value)}
                    options={areaMaster?.data?.filter((item: any) =>
                        item?.entry_exit?.id == 1)?.map((item: any) => ({ // filter เอาแค่ entry
                            // value: item.id.toString(),
                            value: item.name,
                            label: item.name
                        }))
                    }
                />

                <InputSearch
                    id="searchShipper"
                    label="Shipper Name"
                    // type="select"
                    value={srchShipper}
                    // selectboxMode="multi"
                    type="select-multi-checkbox"
                    onChange={(e) => setSrchShipper(e.target.value)}
                    options={shipperGroupData?.data?.map((item: any) => ({
                        value: item.id,
                        label: item.name
                    }))}
                />

                <InputSearch
                    id="searchType"
                    label="Contract Type"
                    // type="select"
                    value={srchTermType}
                    // selectboxMode="multi"
                    type="select-multi-checkbox"
                    onChange={(e) => setSrchTermType(e.target.value)}
                    options={termTypeMaster?.data?.map((item: any) => ({
                        value: item.id,
                        label: item.name
                    }))}
                />

                <BtnSearch handleFieldSearch={handleFieldSearch} />
                <BtnReset handleReset={handleReset} />
            </aside>

            <div className="w-full overflow-x-auto overflow-y-hidden">
                <div
                    className="w-full h-[450px] p-2"
                    // style={{minWidth: chartData.labels.length > 10 ? `${chartData.labels.length * 50}px` : "100%",}}
                    style={{
                        minWidth: chartData?.labels && chartData.labels.length > 10
                            ? `${chartData.labels.length * 50}px`
                            : "100%",
                    }}
                >
                    {
                        isLoading ?
                            <Line
                                id="entryChart"
                                ref={chartRef}
                                // data={{ labels, datasets }}
                                // data={{ labels, datasets: filteredDatasets }} // old
                                data={{ labels, datasets: dataFiltered }} // new
                                // options={options}
                                options={{
                                    ...options,
                                    responsive: true, // Ensure chart is responsive
                                    maintainAspectRatio: false, // Disable maintaining aspect ratio
                                }}
                            />
                            :
                            <Spinloading2 spin={!isLoading} rounded={20} />
                    }



                    {/* <Line
                        id="entryChart"
                        ref={chartRef}
                        // data={{ labels, datasets }}
                        // data={{ labels, datasets: filteredDatasets }} // old
                        data={{ labels, datasets: dataFiltered }} // new
                        // options={options}
                        options={{
                            ...options,
                            responsive: true, // Ensure chart is responsive
                            maintainAspectRatio: false, // Disable maintaining aspect ratio
                        }}
                    /> */}



                </div>
            </div>

        </div>
    )
}

export default ChartEntry;