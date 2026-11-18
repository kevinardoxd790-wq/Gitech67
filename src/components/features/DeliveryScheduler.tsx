import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  MessageCircle,
  X,
  User,
  Package,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Phone,
} from "lucide-react";
import {
  Booking,
  AVAILABLE_HOURS,
  DELIVERY_POINTS,
  getSlotKey,
  getNextDays,
  formatDayFull,
  formatHour,
  loadBookings,
  addBooking,
  isSlotTaken,
  buildScheduleWhatsApp,
} from "@/constants/schedule";
import { WHATSAPP_NUMBER } from "@/constants/products";
import { useCatalog } from "@/hooks/useCatalog";

type Step = "calendar" | "form" | "confirm";

export default function DeliveryScheduler() {
  const { products: PRODUCTS } = useCatalog();
  const [days] = useState(() => getNextDays(7));
  const [selectedDay, setSelectedDay] = useState<Date>(days[0]);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pendingBooking, setPendingBooking] = useState<Booking | null>(null);
  const [whatsappConfirmed, setWhatsappConfirmed] = useState(false);
  const [step, setStep] = useState<Step>("calendar");
  const [dayIndex, setDayIndex] = useState(0);

  const [form, setForm] = useState({
    name: "",
    product: "",
    deliveryPoint: "",
    phone: "",
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    setBookings(loadBookings());
  }, []);

  const refreshBookings = () => setBookings(loadBookings());

  const handleSelectSlot = (hour: number) => {
    const key = getSlotKey(selectedDay, hour);
    if (isSlotTaken(key)) return;
    setSelectedHour(hour);
    setPendingBooking(null);
    setWhatsappConfirmed(false);
    setStep("form");
    setFormError("");
    setForm({ name: "", product: "", deliveryPoint: "", phone: "" });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.product.trim() || !form.deliveryPoint.trim()) {
      setFormError("Por favor completa todos los campos requeridos.");
      return;
    }
    if (!selectedHour) return;

    const slotKey = getSlotKey(selectedDay, selectedHour);
    if (isSlotTaken(slotKey)) {
      setFormError("Este espacio acaba de ser ocupado. Selecciona otro.");
      setStep("calendar");
      refreshBookings();
      return;
    }

    const draftBooking: Booking = {
      id: `GT-${Date.now()}`,
      slotKey,
      date: formatDayFull(selectedDay),
      time: formatHour(selectedHour),
      name: form.name.trim(),
      product: form.product.trim(),
      deliveryPoint: form.deliveryPoint,
      phone: form.phone.trim(),
      createdAt: new Date().toISOString(),
    };

    setPendingBooking(draftBooking);
    setWhatsappConfirmed(false);
    setStep("confirm");
  };

  const handleConfirmWhatsAppClick = () => {
    try {
      if (!pendingBooking || whatsappConfirmed) return;
      if (isSlotTaken(pendingBooking.slotKey)) {
        setFormError("Este espacio acaba de ser ocupado. Selecciona otro.");
        setStep("calendar");
        setPendingBooking(null);
        refreshBookings();
        return;
      }
      addBooking(pendingBooking);
      refreshBookings();
      setWhatsappConfirmed(true);
    } catch {
      // Mantiene el flujo de WhatsApp operativo
    }
  };

  const handleReset = () => {
    setStep("calendar");
    setSelectedHour(null);
    setPendingBooking(null);
    setWhatsappConfirmed(false);
    setFormError("");
  };

  const confirmWhatsApp = () => {
    if (!selectedHour) return "#";
    return buildScheduleWhatsApp(
      {
        slotKey: getSlotKey(selectedDay, selectedHour),
        date: formatDayFull(selectedDay),
        time: formatHour(selectedHour),
        name: form.name,
        product: form.product,
        deliveryPoint: form.deliveryPoint,
        phone: form.phone,
      },
      WHATSAPP_NUMBER
    );
  };

  const visibleDays = days.slice(dayIndex, dayIndex + 4);

  return (
    <section className="py-16 sm:py-20 bg-gotech-canvas" id="agenda">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-[#0057FF]" />
            <span className="badge-gotech text-xs">AGENDA TU ENTREGA</span>
          </div>
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="flex items-center gap-1" aria-hidden="true">
              <span className="w-2.5 h-6 bg-[#0057FF] -skew-x-[24deg] rounded-sm" />
              <span className="w-2.5 h-6 bg-[#0095FF] -skew-x-[24deg] rounded-sm" />
            </div>
            <h2 className="font-montserrat font-black italic text-3xl md:text-4xl text-[#0B172A]">
              Programar <span className="text-[#0057FF]">Entrega</span>
            </h2>
          </div>
          <p className="text-[#4D607D] text-sm sm:text-base max-w-md mx-auto">
            Elige el día y la hora de tu entrega. El horario queda reservado al confirmar por WhatsApp.
          </p>
        </div>

        <div className="card-gotech overflow-hidden">
          {/* Step indicators */}
          <div className="flex items-center border-b border-[#E2ECFA] bg-[#F8FAFF] px-6 py-4 gap-4">
            {[
              { id: "calendar", label: "1. Elegir Horario", icon: <Calendar className="w-3.5 h-3.5" /> },
              { id: "form", label: "2. Tus Datos", icon: <User className="w-3.5 h-3.5" /> },
              { id: "confirm", label: "3. Confirmar en WhatsApp", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
            ].map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                {i > 0 && <div className="w-8 h-px bg-[#CFE0FA]" />}
                <div
                  className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
                    step === s.id
                      ? "text-[#0057FF]"
                      : ["calendar", "form", "confirm"].indexOf(step) > i
                        ? "text-emerald-700"
                        : "text-[#8EA0BA]"
                  }`}
                >
                  {s.icon}
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* ── STEP 1: CALENDAR ── */}
          {step === "calendar" && (
            <div className="p-6">
              {/* Day selector */}
              <div className="mb-6">
                <p className="text-[#0057FF] text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Selecciona el día
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDayIndex(Math.max(0, dayIndex - 1))}
                    disabled={dayIndex === 0}
                    className="w-8 h-8 rounded-lg border border-[#CFE0FA] flex items-center justify-center text-[#0057FF] hover:border-[#0057FF] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex-1 grid grid-cols-4 gap-2">
                    {visibleDays.map((day) => {
                      const isToday =
                        day.toDateString() === new Date().toDateString();
                      const isSelected =
                        day.toDateString() === selectedDay.toDateString();
                      return (
                        <button
                          key={day.toISOString()}
                          onClick={() => setSelectedDay(day)}
                          className={`rounded-xl py-3 text-center transition-all border ${
                            isSelected
                              ? "border-[#0057FF] bg-[#EAF2FF] shadow-[0_6px_16px_rgba(0,87,255,0.14)]"
                              : "border-[#E2ECFA] bg-[#F8FAFF] hover:border-[#0057FF]/45"
                          }`}
                        >
                          <p
                            className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${
                              isSelected ? "text-[#0057FF]" : "text-[#546885]"
                            }`}
                          >
                            {day.toLocaleDateString("es-SV", { weekday: "short" })}
                          </p>
                          <p
                            className={`font-montserrat font-black text-xl ${
                              isSelected ? "text-[#0057FF]" : "text-[#0B172A]"
                            }`}
                          >
                            {day.getDate()}
                          </p>
                          {isToday && (
                            <p className="text-[9px] text-[#0057FF] font-bold uppercase">
                              Hoy
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() =>
                      setDayIndex(Math.min(days.length - 4, dayIndex + 1))
                    }
                    disabled={dayIndex >= days.length - 4}
                    className="w-8 h-8 rounded-lg border border-[#CFE0FA] flex items-center justify-center text-[#0057FF] hover:border-[#0057FF] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Time slots */}
              <div>
                <p className="text-[#0057FF] text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Horarios disponibles —{" "}
                  {selectedDay.toLocaleDateString("es-SV", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {AVAILABLE_HOURS.map(({ hour, label }) => {
                    const key = getSlotKey(selectedDay, hour);
                    const taken = bookings.some((b) => b.slotKey === key);
                    return (
                      <button
                        key={hour}
                        onClick={() => !taken && handleSelectSlot(hour)}
                        disabled={taken}
                        className={`relative rounded-xl py-3 px-2 text-center text-xs font-bold transition-all border ${
                          taken
                            ? "border-red-200 bg-red-50 text-red-400 cursor-not-allowed"
                            : "border-[#DCE7F8] bg-[#F8FAFF] text-[#0B172A] hover:border-[#0057FF] hover:text-[#0057FF] hover:bg-[#EAF2FF] cursor-pointer"
                        }`}
                      >
                        <Clock
                          className={`w-3.5 h-3.5 mx-auto mb-1 ${
                            taken ? "text-red-300" : "text-[#0057FF]"
                          }`}
                        />
                        {label}
                        {taken && (
                          <div className="absolute inset-0 flex items-center justify-center rounded-xl">
                            <span className="text-[9px] font-black text-red-600 bg-white/90 px-1.5 py-0.5 rounded-full uppercase tracking-wider border border-red-200">
                              Ocupado
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 text-[11px] text-[#546885]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm border border-[#0057FF]/40 bg-[#EAF2FF]" />
                  Disponible
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm border border-red-300 bg-red-50" />
                  Ocupado
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: FORM ── */}
          {step === "form" && (
            <form onSubmit={handleFormSubmit} className="p-6">
              {/* Selected slot summary */}
              <div className="flex items-center gap-3 bg-[#EAF2FF] border border-[#BFD7FF] rounded-xl px-4 py-3 mb-6">
                <div className="w-9 h-9 rounded-lg bg-[#0057FF] text-white flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[#0B172A] font-bold text-sm">
                    {formatDayFull(selectedDay)}
                  </p>
                  <p className="text-[#4D607D] text-xs">
                    {selectedHour ? formatHour(selectedHour) : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep("calendar")}
                  className="ml-auto text-[#6B7E9E] hover:text-[#0B172A] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[#0057FF] text-xs font-bold uppercase tracking-widest mb-4">
                Tus datos de entrega
              </p>

              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-1.5 text-[#334663] text-xs font-bold mb-1.5">
                    <User className="w-3.5 h-3.5 text-[#0057FF]" /> Nombre completo *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Tu nombre"
                    className="w-full bg-[#F8FAFF] border border-[#CFE0FA] focus:border-[#0057FF] rounded-xl px-4 py-3 text-[#0B172A] placeholder-[#8EA0BA] text-sm outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-[#334663] text-xs font-bold mb-1.5">
                    <Package className="w-3.5 h-3.5 text-[#0057FF]" /> Producto pedido *
                  </label>
                  <select
                    value={form.product}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, product: e.target.value }))
                    }
                    className="w-full bg-[#F8FAFF] border border-[#CFE0FA] focus:border-[#0057FF] rounded-xl px-4 py-3 text-[#0B172A] text-sm outline-none transition-colors"
                    required
                  >
                    <option value="">Selecciona un producto...</option>
                    {PRODUCTS.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name} — ${Number(p.price).toFixed(2)}
                      </option>
                    ))}
                    <option value="Otro producto">Otro producto</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-[#334663] text-xs font-bold mb-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#0057FF]" /> Punto de entrega *
                  </label>
                  <select
                    value={form.deliveryPoint}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, deliveryPoint: e.target.value }))
                    }
                    className="w-full bg-[#F8FAFF] border border-[#CFE0FA] focus:border-[#0057FF] rounded-xl px-4 py-3 text-[#0B172A] text-sm outline-none transition-colors"
                    required
                  >
                    <option value="">Selecciona zona...</option>
                    {DELIVERY_POINTS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-[#334663] text-xs font-bold mb-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#0057FF]" /> Teléfono (opcional)
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    placeholder="7XXX XXXX"
                    maxLength={15}
                    className="w-full bg-[#F8FAFF] border border-[#CFE0FA] focus:border-[#0057FF] rounded-xl px-4 py-3 text-[#0B172A] placeholder-[#8EA0BA] text-sm outline-none transition-colors"
                  />
                </div>
              </div>

              {formError && (
                <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                  ⚠️ {formError}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setStep("calendar")}
                  className="px-5 py-3 rounded-full border border-[#CFE0FA] text-[#4D607D] hover:text-[#0B172A] hover:border-[#0057FF] text-sm font-semibold transition-all"
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-gotech py-3 text-sm flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Continuar a WhatsApp
                </button>
              </div>
            </form>
          )}

          {/* ── STEP 3: CONFIRM ON WHATSAPP ── */}
          {step === "confirm" && (
            <div className="p-6 text-center">
              <div
                className={`w-20 h-20 rounded-2xl border flex items-center justify-center mx-auto mb-5 ${
                  whatsappConfirmed
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-[#EAF2FF] border-[#BFD7FF]"
                }`}
              >
                {whatsappConfirmed ? (
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                ) : (
                  <MessageCircle className="w-10 h-10 text-[#0057FF]" />
                )}
              </div>
              <h3 className="font-montserrat font-black text-xl text-[#0B172A] mb-2">
                {whatsappConfirmed
                  ? "¡Horario Reservado!"
                  : "Confirma en WhatsApp para reservar"}
              </h3>
              <p className="text-[#4D607D] text-sm mb-6 max-w-sm mx-auto">
                {whatsappConfirmed
                  ? "Tu horario quedó reservado tras confirmar por WhatsApp."
                  : "El horario aún no está apartado. Presiona Confirmar por WhatsApp para reservar tu espacio."}
              </p>

              {/* Summary card */}
              <div className="bg-[#F8FAFF] border border-[#DCE7F8] rounded-2xl p-5 text-left mb-6 max-w-sm mx-auto">
                <div className="space-y-2.5">
                  {[
                    {
                      icon: <Calendar className="w-3.5 h-3.5" />,
                      label: "Fecha",
                      value: formatDayFull(selectedDay),
                    },
                    {
                      icon: <Clock className="w-3.5 h-3.5" />,
                      label: "Hora",
                      value: selectedHour ? formatHour(selectedHour) : "",
                    },
                    {
                      icon: <User className="w-3.5 h-3.5" />,
                      label: "Nombre",
                      value: form.name,
                    },
                    {
                      icon: <Package className="w-3.5 h-3.5" />,
                      label: "Producto",
                      value: form.product,
                    },
                    {
                      icon: <MapPin className="w-3.5 h-3.5" />,
                      label: "Punto",
                      value: form.deliveryPoint,
                    },
                  ].map((row) => (
                    <div key={row.label} className="flex items-start gap-3">
                      <div className="text-[#0057FF] mt-0.5 shrink-0">
                        {row.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#6B7E9E] text-[10px] uppercase tracking-wider font-bold">
                          {row.label}
                        </p>
                        <p className="text-[#0B172A] text-xs font-semibold leading-snug">
                          {row.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 max-w-sm mx-auto">
                <a
                  href={confirmWhatsApp()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleConfirmWhatsAppClick}
                  className="btn-gotech flex items-center justify-center gap-2 py-3.5 text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Confirmar por WhatsApp
                </a>
                <button
                  onClick={handleReset}
                  className="text-[#6B7E9E] hover:text-[#0B172A] text-xs font-semibold transition-colors py-2"
                >
                  {whatsappConfirmed
                    ? "Programar otra entrega"
                    : "Cancelar y elegir otro horario"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
