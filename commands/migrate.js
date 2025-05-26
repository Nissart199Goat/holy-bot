const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed, COLORS } = require('../utils/embeds');
const database = require('../database');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('migrate')
        .setDescription('Migrate existing data from JSON files to MySQL (Admin only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        
        try {
            let migratedUsers = 0;
            let migratedConfig = false;
            
            // Migrer les données utilisateurs
            const usersPath = path.join(__dirname, '..', 'data', 'users.json');
            if (fs.existsSync(usersPath)) {
                const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
                
                for (const guildId in usersData) {
                    for (const userId in usersData[guildId]) {
                        const userData = usersData[guildId][userId];
                        
                        // Insérer dans MySQL
                        await database.connection.execute(
                            `INSERT INTO user_levels (user_id, guild_id, xp, level, last_message) 
                             VALUES (?, ?, ?, ?, FROM_UNIXTIME(?))
                             ON DUPLICATE KEY UPDATE 
                             xp = VALUES(xp), 
                             level = VALUES(level),
                             last_message = VALUES(last_message)`,
                            [userId, guildId, userData.xp, userData.level, userData.lastMessageTime / 1000]
                        );
                        migratedUsers++;
                    }
                }
            }
            
            // Migrer la configuration du serveur
            const configPath = path.join(__dirname, '..', 'data', 'serverConfig.json');
            if (fs.existsSync(configPath)) {
                const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                
                // Convertir l'ancien format vers le nouveau
                const mysqlConfig = {
                    welcome_channel_id: configData.channels?.welcome || null,
                    blessing_channel_id: configData.channels?.blessings || null,
                    ticket_category_id: configData.channels?.voiceCategory || null,
                    ticket_channel_id: configData.channels?.voiceCreator || null,
                    level_channel_id: configData.channels?.log || null,
                    autorole_id: configData.roles?.autorole || null
                };
                
                // Utiliser l'ID du serveur actuel
                await database.updateServerConfig(interaction.guild.id, mysqlConfig);
                migratedConfig = true;
            }
            
            const embed = createEmbed(
                'Migration Complete',
                'Data migration from JSON files to MySQL has been completed.',
                COLORS.SUCCESS
            );
            
            embed.addFields([
                { name: 'Users Migrated', value: migratedUsers.toString(), inline: true },
                { name: 'Config Migrated', value: migratedConfig ? 'Yes' : 'No', inline: true }
            ]);
            
            if (migratedUsers > 0 || migratedConfig) {
                embed.addFields([
                    { 
                        name: 'Next Steps', 
                        value: 'You can now safely delete the JSON files in the `data/` folder if desired. All data is now stored in MySQL.',
                        inline: false 
                    }
                ]);
            }
            
            await interaction.editReply({ embeds: [embed] });
            
        } catch (error) {
            console.error('Error during migration:', error);
            await interaction.editReply({ 
                content: 'An error occurred during migration. Please check the server logs.',
                ephemeral: true 
            });
        }
    }
}; 