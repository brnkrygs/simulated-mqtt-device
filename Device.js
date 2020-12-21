const mqtt = require( 'async-mqtt' );
const fs = require( 'fs' );
const path = require( 'path' );
const message1 = require( './messages/1.json' );

class Device {

  constructor( thingName, brokerDNS ){
    this.thingName = thingName;
    this.brokerDNS = brokerDNS;

    this.client = null;
  }

  async connect(){
    const caPath = 'credentials/AmazonRootCA1.pem.txt',
    const certPath = `credentials/${this.thingName}/${this.thingName}-certificate.pem.crt`,
    const keyPath = `credentials/${this.thingName}/${this.thingName}-private.pem.key`

    const options = {
      clientId: this.thingName,
      ca: fs.readFileSync( caPath ),
      cert: fs.readFileSync( certPath),
      key: fs.readFileSync( keyPath )
    };

    this.client = await mqtt.connectAsync( broker, options );
  }

  async publish(){

    if( !this.client )
      throw new Error( 'client is falsy. Connected first.' );

    let message = message1.payload;
    if( typeof( message ) !== 'string' )
      message = JSON.stringify( message );

    // Hydrate thingname in topic if needed
    let topic = message1.topic;
    topic = topic.replace( /__THINGNAME__/g, this.thingName );

    await this.client.publish( message1.topic, message );
  }

  async disconnect(){
    if( this.client !== null )
      await this.client.end();
  }
}

module.exports = Device;
