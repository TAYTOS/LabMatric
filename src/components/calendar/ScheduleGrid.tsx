import { Course, LabGroup } from '../../types';
import { timeToMinutes } from '../../utils/schedule';

interface ScheduleItem {
  course: Course;
  group: LabGroup;
}

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'] as const;
const START_MINUTES = 7 * 60;
const END_MINUTES = 19 * 60;
const HEIGHT = 720;
const HOURS = Array.from({ length: 13 }, (_, index) => index + 7);

export function ScheduleGrid({ items }: { items: ScheduleItem[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-white shadow-card">
      <div className="min-w-[760px]">
        <div className="grid grid-cols-[4rem_repeat(6,minmax(7rem,1fr))] border-b border-border">
          <div className="p-3 text-xs font-semibold text-muted">Hora</div>
          {DAYS.map((day) => <div key={day} className="border-l border-border p-3 text-center text-sm font-semibold text-ink">{day}</div>)}
        </div>
        <div className="grid grid-cols-[4rem_repeat(6,minmax(7rem,1fr))]">
          <div className="relative border-r border-border" style={{ height: HEIGHT }}>
            {HOURS.map((hour) => <span key={hour} className="absolute right-2 -translate-y-2 text-[11px] text-muted" style={{ top: ((hour * 60 - START_MINUTES) / (END_MINUTES - START_MINUTES)) * HEIGHT }}>{`${String(hour).padStart(2, '0')}:00`}</span>)}
          </div>
          {DAYS.map((day, dayIndex) => (
            <div key={day} className="relative border-r border-border last:border-r-0" style={{ height: HEIGHT }}>
              {HOURS.map((hour) => <div key={hour} className="absolute inset-x-0 border-t border-border/70" style={{ top: ((hour * 60 - START_MINUTES) / (END_MINUTES - START_MINUTES)) * HEIGHT }} />)}
              {items.filter((item) => item.group.day === day).map(({ course, group }, index) => {
                const top = Math.max(0, ((timeToMinutes(group.startTime) - START_MINUTES) / (END_MINUTES - START_MINUTES)) * HEIGHT);
                const height = Math.max(44, ((timeToMinutes(group.endTime) - timeToMinutes(group.startTime)) / (END_MINUTES - START_MINUTES)) * HEIGHT);
                const tones = ['bg-primary/90', 'bg-accent/90', 'bg-sky-700/90', 'bg-amber-700/90'];
                return <article key={group.id} className={`absolute inset-x-1 overflow-hidden rounded-lg p-2 text-white shadow-sm ${tones[(dayIndex + index) % tones.length]}`} style={{ top, height }}>
                  <p className="text-xs font-bold leading-tight">{course.name}</p>
                  <p className="mt-1 text-[11px] leading-tight text-white/90">{group.name} · {group.room}</p>
                  <p className="text-[11px] text-white/90">{group.startTime}-{group.endTime}</p>
                </article>;
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
