async function main(){
}

// Node does not yet support top-level await, so use promise style
main()
  .then( () => console.log( chalk.dim.green( '..finished' )))
  .catch( err => console.error( chalk.red( 'Top level error:', err )));
