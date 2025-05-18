const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// Commande test simple
const testCommand = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Commande de test - doit être visible par tous')
    .toJSON();

async function resetEverything() {
    try {
        console.log('🔄 Début de la réinitialisation complète...\n');

        // 1. Supprimer toutes les commandes globales
        console.log('1️⃣ Suppression des commandes globales...');
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: [] }
        );
        console.log('✅ Commandes globales supprimées\n');

        // 2. Supprimer toutes les commandes du serveur
        console.log('2️⃣ Suppression des commandes du serveur...');
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: [] }
        );
        console.log('✅ Commandes du serveur supprimées\n');

        // 3. Déployer une seule commande de test
        console.log('3️⃣ Déploiement de la commande test...');
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: [testCommand] }
        );
        console.log('✅ Commande test déployée\n');

        console.log('🎉 Réinitialisation terminée !\n');
        console.log('⚠️ ÉTAPES SUIVANTES IMPORTANTES :');
        console.log('1. Retirez le bot du serveur');
        console.log('2. Réinvitez le bot avec ce lien :');
        console.log(`https://discord.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&permissions=8&scope=bot%20applications.commands`);
        console.log('\n3. Attendez 5 minutes');
        console.log('4. Vérifiez si la commande /ping est visible');
        console.log('\nSi cela ne fonctionne toujours pas, il y a peut-être un problème avec :');
        console.log('- Les variables d\'environnement (TOKEN, CLIENT_ID, GUILD_ID)');
        console.log('- Les permissions du bot sur Discord');
        console.log('- Le cache de Discord (essayez de vous déconnecter/reconnecter)');

    } catch (error) {
        console.error('❌ Erreur lors de la réinitialisation :', error);
    }
}

// Exécuter la réinitialisation
resetEverything(); 