"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const Chart: React.FC = () => {
  const [series, setSeries] = useState([
    { name: "rendezvous", data: [] },
    { name: "consultation", data: [] },
  ]);

  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/month");
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        const { rendezvousByDay = {}, consultationByDay = {} } = data;

        // Combine dates from both objects
        const allDays = new Set([
          ...Object.keys(rendezvousByDay),
          ...Object.keys(consultationByDay)
        ]);

        const sortedDays = Array.from(allDays).sort((a, b) => new Date(a.split('-').reverse().join('-')).getTime() - new Date(b.split('-').reverse().join('-')).getTime());

        setCategories(sortedDays);

        const rendezvousData = sortedDays.map(day => rendezvousByDay[day] || 0);
        const consultationData = sortedDays.map(day => consultationByDay[day] || 0);

        setSeries([
          { name: "rendezvous", data: rendezvousData },
          { name: "consultation", data: consultationData },
        ]);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    fetchData();
  }, []);

  const options: ApexOptions = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#3C50E0", "#80CAEE"],
    chart: {
      fontFamily: "Satoshi, sans-serif",
      height: 335,
      type: "line",
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: {
            height: 300,
          },
        },
      },
      {
        breakpoint: 1366,
        options: {
          chart: {
            height: 350,
          },
        },
      },
    ],
    stroke: {
      width: [2, 2],
      curve: "smooth",
    },
    grid: {
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 4,
      colors: "#fff",
      strokeColors: ["#3056D3", "#80CAEE"],
      strokeWidth: 3,
      strokeOpacity: 0.9,
      fillOpacity: 1,
      hover: {
        size: undefined,
        sizeOffset: 5,
      },
    },
    xaxis: {
      type: "category",
      categories: categories, // Use days as categories
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        style: {
          fontSize: "0px",
        },
      },
      min: 0,
      max: Math.max(
        ...Object.values(series[0]?.data || []),
        ...Object.values(series[1]?.data || [])
      ), // Set dynamic max value
    },
  };

  return (
      

      <div>
        <div id="chartOne" className="-ml-5">
          <ReactApexChart
            options={options}
            series={series}
            type="line"
            height={350}
            width={"100%"}
          />
        </div>
      </div>
    
  );
};

export default Chart;
