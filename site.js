var ageDetectionScoreLimit = 0.7;
var averageDetectionsDone = 6;
localStorage.DetectedAge = -1;

const video = document.getElementById("video");

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    faceapi.nets.faceExpressionNet.loadFromUri("/models"),
    faceapi.nets.ageGenderNet.loadFromUri("/models"),
]).then(startVideo);

function startVideo() {
    navigator.getUserMedia(
        { video: {} },
        stream => video.srcObject = stream,
        err => console.error(err)
    );
};

window.addEventListener("orientationchange", function () {
    SetCanvas(screen.orientation.type);
});

video.addEventListener("play", () => {

    var ageAddition = 0;
    var ageCount = 0;
    var multipleFacesDetected = false;

    setInterval(async () => {

        var dimensions = SetCanvas("portrait");
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions()
            .withAgeAndGender();

        const resizedDetections = faceapi.resizeResults(detections, dimensions.displaySize);
        canvas.getContext("2d").clearRect(0, 0, dimensions.canvas.width, dimensions.canvas.height);
        faceapi.draw.drawDetections(dimensions.canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(dimensions.canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(dimensions.canvas, resizedDetections);

        resizedDetections.forEach(detection => {
            const box = detection.detection.box
            var age = Math.round(detection.age);
            var ageText = age > 1 ? " years old " : " year old ";
            const drawBox = new faceapi.draw.DrawBox(box, { label: age + ageText + detection.gender })
            drawBox.draw(dimensions.canvas)

            if (detections.length === 1
                && ageAddition !== -1 && ageCount !== -1) {
                if (detection.detection.score > ageDetectionScoreLimit) {
                    ageAddition += age;
                    ageCount += 1;
                }
            }
            else {
                multipleFacesDetected = true;
            }

            if (ageCount > averageDetectionsDone) {
                var averageAge = multipleFacesDetected ? -1 : ageAddition / ageCount;
                var ageRangeGenerationIndex = -1;
                generations.map(function (p, index) {
                    if (p.min <= averageAge && averageAge <= p.max) {
                        ageRangeGenerationIndex = index;
                    }
                });

                ageAddition = 0;
                ageCount = 0;
                localStorage.DetectedAge = ageRangeGenerationIndex;
                window.location.href = "generationDetected.html";
            }
        });

    }, 1000);
});

var canvas;
function SetCanvas(orientation) {
    if (canvas != undefined) {
        document.body.removeChild(canvas);
    }

    canvas = faceapi.createCanvasFromMedia(video);
    document.body.appendChild(canvas);

    var finalWidth = video.width;
    if (orientation !== "" &&
        isMobile() &&
        isPortrait(orientation)) {
        finalWidth = video.width - (video.width - video.videoWidth);
    }

    const displaySize = {
        width: finalWidth,
        height: video.height
    };

    faceapi.matchDimensions(canvas, displaySize);

    return {
        displaySize: displaySize,
        canvas: canvas

    }
}

function isMobile() {
    const regex = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    return regex.test(navigator.userAgent);
}

function isPortrait(orientation) {
    const regex = /portrait/i;
    return regex.test(orientation);
}