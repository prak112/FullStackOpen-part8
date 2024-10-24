// Import necessary modules
const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { GraphQLError } = require('graphql')
const { v1: uuid } = require('uuid')

// Sample data
let persons = [
  {
    name: "Madam Pikachu",
    phone: "040-123543",
    street: "Tapiolankatu 5 A",
    city: "Espoo",
    id: "3d594650-3436-11e9-bc57-8b80ba54c431"
  },
  {
    name: "Bulbasaur Jr.",
    phone: "040-432342",
    street: "Malminkaari 10 A",
    city: "Helsinki",
    id: '3d599470-3436-11e9-bc57-8b80ba54c431'
  },
  {
    name: "Venasaur Jr.",
    street: "Nallemäentie 22 C",
    city: "Helsinki",
    id: '3d599471-3436-11e9-bc57-8b80ba54c431'
  },
]

// Schema : define data types and relationships
// Query : define what requests are valid
// Mutation : define POST request to add contact
const typeDefs = `
  type Address {
    street: String!
    city: String! 
  }

  type Person {
    name: String!
    phone: String
    address: Address!
    id: ID!
  }

  enum YesNo {
    YES
    NO
  }

  type Query {
    personCount: Int!
    allPersons(phone: YesNo): [Person!]!
    findPerson(name: String!): Person
  }

  type Mutation {
    addPerson(
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person
  }
`


// Resolvers : define response function/structure of Query
const resolvers = {
  Query: {
    personCount: () => persons.length,
    allPersons: (root, args) => {
      if(!args.phone){
        return persons
      }
      const byPhone = (person) => 
        args.phone === 'YES' ? person.phone : !person.phone
      return persons.filter(byPhone)
    },
    findPerson: (root, args) =>
      persons.find(p => p.name === args.name)
  },
  /**
   * DEBUGGED:
   * ApolloServer defines default Resolver which is based on schema,
   * Self-defined Resolver - if data in the database is structured differently than in the schema. 
   * For ex. custom 'address' field in Person object
   */
  Person: {
    address: (root) => {
      return {
        street: root.street,
        city: root.city
      }
    }
  },

  Mutation: {
    addPerson: (root, args) => {
      if(persons.find(p => p.name === args.name)){
        throw new GraphQLError('Contact already exists. Add a unique name.',{
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.name
            }
          }
        )
      }

      const person = { ...args, id: uuid() }
      persons.concat(person)
      return person
    } 
  }
}


// Apollo Server : Heart of the application
const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})