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
            if(event.message.text=="ありがとう"){
                request.get({
                    uri: `https://api.line.me/v2/bot/profile/${event.source.userId}`,
                    headers: {'Authorization': `Bearer ${line_config.channelAccessToken}`},
                    json: true
                },function(err,req,data){
                    console.log(data);
                    const resp=[
                        {
                            "type": "text",
                            "text": `どういたしまして！${data.displayName}さんも遊んでくれてありがとう！！`
                        },
                        {
                            "type": "text",
                            "text": "ぜひ、また遊びに来てね♪"
                        }
                    ]
                    bot.replyMessage(event.replyToken,resp);
                })
            }else{
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
                                    "data": `${data.results[i].formatted_address}&${data.results[i].geometry.location.lat}&${data.results[i].geometry.location.lng}`,
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
            }
        }else if(event.type=="postback"){
            const address=event.postback.data.split("&");
            const resp=[
                {
                    "type": "text",
                    "text": "ここにあるよ!"
                },
                {
                    "type": "location",
                    "title": "場所",
                    "address": address[0],
                    "latitude": parseFloat(address[1]),
                    "longitude": parseFloat(address[2])
                }
            ];
            console.log(address[0]);
            bot.replyMessage(event.replyToken,resp);
        }
    });
});