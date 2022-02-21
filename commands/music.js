const {MessageEmbed, MessageButton, MessageActionRow} = require('discord.js'),
i = require('../index');
const { getTracks, getPreview } = require("spotify-url-info");
var list = [];

module.exports = {
    name: "play",
    description: "Système de musique complet !",
    /**
//      * 
//      * @param {Client} bot 
//      * @param {Message} message 
//      * @param {String[]} args 
//      */
    run: async (bot, message, args) => {
        const argsradio = args.slice(0).join("").toLowerCase();
        const VoiceChannel = message.member.voice.channel;
        const meVoiceChannel = message.guild.me.voice.channel;

        if(!VoiceChannel) return message.channel.send("Il n'y a personne dans la vocal !");
        if(!argsradio) return message.channel.send('Précise une musique !');

        //Bouton
        let play = new MessageButton().setStyle('SECONDARY').setCustomId('pause').setLabel('⏸');
        let rplay = new MessageButton().setStyle('SECONDARY').setCustomId('replay').setLabel('▶');
        let stop = new MessageButton().setStyle('SECONDARY').setCustomId('leave').setLabel('⏹');
        let suivant = new MessageButton().setStyle('SECONDARY').setCustomId('skip').setLabel('⏭');
        let repeat = new MessageButton().setStyle('SECONDARY').setCustomId('loop').setLabel('🔁');
        let repeat1 = new MessageButton().setStyle('SECONDARY').setCustomId('loop1').setLabel('🔂');
        let aleatoire = new MessageButton().setStyle('SECONDARY').setCustomId('shuffle').setLabel('🔀');
        let queu = new MessageButton().setStyle('SECONDARY').setCustomId('list').setLabel('💿');
        let lister = new MessageActionRow().addComponents(queu);
        let pause = new MessageActionRow()
        .addComponents([play, suivant, repeat, aleatoire, stop]);
        let pauserepeat = new MessageActionRow()
        .addComponents([play, suivant, repeat1, aleatoire, stop]);
        let reprendre = new MessageActionRow()
        .addComponents([rplay, suivant, repeat1, aleatoire, stop]);

        if(list.length > 0){
                list.push(argsradio);
                spotifymusic();

                let songName = args.slice(0).join(" ");
                i.distube.play(message, songName);
                message.channel.send('Musique ajouté à la file d\'attente.').then((file) =>{
                    setTimeout(()=> {
                        file.delete();
                    }, 5000);
                })
        }
        if (list.length < 1) {
                if(meVoiceChannel) return message.channel.send(`Je suis déjà dans la voc <#${meVoiceChannel.id}> !`);
                list.push(argsradio);
                let embed = new MessageEmbed()
                    .setColor("RED")
                    .setTitle('**MUSIQUES**')
                    .setDescription(`Je joue de la musique !`)
                    .setFooter('Profite de ta musique !!', "https://media.discordapp.net/attachments/732877745683693588/808011310784184330/ezgif-2-e3f0773857a2.gif")

                spotifymusic();
                let songName = args.slice(0).join(" ");
                i.distube.play(message, songName);
                    const send_play = await message.channel.send({embeds: [embed], components: [pause, lister]});
                    const collector = send_play.createMessageComponentCollector(send_play);
                    collector.on('collect', b =>{
                        b.deferUpdate();

                        function paus(){
                            if(b.user.id != message.author.id) return;
                            let queue = i.distube.getQueue(message);
                            if (!queue.songs[0]) return message.channel.send("ERREUR: Aucune prochaine musique.").then((file) =>{
                                setTimeout(()=> {
                                    file.delete();
                                }, 5000);
                            });

                            let embedpause = new MessageEmbed()
                            .setColor("RED")
                            .setTitle('**MUSIQUES**')
                            .setDescription(`La musique est en pause !`)
                            .setFooter('Profite de ta musique !!', "https://media.discordapp.net/attachments/732877745683693588/808011310784184330/ezgif-2-e3f0773857a2.gif")
                            send_play.edit({embeds: [embedpause], components: [reprendre, lister]});
                            i.distube.pause(message);
                        }
                        function reprendr(){
                            if(b.user.id != message.author.id) return;
                            let queue = i.distube.getQueue(message);
                            if (!queue.songs[0]) return message.channel.send("ERREUR: Aucune prochaine musique.").then((file) =>{
                                setTimeout(()=> {
                                    file.delete();
                                }, 5000);
                            });

                            let embedreprendre = new MessageEmbed()
                                .setColor("RED")
                                .setTitle('**MUSIQUES**')
                                .setDescription(`Je reprend la musique en pause !`)
                                .setFooter('Profite de ta musique !!', "https://media.discordapp.net/attachments/732877745683693588/808011310784184330/ezgif-2-e3f0773857a2.gif")
                            send_play.edit({embeds: [embedreprendre], components: [pause, lister]});
                            i.distube.resume(message);
                        }
                        function leave(){
                            if(b.user.id != message.author.id) return;
                            if(meVoiceChannel == VoiceChannel) return;
                            let queue = i.distube.getQueue(message);
                            
                            let embedleave = new MessageEmbed()
                                .setColor("RED")
                                .setTitle('**MUSIQUES**')
                                .setDescription(`J'arrête de jouer de la musique !`)
                                .setFooter('Profite de ta musique !!', "https://media.discordapp.net/attachments/732877745683693588/808011310784184330/ezgif-2-e3f0773857a2.gif")
                            
                            if (!queue.songs[0]) return send_play.edit({embeds: [embedleave], components: []});
                            
                            send_play.edit({embeds: [embedleave], components: []});
                            i.distube.stop(message);
                            list = [];
                        }
                        function skipped(){
                            if(b.user.id != message.author.id) return;
                            let queue = i.distube.getQueue(message);
                            if (!queue.songs[1]) return message.channel.send("ERREUR: Aucune prochaine musique.").then((file) =>{
                                setTimeout(()=> {
                                    file.delete();
                                }, 5000);
                            });
                            let embedskip = new MessageEmbed()
                                .setColor("RED")
                                .setTitle('**MUSIQUES**')
                                .setDescription(`Je passe à la prochaine musique chef !`)
                                .setFooter('Profite de ta musique !!', "https://media.discordapp.net/attachments/732877745683693588/808011310784184330/ezgif-2-e3f0773857a2.gif")
                                send_play.edit({embeds: [embedskip], components: [pause, lister]});
                                i.distube.skip(message);
                        }
                        function loop(){
                            if(b.user.id != message.author.id) return;
                            let queue = i.distube.getQueue(message);
                            if (!queue.songs[0]) return message.channel.send("ERREUR: La liste est vide !").then((file) =>{
                                setTimeout(()=> {
                                    file.delete();
                                }, 5000);
                            })
                           
                            let embedloop = new MessageEmbed()
                            .setColor("RED")
                            .setTitle('**MUSIQUES**')
                            .setDescription(`Je joue la musique en boucle !`)
                            .setFooter('Profite de ta musique !!', "https://media.discordapp.net/attachments/732877745683693588/808011310784184330/ezgif-2-e3f0773857a2.gif")
                            send_play.edit({embeds: [embedloop], components: [pauserepeat, lister]});
                            i.distube.setRepeatMode(message, parseInt(1));
                        }
                        function loop1(){
                            if(b.user.id != message.author.id) return;
                            let queue = i.distube.getQueue(message);
                            if (!queue.songs[0]) return message.channel.send("ERREUR: La liste est vide !").then((file) =>{
                                setTimeout(()=> {
                                    file.delete();
                                }, 5000);
                            })
        
                            let embedloop1 = new MessageEmbed()
                            .setColor("RED")
                            .setTitle('**MUSIQUES**')
                            .setDescription(`J'arrête de jouer la musique en boucle !`)
                            .setFooter('Profite de ta musique !!', "https://media.discordapp.net/attachments/732877745683693588/808011310784184330/ezgif-2-e3f0773857a2.gif")
                            send_play.edit({embeds: [embedloop1], components: [pause, lister]});
                            i.distube.setRepeatMode(message, parseInt(0));
                        }
                        function shuffle(){
                            if(b.user.id != message.author.id) return;
                            let queue = i.distube.getQueue(message);
                            if (!queue.songs[5]) return message.channel.send("ERREUR: La liste est pas assez rempli pour le mode aléatoire !").then((file) =>{
                                setTimeout(()=> {
                                    file.delete();
                                }, 5000);
                            });
            
                            let embedshuffle = new MessageEmbed()
                            .setColor("RED")
                            .setTitle('**MUSIQUES**')
                            .setDescription(`Mode aléatoire activé !`)
                            .setFooter('Profite de ta musique !!', "https://media.discordapp.net/attachments/732877745683693588/808011310784184330/ezgif-2-e3f0773857a2.gif")
                            send_play.edit({embeds: [embedshuffle], components: [pause, lister]});
                            i.distube.shuffle(message);
                        }
                        function liste(){
                            let queue = i.distube.getQueue(message);
                            if (!queue.songs[0]) return message.channel.send("ERREUR: La liste est vide !").then((file) =>{
                                setTimeout(()=> {
                                    file.delete();
                                }, 5000);
                            })

                            let embedsc = queue.songs.map((song, index) => {
                                return `${index+1} [${song.name}](${song.url}) - \`${song.formattedDuration}\``
                            });

                            b.user.send({ embeds: [
                                new MessageEmbed()
                                .setColor("RED")
                                .setTitle('**MUSIQUES**')
                                .setFooter('Profite de ta musique !!', "https://media.discordapp.net/attachments/732877745683693588/808011310784184330/ezgif-2-e3f0773857a2.gif")
                                .setDescription(`${embedsc.join("\n")}`.substring(0, 3000))
                            ]})
                        }
                        if(b.customId == "pause") return paus();
                        if(b.customId == "replay") return reprendr();
                        if(b.customId == "leave") return leave();
                        if(b.customId == "skip") return skipped();
                        if(b.customId == "loop") return loop();
                        if(b.customId == "loop1") return loop1();
                        if(b.customId == "shuffle") return shuffle();
                        if(b.customId == "list") return liste();
                    });
        }
        function spotifymusic(){
            if(argsradio.includes("spotify") && argsradio.includes("track")){
                getPreview(args.slice(0).join(" ")).then(result => {
                    i.distube.play(message, result.title);
                })
            }
            if(argsradio.includes("spotify") && argsradio.includes("playlist")){
                getTracks(args.slice(0).join(" ")).then(result => {
                    for(const song of result)
                    i.distube.play(message, song.name);
                })
            }
        }
    }
}
