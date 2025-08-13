const express = require('express');
const axios = require('axios');
const { config } = require('dotenv');
const { link } = require('../routes/PaymentRoutes');
const Subscript = require('../Model/PreniumModel');
require('dotenv').config(); 

const getAccessToken = async () => {
  try {
    // Debug: Log the credentials (remove this in production)
    console.log('PayPal Client ID:', process.env.paypal_clientID ? 'Set' : 'Not set');
    console.log('PayPal Secret Key:', process.env.paypal_KEY ? 'Set' : 'Not set');
    
    if (!process.env.paypal_clientID || !process.env.paypal_KEY) {
      throw new Error('PayPal credentials are not properly configured in environment variables');
    }

    const response = await axios({
      url: 'https://api-m.sandbox.paypal.com/v1/oauth2/token',
      method: 'post',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: 'grant_type=client_credentials',
      auth: {
        username: process.env.paypal_clientID,
        password: process.env.paypal_KEY,
      },
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Error getting PayPal access token:', error.response?.data || error.message);
    throw error;
  }
};

const addSubcription = async (userid) => {
  try {
    // Check if user already has an active subscription
    const existingSubscription = await Subscript.findOne({ Userid: userid });
    
    if (existingSubscription) {
      // Update existing subscription
      existingSubscription.status = 1; // Active
      existingSubscription.signupdate = new Date();
      // Set expiration date to 1 month from now
      const expireDate = new Date();
      expireDate.setMonth(expireDate.getMonth() + 1);
      existingSubscription.expiredate = expireDate;
      
      await existingSubscription.save();
      return existingSubscription;
    } else {
      // Create new subscription
      const expireDate = new Date();
      expireDate.setMonth(expireDate.getMonth() + 1);
      
      const newSubscript = new Subscript({
        Userid: userid,
        status: 1, // Active
        signupdate: new Date(),
        expiredate: expireDate,
      });
      
      await newSubscript.save();
      return newSubscript;
    }
  } catch (error) {
    console.error('Error adding subscription:', error);
    throw error;
  }
}
const createPaymentOrder = async (req, res) => {
    const { userid, price, platform } = req.body;
    console.log(userid,price,platform);
    try {
      const access_token = await getAccessToken();

      // Determine return_url based on platform
      let return_url = '';
      let cancel_url = '';
      if (platform === 'web') {
        return_url = 'http://localhost:5000/api/complete-payment';
        cancel_url = 'http://localhost:5000/api/payment/cancel';
      } else if (platform === 'ios') {
        return_url = 'mobilebooking://payment/complete';
        cancel_url = 'mobilebooking://payment/cancel';
      } else if (platform === 'android') {
        return_url = 'http://10.0.2.2:5000/api/complete-payment';
        cancel_url = 'http://10.0.2.2:5000/api/cancel-payment';
      } else {
        // Default fallback (local dev)
        return_url = 'http://10.0.2.2:5000/api/complete-payment';
        cancel_url = 'http://10.0.2.2:5000/api/cancel-payment';
      }

      const response = await axios({
        url: 'https://api-m.sandbox.paypal.com/v2/checkout/orders',
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`,
        },
        data: {
          intent: 'CAPTURE',
          purchase_units: [
            {
              custom_id: userid, // Lưu userid để sử dụng sau khi thanh toán hoàn tất
              items: [
                {
                  name: 'Premium subscription',
                  description: 'Premium partner subscription',
                  quantity: 1,
                  unit_amount: {
                    currency_code: 'USD',
                    value: price,
                  },
                },
              ],
              amount: {
                currency_code: 'USD',
                value: price,
                breakdown: {
                  item_total: {
                    currency_code: 'USD',
                    value: price,
                  },
                },
              },
            },
          ],
          application_context: {
            brand_name: 'Sign up for Premium eBooking plan',
            return_url: return_url,
            cancel_url: cancel_url,
          },
        },
      });

      console.log('PayPal order created successfully:', {
        orderId: response.data.id,
        status: response.data.status,
        approveLink: response.data.links.find((link) => link.rel === 'approve')?.href
      });

      res.status(200).json(
        response.data.links.find((link) => link.rel === 'approve').href
      );
    } catch (error) {
      console.error(error.response ? error.response.data : error.message);
      res.status(500).json({ error: 'Failed to create payment order' });
    }
  };
  const capturePaymentOrder = async (orderId) => {
    try {
      console.log('Attempting to capture order:', orderId);
      const access_token = await getAccessToken();
      
      // First, get order details to check status
      const orderDetails = await axios({
        url: `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}`,
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`,
        },
      });
      
      console.log('Order status:', orderDetails.data.status);
      console.log('Order details:', JSON.stringify(orderDetails.data, null, 2));
      
      // Check if order can be captured
      if (orderDetails.data.status !== 'APPROVED') {
        throw new Error(`Order cannot be captured. Current status: ${orderDetails.data.status}`);
      }
      
      const response = await axios({
        url: `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`,
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`,
        },
      });
      
      console.log('Capture successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error capturing payment:', {
        orderId,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  };

// Handle payment completion from PayPal redirect
const completePayment = async (req, res) => {
  try {
    const { token, PayerID } = req.query;
    console.log('Payment completion request:', { token, PayerID });
    
    if (!token) {
      return res.status(400).json({ error: 'Missing payment token' });
    }
    
    // Capture the payment
    const captureResult = await capturePaymentOrder(token);
    
    // Kiểm tra xem thanh toán có thành công không
    if (captureResult.status === 'COMPLETED') {
      // Lấy userid từ custom_id trong purchase_units
      const purchaseUnit = captureResult.purchase_units[0];
      const userid = purchaseUnit.custom_id;
      
      if (userid) {
        console.log('Adding subscription for user:', userid);
        await addSubcription(userid);
        console.log('Subscription added successfully for user:', userid);
      } else {
        console.warn('No userid found in payment capture result');
      }
    }
    
    console.log('Payment completed successfully:', captureResult);
    
    // Redirect to success page or return JSON based on platform
    res.status(200).json({
      success: true,
      message: 'Payment completed successfully',
      captureId: captureResult.id,
      status: captureResult.status
    });
    
  } catch (error) {
    console.error('Error completing payment:', error);
    res.status(500).json({ 
      error: 'Failed to complete payment',
      details: error.message 
    });
  }
};

const checkUserSubscription = async (userid) => {
  try {
    const subscription = await Subscript.findOne({ Userid: userid });
    
    if (!subscription) {
      return null;
    }
    
    // Kiểm tra xem subscription có còn active không
    const currentDate = new Date();
    if (subscription.status === 1 && subscription.expiredate > currentDate) {
      return subscription;
    }
    
    return null;
  } catch (error) {
    console.error('Error checking user subscription:', error);
    throw error;
  }
};

module.exports = { createPaymentOrder, capturePaymentOrder, addSubcription, completePayment, checkUserSubscription };
