# Holy Discord Bot

A feature-rich Discord bot for the Holy Guild community, written in JavaScript using discord.js v14 and Node.js. This bot is designed to enhance community engagement, provide spiritual support, and manage server activities.

## Table of Contents
- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Commands](#commands)
- [Features in Detail](#features-in-detail)
- [Customization](#customization)
- [Contributing](#contributing)
- [License](#license)

## Features

### Core Features
- 🎯 Modular command and event system
- ⚡ Slash command support with automatic registration
- 🎨 Beautiful embedded messages with consistent styling
- 🔒 User verification system
- 📜 Bible verse sharing with 30+ inspirational verses
- 🤝 Community guild tag promotion
- 📋 Server rules and information commands
- 👋 Welcome messages for new members

### Advanced Features
- 📊 Activity-based leveling system with role rewards
- 🙏 Prayer request handling system
- 🏆 Server leaderboard
- 🎭 Role management
- 📈 XP tracking and level progression
- 🎉 Level-up notifications

## Requirements

- Node.js 18.0.0 or higher
- Discord.js v14
- A Discord Bot token
- MongoDB (for data persistence)

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/holy-discord-bot.git
   cd holy-discord-bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```env
   # Bot Configuration
   TOKEN=your_discord_bot_token
   CLIENT_ID=your_bot_client_id
   GUILD_ID=your_server_id

   # Role IDs
   VERIFIED_ROLE_ID=role_id_for_verification
   
   # Channel IDs
   PRAYER_CHANNEL_ID=channel_id_for_prayer_requests
   LEVEL_CHANNEL_ID=level_channel_id
   
   # Level System Roles
   ROLE_ID_NOVICE=novice_role_id
   ROLE_ID_DISCIPLE=disciple_role_id
   ROLE_ID_DEVOTEE=devotee_role_id
   ROLE_ID_ENLIGHTENED=enlightened_role_id
   ROLE_ID_BLESSED=blessed_role_id
   ROLE_ID_SAINT=saint_role_id
   ```

4. Deploy slash commands:
   ```bash
   npm run deploy
   ```

5. Start the bot:
   ```bash
   npm start
   ```

## Configuration

The bot can be configured through various files:

- `config.js` - Main configuration file
- `data/verses.js` - Bible verses database
- `data/roles.js` - Role configuration
- `utils/embeds.js` - Embed styling

## Commands

### General Commands
- `/ping` - Check bot latency
- `/help` - View available commands
- `/about` - Information about the bot

### Community Commands
- `/tag` - Encourages users to wear the ♱ Holy ♱ Guild Tag
- `/verify` - Assigns the ♱ role to the user
- `/rules` - Displays server rules
- `/booster` - Shows boosting information and perks

### Spiritual Commands
- `/bless` - Shares a random Bible verse
- `/pray [request]` - Submit a prayer request

### Leveling Commands
- `/level [user]` - Shows your level or another user's level
- `/leaderboard [limit]` - Displays the server's level leaderboard

## Features in Detail

### Leveling System
The bot includes a sophisticated activity-based leveling system:

- **XP Gain**: 15-25 XP per message (1-minute cooldown)
- **Level Formula**: 100 * (level^1.5) XP required per level
- **Role Rewards**:
  - Level 1: Novice
  - Level 5: Disciple
  - Level 10: Dévoué (Devoted)
  - Level 15: Illuminé (Enlightened)
  - Level 25: Béni (Blessed)
  - Level 40: Saint

### Prayer Request System
- Dedicated prayer request channel
- Anonymous prayer submissions
- Prayer request tracking
- Community support features

### Bible Verse System
- 30+ inspirational Bible verses
- Random verse selection
- Beautiful verse presentation
- Easy to add new verses

## Customization

### Adding New Bible Verses
Edit `data/verses.js` to add new verses:
```javascript
{
    verse: "Book Chapter:Verse",
    text: "Verse text here"
}
```

### Modifying Role Rewards
Edit `data/roles.js` to customize level requirements and role assignments.

### Styling Embeds
Modify `utils/embeds.js` to customize the appearance of bot messages.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 
