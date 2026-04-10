import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva("inline-flex items-center justify-center rounded-md text-sm font-medium disabled:pointer-events-none disabled:opacity-50", {
  variants: {
    variant: { default: "bg-blue-600 text-white hover:bg-blue-500", outline: "border border-slate-300 bg-white hover:bg-slate-100" },
    size: { default: "h-10 px-4 py-2", sm: "h-8 px-3 text-xs" }
  },
  defaultVariants: { variant: "default", size: "default" }
});

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className = "", variant, size, ...props }, ref) => (
  <button className={`${buttonVariants({ variant, size })} ${className}`} ref={ref} {...props} />
));
Button.displayName = "Button";
