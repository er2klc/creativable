import { useState, useEffect } from "react";

interface UseTeamEventDatesProps {
  eventToEdit?: any;
  initialSelectedDate: Date | null;
}

export const useTeamEventDates = ({ eventToEdit, initialSelectedDate }: UseTeamEventDatesProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    if (eventToEdit) {
      // For editing existing events
      if (eventToEdit.is_multi_day) {
        // Handle multi-day events (Team Events with start/end dates)
        const startTime = eventToEdit.start_time ? new Date(eventToEdit.start_time) : null;
        const endTime = eventToEdit.end_date ? new Date(eventToEdit.end_date) : null;
        setSelectedDate(startTime);
        setEndDate(endTime);
      } else {
        // Handle regular events (with or without time, recurring or admin-only)
        const startTime = eventToEdit.start_time ? new Date(eventToEdit.start_time) : null;
        setSelectedDate(startTime);
      }
    } else if (initialSelectedDate) {
      // For creating new events
      setSelectedDate(initialSelectedDate);
    }
  }, [eventToEdit, initialSelectedDate]);

  const handleDateSelect = (date: Date | null) => {
    setSelectedDate(date);
  };

  const handleEndDateSelect = (date: Date | null) => {
    setEndDate(date);
  };

  return {
    selectedDate,
    endDate,
    handleDateSelect,
    handleEndDateSelect,
  };
};