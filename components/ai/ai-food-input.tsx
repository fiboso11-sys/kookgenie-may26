"use client";

import { useEffect, useState } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
  debounceMs?: number;
  onDebounced?: (v: string) => void;
};

export function AiFoodInput({
  value,
  onChange,
  disabled,
  placeholder = 'Try "2 dosa with chutney"…',
  debounceMs = 450,
  onDebounced,
}: Props) {
  const [local, setLocal] = useState(value);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  useEffect(() => {
    if (!onDebounced) return;
    const t = setTimeout(() => onDebounced(local.trim()), debounceMs);
    return () => clearTimeout(t);
  }, [local, debounceMs, onDebounced]);

  return (
    <textarea
      value={local}
      disabled={disabled}
      onChange={(e) => {
        const v = e.target.value;
        setLocal(v);
        onChange(v);
      }}
      rows={3}
      className="w-full resize-none rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-kg-neutral-800 outline-none ring-kg-primary/25 focus:ring-2"
      placeholder={placeholder}
      maxLength={500}
      aria-label="Describe food in natural language"
    />
  );
}
