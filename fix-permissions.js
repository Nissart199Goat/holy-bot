const fs = require('fs');
const path = require('path');
const { REST, Routes, PermissionFlagsBits } = require('discord.js');
require('dotenv').config();

// Liste des commandes qui devraient être admin-only
const adminCommands = [
    'bless',
    'config',
    'rules',
    'booster',
    'tag',
    'ticket'
];

// Initialiser le client REST API
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// Récupérer toutes les commandes actuelles
(async () => {
    try {
        console.log('Récupération des commandes actuelles...');
        const currentCommands = await rest.get(
            Routes.applicationCommands(process.env.CLIENT_ID)
        );
        console.log(`${currentCommands.length} commandes récupérées.`);

        // Parcourir chaque commande
        for (const command of currentCommands) {
            const commandName = command.name;
            console.log(`Vérification de la commande: ${commandName}`);

            // Si cette commande devrait être admin-only
            if (adminCommands.includes(commandName)) {
                console.log(`  ► Définition des permissions admin pour: ${commandName}`);
                
                // Mettre à jour les permissions
                command.default_member_permissions = PermissionFlagsBits.Administrator.toString();
                
                // Mettre à jour la commande
                await rest.patch(
                    Routes.applicationCommand(process.env.CLIENT_ID, command.id),
                    { body: command }
                );
                console.log(`  ✓ Permissions admin appliquées pour: ${commandName}`);
            } else {
                console.log(`  ✓ Pas besoin de modifier: ${commandName}`);
            }
        }

        console.log('Toutes les permissions ont été mises à jour avec succès!');
    } catch (error) {
        console.error('Erreur lors de la mise à jour des permissions:', error);
    }
})(); 