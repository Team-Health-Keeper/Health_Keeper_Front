"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Activity, Clock, Play, TrendingUp } from "lucide-react"
import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { YouTubeModal } from "@/components/youtube-modal"
import { SiteHeader } from "@/components/site-header"

// Mock data - 실제로는 API에서 가져올 데이터
const recipesData: Record<string, any> = {
  "flexibility-basic": {
    title: "기초 유연성 향상 프로그램",
    category: "유연성",
    duration: "30분",
    level: "초급",
    difficulty: "easy",
    description:
      "전신 유연성을 향상시키는 단계별 스트레칭 프로그램입니다. 꾸준히 따라하면 몸의 유연성이 크게 향상됩니다.",
    warmup: [
      {
        name: "가벼운 조깅",
        duration: "5분",
        videoId: "D3yExRi7EME",
        fitnessCategory: "심폐지구력",
        equipment: "맨몸",
        bodyPart: "전신",
        targetAge: "청소년기 이상",
        description: "혈액 순환을 촉진하고 체온을 올리는 기본 준비운동입니다.",
      },
      {
        name: "팔 돌리기",
        duration: "2분",
        videoId: "v7AYKMP6rOE",
        fitnessCategory: "유연성",
        equipment: "맨몸",
        bodyPart: "상체",
        targetAge: "전 연령",
        description: "어깨와 팔 관절을 부드럽게 풀어주는 동작입니다.",
      },
    ],
    main: [
      {
        name: "전신 스트레칭",
        duration: "10분",
        videoId: "gMaB-fG4u4g",
        fitnessCategory: "유연성",
        equipment: "맨몸, 요가매트",
        bodyPart: "전신",
        targetAge: "성인기 이상",
        description: "몸 전체의 유연성을 향상시키는 종합 스트레칭입니다.",
      },
      {
        name: "하체 스트레칭",
        duration: "8분",
        videoId: "tzN6ypk6Sps",
        fitnessCategory: "유연성",
        equipment: "맨몸",
        bodyPart: "하체",
        targetAge: "전 연령",
        description: "다리와 엉덩이 근육을 늘려주는 하체 집중 스트레칭입니다.",
      },
      {
        name: "상체 스트레칭",
        duration: "7분",
        videoId: "APBCfmEN0bg",
        fitnessCategory: "유연성",
        equipment: "맨몸",
        bodyPart: "상체",
        targetAge: "전 연령",
        description: "어깨, 가슴, 팔 부위의 긴장을 풀어주는 스트레칭입니다.",
      },
    ],
    cooldown: [
      {
        name: "호흡 정리",
        duration: "3분",
        videoId: "4pKly2JojMw",
        fitnessCategory: "심폐지구력",
        equipment: "맨몸",
        bodyPart: "전신",
        targetAge: "전 연령",
        description: "심박수를 안정시키고 호흡을 정리하는 마무리 운동입니다.",
      },
      {
        name: "천천히 걷기",
        duration: "3분",
        videoId: "RvAhcN0YK7M",
        fitnessCategory: "심폐지구력",
        equipment: "맨몸",
        bodyPart: "하체",
        targetAge: "전 연령",
        description: "운동 후 체온을 서서히 낮추는 쿨다운 운동입니다.",
      },
    ],
  },
  "lower-body-strength": {
    title: "하체 근력 강화 프로그램",
    category: "근력",
    duration: "40분",
    level: "중급",
    difficulty: "medium",
    description: "스쿼트, 런지 등 하체 근력을 집중적으로 강화하는 운동 프로그램입니다.",
    warmup: [
      {
        name: "가볍게 뛰기",
        duration: "5분",
        videoId: "tzN6ypk6Sps",
        fitnessCategory: "심폐지구력",
        equipment: "맨몸",
        bodyPart: "전신",
        targetAge: "성인기",
        description: "심박수를 높이고 근육을 준비시키는 준비운동입니다.",
      },
      {
        name: "다리 스트레칭",
        duration: "3분",
        videoId: "tzN6ypk6Sps",
        fitnessCategory: "유연성",
        equipment: "맨몸",
        bodyPart: "하체",
        targetAge: "전 연령",
        description: "하체 근육을 충분히 이완시키는 스트레칭입니다.",
      },
    ],
    main: [
      {
        name: "스쿼트",
        duration: "10분",
        videoId: "tzN6ypk6Sps",
        fitnessCategory: "근력/근지구력",
        equipment: "맨몸, 덤벨",
        bodyPart: "하체",
        targetAge: "청소년기 이상",
        description: "허벅지와 엉덩이 근육을 강화하는 기본 하체 운동입니다.",
      },
      {
        name: "런지",
        duration: "10분",
        videoId: "tzN6ypk6Sps",
        fitnessCategory: "근력/근지구력",
        equipment: "맨몸, 덤벨",
        bodyPart: "하체",
        targetAge: "청소년기 이상",
        description: "다리 근육을 균형있게 발달시키는 핵심 운동입니다.",
      },
      {
        name: "레그 프레스",
        duration: "8분",
        videoId: "tzN6ypk6Sps",
        fitnessCategory: "근력/근지구력",
        equipment: "기구",
        bodyPart: "하체",
        targetAge: "성인기",
        description: "하체 전체 근육을 집중적으로 발달시키는 운동입니다.",
      },
      {
        name: "카프 레이즈",
        duration: "5분",
        videoId: "tzN6ypk6Sps",
        fitnessCategory: "근력/근지구력",
        equipment: "맨몸",
        bodyPart: "하체",
        targetAge: "전 연령",
        description: "종아리 근육을 강화하는 운동입니다.",
      },
    ],
    cooldown: [
      {
        name: "하체 스트레칭",
        duration: "5분",
        videoId: "tzN6ypk6Sps",
        fitnessCategory: "유연성",
        equipment: "맨몸",
        bodyPart: "하체",
        targetAge: "전 연령",
        description: "운동 후 근육 회복을 돕는 정리 스트레칭입니다.",
      },
      {
        name: "걷기",
        duration: "3분",
        videoId: "tzN6ypk6Sps",
        fitnessCategory: "심폐지구력",
        equipment: "맨몸",
        bodyPart: "전신",
        targetAge: "전 연령",
        description: "심박수를 안정화하는 쿨다운 걷기입니다.",
      },
    ],
  },
  "full-body-endurance": {
    title: "전신 지구력 훈련",
    category: "지구력",
    duration: "45분",
    level: "중급",
    difficulty: "medium",
    description: "유산소와 근력 운동을 결합한 전신 지구력 향상 프로그램입니다.",
    warmup: [
      {
        name: "조깅",
        duration: "5분",
        videoId: "gMaB-fG4u4g",
        fitnessCategory: "심폐지구력",
        equipment: "맨몸",
        bodyPart: "전신",
        targetAge: "청소년기 이상",
        description: "심박수를 올리고 몸을 준비시키는 기본 유산소 운동입니다.",
      },
      {
        name: "동적 스트레칭",
        duration: "3분",
        videoId: "gMaB-fG4u4g",
        fitnessCategory: "유연성",
        equipment: "맨몸",
        bodyPart: "전신",
        targetAge: "전 연령",
        description: "관절 가동범위를 넓히는 동적 움직임입니다.",
      },
    ],
    main: [
      {
        name: "버피",
        duration: "10분",
        videoId: "gMaB-fG4u4g",
        fitnessCategory: "심폐지구력, 근력",
        equipment: "맨몸",
        bodyPart: "전신",
        targetAge: "성인기",
        description: "전신을 사용하는 고강도 복합 운동입니다.",
      },
      {
        name: "마운틴 클라이머",
        duration: "8분",
        videoId: "gMaB-fG4u4g",
        fitnessCategory: "심폐지구력, 근지구력",
        equipment: "맨몸",
        bodyPart: "전신, 코어",
        targetAge: "청소년기 이상",
        description: "코어와 하체를 동시에 단련하는 운동입니다.",
      },
      {
        name: "점핑잭",
        duration: "7분",
        videoId: "gMaB-fG4u4g",
        fitnessCategory: "심폐지구력",
        equipment: "맨몸",
        bodyPart: "전신",
        targetAge: "전 연령",
        description: "전신 협응력을 향상시키는 유산소 운동입니다.",
      },
      {
        name: "플랭크",
        duration: "8분",
        videoId: "gMaB-fG4u4g",
        fitnessCategory: "근지구력",
        equipment: "맨몸",
        bodyPart: "코어",
        targetAge: "청소년기 이상",
        description: "복부와 등 근육을 강화하는 정적 운동입니다.",
      },
    ],
    cooldown: [
      {
        name: "전신 스트레칭",
        duration: "5분",
        videoId: "gMaB-fG4u4g",
        fitnessCategory: "유연성",
        equipment: "맨몸",
        bodyPart: "전신",
        targetAge: "전 연령",
        description: "운동 후 근육을 이완시키는 정적 스트레칭입니다.",
      },
      {
        name: "호흡 정리",
        duration: "3분",
        videoId: "gMaB-fG4u4g",
        fitnessCategory: "심폐지구력",
        equipment: "맨몸",
        bodyPart: "전신",
        targetAge: "전 연령",
        description: "심박수를 안정화하는 호흡 운동입니다.",
      },
    ],
  },
  "agility-training": {
    title: "순발력 향상 트레이닝",
    category: "순발력",
    duration: "35분",
    level: "초급-중급",
    difficulty: "medium",
    description: "민첩성과 반응속도를 높이는 고강도 인터벌 운동입니다.",
    warmup: [
      {
        name: "제자리 달리기",
        duration: "4분",
        videoId: "APBCfmEN0bg",
        fitnessCategory: "심폐지구력",
        equipment: "맨몸",
        bodyPart: "전신",
        targetAge: "청소년기 이상",
        description: "심박수를 높이고 근육을 활성화시키는 준비운동입니다.",
      },
      {
        name: "발목 스트레칭",
        duration: "2분",
        videoId: "APBCfmEN0bg",
        fitnessCategory: "유연성",
        equipment: "맨몸",
        bodyPart: "하체",
        targetAge: "전 연령",
        description: "발목 부상을 예방하는 스트레칭입니다.",
      },
    ],
    main: [
      {
        name: "래더 드릴",
        duration: "10분",
        videoId: "APBCfmEN0bg",
        fitnessCategory: "순발력, 민첩성",
        equipment: "래더",
        bodyPart: "하체",
        targetAge: "청소년기 이상",
        description: "발의 민첩성과 협응력을 향상시키는 훈련입니다.",
      },
      {
        name: "콘 드릴",
        duration: "8분",
        videoId: "APBCfmEN0bg",
        fitnessCategory: "순발력, 민첩성",
        equipment: "콘",
        bodyPart: "전신",
        targetAge: "청소년기 이상",
        description: "방향 전환 능력을 키우는 민첩성 훈련입니다.",
      },
      {
        name: "스프린트",
        duration: "8분",
        videoId: "APBCfmEN0bg",
        fitnessCategory: "순발력, 심폐지구력",
        equipment: "맨몸",
        bodyPart: "하체",
        targetAge: "청소년기 이상",
        description: "순간 가속력을 높이는 단거리 달리기입니다.",
      },
    ],
    cooldown: [
      {
        name: "하체 스트레칭",
        duration: "4분",
        videoId: "APBCfmEN0bg",
        fitnessCategory: "유연성",
        equipment: "맨몸",
        bodyPart: "하체",
        targetAge: "전 연령",
        description: "하체 근육을 이완시키는 마무리 스트레칭입니다.",
      },
      {
        name: "걷기",
        duration: "3분",
        videoId: "APBCfmEN0bg",
        fitnessCategory: "심폐지구력",
        equipment: "맨몸",
        bodyPart: "전신",
        targetAge: "전 연령",
        description: "심박수를 천천히 낮추는 쿨다운입니다.",
      },
    ],
  },
  "core-strength": {
    title: "코어 근력 집중 운동",
    category: "근력",
    duration: "30분",
    level: "중급",
    difficulty: "medium",
    description: "복부와 허리 주변 근육을 강화하는 코어 운동 프로그램입니다.",
    warmup: [
      {
        name: "가벼운 유산소",
        duration: "5분",
        videoId: "4pKly2JojMw",
        fitnessCategory: "심폐지구력",
        equipment: "맨몸",
        bodyPart: "전신",
        targetAge: "전 연령",
        description: "근육을 따뜻하게 만드는 준비 운동입니다.",
      },
    ],
    main: [
      {
        name: "플랭크",
        duration: "8분",
        videoId: "4pKly2JojMw",
        fitnessCategory: "근지구력",
        equipment: "맨몸, 요가매트",
        bodyPart: "코어",
        targetAge: "청소년기 이상",
        description: "복부와 등 전체를 강화하는 핵심 운동입니다.",
      },
      {
        name: "크런치",
        duration: "6분",
        videoId: "4pKly2JojMw",
        fitnessCategory: "근력",
        equipment: "맨몸, 요가매트",
        bodyPart: "복부",
        targetAge: "청소년기 이상",
        description: "복직근을 집중적으로 단련하는 운동입니다.",
      },
      {
        name: "사이드 플랭크",
        duration: "6분",
        videoId: "4pKly2JojMw",
        fitnessCategory: "근지구력",
        equipment: "맨몸, 요가매트",
        bodyPart: "코어, 측면",
        targetAge: "청소년기 이상",
        description: "옆구리 근육을 강화하는 측면 운동입니다.",
      },
      {
        name: "버드독",
        duration: "5분",
        videoId: "4pKly2JojMw",
        fitnessCategory: "근지구력, 균형",
        equipment: "맨몸, 요가매트",
        bodyPart: "코어, 등",
        targetAge: "청소년기 이상",
        description: "균형감각과 코어 안정성을 키우는 운동입니다.",
      },
    ],
    cooldown: [
      {
        name: "복부 스트레칭",
        duration: "3분",
        videoId: "4pKly2JojMw",
        fitnessCategory: "유연성",
        equipment: "맨몸, 요가매트",
        bodyPart: "복부",
        targetAge: "전 연령",
        description: "복부 근육을 풀어주는 스트레칭입니다.",
      },
    ],
  },
  "cardio-interval": {
    title: "심폐 지구력 인터벌",
    category: "심폐지구력",
    duration: "40분",
    level: "고급",
    difficulty: "hard",
    description: "고강도 유산소 운동으로 심폐 기능을 향상시키는 프로그램입니다.",
    warmup: [
      {
        name: "조깅",
        duration: "5분",
        videoId: "RvAhcN0YK7M",
        fitnessCategory: "심폐지구력",
        equipment: "맨몸",
        bodyPart: "전신",
        targetAge: "성인기",
        description: "심박수를 점진적으로 올리는 준비 조깅입니다.",
      },
      {
        name: "동적 스트레칭",
        duration: "3분",
        videoId: "RvAhcN0YK7M",
        fitnessCategory: "유연성",
        equipment: "맨몸",
        bodyPart: "전신",
        targetAge: "전 연령",
        description: "관절을 활성화시키는 동적 움직임입니다.",
      },
    ],
    main: [
      {
        name: "고강도 달리기",
        duration: "12분",
        videoId: "RvAhcN0YK7M",
        fitnessCategory: "심폐지구력",
        equipment: "맨몸",
        bodyPart: "전신",
        targetAge: "성인기",
        description: "최대 심박수의 80-90%로 달리는 고강도 인터벌입니다.",
      },
      {
        name: "줄넘기",
        duration: "8분",
        videoId: "RvAhcN0YK7M",
        fitnessCategory: "심폐지구력, 순발력",
        equipment: "줄넘기",
        bodyPart: "전신",
        targetAge: "청소년기 이상",
        description: "전신 협응력과 지구력을 키우는 운동입니다.",
      },
      {
        name: "계단 오르기",
        duration: "8분",
        videoId: "RvAhcN0YK7M",
        fitnessCategory: "심폐지구력, 근력",
        equipment: "계단",
        bodyPart: "하체",
        targetAge: "성인기",
        description: "하체 근력과 심폐 능력을 동시에 향상시킵니다.",
      },
    ],
    cooldown: [
      {
        name: "가벼운 걷기",
        duration: "5분",
        videoId: "RvAhcN0YK7M",
        fitnessCategory: "심폐지구력",
        equipment: "맨몸",
        bodyPart: "전신",
        targetAge: "전 연령",
        description: "심박수를 서서히 낮추는 회복 걷기입니다.",
      },
      {
        name: "전신 스트레칭",
        duration: "4분",
        videoId: "RvAhcN0YK7M",
        fitnessCategory: "유연성",
        equipment: "맨몸",
        bodyPart: "전신",
        targetAge: "전 연령",
        description: "근육 회복을 돕는 정적 스트레칭입니다.",
      },
    ],
  },
  "balance-improvement": {
    title: "균형감각 향상 운동",
    category: "균형",
    duration: "25분",
    level: "초급",
    difficulty: "easy",
    description: "중심 잡기와 안정성을 높이는 균형 운동 프로그램입니다.",
    warmup: [
      {
        name: "제자리 걷기",
        duration: "3분",
        videoId: "R25C4sWSX5g",
        fitnessCategory: "심폐지구력",
        equipment: "맨몸",
        bodyPart: "전신",
        targetAge: "전 연령",
        description: "몸을 준비시키는 가벼운 워밍업입니다.",
      },
    ],
    main: [
      {
        name: "외발 서기",
        duration: "8분",
        videoId: "R25C4sWSX5g",
        fitnessCategory: "균형",
        equipment: "맨몸",
        bodyPart: "하체, 코어",
        targetAge: "전 연령",
        description: "기본적인 균형 감각을 키우는 운동입니다.",
      },
      {
        name: "보수 운동",
        duration: "8분",
        videoId: "R25C4sWSX5g",
        fitnessCategory: "균형, 근지구력",
        equipment: "보수볼",
        bodyPart: "전신",
        targetAge: "성인기",
        description: "불안정한 표면에서 균형을 잡는 고급 훈련입니다.",
      },
      {
        name: "요가 밸런스",
        duration: "6분",
        videoId: "R25C4sWSX5g",
        fitnessCategory: "균형, 유연성",
        equipment: "요가매트",
        bodyPart: "전신",
        targetAge: "전 연령",
        description: "요가 동작을 통해 균형과 집중력을 향상시킵니다.",
      },
    ],
    cooldown: [
      {
        name: "스트레칭",
        duration: "3분",
        videoId: "R25C4sWSX5g",
        fitnessCategory: "유연성",
        equipment: "맨몸",
        bodyPart: "전신",
        targetAge: "전 연령",
        description: "근육을 이완시키는 마무리 스트레칭입니다.",
      },
    ],
  },
  "upper-body-strength": {
    title: "상체 근력 프로그램",
    category: "근력",
    duration: "35분",
    level: "중급",
    difficulty: "medium",
    description: "팔, 어깨, 가슴 근육을 발달시키는 상체 운동 프로그램입니다.",
    warmup: [
      {
        name: "팔 돌리기",
        duration: "3분",
        videoId: "IODxDxX7oi4",
        fitnessCategory: "유연성",
        equipment: "맨몸",
        bodyPart: "상체",
        targetAge: "전 연령",
        description: "어깨 관절을 부드럽게 풀어주는 준비 동작입니다.",
      },
      {
        name: "상체 스트레칭",
        duration: "3분",
        videoId: "IODxDxX7oi4",
        fitnessCategory: "유연성",
        equipment: "맨몸",
        bodyPart: "상체",
        targetAge: "전 연령",
        description: "가슴과 어깨를 충분히 이완시키는 스트레칭입니다.",
      },
    ],
    main: [
      {
        name: "푸시업",
        duration: "10분",
        videoId: "IODxDxX7oi4",
        fitnessCategory: "근력/근지구력",
        equipment: "맨몸",
        bodyPart: "상체, 가슴",
        targetAge: "청소년기 이상",
        description: "가슴, 삼두, 어깨를 강화하는 기본 상체 운동입니다.",
      },
      {
        name: "딥스",
        duration: "8분",
        videoId: "IODxDxX7oi4",
        fitnessCategory: "근력/근지구력",
        equipment: "평행봉, 의자",
        bodyPart: "상체, 삼두",
        targetAge: "청소년기 이상",
        description: "삼두근과 가슴 하부를 집중적으로 발달시킵니다.",
      },
      {
        name: "숄더 프레스",
        duration: "8분",
        videoId: "IODxDxX7oi4",
        fitnessCategory: "근력/근지구력",
        equipment: "덤벨, 바벨",
        bodyPart: "어깨",
        targetAge: "성인기",
        description: "어깨 근육을 전체적으로 발달시키는 운동입니다.",
      },
    ],
    cooldown: [
      {
        name: "상체 스트레칭",
        duration: "5분",
        videoId: "IODxDxX7oi4",
        fitnessCategory: "유연성",
        equipment: "맨몸",
        bodyPart: "상체",
        targetAge: "전 연령",
        description: "운동 후 상체 근육을 이완시키는 마무리 스트레칭입니다.",
      },
    ],
  },
}

export default function RecipeDetailPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const params = useParams()
  const id = params?.id as string
  const recipe = id ? recipesData[id] : null

  const [selectedVideo, setSelectedVideo] = useState<{ name: string; videoId: string } | null>(null)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)

  const allExercises = [...(recipe?.warmup || []), ...(recipe?.main || []), ...(recipe?.cooldown || [])]

  const openVideoAtIndex = (index: number) => {
    if (index >= 0 && index < allExercises.length) {
      setCurrentVideoIndex(index)
      setSelectedVideo({
        name: allExercises[index].name,
        videoId: allExercises[index].videoId,
      })
    }
  }

  const handleExerciseClick = (exercise: any, type: string) => {
    const index = allExercises.findIndex((ex) => ex.name === exercise.name && ex.videoId === exercise.videoId)
    if (index !== -1) {
      openVideoAtIndex(index)
    }
  }

  const ExerciseCard = ({ exercise, type }: { exercise: any; type: string }) => (
    <Card
      className="group cursor-pointer border-border transition-all hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden"
      onClick={() => handleExerciseClick(exercise, type)}
    >
      {/* 썸네일 영역 */}
      <div className="relative h-40 bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
        <img
          src={`https://img.youtube.com/vi/${exercise.videoId}/mqdefault.jpg`}
          alt={exercise.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <div className="bg-white/90 rounded-full p-3 group-hover:bg-primary group-hover:text-white transition-colors">
            <Play className="h-6 w-6" />
          </div>
        </div>
        <Badge className="absolute top-2 right-2 bg-black/60 text-white border-0">
          <Clock className="mr-1 h-3 w-3" />
          {exercise.duration}
        </Badge>
      </div>

      <CardContent className="p-4">
        {/* 제목 */}
        <h4 className="font-bold text-foreground group-hover:text-primary transition-colors mb-3 text-lg">
          {exercise.name}
        </h4>

        {/* 운동 정보 태그들 */}
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className="text-xs">
            {exercise.fitnessCategory}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {exercise.equipment}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {exercise.bodyPart}
          </Badge>
        </div>

        {/* 운동 대상 */}
        <p className="text-xs text-muted-foreground mb-2">
          <span className="font-semibold">대상:</span> {exercise.targetAge}
        </p>

        {/* 운동 설명 */}
        <p className="text-sm text-muted-foreground line-clamp-2">{exercise.description}</p>
      </CardContent>
    </Card>
  )

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">레시피를 찾을 수 없습니다</h1>
          <Button asChild>
            <Link to="/recipes">목록으로 돌아가기</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <SiteHeader />

      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Recipe Header */}
        <div className="mb-10">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">{recipe.category}</Badge>
          <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground">{recipe.title}</h1>
          <p className="text-lg text-muted-foreground mb-6">{recipe.description}</p>

          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-medium text-foreground">총 소요시간</span>
              <span className="text-muted-foreground">{recipe.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="font-medium text-foreground">난이도</span>
              <span className="text-muted-foreground">{recipe.level}</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <span className="font-medium text-foreground">운동 개수</span>
              <span className="text-muted-foreground">
                {recipe.warmup.length + recipe.main.length + recipe.cooldown.length}개
              </span>
            </div>
          </div>
        </div>

        {/* Warmup Exercises */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-1 bg-green-500 rounded-full" />
            <h2 className="text-2xl font-bold text-foreground">준비운동</h2>
            <Badge variant="secondary">{recipe.warmup.length}개</Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {recipe.warmup.map((exercise: any, index: number) => (
              <ExerciseCard key={index} exercise={exercise} type="warmup" />
            ))}
          </div>
        </section>

        {/* Main Exercises */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-1 bg-primary rounded-full" />
            <h2 className="text-2xl font-bold text-foreground">본운동</h2>
            <Badge variant="secondary">{recipe.main.length}개</Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recipe.main.map((exercise: any, index: number) => (
              <ExerciseCard key={index} exercise={exercise} type="main" />
            ))}
          </div>
        </section>

        {/* Cooldown Exercises */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-1 bg-blue-500 rounded-full" />
            <h2 className="text-2xl font-bold text-foreground">정리운동</h2>
            <Badge variant="secondary">{recipe.cooldown.length}개</Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {recipe.cooldown.map((exercise: any, index: number) => (
              <ExerciseCard key={index} exercise={exercise} type="cooldown" />
            ))}
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex justify-center">
          <Button
            size="lg"
            className="h-12 px-8"
            onClick={() => {
              openVideoAtIndex(0)
            }}
          >
            <Activity className="mr-2 h-5 w-5" />
            운동 시작하기
          </Button>
        </div>
      </div>

      {/* YouTube Modal */}
      {selectedVideo && (
        <YouTubeModal
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
          title={selectedVideo.name}
          videoId={selectedVideo.videoId}
          playlist={allExercises}
          currentIndex={currentVideoIndex}
          onNavigate={openVideoAtIndex}
        />
      )}
    </div>
  )
}