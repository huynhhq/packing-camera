# NgxPackingCamera Component

The `NgxPackingCameraComponent` is an Angular library designed to facilitate video recording and camera functionality. This component is ideal for scenarios such as capturing packaging processes, overlaying order details, and saving videos directly to the user's device or a specified directory.

---

## Demo

Try out the <a href="https://packing-camera-sample.vercel.app" target="_blank">Live-Demo</a> or see
the <a href="https://github.com/huynhhq/packing-camera-sample" target="_blank">Demo-Project</a>.

---

## Features

- **Live Video Feed**: Stream video from the user's camera to a video element.
- **Canvas Overlay**: Display text overlays, such as order codes, product names, and timestamps, on a canvas.
- **Video Recording**: Record video streams and save them as files in the specified directory.
- **Device Selection**: Enumerate available camera devices and switch between them.
- **File Saving**: Save recorded videos to a user-specified directory or offer a fallback download option.

---

## Installation

Install the package via npm:

```bash
npm install ngx-packing-camera
```

---

## Usage

### 1. Import the Component

Add the `NgxPackingCameraComponent` to your module:

```typescript
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { NgxPackingCameraComponent } from "ngx-packing-camera";

@NgModule({
  declarations: [NgxPackingCameraComponent],
  imports: [BrowserModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

---

### 2. Add to Template

Use the `NgxPackingCameraComponent` in your Angular template:

```html
<camera-ngx-packing-camera [orderCode]="'ORD12345'" [productName]="'Sample Product'" [mimeType]="'video/webm'" [videoWidth]="720" [videoHeight]="480"></camera-ngx-packing-camera>
```

---

### 3. Component Properties

| **Input**     | **Type** | **Default**    | **Description**                                         |
| ------------- | -------- | -------------- | ------------------------------------------------------- |
| `orderCode`   | `string` | `''`           | The order code to display as an overlay on the video.   |
| `productName` | `string` | `''`           | The product name to display as an overlay on the video. |
| `mimeType`    | `string` | `'video/webm'` | The MIME type for the recorded video.                   |
| `videoWidth`  | `number` | `720`          | The width of the video and canvas.                      |
| `videoHeight` | `number` | `480`          | The height of the video and canvas.                     |

---

### 4. Component Methods

| **Method**         | **Description**                                                              |
| ------------------ | ---------------------------------------------------------------------------- |
| `startRecording()` | Starts recording the video stream and overlays.                              |
| `stopRecording()`  | Stops recording, saves the video to a file, and resets the recorder.         |
| `switchCamera()`   | Switches the video feed to a different camera device using the specified ID. |

---

### 5. Example Workflow

#### Start Recording

Call `startRecording()` to begin recording:

```typescript
@Component({
  ...
})
export class AppComponent {
  @ViewChild('camera') camera!: NgxPackingCameraComponent;

  start() {
    this.camera.startRecording();
  }
}
```

#### Stop Recording

Stop the recording and save the file:

```typescript
stop() {
  this.camera.stopRecording();
}
```

---

## Browser Compatibility

Ensure your application is running on a browser that supports the `MediaRecorder` API.

---

## License

This project is licensed under the [MIT License](LICENSE).

For further details and contributions, check out our [GitHub Repository](https://github.com/huynhhq/packing-camera).
