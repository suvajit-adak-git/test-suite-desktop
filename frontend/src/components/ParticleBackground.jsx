import React, { useEffect, useRef } from 'react';

const ParticleBackground = () => {
    const canvasRef = useRef(null);
    const mouse = useRef({
        x: null,
        y: null,
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particlesArray = [];

        const handleMouseMove = (event) => {
            mouse.current.x = event.x;
            mouse.current.y = event.y;
        };

        window.addEventListener('mousemove', handleMouseMove);

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        // Initial resize
        resizeCanvas();

        // Particle Class
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 3 + 1; // Random size between 1 and 4
                this.speedX = Math.random() * 1 - 0.5; // Speed between -0.5 and 0.5
                this.speedY = Math.random() * 1 - 0.5;
                this.color = 'rgba(138, 43, 226, 0.5)'; // Violet, semi-transparent
            }

            update() {
                if (mouse.current.x && mouse.current.y) {
                    const dx = mouse.current.x - this.x;
                    const dy = mouse.current.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 100) {
                        this.x += dx / 20;
                        this.y += dy / 20;
                    }
                }

                this.x += this.speedX;
                this.y += this.speedY;

                // Boundary detection (bounce off walls)
                if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
                if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const initParticles = () => {
            particlesArray = [];
            const numberOfParticles = 100; // Adjust for density
            for (let i = 0; i < numberOfParticles; i++) {
                particlesArray.push(new Particle());
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
                particlesArray[i].draw();
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        initParticles();
        animate();

        const handleResize = () => {
            resizeCanvas();
            initParticles(); // Re-initialize particles on resize to avoid stretching
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            id="bg-canvas"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1, // Ensure it stays behind content
                pointerEvents: 'none' // Allow clicks to pass through
            }}
        />
    );
};

export default ParticleBackground;
