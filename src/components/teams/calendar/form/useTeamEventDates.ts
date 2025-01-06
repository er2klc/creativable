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
        const startTime = eventToEdit.start_time ? new Date(eventToEdit.start_time) : null;
        const endTime = eventToEdit.end_date ? new Date(eventToEdit.end_date) : null;
        
        if (startTime) {
          const validStartTime = new Date(startTime);
          validStartTime.setSeconds(0, 0);
          setSelectedDate(validStartTime);
        }
        
        if (endTime) {
          const validEndTime = new Date(endTime);
          validEndTime.setSeconds(0, 0);
          setEndDate(validEndTime);
        }
      } else {
        // Handle regular events
        const startTime = eventToEdit.start_time ? new Date(eventToEdit.start_time) : null;
        if (startTime) {
          const validStartTime = new Date(startTime);
          validStartTime.setSeconds(0, 0);
          setSelectedDate(validStartTime);
        }
      }
    } else if (initialSelectedDate) {
      // For creating new events
      const date = new Date(initialSelectedDate);
      date.setHours(9, 0, 0, 0);
      setSelectedDate(date);
    }
  }, [eventToEdit, initialSelectedDate]);

  const handleDateSelect = (date: Date | null) => {
    console.log("Handling date selection:", date);
    if (date) {
      const newDate = new Date(date);
      
      if (selectedDate) {
        // Preserve the time from the existing selectedDate
        newDate.setHours(
          selectedDate.getHours(),
          selectedDate.getMinutes(),
          0,
          0
        );
      } else {
        // Set default time for new dates
        newDate.setHours(9, 0, 0, 0);
      }
      
      console.log("Setting selected date to:", newDate);
      setSelectedDate(newDate);
    } else {
      setSelectedDate(null);
    }
  };

  const handleEndDateSelect = (date: Date | null) => {
    if (date) {
      const newDate = new Date(date);
      
      if (endDate) {
        // Preserve the time from the existing endDate
        newDate.setHours(
          endDate.getHours(),
          endDate.getMinutes(),
          0,
          0
        );
      } else {
        // Set default time for new end dates
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