/**
 * Merchant resource API
 */

var mobilePaymentsDB = require("../helpers/mobilePaymentsDB");
var util = require('util');
var db;

mobilePaymentsDB.db(function(_db){
  db = _db;
});

function getMerchant(req, res){
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var abn = req.swagger.params.abn.value;

  mobilePaymentsDB.merchantByABN(abn, function(err, body){
    if(body.rows.length != 0){
      console.log("[INF]", "Getting merchant by ABN: " + abn);

      merchant = body.rows[0].value;
      console.log(util.inspect(merchant));
      res.json(merchant);
    }else{
      console.log("[ERR]", err);
      res.status("404").json("Not found")
    }
  });
};

function addMerchant(req, res){
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var merchant = req.body;
  console.log("[INF]", "Adding merchant: ");
  console.log(util.inspect(merchant));
  
  mobilePaymentsDB.merchantByABN(merchant.abn, function(err, body){
    if(!err && body.rows.length != 0){
      var msg = "Merchant with abn \"" + merchant.abn + "\" already exists.";
      console.log("[ERR]", msg);
      res.status("405").json(msg);
    }else{
      db.insert(merchant, function(err, body, header){
        if (err) {
          console.log('[merchant.insert] ', err.message);
          return;
        }
        console.log("[INF]", 'you have inserted the merchant.')
        var newMerchant = body;
        console.log(newMerchant);
        res.json(newMerchant);
      });      
    }
  })

};

function updateMerchant(req, res){
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var abn = req.swagger.params.abn.value;
  var newMerchant = req.body;
  var merchant;

  mobilePaymentsDB.merchantByABN(abn, function(err, body){
    if(body.rows.length != 0){
      console.log("[INF]", util.inspect(body));
      merchant = body.rows[0].value;
      
      merchant.merchantName = newMerchant.merchantName || merchant.merchantName;
      if(merchant.account){
        merchant.account.name = newMerchant.account.name || merchant.account.name;
        merchant.account.bsb = newMerchant.account.bsb || merchant.account.bsb;
        merchant.account.account = newMerchant.account.account || merchant.account.account;
      };
  
      db.insert(merchant, function(err, body, header){
        if (err) {
          console.log('[merchant.update] ', err.message);
          return;
        }
        console.log("[INF]", 'Merchant updated.')
        var newMerchant = body;
        console.log(newMerchant);
        res.json(newMerchant);
      });
    }else{
      res.status("404").json("Not found")
    };
  });
};


function deleteMerchant(req, res){
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var abn = req.swagger.params.abn.value;
  var merchant;
  
  mobilePaymentsDB.merchantByABN(abn, function(err, body){
    if(body.rows.length != 0){
      merchant = body.rows[0].value;
      db.destroy(merchant._id, merchant._rev, function(err, body){
        if(err){
          var message = "Error deleting doc with ID: \"" + dbName + "\", REV: \"" + merchant._rev + "\"";
          console.log("[ERR]", message);
          console.log(err);
          res.status(500).json(message);
        }else{
          res.status(200).json();
        };
      });
    }else{
      res.status("404").json("Not found")
    }
  });
};

module.exports = {
    getMerchant: getMerchant,
    addMerchant: addMerchant,
    updateMerchant: updateMerchant,
    deleteMerchant: deleteMerchant
};
