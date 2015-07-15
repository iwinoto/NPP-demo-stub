/**
 * New node file
 */

var _db;
var util = require('util');

// Design documents for views in CouchDB
var remitters = {
      "remitters_by_mobileNumber": {
        "map": "function(doc) {\n  if(doc.remitterName){\n    emit(doc.mobileNumber, doc);\n  }\n}"
      }
  };

var merchants = {
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

// Always insert design docs so that the code has the lastest version.
// This will cause a reindex everytime the server starts
// TODO: Only insert design docs when there is a change.
function insertDesignDocs(db){
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

module.exports = {
    insertDesignDocs: insertDesignDocs
  };
