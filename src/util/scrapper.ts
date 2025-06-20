import { sleep } from 'bun'
import { JSDOM } from 'jsdom'

export class Score {
    player: number
    score: number
    tries: number
    accuracy: number
    ranking: number
}

export class MapInfo {
    image: string
    artist: string
    name: string
    diffName: string
}

export class Player {
    osu_id: string
    username: string
    discord_id: string
}

export const getUserScore = async (players: Player[][], 
                                    scoreFound: ((player: Player, score: Score, index: number) => void)[], 
                                    scoreNotFound: ((player: Player) => void)[], 
                                    day?: String) => {
    if (day === undefined) {
        day = getCurrentDay()
    }

    let index = 1
    let usersFound: number[] = [];
    for (let i=0; i<players.length; i++) usersFound.push(1);
    let usersNotFound: Player[][] = players

    while(true) {
        console.log("...searching for players' scores page " + index)
        const response = await fetch("https://osu.ppy.sh/rankings/daily-challenge/" + day + "?page=" + index + "#scores")
        const html = await response.text()
        
        const dom = new JSDOM(html)
        const document = dom.window.document

        const scores = document.querySelectorAll(".ranking-page-table__row")
        if (scores.length === 0) {
            console.log("score length == 0, response status : " + response.status)
            if (response.status == 503) {
                index--;
            } else {   
                usersNotFound.forEach((players, index) => {
                    players.forEach(player => {
                        scoreNotFound[index](player)
                    })
                })
                return
            }
        }
        
        for(let i = 0; i < scores.length; i++) {
            const scoreElements = scores[i].querySelectorAll(".ranking-page-table__column")
            const data_user_id = scoreElements[1].querySelector("a[data-user-id]").getAttribute('data-user-id').trim()

            usersNotFound.forEach((players, index) => {
                players.forEach(player => {
                    if(data_user_id === player.osu_id) {
                        let score: Score = {   
                            ranking: scoreElements[0].innerHTML.trim(),
                            accuracy: scoreElements[2].innerHTML.trim(),
                            tries: scoreElements[3].innerHTML.trim(),
                            score: scoreElements[4].innerHTML.trim(),
                            player: null
                        }
                        
                        scoreFound[index](player, score, usersFound[index])
                        usersFound[index] += 1
                        usersNotFound[index] = usersNotFound[index].filter(p => p.osu_id !== player.osu_id)
                    }
                })
            })
        }
        index++;
    }
}

const getCurrentDay = () => {
    const now = new Date()

    const day = now.getUTCDate().toString().padStart(2, '0');
    const month = (now.getUTCMonth() + 1).toString().padStart(2, '0'); 
    const year = now.getUTCFullYear();

    return `${year}-${month}-${day}`
} 

export const getMapInfo = async (day?: String): Promise<MapInfo> => {
    if (day === undefined) {
        day = getCurrentDay()
    }

    let returnMapInfo = new MapInfo()

    const response = await fetch("https://osu.ppy.sh/rankings/daily-challenge/" + day)
    const html = await response.text()
    console.log(html)
    const dom = new JSDOM(html)
    const document = dom.window.document

    const titleElement = document.querySelector('.beatmapset-panel__info-row--title a');
    const artistElement = document.querySelector('.beatmapset-panel__info-row--artist a');
    const difficultyElement = document.querySelector('.beatmapset-status');

    returnMapInfo.name = titleElement ? titleElement.textContent.trim() : 'N/A';
    returnMapInfo.artist = artistElement ? artistElement.textContent.replace('par ', '').trim() : 'N/A';
    returnMapInfo.diffName = difficultyElement ? difficultyElement.textContent.trim() : 'N/A';
/*
    const coverElement = document.querySelector('.beatmapset-panel__cover-col--info .beatmapset-cover');
    returnMapInfo.image = 'N/A';
    if (coverElement) {
        const bgStyle = coverElement.style.getPropertyValue('--bg');
        const match = bgStyle.match(/url\("(.+?)"\)/);
        if (match) {
            returnMapInfo.image = match[1];
        }
    }*/

    return returnMapInfo
}