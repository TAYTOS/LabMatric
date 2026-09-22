import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarSearchIcon, CheckCircle2Icon, ClipboardCheckIcon, LucideIcon } from "lucide-react";
import { Logo } from "../components/Logo";
import { Button } from "../components/ui/Button";
import { useAuth } from "../contexts/AuthContext";
import { cn } from "../utils/cn";
interface Slide {
  icon: LucideIcon;
  title: string;
  description: string;
}
const slides: Slide[] = [{
  icon: ClipboardCheckIcon,
  title: 'Organiza tus laboratorios',
  description: 'Consulta todos tus laboratorios matriculados en un solo lugar, sin hojas de cálculo ni papeles sueltos.'
}, {
  icon: CalendarSearchIcon,
  title: 'Consulta grupos y horarios',
  description: 'Revisa horarios, aulas, docentes y vacantes disponibles de cada grupo antes de decidir.'
}, {
  icon: CheckCircle2Icon,
  title: 'Matricúlate sin complicaciones',
  description: 'Confirma tu matrícula en segundos y recibe el estado de tu proceso en tiempo real.'
}];
export function Onboarding() {
  const navigate = useNavigate();
  const {
    completeOnboarding
  } = useAuth();
  const [index, setIndex] = useState(0);
  const isLast = index === slides.length - 1;
  const finish = () => {
    completeOnboarding();
    navigate('/welcome', {
      replace: true
    });
  };
  const slide = slides[index];
  const Icon = slide.icon;
  return <div className="flex min-h-screen flex-col bg-white">
      <div className="flex items-center justify-between px-5 pt-6">
        <Logo size="sm" />
        {!isLast && <button type="button" onClick={finish} className="text-sm font-semibold text-muted hover:text-ink">
            Omitir
          </button>}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <AnimatePresence mode="wait">
          <motion.div key={index} initial={{
          opacity: 0,
          x: 24
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: -24
        }} transition={{
          duration: 0.28,
          ease: [0.23, 1, 0.32, 1]
        }} className="flex flex-col items-center gap-6">
            <div className="flex h-28 w-28 items-center justify-center rounded-[2rem] bg-burgundy-light">
              <Icon className="h-12 w-12 text-burgundy" aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-xl font-bold text-ink">{slide.title}</h1>
              <p className="max-w-xs text-sm leading-relaxed text-muted">{slide.description}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-6 px-8 pb-10">
        <div className="flex items-center justify-center gap-2" role="group" aria-label="Progreso de introducción">
          {slides.map((item, i) => <button key={item.title} type="button" aria-label={`Paso ${i + 1}: ${item.title}`} aria-pressed={i === index} onClick={() => setIndex(i)} className="flex h-11 w-11 items-center justify-center rounded-lg"><span className={cn('h-1.5 rounded-full transition-all duration-200 ease-out', i === index ? 'w-6 bg-burgundy' : 'w-1.5 bg-border')} /></button>)}
        </div>
        <Button size="lg" fullWidth onClick={() => isLast ? finish() : setIndex((i) => i + 1)}>
          {isLast ? 'Comenzar' : 'Siguiente'}
        </Button>
      </div>
    </div>;
}
