export const DEFAULT_SESSION_FILTERS = {
    status: "all",
    dateFilter: "all",
    workoutFilter: "all",
    page: 1,
    limit: 10,
  } as const;


    
  export interface SessionFiltersType {
    status: string | typeof DEFAULT_SESSION_FILTERS.status;
    dateFilter: string | typeof DEFAULT_SESSION_FILTERS.dateFilter;
    workoutFilter: string | typeof DEFAULT_SESSION_FILTERS.workoutFilter;
    page: number | typeof DEFAULT_SESSION_FILTERS.page;
    limit: number | typeof DEFAULT_SESSION_FILTERS.limit;
  }