const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createEmbed, COLORS } = require('../utils/embeds');
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
        console.error('Error loading configuration:', error);
    }
    return null;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-verify')
        .setDescription('Creates a verification instructions embed for the verification channel (Admin only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('The channel to send the verification instructions to')
                .setRequired(false)),
        
    async execute(interaction) {
        try {
            // Get the verification channel from option or config
            let channel = interaction.options.getChannel('channel');
            
            // If no channel specified, try to get from config
            if (!channel) {
                const serverConfig = loadConfiguration();
                if (serverConfig && serverConfig.channels && serverConfig.channels.verification) {
                    const verificationChannelId = serverConfig.channels.verification;
                    channel = interaction.client.channels.cache.get(verificationChannelId);
                }
            }
            
            // If still no channel, use the current channel
            if (!channel) {
                channel = interaction.channel;
            }
            
            // Get role information from config
            let verifiedRoleName = "Verified";
            const serverConfig = loadConfiguration();
            if (serverConfig && serverConfig.roles && serverConfig.roles.verified) {
                const verifiedRoleId = serverConfig.roles.verified;
                const verifiedRole = interaction.guild.roles.cache.get(verifiedRoleId);
                if (verifiedRole) {
                    verifiedRoleName = verifiedRole.name;
                }
            }
            
            // Create the verification instructions embed
            const verifyEmbed = createEmbed({
                title: `${config.emoji.cross} Verification Required ${config.emoji.cross}`,
                description: `Welcome to the Holy Guild! To gain access to all channels and participate in our community, you need to verify yourself first.\n\nClick the button below to verify yourself and gain access to all channels.`,
                thumbnail: interaction.guild.iconURL({ dynamic: true }),
                fields: [
                    {
                        name: 'What You\'ll Get',
                        value: `After verification, you'll receive the ${verifiedRoleName} role and access to all community channels.`
                    },
                    {
                        name: 'Why Verify?',
                        value: 'Verification helps us keep our community safe and free from bots and spam accounts.'
                    },
                    {
                        name: 'Need Help?',
                        value: 'If you\'re having trouble with verification, please contact a staff member for assistance.'
                    }
                ],
                footer: 'Thank you for joining our community!',
                color: COLORS.ACCENT
            });

            // Create the verification button
            const button = new ButtonBuilder()
                .setCustomId('verify_button')
                .setLabel('Verify')
                .setStyle(ButtonStyle.Success)
                .setEmoji('✅');

            const row = new ActionRowBuilder()
                .addComponents(button);
            
            // Send the embed with the button to the channel
            await channel.send({ 
                embeds: [verifyEmbed],
                components: [row]
            });
            
            // Respond to the interaction
            await interaction.reply({ 
                content: `Verification instructions have been posted in ${channel}.`,
                ephemeral: true 
            });
        } catch (error) {
            console.error('Error in setup-verify command:', error);
            await interaction.reply({ 
                content: 'An error occurred while creating the verification instructions. Please try again later.',
                ephemeral: true 
            });
        }
    },
}; 