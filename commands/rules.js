const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed, COLORS } = require('../utils/embeds');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rules')
        .setDescription('Display server rules')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        
    async execute(interaction) {
        // Illustrative image for rules - you can update this URL if needed
        const rulesImage = 'https://i.imgur.com/7FXzh2f.png'; // Decorative rules image
        
        // Holy Rules content as provided
        const holyRules = `

**Be Respectful**
– Treat everyone with kindness and courtesy.
– No harassment, insults, trolling, or hate speech of any kind.

**No Discrimination**
– Zero tolerance for racism, sexism, homophobia, transphobia, ableism, or any other forms of bigotry.

**Keep It Safe-for-Work**
– All channels are SFW unless explicitly marked otherwise.
– No pornographic, excessively violent, or gory content.

**No Spamming or Self-Promotion**
– Don't post repetitive messages, emojis, or large blocks of text.
– Advertising (other servers, services, social media) requires prior staff approval.

**Use Channels Properly**
– Read channel descriptions and keep discussions on-topic.
– Off-topic chats belong in designated channels only.

**Respect Privacy**
– Do not share personal or identifying information (yours or others').
– No doxxing or "raid" coordination.

**Voice Channel Etiquette**
– Use push-to-talk or keep background noise to a minimum.
– No music bots or soundboards without permission.

**Follow Staff Directions**
– Moderators and admins have final say on all decisions.
– If you disagree, DM a staff member calmly—do not argue in public channels.

**No Exploits or Hacks**
– Any form of cheating, exploiting, or encouraging illicit behavior is prohibited.

**Discord Terms of Service**
– You must abide by Discord's [Community Guidelines](https://discord.com/guidelines) and [Terms of Service](https://discord.com/terms).

**Have Fun & Stay Holy**
– Engage positively, welcome newcomers, and help build our sacred community!

*Violation of these rules may result in a warning, mute, kick, or ban depending on severity. If you see someone breaking the rules or need help, please contact a staff member.*
`;
        
        const embed = createEmbed({
            title: `Holy Rules`,
            description: holyRules,
            footer: 'Holy Guild • Server Rules',
            color: COLORS.PRIMARY,
        });
        
        await interaction.reply({ embeds: [embed] });
    }
}; 