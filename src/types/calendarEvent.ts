import { WorkoutSession } from "./workoutSession";

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: string;
  colorHover: string;
  resource: WorkoutSession;
}