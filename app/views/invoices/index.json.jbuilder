json.array!(@invoices) do |invoice|
  json.extract! invoice, :id, :invoice, :amount, :paymentStatus, :remitter, :created
  json.url invoice_url(invoice, format: :json)
end
