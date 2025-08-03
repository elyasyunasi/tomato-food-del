import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe"
import fetch from "node-fetch"; // Required for Node.js
import dotenv from 'dotenv';
dotenv.config()


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

//placing user order for frontend
const placeOrder = async(req,res) => {

    const frontend_url = "http://localhost:5173"

    try {
   const getUSDtoTRYRate = async () => {
  const response = await fetch(`https://v6.exchangerate-api.com/v6/4df3fe245df73a5b1064ab04/latest/USD`);
  const data = await response.json();

  console.log("API Response:", data); // ✅ Debugging line

  const usdToTry = data.conversion_rates?.TRY;

  if (!usdToTry) {
    throw new Error("TRY rate not found in API response");
  }

  return usdToTry;
};

        const newOrder = new orderModel({
        userId:req.body.userId,
        items:req.body.items,    
        amount:req.body.amount,
        address:req.body.address

        })
        await newOrder.save();
        await userModel.findByIdAndUpdate(req.body.userId,{cartData:{}})

        const exchangeRate = await getUSDtoTRYRate();

        const line_items = req.body.items.map((item)=>({
            price_data:{
                currency:"try",
                product_data:{
                    name:item.name
                },
                unit_amount:Math.round(item.price * exchangeRate * 100)
            },
            quantity:item.quantity
        }))

        line_items.push({
            price_data:{
                currency:"try",
                product_data:{
                    name:"Delivery Charges"
                },
                unit_amount:Math.round(2 * exchangeRate * 100)

            },
            quantity:1
        })

        const session = await stripe.checkout.sessions.create({
            line_items:line_items,
            mode:'payment',
            success_url:`${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url:`${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
        })
  
         res.json({success:true,session_url:session.url})
        
    } catch (error) {
        console.log(error)
        res.json({success:false,message:"Error 1"})
        
    }
}  

const verifyOrder = async (req,res) =>{
    const {orderId,success} = req.body;
    try {
        if (success=="true"){
            await orderModel.findByIdAndUpdate(orderId,{payment:true});
            res.json({success:true,message:"Paid"})
        }
        else{
            await orderModel.findByIdAndDelete(orderId);
            res.json({success:false,message:"Not Paid"})
        }
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error 2"})
    }
}

// user orders for frontend
const userOrders = async (req,res) => {
try {
    const orders = await orderModel.find({userId:req.body.userId});
    res.json({success:true,data:orders})
    
} catch (error) {
    console.log(error)
    res.json({success:false,message:"Error"})
    
}
}

export {placeOrder,verifyOrder,userOrders}


