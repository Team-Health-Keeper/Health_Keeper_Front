import { Activity, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FC } from "react";

interface StartCTAProps {
  onGetStarted: () => void;
}

export const StartCTA: FC<StartCTAProps> = ({ onGetStarted }) => {
  return (
    <section id="start" className="fade-in-section bg-gradient-to-br from-blue-600 to-blue-700 py-20 text-white scroll-mt-[var(--header-offset)]">
      <div className="container mx-auto max-w-4xl px-6 text-center">
        <h2 className="mb-6 text-balance text-4xl font-bold tracking-tight lg:text-5xl">지금 바로 시작하세요</h2>
        <p className="mb-10 text-pretty text-xl leading-relaxed text-blue-100">
          AI가 당신의 체력을 분석하고 맞춤형 운동을 추천합니다.<br />무료로 시작해보세요.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" className="bg-white px-8 py-6 text-base text-[#0074B7] hover:bg-gray-100" onClick={onGetStarted}>
            <Activity className="mr-2 h-5 w-5" />
            무료로 체력 측정하기
          </Button>
          <Button size="lg" variant="outline" className="border-2 border-white bg-transparent px-8 py-6 text-base text-white hover:bg-white/10" asChild>
            <Link to="/recipes">
              <BookOpen className="mr-2 h-5 w-5" />
              운동 레시피 둘러보기
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
