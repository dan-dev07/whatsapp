const numeroTelefono = (messages) => {
  let newNumber = '';
  const number = messages['from'];
  if (number.length === 13 && number.startsWith('521')) {
    newNumber = '52' + number.slice(3, 13);
  };
  return newNumber;
};

const idImagen = (messages) => {
  const id = messages['image']['id'];
  return id;
};

const idPdf = (messages) => {
  const id = messages['document']['id'];
  return id;
};



module.exports = {
  numeroTelefono,
  idImagen,
  idPdf,
}