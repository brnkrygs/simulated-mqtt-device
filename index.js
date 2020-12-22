const chalk = require( 'chalk' );
const commander = require( 'commander' );
const inquirer = require( 'inquirer' );

const Device = require( './Device' );

const questions = {
  thingName: {
    type: 'input',
    name: 'thingName',
    message: 'What is the thing name?',
    validate: (given) => given && given.length > 0
  },
  interval: {
    type: 'input',
    name: 'interval',
    message: 'What interval do you want to publish on (milliseconds)?',
    validate: (given) => given && given.length > 0
  },
  broker: {
    type: 'input',
    name: 'broker',
    message: 'What is the AWS IoT broker URL?',
    validate: (given) => given && given.length > 0
  }
};

// Startup
const program = new commander.Command();
let thing;

async function tick(){
  console.log( chalk.yellow( `Tick [${Date.now()}].` ));
  await thing.publish();
  console.log( chalk.blue( `..published` ));
}

// Main handler
async function main(){
  program
    .version('1.0.0')
    .option( '-b, --broker <broker>', 'URL for IoT broker' )
    .option( '-i, --interval <interval>', 'Interval for message publish' )
    .option( '-t, --thing-name <thingName>', 'Unique thingname for AWS IoT Device Registry' );

  program.parse( process.argv );

  let thingName = program.thingName || process.env.THING_NAME;
  if( !thingName) 
    thingName = (await inquirer.prompt([questions.thingName])).thingName;

  let broker = program.broker || process.env.BROKER ;
  if( !broker )
    broker = (await inquirer.prompt([questions.broker])).broker;

  let interval = program.interval || process.env.INTERVAL ;
  if( !interval )
    interval = (await inquirer.prompt([questions.interval])).interval;

  console.log( chalk.green( 'Starting up..' ));
  console.log( chalk.blue( 'Thing name: ', thingName ));  
  console.log( chalk.blue( 'Interval (milliseconds): ', interval ));  
  console.log( chalk.blue( 'Broker URL: ', broker ));

  console.log( chalk.blue( 'Connecting as thing...' ));
  thing = new Device( thingName, broker );
  await thing.connect();
  console.log( chalk.blue( '...thing connected.' ));
  console.log( chalk.blue( 'Starting publish intervals.' ));

  setInterval( tick, interval );
}

// Entry point. Node does not (yet) support top-level await, so use promise
main()
  .then( () => {
    console.log( chalk.green( '..Finished' ))
  })
  .catch( err => console.error( chalk.red( 'Top level error:', err )));
