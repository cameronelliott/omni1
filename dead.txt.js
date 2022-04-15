
// Janus.init({
//     debug: true,
//     dependencies: Janus.useDefaultDependencies(), // or: Janus.useOldDependencies() to get the behaviour of previous Janus versions
//     callback: function () {
//         // Done!
//     }
// });


// var janus = new Janus(
//     {
//         server: 'http://192.168.86.3:8088/janus',
//         success: function () {
//             // Done! attach to plugin XYZ
//             console.log('jan success')
//         },
//         error: function (cause) {
//             // Error, can't go on...
//             console.log('janerr', cause)
//         },
//         destroyed: function () {
//             // I should get rid of this
//             console.log('jandestroyed')
//         }
//     });
