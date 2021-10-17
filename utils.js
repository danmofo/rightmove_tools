const queryString = require('query-string');

module.exports = {

	getPageMeta(rightmoveSearchResultsUrl) {
		const [baseUrl, query] = rightmoveSearchResultsUrl.split('?');

		// This shouldn't ever happen, if it does we want the program to crash.
		if(!query) {
			throw new Error(`URL doesn't contain a query string.`);
		}

		// Bumps the 'index' parameter by 24 to get the URL for the next page.
		const parsed = queryString.parse(query);
		const currentIdx = parseInt(parsed.index, 10);
		const nextIdx = currentIdx ? currentIdx + 24 : 24;
		const currentPage = nextIdx / 24;

		parsed.index = nextIdx;
	
		return {
			next: `${baseUrl}?${queryString.stringify(parsed)}`,
			currentPage: currentPage,
			nextPage: currentPage + 1
		};
	},

	getAbsoluteImageUrl(relativeImageUrl) {
		return `https://media.rightmove.co.uk/${relativeImageUrl}`;
	},

	makeRelativeImageUrlsAbsolute(propertyImages) {
		for (let i = propertyImages.length - 1; i >= 0; i--) {
			propertyImages[i].url = this.getAbsoluteImageUrl(propertyImages[i].url);
		}
	}

}