const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../utils/embeds');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('booster')
        .setDescription('Shows how to boost and what perks it gives')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        
    async execute(interaction) {
        const embed = createEmbed({
            title: '✨ Server Boosting',
            description: 'Boosting the Holy Guild server helps us grow and provides you with special perks!',
            fields: [
                { 
                    name: 'How to Boost',
                    value: 'Click on the server name → "Server Boost" → Choose your boost plan or use an existing Nitro boost.'
                },
                { 
                    name: 'Booster Perks',
                    value: [
                        '• Special Booster role with unique color',
                        '• Access to exclusive booster channels',
                        '• Priority in community events',
                        '• Special recognition in server announcements',
                        '• Our eternal gratitude '
                    ].join('\n')
                },
                {
                    name: 'Why Boost?', 
                    value: 'Your boost helps us unlock more server features, emojis, and better audio quality, making our community stronger!'
                }
            ],
            footer: 'Thank you for supporting our community!'
        });
        
        await interaction.reply({ embeds: [embed] });
    },
}; 