'use client'
import { useState } from "react"

interface SearchBarProps {
  onSearch: (value: string) => void
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [value, setValue] = useState("")

  return (
    <div className="mb-4">
      <input
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          onSearch(e.target.value)
        }}
        placeholder="Search contestant..."
        className="w-full px-4 py-2 border border-slate-200 rounded bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
      />
    </div>
  )
}