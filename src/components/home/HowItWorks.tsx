import { Activity, TrendingUp, Dumbbell, Users } from "lucide-react";
import { FC } from "react";

export const HowItWorks: FC = () => {
  const steps = [
    { step: "01", title: "간편 로그인", description: "카카오/구글 계정으로 빠르게 시작하세요", icon: Users },
    { step: "02", title: "체력 측정", description: "가이드 영상을 보며 항목을 입력하세요", icon: Activity },
    { step: "03", title: "AI 분석", description: "AI가 체력 등급을 예측하고 분석합니다", icon: TrendingUp },
    { step: "04", title: "운동 시작", description: "맞춤형 레시피로 바로 운동을 시작하세요", icon: Dumbbell },
  ];
  return (
    <section id="how-it-works" className="fade-in-section is-visible bg-white py-20 scroll-mt-[var(--header-offset)]">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-[#0074B7]">
            간단한 4단계
          </div>
          <h2 className="mb-4 text-balance text-4xl font-bold tracking-tight text-gray-900 lg:text-5xl">이렇게 시작하세요</h2>
          <p className="text-pretty text-lg text-gray-600">몇 분만 투자하면 맞춤형 운동 계획을 받을 수 있습니다</p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="group relative">
                <div className="rounded-2xl border-2 border-gray-100 bg-white p-8 transition-all hover:border-[#0074B7] hover:shadow-xl">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 transition-colors group-hover:bg-[#0074B7]">
                    <Icon className="h-8 w-8 text-[#0074B7] transition-colors group-hover:text-white" />
                  </div>
                  <div className="mb-3 text-sm font-bold text-gray-400">{item.step}</div>
                  <h3 className="mb-3 text-xl font-bold text-gray-900">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-600">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
