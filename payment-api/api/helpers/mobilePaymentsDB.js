/**
 * New node file
 */

var mobilePaymentsDB;
var util = require('util');
var cfEnv = require('cfenv');
var appEnv = cfEnv.getAppEnv();

var couchServiceCred = appEnv.getServiceCreds("cloudant-payment-api") || {
                     database: "mobile-payments",
                     url: "http://localhost:5984/",
                 };

module.exports = {
  db: db};

console.log("[INF]", "couchServiceCred\n" + util.inspect(couchServiceCred));

var nano = require('nano')(couchServiceCred.url);
console.log("[INF]", "nano\n" + util.inspect(nano));

var dbName = couchServiceCred.database;


nano.db.get(dbName, function(err, body){
  if(err){
    console.log("[ERR]", "Error getting DB " + dbName);
    console.log(err);
    nano.db.create(dbName, function(err,body){
      if(err){
        console.log("[ERR]", "Error creating DB " + dbName);
        console.log(err);
      }else{
        console.log("[INF]", "Created DB " + dbName);
        console.log(body);
        //mobilePaymentsDB = nano.use(dbName);
      }
    });
  }else{
    console.log("[INF]", "Found DB " + dbName);
    console.log(body);
    //mobilePaymentsDB = nano.use(dbName);
  };
});

function db(callback){
  mobilePaymentsDB = nano.use(dbName);
  callback(mobilePaymentsDB);
}
