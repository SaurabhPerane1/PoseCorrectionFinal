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
    const leftHip = landmarks[23];
    const leftKnee = landmarks[25];
    const leftAnkle = landmarks[27];
    const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);

    // Right elbow angle
    const rightHip = landmarks[24];
    const rightKnee = landmarks[26];
    const rightAnkle = landmarks[28];
    const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);

    const leftKneePos = {
      x: leftKnee.x * canvasElement.width,
      y: leftKnee.y * canvasElement.height,
    };
    const rightKneePos = {
      x: rightKnee.x * canvasElement.width,
      y: rightKnee.y * canvasElement.height,
    };

    // Draw angles
    canvasCtx.font = '20px Arial';
    canvasCtx.fillStyle = 'yellow';
    canvasCtx.fillText(`${leftKneeAngle.toFixed(1)}°`, leftKnee.x * canvasElement.width, leftKnee.y * canvasElement.height - 10);
    canvasCtx.fillText(`${rightKneeAngle.toFixed(1)}°`, rightKnee.x * canvasElement.width, rightKnee.y * canvasElement.height - 10);

    // Check if both angles are in range
    if (leftKneeAngle < 65) {
      canvasCtx.fillStyle = 'lime';
      canvasCtx.font = '30px Arial';
      canvasCtx.fillText('Now Push Yourself Up', leftKneePos.x, leftKneePos.y - 10);
    }
    else if (leftKneeAngle > 145) {
      canvasCtx.fillStyle = 'lime';
      canvasCtx.font = '30px Arial';
      canvasCtx.fillText('Ok, Now Push Yourself Down', leftKneePos.x, leftKneePos.y - 10);
    }
    else{
      canvasCtx.fillStyle = 'lime';
      canvasCtx.font = '30px Arial';
      canvasCtx.fillText('Ok', leftKneePos.x, leftKneePos.y - 10);
    }
    if (rightElbowAngle < 65) {
      canvasCtx.fillStyle = 'lime';
      canvasCtx.font = '30px Arial';
      canvasCtx.fillText('Now Push Yourself Up', rightKneePos.x, rightKneePos.y - 10);
    }
    else if (rightElbowAngle > 145) {
      canvasCtx.fillStyle = 'lime';
      canvasCtx.font = '30px Arial';
      canvasCtx.fillText('Ok, Now Push Yourself Down', rightKneePos.x, rightKneePos.y - 10);
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
