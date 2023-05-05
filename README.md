# recordable-canvas
A canvas element that can be recorded to a downloadable video

`<recordable-canvas>` is a Web Component that wraps the canvas element and provides an API to record the contents
of the canvas to an MP4 file.

It uses the Web Codecs API (https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API) to encode the stream, 
and then MP4Box.js (https://github.com/gpac/mp4box.js/) to mux and save the file.

Since the canvas has a limited API (as most operations are done through the canvas context, you should find all the methods you'd normally need on an HTMLCanvasElement
passed through.

In addition to any normal canvas attributes, a `recording` attribute will be applied when this 
component is recording. There are also few more API calls:

Use by importing `index.js` or `recordable-canvas.js` and wait for the `ready` event
to set up the canvas (otherwise the component may not have registered yet and not have an API)
```
<recordable-canvas width="300" height="300"></recordable-canvas>
<script>
    import 'recordable-canvas';
    const canvas = document.body.querySelector('recordable-canvas');
    canvas.addEventListener('ready', () => { ...
</script>
```

`get innerCanvas`
-----------------
as the canvas we're recording against is wrapped with the `recordable-canvas` Web Component, 
if you need to access this canvas for any reason, you may do so with this getter

`startRecording`
----------------
Start canvas recording. This accepts two optional arguments:
- timeBetweenKeyframes: if you want to change the default time in milliseconds (1000) between keyframes in the encoded video, you may set this here
- config: a custom VideoEncoderConfig you may pass to override the default (specified below)

Default Encoder Configuration:
```
{
    codec : 'avc1.42001E',
    width: 0,
    height: 0,
    hardwareAcceleration:"prefer-hardware",
    avc:{format:"avc"}
}
```
*width and height will be overwritten with the canvas width and height*

avc1.42001E refers to AVC baseline level 3 which supports 1920x1080 as shown in the demos in this repo.
Refer here for others https://privacycheck.sec.lrz.de/active/fp_cpt/fp_can_play_type.html

`stopRecording`
----------------
Stops recording the canvas. Accepts an optional string for a filename. If the filename is
specified, the file will automatically be saved as a download

`saveFile`
-----------
Accepts a filename as a parameter and when calls, saves the file as a download

`get isRecording`
-----------------
A getter which will return true or false to indicate if recording is in progress

`encodeFrame`
-------------
Pass with no arguments. This will snapshot the current state of the canvas and encode it.
Recordings occur in realtime, meaning the frame's timestamp will be relative to
the "startRecording" call measured by your system's time. For example, if you call `encodeFrame`
3 seconds after you start recording, that timestamp will be 3 seconds in the video.

This will also return the current duration of the video in MICROseconds (to match the internal timestamp of the frame).


-------------------------------

Using without the Web Component
===============================

The Web Component API mainly serves as a wrapper for the `canvasrecorder.js` class.
Most of the API is the same with the exception of needing to pass the canvas where needed.

`get isRecording`
-----------------
A getter which will return true or false to indicate if recording is in progress

`get recordingDuration`
-----------------
A getter which will return the duration in milliseconds of your current recording

`startRecording`
----------------
Start canvas recording. One required and two optional arguments are accepted:
- canvas: The canvas element being recorded
- timeBetweenKeyframes: if you want to change the default time in milliseconds (1000) between keyframes in the encoded video, you may set this here
- config: a custom VideoEncoderConfig you may pass to override the default (specified below)

`stopRecording`
----------------
Stops recording the canvas. Accepts an optional string for a filename. If the filename is
specified, the file will automatically be saved as a download

`saveFile`
-----------
Accepts a filename as a parameter and when calls, saves the file as a download

`encode`
--------
- canvas: The canvas element being recorded at the time you wish to snapshot it
Recordings occur in realtime, meaning the frame's timestamp will be relative to
the "startRecording" call measured by your system's time. For example, if you call `encode`
3 seconds after you start recording, that timestamp will be 3 seconds in the video.

This will also return the current duration of the video in MICROseconds (to match the internal timestamp of the frame).

