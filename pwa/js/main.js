let previousScannedCode = undefined;

window.onload = () => {
  'use strict';

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('./sw.js');
  }
}

function doReset(codeReader) {
  console.log('Reset.');
  codeReader.reset();
  setAlertVisibility('alert-reset');
}

function handleResult(result) {
  console.log('Found code!', result)
  if ((typeof previousScannedCode !== 'undefined') && (previousScannedCode.text === result.text)) {
    // Code was read previously
    console.log('Read previous code')
  }
  else {
    document.getElementById('processing-text').innerText = "Code gelesen: " + result.text + ". Prüfe Status...";
  }
  previousScannedCode = result;
}

function setAlertVisibility(alertID) {
  var alertList = document.querySelectorAll('.alert')
  alertList.forEach(function (alert) {
    if (!alert.classList.contains('visually-hidden')) {  // Set all alerts invisible
      alert.classList.add('visually-hidden');
    }
    if (alert.id === alertID) {  // Make requested alert visible
      alert.classList.remove('visually-hidden');
    }
})
}

function decodeContinuously(codeReader, selectedDeviceId) {
  codeReader.decodeFromInputVideoDeviceContinuously(selectedDeviceId, 'video', (result, err) => {
    if (result) {
      handleResult(result);
    }

    if (err) {
      // As long as this error belongs into one of the following categories
      // the code reader is going to continue as excepted. Any other error
      // will stop the decoding loop.
      //
      // Excepted Exceptions:
      //
      //  - NotFoundException
      //  - ChecksumException
      //  - FormatException

      if (err instanceof ZXing.NotFoundException) {
        console.log('No code found.')
      }

      if (err instanceof ZXing.ChecksumException) {
        console.log('A code was found, but it\'s read value was not valid.')
      }

      if (err instanceof ZXing.FormatException) {
        console.log('A code was found, but it was in a invalid format.')
      }
    }
  })
}

window.addEventListener('load', function () {
  let selectedDeviceId;
  const codeReader = new ZXing.BrowserDatamatrixCodeReader()
  console.log('ZXing code reader initialized')

  codeReader.getVideoInputDevices()
    .then((videoInputDevices) => {
      const sourceSelect = document.getElementById('sourceSelect')
      selectedDeviceId = videoInputDevices[0].deviceId
      if (videoInputDevices.length >= 1) {
        videoInputDevices.forEach((element) => {
          const sourceOption = document.createElement('option')
          sourceOption.text = element.label
          sourceOption.value = element.deviceId
          sourceSelect.appendChild(sourceOption)
        })

        sourceSelect.onchange = () => {
          selectedDeviceId = sourceSelect.value;
        };
      }

      document.getElementById('startButton').addEventListener('click', () => {
        console.log(`Started decode from camera with id ${selectedDeviceId}`)
        setAlertVisibility('alert-processing');
        decodeContinuously(codeReader, selectedDeviceId);
      })

      document.getElementById('resetButton').addEventListener('click', () => {
        doReset(codeReader);
      })

    })
    .catch((err) => {
      console.error(err)
    })
})