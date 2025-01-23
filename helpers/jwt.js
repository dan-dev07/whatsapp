const jwt = require('jsonwebtoken');
require('dotenv').config();

const generarJWT = (usuario)=>{
  return new Promise ( (resolve, reject)=>{
    // const {nombre, email, uid, rol} = usuario
    const {nombre, uid, rol} = usuario
    // const payload = {nombre, email, uid, rol};
    const payload = {nombre, uid, rol};
    jwt.sign(payload, process.env.JWT_KEY, {
      expiresIn:'24h'
    }, (err, token)=>{
      if (err) {
        console.log(err);
        reject('No se pudo generar el jwt');
      }else{
        resolve(token);
      }
    } )
  })
};

const comprobarJWT = (token = '') => {
  try {
    // const {nombre, email, uid, rol} = jwt.verify(token, process.env.JWT_KEY);
    const {nombre, uid, rol} = jwt.verify(token, process.env.JWT_KEY);
    // return [true, {nombre, email, uid, rol}];
    return [true, {nombre, uid, rol}];
  } catch (error) {
    return [false, null];
  }  
}

module.exports = {
  generarJWT,
  comprobarJWT,
}