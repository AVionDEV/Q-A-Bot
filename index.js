const telegraf = require('telegraf');
require('dotenv').config({
    'path': __dirname + "/.env"
});

const client = new telegraf.Telegraf(process.env.TOKEN);

client.start(ctx => {
    ctx.sendMessage({
        'text': "Привет, напиши мне любой вопрос и ты сможешь увидеть ответ на него в @tr\\_donkeys\n\nP\\.S\\. Это анонимно, не бойся \\([код](https://github.com/AVionDEV/Q-A-Bot)\\)"
    }, {
        'parse_mode': "MarkdownV2",
        'disable_web_page_preview': true
    });
});

const spec = ['_', '*', '[', ']', '(', ')', '~', '`', '>',
    '#', '+', '-', '=', '|', '{', '}', '.', '!'
];

client.on('message', ctx => {
    if (ctx.update.message.from.id == client.botInfo.id) return;

    const arr = ctx.message.text.split('');
    for (let i = 0; i < arr.length; i++) {
        if (spec.includes(arr[i])) {
            arr[i] = `\\${arr[i]}`;
        }
    }

    ctx.telegram.sendMessage(process.env.OWNER_ID, `*New question:*\n\n_${arr.toString().replace(new RegExp(',', 'g'), '')}_`, {
        'parse_mode': "MarkdownV2"
    });
});

client.command('/welc', ctx => {
    ctx.sendMessage('test');
})

client.launch({
        'allowedUpdates': true
    })
    .catch(err => {
        console.log(err);
    });