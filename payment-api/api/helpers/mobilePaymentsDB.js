/**
 * New node file
 */

var _db;
var util = require('util');
var cfEnv = require('cfenv');
var appEnv = cfEnv.getAppEnv();
var designDocs = require("./createCouchDBDesignDocs");

// Service credentials for CF or local dev/test
var couchServiceCred = appEnv.getServiceCreds("cloudant-payment-api") || {
                     database: "mobile-payments_dev",
                     url: "http://localhost:5984/",
                 };
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
        insertDesignDocs(nano.use(dbName))
      }
    });
  }else{
    console.log("[INF]", "Found DB " + dbName);
    console.log(body);
  };
});

// Update CouchDB design docs
designDocs.insertDesignDocs(db);

// Export definitions

function db(callback){
  _db = nano.use(dbName);
  callback(_db);
};

function merchantByABN(abn, callback){
  _db.view("merchants", "merchants_by_abn", {key: abn}, callback);
};

function remitterByMobileNumber(mobileNumber, callback){
  _db.view("remitters", "remitters_by_mobileNumber", {key: mobileNumber}, callback);
};

function invoicesByStatus(status, callback){
  _db.view("invoices", "invoices_by_status", {key: status}, callback);
};

function invoicesByInvoice(invoice, callback){
  _db.view("invoices", "invoices_by_invoice", {key: invoice}, callback);
};

module.exports = {
    db: db,
    remitterByMobileNumber: remitterByMobileNumber,
    merchantByABN: merchantByABN,
    invoicesByStatus: invoicesByStatus,
    invoicesByInvoice: invoicesByInvoice
  };
