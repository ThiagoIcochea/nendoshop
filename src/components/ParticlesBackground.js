export default function ParticlesBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-purple-100 opacity-80" />
      <div className="absolute -left-8 top-10 h-24 w-24 rounded-full bg-purple-200 opacity-40 blur-2xl" />
      <div className="absolute right-10 top-1/4 h-28 w-28 rounded-full bg-purple-300 opacity-20 blur-3xl" />
      <div className="absolute left-1/4 bottom-16 h-16 w-16 rounded-full bg-purple-200 opacity-30 blur-2xl" />
      <div className="absolute right-16 bottom-24 h-12 w-12 rounded-full bg-purple-300 opacity-25 blur-2xl" />
      <div className="absolute inset-0 grid grid-cols-8 gap-8 p-12">
        {Array.from({ length: 20 }).map((_, index) => (
          <span
            key={index}
            className="block h-1 w-1 rounded-full bg-purple-300 opacity-40"
          />
        ))}
      </div>
    </div>
  );
}
