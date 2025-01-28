require('dotenv').config();
const { monitorTwitter } = require('./twitter');

monitorTwitter().catch((error) => {
  console.error('❌ Error crítico:', error);
});