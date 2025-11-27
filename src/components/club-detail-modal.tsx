"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Calendar, Clock, User2, Phone, Home, Activity } from "lucide-react"

interface ClubDetailModalProps {
  isOpen: boolean
  onClose: () => void
  club: {
    CLUB_NM: string
    ITEM_NM: string
    ITEM_CL_NM: string
    CTPRVN_NM: string
    SIGNGU_NM: string
    SEXDSTN_FLAG_NM: string
    MBER_CO: number
    FOND_DE: string
    CLUB_DETAIL?: string
    RGSTR_NM?: string
    RGSTR_TELNO?: string
    CLUB_ADRES?: string
    CLUB_LOCPLC_NM?: string
    ACTV_DAY?: string
    ACTV_BEGIN_TM?: string
    ACTV_END_TM?: string
    CLUB_STATE?: string
  }
}

export function ClubDetailModal({ isOpen, onClose, club }: ClubDetailModalProps) {
  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr.length !== 8) return dateStr
    return `${dateStr.substring(0, 4)}.${dateStr.substring(4, 6)}.${dateStr.substring(6, 8)}`
  }

  const formatTime = (time?: string) => {
    if (!time) return ""
    if (time.length === 4) {
      return `${time.substring(0, 2)}:${time.substring(2, 4)}`
    }
    return time
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">{club.CLUB_NM}</DialogTitle>
          <div className="flex gap-2 mt-2">
            <Badge className="bg-[#0074B7] hover:bg-[#005a91]">{club.ITEM_NM}</Badge>
            <Badge variant="outline">{club.ITEM_CL_NM}</Badge>
            {club.CLUB_STATE && <Badge variant="outline">{club.CLUB_STATE}</Badge>}
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* 동호회 소개 */}
          {club.CLUB_DETAIL && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">동호회 소개</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{club.CLUB_DETAIL}</p>
            </div>
          )}

          {/* 기본 정보 */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <MapPin className="h-5 w-5 text-[#0074B7]" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">지역</p>
                <p className="text-sm font-medium text-gray-900">
                  {club.CTPRVN_NM} {club.SIGNGU_NM}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <Users className="h-5 w-5 text-[#0074B7]" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">회원수</p>
                <p className="text-sm font-medium text-gray-900">{club.MBER_CO}명</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <Calendar className="h-5 w-5 text-[#0074B7]" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">창립일</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(club.FOND_DE)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <Activity className="h-5 w-5 text-[#0074B7]" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">성별</p>
                <p className="text-sm font-medium text-gray-900">{club.SEXDSTN_FLAG_NM}</p>
              </div>
            </div>
          </div>

          {/* 활동 정보 */}
          {(club.ACTV_DAY || club.ACTV_BEGIN_TM || club.CLUB_LOCPLC_NM) && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">활동 정보</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {club.ACTV_DAY && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 mb-1">활동 요일</p>
                      <p className="text-sm font-medium text-gray-900">{club.ACTV_DAY}</p>
                    </div>
                  </div>
                )}

                {(club.ACTV_BEGIN_TM || club.ACTV_END_TM) && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 mb-1">활동 시간</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatTime(club.ACTV_BEGIN_TM)} ~ {formatTime(club.ACTV_END_TM)}
                      </p>
                    </div>
                  </div>
                )}

                {club.CLUB_LOCPLC_NM && (
                  <div className="flex items-start gap-3">
                    <Home className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 mb-1">활동 장소</p>
                      <p className="text-sm font-medium text-gray-900">{club.CLUB_LOCPLC_NM}</p>
                    </div>
                  </div>
                )}

                {club.CLUB_ADRES && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 mb-1">주소</p>
                      <p className="text-sm font-medium text-gray-900">{club.CLUB_ADRES}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 연락처 정보 */}
          {(club.RGSTR_NM || club.RGSTR_TELNO) && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">연락처</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {club.RGSTR_NM && (
                  <div className="flex items-start gap-3">
                    <User2 className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 mb-1">대표자</p>
                      <p className="text-sm font-medium text-gray-900">{club.RGSTR_NM}</p>
                    </div>
                  </div>
                )}

                {club.RGSTR_TELNO && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 mb-1">연락처</p>
                      <p className="text-sm font-medium text-gray-900">{club.RGSTR_TELNO}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
