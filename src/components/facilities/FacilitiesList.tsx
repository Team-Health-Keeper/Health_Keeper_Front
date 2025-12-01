import { FC, RefObject } from "react";
import { FacilityCard, FacilityItem } from "./FacilityCard";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";

interface FacilitiesListProps {
  facilities: FacilityItem[];
  totalLabel?: string;
  error: string | null;
  isLoading: boolean;
  hasMore: boolean;
  observerRef: RefObject<HTMLDivElement> | React.MutableRefObject<HTMLDivElement | null>;
  userHasLocation: boolean;
  hasFilter: boolean;
  formatZip: (zip?: string | null) => string | null;
  onDirections: (f: { facilityName?: string; latitude?: number | null; longitude?: number | null }) => void;
}

export const FacilitiesList: FC<FacilitiesListProps> = ({
  facilities,
  totalLabel,
  error,
  isLoading,
  hasMore,
  observerRef,
  userHasLocation,
  hasFilter,
  formatZip,
  onDirections,
}) => {
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="mb-2 text-2xl font-bold text-gray-900">내 주변 운동 시설</h2>
        <p className="text-gray-600">{totalLabel ?? `총 ${facilities.length}개 시설`}</p>
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      </div>

      {(() => {
        if (!facilities.length && !isLoading && !error) {
          return (
            <EmptyState
              message={
                !userHasLocation
                  ? "내 위치를 설정하면 주변 시설을 볼 수 있어요"
                  : hasFilter
                    ? "조건에 맞는 시설이 없습니다"
                    : "불러올 시설이 없습니다"
              }
            />
          )
        }
        return facilities.map((facility) => (
          <FacilityCard
            key={facility.id}
            facility={facility}
            formatZip={formatZip}
            onDirections={onDirections}
          />
        ))
      })()}

      {isLoading && (
        <div className="py-8 text-center">
          <LoadingState message="더 많은 시설을 불러오는 중..." />
        </div>
      )}

      {hasMore && <div ref={observerRef as any} className="h-10" />}

      {!hasMore && facilities.length > 0 && (
        <div className="py-8 text-center">
          <p className="text-sm text-gray-500">모든 시설을 불러왔습니다</p>
        </div>
      )}
    </div>
  );
};
