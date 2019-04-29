const server=require("express")();
const line=require("@line/bot-sdk");
const request=require('request');

const gglplaceApi=`https://maps.googleapis.com/maps/api/place/nearbysearch/json?`;
const key="AIzaSyD1kAwMRJfaAHuEtlL3qGRDlVxde0jiyKM";
const line_config={
    channelAccessToken: process.env.LINE_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET
};

server.listen(process.env.PORT || 3000);
const bot=new line.Client(line_config)
server.post('/bot/webhook',line.middleware(line_config),(req,res,next)=>{
    res.sendStatus(200);
    req.body.events.forEach((event) => {
        if(event.type=="message" && event.message.type=="text"){
            request.get({
                uri: 'https://maps.googleapis.com/maps/api/place/textsearch/json',
                headers: {'Content-type': 'application/json'},
                qs:{
                    key: key,
                    query: event.message.text,
                    language: "ja",
                    radius: 1500,
                    location: "33.583389,130.421172"
                },
                json: true
            },function(err,req,data){
                let res=[];
                for(let i=0;i<3;i++){
                    res[i]={
                        "title": data.results[i].name,
                        "text": data.results[i].formatted_address,
                        "actions":[
                            {
                                "type": "postback",
                                "label": "気になる",
                                "data": `lat=${data.results[i].geometry.location.lat}&lng=${data.results[i].geometry.location.lng}`,
                                "displayText":"ここが気になる"
                            }
                        ]
                    }
                }
                const resp=[
                    {
                        "type": "text",
                        "text": "こことかどうかな?"
                    },
                    {
                        "type": "template",
                        "altText": "検索結果",
                        "template":{
                            "type": "carousel",
                            "columns": res
                        }  
                    }
                ];
                bot.replyMessage(event.replyToken,resp);
            })
        }else if(event.type=="postback"){
            console.log(event);
        }
    });
});