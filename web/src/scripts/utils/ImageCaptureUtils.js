
// crop a dataURL to a rect by loading it into a canvas
const crop = (dataURL, rect) => {
  return new Promise(function(resolve, reject) {
    const {top, left, width, height} = rect

    const img = document.createElement('img')

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      // set canvas dimensions to dest size
      canvas.width = width
      canvas.height = height

      ctx.drawImage(img, left, top, width, height)

      resolve(canvas.toDataURL())
    }

    img.src = dataURL
  })
}

// capturePage expects integers
const roundBoundingRect = ({top, left, width, height}) => ({
  x: parseInt(left),
  y: parseInt(top),
  width: parseInt(width),
  height: parseInt(height),
})

export const captureCurrentPage = (rect, withTimingDetails = false) => {
  rect = rect || {
    x: 0,
    y: 0,
    width: screen.innerWidth,
    height: screen.innerHeight,
  }

  rect = roundBoundingRect(rect)

  return new Promise((resolve, reject) => {
    const startTime = +new Date()

    Electron.remote.getCurrentWebContents()
      .capturePage(rect, async (nativeImage) => {

        if (withTimingDetails) {
          console.log('captured', +new Date() - startTime)
        }

        // Convert to low-res jpg (fastest conversion)
        const jpg = nativeImage.toJPEG(30)

        // Convert to base64
        const buffer = 'data:image/jpeg;base64,' + new Buffer(jpg, 'binary').toString('base64')
        const {width, height} = nativeImage.getSize()

        if (withTimingDetails) {
          console.log('converted', +new Date() - startTime)
        }

        // Crop to a smaller size so blur is faster
        const cropped = await crop(buffer, {
          top: 0,
          left: 0,
          width: width / 16,
          height: height / 16,
        })

        if (withTimingDetails) {
          console.log('cropped', +new Date() - startTime)
        }

        resolve(cropped)
      })
  })
}
