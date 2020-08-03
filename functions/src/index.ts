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

/**
 * Registration
 */
exports.code = functions.https.onRequest(async (request, response) => {
  response.header('Content-Type', 'application/json');
  response.header('Access-Control-Allow-Origin', '*');
  response.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With'
  );
  if (request.method === 'OPTIONS') {
    return response.status(204).send('');
  }
  try {
    const _code = request.body.code;
    const _email = request.body.email;
    const _password = request.body.password;
    const _name = request.body.name;
    const _nameStr = request.body.nameStr;
    const _search = request.body.search;
    const _date = request.body.date;
    const response2 = await db.collection('invites').where('code', '==', _code).where('status', '==', 'pending').get();
    if (!response2.empty === true) {
      const doc = response2.docs[0];
      if (doc && doc.exists === true) {
        if (doc.data().company) {
          const inviteID: string = doc.id;
          const response1 = await db.collection('companies').doc(doc.data().company).get();
          if (response1.exists === true) {
            const companyID: string = response1.id;
            const email: string = String(_email);
            const password: string = String(_password);
            const user = await admin.auth().createUser({ email: email, password: password });
            if (user && user.email && user.uid) {
              const userID: string = user.uid;
              const userEMAIL: string = user.email;
              const name: string = _name;
              await db.collection('users').doc(userID).set({
                email: userEMAIL,
                company: companyID,
                name: name,
                nameStr: _nameStr,
                search: _search,
                date: _date,
                status: 'active',
                type: 'company',
                uid: userID,
              });
              await db.collection('companies').doc(companyID).update({
                user: userID,
              });
              await db.collection('invites').doc(inviteID).update({
                status: 'assigned',
              });
              return response
                .status(200)
                .send({ status: 'success', message: 'Registro creado correctamente, bienvenido.' });
            } else {
              return response
                .status(401)
                .send({ status: 'error', message: 'Ha ocurrido un error, por favor inténtalo más tarde.' });
            }
          } else {
            return response.status(401).send({
              status: 'error',
              message:
                'No existe una empresa asociada a este código, por favor contacta a la persona que te envió este código.',
            });
          }
        } else {
          return response.status(401).send({
            status: 'error',
            message:
              'No existe una empresa asociada a este código, por favor contacta a la persona que te envió este código.',
          });
        }
      } else {
        return response.status(401).send({
          status: 'error',
          message:
            'El código de verifiación ya ha sido utilizado o no existe, por favor contacta a la persona que te envió este código.',
        });
      }
    } else {
      return response.status(401).send({
        status: 'error',
        message:
          'El código de verifiación ya ha sido utilizado o no existe, por favor contacta a la persona que te envió este código.',
      });
    }
  } catch (error) {
    return response
      .status(501)
      .send({
        error: error,
        status: 'error',
        message: 'El email que intentas registrar esta siendo utlizado por otra cuenta.',
      });
  }
});

/**
 * Create Auth
 */
exports.crateUserAuth = functions.https.onRequest(async (request, response) => {
  response.header('Content-Type', 'application/json');
  response.header('Access-Control-Allow-Origin', '*');
  response.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With'
  );
  if (request.method === 'OPTIONS') {
    return response.status(204).send('');
  }
  try {
    const token = request.body.token;
    const email = request.body.email;
    const password = request.body.password;
    const decodedToken = await admin.auth().verifyIdToken(token);
    if (decodedToken && decodedToken.uid) {
      const user = await admin.auth().createUser({ email: email, password: password });
      if (user && user.email && user.uid) {
        return response.status(200).send({ status: 'success', message: 'Registro creado correctamente.', data: user });
      } else {
        return response
          .status(401)
          .send({ status: 'error', message: 'Ha ocurrido un error, por favor inténtalo más tarde.' });
      }
    } else {
      return response.status(401).send({ message: 'Usuario no válido' });
    }
  } catch (error) {
    return response
      .status(401)
      .send({ status: 'error', message: 'Ha ocurrido un error, por favor inténtalo más tarde.', error: error });
  }
});

/**
 * Delete Auth
 */
exports.deleteUserAuth = functions.https.onRequest(async (request, response) => {
  response.header('Content-Type', 'application/json');
  response.header('Access-Control-Allow-Origin', '*');
  response.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With'
  );
  if (request.method === 'OPTIONS') {
    return response.status(204).send('');
  }
  try {
    const token = request.body.token;
    const uid = request.body.uid;
    const decodedToken = await admin.auth().verifyIdToken(token);
    if (decodedToken && decodedToken.uid) {
      await admin.auth().deleteUser(uid);
      return response.status(200).send({ status: 'success', message: 'Registro creado correctamente.' });
    } else {
      return response.status(401).send({ message: 'Usuario no válido' });
    }
  } catch (error) {
    return response
      .status(401)
      .send({ status: 'error', message: 'Ha ocurrido un error, por favor inténtalo más tarde.', error: error });
  }
});
