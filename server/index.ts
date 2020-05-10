import express from 'express'
import next from 'next'
import { router } from './routers'
import cors from 'cors'
import apicache from 'apicache'
import redis from 'redis'
const port = parseInt(process.env.PORT || '2323', 10)
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
// @ts-ignore
const REDIS = Boolean(~~process.env.REDIS || 0)
console.log(REDIS, typeof REDIS)
app.prepare().then(() => {
  const server = express()
  const cache =
    process.env.NODE_ENV === 'production'
      ? REDIS
        ? apicache.options({ redisClient: redis.createClient() }).middleware
        : apicache.middleware
      : () => (req, res, next) => next()
  server.use(cors())
  server.use('/_extra', router)
  server.get('/feed', cache('120 minutes'), (req, res) => {
    return handle(req, res)
  })
  server.get('/atom.xml', cache('120 minutes'), (req, res) => {
    return handle(req, res)
  })
  server.get('*', cache('10 minutes'), (req, res) => {
    return handle(req, res)
  })

  server.listen(port, (err: any) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})
