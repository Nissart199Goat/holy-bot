const { Events } = require('discord.js');
const { createEmbed, COLORS } = require('../utils/embeds');
const config = require('../config');
const verses = require('../data/verses');
const database = require('../database');

// Fonction pour obtenir un verset non utilisé
async function getUnusedVerse(guildId) {
    try {
        const usedVersesToday = await database.getUsedVersesToday(guildId);
        const unusedVerses = verses.filter((verse, index) => !usedVersesToday.includes(index));
        
        // Si tous les versets ont été utilisés aujourd'hui, prendre un verset aléatoire
        if (unusedVerses.length === 0) {
            const randomIndex = Math.floor(Math.random() * verses.length);
            return { verse: verses[randomIndex], index: randomIndex };
        }
        
        // Sélectionner un verset aléatoire parmi les non utilisés
        const randomVerse = unusedVerses[Math.floor(Math.random() * unusedVerses.length)];
        const verseIndex = verses.findIndex(v => v.verse === randomVerse.verse);
        
        // Marquer le verset comme utilisé
        await database.markVerseAsUsed(verseIndex, guildId);
        
        return { verse: randomVerse, index: verseIndex };
    } catch (error) {
        console.error('Error getting unused verse:', error);
        // Fallback: retourner un verset aléatoire
        const randomIndex = Math.floor(Math.random() * verses.length);
        return { verse: verses[randomIndex], index: randomIndex };
    }
}

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        // Fonction pour envoyer la bénédiction quotidienne
        async function sendDailyBlessing() {
            try {
                // Parcourir tous les serveurs pour envoyer les bénédictions
                for (const guild of client.guilds.cache.values()) {
                    const serverConfig = await database.getServerConfig(guild.id);
                    
                    if (!serverConfig || !serverConfig.blessing_channel_id) {
                        continue; // Passer au serveur suivant si pas de canal configuré
                    }

                    const channel = client.channels.cache.get(serverConfig.blessing_channel_id);
                    if (!channel) {
                        console.error(`Blessings channel not found for guild ${guild.name}`);
                        continue;
                    }

                    // Obtenir un verset non utilisé pour ce serveur
                    const { verse } = await getUnusedVerse(guild.id);

                    // Créer l'embed
                    const embed = createEmbed({
                        title: 'Daily Blessing',
                        description: `${config.visuals.divider}\n\n*"${verse.text}"*\n\n${config.visuals.divider}`,
                        fields: [
                            { 
                                name: 'Reference', 
                                value: `${config.emoji.book} **${verse.verse}**` 
                            }
                        ],
                        footer: 'May this verse bring you peace and inspiration',
                        color: COLORS.SECONDARY,
                        image: 'https://i.imgur.com/7FXzh2f.png'
                    });

                    await channel.send({ embeds: [embed] });
                }
            } catch (error) {
                console.error('Error sending daily blessing:', error);
            }
        }

        // Fonction pour planifier la prochaine bénédiction
        function scheduleNextBlessing() {
            const now = new Date();
            const targetTime = new Date(now);
            targetTime.setHours(15, 0, 0, 0); // 15:00 heure française

            // Si l'heure cible est déjà passée aujourd'hui, programmer pour demain
            if (now > targetTime) {
                targetTime.setDate(targetTime.getDate() + 1);
            }

            const timeUntilNext = targetTime - now;
            setTimeout(() => {
                sendDailyBlessing();
                scheduleNextBlessing(); // Programmer la prochaine bénédiction
            }, timeUntilNext);
        }

        // Démarrer la planification
        scheduleNextBlessing();
    }
}; 