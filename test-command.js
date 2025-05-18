const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

// Créer une commande de test basique
const testCommand = new SlashCommandBuilder()
    .setName('test')
    .setDescription('Une commande de test')
    .setDefaultMemberPermissions(null) // Accessible à tous
    .setDMPermission(false); // Pas utilisable en DM

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Déploiement de la commande test...');

        // Déployer uniquement la commande test
        const data = await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: [testCommand.toJSON()] },
        );

        console.log('Commande test déployée avec succès !');
        console.log('Si vous ne voyez pas la commande /test, attendez quelques minutes et vérifiez :');
        console.log('1. Que le bot est bien dans le serveur');
        console.log('2. Que le bot a la permission applications.commands');
        console.log('3. Que vous êtes sur le bon serveur');
    } catch (error) {
        console.error('Erreur lors du déploiement :', error);
    }
})(); 