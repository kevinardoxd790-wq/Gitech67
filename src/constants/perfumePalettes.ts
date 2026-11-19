export interface PerfumeCardPalette {
  // Card (cuadro) & button tokens in Perfumes grid
  card: string;
  imageBg: string;
  overlayBg: string;
  eyebrow: string;
  availableText: string;
  title: string;
  description: string;
  divider: string;
  price: string;
  shippingBadge: string;
  btnDisabled: string;
  btnInCart: string;
  btnDefault: string;

  // Full detail view & header tokens when opening that perfume's details
  detailShellBg: string;
  detailPageBg: string;
  detailBorder: string;
  detailShadow: string;
  detailBoxBg: string;
  detailBackLink: string;
  detailMuted: string;
  detailFeatureText: string;
  detailCtaDisabled: string;
  detailCtaInCart: string;
  detailCtaDefault: string;
  detailRelatedCard: string;
  detailNavBg: string;
  detailNavLink: string;
  detailNavLinkActive: string;
  detailNavIcon: string;
  detailNavInput: string;
  detailNavClear: string;
  detailNavCartBox: string;
  detailNavCartBtn: string;
  detailNavMobilePanel: string;
  detailNavMobileLink: string;
  detailNavDropdown: string;
  detailNavDropdownHead: string;
  detailNavDropdownHover: string;
  detailNavDropdownFoot: string;
  detailFlashBorder: string;
  detailFlashGradient: string;
  detailFlashIcon: string;
  detailFlashText: string;
  detailFlashClock: string;
}

const HOMBRE_FALLBACK_PALETTE: PerfumeCardPalette = {
  card: "bg-white border-[#C8E0D4] shadow-[0_8px_28px_rgba(6,48,32,0.06)] hover:shadow-[0_16px_40px_rgba(6,48,32,0.15)]",
  imageBg: "bg-[#EEF7F2]",
  overlayBg: "bg-[#042417]/60",
  eyebrow: "text-[#0C593B]",
  availableText: "text-emerald-700",
  title: "text-[#05291B] group-hover:text-[#0F6140]",
  description: "text-[#355E4D]",
  divider: "border-[#DCEEE4]",
  price: "text-[#063020]",
  shippingBadge: "text-emerald-700",
  btnDisabled: "bg-[#E2EFE8] text-[#7A9C8C] cursor-not-allowed",
  btnInCart:
    "bg-[#E2F1E9] border border-[#0B4A31] text-[#0B4A31] hover:bg-[#0B4A31] hover:text-white",
  btnDefault:
    "bg-[#0B4A31] text-[#F7FBF9] hover:bg-[#116443] shadow-[0_6px_18px_rgba(11,74,49,0.24)]",

  detailShellBg: "bg-[#EEF7F2] text-[#063020]",
  detailPageBg:
    "bg-gradient-to-b from-[#EEF7F2] via-[#F7FBF9] to-[#E2F0E9] text-[#063020]",
  detailBorder: "border-[#C5DFD1]",
  detailShadow: "shadow-[0_18px_45px_rgba(6,48,32,0.10)]",
  detailBoxBg: "bg-white/95",
  detailBackLink: "text-[#0C593B] hover:text-[#063020]",
  detailMuted: "text-[#4D7866]",
  detailFeatureText: "text-[#144431]",
  detailCtaDisabled: "bg-[#E2EFE8] text-[#7A9C8C] cursor-not-allowed",
  detailCtaInCart:
    "bg-[#E2F1E9] border-2 border-[#0B4A31] text-[#0B4A31] hover:bg-[#0B4A31] hover:text-white",
  detailCtaDefault:
    "bg-[#0B4A31] hover:bg-[#116443] text-[#F7FBF9] shadow-[0_10px_28px_rgba(11,74,49,0.25)]",
  detailRelatedCard: "bg-white border-[#C5DFD1] hover:border-[#0B4A31]",
  detailNavBg:
    "bg-[#EEF7F2]/95 border-[#C5DFD1] shadow-[0_4px_20px_rgba(6,48,32,0.08)]",
  detailNavLink: "font-playfair text-[#285240] hover:text-[#063020]",
  detailNavLinkActive:
    "font-playfair text-[#063020] border-b-2 border-[#0B4A31] pb-0.5",
  detailNavIcon: "text-[#0B4A31]",
  detailNavInput:
    "bg-white border-[#C5DFD1] text-[#063020] placeholder-[#6B9382] focus:border-[#0B4A31]",
  detailNavClear: "text-[#4D7866] hover:text-[#063020]",
  detailNavCartBox: "bg-white border border-[#C5DFD1] hover:border-[#0B4A31]",
  detailNavCartBtn: "bg-[#0B4A31] hover:bg-[#116443] text-[#F7FBF9]",
  detailNavMobilePanel: "bg-[#F7FBF9] border-[#C5DFD1]",
  detailNavMobileLink: "font-playfair border-[#D4E7DC] text-[#285240] hover:text-[#063020]",
  detailNavDropdown:
    "bg-[#F7FBF9] border-[#C5DFD1] text-[#063020] shadow-[0_18px_42px_rgba(6,48,32,0.20)]",
  detailNavDropdownHead: "border-[#C5DFD1] bg-[#EEF7F2] text-[#0C593B]",
  detailNavDropdownHover: "hover:bg-[#EEF7F2]",
  detailNavDropdownFoot: "border-[#C5DFD1] text-[#0B4A31] hover:bg-[#EEF7F2]",
  detailFlashBorder: "border-[#D4AF37]/40 text-[#F7FBF9]",
  detailFlashGradient: "bg-gradient-to-r from-[#042417] via-[#0B4A31] to-[#042417]",
  detailFlashIcon: "text-[#E8CF8E]",
  detailFlashText: "font-playfair tracking-wide text-[#F5FAF7]",
  detailFlashClock:
    "font-playfair font-bold text-[#F5E7BC] bg-[#042417]/85 border border-[#D4AF37]/50",
};

const MUJER_FALLBACK_PALETTE: PerfumeCardPalette = {
  card: "bg-white border-[#F2C9DA] shadow-[0_8px_28px_rgba(142,29,78,0.07)] hover:shadow-[0_16px_40px_rgba(142,29,78,0.15)]",
  imageBg: "bg-[#FFF3F7]",
  overlayBg: "bg-[#5C0E32]/55",
  eyebrow: "text-[#A62660]",
  availableText: "text-[#8E1D4E]",
  title: "text-[#4D0A29] group-hover:text-[#A62660]",
  description: "text-[#7E3B59]",
  divider: "border-[#FAE0EA]",
  price: "text-[#5C0E32]",
  shippingBadge: "text-[#A62660]",
  btnDisabled: "bg-[#F7E5EC] text-[#AA7D90] cursor-not-allowed",
  btnInCart:
    "bg-[#FCE6EF] border border-[#A62660] text-[#A62660] hover:bg-[#A62660] hover:text-white",
  btnDefault:
    "bg-[#A62660] text-[#FFF8FB] hover:bg-[#C23273] shadow-[0_6px_18px_rgba(166,38,96,0.24)]",

  detailShellBg: "bg-[#FFF1F6] text-[#5C0E32]",
  detailPageBg:
    "bg-gradient-to-b from-[#FFF1F6] via-[#FFF8FB] to-[#FCE4EE] text-[#5C0E32]",
  detailBorder: "border-[#F0C4D7]",
  detailShadow: "shadow-[0_18px_45px_rgba(142,29,78,0.10)]",
  detailBoxBg: "bg-white/95",
  detailBackLink: "text-[#A62660] hover:text-[#5C0E32]",
  detailMuted: "text-[#9F5977]",
  detailFeatureText: "text-[#5C0E32]",
  detailCtaDisabled: "bg-[#F7E5EC] text-[#AA7D90] cursor-not-allowed",
  detailCtaInCart:
    "bg-[#FCE6EF] border-2 border-[#A62660] text-[#A62660] hover:bg-[#A62660] hover:text-white",
  detailCtaDefault:
    "bg-[#A62660] hover:bg-[#C23273] text-[#FFF8FB] shadow-[0_10px_28px_rgba(166,38,96,0.25)]",
  detailRelatedCard: "bg-white border-[#F0C4D7] hover:border-[#A62660]",
  detailNavBg:
    "bg-[#FFF1F6]/95 border-[#F0C4D7] shadow-[0_4px_20px_rgba(142,29,78,0.08)]",
  detailNavLink: "font-playfair text-[#7A3555] hover:text-[#5C0E32]",
  detailNavLinkActive:
    "font-playfair text-[#5C0E32] border-b-2 border-[#A62660] pb-0.5",
  detailNavIcon: "text-[#A62660]",
  detailNavInput:
    "bg-white border-[#F0C4D7] text-[#5C0E32] placeholder-[#B07A92] focus:border-[#A62660]",
  detailNavClear: "text-[#9F5977] hover:text-[#5C0E32]",
  detailNavCartBox: "bg-white border border-[#F0C4D7] hover:border-[#A62660]",
  detailNavCartBtn: "bg-[#A62660] hover:bg-[#C23273] text-[#FFF8FB]",
  detailNavMobilePanel: "bg-[#FFF8FB] border-[#F0C4D7]",
  detailNavMobileLink: "font-playfair border-[#F5D6E3] text-[#7A3555] hover:text-[#5C0E32]",
  detailNavDropdown:
    "bg-[#FFF8FB] border-[#F0C4D7] text-[#5C0E32] shadow-[0_18px_42px_rgba(142,29,78,0.20)]",
  detailNavDropdownHead: "border-[#F0C4D7] bg-[#FFF1F6] text-[#A62660]",
  detailNavDropdownHover: "hover:bg-[#FFF1F6]",
  detailNavDropdownFoot: "border-[#F0C4D7] text-[#A62660] hover:bg-[#FFF1F6]",
  detailFlashBorder: "border-[#F7B9D4]/45 text-[#FFF7FA]",
  detailFlashGradient: "bg-gradient-to-r from-[#781542] via-[#A62660] to-[#781542]",
  detailFlashIcon: "text-[#FFD8E8]",
  detailFlashText: "font-playfair tracking-wide text-[#FFF5F9]",
  detailFlashClock:
    "font-playfair font-bold text-[#FFF0F6] bg-[#5C0E32]/80 border border-[#F7B9D4]/50",
};

const PERFUME_CARD_PALETTES: Record<string, PerfumeCardPalette> = {
  // Negro y Dorado / Ámbar (Michael Jordan MBJ)
  "perfume-michael-jordan-homme": {
    card: "bg-[#FDF8EC] border-[#DFBC6A] shadow-[0_8px_28px_rgba(148,98,4,0.10)] hover:shadow-[0_16px_40px_rgba(148,98,4,0.20)]",
    imageBg: "bg-[#F7ECD0]",
    overlayBg: "bg-[#1C160C]/65",
    eyebrow: "text-[#9A6705]",
    availableText: "text-[#9A6705]",
    title: "text-[#1C160C] group-hover:text-[#9A6705]",
    description: "text-[#5C4924]",
    divider: "border-[#EDE0BA]",
    price: "text-[#1C160C]",
    shippingBadge: "text-[#9A6705]",
    btnDisabled: "bg-[#EFE4C4] text-[#9C8653] cursor-not-allowed",
    btnInCart:
      "bg-[#F9EECE] border border-[#9A6705] text-[#1C160C] hover:bg-[#1C1710] hover:text-[#F5D373]",
    btnDefault:
      "bg-[#1C1710] text-[#F5D373] hover:bg-[#31281B] shadow-[0_6px_18px_rgba(28,23,16,0.28)]",

    detailShellBg: "bg-[#F9F0D8] text-[#1C160C]",
    detailPageBg:
      "bg-gradient-to-b from-[#F7ECCD] via-[#FDF8EB] to-[#F1DFAF] text-[#1C160C]",
    detailBorder: "border-[#DFBC6A]",
    detailShadow: "shadow-[0_18px_45px_rgba(148,98,4,0.16)]",
    detailBoxBg: "bg-[#FFFDF7]/95",
    detailBackLink: "text-[#9A6705] hover:text-[#1C160C]",
    detailMuted: "text-[#7A6130]",
    detailFeatureText: "text-[#2E2412]",
    detailCtaDisabled: "bg-[#EFE4C4] text-[#9C8653] cursor-not-allowed",
    detailCtaInCart:
      "bg-[#F9EECE] border-2 border-[#9A6705] text-[#1C160C] hover:bg-[#1C1710] hover:text-[#F5D373]",
    detailCtaDefault:
      "bg-[#1C1710] hover:bg-[#31281B] text-[#F5D373] shadow-[0_10px_28px_rgba(28,23,16,0.28)]",
    detailRelatedCard: "bg-[#FFFDF7] border-[#DFBC6A] hover:border-[#9A6705]",
    detailNavBg:
      "bg-[#FCF5E1]/95 border-[#DFBC6A] shadow-[0_4px_20px_rgba(148,98,4,0.10)]",
    detailNavLink: "font-playfair text-[#5C4924] hover:text-[#1C160C]",
    detailNavLinkActive:
      "font-playfair text-[#1C160C] border-b-2 border-[#9A6705] pb-0.5",
    detailNavIcon: "text-[#9A6705]",
    detailNavInput:
      "bg-white border-[#DFBC6A] text-[#1C160C] placeholder-[#9B824D] focus:border-[#9A6705]",
    detailNavClear: "text-[#7A6130] hover:text-[#1C160C]",
    detailNavCartBox: "bg-white border border-[#DFBC6A] hover:border-[#9A6705]",
    detailNavCartBtn: "bg-[#1C1710] hover:bg-[#31281B] text-[#F5D373]",
    detailNavMobilePanel: "bg-[#FDF8EC] border-[#DFBC6A]",
    detailNavMobileLink:
      "font-playfair border-[#EDE0BA] text-[#5C4924] hover:text-[#1C160C]",
    detailNavDropdown:
      "bg-[#FDF8EC] border-[#DFBC6A] text-[#1C160C] shadow-[0_18px_42px_rgba(148,98,4,0.22)]",
    detailNavDropdownHead: "border-[#EDE0BA] bg-[#F7ECCD] text-[#9A6705]",
    detailNavDropdownHover: "hover:bg-[#F7ECCD]",
    detailNavDropdownFoot: "border-[#EDE0BA] text-[#9A6705] hover:bg-[#F7ECCD]",
    detailFlashBorder: "border-[#DFBC6A]/45 text-[#F9E8B2]",
    detailFlashGradient: "bg-gradient-to-r from-[#14100A] via-[#261E12] to-[#14100A]",
    detailFlashIcon: "text-[#F5D373]",
    detailFlashText: "font-playfair tracking-wide text-[#FAF0CF]",
    detailFlashClock:
      "font-playfair font-bold text-[#F5D373] bg-[#0E0B07]/90 border border-[#DFBC6A]/55",
  },

  // Azul Zafiro / Cobalto intenso (Dior Sauvage 201)
  "perfume-dior-sauvage-201-homme": {
    card: "bg-[#EFF5FF] border-[#8EB5FA] shadow-[0_8px_28px_rgba(17,70,166,0.09)] hover:shadow-[0_16px_40px_rgba(17,70,166,0.20)]",
    imageBg: "bg-[#DCEAFF]",
    overlayBg: "bg-[#0B2354]/65",
    eyebrow: "text-[#1148AD]",
    availableText: "text-[#1148AD]",
    title: "text-[#0B2354] group-hover:text-[#1148AD]",
    description: "text-[#2E4D85]",
    divider: "border-[#D3E2FC]",
    price: "text-[#0B2354]",
    shippingBadge: "text-[#1148AD]",
    btnDisabled: "bg-[#DCE7FA] text-[#7D97C7] cursor-not-allowed",
    btnInCart:
      "bg-[#DCEAFF] border border-[#1249B0] text-[#0B2354] hover:bg-[#1249B0] hover:text-white",
    btnDefault:
      "bg-[#1249B0] text-white hover:bg-[#0D398C] shadow-[0_6px_18px_rgba(18,73,176,0.26)]",

    detailShellBg: "bg-[#E4EEFF] text-[#0B2354]",
    detailPageBg:
      "bg-gradient-to-b from-[#DFEBFD] via-[#F2F7FF] to-[#CFE1FE] text-[#0B2354]",
    detailBorder: "border-[#8EB5FA]",
    detailShadow: "shadow-[0_18px_45px_rgba(17,70,166,0.16)]",
    detailBoxBg: "bg-[#F8FBFF]/95",
    detailBackLink: "text-[#1148AD] hover:text-[#0B2354]",
    detailMuted: "text-[#3E5E96]",
    detailFeatureText: "text-[#132E63]",
    detailCtaDisabled: "bg-[#DCE7FA] text-[#7D97C7] cursor-not-allowed",
    detailCtaInCart:
      "bg-[#DCEAFF] border-2 border-[#1249B0] text-[#0B2354] hover:bg-[#1249B0] hover:text-white",
    detailCtaDefault:
      "bg-[#1249B0] hover:bg-[#0D398C] text-white shadow-[0_10px_28px_rgba(18,73,176,0.28)]",
    detailRelatedCard: "bg-[#F8FBFF] border-[#8EB5FA] hover:border-[#1249B0]",
    detailNavBg:
      "bg-[#ECF3FF]/95 border-[#9BBEFA] shadow-[0_4px_20px_rgba(17,70,166,0.10)]",
    detailNavLink: "font-playfair text-[#27467E] hover:text-[#0B2354]",
    detailNavLinkActive:
      "font-playfair text-[#0B2354] border-b-2 border-[#1249B0] pb-0.5",
    detailNavIcon: "text-[#1249B0]",
    detailNavInput:
      "bg-white border-[#9BBEFA] text-[#0B2354] placeholder-[#5F7DB5] focus:border-[#1249B0]",
    detailNavClear: "text-[#3E5E96] hover:text-[#0B2354]",
    detailNavCartBox: "bg-white border border-[#9BBEFA] hover:border-[#1249B0]",
    detailNavCartBtn: "bg-[#1249B0] hover:bg-[#0D398C] text-white",
    detailNavMobilePanel: "bg-[#F2F7FF] border-[#9BBEFA]",
    detailNavMobileLink:
      "font-playfair border-[#D3E2FC] text-[#27467E] hover:text-[#0B2354]",
    detailNavDropdown:
      "bg-[#F2F7FF] border-[#9BBEFA] text-[#0B2354] shadow-[0_18px_42px_rgba(17,70,166,0.22)]",
    detailNavDropdownHead: "border-[#D3E2FC] bg-[#E3EEFF] text-[#1148AD]",
    detailNavDropdownHover: "hover:bg-[#E3EEFF]",
    detailNavDropdownFoot: "border-[#D3E2FC] text-[#1249B0] hover:bg-[#E3EEFF]",
    detailFlashBorder: "border-[#9BBEFA]/45 text-[#F2F7FF]",
    detailFlashGradient: "bg-gradient-to-r from-[#092356] via-[#1249B0] to-[#092356]",
    detailFlashIcon: "text-[#B8D4FF]",
    detailFlashText: "font-playfair tracking-wide text-[#F4F8FF]",
    detailFlashClock:
      "font-playfair font-bold text-[#DCEAFF] bg-[#071B42]/85 border border-[#8EB5FA]/50",
  },

  // Verde Esmeralda Lacoste (Lacoste 202)
  "perfume-lacoste-202-homme": {
    card: "bg-[#ECF9F1] border-[#88D1AC] shadow-[0_8px_28px_rgba(11,107,66,0.09)] hover:shadow-[0_16px_40px_rgba(11,107,66,0.20)]",
    imageBg: "bg-[#D6F1E2]",
    overlayBg: "bg-[#073822]/65",
    eyebrow: "text-[#0B6B42]",
    availableText: "text-[#0B6B42]",
    title: "text-[#073822] group-hover:text-[#0B6B42]",
    description: "text-[#275C43]",
    divider: "border-[#CCEBD9]",
    price: "text-[#073822]",
    shippingBadge: "text-[#0B6B42]",
    btnDisabled: "bg-[#D9EFE3] text-[#74A68D] cursor-not-allowed",
    btnInCart:
      "bg-[#D6F1E2] border border-[#0B6B42] text-[#073822] hover:bg-[#0B6B42] hover:text-white",
    btnDefault:
      "bg-[#0B6B42] text-white hover:bg-[#085232] shadow-[0_6px_18px_rgba(11,107,66,0.26)]",

    detailShellBg: "bg-[#E0F5EA] text-[#073822]",
    detailPageBg:
      "bg-gradient-to-b from-[#DAF3E5] via-[#EFFAF4] to-[#C6EBDA] text-[#073822]",
    detailBorder: "border-[#88D1AC]",
    detailShadow: "shadow-[0_18px_45px_rgba(11,107,66,0.16)]",
    detailBoxBg: "bg-[#F7FCF9]/95",
    detailBackLink: "text-[#0B6B42] hover:text-[#073822]",
    detailMuted: "text-[#356D52]",
    detailFeatureText: "text-[#10472E]",
    detailCtaDisabled: "bg-[#D9EFE3] text-[#74A68D] cursor-not-allowed",
    detailCtaInCart:
      "bg-[#D6F1E2] border-2 border-[#0B6B42] text-[#073822] hover:bg-[#0B6B42] hover:text-white",
    detailCtaDefault:
      "bg-[#0B6B42] hover:bg-[#085232] text-white shadow-[0_10px_28px_rgba(11,107,66,0.28)]",
    detailRelatedCard: "bg-[#F7FCF9] border-[#88D1AC] hover:border-[#0B6B42]",
    detailNavBg:
      "bg-[#E7F7EE]/95 border-[#88D1AC] shadow-[0_4px_20px_rgba(11,107,66,0.10)]",
    detailNavLink: "font-playfair text-[#21593F] hover:text-[#073822]",
    detailNavLinkActive:
      "font-playfair text-[#073822] border-b-2 border-[#0B6B42] pb-0.5",
    detailNavIcon: "text-[#0B6B42]",
    detailNavInput:
      "bg-white border-[#88D1AC] text-[#073822] placeholder-[#588F74] focus:border-[#0B6B42]",
    detailNavClear: "text-[#356D52] hover:text-[#073822]",
    detailNavCartBox: "bg-white border border-[#88D1AC] hover:border-[#0B6B42]",
    detailNavCartBtn: "bg-[#0B6B42] hover:bg-[#085232] text-white",
    detailNavMobilePanel: "bg-[#EFFAF4] border-[#88D1AC]",
    detailNavMobileLink:
      "font-playfair border-[#CCEBD9] text-[#21593F] hover:text-[#073822]",
    detailNavDropdown:
      "bg-[#EFFAF4] border-[#88D1AC] text-[#073822] shadow-[0_18px_42px_rgba(11,107,66,0.22)]",
    detailNavDropdownHead: "border-[#CCEBD9] bg-[#DCF3E6] text-[#0B6B42]",
    detailNavDropdownHover: "hover:bg-[#DCF3E6]",
    detailNavDropdownFoot: "border-[#CCEBD9] text-[#0B6B42] hover:bg-[#DCF3E6]",
    detailFlashBorder: "border-[#88D1AC]/45 text-[#EFFAF4]",
    detailFlashGradient: "bg-gradient-to-r from-[#053520] via-[#0B6B42] to-[#053520]",
    detailFlashIcon: "text-[#B6F0D1]",
    detailFlashText: "font-playfair tracking-wide text-[#F2FBF6]",
    detailFlashClock:
      "font-playfair font-bold text-[#D6F1E2] bg-[#042818]/85 border border-[#88D1AC]/50",
  },

  // Plata Acero y Negro Grafito (Invictus Versión 230)
  "perfume-invictus-230-homme": {
    card: "bg-[#F3F5F8] border-[#B6C0CE] shadow-[0_8px_28px_rgba(36,46,61,0.09)] hover:shadow-[0_16px_40px_rgba(36,46,61,0.19)]",
    imageBg: "bg-[#E3E7EE]",
    overlayBg: "bg-[#161E29]/65",
    eyebrow: "text-[#3E4B5C]",
    availableText: "text-[#3E4B5C]",
    title: "text-[#161E29] group-hover:text-[#3E4B5C]",
    description: "text-[#495566]",
    divider: "border-[#DDE2EA]",
    price: "text-[#161E29]",
    shippingBadge: "text-[#3E4B5C]",
    btnDisabled: "bg-[#E2E6EC] text-[#838F9E] cursor-not-allowed",
    btnInCart:
      "bg-[#E3E7EE] border border-[#232D3B] text-[#161E29] hover:bg-[#232D3B] hover:text-white",
    btnDefault:
      "bg-[#232D3B] text-white hover:bg-[#151B24] shadow-[0_6px_18px_rgba(35,45,59,0.26)]",

    detailShellBg: "bg-[#E9EDF2] text-[#161E29]",
    detailPageBg:
      "bg-gradient-to-b from-[#E5E9F0] via-[#F4F6F9] to-[#D6DCE6] text-[#161E29]",
    detailBorder: "border-[#B6C0CE]",
    detailShadow: "shadow-[0_18px_45px_rgba(36,46,61,0.15)]",
    detailBoxBg: "bg-[#FAFBFD]/95",
    detailBackLink: "text-[#3E4B5C] hover:text-[#161E29]",
    detailMuted: "text-[#576475]",
    detailFeatureText: "text-[#222C3A]",
    detailCtaDisabled: "bg-[#E2E6EC] text-[#838F9E] cursor-not-allowed",
    detailCtaInCart:
      "bg-[#E3E7EE] border-2 border-[#232D3B] text-[#161E29] hover:bg-[#232D3B] hover:text-white",
    detailCtaDefault:
      "bg-[#232D3B] hover:bg-[#151B24] text-white shadow-[0_10px_28px_rgba(35,45,59,0.26)]",
    detailRelatedCard: "bg-[#FAFBFD] border-[#B6C0CE] hover:border-[#232D3B]",
    detailNavBg:
      "bg-[#EEF1F5]/95 border-[#B6C0CE] shadow-[0_4px_20px_rgba(36,46,61,0.09)]",
    detailNavLink: "font-playfair text-[#3E4B5C] hover:text-[#161E29]",
    detailNavLinkActive:
      "font-playfair text-[#161E29] border-b-2 border-[#232D3B] pb-0.5",
    detailNavIcon: "text-[#232D3B]",
    detailNavInput:
      "bg-white border-[#B6C0CE] text-[#161E29] placeholder-[#6E7A8A] focus:border-[#232D3B]",
    detailNavClear: "text-[#576475] hover:text-[#161E29]",
    detailNavCartBox: "bg-white border border-[#B6C0CE] hover:border-[#232D3B]",
    detailNavCartBtn: "bg-[#232D3B] hover:bg-[#151B24] text-white",
    detailNavMobilePanel: "bg-[#F4F6F9] border-[#B6C0CE]",
    detailNavMobileLink:
      "font-playfair border-[#DDE2EA] text-[#3E4B5C] hover:text-[#161E29]",
    detailNavDropdown:
      "bg-[#F4F6F9] border-[#B6C0CE] text-[#161E29] shadow-[0_18px_42px_rgba(36,46,61,0.20)]",
    detailNavDropdownHead: "border-[#DDE2EA] bg-[#E6EAF0] text-[#3E4B5C]",
    detailNavDropdownHover: "hover:bg-[#E6EAF0]",
    detailNavDropdownFoot: "border-[#DDE2EA] text-[#232D3B] hover:bg-[#E6EAF0]",
    detailFlashBorder: "border-[#B6C0CE]/45 text-[#F4F6F9]",
    detailFlashGradient: "bg-gradient-to-r from-[#141A24] via-[#273242] to-[#141A24]",
    detailFlashIcon: "text-[#CBD5E1]",
    detailFlashText: "font-playfair tracking-wide text-[#F8FAFC]",
    detailFlashClock:
      "font-playfair font-bold text-[#E2E8F0] bg-[#0F141C]/85 border border-[#94A3B8]/50",
  },

  // Azul Hielo / Celeste Metálico (Invictus Versión 208)
  "perfume-invictus-208-homme": {
    card: "bg-[#EDF8FD] border-[#84C6E6] shadow-[0_8px_28px_rgba(19,123,168,0.09)] hover:shadow-[0_16px_40px_rgba(19,123,168,0.20)]",
    imageBg: "bg-[#D5EEF9]",
    overlayBg: "bg-[#0A3C54]/65",
    eyebrow: "text-[#0E6E96]",
    availableText: "text-[#0E6E96]",
    title: "text-[#0A3C54] group-hover:text-[#0E6E96]",
    description: "text-[#2E6078]",
    divider: "border-[#CDE8F5]",
    price: "text-[#0A3C54]",
    shippingBadge: "text-[#0E6E96]",
    btnDisabled: "bg-[#D8ECF6] text-[#75A4BA] cursor-not-allowed",
    btnInCart:
      "bg-[#D5EEF9] border border-[#1279A6] text-[#0A3C54] hover:bg-[#1279A6] hover:text-white",
    btnDefault:
      "bg-[#1279A6] text-white hover:bg-[#0D5E82] shadow-[0_6px_18px_rgba(18,121,166,0.26)]",

    detailShellBg: "bg-[#E1F3FB] text-[#0A3C54]",
    detailPageBg:
      "bg-gradient-to-b from-[#DCF1FB] via-[#F0FAFE] to-[#C6E8F8] text-[#0A3C54]",
    detailBorder: "border-[#84C6E6]",
    detailShadow: "shadow-[0_18px_45px_rgba(19,123,168,0.16)]",
    detailBoxBg: "bg-[#F7FCFF]/95",
    detailBackLink: "text-[#0E6E96] hover:text-[#0A3C54]",
    detailMuted: "text-[#396D85]",
    detailFeatureText: "text-[#124B66]",
    detailCtaDisabled: "bg-[#D8ECF6] text-[#75A4BA] cursor-not-allowed",
    detailCtaInCart:
      "bg-[#D5EEF9] border-2 border-[#1279A6] text-[#0A3C54] hover:bg-[#1279A6] hover:text-white",
    detailCtaDefault:
      "bg-[#1279A6] hover:bg-[#0D5E82] text-white shadow-[0_10px_28px_rgba(18,121,166,0.28)]",
    detailRelatedCard: "bg-[#F7FCFF] border-[#84C6E6] hover:border-[#1279A6]",
    detailNavBg:
      "bg-[#E8F6FC]/95 border-[#84C6E6] shadow-[0_4px_20px_rgba(19,123,168,0.10)]",
    detailNavLink: "font-playfair text-[#235770] hover:text-[#0A3C54]",
    detailNavLinkActive:
      "font-playfair text-[#0A3C54] border-b-2 border-[#1279A6] pb-0.5",
    detailNavIcon: "text-[#1279A6]",
    detailNavInput:
      "bg-white border-[#84C6E6] text-[#0A3C54] placeholder-[#5A8DA6] focus:border-[#1279A6]",
    detailNavClear: "text-[#396D85] hover:text-[#0A3C54]",
    detailNavCartBox: "bg-white border border-[#84C6E6] hover:border-[#1279A6]",
    detailNavCartBtn: "bg-[#1279A6] hover:bg-[#0D5E82] text-white",
    detailNavMobilePanel: "bg-[#F0FAFE] border-[#84C6E6]",
    detailNavMobileLink:
      "font-playfair border-[#CDE8F5] text-[#235770] hover:text-[#0A3C54]",
    detailNavDropdown:
      "bg-[#F0FAFE] border-[#84C6E6] text-[#0A3C54] shadow-[0_18px_42px_rgba(19,123,168,0.22)]",
    detailNavDropdownHead: "border-[#CDE8F5] bg-[#DCF1FB] text-[#0E6E96]",
    detailNavDropdownHover: "hover:bg-[#DCF1FB]",
    detailNavDropdownFoot: "border-[#CDE8F5] text-[#1279A6] hover:bg-[#DCF1FB]",
    detailFlashBorder: "border-[#84C6E6]/45 text-[#F0FAFE]",
    detailFlashGradient: "bg-gradient-to-r from-[#093A52] via-[#1279A6] to-[#093A52]",
    detailFlashIcon: "text-[#B5E5FA]",
    detailFlashText: "font-playfair tracking-wide text-[#F3FBFF]",
    detailFlashClock:
      "font-playfair font-bold text-[#D5EEF9] bg-[#072B3D]/85 border border-[#84C6E6]/50",
  },

  // Fucsia Vibrante (Fairyland Para Mujer)
  "perfume-fairyland-femme": {
    card: "bg-[#FFF0F7] border-[#F396C0] shadow-[0_8px_28px_rgba(206,23,105,0.09)] hover:shadow-[0_16px_40px_rgba(206,23,105,0.19)]",
    imageBg: "bg-[#FFE0EE]",
    overlayBg: "bg-[#690935]/60",
    eyebrow: "text-[#C41463]",
    availableText: "text-[#C41463]",
    title: "text-[#690935] group-hover:text-[#C41463]",
    description: "text-[#8A2D58]",
    divider: "border-[#FAD5E6]",
    price: "text-[#690935]",
    shippingBadge: "text-[#C41463]",
    btnDisabled: "bg-[#FBE2EE] text-[#BD829D] cursor-not-allowed",
    btnInCart:
      "bg-[#FFE0EE] border border-[#CE1769] text-[#690935] hover:bg-[#CE1769] hover:text-white",
    btnDefault:
      "bg-[#CE1769] text-white hover:bg-[#A81054] shadow-[0_6px_18px_rgba(206,23,105,0.26)]",

    detailShellBg: "bg-[#FFE5F1] text-[#690935]",
    detailPageBg:
      "bg-gradient-to-b from-[#FFE2F0] via-[#FFF4F9] to-[#FFCFE4] text-[#690935]",
    detailBorder: "border-[#F396C0]",
    detailShadow: "shadow-[0_18px_45px_rgba(206,23,105,0.16)]",
    detailBoxBg: "bg-[#FFF9FC]/95",
    detailBackLink: "text-[#C41463] hover:text-[#690935]",
    detailMuted: "text-[#9E426C]",
    detailFeatureText: "text-[#690935]",
    detailCtaDisabled: "bg-[#FBE2EE] text-[#BD829D] cursor-not-allowed",
    detailCtaInCart:
      "bg-[#FFE0EE] border-2 border-[#CE1769] text-[#690935] hover:bg-[#CE1769] hover:text-white",
    detailCtaDefault:
      "bg-[#CE1769] hover:bg-[#A81054] text-white shadow-[0_10px_28px_rgba(206,23,105,0.28)]",
    detailRelatedCard: "bg-[#FFF9FC] border-[#F396C0] hover:border-[#CE1769]",
    detailNavBg:
      "bg-[#FFEBF4]/95 border-[#F396C0] shadow-[0_4px_20px_rgba(206,23,105,0.10)]",
    detailNavLink: "font-playfair text-[#8A2D58] hover:text-[#690935]",
    detailNavLinkActive:
      "font-playfair text-[#690935] border-b-2 border-[#CE1769] pb-0.5",
    detailNavIcon: "text-[#CE1769]",
    detailNavInput:
      "bg-white border-[#F396C0] text-[#690935] placeholder-[#BE6F94] focus:border-[#CE1769]",
    detailNavClear: "text-[#9E426C] hover:text-[#690935]",
    detailNavCartBox: "bg-white border border-[#F396C0] hover:border-[#CE1769]",
    detailNavCartBtn: "bg-[#CE1769] hover:bg-[#A81054] text-white",
    detailNavMobilePanel: "bg-[#FFF4F9] border-[#F396C0]",
    detailNavMobileLink:
      "font-playfair border-[#FAD5E6] text-[#8A2D58] hover:text-[#690935]",
    detailNavDropdown:
      "bg-[#FFF4F9] border-[#F396C0] text-[#690935] shadow-[0_18px_42px_rgba(206,23,105,0.22)]",
    detailNavDropdownHead: "border-[#FAD5E6] bg-[#FFE4F0] text-[#C41463]",
    detailNavDropdownHover: "hover:bg-[#FFE4F0]",
    detailNavDropdownFoot: "border-[#FAD5E6] text-[#CE1769] hover:bg-[#FFE4F0]",
    detailFlashBorder: "border-[#F7A8CC]/45 text-[#FFF5FA]",
    detailFlashGradient: "bg-gradient-to-r from-[#7F0D41] via-[#CE1769] to-[#7F0D41]",
    detailFlashIcon: "text-[#FFC7E0]",
    detailFlashText: "font-playfair tracking-wide text-[#FFF7FB]",
    detailFlashClock:
      "font-playfair font-bold text-[#FFE0EE] bg-[#5E072F]/85 border border-[#F7A8CC]/50",
  },

  // Palo de Rosa y Vino Suave (205 Pour Femme)
  "perfume-205-femme": {
    card: "bg-[#FCF2F4] border-[#E3A6B4] shadow-[0_8px_28px_rgba(148,30,66,0.09)] hover:shadow-[0_16px_40px_rgba(148,30,66,0.19)]",
    imageBg: "bg-[#F6E1E6]",
    overlayBg: "bg-[#5C1027]/60",
    eyebrow: "text-[#961F43]",
    availableText: "text-[#961F43]",
    title: "text-[#5C1027] group-hover:text-[#961F43]",
    description: "text-[#7D3A4E]",
    divider: "border-[#F0D3DA]",
    price: "text-[#5C1027]",
    shippingBadge: "text-[#961F43]",
    btnDisabled: "bg-[#F4E1E6] text-[#B08491] cursor-not-allowed",
    btnInCart:
      "bg-[#F6E1E6] border border-[#961F43] text-[#5C1027] hover:bg-[#961F43] hover:text-white",
    btnDefault:
      "bg-[#961F43] text-white hover:bg-[#781734] shadow-[0_6px_18px_rgba(150,31,67,0.26)]",

    detailShellBg: "bg-[#F8E7EB] text-[#5C1027]",
    detailPageBg:
      "bg-gradient-to-b from-[#F7E3E8] via-[#FCF3F5] to-[#EFD2DA] text-[#5C1027]",
    detailBorder: "border-[#E3A6B4]",
    detailShadow: "shadow-[0_18px_45px_rgba(148,30,66,0.15)]",
    detailBoxBg: "bg-[#FFF9FA]/95",
    detailBackLink: "text-[#961F43] hover:text-[#5C1027]",
    detailMuted: "text-[#8C4D5F]",
    detailFeatureText: "text-[#5C1027]",
    detailCtaDisabled: "bg-[#F4E1E6] text-[#B08491] cursor-not-allowed",
    detailCtaInCart:
      "bg-[#F6E1E6] border-2 border-[#961F43] text-[#5C1027] hover:bg-[#961F43] hover:text-white",
    detailCtaDefault:
      "bg-[#961F43] hover:bg-[#781734] text-white shadow-[0_10px_28px_rgba(150,31,67,0.27)]",
    detailRelatedCard: "bg-[#FFF9FA] border-[#E3A6B4] hover:border-[#961F43]",
    detailNavBg:
      "bg-[#FAECEF]/95 border-[#E3A6B4] shadow-[0_4px_20px_rgba(148,30,66,0.10)]",
    detailNavLink: "font-playfair text-[#7D3A4E] hover:text-[#5C1027]",
    detailNavLinkActive:
      "font-playfair text-[#5C1027] border-b-2 border-[#961F43] pb-0.5",
    detailNavIcon: "text-[#961F43]",
    detailNavInput:
      "bg-white border-[#E3A6B4] text-[#5C1027] placeholder-[#B07A88] focus:border-[#961F43]",
    detailNavClear: "text-[#8C4D5F] hover:text-[#5C1027]",
    detailNavCartBox: "bg-white border border-[#E3A6B4] hover:border-[#961F43]",
    detailNavCartBtn: "bg-[#961F43] hover:bg-[#781734] text-white",
    detailNavMobilePanel: "bg-[#FCF3F5] border-[#E3A6B4]",
    detailNavMobileLink:
      "font-playfair border-[#F0D3DA] text-[#7D3A4E] hover:text-[#5C1027]",
    detailNavDropdown:
      "bg-[#FCF3F5] border-[#E3A6B4] text-[#5C1027] shadow-[0_18px_42px_rgba(148,30,66,0.20)]",
    detailNavDropdownHead: "border-[#F0D3DA] bg-[#F7E5E9] text-[#961F43]",
    detailNavDropdownHover: "hover:bg-[#F7E5E9]",
    detailNavDropdownFoot: "border-[#F0D3DA] text-[#961F43] hover:bg-[#F7E5E9]",
    detailFlashBorder: "border-[#E3A6B4]/45 text-[#FDF4F6]",
    detailFlashGradient: "bg-gradient-to-r from-[#5E1129] via-[#961F43] to-[#5E1129]",
    detailFlashIcon: "text-[#F7C7D4]",
    detailFlashText: "font-playfair tracking-wide text-[#FDF6F8]",
    detailFlashClock:
      "font-playfair font-bold text-[#F6E1E6] bg-[#450A1D]/85 border border-[#E3A6B4]/50",
  },

  // Rojo Carmín Pasión (221 Pour Femme)
  "perfume-221-femme": {
    card: "bg-[#FFF1F1] border-[#F19999] shadow-[0_8px_28px_rgba(196,26,36,0.09)] hover:shadow-[0_16px_40px_rgba(196,26,36,0.19)]",
    imageBg: "bg-[#FFE0E0]",
    overlayBg: "bg-[#6E0B12]/60",
    eyebrow: "text-[#C41A24]",
    availableText: "text-[#C41A24]",
    title: "text-[#6E0B12] group-hover:text-[#C41A24]",
    description: "text-[#8E2F36]",
    divider: "border-[#F9D2D2]",
    price: "text-[#6E0B12]",
    shippingBadge: "text-[#C41A24]",
    btnDisabled: "bg-[#FCE3E3] text-[#BF8484] cursor-not-allowed",
    btnInCart:
      "bg-[#FFE0E0] border border-[#C41A24] text-[#6E0B12] hover:bg-[#C41A24] hover:text-white",
    btnDefault:
      "bg-[#C41A24] text-white hover:bg-[#9E121B] shadow-[0_6px_18px_rgba(196,26,36,0.26)]",

    detailShellBg: "bg-[#FFE5E5] text-[#6E0B12]",
    detailPageBg:
      "bg-gradient-to-b from-[#FFE2E2] via-[#FFF4F4] to-[#FFCECE] text-[#6E0B12]",
    detailBorder: "border-[#F19999]",
    detailShadow: "shadow-[0_18px_45px_rgba(196,26,36,0.16)]",
    detailBoxBg: "bg-[#FFF9F9]/95",
    detailBackLink: "text-[#C41A24] hover:text-[#6E0B12]",
    detailMuted: "text-[#9C4248]",
    detailFeatureText: "text-[#6E0B12]",
    detailCtaDisabled: "bg-[#FCE3E3] text-[#BF8484] cursor-not-allowed",
    detailCtaInCart:
      "bg-[#FFE0E0] border-2 border-[#C41A24] text-[#6E0B12] hover:bg-[#C41A24] hover:text-white",
    detailCtaDefault:
      "bg-[#C41A24] hover:bg-[#9E121B] text-white shadow-[0_10px_28px_rgba(196,26,36,0.28)]",
    detailRelatedCard: "bg-[#FFF9F9] border-[#F19999] hover:border-[#C41A24]",
    detailNavBg:
      "bg-[#FFEBEB]/95 border-[#F19999] shadow-[0_4px_20px_rgba(196,26,36,0.10)]",
    detailNavLink: "font-playfair text-[#8E2F36] hover:text-[#6E0B12]",
    detailNavLinkActive:
      "font-playfair text-[#6E0B12] border-b-2 border-[#C41A24] pb-0.5",
    detailNavIcon: "text-[#C41A24]",
    detailNavInput:
      "bg-white border-[#F19999] text-[#6E0B12] placeholder-[#BE7276] focus:border-[#C41A24]",
    detailNavClear: "text-[#9C4248] hover:text-[#6E0B12]",
    detailNavCartBox: "bg-white border border-[#F19999] hover:border-[#C41A24]",
    detailNavCartBtn: "bg-[#C41A24] hover:bg-[#9E121B] text-white",
    detailNavMobilePanel: "bg-[#FFF4F4] border-[#F19999]",
    detailNavMobileLink:
      "font-playfair border-[#F9D2D2] text-[#8E2F36] hover:text-[#6E0B12]",
    detailNavDropdown:
      "bg-[#FFF4F4] border-[#F19999] text-[#6E0B12] shadow-[0_18px_42px_rgba(196,26,36,0.22)]",
    detailNavDropdownHead: "border-[#F9D2D2] bg-[#FFE4E4] text-[#C41A24]",
    detailNavDropdownHover: "hover:bg-[#FFE4E4]",
    detailNavDropdownFoot: "border-[#F9D2D2] text-[#C41A24] hover:bg-[#FFE4E4]",
    detailFlashBorder: "border-[#F5A3A3]/45 text-[#FFF5F5]",
    detailFlashGradient: "bg-gradient-to-r from-[#7D0E15] via-[#C41A24] to-[#7D0E15]",
    detailFlashIcon: "text-[#FFC7C7]",
    detailFlashText: "font-playfair tracking-wide text-[#FFF7F7]",
    detailFlashClock:
      "font-playfair font-bold text-[#FFE0E0] bg-[#59070C]/85 border border-[#F5A3A3]/50",
  },
};

export function getPerfumeCardPalette(
  productId: string,
  isMujer: boolean
): PerfumeCardPalette {
  const custom = PERFUME_CARD_PALETTES[productId];
  if (custom) return custom;
  return isMujer ? MUJER_FALLBACK_PALETTE : HOMBRE_FALLBACK_PALETTE;
}
