const Order=require("../models/orderModel");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorhandler");
const CatchAsyncErrors = require("../middleware/CatchAsyncErrors");
const User = require("../models/userModel");

//Create new Order

exports.newOrder = CatchAsyncErrors(async(req,res,next)=>{

    const{
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    }=req.body;
    const order=await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt:Date.now(),
        user:req.user._id
});

res.status(201).json({
    success:true,
    order
})
})

//get Single Order

exports.getSingleOrder = CatchAsyncErrors(async(req,res,next)=>{
    const order=await Order.findById(req.params.id).populate("user","name email");

    if(!order){
        return next(new ErrorHandler('Order not found with this id',404));
    }
    
    res.status(200).json({
        success:true,
        order,
    })
});

//get logged in user orders
 

exports.myorder = CatchAsyncErrors(async(req,res,next)=>{
    const orders = await Order.find({user:req.user._id});

    res.status(200).json({
        success:true,
        orders,
    })
})

//Get all orders -- Admin

exports.getAllOrders=CatchAsyncErrors(async(req,res,next)=>{
  const orders =await Order.find();
    
  let totalAmount=0;
  orders.forEach((order)=>{
    totalAmount+=order.totalPrice;
  });
  res.status(200).json({
    success:true,
    totalAmount,
    orders
  })
})

//update Order Status -- Admin
exports.updateOrder = CatchAsyncErrors(async (req,res,next)=>{
    const order = await Order.findById(req.params.id);
    if(!order)
    {
        return next(new ErrorHandler("Order not found with this id",404));
    }
    if(order.orderStatus==="Delivered"){
        return next(new ErrorHandler("Yoy have already delivered this order",400));
    }

    order.orderItems.forEach(async(o) => {
        await updateStock(o.product,o.quantity);

        
    });

    order.orderStatus = req.body.status;

    if(req.body.status=="Delivered"){
        order.deliveredAt=Date.now();
    }

    await order.save({validateBeforeSave:false});
    res.status(200).json({
        success:true,
        message:"Order Successfully Delievered"
    })
})

async function updateStock(id,quantity)
{
    const product = await Product.findById(id);

    product.Stock -= quantity;

    await product.save({validateBeforeSave:false})
}

//delete Order -- Admin

exports.deleteOrder = CatchAsyncErrors(async(req,res,next)=>{
    
    const order=await Order.findById(req.params.id);
    if(!order)
    {
        return next(new ErrorHandler("Order not found with this id",404));
    }

    await Order.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success:true
    })
})