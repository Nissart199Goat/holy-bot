const mysql = require('mysql2/promise');

class Database {
    constructor() {
        this.connection = null;
        this.isConnected = false;
    }

    async connect() {
        try {
            // Configuration de connexion MySQL PebbleHost
            this.connection = await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                port: process.env.DB_PORT || 3306,
                // Options importantes pour PebbleHost
                ssl: false,
                connectTimeout: 60000
            });

            this.isConnected = true;
            console.log('✅ Connecté à la base de données MySQL');
            
            // Initialiser les tables
            await this.initializeTables();
            
        } catch (error) {
            console.error('❌ Erreur de connexion à la base de données:', error);
            this.isConnected = false;
        }
    }

    async initializeTables() {
        try {
            // Table pour la configuration des serveurs
            await this.connection.execute(`
                CREATE TABLE IF NOT EXISTS server_config (
                    guild_id VARCHAR(20) PRIMARY KEY,
                    welcome_channel_id VARCHAR(20),
                    blessing_channel_id VARCHAR(20),
                    ticket_category_id VARCHAR(20),
                    ticket_channel_id VARCHAR(20),
                    level_channel_id VARCHAR(20),
                    voice_creator_channel VARCHAR(20),
                    voice_category_channel VARCHAR(20),
                    autorole_id VARCHAR(20),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);

            // Table pour les niveaux des utilisateurs
            await this.connection.execute(`
                CREATE TABLE IF NOT EXISTS user_levels (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id VARCHAR(20) NOT NULL,
                    guild_id VARCHAR(20) NOT NULL,
                    xp INT DEFAULT 0,
                    level INT DEFAULT 1,
                    last_message TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    UNIQUE KEY unique_user_guild (user_id, guild_id)
                )
            `);

            // Table pour les demandes de prière
            await this.connection.execute(`
                CREATE TABLE IF NOT EXISTS prayer_requests (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id VARCHAR(20) NOT NULL,
                    guild_id VARCHAR(20) NOT NULL,
                    request_text TEXT NOT NULL,
                    is_anonymous BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Table pour les versets utilisés (daily blessing)
            await this.connection.execute(`
                CREATE TABLE IF NOT EXISTS used_verses (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    verse_index INT NOT NULL,
                    used_date DATE NOT NULL,
                    guild_id VARCHAR(20) NOT NULL,
                    UNIQUE KEY unique_verse_date_guild (verse_index, used_date, guild_id)
                )
            `);

            // Table pour les tickets
            await this.connection.execute(`
                CREATE TABLE IF NOT EXISTS tickets (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    ticket_id VARCHAR(20) UNIQUE NOT NULL,
                    user_id VARCHAR(20) NOT NULL,
                    guild_id VARCHAR(20) NOT NULL,
                    channel_id VARCHAR(20) NOT NULL,
                    subject VARCHAR(255),
                    status ENUM('open', 'closed') DEFAULT 'open',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    closed_at TIMESTAMP NULL
                )
            `);

            // Migration pour ajouter les colonnes voice si elles n'existent pas
            await this.migrateVoiceColumns();
            
            console.log('✅ Tables de base de données initialisées');
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation des tables:', error);
        }
    }

    async migrateVoiceColumns() {
        try {
            // Vérifier si les colonnes voice existent déjà
            const [columns] = await this.connection.execute(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'server_config' 
                AND COLUMN_NAME IN ('voice_creator_channel', 'voice_category_channel')
            `);
            
            const existingColumns = columns.map(col => col.COLUMN_NAME);
            
            // Ajouter voice_creator_channel si elle n'existe pas
            if (!existingColumns.includes('voice_creator_channel')) {
                await this.connection.execute(`
                    ALTER TABLE server_config 
                    ADD COLUMN voice_creator_channel VARCHAR(20) AFTER level_channel_id
                `);
                console.log('✅ Colonne voice_creator_channel ajoutée');
            }
            
            // Ajouter voice_category_channel si elle n'existe pas
            if (!existingColumns.includes('voice_category_channel')) {
                await this.connection.execute(`
                    ALTER TABLE server_config 
                    ADD COLUMN voice_category_channel VARCHAR(20) AFTER voice_creator_channel
                `);
                console.log('✅ Colonne voice_category_channel ajoutée');
            }
        } catch (error) {
            console.error('❌ Erreur lors de la migration des colonnes voice:', error);
        }
    }

    // Méthodes pour la configuration des serveurs
    async getServerConfig(guildId) {
        try {
            const [rows] = await this.connection.execute(
                'SELECT * FROM server_config WHERE guild_id = ?',
                [guildId]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Erreur lors de la récupération de la config:', error);
            return null;
        }
    }

    async updateServerConfig(guildId, config) {
        try {
            const fields = Object.keys(config).map(key => `${key} = ?`).join(', ');
            const values = Object.values(config);
            
            await this.connection.execute(
                `INSERT INTO server_config (guild_id, ${Object.keys(config).join(', ')}) 
                 VALUES (?, ${Object.keys(config).map(() => '?').join(', ')})
                 ON DUPLICATE KEY UPDATE ${fields}`,
                [guildId, ...values, ...values]
            );
            return true;
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la config:', error);
            return false;
        }
    }

    // Méthodes pour les niveaux
    async getUserLevel(userId, guildId) {
        try {
            const [rows] = await this.connection.execute(
                'SELECT * FROM user_levels WHERE user_id = ? AND guild_id = ?',
                [userId, guildId]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Erreur lors de la récupération du niveau:', error);
            return null;
        }
    }

    async updateUserXP(userId, guildId, xpGain) {
        try {
            // Vérifier le cooldown (1 minute)
            const userData = await this.getUserLevel(userId, guildId);
            if (userData) {
                const now = new Date();
                const lastMessage = new Date(userData.last_message);
                const timeDiff = now - lastMessage;
                
                // Si moins d'1 minute s'est écoulée, ne pas donner d'XP
                if (timeDiff < 60000) {
                    return { levelUp: false, cooldown: true };
                }
            }

            await this.connection.execute(
                `INSERT INTO user_levels (user_id, guild_id, xp, last_message) 
                 VALUES (?, ?, ?, NOW())
                 ON DUPLICATE KEY UPDATE 
                 xp = xp + ?, 
                 last_message = NOW()`,
                [userId, guildId, xpGain, xpGain]
            );
            
            // Vérifier si level up
            const updatedUserData = await this.getUserLevel(userId, guildId);
            if (updatedUserData) {
                const newLevel = Math.floor(updatedUserData.xp / 100) + 1;
                if (newLevel > updatedUserData.level) {
                    await this.connection.execute(
                        'UPDATE user_levels SET level = ? WHERE user_id = ? AND guild_id = ?',
                        [newLevel, userId, guildId]
                    );
                    return { levelUp: true, newLevel, totalXP: updatedUserData.xp + xpGain };
                }
            }
            return { levelUp: false };
        } catch (error) {
            console.error('Erreur lors de la mise à jour XP:', error);
            return { levelUp: false };
        }
    }

    // Méthodes pour les demandes de prière
    async addPrayerRequest(userId, guildId, requestText, isAnonymous = false) {
        try {
            const [result] = await this.connection.execute(
                'INSERT INTO prayer_requests (user_id, guild_id, request_text, is_anonymous) VALUES (?, ?, ?, ?)',
                [userId, guildId, requestText, isAnonymous]
            );
            return result.insertId;
        } catch (error) {
            console.error('Erreur lors de l\'ajout de la demande de prière:', error);
            return null;
        }
    }

    // Méthodes pour les versets utilisés
    async isVerseUsedToday(verseIndex, guildId) {
        try {
            const [rows] = await this.connection.execute(
                'SELECT id FROM used_verses WHERE verse_index = ? AND used_date = CURDATE() AND guild_id = ?',
                [verseIndex, guildId]
            );
            return rows.length > 0;
        } catch (error) {
            console.error('Erreur lors de la vérification du verset:', error);
            return false;
        }
    }

    async markVerseAsUsed(verseIndex, guildId) {
        try {
            await this.connection.execute(
                'INSERT IGNORE INTO used_verses (verse_index, used_date, guild_id) VALUES (?, CURDATE(), ?)',
                [verseIndex, guildId]
            );
        } catch (error) {
            console.error('Erreur lors du marquage du verset:', error);
        }
    }

    async getUsedVersesToday(guildId) {
        try {
            const [rows] = await this.connection.execute(
                'SELECT verse_index FROM used_verses WHERE used_date = CURDATE() AND guild_id = ?',
                [guildId]
            );
            return rows.map(row => row.verse_index);
        } catch (error) {
            console.error('Erreur lors de la récupération des versets utilisés:', error);
            return [];
        }
    }

    // Méthodes pour les tickets
    async createTicket(ticketId, userId, guildId, channelId, subject) {
        try {
            await this.connection.execute(
                'INSERT INTO tickets (ticket_id, user_id, guild_id, channel_id, subject) VALUES (?, ?, ?, ?, ?)',
                [ticketId, userId, guildId, channelId, subject]
            );
            return true;
        } catch (error) {
            console.error('Erreur lors de la création du ticket:', error);
            return false;
        }
    }

    async closeTicket(ticketId) {
        try {
            await this.connection.execute(
                'UPDATE tickets SET status = "closed", closed_at = NOW() WHERE ticket_id = ?',
                [ticketId]
            );
            return true;
        } catch (error) {
            console.error('Erreur lors de la fermeture du ticket:', error);
            return false;
        }
    }

    // Méthode pour obtenir le leaderboard
    async getLeaderboard(guildId, limit = 10) {
        try {
            const [rows] = await this.connection.execute(
                'SELECT user_id, xp, level FROM user_levels WHERE guild_id = ? ORDER BY xp DESC LIMIT ?',
                [guildId, limit]
            );
            return rows.map(row => ({
                userId: row.user_id,
                xp: row.xp,
                level: row.level
            }));
        } catch (error) {
            console.error('Erreur lors de la récupération du leaderboard:', error);
            return [];
        }
    }

    async disconnect() {
        if (this.connection) {
            await this.connection.end();
            this.isConnected = false;
            console.log('🔌 Déconnecté de la base de données');
        }
    }
}

module.exports = new Database(); 