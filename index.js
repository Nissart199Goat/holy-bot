const { Client, GatewayIntentBits, Collection } = require('discord.js');
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

// Note: Command deployment is now handled by deploy-commands.js
// Run "npm run deploy" to deploy commands

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

// When the client is ready, log in
client.once('ready', async () => {
    console.log('Bot is ready!');
    
    // Connect to database
    await database.connect();
    
    console.log('✅ Bot is fully operational!');
    console.log('💡 Use "npm run deploy" to deploy commands if needed');
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