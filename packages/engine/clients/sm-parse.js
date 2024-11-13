var SMParse = function SMParse(str, opts) {
    if (!opts) opts = {};
    var lines = str.replace(/\/\/.*$/gm, "").split(";");
    var raw = {};
    var sm = false;
    for (var i in lines) {
        var parts = lines[i].trim().split(":");
        parts = [parts.shift(), parts.join(":")];
        var tag = parts.splice(0, 1)[0].replace(/^#/, "");
        if (!tag || parts.length === 0) continue;
        var val = (parts.length === 1 ? parts[0] : parts);
        if (tag === "NOTES" && val.indexOf(":") > -1) {
            sm = true;;
            var cParts = val.split(":");
            for (var j in SMParse.tags.chart.ssc) {
                var cTag = SMParse.tags.chart.ssc[j];
                if (!raw[cTag]) raw[cTag] = [];
            }
            for (var j in SMParse.tags.chart.sm) {
                raw[SMParse.tags.chart.sm[j]].push(cParts[j].trim());
            }
        } else if (SMParse.tags.chart.ssc.indexOf(tag) > -1) {
            if (!raw[tag]) raw[tag] = [];
            raw[tag].push(val);
        } else if (SMParse.tags.list.indexOf(tag) > -1) {
            var items = val.replace(/\s+/gm, "").split(",").filter(function(x) { return !!x; });
            var data = [];
            for (var j in items) {
                var lParts = items[j].split("=");
                data.push(lParts);
            }
            raw[tag] = data;
        } else {
            raw[tag] = val;
        }
    }
    for (var i in raw.NOTES) {
        raw.RADARVALUES[i] = raw.RADARVALUES[i].split(",");
        var notes = raw.NOTES[i].trim().split(/,\s*/);
        var bars = [];
        for (var j in notes) {
            var barNotes = notes[j].trim().replace(/\s+/gm, " ").split(/\s+/);
            for (var k in barNotes) {
                barNotes[k] = barNotes[k].split("");
            }
            bars.push([parseInt(j), barNotes]);
        }
        raw.NOTES[i] = bars;
    }
    this.meta = {
        title: opts.translit ? raw.TITLETRANSLIT : raw.TITLE,
        subtitle: opts.translit ? raw.SUBTITLETRANSLIT : raw.SUBTITLE,
        artist: opts.translit ? raw.ARTISTTRANSLIT : raw.ARTIST,
        credit: raw.CREDIT ? raw.CREDIT[0] : undefined,
        origin: raw.ORIGIN,
        cd: raw.CDTITLE,
        genre: raw.GENRE,
        type: sm ? ["sm"] : ["ssc", raw.VERSION],
        select: raw.SELECTABLE ? (raw.SELECTABLE === "YES") : undefined
    };
    this.files = {
        banner: raw.BANNER,
        jacket: raw.JACKET,
        cd: raw.CDIMAGE,
        disc: raw.DISCIMAGE,
        video: raw.PREVIEWVID,
        bg: raw.BACKGROUND,
        music: raw.MUSIC,
        lyrics: raw.LYRICSPATH
    };
    this.times = {
        offset: raw.OFFSET,
        sample: {
            start: raw.SAMPLESTART,
            length: raw.SAMPLELENGTH
        },
        labels: raw.LABELS
    };
    this.changes = {
        bpm: raw.BPMS,
        stop: raw.STOPS,
        delay: raw.DELAYS,
        warp: raw.WARPS,
        timesig: raw.TIMESIGNATURES,
        tick: raw.TICKCOUNTS,
        combo: raw.COMBOS,
        speed: raw.SPEEDS,
        scroll: raw.SCROLLS,
        fake: raw.FAKES,
        key: raw.KEYSOUNDS,
        attack: raw.ATTACKS,
        bg: raw.BGCHANGES,
        fg: raw.FGCHANGES
    };
    this.charts = [];
    for (var i in raw.NOTES) {
        this.charts.push({
            name: raw.CHARTNAME[i],
            credit: raw.CREDIT[parseInt(i) + 1] || "",
            type: raw.STEPSTYPE[i],
            desc: raw.DESCRIPTION[i],
            style: raw.CHARTSTYLE[i],
            diff: raw.DIFFICULTY[i],
            meter: raw.METER[i],
            data: raw.NOTEDATA[i],
            radar: raw.RADARVALUES[i],
            notes: raw.NOTES[i]
        });
    }
    this.raw = raw;
    return this;
}
SMParse.tags = {
    chart: {
        sm: ["STEPSTYPE", "DESCRIPTION", "DIFFICULTY", "METER", "RADARVALUES", "NOTES"],
        ssc: ["CHARTNAME", "CHARTSTYLE", "CREDIT", "DESCRIPTION", "DIFFICULTY", "DISPLAYBPM", "METER", "NOTEDATA", "NOTES", "RADARVALUES", "STEPSTYPE"],
    },
    list: ["ATTACKS", "BGCHANGES", "BPMS", "COMBOS", "DELAYS", "FAKES", "FGCHANGES", "KEYSOUNDS", "LABELS", "SCROLLS", "SPEEDS", "STOPS", "TICKCOUNTS", "TIMESIGNATURES", "WARPS"]
};
SMParse.notes = {
    "0": null,
    "1": "note",
    "2": "hold start",
    "3": "hold/roll end",
    "4": "roll start",
    "M": "mine",
    "K": "keysound",
    "L": "lift",
    "F": "fake"
};
SMParse.colour = function colour(beat, size) {
    var divs = 3 * 128;
    var val = beat * divs / size;
    if (val % (divs / 4) === 0) {
        return 0;
    } else if (val % (divs / 8) === 0) {
        return 1;
    } else if (val % (divs / 12) === 0) {
        return 2;
    } else if (val % (divs / 16) === 0) {
        return 3;
    } else if (val % (divs / 24) === 0) {
        return 4;
    } else if (val % (divs / 32) === 0) {
        return 5;
    } else if (val % (divs / 64) === 0) {
        return 6;
    } else {
        return 7;
    }
};
// if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
//     module.exports = SMParse;
// }
export default SMParse;