import { CommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";
import { getParam, saveParam } from "../util/params";

export const unregisterCommand = {
    data: new SlashCommandBuilder()
        .setName("unregister")
        .setDescription("remove you from the list"),   

    async execute(interaction: CommandInteraction) {
        if (remove_player(interaction.guildId!, interaction.user.id)) {
            await interaction.reply({ content: "removed from the list", flags: MessageFlags.Ephemeral })
        } else {
            await interaction.reply({ content: "you are not in the list :face_with_raised_eyebrow:", flags: MessageFlags.Ephemeral })
        }
    }
}

export function remove_player(guild_id: string, discord_id: string): boolean {
    let changed = false
    const param = getParam()
    param.forEach(async (p: any) => {
        if (p.guild_id === guild_id) {
            if (p.players.some((player: any) => player.discord_id === discord_id)) {
                p.players = p.players.filter((player: any) => player.discord_id !== discord_id)
                changed = true
                return
            }
            
            return
        }
    })
    saveParam(param)
    return changed
}