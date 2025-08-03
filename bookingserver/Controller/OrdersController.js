const Order =  require('../Model/OrdersModels')
const Taikhoan = require('../Model/accounts');
const Post = require('../Model/PostModel')
const { ObjectId } = require('mongoose').Types;
const mongoose = require('mongoose');


const createOrder = async (req, res) => {
    const { UserID,OwnerID, HotelID, checkin, checkout, note } = req.body;
    console.log(req.body);
    console.log(UserID,HotelID,checkin,checkout,note)
   
    if (!UserID || !HotelID || !checkin || !checkout) {
        return res.status(400).json({ message: 'Missing required input values' });
    }

    try {
     
        const document = new Order({
            UserID: UserID,
            HotelID: HotelID,
            OwnerID: OwnerID,
            Checkindate: new Date(checkin),  
            Checkoutdate: new Date(checkout),  
            Note: note || "", 
            orderStatus: 'Pending',
            orderDay: new Date(),  
        });

       
        await document.save();

        return res.status(201).json({
            success: true,
            message: 'Order created successfully',
        });
    } catch (error) {
      
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Error creating order',
        });
    }
};

const   getUserOrders = async (req, res) => {
    const { userID } = req.query;
  
    if (!userID) {
      return res.status(400).json({ message: 'No user ID found' });
    }
  
    try {
      const docs = await Order.find({
        OwnerID: userID,
        orderStatus: { $in: ['Pending', 'Accepted','Checkin'] }
      });

      if (docs.length > 0) {
        
        const documents = docs.map((doc) => ({
          OrderID: doc._id,
          UserID: doc.UserID,
          OwnerID: doc.OwnerID,
          HotelID: doc.HotelID,
          Checkindate: doc.Checkindate,
          Checkoutdate: doc.Checkoutdate,
          Note: doc.Note,
          orderDay: doc.orderDay,
          orderStatus: doc.orderStatus,
        }));
      
       
        const documentOrders = await Promise.all(
          documents.map(async (doc) => {
     
            const Userdoc = await Taikhoan.find({ _id: doc.UserID });
      
            if (Userdoc.length === 0) {
              console.warn(`No user found for UserID: ${doc.UserID}`);
              return []; 
            }
      
        
            return Userdoc.map((tk) => ({
              OrderID: doc.OrderID,
              UserID: doc.UserID,
              OwnerID: doc.OwnerID,
              HotelID: doc.HotelID,
              Checkindate: doc.Checkindate,
              Checkoutdate: doc.Checkoutdate,
              Note: doc.Note,
              orderDay: doc.orderDay,
              orderStatus: doc.orderStatus,
              tkDetails: {
                name: tk.Username,
                email: tk.Email,
                phoneNumber: tk.PhoneNumber,
              },
            }));
          })
        );
      
        
        const flattenedDocumentOrders = documentOrders.flat();
      
   
       
        res.json(flattenedDocumentOrders)
   
      } else {
        console.log('No pending orders found for the given OwnerID.');
        return [];
      }
      
    } catch (error) {
      console.error('Error fetching orders:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

  const AcceptOrders = async (req,res) =>{
    const { orderid } = req.body;  
  
    console.log(req.body)
    if (!orderid) {
      return res.status(400).json({ message: 'No Order ID found' });
    }else{
     console.log(orderid)
    }
  
    try {
   
      const doc = await Order.findOneAndUpdate(
        { _id: orderid },
        { $set: { orderStatus: 'Accepted' } },
        { new: true }
      );
  
      
      if (!doc) {
        return res.status(404).json({ message: 'No Order found' }); 
      }
  
     
      return res.status(200).json({ message: 'Order Accepted', order: doc });
    } catch (error) {
      console.error('Error fetching orders:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }

  }

  
  const DeniedOrders = async (req,res) =>{
    const { orderid } = req.body;  
  
    
    if (!orderid) {
      return res.status(400).json({ message: 'No Order ID found' });
    }else{
     console.log(orderid)
    }
  
    try {
   
      const doc = await Order.findOneAndUpdate(
        { _id: orderid },
        { $set: { orderStatus: 'Denied' } },
        { new: true }
      );
  
      
      if (!doc) {
        return res.status(404).json({ message: 'No Order found' });  
      }
  
      
      return res.status(200).json({ message: 'Order Accepted', order: doc });
    } catch (error) {
      console.error('Error fetching orders:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }

  }
  const IsCheckin = async (req,res) =>{
    const { orderid } = req.body;  
    console.log(req.body)
     
    if (!orderid) {
      return res.status(400).json({ message: 'No Order ID found' });
    }else{
     console.log(orderid)
    }
  
    try {
   
      const doc = await Order.findOneAndUpdate(
        { _id: orderid },
        { $set: { orderStatus: 'Checkin' } },
        { new: true }
      );
  
      
      if (!doc) {
        return res.status(404).json({ message: 'No Order found' });  
      }
  

      return res.status(200).json({ message: 'Order Accepted', order: doc });
    } catch (error) {
      console.error('Error fetching orders:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }

  }
  const IsCheckout = async (req,res) =>{
    const { orderid } = req.body;  
  
    
    if (!orderid) {
      return res.status(400).json({ message: 'No Order ID found' });
    }else{
     console.log(orderid)
    }
  
    try {
   
      const doc = await Order.findOneAndUpdate(
        { _id: orderid },
        { $set: { orderStatus: 'Checkout' } },
        { new: true }
      );
  
      
      if (!doc) {
        return res.status(404).json({ message: 'No Order found' });  
      }
  
      
      return res.status(200).json({ message: 'Order Accepted', order: doc });
    } catch (error) {
      console.error('Error fetching orders:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }

  }
   
  const getCustomerAcceptOrder = async(req,res) =>{
    const { userID } = req.query;
  
    if (!userID) {
      return res.status(400).json({ message: 'No user ID found' });
    }
  
    try {
      
      
      const postdoc = await Order.find({
        UserID: userID,
        orderStatus: { $in: ['Accepted', 'Checkin'] }
      });
      
  
      if (postdoc.length > 0) {
        const documents = postdoc.map((doc) => ({
          orderid: doc._id,
          hotelid: doc.HotelID, 
          checkinDate: doc.Checkindate,
          checkoutDate: doc.Checkoutdate,
          status: doc.orderStatus,
        }));
        
        console.log(documents);
      
        const documentOrders = await Promise.all(
          documents.map(async (doc) => {
            const orderdoc = await Post.find({ PostID: doc.hotelid }); 
            return orderdoc.map((doc2) => ({
              orderid: doc.orderid,  
              checkinDate: doc.checkinDate,
              checkoutDate: doc.checkoutDate,
              status: doc.status,
              HotelDetails: {
                hotelid: doc2.PostID,
                hotelName: doc2.HotelName,
                Address: doc2.Address,
                price: doc2.price,
              },
            }));
          })
        );
      
        const flattenedDocumentOrders = documentOrders.flat();  
        res.json(flattenedDocumentOrders);  
      } else {
        return res.status(200).json('There are no orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
  const getCustomerCheckoutOrder = async(req,res) =>{
    const { userID } = req.query;
  
    if (!userID) {
      return res.status(400).json({ message: 'No user ID found' });
    }
  
    try {
      
      
      const postdoc = await Order.find({
        UserID: userID,
        orderStatus: { $in: ['Checkout'] }
      });
      
  
      if (postdoc.length > 0) {
        const documents = postdoc.map((doc) => ({
          orderid: doc._id,
          hotelid: doc.HotelID, 
          checkinDate: doc.Checkindate,
          checkoutDate: doc.Checkoutdate,
          status: doc.orderStatus,
        }));
        
        console.log(documents);
      
        const documentOrders = await Promise.all(
          documents.map(async (doc) => {
            const orderdoc = await Post.find({ PostID: doc.hotelid }); 
            return orderdoc.map((doc2) => ({
              orderid: doc.orderid,  
              checkinDate: doc.checkinDate,
              checkoutDate: doc.checkoutDate,
              status: doc.status,
              HotelDetails: {
                hotelid: doc2.PostID,
                hotelName: doc2.HotelName,
                Address: doc2.Address,
                price: doc2.price,
              },
            }));
          })
        );
      
        const flattenedDocumentOrders = documentOrders.flat();  
        res.json(flattenedDocumentOrders);  
      } else {
        return res.status(200).json('There are no orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }


module.exports = {createOrder,getUserOrders,AcceptOrders,
  DeniedOrders,getCustomerAcceptOrder,
  IsCheckin,IsCheckout,getCustomerCheckoutOrder}