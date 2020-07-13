const cheerio = require('cheerio');
const request = require('request');
const { Canvas } = require('canvas-constructor');
const { registerFont, createCanvas } = require('canvas');
const fsn = require('fs-nextra');

async function get(req, res) {
    res.setHeader('Content-Type', 'image/png');

    let steamID64 = req.query.id;

    let steamLink;
    request({
        method: 'GET',
        url: `https://superiorservers.co/api/profile/${steamID64}`,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36'
        },
        json: true
    }, (err, res, body) => {
        if (err) return console.error(err);

        // Playtime >>>>>>>>>>>>>>>>>>>>>>>>>
        let playtime = Number(body.Badmin.PlayTime) / 60 / 60;
        playtime = Math.floor(playtime)
        // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

        // Rank >>>>>>>>>>>>>>>>>>>>>>>>>>>>>
        let special = false;
        let rankWeight = {
            'Special': 0,
            'Root': 1,
            'Sudo Root': 2,
            'Council': 3,
            'Super Admin': 4,
            'Double Admin': 5,
            'Content Creator': 6,
            'Admin': 7,
            'Moderator': 8,
            'VIP': 9,
            'User': 10
        };
        let ranks = [];
        let drpRank = body.Badmin.Ranks['DarkRP & Zombies'];
        let cwrpRank = body.Badmin.Ranks['CWRP'];
        let milrpRank = body.Badmin.Ranks['MilRP'];
        if (special) ranks.push(0);
        ranks.push(rankWeight[drpRank]);
        ranks.push(rankWeight[cwrpRank]);
        ranks.push(rankWeight[milrpRank]);
        let highestRankWeight = Math.min(...ranks);
        let rank = Object.keys(rankWeight).find(key => rankWeight[key] === highestRankWeight);
        // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

        // Basic Info >>>>>>>>>>>>>>>>>>>>>>>
        let name = body.Badmin.Name;
        steamLink = body.SteamURL;

        let money = "112";
        if (money.length > 3 && money !== null) money = `$${money.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
        if (money === null) money = '$0';

        let karma = body.DarkRP.Karma;
        if (karma === null) karma = '0';

        let org = body.DarkRP.OrgName;
        let orgColor = body.DarkRP.OrgColor;
        if (org = null) {
            org = 'No Organization';
            orgColor = "#ffffff";
        }
        // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

        // Font Sizing & Placement >>>>>>>>>>
        registerFont('../../assets/font/signature.ttf', {family: 'signature'});
        let nameSize = "13";
        let nameEntryX = 177;
        let nameEntryY = 30;
        if(name.length > 22 && name.length < 26) nameSize = "11";
        if(name.length > 26 && name.length < 31) nameSize = "9";
        if(name.length > 31 && name.length < 40) nameSize = "7";
        if(name.length > 40) nameSize = "5";
        // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

        // Image Processing >>>>>>>>>>>>>>>>>
        let cardImage = await fsn.readFile(`../../assets/img/${rank}-Card.png`);
        let finalCard = new Canvas(741, 176)
              .addImage(cardImage, 0, 0, 741, 176)
              .setTextFont(`${nameSize}px signature`)
              .setColor("#ffffff")
              .addText(name, nameEntryX, nameEntryY)
              .toBuffer();
        res.send(finalCard)
        return res.end();
        // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

        // Steam Avatar >>>>>>>>>>>>>>>>>>>>> 
        // It seems it doesn't fit so maybe I'll use it later or something
        /*
        request({
            method: 'GET',
            url: steamLink,
            headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36'}
        }, (err, res, body) => {
            if (err) return console.error(err);
            let $ = cheerio.load(body);
            let avatarHTML = $('.playerAvatarAutoSizeInner');
            let avatarURLReg = /(?=\")\S+\/avatars\/\S+(?<=\")/gm;
            let avatar = avatarURLReg.exec(avatarHTML)[0].replace(/\"/gm, '');
        });
        */
        // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    });
    // ==========================================
}

module.exports = { get };