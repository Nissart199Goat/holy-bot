const { SlashCommandBuilder, version } = require('discord.js');
const { createEmbed } = require('../utils/embeds');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('about')
        .setDescription('Information about the bot'),
        
    async execute(interaction) {
        const embed = createEmbed({
            title: `About ${config.botName} Bot`,
            description: `${config.botName} is a dedicated Discord bot designed to serve the Holy Guild community.`,
            fields: [
                { 
                    name: 'Mission', 
                    value: 'To promote fellowship and community among Holy Guild members through scriptural verses, prayer support, and community features.' 
                },
                { 
                    name: 'Version', 
                    value: config.botVersion 
                },
                { 
                    name: 'Discord.js Version', 
                    value: `v${version}` 
                }
            ],
            footer: `Created with ${config.emoji.holy} for Holy Guild`
        });
        
        await interaction.reply({ embeds: [embed] });
    },
}; 