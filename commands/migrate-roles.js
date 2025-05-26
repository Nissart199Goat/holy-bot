const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed, COLORS } = require('../utils/embeds');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('migrate-roles')
        .setDescription('🚨 ADMIN ONLY: Remove a role from all members and give them another role')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addRoleOption(option =>
            option.setName('remove_role')
                .setDescription('The role to remove from all members')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('add_role')
                .setDescription('The role to give to all members (optional)')
                .setRequired(false)),
        
    async execute(interaction) {
        try {
            const removeRole = interaction.options.getRole('remove_role');
            const addRole = interaction.options.getRole('add_role');
            
            // Vérification de sécurité
            if (removeRole.id === interaction.guild.id) {
                return interaction.reply({
                    content: '❌ You cannot remove the @everyone role!',
                    ephemeral: true
                });
            }
            
            // Confirmation embed
            const confirmEmbed = createEmbed({
                title: `${config.emoji.warning} Role Migration Confirmation`,
                description: `⚠️ **This action will affect multiple members!**\n\n**Action to perform:**`,
                fields: [
                    {
                        name: '🗑️ Remove Role',
                        value: `${removeRole} (${removeRole.members.size} members have this role)`
                    },
                    {
                        name: '➕ Add Role',
                        value: addRole ? `${addRole}` : 'None (only removing role)'
                    },
                    {
                        name: '👥 Affected Members',
                        value: `${removeRole.members.size} members will be affected`
                    },
                    {
                        name: '⚠️ Warning',
                        value: 'This action cannot be undone easily. Make sure this is what you want to do!'
                    }
                ],
                color: COLORS.WARNING
            });
            
            await interaction.reply({ 
                embeds: [confirmEmbed], 
                ephemeral: true 
            });
            
            // Attendre 3 secondes puis commencer la migration
            setTimeout(async () => {
                try {
                    const startEmbed = createEmbed({
                        title: `${config.emoji.loading} Starting Role Migration...`,
                        description: `Processing ${removeRole.members.size} members...`,
                        color: COLORS.PRIMARY
                    });
                    
                    await interaction.editReply({ embeds: [startEmbed] });
                    
                    let successCount = 0;
                    let errorCount = 0;
                    const errors = [];
                    
                    // Récupérer tous les membres avec le rôle à supprimer
                    const membersWithRole = removeRole.members;
                    
                    for (const [memberId, member] of membersWithRole) {
                        try {
                            // Retirer le rôle
                            await member.roles.remove(removeRole);
                            
                            // Ajouter le nouveau rôle si spécifié
                            if (addRole) {
                                await member.roles.add(addRole);
                            }
                            
                            successCount++;
                            console.log(`✅ Migrated roles for ${member.user.tag}`);
                            
                            // Petite pause pour éviter le rate limiting
                            await new Promise(resolve => setTimeout(resolve, 100));
                            
                        } catch (error) {
                            errorCount++;
                            errors.push(`${member.user.tag}: ${error.message}`);
                            console.error(`❌ Error migrating roles for ${member.user.tag}:`, error);
                        }
                    }
                    
                    // Résultat final
                    const resultEmbed = createEmbed({
                        title: `${config.emoji.check} Role Migration Complete!`,
                        description: `Migration finished successfully!`,
                        fields: [
                            {
                                name: '✅ Successful',
                                value: `${successCount} members processed successfully`
                            },
                            {
                                name: '❌ Errors',
                                value: errorCount > 0 ? `${errorCount} errors occurred` : 'No errors'
                            },
                            {
                                name: '📋 Summary',
                                value: `**Removed:** ${removeRole.name}\n**Added:** ${addRole ? addRole.name : 'None'}\n**Total processed:** ${successCount + errorCount}`
                            }
                        ],
                        color: errorCount > 0 ? COLORS.WARNING : COLORS.SUCCESS
                    });
                    
                    if (errors.length > 0 && errors.length <= 10) {
                        resultEmbed.addFields({
                            name: '⚠️ Error Details',
                            value: errors.slice(0, 10).join('\n').substring(0, 1024)
                        });
                    }
                    
                    await interaction.editReply({ embeds: [resultEmbed] });
                    
                } catch (error) {
                    console.error('Error during role migration:', error);
                    
                    const errorEmbed = createEmbed({
                        title: `${config.emoji.error} Migration Failed`,
                        description: `An error occurred during the migration: ${error.message}`,
                        color: COLORS.ERROR
                    });
                    
                    await interaction.editReply({ embeds: [errorEmbed] });
                }
            }, 3000);
            
        } catch (error) {
            console.error('Error in migrate-roles command:', error);
            await interaction.reply({ 
                content: 'An error occurred while processing the role migration.',
                ephemeral: true 
            });
        }
    }
}; 