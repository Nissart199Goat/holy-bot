const { ChannelType, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Chemin vers le fichier de configuration
const configFilePath = path.join(__dirname, '..', 'data', 'serverConfig.json');

// Stockage des canaux temporaires créés
const tempChannels = new Map();

// Fonction pour charger la configuration
function loadConfiguration() {
    try {
        if (fs.existsSync(configFilePath)) {
            const data = fs.readFileSync(configFilePath, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading configuration:', error);
    }
    return null;
}

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState) {
        // Log tout au début pour vérifier si l'événement est capturé
        console.log('==============================================');
        console.log('VOICE STATE UPDATE EVENT DETECTED');
        console.log('==============================================');
        
        try {
            // Logs de débogage - événement vocal détecté
            console.log('Voice state update detected');
            console.log(`User: ${newState.member.user.tag}`);
            console.log(`Old channel: ${oldState.channelId || 'None'}`);
            console.log(`New channel: ${newState.channelId || 'None'}`);
            
            // Charger la configuration
            const serverConfig = loadConfiguration();
            console.log('Server config loaded:', serverConfig ? 'Yes' : 'No');
            
            // ID du canal pour créer des vocaux temporaires
            let creatorChannelId = process.env.VOICE_CREATOR_CHANNEL_ID;
            
            // Utiliser la configuration si disponible
            if (serverConfig && serverConfig.channels && serverConfig.channels.voiceCreator) {
                creatorChannelId = serverConfig.channels.voiceCreator;
                console.log(`Using voiceCreator from config: ${creatorChannelId}`);
            } else {
                console.log(`Using voiceCreator from env: ${creatorChannelId || 'Not set'}`);
            }
            
            // Si l'ID n'est pas configuré, sortir
            if (!creatorChannelId) {
                console.log('No voiceCreator channel configured, exiting');
                return;
            }
            
            // Obtenir la catégorie pour les nouveaux canaux (optionnel)
            let categoryId = null;
            if (serverConfig && serverConfig.channels && serverConfig.channels.voiceCategory) {
                categoryId = serverConfig.channels.voiceCategory;
                console.log(`Using voice category: ${categoryId}`);
            }
            
            // 1. Vérifier si un utilisateur rejoint le canal créateur
            if (newState.channelId === creatorChannelId) {
                console.log(`User joined creator channel (ID: ${creatorChannelId})`);
                const member = newState.member;
                const guild = newState.guild;
                
                // Créer un nom de canal personnalisé
                const channelName = `${member.displayName}'s Channel`;
                console.log(`Attempting to create channel: ${channelName}`);
                
                try {
                    // Créer un nouveau canal vocal
                    const newChannel = await guild.channels.create({
                        name: channelName,
                        type: ChannelType.GuildVoice,
                        parent: categoryId || newState.channel.parentId, // Utiliser la même catégorie que le canal créateur si aucune n'est spécifiée
                        permissionOverwrites: [
                            {
                                id: member.id,
                                allow: [
                                    PermissionFlagsBits.ManageChannels,
                                    PermissionFlagsBits.PrioritySpeaker,
                                    PermissionFlagsBits.Stream,
                                    PermissionFlagsBits.Connect,
                                    PermissionFlagsBits.Speak
                                ]
                            },
                            {
                                id: guild.id, // @everyone
                                allow: [
                                    PermissionFlagsBits.Connect,
                                    PermissionFlagsBits.Speak
                                ]
                            }
                        ]
                    });
                    
                    console.log(`Successfully created channel: ${newChannel.name} (${newChannel.id})`);
                    
                    // Déplacer l'utilisateur dans le nouveau canal
                    await member.voice.setChannel(newChannel);
                    console.log(`Moved user to new channel`);
                    
                    // Enregistrer le canal temporaire pour le nettoyage
                    tempChannels.set(newChannel.id, {
                        ownerId: member.id,
                        createdAt: Date.now()
                    });
                    
                    console.log(`Created temporary voice channel "${channelName}" for ${member.user.tag}`);
                } catch (createError) {
                    console.error('Error creating voice channel:', createError);
                }
            } else {
                console.log(`User did not join creator channel (joined: ${newState.channelId}, creator: ${creatorChannelId})`);
            }
            
            // 2. Vérifier si un utilisateur quitte un canal temporaire
            if (oldState.channelId && tempChannels.has(oldState.channelId)) {
                console.log(`User left temporary channel (ID: ${oldState.channelId})`);
                const channel = oldState.channel;
                
                // Si le canal existe toujours et est vide
                if (channel && channel.members.size === 0) {
                    console.log(`Temporary channel is empty, deleting it`);
                    // Supprimer le canal
                    await channel.delete();
                    
                    // Retirer le canal de la liste
                    tempChannels.delete(oldState.channelId);
                    
                    console.log(`Deleted empty temporary voice channel ${channel.name}`);
                } else {
                    console.log(`Channel still has ${channel?.members.size || 'unknown'} members, not deleting`);
                }
            }
        } catch (error) {
            console.error('Error in voice channel management:', error);
        }
    }
}; 