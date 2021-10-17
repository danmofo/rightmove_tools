/**
 * This crawls through the search results of a rightmove search URL and inserts them into a db table.
 *
 * This is a mega class that does loads of shit, it should really be split up into different bits, but I can't be bothered.
 */

const puppeteer = require('puppeteer');

const PropertyService = require('./property-service');
const utils = require('./utils');

class RightmoveResultsParser {
    constructor({ maxDepth, onNewPropertyAdded, search }) {
        console.log(`Fetching '${search.label}'`);
        this.propertyService = new PropertyService();
        this.currentUrl = search.url;
        this.browser = null;
        this.page = null;
        this.maxDepth = maxDepth;
        this.currentDepth = 0;
        this.searchId = search.id;

        this.onNewPropertyAdded = onNewPropertyAdded;
    }

    async init() {
        this.browser = await puppeteer.launch();
        this.page = await this.browser.newPage();
        this.savePropertiesFromCurrentPage();
    }

    getPropertyAddedDate(propertyAddedDateStr) {
        const date = Date.parse(propertyAddedDateStr)
        const out = new Date()
        out.setTime(date);
        return out;
    }

    async setMostRecentProperty(property) {
        const currentMaxId = await this.propertyService.getCurrentMaxIdForSearch(this.searchId);
        const hasExistingMaxId = !!currentMaxId;

        if(hasExistingMaxId) {
            const currentMaxProperty = await this.propertyService.findById(currentMaxId);
            const propertyDate = this.getPropertyAddedDate(property.listingUpdate.listingUpdateDate);

            if(propertyDate <= currentMaxProperty.added) {
                return;
            }
        }

        await this.propertyService.setMostRecentPropertyIdForSearch(this.searchId, property.id);

        // Prevent property alerts being sent the first time the table is seeded.
        if(hasExistingMaxId) {
            const addedProperty = await this.propertyService.findById(property.id);
            await this.onNewPropertyAdded(addedProperty);
        } else {
            console.log(`This search no most_recent_property_id value, not sending alert.`);
        }
        
    }

    async savePropertiesFromCurrentPage() {
        if(this.currentDepth === this.maxDepth) {
            console.log(`Complete: Reached max depth of ${this.maxDepth}`);
        	await this.browser.close();
        	return;
        }

    	let pageMeta = utils.getPageMeta(this.currentUrl);
        console.log(`Saving page: ${pageMeta.currentPage}`);

        await this.page.goto(this.currentUrl);

        const properties = await this.extractPropertiesFromPage();

        if(properties.length === 0) {
        	console.log('Complete: Reached the last search result page.');
        	await this.browser.close();
        	return;
        }

        this.setMostRecentProperty(properties[0]);

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