
function InitialChanges() {
    var textGreetings = "Hey there, pal!";

    if (localStorage.DetectedAge !== undefined && localStorage.DetectedAge >= 0) {
        var currentGenerationDetected = generations[localStorage.DetectedAge];
        var shortName = currentGenerationDetected.shortName;
        var desc = currentGenerationDetected.description;
        var rate = currentGenerationDetected.speechRate;

        var textBelongTo = "Looks like you belong to";
        var displayText = `${textGreetings} \n\n${textBelongTo} ${shortName}. \n${desc}`;
        $("#detectionInfo").text(displayText);
        var text = `${textGreetings} ${textBelongTo} ${shortName} . ${desc}`;
        speak(text, rate);
    }
    else {
        var textBelongTo = "Looks like you are extraterrestrial!";
        var textDesc = "Just kidding, it appears there are multiple faces detected or the face detection might have experienced a glitch. You can try again.";

        var displayText = `${textGreetings} \n\n${textBelongTo} \n${textDesc}`;
        $("#detectionInfo").text(displayText);
        var text = `${textGreetings} ${textBelongTo} ${textDesc}.`;
        speak(text, 1.1);
    }

    localStorage.clear();
}

function speak(text, rate) {
    const speechSynth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);

    const voices = speechSynth.getVoices();
    utterance.voice = voices[0];
    utterance.rate = rate;

    speechSynth.cancel();
    speechSynth.speak(utterance);
}