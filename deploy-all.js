const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

// Collect commands
const commands = [];
const commandsPath = path.join(__dirname, '..', 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command) {
        commands.push(command.data.toJSON());
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" property.`);
    }
}

// Create REST instance
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// Create client to get guilds
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

(async () => {
    try {
        // Login to get guild list
        await client.login(process.env.TOKEN);
        
        console.log(`Bot is in ${client.guilds.cache.size} guilds.`);
        console.log(`Will deploy ${commands.length} commands to all guilds.`);
        
        // Deploy to each guild
        let deployed = 0;
        for (const guild of client.guilds.cache.values()) {
            try {
                console.log(`Deploying commands to guild: ${guild.name} (${guild.id})`);
                
                await rest.put(
                    Routes.applicationGuildCommands(process.env.CLIENT_ID, guild.id),
                    { body: commands },
                );
                
                deployed++;
                console.log(`Successfully deployed commands to: ${guild.name}`);
            } catch (error) {
                console.error(`Failed to deploy commands to guild ${guild.name} (${guild.id}):`, error);
            }
        }
        
        console.log(`Commands deployed to ${deployed}/${client.guilds.cache.size} guilds.`);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
})(); 