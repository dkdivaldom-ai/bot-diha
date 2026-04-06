import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys";
import OpenAI from "openai";
import axios from "axios";
import express from "express";

// servidor pra Railway não dormir
const app = express();
app.get("/", (req, res) => res.send("🤖 Bot online"));
app.listen(3000, () => console.log("🌐 Server ativo"));

// CONFIG DONO
const donoNumero = "5533999341904@s.whatsapp.net";
const donoNome = "Dival Mxkl";

let modoSupremo = true;
let botAtivo = true;

const usuarios = {};
const dinheiro = {};
const xp = {};

// IA (Railway usa variável)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function isDono(msg) {
  return msg.key.participant === donoNumero || msg.key.remoteJid === donoNumero;
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  const sock = makeWASocket({ auth: state });

  sock.ev.on("creds.update", saveCreds);

  // BOAS-VINDAS
  sock.ev.on("group-participants.update", async (update) => {
    const { id, participants, action } = update;

    if (action === "add") {
      for (let user of participants) {
        await sock.sendMessage(id, {
          text: `🟢⚡ Bem-vindo @${user.split("@")[0]} ⚡🟢`,
          mentions: [user]
        });
      }
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const texto =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text;

    if (!texto) return;

    const from = msg.key.remoteJid;
    const user = msg.key.participant || msg.key.remoteJid;

    if (!botAtivo && !isDono(msg)) return;

    // REGISTRO
    if (!usuarios[user] && !texto.startsWith("/registrar")) {
      return sock.sendMessage(from, {
        text: "🧾 Use /registrar seu_nome"
      });
    }

    if (texto.startsWith("/registrar")) {
      const nome = texto.replace("/registrar", "").trim();

      usuarios[user] = { nome, dinheiro: 0, xp: 0 };

      return sock.sendMessage(from, {
        text: `✅ Registrado como ${nome}`
      });
    }

    // XP + DINHEIRO
    if (!xp[user]) xp[user] = 0;
    if (!dinheiro[user]) dinheiro[user] = 0;

    xp[user] += 5;
    dinheiro[user] += 2;

    // ANTI LINK
    if (texto.includes("http")) {
      if (!isDono(msg) && !modoSupremo) {
        await sock.groupParticipantsUpdate(from, [user], "remove");
        return sock.sendMessage(from, { text: "🚫 Link proibido!" });
      }
    }

    // DONO PRIORIDADE
    if (isDono(msg)) {
      const resposta = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: "Responda o dono com prioridade máxima." },
          { role: "user", content: texto }
        ]
      });

      return sock.sendMessage(from, {
        text: `👑 ${donoNome}\n\n${resposta.choices[0].message.content}`
      });
    }

    // MENU
    if (texto === "/menu") {
      return sock.sendMessage(from, {
        text: `🟢 DIHA MXKL BOT

/menu
/ia
/img
/saldo
/rank`
      });
    }

    // IA
    if (texto.startsWith("/ia")) {
      const pergunta = texto.replace("/ia", "").trim();

      const res = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [{ role: "user", content: pergunta }]
      });

      return sock.sendMessage(from, {
        text: res.choices[0].message.content
      });
    }

    // IMAGEM IA
    if (texto.startsWith("/img")) {
      const prompt = texto.replace("/img", "").trim();

      const img = await openai.images.generate({
        model: "gpt-image-1",
        prompt,
        size: "1024x1024"
      });

      return sock.sendMessage(from, {
        text: img.data[0].url
      });
    }

    // SALDO
    if (texto === "/saldo") {
      return sock.sendMessage(from, {
        text: `💰 ${dinheiro[user]} coins`
      });
    }

    // RANK
    if (texto === "/rank") {
      const top = Object.entries(dinheiro)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      let txt = "🏆 Ranking\n";
      top.forEach((u, i) => {
        txt += `${i + 1}. ${u[0]} - ${u[1]}\n`;
      });

      return sock.sendMessage(from, { text: txt });
    }

    // IA AUTOMÁTICA
    const resposta = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: texto }]
    });

    await sock.sendMessage(from, {
      text: resposta.choices[0].message.content
    });
  });
}

startBot();
