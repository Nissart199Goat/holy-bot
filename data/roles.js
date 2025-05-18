// Definition of roles assigned based on level
// Configure by adding your server's role IDs
const LEVEL_ROLES = [
    { level: 1, roleId: 'ROLE_ID_NOVICE', name: 'Novice' },
    { level: 5, roleId: 'ROLE_ID_DISCIPLE', name: 'Disciple' },
    { level: 10, roleId: 'ROLE_ID_DEVOTEE', name: 'Devoted' },
    { level: 15, roleId: 'ROLE_ID_ENLIGHTENED', name: 'Enlightened' },
    { level: 25, roleId: 'ROLE_ID_BLESSED', name: 'Blessed' },
    { level: 40, roleId: 'ROLE_ID_SAINT', name: 'Saint' }
];

/**
 * Get the next role to be obtained based on level
 * @param {number} currentLevel - User's current level
 * @returns {Object|null} - Next role to obtain or null if none
 */
function getNextRole(currentLevel) {
    for (const role of LEVEL_ROLES) {
        if (role.level > currentLevel) {
            return role;
        }
    }
    return null; // Maximum level reached
}

/**
 * Get all roles the user should have at their current level
 * @param {number} currentLevel - User's current level
 * @returns {Array} - List of role IDs
 */
function getRolesForLevel(currentLevel) {
    return LEVEL_ROLES
        .filter(role => role.level <= currentLevel)
        .map(role => role.roleId);
}

/**
 * Get the last unlocked role
 * @param {number} currentLevel - User's current level
 * @returns {Object|null} - Last unlocked role or null if none
 */
function getCurrentRole(currentLevel) {
    let highestRole = null;
    
    for (const role of LEVEL_ROLES) {
        if (role.level <= currentLevel) {
            highestRole = role;
        } else {
            break;
        }
    }
    
    return highestRole;
}

/**
 * Check if a user has unlocked a new role
 * @param {number} previousLevel - Previous level
 * @param {number} currentLevel - Current level
 * @returns {Object|null} - New unlocked role or null if none
 */
function checkForNewRole(previousLevel, currentLevel) {
    return LEVEL_ROLES.find(
        role => role.level > previousLevel && role.level <= currentLevel
    );
}

module.exports = {
    LEVEL_ROLES,
    getNextRole,
    getRolesForLevel,
    getCurrentRole,
    checkForNewRole
}; 