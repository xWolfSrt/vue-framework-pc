function resize(window, document) {
    function resize() {
        var ww = window.innerWidth
        if (ww > window.screen.width) {
            window.requestAnimationFrame(resize)
        } else {
            if (ww < 1280) {
                ww = 1280
            }
            let base = (ww * 16) / 1280
            // console.log('base: ' + base)
            // document.documentElement.style.fontSize = base + 'px'

            try {
                window.baseFontSize = base
            } catch (error) {}
        }
    }

    resize()

    window.addEventListener('resize', resize)
}

resize(window, document)
