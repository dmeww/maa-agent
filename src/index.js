import Agent from "./agent/index.js";


const agent = await new Agent().init()

await agent.run()

