const users=require("../models/user.server.models");

const isAuthenticated = function(req, res, next) {
    const token = req.get('X-Authorization'); 
    
    if (!token) {
        return res.status(401).send({error_message:'Access Denied'});
    }

    users.getIdFromToken(token, (err, userId) => {
        if (err || !userId) {
            return res.status(401).send({error_message:'Invalid or expired token'});
        }

        req.user_id = userId;
        next();
    });
};
module.exports={
    isAuthenticated:isAuthenticated
}