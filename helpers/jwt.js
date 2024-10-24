const jwt = require('jsonwebtoken');

const generarJWT = (usuario)=>{
  return new Promise ( (resolve, reject)=>{
    const {nombre, email, id, rol} = usuario
    const payload = {nombre, email, id, rol};
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
    const {nombre, email, id, rol} = jwt.verify(token, process.env.JWT_KEY);
    return [true, {nombre, email, id, rol}];
  } catch (error) {
    return [false, null];
  }  
}

module.exports = {
  generarJWT,
  comprobarJWT,
}