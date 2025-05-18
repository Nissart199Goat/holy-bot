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
            let verificationChannelId = process.env.VERIFICATION_CHANNEL_ID || '1371552029834481668';
            let newMemberRoleId = process.env.NEW_MEMBER_ROLE_ID || '1371946765800181820';
            
            // Vérifier si les messages d'accueil sont activés
            let welcomeEnabled = true;
            
            // Utiliser la configuration si disponible
            if (serverConfig) {
                if (serverConfig.channels) {
                    if (serverConfig.channels.welcome) welcomeChannelId = serverConfig.channels.welcome;
                    if (serverConfig.channels.rules) rulesChannelId = serverConfig.channels.rules;
                    if (serverConfig.channels.verification) verificationChannelId = serverConfig.channels.verification;
                }
                
                if (serverConfig.roles && serverConfig.roles.unverified) {
                    newMemberRoleId = serverConfig.roles.unverified;
                }
                
                if (serverConfig.settings && serverConfig.settings.welcomeEnabled !== undefined) {
                    welcomeEnabled = serverConfig.settings.welcomeEnabled;
                }
            }
            
            // Si les messages d'accueil sont désactivés, attribuer simplement le rôle et quitter
            if (!welcomeEnabled) {
                // Attribuer le rôle de nouveau membre si nécessaire
                if (newMemberRoleId) {
                    try {
                        const newMemberRole = member.guild.roles.cache.get(newMemberRoleId);
                        if (newMemberRole) {
                            await member.roles.add(newMemberRole);
                            console.log(`Added new member role to ${member.user.tag} (welcome messages disabled)`);
                        }
                    } catch (roleError) {
                        console.error('Error adding new member role:', roleError);
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
                        value: `Please check out our <#${rulesChannelId}> to understand our community guidelines and visit <#${verificationChannelId}> to get properly verified.`
                    },
                    {
                        name: 'Verification',
                        value: `Use the \`/verify\` command to receive the ${config.emoji.cross} role and gain full access to our server.`
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
            
            // Attribuer le rôle de nouveau membre
            if (newMemberRoleId) {
                try {
                    const newMemberRole = member.guild.roles.cache.get(newMemberRoleId);
                    if (newMemberRole) {
                        await member.roles.add(newMemberRole);
                        console.log(`Added new member role to ${member.user.tag}`);
                    } else {
                        console.log(`Role with ID ${newMemberRoleId} not found. Please check if the role exists or use /config to set it.`);
                    }
                } catch (roleError) {
                    console.error('Error adding new member role:', roleError);
                }
            }
        } catch (error) {
            console.error('Error in guildMemberAdd event:', error);
        }
    },
}; 