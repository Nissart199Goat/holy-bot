const { SlashCommandBuilder } = require('discord.js');
const { createEmbed, COLORS } = require('../utils/embeds');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Display available commands'),
        
    async execute(interaction) {
        // Commands organized by category
        const categories = {
            "Information": [
                { name: '`/ping`', value: 'Check bot latency' },
                { name: '`/help`', value: 'Display this help message' },
                { name: '`/about`', value: 'Information about the bot' }
            ],
            "Community": [
                { name: '`/level`', value: 'Check your current level and experience' },
                { name: '`/leaderboard`', value: 'View the community experience leaderboard' },
                { name: '`/ticket create`', value: 'Create a support ticket for pastoral care or questions' },
                { name: '`/ticket close`', value: 'Close your current support ticket' }
            ],
            "Spirituality": [
                { name: '`/bless`', value: 'Receive a Bible verse' },
                { name: '`/pray`', value: 'Submit a prayer request' },
                { name: '`/calendar view`', value: 'View upcoming Christian calendar events and holy days' }
            ],
            "Calendar Options": [
                { name: '`/calendar view all`', value: 'View all upcoming events' },
                { name: '`/calendar view major`', value: 'View only major holy days (Christmas, Easter, etc.)' },
                { name: '`/calendar view liturgical`', value: 'View only liturgical events' },
                { name: '`/calendar view community`', value: 'View only community events' }
            ]
        };

        // Building organized fields for the embed
        const fields = [];
        
        // Add each category as a separate field
        Object.entries(categories).forEach(([category, commands]) => {
            fields.push({ 
                name: `${config.emoji.book} ${category}`,
                value: commands.map(cmd => `${config.visuals.bullet} ${cmd.name}\n${config.visuals.arrow} ${cmd.value}`).join('\n\n')
            });
        });

        // Add field for additional help
        fields.push({ 
            name: `${config.emoji.heart} Need help?`,
            value: `If you need additional help, don't hesitate to contact the server moderators or administrators.`
        });

        const embed = createEmbed({
            title: `Holy Bot Commands`,
            description: `${config.visuals.divider}\n**Welcome to Holy Bot's help menu!**\nHere are all available commands:\n${config.visuals.divider}`,
            fields: fields,
            footer: `Holy Bot • Version ${config.botVersion}`,
            color: COLORS.SECONDARY
        });
        
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
}; 