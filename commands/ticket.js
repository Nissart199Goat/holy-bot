const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createEmbed, COLORS } = require('../utils/embeds');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Create a ticket for pastoral support or questions')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create a new support ticket')
                .addStringOption(option => 
                    option.setName('reason')
                        .setDescription('The reason for your ticket')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Prayer Request', value: 'prayer' },
                            { name: 'Spiritual Guidance', value: 'guidance' },
                            { name: 'Bible Study Question', value: 'bible_study' },
                            { name: 'Personal Support', value: 'support' },
                            { name: 'Technical Help', value: 'technical' },
                            { name: 'Other', value: 'other' }
                        ))
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('Briefly describe your concern')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('close')
                .setDescription('Close a ticket')
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for closing the ticket')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Setup the ticket system')),
        
    async execute(interaction) {
        try {
            const subcommand = interaction.options.getSubcommand();
            
            if (subcommand === 'setup') {
                // Check if user has admin permissions
                if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                    return interaction.reply({ 
                        content: 'You do not have permission to use this command.', 
                        ephemeral: true 
                    });
                }
                
                // Create ticket panel embed
                const ticketEmbed = createEmbed({
                    title: `${config.emoji.pray} Pastoral Support & Questions`,
                    description: `Need support, guidance, or have questions about your faith journey? Our team is here to help.\n\n${config.visuals.divider}`,
                    fields: [
                        {
                            name: 'How It Works',
                            value: 'Click the button below to create a private ticket. You can discuss personal matters, request prayer, or ask for spiritual guidance in a confidential setting.'
                        },
                        {
                            name: 'Available Support',
                            value: '• Prayer requests\n• Spiritual guidance\n• Bible study questions\n• Personal support\n• Technical help\n• Other concerns'
                        }
                    ],
                    footer: 'Your conversations will be private and confidential',
                    color: COLORS.SECONDARY
                });
                
                // Create ticket button
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('create_ticket')
                            .setLabel('Create Ticket')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji('🙏')
                    );
                
                // Send the ticket panel to the channel
                await interaction.channel.send({ embeds: [ticketEmbed], components: [row] });
                await interaction.reply({ content: 'Ticket system set up successfully!', ephemeral: true });
            }
            else if (subcommand === 'create') {
                const reason = interaction.options.getString('reason');
                const description = interaction.options.getString('description');
                
                // Format reason for display
                const reasonDisplay = {
                    'prayer': 'Prayer Request',
                    'guidance': 'Spiritual Guidance',
                    'bible_study': 'Bible Study Question',
                    'support': 'Personal Support',
                    'technical': 'Technical Help',
                    'other': 'Other'
                }[reason];
                
                // Create a ticket channel
                const ticketChannel = await interaction.guild.channels.create({
                    name: `ticket-${interaction.user.username}-${Date.now().toString().slice(-4)}`,
                    type: 0, // Text channel
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id, // @everyone role
                            deny: [PermissionFlagsBits.ViewChannel]
                        },
                        {
                            id: interaction.user.id, // Ticket creator
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
                        }
                        // Add permission for support team role if you have one
                        // {
                        //     id: 'SUPPORT_ROLE_ID',
                        //     allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
                        // }
                    ]
                });
                
                // Create welcome message in the ticket channel
                const ticketEmbed = createEmbed({
                    title: `${config.emoji.pray} ${reasonDisplay}`,
                    description: `Thank you for reaching out, ${interaction.user}. Our support team will be with you shortly.\n\n**Description:** ${description}`,
                    fields: [
                        {
                            name: 'Ticket Information',
                            value: `**User:** ${interaction.user.tag}\n**Created:** ${new Date().toLocaleString()}\n**Reason:** ${reasonDisplay}`
                        },
                        {
                            name: 'Close Ticket',
                            value: 'When your issue has been resolved, you can close this ticket with `/ticket close`'
                        }
                    ],
                    color: COLORS.PRIMARY
                });
                
                // Create close ticket button
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('close_ticket')
                            .setLabel('Close Ticket')
                            .setStyle(ButtonStyle.Danger)
                            .setEmoji('🔒')
                    );
                
                await ticketChannel.send({ embeds: [ticketEmbed], components: [row] });
                
                // Notify in ticket category if exists
                const supportCategory = interaction.guild.channels.cache.find(c => c.type === 4 && c.name.toLowerCase().includes('support'));
                if (supportCategory) {
                    try {
                        await ticketChannel.setParent(supportCategory.id, { lockPermissions: false });
                    } catch (e) {
                        console.error('Could not move ticket to support category:', e);
                    }
                }
                
                // Notify user
                await interaction.reply({ 
                    content: `Your ticket has been created: ${ticketChannel}`,
                    ephemeral: true 
                });
            }
            else if (subcommand === 'close') {
                // Check if channel is a ticket
                if (!interaction.channel.name.startsWith('ticket-')) {
                    return interaction.reply({ 
                        content: 'This command can only be used in ticket channels.',
                        ephemeral: true 
                    });
                }
                
                const reason = interaction.options.getString('reason');
                
                // Create closure embed
                const closureEmbed = createEmbed({
                    title: `${config.emoji.check} Ticket Closed`,
                    description: `This ticket has been closed by ${interaction.user}.`,
                    fields: [
                        {
                            name: 'Reason',
                            value: reason
                        },
                        {
                            name: 'Ticket Information',
                            value: `**Closed By:** ${interaction.user.tag}\n**Closed At:** ${new Date().toLocaleString()}`
                        }
                    ],
                    color: COLORS.SUCCESS
                });
                
                await interaction.channel.send({ embeds: [closureEmbed] });
                
                // Archive the channel (wait a bit so user can see the closure message)
                await interaction.reply('Ticket will be closed in 5 seconds...');
                
                setTimeout(async () => {
                    try {
                        // Either delete the channel or archive it
                        // For archiving, you need a proper category with archive permissions
                        await interaction.channel.delete();
                    } catch (error) {
                        console.error('Error closing ticket:', error);
                        await interaction.channel.send('Error closing the ticket. Please contact an administrator.');
                    }
                }, 5000);
            }
        } catch (error) {
            console.error('Error in ticket command:', error);
            await interaction.reply({ 
                content: 'An error occurred while processing the ticket command. Please try again later.',
                ephemeral: true 
            });
        }
    }
}; 