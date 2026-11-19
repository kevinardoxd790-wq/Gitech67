import PerfumesSection from "@/components/features/PerfumesSection";
import { usePerfumeTheme } from "@/hooks/usePerfumeZone";

export default function Perfumes() {
  const { perfumeGender } = usePerfumeTheme();
  const isHombre = perfumeGender === "hombre";

  return (
    <div
      className={`pt-16 min-h-screen transition-colors duration-500 ${
        isHombre ? "bg-[#EEF7F2]" : "bg-[#FFF1F6]"
      }`}
    >
      <PerfumesSection standalone />
    </div>
  );
}
