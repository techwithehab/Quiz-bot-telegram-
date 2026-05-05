const { Telegraf } = require('telegraf');

const bot = new Telegraf('8741768556:AAGdOf3qNr-e-e08eYuj2fr5wFYZcJhryXM'); 

// 🔴 تنبيه: حط الـ ID بتاعك هنا بدل الرقم ده عشان البوت يشتغل معاك
const ALLOWED_USER_IDS = [123456789]; 

bot.use((ctx, next) => {
    if (ctx.from && ALLOWED_USER_IDS.includes(ctx.from.id)) {
        return next();
    } else {
        return ctx.reply('عفواً، غير مصرح لك باستخدام هذا البوت 🔒');
    }
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

bot.on('text', async (ctx) => {
    const questionBlocks = ctx.message.text.split(/\n\s*\n/);

    for (const block of questionBlocks) {
        const lines = block.split('\n').filter(line => line.trim() !== '');

        if (lines.length < 3) {
            await ctx.reply(`⚠️ تم تخطي هذا الجزء لعدم اكتمال الخيارات:\n"${lines[0] || 'نص فارغ'}"`);
            continue; 
        }

        const question = lines[0];
        const options = [];
        let correctOptionId = -1;

        for (let i = 1; i < lines.length; i++) {
            let optionText = lines[i].trim();
            
            if (optionText.startsWith('*')) {
                correctOptionId = i - 1; 
                optionText = optionText.substring(1).trim(); 
            }
            options.push(optionText);
        }

        if (correctOptionId === -1) {
            await ctx.reply(`⚠️ الرجاء تحديد إجابة صحيحة بـ (*) للسؤال:\n"${question}"`);
            continue; 
        }

        if (options.length > 10) {
             await ctx.reply(`⚠️ خيارات كثيرة جداً (أكثر من 10) للسؤال:\n"${question}"`);
             continue;
        }

        try {
            await ctx.replyWithPoll(question, options, {
                type: 'quiz',
                correct_option_id: correctOptionId,
                is_anonymous: false
            });
            
            await sleep(500); 

        } catch (error) {
            console.error(error);
            await ctx.reply(`❌ حصل خطأ أثناء إنشاء هذا السؤال:\n"${question}"`);
        }
    }
});

bot.launch();
console.log('البوت يعمل الآن ومستعد لاستقبال مجموعة أسئلة...');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
