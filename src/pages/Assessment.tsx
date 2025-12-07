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

// Extract YouTube video ID from a full URL or return the given ID
function extractYouTubeId(input: string): string {
  try {
    // If input looks like a bare ID, return as-is
    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input
    const url = new URL(input)
    // Handle youtu.be short links
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.replace("/", "")
      if (id) return id
    }
    // Handle youtube watch URLs
    if (url.searchParams.has("v")) {
      const id = url.searchParams.get("v") || ""
      if (id) return id
    }
    // Handle embed URLs
    if (url.pathname.includes("/embed/")) {
      const id = url.pathname.split("/embed/")[1]
      if (id) return id
    }
  } catch (_) {
    // Not a URL, fall through
  }
  return input
}

const ageGroupMeasurements = {
  유아기: {
    "7": "악력_좌(kg)",
    "8": "악력_우(kg)",
    "9": "윗몸말아올리기(회)",
    "12": "앉아윗몸앞으로굽히기(cm)",
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
    "20": "왕복오래달리기(회)",
    "22": "제자리 멀리뛰기(cm)",
    "28": "상대악력(%)",
    "42": "허리둘레-신장비(WHtR)",
  },
  청소년: {
    "3": "체지방율(%)",
    "4": "허리둘레(cm)",
    "5": "이완기혈압_최저(mmHg)",
    "6": "수축기혈압_최고(mmHg)",
    "7": "악력_좌(kg)",
    "8": "악력_우(kg)",
    "9": "윗몸말아올리기(회)",
    "10": "반복점프(회)",
    "12": "앉아윗몸앞으로굽히기(cm)",
    "13": "일리노이(초)",
    "14": "체공시간(초)",
    "15": "협응력시간(초)",
    "16": "협응력실수횟수(회)",
    "17": "협응력계산결과값(초)",
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
    "23": "의자에앉았다일어서기(회)",
    "25": "2분제자리걷기(회)",
    "26": "의자에앉아 3M표적 돌아오기(초)",
    "27": "8자보행(초)",
    "28": "상대악력(%)",
    "52": "절대악력(kg)",
  },
}

const requiredMeasurementIds = [
  "7",
  "4",
  "8",
  "28",
  "50",
  "51",
  "52", 
  "9",
  "12",
  "19",
  "23",
  "10",
  "14",
  "21",
  "22",
  "40",
  "41",
  "20",
  "24",
  "25",
  "15",
  "16",
  "17",
  "26",
  "27",
]

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
  const [bmi, setBmi] = useState("")

  const [ageGroup, setAgeGroup] = useState<string>("")
  const [showMeasurements, setShowMeasurements] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [ageWarning, setAgeWarning] = useState<string | null>(null)

  const [measurementValues, setMeasurementValues] = useState<Record<string, string>>({})
  const [measurementErrors, setMeasurementErrors] = useState<Record<string, string | null>>({})
  const [basicErrors, setBasicErrors] = useState<Partial<Record<"ageMonths"|"height"|"weight"|"waist", string | null>>>({})
  
  // Group-specific measurement validation rules
  type GroupName = '유아기' | '유소년' | '청소년' | '성인' | '어르신'
  const GROUP_MEAS_RULES: Partial<Record<GroupName, Record<string, { min: number; max: number; }>>> = {
    유아기: {
      "7": { min: 0, max: 30 },
      "8": { min: 0, max: 30 },
      "9": { min: 0, max: 100 },
      "12": { min: -30, max: 60 },
      "20": { min: 0, max: 100 },
      "22": { min: 10, max: 300 },
      "50": { min: 2, max: 120 },
      "51": { min: 1, max: 180 },
    },
    유소년: {
      "7": { min: 0, max: 60 },
      "8": { min: 0, max: 60 },
      "9": { min: 0, max: 200 },
      "12": { min: -30, max: 80 },
      "20": { min: 0, max: 150 },
      "22": { min: 30, max: 350 },
      "43": { min: 0, max: 200 },
      "44": { min: 1, max: 300 },
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
      "22": { min: 50, max: 400 },
      "30": { min: 5, max: 90 },
    },
    성인: {
      "3": { min: 3, max: 60 },
      "5": { min: 40, max: 130 },
      "6": { min: 70, max: 220 },
      "7": { min: 0, max: 90 },
      "9": { min: 0, max: 200 },
      "12": { min: -30, max: 80 },
      "19": { min: 0, max: 200 },
      "22": { min: 50, max: 450 },
      "36": { min: 40, max: 220 },
      "37": { min: 5, max: 90 },
      "40": { min: 0.1, max: 3 },
    },
    어르신: {
      "3": { min: 3, max: 60 },
      "5": { min: 40, max: 130 },
      "6": { min: 70, max: 220 },
      "7": { min: 0, max: 70 },
      "12": { min: -30, max: 80 },
      "23": { min: 0, max: 100 },
      "25": { min: 0, max: 400 },
      "26": { min: 1, max: 120 },
      "27": { min: 1, max: 300 },
    },
  }

  // Basic info plausible ranges per group
  const BASIC_RULES: Partial<Record<GroupName, { height: [number, number]; weight: [number, number]; waist?: [number, number]; }>> = {
    유아기: { height: [90, 130], weight: [10, 35] },
    유소년: { height: [110, 170], weight: [18, 70], waist: [40, 100] },
    청소년: { height: [140, 200], weight: [35, 120], waist: [40, 100] },
    성인:   { height: [140, 210], weight: [35, 200], waist: [40, 100] },
    어르신: { height: [130, 200], weight: [35, 150], waist: [40, 100] },
  }

  const validateBasicForGroup = (group: string, next?: { height?: string; weight?: string; ageMonths?: string; waist?: string }) => {
    const rules = BASIC_RULES[group as GroupName]
    const errs: Partial<Record<"ageMonths"|"height"|"weight"|"waist", string | null>> = {}
    const h = Number.parseFloat(next?.height ?? height)
    const w = Number.parseFloat(next?.weight ?? weight)
    const wa = Number.parseFloat(next?.waist ?? measurementValues["4"] ?? "")
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
        // If there's no waist rule (e.g. 유아기), clear any waist error
        errs.waist = null
      }
    }
    // ageMonths only for infant
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

  // Advance overlay stages with fade based on progress-derived computedStageIndex
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
    // Fetch measurement codes from backend (sorted by name ascending)
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
  
  // Reset months when not infant group
  useEffect(() => {
    if (ageGroup !== '유아기') {
      setAgeMonths("")
    }
  }, [ageGroup])

  // Compute BMI from height(cm) and weight(kg) instead of manual input
  useEffect(() => {
    const h = Number.parseFloat(height)
    const w = Number.parseFloat(weight)
    if (h > 0 && w > 0) {
      const bmiVal = w / Math.pow(h / 100, 2)
      setBmi(bmiVal ? bmiVal.toFixed(1) : "")
    } else {
      setBmi("")
    }
  }, [height, weight])

  // Auto-calculate WHtR (허리둘레-신장비, id "42") from waist(cm) and height(cm)
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

  // Auto-calculate 절대악력(kg, id "52") from 좌/우 악력(7/8)
  // Use the larger of left/right when available
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

  // Auto-calculate 상대악력(%, id "28") = 절대악력(kg, id "52") / 체중(kg) * 100
  useEffect(() => {
    const absGrip = Number.parseFloat(measurementValues["52"] || "")
    const w = Number.parseFloat(weight)
    setMeasurementValues((prev) => {
      const next = { ...prev }
      if (absGrip > 0 && w > 0) {
        next["28"] = ((absGrip / w) * 100).toFixed(1)
      } else {
        // Do not force remove user-entered 28 if not calculable — only remove if we had set it
        // Here, we conservatively remove when inputs invalid
        if (Object.prototype.hasOwnProperty.call(next, "28")) {
          delete next["28"]
        }
      }
      return next
    })
  }, [measurementValues["52"], weight])

  useEffect(() => {
    // 기본 정보는 이제 허리둘레 제외 (허리둘레는 측정 항목으로 이동)
    const isBasicInfoComplete = !!(age && gender && height && weight)
    setShowMeasurements(isBasicInfoComplete)

    if (!isBasicInfoComplete) {
      setMeasurementValues({})
    }
    // Re-run group validation when basics change
    validateBasicForGroup(ageGroup)
  }, [age, gender, height, weight, ageGroup])

  const currentMeasurements = ageGroup ? ageGroupMeasurements[ageGroup as keyof typeof ageGroupMeasurements] : {}
  const requiredIdsForGroup = Object.keys(currentMeasurements)
    .filter((id) => !["1", "2", "18"].includes(id))
    .filter((id) => requiredMeasurementIds.includes(id) || (ageGroup === '유소년' && id === '42'))
  const allRequiredFilled = requiredIdsForGroup.every((id) => {
    const v = measurementValues[id]
    return typeof v === "string" && v.trim() !== ""
  })

  const updateMeasurementValue = (id: string, value: string) => {
    // Store value first
    setMeasurementValues((prev) => ({ ...prev, [id]: value }))
    // Group-specific validation
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
        if (bmi) {
          const b = Number.parseFloat(bmi)
          if (!Number.isNaN(b)) req_arr.push({ measure_key: 18, measure_value: b })
        }

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
          // send gender as string (e.g. 'M' or 'F')
          req_arr.push({ measure_key: 54, measure_value: String(gender).trim() })
        }

        // Start analyzing/loading screen while we await the POST response
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
            bmi={bmi}
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
              requiredMeasurementIds={requiredMeasurementIds as any}
              autoValues={{
                "42": (() => {
                  const h = Number.parseFloat(height)
                  const wa = Number.parseFloat(measurementValues["4"] || "")
                  return h > 0 && wa > 0 ? (wa / h).toFixed(3) : ""
                })(),
                "28": (() => {
                  const absGrip = Number.parseFloat(measurementValues["52"] || "")
                  const w = Number.parseFloat(weight)
                  return absGrip > 0 && w > 0 ? ((absGrip / w) * 100).toFixed(1) : ""
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