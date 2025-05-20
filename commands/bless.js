const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed, COLORS } = require('../utils/embeds');
const config = require('../config');
const verses = require('../data/verses');
const fs = require('fs');
const path = require('path');

// Chemin vers le fichier des versets utilisés
const usedVersesPath = path.join(__dirname, '..', 'data', 'usedVerses.json');

// Fonction pour charger les versets utilisés
function loadUsedVerses() {
    try {
        if (fs.existsSync(usedVersesPath)) {
            const data = fs.readFileSync(usedVersesPath, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading used verses:', error);
    }
    return { usedVerses: [], lastReset: null };
}

// Fonction pour sauvegarder les versets utilisés
function saveUsedVerses(data) {
    try {
        fs.writeFileSync(usedVersesPath, JSON.stringify(data, null, 4));
    } catch (error) {
        console.error('Error saving used verses:', error);
    }
}

// Fonction pour obtenir un verset non utilisé
function getUnusedVerse() {
    const data = loadUsedVerses();
    const unusedVerses = verses.filter(verse => !data.usedVerses.includes(verse.verse));
    
    // Si tous les versets ont été utilisés, réinitialiser
    if (unusedVerses.length === 0) {
        data.usedVerses = [];
        saveUsedVerses(data);
        return verses[Math.floor(Math.random() * verses.length)];
    }
    
    // Sélectionner un verset aléatoire parmi les non utilisés
    const randomVerse = unusedVerses[Math.floor(Math.random() * unusedVerses.length)];
    
    // Ajouter le verset à la liste des utilisés
    data.usedVerses.push(randomVerse.verse);
    saveUsedVerses(data);
    
    return randomVerse;
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
        const verse = getUnusedVerse();
        
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