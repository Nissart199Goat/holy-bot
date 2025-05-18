const { ActivityType } = require('discord.js');
const config = require('../config');

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`Logged in as ${client.user.tag}`);
        console.log(`Serving ${client.guilds.cache.size} guilds and ${client.users.cache.size} users`);
        
        // Set bot presence
        client.user.setPresence({
            status: config.presence.status,
            activities: [{ 
                name: config.presence.activity,
                type: ActivityType.Custom
            }]
        });
        
        console.log(`Bot presence set to: ${config.presence.status} | ${config.presence.activity}`);
    },
}; 