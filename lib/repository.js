const admin = require('firebase-admin');
const log = require('./utils').log;

let credentials;

try {
    credentials = require('../gcsales-new-key');
} catch (e) {
    credentials = {
        "projectId": process.env.FIREBASE_PROJECT_ID,
        "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        "clientEmail": process.env.FIREBASE_CLIENT_EMAIL,
    };
}

admin.initializeApp({
    credential: admin.credential.cert(credentials)
});

const db = admin.firestore();

const getId = item => {
    return item.shop + '_' +
        item.name
            .replace(/\.{2,}/ig, '.')
            .replace(/\//ig, ';');
};


const save = (items) => {
    const tag = 'Repository';
    const collectionRef = db.collection('items');

    if (items) {
        log(tag, `Saving ${items.length} to Firestore.`);
        items.forEach(item => {
            const id = getId(item);
            collectionRef.doc(id).set(item, {merge: true});
        });
    }
};


module.exports.save = save;
