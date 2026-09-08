/** Sayfanin arkasindaki dekoratif isik/izgara katmani (tamamen CSS, performansi etkilemez) */
export function ArkaPlan() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Derinlik gradyani */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,#101a33_0%,#070b16_45%,#05070f_100%)]" />

      {/* Renkli isik lekeleri */}
      <div className="animate-nabiz absolute -top-40 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-vurgu-600/25 blur-[120px]" />
      <div
        className="animate-nabiz absolute -left-32 top-1/3 h-[26rem] w-[26rem] rounded-full bg-mor-600/20 blur-[110px]"
        style={{ animationDelay: "1.2s" }}
      />
      <div
        className="animate-nabiz absolute -right-24 top-2/3 h-[24rem] w-[24rem] rounded-full bg-cyan-500/12 blur-[110px]"
        style={{ animationDelay: "2.1s" }}
      />

      {/* Ince izgara dokusu */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #94a3b8 1px, transparent 1px), linear-gradient(to bottom, #94a3b8 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(70% 55% at 50% 30%, #000 40%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(70% 55% at 50% 30%, #000 40%, transparent 100%)",
        }}
      />
    </div>
  );
}
