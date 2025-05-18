const { SlashCommandBuilder } = require('discord.js');
const { createEmbed, COLORS } = require('../utils/embeds');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Affiche la latence du bot'),
        
    async execute(interaction) {
        await interaction.deferReply();
        
        const sent = await interaction.fetchReply();
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(interaction.client.ws.ping);
        
        // Détermine la qualité de la connexion
        let status, color;
        if (latency < 200) {
            status = 'Excellente';
            color = COLORS.SUCCESS;
        } else if (latency < 500) {
            status = 'Bonne';
            color = COLORS.SECONDARY;
        } else {
            status = 'Lente';
            color = COLORS.ERROR;
        }
        
        const embed = createEmbed({
            title: 'État de la connexion',
            description: `${config.visuals.divider}\n**Qualité de la connexion:** ${status}\n${config.visuals.divider}`,
            fields: [
                { 
                    name: 'Latence du Bot', 
                    value: `${config.emoji.star} **${latency}ms**`, 
                    inline: true 
                },
                { 
                    name: 'Latence de l\'API', 
                    value: `${config.emoji.star} **${apiLatency}ms**`, 
                    inline: true 
                }
            ],
            footer: 'Holy Bot • Vérification de la latence',
            color: color
        });
        
        await interaction.editReply({ embeds: [embed] });
    },
}; 