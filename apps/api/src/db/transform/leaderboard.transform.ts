import {User , quizGrade} from '../types'
import { NewLeaderboard } from '../schema/schema'
import type { QuizRoundMap } from '../repositories/mysql/leaderboard.repository'


export function transformLeaderboard(users : User[], grades: quizGrade[], roundMap: QuizRoundMap) : NewLeaderboard[]{
     return users.map(user=>{
        const userGrades = grades.filter(grade => grade.userid === user.id)

        const sumRound = (quizIds: readonly number[]) =>
            userGrades
        .filter(g=> quizIds.includes(g.quiz))
        .reduce((sum,g)=>  sum + g.grade ,0)
       
       const rd1 = sumRound(roundMap.rd1)
       const rd2 = sumRound(roundMap.rd2)
       const rd3 = sumRound(roundMap.rd3)

       return {
          userId:   user.id,
          fullname: `${user.firstname} ${user.lastname}`,
          idnumber: user.idnumber,
          group:    user.group,
          rd1,
          rd2,
          rd3,
          total: rd1 + rd2 + rd3,
       }

     })
}