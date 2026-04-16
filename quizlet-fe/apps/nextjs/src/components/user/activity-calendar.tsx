"use client";

import React, { useMemo } from "react";
import dayjs from "dayjs";
import ReactCalendar from "react-calendar";

import "react-calendar/dist/Calendar.css";
import "./activity-calendar.css";

import { Star } from "lucide-react";

import type { RouterOutputs } from "@acme/api";

interface ActivityCalendarProps {
  activity: RouterOutputs["activity"]["allByUser"];
}

const ActivityCalendar = ({ activity }: ActivityCalendarProps) => {
  const today = dayjs().format("YYYY-MM-DD");

  // Normalize all activity dates to YYYY-MM-DD set for fast lookup
  const activityDates = useMemo(() => {
    const set = new Set<string>();
    for (const item of activity) {
      if (item.date) {
        // Handle both "2026-04-16T12:30:00" and "2026-04-16" formats
        const d = dayjs(item.date);
        if (d.isValid()) set.add(d.format("YYYY-MM-DD"));
      }
    }
    return set;
  }, [activity]);

  return (
    <div className="rounded-lg bg-background p-2">
      <span className="mb-2 inline-block w-full text-center">
        {dayjs().format("MMMM")}
        {activityDates.size > 0 && (
          <span className="ml-2 text-xs text-gray-400">
            ({activityDates.size} ngày hoạt động)
          </span>
        )}
      </span>
      <ReactCalendar
        view="month"
        showNavigation={false}
        formatShortWeekday={(_, date) => dayjs(date).format("ddd").charAt(0)}
        calendarType="hebrew"
        tileContent={({ date }) => {
          const tileDate = dayjs(date).format("YYYY-MM-DD");
          const isToday = tileDate === today;
          const hasActivity = activityDates.has(tileDate);

          if (hasActivity) {
            return (
              <>
                <Star
                  size={40}
                  className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 text-yellow-300"
                  fill="currentColor"
                />
                {isToday && (
                  <div className="absolute left-1/2 m-auto h-1 w-1 -translate-x-1/2 rounded-full bg-foreground"></div>
                )}
              </>
            );
          }
          if (isToday) {
            return (
              <div className="absolute left-1/2 m-auto h-1 w-1 -translate-x-1/2 rounded-full bg-foreground"></div>
            );
          }

          return null;
        }}
      />
    </div>
  );
};

export default ActivityCalendar;
