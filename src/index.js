import {Agent} from "./maa/index.js";


const agent = await new Agent().init()

await agent.run()

