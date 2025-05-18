const fs = require('fs');
const path = require('path');

// Chemin vers le fichier JSON stockant les données
const DATA_PATH = path.join(__dirname, 'users.json');

// Chargement des données utilisateurs
let userData = {};
try {
    if (fs.existsSync(DATA_PATH)) {
        const data = fs.readFileSync(DATA_PATH, 'utf8');
        userData = JSON.parse(data);
    } else {
        // Créer le fichier s'il n'existe pas
        fs.writeFileSync(DATA_PATH, JSON.stringify({}), 'utf8');
    }
} catch (error) {
    console.error('Erreur lors du chargement des données utilisateurs:', error);
}

// Calcul de l'XP nécessaire pour un niveau spécifique
function xpForLevel(level) {
    // Formule: 100 * (level^1.5)
    return Math.floor(100 * Math.pow(level, 1.5));
}

// Sauvegarde des données
function saveData() {
    try {
        fs.writeFileSync(DATA_PATH, JSON.stringify(userData, null, 2), 'utf8');
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des données:', error);
    }
}

// Ajouter des points d'XP à un utilisateur
function addXP(userId, guildId, xpToAdd) {
    // Créer les entrées si elles n'existent pas
    if (!userData[guildId]) userData[guildId] = {};
    if (!userData[guildId][userId]) {
        userData[guildId][userId] = {
            xp: 0,
            level: 1,
            lastMessageTime: 0
        };
    }

    const user = userData[guildId][userId];
    
    // Vérifier le cooldown (pour éviter le spam)
    const now = Date.now();
    if (now - user.lastMessageTime < 60000) return false; // 1 minute de cooldown
    
    // Ajouter les points et mettre à jour le timestamp
    user.xp += xpToAdd;
    user.lastMessageTime = now;
    
    // Vérifier si l'utilisateur monte de niveau
    const nextLevelXP = xpForLevel(user.level);
    if (user.xp >= nextLevelXP) {
        user.level++;
        saveData();
        return true; // Indique une montée de niveau
    }
    
    saveData();
    return false; // Pas de montée de niveau
}

// Obtenir le niveau et l'XP d'un utilisateur
function getUserData(userId, guildId) {
    // Retourner des données par défaut si l'utilisateur n'existe pas
    if (!userData[guildId] || !userData[guildId][userId]) {
        return { level: 1, xp: 0, xpForNextLevel: xpForLevel(1) };
    }
    
    const user = userData[guildId][userId];
    return {
        level: user.level,
        xp: user.xp,
        xpForNextLevel: xpForLevel(user.level)
    };
}

// Obtenir le classement des utilisateurs
function getLeaderboard(guildId, limit = 10) {
    if (!userData[guildId]) return [];
    
    // Convertir l'objet en tableau pour le tri
    const users = Object.entries(userData[guildId])
        .map(([userId, data]) => ({
            userId,
            ...data
        }))
        .sort((a, b) => b.xp - a.xp)
        .slice(0, limit);
    
    return users;
}

module.exports = {
    addXP,
    getUserData,
    getLeaderboard,
    xpForLevel
}; 