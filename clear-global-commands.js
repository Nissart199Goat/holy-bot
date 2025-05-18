const { REST, Routes } = require('discord.js');
require('dotenv').config();

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('Suppression des commandes...');
    
    // Supprimer toutes les commandes globales
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: [] }
    );
    console.log('Commandes globales supprimées.');

    // Supprimer toutes les commandes du serveur
    if (process.env.GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: [] }
      );
      console.log('Commandes du serveur supprimées.');
    }

    console.log('Toutes les commandes ont été supprimées avec succès.');
  } catch (error) {
    console.error('Erreur lors de la suppression des commandes:', error);
    console.error(error);
  }
})(); 