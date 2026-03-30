const mongoose=require("mongoose");
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true 

    },
    password:{
        required:true,
        minlength:6,
        type:String
    }
},{
    timestamps:true 
});
module.exports=new mongoose.model("User",userSchema);
