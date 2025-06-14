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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvatarWithHoverDelete } from "./avatar-with-hover-delete";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface ChatCardProps {
  message: string;
  isFromOwner: boolean;
  isWeather: boolean;
  timestamp?: string | Date;
  sender: {
    name: string;
    profilePicture: string;
  };
}

export function MessageCard({ message, isFromOwner, isWeather, timestamp, sender }: ChatCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Function to get initials from a name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Function to get a random color for the avatar background
  const getRandomColor = (name: string) => {
    const colors = [
      "bg-indigo-500",
      "bg-green-600",
      "bg-red-500",
      "bg-orange-500",
      "bg-purple-500",
    ];
    const index =
      name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      colors.length;
    return colors[index];
  };

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
  const borderColor = isDark ? '#EEEBEBFF' : '#29292FFF';
  const backgroundColor = isDark ? '#EEEBEBFF' : '#29292FFF';
  const gridColor = isDark ? '#C1C1C3FF' : '#29292FFF';;

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
          color: !isDark ? '#000' : '#EEEBEBFF',
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
          color: !isDark ? '#000' : '#EEEBEBFF',
        },
        grid: {
          color: gridColor,
        },
      },
      y: {
        ticks: {
          color: !isDark ? '#000' : '#EEEBEBFF',
        },
        grid: {
          color: gridColor,
        },
      },
    },
  };

  // Formatar o timestamp para HH:MM
  let timeString = "";
  if (timestamp) {
    const date = new Date(timestamp);
    timeString = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className={`flex flex-row gap-2 ${
      sender.name === "system" 
        ? 'justify-center' 
        : isFromOwner 
          ? 'justify-end' 
          : 'justify-start'
    } items-start w-full`}>
      {!isFromOwner && sender.name !== "system" && (
        <Avatar className="size-6">
          <AvatarImage src={sender.profilePicture} />
          <AvatarFallback className={`${getRandomColor(sender.name)} text-white`}>
            {getInitials(sender.name)}
          </AvatarFallback>
        </Avatar>
      )}
      <div className={`flex flex-col gap-2 ${
        sender.name === "system"
          ? 'max-w-[90%] items-center'
          : isFromOwner 
            ? 'max-w-[70%] items-end' 
            : 'max-w-[70%] items-start'
      }`}>
        {sender.name === "system" ? (
          <div className="text-sm font-medium text-center w-full">System</div>
        ) : !isFromOwner && (
          <div className="text-sm font-medium">{sender.name}</div>
        )}
        <div className={`break-words whitespace-normal rounded-lg px-3 py-2 text-sm ${
          sender.name === "system"
            ? "bg-secondary text-left self-center w-full"
            : !isFromOwner 
              ? "bg-secondary-foreground text-secondary text-left self-start" 
              : "bg-secondary text-right self-end"
        }`}>
          {isWeather ? (
            <div className="w-full h-[300px]">
              <Line data={chartData} options={chartOptions} />
            </div>
          ) : (
            <ReactMarkdown>{message}</ReactMarkdown>
          )}
          {timeString && (
            <div className="text-xs text-muted-foreground mt-1 text-right">{timeString}</div>
          )}
        </div>
      </div>
    </div>
  );
}
