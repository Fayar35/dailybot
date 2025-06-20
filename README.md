# dailybot-bun

scrap https://osu.ppy.sh/rankings/daily-challenge/ to know who havent played the daily


config.json structure :
```json
{
	"token": "",
    "client_id": "",
    "guildId": ""
}
```

param.json structure :
```json
[
    {
        "channel_id": "",
        "guild_id": "",
        "players": [
            {
                "osu_id": "",
                "discord_id": "",
                "username": "",
                "times": [
                    //numbers from 1 to 23
                    3,
                    5
                ]
            },
        ]
    }
]
```

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```
