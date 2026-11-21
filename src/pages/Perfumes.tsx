import PerfumesSection from "@/components/features/PerfumesSection";
import { usePerfumeTheme } from "@/hooks/usePerfumeZone";

export default function Perfumes() {
  const { perfumeGender } = usePerfumeTheme();
  const isHombre = perfumeGender === "hombre";

  return (
    <div
      className={`pt-16 min-h-screen transition-colors duration-700 ease-in-out ${
        isHombre ? "bg-[#F7F5EE]" : "bg-[#FDF2F0]"
      }`}
    >
      <PerfumesSection standalone />
    </div>
  );
}
