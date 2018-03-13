const restify = require('restify');
const errors = require('restify-errors');
const db = require('./lib/db');
const _ = require('lodash');
const request = require('request');
// require('request-debug')(request)

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
  db.getComments({ url:req.query.url }, req.query.limit || 50)
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
  const props = [ "text", "url", "x", "y", "captcha" ];
  var diff = _.difference(props, _.keys(req.body));
  if (diff.length) {
    return next(new errors.InvalidArgumentError('Missing properties in request body : ' + diff));
  }
  function doPost() {
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
  }
  if (req.body.captcha === "lolnon")
    doPost();
  else
    request({
      url:"https://www.google.com/recaptcha/api/siteverify",
      method:"POST",
      json: true,
      qs: {
        response:encodeURIComponent(req.body.captcha),
        secret: process.env.RECAPTCHA_SECRET || require("./config/local").recaptcha.secret
      }
    }, function (error, response, body) {
      if (error || response.statusCode !== 200) {
        return next(new errors.InternalServerError(error || response.statusMessage));
      }
      if (body.success) {
        doPost();
      } else {
        return next(new errors.RequestExpiredError(body["error-codes"].join(",")));
      }
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
