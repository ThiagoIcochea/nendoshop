export default function ParticlesBackground() {

  const particles = Array.from({ length: 55 }).map((_, i) => ({
    id: i,
    size: Math.random() * 5 + 4,
    top: Math.random() * 100,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    color: [
      "#8b5cf6",
      "#22d3ee",
      "#84cc16",
      "#a855f7",
      "#06b6d4"
    ][Math.floor(Math.random() * 5)]
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-white">

      <style>
        {`
          @keyframes floatParticle {
            0% {
              transform: translate3d(0px, 0px, 0px);
            }

            25% {
              transform: translate3d(18px, -18px, 0px);
            }

            50% {
              transform: translate3d(-18px, -35px, 0px);
            }

            75% {
              transform: translate3d(20px, 10px, 0px);
            }

            100% {
              transform: translate3d(0px, 0px, 0px);
            }
          }
        `}
      </style>

      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full will-change-transform"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            top: `${p.top}%`,
            left: `${p.left}%`,
            backgroundColor: p.color,
            opacity: 0.85,
            animation: `floatParticle 4.5s linear infinite`,
            animationDelay: `${p.delay}s`,
            transform: "translate3d(0,0,0)"
          }}
        />
      ))}

    </div>
  );
}