

const TelegramBot = require('node-telegram-bot-api');
const dialogflow = require('dialogflow');


var FCM = require('fcm-node');
const uuidv1 = require('uuid/v1');

var serverKey = process.env.SERVER_KEY;
var clientToken = process.env.CLIENT_TOKEN;
var clientToken2 = process.env.CLIENT_TOKEN2;

const getToken = (function(){
    const token = process.env.TELEGRAM_TOKEN;
    return function() {
        return token;
    };
})();
const bot = new TelegramBot(getToken(), {polling: true});

/*const projectId = 'timetask-telegram-bot';
const sessionId = uuidv1();

const sessionClient = new dialogflow.SessionsClient({keyFilename:'./timetask-telegram-bot-49ebe8b01110.json'})
const sessionPath = sessionClient.sessionPath(projectId, sessionId);*/

var fcm = new FCM(serverKey);

/*bot.onText(/\/start/, function(msg, match) {
  var text = '원하는 기능을 선택해주세요.';
 
const keyboard = Markup.inlineKeyboard([
	  Markup.callbackButton('Bitshare ID', 'bts'),
	  Markup.callbackButton('Naver ID', 'naver'),
	  Markup.callbackButton('Ether Address', 'ether'),
	  Markup.callbackButton('Email','email'),
	  Markup.callbackButton('Confirm','confirm')
	], {column: 3})


  bot.sendMessage(msg.chat.id, text, Extra.markup(keyboard));
});*/

bot.onText(/\/메뉴/, function(msg, match) {
  var text = '원하시는 메뉴를 선택하세요.';
 
  var keyboardStr = JSON.stringify({
      inline_keyboard: [
        [
          {text:'일정 등록',callback_data:'callback_schedule'},
          {text:'날씨',callback_data:'callback_whether'},
	  {text:'베터리 정보',callback_data:'callback_battery'},
	  {text:'메모리 정보',callback_data:'callback_memory'}
        ]
      ]
  });
 
  var keyboard = {reply_markup: JSON.parse(keyboardStr)};
  bot.sendMessage(msg.chat.id, text, keyboard);
});

bot.onText(/날씨/, (msg, match) => {
  // 기상 RSS http://www.weather.go.kr/weather/lifenindustry/sevice_rss.jsp
    var RSS = "http://www.kma.go.kr/wid/queryDFSRSS.jsp?zone=1156054000";
    
    // 모듈 로드
    var client = require('cheerio-httpcli');
    
    // RSS 다운로드
    client.fetch(RSS, {}, function(err, $, res) {
      if (err) { 
        console.log("error: "+err); return; 
      }
    
      var city = $("location:nth-child(1) > city").text();
      var date = $("channel:nth-child(1) > pubDate").text() + ' 발표';
      bot.sendMessage(msg.chat.id, date);
      var temp = '온도: '+$("data:nth-child(1) > temp").text()+', '+$("data:nth-child(1) > wfKor").text();
      bot.sendMessage(msg.chat.id, temp);
      // 필요한 항목을 추출해서 표시 ---------------------- (※1)
      /*$("location:nth-child(1) > data").each(function(idx) {
    
        var tmEf = $(this).find('tmEf').text();
        var wf = $(this).find('wf').text();
        var tmn = $(this).find('tmn').text();
        var tmx = $(this).find('tmx').text();
        bot.sendMessage(msg.chat.id, city + " " + tmEf + " " + wf + " " + tmn +"~" + tmx);
        console.log(city + " " + tmEf + " " + wf + " " + tmn +"~" + tmx);
      });*/
    });	
});

/*bot.onText(/.+/, (msg, match) => {
    
   var result;

   const request = {
  session: sessionPath,
  queryInput: {
    text: {
      text: match[0],
      languageCode: 'ko',
    },
  },
 };
    
   sessionClient
  .detectIntent(request)
  .then(responses => {

    result = responses[0].queryResult;
    var chatId = msg.chat.id;
    var resp;
       
    console.log("queryText : " +result.queryText);
    console.log("Response : "  + result.fulfillmentText);
    console.log("Action : " + result.action);
       
    if (result.action == "fcm.schedule") {
       console.log("Come to method");
       resp = "일정 등록을 제안하였습니다.";
        
      var push_data = {
         // 수신대상
       to: clientToken2,
        // 메시지 중요도
       priority: "high",
        // App 패키지 이름
        restricted_package_name: "fcm.lge.com.fcm",
        // App에게 전달할 데이터
         data: {
            title: 'Registered schedule by telegram',
            body: result.fulfillmentText
            }
       };
        
          fcm.send(push_data, function(err, response) {
            if (err) {
                console.error('Push메시지 발송에 실패했습니다.');
                console.error(err);
                return;
                }

            console.log('Push메시지가 발송되었습니다.');
            console.log(response);
            });  
        
    } else {
      console.log(`  No intent matched.`);
      resp = result.fulfillmentText;
    }
       


     if(result.fulfillmentText == "") {
        resp = "response를 가져오지 못했습니다.";
     }

     bot.sendMessage(chatId, resp);

  })
  .catch(err => {
    console.error('ERROR about sessionClient :', err);
  });


});*/



