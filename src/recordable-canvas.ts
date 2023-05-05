import { CanvasRecorder } from './canvasrecorder.js';

export class RecordableCanvas extends HTMLElement {
    protected _width = 300;

    protected _height = 150;

    protected _innerCanvas: HTMLCanvasElement;

    protected recorder?: CanvasRecorder;

    public get innerCanvas() {
        return this._innerCanvas;
    }

    public get width() {
        return this._width;
    }

    public set width(val: number) {
        this._width = val;
        this.innerCanvas.width = val;
    }

    public set height(val: number) {
        this._height = val;
        this.innerCanvas.height = val;
    }

    public get height() {
        return this._height;
    }

    public captureStream(frameRequestRate: number) {
        return this._innerCanvas.captureStream(frameRequestRate);
    }

    public getContext(contextType: string, options?: any) {
        return this._innerCanvas.getContext(contextType, options);
    }

    public toDataURL(type: string, quality?: any) {
        return this._innerCanvas.toDataURL(type, quality);
    }

    public toBlob(callback: BlobCallback, type: string, quality: any) {
        this._innerCanvas.toBlob(callback, type, quality);
    }

    public transferControlToOffscreen() {
        return this._innerCanvas.transferControlToOffscreen();
    }

    public async startRecording(timeBetweenKeyframes?: number, config?: VideoEncoderConfig) {
        this.recorder = new CanvasRecorder();
        this.setAttribute('recording', 'true');
        await this.recorder.startRecording(this._innerCanvas, timeBetweenKeyframes, config);
    }

    public async stopRecording(saveas: string) {
        this.removeAttribute('recording');
        await this.recorder?.stopRecording(saveas);
    }

    public saveFile(saveas: string): boolean {
        return this.recorder?.saveFile(saveas) || false;
    }

    public get isRecording() {
        return this.recorder?.isRecording;
    }

    public async encodeFrame() {
        if (this._innerCanvas) {
            return await this.recorder!.encode(this._innerCanvas);
        } else {
            return 0;
        }
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open'});

        if (this.hasAttribute('width')) {
            this._width = Number(this.getAttribute('width'));
        }

        if (this.hasAttribute('height')) {
            this._height = Number(this.getAttribute('height'));
        }

        this.shadowRoot!.innerHTML = `<canvas 
            ${this.hasAttribute('width') ? 'width=' + this._width : ''}
            ${this.hasAttribute('height') ? 'height=' + this._height : ''}></canvas>
            <style>
                :host {
                    display: inline-block;
                }
                
                canvas {
                    display: block;
                }
            </style>`;
        this._innerCanvas = this.shadowRoot?.querySelector('canvas') as HTMLCanvasElement;
        this.dispatchEvent(new Event('ready'));
    }
}

customElements.define('recordable-canvas', RecordableCanvas);