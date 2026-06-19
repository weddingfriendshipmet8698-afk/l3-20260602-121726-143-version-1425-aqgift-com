let hlsLoaderPromise = null;

const loadHlsLibrary = () => {
    if (window.Hls) {
        return Promise.resolve(window.Hls);
    }

    if (hlsLoaderPromise) {
        return hlsLoaderPromise;
    }

    hlsLoaderPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js";
        script.async = true;
        script.onload = () => resolve(window.Hls);
        script.onerror = reject;
        document.head.appendChild(script);
    });

    return hlsLoaderPromise;
};

export const initMoviePlayer = ({ video, overlay, button, source }) => {
    if (!video || !source) {
        return;
    }

    let ready = false;

    const prepare = async () => {
        if (ready) {
            return;
        }

        ready = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return;
        }

        try {
            const Hls = await loadHlsLibrary();
            if (Hls && Hls.isSupported()) {
                const hls = new Hls();
                hls.loadSource(source);
                hls.attachMedia(video);
                return;
            }
        } catch (error) {
            ready = false;
        }

        video.src = source;
    };

    const start = async () => {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        await prepare();
        try {
            await video.play();
        } catch (error) {
            video.controls = true;
        }
    };

    if (overlay) {
        overlay.addEventListener("click", start);
    }

    if (button) {
        button.addEventListener("click", start);
    }

    video.addEventListener("click", () => {
        if (video.paused) {
            start();
        }
    });
};
