import { useState, type JSX } from "react";

export default function Checkbox(
  props: React.InputHTMLAttributes<HTMLInputElement>,
): JSX.Element {
  return (
    <label className="flex items-center gap-1 relative">
      <input
        type="checkbox"
        name={props.name}
        value={props.value}
        checked={props.checked}
        onChange={props.onChange}
        required={props.required}
        className="
            border border-foreground rounded-xs bg-background h-10 w-10 aspect-square
            checked:appearance-none checked:bg-foreground
            hover:cursor-pointer shrink-0"
      />
      <span
        className={`font-sans uppercase absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
            pointer-events-none ${props.checked ? "text-background" : "text-foreground"}`}
      >
        {props.children}
      </span>
    </label>
  );
}
