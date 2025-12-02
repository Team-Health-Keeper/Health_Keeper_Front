import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Users, TrendingUp } from "lucide-react";
import { FC, memo } from "react";

export interface Club {
  id: number;
  clubName: string;
  sidoName: string;
  sigunguName: string;
  itemName: string;
  itemClassName: string;
  genderType: string;
  memberCount: number | string;
  foundedDate: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ClubCardProps {
  club: Club;
  formatFoundedDate: (val: string) => string;
  formatMemberCount: (val: number | string) => number | string;
}

export const ClubCard: FC<ClubCardProps> = memo(({ club, formatFoundedDate, formatMemberCount }) => {
  const locationName = club.sidoName === '세종특별자치시' ? club.sidoName : club.sigunguName;
  const parseFoundedDate = (dateStr: string) => {
    if (!dateStr) return null;
    // Try native parse first
    const direct = new Date(dateStr);
    if (!isNaN(direct.getTime())) return direct;
    // Normalize common formats: YYYY.MM.DD, YYYY/MM/DD, YYYY-MM-DD, YYYYMMDD
    const digits = (dateStr.match(/\d/g) || []).join("");
    if (digits.length >= 4) {
      const y = Number(digits.slice(0, 4));
      const m = digits.length >= 6 ? Number(digits.slice(4, 6)) : 1;
      const d = digits.length >= 8 ? Number(digits.slice(6, 8)) : 1;
      const dt = new Date(y, Math.max(0, m - 1), Math.max(1, d));
      if (!isNaN(dt.getTime())) return dt;
    }
    return null;
  };
  const yearsOfOperation = (dateStr: string) => {
    const founded = parseFoundedDate(dateStr);
    if (!founded) return "-";
    const today = new Date();
    let years = today.getFullYear() - founded.getFullYear();
    const beforeAnniversary =
      today.getMonth() < founded.getMonth() ||
      (today.getMonth() === founded.getMonth() && today.getDate() < founded.getDate());
    if (beforeAnniversary) years -= 1;
    return years < 0 ? "-" : `${years}년차`;
  };
  const naverSearchUrl = (q: string) => `https://search.naver.com/search.naver?query=${encodeURIComponent(q)}`
  const openSearch = () => {
    const query = `${club.clubName} ${club.itemName} 동호회`
    if (typeof window !== 'undefined') {
      window.open(naverSearchUrl(query), '_blank', 'noopener,noreferrer')
    }
  }
  return (
    <Card
      className="group overflow-hidden rounded-2xl border-2 transition-all hover:border-[#0074B7] hover:shadow-xl py-0 cursor-pointer"
      onClick={openSearch}
    >
      <CardHeader className="px-6 pt-6">
        <div className="mb-2 flex items-center gap-2">
          <Badge className="bg-[#0074B7] hover:bg-[#005a91]">{club.itemName}</Badge>
        </div>
        <CardTitle className="text-xl font-bold text-gray-900">{club.clubName}</CardTitle>
      </CardHeader>
      <CardContent className="px-6 space-y-3 pb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4 text-gray-400" aria-hidden="true" />
          {locationName}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4 text-gray-400" aria-hidden="true" />
          설립일자: {formatFoundedDate(club.foundedDate)}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <TrendingUp className="h-4 w-4 text-gray-400" aria-hidden="true" />
          운영 연차: {yearsOfOperation(club.foundedDate)}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="h-4 w-4 text-gray-400" aria-hidden="true" />
          회원: {formatMemberCount(club.memberCount)}명
        </div>
        <div className="pt-3 space-y-2 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400" aria-hidden="true" />
            성별 구분: {club.genderType}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400" aria-hidden="true" />
            지역: {locationName}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ClubCard.displayName = "ClubCard";
