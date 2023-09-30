import 'dotenv/config';
import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js'
import { mongoose } from 'mongoose';
import { DateTime } from 'luxon';
import { CronJob } from 'cron';

const RAGNA_CHANNEL_ID = "1157135553083482202"
const MVP_BASE_TEXT = "Kafra Corp"
const ROLE_ID = "1157135851650809868"
const SPAWNS_CHANNEL_ID = "1157447295613280266"
const SERVER_ID = "942077345483849781"

const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
] }); 

client.once('ready', async () => {
    console.log('Bot Ready')
    const guild = client.guilds.cache.get(SERVER_ID)
    const channel = guild.channels.cache.get(SPAWNS_CHANNEL_ID)
    let schedulePingMvp = new CronJob('05 * * * * *', async () => {
        await pingMvpRoles(channel)
    })
    schedulePingMvp.start()
})

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.channelId === RAGNA_CHANNEL_ID) { 
        // if (message.content === "clear") {
        //     const channel = message.channel
        //     const messageManager = channel.messages
        //     const messages = await messageManager.fetch({limit: 100})
        //     channel.bulkDelete(messages, true)
        //     return
        // }
        message.channel.send("Started parsing")
        const blocks = message.content.split(MVP_BASE_TEXT)
        if (blocks.shift() === '') {
            for (let block of blocks) {
                const errors = await parseBlock(block)
                for (let error of errors) {
                    console.log(error)
                    message.channel.send(error)
                }
            }
        }
        message.channel.send("Finished parsing")
    }    
    //message.delete()
})

let Mvp
main().catch(err => console.log(err));

async function main() {
    const {MONGO_USER, MONGO_PASS, MONGO_URL, MONGO_DB} = process.env
    await mongoose.connect(`mongodb+srv://${MONGO_USER}:${MONGO_PASS}@${MONGO_URL}/${MONGO_DB}`);
    Mvp = mongoose.model('mvp', mvpSchema);
    await client.login(process.env.DISCORD_TOKEN)    
}

const mvpSchema = new mongoose.Schema({
    name: String,
    respawnTimeMin: Number,
    respawnTimeMax: Number,
    lastDeath: String,
    weakness: String,
    hp: Number,
    map: String,
    spawnDateMin: String,
    spawnDateMax: String,
    url: String,
    thumbnail: String,
    mapThumbnail: String,
});


async function parseBlock(block) {
    console.log(`Block: ${block}`)
    const lines = block.split('\n')
    if (lines.length <= 3) return ["Block doesn't have enough data"]
    lines.shift()
    lines.shift()
    let day
    const dayLine = lines.shift()
    try {        
        day = extractDay(dayLine)
    } catch (e) {
        return [`Failed to parse day in: ${dayLine}`]
    }
    
    const errors = []
    const isToday = (day === 'Today')
    for (let line of lines) {
        if (line === '') continue
        try {
            const {player, mvp, map, time} = extractMvpData(line)
            const error = await updateTimeOfDeath(mvp, map, time, isToday)
            if (error) errors.push(error)
        } catch (e) {
            console.log(e)
            errors.push(`Failed to parse mvp in: ${line}`)
        }
    }
    return errors
}

function extractDay(timeString) {
    console.log(`--Reading line: ${timeString}`)
    const dayExp = /(\w+) at (\d+:\d\d\s\w\w)/
    const [, day, time] = timeString.match(dayExp)
    return day
}

function extractMvpData(mvpString) {
    const mvpExp = /(\w+) killed ([-\w\d\s]+) at (\w+). Time: (\d\d:\d\d)/
    const [, player, mvp, map, time] = mvpString.match(mvpExp)
    return {player, mvp, map, time}
}

async function updateTimeOfDeath(name, map, time, isToday) {    
    const mvpData = await Mvp.findOne({name, map})
    if(mvpData) {
        let now = DateTime.fromISO(time)        
        if (!isToday) now = now.minus({days: 1})
        if (!mvpData.lastDeath || mvpData.lastDeath < now.toISO()){
            mvpData.lastDeath = now.toISO()
            mvpData.spawnDateMin = now.plus({minutes: mvpData.respawnTimeMin})
            mvpData.spawnDateMax = now.plus({minutes: mvpData.respawnTimeMax})
            await mvpData.save()
        }                
        return
    }
    return `Could not find ${name} and ${map} in the database`
}

async function pingMvpRoles(channel) {
    console.log("Ping Triggered")
    const now = DateTime.now()
    //const now = DateTime.fromISO("2023-09-30T02:00:22.000-03:00")
    console.log(now.minus({minutes: 1}).toISO())
    console.log(now.toISO())
    const mvpSpawnMin = await Mvp.find({
        spawnDateMin: {
            $gte: now.minus({minutes: 1}).toISO(),
            $lte: now.toISO()
        }
    })
    for (let mvp of mvpSpawnMin) {
        const embed = generateEmbed(mvp)        
        channel.send(`<@&${ROLE_ID}>`)
        channel.send({embeds: [embed]})
    }
}

function generateEmbed(mvp) {
    const hp = `${mvp.hp}`
    const from = DateTime.fromISO(mvp.spawnDateMin).toLocaleString(DateTime.TIME_24_SIMPLE)
    const to = DateTime.fromISO(mvp.spawnDateMax).toLocaleString(DateTime.TIME_24_SIMPLE)
    const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(`${mvp.name}`)
        .setURL(mvp.url)
        .setDescription(`is spawning in ${mvp.map}`)
        .setThumbnail(mvp.thumbnail)
        .setImage(mvp.mapThumbnail)        
        .addFields(
            { name: "HP", value: hp },
            { name: '\u200B', value: '\u200B' },
            { name: "From", value: from, inline: true },
            { name: "To", value: to, inline: true },
            { name: "Weakness", value: mvp.weakness, inline: true }
        )
        
    return embed
}
