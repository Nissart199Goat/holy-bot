const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed, COLORS } = require('../utils/embeds');
const config = require('../config');
const verses = require('../data/verses');
const database = require('../database');

// Fonction pour obtenir un verset non utilisé
async function getUnusedVerse(guildId) {
    try {
        const usedVersesToday = await database.getUsedVersesToday(guildId);
        const unusedVerses = verses.filter((verse, index) => !usedVersesToday.includes(index));
        
        // Si tous les versets ont été utilisés aujourd'hui, prendre un verset aléatoire
        if (unusedVerses.length === 0) {
            const randomIndex = Math.floor(Math.random() * verses.length);
            return { verse: verses[randomIndex], index: randomIndex };
        }
        
        // Sélectionner un verset aléatoire parmi les non utilisés
        const randomVerse = unusedVerses[Math.floor(Math.random() * unusedVerses.length)];
        const verseIndex = verses.findIndex(v => v.verse === randomVerse.verse);
        
        // Marquer le verset comme utilisé
        await database.markVerseAsUsed(verseIndex, guildId);
        
        return { verse: randomVerse, index: verseIndex };
    } catch (error) {
        console.error('Error getting unused verse:', error);
        // Fallback: retourner un verset aléatoire
        const randomIndex = Math.floor(Math.random() * verses.length);
        return { verse: verses[randomIndex], index: randomIndex };
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bless')
        .setDescription('Share a random Bible verse (Admin only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option => 
            option.setName('user')
                .setDescription('User to bless (optional)')
                .setRequired(false)),
        
    async execute(interaction) {
        // Get target user (if specified)
        const targetUser = interaction.options.getUser('user');
        
        // Get an unused verse
        const { verse } = await getUnusedVerse(interaction.guild.id);
        
        // Create custom message based on whether a user is targeted
        let title, description;
        if (targetUser) {
            title = `Blessing for ${targetUser.username}`;
            description = `${interaction.user} shared a blessing with ${targetUser}:\n\n${config.visuals.divider}\n\n*"${verse.text}"*\n\n${config.visuals.divider}`;
        } else {
            title = 'Daily Blessing';
            description = `${config.visuals.divider}\n\n*"${verse.text}"*\n\n${config.visuals.divider}`;
        }
        
        const embed = createEmbed({
            title: title,
            description: description,
            fields: [
                { 
                    name: 'Reference', 
                    value: `${config.emoji.book} **${verse.verse}**` 
                }
            ],
            footer: 'May this verse bring you peace and inspiration',
            color: COLORS.SECONDARY,
            image: 'https://i.imgur.com/7FXzh2f.png'
        });
        
        await interaction.reply({ embeds: [embed] });
    }
} 