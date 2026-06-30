'use client'
import { RoundTabs } from "./RoundTabs";
import { LeaderboardHeader } from "./LeaderboardHeader";
import { usePathname } from 'next/navigation';




export default function Nav(){

    const pathname = usePathname();

    const shouldShowNav = ['/','/leaderboard/rd1', '/leaderboard/rd2', '/leaderboard/rd3','/leaderboard/total', '/leaderboard/duo'].includes(pathname);
  
  if (!shouldShowNav) {
    return null;
  }
    return (
        <>
           <div className="pb-8">
              <LeaderboardHeader />
           </div>
            <div>
                <RoundTabs />
            </div>
        </>
    )
}