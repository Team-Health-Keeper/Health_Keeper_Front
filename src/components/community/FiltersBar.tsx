import { SearchBar } from "@/components/common/SearchBar";
import { CategoryFilter } from "@/components/common/CategoryFilter";
import { FC } from "react";

interface Region {
  name: string;
  value: string;
  count: number;
}

interface FiltersBarProps {
  regions: Region[];
  selectedRegion: string;
  onRegionChange: (val: string) => void;
  searchQuery: string;
  onSearchQueryChange: (val: string) => void;
  onSearch: () => void;
  category: string;
  onCategoryChange: (val: string) => void;
  topCategoryNames: string[];
  className?: string;
}

export const FiltersBar: FC<FiltersBarProps> = ({
  regions,
  selectedRegion,
  onRegionChange,
  searchQuery,
  onSearchQueryChange,
  onSearch,
  category,
  onCategoryChange,
  topCategoryNames,
  className,
}) => {
  return (
    <div className={className}>
      <div className="mx-auto max-w-3xl">
        <SearchBar
          value={searchQuery}
          onChange={onSearchQueryChange}
          onSearch={onSearch}
          placeholder="동호회 이름, 관심 운동 검색..."
          prepend={(
            <div className="relative w-40 sm:w-48 shrink-0">
              <select
                value={selectedRegion}
                onChange={(e) => onRegionChange(e.target.value)}
                className="h-14 w-full appearance-none rounded-full border-2 border-gray-200 bg-white px-5 pr-10 text-sm font-medium text-gray-700 focus:border-[#0074B7] focus:outline-none focus-visible:ring-[#0074B7]"
                aria-label="지역 선택"
              >
                <option value="모두">모두</option>
                {regions.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.name}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
            </div>
          )}
        />
      </div>
      <CategoryFilter
        className="mt-6"
        categories={["전체", ...topCategoryNames]}
        active={category}
        onChange={onCategoryChange}
      />
    </div>
  );
};
