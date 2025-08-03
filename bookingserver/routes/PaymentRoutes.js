const express = require('express');
const path = require('path');
const paymentRoutes = express.Router();

const{ createPaymentOrder,capturePaymentOrder } = require('../Controller/PaymentController');

paymentRoutes.post('/create-payment',createPaymentOrder)
paymentRoutes.get('/complete-payment', async (req, res) => {
    const { token } = req.query;
  
    if (!token) {
      return res.status(400).json({ error: 'No token provided' });
    }
  
    try {
      const captureResponse = await capturePaymentOrder(token);
      
      
      res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Management</title>
    <link rel="stylesheet" href="server/services/styles.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>purchase for prenium successfully</h1>
        </header>
     
        </main>
    
    </div>
</body>
</html>

      `);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to capture payment' });
    }
  });
  

module.exports = paymentRoutes;