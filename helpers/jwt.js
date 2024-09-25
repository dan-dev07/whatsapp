const jwt = require('jsonwebtoken');

const generarJWT = (usuario)=>{
  return new Promise ( (resolve, reject)=>{
    const {nombre, email, id} = usuario
    const payload = {nombre, email, id};
    jwt.sign(payload, 'v$N6ste24-z0', {
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
    const {nombre, email, id} = jwt.verify(token, 'v$N6ste24-z0');
    // return [true, id];
    return [true, {nombre, email, id}];
  } catch (error) {
    return [false, null];
  }  
}

module.exports = {
  generarJWT,
  comprobarJWT,
}