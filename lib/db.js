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
  getCol(col) {
    return module.exports.wwc.then(wwc => wwc.collection(col));
  },
  getComments: async function(opts, limit) {
    return (await module.exports.getCol("comments")).find(opts, { limit, sort:"createdAt" }).toArray();
  },
  postComment: async function(data) {
    data.createdAt = new Date();
    return (await module.exports.getCol("comments")).insertOne(data);
  },
  postBug: async function(data) {
    data.createdAt = new Date();
    return (await module.exports.getCol("bugs")).insertOne(data);
  },
  deleteComments: async function (opts) {
    return (await module.exports.getCol("comments")).deleteMany(opts);
  }
};
