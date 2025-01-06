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
        setSelectedDate(new Date(eventToEdit.start_time));
        setEndDate(new Date(eventToEdit.end_date));
      } else {
        // Handle regular events
        setSelectedDate(new Date(eventToEdit.start_time));
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