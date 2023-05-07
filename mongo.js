const mongoose = require('mongoose')

if (process.argv.length < 3 || process.argv.length === 4 || process.argv.length > 5) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://kiiro:${password}@cluster0.ofyjgxs.mongodb.net/PhonebookApp?retryWrites=true&w=majority`

mongoose.connect(url)

const phonebookSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Phonebook = mongoose.model('Phonebook', phonebookSchema)

if (process.argv.length === 3) {
  console.log('phonebook:')
  Phonebook.find({}).then(result => {
    result.forEach(phonebook => {
      console.log(`${phonebook.name} ${phonebook.number}`)
    })
    mongoose.connection.close()
  })
} else if (process.argv.length === 5) {
  const phonebook = new Phonebook({
    name: process.argv[3],
    number: process.argv[4],
  })

  phonebook.save().then(() => {
    console.log(`added ${phonebook.name} ${phonebook.number} to phonebook`)
    mongoose.connection.close()
  })
}
