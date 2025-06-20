import { CommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";
import { getParam, saveParam } from "../util/params";

export const unregisterCommand = {
    data: new SlashCommandBuilder()
        .setName("unregister")
        .setDescription("remove you from the list"),   

    async execute(interaction: CommandInteraction) {
        const param = getParam()
        param.forEach(async (p: any) => {
            if (p.guild_id === interaction.guildId) {
                if (p.players.some((player: any) => player.discord_id === interaction.user.id)) {
                    p.players = p.players.filter((player: any) => player.discord_id !== interaction.user.id)
                    await interaction.reply({ content: "removed from the list", flags: MessageFlags.Ephemeral })
                    return
                }
                
                await interaction.reply({ content: "you are not in the list :face_with_raised_eyebrow:", flags: MessageFlags.Ephemeral })
                return
            }
        })
        saveParam(param)
    }
}