const server=require("express")();
const line=require("@line/bot-sdk");
const request=require('request');

const gglplaceApi=`https://maps.googleapis.com/maps/api/place/nearbysearch/json?`;
const gglMapApi="https://maps.googleapis.com/maps/api/js";
const key="AIzaSyD1kAwMRJfaAHuEtlL3qGRDlVxde0jiyKM";
const line_config={
    channelAccessToken: process.env.LINE_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET
};

server.listen(process.env.PORT || 3000);
const bot=new line.Client(line_config)
server.post('/bot/webhook',line.middleware(line_config),(req,res,next)=>{
    res.sendStatus(200);
    console.log(req.body);
    let evt_prc=[];
    req.body.events.forEach((event) => {
        if(event.type=="message" && event.message.type=="text"){
            if(event.message.text=="飲食店"){
                request.get({
                    uri: gglplaceApi+`key=${key}&location=33.5337369,130.3802676&radius=1500&language=ja&type=restaurant`,
                    headers: {'Content-type': 'application/json'},
                    json: true
                },function(err,req,data){
                    console.log(data);
                })
                const resp={
                    "type": "template",
                    "altText": "代替テキスト",
                    "template":{
                        "type": "buttons",
                        "text" :"テキスト",
                        "actions":[
                            {
                                "type": "message",
                                "label": "ラベル",
                                "text": "にゃにゃ"
                            }
                        ]
                    }
                }
                bot.replyMessage(event.replyToken,resp)
            }
        }
    });
});