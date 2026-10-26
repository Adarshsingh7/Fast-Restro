const Pusher = require('pusher');

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: 'ap2',
  useTLS: true,
});

exports.notify = (req, res) => {
  const { channel, event, data } = req.body;
  console.log({ channel, event, data });
  pusher
    .trigger(channel, event, data)
    .then(() => {
      res.status(200).send('Notification sent');
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error triggering event');
    });
};
