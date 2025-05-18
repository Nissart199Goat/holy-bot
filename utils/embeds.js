const { EmbedBuilder } = require('discord.js');

// Nouvelles couleurs pour un thème clair et élégant
const COLORS = {
    PRIMARY: '#FFFFFF',    // Blanc pur
    SECONDARY: '#E6BE8A',  // Or clair élégant
    ACCENT: '#D4AF37',     // Or accent original  
    SUCCESS: '#43B581',    // Vert succès
    INFO: '#7289DA',       // Bleu Discord
    ERROR: '#F04747'       // Rouge erreur
};

// Images et icônes
const IMAGES = {
    // Utilisation de liens vers des images plus stables (via Discord CDN)
    LOGO: 'https://cdn.discordapp.com/attachments/1371552029834481668/holy_logo.png', // Remplacez par un lien vers votre logo hébergé sur Discord
    BANNER: 'https://cdn.discordapp.com/attachments/your-channel-id/your-banner-file-id.png', // Remplacez par un lien vers votre bannière hébergée sur Discord
    FOOTER: 'https://cdn.discordapp.com/attachments/your-channel-id/your-footer-file-id.png' // Remplacez par un lien vers votre icône de pied de page hébergée sur Discord
    // Alternative : vous pouvez aussi désactiver temporairement ces images en les commentant
};

/**
 * Crée un embed avec le style visuel amélioré
 * @param {Object} options - Options de l'embed
 * @param {String} options.title - Titre de l'embed
 * @param {String} options.description - Description de l'embed
 * @param {Array} options.fields - Champs de l'embed
 * @param {String} options.thumbnail - URL de la miniature
 * @param {String} options.image - URL de l'image
 * @param {String} options.footer - Texte du pied de page
 * @param {String} options.color - Couleur de l'embed (utilise la couleur primaire par défaut)
 * @param {String} options.url - URL liée au titre de l'embed
 * @param {Object} options.author - Informations de l'auteur
 * @returns {EmbedBuilder} - Embed stylisé
 */
function createEmbed({
    title,
    description,
    fields,
    thumbnail,
    image,
    footer,
    color = COLORS.PRIMARY,
    url,
    author
}) {
    const embed = new EmbedBuilder()
        .setColor(color);
    
    // Titre avec décoration
    if (title) {
        embed.setTitle(`✦ ${title} ✦`);
        if (url) embed.setURL(url);
    }
    
    // Description avec mise en forme
    if (description) {
        embed.setDescription(description);
    }
    
    // Ajouter des champs
    if (fields && fields.length > 0) {
        // Ajouter une ligne vide avant les champs pour une meilleure lisibilité
        embed.addFields(fields.map(field => ({
            name: `┈ ${field.name} ┈`,
            value: field.value,
            inline: field.inline || false
        })));
    }
    
    // Images
    if (thumbnail) {
        embed.setThumbnail(thumbnail);
    } else if (IMAGES.LOGO && IMAGES.LOGO !== 'https://cdn.discordapp.com/attachments/your-channel-id/your-logo-file-id.png') {
        // Logo par défaut uniquement si c'est un lien valide (pas le placeholder)
        embed.setThumbnail(IMAGES.LOGO);
    }
    
    if (image) {
        embed.setImage(image);
    }
    
    // Auteur
    if (author) {
        embed.setAuthor(author);
    }
    
    // Pied de page stylisé
    if (footer) {
        const footerOptions = {
            text: `♱ ${footer} ♱`
        };
        
        // Ajouter l'image du footer seulement si elle est valide
        if (IMAGES.FOOTER && IMAGES.FOOTER !== 'https://cdn.discordapp.com/attachments/your-channel-id/your-footer-file-id.png') {
            footerOptions.iconURL = IMAGES.FOOTER;
        }
        
        embed.setFooter(footerOptions);
    }
    
    // Timestamp pour toujours montrer la date actuelle
    embed.setTimestamp();
    
    return embed;
}

/**
 * Crée un embed de succès
 * @param {String} title - Titre de l'embed
 * @param {String} description - Description de l'embed
 * @returns {EmbedBuilder} - Embed de succès
 */
function createSuccessEmbed(title, description) {
    return createEmbed({
        title: title || 'Succès',
        description,
        color: COLORS.SUCCESS
    });
}

/**
 * Crée un embed d'erreur
 * @param {String} title - Titre de l'embed
 * @param {String} description - Description de l'embed
 * @returns {EmbedBuilder} - Embed d'erreur
 */
function createErrorEmbed(title, description) {
    return createEmbed({
        title: title || 'Erreur',
        description,
        color: COLORS.ERROR
    });
}

/**
 * Crée un embed d'information
 * @param {String} title - Titre de l'embed
 * @param {String} description - Description de l'embed
 * @returns {EmbedBuilder} - Embed d'information
 */
function createInfoEmbed(title, description) {
    return createEmbed({
        title: title || 'Information',
        description,
        color: COLORS.INFO
    });
}

module.exports = {
    createEmbed,
    createSuccessEmbed,
    createErrorEmbed,
    createInfoEmbed,
    COLORS,
    IMAGES
}; 