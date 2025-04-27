/* General page styling */
body {
  margin: 0;
  padding: 0;
  background-image: url('https://www.pngkey.com/png/detail/835-8354066_film-strip-border.png');
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  font-family: 'Arial', sans-serif;
  color: white;
  box-sizing: border-box;
  background-color: #101010;
  color: white;
  text-align: center;
}

.container {
  background-color: rgba(0, 0, 0, 0.7);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
  max-width: 800px;
  margin: auto;
}

h1 {
  font-size: 3rem;
  margin-bottom: 20px;
}

h2 {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

/* Video track container styling */
#video-tracks-container {
  margin-top: 20px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
}

.video-track {
  margin-bottom: 20px;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid #444;
  border-radius: 8px;
}

.video-track h3 {
  font-size: 1.2rem;
  margin-bottom: 10px;
}

/* Buttons for each track */
button {
  padding: 6px 12px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin: 10px;
}

button:hover {
  background-color: #555;
}

/* Controls */
.controls {
  margin-top: 20px;
}

button#roll-dice-btn,
button#mix-btn {
  font-size: 16px;
  padding: 10px 20px;
}

#members-count {
  font-size: 1.2rem;
}

#toggle-theme {
  margin-top: 10px;
}

/* Styling for the video preview */
video {
  width: 100%;
  border: 2px solid #fff;
  border-radius: 5px;
  margin-top: 10px;
}

/* Red blinking light indicator */
.recording-indicator {
  width: 12px;
  height: 12px;
  background-color: red;
  border-radius: 50%;
  margin-top: 5px;
  display: none; /* Hidden by default */
}

.recording-indicator.blinking {
  display: inline-block; /* Visible when recording */
  animation: blink 1s infinite; /* Blinking effect */
}

@keyframes blink {
  0%, 50%, 100% {
    opacity: 1;
  }
  25%, 75% {
    opacity: 0;
  }
}

/* Light/Dark mode styling */
body.light-mode {
  background-color: #fff;
  color: black;
}

body.light-mode .container {
  background-color: rgba(255, 255, 255, 0.7);
  color: black;
}

body.light-mode .video-track {
  background-color: rgba(0, 0, 0, 0.05);
  border: 1px solid #444;
}
