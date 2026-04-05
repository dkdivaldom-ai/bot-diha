const express = require("express");
const app = express();

app.use(express.json());

app.post("/", async (req, res) => {
  const msg = req.body.text?.message;
  const numero = req.body.phone;

  if (!msg) return res.sendStatus(200);

  if (msg === "!ping") {
    console.log("Ping recebido");
  }

  if (msg === "!menu") {
    console.log("Menu enviado");
  }

  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log("Bot rodando 🚀");
});
