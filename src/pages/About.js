import ParticlesBackground from "../components/ParticlesBackground";

export default function About() {
  return (
    <div className="relative bg-background min-h-screen py-12 px-6 overflow-hidden">

      
      <ParticlesBackground />

      
      <div className="relative z-10">

        
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black text-gray-900 mb-4">
            Sobre Nosotros
          </h1>

          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Más que una tienda, somos una comunidad para fans de figuras coleccionables.
          </p>
        </div>

        
        <div className="max-w-5xl mx-auto mb-16">
          <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition border border-brand">
            <h2 className="text-2xl font-bold mb-2">
              🎯 Nuestro Objetivo
            </h2>
            <p className="text-gray-600">
              Ser la empresa en la que confíes, ofreciendo precios justos y entregas seguras.
            </p>
          </div>
        </div>

        
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 mb-16">

          {/* MISIÓN */}
          <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition border border-brand">
            <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mb-4">
              <img
                src="https://cdn-icons-png.flaticon.com/512/3891/3891726.png"
                alt="Misión"
                className="w-10"
              />
            </div>

            <h2 className="text-xl font-bold text-brand mb-2">
              Misión
            </h2>

            <p className="text-gray-600">
              Garantizar una experiencia de compra segura, rápida y confiable para todos nuestros clientes.
            </p>
          </div>

          {/* VISIÓN */}
          <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition border border-brand">
            <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mb-4">
              <img
                src="https://cdn-icons-png.freepik.com/512/2985/2985863.png"
                alt="Visión"
                className="w-10"
              />
            </div>

            <h2 className="text-xl font-bold text-brand mb-2">
              Visión
            </h2>

            <p className="text-gray-600">
              Convertirnos en la tienda online líder de figuras coleccionables en el mercado.
            </p>
          </div>

        </div>

        
        <div className="max-w-5xl mx-auto">
          <div className="bg-white border border-brand rounded-2xl p-8 shadow-md hover:shadow-xl transition">

            <h2 className="text-xl font-bold text-brand mb-2">
              💡 ¿Por qué fue creado?
            </h2>

            <p className="text-gray-600">
              Pensamos en ti, en quienes buscan productos únicos. Esta plataforma nace para
              facilitar la compra de figuras especializadas sin complicaciones.
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}