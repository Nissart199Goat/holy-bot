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

## Requirements

- Node.js 18.0.0 or higher
- Discord.js v14
- A Discord Bot token

## Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   TOKEN=your_discord_bot_token
   CLIENT_ID=your_bot_client_id
   GUILD_ID=your_server_id
   VERIFIED_ROLE_ID=role_id_for_verification
   PRAYER_CHANNEL_ID=channel_id_for_prayer_requests
   
   # Level System Roles
   ROLE_ID_NOVICE=novice_role_id
   ROLE_ID_DISCIPLE=disciple_role_id
   ROLE_ID_DEVOTEE=devotee_role_id
   ROLE_ID_ENLIGHTENED=enlightened_role_id
   ROLE_ID_BLESSED=blessed_role_id
   ROLE_ID_SAINT=saint_role_id
   
   # Optional: Level notifications channel
   LEVEL_CHANNEL_ID=level_channel_id
   ```
4. Deploy slash commands:
   ```
   npm run deploy
   ```
5. Start the bot:
   ```
   npm start
   ```

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