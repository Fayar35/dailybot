import { CommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";
import { getParam } from "../util/params";

export const schedulingCommand = {
    data: new SlashCommandBuilder()
        .setName("scheduling")
        .setDescription("see your registered times"),

    async execute(interaction: CommandInteraction) {
        const param = getParam()
        
        param.forEach(async (p: any) => {
            if (p.guild_id === interaction.guildId) {
                if (p.players.some((player: any) => player.discord_id === interaction.user.id)) {
                    let player = p.players.find((player: any) => player.discord_id === interaction.user.id)
                    await interaction.reply({ content: `you are registered at ${player.times.map((t: number) => `${24-t} UTC`).join(", ")}`, flags: MessageFlags.Ephemeral })
                } else {
                    await interaction.reply({ content: "you are not in the registered :(", flags: MessageFlags.Ephemeral })
                }
            }
        })
    }
}