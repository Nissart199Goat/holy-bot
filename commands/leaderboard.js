const { SlashCommandBuilder } = require('discord.js');
const { createEmbed, COLORS } = require('../utils/embeds');
const { getCurrentRole } = require('../data/roles');
const config = require('../config');
const database = require('../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Display the server\'s member ranking by level')
        .addIntegerOption(option => 
            option.setName('limit')
                .setDescription('Number of members to display (1-25)')
                .setMinValue(1)
                .setMaxValue(25)
                .setRequired(false)),
        
    async execute(interaction) {
        try {
            await interaction.deferReply();
            
            // Get limit (default 10)
            const limit = interaction.options.getInteger('limit') || 10;
            
            // Get the leaderboard
            const leaderboard = await database.getLeaderboard(interaction.guild.id, limit);
            
            if (!leaderboard.length) {
                return interaction.editReply('No level data is available at the moment.');
            }
            
            // Build description with ranking
            let description = `${config.visuals.divider}\n\n`;
            
            // Load members to get their names
            const membersPromises = leaderboard.map(user => 
                interaction.guild.members.fetch(user.userId).catch(() => null)
            );
            
            const members = await Promise.all(membersPromises);
            
            // Medals for top 3
            const medals = ['🥇', '🥈', '🥉'];
            
            // Add each entry to the leaderboard
            for (let i = 0; i < leaderboard.length; i++) {
                const user = leaderboard[i];
                const member = members[i];
                
                // Get current role
                const currentRole = getCurrentRole(user.level);
                
                // Create rank display
                const rank = i < 3 ? medals[i] : `**${i + 1}.**`;
                
                // If member still exists on the server
                if (member) {
                    description += `${rank} **${member.user.username}** - Level **${user.level}** (${user.xp} XP)`;
                    
                    // Add role if available
                    if (currentRole) {
                        description += ` - *${currentRole.name}*`;
                    }
                    
                    description += '\n';
                } else {
                    // Member who left the server
                    description += `${rank} *Member left* - Level **${user.level}** (${user.xp} XP)\n`;
                }
            }
            
            description += `\n${config.visuals.divider}`;
            
            // Create leaderboard embed
            const embed = createEmbed({
                title: `Faithful Members Leaderboard ${config.emoji.holy}`,
                description: description,
                color: COLORS.ACCENT,
                footer: 'Keep participating to climb the ranks!'
            });
            
            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error in leaderboard command:', error);
            await interaction.editReply('An error occurred while displaying the leaderboard.');
        }
    },
}; 