
const optionsMessage =(data) => {
  const options ={
  host: 'graph.facebook.com',
  path: '/v21.0/484978648036027/messages',
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