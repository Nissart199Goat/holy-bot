const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

console.log('Chargement des commandes...');

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command) {
        const commandData = command.data.toJSON();
        
        // Log les permissions de la commande
        console.log(`[INFO] Commande "${commandData.name}":`);
        if (commandData.default_member_permissions) {
            console.log(`  - Permissions requises: ${commandData.default_member_permissions}`);
        } else {
            console.log('  - Accessible à tous les utilisateurs');
            // Forcer l'accessibilité pour les commandes non-admin
            if (!['config', 'setup-verify', 'rules', 'booster'].includes(commandData.name)) {
                commandData.default_member_permissions = null;
            }
        }
        
        commands.push(commandData);
    } else {
        console.log(`[WARNING] La commande ${file} n'a pas de propriété "data" requise.`);
    }
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log(`\nDéploiement de ${commands.length} commandes...`);

        // Déployer les commandes sur le serveur
        const data = await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );

        console.log('\nCommandes déployées avec succès :');
        data.forEach(cmd => {
            console.log(`- ${cmd.name} (ID: ${cmd.id})`);
        });
    } catch (error) {
        console.error('Erreur lors du déploiement des commandes :', error);
    }
})(); 