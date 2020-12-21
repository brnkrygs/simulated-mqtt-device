const chalk = require( 'chalk' );
const commander = require( 'commander' );
const inquirer = require( 'inquirer' );

const questions = {
  thingName: {
    type: 'input',
    name: 'thingName',
    message: 'What is the thing name?',
    validate: (given) => given && given.length > 0
  },
  broker: {
    type: 'input',
    name: 'broker',
    message: 'What is the AWS IoT broker DNS name?',
    validate: (given) => given && given.length > 0
  }
};

// Startup
const program = new commander.Command();

// Main handler
async function main(){
  program
    .version('1.0.0')
    .option( '-b, --broker <broker>', 'DNS name for IoT broker' )
    .option( '-t, --thing-name <thingName>', 'Unique thingname for AWS IoT Device Registry' );

  program.parse( process.argv );

  let thingName = program.thingName;
  if( !thingName) 
    thingName = (await inquirer.prompt([questions.thingName])).thingName;

  let broker = program.broker || process.env.BROKER ;
  if( !broker )
    broker = (await inquirer.prompt([questions.broker])).broker;

  console.log( chalk.green( 'Starting up..' ));
  console.log( chalk.blue( 'Thing name: ', thingName ));  
  console.log( chalk.blue( 'Broker Address: ', broker ));  
}

// Entry point. Node does not (yet) support top-level await, so use promise
main()
  .then( () => console.log( chalk.dim.green( '..finished' )))
  .catch( err => console.error( chalk.red( 'Top level error:', err )));
