import { CommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";
import { getParam, saveParam } from "../util/params";

export const possibleTimeLeft = [1, 3, 5, 7, 9, 11, 13, 15]

export const registerCommand = {
    data: new SlashCommandBuilder()
        .setName("register")
        .setDescription("add your profile to the list")
        .addNumberOption(option => 
            option.setName('osu_id')
                .setDescription('your osu! id')
                .setRequired(true)
        )
        .addNumberOption(option => {
            option.setName('time_left')
                .setDescription("be ping when it remains X hours")
                .setRequired(true)   

            possibleTimeLeft.forEach(t => option.addChoices({
                name: `${t} hours left (at ${24-t}H UTC)`,
                value: t
            }))

            return option
        }),

    async execute(interaction: CommandInteraction) {
        const param = getParam()
        param.forEach(async (p: any) => {
            if (p.guild_id === interaction.guildId) {
                const t = interaction.options.get("time_left")?.value

                if (p.players.some((player: any) => player.discord_id === interaction.user.id)) {
                    let player = p.players.find((player: any) => player.discord_id === interaction.user.id)
                    
                    if (player.times.some((time: Number) => time === t)) {
                        await interaction.reply({ content: "you are already scheduled at this time", flags: MessageFlags.Ephemeral })
                        return
                    }
                    
                    player.times.push(t)
                    await interaction.reply({ content: "added a new schedule", flags: MessageFlags.Ephemeral })
                    return
                }

                p.players.push({
                    "osu_id": interaction.options.get('osu_id')?.value?.toString(),
                    "discord_id": interaction.user.id,
                    "username": interaction.user.displayName,
                    "times": [t]
                })
                
                await interaction.reply({ content: "added!!!", flags: MessageFlags.Ephemeral })
                return
            }
        })
        saveParam(param)
    }
}