require('dotenv').config()
const express = require('express')
var morgan = require('morgan')
const Phonebook = require('./models/phonebook')

const app = express()
app.use(express.json())
app.use(express.static('build'))
// app.use(morgan('tiny'))
app.use(morgan((tokens, req, res) =>
  [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    JSON.stringify(req.body)
  ].join(' ')
))

const cors = require('cors')
app.use(cors())

// let persons = [
//   {
//     'id': 1,
//     'name': 'Arto Hellas',
//     'number': '040-123456'
//   },
//   {
//     'id': 2,
//     'name': 'Ada Lovelace',
//     'number': '39-44-5323523'
//   },
//   {
//     'id': 3,
//     'name': 'Dan Abramov',
//     'number': '12-43-234345'
//   },
//   {
//     'id': 4,
//     'name': 'Mary Poppendieck',
//     'number': '39-23-6423122'
//   }
// ]

app.get('/info', (request, response) => {
  Phonebook.find({}).then(phonebooks => {
    response.send(`
      <p>Phonebook has info for ${phonebooks.length} people</p>
      <p>${new Date()}</p>
    `)
  })
})

app.get('/api/persons', (request, response) => {
  Phonebook.find({}).then(phonebooks => {
    response.json(phonebooks)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  // const id = Number(request.params.id)
  // const note = persons.find(note => note.id === id)
  //
  // if (note) {
  //   response.json(note)
  // } else {
  //   response.status(404).end()
  // }

  Phonebook.findById(request.params.id)
    .then(phonebook => {
      if (phonebook) {
        response.json(phonebook)
      } else {
        response.status(404).end()
      }
    })
    // .catch(error => {
    //   console.log(error)
    //   response.status(400).send({ error: 'malformatted id' })
    // })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  // if (!body.name) {
  //   return response.status(400).json({
  //     error: 'name missing'
  //   })
  // }
  // if (persons.find(person => person.name === body.name)) {
  //   return response.status(400).json({
  //     error: 'name must be unique'
  //   })
  // }
  // if (!body.number) {
  //   return response.status(400).json({
  //     error: 'number missing'
  //   })
  // }

  if (body.name === undefined) {
    return response.status(400).json({ error: 'name missing' })
  }
  if (body.number === undefined) {
    return response.status(400).json({ error: 'number missing' })
  }

  const phonebook = new Phonebook({
    id: Math.random() * Math.pow(10, 17),
    name: body.name,
    number: body.number
  })

  phonebook.save()
    .then(savedPhonebook => {
      response.json(savedPhonebook)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  // const id = Number(request.params.id)
  // persons = persons.filter(note => note.id !== id)

  // response.status(204).end()

  Phonebook.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  // const body = request.body

  // const phonebook = {
  //   number: body.number
  // }

  // Phonebook.findByIdAndUpdate(request.params.id, phonebook, { new: true })
  //   .then(updatedPhonebook => {
  //     response.json(updatedPhonebook)
  //   })
  //   .catch(error => next(error))

  const { number } = request.body

  Phonebook.findByIdAndUpdate(
    request.params.id,
    { number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedPhonebook => {
      response.json(updatedPhonebook)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}
// this has to be the last loaded middleware.
app.use(errorHandler)

// const PORT = process.env.PORT || 3001
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})