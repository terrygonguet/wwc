const MongoClient = require('mongodb').MongoClient;
const url = process.env.MONGO_URL || require('../config/local').mongodb.url;
var client;

module.exports = {
  get client() {
    if (client) return Promise.resolve(client);
    else return MongoClient.connect(url).then(c => client = c);
  },
  get wwc () {
    return module.exports.client.then(c => wwc = c.db('wwc'));
  },
  get colComments () {
    return module.exports.wwc.then(wwc => wwc.collection('comments'));
  },
  getComments: async function(opts, limit) {
    return (await module.exports.colComments).find(opts, { limit, sort:"createdAt" }).toArray();
  },
  postComment: async function(data) {
    data.createdAt = new Date();
    return (await module.exports.colComments).insertOne(data);
  },
  deleteComments: async function (opts) {
    return (await module.exports.colComments).deleteMany(opts);
  }
};
