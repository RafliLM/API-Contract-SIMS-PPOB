import pool from "../config/db_pool"
import supabase from "../config/supabase"
import { NotFoundError } from "../errors/NotFoundError"

interface UpdateProfile {
    first_name: string,
    last_name: string
}

interface User {
    email: string,
    first_name: string,
    last_name: string,
    profile_image: string
}

export default {
    getProfile : async (id : number) => {
        const query = await pool.query("SELECT email, first_name, last_name, profile_image FROM users WHERE id = $1", [id])
        if (query.rowCount == 0)
            throw new NotFoundError("User tidak ditemukan")
        let user = query.rows[0] as User
        if (user.profile_image != null)
            user.profile_image = supabase.getPublicUrl(user.profile_image).data.publicUrl
        return user
    },
    updateProfile : async (id: number, data: UpdateProfile) => {
        const query = await pool.query("UPDATE users SET first_name = $1, last_name = $2 WHERE id = $3 RETURNING email, first_name, last_name, profile_image", [data.first_name, data.last_name, id])
        if (query.rowCount == 0)
            throw new NotFoundError("User tidak ditemukan")
        let user = query.rows[0] as User
        if (user.profile_image != null)
            user.profile_image = supabase.getPublicUrl(user.profile_image).data.publicUrl
        return user
    },
    updateProfileImage : async (id: number, file: Express.Multer.File) => {
        const filename = `${id}.${file.mimetype.split("/")[1]}`
        const uploadImage = await supabase.upload(filename, file.buffer, {
            contentType: file.mimetype,
            upsert: true
        })
        if (uploadImage.error)
            throw new Error(uploadImage.error.message)
        const query = await pool.query("UPDATE users SET profile_image = $1 WHERE id = $2 RETURNING email, first_name, last_name, profile_image", [filename, id])
        if (query.rowCount == 0)
            throw new Error("Update Profile Image gagal")
        let user = query.rows[0] as User
        if (user.profile_image != null)
            user.profile_image = supabase.getPublicUrl(user.profile_image).data.publicUrl
        return user
    }
}