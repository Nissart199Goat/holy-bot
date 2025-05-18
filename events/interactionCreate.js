const { Events, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createEmbed, COLORS } = require('../utils/embeds');
const config = require('../config');
const fs = require('fs');
const path = require('path');

// Chemin vers le fichier de configuration
const configFilePath = path.join(__dirname, '..', 'data', 'serverConfig.json');

// Fonction pour charger la configuration
function loadConfiguration() {
    try {
        if (fs.existsSync(configFilePath)) {
            const data = fs.readFileSync(configFilePath, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading configuration:', error);
    }
    return null;
}

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        try {
            // Handle modal submissions
            if (interaction.isModalSubmit()) {
                if (interaction.customId === 'ticket_create_modal') {
                    await handleTicketModalSubmit(interaction);
                    return;
                }
            }

            // Handle button interactions
            if (interaction.isButton()) {
                if (interaction.customId === 'create_ticket') {
                    await handleCreateTicketButton(interaction);
                    return;
                }

                if (interaction.customId === 'close_ticket') {
                    await handleCloseTicketButton(interaction);
                    return;
                }

                if (interaction.customId === 'verify_button') {
                    // Charger la configuration
                    const serverConfig = loadConfiguration();
                    
                    // Déterminer l'ID des rôles
                    let verifiedRoleId = process.env.VERIFIED_ROLE_ID;
                    let unverifiedRoleId = process.env.UNVERIFIED_ROLE_ID || '1371946765800181820';
                    
                    // Utiliser la configuration si disponible
                    if (serverConfig && serverConfig.roles) {
                        if (serverConfig.roles.verified) {
                            verifiedRoleId = serverConfig.roles.verified;
                        }
                        if (serverConfig.roles.unverified) {
                            unverifiedRoleId = serverConfig.roles.unverified;
                        }
                    }
                    
                    if (!verifiedRoleId) {
                        return interaction.reply({ 
                            content: 'Verification role not configured. Please contact an administrator.',
                            ephemeral: true 
                        });
                    }
                    
                    // Get the roles
                    const verifiedRole = interaction.guild.roles.cache.get(verifiedRoleId);
                    const unverifiedRole = unverifiedRoleId ? interaction.guild.roles.cache.get(unverifiedRoleId) : null;
                    
                    if (!verifiedRole) {
                        return interaction.reply({ 
                            content: 'Verification role not found. Please contact an administrator.',
                            ephemeral: true 
                        });
                    }
                    
                    // Check if user is already verified
                    if (interaction.member.roles.cache.has(verifiedRoleId)) {
                        return interaction.reply({ 
                            content: 'You are already verified!', 
                            ephemeral: true 
                        });
                    }
                    
                    // Add verified role to the user
                    await interaction.member.roles.add(verifiedRole);
                    
                    // Remove unverified role if applicable
                    if (unverifiedRole && interaction.member.roles.cache.has(unverifiedRoleId)) {
                        await interaction.member.roles.remove(unverifiedRole);
                    }
                    
                    const embed = createEmbed({
                        title: `${config.emoji.cross} Verification Successful`,
                        description: `You have been verified and assigned the ${verifiedRole.name} role.\n\nWelcome to the Holy Guild! You now have access to all channels. Please make sure to read our rules and consider wearing the Holy Guild Tag.`,
                        footer: 'Thank you for verifying!'
                    });
                    
                    // Optional: Send a message to a log channel when someone verifies
                    try {
                        let logChannelId = process.env.LOG_CHANNEL_ID;
                        
                        if (serverConfig && serverConfig.channels && serverConfig.channels.log) {
                            logChannelId = serverConfig.channels.log;
                        }
                        
                        const logVerifications = !serverConfig || 
                            !serverConfig.settings || 
                            serverConfig.settings.logVerifications !== false;
                        
                        if (logChannelId && logVerifications) {
                            const logChannel = interaction.guild.channels.cache.get(logChannelId);
                            if (logChannel) {
                                const logEmbed = createEmbed({
                                    title: 'Member Verified',
                                    description: `${interaction.user.tag} has been verified.`,
                                    fields: [
                                        {
                                            name: 'Member',
                                            value: `${interaction.user} (${interaction.user.id})`
                                        },
                                        {
                                            name: 'Timestamp',
                                            value: new Date().toLocaleString()
                                        }
                                    ]
                                });
                                logChannel.send({ embeds: [logEmbed] });
                            }
                        }
                    } catch (logError) {
                        console.error('Error sending verification log:', logError);
                    }
                    
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                }
            }

            // Handle slash commands
            if (interaction.isCommand()) {
                const command = interaction.client.commands.get(interaction.commandName);
                if (!command) return;

                try {
                    await command.execute(interaction);
                } catch (error) {
                    console.error(error);
                    await interaction.reply({ 
                        content: 'There was an error while executing this command!', 
                        ephemeral: true 
                    });
                }
            }
        } catch (error) {
            console.error('Error handling interaction:', error);
        }
    },
};

// Function to handle ticket modal submission
async function handleTicketModalSubmit(interaction) {
    try {
        // Get the values from the modal
        const reason = interaction.fields.getTextInputValue('ticketReason');
        const description = interaction.fields.getTextInputValue('ticketDescription');
        
        // Determine reason type
        let reasonType = 'other';
        if (reason.toLowerCase().includes('prayer')) reasonType = 'prayer';
        else if (reason.toLowerCase().includes('guidance') || reason.toLowerCase().includes('spiritual')) reasonType = 'guidance';
        else if (reason.toLowerCase().includes('bible') || reason.toLowerCase().includes('study')) reasonType = 'bible_study';
        else if (reason.toLowerCase().includes('personal') || reason.toLowerCase().includes('support')) reasonType = 'support';
        else if (reason.toLowerCase().includes('technical') || reason.toLowerCase().includes('help')) reasonType = 'technical';
        
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
            ]
        });
        
        // Create welcome message in the ticket channel
        const ticketEmbed = createEmbed({
            title: `${config.emoji.pray} Support Ticket`,
            description: `Thank you for reaching out, ${interaction.user}. Our support team will be with you shortly.\n\n**Reason:** ${reason}\n**Description:** ${description}`,
            fields: [
                {
                    name: 'Ticket Information',
                    value: `**User:** ${interaction.user.tag}\n**Created:** ${new Date().toLocaleString()}`
                },
                {
                    name: 'Close Ticket',
                    value: 'When your issue has been resolved, you can close this ticket with the button below.'
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
    } catch (error) {
        console.error('Error handling ticket modal submit:', error);
        await interaction.reply({ 
            content: 'An error occurred while creating the ticket. Please try again later.',
            ephemeral: true 
        });
    }
}

// Function to handle ticket creation button
async function handleCreateTicketButton(interaction) {
    try {
        // Create modal for ticket information
        const modal = new ModalBuilder()
            .setCustomId('ticket_create_modal')
            .setTitle('Create Support Ticket');
            
        // Create the text input components
        const reasonInput = new TextInputBuilder()
            .setCustomId('ticketReason')
            .setLabel("What type of help do you need?")
            .setPlaceholder('Prayer, Guidance, Bible Study, Personal, Technical, Other')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);
            
        const descriptionInput = new TextInputBuilder()
            .setCustomId('ticketDescription')
            .setLabel("Please describe your concern")
            .setPlaceholder('Share details about what you need help with...')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);
            
        // Create action rows to hold the inputs
        const firstRow = new ActionRowBuilder().addComponents(reasonInput);
        const secondRow = new ActionRowBuilder().addComponents(descriptionInput);
        
        // Add the components to the modal
        modal.addComponents(firstRow, secondRow);
        
        // Show the modal
        await interaction.showModal(modal);
    } catch (error) {
        console.error('Error handling create ticket button:', error);
        await interaction.reply({ 
            content: 'An error occurred while creating the ticket. Please try again later.',
            ephemeral: true 
        });
    }
}

// Function to handle ticket closing button
async function handleCloseTicketButton(interaction) {
    try {
        // Check if channel is a ticket
        if (!interaction.channel.name.startsWith('ticket-')) {
            return interaction.reply({ 
                content: 'This is not a ticket channel.',
                ephemeral: true 
            });
        }
        
        // Create closure embed
        const closureEmbed = createEmbed({
            title: `${config.emoji.check} Ticket Closed`,
            description: `This ticket has been closed by ${interaction.user}.`,
            fields: [
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
                await interaction.channel.delete();
            } catch (error) {
                console.error('Error closing ticket:', error);
                await interaction.channel.send('Error closing the ticket. Please contact an administrator.');
            }
        }, 5000);
    } catch (error) {
        console.error('Error handling close ticket button:', error);
        await interaction.reply({ 
            content: 'An error occurred while closing the ticket. Please try again later.',
            ephemeral: true 
        });
    }
} 