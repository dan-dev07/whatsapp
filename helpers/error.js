const MensajeError =(msgError, error)=>{
  console.log(msgError, error);
  return {
    error: error,
  };
};

module.exports = {
  MensajeError,
}