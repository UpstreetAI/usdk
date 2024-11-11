process.on('message', async (message) => {
  const {method, args} = message;
  
  if (method === 'init') {
    const [source] = args;
    try {
      eval(source);
    } catch(err) {
      console.error('worker eval error:', err);
      // process.send({
      //   error: err.stack
      // });
      process.exit(1);
    }
  }
});
