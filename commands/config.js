const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed, COLORS } = require('../utils/embeds');
const config = require('../config');
const fs = require('fs');
const path = require('path');

// Chemin vers le fichier de configuration
const configFilePath = path.join(__dirname, '..', 'data', 'serverConfig.json');

// Fonction pour s'assurer que le répertoire data existe
function ensureDataDirectoryExists() {
    const dirPath = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

// Fonction pour charger la configuration
function loadConfiguration() {
    ensureDataDirectoryExists();
    
    if (!fs.existsSync(configFilePath)) {
        // Créer une configuration par défaut
        const defaultConfig = {
            roles: {
                moderator: '',
                admin: '',
                autorole: ''
            },
            channels: {
                welcome: '',
                rules: '',
                log: '',
                prayer: '',
                announcements: '',
                calendar: '',
                voiceCreator: '',
                voiceCategory: '',
                blessings: ''
            },
            settings: {
                welcomeEnabled: true
            },
            lastUpdated: new Date().toISOString(),
            updatedBy: 'System'
        };
        
        fs.writeFileSync(configFilePath, JSON.stringify(defaultConfig, null, 2));
        return defaultConfig;
    }
    
    try {
        const data = fs.readFileSync(configFilePath, 'utf8');
        const config = JSON.parse(data);
        
        // S'assurer que tous les champs nécessaires existent
        const defaultConfig = {
            roles: {
                moderator: '',
                admin: '',
                autorole: ''
            },
            channels: {
                welcome: '',
                rules: '',
                log: '',
                prayer: '',
                announcements: '',
                calendar: '',
                voiceCreator: '',
                voiceCategory: '',
                blessings: ''
            },
            settings: {
                welcomeEnabled: true
            }
        };

        // Fusionner la configuration existante avec les valeurs par défaut
        const mergedConfig = {
            roles: { ...defaultConfig.roles, ...config.roles },
            channels: { ...defaultConfig.channels, ...config.channels },
            settings: { ...defaultConfig.settings, ...config.settings },
            lastUpdated: config.lastUpdated || new Date().toISOString(),
            updatedBy: config.updatedBy || 'System'
        };

        // Sauvegarder la configuration fusionnée
        fs.writeFileSync(configFilePath, JSON.stringify(mergedConfig, null, 2));
        
        return mergedConfig;
    } catch (error) {
        console.error('Error loading configuration:', error);
        return null;
    }
}

// Fonction pour sauvegarder la configuration
function saveConfiguration(config) {
    ensureDataDirectoryExists();
    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
}

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
                .setName('roles')
                .setDescription('Configure roles')
                .addRoleOption(option =>
                    option.setName('moderator')
                        .setDescription('Set the moderator role')
                        .setRequired(false))
                .addRoleOption(option =>
                    option.setName('admin')
                        .setDescription('Set the admin role')
                        .setRequired(false))
                .addRoleOption(option =>
                    option.setName('autorole')
                        .setDescription('Set the role automatically given to new members')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('channels')
                .setDescription('Configure channels')
                .addChannelOption(option =>
                    option.setName('welcome')
                        .setDescription('Set the welcome channel')
                        .setRequired(false))
                .addChannelOption(option =>
                    option.setName('rules')
                        .setDescription('Set the rules channel')
                        .setRequired(false))
                .addChannelOption(option =>
                    option.setName('log')
                        .setDescription('Set the log channel')
                        .setRequired(false))
                .addChannelOption(option =>
                    option.setName('prayer')
                        .setDescription('Set the prayer channel')
                        .setRequired(false))
                .addChannelOption(option =>
                    option.setName('calendar')
                        .setDescription('Set the calendar channel')
                        .setRequired(false))
                .addChannelOption(option =>
                    option.setName('blessings')
                        .setDescription('Set the channel for daily blessings')
                        .setRequired(false))
                .addChannelOption(option =>
                    option.setName('voice_creator')
                        .setDescription('Set the voice channel that creates temporary voice channels')
                        .setRequired(false))
                .addChannelOption(option =>
                    option.setName('voice_category')
                        .setDescription('Set the category for temporary voice channels')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('settings')
                .setDescription('Configure general settings')
                .addBooleanOption(option =>
                    option.setName('welcome_enabled')
                        .setDescription('Enable/disable welcome messages')
                        .setRequired(false))),
        
    async execute(interaction) {
        try {
            const subcommand = interaction.options.getSubcommand();
            let serverConfig = loadConfiguration();
            
            if (!serverConfig) {
                return interaction.reply({ 
                    content: 'Error loading configuration. Please check the server logs.',
                    ephemeral: true 
                });
            }
            
            if (subcommand === 'view') {
                await handleViewConfig(interaction, serverConfig);
            }
            else if (subcommand === 'roles') {
                await handleRolesConfig(interaction, serverConfig);
            }
            else if (subcommand === 'channels') {
                await handleChannelsConfig(interaction, serverConfig);
            }
            else if (subcommand === 'settings') {
                await handleSettingsConfig(interaction, serverConfig);
            }
        } catch (error) {
            console.error('Error in config command:', error);
            await interaction.reply({ 
                content: 'An error occurred while processing the configuration. Please check the server logs.',
                ephemeral: true 
            });
        }
    }
};

// Fonction pour afficher la configuration actuelle
async function handleViewConfig(interaction, serverConfig) {
    const roleMentions = {};
    for (const [key, id] of Object.entries(serverConfig.roles)) {
        if (id) {
            const role = interaction.guild.roles.cache.get(id);
            roleMentions[key] = role ? `${role} (${id})` : `Role not found (${id})`;
        } else {
            roleMentions[key] = 'Not set';
        }
    }
    
    const channelMentions = {};
    for (const [key, id] of Object.entries(serverConfig.channels)) {
        if (id) {
            const channel = interaction.guild.channels.cache.get(id);
            channelMentions[key] = channel ? `${channel} (${id})` : `Channel not found (${id})`;
        } else {
            channelMentions[key] = 'Not set';
        }
    }
    
    const embed = createEmbed({
        title: `${config.emoji.crown} Bot Configuration`,
        description: `Current configuration for Holy Bot`,
        fields: [
            {
                name: 'Roles',
                value: `**Moderator:** ${roleMentions.moderator}\n**Admin:** ${roleMentions.admin}\n**Auto Role:** ${roleMentions.autorole}`
            },
            {
                name: 'Channels',
                value: `**Welcome:** ${channelMentions.welcome}\n**Rules:** ${channelMentions.rules}\n**Log:** ${channelMentions.log}\n**Prayer:** ${channelMentions.prayer}\n**Calendar:** ${channelMentions.calendar}\n**Blessings:** ${channelMentions.blessings}`
            },
            {
                name: 'Voice Channels',
                value: `**Voice Creator:** ${channelMentions.voiceCreator || 'Not set'}\n**Voice Category:** ${channelMentions.voiceCategory || 'Not set'}`
            },
            {
                name: 'Settings',
                value: `**Welcome Messages:** ${serverConfig.settings.welcomeEnabled ? '✅ Enabled' : '❌ Disabled'}`
            },
            {
                name: 'Last Updated',
                value: `${new Date(serverConfig.lastUpdated).toLocaleString()}\nBy: ${serverConfig.updatedBy}`
            }
        ],
        footer: 'Use /config roles, /config channels, or /config settings to update',
        color: COLORS.SECONDARY
    });
    
    await interaction.reply({ embeds: [embed], ephemeral: true });
}

// Fonction pour gérer la configuration des rôles
async function handleRolesConfig(interaction, serverConfig) {
    const moderatorRole = interaction.options.getRole('moderator');
    const adminRole = interaction.options.getRole('admin');
    const autorole = interaction.options.getRole('autorole');
    
    let updated = false;
    
    if (moderatorRole) {
        serverConfig.roles.moderator = moderatorRole.id;
        updated = true;
    }
    
    if (adminRole) {
        serverConfig.roles.admin = adminRole.id;
        updated = true;
    }
    
    if (autorole) {
        serverConfig.roles.autorole = autorole.id;
        updated = true;
    }
    
    if (updated) {
        serverConfig.lastUpdated = new Date().toISOString();
        serverConfig.updatedBy = interaction.user.tag;
        saveConfiguration(serverConfig);
        
        await interaction.reply({
            content: 'Role configuration updated successfully!',
            ephemeral: true
        });
    } else {
        await interaction.reply({
            content: 'No changes were made to the role configuration.',
            ephemeral: true
        });
    }
}

// Fonction pour gérer la configuration des canaux
async function handleChannelsConfig(interaction, serverConfig) {
    const welcomeChannel = interaction.options.getChannel('welcome');
    const rulesChannel = interaction.options.getChannel('rules');
    const logChannel = interaction.options.getChannel('log');
    const prayerChannel = interaction.options.getChannel('prayer');
    const calendarChannel = interaction.options.getChannel('calendar');
    const blessingsChannel = interaction.options.getChannel('blessings');
    const voiceCreatorChannel = interaction.options.getChannel('voice_creator');
    const voiceCategoryChannel = interaction.options.getChannel('voice_category');
    
    let updated = false;
    
    if (welcomeChannel) {
        serverConfig.channels.welcome = welcomeChannel.id;
        updated = true;
    }
    
    if (rulesChannel) {
        serverConfig.channels.rules = rulesChannel.id;
        updated = true;
    }
    
    if (logChannel) {
        serverConfig.channels.log = logChannel.id;
        updated = true;
    }
    
    if (prayerChannel) {
        serverConfig.channels.prayer = prayerChannel.id;
        updated = true;
    }
    
    if (calendarChannel) {
        serverConfig.channels.calendar = calendarChannel.id;
        updated = true;
    }
    
    if (blessingsChannel) {
        serverConfig.channels.blessings = blessingsChannel.id;
        updated = true;
    }
    
    if (voiceCreatorChannel) {
        serverConfig.channels.voiceCreator = voiceCreatorChannel.id;
        updated = true;
    }
    
    if (voiceCategoryChannel) {
        serverConfig.channels.voiceCategory = voiceCategoryChannel.id;
        updated = true;
    }
    
    if (updated) {
        serverConfig.lastUpdated = new Date().toISOString();
        serverConfig.updatedBy = interaction.user.tag;
        saveConfiguration(serverConfig);
        
        await interaction.reply({
            content: 'Channel configuration updated successfully!',
            ephemeral: true
        });
    } else {
        await interaction.reply({
            content: 'No changes were made to the channel configuration.',
            ephemeral: true
        });
    }
}

// Fonction pour gérer la configuration des paramètres généraux
async function handleSettingsConfig(interaction, serverConfig) {
    const welcomeEnabled = interaction.options.getBoolean('welcome_enabled');
    
    let updated = false;
    
    if (welcomeEnabled !== null) {
        serverConfig.settings.welcomeEnabled = welcomeEnabled;
        updated = true;
    }
    
    if (updated) {
        serverConfig.lastUpdated = new Date().toISOString();
        serverConfig.updatedBy = interaction.user.tag;
        saveConfiguration(serverConfig);
        
        await interaction.reply({
            content: 'Settings updated successfully!',
            ephemeral: true
        });
    } else {
        await interaction.reply({
            content: 'No changes were made to the settings.',
            ephemeral: true
        });
    }
} 