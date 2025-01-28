const { Connection, PublicKey } = require('@solana/web3.js');
const axios = require('axios');
require('dotenv').config();

const connection = new Connection(process.env.HELIUS_RPC);

async function validateContract(address) {
  try {
    // Verifica si es un token válido
    const accountInfo = await connection.getAccountInfo(new PublicKey(address));
    const isToken = accountInfo.owner.equals(new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'));

    if (isToken) {
      // Verifica tiempo de creación
      const creationTime = await getCreationTime(address);
      const currentTime = Math.floor(Date.now() / 1000);
      const isRecent = (currentTime - creationTime) <= 1800; // 30 minutos

      if (isRecent) {
        await sendDiscordAlert(address, creationTime);
      }
    }
  } catch (error) {
    console.error(`❌ Error validando contrato: ${error}`);
  }
}

async function getCreationTime(address) {
  const signatures = await connection.getSignaturesForAddress(new PublicKey(address), { limit: 1 });
  return signatures[0]?.blockTime;
}

async function sendDiscordAlert(address, timestamp) {
  const date = new Date(timestamp * 1000).toLocaleString();
  await axios.post(process.env.DISCORD_WEBHOOK, {
    content: `🚨 **Nuevo Token en Solana!**\n▸ Contrato: \`${address}\`\n▸ Creado el: ${date}\n[Ver en Solscan](https://solscan.io/token/${address})`
  });
  console.log(`✅ Alerta enviada a Discord: ${address}`);
}

module.exports = { validateContract };