import Agent from './agent'

const app = new Agent()

await app.init()
app.run()