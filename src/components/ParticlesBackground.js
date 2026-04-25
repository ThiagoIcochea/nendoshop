import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

export default function ParticlesBackground() {

  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  return (
    <Particles
      init={particlesInit}
      options={{
        fullScreen: {
          enable: false
        },

        background: {
          color: "transparent"
        },

        particles: {
          number: {
            value: 70,
            density: {
              enable: true,
              area: 800
            }
          },

          color: {
            value: ["#38bdf8", "#a855f7", "#22c55e"]
          },

          shape: {
            type: "circle"
          },

          opacity: {
            value: 0.7,
            random: true
          },

          size: {
            value: { min: 2, max: 6 },
            random: true
          },

          links: {
            enable: true,
            color: "#60a5fa",
            distance: 140,
            opacity: 0.35,
            width: 1
          },

          move: {
            enable: true,
            speed: 1.2,
            direction: "none",
            outModes: {
              default: "out"
            }
          }
        },

        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: "grab"
            },
            onClick: {
              enable: true,
              mode: "push"
            }
          },
          modes: {
            grab: {
              distance: 160,
              links: {
                opacity: 0.5
              }
            },
            push: {
              quantity: 3
            }
          }
        }
      }}

      className="absolute inset-0 z-0"
    />
  );
}