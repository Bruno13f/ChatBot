import * as React from "react";
import ReactMarkdown from "react-markdown";
import { Line } from 'react-chartjs-2';
import { useTheme } from "next-themes";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface ChatCardProps {
  message: string;
  isSystem?: boolean;
  isWeather: boolean;
}

export function MessageCard({ message, isSystem = false, isWeather }: ChatCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const temperaturesRaw = message.split(",").map(temp => parseFloat(temp.trim()));
  let temperatures = [...temperaturesRaw];

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  };

  const generateDateLabels = (count: number) => {
    const labels: string[] = [];
    const date = new Date();
    for (let i = 0; i < count; i++) {
      const newDate = new Date(date);
      newDate.setDate(date.getDate() + i);
      labels.push(formatDate(newDate));
    }
    return labels;
  };

  let labels = generateDateLabels(temperatures.length);

  if (temperatures.length === 1) {
    temperatures = [NaN, NaN, temperatures[0], NaN, NaN];
    labels = generateDateLabels(temperatures.length);
  }


  // Map the temperatures to colors
  const pointBackgroundColor = isDark ? '#27272a' : '#ffffff';
  const borderColor = isDark ? '#C1C1C3FF' : '#29292FFF';
  const backgroundColor = isDark ? '#C1C1C3FF' : '#29292FFF';
  const gridColor = backgroundColor;
  const textColor = isDark ? '#27272a' : '#ffffff';

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Max Temperature (°C)',
        data: temperatures,
        borderColor,
        backgroundColor,
        fill: true,
        tension: 0.4,
        spanGaps: true,
        pointBackgroundColor, // Apply dynamic point color based on temperature
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: textColor,
        },
      },
      tooltip: {
        backgroundColor: borderColor,
        titleColor: isDark ? '#000' : '#fff',
        bodyColor: isDark ? '#000' : '#fff',
      },
    },
    scales: {
      x: {
        ticks: {
          color: textColor,
        },
        grid: {
          color: gridColor,
        },
      },
      y: {
        ticks: {
          color: textColor,
        },
        grid: {
          color: gridColor,
        },
      },
    },
  };

  return (
    <div className={`max-w-[100%] break-words whitespace-normal flex flex-col gap-2 rounded-lg px-3 py-2 text-sm ${
      isSystem 
        ? "bg-primary text-secondary text-left self-start" 
        : "bg-secondary text-right self-end"
    }`}>
      {isWeather ? (
        <div className="w-full h-[300px]">
          <Line data={chartData} options={chartOptions} />
        </div>
      ) : (
        <ReactMarkdown>{message}</ReactMarkdown>
      )}
    </div>
  );
}
