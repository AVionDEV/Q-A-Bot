const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config({
    'path': __dirname + "/.env"
});
require('./keep_alive');

const bot = new TelegramBot(process.env.TOKEN, {
    "polling": true
})

bot.onText(/\/start/, async (msg, match) => {
    bot.sendMessage(msg.chat.id, `Привет, *${msg.from.first_name}\\!*👋\n\n_Хочешь написать кому\\-то из ребят\\?\nВыбирай одну из команд и пиши вопрос\nОтвет чекай в @tr\\_donkeys\n\nP\\.S\\. Это анонимно, не бойся \\([код](https://github.com/AVionDEV/Q-A-Bot)\\)_`, {
        'parse_mode': "MarkdownV2",
        "disable_web_page_preview": true
    })
});

function sendTo(msg, text, to) {
    let spec = ['_', '*', '[', ']', '(', ')', '~', '`', '>',
        '#', '+', '-', '=', '|', '{', '}', '.', '!'
    ];

    const arr = text.split('');
    for (let i = 0; i < arr.length; i++) {
        if (spec.includes(arr[i])) {
            arr[i] = `\\${arr[i]}`;
        }
    }

    bot.getChat(process.env[to]).then(chat => {
        bot.sendMessage(chat.id, `*Йо, у тебя новый вопрос:*\n\n_${arr.toString().replace(new RegExp(',', 'g'), '')}_`, {
            'parse_mode': "MarkdownV2"
        });
        bot.sendMessage(msg.chat.id, "Ваш вопрос успешно отправлен!");
    }).catch(err => {
        bot.sendMessage(msg.chat.id, "К сожалению не удалось отправить ваш вопрос, попробуйте отправить его кому-то другому из трёх ослов.");
    });
}

bot.onText(/\/sasha/, async (msg, match) => {
    if (msg.from.is_bot) return;

    if (msg.text == undefined || msg.text.substring(6).trim().length == 0) return bot.sendMessage(msg.chat.id, "Извините, но отправлять можно только вопросы!");

    sendTo(msg, msg.text.substring(6).trim(), "SASHA_ID");
});

bot.onText(/\/lev/, async (msg, match) => {
    if (msg.from.is_bot) return;

    if (msg.text == undefined || msg.text.substring(4).trim().length == 0) return bot.sendMessage(msg.chat.id, "Извините, но отправлять можно только вопросы!");

    sendTo(msg, msg.text.substring(4).trim(), "LEV_ID");
});

bot.onText(/\/dima/, async (msg, match) => {
    if (msg.from.is_bot) return;

    if (msg.text == undefined || msg.text.substring(5).trim().length == 0) return bot.sendMessage(msg.chat.id, "Извините, но отправлять можно только вопросы!");

    sendTo(msg, msg.text.substring(5).trim(), "OWNER_ID");
});