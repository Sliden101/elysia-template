import {mysql} from '../../engine'
import {User,quizGrade} from '../../types'
import { ROUND_QUIZ_IDS } from '@api/db/config/round.config'

// assume first ,  1 round have 5 quiz


export async function fetchUsers(): Promise<User[]> {
  const rows = await  mysql`
    SELECT id, firstname, lastname, username
    FROM mdl_user
    WHERE deleted = 0
    AND suspended = 0
  `  as Readonly<User[]>

  
   const objArr = rows.map((row) =>(

       {
         id         : Number(row.id),
         firstname  : row.firstname,
         lastname   : row.lastname

       } satisfies User
   ))

   return objArr;
}



export async function fetchGrades(): Promise<quizGrade[]> {
  const allQuizIds = [
    ...ROUND_QUIZ_IDS.rd1,
    ...ROUND_QUIZ_IDS.rd2,
    ...ROUND_QUIZ_IDS.rd3,
  ]

  const rows = await mysql` SELECT userid, quiz, grade
    FROM mdl_quiz_grades
    WHERE quiz IN ${mysql(allQuizIds)}
  ` as  Readonly<quizGrade[]>

  const objArr = rows.map((row)=>(

        {
           userid : Number(row.userid),
           quiz   : Number(row.quiz),
           grade  : Number(row.grade)

        } satisfies quizGrade
  ))

  return objArr
    
}



