const { text } = require('micro')
const { MongoClient } = require('mongodb')
const ioredis = require('ioredis')

module.exports = async (req, res) => {
  // ensure that the correct secret was sent with the request
  if ((await text(req)) !== process.env.APP_SECRET) {
    res.end('FAILURE')
  }

  // try connecting to the database specified
  let client
  try {
    client = await MongoClient.connect(
      `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${
        process.env.MONGO_URL
      }:27017`
    )
  } catch (e) {
    console.error(e)
    res.end('FAILURE')
  }

  // get a reference to the klicker database
  const db = client.db(process.env.MONGO_DATABASE)

  // drop all existing data from the database
  await Promise.all(
    ['sessions', 'questioninstances', 'questions', 'tags', 'users']
      .filter(col => !!db[col])
      .map(col => db[col].drop())
  )

  // TODO: perform further database initialization procedures

  // add the initial admin user to the database
  /* await db.collection('users').insertOne({
    email: process.env.INITIAL_ADMIN_EMAIL
  }) */

  // close the mongodb connection
  client.close()

  // return with a successful status code
  return 'SUCCESS'
}
