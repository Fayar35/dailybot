import { REST, Routes } from "discord.js";
import config from '../../config.json';
import { registerCommand } from "../commands/register";
import { schedulingCommand } from "../commands/scheduling";
import { unregisterCommand } from "../commands/unregister";

const commands = [registerCommand, unregisterCommand, schedulingCommand]

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
    try {
        console.log("register les commandes ...")

        await rest.put(
            Routes.applicationCommands(config.client_id),
            { body: commands.map(cmd => cmd.data.toJSON()) }
        )
        
        console.log("register des commandes fini!")
    } catch (error) {
        console.log(`erreur lors de l'eregistrements des commandes : ${error}`)
    }
})()