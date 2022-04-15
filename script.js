//@ts-check  
//The @ts-check statement above enables jsdoc typechecking
// https://stackoverflow.com/a/52076280/86375
// http://demo.unified-streaming.com/players/dash.js-2.4.1/build/jsdoc/jsdoc_cheat-sheet.pdf


//import Janus from './janus.es.js'

export { }

console.log('script.js running')

let hdrs = {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9",
    "cache-control": "max-age=0",
    "content-type": "application/json"
}


/**
 * @param {('GET'|'POST')} method
 * @param {number} id1
 * @param {number} id2
 * @param {object} bodyobj
 * @param {boolean} addrid
 * 
 * @returns {Promise<object>}
 */
async function jfetch(method, id1, id2, bodyobj, addrid) {

    let u = "http://fanless.duckdns.org:8088/janus"
    if (id1) {
        u = u + "/" + id1
    }
    if (id2) {
        u = u + "/" + id2
    }
    if (addrid) {
        u = u + "?rid=" + new Date().getTime()
    }
    let bodyStr = null;
    if (bodyobj) {
        bodyStr = JSON.stringify(bodyobj)
    }


    /** @type {RequestInit} */
    let finit = {
        "headers": hdrs,
        "body": bodyStr,
        "method": method,
        "mode": "cors",
        "credentials": "omit"
    }

    let r = await fetch(u, finit)
    if (r.status != 200) {
        throw "fetch fail, not 200"
    }

    let resp = await r.text()
    //console.log('resp', resp)

    let respobj = JSON.parse(resp)
    //console.log('obj1', o)

    return respobj
}

/**
 * @param {number} id1
 * @returns {Promise<RTCSessionDescription>}
 */
async function waitsdp(id1) {
    while (true) {
        let respobj = await jfetch("GET", id1, null, null, true)
        if (respobj.jsep.sdp) {
            // console.log('got sdp')
            return respobj.jsep
        }
    }
}




/** @global */
/** @type {object} */
var bodyobj, respobj

/** @global */
/** @type {number} */
var id1, id2


bodyobj = {
    "janus": "create",
    "transaction": "DZP3laHFOwAq"
}
respobj = await jfetch("POST", null, null, bodyobj, false)

id1 = respobj.data.id
console.log('id1', id1)

bodyobj = {
    "janus": "attach",
    "plugin": "janus.plugin.streaming",
    "opaque_id": "streamingtest-XhCTgrJphppP",
    "transaction": "DZP3laHFOwAq"
}
respobj = await jfetch("POST", id1, null, bodyobj, false)
id2 = respobj.data.id
console.log('id2', id2)

bodyobj = {
    "janus": "message",
    "body": {
        "request": "watch",
        "id": 1
    },
    "transaction": "DZP3laHFOwAq"
}
respobj = await jfetch("POST", id1, id2, bodyobj, false)
//console.log('watch respobj', respobj)


// respobj = await jfetch("GET", id1, null, null, true)
// //console.log('rid get', respobj)
// console.log('sdp', respobj.jsep.sdp)

const p1 = new Promise((res) => setTimeout(() => res("p1"), 1000))
const p2 = waitsdp(id1)
const rtcsdObj = await Promise.race([p1, p2])

console.log(rtcsdObj)
console.log(p2)

/** @global */
/** @type {RTCSessionDescription} */
var rtcsd

if (rtcsdObj.type && rtcsdObj.sdp) {
    console.log("got rtcsd")
    rtcsd = rtcsdObj
} else {
    throw "failed to get rtcsd"
}

/** @global */
/** @type {RTCDataChannel} */
var pc_dc


let pc = new RTCPeerConnection()
pc_dc = pc.createDataChannel('a_dc')
pc_dc.onopen = () => console.log('pc_dc is open')

let video1 = /** @type {HTMLVideoElement} */ (document.getElementById('video1'))
pc.ontrack = ev => {
    console.log('ontrack called')
    video1.srcObject = ev.streams[0]
    // want to remove these someday 11.7.21 cam
    // video1.autoplay = true
    // video1.controls = true
    // return false
}

pc.onconnectionstatechange = () => console.log('b state:' + pc.connectionState)
pc.ondatachannel = (ev) => {
    pc_dc = ev.channel
    pc_dc.onmessage = (e) => console.log('b_dc got msg: ' + e.data)
    pc_dc.onopen = () => console.log('b_dc is open')
    pc_dc.onclose = () => console.log('b_dc is closed')
}
await pc.setRemoteDescription(rtcsd)
let pc_answer = await pc.createAnswer()
await pc.setLocalDescription(pc_answer)
await new Promise(r => setTimeout(r, 200))
console.log('b_answer', pc_answer)



bodyobj = {
    "janus": "message",
    "body": {
        "request": "start"
    },
    "transaction": "GWZQnVWpCrIG",
    "jsep": pc_answer
}
respobj = await jfetch("POST", id1, id2, bodyobj, false)


