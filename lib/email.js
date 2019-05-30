const sgMail = require('@sendgrid/mail');

const email = (options) => {
    const tag = options.tag || 'Unknown';
    const err = options.err;

    if (err) {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
            to: process.env.SENDGRID_TO,
            from: process.env.SENDGRID_FROM,
            subject: `${tag}: Scraping failed`,
            text: 'test',
            html: `<span style="white-space: pre-line">${err.stack}</span>\n`,
        };
        sgMail.send(msg);
    }
};

module.exports.email = email;
