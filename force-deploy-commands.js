const { REST, Routes, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Liste des commandes qui nécessitent les permissions admin
const adminCommands = ['config', 'rules', 'booster', 'calendar'];

console.log('Chargement des commandes...');

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command) {
        const commandData = command.data.toJSON();
        const commandName = commandData.name;
        
        // Si c'est une commande admin, on garde les permissions admin
        if (adminCommands.includes(commandName)) {
            commandData.default_member_permissions = PermissionFlagsBits.Administrator.toString();
            console.log(`[INFO] Commande "${commandName}" configurée pour les administrateurs`);
        } else {
            // Sinon, on la rend accessible à tous
            commandData.default_member_permissions = null;
            console.log(`[INFO] Commande "${commandName}" configurée pour tous les utilisateurs`);
        }
        
        commands.push(commandData);
    } else {
        console.log(`[WARNING] La commande ${file} n'a pas de propriété "data" requise.`);
    }
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        // D'abord, supprimer toutes les commandes existantes
        console.log('\nSuppression des commandes existantes...');
        
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: [] }
        );
        
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: [] }
        );
        
        console.log('Commandes existantes supprimées.');

        // Ensuite, déployer les nouvelles commandes
        console.log(`\nDéploiement de ${commands.length} commandes...`);

        const data = await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );

        console.log('\nCommandes déployées avec succès :');
        console.log('\nCommandes administrateur :');
        data.filter(cmd => adminCommands.includes(cmd.name))
            .forEach(cmd => console.log(`- ${cmd.name}`));
        
        console.log('\nCommandes utilisateur :');
        data.filter(cmd => !adminCommands.includes(cmd.name))
            .forEach(cmd => console.log(`- ${cmd.name}`));
            
    } catch (error) {
        console.error('Erreur lors du déploiement des commandes :', error);
        console.error(error);
    }
})(); 