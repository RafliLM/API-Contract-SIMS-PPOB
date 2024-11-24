import pool from "../config/db_pool"
import supabase from "../config/supabase"

interface Banner {
    banner_name: string,
    banner_image: string,
    description: string
}

interface Service {
    service_code: string,
    service_name: string,
    service_icon: string,
    service_tariff: number
}

export default {
    getBanners : async () => {
        const query =  await pool.query("SELECT * FROM banners")
        const banners = query.rows as Banner[]
        return banners.map(banner => {
            const banner_image = supabase.getPublicUrl(banner.banner_image).data.publicUrl
            return {
                ...banner,
                banner_image
            }
        })
    },
    getServices : async () => {
        const query =  await pool.query("SELECT * FROM services")
        const services = query.rows as Service[]
        return services.map(service => {
            const service_icon = supabase.getPublicUrl(service.service_icon).data.publicUrl
            return {
                ...service,
                service_icon,
                service_tariff: Number(service.service_tariff)
            }
        })
    }
}