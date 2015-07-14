Mobile Payments API specifications
==================================
Describe the specifications for the APIs involved in Mobile payments.

The scenario
------------

The merchant has register with its bank that it is able to accept mobile payments. The mobile phone user has registered his mobile phone number with his bank to enable payments via his phone. A bank account has also been nominated to be the account from which to make payments.

The scenario is that a mobile phone user is shopping at an online store. The user has been browsing the store, has added items to the shopping cart and is ready to check out.

The user navigates to the checkout, checks the cart and is ready to make the payment.

The merchant web site generates an invoice with an ID. The user presses the pay button which initiates a payment request.

Methods
-------
### RemitterRegister
* Input
  * Mobile number
  * Account name
  * Bank BSB
  * Bank Account
* Output
  * Confirmation
  * Public key

### MerchantRegister
* Input
  * Merchant ABN
  * Name
  * Account name
  * Bank BSB
  * Bank account
* Output
  * Confirmation
  * Public key

### MerchantListener
Web socket. Publishes a payment notification to the listener. The listener acts on the payment notification.
* Connection
  * Merchant ABN
* Output
  * Invoice
  * Payment status
  * Mobile number
  * Amount

### PaymentInitiation
Remitter initiates a payment using their mobile phone.
* Input
  * Invoice
  * Mobile number
  * Amount
* Output
  * Confirmation

Objects
-------
### Remitter
Contains data about registered remitters
* JSON Schema

### Merchant
Data about registered merchants
* JSON Schema

### Invoice
Data about Invoices and their payment status
* JSON Schema

Field        |Type       |Validation                                        
-------------|-----------|--------------------------------------------------
Invoice      |String, key|not empty                                         
Amount       |Float      |not empty                                         
PaymentStatus|String     |one of: [initiated, failed, successful, presented]
created      |timestamp  |not empty                                         

