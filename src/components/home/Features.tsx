import { Activity, Award, BookOpen, MapPin, Users, Video } from "lucide-react";
import { FC } from "react";

export const Features: FC = () => {
  const items = [
    { icon: Award, title: "체력 등급 & 지역 순위", description: "나의 체력 등급을 확인하고 지역 내 순위를 비교해보세요", color: "#0074B7" },
    { icon: BookOpen, title: "카테고리별 운동 레시피", description: "하체 강화, 유연성 향상 등 목적에 맞는 운동 프로그램", color: "#10B981" },
    { icon: Video, title: "전문가 운동 영상", description: "국민체력100의 검증된 운동 가이드 영상 제공", color: "#8B5CF6" },
    { icon: MapPin, title: "위치 기반 시설 찾기", description: "주변 체육시설과 수강 가능한 강좌를 지도에서 확인", color: "#F59E0B" },
    { icon: Users, title: "동호회 추천", description: "관심사가 맞는 동호회를 찾고 함께 운동하세요", color: "#EF4444" },
    { icon: Activity, title: "운동 일지 & 성취 배지", description: "운동 기록을 관리하고 목표 달성 시 배지를 획득하세요", color: "#06B6D4" },
  ];
  return (
    <section id="features" className="fade-in-section bg-gray-50 py-20 scroll-mt-[var(--header-offset)]">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="mb-16 pt-8 text-center">
          <h2 className="mb-4 text-balance text-4xl font-bold tracking-tight text-gray-900 lg:text-5xl">원스톱 체력 관리 플랫폼</h2>
          <p className="text-pretty text-lg text-gray-600">체력 측정부터 운동, 커뮤니티까지 모든 것을 한 곳에서</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="group rounded-2xl border-2 border-gray-100 bg-white p-8 transition-all hover:border-gray-200 hover:shadow-lg">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl transition-transform group-hover:scale-110" style={{ backgroundColor: `${feature.color}15` }}>
                  <Icon className="h-7 w-7" style={{ color: feature.color }} />
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-900">{feature.title}</h3>
                <p className="leading-relaxed text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
