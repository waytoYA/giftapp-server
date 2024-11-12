import { Bot, GrammyError, HttpError, InputFile, InlineKeyboard, InlineQueryResultBuilder } from "grammy";
import Account from "./apps/Account";

export const bot = new Bot("7914185198:AAEhdRoFe1DMWLkzV-ukWcrF_UxHB7W0dIw");

export const bot_start = () => {
    console.log('BOT start')
    
    bot.catch((err) => { 
        const ctx = err.ctx;
        console.error(`Error while handling update ${ctx.update.update_id}:`);
        const e = err.error;

        if (e instanceof GrammyError) {
            console.error('Error in request:', e.description);
        } else if (e instanceof HttpError) {
            console.error('Could not contact Telegram:', e);
        } else {
            console.error('Unknown error:', e);
        }
    });

    bot.api.setMyCommands([
        { command: "start", description: "Launch the bot" },
    ]);

    bot.command("start", async (ctx) => {
        const chatId = ctx.chat.id

        await bot.api.sendPhoto(
            chatId,
            new InputFile(`${__dirname}/static/stock.jpg`),
            {
                caption: '🎁 Here you can buy and send gifts to your friends.',
                reply_markup: {
                    inline_keyboard: [
                        [{text: "Open App", web_app: {url: 'https://pricetable.ru'}}]
                    ]
                }
            }
        )
    });

    // inline-inline-inline
    // inline-inline-inline
    // inline-inline-inline

    bot.inlineQuery(/=(.*)/, async (ctx) => {
        
        const userId = ctx.update.inline_query.from.id;
        const query = ctx.match[1];

        const { allPurchases, giftName, link } = await Account.getGifts(userId, query)

        // I didn't have time...
        // if (allPurchases) {}

        if (giftName && link) {
            const keyboard = new InlineKeyboard().url('Receive Gift', link);
            
            let thumbnailUrl = ''
            if (process.env.ENV == 'DEV') {
                thumbnailUrl = 'https://img4.teletype.in/files/35/77/35776ec0-8a74-4e65-b4a2-9e379711e69d.png'
            } else {
                thumbnailUrl = process.env.SERVER_URL + '/stop.jpg'
            }

            const result = [
                InlineQueryResultBuilder
                .article('sendGift', 'Send Gift', {
                    reply_markup: keyboard,
                    description: `Send a gift of ${giftName}.`,
                    thumbnail_url: thumbnailUrl,
                    thumbnail_height: 55,
                    thumbnail_width: 55,
                })
                .text("🎁 I have a <b>gift</b> for you! Tap the button below to open it.", { parse_mode: "HTML" })
            ]

            await ctx.answerInlineQuery(
                result, 
                { cache_time: 1 },
            );
        } else {
            await ctx.answerInlineQuery([])
        }

        // InlineQueryResultBuilder.photo("id-1", "https://grammy.dev/images/grammY.png").text("Этот текст будет отправлен вместо фото");
        // const keyboard = new InlineKeyboard().text("О, да", "перезвони мне, крошка");
        // InlineQueryResultBuilder.article("id-3", "Нажми на меня", { reply_markup: keyboard }).text("Нажимай на мои кнопки"); 
        // InlineQueryResultBuilder.article("id-4", "Инлайн запросы").text("**Выдающаяся** документация: grammy.dev", { parse_mode: "MarkdownV2" });
        
        // const result = [
        //     InlineQueryResultBuilder.article('id0', 'Титульник 1').text('Текст номер №1'),
        //     InlineQueryResultBuilder.article('id2', 'Титульник 2').text('Текст номер №2'),
        //     InlineQueryResultBuilder.article('id3', 'Титульник 3').text('Текст номер №3'),
        //     InlineQueryResultBuilder.photo('id4', 'https://avatars.mds.yandex.net/get-direct-picture/117537/EBblDf0oi8_73IcUqvk8Zw/optimize', {
        //         thumbnail_url: 'https://avatars.mds.yandex.net/get-direct-picture/117537/EBblDf0oi8_73IcUqvk8Zw/optimize',
        //         title: 'Титульник изображения',
        //         // photo_width: 40,
        //         // photo_height: 40,
        //     })
        // ]
    });

    bot.on("inline_query", (ctx) => ctx.answerInlineQuery([]));

    // inline-inline-inline-end-end-end
    // inline-inline-inline-end-end-end
    // inline-inline-inline-end-end-end

    bot.start();
}

// export default bot_start;