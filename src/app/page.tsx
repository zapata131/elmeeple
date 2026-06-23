export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5F0E9] text-[#3A3A3A] flex flex-col justify-center items-center p-6 text-center">
      <main className="max-w-xl flex flex-col gap-6 items-center">
        <div className="text-6xl mb-2">🎲</div>
        <h1 className="text-5xl font-extrabold tracking-tight text-[#3A3A3A]">
          El Meeple
        </h1>
        <p className="text-xl font-medium text-[#8367C7]">
          ¿Dónde jugamos hoy? Tu guía de cafés de juegos y tiendas TCG
        </p>
        <p className="text-[#3A3A3A]/80 max-w-md">
          Encuentra los mejores locales para jugar juegos de mesa, cartas coleccionables y conocer a tu comunidad local en LATAM y España.
        </p>
        <button className="mt-4 px-6 py-3 bg-[#73D8D4] hover:bg-[#5ec4c0] text-[#3A3A3A] font-bold rounded-lg shadow-md transition-all duration-200">
          Explorar el Mapa
        </button>
      </main>
    </div>
  )
}
