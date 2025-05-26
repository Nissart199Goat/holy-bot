const { REST, Routes, PermissionFlagsBits } = require('discord.js');
require('dotenv').config();

// Liste des commandes qui devraient être admin-only
const adminCommands = [
    'bless',
    'config',
    'rules',
    'booster',
    'tag'
];

// Les commandes que les utilisateurs normaux devraient pouvoir voir et utiliser
const userCommands = [
    'about',
    'calendar',
    'help',
    'leaderboard',
    'level',
    'ping',
    'pray',
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
            console.log(`Traitement de la commande: ${commandName}`);
            
            // Modifier les permissions selon le type de commande
            if (adminCommands.includes(commandName)) {
                console.log(`  ► Définition des permissions ADMIN pour: ${commandName}`);
                command.default_member_permissions = PermissionFlagsBits.Administrator.toString();
            } 
            else if (userCommands.includes(commandName)) {
                console.log(`  ► Définition des permissions USER pour: ${commandName}`);
                // Définir '0' signifie que tout le monde peut utiliser la commande
                command.default_member_permissions = '0';
            }
            else {
                console.log(`  ⚠ Commande non catégorisée: ${commandName}, définition comme USER`);
                command.default_member_permissions = '0';
            }
            
            // Mettre à jour la commande sur Discord
            await rest.patch(
                Routes.applicationCommand(process.env.CLIENT_ID, command.id),
                { body: command }
            );
            console.log(`  ✓ Permissions appliquées pour: ${commandName}`);
        }

        console.log('Toutes les permissions ont été mises à jour avec succès!');
    } catch (error) {
        console.error('Erreur lors de la mise à jour des permissions:', error);
    }
})(); 