import { useMemo, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";

export function MultiSelect({ label, options = [], value = [], onChange, placeholder = "Search options", emptyText = "No options available" }) {
  const [search, setSearch] = useState("");
  const selectedValues = useMemo(() => (Array.isArray(value) ? value : []), [value]);
  const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues]);
  const selectedOptions = options.filter((option) => selectedSet.has(option.value));
  const filteredOptions = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return options.filter((option) => {
      if (selectedSet.has(option.value)) return false;
      if (!normalized) return true;
      return `${option.label} ${option.meta || ""}`.toLowerCase().includes(normalized);
    });
  }, [options, search, selectedSet]);

  const addValue = (nextValue) => {
    if (!nextValue || selectedSet.has(nextValue)) return;
    onChange([...selectedValues, nextValue]);
    setSearch("");
  };

  const removeValue = (nextValue) => {
    onChange(selectedValues.filter((item) => item !== nextValue));
  };

  return (
    <div>
      {label ? <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span> : null}
      <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3 focus-within:border-cyan-300/60 focus-within:ring-4 focus-within:ring-cyan-400/10">
        <div className="flex flex-wrap gap-2">
          {selectedOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-medium text-cyan-100"
              onClick={() => removeValue(option.value)}
            >
              {option.label}
              <FiX className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
        <div className="relative mt-3">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={placeholder}
            className="h-11 w-full rounded-lg border border-white/10 bg-slate-900/70 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-600"
          />
        </div>
        <div className="mt-3 max-h-44 overflow-y-auto rounded-lg border border-white/10 bg-slate-950/70">
          {options.length === 0 ? (
            <p className="px-3 py-3 text-sm text-slate-500">{emptyText}</p>
          ) : filteredOptions.length ? (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
                onClick={() => addValue(option.value)}
              >
                <span>{option.label}</span>
                {option.meta ? <span className="text-xs text-slate-500">{option.meta}</span> : null}
              </button>
            ))
          ) : (
            <p className="px-3 py-3 text-sm text-slate-500">No matching skills</p>
          )}
        </div>
      </div>
    </div>
  );
}
