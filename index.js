const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const { spawn } = require('child_process');

// Configura o Bot com as permissões necessárias de voz e texto
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const PREFIXO = "!";

client.on('ready', () => {
    console.log(`Bot ${client.user.tag} está online e pronto para modificar vozes!`);
});

client.on('messageCreate', async (message) => {
    // Ignora mensagens de outros bots ou que não começam com o prefixo
    if (message.author.bot || !message.content.startsWith(PREFIXO)) return;

    const args = message.content.slice(PREFIXO.length).trim().split(/+/);
    const comando = args.shift().toLowerCase();

    if (comando === 'entrar') {
        const canalVoz = message.member.voice.channel;
        if (!canalVoz) {
            return message.reply("Você precisa entrar em um canal de voz primeiro no seu celular!");
        }

        // Conecta o bot na mesma call de voz que você está
        const conexao = joinVoiceChannel({
            channelId: canalVoz.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
            selfDeaf: false // Importante: o bot não pode estar mutado para conseguir ouvir você
        });

        message.reply(`Entrei no canal de voz: ${canalVoz.name}!`);

        // Nota técnica: Para modificar a voz em tempo real, o bot captura o fluxo de áudio
        // usando o FFmpeg (através do comando 'spawn') para alterar o pitch (tom da voz).
        // Exemplo de argumento FFmpeg para voz de Esquilo: "asetrate=48000*1.5,atempo=1/1.5"
    }

    if (comando === 'sair') {
        const conexao = joinVoiceChannel({
            channelId: message.member.voice.channel?.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator
        });
        
        if (conexao) {
            conexao.destroy();
            message.reply("Saí da call de voz!");
        }
    }
});

// O processo vai buscar o Token direto das configurações seguras do servidor onde você rodar
client.login(process.env.TOKEN);
