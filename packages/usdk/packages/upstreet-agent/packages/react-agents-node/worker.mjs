// process.on('message', async (message) => {
//   const {method, args} = message;
  
//   if (method === 'init') {
//     const [source] = args;
//     try {
//       const dataUrl = 'data:text/javascript,' + encodeURIComponent(source);
//       const module = await import(dataUrl);
//       console.log('module', module);
//     } catch(err) {
//       console.error('worker import error:', err);
//       process.send({
//         error: err.stack
//       });
//       process.exit(1);
//     }
//   }
// });
