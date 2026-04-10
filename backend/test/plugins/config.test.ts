import { test } from 'node:test'
import * as assert from 'node:assert'

import Fastify from 'fastify'
import configPlugin from '../../src/plugins/config'

test('config plugin decorates fastify with validated defaults', async (t) => {
  process.env.NODE_ENV = 'test'
  delete process.env.APP_NAME

  const fastify = Fastify()
  void fastify.register(configPlugin)
  await fastify.ready()

  t.after(() => void fastify.close())

  assert.equal(fastify.config.appName, 'Raket API')
  assert.equal(fastify.config.nodeEnv, 'test')
  assert.equal(fastify.config.port, 3000)
  assert.equal(fastify.config.databaseUrl, 'postgres://postgres:postgres@127.0.0.1:5432/raket')
  assert.equal(fastify.config.redisUrl, 'redis://127.0.0.1:6379')
})
