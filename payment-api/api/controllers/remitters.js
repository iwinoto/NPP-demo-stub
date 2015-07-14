/**
 * Remitter resource API
 */

var mobilePaymentsDB = require("../helpers/mobilePaymentsDB");
var util = require('util');
var db;

mobilePaymentsDB.db(function(_db){
  db = _db;
});

function getRemitter(req, res){
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var mobileNumber = req.swagger.params.mobileNumber.value;

  mobilePaymentsDB.remitterByMobileNumber(mobileNumber, function(err, body){
    if(body.rows.length != 0){
      remitter = body.rows[0].value;
      res.json(remitter);
    }else{
      res.status("404").json("Not found")
    }
  });
};

function addRemitter(req, res){
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var remitter = req.body;
  console.log("[INF]", "Adding remitter: ");
  console.log(util.inspect(remitter));
  
  mobilePaymentsDB.remitterByMobileNumber(remitter.mobileNumber, function(err, body){
    if(body.rows.length != 0){
      var msg = "Remitter with mobileNumber \"" + remitter.mobileNumber + "\" already exists.";
      console.log("[ERR]", msg);
      res.status("405").json(msg);
    }else{
      db.insert(remitter, function(err, body, header){
        if (err) {
          console.log('[remitter.insert] ', err.message);
          return;
        }
        console.log("[INF]", 'you have inserted the remitter.')
        var newRemitter = body;
        console.log(newRemitter);
        res.json(newRemitter);
      });      
    }
  })

};

function updateRemitter(req, res){
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var mobileNumber = req.swagger.params.mobileNumber.value;
  var newRemitter = req.body;
  var remitter;

  mobilePaymentsDB.remitterByMobileNumber(mobileNumber, function(err, body){
    if(body.rows.length != 0){
      console.log("[INF]", util.inspect(body));
      remitter = body.rows[0].value;
      
      remitter.remitterName = newRemitter.remitterName || remitter.remitterName;
      if(newRemitter.account){
        remitter.account.name = newRemitter.account.name || remitter.account.name;
        remitter.account.bsb = newRemitter.account.bsb || remitter.account.bsb;
        remitter.account.account = newRemitter.account.account || remitter.account.account;
      };    
      
      db.insert(remitter, function(err, body, header){
        if (err) {
          console.log('[remitter.update] ', err.message);
          return;
        }
        console.log("[INF]", "Remitter updated.")
        var newRemitter = body;
        console.log(newRemitter);
        res.json(newRemitter);
      });

    }else{
      res.status("404").json("Not found")
    };
  });
};


function deleteRemitter(req, res){
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var mobileNumber = req.swagger.params.mobileNumber.value;
  var remitter;
  
  mobilePaymentsDB.remitterByMobileNumber(mobileNumber, function(err, body){
    if(body.rows.length != 0){
      remitter = body.rows[0].value;
      db.destroy(remitter._id, remitter._rev, function(err, body){
        if(err){
          var message = "Error deleting doc with ID: \"" + dbName + "\", REV: \"" + remitter._rev + "\"";
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
    getRemitter: getRemitter,
    addRemitter: addRemitter,
    updateRemitter: updateRemitter,
    deleteRemitter: deleteRemitter
};
