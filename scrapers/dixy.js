const scraper = require('../lib/scraper');
const moment = require('moment/moment');
const utils = require('../lib/utils');

const convert = tags => tags.map(tag => {
    const getName = tag => {
        const nameTag = tag.querySelector('.full-description > .name') || tag.querySelector('.name');
        if (nameTag) {
            return nameTag.textContent;
        } else {
            return "";
        }
    };

    const getImageUrl = tag => {
        const imageTag = tag.querySelector('img.preview');
        if (imageTag) {
            return 'https://dixy.ru' + imageTag.getAttribute('src');
        } else {
            return "";
        }
    };

    const getPrices = tag => {
        const result = {};
        const pricesTag = tag.querySelector('.price > p');
        if (pricesTag) {
            const parts = pricesTag.textContent.trim().split(/\s+/);
            result.newPrice = parseFloat(parts[0] + '.' + parts[1]);
            result.oldPrice = parseFloat(parts[2] + parts[3]);
        }
        result.oldPrice = result.oldPrice || 0;
        result.newPrice = result.newPrice || 0;
        return result;
    };

    // FIXME
    const getEndDate = tag => {
        const dateTag = tag.querySelector('.dl');
        if (dateTag) {
            const dateString = dateTag.textContent.replace(/\D/g, '');
            const days = parseInt(dateString);
            return days || 1;
        } else {
            return 1;
        }
    };

    const result = {};

    result.shop = 'Дикси';
    result.name = getName(tag);
    result.imageUrl = getImageUrl(tag);
    result.oldPrice = getPrices(tag).oldPrice;
    result.newPrice = getPrices(tag).newPrice;
    result.endDate = getEndDate(tag);

    return result;
});




const options = {
    tag: 'Dixy',
    url: 'https://dixy.ru/catalog/'
};

options.func = async (page) => {
    const buttonSelector = '.btn.view-more';
    while (true) {
        try {
            await page.waitForSelector(buttonSelector, {timeout: 5000});
            const button = await page.$(buttonSelector);
            console.log('getting next page');
            await button.click();
            await button.dispose();
            await utils.sleep(2000);
        } catch (err) {
            console.log(err.name);
            break;
        }
    }

    const items = await page.$$eval('.items.products > .item', convert);
    items.forEach(item => {
        const n = item.endDate;
        // increment date by n days, then set the time to 00:00 (start of the day)
        item.endDate = moment().add(n, 'days').startOf('day').toDate();
    });

    return items;
};

scraper.scrape(options);