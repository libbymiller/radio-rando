const appName = window.location.pathname.replace(/\//g, '');
const websocket = createWebsocket();

const main = async () => {

  document.querySelector('#rdio_rando').addEventListener('click', () => (
    sendCommand('start')
  ));

  document.querySelector('#rdio_stop').addEventListener('click', () => (
    sendCommand('stop')
  ));

  document.querySelector('#rdio_volume').addEventListener('change', (e) => (
    sendCommand('volume',{"volume": e.target.value})
  ));


  websocket.subscribe(new RegExp(`${appName}/.*`), ({ topic, payload }) => {
    console.log('Recieved message!', topic, payload);

    // Because the stream takes a few seconds to start 
    // we want to make sure the buttons are not pushed again
    // and violume changes don't make any difference if there is no stream
    if (topic.includes("ready")) {
      console.log("READY!!");
    }
  });


  websocket.ready.then(() => {
    console.log('Websocket connected');

    websocket.publish({
      topic: `${appName}/event/ready`,
      payload: { msg: 'External app ready!' }
    });
  });


  // Subscribe to all websocket events, from everything
  // useful for debugging sometimes

  websocket.subscribe(/.*/, function ({ topic, payload }) {
      console.log('Received a WebSocket message', { topic, payload });
  });


  const sendCommand = (topic, payload = {}) => {
    websocket.publish({ topic: `${appName}/command/${topic}`, payload });
  };

  console.log('External app loaded');
};

main();
