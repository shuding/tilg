if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/production.js')
} else {
  module.exports = require('./dist/development.js')
}
