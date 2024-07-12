var twit = require('twit');
var fs = require('fs');
require('dotenv').config();

const Bot = new twit({
  consumer_key: process.env.API_KEY,
  consumer_secret: process.env.API_KEY_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000,
});

Bot.get('account/verify_credentials', { skip_status: true })
  .then(() => {
    console.log('Autenticação bem-sucedida');
  })
  .catch((err) => {
    console.log('Erro na autenticação:', err);
  });


try {
  var data = fs.readFileSync('MENSAGEM.json', 'utf-8');
  var message = JSON.parse(data);
  var recipient_screen_name = message.recipient_screen_name;
  var message_text = message.message_text;
} catch (err) {
  console.log('Erro ao carregar a mensagem do arquivo MENSAGEM.json:', err);
  var recipient_screen_name = 'username_destinatario';
  var message_text = 'Mensagem padrão: Erro ao carregar mensagem.';
}

function sendDirectMessage() {
  Bot.get('users/show', { screen_name: recipient_screen_name })
    .then((response) => {
      var recipient_id = response.data.id_str;
      Bot.post('direct_messages/events/new', {
        event: {
          type: 'message_create',
          message_create: {
            target: { recipient_id: recipient_id },
            message_data: { text: message_text },
          },
        },
      })
        .then(() => {
          console.log(`Mensagem direta enviada para @${recipient_screen_name}: ${message_text}`);
        })
        .catch((err) => {
          console.log(`Erro ao enviar mensagem direta para @${recipient_screen_name}:`, err);
        });
    })
    .catch((err) => {
      console.log(`Erro ao obter informações do usuário @${recipient_screen_name}:`, err);
    });
}

sendDirectMessage();
