const mongoose=require("mongoose");
const connectDB=async()=>{
    try{
        await mongoose.connect("mongodb://localhost:27017/AI_MOCK");
        console.log("Connected to database..");

    }
    catch(error){
        console.log(error);
    }
}
module.exports=connectDB;