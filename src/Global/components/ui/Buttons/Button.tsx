import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/libs/utils";
import { ButtonHTMLAttributes } from "react";

export const buttonVariants = cva(
  "flex items-center justify-center text-center shadow p-3 gap-2 rounded cursor-pointer transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-primary-50",
        close: "bg-accent-500 hover:bg-accent-600 text-accent-50 disabled:bg-accent-300",
        edit: "bg-primary-400 hover:bg-primary-500/85 disabled:bg-primary-100 text-primary-50",
        outline: "bg-transparent border-2 border-primary-500 text-primary-500 hover:bg-primary-50 shadow-none disabled:opacity-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    width?: string | null;
    full?: boolean;
  };

export default function Button({
  asChild,
  variant,
  width,
  full,
  className,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      {...props}
      className={cn(
        buttonVariants({ variant }),
        full && "w-full",
        width ? width : "min-w-[150px]",
        className
      )}
    >
      {props.children}
    </Comp>
  );
}
