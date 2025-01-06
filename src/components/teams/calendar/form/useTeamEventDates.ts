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
      if (eventToEdit.end_date) {
        try {
          const parsedEndDate = parseISO(eventToEdit.end_date);
          if (isValid(parsedEndDate)) {
            setEndDate(parsedEndDate);
          }
        } catch (error) {
          console.error("Error parsing end date:", error);
        }
      }
      
      if (eventToEdit.start_time) {
        try {
          const startDate = parseISO(eventToEdit.start_time);
          if (isValid(startDate)) {
            setSelectedDate(startDate);
          }
        } catch (error) {
          console.error("Error parsing start time:", error);
        }
      }
    } else if (initialSelectedDate && isValid(initialSelectedDate)) {
      // For creating new events
      setSelectedDate(initialSelectedDate);
    }
  }, [initialSelectedDate, eventToEdit]);

  const handleDateSelect = (date: Date | null) => {
    console.log("Date selected in team event form:", date);
    setSelectedDate(date);
  };

  const handleEndDateSelect = (date: Date | null) => {
    console.log("End date selected:", date);
    setEndDate(date);
  };

  return {
    selectedDate,
    endDate,
    handleDateSelect,
    handleEndDateSelect,
  };
};