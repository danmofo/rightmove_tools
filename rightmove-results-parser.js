/**
 * This crawls through the search results of a rightmove search URL and inserts them into a db table.
 *
 * This is a mega class that does loads of shit, it should really be split up into different bits, but I can't be bothered.
 */

const puppeteer = require('puppeteer');

const PropertyService = require('./property-service');
const utils = require('./utils');

class RightmoveResultsParser {
    constructor({ startingUrl, maxDepth, searchId, onNewPropertyAdded }) {
    	console.log('----------------------------')
    	console.log('Configuration');
    	console.log('----------------------------')
    	console.log(`Starting URL: ${startingUrl}`);
    	console.log(`Max depth: ${maxDepth}`);
    	console.log('\n')
    	
        this.propertyService = new PropertyService();
        this.currentUrl = startingUrl;
        this.browser = null;
        this.page = null;
        this.maxDepth = maxDepth;
        this.currentDepth = 0;
        this.searchId = searchId;
        this.maxPropertyId = null;

        this.onNewPropertyAdded = onNewPropertyAdded;
    }

    async init() {
        console.log('Launching headless browser...');
        this.browser = await puppeteer.launch();
        this.page = await this.browser.newPage();
        this.savePropertiesFromCurrentPage();
    }

    async setMaxPropertyIdForSearch(property) {
        console.log(`setMaxPropertyIdForSearch(${property.id})`);
        this.maxPropertyId = property.id;
        const currentMaxId = await this.propertyService.getCurrentMaxIdForSearch(this.searchId);
        console.log(currentMaxId);
        if(currentMaxId >= this.maxPropertyId) {
            console.log('Not changing max ID for this one.');
            return;
        }
        await this.propertyService.setMaxIdForSearch(this.searchId, this.maxPropertyId);
        await this.onNewPropertyAdded(property);
    }

    async savePropertiesFromCurrentPage() {
        if(this.currentDepth === this.maxDepth) {
        	console.log(`Reached max depth of ${this.maxDepth}`);
        	await this.browser.close();
        	return;
        }

    	let pageMeta = utils.getPageMeta(this.currentUrl);
        console.log(`Navigating to page: ${pageMeta.currentPage}`);

        await this.page.goto(this.currentUrl);

        const properties = await this.extractPropertiesFromPage();

        if(properties.length === 0) {
        	console.log('No more properties found!');
        	await this.browser.close();
        	return;
        }

        this.setMaxPropertyIdForSearch(properties[0]);

        for(const property of properties) {
        	// console.log(property);
        	// this.propertyService.log(property);
        	await this.propertyService.save(this.searchId, property);
        }

        this.currentDepth = pageMeta.currentPage;
        this.currentUrl = pageMeta.next;

        this.savePropertiesFromCurrentPage();
    }

    async extractPropertiesFromPage() {
    	const model = await this.page.evaluate(() => {
    	    return window.jsonModel
    	});

    	return this.removeFeaturedProperties(model.properties);
    }

    removeFeaturedProperties(properties) {
    	return properties.filter(property => !property.featuredProperty);
    }
}

module.exports = RightmoveResultsParser;