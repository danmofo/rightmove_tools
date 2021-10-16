/**
 * This crawls through the search results of a rightmove search URL and inserts them into a db table.
 *
 * This is a mega class that does loads of shit, it should really be split up into different bits, but I can't be bothered.
 */

const puppeteer = require('puppeteer');

const PropertyService = require('./property-service');
const utils = require('./utils');

class RightmoveResultsParser {
    constructor({ mode, startingUrl, maxDepth }) {
    	console.log('----------------------------')
    	console.log('Configuration');
    	console.log('----------------------------')
    	console.log(`Mode: ${mode}`);
    	console.log(`Starting URL: ${startingUrl}`);
    	console.log(`Max depth: ${maxDepth}`);
    	console.log('\n')
    	
        this.propertyService = new PropertyService();
        this.currentUrl = startingUrl;
        this.browser = null;
        this.page = null;
        this.maxDepth = maxDepth;
        this.currentDepth = 0;
        this.mode = mode;
    }

    async init() {
    	if(this.mode === 'full') {
    		await this.propertyService.deleteExisting();
    	}

        console.log('Launching headless browser...');
        this.browser = await puppeteer.launch();
        this.page = await this.browser.newPage();
        this.savePropertiesFromCurrentPage();
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

        for(const property of properties) {
        	console.log(property);
        	this.propertyService.log(property);
        	await this.propertyService.save(property);
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