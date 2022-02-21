const bot = require('../../index');
const bdd = require('../../bdd/bdd.json');

bot.on('messageCreate', (message) => {
    if (message.type !== 'DEFAULT') return;
    const prefix = bdd.prefix;

    const args = message.content.trim().split(/ +/g);
    const commandName = args.shift().toLowerCase();
    if(!commandName.startsWith(prefix)) return;
    const command = bot.commands.get(commandName.slice(prefix.length));
    if(message.channel.type == "dm") return message.channel.send('Tu ne peux pas effectuer cette commande en mp !');
    if(!command) return;
    command.run(bot, message, args);
    message.delete();
});
