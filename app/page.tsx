import { TapInterface } from "@/components/tap-interface"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/40 to-blue-900/60 relative overflow-hidden">
      {/* Futuristic background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-blue-600/20 opacity-50" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_10%_10%,rgba(0,255,255,0.1),transparent_40%)]" />
      <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_90%_90%,rgba(128,0,128,0.1),transparent_40%)]" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Frosted glass overlay */}
      <div className="absolute inset-0 backdrop-blur-[2px] bg-black/30" />

      {/* Main content */}
      <div className="relative z-10">
        <TapInterface />
      </div>
    </div>
  )
}
