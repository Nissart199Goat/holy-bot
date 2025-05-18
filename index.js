const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
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
        const commands = [];
        const commandsPath = path.join(__dirname, 'commands');
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        // Load command files
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
            }
        }

        // Create REST instance
        const rest = new REST().setToken(process.env.TOKEN);

        console.log('Started refreshing application (/) commands...');

        // Get the client ID and guild ID from the environment variables
        const clientId = process.env.CLIENT_ID;
        const guildId = process.env.GUILD_ID;

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
            console.log('Successfully reloaded guild (/) commands.');
        } else {
            // Deploy new commands globally
            await rest.put(
                Routes.applicationCommands(clientId),
                { body: commands }
            );
            console.log('Successfully reloaded global (/) commands.');
        }
    } catch (error) {
        console.error('Error deploying commands:', error);
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
client.once('ready', () => {
    console.log('Bot is ready!');
    deployCommands();
});

// Login to Discord with your token
client.login(process.env.TOKEN); 