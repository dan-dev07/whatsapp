const MensajeError =(msgError, error)=>{
  console.log(msgError);
  return {
    msg: msgError,
    error: error,
  };
};

module.exports = {
  MensajeError,
}