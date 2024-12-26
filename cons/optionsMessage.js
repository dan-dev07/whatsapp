
const optionsMessage =(data) => {
  const options ={
  host: 'graph.facebook.com',
  path: '/v20.0/451082418098784/messages',
  method: 'POST',
  body: data,
  headers: {
    "Content-type": "application/json",
    "Authorization": `Bearer ${process.env.WHATSAPP_API_KEY}`
  }}
  return options;
};

module.exports ={
  optionsMessage
}