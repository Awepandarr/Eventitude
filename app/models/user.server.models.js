const db = require("../../database");
const crypto = require('crypto');



/*
* addUser
*/
const addUser = (user, done) => {
    console.log("Attempting to add user:", user);  
    const salt = crypto.randomBytes(64).toString('hex');
    const hash = getHash(user.password, salt); 
    const sql = 'INSERT INTO users (first_name, last_name, email, password, salt) VALUES (?, ?, ?, ?, ?)';

    db.run(sql, [user.first_name, user.last_name, user.email, hash, salt], function(err) {
        if (err) {
            console.error("Error inserting user:", err); 
            return done(err); 
        }
        return done(null, { user_id: this.lastID });
    });
};

/*
* Email exists
*/
const check_email = (email, done) => {
    if (!email) return done(null, null);

    db.get('SELECT email FROM users WHERE email=?', [email], (err, row) => {
        if (err) {
            return done(err, null);
        }
        return done(null, row ? row.email : null);
    });
};
const getHash = function(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 100000, 256, 'sha256').toString('hex');
};

/*
* Authenticate User
*/
const authenticateUser = (email, password, done) => {
    const sql = "SELECT user_id, password, salt FROM users WHERE email=?";

    db.get(sql, [email], (err, row) => {
        if (err) {
            return done(err);
        }

        if (!row) {
            return done(404);
        }
        if (row.password === getHash(password, row.salt)) {
            console.log("Password matches.");
            return done(null, row.user_id);
        } else {
            console.log("Password does not match.");
            return done(404);
        }
    });
};

/*
* getToken
*/
const getToken = (id, done) => {
    const sql = 'SELECT session_token FROM users WHERE user_id=?';
    db.get(sql, [id], (err, row) => {
        if (row && row.session_token) {
            return done(null, row.session_token);
        }
        return done(null, null);
    });
};
/*
*seToken
*/
const setToken = (id, done) => {
    const token = crypto.randomBytes(16).toString('hex');
    const sql = 'UPDATE users SET session_token=? WHERE user_id=?';
    db.run(sql, [token, id], (err) => {
        return done(err, token);
    });
};
/*
*removeToken
*/

const removeToken = (token, done) => {
    const sql = 'UPDATE users SET session_token=null WHERE session_token=?'; 
    db.run(sql, [token], (err) => {
        return done(err);
    });
};
/*
*getIdFromToken
*/
const getIdFromToken = (token, done) => {
    if (!token) return done(true, null);

    const sql = 'SELECT user_id FROM users WHERE session_token=?';
    db.get(sql, [token], (err, row) => {
        if (row) {
            return done(null, row.user_id);
        }
        return done(err, null);
    });
};
module.exports = {
    addUser,
    check_email,
    setToken,
    getIdFromToken,
    getToken,
    removeToken,
    authenticateUser
};
