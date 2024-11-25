import {
  Input,
  OnInit,
  Component,
  ElementRef,
  ViewChild,
  OnDestroy,
} from '@angular/core';

@Component({
  selector: 'camera-ngx-packing-camera',
  imports: [],
  template: `
    <div>
      <video
        #liveVideoFeed
        style="display: none"
        [attr.width]="videoWidth"
        [attr.height]="videoHeight"
        autoplay
        class="live-player"
      ></video>
      <canvas
        #canvas
        [attr.width]="videoWidth"
        [attr.height]="videoHeight"
      ></canvas>
    </div>
  `,
})
export class NgxPackingCameraComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: false })
  canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('liveVideoFeed', { static: false })
  liveVideoFeed!: ElementRef<HTMLVideoElement>;

  @Input() orderCode: string = '';
  @Input() productName: string = '';
  @Input() mimeType: string = 'video/webm';

  @Input() videoWidth: number = 720; // Default width
  @Input() videoHeight: number = 480; // Default height

  public recording = false;

  public devices: MediaDeviceInfo[] = [];
  public selectedDeviceId: MediaDeviceInfo | null = null;
  public directoryHandle!: FileSystemDirectoryHandle | null;

  videoChunks: Blob[] = [];
  recordedVideo: string | null = null;
  
  private stream: MediaStream | null = null;
  private animationFrameId: number | null = null;
  private mediaRecorder: MediaRecorder | null = null;

  async ngOnInit() {
    this.getCameraPermission();
    this.enumerateDevices();
  }

  ngOnDestroy() {
    this.stopCamera();
  }

  /**
   * Stops the camera feed.
   */
  private stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  /**
   * Start recording the video.
   */
  startRecording() {
    const canvasStream = this.canvasRef.nativeElement.captureStream(25);
    this.mediaRecorder = new MediaRecorder(canvasStream, {
      mimeType: this.mimeType,
    });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.videoChunks.push(event.data);
      }
    };

    this.mediaRecorder.start();
  }

  private async selectDirectory(): Promise<void> {
    try {
      const directoryHandle = await (window as any).showDirectoryPicker();
      console.log('Directory selected:', directoryHandle);
      this.directoryHandle = directoryHandle;
    } catch (error) {
      console.error('Error selecting directory:', error);
    }
  }

  private async ensureDirectoryHandle(): Promise<void> {
    if (!this.directoryHandle) {
      console.warn('No directoryHandle set. Prompting user to select a directory.');
      await this.selectDirectory();
    }
  }

  private async verifyPermission(handle: FileSystemDirectoryHandle): Promise<boolean> {
    const options = { mode: 'readwrite' };
    if ((await (handle as any).queryPermission(options)) === 'granted') {
      return true;
    }
    if ((await (handle as any).requestPermission(options)) === 'granted') {
      return true;
    }
    return false;
  }

  /**
   * Stop the video recording and create a video blob.
   */
  stopRecording() {
    let extension = this.mimeType.split('/')[1] || 'dat';
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now
      .getHours()
      .toString()
      .padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now
      .getSeconds()
      .toString()
      .padStart(2, '0')}`;
    const fileName = `${this.orderCode}_${formattedDate}_recorded-video.${extension}`;

    if (this.mediaRecorder) {
      this.mediaRecorder.stop();

      this.mediaRecorder.onstop = async () => {
        const videoBlob = new Blob(this.videoChunks, { type: this.mimeType });
        this.recordedVideo = URL.createObjectURL(videoBlob);

        await this.ensureDirectoryHandle();

        if (this.directoryHandle) {
          const hasPermission = await this.verifyPermission(
            this.directoryHandle
          );
          if (hasPermission) {
            const fileHandle = await this.directoryHandle.getFileHandle(
              fileName,
              { create: true }
            );
            const writable = await fileHandle.createWritable();
            await writable.write(videoBlob);
            await writable.close();
            console.log(`File saved to ${fileName}`);
          }
        } else {
          console.warn('Saving fallback: downloading file.');
          const downloadLink = document.createElement('a');
          downloadLink.href = this.recordedVideo;
          downloadLink.download = fileName;
          downloadLink.click();
          URL.revokeObjectURL(this.recordedVideo);
        }

        this.videoChunks = [];

        // Clear chunks for the next recording
        this.videoChunks = [];
      };
    }
  }

  /**
   * Draws the video feed and overlay text on the canvas.
   */
  private drawOnCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    const video = this.liveVideoFeed.nativeElement;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      if (!video || !ctx) return;

      if (video.readyState === 4) {
        // Draw the video feed
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Draw the overlay text
        this.updateOverlayText();
      }

      this.animationFrameId = requestAnimationFrame(draw);
    };

    draw();
  }

  /**
   * Updates the overlay text on the canvas.
   */
  private updateOverlayText(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Clear the previous overlay text
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw video
    ctx.drawImage(
      this.liveVideoFeed.nativeElement,
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = 'red';

    if (this.orderCode) {
      ctx.fillText(`Order Code: ${this?.orderCode || 'None'}`, 20, 30);
      ctx.fillText(`Product: ${this?.productName || 'None'}`, 20, 60);
      const currentTime = new Date().toLocaleTimeString();
      ctx.fillText(`Time: ${currentTime}`, 20, 90);
    }
  }

  /**
   * Enumerate available video input devices.
   */
  private async enumerateDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.devices = devices.filter((device) => device.kind === 'videoinput');

      if (this.devices.length > 0) {
        this.selectedDeviceId = this.devices[0];
      }
    } catch (err) {
      console.error('Error accessing media devices.', err);
    }
  }

  /**
   * Requests camera permission and sets up the video stream.
   * @param deviceId The ID of the video device to use.
   */
  async getCameraPermission(deviceId?: string) {
    this.recordedVideo = null;

    if ('MediaRecorder' in window) {
      try {
        const currentDeviceId = deviceId || this.devices?.[0]?.deviceId;

        const videoConstraints = {
          audio: false,
          video: {
            deviceId: currentDeviceId ? { exact: currentDeviceId } : undefined,
          },
        };

        const videoStream = await navigator.mediaDevices.getUserMedia(
          videoConstraints
        );

        this.stream = videoStream;

        // Attach the video stream to the video element
        if (this.liveVideoFeed && this.liveVideoFeed.nativeElement) {
          this.liveVideoFeed.nativeElement.srcObject = videoStream;
        }

        this.drawOnCanvas();
      } catch (err: any) {
        alert(err.message || 'Error accessing the camera.');
      }
    } else {
      alert('The MediaRecorder API is not supported in your browser.');
    }
  }

  /**
   * Switches to a different camera device.
   * @param deviceId The ID of the device to switch to.
   */
  public async switchCamera(deviceId: string) {
    this.stopCamera();
    await this.getCameraPermission(deviceId);
  }
}
