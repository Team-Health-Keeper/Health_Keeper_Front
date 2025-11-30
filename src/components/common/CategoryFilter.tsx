interface CategoryFilterProps {
  categories: string[]
  active: string
  onChange: (category: string) => void
  className?: string
}

export function CategoryFilter({ categories, active, onChange, className = "" }: CategoryFilterProps) {
  // 두 줄로 균형 있게 나누기
  const mid = Math.ceil(categories.length / 2)
  const firstRow = categories.slice(0, mid)
  const secondRow = categories.slice(mid)
  return (
    <div className={`space-y-3 ${className}`} aria-label="카테고리 필터">
      {[firstRow, secondRow].map((row, idx) => (
        <div key={idx} className="flex flex-wrap justify-center gap-3">
          {row.map((c) => (
            <button
              key={c}
              onClick={() => onChange(c)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors duration-150 ${
                c === active
                  ? "bg-[#0074B7] text-white shadow"
                  : "bg-white border-2 border-gray-200 text-gray-700 hover:border-[#0074B7] hover:text-[#0074B7]"
              }`}
              aria-pressed={c === active}
            >
              {c}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}
