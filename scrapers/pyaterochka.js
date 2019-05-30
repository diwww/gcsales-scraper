const scraper = require('../lib/scraper');
const moment = require('moment/moment');
const utils = require('../lib/utils');

const convert = tags => tags.map(tag => {
    const getName = tag => {
        const nameTag = tag.querySelector('.product__title');
        if (nameTag) {
            return nameTag.textContent.trim();
        } else {
            return "";
        }
    };

    const getImageUrl = tag => {
        const imageTag = tag.querySelector('.product__image_img');
        if (imageTag) {
            return imageTag.getAttribute('src');
        } else {
            return "";
        }
    };

    const getPrices = tag => {
        const result = {};
        const pricesTag = tag.querySelector('.cost.cost-chaos');
        if (pricesTag) {
            const newPriceRubTag = pricesTag.querySelector('.cost__current_rub');
            const newPriceKopTag = pricesTag.querySelector('.cost__current_kop');
            if (newPriceRubTag && newPriceKopTag) {
                const newPriceRub = newPriceRubTag.textContent || '0';
                const newPriceKop = newPriceKopTag.textContent || '0';
                result.newPrice = parseFloat(newPriceRub + '.' + newPriceKop);
            }

            const oldPriceTag = pricesTag.querySelector('.cost__prev > .cost__brake');
            if (oldPriceTag) {
                const parts = oldPriceTag.textContent.trim().split(/\s+/);
                result.oldPrice = parseFloat(parts[0] + '.' + parts[1]);
            }

        }
        result.oldPrice = result.oldPrice || 0;
        result.newPrice = result.newPrice || 0;
        return result;
    };

    const getEndDate = tag => {
        const dateTag = tag.querySelector('.product__info_day-num');
        if (dateTag) {
            const dateString = dateTag.textContent.replace(/\D/g, '');
            const days = parseInt(dateString);
            return days || 1;
        } else {
            return 1;
        }
    };


    const result = {};

    result.shop = 'Пятерочка';
    result.name = getName(tag);
    result.imageUrl = getImageUrl(tag);
    result.oldPrice = getPrices(tag).oldPrice;
    result.newPrice = getPrices(tag).newPrice;
    result.endDate = getEndDate(tag);

    return result;
});

const options = {
    tag: 'Pyaterochka',
    url: 'https://5ka.ru/special_offers/?records_per_page=60&page=1'
};

options.func = async (page) => {
    const buttonSelector = '.btn__show_more';
    while (true) {
        try {
            await Promise.all([
                page.waitForNavigation({
                    timeout: 10000,
                    waitUntil: 'networkidle2'
                }),
                page.click(buttonSelector)
            ]);
            console.log('getting next page');
        } catch (err) {
            console.log(err.name);
            break;
        }
    }

    const items = await page.$$eval('.catalog__list.row > .catalog__item', convert);
    items.forEach(item => {
        const n = item.endDate;
        // increment date by n days, then set the time to 00:00 (start of the day)
        item.endDate = moment().add(n, 'days').startOf('day').toDate();
    });

    return items;
};

scraper.scrape(options);
