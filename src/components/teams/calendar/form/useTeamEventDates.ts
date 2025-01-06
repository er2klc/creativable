import { useState, useEffect } from "react";
import { parseISO, isValid } from "date-fns";

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
        const startDate = new Date(eventToEdit.start_time);
        if (isValid(startDate)) {
          setSelectedDate(startDate);
        }

        const endDate = new Date(eventToEdit.end_date);
        if (isValid(endDate)) {
          setEndDate(endDate);
        }
      } else {
        // Handle regular events
        const startDate = new Date(eventToEdit.start_time);
        if (isValid(startDate)) {
          setSelectedDate(startDate);
        }
      }
    } else if (initialSelectedDate && isValid(initialSelectedDate)) {
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