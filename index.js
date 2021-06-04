const Discord = require('discord.js'),
    client = new Discord.Client({
        fetchAllMembers: false
    }),
  DisTube = require("distube"),
  distube = new DisTube(client, {
      searchSongs: false,
      emitNewSongOnly: false,
      highWaterMark: 1024*1024*64,
      leaveOnEmpty: true,
      leaveOnFinish: true,
      leaveOnStop: true,
      youtubeDL: true,
      updateYouTubeDL: true
  });
const disbut = require('discord-buttons');
disbut(client);
const { getTracks, getPreview } = require("spotify-url-info");

client.on("ready", async () =>{
const statuses = [
  'Joue de la musique',
  'Abonne-toi à Killer Jumper',
  'Commande by Killer Jumper'
]

// Intervale pour le statut du bot
let i = 0
    setInterval(() => {
        client.user.setActivity(statuses[i], {type : 'WATCHING'})
        i = ++i % statuses.length
    }, 1e4);
    console.log("Bot en ligne !");
    client.user.setStatus("online");
});

client.login("VOTRE_TOKEN");


var list = [];
client.on("message", async message => {
    let msg = message.content.slice(7)
    let args = message.content.trim().split(/ +/g);

    if (message.content.startsWith(prefix + "play")) {
        message.delete();
        const VoiceChannel = message.member.voice.channel;
        if(!VoiceChannel) return message.channel.send("Il n'y a personne dans la vocal !"); //Vérifier si quelqu'un est dans la vocal
        if(!msg) return message.channel.send('Précise une musique !'); // Vérifier si y a un nom de musique.

        //Bouton
        let play = new disbut.MessageButton().setStyle('gray').setID('pause').setLabel('⏸'); // Bouton play
        let rplay = new disbut.MessageButton().setStyle('gray').setID('replay').setLabel('▶'); // Bouton resume
        let stop = new disbut.MessageButton().setStyle('gray').setID('leave').setLabel('⏹'); // Bouton leave
        let suivant = new disbut.MessageButton().setStyle('gray').setID('skip').setLabel('⏭'); //Bouton skip
        let repeat = new disbut.MessageButton().setStyle('gray').setID('loop').setLabel('🔁'); //Bouton loop
        let repeat1 = new disbut.MessageButton().setStyle('gray').setID('loop1').setLabel('🔂'); //Bouton off-loop
        let aleatoire = new disbut.MessageButton().setStyle('gray').setID('shuffle').setLabel('🔀'); //Bouton random
        let queu = new disbut.MessageButton().setStyle('gray').setID('list').setLabel('💿'); // Bouton list music
        //Assemblage de bouton
        let pause = new disbut.MessageActionRow().addComponent(play).addComponent(suivant).addComponent(repeat).addComponent(aleatoire).addComponent(stop);// Musique jouée
        let pauserepeat = new disbut.MessageActionRow().addComponent(play).addComponent(suivant).addComponent(repeat1).addComponent(aleatoire).addComponent(stop);//Musique répété
        let reprendre = new disbut.MessageActionRow().addComponent(rplay).addComponent(suivant).addComponent(repeat).addComponent(aleatoire).addComponent(stop);//Musique pause

        if (list.length < 1) {
            list.push(args[2]);
            let embed = new Discord.MessageEmbed() //Création embed
                .setColor("RED")
                .setTitle('**MUSIQUES**')
                .setDescription(`Je joue de la musique !`)
                .setFooter('Profite de ta musique !!', "https://media.discordapp.net/attachments/732877745683693588/808011310784184330/ezgif-2-e3f0773857a2.gif")
            const send_play = await message.channel.send({embed: embed, components: [pause, queu]}); // Envoie de l'embed et du bouton
            const filter = (button) => button.clicker.user.id == message.author.id; // Les boutons marche que pour l'auteur du message
            const collector = send_play.createButtonCollector(filter); // Création du collector de bouton
            collector.on('collect', b =>{
                b.defer();

                // Fonction des actions
                function paus(){ //Fonction pause
                    if(distube.isPaused(message)) return message.channel.send("ERREUR: La musique est déjà en pause.").then((file) =>{
                        setTimeout(()=> {
                            file.delete();
                        }, 5000);
                    })
                    let embedpause = new Discord.MessageEmbed()
                    .setColor("RED")
                    .setTitle('**MUSIQUES**')
                    .setDescription(`La musique est en pause !`)
                    .setFooter('Profite de ta musique !!', "https://media.discordapp.net/attachments/732877745683693588/808011310784184330/ezgif-2-e3f0773857a2.gif")
                    send_play.edit({embed: embedpause, components: [reprendre, queu]});
                    distube.pause(message);
                }
                function reprendr(){ //Fonction resume
                    if (!distube.isPaused) return message.channel.send("ERREUR: La musique n'est pas en pause.").then((file) =>{
                        setTimeout(()=> {
                            file.delete();
                        }, 5000);
                    })
                    let embedreprendre = new Discord.MessageEmbed()
                        .setColor("RED")
                        .setTitle('**MUSIQUES**')
                        .setDescription(`Je reprend la musique en pause !`)
                        .setFooter('Profite de ta musique !!', "https://media.discordapp.net/attachments/732877745683693588/808011310784184330/ezgif-2-e3f0773857a2.gif")
                    send_play.edit({embed: embedreprendre, components: [pause, queu]});
                    distube.resume(message);
                }
                function leave(){ //Fonction leave
                    const meVoiceChannel = message.guild.me.voice.channel;
                    if(!meVoiceChannel) return message.channel.send("Je ne suis pas dans la vocal !").then((file) =>{
                        setTimeout(()=> {
                            file.delete();
                        }, 5000);
                    });
                    let embedleave = new Discord.MessageEmbed()
                        .setColor("RED")
                        .setTitle('**MUSIQUES**')
                        .setDescription(`J'arrête de jouer de la musique !`)
                        .setFooter('Profite de ta musique !!', "https://media.discordapp.net/attachments/732877745683693588/808011310784184330/ezgif-2-e3f0773857a2.gif")
                    send_play.edit({embed: embedleave});
                    distube.stop(message);
                    list = [];
                }
                function skipped(){ //Fonction skip
                    let queue = distube.getQueue(message);
                    if (!queue.songs[1]) return message.channel.send("ERREUR: Aucune prochaine musique.").then((file) =>{
                        setTimeout(()=> {
                            file.delete();
                        }, 5000);
                    });
                    let embedskip = new Discord.MessageEmbed()
                        .setColor("RED")
                        .setTitle('**MUSIQUES**')
                        .setDescription(`Je passe à la prochaine musique chef !`)
                        .setFooter('Profite de ta musique !!', "https://media.discordapp.net/attachments/732877745683693588/808011310784184330/ezgif-2-e3f0773857a2.gif")
                        send_play.edit({embed: embedskip, components: [pause, queu]});
                    distube.skip(message);
                }
                function loop(){ //Fonction loop
                    let queue = distube.getQueue(message);
                    if (!queue.songs[1]) return message.channel.send("ERREUR: La liste est vide !").then((file) =>{
                        setTimeout(()=> {
                            file.delete();
                        }, 5000);
                    })
                    if(distube.isPaused(message)) return message.channel.send("ERREUR: La musique est en pause !").then((file) =>{
                        setTimeout(()=> {
                            file.delete();
                        }, 5000);
                    })
                    let embedloop = new Discord.MessageEmbed()
                    .setColor("RED")
                    .setTitle('**MUSIQUES**')
                    .setDescription(`Je répète la musique 1 fois !`)
                    .setFooter('Profite de ta musique !!', "https://media.discordapp.net/attachments/732877745683693588/808011310784184330/ezgif-2-e3f0773857a2.gif")
                    send_play.edit({embed: embedloop, components: [pauserepeat, queu]});
                    distube.setRepeatMode(message, parseInt(1));
                }
                function loop1(){ //Fonction off-loop
                    let queue = distube.getQueue(message);
                    if (!queue.songs[1]) return message.channel.send("ERREUR: La liste est vide !").then((file) =>{
                        setTimeout(()=> {
                            file.delete();
                        }, 5000);
                    })
                    if(distube.isPaused(message)) return message.channel.send("ERREUR: La musique est en pause !").then((file) =>{
                        setTimeout(()=> {
                            file.delete();
                        }, 5000);
                    })
                    let embedloop1 = new Discord.MessageEmbed()
                    .setColor("RED")
                    .setTitle('**MUSIQUES**')
                    .setDescription(`Répétition remise à 0 !`)
                    .setFooter('Profite de ta musique !!', "https://media.discordapp.net/attachments/732877745683693588/808011310784184330/ezgif-2-e3f0773857a2.gif")
                    send_play.edit({embed: embedloop1, components: [pause, queu]});
                    distube.setRepeatMode(message, parseInt(0));
                }
                function shuffle(){ //Fonction aléatoire
                    let queue = distube.getQueue(message);
                    if (!queue.songs[5]) return message.channel.send("ERREUR: La liste est pas assez rempli pour le mode aléatoire !").then((file) =>{
                        setTimeout(()=> {
                            file.delete();
                        }, 5000);
                    });
                    if(distube.isPaused(message)) return message.channel.send("ERREUR: La musique est en pause !").then((file) =>{
                        setTimeout(()=> {
                            file.delete();
                        }, 5000);
                    });
                    if(distube.setRepeatMode(message, parseInt(1))) return message.channel.send('Erreur : Mode loop activé !').then((file) =>{
                        setTimeout(()=> {
                            file.delete();
                        }, 5000);
                    });
                    let embedshuffle = new Discord.MessageEmbed()
                    .setColor("RED")
                    .setTitle('**MUSIQUES**')
                    .setDescription(`Mode aléatoire activé !`)
                    .setFooter('Profite de ta musique !!', "https://media.discordapp.net/attachments/732877745683693588/808011310784184330/ezgif-2-e3f0773857a2.gif")
                    send_play.edit({embed: embedshuffle, components: [pause, queu]});
                    distube.shuffle(message);
                }
                function liste(){ //Fonction list music
                    let queue = distube.getQueue(message);
                    if (!queue.songs[1]) return message.channel.send("ERREUR: La liste est vide !").then((file) =>{
                        setTimeout(()=> {
                            file.delete();
                        }, 5000);
                    })
                    let counter = 0; // Initialisation d'un variable counter à 0
                    for(let i = 0; i < queue.songs.length; i+=20){
                      if(counter >= 10) break;
                      let k = queue.songs;
                      let songs = k.slice(i, i + 20);
                      message.author.send(new Discord.MessageEmbed() // Envoyé le message en mp
                      .setColor("RED")
                      .setTitle('**MUSIQUES**')
                      .setFooter('Profite de ta musique !!', "https://media.discordapp.net/attachments/732877745683693588/808011310784184330/ezgif-2-e3f0773857a2.gif")
                      .setDescription(songs.map((song, index) => `**${index + 1 + counter * 20}** [${song.name}](${song.url}) - ${song.formattedDuration}`)))
                      counter++;
                    }
                }
                //Condition lors du click sur les boutons avec comme action les fonctions qui conviennent
                if(b.id == "pause") return paus();
                if(b.id == "replay") return reprendr();
                if(b.id == "leave") return leave();
                if(b.id == "skip") return skipped();
                if(b.id == "loop") return loop();
                if(b.id == "loop1") return loop1();
                if(b.id == "shuffle") return shuffle();
                if(b.id == "list") return liste();
                //Intervale de 3 min pour supprimer faire leave le bot !
                setInterval(() => {
                    if(!queu.songs) return leave();
                }, 180000)
            });
        } else {
            //Ajout de musique à la file d'attente.
            (list.length > 0) 
            list.push(args[2]);
            message.channel.send('Musique ajouté à la file d\'attente.').then((file) =>{
                setTimeout(()=> {
                    file.delete();
                }, 5000);
            })
        };
        // POur les musiques Spotify
        if(args.slice(1).join(" ").toLowerCase().includes("spotify") && args.slice(1).join(" ").toLowerCase().includes("track")){
            getPreview(args.slice(1).join(" ")).then(result => {
                distube.play(message, result.title);
            })
        }
        // pour les playlist Spotify
        else if(args.slice(1).join(" ").toLowerCase().includes("spotify") && args.slice(1).join(" ").toLowerCase().includes("playlist")){
            getTracks(args.slice(1).join(" ")).then(result => {
                for(const song of result)
                distube.play(message, song.name);
            })
        //Lance la musique !
        }else {
            let songName = args.slice(1).join(" ");
            distube.play(message, songName);
        }
    };
});
