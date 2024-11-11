const events=require("../controllers/event.server.controllers");
const auth=require("../libs/middleware");
const express=require('express');
const app=express();
module.exports=function(app){
    app.route("/events")
    .post(auth.isAuthenticated,events.create_event);
    app.route("/event/:event_id")
    .get(auth.isAuthenticated,events.get_event);
    app.route("/event/:event_id")
    .patch(auth.isAuthenticated,events.update_event);
    app.route("/event/:event_id")
    .delete(auth.isAuthenticated,events.delete_event);
};
