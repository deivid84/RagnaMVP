import 'dotenv/config';
import {mongoose} from 'mongoose';

main().catch(err => console.log(err));

async function main() {
    const {MONGO_USER, MONGO_PASS, MONGO_URL, MONGO_DB} = process.env
    await mongoose.connect(`mongodb+srv://${MONGO_USER}:${MONGO_PASS}@${MONGO_URL}/${MONGO_DB}`);
    const Mvp = mongoose.model('mvp', mvpSchema);

    await Mvp.updateOne({
        name: "Dark Lord"
    },{        
        url: "https://ratemyserver.net/mob_db.php?mob_id=1272&small=1",
        thumbnail: "https://file5s.ratemyserver.net/mobs/1272.gif",
        mapThumbnail: "https://file5s.ratemyserver.net/maps_xl/gl_chyard.gif"
    
    })
    console.log("updated drake")

    await Mvp.updateOne({
        name: "Atroce",
        map: "ra_fild02"
    },{        
        url: "https://ratemyserver.net/mob_db.php?mob_id=1785&small=1",
        thumbnail: "https://file5s.ratemyserver.net/mobs/1785.gif",
        mapThumbnail: "https://file5s.ratemyserver.net/maps_xl/ra_fild02.gif"
    
    })
    console.log("updated atroce1")

    await Mvp.updateOne({
        name: "Atroce",
        map: "ra_fild03"
    },{        
        url: "https://ratemyserver.net/mob_db.php?mob_id=1785&small=1",
        thumbnail: "https://file5s.ratemyserver.net/mobs/1785.gif",
        mapThumbnail: "https://file5s.ratemyserver.net/maps_xl/ra_fild03.gif"
    
    })
    console.log("updated atroce2")

    await Mvp.updateOne({
        name: "Atroce",
        map: "ra_fild04"
    },{        
        url: "https://ratemyserver.net/mob_db.php?mob_id=1785&small=1",
        thumbnail: "https://file5s.ratemyserver.net/mobs/1785.gif",
        mapThumbnail: "https://file5s.ratemyserver.net/maps_xl/ra_fild04.gif"
    
    })
    console.log("updated atroce3")

    await Mvp.updateOne({
        name: "Atroce",
        map: "ve_fild02"
    },{        
        url: "https://ratemyserver.net/mob_db.php?mob_id=1785&small=1",
        thumbnail: "https://file5s.ratemyserver.net/mobs/1785.gif",
        mapThumbnail: "https://file5s.ratemyserver.net/maps_xl/ve_fild02.gif"
    
    })
    console.log("updated atroce4")

    await Mvp.updateOne({
        name: "Atroce",
        map: "ve_fild01"
    },{        
        url: "https://ratemyserver.net/mob_db.php?mob_id=1785&small=1",
        thumbnail: "https://file5s.ratemyserver.net/mobs/1785.gif",
        mapThumbnail: "https://file5s.ratemyserver.net/maps_xl/ve_fild01.gif"
    
    })
    console.log("updated atroce5")
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