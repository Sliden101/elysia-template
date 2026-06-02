import {User , quizGrade} from '../types'
import { NewLeaderboard } from '../schema/schema'
import { ROUND_QUIZ_IDS } from '../config/round.config'


export function transformLeaderboard(users : User[], grades: quizGrade[]) : NewLeaderboard[]{
     return users.map(user=>{
        const userGrades = grades.filter(grade => grade.userid === user.id)

        const sumRound = (quizIds: readonly number[]) =>
            userGrades
        .filter(g=> quizIds.includes(g.quiz))
        .reduce((sum,g)=>  sum + g.grade ,0)
       
       const rd1 = sumRound(ROUND_QUIZ_IDS.rd1)
       const rd2 = sumRound(ROUND_QUIZ_IDS.rd2)
       const rd3 = sumRound(ROUND_QUIZ_IDS.rd3)

       return {
          userId:   user.id,
          fullname: `${user.firstname} ${user.lastname}`,
          rd1,
          rd2,
          rd3,
          total: rd1 + rd2 + rd3,
       }

     })
}