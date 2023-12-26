const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config({
    'path': __dirname + "/.env"
});
require('./keep_alive');

const states = {};

const bot = new TelegramBot(process.env.TOKEN, {
    "polling": true
});

bot.onText(/\/start/, async (msg, match) => {
    bot.sendMessage(msg.chat.id, `Привет, *${msg.from.first_name}\\!*👋\n\n_Хочешь написать кому\\-то из ребят\\?\nВыбирай одну из команд и пиши вопрос\nОтвет чекай в @tr\\_donkeys\n\nP\\.S\\. Это анонимно, не бойся \\([код](https://github.com/AVionDEV/Q-A-Bot)\\)_`, {
        'parse_mode': "MarkdownV2",
        "disable_web_page_preview": true
    });

    states[msg.from.id] = null;
});

bot.onText(/\/sasha/, async (msg, match) => {
    if (msg.from.is_bot) return;

    states[msg.from.id] = 'SASHA_ID';
});

bot.onText(/\/lev/, async (msg, match) => {
    if (msg.from.is_bot) return;

    states[msg.from.id] = 'LEV_ID';
});

bot.onText(/\/dima/, async (msg, match) => {
    if (msg.from.is_bot) return;

    states[msg.from.id] = 'OWNER_ID';
});

bot.on('message', (msg, meta) => {
    if (msg.from.is_bot) return;

    if (msg.text.startsWith('/start')) return;

    if (msg.text.startsWith('/dima') || msg.text.startsWith('/lev') || msg.text.startsWith('/sasha')) return bot.sendMessage(msg.chat.id, "_Напишите свой вопрос ниже_ ⌨️", {'parse_mode': "MarkdownV2"});

    if (states[msg.from.id] == undefined) return bot.sendMessage(msg.chat.id, "Пожалуйста, сначала вызовите одну из команд:\n/dima /sasha /lev");

    sendTo(msg, states[msg.from.id]);

    delete states[msg.from.id];
});

function sendTo(msg, to) {
    let spec = ['_', '*', '[', ']', '(', ')', '~', '`', '>',
        '#', '+', '-', '=', '|', '{', '}', '.', '!'
    ];

    const arr = msg.text.split('');
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