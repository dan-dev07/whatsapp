const SampleText =(number, textResponse)=>{
  const data = JSON.stringify({
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": number,
    "type": "text",
    "text": {
      "body": textResponse
    }
  });
  return data;
};

const SampleImage =(number, id)=>{
  const data = JSON.stringify({
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": number,
    "type": "image",
    "image":{
      id,
    }
  });
  return data;
};

const SampleAudio =(number)=>{
  const data = JSON.stringify({
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": number,
    "type": "audio",
    "audio": {
      "link": "https://lookaside.fbsbx.com/whatsapp_business/attachments/?mid=1071889021132057&ext=1727904615&hash=ATvdhLwF2ZtcZVTTVUnEB21cgb2UFLKaQtixGY2XvVlMlw"
    }
  });
  return data;
};

const SampleVideo =(number)=>{
  const data = JSON.stringify({
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": number,
    "type": "audio",
    "video": {
      "link": "https://biostoragecloud.blob.core.windows.net/resource-udemy-whatsapp-node/video_whatsapp.mp4"
    }
  });
  return data;
};

const SampleDocument =(number, id, filename)=>{
  const data = JSON.stringify({
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": number,
    "type": "document",
    "document": {
      id,
      filename
    }
  });
  return data;
};

const SampleButton =(number)=>{
  const data = JSON.stringify({
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": number,
    "type": "interactive",
    "interactive": {
      "type": "button",
      "header": {
          "type":"text",
          "text":"Identificación de usuario"
      },
      "body": {
          "text": "¿Confirmas tu registro?"
      },
      "action": {
          "buttons": [
              {
                  "type": "reply",
                  "reply": {
                      "id": "01",
                      "title": "Si"
                  }
              },
              {
                  "type": "reply",
                  "reply": {
                      "id": "02",
                      "title": "No"
                  }
              }
          ]
      }
  }
  });
  return data;
};

module.exports ={
  SampleAudio,
  SampleButton,
  SampleDocument,
  SampleImage,
  SampleText,
  SampleVideo
}