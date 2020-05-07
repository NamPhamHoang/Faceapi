const video = document.getElementById('video')
let predictedAges = []
let gender = []
var context = document.getElementById("context")
var img = document.querySelector("img")
let attendance = []
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models'),
  faceapi.nets.ageGenderNet.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(startVideo)

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi
    .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceExpressions()
    .withAgeAndGender()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw. drawFaceLandmarks(canvas, resizedDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
    const age = resizedDetections[0].age
    const gender = resizedDetections[0].gender
    const topLeft = {
      x: resizedDetections[0].detection.box.topLeft.x,
      y: resizedDetections[0].detection.box.topLeft.y
    }
    const bottomRight = {
      x: resizedDetections[0].detection.box.bottomRight.x,
      y: resizedDetections[0].detection.box.bottomRight.y
    }
    const topRight = {
      x: resizedDetections[0].detection.box.topRight.x,
      y: resizedDetections[0].detection.box.topRight.y
    }
    new faceapi.draw.DrawTextField(
      gender,
      topRight
    ).draw(canvas)
    new faceapi.draw.DrawTextField(
      [`${faceapi.utils.round(age, 0)} year`],
      bottomRight
    ).draw(canvas)
    // new faceapi.draw.DrawTextField(
    //   "HoangNam",
    //   topLeft
    //   ).draw(canvas)
  }, 100)
})

function interpolateAgePrediction(age) {
  predictedAges = [age].concat(predictedAges).slice(0,30);
  const avgPre = predictedAges.reduce((total,a)=> total+a)/ predictedAges.length;
  return avgPre
}

document.getElementById('snap').addEventListener("click", ()=>{
  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.right = "0"
  document.body.append(container)
  var getContext = context.getContext('2d')
  getContext.drawImage(video,0,0,640,640);
  imgDataURL = context.toDataURL("image/png");
  img.setAttribute('src', imgDataURL )
  let image = document.querySelector("img")
  image.addEventListener('click', async () => {
    const LabeledFaceDescriptors = await loadLabeledImages()
    const faceMatcher = new faceapi.FaceMatcher(LabeledFaceDescriptors, 0.6)
    const canvas = faceapi.createCanvasFromMedia(image)
    canvas.style.position = 'absolute'
    container.append(canvas)
    const displaySize = {width:image.width, height:image.height}
    const detections = await faceapi.detectAllFaces(image)
    .withFaceLandmarks()
    .withFaceDescriptors()
    const resizedDetections = faceapi.resizeResults(detections,displaySize)
    const results = resizedDetections.map( d => faceMatcher.findBestMatch(d.descriptor))
    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box
      const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
      console.log(result.label)
      attendance.push(result.label)
      drawBox.draw(canvas)
      })
  })
})

function loadLabeledImages() {
  const labels = ['Lê Tiến Đạt - 1234', 'Nguyễn Tấn Dũng - 3306', 'Phạm Hoàng Nam - 3780', 'Võ Quốc Trung - 3728']
  return Promise.all(
    labels.map(async label => {
      const descriptions = []
      for (let i = 1; i <= 8; i++) {
        try{
          const img = await faceapi.fetchImage(`/models/labeled_images/${label}/${i}.jpg`)
          const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
          descriptions.push(detections.descriptor)
        }catch(err) {
          console.log(err)
          break
        } 
      }
      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}

// function saveData(fileName, data) {
//   fileManager.createNewFile("temp.txt")
//   fs.writeFile(fileName, data , (err, data) => {
//       if(err) throw err;
//       console.log("Saved to success")
//   })
// }
