import { AppNotification, Course, Enrollment, LabGroup, User } from '../types';

export const ACADEMIC_PERIOD = '2026-B';

export const mockUsers: User[] = [
{
  id: 'u1',
  names: 'Taylor',
  surnames: 'Betanzos',
  fullName: 'Taylor Betanzos',
  studentCode: '20201234',
  email: 'estudiante@unsa.edu.pe',
  password: 'Unsa2026*',
  program: 'Ingeniería de Sistemas',
  semester: 'IX semestre',
  period: ACADEMIC_PERIOD,
  role: 'student',
  avatarInitials: 'TB'
},
{
  id: 'u2',
  names: 'Mariana',
  surnames: 'Delgado Ríos',
  fullName: 'Mariana Delgado Ríos',
  studentCode: 'ADM-0098',
  email: 'admin.sistemas@unsa.edu.pe',
  password: 'Admin2026*',
  program: 'Ingeniería de Sistemas',
  semester: 'Coordinación académica',
  period: ACADEMIC_PERIOD,
  role: 'admin',
  avatarInitials: 'MD'
}];


export const initialCourses: Course[] = [
{
  id: 'c1',
  code: '1703234',
  name: 'Plataformas Emergentes',
  description:
  'Estudio de tecnologías emergentes como blockchain, IoT, computación en la nube y arquitecturas serverless aplicadas al desarrollo de software moderno.',
  semester: 'IX',
  credits: 3,
  instructor: 'Dr. Alberto Mamani Condori',
  groupIds: ['g1a', 'g1b']
},
{
  id: 'c2',
  code: '1703228',
  name: 'Calidad de Software',
  description:
  'Aplicación de estándares, métricas y técnicas de aseguramiento de calidad durante todo el ciclo de vida del desarrollo de software.',
  semester: 'IX',
  credits: 4,
  instructor: 'Dr. Fernando Paredes Cáceres',
  groupIds: ['g2a', 'g2b']
},
{
  id: 'c3',
  code: '1703215',
  name: 'Ingeniería de Software II',
  description:
  'Diseño, construcción y gestión de proyectos de software aplicando metodologías ágiles y prácticas de ingeniería de requisitos.',
  semester: 'VIII',
  credits: 4,
  instructor: 'Dr. Iván Chalco Gómez',
  groupIds: ['g3a', 'g3b']
},
{
  id: 'c4',
  code: '1702198',
  name: 'Base de Datos II',
  description:
  'Modelado avanzado de bases de datos, optimización de consultas y administración de motores relacionales y no relacionales.',
  semester: 'VII',
  credits: 4,
  instructor: 'Dr. Iván Chalco Gómez',
  groupIds: ['g4a', 'g4b']
}];


export const initialGroups: LabGroup[] = [
{
  id: 'g1a',
  courseId: 'c1',
  name: 'Grupo A',
  instructor: 'Ing. Diego Rodríguez Flores',
  day: 'Lunes',
  startTime: '10:40',
  endTime: '12:20',
  room: 'Laboratorio 401',
  capacity: 20,
  enrolled: 15,
  deadline: '2026-09-28',
  topics: [
  'Introducción a arquitecturas serverless',
  'Contenedores y orquestación con Docker',
  'Fundamentos de blockchain',
  'Integración de APIs para dispositivos IoT']

},
{
  id: 'g1b',
  courseId: 'c1',
  name: 'Grupo B',
  instructor: 'Ing. Milagros Huamán Rondón',
  day: 'Miércoles',
  startTime: '14:00',
  endTime: '15:40',
  room: 'Laboratorio 402',
  capacity: 20,
  enrolled: 8,
  deadline: '2026-09-28',
  topics: [
  'Introducción a arquitecturas serverless',
  'Contenedores y orquestación con Docker',
  'Fundamentos de blockchain',
  'Integración de APIs para dispositivos IoT']

},
{
  id: 'g2a',
  courseId: 'c2',
  name: 'Grupo A',
  instructor: 'Ing. Katherine Flores Begazo',
  day: 'Martes',
  startTime: '08:00',
  endTime: '09:40',
  room: 'Laboratorio 305',
  capacity: 18,
  enrolled: 18,
  deadline: '2026-09-24',
  topics: [
  'Estándares ISO/IEC 25010',
  'Diseño de casos de prueba',
  'Automatización de pruebas con Selenium',
  'Métricas de calidad interna y externa']

},
{
  id: 'g2b',
  courseId: 'c2',
  name: 'Grupo B',
  instructor: 'Ing. Jorge Salinas Delgado',
  day: 'Jueves',
  startTime: '16:00',
  endTime: '17:40',
  room: 'Laboratorio 305',
  capacity: 18,
  enrolled: 10,
  deadline: '2026-09-24',
  topics: [
  'Estándares ISO/IEC 25010',
  'Diseño de casos de prueba',
  'Automatización de pruebas con Selenium',
  'Métricas de calidad interna y externa']

},
{
  id: 'g3a',
  courseId: 'c3',
  name: 'Grupo A',
  instructor: 'Ing. Andrea Portugal Nina',
  day: 'Lunes',
  startTime: '07:00',
  endTime: '08:40',
  room: 'Laboratorio 203',
  capacity: 22,
  enrolled: 19,
  deadline: '2026-09-22',
  topics: [
  'Elicitación de requisitos ágiles',
  'Historias de usuario y backlog',
  'Scrum aplicado a proyectos de software',
  'Integración continua']

},
{
  id: 'g3b',
  courseId: 'c3',
  name: 'Grupo B',
  instructor: 'Ing. Renzo Cáceres Villanueva',
  day: 'Viernes',
  startTime: '10:40',
  endTime: '12:20',
  room: 'Laboratorio 203',
  capacity: 22,
  enrolled: 12,
  deadline: '2026-09-22',
  topics: [
  'Elicitación de requisitos ágiles',
  'Historias de usuario y backlog',
  'Scrum aplicado a proyectos de software',
  'Integración continua']

},
{
  id: 'g4a',
  courseId: 'c4',
  name: 'Grupo A',
  instructor: 'Ing. Diego Rodríguez Flores',
  day: 'Martes',
  startTime: '14:00',
  endTime: '15:40',
  room: 'Laboratorio 305',
  capacity: 20,
  enrolled: 20,
  deadline: '2026-09-28',
  topics: [
  'Modelado dimensional',
  'Optimización de consultas SQL',
  'Bases de datos NoSQL',
  'Replicación y respaldo']

},
{
  id: 'g4b', courseId: 'c4', name: 'Grupo B',
  instructor: 'Ing. Patricia Medina Torres', day: 'Viernes',
  startTime: '11:00', endTime: '12:40', room: 'Laboratorio 306',
  capacity: 20, enrolled: 9, deadline: '2026-09-28',
  topics: ['Modelado dimensional', 'Optimización de consultas SQL', 'Bases de datos NoSQL', 'Replicación y respaldo']
}];


export const initialEnrollments: Enrollment[] = [
{
  id: 'e1',
  code: 'MAT-2026-0912',
  studentId: 'u1',
  courseId: 'c3',
  groupId: 'g3b',
  status: 'activa',
  enrollmentDate: '2026-09-12'
},
{
  id: 'e2',
  code: 'MAT-2026-0654',
  studentId: 'u1',
  courseId: 'c1',
  groupId: 'g1b',
  status: 'cancelada',
  enrollmentDate: '2026-09-05',
  cancelledDate: '2026-09-14',
  cancelReason: 'Cruce de horario con otro curso'
},
{
  id: 'e3',
  code: 'MAT-2025-1290',
  studentId: 'u1',
  courseId: 'c4',
  groupId: 'g4a',
  status: 'completada',
  enrollmentDate: '2025-08-18'
},
{
  id: 'e4',
  code: 'MAT-2026-0988',
  studentId: 'u1',
  courseId: 'c2',
  groupId: 'g2b',
  status: 'pendiente',
  enrollmentDate: '2026-09-19'
}];


export const initialNotifications: AppNotification[] = [
{
  id: 'n1',
  type: 'enrollment_success',
  title: 'Matrícula confirmada',
  message:
  'Tu matrícula en Ingeniería de Software II – Grupo B fue registrada correctamente.',
  date: '2026-09-12',
  read: true
},
{
  id: 'n2',
  type: 'upcoming_session',
  title: 'Próxima sesión de laboratorio',
  message:
  'Tu sesión de Ingeniería de Software II se realiza los viernes a las 10:40 en el Laboratorio 203.',
  date: '2026-09-19',
  read: false
},
{
  id: 'n3',
  type: 'deadline',
  title: 'Plazo de matrícula próximo a vencer',
  message:
  'El plazo de matrícula para Plataformas Emergentes – Grupo A vence el 28 de septiembre.',
  date: '2026-09-18',
  read: false
},
{
  id: 'n4',
  type: 'group_change',
  title: 'Cambio de aula',
  message:
  'El Grupo A de Calidad de Software cambió de aula: ahora será en el Laboratorio 305.',
  date: '2026-09-15',
  read: true
},
{
  id: 'n5',
  type: 'cancellation',
  title: 'Matrícula cancelada',
  message:
  'Se canceló tu matrícula en Plataformas Emergentes – Grupo B. Tu vacante fue liberada.',
  date: '2026-09-14',
  read: true
}];
