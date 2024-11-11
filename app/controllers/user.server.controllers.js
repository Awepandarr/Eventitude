const users = require('../models/user.server.models');
const Joi = require('joi');

const create_account = (req, res) => {
    console.log("Received request to create account:", req.body);  
    const schema = Joi.object({
        first_name: Joi.string().trim().min(1).required(),
        last_name: Joi.string().trim().min(1).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).max(20)
                    .pattern(/[0-9]/, 'number')
                    .pattern(/[!@#$^&*(),.?:{}|<>]/, "special character")
                    .pattern(/[A-Z]/, "uppercase letter")
                    .pattern(/[a-z]/, "lowercase letter")
                    .required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        console.error("Validation error:", error.details[0].message);  
        return res.status(400).send({ error_message: error.details[0].message });
    }

    users.check_email(req.body.email, (err, userExists) => {
        if (err) {
            console.error("Error checking email", err);
            return res.status(500).send({ error_message: "Internal server error" });
        }
        if (userExists) {
            return res.status(400).send({ error_message: "The email already exists" });
        }

        users.addUser({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            password: req.body.password
        }, (err, userData) => {
            if (err) {
                console.error("Failed to create account:", err.message);  
                return res.status(500).send({ error_message: "Failed to create account: " + err.message });
            }
            return res.status(201).send(userData);
        });
    });
};

const login = (req, res) => {
    const schema = Joi.object({
        email: Joi.string().email().required().messages({'string.email': 'Email must be a valid email address.',
        'any.required': 'Email is required.'}),
        password: Joi.string().required().messages({'string.password': 'Password must be a valid',
            'any.required': 'password is required.'})
    });

    const { error } = schema.validate(req.body);
    if (error) {
        console.error("Validation error:", error.details[0].message);  
        return res.status(400).send({ error_message: error.details[0].message });
    }
    
    users.authenticateUser(req.body.email, req.body.password, (err, id) => {
    
        if (err === 404) {
            return res.status(400).send({error_message:"Invalid email/password supplied"});
        }
        if (err) {
            return res.status(500).send({error_message:"Error authenticating user"});
        }

        users.getToken(id, (err, token) => {
            if (err) {
                return res.status(500).send({error_message:"Error getting token"});
            }

            if (token) {
                return res.status(200).send({ user_id: id, session_token: token });
            } else {
                users.setToken(id, (err, newToken) => {
                    if (err) {
                        return res.sendStatus(500);
                    }
                    return res.status(200).send({ user_id: id, session_token: newToken });
                    
                });
            }
        });
    });
};
const logout=(req,res)=>{
    const authHeader=req.headers['authorization'];
    const token=authHeader&&authHeader.split(' ')[1];
    if(!token){
        return res.status(400).send({error_message:"No token provided."});
    
    }
    users.removeToken(token,(err)=>{
        if(err){
            return res.status(500).send({error_message:"Invalid server error"});
        }
        return res.status(200).send({message:"Logged out successfully"});
    });
    return null;
    }
module.exports = {
    create_account,
    login,
    logout
};