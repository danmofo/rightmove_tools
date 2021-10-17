/**
 * Disclaimer: I don't write a lot of NodeJS code.
 *
 * This could be so much better, but it's just a throwaway script I wrote when getting annoyed with how shite Rightmove's website is.
 * You can't set up alerts for searches which contain a drawn location on their map, so this is my own implementation so I don't have to sit refreshing their webpage...
 *
 * Args:
 * --poll, will continuously fetch the last page of results by the timeout (specified in minutes)
 * --full, populates the database with all search results, removes any existing data from the table...
 *
 * Ideally you'd populate the DB with --full first, then run it will --poll
 * 
 */

const process  = require('process');

const PropertyService = require('./property-service');
const RightmoveResultsParser = require('./rightmove-results-parser');
const EmailService = require('./email-service');
const config = require('./config');

(async () => {

    const [nodeBinaryPath, scriptPath, ...args] = process.argv;
    const mode = args.includes('--poll') ? 'poll' : 'full';
    const propertyService = new PropertyService();
    const maxDepth = mode === 'full' ? 99999 : 1;

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
            startingUrl: search.url,
            searchId: search.id,
            maxDepth: maxDepth,
            mode: mode,
            onNewPropertyAdded: newProperty => {
                EmailService.sendAlertEmail(newProperty);
            }
        }).init();
    }

})();