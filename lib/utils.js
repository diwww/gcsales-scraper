const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const log = (tag, message) => {
    tag = tag || 'Unknown';
    console.log(`${tag}: ${message}`)
};

module.exports.sleep = sleep;
module.exports.log = log;
