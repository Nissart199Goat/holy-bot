const { createEmbed } = require('../utils/embeds');
const config = require('../config');
const database = require('../database');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        try {
            console.log(`New member joined: ${member.user.tag}`);
            
            // Charger la configuration depuis MySQL
            const serverConfig = await database.getServerConfig(member.guild.id);
            
            // Obtenir les IDs à partir de la configuration
            let welcomeChannelId = serverConfig?.welcome_channel_id || process.env.WELCOME_CHANNEL_ID || '1371552029834481668';
            
            // Pour l'instant, on garde les messages d'accueil activés par défaut
            let welcomeEnabled = true;
            
            // Si les messages d'accueil sont désactivés, on peut quand même continuer
            if (!welcomeEnabled) {
                return;
            }
            
            // Create welcome embed
            const welcomeEmbed = createEmbed({
                title: `Welcome to Holy Guild ${config.emoji.holy}`,
                description: `Welcome, ${member} to our community!\n\nWe're a community of faith-focused individuals coming together to support and encourage one another.`,
                fields: [
                    {
                        name: 'Getting Started',
                        value: `Welcome to our faith community! Start participating and earning XP by chatting with other members.`
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
            if (serverConfig?.autorole_id) {
                try {
                    const autorole = member.guild.roles.cache.get(serverConfig.autorole_id);
                    if (autorole) {
                        await member.roles.add(autorole);
                        console.log(`Added autorole ${autorole.name} to ${member.user.tag}`);
                    } else {
                        console.log(`Autorole with ID ${serverConfig.autorole_id} not found.`);
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