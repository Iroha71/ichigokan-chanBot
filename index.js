const server=require("express")();
const line=require("@line/bot-sdk");

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
            if(event.message.text=="こんにちは" ||event.message.text=="にゃにゃ"){
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
                                "text": "テキスト"
                            }
                        ]
                    }
                }
                bot.replyMessage(event.replyToken,resp)
            }
        }
    });
    // Promise.all(evt_prc).then(
    //     (response)=>{
    //         console.log(`${response.length} events processed`);
    //     }
    // );
});