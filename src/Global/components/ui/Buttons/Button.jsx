import { Slot } from "@radix-ui/react-slot";

export default function Button({
  asChild,
  width,
  full,
  close,
  edit,
  ...props
}) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      {...props}
      className={`flex items-center justify-center shadow ${
        width ? width : "min-w-[150px]"
      } gap-2 ${full && "w-full"} ${
        close
          ? "bg-accent-500 hover:bg-accent-600 text-accent-50 disabled:bg-accent-300"
          : edit
          ? "bg-primary-400 hover:bg-primary-500/85 disabled:bg-primary-100 text-primary-50"
          : "bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-primary-50"
      }  p-3 rounded cursor-pointer transition-all duration-200`}
    >
      {props.children}
    </Comp>
  );
}
