"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { Command } from "cmdk";

type ComboboxProps = {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  emptyText?: string;
  disabled?: boolean;
};

export function Combobox({
  options,
  value,
  onChange,
  placeholder,
  emptyText = "Aucun résultat",
  disabled = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const isActive = value !== "all";

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={[
            "inline-flex items-center justify-between gap-2 border rounded-md font-semibold text-sm py-3 px-4 transition-colors shrink-0",
            isActive
              ? "bg-primary-500 text-white border-primary-500"
              : "border-primary-300 text-primary-500 hover:border-primary-400",
          ].join(" ")}
        >
          <span>{isActive ? options.find((o) => o.value === value)?.label ?? placeholder : placeholder}</span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-70" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          sideOffset={4}
          align="start"
          className="z-50 min-w-48 max-w-64 bg-white border border-primary-300 rounded-md shadow-md overflow-hidden"
        >
          <Command>
            <div className="px-3 py-2 border-b border-primary-100">
              <Command.Input
                placeholder="Rechercher..."
                className="w-full text-sm text-primary-500 outline-none placeholder:text-primary-300"
              />
            </div>
            <Command.List className="max-h-52 overflow-y-auto py-1">
              <Command.Empty className="py-2 px-3 text-sm text-gray-400">
                {emptyText}
              </Command.Empty>
              {/* Option "Tous" */}
              <Command.Item
                value="all"
                onSelect={() => {
                  onChange("all");
                  setOpen(false);
                }}
                className={[
                  "flex items-center justify-between py-2 px-3 text-sm cursor-pointer",
                  value === "all"
                    ? "text-primary-500 font-semibold"
                    : "text-primary-400 hover:bg-primary-50",
                ].join(" ")}
              >
                Tous
                {value === "all" && <Check className="size-4 text-primary-500" />}
              </Command.Item>
              {options.map((option) => (
                <Command.Item
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={[
                    "flex items-center justify-between py-2 px-3 text-sm cursor-pointer",
                    value === option.value
                      ? "text-primary-500 font-semibold"
                      : "text-primary-500 hover:bg-primary-50",
                  ].join(" ")}
                >
                  {option.label}
                  {value === option.value && <Check className="size-4 text-primary-500" />}
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
