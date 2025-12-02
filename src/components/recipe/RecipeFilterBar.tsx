"use client"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface RecipeFilterBarProps {
  categories: string[]
  selectedCategory: string
  onCategoryChange: (c: string) => void
  search: string
  onSearchChange: (v: string) => void
  forMe: 'Y' | 'N'
  onToggleForMe: () => void
}

export function RecipeFilterBar({ categories, selectedCategory, onCategoryChange, search, onSearchChange, forMe, onToggleForMe }: RecipeFilterBarProps) {
  return (
    <div className="mb-10 space-y-6">
      <div className="relative max-w-xl mx-auto">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="운동 레시피 검색..."
          className="pl-11 h-12 text-base"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map(category => (
          <Badge
            key={category}
            variant={category === selectedCategory ? 'default' : 'outline'}
            className={`cursor-pointer px-4 py-2 text-sm transition-all ${category === selectedCategory ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-primary/10 hover:text-primary hover:border-primary/50'}`}
            onClick={() => onCategoryChange(category)}
          >
            {category}
          </Badge>
        ))}
      </div>
      <div className="flex items-center gap-3 justify-end">
        <span className={forMe === 'N' ? 'font-medium text-foreground' : 'text-muted-foreground'}>전체 보기</span>
        <button
          type="button"
            role="switch"
            aria-checked={forMe === 'Y'}
            aria-label="내 레시피 보기 토글"
            onClick={onToggleForMe}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 ${forMe === 'Y' ? 'bg-primary' : 'bg-muted'}`}
        >
          <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${forMe === 'Y' ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
        <span className={forMe === 'Y' ? 'font-medium text-foreground' : 'text-muted-foreground'}>내 레시피 보기</span>
      </div>
    </div>
  )
}
