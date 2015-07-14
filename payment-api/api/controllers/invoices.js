/**
 * New node file
 */


var mobilePaymentsDB = require("../helpers/mobilePaymentsDB");
var util = require('util');
var db;

mobilePaymentsDB.db(function(_db){
  db = _db;
});

function getInvoice(req, res){
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var invoice = req.swagger.params.invoice.value;

  mobilePaymentsDB.invoicesByInvoice(invoice, function(err, body){
    if(body.rows.length != 0){
      console.log("[INF]", "Getting invoice by invoice: " + invoice);

      invoice = body.rows[0].value;
      console.log(util.inspect(invoice));
      res.json(invoice);
    }else{
      console.log("[ERR]", err);
      res.status("404").json("Not found")
    }
  });
};

function addInvoice(req, res){
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var invoice = req.body;
  console.log("[INF]", "Adding invoice: ");
  console.log(util.inspect(invoice));
  
  mobilePaymentsDB.invoicesByInvoice(invoice.invoice, function(err, body){
    if(!err && body.rows.length != 0){
      var msg = "Invoice with invoice \"" + invoice.invoice + "\" already exists.";
      console.log("[ERR]", msg);
      res.status("405").json(msg);
    }else{
      db.insert(invoice, function(err, body, header){
        if (err) {
          console.log('[invoice.insert] ', err.message);
          return;
        }
        console.log("[INF]", 'Invoice inserted.')
        var newInvoice = body;
        console.log(newInvoice);
        res.json(newInvoice);
      });      
    }
  })

};

function generatedInvoices(req, res){
  mobilePaymentDB.invoicesByStatus("generated", function(err, body){
    if(err){
      res.status(500).json(err);
    }else{
      res.json(body);
    };
  });
};

function presentedInvoices(req, res){
  mobilePaymentDB.invoicesByStatus("presented", function(err, body){
    if(err){
      res.status(500).json(err);
    }else{
      res.json(body);
    };
  });
};

function initiatedInvoices(req, res){
  mobilePaymentDB.invoicesByStatus("initiated", function(err, body){
    if(err){
      res.status(500).json(err);
    }else{
      res.json(body);
    };
  });
};

function successfulInvoices(req, res){
  mobilePaymentDB.invoicesByStatus("sucessful", function(err, body){
    if(err){
      res.status(500).json(err);
    }else{
      res.json(body);
    };
  });
};

function failedInvoices(req, res){
  mobilePaymentDB.invoicesByStatus("failed", function(err, body){
    if(err){
      res.status(500).json(err);
    }else{
      res.json(body);
    };
  });
};

function setStatusPresented(req, res){
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var invoiceId = req.swagger.params.invoice.value;
  var invoice;
  
  mobilePaymentsDB.invoicesByInvoice(invoiceId, function(err, body){
    if(body.rows.length != 0){
      console.log("[INF]", util.inspect(body));
      invoice = body.rows[0].value;
      promoteStatus(invoice, "generated", "presented");
    }else{
      res.status(404).json("Not found");
    };
  });
};

function setStatusInitiated(req, res){
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var invoiceId = req.swagger.params.invoice.value;
  var remitter = req.body;
  var invoice;
  
  mobilePaymentsDB.invoicesByInvoice(invoiceId, function(err, body){
    if(body.rows.length != 0){
      console.log("[INF]", util.inspect(body));
      invoice = body.rows[0].value;
      promoteStatus(invoice, "presented", "initiated", function(_invoice){
        _invoice.remitterMobile = remitter.mobileNumber;
      });
    }else{
      res.status(404).json("Not found");
    };
  });
};

function setStatusSuccessful(req, res){
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var invoiceId = req.swagger.params.invoice.value;
  var invoice;
  
  mobilePaymentsDB.invoicesByInvoice(invoiceId, function(err, body){
    if(body.rows.length != 0){
      console.log("[INF]", util.inspect(body));
      invoice = body.rows[0].value;
      promoteStatus(invoice, "initiated", "successful");
    }else{
      res.status(404).json("Not found");
    };
  });
};

function setStatusFailed(req, res){
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var invoiceId = req.swagger.params.invoice.value;
  var invoice;
  
  mobilePaymentsDB.invoicesByInvoice(invoiceId, function(err, body){
    if(body.rows.length != 0){
      console.log("[INF]", util.inspect(body));
      invoice = body.rows[0].value;
      promoteStatus(invoice, "initiated", "failed");
    }else{
      res.status(404).json("Not found");
    };
  });
};

function promoteStatus(invoice, current, next, action){
  if(invoice.status == current){
    invoice.status = next;
    if(action){
      action(invoice);
    };
    
    db.insert(invoice, function(err, body, header){
      if (err) {
        console.log('[invoice.update] ', err.message);
        return;
      }
      console.log("[INF]", 'Invoice updated.')
      var newInvoice = body;
      console.log(newInvoice);
      res.json(newInvoice);
    });
  }else{
    res.status("405").json("Current status is \"" + invoice.status + "\"\n"
        + "Status must be \"" + current + "\" before promoting to \"" + next + "\".")
  };
};

module.exports = {
    getInvoice: getInvoice,
    addInvoice: addInvoice,
    generateInvoices: generateInvoices,
    presentedInvoices: presentedInvoices,
    initiatedInvoices: initiatedInvoices,
    successfulInvoices: successfulInvoices,
    failedInvoices: failedInvoices,
    setStatusPresented: setStatusPresented,
    setStatusInitiated: setStatusInitiated,
    setStatusSuccessful: setStatusSuccessful,
    setStatusFailed: setStatusFailed
};