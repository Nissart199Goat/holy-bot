const { Events } = require('discord.js');
const { createEmbed, COLORS } = require('../utils/embeds');
const config = require('../config');
const verses = require('../data/verses');
const fs = require('fs');
const path = require('path');

// Chemin vers le fichier des versets utilisés
const usedVersesPath = path.join(__dirname, '..', 'data', 'usedVerses.json');

// Fonction pour charger les versets utilisés
function loadUsedVerses() {
    try {
        if (fs.existsSync(usedVersesPath)) {
            const data = fs.readFileSync(usedVersesPath, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading used verses:', error);
    }
    return { usedVerses: [], lastReset: null };
}

// Fonction pour sauvegarder les versets utilisés
function saveUsedVerses(data) {
    try {
        fs.writeFileSync(usedVersesPath, JSON.stringify(data, null, 4));
    } catch (error) {
        console.error('Error saving used verses:', error);
    }
}

// Fonction pour obtenir un verset non utilisé
function getUnusedVerse() {
    const data = loadUsedVerses();
    const unusedVerses = verses.filter(verse => !data.usedVerses.includes(verse.verse));
    
    // Si tous les versets ont été utilisés, réinitialiser
    if (unusedVerses.length === 0) {
        data.usedVerses = [];
        saveUsedVerses(data);
        return verses[Math.floor(Math.random() * verses.length)];
    }
    
    // Sélectionner un verset aléatoire parmi les non utilisés
    const randomVerse = unusedVerses[Math.floor(Math.random() * unusedVerses.length)];
    
    // Ajouter le verset à la liste des utilisés
    data.usedVerses.push(randomVerse.verse);
    saveUsedVerses(data);
    
    return randomVerse;
}

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        // Fonction pour envoyer la bénédiction quotidienne
        async function sendDailyBlessing() {
            try {
                // Charger la configuration du serveur
                const serverConfig = require('../data/serverConfig.json');
                if (!serverConfig || !serverConfig.channels || !serverConfig.channels.blessings) {
                    console.error('Blessings channel not configured');
                    return;
                }

                const channel = client.channels.cache.get(serverConfig.channels.blessings);
                if (!channel) {
                    console.error('Blessings channel not found');
                    return;
                }

                // Obtenir un verset non utilisé
                const verse = getUnusedVerse();

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