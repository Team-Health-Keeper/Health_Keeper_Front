import { Users, User2, TrendingUp } from "lucide-react";
import { FC } from "react";

export interface ClubStats {
  activeClubs: number;
  totalMembers: number;
  newClubs: number;
}

interface StatsSectionProps {
  stats: ClubStats | null;
  error: string | null;
  className?: string;
}

export const StatsSection: FC<StatsSectionProps> = ({ stats, error, className }) => {
  const items = [
    { icon: Users, label: "활성 동호회", value: stats ? `${stats.activeClubs.toLocaleString()}개` : "—" },
    { icon: User2, label: "전체 회원", value: stats ? `${stats.totalMembers.toLocaleString()}명` : "—" },
    { icon: TrendingUp, label: "신규 동호회(2025)", value: stats ? `+${stats.newClubs.toLocaleString()}개` : "—" },
  ];
  return (
    <section className={"border-y bg-white py-12 " + (className || "")}>
      <div className="container mx-auto max-w-6xl px-6">
        <div className="grid gap-8 md:grid-cols-3">
          {items.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                  <Icon className="h-7 w-7 text-[#0074B7]" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              </div>
            );
          })}
          {error && (
            <div className="md:col-span-3 mt-2 text-center text-sm text-red-600">{error}</div>
          )}
        </div>
      </div>
    </section>
  );
};
