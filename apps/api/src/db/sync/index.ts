import { syncLeaderboard } from "./leaderboard.sync";


export async function syncAll(){
    try {
        await syncLeaderboard()
    }
    catch(err){
        console.error('[sync] failed:',err)
    }
}