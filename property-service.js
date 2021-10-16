/**
 * This kinda sucks because it creates a connection inside each method, we should use
 * a connection pool or something.
 */

const db = require('./db');

class PropertyService {
	constructor() {
		this.init();
	}

	async init() {
		await this.initDatabase();
	}

	async initDatabase() {
		console.log('Initialising the database...');

	    const conn = await db.getConnection();
	    await conn.query('create database if not exists rightmove;');
	    await conn.query(`
	        create table if not exists rightmove.property (
	            id bigint not null,
	            type varchar(255),
	            price decimal(10, 2) not null,
	            lat double,
	            lng double,
	            bedroom_count int,
	            bathroom_count int,
	            agent_name varchar(255),
	            agent_tel varchar(255),
	            address text,
	            summary text,
	            last_updated datetime null,
	            created datetime default current_timestamp,
	            primary key(id)
	        );
	    `);

	    await conn.end()
	}

	async deleteExisting() {
		console.log('Deleting the existing rightmove.property table.');
		const conn = await db.getConnection();
		try {
			await conn.query('drop table rightmove.property');
		} catch(err) {
			console.log('rightmove.property does not exist so nothing to delete.');
		}
		
		await conn.end();
	}

	async save(property) {
		const conn = await db.getConnection();

		await conn.query('insert ignore into rightmove.property set ?', {
			id: property.id,
			type: property.propertySubType,
			lat: property.location.latitude,
			lng: property.location.longitude,
			bedroom_count: property.bedrooms || 1,
			bathroom_count: property.bathrooms || 1,
			agent_tel: property.customer.contactTelephone,
			agent_name: property.customer.branchDisplayName,
			price: property.price.amount,
			address: property.displayAddress,
			summary: property.summary,
			last_updated: property.listingUpdate.listingUpdateDate
		})

		await conn.end();
	}

	log(property) {
		console.log(`ID: ${property.id}, Amount: £${property.price.amount}, Updated: ${property.listingUpdate.listingUpdateDate}`)
		console.log(property.displayAddress)
		console.log(property.summary)
		console.log('\n')
	}
}

module.exports = PropertyService;