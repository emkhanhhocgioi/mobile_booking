
const express = require('express')
const routerOrder = express.Router();

const {createOrder,getUserOrders,
    AcceptOrders,DeniedOrders,
    getCustomerAcceptOrder,
    IsCheckin,IsCheckout,getCustomerCheckoutOrder} = require('../Controller/OrdersController');



routerOrder.post('/createorder',createOrder)
routerOrder.get('/getbooked',getUserOrders)
routerOrder.post('/accpetorder',AcceptOrders)
routerOrder.post('/deniedOrder',DeniedOrders)
routerOrder.post('/checkin',IsCheckin)
routerOrder.post('/checkout',IsCheckout)
routerOrder.get('/getSchedule',getCustomerAcceptOrder)
routerOrder.get('/bookinghistory',getCustomerCheckoutOrder)
module.exports = routerOrder;