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
      if (eventToEdit.is_multi_day) {
        const startTime = eventToEdit.start_time ? new Date(eventToEdit.start_time) : null;
        const endTime = eventToEdit.end_date ? new Date(eventToEdit.end_date) : null;
        
        if (startTime) {
          setSelectedDate(startTime);
        }
        
        if (endTime) {
          setEndDate(endTime);
        }
      } else {
        const startTime = eventToEdit.start_time ? new Date(eventToEdit.start_time) : null;
        if (startTime) {
          setSelectedDate(startTime);
        }
      }
    } else if (initialSelectedDate) {
      setSelectedDate(initialSelectedDate);
    }
  }, [eventToEdit, initialSelectedDate]);

  const handleDateSelect = (date: Date | null) => {
    console.log("Handling date selection:", date);
    if (date) {
      const newDate = new Date(date);
      
      if (selectedDate) {
        newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
      } else {
        newDate.setHours(9, 0);
      }
      
      setSelectedDate(newDate);
    } else {
      setSelectedDate(null);
    }
  };

  const handleEndDateSelect = (date: Date | null) => {
    if (date) {
      const newDate = new Date(date);
      
      if (endDate) {
        newDate.setHours(endDate.getHours(), endDate.getMinutes());
      } else {
        newDate.setHours(18, 0);
      }
      
      setEndDate(newDate);
    } else {
      setEndDate(null);
    }
  };

  return {
    selectedDate,
    endDate,
    handleDateSelect,
    handleEndDateSelect,
  };
};