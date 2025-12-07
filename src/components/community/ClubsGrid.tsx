import { FC, RefObject } from "react";
import { ClubCard, Club } from "./ClubCard";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";

interface ClubsGridProps {
  clubs: Club[];
  isLoading: boolean;
  error: string | null;
  hasNextPage: boolean;
  observerRef: RefObject<HTMLDivElement | null> | React.MutableRefObject<HTMLDivElement | null>;
  // ...existing code...
}

export const ClubsGrid: FC<ClubsGridProps> = ({
  clubs,
  isLoading,
  error,
  hasNextPage,
  observerRef,
}) => {
  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">추천 동호회</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clubs.map((club, index) => (
            <ClubCard
              key={`${club.id}-${index}`}
              club={club}
            />
          ))}
        </div>
        <div ref={observerRef} className="mt-12 text-center">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {clubs.length === 0 && !isLoading && !error && (
            <EmptyState message="조건에 맞는 동호회가 없습니다" />
          )}
          {!isLoading && !error && !hasNextPage && clubs.length > 0 && (
            <p className="text-m text-gray-600">모든 페이지를 불러왔습니다</p>
          )}
          {isLoading && <LoadingState message="동호회를 불러오는 중..." />}
        </div>
      </div>
    </section>
  );
};
