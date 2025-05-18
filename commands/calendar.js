const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed, COLORS } = require('../utils/embeds');
const config = require('../config');
const fs = require('fs');
const path = require('path');

// Calendar data file path
const dataPath = path.join(__dirname, '..', 'data', 'calendar.json');

// Helper function to ensure the data directory exists
function ensureDataDirectoryExists() {
    const dirPath = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

// Helper function to load calendar data
function loadCalendarData() {
    ensureDataDirectoryExists();
    
    if (!fs.existsSync(dataPath)) {
        // Create default calendar with Christian holidays
        const defaultCalendar = {
            events: [
                {
                    name: "Advent Season Begins",
                    date: "2024-12-01",
                    description: "The beginning of the liturgical year and the season of preparation for Christmas.",
                    type: "liturgical"
                },
                {
                    name: "Christmas Day",
                    date: "2024-12-25",
                    description: "Celebration of the birth of Jesus Christ.",
                    type: "major"
                },
                {
                    name: "Epiphany",
                    date: "2025-01-06",
                    description: "Celebration of God's manifestation to the Gentiles through the visit of the Magi.",
                    type: "major"
                },
                {
                    name: "Ash Wednesday",
                    date: "2025-03-05",
                    description: "The beginning of Lent, a 40-day period of fasting and repentance.",
                    type: "liturgical"
                },
                {
                    name: "Palm Sunday",
                    date: "2025-04-13",
                    description: "Commemoration of Jesus's triumphant entry into Jerusalem.",
                    type: "liturgical"
                },
                {
                    name: "Maundy Thursday",
                    date: "2025-04-17",
                    description: "Commemoration of the Last Supper and Jesus washing the disciples' feet.",
                    type: "liturgical"
                },
                {
                    name: "Good Friday",
                    date: "2025-04-18",
                    description: "Remembrance of Jesus's crucifixion and death.",
                    type: "major"
                },
                {
                    name: "Easter Sunday",
                    date: "2025-04-20",
                    description: "Celebration of the resurrection of Jesus Christ.",
                    type: "major"
                },
                {
                    name: "Pentecost",
                    date: "2025-06-08",
                    description: "Commemoration of the Holy Spirit's descent upon the disciples.",
                    type: "major"
                },
                {
                    name: "Trinity Sunday",
                    date: "2025-06-15", 
                    description: "Celebration of the doctrine of the Holy Trinity.",
                    type: "liturgical"
                },
                {
                    name: "All Saints' Day",
                    date: "2025-11-01",
                    description: "Commemoration of all saints and martyrs.",
                    type: "liturgical"
                }
            ],
            communityEvents: []
        };
        
        fs.writeFileSync(dataPath, JSON.stringify(defaultCalendar, null, 2));
        return defaultCalendar;
    }
    
    try {
        const data = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading calendar data:', error);
        return { events: [], communityEvents: [] };
    }
}

// Helper function to save calendar data
function saveCalendarData(data) {
    ensureDataDirectoryExists();
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

// Helper function to format date string
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('calendar')
        .setDescription('View and manage Christian calendar events')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View upcoming Christian events')
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Filter events by type')
                        .setRequired(false)
                        .addChoices(
                            { name: 'All Events', value: 'all' },
                            { name: 'Major Holy Days', value: 'major' },
                            { name: 'Liturgical Events', value: 'liturgical' },
                            { name: 'Community Events', value: 'community' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a new community event')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Name of the event')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('date')
                        .setDescription('Date of the event (YYYY-MM-DD)')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('Description of the event')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a community event')
                .addStringOption(option =>
                    option.setName('event_name')
                        .setDescription('Name of the event to remove')
                        .setRequired(true))),
        
    async execute(interaction) {
        try {
            const subcommand = interaction.options.getSubcommand();
            
            if (subcommand === 'view') {
                await handleViewCalendar(interaction);
            }
            else if (subcommand === 'add') {
                await handleAddEvent(interaction);
            }
            else if (subcommand === 'remove') {
                await handleRemoveEvent(interaction);
            }
        } catch (error) {
            console.error('Error in calendar command:', error);
            await interaction.reply({ 
                content: 'An error occurred while processing the calendar command. Please try again later.',
                ephemeral: true 
            });
        }
    }
};

// Function to handle viewing the calendar
async function handleViewCalendar(interaction) {
    const calendarData = loadCalendarData();
    const today = new Date();
    const filterType = interaction.options.getString('type') || 'all';
    
    // Filter events
    let filteredEvents = [...calendarData.events];
    if (filterType === 'community') {
        filteredEvents = [...calendarData.communityEvents];
    } else if (filterType !== 'all') {
        filteredEvents = calendarData.events.filter(event => event.type === filterType);
    }
    
    if (filterType === 'all' || filterType === 'community') {
        // Add community events if showing all or community
        filteredEvents = [...filteredEvents, ...calendarData.communityEvents];
    }
    
    // Sort by date
    filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Filter to show only future events and events from today
    const upcomingEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= new Date(today.setHours(0, 0, 0, 0));
    });
    
    // Limit to next 10 events
    const eventsToShow = upcomingEvents.slice(0, 10);
    
    if (eventsToShow.length === 0) {
        return interaction.reply({
            content: 'No upcoming events found for the selected filter.',
            ephemeral: true
        });
    }
    
    // Create event list
    const eventFields = eventsToShow.map(event => {
        return {
            name: `${event.name} - ${formatDate(event.date)}`,
            value: event.description
        };
    });
    
    // Create title based on filter
    let title = "Upcoming Christian Calendar Events";
    if (filterType === 'major') {
        title = "Upcoming Major Holy Days";
    } else if (filterType === 'liturgical') {
        title = "Upcoming Liturgical Events";
    } else if (filterType === 'community') {
        title = "Upcoming Community Events";
    }
    
    // Create embed
    const embed = createEmbed({
        title: `${config.emoji.book} ${title}`,
        description: `${config.visuals.divider}\nView upcoming events in our Christian calendar.\n${config.visuals.divider}`,
        fields: eventFields,
        footer: 'Use /calendar add to add community events',
        color: COLORS.SECONDARY
    });
    
    await interaction.reply({ embeds: [embed] });
}

// Function to handle adding an event
async function handleAddEvent(interaction) {
    // Check permissions
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageEvents)) {
        return interaction.reply({
            content: 'You do not have permission to add events.',
            ephemeral: true
        });
    }
    
    const name = interaction.options.getString('name');
    const date = interaction.options.getString('date');
    const description = interaction.options.getString('description');
    
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return interaction.reply({
            content: 'Invalid date format. Please use YYYY-MM-DD.',
            ephemeral: true
        });
    }
    
    // Load calendar data
    const calendarData = loadCalendarData();
    
    // Add new event
    calendarData.communityEvents.push({
        name,
        date,
        description,
        type: 'community',
        addedBy: interaction.user.tag
    });
    
    // Save updated data
    saveCalendarData(calendarData);
    
    // Notify of success
    const embed = createEmbed({
        title: `${config.emoji.check} Event Added`,
        description: `The event has been added to the calendar.`,
        fields: [
            {
                name: 'Event Details',
                value: `**Name:** ${name}\n**Date:** ${formatDate(date)}\n**Description:** ${description}`
            }
        ],
        color: COLORS.SUCCESS
    });
    
    await interaction.reply({ embeds: [embed], ephemeral: true });
    
    // Optionally, announce the new event in a dedicated channel
    const announcementChannelId = process.env.CALENDAR_CHANNEL_ID;
    if (announcementChannelId) {
        const channel = interaction.client.channels.cache.get(announcementChannelId);
        if (channel) {
            const announcementEmbed = createEmbed({
                title: `${config.emoji.announce} New Community Event Added`,
                description: `A new event has been added to our community calendar.`,
                fields: [
                    {
                        name: name,
                        value: `**Date:** ${formatDate(date)}\n**Description:** ${description}`
                    }
                ],
                footer: `Added by ${interaction.user.tag}`,
                color: COLORS.PRIMARY
            });
            
            channel.send({ embeds: [announcementEmbed] });
        }
    }
}

// Function to handle removing an event
async function handleRemoveEvent(interaction) {
    // Check permissions
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageEvents)) {
        return interaction.reply({
            content: 'You do not have permission to remove events.',
            ephemeral: true
        });
    }
    
    const eventName = interaction.options.getString('event_name');
    
    // Load calendar data
    const calendarData = loadCalendarData();
    
    // Find event index
    const eventIndex = calendarData.communityEvents.findIndex(
        event => event.name.toLowerCase() === eventName.toLowerCase()
    );
    
    if (eventIndex === -1) {
        return interaction.reply({
            content: `Could not find a community event with the name "${eventName}".`,
            ephemeral: true
        });
    }
    
    // Store event details for confirmation
    const removedEvent = calendarData.communityEvents[eventIndex];
    
    // Remove event
    calendarData.communityEvents.splice(eventIndex, 1);
    
    // Save updated data
    saveCalendarData(calendarData);
    
    // Notify of success
    const embed = createEmbed({
        title: `${config.emoji.check} Event Removed`,
        description: `The event has been removed from the calendar.`,
        fields: [
            {
                name: 'Removed Event',
                value: `**Name:** ${removedEvent.name}\n**Date:** ${formatDate(removedEvent.date)}`
            }
        ],
        color: COLORS.SUCCESS
    });
    
    await interaction.reply({ embeds: [embed], ephemeral: true });
} 