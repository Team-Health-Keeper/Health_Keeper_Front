import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock, Navigation } from "lucide-react";
import { FC, memo } from "react";

export interface FacilityItem {
  id: number;
  facilityName: string;
  facilityType: string;
  stateValue: string | null;
  zipCode: string | null;
  addressMain: string | null;
  addressDetail: string | null;
  telNo: string | null;
  sidoName: string | null;
  sigunguName: string | null;
  latitude: number | null;
  longitude: number | null;
  distance?: number | null;
}

interface FacilityCardProps {
  facility: FacilityItem;
  formatZip: (zip?: string | null) => string | null;
  onDirections: (f: { facilityName?: string; latitude?: number | null; longitude?: number | null }) => void;
}

export const FacilityCard: FC<FacilityCardProps> = memo(({ facility, formatZip, onDirections }) => {
  const one = (facility.addressMain || '').trim();
  const two = (facility.addressDetail || '').trim();
  const zip = formatZip(facility.zipCode);
  let addressLine = '';
  if (one || two) {
    addressLine = one;
    if (two && (!one || !one.includes(two))) {
      addressLine = addressLine ? `${addressLine}, ${two}` : two;
    }
    if (zip) {
      addressLine = addressLine ? `${addressLine} [${zip}]` : `[${zip}]`;
    }
  }

  return (
    <Card
      className="group overflow-hidden rounded-2xl border-2 border-gray-200 transition-all duration-300 hover:border-[#0074B7] hover:shadow-lg"
    >
      <div className="p-5">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex-1">
            <Badge variant="outline" className="mb-2 text-xs">
              {facility.facilityType}
            </Badge>
            <h3 className="text-xl font-bold text-gray-900 transition-colors group-hover:text-[#0074B7]">
              {facility.facilityName}
            </h3>
          </div>
          <Badge className={(facility.stateValue === '정상운영' || facility.stateValue === '운영중') ? 'bg-green-500' : 'bg-gray-500'}>
            {facility.stateValue || '정보없음'}
          </Badge>
        </div>
        <div className="mb-4 space-y-2 text-sm">
          <div className="flex items-start gap-2 text-gray-700">
            <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-gray-400" />
            <div>
              {addressLine ? (
                <p>{addressLine}</p>
              ) : (
                <p className="text-gray-500">주소 정보 없음</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Phone className="h-4 w-4 text-gray-400" />
            <span>{facility.telNo ?? '-'}</span>
          </div>
          {facility.distance != null && (
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="h-4 w-4 text-gray-400" />
              <span>
                예상 소요: 도보 {Math.max(1, Math.round((facility.distance ?? 0) * 12))}분 · 차량 {Math.max(1, Math.round((facility.distance ?? 0) * 2))}분
              </span>
            </div>
          )}
          {facility.distance != null && (
            <div className="flex items-center gap-2 text-gray-700">
              <span className="text-xs text-gray-500">거리: {facility.distance?.toFixed(2)} km</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            className="flex-1 h-10 rounded-xl bg-[#0074B7] hover:bg-[#005a91]"
            onClick={() => onDirections({ facilityName: facility.facilityName, latitude: facility.latitude, longitude: facility.longitude })}
            title="카카오맵 길찾기 열기"
            disabled={facility.latitude == null || facility.longitude == null}
          >
            <Navigation className="mr-2 h-4 w-4" />
            길찾기
          </Button>
          {facility.telNo ? (
            <Button variant="outline" className="flex-1 h-10 rounded-xl border-2 bg-transparent" asChild>
              <a href={`tel:${facility.telNo}`} title="전화걸기">
                <Phone className="mr-2 h-4 w-4" />전화
              </a>
            </Button>
          ) : (
            <Button variant="outline" className="flex-1 h-10 rounded-xl border-2 bg-transparent" disabled>
              <Phone className="mr-2 h-4 w-4" />전화
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
});

FacilityCard.displayName = "FacilityCard";
