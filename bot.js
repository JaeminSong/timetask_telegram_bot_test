const TelegramBot = require('node-telegram-bot-api');
var FCM = require('fcm-node');

const getServerKey = const getToken = (function(){
    const token = process.env.SERVER_KEY;
    return function() {
        return token;
    };
})();

const getClientToken = const getToken = (function(){
    const token = process.env.CLIENT_TOKEN;
    return function() {
        return token;
    };
})();
var fcm = new FCM(servegetServerKey());

var push_data = {
    // 수신대상
    var client_token = getClientToken();
    to: client_token,
    // App이 실행중이지 않을 때 상태바 알림으로 등록할 내용
    notification: {
        title: "Hello Node",
        body: "Node로 발송하는 Push 메시지 입니다.",
        sound: "default",
        click_action: "FCM_PLUGIN_ACTIVITY",
        icon: "fcm_push_icon"
    },
    // 메시지 중요도
    priority: "high",
    // App 패키지 이름
    restricted_package_name: "fcm.lge.com.fcm",
    // App에게 전달할 데이터
    data: {
        num1: 2000,
        num2: 3000
    }
};

const getToken = (function(){
    const token = process.env.TELEGRAM_TOKEN;
    return function() {
        return token;
    };
})();

const bot = new TelegramBot(getToken(), {polling: true});

bot.onText(/\/echo (.+)/, (msg, match) => {

    const chatId = msg.chat.id;
    const resp = match[1];

    bot.sendMessage(chatId, resp);
});

bot.onText(/schedule (.+)/, (msg, match) => {

    const chatId = msg.chat.id;
    const resp = "test";

    bot.sendMessage(chatId, resp);
    
    fcm.send(push_data, function(err, response) {
    if (err) {
        console.error('Push메시지 발송에 실패했습니다.');
        console.error(err);
        return;
    }

    console.log('Push메시지가 발송되었습니다.');
    console.log(response);
});
});
