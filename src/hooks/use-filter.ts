
import { useState, useCallback } from "react";

interface FilterState {
  searchTerm: string;
  platform: string;
  status: string;
  phase: string;
}

export function useFilter() {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    platform: "all",
    status: "all",
    phase: "all",
  });

  const setSearchTerm = useCallback((term: string) => {
    setFilters((prev) => ({ ...prev, searchTerm: term }));
  }, []);

  const setPlatform = useCallback((platform: string) => {
    setFilters((prev) => ({ ...prev, platform }));
  }, []);

  const setStatus = useCallback((status: string) => {
    setFilters((prev) => ({ ...prev, status }));
  }, []);

  const setPhase = useCallback((phase: string) => {
    setFilters((prev) => ({ ...prev, phase }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      searchTerm: "",
      platform: "all",
      status: "all",
      phase: "all",
    });
  }, []);

  return {
    ...filters,
    setSearchTerm,
    setPlatform,
    setStatus,
    setPhase,
    resetFilters,
  };
}
