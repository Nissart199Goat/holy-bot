const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed, COLORS, IMAGES } = require('../utils/embeds');
const config = require('../config');
const verses = require('../data/verses');

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
        
        // Get a random verse
        const randomVerse = verses[Math.floor(Math.random() * verses.length)];
        
        // Create custom message based on whether a user is targeted
        let title, description;
        if (targetUser) {
            title = `Blessing for ${targetUser.username}`;
            description = `${interaction.user} shared a blessing with ${targetUser}:\n\n${config.visuals.divider}\n\n*"${randomVerse.text}"*\n\n${config.visuals.divider}`;
        } else {
            title = 'Daily Blessing';
            description = `${config.visuals.divider}\n\n*"${randomVerse.text}"*\n\n${config.visuals.divider}`;
        }
        
        // Decorative image for the embed
        const bibleImages = [
            'https://i.imgur.com/7FXzh2f.png',  // Cross at sunset
        ];
        
        const randomImage = bibleImages[Math.floor(Math.random() * bibleImages.length)];
        
        const embed = createEmbed({
            title: title,
            description: description,
            fields: [
                { 
                    name: 'Reference', 
                    value: `${config.emoji.book} **${randomVerse.verse}**` 
                }
            ],
            footer: 'May this verse bring you peace and inspiration',
            color: COLORS.SECONDARY,
            image: randomImage
        });
        
        await interaction.reply({ embeds: [embed] });
    }
} 