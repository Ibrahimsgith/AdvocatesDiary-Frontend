import { databaseFilePath, seedDefaults } from '../src/database.js'

seedDefaults()

console.log(`SQLite database initialised at ${databaseFilePath}`)
console.log('You can now start the API with "npm --prefix server run dev" or "npm run api:dev" from the repo root.')
