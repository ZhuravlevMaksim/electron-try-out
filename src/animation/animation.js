document.addEventListener('drop', (event) => {
    event.preventDefault();
    event.stopPropagation();
    for (const f of event.dataTransfer.files) {
        drawImage(f.path)
    }
});

function drawImage(path) {

    const img = new Image()
    img.src = path

    img.addEventListener('load', () => {
        const canvas = document.getElementById("canvas")
        const ctx = canvas.getContext('2d')

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        canvas.width = 1000
        canvas.height = 900

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        const pArray = []
        const pNumber = 5000

        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height)
        // ctx.clearRect(0, 0, canvas.width, canvas.height)
        const mappedImage = []

        for (let y = 0; y < canvas.height; y++) {
            const row = [];
            for (let x = 0; x < canvas.width; x++) {
                const red = pixels.data[(y * 4 * pixels.width) + (x * 4)];
                const green = pixels.data[(y * 4 * pixels.width) + (x * 4 + 1)];
                const blue = pixels.data[(y * 4 * pixels.width) + (x * 4 + 2)];
                const bright = calculateRelativeBrightness(red, green, blue);
                const cell = [
                    bright
                ]
                row.push(cell)
            }
            mappedImage.push(row)
        }

        function calculateRelativeBrightness(red, green, blue) {
            return Math.sqrt((red * red) * 0.299 +
                (green * green) * 0.587 +
                (blue * blue) * 0.114
            ) / 100
        }

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width
                this.y = 0
                this.speed = 0
                this.velosity = Math.random() * 1.5
                this.size = Math.random() * 0.5 + 1
                this.pos1 = Math.floor(this.y)
                this.pos2 = Math.floor(this.x)
            }

            update() {
                this.pos1 = Math.floor(this.y)
                this.pos2 = Math.floor(this.x)
                this.speed = mappedImage[this.pos1][this.pos2][0]
                const movement = (2.5 - this.speed) + this.velosity

                this.y += movement;
                if (this.y >= canvas.height) {
                    this.y = 0
                    this.x = Math.random() * canvas.width
                }
            }

            draw() {
                ctx.beginPath()
                ctx.fillStyle = 'white'
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
                ctx.fill()
            }
        }

        function init() {
            for (let i = 0; i < pNumber; i++) {
                pArray.push(new Particle())
            }
        }

        init()

        function animate() {
            // ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
            ctx.globalAlpha = 0.05
            ctx.fillStyle = 'rgb(0,0,0)'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.globalAlpha = 0.2
            for (let i = 0; i < pArray.length; i++) {
                pArray[i].update()
                ctx.globalAlpha = pArray[i].speed
                pArray[i].draw()
            }
            requestAnimationFrame(animate)
        }

        animate()
    })

}