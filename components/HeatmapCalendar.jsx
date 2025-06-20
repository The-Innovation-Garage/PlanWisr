"use client"

import { useState } from 'react';
import { format, getDaysInMonth, startOfMonth, getDay, addMonths, subMonths } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const HeatmapCalendar = ({ activityData }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const generateDays = () => {
    if (!activityData || !Array.isArray(activityData)) {
      return [];
    }
    const firstDayOfMonth = getDay(startOfMonth(currentDate));
    const daysInMonth = getDaysInMonth(currentDate);
    
    const days = Array(firstDayOfMonth).fill(null);

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = format(date, 'MMM d');
      const dayData = activityData.find(d => d.date === dateKey);

      days.push({
        date: date,
        activityLevel: dayData ? dayData.minutes : 0,
        hours: dayData ? dayData.hours : 0,
        remainingMinutes: dayData ? dayData.remainingMinutes : 0,
      });
    }
    return days;
  };

  const getIntensityLevel = (minutes) => {
    if (minutes <= 0) return 0;
    if (minutes <= 30) return 1;
    if (minutes <= 90) return 2;
    if (minutes <= 180) return 3;
    return 4;
  };

  const getColorClass = (level) => {
    const colors = [
      'bg-gray-200 dark:bg-gray-800',
      'bg-[#9be9a8] dark:bg-[#0e4429]',
      'bg-[#40c463] dark:bg-[#006d32]',
      'bg-[#30a14e] dark:bg-[#26a641]',
      'bg-[#216e39] dark:bg-[#39d353]',
    ];
    return colors[level];
  };

  const days = generateDays();

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Monthly Activity</h3>
          <div className='flex items-center gap-2'>
            <span className="font-medium text-sm text-muted-foreground">{format(currentDate, 'MMMM yyyy')}</span>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Grid Container */}
        <div className="flex-grow flex items-center">
          <div className="grid grid-cols-7 gap-1.5">
            {days.length > 0 ? (
              days.map((day, index) => {
                if (!day) {
                  return <div key={`empty-${index}`} className="w-5 h-5" />;
                }
                
                const intensity = getIntensityLevel(day.activityLevel);
                const colorClass = getColorClass(intensity);
                const timeString = `${day.hours}h ${day.remainingMinutes}m on ${format(day.date, 'MMM d, yyyy')}`;
                const activityString = day.activityLevel > 0 ? timeString : `No activity on ${format(day.date, 'MMM d, yyyy')}`;

                return (
                  <Tooltip key={index} delayDuration={100}>
                    <TooltipTrigger asChild>
                      {/* FIXED SIZE CELL */}
                      <div className={`w-5 h-5 rounded-sm ${colorClass}`} />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs font-medium">{activityString}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })
            ) : (
              <div className="col-span-7 text-center text-sm text-muted-foreground py-8">
                No activity data to display.
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground pt-4">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map(level => (
              <div key={level} className={`w-3 h-3 rounded-sm ${getColorClass(level)}`} />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default HeatmapCalendar;