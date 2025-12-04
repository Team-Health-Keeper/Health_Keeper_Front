import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { FC, useEffect, useRef, useState } from "react";

interface HeroProps {
  onGetStarted: () => void;
  onGoRecipes: () => void;
}

export const Hero: FC<HeroProps> = ({ onGetStarted, onGoRecipes }) => {
  const [panelIndex, setPanelIndex] = useState<0 | 1>(0);
  const hoverRef = useRef(false);
  const intervalRef = useRef<number | null>(null);

  // 자동 전환: 6초 간격, 호버 시 일시정지
  useEffect(() => {
    if (intervalRef.current != null) return;
    intervalRef.current = window.setInterval(() => {
      if (hoverRef.current) return;
      setPanelIndex((prev) => (prev === 0 ? 1 : 0));
    }, 6000);

    return () => {
      if (intervalRef.current != null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const panels = [
    {
      badgeText: "AI 기반 맞춤형 체력 관리",
      title: (
        <>
          당신의 체력을<br />
          <span className="text-[#0074B7]">AI가 분석하고</span><br />
          맞춤 운동을<br />
          추천합니다
        </>
      ),
      desc: (
        <>
          국민체력100 데이터로 학습된 AI가<br />
          체력등급을 예측하고, 당신에게<br />
          최적화된 운동 레시피를 제공합니다.
        </>
      ),
      primaryCTA: { label: "무료로 시작하기", onClick: onGetStarted },
      secondaryCTA: { label: "맞춤 운동 레시피 보기", to: "/recipes" },
      imageSrc: "/hero-1.jpeg",
    },
    {
      badgeText: "AI 트레이너",
      title: (
        <>
          한국스포츠과학원<br />
          비디오로<br />
            <span className="text-[#0074B7]">AI가 코칭하고</span><br />
            실시간 피드백합니다
        </>
      ),
      desc: (
        <>
          한국스포츠과학원이 제공하는 비디오로 학습된<br />
          AI가 당신의 자세를 분석하고,<br />
          최적화된 운동을 안내합니다.
        </>
      ),
      primaryCTA: { label: "AI 코치 체험하기", to: "/exercise" },
      secondaryCTA: { label: "맞춤 운동 레시피 보기", to: "/recipes" },
      imageSrc: "/hero-2.jpeg",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-20 lg:py-20">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div
            className="space-y-8 transition-all duration-500 ease-out"
            style={{ willChange: "transform, opacity" }}
            onMouseEnter={() => { hoverRef.current = true; }}
            onMouseLeave={() => { hoverRef.current = false; }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-[#0074B7]">
              <Sparkles className="h-4 w-4" />
              {panels[panelIndex].badgeText}
            </div>
            <div className="relative">
              <h1
                className={`text-balance text-4xl sm:text-5xl font-bold leading-tight tracking-tight text-gray-900 lg:text-6xl transition-all duration-500 ${panelIndex === 0 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 absolute inset-0"}`}
              >
                {panels[0].title}
              </h1>
              <h1
                className={`text-balance text-4xl sm:text-5xl font-bold leading-tight tracking-tight text-gray-900 lg:text-6xl transition-all duration-500 ${panelIndex === 1 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 absolute inset-0"}`}
              >
                {panels[1].title}
              </h1>
            </div>
            <div className="relative mt-4">
              <p className={`text-xl leading-relaxed text-gray-600 transition-all duration-500 ${panelIndex === 0 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 absolute inset-0"}`}>
                {panels[0].desc}
              </p>
              <p className={`text-xl leading-relaxed text-gray-600 transition-all duration-500 ${panelIndex === 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 absolute inset-0"}`}>
                {panels[1].desc}
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              {panels[panelIndex].primaryCTA?.to ? (
                <Button size="lg" className="bg-[#0074B7] px-8 py-6 text-base hover:bg-[#005a91]" asChild>
                  <Link to={panels[panelIndex].primaryCTA.to}>{panels[panelIndex].primaryCTA.label}</Link>
                </Button>
              ) : (
                <Button size="lg" className="bg-[#0074B7] px-8 py-6 text-base hover:bg-[#005a91]" onClick={panels[panelIndex].primaryCTA.onClick}>
                  {panels[panelIndex].primaryCTA.label}
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-gray-300 px-8 py-6 text-base bg-gray-50 text-gray-800 hover:bg-gray-100 hover:text-gray-900"
                onClick={onGoRecipes}
              >
                <BookOpen className="mr-2 h-5 w-5" />
                {panels[panelIndex].secondaryCTA.label}
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-6 pt-4">
              {["무료 체력 측정", "AI 맞춤 추천", "전문가 영상"].map((label) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500" aria-hidden />
                  <span className="text-sm text-gray-600">{label}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <button aria-label="기본 소개" className={`h-2 w-2 rounded-full ${panelIndex === 0 ? "bg-[#0074B7]" : "bg-gray-300"}`} onClick={() => setPanelIndex(0)} />
              <button aria-label="AI 코치" className={`h-2 w-2 rounded-full ${panelIndex === 1 ? "bg-[#0074B7]" : "bg-gray-300"}`} onClick={() => setPanelIndex(1)} />
            </div>
          </div>
          {/* Right visual panel: only show on large screens; mobile uses faint BG above */}
          <div className="relative fade-in-section hidden lg:block">
            <div className="relative rounded-3xl bg-gradient-to-br from-blue-100 to-blue-50 p-0 overflow-hidden">
              <img
                src={panels[0].imageSrc}
                alt="메인 일러스트 1"
                loading="lazy"
                className={`h-auto w-full object-cover absolute inset-0 transition-all duration-500 ${panelIndex === 0 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`}
              />
              <img
                src={panels[1].imageSrc}
                alt="메인 일러스트 2"
                loading="lazy"
                className={`h-auto w-full object-cover transition-all duration-500 ${panelIndex === 1 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"}`}
              />
            </div>
            <div
              className="absolute -left-4 top-1/4 rounded-2xl bg-white p-4 shadow-xl hidden sm:block cursor-pointer transition-transform hover:scale-[1.03]"
              role="button" tabIndex={0}
              aria-label="체력 등급 AI 분석 바로가기"
              onClick={onGetStarted}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onGetStarted() }}
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-100 p-3">
                  <TrendingUp className="h-6 w-6 text-[#0074B7]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">체력 등급</p>
                  <p className="text-xs text-gray-600">AI 분석 완료</p>
                </div>
              </div>
            </div>
            <div
              className="absolute -right-4 bottom-1/4 rounded-2xl bg-white p-4 shadow-xl hidden sm:block cursor-pointer transition-transform hover:scale-[1.03]"
              role="button" tabIndex={0}
              aria-label="운동 레시피 보러가기"
              onClick={onGoRecipes}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onGoRecipes() }}
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-100 p-3">
                  <Sparkles className="h-6 w-6 text-[#0074B7]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">운동 레시피</p>
                  <p className="text-xs text-gray-600">맞춤 추천</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* 섹션 전체 양 끝 글로벌 내비게이션 버튼 */}
      <button
        aria-label="이전 슬라이드"
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/80 text-[#0074B7] shadow-sm border border-blue-100 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center hover:bg-white"
        onClick={() => setPanelIndex((prev) => (prev === 0 ? 1 : 0))}
      >
        <span aria-hidden>{"<"}</span>
      </button>
      <button
        aria-label="다음 슬라이드"
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/80 text-[#0074B7] shadow-sm border border-blue-100 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center hover:bg-white"
        onClick={() => setPanelIndex((prev) => (prev === 0 ? 1 : 0))}
      >
        <span aria-hidden>{">"}</span>
      </button>
    </section>
  );
};
 
