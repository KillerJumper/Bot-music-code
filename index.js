const Discord = require('discord.js'),
    bot = new Discord.Client({
        intents: [
            Discord.Intents.FLAGS.GUILDS,
            Discord.Intents.FLAGS.GUILD_VOICE_STATES
        ]
    }),
    bdd = require('./bdd/bdd.json');

const {DisTube} = require('distube');
bot.distube = new DisTube(bot, {
    emitNewSongOnly: true,
    leaveOnFinish: true,
    emitAddSongWhenCreatingQueue: false,
});

module.exports = bot;

bot.commands = new Discord.Collection();
bot.slashCommands = new Discord.Collection();

require("./handler")(bot);

bot.login(bdd.token);
