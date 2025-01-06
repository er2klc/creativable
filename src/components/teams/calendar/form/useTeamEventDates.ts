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
        // Handle multi-day events
        const startDate = eventToEdit.start_time ? new Date(eventToEdit.start_time) : null;
        const endDate = eventToEdit.end_date ? new Date(eventToEdit.end_date) : null;
        setSelectedDate(startDate);
        setEndDate(endDate);
      } else {
        // Handle regular events
        const date = eventToEdit.start_time ? new Date(eventToEdit.start_time) : null;
        setSelectedDate(date);
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