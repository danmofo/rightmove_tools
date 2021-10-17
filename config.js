module.exports = {
	POLL_INTERVAL_SECONDS: 60,
	SEARCHES: [
		{
			// Search result page URL
			url: 'https://www.rightmove.co.uk/property-to-rent/find.html?locationIdentifier=USERDEFINEDAREA%5E%7B%22id%22%3A%226964845%22%2C%20%22polylines%22%3A%22wsk~HvhiKqyjA~ayAsjFpo%7CA%60w%5EnpFpytClbs%40%7CfzCxgfAj_%40_xkJ%7D%7BaE%7Bu%7CCc%7DDrpd%40efw%40rvdAnlAhtcB%22%7D&maxBedrooms=2&maxPrice=900&minPrice=700&propertyTypes=flat&primaryDisplayPropertyType=flats&maxDaysSinceAdded=14&mustHave=&dontShow=student%2ChouseShare%2Cretirement&furnishTypes=&keywords=',
			// Describes what the search is for
			label: 'Flats within 1-2 hours of Evesham',
			// Keywords to ignore, these are lowercased and compared against a lowercased version of the address.
			ignoreKeywords: ['birmingham']
		}
	]
}