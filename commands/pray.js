const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../utils/embeds');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pray')
        .setDescription('Submit a prayer request')
        .addStringOption(option => 
            option.setName('request')
                .setDescription('Your prayer request')
                .setRequired(true)),
        
    async execute(interaction) {
        try {
            const request = interaction.options.getString('request');
            
            // Get the prayer channel ID from .env
            const prayerChannelId = process.env.PRAYER_CHANNEL_ID;
            
            if (!prayerChannelId) {
                return interaction.reply({ 
                    content: 'Prayer channel not configured. Please contact an administrator.', 
                    ephemeral: true 
                });
            }
            
            const prayerChannel = interaction.client.channels.cache.get(prayerChannelId);
            
            if (!prayerChannel) {
                return interaction.reply({ 
                    content: 'Prayer channel not found. Please contact an administrator.', 
                    ephemeral: true 
                });
            }
            
            // Create embed for the prayer request
            const prayerEmbed = createEmbed({
                title: `${config.emoji.pray} Prayer Request`,
                description: request,
                fields: [
                    { name: 'Requested By', value: interaction.user.tag }
                ],
                footer: 'Please pray for this request'
            });
            
            // Send the prayer request to the dedicated channel
            await prayerChannel.send({ embeds: [prayerEmbed] });
            
            // Confirm to the user
            const confirmEmbed = createEmbed({
                title: `${config.emoji.pray} Prayer Request Submitted`,
                description: 'Your prayer request has been submitted and will be prayed for by our community.',
                footer: 'Thank you for sharing your request with us'
            });
            
            await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });
        } catch (error) {
            console.error('Error in pray command:', error);
            await interaction.reply({ 
                content: 'An error occurred while submitting your prayer request. Please try again later.', 
                ephemeral: true 
            });
        }
    },
}; 