/**
 * Template for environment variables
 * Copy this file to a .env file in the root directory and replace the values
 */

module.exports = {
    // Configuration of environment variables for the level system
    
    // Role IDs for each level
    roles: {
        // Create these roles on your server and add their IDs here
        // Then add them to your .env file
        ROLE_ID_NOVICE: "NOVICE_ROLE_ID",
        ROLE_ID_DISCIPLE: "DISCIPLE_ROLE_ID",
        ROLE_ID_DEVOTEE: "DEVOTED_ROLE_ID",
        ROLE_ID_ENLIGHTENED: "ENLIGHTENED_ROLE_ID",
        ROLE_ID_BLESSED: "BLESSED_ROLE_ID", 
        ROLE_ID_SAINT: "SAINT_ROLE_ID"
    },
    
    // Channel ID for level notifications (optional)
    LEVEL_CHANNEL_ID: "LEVEL_CHANNEL_ID",
    
    // Instructions for setting up the level system
    setupInstructions: `
        1. Create roles on your Discord server (Server Settings > Roles)
           - Novice (level 1)
           - Disciple (level 5)
           - Devoted (level 10)
           - Enlightened (level 15)
           - Blessed (level 25)
           - Saint (level 40)
        
        2. Get the ID of each role (right-click on the role > Copy ID)
        
        3. Add these IDs to your .env file as follows:
           ROLE_ID_NOVICE=123456789012345678
           ROLE_ID_DISCIPLE=123456789012345678
           ROLE_ID_DEVOTEE=123456789012345678
           ROLE_ID_ENLIGHTENED=123456789012345678
           ROLE_ID_BLESSED=123456789012345678
           ROLE_ID_SAINT=123456789012345678
        
        4. (Optional) Create a dedicated channel for level notifications
           and add its ID to your .env file:
           LEVEL_CHANNEL_ID=123456789012345678
    `
}; 