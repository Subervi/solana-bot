const { TwitterApi } = require('twitter-api-v2');
require('dotenv').config();

const client = new TwitterApi(process.env.TWITTER_API_KEY);

async function monitorTwitter() {
  // Lista de cuentas influyentes (ej: @SolanaMemeCoin, @Bonkbot_io)
  const influencers = ['usuario1', 'usuario2']; // Reemplaza con los @real de las cuentas

  const stream = await client.v2.stream(`tweets/search/stream?query=from:${influencers.join(',')}`, {
    expansions: ['author_id'],
    'tweet.fields': ['created_at']
  });

  stream.on('data', (tweet) => {
    const text = tweet.data.text;
    const address = extractSolanaAddress(text); // Extraer dirección del tweet
    if (address) {
      console.log(`🔥 Contrato detectado: ${address}`);
      // Llamar a la validación de Solana
      require('./solana').validateContract(address);
    }
  });

  console.log('🚀 Monitoreando Twitter...');
}

function extractSolanaAddress(text) {
  // Usa regex para encontrar direcciones de Solana (ej: 5YZ4...)
  const regex = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;
  const match = text.match(regex);
  return match ? match[0] : null;
}

module.exports = { monitorTwitter };