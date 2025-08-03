import foodModel from '../models/foodModel.js';
import fs from 'fs';

const addFood = async (req, res) => {
  try {
    // Get text fields from form-data
    const { name, description, price, category } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Check if image uploaded
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image file is required" });
    }

    // Save image path or filename
    const imageFileName = req.file.filename; // ✅ just '1751212225703food_5.png'

    // Create and save food document
    const food = new foodModel({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    image: imageFileName,
    });

    await food.save();
    res.json({ success: true, message: "Food added successfully" });
  } catch (error) {
    console.error("Error saving food:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// all food list
const listFood = async (req,res) => {
    try {
      const foods = await foodModel.find({});
      res.json({success:true,data:foods})
    } catch (error) {
      console.log(error);
      res.json({success:false,message:"Error"})
    }
}

// remove food item
const removeFood = async (req,res) =>{
  try {
    const food = await foodModel.findById(req.body.id);
 
    fs.unlink(`uploads/${food.image}`, () => {});

    await foodModel.findByIdAndDelete(req.body.id),
    res.json({success:true,message:"Food Removed"})
  } catch (error) {
    console.log(error),
    res.json({success:false,message:"Error"})
  }
}

export {addFood,listFood,removeFood}   