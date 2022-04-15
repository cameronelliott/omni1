//@ts-check  
//The @ts-check statement above enables jsdoc typechecking
// https://stackoverflow.com/a/52076280/86375
// http://demo.unified-streaming.com/players/dash.js-2.4.1/build/jsdoc/jsdoc_cheat-sheet.pdf


//import Janus from './janus.es.js'

console.log('script.js running')

let hdrs = {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9",
    "cache-control": "max-age=0",
    "content-type": "application/json"
}

async function jfetch(txid, method, id1, id2, obj) {

    let u = "http://fanless.duckdns.org:8088/janus"
    if (id1) {
        u = u + "/" + id1
    }
    if (id2) {
        u = u + "/" + id1
    }
    let body = null;
    if (obj) {
        body = JSON.stringify(obj)
    }


    /** @type {RequestInit} */
    let finit = {
        "headers": hdrs,
        "body": "{\"janus\":\"create\",\"transaction\":\"DZP3laHFOwAq\"}",
        "method": method,
        "mode": "cors",
        "credentials": "omit"
    }

    let r = await fetch(u, finit)
    if (r.status != 200) {
        throw "fetch fail, not 200"
    }

    let b = await r.text()
    console.log('body', b)

    let obj1 = JSON.parse(b)
    console.log('obj1', obj1)
    
    return obj1
}

let fbody = {
    "janus": "create",
    "transaction": "DZP3laHFOwAq"
}
let o = await jfetch("txid", null, null, fbody)



console.log(r)

if (r.status != 200) {
    throw "fetch fail, not 200"
}
let b = await r.text()
console.log('body', b)
let obj1 = JSON.parse(b)
console.log('obj1', obj1)
let id = obj1.data.id
if (id < 1) {
    throw "cannot get id"
}
console.log('id', id)



r = await fetch(`http://fanless.duckdns.org:8088/janus/${id}`, {
    "headers": hdrs,
    "body": "{\"janus\":\"attach\",\"plugin\":\"janus.plugin.streaming\",\"opaque_id\":\"streamingtest-XhCTgrJphppP\",\"transaction\":\"DZP3laHFOwAq\"}",
    "method": "POST",
    "mode": "cors",
    "credentials": "omit"
})
if (r.status != 200) {
    throw "fetch/attach fail, not 200"
}
b = await r.text()
console.log('body2', b)
obj1 = JSON.parse(b)
console.log('obj1', obj1)
let id2 = obj1.data.id
if (id2 < 1) {
    throw "cannot get id2"
}
console.log('id2', id2)




r = await fetch(`http://fanless.duckdns.org:8088/janus/${id}/${id2}`, {
    "headers": hdrs,
    "body": "{\"janus\":\"message\",\"body\":{\"request\":\"watch\",\"id\":1},\"transaction\":\"DZP3laHFOwAq\"}",
    "method": "POST",
    "mode": "cors",
    "credentials": "omit"
})
if (r.status != 200) {
    throw "fetch/watch fail, not 200"
}
b = await r.text()
console.log('body/watch', b)

r = await fetch(`http://fanless.duckdns.org:8088/janus/${id}?rid=1649731450916&maxev=10`, {
    "headers": hdrs,
    "body": null,
    "method": "GET",
    "mode": "cors",
    "credentials": "omit"
})
if (r.status != 200) {
    throw "fetch/watch fail, not 200"
}
b = await r.text()
console.log('body/rid', b)

let offer = ''

// XXX this loop should include fetches until the sdp comes back
foo: {

    obj1 = JSON.parse(b)
    for (let i = 0; i < obj1.length; i++) {
        console.log('obj1', i, obj1[i])
        if (obj1[i].jsep.sdp) {
            offer = obj1[i].jsep.sdp
            console.log('offer found')
            break foo
        }
    }

}


console.log('offer sdp nlines:', offer.split(/\r\n|\r|\n/).length)


let sdpans = ''

let obj2 = {
    "janus": "message",
    "body": {
        "request": "start"
    },
    "transaction": "DZP3laHFOwAq",
    "jsep": {
        "type": "answer",
        "sdp": sdpans
    }
}


let body = JSON.stringify()
// "{\"janus\":\"message\",\"body\":{\"request\":\"start\"},\"transaction\":\"DZP3laHFOwAq\",\"jsep\":{\"type\":\"answer\",\"sdp\":\"v=0\\r\\no=- 123020400595187601 2 IN IP4 127.0.0.1\\r\\ns=-\\r\\nt=0 0\\r\\na=group:BUNDLE a v\\r\\na=extmap-allow-mixed\\r\\na=msid-semantic: WMS\\r\\nm=audio 9 UDP/TLS/RTP/SAVPF 111\\r\\nc=IN IP4 0.0.0.0\\r\\na=rtcp:9 IN IP4 0.0.0.0\\r\\na=ice-ufrag:FT4S\\r\\na=ice-pwd:Tn70ap2ksn/tVmXFxy7OpxGv\\r\\na=ice-options:trickle\\r\\na=fingerprint:sha-256 F6:3A:46:C1:80:71:A1:46:59:BD:1E:3B:3E:B6:E3:4A:12:08:B4:A0:F4:5D:A8:F4:68:CE:1F:0A:DD:CE:61:1E\\r\\na=setup:active\\r\\na=mid:a\\r\\na=extmap:1 urn:ietf:params:rtp-hdrext:sdes:mid\\r\\na=recvonly\\r\\na=rtcp-mux\\r\\na=rtpmap:111 opus/48000/2\\r\\na=fmtp:111 minptime=10;useinbandfec=1\\r\\nm=video 9 UDP/TLS/RTP/SAVPF 100\\r\\nc=IN IP4 0.0.0.0\\r\\na=rtcp:9 IN IP4 0.0.0.0\\r\\na=ice-ufrag:FT4S\\r\\na=ice-pwd:Tn70ap2ksn/tVmXFxy7OpxGv\\r\\na=ice-options:trickle\\r\\na=fingerprint:sha-256 F6:3A:46:C1:80:71:A1:46:59:BD:1E:3B:3E:B6:E3:4A:12:08:B4:A0:F4:5D:A8:F4:68:CE:1F:0A:DD:CE:61:1E\\r\\na=setup:active\\r\\na=mid:v\\r\\na=extmap:2 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time\\r\\na=extmap:1 urn:ietf:params:rtp-hdrext:sdes:mid\\r\\na=recvonly\\r\\na=rtcp-mux\\r\\na=rtpmap:100 VP8/90000\\r\\na=rtcp-fb:100 goog-remb\\r\\na=rtcp-fb:100 nack\\r\\na=rtcp-fb:100 nack pli\\r\\n\"}}",
fetch(`http://fanless.duckdns.org:8088/janus/${id}/${id2}`, {
    "headers": hdrs,
    "body": body,
    "method": "POST",
    "mode": "cors",
    "credentials": "omit"
});


export {}