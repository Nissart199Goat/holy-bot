const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed, COLORS } = require('../utils/embeds');
const database = require('../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('Configure the bot settings (Admin only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View current configuration'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('channels')
                .setDescription('Configure channels')
                .addChannelOption(option =>
                    option.setName('welcome')
                        .setDescription('Set the welcome channel')
                        .setRequired(false))
                .addChannelOption(option =>
                    option.setName('blessings')
                        .setDescription('Set the channel for daily blessings')
                        .setRequired(false))
                .addChannelOption(option =>
                    option.setName('ticket_category')
                        .setDescription('Set the category for tickets')
                        .setRequired(false))
                .addChannelOption(option =>
                    option.setName('ticket_channel')
                        .setDescription('Set the channel for ticket creation')
                        .setRequired(false))
                .addChannelOption(option =>
                    option.setName('level')
                        .setDescription('Set the channel for level announcements')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('roles')
                .setDescription('Configure roles')
                .addRoleOption(option =>
                    option.setName('autorole')
                        .setDescription('Set the role automatically given to new members')
                        .setRequired(false))),
        
    async execute(interaction) {
        try {
            const subcommand = interaction.options.getSubcommand();
            const guildId = interaction.guild.id;
            
            if (subcommand === 'view') {
                await handleViewConfig(interaction, guildId);
            }
            else if (subcommand === 'channels') {
                await handleChannelsConfig(interaction, guildId);
            }
            else if (subcommand === 'roles') {
                await handleRolesConfig(interaction, guildId);
            }
        } catch (error) {
            console.error('Error in config command:', error);
            await interaction.reply({ 
                content: 'An error occurred while processing the configuration command.',
                ephemeral: true 
            });
        }
    }
};

async function handleViewConfig(interaction, guildId) {
    try {
        const config = await database.getServerConfig(guildId);
        
        const embed = createEmbed(
            'Server Configuration',
            'Current bot configuration for this server',
            COLORS.INFO
        );

        // Channels configuration
        let channelsValue = '';
        if (config?.welcome_channel_id) {
            channelsValue += `**Welcome:** <#${config.welcome_channel_id}>\n`;
        }
        if (config?.blessing_channel_id) {
            channelsValue += `**Daily Blessings:** <#${config.blessing_channel_id}>\n`;
        }
        if (config?.ticket_category_id) {
            channelsValue += `**Ticket Category:** <#${config.ticket_category_id}>\n`;
        }
        if (config?.ticket_channel_id) {
            channelsValue += `**Ticket Channel:** <#${config.ticket_channel_id}>\n`;
        }
        if (config?.level_channel_id) {
            channelsValue += `**Level Announcements:** <#${config.level_channel_id}>\n`;
        }
        
        if (!channelsValue) {
            channelsValue = 'No channels configured';
        }

        // Roles configuration
        let rolesValue = '';
        if (config?.autorole_id) {
            rolesValue += `**Auto Role:** <@&${config.autorole_id}>\n`;
        }
        
        if (!rolesValue) {
            rolesValue = 'No roles configured';
        }

        embed.addFields(
            { name: '📺 Channels', value: channelsValue, inline: false },
            { name: '🎭 Roles', value: rolesValue, inline: false }
        );

        if (config?.updated_at) {
            embed.setFooter({ text: `Last updated: ${new Date(config.updated_at).toLocaleString()}` });
        }

        await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
        console.error('Error in handleViewConfig:', error);
        await interaction.reply({ 
            content: 'Error retrieving configuration.',
            ephemeral: true 
        });
    }
}

async function handleChannelsConfig(interaction, guildId) {
    try {
        const welcome = interaction.options.getChannel('welcome');
        const blessings = interaction.options.getChannel('blessings');
        const ticketCategory = interaction.options.getChannel('ticket_category');
        const ticketChannel = interaction.options.getChannel('ticket_channel');
        const level = interaction.options.getChannel('level');

        const updates = {};
        let changesText = '';

        if (welcome) {
            updates.welcome_channel_id = welcome.id;
            changesText += `**Welcome Channel:** ${welcome}\n`;
        }

        if (blessings) {
            updates.blessing_channel_id = blessings.id;
            changesText += `**Daily Blessings Channel:** ${blessings}\n`;
        }

        if (ticketCategory) {
            updates.ticket_category_id = ticketCategory.id;
            changesText += `**Ticket Category:** ${ticketCategory}\n`;
        }

        if (ticketChannel) {
            updates.ticket_channel_id = ticketChannel.id;
            changesText += `**Ticket Channel:** ${ticketChannel}\n`;
        }

        if (level) {
            updates.level_channel_id = level.id;
            changesText += `**Level Announcements Channel:** ${level}\n`;
        }

        if (Object.keys(updates).length === 0) {
            await interaction.reply({ 
                content: 'No channels were specified to update.',
                ephemeral: true 
            });
            return;
        }

        const success = await database.updateServerConfig(guildId, updates);

        if (success) {
            const embed = createEmbed(
                'Configuration Updated',
                'The following channels have been updated:',
                COLORS.SUCCESS
            );
            embed.addFields({ name: 'Changes', value: changesText, inline: false });
            
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else {
            await interaction.reply({ 
                content: 'Failed to update configuration. Please try again.',
                ephemeral: true 
            });
        }
    } catch (error) {
        console.error('Error in handleChannelsConfig:', error);
        await interaction.reply({ 
            content: 'Error updating channel configuration.',
            ephemeral: true 
        });
    }
}

async function handleRolesConfig(interaction, guildId) {
    try {
        const autorole = interaction.options.getRole('autorole');

        const updates = {};
        let changesText = '';

        if (autorole) {
            updates.autorole_id = autorole.id;
            changesText += `**Auto Role:** ${autorole}\n`;
        }

        if (Object.keys(updates).length === 0) {
            await interaction.reply({ 
                content: 'No roles were specified to update.',
                ephemeral: true 
            });
            return;
        }

        const success = await database.updateServerConfig(guildId, updates);

        if (success) {
            const embed = createEmbed(
                'Configuration Updated',
                'The following roles have been updated:',
                COLORS.SUCCESS
            );
            embed.addFields({ name: 'Changes', value: changesText, inline: false });
            
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else {
            await interaction.reply({ 
                content: 'Failed to update configuration. Please try again.',
                ephemeral: true 
            });
        }
    } catch (error) {
        console.error('Error in handleRolesConfig:', error);
        await interaction.reply({ 
            content: 'Error updating roles configuration.',
            ephemeral: true 
        });
    }
} 