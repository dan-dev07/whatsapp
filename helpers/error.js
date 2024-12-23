const MensajeError =(msgError, error)=>{
  console.log(msgError, error);
  return {
    msg: msgError,
    error: error,
  };
};

module.exports = {
  MensajeError,
}