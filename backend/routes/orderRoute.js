const express=require("express");
const router=express.Router();

const{isAuthenticatedUser,authorizedRoles} = require("../middleware/auth");
const { newOrder, getSingleOrder, myorder, getAllOrders, updateOrder, deleteOrder } = require("../controllers/ordercontroller");

router.route("/order/new").post(isAuthenticatedUser,newOrder);
router.route("/order/:id").get(isAuthenticatedUser,authorizedRoles("admin"),getSingleOrder);
router.route("/orders/myorders").get(isAuthenticatedUser,myorder);
router.route("/admin/orders").get(isAuthenticatedUser,authorizedRoles("admin"),getAllOrders);
router.route("/admin/order/:id").put(isAuthenticatedUser,authorizedRoles("admin"),updateOrder).delete(isAuthenticatedUser,authorizedRoles("admin"),deleteOrder);


module.exports=router;