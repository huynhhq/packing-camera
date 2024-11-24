import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  OnDestroy,
} from '@angular/core';

@Component({
  selector: 'camera-ngx-packing-camera',
  imports: [],
  template: `
    <div>
      <h1>Camera App</h1>
      <video
        #videoElement
        width="720"
        height="480"
        autoplay
        muted
        playsinline
      ></video>
      <div>
        <button *ngIf="!recording" (click)="startRecording()">
          Start Recording
        </button>
        <button *ngIf="recording" (click)="stopRecording()">
          Stop Recording
        </button>
      </div>
    </div>
  `,
  styles: ``,
})
export class NgxPackingCameraComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  public recording = false;

  async ngOnInit() {
    await this.initCamera();
  }

  ngOnDestroy() {
    this.stopCamera();
  }

  private async initCamera() {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      this.stream = mediaStream;

      if (this.videoElement?.nativeElement) {
        this.videoElement.nativeElement.srcObject = mediaStream;
        this.videoElement.nativeElement.addEventListener(
          'loadedmetadata',
          () => {
            this.videoElement.nativeElement.play().catch((err) => {
              console.error('Error playing the video:', err);
            });
          }
        );
      }
    } catch (err) {
      console.error('Error accessing the camera:', err);
    }
  }

  private stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }
  }

  startRecording() {
    if (this.stream) {
      const mediaRecorder = new MediaRecorder(this.stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'recording.mp4';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      };

      mediaRecorder.start();
      this.recorder = mediaRecorder;
      this.recording = true;
    }
  }

  stopRecording() {
    if (this.recorder) {
      this.recorder.stop();
      this.recording = false;
    }
  }
}
