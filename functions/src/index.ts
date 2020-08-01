import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Change, EventContext } from 'firebase-functions';
import { DocumentSnapshot } from 'firebase-functions/lib/providers/firestore';
admin.initializeApp({
  credential: admin.credential.cert('yeyby-c072f-firebase-adminsdk-v1abn-161dfcc7de.json'),
  databaseURL: 'https://yeyby-c072f.firebaseio.com',
});
const settings = { timestampsInSnapshots: true };
admin.firestore().settings(settings);
const db = admin.firestore();

const executeOnce = (
  change: Change<DocumentSnapshot>,
  context: EventContext,
  task: (t: admin.firestore.Transaction) => any
) => {
  const eventRef = db.collection('events').doc(context.eventId);
  return db.runTransaction((t) => {
    return t
      .get(eventRef)
      .then((docSnap) => {
        return docSnap.exists ? null : task(t);
      })
      .then(() => {
        return t.set(eventRef, { processed: true });
      });
  });
};

const documentCounter = (collectionName: string) => {
  return (change: Change<DocumentSnapshot>, context: EventContext) => {
    return executeOnce(change, context, (t: admin.firestore.Transaction) => {
      // on create
      if (!change.before.exists && change.after.exists) {
        return t
          .get(db.collection('metadatas').doc(collectionName))
          .then(async (docSnap: admin.firestore.DocumentSnapshot<any>) => {
            const data = {
              count: ((docSnap.data() && docSnap.data().count) || 0) + 1,
              autoIncrement: ((docSnap.data() && docSnap.data().autoIncrement) || 0) + 1,
            };
            t.update(docSnap.ref, data);
            return Promise.resolve(data);
          })
          .then((data) => {
            const pad = (n: number, width: number) => {
              const newZ: string = '0';
              const newN: string = n + '';
              return newN.length >= width ? newN : new Array(width - newN.length + 1).join(newZ) + newN;
            };
            const folio: string = pad((data && data.autoIncrement) || 1, 4);
            return db
              .collection(collectionName)
              .doc(context.params.id)
              .get()
              .then((snap: admin.firestore.DocumentSnapshot<any>) => {
                const search: string[] = Array.from(snap.data().search) || [];
                search.push(folio);
                search.push(String((data && data.autoIncrement) || 1));
                return db.collection(collectionName).doc(context.params.id).update({
                  folio: folio,
                  search: search,
                });
              });
          });
        // on delete
      } else if (change.before.exists && !change.after.exists) {
        return t
          .get(db.collection('metadatas').doc(collectionName))
          .then((docSnap: admin.firestore.DocumentSnapshot<any>) => {
            return t.update(docSnap.ref, {
              count: docSnap.data() && docSnap.data().count && docSnap.data().count > 0 ? docSnap.data().count - 1 : 0, //docSnap.data().count - 1
            });
          });
      }
      return;
    });
  };
};

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
