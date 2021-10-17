/**
 * Things that are bad with this...
 * - No referential integrity (because I CBA to deal with dropping/creating tables in specific order)
 * - Loads of db code in here, ideally they'd be abstracted out into a DAO
 * - No separation of concerns, lots of unrelated crap in here.
 */

const db = require('./db');

class PropertyService {
	constructor() {}

	async listSearches() {
		const conn = await db.getConnection();
		const [data, cols] = await conn.query('select * from rightmove.search');
		await conn.end();
		return data;
	}

	async initDatabase() {
		console.log('Initialising the database...');

	    const conn = await db.getConnection();
	    
	    await this.createRightmoveDatabase(conn);
	    await this.createSearchTable(conn);
	    await this.createPropertyTable(conn);

	    await conn.end();
	}

	async createRightmoveDatabase(conn) {
		await conn.query('create database if not exists rightmove;');
	}

	async createPropertyTable(conn) {
		await conn.query(`
		    create table if not exists rightmove.property (
		        id bigint not null,
		        search_id int,
		        type varchar(255),
		        added datetime null,
		        price decimal(10, 2) not null,
		        address text,
		        summary text,
		        bedroom_count int,
		        bathroom_count int,
		        lat double,
		        lng double,
		        agent_name varchar(255),
		        agent_tel varchar(255),
		        primary key(id)
		    );
		`);
	}

	async createSearchTable(conn) {
		// This should have a foreign key, but both tables reference each other and I cba to figure it out/improve the design
		await conn.query(`
			create table if not exists rightmove.search (
				id int not null auto_increment,
				most_recent_property_id bigint null,
				label text,
				url text,
				primary key(id)
			);
		`)
	}

	async deleteExisting() {
		console.log('Deleting the existing rightmove.* tables...');
		const conn = await db.getConnection();

		await this.tryDropTable(conn, 'rightmove.property');
		await this.tryDropTable(conn, 'rightmove.search');
		
		await conn.end();
	}

	async tryDropTable(conn, name) {
		try {
			await conn.query(`drop table ${name}`)
		} catch(err) {
			console.log(`Failed to drop table: ${name}`);
		}
	}

	async save(searchId, property) {
		const conn = await db.getConnection();

		await conn.query('insert ignore into rightmove.property set ?', {
			id: property.id,
			search_id: searchId,
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
			added: property.listingUpdate.listingUpdateDate
		})

		await conn.end();
	}

	async saveSearch(search) {
		const conn = await db.getConnection();

		await conn.query('insert into rightmove.search set ?', {
			label: search.label,
			url: search.url
		});

		await conn.end();
	}

	async getCurrentMaxIdForSearch(searchId) {
		const conn = await db.getConnection();
		const [data, cols] = await conn.query('select most_recent_property_id from rightmove.search where id = ?', [searchId]);
		await conn.end();
		return data[0].most_recent_property_id;
	}

	async setMaxIdForSearch(searchId, maxPropertyId) {
		console.log(`setMaxIdForSearch(${searchId}, ${maxPropertyId})`);
		const conn = await db.getConnection();
		await conn.query('update rightmove.search set most_recent_property_id = ? where id = ?', [maxPropertyId, searchId]);
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