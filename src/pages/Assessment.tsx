"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Activity, Video, BookOpen } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Link, useNavigate } from "react-router-dom"
import { YoutubeModal } from "@/components/youtube-modal"
import { MeasurementGuideModal, guideKeyForMeasurement, hasGuideForMeasurement } from "@/components/measurement-guide-modal"
import { SiteHeader } from "@/components/site-header"
import { HeroSection } from "@/components/common/HeroSection"
import { BasicInfoForm } from "@/components/assessment/BasicInfoForm"
import { MeasurementGrid } from "@/components/assessment/MeasurementGrid"
import { AnalyzeOverlay } from "@/components/assessment/AnalyzeOverlay"
import { getApiBase, apiFetch } from "@/lib/utils"

interface MeasurementCode {
  id: number
  measurement_code_name: string
  guide_video: string | null
}

function extractYouTubeId(input: string): string {
  try {
    const url = new URL(input);
    const id = url.pathname.split("/embed/")[1];
    if (id) return id;
  } catch (_) {}
  return input;
}

const ageGroupMeasurements = {
  유아기: {
    "7": "악력_좌(kg)",
    "8": "악력_우(kg)",
    "9": "윗몸말아올리기(회)",
    "12": "앉아윗몸앞으로굽히기(cm)",
    "18": "BMI(kg/㎡)",
    "20": "왕복오래달리기(회)",
    "22": "제자리 멀리뛰기(cm)",
    "28": "상대악력(%)",
    "50": "5m 4회 왕복달리기(초)",
    "51": "3×3 버튼누르기(초)",
  },
  유소년: {
    "4": "허리둘레(cm)",
    "7": "악력_좌(kg)",
    "8": "악력_우(kg)",
    "9": "윗몸말아올리기(회)",
    "12": "앉아윗몸앞으로굽히기(cm)",
    "18": "BMI(kg/㎡)",
    "20": "왕복오래달리기(회)",
    "22": "제자리 멀리뛰기(cm)",
    "28": "상대악력(%)",
    "42": "허리둘레-신장비(WHtR)",
    "43": "반복옆뛰기(회)",
    "44": "눈-손 협응력(벽패스)(초)",
  },
  청소년: {
    "3": "체지방율(%)",
    "5": "이완기혈압_최저(mmHg)",
    "6": "수축기혈압_최고(mmHg)",
    "7": "악력_좌(kg)",
    "8": "악력_우(kg)",
    "9": "윗몸말아올리기(회)",
    "12": "앉아윗몸앞으로굽히기(cm)",
    "13": "일리노이(초)",
    "14": "체공시간(초)",
    "15": "협응력시간(초)",
    "16": "협응력실수횟수(회)",
    "17": "협응력계산결과값(초)",
    "18": "BMI(kg/㎡)",
    "20": "왕복오래달리기(회)",
    "22": "제자리 멀리뛰기(cm)",
    "28": "상대악력(%)",
    "30": "왕복오래달리기출력(VO₂max)",
  },
  성인: {
    "3": "체지방율(%)",
    "4": "허리둘레(cm)",
    "5": "이완기혈압_최저(mmHg)",
    "6": "수축기혈압_최고(mmHg)",
    "7": "악력_좌(kg)",
    "8": "악력_우(kg)",
    "12": "앉아윗몸앞으로굽히기(cm)",
    "18": "BMI(kg/㎡)",
    "19": "교차윗몸일으키기(회)",
    "22": "제자리 멀리뛰기(cm)",
    "28": "상대악력(%)",
    "36": "스텝검사_회복시 심박수(bpm)",
    "37": "스텝검사_출력(VO₂max)",
    "40": "반응시간(초)",
  },
  어르신: {
    "3": "체지방률(%)",
    "4": "허리둘레(cm)",
    "5": "이완기최저혈압(mmHg)",
    "6": "수축기최고혈압(mmHg)",
    "7": "악력_좌(kg)",
    "8": "악력_우(kg)",
    "12": "앉아윗몸앞으로굽히기(cm)",
    "18": "BMI(kg/㎡)",
    "23": "의자에앉았다일어서기(회)",
    "25": "2분제자리걷기(회)",
    "26": "의자에앉아 3M표적 돌아오기(초)",
    "27": "8자보행(초)",
    "28": "상대악력(%)",
    "52": "절대악력(kg)",
  },
}

export default function AssessmentPage() {
  // 검증 복구: 필수값 모두 채워져야 분석 시작 가능
  const TEMP_SKIP_VALIDATION = false
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  const [measurementCodes, setMeasurementCodes] = useState<MeasurementCode[]>([])
  const fetchOnceRef = useRef(false)

  const navigate = useNavigate()
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null)
  const [guideKey, setGuideKey] = useState<string | null>(null)
  const [age, setAge] = useState("")
  const [ageMonths, setAgeMonths] = useState("")
  const [gender, setGender] = useState("")
  const [height, setHeight] = useState("")
  const [weight, setWeight] = useState("")

  const [ageGroup, setAgeGroup] = useState<string>("")
  const [showMeasurements, setShowMeasurements] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [ageWarning, setAgeWarning] = useState<string | null>(null)

  const [measurementValues, setMeasurementValues] = useState<Record<string, string>>({})
  const [measurementErrors, setMeasurementErrors] = useState<Record<string, string | null>>({})
  const [basicErrors, setBasicErrors] = useState<Partial<Record<"ageMonths"|"height"|"weight"|"waist", string | null>>>({})
  
  // 그룹별 측정 항목 유효성 검사 규칙
  type GroupName = '유아기' | '유소년' | '청소년' | '성인' | '어르신'
  const GROUP_MEAS_RULES: Record<GroupName, Record<string, { min: number; max: number }>> = {
    유아기: {
      "7": { min: 0, max: 30 },
      "8": { min: 0, max: 30 },
      "9": { min: 0, max: 100 },
      "12": { min: -30, max: 60 },
      "20": { min: 0, max: 100 },
      "22": { min: 10, max: 300 },
      "50": { min: 2, max: 120 },
      "51": { min: 1, max: 180 }
    },
    유소년: {
      "4": { min: 40, max: 100 },
      "7": { min: 0, max: 60 },
      "8": { min: 0, max: 60 },
      "9": { min: 0, max: 200 },
      "12": { min: -30, max: 80 },
      "20": { min: 0, max: 150 },
      "22": { min: 30, max: 350 },
      "43": { min: 0, max: 200 },
      "44": { min: 1, max: 300 }
    },
    청소년: {
      "3": { min: 3, max: 60 },
      "5": { min: 40, max: 130 },
      "6": { min: 70, max: 220 },
      "7": { min: 0, max: 80 },
      "8": { min: 0, max: 80 },
      "9": { min: 0, max: 200 },
      "10": { min: 0, max: 300 },
      "12": { min: -30, max: 80 },
      "13": { min: 5, max: 60 },
      "14": { min: 0, max: 5 },
      "15": { min: 1, max: 600 },
      "16": { min: 0, max: 200 },
      "17": { min: 1, max: 600 },
      "20": { min: 0, max: 200 },
      "22": { min: 50, max: 400 }
    },
    성인: {
      "3": { min: 3, max: 60 },
      "4": { min: 40, max: 100 },
      "5": { min: 40, max: 130 },
      "6": { min: 70, max: 220 },
      "7": { min: 0, max: 90 },
      "8": { min: 0, max: 90 },
      "9": { min: 0, max: 200 },
      "12": { min: -30, max: 80 },
      "19": { min: 0, max: 200 },
      "22": { min: 50, max: 450 },
      "36": { min: 40, max: 220 },
      "37": { min: 5, max: 90 },
      "40": { min: 0.1, max: 3 }
    },
    어르신: {
      "3": { min: 3, max: 60 },
      "4": { min: 40, max: 100 },
      "5": { min: 40, max: 130 },
      "6": { min: 70, max: 220 },
      "7": { min: 0, max: 70 },
      "8": { min: 0, max: 70 },
      "12": { min: -30, max: 80 },
      "23": { min: 0, max: 100 },
      "25": { min: 0, max: 400 },
      "26": { min: 1, max: 120 },
      "27": { min: 1, max: 300 }
    }
  }

  // 그룹별 기본 정보 허용 범위
  const BASIC_RULES: Partial<Record<GroupName, { height: [number, number]; weight: [number, number]; waist?: [number, number]; age?: [number, number] }>> = {
    유아기: { height: [90, 130], weight: [10, 35], age: [4, 6] },
    유소년: { height: [110, 170], weight: [18, 70], waist: [40, 100], age: [7, 12] },
    청소년: { height: [140, 200], weight: [35, 120], age: [13, 18] },
    성인:   { height: [140, 210], weight: [35, 200], waist: [40, 100], age: [19, 64] },
    어르신: { height: [130, 200], weight: [35, 150], waist: [40, 100], age: [65, 120] },
  }

  const validateBasicForGroup = (group: string, next?: { height?: string; weight?: string; ageMonths?: string; waist?: string }) => {
    const rules = BASIC_RULES[group as GroupName]
    const errs: Partial<Record<"ageMonths"|"height"|"weight"|"waist"|"age", string | null>> = {}
    const h = Number.parseFloat(next?.height ?? height)
    const w = Number.parseFloat(next?.weight ?? weight)
    const wa = Number.parseFloat(next?.waist ?? measurementValues["4"] ?? "")
    const a = Number.parseInt(age)
    // 글로벌 나이 sanity check (4~120세만 허용)
    if (!Number.isNaN(a) && (a < 4 || a > 120)) {
      errs.age = "나이는 4~120세 사이만 입력 가능합니다"
      setBasicErrors(errs)
      return
    }
    if (rules) {
      if (Number.isFinite(h)) {
        const [minH, maxH] = rules.height
        errs.height = (h < minH || h > maxH) ? `신장은 보통 ${minH}–${maxH}cm 범위입니다` : null
      }
      if (Number.isFinite(w)) {
        const [minW, maxW] = rules.weight
        errs.weight = (w < minW || w > maxW) ? `체중은 보통 ${minW}–${maxW}kg 범위입니다` : null
      }
      if (Number.isFinite(wa) && rules.waist) {
        const [minWa, maxWa] = rules.waist
        errs.waist = (wa < minWa || wa > maxWa) ? `허리둘레는 보통 ${minWa}–${maxWa}cm 범위입니다` : null
      } else {
        errs.waist = null
      }
      if (Number.isFinite(a) && rules.age) {
        const [minA, maxA] = rules.age
        errs.age = (a < minA || a > maxA) ? `나이는 ${minA}–${maxA}세만 입력 가능합니다` : null
      } else {
        errs.age = null
      }
    }
    // 개월 수 검증(유아기에서만 사용)
    const m = Number.parseInt(next?.ageMonths ?? ageMonths)
    errs.ageMonths = (group === '유아기' && !Number.isNaN(m) && (m < 0 || m > 90)) ? "개월 수는 0–90 사이여야 합니다" : null
    setBasicErrors(errs)
  }

  // 분석 단계 전환 시 페이드 애니메이션을 위한 상태
  const [displayedStageIndex, setDisplayedStageIndex] = useState(0)
  const [isStageFading, setIsStageFading] = useState(false)
  const [transitionDir, setTransitionDir] = useState<'down' | 'up'>('down')
  const FADE_MS = 500
  // 총 분석 시간: 8초 (기존 10초에서 단축)
  const ANALYZE_MS = 8000
  // 단계별 가시 시간: (총시간 - 페이드합) / 3 = (8000 - 2000)/3 = 2000ms
  const VISIBLE_MS = Math.max(0, (ANALYZE_MS - 4 * FADE_MS) / 3)
  const elapsedMs = (progress / 100) * ANALYZE_MS
  const t1 = VISIBLE_MS
  const t2 = 2 * VISIBLE_MS + 2 * FADE_MS
  const computedStageIndex = elapsedMs < t1 ? 0 : elapsedMs < t2 ? 1 : 2
  const [ellipsisCount, setEllipsisCount] = useState(0)

  // 진행도에 따라 페이드로 오버레이 단계 전환
  useEffect(() => {
    if (!analyzing) return
    if (computedStageIndex === displayedStageIndex) return
    setIsStageFading(true)
    setTransitionDir(computedStageIndex > displayedStageIndex ? 'down' : 'up')
    const to = setTimeout(() => {
      setDisplayedStageIndex(computedStageIndex)
      setIsStageFading(false)
    }, FADE_MS)
    return () => clearTimeout(to)
  }, [computedStageIndex, analyzing, displayedStageIndex])

  useEffect(() => {
    // 백엔드에서 측정 코드 목록 불러오기(이름 오름차순)
    if (fetchOnceRef.current) return
    fetchOnceRef.current = true
    const token = typeof window !== "undefined" ? sessionStorage.getItem("authToken") : null
    apiFetch<{ success?: boolean; data?: MeasurementCode[] } | MeasurementCode[]>(`/api/measurement/measurement-codes`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((payload) => {
        const list = Array.isArray(payload) ? payload : Array.isArray((payload as any)?.data) ? (payload as any).data! : []
        setMeasurementCodes(list)
      })
      .catch((err) => {
        console.error("Failed to fetch measurement codes:", err)
      })
  }, [])

  useEffect(() => {
    if (!analyzing) {
      setEllipsisCount(0)
      return
    }

    setEllipsisCount(0)
    const iv = setInterval(() => {
      setEllipsisCount((c) => (c + 1) % 4)
    }, 350)
    return () => clearInterval(iv)
  }, [analyzing, displayedStageIndex])

  useEffect(() => {
    if (!age) {
      setAgeGroup("")
      setAgeWarning(null)
      return
    }

    const ageNum = Number.parseInt(age)
    if (ageNum >= 1 && ageNum <= 3) {
      setAgeGroup("")
      setAgeWarning("만 1–3세는 해당 나이의 데이터가 없어 측정이 불가합니다.")
    } else if (ageNum >= 4 && ageNum <= 6) {
      setAgeGroup("유아기")
      setAgeWarning(null)
    } else if (ageNum >= 7 && ageNum <= 12) {
      setAgeGroup("유소년")
      setAgeWarning(null)
    } else if (ageNum >= 13 && ageNum <= 18) {
      setAgeGroup("청소년")
      setAgeWarning(null)
    } else if (ageNum >= 19 && ageNum <= 64) {
      setAgeGroup("성인")
      setAgeWarning(null)
    } else if (ageNum >= 65) {
      setAgeGroup("어르신")
      setAgeWarning(null)
    } else {
      setAgeGroup("")
      setAgeWarning(null)
    }
  }, [age])
  
  // 유아기가 아니면 개월 수 초기화
  useEffect(() => {
    if (ageGroup !== '유아기') {
      setAgeMonths("")
    }
  }, [ageGroup])

  // 허리둘레(cm)와 신장(cm)으로 WHtR(id "42") 자동 계산
  useEffect(() => {
    const h = Number.parseFloat(height)
    const wa = Number.parseFloat(measurementValues["4"] || "")
    setMeasurementValues((prev) => {
      const next = { ...prev }
      if (h > 0 && wa > 0) {
        next["42"] = (wa / h).toFixed(3)
      } else {
        if (Object.prototype.hasOwnProperty.call(next, "42")) {
          delete next["42"]
        }
      }
      return next
    })
  }, [height, measurementValues["4"]])

  // 신장/체중으로 BMI(id "18") 자동 계산해서 measurementValues에 채움
  useEffect(() => {
    const h = Number.parseFloat(height)
    const w = Number.parseFloat(weight)
    setMeasurementValues((prev) => {
      const next = { ...prev }
      if (h > 0 && w > 0) {
        const bmi = (w / Math.pow(h / 100, 2))
        const formatted = Number.isFinite(bmi) ? bmi.toFixed(1) : ""
        if (next["18"] !== formatted) next["18"] = formatted
      } else {
        if (Object.prototype.hasOwnProperty.call(next, "18")) delete next["18"]
      }
      return next
    })
  }, [height, weight])

  // 좌/우 악력(7/8)에서 절대악력(kg, id "52") 자동 계산
  // 좌/우 중 큰 값을 사용
  useEffect(() => {
    const left = Number.parseFloat(measurementValues["7"] || "")
    const right = Number.parseFloat(measurementValues["8"] || "")
    const hasLeft = !Number.isNaN(left) && left > 0
    const hasRight = !Number.isNaN(right) && right > 0
    setMeasurementValues((prev) => {
      const next = { ...prev }
      if (hasLeft || hasRight) {
        const absGrip = Math.max(hasLeft ? left : 0, hasRight ? right : 0)
        const formatted = absGrip.toFixed(1)
        if (next["52"] !== formatted) next["52"] = formatted
      } else {
        if (Object.prototype.hasOwnProperty.call(next, "52")) {
          delete next["52"]
        }
      }
      return next
    })
  }, [measurementValues["7"], measurementValues["8"]])

  // 상대악력(%, id "28") = 절대악력(kg, id "52") / 체중(kg) * 100 자동 계산
  useEffect(() => {
    const absGrip = Number.parseFloat(measurementValues["52"] || "")
    const w = Number.parseFloat(weight)
    setMeasurementValues((prev) => {
      const next = { ...prev }
      if (absGrip > 0 && w > 0) {
        next["28"] = ((absGrip / w) * 100).toFixed(1)
      } else {
        // 계산 불가능할 때 사용자가 입력한 28 값을 강제로 제거하지 않음 — 이전에 우리가 설정한 경우에만 제거
        // 입력이 유효하지 않으면 보수적으로 제거함
        if (Object.prototype.hasOwnProperty.call(next, "28")) {
          delete next["28"]
        }
      }
      return next
    })
  }, [measurementValues["52"], weight])

  // 왕복오래달리기 출력(VO₂max, id "30")를 왕복횟수(id "20")와 나이로 자동 계산
  // 접근: 총 왕복 횟수를 최종 달리기 속도(km/h)로 근사 변환
  // 표준 20m 왕복달리기 프로그레션을 사용 (레벨1은 8.0 km/h부터 시작, 레벨당 +0.5 km/h)
  // 레벨1은 7회, 이후 레벨은 일반적으로 8회씩 진행하므로 총 횟수를
  // 각 레벨 내의 분수 위치로 변환하여 속도를 보간한 뒤 Léger 공식을 적용합니다:
  // VO2 = 5.857 * v - 19.458  (v는 km/h)
  const shuttleCountToSpeed = (count: number) => {
    if (!Number.isFinite(count) || count <= 0) return 0
    // 레벨1은 7회, 이후 레벨은 8회
    let remaining = count
    let level = 1
    const firstLevelShuttles = 7
    if (remaining <= firstLevelShuttles) {
      const pos = remaining // 1..7
      const frac = (pos - 1) / firstLevelShuttles
      return 8.0 + frac * 0.5
    }
    remaining -= firstLevelShuttles
    level = 2
    const perLevel = 8
    while (remaining > perLevel) {
      remaining -= perLevel
      level += 1
      // 무한 루프를 방지하기 위한 안전 상한
      if (level > 50) break
    }
    const posInLevel = Math.max(1, remaining) // 1..8
    const baseSpeed = 8.0 + (level - 1) * 0.5
    const frac = (posInLevel - 1) / perLevel
    return baseSpeed + frac * 0.5
  }

  useEffect(() => {
    const count = Number.parseInt(measurementValues["20"] || "")
    const ageNum = Number.parseInt(age)
    const v = shuttleCountToSpeed(Number.isNaN(count) ? 0 : count)
    setMeasurementValues((prev) => {
      const next = { ...prev }
      if (v > 0) {
        const vo2 = 5.857 * v - 19.458
        next["30"] = Number.isFinite(vo2) ? vo2.toFixed(1) : ""
      } else {
        if (Object.prototype.hasOwnProperty.call(next, "30")) delete next["30"]
      }
      return next
    })
  }, [measurementValues["20"], age])

  useEffect(() => {
    // 기본 정보는 이제 허리둘레 제외 (허리둘레는 측정 항목으로 이동)
    const isBasicInfoComplete = !!(age && gender && height && weight)
    setShowMeasurements(isBasicInfoComplete)

    if (!isBasicInfoComplete) {
      setMeasurementValues({})
    }
    // 기본 정보 변경 시 그룹 검증을 다시 실행
    validateBasicForGroup(ageGroup)
  }, [age, gender, height, weight, ageGroup])

  const currentMeasurements = ageGroup ? ageGroupMeasurements[ageGroup as keyof typeof ageGroupMeasurements] : {}
  // 모든 측정 항목(기본 정보 1/2/18 제외)은 필수로 처리
  const requiredIdsForGroup = Object.keys(currentMeasurements)
    .filter((id) => !["1", "2", "18"].includes(id))
  const allRequiredFilled = requiredIdsForGroup.every((id) => {
    const v = measurementValues[id]
    return typeof v === "string" && v.trim() !== ""
  })

  const updateMeasurementValue = (id: string, value: string) => {
    // 먼저 값을 저장
    setMeasurementValues((prev) => ({ ...prev, [id]: value }))
    // 그룹별 유효성 검사
    const v = Number.parseFloat(value)
    if (value === "" || Number.isNaN(v)) {
      setMeasurementErrors((prev) => ({ ...prev, [id]: null }))
    } else {
      const groupRules = GROUP_MEAS_RULES[ageGroup as GroupName] || {}
      if (groupRules[id]) {
        const rule = groupRules[id] as any
        const min = rule.min as number
        const max = rule.max as number
        const note = rule.note as string | undefined
        const ok = v >= min && v <= max
        setMeasurementErrors((prev) => ({ ...prev, [id]: ok ? null : (note || `값의 허용 범위는 ${min}–${max} 입니다`) }))
      } else {
        setMeasurementErrors((prev) => ({ ...prev, [id]: null }))
      }
    }
  }

  // 라벨에서 "*필수" 텍스트를 제거하여 모달 제목에 사용
  const cleanLabel = (label: string) => label.replace(/\s*\*필수\s*$/, "")

  const handleAnalyzeStart = () => {
    const hasAnyErrors = Object.values(measurementErrors).some((m) => !!m) || Object.values(basicErrors).some((b) => !!b)
    if (!TEMP_SKIP_VALIDATION) {
      const needsMonths = ageGroup === '유아기'
      const monthsNum = Number.parseInt(ageMonths)
      const monthsValid = !needsMonths || (!Number.isNaN(monthsNum) && monthsNum >= 0 && monthsNum <= 90)
      if (!showMeasurements || analyzing || ageWarning || !allRequiredFilled || !monthsValid || hasAnyErrors) {
        if (needsMonths && !monthsValid) {
          alert('유아기(만 4–6세)는 개월 수(0–90)를 함께 입력해주세요.')
        }
        if (hasAnyErrors) {
          alert('값이 너무 비현실적인 항목이 있어요. 표시된 오류를 먼저 수정해주세요.')
        }
        return
      }
    } else {
      if (analyzing) return
    }
    const submitAndStart = async () => {
      setSubmitting(true)
      try {
        const token = typeof window !== "undefined" ? sessionStorage.getItem("authToken") : null
        // req_arr 구성: { measure_key: number, measure_value: number | string }
        const req_arr: { measure_key: number; measure_value: number | string }[] = Object.entries(measurementValues)
          .filter(([k, v]) => v !== undefined && v !== null && String(v).trim() !== "")
          .map(([k, v]) => ({
            measure_key: Number(k),
            measure_value: Number(v),
          }))

        if (height) {
          const h = Number.parseFloat(height)
          if (!Number.isNaN(h)) req_arr.push({ measure_key: 1, measure_value: h })
        }
        if (weight) {
          const w = Number.parseFloat(weight)
          if (!Number.isNaN(w)) req_arr.push({ measure_key: 2, measure_value: w })
        }
        // BMI는 MeasurementGrid에서 수집되므로 여기에 별도 추가하지 않음

        const ageNum = Number.parseInt(age)
        if (!Number.isNaN(ageNum)) {
          req_arr.push({ measure_key: 53, measure_value: ageNum })
        }
        if (ageGroup === '유아기') {
          const monthsNum = Number.parseInt(ageMonths)
          if (!Number.isNaN(monthsNum)) {
            req_arr.push({ measure_key: 55, measure_value: monthsNum })
          }
        }
        if (gender) {
          // 성별은 문자열로 전송 (예: 'M' 또는 'F')
          req_arr.push({ measure_key: 54, measure_value: String(gender).trim() })
        }

        // POST 응답을 기다리는 동안 분석/로딩 화면 시작
        setProgress(0)
        setAnalyzing(true)

        let parsed: any = null
        try {
          parsed = await apiFetch<any>(`/api/measurement`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ req_arr }),
          })
        } catch (e: any) {
          console.error("Measurement POST failed:", e)
          alert(`측정값 전송에 실패했습니다. 서버 응답: ${e?.body?.message || e.message || e.status || '오류'}`)
          setAnalyzing(false)
          setProgress(0)
          setSubmitting(false)
          return
        }

        // 성공 시 결과 데이터를 세션 스토리지에 저장하여 Results 페이지에서 활용
        try {
          if (parsed) {
            sessionStorage.setItem("analysisResult", JSON.stringify(parsed))
          }
        } catch (e) {
          console.warn("Failed to persist analysisResult to sessionStorage", e)
        }

        setSubmitting(false)
      } catch (err) {
        console.error("Failed to submit measurements:", err)
        alert("측정값 전송 중 오류가 발생했습니다. 네트워크를 확인해주세요.")
        setSubmitting(false)
        return
      }
    }

    submitAndStart()
  }

  useEffect(() => {
    if (!analyzing) return
    const duration = ANALYZE_MS
    const start = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.min(100, Math.round((elapsed / duration) * 100))
      setProgress(pct)
      if (pct >= 100) {
        clearInterval(timer)
        navigate("/results")
      }
    }, 30)
    return () => clearInterval(timer)
  }, [analyzing, navigate])

  // 분석 중에는 별도의 전체 화면으로 전환
  if (analyzing) {
    const stages = [
      "AI가 측정 값을 읽고 있어요",
      "AI가 입력된 값을 바탕으로 운동 처방 레시피를 만들고 있어요",
      "AI가 맞춤 결과 화면을 준비하고 있어요",
    ]
    return (
      <AnalyzeOverlay
        progress={progress}
        stages={stages}
        displayedStageIndex={displayedStageIndex}
        isStageFading={isStageFading}
        transitionDir={transitionDir}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <SiteHeader />

      <HeroSection
        badgeIcon={Activity}
        badgeText="체력 측정"
        title="체력 측정"
        highlight="항목 입력"
        description="아래 항목들을 입력하면 AI가 체력 등급을 분석합니다"
        centered
        className="py-12"
      />

      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="mx-auto max-w-3xl">

          <BasicInfoForm
            age={age}
            ageMonths={ageMonths}
            gender={gender}
            height={height}
            weight={weight}
            ageGroup={ageGroup}
            ageWarning={ageWarning}
            showAgeMonths={ageGroup === '유아기'}
            errors={basicErrors}
            onChange={(field, value) => {
              if (field === 'age') setAge(value)
              else if (field === 'ageMonths') { setAgeMonths(value); validateBasicForGroup(ageGroup, { ageMonths: value }) }
              else if (field === 'gender') setGender(value)
              else if (field === 'height') { setHeight(value); validateBasicForGroup(ageGroup, { height: value }) }
              else if (field === 'weight') { setWeight(value); validateBasicForGroup(ageGroup, { weight: value }) }
            }}
            onOpenWaistGuide={() => setGuideKey('waist')}
          />


          {showMeasurements && ageGroup && Object.keys(currentMeasurements).length > 0 && (
            <MeasurementGrid
              measurementCodes={measurementCodes}
              measurements={measurementValues}
              currentMeasurements={currentMeasurements as any}
              // 모든 측정 항목을 필수로 간주
              autoValues={{
                "42": (() => {
                  const h = Number.parseFloat(height)
                  const wa = Number.parseFloat(measurementValues["4"] || "")
                  return h > 0 && wa > 0 ? (wa / h).toFixed(3) : ""
                })(),
                "18": (() => {
                  const h = Number.parseFloat(height)
                  const w = Number.parseFloat(weight)
                  if (h > 0 && w > 0) {
                    const bmi = w / Math.pow(h / 100, 2)
                    return Number.isFinite(bmi) ? bmi.toFixed(1) : ""
                  }
                  return ""
                })(),
                "28": (() => {
                  const absGrip = Number.parseFloat(measurementValues["52"] || "")
                  const w = Number.parseFloat(weight)
                  return absGrip > 0 && w > 0 ? ((absGrip / w) * 100).toFixed(1) : ""
                })(),
                "30": (() => {
                  // 왕복오래달리기 출력(VO₂max)
                  const count = Number.parseInt(measurementValues["20"] || "")
                  // shuttleCountToSpeed logic
                  let v = 0
                  if (Number.isFinite(count) && count > 0) {
                    let remaining = count
                    let level = 1
                    const firstLevelShuttles = 7
                    if (remaining <= firstLevelShuttles) {
                      const pos = remaining // 1..7
                      const frac = (pos - 1) / firstLevelShuttles
                      v = 8.0 + frac * 0.5
                    } else {
                      remaining -= firstLevelShuttles
                      level = 2
                      const perLevel = 8
                      while (remaining > perLevel) {
                        remaining -= perLevel
                        level += 1
                        if (level > 50) break
                      }
                      const posInLevel = Math.max(1, remaining) // 1..8
                      const baseSpeed = 8.0 + (level - 1) * 0.5
                      const frac = (posInLevel - 1) / perLevel
                      v = baseSpeed + frac * 0.5
                    }
                  }
                  if (v > 0) {
                    const vo2 = 5.857 * v - 19.458
                    return Number.isFinite(vo2) ? vo2.toFixed(1) : ""
                  }
                  return ""
                })(),
                "52": (() => {
                  const left = Number.parseFloat(measurementValues["7"] || "")
                  const right = Number.parseFloat(measurementValues["8"] || "")
                  const hasLeft = !Number.isNaN(left) && left > 0
                  const hasRight = !Number.isNaN(right) && right > 0
                  if (hasLeft || hasRight) {
                    const maxVal = Math.max(hasLeft ? left : -Infinity, hasRight ? right : -Infinity)
                    if (Number.isFinite(maxVal) && maxVal > 0) return maxVal.toFixed(1)
                  }
                  return ""
                })(),
              }}
              allRequiredFilled={allRequiredFilled}
              errors={measurementErrors}
              onChange={(id, value) => updateMeasurementValue(id, value)}
              onOpenTextGuide={(id) => setGuideKey(guideKeyForMeasurement(id))}
              onOpenVideoGuide={(label, vid) => { setSelectedTitle(label); setSelectedVideo(vid) }}
              extractYouTubeId={extractYouTubeId}
              hasTextGuide={(id) => !!hasGuideForMeasurement(id)}
            />
          )}

          {!showMeasurements && (
            <Card className="mt-6">
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">기본 정보를 모두 입력하면 측정 항목이 표시됩니다.</p>
              </CardContent>
            </Card>
          )}

          <div className="mt-6 flex justify-end gap-4">
            <Button variant="outline" asChild>
              <Link to="/">취소</Link>
            </Button>
            <Button
              size="lg"
              onClick={handleAnalyzeStart}
              disabled={
                submitting || (
                  TEMP_SKIP_VALIDATION
                    ? analyzing
                    : (
                        !showMeasurements ||
                        analyzing ||
                        !!ageWarning ||
                        !allRequiredFilled ||
                        (ageGroup === '유아기' && (Number.isNaN(Number.parseInt(ageMonths)) || Number.parseInt(ageMonths) < 0 || Number.parseInt(ageMonths) > 90)) ||
                        Object.values(measurementErrors).some(Boolean) ||
                        Object.values(basicErrors).some(Boolean)
                      )
                )
              }
            >
            <Activity className="mr-2 h-5 w-5" />
              {analyzing ? "분석 중..." : "AI 분석 시작"}
            </Button>
          </div>
        </div>
      </div>

      {selectedVideo && (
        <YoutubeModal
          title={selectedTitle || undefined}
          videoId={selectedVideo}
          isOpen={!!selectedVideo}
          onClose={() => {
            setSelectedVideo(null)
            setSelectedTitle(null)
          }}
        />
      )}

      {guideKey && (
        <MeasurementGuideModal isOpen={!!guideKey} onClose={() => setGuideKey(null)} guideKey={guideKey} />
      )}
    </div>
  )
}