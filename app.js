const restify = require('restify');
const errors = require('restify-errors');
const db = require('./lib/db');
const _ = require('lodash');

const server = restify.createServer();
server.pre(restify.plugins.pre.sanitizePath());
server.pre(restify.plugins.pre.context());

server.use(restify.plugins.queryParser({ mapParams: false }));
server.use(restify.plugins.bodyParser());
server.use(restify.plugins.gzipResponse());

server.get('/comments', function (req, res, next) {
  if (!req.query.url) {
    return next(new errors.MissingParameterError('Missing query parameter : url'));
  }
  db.getComments({ url:req.query.url })
    .then(comments => {
      res.send(comments);
      next();
    })
    .catch(e => {
      console.log(e);
      next(new errors.InternalServerError(e));
    });
});

server.post('/comments', function (req, res, next) {
  const props = [ "text", "url", "x", "y" ];
  if (_.difference(props, _.keys(req.body)).length) {
    return next(new errors.InvalidArgumentError('Missing properties in request body'));
  }
  db.postComment(_.pick(req.body, props))
    .then(result => {
      res.status(201);
      res.end();
      next();
    })
    .catch(e => {
      console.log(e);
      next(new errors.InternalServerError(e));
    });
});

server.del('/comments', function (req, res, next) {
  db.deleteComments(req.query);
  res.status(200);
  res.end();
  next();
});

server.listen(process.env.PORT || 8080, async function () {
  console.log("Server started on " + server.url);
});
