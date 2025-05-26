const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function deployCommands() {
    try {
        console.log('🚀 DÉPLOIEMENT DES COMMANDES DISCORD');
        console.log('=====================================');
        
        // Vérifier les variables d'environnement
        const token = process.env.TOKEN || process.env.DISCORD_TOKEN;
        const clientId = process.env.CLIENT_ID;
        const guildId = process.env.GUILD_ID;
        
        if (!token) {
            throw new Error('❌ TOKEN manquant dans le fichier .env');
        }
        if (!clientId) {
            throw new Error('❌ CLIENT_ID manquant dans le fichier .env');
        }
        if (!guildId) {
            console.log('⚠️ GUILD_ID manquant - déploiement global (prendra 1h)');
        }
        
        console.log(`🔑 Client ID: ${clientId}`);
        console.log(`🏠 Guild ID: ${guildId || 'Non défini (global)'}`);
        
        // Charger toutes les commandes
        const commands = [];
        const commandsPath = path.join(__dirname, 'commands');
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        
        console.log(`\n📁 Chargement des commandes...`);
        console.log(`📂 Dossier: ${commandsPath}`);
        console.log(`📄 Fichiers trouvés: ${commandFiles.length}`);
        
        for (const file of commandFiles) {
            try {
                const filePath = path.join(commandsPath, file);
                delete require.cache[require.resolve(filePath)]; // Clear cache
                const command = require(filePath);
                
                if ('data' in command && 'execute' in command) {
                    commands.push(command.data.toJSON());
                    console.log(`  ✅ ${command.data.name} - ${command.data.description}`);
                } else {
                    console.log(`  ❌ ${file} - Propriétés manquantes (data/execute)`);
                }
            } catch (error) {
                console.log(`  ❌ ${file} - Erreur: ${error.message}`);
            }
        }
        
        console.log(`\n🎯 Total des commandes valides: ${commands.length}`);
        
        if (commands.length === 0) {
            throw new Error('❌ Aucune commande valide trouvée !');
        }
        
        // Initialiser REST
        const rest = new REST({ version: '10' }).setToken(token);
        
        console.log('\n🔄 Déploiement en cours...');
        
        if (guildId) {
            // Déploiement sur serveur spécifique (RAPIDE)
            console.log('📍 Mode: Déploiement sur serveur spécifique');
            
            // 1. Supprimer les commandes globales (au cas où)
            console.log('🗑️ Suppression des commandes globales...');
            await rest.put(Routes.applicationCommands(clientId), { body: [] });
            console.log('  ✅ Commandes globales supprimées');
            
            // 2. Supprimer les commandes du serveur
            console.log('🗑️ Suppression des commandes du serveur...');
            await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] });
            console.log('  ✅ Commandes du serveur supprimées');
            
            // 3. Déployer les nouvelles commandes sur le serveur
            console.log('📤 Déploiement des nouvelles commandes...');
            const data = await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: commands }
            );
            
            console.log('\n🎉 DÉPLOIEMENT RÉUSSI !');
            console.log(`✅ ${data.length} commandes déployées sur le serveur`);
            console.log('⚡ Les commandes sont disponibles IMMÉDIATEMENT');
            
        } else {
            // Déploiement global (LENT)
            console.log('🌍 Mode: Déploiement global');
            
            // 1. Supprimer toutes les commandes globales
            console.log('🗑️ Suppression des commandes globales...');
            await rest.put(Routes.applicationCommands(clientId), { body: [] });
            console.log('  ✅ Commandes globales supprimées');
            
            // 2. Déployer les nouvelles commandes globalement
            console.log('📤 Déploiement des nouvelles commandes...');
            const data = await rest.put(
                Routes.applicationCommands(clientId),
                { body: commands }
            );
            
            console.log('\n🎉 DÉPLOIEMENT RÉUSSI !');
            console.log(`✅ ${data.length} commandes déployées globalement`);
            console.log('⏰ Les commandes seront disponibles dans ~1 heure');
        }
        
        console.log('\n📋 Commandes déployées:');
        commands.forEach((cmd, index) => {
            console.log(`  ${index + 1}. /${cmd.name} - ${cmd.description}`);
        });
        
        console.log('\n✨ Déploiement terminé avec succès !');
        
    } catch (error) {
        console.error('\n❌ ERREUR LORS DU DÉPLOIEMENT:');
        console.error(error.message);
        console.error('\n🔧 Vérifiez:');
        console.error('  - Votre fichier .env contient TOKEN et CLIENT_ID');
        console.error('  - Votre bot a les permissions nécessaires');
        console.error('  - Vos fichiers de commandes sont valides');
        process.exit(1);
    }
}

// Exécuter le déploiement
deployCommands(); 