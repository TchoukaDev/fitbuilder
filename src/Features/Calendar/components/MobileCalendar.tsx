"use client";

// Calendrier custom mobile-first : grille mensuelle + liste d'events du jour sélectionné
import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { CalendarEvent } from "@/types/calendarEvent";

interface MobileCalendarProps {
  events: CalendarEvent[];
  currentDate: Date;
  onNavigate: (date: Date) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectSlot: (slotInfo: { start: Date }) => void;
}

const DAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export default function MobileCalendar({
  events,
  currentDate,
  onNavigate,
  onSelectEvent,
  onSelectSlot,
}: MobileCalendarProps) {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Grouper les events par jour
  const eventsByDay = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach((ev) => {
      const key = toDateKey(ev.start);
      if (!map[key]) map[key] = [];
      map[key].push(ev);
    });
    return map;
  }, [events]);

  // Générer les cellules de la grille (null = case vide)
  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = (firstDay.getDay() + 6) % 7; // Lundi = 0
    const grid: (number | null)[] = [
      ...Array(startOffset).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (grid.length % 7 !== 0) grid.push(null);
    return grid;
  }, [year, month]);

  const selectedDayEvents = useMemo(() => {
    return (eventsByDay[toDateKey(selectedDate)] || []).sort(
      (a, b) => a.start.getTime() - b.start.getTime()
    );
  }, [selectedDate, eventsByDay]);

  const monthLabel = currentDate.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Navigation mois */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={() => onNavigate(new Date(year, month - 1, 1))}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label="Mois précédent"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="font-semibold capitalize text-gray-800">{monthLabel}</span>
        <button
          onClick={() => onNavigate(new Date(year, month + 1, 1))}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label="Mois suivant"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Grille calendrier */}
      <div className="grid grid-cols-7 gap-1">
        {/* En-têtes jours */}
        {DAY_LABELS.map((label, i) => (
          <div key={i} className="text-center text-xs font-medium text-gray-400 py-1">
            {label}
          </div>
        ))}

        {/* Cellules */}
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;

          const cellDate = new Date(year, month, day);
          const key = toDateKey(cellDate);
          const dayEvents = eventsByDay[key] || [];
          const isToday = isSameDay(cellDate, today);
          const isSelected = isSameDay(cellDate, selectedDate);

          return (
            <button
              key={day}
              onClick={() => setSelectedDate(cellDate)}
              className={`flex flex-col items-center py-1.5 rounded-lg transition-colors ${isSelected
                ? "bg-primary-500 text-white"
                : isToday
                  ? "bg-primary-50 text-primary-700 font-bold"
                  : "hover:bg-gray-50 text-gray-700"
                }`}
            >
              <span className="text-sm leading-none">{day}</span>
              {/* Dots events */}
              <div className="flex gap-0.5 mt-1 min-h-[6px]">
                {dayEvents.slice(0, 3).map((ev, idx) => (
                  <span
                    key={idx}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: isSelected ? "white" : ev.color }}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Séances du jour sélectionné */}
      <div className="mt-1 border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-700 capitalize">
            {selectedDate.toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </h3>
          <button
            onClick={() => onSelectSlot({ start: selectedDate })}
            className="flex items-center gap-1 text-sm text-primary-600 font-medium px-3 py-1.5 rounded-lg border border-primary-200 hover:bg-primary-50 transition-colors"
          >
            <Plus size={16} />
            Ajouter
          </button>
        </div>

        {selectedDayEvents.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">Aucune séance ce jour</p>
        ) : (
          <div className="flex flex-col gap-2">
            {selectedDayEvents.map((ev) => (
              <button
                key={ev.id}
                onClick={() => onSelectEvent(ev)}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition text-left w-full"
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: ev.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{ev.title}</p>
                  <p className="text-xs text-gray-500">
                    {ev.start.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    {" — "}
                    {ev.end.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
