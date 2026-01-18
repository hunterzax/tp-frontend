import { useEffect, useMemo, useRef } from "react";
import React, { FC, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, BarElement } from 'chart.js';
import { useFetchMasters } from "@/hook/fetchMaster";
import BtnGeneral from "@/components/other/btnGeneral";
import BtnExport from "@/components/other/btnExport";
import { useAppDispatch } from "@/utils/store/store";
import { fetchShipperGroup } from "@/utils/store/slices/shipperGroupSlice";
import { fetchAreaMaster } from "@/utils/store/slices/areaMasterSlice";
import { fetchEntryExit } from "@/utils/store/slices/entryExitSlice";
import annotationPlugin from 'chartjs-plugin-datalabels';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { formatNumber, formatNumberThreeDecimal, getRandomColor } from "@/utils/generalFormatter";

ChartJS.register(BarElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, annotationPlugin, ChartDataLabels);

interface TableProps {
    dataChart?: any;
    userPermission?: any;
    find_area?: any;
}

const ChartLongTerm2: React.FC<TableProps> = ({ dataChart, userPermission, find_area }) => {

    // ############### REDUX DATA ###############
    const { areaMaster } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (forceRefetch) {
            dispatch(fetchShipperGroup());
            dispatch(fetchAreaMaster());
            dispatch(fetchEntryExit());
            setForceRefetch(false);
        }
    }, [dispatch, areaMaster, forceRefetch]);

    // ############### CHART DATA ###############
    // const dataCharts = [dataChart]; // Array of dataChart objects
    const labels = dataChart.years;

    // ผลรวมเหนือแท่ง bars
    // const allYears = Array.from(new Set(dataChart.flatMap((item:any) => item.year)));
    const totalValues = dataChart?.years?.map((year: any, index: any) =>
        dataChart?.groups?.reduce((sum: any, item: any) => {

            const yearIndex = index;
            return sum + (yearIndex !== -1 ? item.sumValues[yearIndex] : 0);
        }, 0)
    );

    // Convert group data to chart datasets
    // const datasets = dataChart.groups.map((group: any) => {
    //     const color_k = getRandomColor()
    //     return {
    //         label: group.name,  // Group name as dataset label
    //         data: group.sumValues, // Group's sumValues for years
    //         backgroundColor: color_k,
    //         maxBarThickness: 100,
    //         borderColor: color_k,
    //         borderWidth: 1,
    //     }
    // });

    const datasets = useMemo(() => {
        return (dataChart as { groups: any[] })?.groups?.map((group: any) => {
            // const color_k = getRandomColor();
            return {
                label: group.name,
                data: group.sumValues,
                // backgroundColor: color_k,
                backgroundColor: group?.color,
                maxBarThickness: 100,
                // borderColor: color_k,
                borderColor: group?.color,
                borderWidth: 1,
            };
        }) || [];
    }, [dataChart]);

    const chartData = { labels, datasets };

    // const maxYValue = Math.max(
    //     ...chartData.datasets.flatMap((dataset: any) => dataset.data)
    // ) + 4000;

    // const calculateMaxYValue = (data: any) => {
    //     let max = 0;
    //     // Iterate over each dataset to find the maximum value
    //     data.datasets.forEach((dataset: any) => {
    //         dataset.data.forEach((value: any) => {
    //             if (value > max) {
    //                 max = value;
    //             }
    //         });
    //     });
    //     return max + 4000; // Add extra padding
    // };

    const calculateMaxYValue = (data: any) => {
        let max = 0;
        // Iterate over each data point (i.e., bar) to find the sum of values in each stacked bar
        for (let i = 0; i < data.labels.length; i++) {
            let sum = 0;
            data.datasets.forEach((dataset: any) => {
                sum += dataset.data[i] || 0;  // Sum all the dataset values at index i
            });
            if (sum > max) {
                max = sum; // Update the max if this sum is greater than the current max
            }
        }
        return max + 1000; // Add extra padding
        // return max + 100000; // Add extra padding
    };

    const maxYValue = calculateMaxYValue(chartData);

    const options: any = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top",
                labels: {
                    usePointStyle: true,
                    pointStyle: "circle",
                    font: {
                        size: 12,
                        weight: "bold",
                    },
                    boxWidth: 20,
                    boxHeight: 12,
                    padding: 18,
                },
                // onClick: (e:any) => e.stopPropagation()
                onClick: null
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
                    // headers: (tooltipItem: any) => `  ${formatNumber(tooltipItem.raw)} MMBTU`,
                    label: (tooltipItem: any) => {
                        return tooltipItem?.dataset?.label + ': ' + `${formatNumberThreeDecimal(tooltipItem?.raw)}`
                    },
                    // label: function (tooltipItem: any, data: any) {
                    //     return (tooltipItem?.raw === 0 ? null : tooltipItem?.dataset?.label)
                    // },
                    // afterLabel: function (tooltipItem: any, data: any) {
                    //     // return `${formatNumber(tooltipItem?.raw)}`;
                    //     return (tooltipItem?.raw === 0 ? null : formatNumberThreeDecimal(tooltipItem?.raw))
                    // },
                    labelColor: function (context: any) {
                        return {
                            borderColor: context?.dataset?.backgroundColor,
                            backgroundColor: context?.dataset?.backgroundColor,
                            borderWidth: 0,
                            borderRadius: 2,
                        }
                    },
                },
            },
            datalabels: {
                display: true,
                align: "end",
                anchor: "end",
                formatter: (value: any, context: any) => {
                    const totalValueForYear = totalValues[context.dataIndex];
                    // Only show labels if total value > 0
                    if (totalValueForYear > 0 && context.datasetIndex === chartData.datasets.length - 1) {
                        // return formatNumberThreeDecimal(totalValueForYear);
                        return formatNumber(totalValueForYear);
                        // return totalValueForYear;
                    }
                    return ""; // Do not display anything for 0 values
                },
                font: {
                    size: 12,
                    weight: "light",
                },
                // color: "#0DA2A2",
                color: "#000000",
                // rotation: (context: any) => {
                //     const chartWidth = context.chart.width;
                //     if (chartWidth > 800) {
                //         return 0;
                //     } else if (chartWidth > 400) {
                //         return -45;
                //     } else {
                //         return -90;
                //     }

                //     // const datasetLength = context.chart.data.datasets[0].data.length;
                //     // return datasetLength > 15 ? 270 : 0; // Rotate if there are more than 10 data points
                // },
                rotation: (context: any) => {
                    const chartWidth = context.chart.width;
                    // if (chartWidth > 800) {
                    if (chartWidth > 1000) {
                        return 0;
                        // } else if (chartWidth > 400) {
                    } else if (chartWidth <= 1000) {
                        return -45;
                    } else if (chartWidth <= 500) {
                        return -90;
                    }
                },
            },
            customLine: {
                maxLineColor: "red", // Color of max value line
            },
        },
        scales: {
            x: {
                stacked: true,
                grid: { display: false },
                categoryPercentage: 0.7,
                barPercentage: 0.9,
            },
            y: {
                stacked: true,
                grid: { display: false },
                min: 0,
                max: maxYValue,
                ticks: {
                    beginAtZero: true,
                    // max: maxYValue, 
                },
            },
        },
        animation: {
            onSuccess: () => {
                const chart = ChartJS.getChart('LongtermChart');
                if (chart) {
                    const { legend }: any = chart;
                    legend.top = -15;
                }
            },
        }
    };

    // ############### test line on bar chart ###############
    // const maxLinePlugin = {
    //     id: "maxLine",
    //     afterDatasetsDraw: (chart: any) => {
    //         const { ctx, scales } = chart;
    //         const maxYValue = Math.max(
    //             ...chart.data.datasets.flatMap((dataset: any) => dataset.data)
    //         );

    //         const yScale = scales.y;
    //         const yPixel = yScale.getPixelForValue(maxYValue);

    //         ctx.save();
    //         ctx.beginPath();
    //         ctx.moveTo(yScale.left, yPixel);
    //         ctx.lineTo(yScale.right, yPixel);
    //         ctx.strokeStyle = chart.options.plugins.customLine.maxLineColor || "red";
    //         ctx.lineWidth = 2;
    //         ctx.setLineDash([5, 5]); // Dashed line
    //         ctx.stroke();
    //         ctx.restore();
    //     },
    // };

    const maxLinePlugin = {
        id: "maxLine",
        afterDatasetsDraw: (chart: any) => {
            const { ctx, scales } = chart;
            // หา max value ใน dataset
            // const maxYValue = Math.max(
            //     ...chart.data.datasets.flatMap((dataset: any) => dataset.data)
            // );

            // หา area_nominal_cap
            const maxYValue = find_area && find_area?.[0]?.area_nominal_capacity ? find_area?.[0]?.area_nominal_capacity : 0
            // const maxYValue = 4500

            const yScale = scales.y;
            const xScale = scales.x;
            const yPixel = yScale.getPixelForValue(maxYValue);

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(xScale.left, yPixel); // Start from the leftmost point
            ctx.lineTo(xScale.right, yPixel); // Extend to the rightmost point
            ctx.strokeStyle = "red"; // Customize color
            ctx.lineWidth = 2; // Customize thickness
            // ctx.setLineDash([6, 6]); // Dashed line style
            ctx.stroke();
            ctx.restore();
        },
    };

    // ############### SAVE IMAGE OF CHART ###############
    const chartRef: any = useRef(null); // Create ref for the chart

    const handleSaveImage = () => {
        if (chartRef.current) {
            // Get the canvas element from the chart reference
            const imageURI = chartRef.current.toBase64Image();  // Directly call on chartRef.current
            // Create a temporary <a> element to trigger download
            const link = document.createElement('a');
            link.href = imageURI;
            link.download = 'chart.png'; // Set the default file name
            link.click(); // Trigger the download
        }
    };

    return (
        <div className={`h-auto min-h-[300px] overflow-y-auto block border rounded-[10px] shadow-sm relative z-1 p-4`}>
            <aside className="mt-auto ml-1 w-full sm:w-auto pb-2">
                <div className="flex justify-between w-full">
                    <div className="flex gap-2 justify-end">
                        <BtnGeneral
                            textRender={"Export Image"}
                            iconNoRender={false}
                            modeIcon={'export_image_chart'}
                            bgcolor={"#1473A1"}
                            generalFunc={() => handleSaveImage()}
                        />
                        <BtnExport textRender={"Export"} />
                    </div>
                </div>
            </aside>

            <div>
                <span className="text-[16px] text-[#58585A] font-semibold ">
                    {/* {dataChart?.area.name} Total Supply (MMBTU) */}
                    {/* v1.0.90 เปลี่ยนหัว Graph จาก "Total Supply (MMBTU)" เป็น "Total Energy (MMBTU/D)" https://app.clickup.com/t/86ert2k26 */}
                    {dataChart?.area.name}{` Total Energy (MMBTU/D)`}
                </span>
            </div>

            {/* <div className="w-full h-[350px] p-2">
                <Bar id="LongtermChart" data={chartData} options={options} plugins={[maxLinePlugin]} />
            </div> */}

            <div className="w-full overflow-x-auto overflow-y-hidden">
                <div
                    className="w-full h-[350px] p-2"
                    style={{
                        minWidth: chartData.labels.length > 10 ? `${chartData.labels.length * 65}px` : "100%",
                    }}
                >
                    <Bar id="LongtermChart" data={chartData} options={options} plugins={[maxLinePlugin]} />
                </div>
            </div>

        </div>
    )
}

export default ChartLongTerm2;