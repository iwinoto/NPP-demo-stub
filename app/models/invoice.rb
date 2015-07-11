class Invoice < CouchRest::Model::Base
  property :invoice,        type: String
  property :amount,         type: Float
  property :paymentStatus,  type: String
  property :remitter,       type: String
  property :created_at,     type: DateTime
end
