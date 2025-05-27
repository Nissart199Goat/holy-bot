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

// Auto-deploy commands function for guild
async function autoDeployCommands() {
    try {
        console.log('🚀 AUTO-DÉPLOIEMENT DES COMMANDES');
        console.log('==================================');
        
        // Get environment variables
        const token = process.env.TOKEN || process.env.DISCORD_TOKEN;
        const clientId = process.env.CLIENT_ID;
        const guildId = process.env.GUILD_ID;
        
        if (!token || !clientId || !guildId) {
            console.log('⚠️ Variables manquantes pour le déploiement automatique');
            return;
        }
        
        // Collect commands
        const commands = [];
        for (const [name, command] of client.commands) {
            if (command.data) {
                commands.push(command.data.toJSON());
            }
        }
        
        console.log(`📦 ${commands.length} commandes à déployer sur le serveur ${guildId}`);
        
        // Initialize REST
        const rest = new REST({ version: '10' }).setToken(token);
        
        // Deploy to guild (fast deployment)
        console.log('📤 Déploiement en cours...');
        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        );
        
        console.log(`✅ ${data.length} commandes déployées avec succès !`);
        console.log('⚡ Commandes disponibles immédiatement sur votre serveur');
        
    } catch (error) {
        console.error('❌ Erreur lors du déploiement automatique:', error.message);
        console.log('💡 Vous pouvez utiliser "npm run deploy" manuellement');
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

// When the client is ready, deploy commands and connect to database
client.once('ready', async () => {
    console.log(`🤖 Bot connecté en tant que ${client.user.tag}`);
    console.log(`🏠 Serveurs: ${client.guilds.cache.size} | Utilisateurs: ${client.users.cache.size}`);
    
    // Connect to database
    await database.connect();
    
    // Auto-deploy commands to your guild
    await autoDeployCommands();
    
    console.log('✅ Bot entièrement opérationnel !');
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