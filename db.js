const mysql = require('mysql2/promise');
const env = require('dotenv').config();
const process = require('process');

module.exports = {
	async getConnection() {
		return mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			timezone: 'Z'
		});
	}
}