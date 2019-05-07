const { gql } = require('apollo-server-express')

module.exports = gql`

  scalar Date

  type Query {
    getUser: User,
  }

  type User {
    id: ID!,
    email: String,
    password: String,
    first_name: String,
    last_name: String,
    campus: String,
    mentor: String,
    location: String,
    role: String,
    programs: String,
    current_job: String,
    avatar: String
  }


  type Mutation {
    Appointment(number: Int!, date: Date): AppointmentResponse!
    LinkedIn(user_id: Int!, date_link: Date, feed_id: Int): LinkedInResponse!
  }

  type AppointmentResponse {
    message: String
  }

  type LinkedInResponse {
    message: String
  }

`

