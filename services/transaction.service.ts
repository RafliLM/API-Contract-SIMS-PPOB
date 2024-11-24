import pool from "../config/db_pool"
import { BadRequestError } from "../errors/BadRequestError"
import { NotFoundError } from "../errors/NotFoundError"

interface Service {
    service_name: string,
    service_tariff: number
}

export default {
    getBalance: async (id: number) => {
        const query = await pool.query("SELECT balance FROM users WHERE id = $1", [id])
        if (query.rowCount == 0)
            throw new NotFoundError("User tidak ditemukan")
        const { balance } = query.rows[0] as { balance: number }
        return Number(balance)
    },
    topupBalance: async (id: number, amount: number) => {
        const invoice_number = `${id}${Date.now()}`
        const transactionType = "TOPUP"
        const description = "Top Up Balance"
        const client = await pool.connect()
        try {
            await client.query("BEGIN")
            const updateBalance = await pool.query("UPDATE users SET balance = balance + $1 WHERE id = $2 RETURNING balance", [amount, id])
            if (updateBalance.rowCount == 0)
                throw new NotFoundError("User tidak ditemukan")
            await pool.query(
                "INSERT INTO transactions (invoice_number, transaction_type, description, total_amount, user_id) VALUES ($1, $2, $3, $4, $5)", 
                [
                    invoice_number,
                    transactionType,
                    description,
                    amount,
                    id
                ]
            )
            const { balance } = updateBalance.rows[0] as { balance: number }
            await client.query("COMMIT")         
            return Number(balance)
        } catch (error) {
            await client.query("ROLLBACK")
            throw error
        } finally {
            client.release()
        }
        
    },
    createTransaction: async (id: number, code: string) => {
        const query = await pool.query("SELECT service_name, service_tariff FROM services WHERE service_code = $1", [code])
        if (query.rowCount == 0)
            throw new BadRequestError("Service atau Layanan tidak ditemukan")
        const service = query.rows[0] as Service
        const invoice_number = `${id}${Date.now()}`
        const transactionType = "PAYMENT"
        const checkUser = await pool.query("SELECT * FROM users WHERE id = $1", [id])
        if (checkUser.rowCount == 0)
            throw new NotFoundError("User tidak ditemukan")
        const client = await pool.connect()
        try {
            await client.query("BEGIN")
            const createTransaction = await pool.query(
                "INSERT INTO transactions (invoice_number, transaction_type, description, total_amount, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING invoice_number, transaction_type, total_amount, created_on", 
                [
                    invoice_number,
                    transactionType,
                    service.service_name,
                    Number(service.service_tariff),
                    id
                ]
            )
            
            await pool.query("UPDATE users SET balance = balance - $1 WHERE id = $2", [
                Number(service.service_tariff),
                id
            ])
            if (createTransaction.rowCount == 0)
                throw new Error("Terjadi error ketika membuat transaksi")
            const transaction = createTransaction.rows[0]
            await client.query("COMMIT")
            return {
                ...transaction,
                service_code: code,
                service_name: service.service_name,
                total_amount: Number(transaction.total_amount)
            }
        } catch (error) {
            await client.query("ROLLBACK")
            throw error
        } finally {
            client.release()
        }
    },
    getTransactionHistory: async (id: number, offset: number, limit?: number) => {
        if (limit) {
            const transactions = await pool.query("SELECT invoice_number, transaction_type, description, total_amount, created_on FROM transactions WHERE user_id = $1 ORDER BY created_on DESC LIMIT $2 OFFSET $3", [
                id,
                limit,
                offset
            ])
            return {
                offset,
                limit,
                records: transactions.rows.map(transaction => {
                    return {
                        ...transaction,
                        total_amount: Number(transaction.total_amount)
                    }
                })
            }
        }
        const transactions = await pool.query("SELECT invoice_number, transaction_type, description, total_amount, created_on FROM transactions WHERE user_id = $1 ORDER BY created_on DESC OFFSET $2", [
            id,
            offset
        ])
        return {
            offset,
            limit: transactions.rowCount,
            records: transactions.rows.map(transaction => {
                return {
                    ...transaction,
                    total_amount: Number(transaction.total_amount)
                }
            })
        }
        
    }
}