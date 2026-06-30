'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function RoundTabs() {
  const pathname = usePathname();

  const rounds = [
    { number: 1, label: "① Round 1", status: "🔴 LIVE", href: "/leaderboard/rd1" },
    { number: 2, label: "② Round 2", status: "Upcoming", href: "/leaderboard/rd2" },
    { number: 3, label: "③ Round 3", status: "Upcoming", href: "/leaderboard/rd3" },
    { number: 4, label: "🏆 Total", status: "", href: "/leaderboard/total" },
    { number: 5, label: "✨ Duo", status: "Duolingo", href: "/leaderboard/duo" },
  ];

  return (
    <div className="mb-8">
      <div className="flex gap-3 justify-center">
        {rounds.map((round) => {
          const isActive = pathname === round.href;
          return (
            <Link
              key={round.number}
              href={round.href}
              className={`relative px-5 py-2.5 rounded font-semibold border no-underline transition-colors duration-150 ${
                isActive
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-sm">{round.label}</span>
                {round.status && (
                  <span className={`text-xs font-normal ${
                    isActive ? 'text-orange-100' : 'text-slate-400'
                  }`}>
                    {round.status}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}