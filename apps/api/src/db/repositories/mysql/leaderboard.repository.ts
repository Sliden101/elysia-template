import {mysql} from '../../engine'
import {User,quizGrade} from '../../types'

export type QuizRoundMap = { rd1: number[]; rd2: number[]; rd3: number[] }

export async function fetchQuizRoundMap(): Promise<QuizRoundMap> {
  const rows = await mysql`SELECT id, name FROM mdl_quiz` as { id: number; name: string }[]
  const map: QuizRoundMap = { rd1: [], rd2: [], rd3: [] }
  for (const row of rows) {
    const name = row.name
    if (/round\s*1/i.test(name)) map.rd1.push(row.id)
    else if (/round\s*2/i.test(name)) map.rd2.push(row.id)
    else if (/round\s*3/i.test(name)) map.rd3.push(row.id)
  }
  return map
}



export async function fetchUsers(): Promise<User[]> {
  const rows = await  mysql`
    SELECT u.id, u.firstname, u.lastname, u.username,
           COALESCE(u.idnumber, u.email, CAST(u.id AS CHAR)) AS user_id,
           u.idnumber, g.name AS group_name
    FROM mdl_user u
    LEFT JOIN mdl_groups_members gm ON gm.userid = u.id
    LEFT JOIN mdl_groups g ON g.id = gm.groupid
    WHERE u.deleted = 0
    AND u.suspended = 0
    AND u.id > 2
  `  

   
   const objArr = (rows as any[]).map((row) =>(

       {
         id         : row.user_id,
         firstname  : row.firstname,
         lastname   : row.lastname,
         idnumber   : row.idnumber ?? '',
         group      : row.group_name ?? ''

       } satisfies User
   ))

   return objArr;
}



export async function fetchGrades(roundMap: QuizRoundMap): Promise<quizGrade[]> {
  const allQuizIds = [
    ...roundMap.rd1,
    ...roundMap.rd2,
    ...roundMap.rd3,
  ]

  if (allQuizIds.length === 0) return []

  const rows = await mysql`
    SELECT qg.quiz, qg.grade,
           COALESCE(u.idnumber, u.email, CAST(u.id AS CHAR)) AS userid
    FROM mdl_quiz_grades qg
    JOIN mdl_user u ON u.id = qg.userid
    WHERE qg.quiz IN ${mysql(allQuizIds)}
  ` as  Readonly<quizGrade[]>

  const objArr = rows.map((row)=>(

        {
           userid : row.userid,
           quiz   : Number(row.quiz),
           grade  : Number(row.grade)

        } satisfies quizGrade
  ))

  return objArr
    
}

