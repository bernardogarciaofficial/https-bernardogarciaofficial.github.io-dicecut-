/* Style for video tracks */
.video-track {
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 10px;
}

.video-track.selected {
  border: 2px solid #008CBA; /* Visual feedback for selected track */
  background-color: #f0f8ff;
}

.video-track video {
  width: 100%;
  border-radius: 10px;
  display: block;
  margin-top: 10px;
}

/* Styling for controls */
.control-buttons {
  margin-top: 20px;
}

.controls button {
  margin: 5px;
}

/* Recording indicator animation */
.recording-indicator {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: red;
  margin-left: 10px;
  opacity: 0;
  animation: blink 1s infinite;
}

.recording-indicator.blinking {
  opacity: 1;
}

@keyframes blink {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
