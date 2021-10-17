/**
 * Disclaimer: I don't write a lot of NodeJS code.
 * 
 * Args:
 * --poll, will continuously fetch the last page of results by the timeout (inside config.js)
 * --full, populates the database with all search results, removes any existing data from the tables.
 *
 * Ideally you'd populate the DB with --full first, then run it will --poll
 * 
 */

const process  = require('process');
const fs = require('fs').promises;

const PropertyService = require('./property-service');
const RightmoveResultsParser = require('./rightmove-results-parser');
const EmailService = require('./email-service');
const config = require('./config');

(async () => {

    const [nodeBinaryPath, scriptPath, ...args] = process.argv;
    const mode = args.includes('--poll') ? 'poll' : 'full';
    const propertyService = new PropertyService();
    const maxDepth = mode === 'full' ? 99999 : 1;

    console.log('\n');
    console.log((await fs.readFile('./cli-banner.txt', 'binary')).toString());
    console.log('\n');
    console.log('Configuration');
    console.log('-------------');
    console.log(`Mode: ${mode}`);
    console.log(`Max depth: ${maxDepth}`);
    console.log(`Searches:`);
    console.log(config.SEARCHES);
    console.log('\n');

    if(mode === 'full') {
        await propertyService.deleteExisting();
        await propertyService.initDatabase();
        for(const search of config.SEARCHES) {
            await propertyService.saveSearch(search);
        }
    }

    const searches = await propertyService.listSearches();

    for(const search of searches) {
        await fetchResultsForSearch(search);

        if(mode === 'poll') {
            setInterval(async () => {
                await fetchResultsForSearch(search);
            }, config.POLL_INTERVAL_SECONDS * 1000);
        }
    }

    async function fetchResultsForSearch(search) {
        await new RightmoveResultsParser({
            search: search,
            startingUrl: search.url,
            searchId: search.id,
            maxDepth: maxDepth,
            onNewPropertyAdded: async newProperty => {
                console.log('Found new property!');
                let ignoreKeywords = [];
                if(search.ignore_keywords) {
                    ignoreKeywords = search.ignore_keywords.split(',');
                }

                if(containsBlacklistedTerm(newProperty.address, ignoreKeywords)) {
                    console.log(`Property matched an ignored keyword (one of '${ignoreKeywords.join(',')}'), not sending alert email.`);
                    return;
                }
                await EmailService.sendAlertEmail(newProperty);     
            }
        }).init();
    }

    function containsBlacklistedTerm(str, blacklist) {
        for (let i = 0; i < blacklist.length; i++) {
            const keyword = blacklist[i].toLowerCase();
            if(str.toLowerCase().includes(keyword)) {
                return true;   
            }
        }
        return false;
    }

})();