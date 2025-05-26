const { createEmbed } = require('../utils/embeds');
const config = require('../config');
const fs = require('fs');
const path = require('path');

// Chemin vers le fichier de configuration
const configFilePath = path.join(__dirname, '..', 'data', 'serverConfig.json');

// Fonction pour charger la configuration
function loadConfiguration() {
    try {
        if (fs.existsSync(configFilePath)) {
            const data = fs.readFileSync(configFilePath, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading configuration in guildMemberAdd event:', error);
    }
    return null;
}

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        try {
            console.log(`New member joined: ${member.user.tag}`);
            
            // Charger la configuration centralisée
            const serverConfig = loadConfiguration();
            
            // Obtenir les IDs à partir de la configuration
            let welcomeChannelId = process.env.WELCOME_CHANNEL_ID || '1371552029834481668';
            let rulesChannelId = process.env.RULES_CHANNEL_ID || '1371552029834481668';
            
            // Vérifier si les messages d'accueil sont activés
            let welcomeEnabled = true;
            
            // Utiliser la configuration si disponible
            if (serverConfig) {
                if (serverConfig.channels) {
                    if (serverConfig.channels.welcome) welcomeChannelId = serverConfig.channels.welcome;
                    if (serverConfig.channels.rules) rulesChannelId = serverConfig.channels.rules;
                }
                
                if (serverConfig.settings && serverConfig.settings.welcomeEnabled !== undefined) {
                    welcomeEnabled = serverConfig.settings.welcomeEnabled;
                }
            }
            
            // Si les messages d'accueil sont désactivés, attribuer quand même l'autorole
            if (!welcomeEnabled) {
                // Attribuer l'autorole si configuré
                let autoroleId = null;
                if (serverConfig && serverConfig.roles && serverConfig.roles.autorole) {
                    autoroleId = serverConfig.roles.autorole;
                }
                
                if (autoroleId) {
                    try {
                        const autorole = member.guild.roles.cache.get(autoroleId);
                        if (autorole) {
                            await member.roles.add(autorole);
                            console.log(`Added autorole ${autorole.name} to ${member.user.tag} (welcome messages disabled)`);
                        }
                    } catch (roleError) {
                        console.error('Error adding autorole:', roleError);
                    }
                }
                return;
            }
            
            // Create welcome embed
            const welcomeEmbed = createEmbed({
                title: `Welcome to Holy Guild ${config.emoji.holy}`,
                description: `Welcome, ${member} to our community!\n\nWe're a community of faith-focused individuals coming together to support and encourage one another.`,
                fields: [
                    {
                        name: 'Getting Started',
                        value: `Please check out our <#${rulesChannelId}> to understand our community guidelines and start participating in our community!`
                    },
                    {
                        name: 'Guild Tag',
                        value: 'Consider adding the **♱ Holy ♱** tag to your Discord username to show you are part of our community!'
                    },
                    {
                        name: 'Daily Verse',
                        value: `"${config.welcomeQuote}"`
                    }
                ],
                thumbnail: member.user.displayAvatarURL({ dynamic: true }),
                footer: 'We hope you find fellowship and encouragement here'
            });
            
            // Envoyer le message d'accueil
            const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);
            if (welcomeChannel) {
                welcomeChannel.send({ embeds: [welcomeEmbed] });
                
                // Optional: Add a simple text welcome as well
                welcomeChannel.send(`${config.emoji.heart} Welcome to our faith community, ${member}! May your time here be blessed. ${config.emoji.pray}`);
            } else {
                console.log(`Welcome channel with ID ${welcomeChannelId} not found. Please check if the channel exists or use /config to set it.`);
            }
            
            // Attribuer l'autorole si configuré
            let autoroleId = null;
            if (serverConfig && serverConfig.roles && serverConfig.roles.autorole) {
                autoroleId = serverConfig.roles.autorole;
            }
            
            if (autoroleId) {
                try {
                    const autorole = member.guild.roles.cache.get(autoroleId);
                    if (autorole) {
                        await member.roles.add(autorole);
                        console.log(`Added autorole ${autorole.name} to ${member.user.tag}`);
                    } else {
                        console.log(`Autorole with ID ${autoroleId} not found. Please check if the role exists or use /config to set it.`);
                    }
                } catch (roleError) {
                    console.error('Error adding autorole:', roleError);
                }
            }
            

        } catch (error) {
            console.error('Error in guildMemberAdd event:', error);
        }
    },
}; 