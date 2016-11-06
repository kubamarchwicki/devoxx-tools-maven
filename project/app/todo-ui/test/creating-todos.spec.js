'use strict'

const expect = require('chai').expect
const path = require('path')
const Pact = require('pact')
const request = require ('request')
const wrapper = require('@pact-foundation/pact-node')

describe('Todos API', () => {
  let url = 'http://localhost'
  let provider

  const port = 1234
  // when using the wrapper, you will need to tell it where to store the logs
  // make sure you the folders created before hand
  const server = wrapper.createServer({
    port: port,
    log: path.resolve(process.cwd(), 'logs', 'mockserver-integration.log'),
    dir: path.resolve(process.cwd(), 'pacts'),
    spec: 2
  })

  after(() => {
    wrapper.removeAllServers()
  });

  afterEach(done => {
    server.delete().then(() => { done() })
  })

  beforeEach(done => {
    server.start().then(() => {
      // in order to use the Verifier, simply pass an object like below
      // it should contain the names of the consumer and provider in normal language
      // you can also use a different port if you have multiple providers
      provider = Pact({ consumer: 'creates-lists-updates-removes-todo', provider: 'Todo API', port: port })
      done()
    })
  })

  describe('creates / lists / removes a Todo', () => {

    const REQ_BODY = {"title":"First todo","order":1,"completed":false}
    const RESP_BODY = [{"id": 1, "title":"First todo","order":1,"completed":false}]
    const REQ_BODY_UPDATE = {"id": 1, "title":"First todo updated","order":1,"completed":true}
    const RESP_BODY_UPDATED = {"id": 2, "title":"First todo updated","order":1,"completed":true}


    // add interactions, as many as needed
    beforeEach(done => {
      provider.addInteraction({
        state: 'Empty list',
        uponReceiving: 'create new todo => POST /api/todos',
        withRequest: {
          method: 'POST',
          path: '/api/todos',
          headers: { 'Accept': 'application/json' },
          body: REQ_BODY
        },
        willRespondWith: {
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        }
      })
      provider.addInteraction({
        state: 'Todo created',
        uponReceiving: 'get all todos => GET /api/todos',
        withRequest: {
          method: 'GET',
          path: '/api/todos',
          headers: { 'Accept': 'application/json' },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: RESP_BODY
        }
      })

      provider.addInteraction({
        state: 'Todo created',
        uponReceiving: 'update todo => PUT /api/todos/1',
        withRequest: {
          method: 'PUT',
          path: '/api/todos/1',
          headers: { 'Accept': 'application/json' },
          body: REQ_BODY_UPDATE
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: RESP_BODY_UPDATED
        }
      })

      provider.addInteraction({
        state: 'Todo created',
        uponReceiving: 'delete a todo => DELETE /api/todos/2',
        withRequest: {
          method: 'DELETE',
          path: '/api/todos/1'
        },
        willRespondWith: {
          status: 204
        }
      }).then(() => done())
    })

    // once test is run, write pact and remove interactions
    afterEach((done) => {
      provider.finalize().then(() => done())
    })

    // and this is how the verification process invokes your request
    // and writes the Pact file if all is well, returning you the data of the request
    // so you can do your assertions
    it('successfully verifies', done => {
      let baseUrl = `${url}:${port}/api/todos`
      request.post({
          url: baseUrl,
          headers: { 'Accept': 'application/json' },
          json: REQ_BODY
        }, (err, res, body) => {
        expect(res.statusCode).to.equal(201);
        request.get({
          url: baseUrl,
          headers: { 'Accept': 'application/json' }
        }, (err, res, body) => {
          expect(res.statusCode).to.equal(200);
          expect(JSON.parse(body)).to.eql(RESP_BODY);
          request.put({
            url: baseUrl + '/1',
            headers: { 'Accept': 'application/json' },
            json: REQ_BODY_UPDATE
          }, (err, res, body) => {
            expect(res.statusCode).to.equal(200);
            expect(body).to.eql(RESP_BODY_UPDATED);
            request.delete(baseUrl + '/1', (err, res, body) => {
              done()
            })
          })
        })
      })
    });
  })

})
