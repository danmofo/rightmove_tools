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

(async () => {

    const [nodeBinaryPath, scriptPath, ...args] = process.argv;
    const mode = args.includes('--poll') ? 'poll' : 'full';
    const propertyService = new PropertyService();
    const maxDepth = mode === 'full' ? 99999 : 1;

    if(mode === 'full') {
        await propertyService.deleteExisting();
        await propertyService.initDatabase();
        await propertyService.saveSearch({
            url: 'https://www.rightmove.co.uk/property-to-rent/find.html?locationIdentifier=USERDEFINEDAREA%5E%7B%22id%22%3A%226964845%22%2C%20%22polylines%22%3A%22wsk~HvhiKqyjA~ayAsjFpo%7CA%60w%5EnpFpytClbs%40%7CfzCxgfAj_%40_xkJ%7D%7BaE%7Bu%7CCc%7DDrpd%40efw%40rvdAnlAhtcB%22%7D&maxBedrooms=2&maxPrice=900&minPrice=700&propertyTypes=flat&primaryDisplayPropertyType=flats&maxDaysSinceAdded=14&mustHave=&dontShow=student%2ChouseShare%2Cretirement&furnishTypes=&keywords=',
            label: 'Flats within 1-2 hours of Evesham.'
        });
    }

    const searches = await propertyService.listSearches();

    for(const search of searches) {
        await fetchResultsForSearch(search);

        if(mode === 'poll') {
            setInterval(async () => {
                await fetchResultsForSearch(search);
            }, 10000);
        }
    }

    async function fetchResultsForSearch(search) {
        await new RightmoveResultsParser({
            startingUrl: search.url,
            searchId: search.id,
            maxDepth: maxDepth,
            mode: mode,
            onNewPropertyAdded: newProperty => {
                if(mode !== 'full') {
                    EmailService.sendAlertEmail(newProperty);
                } else {
                    console.log('Not sending alert email on full mode.');
                }
            }
        }).init();
    }

})();