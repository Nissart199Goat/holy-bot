const { SlashCommandBuilder } = require('discord.js');
const { createEmbed, COLORS } = require('../utils/embeds');
const { getNextRole, getCurrentRole } = require('../data/roles');
const config = require('../config');
const database = require('../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('Display your level and progression')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('View another user\'s level')
                .setRequired(false)),
        
    async execute(interaction) {
        try {
            // Target user (command initiator or specified user)
            const targetUser = interaction.options.getUser('user') || interaction.user;
            const targetMember = interaction.options.getMember('user') || interaction.member;
            
            // Get level data
            const userData = await database.getUserLevel(targetUser.id, interaction.guild.id);
            
            // Default values if user not found
            const level = userData ? userData.level : 1;
            const xp = userData ? userData.xp : 0;
            const xpForNextLevel = Math.floor(100 * Math.pow(level, 1.5));
            
            // Calculate progression percentage
            const progressPercent = Math.floor((xp / xpForNextLevel) * 100);
            
            // Create visual progress bar
            let progressBar = '';
            const barLength = 15;
            const filledSquares = Math.floor((progressPercent / 100) * barLength);
            
            for (let i = 0; i < barLength; i++) {
                if (i < filledSquares) {
                    progressBar += '█'; // Filled square for progression
                } else {
                    progressBar += '░'; // Empty square for remaining
                }
            }
            
            // Get current role and next role
            const currentRole = getCurrentRole(level);
            const nextRole = getNextRole(level);
            
            // Create embed
            const embed = createEmbed({
                title: `${targetUser.username}'s Level`,
                description: `${config.visuals.divider}\n\n**Level**: ${level}\n**XP**: ${xp}/${xpForNextLevel}\n\n**Progress**: ${progressPercent}%\n${progressBar}\n\n${config.visuals.divider}`,
                thumbnail: targetUser.displayAvatarURL({ dynamic: true }),
                color: COLORS.ACCENT,
                fields: []
            });
            
            // Add current role information
            if (currentRole) {
                embed.addFields([
                    {
                        name: 'Current Role',
                        value: `**${currentRole.name}** (Level ${currentRole.level})`,
                        inline: true
                    }
                ]);
            }
            
            // Add next role information
            if (nextRole) {
                embed.addFields([
                    {
                        name: 'Next Role',
                        value: `**${nextRole.name}** (Level ${nextRole.level})`,
                        inline: true
                    }
                ]);
            } else {
                embed.addFields([
                    {
                        name: 'Next Role',
                        value: '**Maximum level reached!**',
                        inline: true
                    }
                ]);
            }
            
            // Add footer
            embed.setFooter({ 
                text: `♱ Keep participating to earn more XP! ♱`,
                iconURL: targetUser.displayAvatarURL({ dynamic: true })
            });
            
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error in level command:', error);
            await interaction.reply({ 
                content: 'An error occurred while displaying the level information.',
                ephemeral: true 
            });
        }
    },
}; 