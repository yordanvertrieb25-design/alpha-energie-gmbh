const originalExit = process.exit;
process.exit = function(code) {
  console.log('PROCESS.EXIT CALLED WITH', code);
  console.log(new Error().stack);
  originalExit.call(this, code);
};
process.on('beforeExit', () => {
  console.log('BEFORE EXIT EVENT');
});
require('./server.js');
