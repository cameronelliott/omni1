//@ts-check  
//The @ts-check statement above enables jsdoc typechecking
// https://stackoverflow.com/a/52076280/86375
// http://demo.unified-streaming.com/players/dash.js-2.4.1/build/jsdoc/jsdoc_cheat-sheet.pdf


import Janus from './janus.es.js'


Janus.init({
    debug: true,
    dependencies: Janus.useDefaultDependencies(), // or: Janus.useOldDependencies() to get the behaviour of previous Janus versions
    callback: function () {
        // Done!
    }
});

/** @global number */
/** @type {Janus} */
var jj


function newjanus(r) {
    jj = new Janus(
        {
            server: 'http://192.168.86.3:8088/janus',
            success: function () {
                // Done! attach to plugin XYZ
                console.log('jan success')
                r()
            },
            error: function (cause) {
                // Error, can't go on...
                console.log('janerr', cause)
            },
            destroyed: function () {
                // I should get rid of this
                console.log('jandestroyed')
            }
        })

}


console.log('newjanus() launched')
await new Promise(r => newjanus(r));
console.log('newjanus() success')

console.log(jj.getInfo())



/** @global number */
/** @type {any} */
var streaming

// Attach to the Streaming plugin
jj.attach(
    {
        plugin: "janus.plugin.streaming",
        success: function (pluginHandle) {
            // Handle created
            streaming = pluginHandle;
            console.log('sucx', pluginHandle)
        },

        onmessage: function (msg, jsep) {
            // Handle msg, if needed, and check jsep
            if (jsep !== undefined && jsep !== null) {
                // We have an OFFER from the plugin
                console.log('got jsep')
                streaming.createAnswer(
                    {
                        // We attach the remote OFFER
                        jsep: jsep,
                        // We want recvonly audio/video
                        media: { audioSend: false, videoSend: false },
                        success: function (ourjsep) {
                            // Got our SDP! Send our ANSWER to the plugin
                            var body = { "request": "start" };
                            streaming.send({ "message": body, "jsep": ourjsep });
                        },
                        error: function (error) {
                            // An error occurred...
                        }
                    });
            }
        },

        onlocaltrack: function (track, added) {
            // This will NOT be invoked, we chose recvonly
        },
        onremotetrack: function (track, mid, added) {
            // Invoked after send has got us a PeerConnection
            // This is info on a remote track: when added, we can choose to render
        },
    })