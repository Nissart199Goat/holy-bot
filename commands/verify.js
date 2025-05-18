const { SlashCommandBuilder } = require('discord.js');
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
        console.error('Error loading configuration in verify command:', error);
    }
    return null;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verify')
        .setDescription('Verify yourself to access the server'),
        
    async execute(interaction) {
        try {
            // Charger la configuration
            const serverConfig = loadConfiguration();
            
            // Déterminer l'ID des rôles
            let verifiedRoleId = process.env.VERIFIED_ROLE_ID;
            let unverifiedRoleId = process.env.UNVERIFIED_ROLE_ID || '1371946765800181820';
            
            // Utiliser la configuration si disponible
            if (serverConfig && serverConfig.roles) {
                if (serverConfig.roles.verified) {
                    verifiedRoleId = serverConfig.roles.verified;
                }
                if (serverConfig.roles.unverified) {
                    unverifiedRoleId = serverConfig.roles.unverified;
                }
            }
            
            if (!verifiedRoleId) {
                return interaction.reply({ 
                    content: 'Verification role not configured. Please contact an administrator or use /config to set up roles.',
                    ephemeral: true 
                });
            }
            
            // Get the roles
            const verifiedRole = interaction.guild.roles.cache.get(verifiedRoleId);
            const unverifiedRole = unverifiedRoleId ? interaction.guild.roles.cache.get(unverifiedRoleId) : null;
            
            if (!verifiedRole) {
                return interaction.reply({ 
                    content: 'Verification role not found. Please contact an administrator.',
                    ephemeral: true 
                });
            }
            
            // Check if user is already verified
            if (interaction.member.roles.cache.has(verifiedRoleId)) {
                return interaction.reply({ 
                    content: 'You are already verified!', 
                    ephemeral: true 
                });
            }
            
            // Add verified role to the user
            await interaction.member.roles.add(verifiedRole);
            
            // Remove unverified role if applicable
            if (unverifiedRole && interaction.member.roles.cache.has(unverifiedRoleId)) {
                await interaction.member.roles.remove(unverifiedRole);
            }
            
            const embed = createEmbed({
                title: `${config.emoji.cross} Verification Successful`,
                description: `You have been verified and assigned the ${verifiedRole.name} role.\n\nWelcome to the Holy Guild! You now have access to all channels. Please make sure to read our rules and consider wearing the Holy Guild Tag.`,
                footer: 'Thank you for verifying!'
            });
            
            // Optional: Send a message to a log channel when someone verifies
            try {
                let logChannelId = process.env.LOG_CHANNEL_ID;
                
                // Utiliser la configuration si disponible
                if (serverConfig && serverConfig.channels && serverConfig.channels.log) {
                    logChannelId = serverConfig.channels.log;
                }
                
                // Vérifier si la journalisation est activée
                const logVerifications = !serverConfig || 
                    !serverConfig.settings || 
                    serverConfig.settings.logVerifications !== false;
                
                if (logChannelId && logVerifications) {
                    const logChannel = interaction.guild.channels.cache.get(logChannelId);
                    if (logChannel) {
                        const logEmbed = createEmbed({
                            title: 'Member Verified',
                            description: `${interaction.user.tag} has been verified.`,
                            fields: [
                                {
                                    name: 'Member',
                                    value: `${interaction.user} (${interaction.user.id})`
                                },
                                {
                                    name: 'Timestamp',
                                    value: new Date().toLocaleString()
                                }
                            ]
                        });
                        logChannel.send({ embeds: [logEmbed] });
                    }
                }
            } catch (logError) {
                console.error('Error sending verification log:', logError);
            }
            
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error('Error in verify command:', error);
            await interaction.reply({ 
                content: 'An error occurred while verifying. Please try again later or contact an administrator.', 
                ephemeral: true 
            });
        }
    },
}; 