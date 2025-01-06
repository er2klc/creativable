import { useState, useEffect } from "react";

interface UseTeamEventDatesProps {
  eventToEdit?: any;
  initialSelectedDate: Date | null;
}

export const useTeamEventDates = ({ 
  eventToEdit,
  initialSelectedDate
}: UseTeamEventDatesProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    if (eventToEdit) {
      if (eventToEdit.is_multi_day) {
        const startTime = eventToEdit.start_time ? new Date(eventToEdit.start_time) : null;
        const endTime = eventToEdit.end_date ? new Date(eventToEdit.end_date) : null;
        
        if (startTime) {
          // For multi-day events, we want to preserve the exact date
          setSelectedDate(startTime);
        }
        
        if (endTime) {
          setEndDate(endTime);
        }
      } else {
        const startTime = eventToEdit.start_time ? new Date(eventToEdit.start_time) : null;
        if (startTime) {
          // For single-day events, we want to preserve the time
          setSelectedDate(startTime);
          
          if (eventToEdit.end_time) {
            const endTime = new Date(eventToEdit.end_time);
            setEndDate(endTime);
          }
        }
      }
    } else if (initialSelectedDate) {
      const newDate = new Date(initialSelectedDate);
      newDate.setHours(9, 0, 0, 0);
      setSelectedDate(newDate);
    }
  }, [eventToEdit, initialSelectedDate]);

  const handleDateSelect = (date: Date | null) => {
    if (date) {
      const newDate = new Date(date);
      
      if (selectedDate) {
        // Preserve the time from the previous selectedDate
        newDate.setHours(
          selectedDate.getHours(),
          selectedDate.getMinutes(),
          0,
          0
        );
      } else {
        newDate.setHours(9, 0, 0, 0);
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
        // Preserve the time from the previous endDate
        newDate.setHours(
          endDate.getHours(),
          endDate.getMinutes(),
          0,
          0
        );
      } else {
        // Default end time to 18:00
        newDate.setHours(18, 0, 0, 0);
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