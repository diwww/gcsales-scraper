const puppeteer = require('puppeteer');
const repository = require('./repository');
const email = require('./email').email;
const log = require('./utils').log;

const scrape = async (options) => {
    const tag = options.tag;
    const url = options.url;
    const func = options.func;

    if (url && func) {
        log(tag, 'Scraping started.');
        const browser = await puppeteer.launch({args: ['--no-sandbox']});
        const page = await browser.newPage();

        try {
            await page.goto(options.url, {
                waitUntil: 'networkidle2'
            });
            log(tag, `Page ${options.url} loaded.`);

            const result = await options.func(page);
            log(tag, 'Scraping done.');
            log(tag, `Items scraped: ${result.length}.`);

            repository.save(result);
        } catch (e) {
            log(tag, e.name);
            log(tag, e.message);
            email({
                tag: tag,
                err: e
            })
        } finally {
            await browser.close();
        }
    } else {
        log(tag, 'No url or scrape function provided.')
    }
};

module.exports.scrape = scrape;
