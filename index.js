const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config({
    'path': __dirname + "/.env"
});

const states = {};

const bot = new TelegramBot(process.env.TOKEN, {
    "polling": true
});

bot.onText(/\/start/, async (msg, match) => {

    bot.sendMessage(msg.chat.id, `Привет, *${msg.from.first_name}\\!*👋\n\n_Что тебя интересует?_`, {
        'parse_mode': "MarkdownV2",
        'disable_web_page_preview': true,
        'reply_markup': {
            'inline_keyboard': [
                [{
                    'text': "Хочу задать вопрос",
                    'callback_data': "question"
                }]
            ]
        }
    });

    states[msg.from.id] = null;
});

bot.on('callback_query', (query) => {
    if (query.data == 'question') {
        bot.editMessageText('_Кому отправляем вопрос? _', {
            'chat_id': query.message.chat.id,
            'message_id': query.message.message_id,
            'parse_mode': 'MarkdownV2',
            'reply_markup': {
                'inline_keyboard': [
                    [{
                        'callback_data': 'OWNER_ID',
                        'text': "Диме"
                    }],
                    [{
                        'callback_data': 'SASHA_ID',
                        'text': 'Саше'
                    }],
                    [{
                        'callback_data': 'LEV_ID',
                        'text': 'Льву'
                    }],
                    [{
                        'callback_data': 'ALL',
                        'text': 'Всем сразу'
                    }]
                ]
            }
        });
    }

    if (query.data == 'cancel') {
        delete states[query.from.id];
        bot.editMessageText('_Оукей\n\n\\- Галя, у нас отмена\\!_', {
            'chat_id': query.message.chat.id,
            'message_id': query.message.message_id,
            'parse_mode': "MarkdownV2",
            'reply_markup': {
                'inline_keyboard': [
                    [{
                        'callback_data': 'question',
                        'text': 'Задать вопрос'
                    }]
                ]
            }
        });
    }

    if (query.data == 'OWNER_ID' || query.data == 'SASHA_ID' || query.data == 'LEV_ID' || query.data == 'ALL') {
        bot.editMessageText('_Пиши вопрос, жди ответ\n\nА также я могу передавать стикеры, фото, видео и войсы_', {
            'chat_id': query.message.chat.id,
            'message_id': query.message.message_id,
            'parse_mode': "MarkdownV2",
            'reply_markup': {
                'inline_keyboard': [
                    [{
                        'callback_data': 'cancel',
                        'text': '🧨 Отменить вопрос'
                    }]
                ]
            }
        });

        states[query.from.id] = query.data;
    }
});

bot.on('message', (msg, meta) => {
    if (msg.photo != undefined) {
        return sendTo(msg, states[msg.from.id], 'photo');
    }
    if (msg.sticker != undefined) {
        return sendTo(msg, states[msg.from.id], 'sticker');
    }
    if (msg.voice != undefined) {
        return sendTo(msg, states[msg.from.id], 'voice');
    }
    if (msg.video != undefined) {
        return sendTo(msg, states[msg.from.id], 'video');
    }
    sendTo(msg, states[msg.from.id], 'message');
});

function sendTo(msg, to, type) {

    if (msg.from.is_bot) return;

    if (type == 'message' && msg.text.startsWith('/start')) return;

    if (states[msg.from.id] == null || states[msg.from.id] == undefined) return bot.sendMessage(msg.chat.id, "_Пожалуйста, сначала выберите кому будете задавать вопрос_", {
        'parse_mode': 'MarkdownV2',
        'reply_markup': {
            'inline_keyboard': [
                [{
                    'callback_data': 'OWNER_ID',
                    'text': "Диме"
                }],
                [{
                    'callback_data': 'SASHA_ID',
                    'text': 'Саше'
                }],
                [{
                    'callback_data': 'LEV_ID',
                    'text': 'Льву'
                }]
            ]
        }
    });

    let spec = ['_', '*', '[', ']', '(', ')', '~', '`', '>',
        '#', '+', '-', '=', '|', '{', '}', '.', '!'
    ];

    const arr = {
        'SASHA_ID': [process.env.SASHA_ID],
        'LEV_ID': [process.env.LEV_ID],
        'OWNER_ID': [process.env.OWNER_ID],
        'ALL': [process.env.SASHA_ID, process.env.OWNER_ID, process.env.LEV_ID]
    }

    let answered = false;

    arr[to].forEach(el => {
        bot.getChat(el).then(chat => {

            delete states[msg.from.id];

            if (type == 'message') {
                const arr = msg.text.split('');
                for (let i = 0; i < arr.length; i++) {
                    if (spec.includes(arr[i])) {
                        arr[i] = `\\${arr[i]}`;
                    }
                }
                bot.sendMessage(chat.id, `*${(to == 'ALL')? "Общий вопрос:":"Wake up, у тебя вопрос:"}*\n\n_${arr.toString().replace(new RegExp(',', 'g'), '')}_`, {
                    'parse_mode': 'MarkdownV2'
                });
            }

            if (type == 'photo') {

                let arr = [];

                if (msg.caption != undefined) {
                    arr = msg.caption.split('') || '';
                    for (let i = 0; i < arr.length; i++) {
                        if (spec.includes(arr[i])) {
                            arr[i] = `\\${arr[i]}`;
                        }
                    }
                }

                bot.sendPhoto(chat.id, msg.photo[1].file_id, {
                    'caption': `*${(to == 'ALL')? "Общая фотка:":"Подъём, тебе фотку кинули:"}*\n\n${arr != ''?'_'+arr.toString().replace(new RegExp(',', 'g'), '')+'_':''}`,
                    'parse_mode': 'MarkdownV2',
                });
            }

            if (type == 'sticker') {
                bot.sendMessage(chat.id, `_${(to == 'ALL')?"Тут всем стикер пришёл:":"Поймал стикер?"}_`, {
                    'parse_mode': 'MarkdownV2'
                });
                bot.sendSticker(chat.id, msg.sticker.file_id);
            }

            if (type == 'voice') {
                bot.sendMessage(chat.id, `_${(to == 'ALL')?"Тут всем гс пришло":"Тебе гс кинули"}_`, {
                    'parse_mode': 'MarkdownV2'
                });
                bot.sendVoice(chat.id, msg.voice.file_id);
            }

            if (type == 'video') {
                bot.sendMessage(chat.id, `_${(to == 'ALL')?"Общий видос, ребят":"Тебе видос кинули"}_`, {
                    'parse_mode': 'MarkdownV2'
                });
                bot.sendVideo(chat.id, msg.video.file_id);
            }

            if (answered) return;

            answered = !answered;

            bot.sendMessage(msg.chat.id, "Спасибо за вопрос, скоро вам ответят\\)", {
                'parse_mode': 'MarkdownV2',
                'reply_markup': {
                    'inline_keyboard': [
                        [{
                            'callback_data': 'question',
                            'text': 'Ещё один вопрос'
                        }]
                    ]
                }
            });
        }).catch(err => {
            console.log(err);

            if (answered) return;

            answered = !answered;

            bot.sendMessage(msg.chat.id, "К сожалению не удалось отправить ваш вопрос, попробуйте позже", {
                'reply_markup': {
                    'inline_keyboard': [
                        [{
                            'text': "Попробовать снова",
                            'callback_data': "question"
                        }]
                    ]
                }
            });
            delete states[msg.from.id];
        });
    });
}