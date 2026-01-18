import React from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { countMonthSpanInclusive, formatNumberThreeDecimal, formatSearchDate, generateMonthLabels, getEarliestFirstDay, mergeDataSetsByLabel } from "@/utils/generalFormatter";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
interface TableProps {
    dataChart?: any;
    userPermission?: any;
    srchStartDay?: any;
}

const ChartShortEachShipper: React.FC<TableProps> = ({ dataChart, userPermission, srchStartDay }) => {

    const earliestDay: any = getEarliestFirstDay(dataChart?.data); // หาวันที่น้อยที่สุด จะได้เอามาทำ label
    const count_month: any = countMonthSpanInclusive(dataChart?.data) // นับจำนวนเดือนจาก arr day
 
    // ถ้ากด reset มาให้ใช้ earliestDay นะวัยรุ่น
    let srchStartDayX = srchStartDay ? formatSearchDate(srchStartDay) : earliestDay

    // const labels = dataChart?.data?.length > 0 ? generateMonthLabels(srchStartDay ? srchStartDayX : dataChart.data[0].day[0], 4) : [];
    // const labels = dataChart?.data?.length > 0 ? generateMonthLabels(srchStartDayX, 4) : []; // params ตัวที่สองของ generateMonthLabels คือจะ gen ไปกี่เดือน
    // const labels = dataChart?.data?.length > 0 ? generateMonthLabels(srchStartDayX, srchStartDay ? 1 : count_month) : []; // params ตัวที่สองของ generateMonthLabels คือจะ gen ไปกี่เดือน

    // ระบบจะแสดงข้อมูลเป็นรํายเดือน 24 เดือน (นับจํากเดือนที่เลือก)
    const labels = dataChart?.data?.length > 0 ? generateMonthLabels(srchStartDayX, count_month < 24 ? count_month : 24 ) : []; // params ตัวที่สองของ generateMonthLabels คือจะ gen ไปกี่เดือน

    const datasets = dataChart?.data?.map((item: any) => ({
        // label: item.nomination_point, // Nomination point name
        label: item.area?.name, // Nomination point name
        data: item.value, // Values
        borderColor: item.area?.color, // Line color
        // backgroundColor: item.area?.color + "66", // Transparent color
        backgroundColor: item.area?.color, // Transparent color
        fill: false, // Do not fill the area under the line
        tension: 0, // Curve the line slightly
        isEntry: item?.entry_exit_id == 1 ? true : false,
    }));

    // ถ้า datasets.label ซ้ำกัน ให้รวม datasets.data ที่ index เดียวกัน แล้วปรับ obj ที่ซ้ำให้เหลือแค่อันเดียว
    const result_datasets = mergeDataSetsByLabel(datasets);

    // Chart data configuration
    const chartData = {
        labels: labels, // Use formatted month labels
        // labels: months, // แสดง label ทั้งเดือนที่เลือก filter + ไปอีก 4 เดือน
        datasets: result_datasets,
    };

    // Chart options
    const options: any = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top",
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
                            strokeStyle: dataset.borderColor,
                            hidden: !chart.isDatasetVisible(index),
                            pointStyle: dataset.isEntry ? 'rect' : 'circle',
                        }));
                    }
                },
                onClick: null
            },
            title: {
                display: true,
                // text: dataChart?.group?.name + " Total Supply (MMBTU)",
                text: dataChart?.group?.name + " Total Energy (MMBTU/D)", // v1.0.90 เปลี่ยนหัว Graph จาก "Total Supply (MMBTU)" เป็น "Total Energy (MMBTU/D)" https://app.clickup.com/t/86ert2k26
                align: "start",
            },
            datalabels: {
                display: false,
            },
            tooltip: {
                // mode: 'index',
                mode: 'nearest',
                intersect: false,
                backgroundColor: 'white', // Set tooltip background color to white
                titleColor: 'black', // Set title color to black (optional)
                bodyColor: 'black', // Set body text color to black (optional)
                borderColor: '#cfcfd1', // Set tooltip border color (e.g., black)
                borderWidth: 1, // Set the width of the border
                callbacks: {
                    label: (tooltipItem: any) => {
                        const labelName: any = tooltipItem?.dataset ? tooltipItem?.dataset?.label : '';  // Accessing the label name
                        const value = tooltipItem.raw ? formatNumberThreeDecimal(tooltipItem.raw) : 0;  // Formatting the value
                        return `${labelName} : ${value}`;  // Showing label name and value
                    },
                },
            },
        },
        scales: {
            x: {
                title: {
                    display: false,
                    text: "Day",
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
    };

    return (
        <div className="overflow-x-auto">
            <div className="w-[3500px] h-[350px] p-2">
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
};

export default ChartShortEachShipper;