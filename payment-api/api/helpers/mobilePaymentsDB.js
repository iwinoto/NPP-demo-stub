/**
 * New node file
 */

var _db;
var util = require('util');
var cfEnv = require('cfenv');
var appEnv = cfEnv.getAppEnv();

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

function insertDesignDocs(db){
  var remitters = {
      "all_remitters": {
        "map": "function(doc) {\n  if(doc.remitterName){\n    emit(null, doc);\n  }\n}"
      },
      "remitters_by_mobileNumber": {
        "map": "function(doc) {\n  if(doc.remitterName){\n    emit(doc.mobileNumber, doc);\n  }\n}"
      }
  };
  var merchants = {
      "all_merchants": {
        "map": "function(doc) {\n  if(doc.merchantName){\n    emit(null, doc);\n  }\n}"
      },
      "merchants_by_abn": {
        "map": "function(doc) {\n  if(doc.merchantName){\n    emit(doc.abn, doc);\n  }\n}"
      }
  };
  var invoices = {
      "invoices_by_invoice": {
        "map": "function(doc) {\n  if(doc.invoice){\n    emit(doc.invoice, doc);\n  }\n}"
      },
      "invoices_by_status": {
        "map": "function(doc) {\n  if(doc.invoice){\n    emit(doc.status, doc);\n  }\n}"
      }
  };
  db.insert({language: "javascript", views: remitters}, "_design/remitters", function(err, body, header){
    if (err) {
      console.log('[_design/remitters.insert] ', err.message);
      return;
    }
    console.log("[INF]", 'inserted _design/remitters')
    console.log(body);
  });
  
  db.insert({language: "javascript", views: merchants}, "_design/merchants", function(err, body, header){
    if (err) {
      console.log('[_design/merchants.insert] ', err.message);
      return;
    }
    console.log("[INF]", 'inserted _design/merchants')
    console.log(body);
  });

  db.insert({language: "javascript", views: invoices}, "_design/invoices", function(err, body, header){
    if (err) {
      console.log('[_design/invoices.insert] ', err.message);
      return;
    }
    console.log("[INF]", 'inserted _design/invoices')
    console.log(body);
  });
};

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
  _db.view("invoices", "invoices_by_invoices", {key: invoice}, callback);
};

module.exports = {
    db: db,
    remitterByMobileNumber: remitterByMobileNumber,
    merchantByABN: merchantByABN,
    invoicesByStatus: invoicesByStatus,
    invoicesByInvoice: invoicesByInvoice
  };
