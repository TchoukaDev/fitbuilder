"use client";

import * as React from "react";
import { Button } from "@/Global/components/ui/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Global/components/ui/shadcn/dropdown-menu";
import { Calendar, ChevronDown, Clock, CheckCircle2, X } from "lucide-react";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";

export default function StatusFilter({ selected = [], onChange }) {
  const statuses = [
    {
      value: "planned",
      label: "Planifiées",
      emoji: <Calendar size={16} />,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      borderColor: "border-blue-300",
    },
    {
      value: "in-progress",
      label: "En cours",
      emoji: <Clock size={16} />,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      borderColor: "border-orange-300",
    },
    {
      value: "completed",
      label: "Terminées",
      emoji: <CheckCircle2 size={16} />,
      color: "text-green-600",
      bgColor: "bg-green-100",
      borderColor: "border-green-300",
    },
  ];

  const handleToggle = (statusValue) => {
    const allValues = statuses.map((s) => s.value);
    const newSelected = selected.includes("all")
      ? allValues.filter((s) => s !== statusValue)
      : selected.includes(statusValue)
      ? selected.filter((s) => s !== statusValue)
      : [...selected, statusValue];
    onChange(newSelected);
  };

  const selectedStatuses = selected.includes("all")
    ? statuses
    : statuses.filter((s) => selected.includes(s.value));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full sm:w-auto  max-w-[300px] justify-between gap-1 min-h-10 h-auto cursor-pointer"
        >
          <div className="flex gap-1 md:gap-2 flex-wrap items-center flex-1">
            {selectedStatuses.length === statuses.length ? (
              <span className="text-primary-500">Toutes les séances</span>
            ) : selectedStatuses.length === 0 ? (
              <span className="text-primary-500">Aucune séance</span>
            ) : (
              selectedStatuses.map((status) => (
                <span
                  key={status.value}
                  className={`
                    inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                    ${status.bgColor} ${status.color} ${status.borderColor} border pointer-events-auto cursor-pointer
                  `}
                >
                  <span className="flex items-center">{status.emoji}</span>
                  <span>{status.label}</span>

                  <span
                    role="button"
                    tabIndex={-1}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleToggle(status.value);
                    }}
                    className={`
                      ml-1 hover:bg-black/20 rounded-full p-0.5 transition-colors
                      cursor-pointer
                      ${status.color}
                    `}
                    aria-label={`Retirer ${status.label}`}
                  >
                    <X size={12} />
                  </span>
                </span>
              ))
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56 text-primary-500">
        <DropdownMenuLabel>Afficher les séances:</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {statuses.map((status) => (
          <DropdownMenuCheckboxItem
            key={status.value}
            checked={
              selected.includes(status.value) || selected.includes("all")
            }
            onCheckedChange={() => handleToggle(status.value)}
            className="cursor-pointer"
          >
            <span className={`${status.color} flex items-center gap-2`}>
              {status.emoji} {status.label}
            </span>
          </DropdownMenuCheckboxItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          {selected.length < statuses.length && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full cursor-pointer"
              onClick={() => onChange(["all"])}
            >
              Sélectionner tout
            </Button>
          )}
        </DropdownMenuItem>
        {selected.length > 0 && (
          <DropdownMenuItem asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full cursor-pointer"
              onClick={() => onChange([])}
            >
              Désélectionner tout
            </Button>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
