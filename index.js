const fetch = require("node-fetch");
const express = require("express");
const app = express();

app.use(express.json());

// 👑 DONO DO BOT
const DONO = "5533999341904";

app.post("/", async (req, res) => {
  const msg = req.body.text?.message;
  const numero = req.body.phone;

  if (!msg) return res.sendStatus(200);

  const INSTANCE = "3F136D96B998C2712EFBEE7630C0C065";
  const TOKEN = "57B440ABC2074371D955078C";

  // 🔥 FUNÇÃO DE RESPOSTA
  async function responder(texto) {
    await fetch(`https://api.z-api.io/instances/${INSTANCE}/token/${TOKEN}/send-text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: numero,
        message: texto
      })
    });
  }

  // 📜 MENU
  if (msg === "!menu") {
    await responder(`🤖 *BOT DIHA MXKL*

📌 Comandos:
• !ping
• !menu
• !dono
• !ban (somente dono)

🔥 Bot online com sucesso!`);
  }

  // 🏓 PING
  if (msg === "!ping") {
    await responder("🏓 Pong!");
  }

  // 👑 DONO
  if (msg === "!dono") {
    await responder(`👑 Dono: ${DONO}`);
  }

  // 🚫 BAN (só dono)
  if (msg.startsWith("!ban")) {
    if (numero !== DONO) {
      return await responder("❌ Apenas o dono pode usar esse comando!");
    }

    await responder("🚫 Usuário banido (simulação)");
  }

  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log("Bot profissional rodando 🚀");
});
