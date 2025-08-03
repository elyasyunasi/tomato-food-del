import mongoose from "mongoose"

export  const connectDB = async () => {
    await mongoose.connect('mongodb+srv://yunasi-elyas:Elyas012345@cluster0.1hb7ine.mongodb.net/food-del').then(()=>console.log("DB connected"))
}

