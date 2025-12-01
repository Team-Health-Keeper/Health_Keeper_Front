import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/common/SearchBar";
import { CategoryFilter } from "@/components/common/CategoryFilter";
import { Navigation } from "lucide-react";
import { FC } from "react";

interface FiltersBarProps {
  searchQuery: string;
  onSearchQueryChange: (v: string) => void;
  onSearch: () => void;
  onLocate: () => void;
  categories: string[];
  activeCategory: string;
  onCategoryChange: (c: string) => void;
}

export const FiltersBar: FC<FiltersBarProps> = ({
  searchQuery,
  onSearchQueryChange,
  onSearch,
  onLocate,
  categories,
  activeCategory,
  onCategoryChange,
}) => {
  return (
    <>
      <div className="mb-6">
        <SearchBar
          value={searchQuery}
          onChange={onSearchQueryChange}
          onSearch={onSearch}
          placeholder="지역명 또는 시설명 검색..."
          append={(
            <Button
              size="lg"
              variant="outline"
              className="h-14 rounded-full border-2 border-[#0074B7] bg-white px-8 text-[#0074B7] hover:bg-gray-100 hover:text-[#0074B7] hover:border-[#005a91] focus-visible:ring-2 focus-visible:ring-[#0074B7]/40 focus-visible:ring-offset-2 transition-colors duration-150"
              onClick={onLocate}
              title="현재 위치로 검색"
            >
              <Navigation className="mr-2 h-4 w-4" />내 위치
            </Button>
          )}
        />
      </div>
      <CategoryFilter
        categories={categories}
        active={activeCategory}
        onChange={onCategoryChange}
        className="mt-2"
      />
    </>
  );
};
