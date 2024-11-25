CREATE TABLE IF NOT EXISTS users (
	id serial PRIMARY KEY,
	email VARCHAR NOT NULL UNIQUE,
	first_name VARCHAR NOT NULL,
	last_name VARCHAR NOT NULL,
	password VARCHAR NOT NULL,
	balance bigint NOT NULL CHECK (balance >= 0),
	profile_image VARCHAR
);

CREATE TABLE IF NOT EXISTS banners (
	banner_name VARCHAR PRIMARY KEY,
	banner_image VARCHAR NOT NULL,
	description VARCHAR NOT NULL
);

CREATE TABLE IF NOT EXISTS services (
	service_code VARCHAR PRIMARY KEY,
	service_name VARCHAR NOT NULL,
	service_icon VARCHAR NOT NULL,
	service_tariff bigint NOT NULL CHECK (service_tariff >= 0)
);

CREATE TABLE IF NOT EXISTS transactions (
	invoice_number VARCHAR PRIMARY KEY,
	transaction_type VARCHAR NOT NULL CHECK (transaction_type IN ('PAYMENT', 'TOPUP')),
	description VARCHAR NOT NULL,
	total_amount bigint NOT NULL CHECK (total_amount >= 0),
	created_on TIMESTAMP DEFAULT NOW(),
	user_id int REFERENCES users
);
