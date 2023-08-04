const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorhandler");
const CatchAsyncErrors = require("../middleware/CatchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");
//Create Product

exports.createProduct = CatchAsyncErrors( async(req,res,next)=>{

    req.body.user=req.user.id;
    const product = await Product.create(req.body);


    res.status(201).json({
        success:true,
        product
    })
});

exports.getAllProducts = CatchAsyncErrors( async (req,res,next)=>{

    
    const resultPerPage = 10;
    const ProductCount = await Product.countDocuments();
   const apiFeature= new ApiFeatures(Product,req.query).search().filter().pegination(resultPerPage);

     const products=await apiFeature.query;

    res.status(200).json({
        success:true,
        products,
        ProductCount
    })
});

//Get product details
exports.getProductDetails = CatchAsyncErrors( async(req,res,next)=>{
    const product=await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHandler("Product not found",404));
    }

    res.status(200).json({
        success:true,
        product
    })
});

//Update Product

exports.updateProduct= CatchAsyncErrors( async (req,res,next)=>{
    let product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHandler("Product not found",404));
    }



    product= await Product.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    });

    res.status(200).json({
        success:true,
        message:"Product Updated"
    })
});

//Delete Product

exports.deleteProduct=CatchAsyncErrors( async (req,res,next)=>{

    let product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHandler("Product not found",404));
    }


   const deletedproduct= await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success:true,
        message:"Product deleted Successfully"
    })

});

//Create New Review or Update the review

exports.createProductReview = CatchAsyncErrors(async(req,res,next)=>{
    const {rating,comment,productId} = req.body;
    const review = {
        user:req.user.id,
        name:req.user.name,
        rating: Number(rating),
        comment,
    }

    const product = await Product.findById(productId);
    
    const isReviewed= product.reviews.find((rev) => rev.user.toString()===req.user._id.toString())
    
    if(isReviewed){
      product.reviews.forEach((rev)=>{
        if(rev.user.toString()===req.user._id.toString()){  
            rev.rating=rating,
            rev.comment=comment
        }
        
      })
    }
    else{
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }
    let avg=0;
    product.reviews.forEach((rev)=>{
        avg+=rev.rating;
    })

    product.rating=avg/(product.reviews.length);
    
    await product.save({validateBeforeSave:false});

    res.status(200).json({
        success:true,
    })
})

//Delete Review
exports.deleteReview=CatchAsyncErrors(async(req,res,next)=>{
    const product = await Product.findById(req.query.productId);

    if(!product){
        return next(new ErrorHandler("Product not found",404));

    }
    const reviews = product.reviews.filter((rev)=>rev._id.toString() !== req.query.id.toString());

    let avg=0;
    reviews.forEach((rev)=>{
        avg+=rev.rating;
    })

    const rating=avg/(reviews.length);
    
    const numOfReviews = reviews.length;

    await Product.findByIdAndUpdate(req.query.productId,{
        reviews,
        rating,
        numOfReviews,
    },{
        new:true,
        runValidators:true,
        useFindAndModify:false
    });

    res.status(200).json({
        success:true,
    })

})

//Get All reviews of a product

exports.getProductReviews = CatchAsyncErrors(async(req,res,next)=>{
    const product = await Product.findById(req.query.productId);

    if(!product){
        return next(new ErrorHandler("Product not found",404));
    }
        res.status(200).json({
            success:true,
            reviews:product.reviews
        })
    
})