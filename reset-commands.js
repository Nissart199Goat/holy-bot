const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Créer un tableau pour stocker les données des commandes
const commands = [];

// Charger les commandes depuis les fichiers js
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Ajouter au tableau si la commande est valide
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    } else {
        console.log(`[WARNING] La commande dans ${filePath} n'a pas les propriétés "data" ou "execute" requises.`);
    }
}

// Initialize REST API client
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log(`Réinitialisation de ${commands.length} commandes...`);

        // Étape 1: Supprimer toutes les commandes existantes
        console.log('Suppression des commandes existantes...');
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: [] }
        );
        console.log('Commandes supprimées avec succès.');

        // Étape 2: Déployer les nouvelles commandes
        console.log('Déploiement des nouvelles commandes...');
        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );
        console.log(`Succès! ${data.length} commandes ont été réinitialisées.`);
    } catch (error) {
        console.error('Erreur lors de la réinitialisation des commandes:', error);
    }
})(); 