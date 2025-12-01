// Auto-import all location event files in /townLocations
// Only works if your build system supports require.context or similar

const context = require.context('./townLocations', false, /\.js$/);

const townLocationEvents = {};

context.keys().forEach(key => {
  // filename: './blacksmith.js' -> 'Blacksmith'
  const loc = key.replace('./', '').replace('.js', '');
  // Capitalize first letter for standardization
  const locationName = loc.charAt(0).toUpperCase() + loc.slice(1);
  townLocationEvents[locationName] = context(key).events || context(key).default || context(key);
});

export default townLocationEvents;
