'use strict';

const User = require('./users-model.js');

module.exports = (req, res, next) => {
  
  try {
    console.log(req.headers);
    let [authType, authString] = req.headers.authorization.split(/\s+/);
    
    switch( authType.toLowerCase() ) {
    case 'basic': 
      return _authBasic(authString);
    case 'bearer':
      console.log(authString);
      return _authBearer(authString);
    default: 
    
      return _authError();
    }
  }
  catch(e) {
    _authError();
  }
  
  
  function _authBasic(str) {
    // str: am9objpqb2hubnk=
    let base64Buffer = Buffer.from(str, 'base64'); // <Buffer 01 02 ...>
    let bufferString = base64Buffer.toString();    // john:mysecret
    let [username, password] = bufferString.split(':'); // john='john'; mysecret='mysecret']
    let auth = {username,password}; // { username:'john', password:'mysecret' }
    
    return User.authenticateBasic(auth)
      .then(user => _authenticate(user) )
      .catch(next);
  }

  function _authBearer(authString){
    console.log(authString);
    return User.authenticateBearer(authString)
      .then(user => _authenticate(user))
      .catch(next);
  }

  function _authenticate(user) {
    if(user) {
      req.user = user;
      req.token = user.generateToken();
      next();
    }
    else {
      _authError();
    }
  }
  
  function _authError(){
    next({status: 401, statusMessage: 'Unauthorized', message: 'Invalid User ID/password'});
  }
  
};