const SampleText =()=>{
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

const SampleImage =(number)=>{
  const data = JSON.stringify({
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": number,
    "type": "image",
    "image":{
      "link": "https://lookaside.fbsbx.com/whatsapp_business/attachments/?mid=1030330835504260&ext=1727737929&hash=ATufqcBzQxaUUUqtH9AoPcFJI6vjmhw8Z8Lreff3O4pdoA"
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
      "link": "https://biostoragecloud.blob.core.windows.net/resource-udemy-whatsapp-node/audio_whatsapp.mp3"
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

const SampleDocument =(number)=>{
  const data = JSON.stringify({
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": number,
    "type": "document",
    "document": {
      "link": "https://biostoragecloud.blob.core.windows.net/resource-udemy-whatsapp-node/document_whatsapp.pdf"
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