import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import * as dotenv from "dotenv";
import obterCotacao from "./utils/obterCotacao.js";
import moedas from "./utils/moedas.js";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.login(process.env.TOKEN);

client.on("ready", () => {
  console.log(`Bot online como ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith("!") || message.author.bot) return;

  const comando = message.content.slice(1).toLowerCase();

  if (comando === "comandos" || comando === "help") {
    const comandosList = Object.keys(moedas)
      .map((moeda) => `\`!${moeda}\``)
      .join(", ");

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle("📜 Lista de Comandos Disponíveis")
      .setDescription(
        `Aqui estão todas as moedas que você pode consultar com o bot:\n${comandosList}`
      )
      .setFooter({
        text: "Use o comando seguido do nome ou abreviação da moeda para obter a cotação.",
        iconURL: "https://i.imgur.com/wo9dHth.png",
      })
      .setTimestamp();

    return message.channel.send({ embeds: [embed] });
  }

  const moeda = moedas[comando];

  if (!moeda) {
    const comandosList = Object.keys(moedas)
      .map((moeda) => `\`!${moeda}\``)
      .join(", ");

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle("📜 Comandos Não Reconhecido")
      .setDescription(
        `Desculpe, moeda não reconhecida. Aqui estão os comandos válidos:\n${comandosList}`
      )
      .setFooter({
        text: "Use o comando seguido do nome ou abreviação da moeda para obter a cotação.",
        iconURL: "https://i.imgur.com/wo9dHth.png",
      })
      .setTimestamp();

    return message.channel.send({ embeds: [embed] });
  }

  try {
    const data = await obterCotacao(moeda);

    const moedaCotacao = data[moeda + "BRL"];
    const compra = moedaCotacao.bid || "Não disponível";
    const alta = moedaCotacao.high || "Não disponível";
    const baixa = moedaCotacao.low || "Não disponível";
    const ultimaAtualizacao = moedaCotacao.create_date || "Desconhecida";

    const embed = new EmbedBuilder()
      .setColor(0x1d9bf0)
      .setTitle(`💵 Cotação do ${moeda}`)
      .setDescription(
        `Veja as informações mais recentes sobre o ${comando.toUpperCase()} em relação ao real.`
      )
      .addFields(
        { name: "🏦 Compra", value: `R$ ${compra}`, inline: true },
        { name: "📈 Alta", value: `R$ ${alta}`, inline: true },
        { name: "📉 Baixa", value: `R$ ${baixa}`, inline: true },
        {
          name: "📅 Última Atualização",
          value: ultimaAtualizacao,
          inline: false,
        }
      )
      .setThumbnail(
        "https://img.etimg.com/thumb/msid-115367485,width-300,height-225,imgsize-137106,resizemode-75/nasa-space-strategy-to-be-changed-by-elon-musk-donald-trump-details-here.jpg"
      )
      .setFooter({
        text: "Fonte: AwesomeAPI",
        iconURL: "https://i.imgur.com/wo9dHth.png",
      })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  } catch (error) {
    console.error("Erro ao buscar a cotação:", error);
    message.channel.send(
      "Desculpe, não consegui obter a cotação no momento. 😢"
    );
  }
});
