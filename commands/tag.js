const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../utils/embeds');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tag')
        .setDescription('Encourages wearing the Holy Guild Tag')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        
    async execute(interaction) {
        const embed = createEmbed({
            title: `${config.emoji.holy} Holy Guild Tag ${config.emoji.holy}`,
            description: `We encourage all members to wear the   **"𐤲 ."**   Guild Tag proudly!\n\nAdding the tag to your Discord username shows your dedication to our community and helps us identify fellow members.`,
            fields: [
                { 
                    name: 'How to Add the Tag', 
                    value: 'Simply edit your Discord profile server tag to include   **𐤲 .**   after your name.' 
                },
                { 
                    name: 'Example', 
                    value: '**Username 𐤲 .**' 
                }
            ],
            footer: 'Wear the tag with pride!'
        });
        
        await interaction.reply({ embeds: [embed] });
    },
}; 