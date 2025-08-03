const paypal = require('@paypal/checkout-server-sdk');
require('dotenv').config(); 
const environment = new paypal.core.SandboxEnvironment(
     'AeY_hMOyI3BH0CO-WMatAxnMNOqsF-Q10cna7Pw0CpU7VLWnKagatgmeDBM0DThc1pXnRXxMTVl51hXP', 
     'EGuV4PTON_mw2VHiQ9NLyXppH5-or-EtSa8bPgFOYIVE77FZTw1xR6xWiibqKHpZj3fHvJUyoIvAjwj6' 
);

const client = new paypal.core.PayPalHttpClient(environment);

module.exports = client;