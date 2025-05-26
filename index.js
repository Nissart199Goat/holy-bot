const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const database = require('./database');
require('dotenv').config();

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// Command collection
client.commands = new Collection();

// Function to deploy commands
async function deployCommands() {
    try {
        console.log('🔄 Starting command deployment...');
        
        const commands = [];
        const commandsPath = path.join(__dirname, 'commands');
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        console.log(`📁 Found ${commandFiles.length} command files`);

        // Load command files
        for (const file of commandFiles) {
            try {
                const filePath = path.join(commandsPath, file);
                const command = require(filePath);
                if ('data' in command && 'execute' in command) {
                    commands.push(command.data.toJSON());
                    console.log(`✅ Loaded command: ${command.data.name}`);
                } else {
                    console.log(`⚠️ Skipping ${file}: missing data or execute`);
                }
            } catch (error) {
                console.error(`❌ Error loading command ${file}:`, error.message);
            }
        }

        console.log(`🎯 Total commands to deploy: ${commands.length}`);

        // Create REST instance
        const token = process.env.TOKEN || process.env.DISCORD_TOKEN;
        if (!token) {
            throw new Error('No Discord token found in environment variables');
        }
        
        const rest = new REST().setToken(token);

        console.log('Started refreshing application (/) commands...');

        // Get the client ID and guild ID from the environment variables
        const clientId = process.env.CLIENT_ID;
        const guildId = process.env.GUILD_ID;

        console.log(`🔑 Client ID: ${clientId ? 'Found' : 'Missing'}`);
        console.log(`🏠 Guild ID: ${guildId ? guildId : 'Not set (will deploy globally)'}`);

        if (!clientId) {
            throw new Error('CLIENT_ID not found in environment variables');
        }

        // Delete all existing global commands
        await rest.put(
            Routes.applicationCommands(clientId),
            { body: [] }
        );
        console.log('Successfully deleted all global application commands.');

        // If guild ID is provided, delete guild-specific commands
        if (guildId) {
            await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: [] }
            );
            console.log('Successfully deleted all guild application commands.');

            // Deploy new commands to guild
            await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: commands }
            );
            console.log(`🎉 Successfully reloaded ${commands.length} guild (/) commands.`);
        } else {
            // Deploy new commands globally
            await rest.put(
                Routes.applicationCommands(clientId),
                { body: commands }
            );
            console.log(`🎉 Successfully reloaded ${commands.length} global (/) commands.`);
        }
        
        console.log('✅ Command deployment completed successfully!');
    } catch (error) {
        console.error('❌ Error deploying commands:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Load commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// Load events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// When the client is ready, deploy commands and log in
client.once('ready', async () => {
    console.log('Bot is ready!');
    
    // Connect to database
    await database.connect();
    
    deployCommands();
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down...');
    await database.disconnect();
    client.destroy();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Shutting down...');
    await database.disconnect();
    client.destroy();
    process.exit(0);
});

// Login to Discord with your token
const token = process.env.TOKEN || process.env.DISCORD_TOKEN;
if (!token) {
    console.error('❌ No Discord token found! Please set TOKEN or DISCORD_TOKEN in your .env file');
    process.exit(1);
}

console.log('🔐 Logging in to Discord...');
client.login(token); 