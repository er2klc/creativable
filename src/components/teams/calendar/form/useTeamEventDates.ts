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

  // Initialize dates when component mounts or eventToEdit changes
  useEffect(() => {
    if (eventToEdit) {
      if (eventToEdit.is_multi_day) {
        const startTime = eventToEdit.start_time ? new Date(eventToEdit.start_time) : null;
        const endTime = eventToEdit.end_date ? new Date(eventToEdit.end_date) : null;
        
        if (startTime) {
          const newStartDate = new Date(startTime);
          setSelectedDate(newStartDate);
        }
        
        if (endTime) {
          const newEndDate = new Date(endTime);
          setEndDate(newEndDate);
        }
      } else {
        const startTime = eventToEdit.start_time ? new Date(eventToEdit.start_time) : null;
        if (startTime) {
          const newStartDate = new Date(startTime);
          setSelectedDate(newStartDate);
          
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
        const hours = selectedDate.getHours();
        const minutes = selectedDate.getMinutes();
        newDate.setHours(hours, minutes, 0, 0);
      } else {
        // Default to 9:00 AM if no previous time
        newDate.setHours(9, 0, 0, 0);
      }
      
      setSelectedDate(newDate);

      // For multi-day events, if end date is before the new start date,
      // update end date to be the same as start date
      if (endDate && endDate < newDate) {
        const newEndDate = new Date(newDate);
        newEndDate.setHours(18, 0, 0, 0);
        setEndDate(newEndDate);
      }
    } else {
      setSelectedDate(null);
    }
  };

  const handleEndDateSelect = (date: Date | null) => {
    if (date) {
      const newDate = new Date(date);
      
      if (endDate) {
        // Preserve the time from the previous endDate
        const hours = endDate.getHours();
        const minutes = endDate.getMinutes();
        newDate.setHours(hours, minutes, 0, 0);
      } else {
        // Default end time to 18:00
        newDate.setHours(18, 0, 0, 0);
      }

      // Ensure end date is not before start date
      if (selectedDate && newDate < selectedDate) {
        const adjustedDate = new Date(selectedDate);
        adjustedDate.setHours(18, 0, 0, 0);
        setEndDate(adjustedDate);
      } else {
        setEndDate(newDate);
      }
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