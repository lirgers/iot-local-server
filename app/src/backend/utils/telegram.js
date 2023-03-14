const { BOT_API_KEY, DEFAULT_NOTIFICATION_DESTINATION } = require('configs/telegram.json');
const { exec } = require("child_process");

const telegram = {
    notify: (message, destination = DEFAULT_NOTIFICATION_DESTINATION) => {
        const encodedMessage = encodeURIComponent(message);
        exec(`curl -s "https://api.telegram.org/bot${BOT_API_KEY}/sendMessage?chat_id=${destination}&text=${encodedMessage}"`, null, result => {
            if (result instanceof Error) {
                console.error(result);
            }
        });
    }
};

module.exports = telegram;
