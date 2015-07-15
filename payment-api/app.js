'use strict';

var SwaggerExpress = require('swagger-express-mw');
var express = require('express');
var app = express();
var bodyParser = require('body-parser')
var couch = require('nano');
var cfenv = require('cfenv');
var util = require('util');

var appEnv = cfenv.getAppEnv();

//parse application/json 
app.use(bodyParser.json())
// Serve up Swagger UI for API documentation
app.use('/api-docs', express.static('./views/swagger-ui'));
app.use('/swagger-docs', express.static('./api/swagger'));
//app.set('port', appEnv.port);
//app.set('host', appEnv.host);

module.exports = app; // for testing

var config = {
  appRoot: __dirname // required config
};

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);

  var port = process.env.PORT || appEnv.port;
  app.listen(port);

  console.log('try this:\ncurl http://127.0.0.1:' + port + '/v1');
});
