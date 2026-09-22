import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowDownWideNarrowIcon, SearchXIcon, XIcon } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { SearchBar } from '../components/SearchBar';
import { FilterSheet, FilterGroup } from '../components/FilterSheet';
import { CourseCard } from '../components/CourseCard';
import { CourseListSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { useEnrollment } from '../contexts/EnrollmentContext';
import { getAvailabilityStatus } from '../utils/availability';
import { cn } from '../utils/cn';
import { useDebouncedValue } from '../hooks/useDebouncedValue';

type SortMode = 'name' | 'availability';

const DEFAULT_FILTERS = { semester: 'all', day: 'all', availability: 'all', course: 'all' };
const normalizeSearch = (text: string) => text.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export function Courses() {
  const [searchParams] = useSearchParams();
  const { courses, groups } = useEnrollment();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [filters, setFilters] = useState<Record<string, string>>(DEFAULT_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sort, setSort] = useState<SortMode>('name');
  const [isLoading, setIsLoading] = useState(true);
  const debouncedQuery = useDebouncedValue(query);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 650);
    return () => window.clearTimeout(timer);
  }, []);

  const filterGroups: FilterGroup[] = useMemo(
    () => [
    {
      key: 'semester',
      label: 'Semestre',
      options: [
      { value: 'all', label: 'Todos' },
      ...Array.from(new Set(courses.map((c) => c.semester))).map((s) => ({ value: s, label: `${s} semestre` }))]

    },
    {
      key: 'day',
      label: 'Día',
      options: [
      { value: 'all', label: 'Todos' },
      ...Array.from(new Set(groups.map((g) => g.day))).map((d) => ({ value: d, label: d }))]

    },
    {
      key: 'availability',
      label: 'Disponibilidad',
      options: [
      { value: 'all', label: 'Todas' },
      { value: 'disponible', label: 'Disponible' },
      { value: 'pocas', label: 'Pocas vacantes' },
      { value: 'lleno', label: 'Sin cupos' }]

    },
    {
      key: 'course',
      label: 'Curso',
      options: [{ value: 'all', label: 'Todos' }, ...courses.map((c) => ({ value: c.id, label: c.name }))]
    }],

    [courses, groups]
  );

  const activeFilterCount = Object.entries(filters).filter(([, v]) => v !== 'all').length;

  const filteredCourses = useMemo(() => {
    const q = normalizeSearch(debouncedQuery);
    let result = courses.filter((course) => {
      const courseGroups = groups.filter((g) => g.courseId === course.id);
      if (q && !(normalizeSearch(course.name).includes(q) || course.code.includes(q))) return false;
      if (filters.semester !== 'all' && course.semester !== filters.semester) return false;
      if (filters.course !== 'all' && course.id !== filters.course) return false;
      if ((filters.day !== 'all' || filters.availability !== 'all') && !courseGroups.some((g) =>
        (filters.day === 'all' || g.day === filters.day) &&
        (filters.availability === 'all' || getAvailabilityStatus(g) === filters.availability))) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      const availA = groups.filter((g) => g.courseId === a.id).reduce((s, g) => s + Math.max(0, g.capacity - g.enrolled), 0);
      const availB = groups.filter((g) => g.courseId === b.id).reduce((s, g) => s + Math.max(0, g.capacity - g.enrolled), 0);
      return availB - availA;
    });

    return result;
  }, [courses, groups, debouncedQuery, filters, sort]);

  const clearFilters = () => setFilters(DEFAULT_FILTERS);

  return (
    <AppShell title="Cursos" wide>
      <div className="flex flex-col gap-4">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Buscar por nombre o código"
          onFilterClick={() => setFilterOpen(true)}
          activeFilterCount={activeFilterCount} />
        

        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {activeFilterCount === 0 ?
            <span className="text-sm text-muted">{filteredCourses.length} cursos encontrados</span> :

            Object.entries(filters).
            filter(([, v]) => v !== 'all').
            map(([key, value]) => {
              const group = filterGroups.find((g) => g.key === key);
              const option = group?.options.find((o) => o.value === value);
              return (
                <button
                  key={key}
                  onClick={() => setFilters((prev) => ({ ...prev, [key]: 'all' }))}
                  className="flex items-center gap-1.5 rounded-full border border-burgundy/30 bg-burgundy-light px-3 py-1.5 text-xs font-semibold text-burgundy">
                  
                      {option?.label}
                      <XIcon className="h-3 w-3" />
                    </button>);

            })
            }
          </div>
          <button
            type="button"
            onClick={() => setSort((s) => s === 'name' ? 'availability' : 'name')}
            className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink">
            
            <ArrowDownWideNarrowIcon className="h-3.5 w-3.5" />
            {sort === 'name' ? 'Nombre A-Z' : 'Más vacantes'}
          </button>
        </div>

        {isLoading ?
        <CourseListSkeleton /> :
        filteredCourses.length === 0 ?
        <EmptyState
          icon={SearchXIcon}
          title="No se encontraron cursos"
          description="Intenta con otra búsqueda o ajusta los filtros aplicados."
          actionLabel="Limpiar filtros"
          onAction={() => {
            clearFilters();
            setQuery('');
          }}
          className={cn('rounded-2xl border border-border bg-white')} /> :


        <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4 xl:grid-cols-3">
            {filteredCourses.map((course) =>
          <CourseCard key={course.id} course={course} searchQuery={debouncedQuery} groups={groups.filter((g) => g.courseId === course.id)} />
          )}
          </div>
        }
      </div>

      <FilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        groups={filterGroups}
        values={filters}
        onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: prev[key] === value ? 'all' : value }))}
        onClear={clearFilters}
        resultCount={filteredCourses.length} />
      
    </AppShell>);

}
