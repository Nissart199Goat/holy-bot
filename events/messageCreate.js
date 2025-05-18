const config = require('../config');
const { addXP, getUserData } = require('../data/users');
const { getRolesForLevel, checkForNewRole } = require('../data/roles');
const { createEmbed, COLORS } = require('../utils/embeds');

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        // Ignore bot messages to prevent loops
        if (message.author.bot) return;
        
        // Get the content in lowercase for easier pattern matching
        const content = message.content.toLowerCase();
        
        // Auto-responses for specific phrases
        if (content === 'amen' || content.includes('amen')) {
            // React with pray emoji instead of responding to avoid spam
            try {
                await message.react('🙏');
            } catch (error) {
                console.error('Error reacting to message:', error);
            }
        }
        
        // Respond to someone using the Holy tag
        if (content.includes('♱ holy ♱')) {
            try {
                await message.react('♱');
            } catch (error) {
                console.error('Error reacting to message:', error);
            }
        }
        
        // React to cross/holy symbol
        if (content.includes('♱')) {
            try {
                await message.react('✝️');
            } catch (error) {
                console.error('Error reacting to message:', error);
            }
        }
        
        // Système de niveaux - Ajouter de l'XP pour chaque message
        try {
            const userId = message.author.id;
            const guildId = message.guild.id;
            
            // Obtenir le niveau actuel avant d'ajouter XP
            const beforeData = getUserData(userId, guildId);
            const prevLevel = beforeData.level;
            
            // Ajouter entre 15-25 XP par message avec un cooldown d'1 minute
            const xpAmount = Math.floor(Math.random() * 11) + 15; // 15-25 XP
            const leveledUp = addXP(userId, guildId, xpAmount);
            
            // Si l'utilisateur a gagné un niveau
            if (leveledUp) {
                // Obtenir les données mises à jour
                const afterData = getUserData(userId, guildId);
                
                // Vérifier si un nouveau rôle a été débloqué
                const newRole = checkForNewRole(prevLevel, afterData.level);
                
                // Créer un embed pour la montée de niveau
                const levelUpEmbed = createEmbed({
                    title: `Level ${afterData.level} Reached!`,
                    description: `Congratulations ${message.author}! You've reached level ${afterData.level}!\n\n${config.visuals.divider}`,
                    color: COLORS.ACCENT,
                    fields: [
                        {
                            name: 'Current XP',
                            value: `${afterData.xp} / ${afterData.xpForNextLevel} XP`,
                            inline: true
                        }
                    ],
                    footer: 'Keep participating to earn more XP!'
                });
                
                // Ajouter des informations sur le nouveau rôle débloqué si applicable
                if (newRole) {
                    levelUpEmbed.addFields([
                        {
                            name: 'New Role Unlocked!',
                            value: `You've unlocked the **${newRole.name}** role!`,
                            inline: false
                        }
                    ]);
                    
                    // Tenter d'attribuer le nouveau rôle
                    try {
                        const role = message.guild.roles.cache.get(newRole.roleId);
                        if (role) {
                            await message.member.roles.add(role);
                        }
                    } catch (error) {
                        console.error('Erreur lors de l\'attribution du rôle:', error);
                    }
                }
                
                // Envoyer le message de montée de niveau
                // Dans un canal dédié ou en MP pour éviter le spam
                try {
                    // Option 1: Envoyer dans un canal dédié
                    // const levelChannel = message.guild.channels.cache.get('CHANNEL_ID_LEVEL');
                    // if (levelChannel) levelChannel.send({ embeds: [levelUpEmbed] });
                    
                    // Option 2: Envoyer en MP
                    await message.author.send({ embeds: [levelUpEmbed] });
                    
                    // Option 3 (alternative): Envoyer dans le canal actuel mais supprimer après quelques secondes
                    const msg = await message.channel.send({ embeds: [levelUpEmbed] });
                    setTimeout(() => msg.delete().catch(() => {}), 10000); // Supprimer après 10 secondes
                } catch (error) {
                    console.error('Erreur lors de l\'envoi du message de niveau:', error);
                }
            }
        } catch (error) {
            console.error('Erreur dans le système de niveaux:', error);
        }
    },
}; 