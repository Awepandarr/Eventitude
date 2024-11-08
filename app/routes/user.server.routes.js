const users=require("../controllers/user.server.controllers");
const auth=require("../libs/middleware");
const express=require('express');
const app=express();
module.exports=function(app){
    app.route("/users")
    .post(users.create_account);
    app.route("/login")
    .post(users.login);
    app.post('/logout',auth.isAuthenticated,function(req,res){
            return res.status(200).send({message:"Logged out successfully"});
        })
};