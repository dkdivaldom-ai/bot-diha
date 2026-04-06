app.post("/", async (req, res) => {
  const msg = req.body.message;
  const numero = req.body.phone;

  if (!msg) return res.sendStatus(200);

  const INSTANCE = "3F136D96B998C2712EFBEE7630C0C065";
  const TOKEN = "57B440ABC2074371D955078C";

  if (msg === "!ping") {
    await fetch(`https://api.z-api.io/instances/${INSTANCE}/token/${TOKEN}/send-text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: numero,
        message: "🏓 Pong!"
      })
    });
  }

  res.sendStatus(200);
});
