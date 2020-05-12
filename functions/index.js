const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.cert('yeyby-c072f-firebase-adminsdk-v1abn-161dfcc7de.json'),
  databaseURL: 'https://yeyby-c072f.firebaseio.com',
});
const settings = { timestampsInSnapshots: true };
admin.firestore().settings(settings);
const db = admin.firestore();

const executeOnce = (change, context, task) => {
  const eventRef = db.collection('events').doc(context.eventId);
  return db.runTransaction((t) =>
    t
      .get(eventRef)
      .then((docSnap) => (docSnap.exists ? null : task(t)))
      .then(() => t.set(eventRef, { processed: true }))
  );
};

const documentCounter = (collectionName) => (change, context) =>
  executeOnce(change, context, (t) => {
    // on create
    if (!change.before.exists && change.after.exists) {
      return t.get(db.collection('metadatas').doc(collectionName)).then((docSnap) =>
        t.set(docSnap.ref, {
          count: ((docSnap.data() && docSnap.data().count) || 0) + 1,
          autoIncrement: ((docSnap.data() && docSnap.data().autoIncrement) || 0) + 1,
        })
      );
      // on delete
    } else if (change.before.exists && !change.after.exists) {
      return t.get(db.collection('metadatas').doc(collectionName)).then((docSnap) =>
        t.set(docSnap.ref, {
          count: docSnap.data() && docSnap.data().count && docSnap.data().count > 0 ? docSnap.data().count - 1 : 0, //docSnap.data().count - 1
        })
      );
    }
    return null;
  });

/**
 * Count documents in companies collection.
 */
exports.companiesCounter = functions.firestore.document('companies/{id}').onWrite(documentCounter('companies'));

/**
 * Count documents in customers collection.
 */
exports.customersCounter = functions.firestore.document('customers/{id}').onWrite(documentCounter('customers'));

/**
 * Count documents in deliverers collection.
 */
exports.deliverersCounter = functions.firestore.document('deliverers/{id}').onWrite(documentCounter('deliverers'));

/**
 * Count documents in orders collection.
 */
exports.ordersCounter = functions.firestore.document('orders/{id}').onWrite(documentCounter('orders'));
