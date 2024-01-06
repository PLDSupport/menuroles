const { Client, GatewayIntentBits } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { EmbedBuilder, ActionRowBuilder, SelectMenuBuilder, StringSelectMenuBuilder } = require('@discordjs/builders');
const { token , guildid , clientid } = require('./config.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const commands = [
  {
    name: 'send-panel',
    description: 'عرض إيمبد مع قائمة منسدلة لتعيين/إزالة الرتب',
  },
];

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(clientid, guildid),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'send-panel') {
    const options = [
      { label: 'اسم الرتبة', value: 'ايدي الرتبة الاولى' },
      { label: 'اسم الرتبة', value: 'ايدي الرتبة التانية' },

    ];

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('select')
        .setPlaceholder('اختر الرتبة')
        .addOptions(options),
    );

    const embed = new EmbedBuilder()
      .setTitle('قائمة الرتب')
      .setDescription('اختر الرتبة المطلوبة:')

    await interaction.reply({
      embeds: [embed],
      components: [row],
    });
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isSelectMenu()) return;

  const selectedRoleId = interaction.values[0];
  const member = interaction.guild.members.cache.get(interaction.user.id);

  if (interaction.customId === 'select') {
    if (member.roles.cache.has(selectedRoleId)) {
      await member.roles.remove(selectedRoleId);
      await interaction.followUp(`تمت إزالة الرتبة بنجاح!`);
    } else {
      await member.roles.add(selectedRoleId);
      await interaction.followUp(`تمت إضافة الرتبة بنجاح!`);
    }
  }
});

client.login(token);