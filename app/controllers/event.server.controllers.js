
const events=require("../models/event.server.models");
const users=require("../models/user.server.models");
const Joi=require('joi');
//Creating a new event
const create_event=(req,res)=>{
    console.log("Received request to create an event",req.body);
    const user_id = req.user_id;
    const schema=Joi.object({
        name:Joi.string().trim().min(1).required(),
        description:Joi.string().trim().min(1).required(),
        location:Joi.string().trim().min(1).required(),
        start:Joi.date().timestamp('unix').min('now').required(),
        close_registration:Joi.date().timestamp('unix').less(Joi.ref('start')).greater(0).required(),
        max_attendees:Joi.number().integer().min(1).required()
    });
    const {error}=schema.validate(req.body);
    if(error){
        console.error("Validation error:",error.details[0].message);
        return res.status(400).send({error_message:error.details[0].message});
    }
    events.addEvent({
        name:req.body.name,
        description:req.body.description,
        location:req.body.location,
        start_date:req.body.start,
        close_registration:req.body.close_registration,
        max_attendees:req.body.max_attendees,
        creator_id:user_id
    },(err,eventData)=>{
        if(err){
            console.error("Failed to create an event:",err.message);
            return res.status(500).send({ error_message: 'Failed to create event' });
        }
        return res.status(201).send(eventData);
    });
};
//Get event by event id
const get_event=(req,res)=>{
    const eventId=req.params.event_id;
    events.getEvent(eventId,(err,event)=>{
        if(err){
        return res.status(500).send({error_message:"Internal server error"});
        }
        if(!event){
            return res.status(404).send({error_message:"Event not found"});
        }
        res.status(200).send(event);
    })
}

//Update event
const update_event = (req, res) => {
    const eventId = req.params.event_id;
    const schema = Joi.object({
        name: Joi.string().trim().allow(null),
        description: Joi.string().trim().allow(null),
        location: Joi.string().trim().allow(null),
        start: Joi.date().timestamp('unix').min('now').allow(null),
        close_registration: Joi.date().timestamp('unix').greater(0).allow(null).when('start', {
            is: Joi.exist(),
            then: Joi.date().less(Joi.ref('start'))
        }),
        max_attendees: Joi.number().integer().min(1)
    });

    const { error } = schema.validate(req.body);
    if (error) {
        console.error("Validation error:", error.details[0].message);
        return res.status(400).send({ error_message: error.details[0].message });
    }

    events.updateEvent(eventId, {
        name: req.body.name,
        description: req.body.description,
        location: req.body.location,
        start_date: req.body.start,
        close_registration: req.body.close_registration,
        max_attendees: req.body.max_attendees
    }, (err, event) => {
        console.log("Updated Event:", event);
        if (err) {
            return res.status(500).send({ error_message: "Internal server error" });
        }

        if (!event) {
            return res.status(404).send({ error_message: "Event not found" });
        }

       
        if (event.creator_id !== req.user_id) {
            return res.status(403).send({ error_message: "Forbidden" });
        }


        res.status(200).send({message:"Event updated successfully",event});
    });
};
//Delete Event
const delete_event = (req, res) => {
    const eventId = req.params.event_id;

    events.findEvent(eventId, (err, event) => {
        if (err) {
            console.error('Error finding event:', err);
            return res.status(500).send({ error_message: "Internal server error" });
        }

        if (!event) {
            return res.status(404).send({ error_message: "Event not found" });
        }

        if (event.creator_id !== req.user_id) {
            return res.status(403).send({ error_message: "Forbidden" });
        }

        
        events.deleteEvent(eventId, (err, result) => {
            if (err) {
                console.error('Error deleting event:', err);
                return res.status(500).send({ error_message: "Internal server error" });
            }

            res.status(200).send({ message: "Deleted successfully" });
        });
    });
};




module.exports={
    create_event,
    get_event,
    update_event,
    delete_event
}
