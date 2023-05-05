// @ts-ignore
import MP4Box from './mp4box.adapter.js';

export class CanvasRecorder {
    public static defaultEncoderConfig: VideoEncoderConfig = {
        codec : 'avc1.42001E',
        width: 0,
        height: 0,
        hardwareAcceleration:"prefer-hardware",
        avc:{format:"avc"}
    }

    protected _isRecording = false;

    protected encoder?: VideoEncoder;

    protected file: any;

    protected recordingStartTime = -1;

    protected _duration = 0;

    protected frameCount = 0;

    protected width = 0;

    protected height = 0;

    protected recording: EncodedVideoChunk[] = [];

    protected description?: AllowSharedBufferSource

    protected timeBetweenKeyframes = 1000000; // time in microseconds

    protected lastKeyFrameEncoded: number = -1;

    protected track = null;

    public get isRecording() {
        return this._isRecording;
    }

    public get recordingDuration() {
        return this._duration;
    }

    public async startRecording(canvas: HTMLCanvasElement, millisecondsBetweenKeyframes: number = 1000, config?: VideoEncoderConfig) {
        this._duration = 0;
        this.frameCount = 0;
        this.timeBetweenKeyframes = millisecondsBetweenKeyframes * 1000;
        this.recordingStartTime = -1;
        this.width = canvas.width;
        this.height = canvas.height;
        this.file = MP4Box.createFile();
        const cfg: VideoEncoderConfig = config || Object.assign({}, CanvasRecorder.defaultEncoderConfig);
        cfg.width = canvas.width;
        cfg.height = canvas.height;

        this.encoder = new VideoEncoder({
            output: this.onEncoderOutput.bind(this),
            error: this.onEncoderError.bind(this)
        });

        await this.encoder.configure(cfg);
        this._isRecording = true;
    }

    public async stopRecording(saveas?: string) {
        const oneSecondInMillisecond = 1000;
        const timescale = 1000;
        let durationInMillisecond = 1000;
        const fps = this.frameCount / (this._duration / 1000);
        let frameTimeInMillisecond = 1000 / fps;
        let totalFrames = Math.floor(durationInMillisecond / frameTimeInMillisecond) ;

        this._isRecording = false;
        this.encoder?.flush().then(() => {
            this.encoder?.close();

            this.recording.forEach((chunk: EncodedVideoChunk) => {
                let ab = new ArrayBuffer(chunk.byteLength);
                chunk.copyTo(ab);
                if (this.track === null) {
                    this.track = this.file.addTrack({
                        timescale: (oneSecondInMillisecond * timescale),
                        width: this.width,
                        height: this.height,
                        nb_samples: totalFrames,
                        avcDecoderConfigRecord: this.description });
                }
                this.file.addSample(this.track, ab, {
                    duration: (frameTimeInMillisecond * timescale),
                    dts: chunk.timestamp,
                    cts: chunk.timestamp,
                    is_sync: (chunk.type === 'key')
                });
            });
            if (saveas) {
                this.saveFile(saveas);
            }
        });
    }

    public saveFile(saveas: string) {
        if (this.file) {
            this.file.save(`${saveas}.mp4`);
            return true;
        } else {
            console.warn('Cannot save file because no file was created/recorded');
            return false;
        }
    }

    public async encode(canvas: HTMLCanvasElement): Promise<number> {
        if (this.recordingStartTime === -1) {
            this.recordingStartTime = Date.now();
        }
        this.frameCount ++;
        const currentTimeMicros = (Date.now() - this.recordingStartTime) * 1000;
        const isKeyframe = (currentTimeMicros - this.lastKeyFrameEncoded >= this.timeBetweenKeyframes);
        const frame = new VideoFrame(canvas, { duration: 0, timestamp: currentTimeMicros } );
        this.encoder?.encode(frame as VideoFrame, { keyFrame: isKeyframe });
        if (isKeyframe) {
            this.lastKeyFrameEncoded = frame.timestamp;
        }
        frame.close();
        this._duration = currentTimeMicros / 1000;
        return currentTimeMicros;
    }

    protected onEncoderOutput(chunk: EncodedVideoChunk, chunkMetadata: EncodedVideoChunkMetadata) {
        this.recording.push(chunk);
        if (chunkMetadata?.decoderConfig?.description) {
            this.description = chunkMetadata.decoderConfig.description;
        }
    }

    protected onEncoderError(error: DOMException){
        console.warn('Encoder Error', error);
    }
}