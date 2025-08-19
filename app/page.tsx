import { TapInterface } from "@/components/tap-interface"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-yellow-900/20 to-gray-900 relative overflow-hidden">
      {/* Frosted golden background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-yellow-600/5" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,215,0,0.1),transparent_50%)]" />
      <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(255,193,7,0.08),transparent_50%)]" />

      {/* Frosted glass overlay */}
      <div className="absolute inset-0 backdrop-blur-[1px] bg-black/20" />

      {/* Main content */}
      <div className="relative z-10">
        <TapInterface />
      </div>
    </div>
  )
}
