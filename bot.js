

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

const projectId = 'timetask-telegram-bot';
const sessionId = uuidv1();

const sessionClient = new dialogflow.SessionsClient({keyFilename:'./timetask-telegram-bot-49ebe8b01110.json'})
const sessionPath = sessionClient.sessionPath(projectId, sessionId);

var fcm = new FCM(serverKey);

//Firebase Database
var firebase = require('firebase');

var config = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    databaseURL: process.env.DATABASE_URL,
    storageBucket: process.env.STORAGE_BUCKET
  };
  
firebase.initializeApp(config);

var ref = firebase.database().ref('telegram-chatbot');
var messagesRef = ref.child('messages');

var messageRef = messagesRef.push();
var messageKey = messagesRef.key;
var payload = {};
/*var message = {
	text: 'hello database'
};


payload['userMessages/'+ messageKey] = message;

ref.update(payload);*/

messagesRef.orderByKey().limitToLast(1).on('child_added', function(snap) {
	console.log('added', snap.val());	
});

messagesRef.on('child_removed', function(snap){
	console.log('removed', snap.val());
});

messagesRef.on('child_changed', function(snap){
	console.log('changed', snap.val());
});

//Firebase 메세지 수신
//importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
//importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');
//var firebase = require('firebase-admin');

//firebase.initializeApp({ 'messagingSenderId': process.env.FCM_SENDER_ID});

// Initialize Firebase
  /*var config = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    databaseURL: process.env.DATABASE_URL,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.FCM_SENDER_ID
  };
  
  var app = firebase.initializeApp(config);*/
/*var app = firebase.initializeApp({
  credential: firebase.credential.cert({
    projectId: process.env.PROJECT_ID,
    clientEmail: process.env.FCM_EMAIL,
    privateKey: process.env.API_KEY
  }),
  databaseURL: process.env.DATABASE_URL,
  messagingSenderId: process.env.FCM_SENDER_ID
});

const messaging =  app.messaging();

// Add the public key generated from the console here.
//firebase.messaging.usePublicVapidKey(process.env.FCM_PUSH_AUTH);

 messaging.onTokenRefresh(function() {
    messaging.getToken().then(function(refreshedToken) {
      console.log('Token refreshed: '+refreshedToken);
    }).catch(function(err) {
      console.log('Unable to retrieve refreshed token ', err);
    });
  });

  // Get Instance ID token. Initially this makes a network call, once retrieved
  // subsequent calls to getToken will return from cache.
  messaging.getToken().then(function(currentToken) {
    console.log('Token refreshed: '+currentToken);
  }).catch(function(err) {
    console.log('An error occurred while retrieving token. ', err);
  });

messaging.onMessage(function(payload) {
  console.log('Message received. ', payload);
  // ...
});*/

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

bot.onText(/\/start/, function(msg, match) {
  var text = '안녕하세요. 텔레그램 챗봇입니다. 현재는 아래 메뉴의 기능만 가능합니다. 원하시는 메뉴를 선택해주세요.';
 
  var keyboardStr = JSON.stringify({
      inline_keyboard: [
        [
          {text:'일정 등록',callback_data:'callback_schedule'}
	],
	[
          {text:'날씨',callback_data:'callback_whether'}
	],
	[
	  {text:'베터리 정보',callback_data:'callback_battery'}
	],
	[
	  {text:'메모리 정보',callback_data:'callback_memory'}
        ]
      ]
  });
 
  var keyboard = {reply_markup: JSON.parse(keyboardStr)};
  bot.sendMessage(msg.chat.id, text, keyboard);
});

bot.onText(/\/kma/, function(msg, match) {

});

bot.on('callback_query', function (msg) {
	if(msg.data == 'callback_schedule'){
		bot.sendMessage(msg.from.id, '일정 등록을 원하시면 예시와 같은 양식으로 써주세요.(ex: 12월 25일 일정등록, 내일 오후 1시 일정등록)');
	}else if(msg.data == 'callback_whether'){
		bot.answerCallbackQuery(msg.id, '날씨 정보를 불러옵니다.' , false);
		var message = {
			text: '날씨 정보를 불러옵니다.'
		};


		payload['userMessages/'+ messageKey] = message;

		ref.update(payload);
		// 기상 RSS http://www.weather.go.kr/weather/lifenindustry/sevice_rss.jsp
		    var RSS = "http://www.kma.go.kr/wid/queryDFSRSS.jsp?zone=1156054000";

		    // 모듈 로드
		    var client = require('cheerio-httpcli');

		    // RSS 다운로드
		    client.fetch(RSS, {}, function(err, $, res) {
		      if (err) { 
			console.log("error: "+err); return; 
		      }

		      //var city = $("location:nth-child(1) > city").text();
		      var city = $("channel:nth-child(1) > title").text();
		      var date = $("channel:nth-child(1) > pubDate").text() + ' 발표, ' + city;
		      bot.sendMessage(msg.from.id, date);
		      var temp = '온도: '+$("data:nth-child(1) > temp").text()+', '+$("data:nth-child(1) > wfKor").text();
		      bot.sendMessage(msg.from.id, temp);
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
	}else if(msg.data == 'callback_battery'){
		bot.answerCallbackQuery(msg.id, '베터리 정보를 불러옵니다.' , false);
		var push_data = {
			// 수신대상
			to: clientToken2,
			// App이 실행중이지 않을 때 상태바 알림으로 등록할 내용
			/*notification: {
			    title: 'Registered schedule by telegram',
			    body: request.body.queryResult.fulfillmentText,
			    sound: "default",
			    click_action: "FCM_PLUGIN_ACTIVITY",
			    icon: "fcm_push_icon"
			},*/
			// 메시지 중요도
			priority: "high",
			// App 패키지 이름
			restricted_package_name: "fcm.lge.com.fcm",
			// App에게 전달할 데이터
			data: {
			    title: 'Battery information is loaded by telegram',
			    body: 'Battery information'
			}
		    };

		    fcm.send(push_data, function(err, response) {
			//console.error('Push메시지 발송 시도.');
			if (err) {
			    console.error('Push메시지 발송에 실패했습니다.');
			    console.error(err);
			    return;
			}

			console.log('Push메시지가 발송되었습니다.');
			console.log(response);
		    });
	}else if(msg.data == 'callback_memory'){
		bot.answerCallbackQuery(msg.id, '메모리 정보를 불러옵니다.' , false);
		var push_data = {
			// 수신대상
			to: clientToken2,
			// App이 실행중이지 않을 때 상태바 알림으로 등록할 내용
			/*notification: {
			    title: 'Registered schedule by telegram',
			    body: request.body.queryResult.fulfillmentText,
			    sound: "default",
			    click_action: "FCM_PLUGIN_ACTIVITY",
			    icon: "fcm_push_icon"
			},*/
			// 메시지 중요도
			priority: "high",
			// App 패키지 이름
			restricted_package_name: "fcm.lge.com.fcm",
			// App에게 전달할 데이터
			data: {
			    title: 'Memory information is loaded by telegram',
			    body: 'Memory information'
			}
		    };

		    fcm.send(push_data, function(err, response) {
			//console.error('Push메시지 발송 시도.');
			if (err) {
			    console.error('Push메시지 발송에 실패했습니다.');
			    console.error(err);
			    return;
			}

			console.log('Push메시지가 발송되었습니다.');
			console.log(response);
		    });
	}
  //bot.answerCallbackQuery(msg.id, 'You hit a button!'+msg.data , false);
});

bot.onText(/.+/, (msg, match) => {
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
       resp = "일정 등록을 제안하였습니다. Notiication을 확인 해주세요.";
        
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
      if(result.fulfillmentText == "") {
        resp = "response를 가져오지 못했습니다.";
      }
      bot.sendMessage(chatId, resp);
    } else {
      console.log(`  No intent matched.`);
    }
  })
  .catch(err => {
    console.error('ERROR about sessionClient :', err);
  });

});



