"use client";

import { useState } from "react";
import {
  BookmarkIcon,
  BookOpenIcon,
  CheckCircleIcon,
  LayersIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const STATUS_OPTIONS = [
  { value: "want_to_read", label: "読みたい", icon: BookmarkIcon },
  { value: "reading", label: "読書中", icon: BookOpenIcon },
  { value: "completed", label: "読了", icon: CheckCircleIcon },
  { value: "stacked", label: "積読", icon: LayersIcon },
] as const;

type StatusSelectorProps = {
  name: string;
  defaultValue?: string;
};

export function StatusSelector({ name, defaultValue }: StatusSelectorProps) {
  const [selected, setSelected] = useState(defaultValue ?? "");

  return (
    <div className="grid grid-cols-2 gap-2">
      <input type="hidden" name={name} value={selected} />
      {STATUS_OPTIONS.map(({ value, label, icon: Icon }) => (
        <Button
          key={value}
          type="button"
          variant={selected === value ? "default" : "outline"}
          size="sm"
          className="justify-start gap-2"
          onClick={() => setSelected(value)}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Button>
      ))}
    </div>
  );
}
