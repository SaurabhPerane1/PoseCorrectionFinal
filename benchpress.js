const videoElement = document.getElementById('input_video');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');

// Initialize Holistic
const holistic = new Holistic({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
});

holistic.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  refineFaceLandmarks: false,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});



function calculateAngle(a, b, c) {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };

  const dot = ab.x * cb.x + ab.y * cb.y;
  const magAB = Math.sqrt(ab.x ** 2 + ab.y ** 2);
  const magCB = Math.sqrt(cb.x ** 2 + cb.y ** 2);

  const cosineAngle = dot / (magAB * magCB);
  let angle = Math.acos(cosineAngle);

  return (angle * 180) / Math.PI; // Convert to degrees
}




// Draw results on canvas
function onResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  if (results.poseLandmarks) {
    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 4 });
    drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#FF0000', lineWidth: 2 });
  }

  if (results.faceLandmarks) {
    drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION, { color: '#C0C0C070', lineWidth: 1 });
  }

  if (results.leftHandLandmarks) {
    drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS, { color: '#CC0000', lineWidth: 2 });
    drawLandmarks(canvasCtx, results.leftHandLandmarks, { color: '#00FF00', lineWidth: 2 });
  }

  if (results.rightHandLandmarks) {
    drawConnectors(canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS, { color: '#00CC00', lineWidth: 2 });
    drawLandmarks(canvasCtx, results.rightHandLandmarks, { color: '#FF0000', lineWidth: 2 });
  }

  if (results.poseLandmarks) {
    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 4 });
    drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#FF0000', lineWidth: 2 });

    const landmarks = results.poseLandmarks;

    // Left elbow angle
    const leftShoulder = landmarks[11];
    const leftElbow = landmarks[13];
    const leftWrist = landmarks[15];
    const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);

    // Right elbow angle
    const rightShoulder = landmarks[12];
    const rightElbow = landmarks[14];
    const rightWrist = landmarks[16];
    const rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);

    const leftElbowPos = {
      x: leftElbow.x * canvasElement.width,
      y: leftElbow.y * canvasElement.height,
    };
    const rightElbowPos = {
      x: rightElbow.x * canvasElement.width,
      y: rightElbow.y * canvasElement.height,
    };

    // Draw angles
    canvasCtx.font = '20px Arial';
    canvasCtx.fillStyle = 'yellow';
    canvasCtx.fillText(`${leftElbowAngle.toFixed(1)}°`, leftElbow.x * canvasElement.width, leftElbow.y * canvasElement.height - 10);
    canvasCtx.fillText(`${rightElbowAngle.toFixed(1)}°`, rightElbow.x * canvasElement.width, rightElbow.y * canvasElement.height - 10);

    // Check if both angles are in range
    if (leftElbowAngle < 70) {
      canvasCtx.fillStyle = 'lime';
      canvasCtx.font = '30px Arial';
      canvasCtx.fillText('Now, Pull Up', leftElbowPos.x, leftElbowPos.y - 10);
    }
    else if (leftElbowAngle > 145) {
      canvasCtx.fillStyle = 'lime';
      canvasCtx.font = '30px Arial';
      canvasCtx.fillText('Ok, Now Pull Down', leftElbowPos.x, leftElbowPos.y - 10);
    }
    else{
      canvasCtx.fillStyle = 'lime';
      canvasCtx.font = '30px Arial';
      canvasCtx.fillText('Ok', leftElbowPos.x, leftElbowPos.y - 10);
    }
    if (rightElbowAngle < 70) {
      canvasCtx.fillStyle = 'lime';
      canvasCtx.font = '30px Arial';
      canvasCtx.fillText('Now, Pull Up', rightElbowPos.x, rightElbowPos.y - 10);
    }
    else if (rightElbowAngle > 145) {
      canvasCtx.fillStyle = 'lime';
      canvasCtx.font = '30px Arial';
      canvasCtx.fillText('Ok, Now Pull Down', rightElbowPos.x, rightElbowPos.y - 10);
    }
    else{
      canvasCtx.fillStyle = 'lime';
      canvasCtx.font = '30px Arial';
      canvasCtx.fillText('Ok', canvasElement.width / 2 - 20, 50);
    }
  }

  

  canvasCtx.restore();
}

holistic.onResults(onResults);

// Use Camera class to continuously stream
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await holistic.send({ image: videoElement });
  },
  width: 1024,
  height: 600
});
camera.start();

// Resize canvas once video is ready
videoElement.addEventListener('loadeddata', () => {
  canvasElement.width = videoElement.videoWidth;
  canvasElement.height = videoElement.videoHeight;
});
