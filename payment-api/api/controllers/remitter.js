/**
 * Remitter resource API
 */

var util = require('util');
var cfEnv = require('cfenv');
var appEnv = cfEnv.getAppEnv();

var couchServiceCred = appEnv.getServiceCreds("cloudant-payment-api") || {
                     database: "mobile-payments",
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
      }
    });
  }else{
    console.log("[INF]", "Found DB " + dbName);
    console.log(body);
  };
});

var remitterDB = nano.use(dbName);

function getRemitter(req, res){
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var mobileNumber = req.swagger.params.mobileNumber.value;

  remitterDB.view("remitters", "remitter_by_mobileNumber", {key: mobileNumber}, function(err, body){
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
  
  remitterDB.view("remitters", "remitter_by_mobileNumber", {key: remitter.mobileNumber}, function(err, body){
    if(body.rows.length != 0){
      var msg = "Remitter with mobileNumber \"" + remitter.mobileNumber + "\" already exists.";
      console.log("[ERR]", msg);
      res.status("405").json(msg);
    }else{
      remitterDB.insert(remitter, function(err, body, header){
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
/*
  var defaultAccount = {
      name: newRemitter.account.name,
      bsb: newRemitter.account.bsb,
      account: newRemitter.account.account
  };
  var remitter = {
      remitterName: newRemitter.name,
      mobileNumber: mobileNumber,
      account: defaultAccount
  };
*/
  remitterDB.view("remitters", "remitter_by_mobileNumber", {key: mobileNumber}, function(err, body){
    if(body.rows.length != 0){
      console.log("[INF]", util.inspect(body));
      remitter = body.rows[0].value;
    }else{
      res.status("404").json("Not found")
    };

    remitter.remitterName = newRemitter.remitterName || remitter.remitterName;
    remitter.account.name = newRemitter.account.name || remitter.account.name;
    remitter.account.bsb = newRemitter.account.bsb || remitter.account.bsb;
    remitter.account.account = newRemitter.account.account || remitter.account.account;
    
    remitterDB.insert(remitter, function(err, body, header){
      if (err) {
        console.log('[remitter.update] ', err.message);
        return;
      }
      console.log("[INF]", 'you have updates the remitter.')
      var newRemitter = body;
      console.log(newRemitter);
      res.json(newRemitter);
    });
  });
};


function deleteRemitter(req, res){
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var mobileNumber = req.swagger.params.mobileNumber.value;
  var remitter;
  
  remitterDB.view("remitters", "remitter_by_mobileNumber", {key: mobileNumber}, function(err, body){
    if(body.rows.length != 0){
      remitter = body.rows[0].value;
      remitterDB.destroy(remitter._id, remitter._rev, function(err, body){
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
