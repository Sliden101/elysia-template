import {sql,SQL} from 'bun'


 export const mysql = new SQL(Bun.env.MYSQL_URL??'mysql://moodleuser:moodlepass@localhost:13306/moodle')

