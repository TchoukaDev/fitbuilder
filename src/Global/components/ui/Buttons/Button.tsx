import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/libs/utils";
import { ButtonHTMLAttributes } from "react";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  width?: string | null;
  full?: boolean;
  close?: boolean;
  edit?: boolean;
};

export default function Button({
  asChild,
  width,
  full,
  close,
  edit,
  className,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      {...props}
      className={cn("flex items-center justify-center text-center shadow p-3 gap-2 rounded cursor-pointer transition-all duration-200" ,
        full && "w-full",
        width ? width : "min-w-[150px]",
        close
          ? "bg-accent-500 hover:bg-accent-600 text-accent-50 disabled:bg-accent-300"
          : edit
          ? "bg-primary-400 hover:bg-primary-500/85 disabled:bg-primary-100 text-primary-50"
          : "bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-primary-50"
      , className)}
    >
      {props.children}
    </Comp>
  );
}
