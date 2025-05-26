# Holy Discord Bot

A feature-rich Discord bot for the Holy Guild community, written in JavaScript using discord.js v14 and Node.js.

## Features

- Modular command and event system
- Slash command support
- Automatic command registration
- Beautiful embedded messages with consistent styling
- User verification system
- Prayer request handling
- Bible verse sharing
- Community guild tag promotion
- Server rules and information commands
- Welcome messages for new members
- **Activity-based leveling system with role rewards**
- **📖 Daily Bible Verses**: Automated daily blessings with 30+ Bible verses
- **🙏 Prayer Requests**: Anonymous and public prayer request system
- **📊 User Leveling**: XP-based leveling system with leaderboards
- **🎫 Support Tickets**: Comprehensive ticket system for community support
- **👋 Welcome System**: Automated welcome messages for new members
- **🎭 Auto Roles**: Automatic role assignment for new members
- **🔊 Voice Channels**: Temporary voice channel creation system
- **⚙️ Configuration**: Flexible server configuration system

## Requirements

- Node.js 18.0.0 or higher
- Discord.js v14
- A Discord Bot token

## Installation

### Local Development

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   # Discord Bot Configuration
   DISCORD_TOKEN=your_discord_bot_token
   CLIENT_ID=your_bot_client_id
   
   # MySQL Database Configuration
   DB_HOST=your_mysql_host
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=your_database_name
   DB_PORT=3306
   ```
4. Deploy slash commands:
   ```
   npm run deploy
   ```
5. Start the bot:
   ```
   npm start
   ```

### PebbleHost Production Deployment

For production deployment on PebbleHost with MySQL, see the detailed guide: [PEBBLEHOST_SETUP.md](PEBBLEHOST_SETUP.md)

## Command List

- `/ping` - Check bot latency
- `/help` - View available commands
- `/tag` - Encourages users to wear the ♱ Holy ♱ Guild Tag
- `/verify` - Assigns the ♱ role to the user
- `/rules` - Displays server rules
- `/bless` - Shares a random Bible verse
- `/about` - Information about the bot
- `/booster` - Shows boosting information and perks
- `/pray [request]` - Submit a prayer request
- `/level [user]` - Shows your level or another user's level
- `/leaderboard [limit]` - Displays the server's level leaderboard
- `/config` - Configure bot settings (Admin only)
- `/migrate` - Migrate data from JSON to MySQL (Admin only)

## Leveling System

The bot includes an activity-based leveling system that rewards members for their participation:

- Members earn XP for sending messages (15-25 XP per message with a 1-minute cooldown)
- XP required for each level increases using the formula: 100 * (level^1.5)
- Members automatically receive role rewards at specific levels:
  - **Level 1**: Novice
  - **Level 5**: Disciple 
  - **Level 10**: Dévoué (Devoted)
  - **Level 15**: Illuminé (Enlightened)
  - **Level 25**: Béni (Blessed)
  - **Level 40**: Saint

Members can check their level progress with `/level` and view the server's leaderboard with `/leaderboard`.

## Customization

- Edit `config.js` to customize bot settings
- Add new Bible verses in `data/verses.js`
- Modify embed styling in `utils/embeds.js`
- Edit role rewards in `data/roles.js`

## License

MIT 

## 🛠️ Configuration

Use the `/config` command to set up your bot:

### Channels Configuration
```
/config channels welcome:#welcome-channel
/config channels blessings:#daily-blessings
/config channels level:#level-announcements
/config channels voice_creator:#join-to-create
/config channels voice_category:Voice Channels Category
/config channels ticket_category:Support Category
/config channels ticket_channel:#create-ticket
```

### Voice Channels System
The bot can create temporary voice channels when users join a specific channel:

1. **Voice Creator Channel**: Set the channel that triggers voice creation
   - When someone joins this channel, a new temporary voice channel is created
   - The user is automatically moved to their new channel
   - They get management permissions for their channel

2. **Voice Category**: Set the category where temporary channels are created
   - All temporary channels will be organized under this category
   - Optional - if not set, uses the same category as the creator channel

**Example Setup:**
```
/config channels voice_creator:#🔊│Join to Create
/config channels voice_category:🎙️ Voice Channels
```

### Roles Configuration
```
/config roles autorole:@Member
```

### View Current Configuration
```
/config view
```

## 📋 Commands

### General Commands
- `/help` - Show all available commands
- `/about` - Information about the bot
- `/ping` - Check bot latency

### Bible & Prayer
- `/bless` - Get a random Bible verse
- `/pray <request>` - Submit a prayer request

### Leveling System
- `/level [user]` - Check user level and XP
- `/leaderboard` - Show server leaderboard

### Community
- `/rules` - Display server rules
- `/tag` - Show guild information
- `/calendar` - View community calendar

### Support
- `/ticket` - Create a support ticket

### Admin Only
- `/config` - Configure bot settings

## 📊 Database

The bot uses MySQL for data persistence:
- **server_config**: Server-specific configuration
- **user_levels**: User XP and level data
- **prayer_requests**: Prayer request submissions
- **used_verses**: Daily blessing verse tracking
- **tickets**: Support ticket management

## 🔧 Environment Variables

Required environment variables:
```
TOKEN=your_discord_bot_token
CLIENT_ID=your_bot_client_id
GUILD_ID=your_server_id (optional, for faster command deployment)

# MySQL Database
DB_HOST=your_mysql_host
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name
``` 