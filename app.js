const restify = require('restify');
const mongodb = require('mongodb').MongoClient;

const server = restify.createServer();
const url = require('./lib/config/local').mongodb.url;

server.listen(process.env.PORT || 8080, async function () {
  console.log("Server started on " + server.url);
  var client = await mongodb.connect(url);
  var db = client.db('wwc');
  var col = db.collection('comments');
  await col.insertOne({ message:"test" });
  await new Promise(function(resolve, reject) {
    col.find().forEach(console.log, resolve);
  });
  await col.deleteMany({});
  client.close();
});
