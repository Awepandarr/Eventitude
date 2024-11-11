const db=require("../../database");
//Add event
const addEvent = function(event, done) {
    const sql = `INSERT INTO events (name, description, location, start_date, close_registration, max_attendees, creator_id) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  
    db.run(sql, [event.name,event.description,event.location,event.start_date,event.close_registration,event.max_attendees,event.creator_id], function(err) {
      if (err) {
        console.error("Error inserting event:", err);
        return done(err, null);
      }
      return done(null, { event_id: this.lastID });
    });
  }
  //Get event by id
const getEventDetails=(event_id,done)=>{
    const sql="SELECT * FROM events JOIN users ON events.creator_id=users.user_id WHERE event_id=?";
    db.get(sql,[event_id],(err,row)=>{
        if(err){
            return done(err,null);
        }
        if(!row){
            return done(null,null);
        }
        const eventformat={
            event_id:row.event_id,
            creator:{
                creator_id:row.creator_id,
                first_name:row.first_name,
                last_name:row.last_name,
                email:row.email
            },
            name:row.name,
            description:row.description,
            location:row.location,
            start:row.start_date,
            close_registration:row.close_registration,
            max_attendees:row.max_attendees
        };

        return done(null,eventformat);
    });
};
//update event
const updateEvent = (eventId, event, done) => {
    const sql = "UPDATE events SET name = ?, description = ?, location = ?, start_date = ?, close_registration = ?, max_attendees = ? WHERE event_id = ?";
    db.run(sql, [event.name,event.description,event.location,event.start_date,event.close_registration,event.max_attendees,eventId], 
        function (err) {
        if (err) {
            return done(err, null);
        }
        console.log(`Event with ID ${eventId} updated successfully`);

       findEvent(eventId,done);
        
    });
};
const deleteEvent = (eventId, done) => {
    const sql = "DELETE FROM events WHERE event_id=?";
    
    db.run(sql, [eventId], function(err) {
        console.log('done is:', done);  
        
        if (err) {

            return done(err, null);
        }
        

        return done(null, { success: true });
    });
};

const findEvent = (eventId, done) => {
    const sql = "SELECT * FROM events WHERE event_id=?";
    
    db.get(sql, [eventId], (err, row) => {
        if (err) {
            return done(err, null);  
        }
        if (!row) {
            return done(null, null); 
        } 
        return done(null, row);  
    });
};


module.exports={
        addEvent,
        getEventDetails,
        updateEvent,
        deleteEvent,
        findEvent
    }
        
    