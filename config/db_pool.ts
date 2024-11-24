import { Pool } from 'pg'

const pool = new Pool({
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    port: parseInt(process.env.POSTGRES_PORT as string) 
})

export default pool