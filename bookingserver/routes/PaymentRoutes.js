const express = require('express');
const path = require('path');
const paymentRoutes = express.Router();

const{ createPaymentOrder,capturePaymentOrder, addSubcription, completePayment, checkUserSubscription } = require('../Controller/PaymentController');

paymentRoutes.post('/create-payment',createPaymentOrder)

// Route để kiểm tra subscription status
paymentRoutes.get('/check-subscription/:userid', async (req, res) => {
  try {
    const { userid } = req.params;
    const subscription = await checkUserSubscription(userid);
    
    if (subscription) {
      res.json({
        hasActiveSubscription: true,
        subscription: subscription
      });
    } else {
      res.json({
        hasActiveSubscription: false,
        subscription: null
      });
    }
  } catch (error) {
    console.error('Error checking subscription:', error);
    res.status(500).json({ error: 'Failed to check subscription status' });
  }
});

paymentRoutes.get('/complete-payment', async (req, res) => {
    const {token } = req.query;
    console.log('Payment token received:', token);

  
    if (!token) {
      return res.status(400).json({ error: 'No token provided' });
    }
  
    try {
      const captureResponse = await capturePaymentOrder(token);
      
      // Kiểm tra xem thanh toán có thành công không
      if (captureResponse.status === 'COMPLETED') {
        // Lấy userid từ custom_id trong purchase_units
        const purchaseUnit = captureResponse.purchase_units[0];
        const userid = purchaseUnit.payments.captures[0].custom_id;
        console.log('User ID:', purchaseUnit.payments.captures[0].custom_id);

        // Thêm subscription cho user nếu có userid
        if (userid) {
          console.log('Adding subscription for user:', userid);
          await addSubcription(userid);
          console.log('Subscription added successfully for user:', userid);
        }
      }
      
      res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Premium Purchase Success</title>
        <link href="https://fonts.googleapis.com/css?family=Roboto:400,700&display=swap" rel="stylesheet">
        <style>
        body {
        background: linear-gradient(135deg, #6dd5ed 0%, #2193b0 100%);
        min-height: 100vh;
        margin: 0;
        font-family: 'Roboto', Arial, sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        }
        .container {
        background: #fff;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(33,147,176,0.2);
        padding: 40px 32px 32px 32px;
        max-width: 400px;
        width: 100%;
        text-align: center;
        }
        header h1 {
        color: #2193b0;
        font-size: 2rem;
        margin-bottom: 16px;
        font-weight: 700;
        }
        .success-icon {
        font-size: 64px;
        color: #4BB543;
        margin-bottom: 16px;
        }
        .message {
        font-size: 1.1rem;
        color: #333;
        margin-bottom: 24px;
        }
        .btn-home {
        display: inline-block;
        padding: 10px 28px;
        background: #2193b0;
        color: #fff;
        border: none;
        border-radius: 24px;
        font-size: 1rem;
        font-weight: 500;
        text-decoration: none;
        transition: background 0.2s;
        }
        .btn-home:hover {
        background: #176682;
        }
        </style>
    </head>
    <body>
        <div class="container">
        <div class="success-icon">&#10004;</div>
        <header>
        <h1>Premium Purchase Successful!</h1>
        </header>
        <div class="message">
        Thank you for upgrading to Premium.<br>
        Your subscription is now active.
        </div>
        <a href="/" class="btn-home">Go to Home</a>
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