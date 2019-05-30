const scraper = require('../lib/scraper');
const moment = require('moment/moment');
const utils = require('../lib/utils');

const convert = tags => tags.map(tag => {
    const getName = tag => {
        const nameTag = tag.querySelector('.products__item-title > a');
        if (nameTag) {
            return nameTag.textContent.trim();
        } else {
            return "";
        }
    };

    const getImageUrl = tag => {
        const imageTag = tag.querySelector('.products__item-img');
        if (imageTag) {
            return imageTag.getAttribute('src');
        } else {
            return "";
        }
    };

    const getPrices = tag => {
        const result = {};
        const pricesTag = tag.querySelector('.products__item-price-block');
        if (pricesTag) {
            const newPriceTag = pricesTag.querySelector('.products__item-current-price.current-price');
            const oldPriceTag = pricesTag.querySelector('.products__item-old-price.old-price');

            if (newPriceTag) {
                result.newPrice = parseFloat(newPriceTag.textContent);
            }
            if (oldPriceTag) {
                result.oldPrice = parseFloat(oldPriceTag.textContent);
            }
        }
        result.oldPrice = result.oldPrice || 0;
        result.newPrice = result.newPrice || 0;
        return result;
    };

    const getEndDate = tag => {
        return 1;
    };

    const result = {};

    result.shop = 'Ашан';
    result.name = getName(tag);
    result.imageUrl = getImageUrl(tag);
    result.oldPrice = getPrices(tag).oldPrice;
    result.newPrice = getPrices(tag).newPrice;
    result.endDate = getEndDate(tag);

    return result;
});

const options = {
    tag: 'Auchan',
    url: 'https://www.auchan.ru/pokupki/eda/rasprodazha.html'
};

options.func = async (page) => {
    const buttonSelector = '.pagination__arrow--next';
    const buttonDisabledSelector = buttonSelector + '.disabled';
    let items = [];
    while (await page.$(buttonDisabledSelector) === null) {
        try {
            items = items.concat(await page.$$eval('.products__list > .products__item', convert));
            console.log('getting next page');
            await Promise.all([
                page.waitForNavigation({
                    timeout: 10000,
                    waitUntil: 'networkidle2'
                }),
                page.click(buttonSelector)
            ]);
        } catch (err) {
            console.log(err.name);
            break;
        }
    }
    // Scrape last page
    items = items.concat(await page.$$eval('.products__list > .products__item', convert));

    items.forEach(item => {
        const n = item.endDate;
        // increment date by n days, then set the time to 00:00 (start of the day)
        item.endDate = moment().add(n, 'days').startOf('day').toDate();
    });

    return items;
};

scraper.scrape(options);
