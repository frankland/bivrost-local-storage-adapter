const load = namespace => {
  let data = localStorage.getItem(namespace);
  let processed = {};

  if (data) {
    processed = JSON.parse(data);
  }

  return processed;
};

let save = (namespace, data) => {
  var prepared = JSON.stringify(data);
  localStorage.setItem(namespace, prepared);
};

export default function localStorageAdapter(config = {}) {
  const namespace = config.namespace;

  if (!namespace) {
    throw new Error('LocalStorage namespace should be defined. "namespace" attr for localStorageAdapter');
  }

  return function(url, requestOptions = {}) {

    let action = null;

    switch (requestOptions.verb) {
      case 'GET':
        action = (id, query, body) => {
          return new Promise(resolve => {
            let db = load(namespace);

            resolve(db[id]);
          });
        };

        break;

      case 'POST' || 'PUT':
        action = (id, query, body) => {
          return new Promise(resolve => {
            let db = load(namespace);
            db[id] = body;
            save(namespace, db);

            resolve(db[id]);
          });
        };

        break;

      case 'DELETE':
        action = (id, query, body) => {
          return new Promise(resolve => {
            let db = load(namespace);

            delete db[id];
            save(namespace, db);

            resolve();
          });
        };

        break;

      default:
        throw new Error('method is not allowed');
    }

    return action(url, requestOptions.query, requestOptions.body);
  }
};

