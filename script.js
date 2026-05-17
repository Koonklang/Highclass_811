document.addEventListener('DOMContentLoaded', () => {
    const card = document.getElementById('tilt-card');

    // Add 3D Tilt Effect on mousemove
    document.addEventListener('mousemove', (e) => {
        // Calculate mouse position relative to the center of the screen
        const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
        const yAxis = (window.innerHeight / 2 - e.pageY) / 25;

        // Apply transform to card
        card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
    });

    // Reset transform when mouse leaves the window
    document.addEventListener('mouseleave', () => {
        card.style.transform = `rotateY(0deg) rotateX(0deg)`;
        card.style.transition = `transform 0.5s ease`;
    });

    // Remove transition when moving for smoother effect
    document.addEventListener('mouseenter', () => {
        card.style.transition = `none`;
    });

    // Music Player Logic (HTML5 Audio)
    const musicBtn = document.getElementById('music-toggle');
    const bgMusic = document.getElementById('bg-music');
    const musicIcon = musicBtn.querySelector('i');

    const entryOverlay = document.getElementById('entry-overlay');
    const mainContainer = document.querySelector('.container');
    const volumeSlider = document.getElementById('volume-slider');

    // Volume Slider Logic
    bgMusic.volume = volumeSlider.value; // Set initial volume
    volumeSlider.addEventListener('input', (e) => {
        bgMusic.volume = e.target.value;
    });

    // Toggle Music Button
    musicBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent triggering the global startAudio click

        if (!bgMusic.paused) {
            bgMusic.pause();
            musicBtn.classList.remove('playing');
            musicIcon.classList.remove('fa-pause');
            musicIcon.classList.add('fa-music');
        } else {
            bgMusic.play();
            musicBtn.classList.add('playing');
            musicIcon.classList.remove('fa-music');
            musicIcon.classList.add('fa-pause');
        }
    });

    const startAudio = () => {
        // Hide overlay and remove blur immediately
        entryOverlay.classList.add('hidden');
        mainContainer.classList.remove('blurred');

        if (bgMusic.paused) {
            bgMusic.play().then(() => {
                musicBtn.classList.add('playing');
                musicIcon.classList.remove('fa-music');
                musicIcon.classList.add('fa-pause');
            }).catch(e => console.log("Audio play blocked.", e));
        }

        // Remove listeners so it only triggers once
        document.removeEventListener('click', startAudio);
        document.removeEventListener('keydown', startAudio);
    };

    // Listen for the first click or keypress to start
    document.addEventListener('click', startAudio);
    document.addEventListener('keydown', startAudio);

    // Snow Effect Canvas Logic
    const canvas = document.getElementById('snow-canvas');
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = 150;

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2 + 0.5,
            vx: (Math.random() - 0.5) * 1,
            vy: Math.random() * 1 + 0.5
        });
    }

    function drawSnow() {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();

        for (let i = 0; i < particleCount; i++) {
            let p = particles[i];
            ctx.moveTo(p.x, p.y);
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2, true);
        }

        ctx.fill();
        updateSnow();
    }

    function updateSnow() {
        for (let i = 0; i < particleCount; i++) {
            let p = particles[i];
            p.y += p.vy;
            p.x += p.vx;

            // Reset particle if it goes off screen
            if (p.y > height) {
                p.y = -10;
                p.x = Math.random() * width;
            }
            if (p.x > width + 10 || p.x < -10) {
                p.x = Math.random() * width;
            }
        }
    }

    function animateSnow() {
        drawSnow();
        requestAnimationFrame(animateSnow);
    }

    animateSnow();

    // ==========================================
    // Discord Profile Integration (Lanyard API)
    // ==========================================
    // 1. Join the Lanyard Discord server here: https://discord.gg/lanyard
    // 2. Copy your Discord User ID (Enable Developer Mode in Discord settings, right-click your profile -> Copy User ID)
    // 3. Paste it below:
    const DISCORD_USER_ID = "1349278100243877922";

    async function fetchDiscordStatus() {
        // Skip if user hasn't put their ID
        if (!DISCORD_USER_ID) return;

        try {
            const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`);
            const data = await response.json();

            if (data.success) {
                const statusElement = document.querySelector('.discord-status');
                const profileImg = document.querySelector('.profile-img');
                const discordUser = data.data.discord_user;
                const presence = data.data.discord_status; // "online", "idle", "dnd", "offline"

                // Update Status Indicator
                statusElement.className = `discord-status ${presence}`;
                statusElement.title = presence.charAt(0).toUpperCase() + presence.slice(1);

                // Sync Discord Avatar
                if (discordUser.avatar) {
                    const isGif = discordUser.avatar.startsWith('a_');
                    const extension = isGif ? 'gif' : 'png';
                    profileImg.src = `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.${extension}?size=512`;
                }

                // Sync Discord Avatar Decoration (Frame)
                const discordDeco = document.querySelector('.discord-decoration');
                if (discordUser.avatar_decoration_data && discordUser.avatar_decoration_data.asset) {
                    discordDeco.src = `https://cdn.discordapp.com/avatar-decoration-presets/${discordUser.avatar_decoration_data.asset}.png`;
                    discordDeco.style.display = 'block';
                } else if (discordUser.avatar_decoration) {
                    discordDeco.src = `https://cdn.discordapp.com/avatar-decorations/${discordUser.id}/${discordUser.avatar_decoration}.png`;
                    discordDeco.style.display = 'block';
                } else {
                    discordDeco.style.display = 'none';
                }
            }
        } catch (error) {
            console.error("Failed to fetch Discord status:", error);
        }
    }

    // Fetch on load and update every 10 seconds
    fetchDiscordStatus();
    setInterval(fetchDiscordStatus, 10000);
});
