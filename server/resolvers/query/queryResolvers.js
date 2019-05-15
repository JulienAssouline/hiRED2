const authenticate = require('../authenticate')
const { createSelectQuery } = require('../makeQuery')
const axios = require('axios')
const Fuse = require('fuse.js')

module.exports = {
	Query: {
		async getUser(parent, input, { req, app, postgres }) {
			try {
				const selectAllUsers = {
					text: "SELECT * FROM hired.users WHERE github_access_token !=''",
				}
				const allUsers = await postgres.query(selectAllUsers)
				return allUsers.rows
			} catch (error) {
				console.log('Could not find any user! ', error)
			}
		},

		async getUserPortfolio(parent, input, { req, app, postgres }) {
			try {
				let user_id = input.user_id

				// Build query string to SELECT * in all rows in porftolio table where user_id = input.user_id
				const getUserPortfolioQuery = createSelectQuery(
					['*'],
					'hired.portfolio',
					'user_id',
					user_id
				)

				// Run query with query string and get the goods
				const portfolio = await postgres.query(getUserPortfolioQuery)

				return {
					message: `Successfully retreived ${user_id}'s portfolio.`,
					portfolio: portfolio.rows,
				}
			} catch (e) {
				console.log('Error in getUserPortfolio: ', e.message)
				throw e.message
			}
		},

		async getMentors(parent, input, { req, app, postgres }) {
			let getAllMentors
			let results
			const fullnameSearch = input.fullnameSearch
			const program_name = input.getPrograms
			if (program_name) {
				const getProgram = {
					text: 'SELECT * FROM hired.programs WHERE name = $1',
					values: [program_name],
				}
				const programs = await postgres.query(getProgram)
				const userProgram = {
					text: 'SELECT * FROM hired.program_users WHERE program_id = $1',
					values: [programs.rows[0].id],
				}
				const users = await postgres.query(userProgram)
				let user_id = users.rows.map(d => d.user_id)
				getAllMentors = {
					text: `SELECT fullname, email, role, campus, location, current_job, avatar, status, user_id, hired.mentors.id AS mentor_id
                          FROM hired.users
                          INNER JOIN hired.mentors
                          ON hired.mentors.user_id = hired.users.id
                          WHERE hired.users.id = $1 OR hired.users.id = $2
                          `,
					values: user_id,
				}
				results = await postgres.query(getAllMentors)
			} else {
				getAllMentors = {
					text: `SELECT fullname, email, role, campus, location, current_job, avatar, status, user_id, hired.mentors.id AS mentor_id
                        FROM hired.users
                        INNER JOIN hired.mentors
                        ON hired.mentors.user_id = hired.users.id
                        `,
				}
				results = await postgres.query(getAllMentors)
			}
			if (fullnameSearch) {
				var options = {
					shouldSort: true,
					threshold: 0.6,
					location: 0,
					distance: 100,
					maxPatternLength: 32,
					minMatchCharLength: 1,
					keys: ['fullname'],
				}
				const fuse = new Fuse(results.rows, options) // "list" is the item array
				const result = fuse.search(fullnameSearch)
				return result
			}
			return results.rows
		},

		async githubInfo(parent, { input }, { req, app, postgres }) {
			const userId = authenticate(app, req)
			const getGithubInfo = {
				text: 'SELECT github_access_token FROM hired.users WHERE id=$1',
				values: [userId],
			}
			const postgresResponse = await postgres.query(getGithubInfo)
			const access_token = postgresResponse.rows[0].github_access_token
			const result = await axios({
				url: 'https://api.github.com/graphql',
				method: 'post',
				data: {
					query: `
            query {
              viewer{
                name
                repositories(last: 1){
                  nodes {
                    name
                    createdAt
                    updatedAt
                    description
                    url
                    stargazers{
                      totalCount
                    }
                  }
                }
              }
            }
          `,
				},
				headers: { Authorization: `token ${access_token}` },
			})
			return {
				name: result.data.data.viewer.name,
				repositories: result.data.data.viewer.repositories.nodes,
			}
		},
		async listMyDribbbles(parent, _, { app, req, postgres }) {
			try {
				let userId = authenticate(app, req)
				// let userId = 4
				// getting the userId dribbble_access_token
				let psql = {
					text: 'SELECT dribbble_access_token FROM hired.users where id = $1;',
					values: [userId],
				}
				let query = await postgres.query(psql)
				let myAccessToken = query.rows[0].dribbble_access_token
				let dribbbleJson = await axios.get(
					'https://api.dribbble.com/v2/user/shots?access_token=' + myAccessToken
				)
				return dribbbleJson.data
			} catch (e) {
				console.log('Sorry! This returned an error of: ', e.message)
				throw e.message
			}
		},
	},
}
