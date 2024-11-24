import { compareSync, hashSync } from "bcrypt"
import pool from "../config/db_pool"
import { AuthenticationError } from "../errors/AuthenticationError"
import { BadRequestError } from "../errors/BadRequestError"
import { sign } from "jsonwebtoken"

interface Register {
    email: string,
    first_name: string,
    last_name: string,
    password: string
}

interface Login {
    email: string,
    password: string
}

const salt = parseInt(process.env.BCRYPT_SALT as string)
const secretKey = process.env.SECRET_KEY as string

export default {
    register: async (data: Register) => {
        const hash = hashSync(data.password, salt)
        const res = await pool.query("INSERT INTO users (email, first_name, last_name, password, balance) VALUES($1, $2, $3, $4, $5)", [
            data.email, 
            data.first_name, 
            data.last_name,
            hash,
            0
        ]).catch(err => {
            if (err.code == "23505")
                throw new BadRequestError("Email sudah terdaftar")
            throw err
        })
        console.log(res)
        return "Registrasi berhasil silahkan login"
    },
    login: async (data: Login) => {
        const query = await pool.query("SELECT id, password FROM users WHERE email = $1 LIMIT 1", [data.email])
        if (query.rowCount == 0)
            throw new AuthenticationError("Username atau password salah")
        const user = query.rows[0] as { id: number, password : string }
        if (!compareSync(data.password, user.password))
            throw new AuthenticationError("Username atau password salah")
        const token = sign({
            id: user.id
        }, secretKey, { expiresIn: "1h" })
        return token
    }
}