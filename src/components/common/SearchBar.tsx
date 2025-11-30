import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { ReactNode } from "react"

interface SearchBarProps {
  value: string
  onChange: (val: string) => void
  onSearch: () => void
  placeholder?: string
  className?: string
  prepend?: ReactNode
  append?: ReactNode
  enterKey?: boolean
}

export function SearchBar({ value, onChange, onSearch, placeholder, className = "", prepend, append, enterKey = true }: SearchBarProps) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {prepend}
      <div className="relative flex-1 min-w-[240px] max-w-md">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (enterKey && e.key === "Enter") {
              e.preventDefault()
              onSearch()
            }
          }}
          placeholder={placeholder}
          className="h-14 rounded-full border-2 pl-12 pr-4 text-base focus-visible:ring-[#0074B7]"
        />
      </div>
      <Button
        size="lg"
        className="h-14 rounded-full bg-[#0074B7] px-8 hover:bg-[#005a91]"
        onClick={onSearch}
      >
        검색
      </Button>
      {append}
    </div>
  )
}
