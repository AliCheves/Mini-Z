import { createContext, useContext, useState } from 'react'

// ── Full ES / EN string map ──────────────────────────────────
const strings = {
  es: {
    // Nav
    nav_dashboard:   'Inicio',
    nav_standings:   'Clasificación',
    nav_schedule:    'Calendario',
    nav_profile:     'Mi Perfil',
    nav_admin:       'Admin',
    nav_logout:      'Cerrar Sesión',
    nav_login:       'Iniciar Sesión',

    // Auth
    login_title:       'Miniseta RC',
    login_subtitle:    'Ingresa a tu cuenta',
    login_email:       'Correo electrónico',
    login_password:    'Contraseña',
    login_submit:      'Iniciar Sesión',
    login_loading:     'Ingresando…',
    login_error:       'Correo o contraseña incorrectos',

    // Dashboard
    dash_next_race:       'Próxima Carrera',
    dash_last_race:       'Última Carrera',
    dash_round:           'Ronda',
    dash_of:              'de',
    dash_countdown:       'Tiempo restante',
    dash_drivers:         'Pilotos',
    dash_season_fastlap:  'Vuelta Rápida de Temporada',
    dash_pole_sitter:     'Poleman',
    dash_champ_progress:  'Avance de Campeonatos',
    dash_starting_grid:   'Grilla de Salida',
    dash_standings_top5:  'Clasificación (Top 5)',
    dash_view_all:        'Ver Todo',
    dash_no_race:         'No hay carreras programadas',
    dash_days:            'd',
    dash_hours:           'h',
    dash_mins:            'm',
    dash_secs:            's',

    // Standings
    standings_title:     'Clasificación',
    standings_pos:       'Pos',
    standings_number:    '#',
    standings_driver:    'Piloto',
    standings_car_type:  'Categoría',
    standings_best_lap:  'Mejor Vuelta',
    standings_wins:      'Victorias',
    standings_points:    'Puntos',
    standings_no_data:   'Sin resultados aún',

    // Driver profile
    profile_stats:         'Estadísticas',
    profile_total_points:  'Puntos Totales',
    profile_wins:          'Victorias',
    profile_poles:         'Poles',
    profile_fast_laps:     'Vueltas Rápidas',
    profile_best_lap:      'Mejor Vuelta',
    profile_lap_history:   'Evolución de Vueltas',
    profile_race_history:  'Historial de Carreras',
    profile_no_results:    'Sin resultados aún',
    profile_dnf:           'ABD',
    profile_race:          'Carrera',
    profile_date:          'Fecha',
    profile_pos:           'Pos',
    profile_points:        'Pts',
    profile_lap:           'Vuelta',

    // Schedule
    schedule_title:    'Calendario de Carreras',
    schedule_round:    'Ronda',
    schedule_upcoming: 'Próxima',
    schedule_completed:'Completada',
    schedule_qualifying:'Clasificación',
    schedule_racing:   'En pista',
    schedule_races:    'Carreras',
    schedule_location: 'Pista',
    schedule_monday:   'Lunes',
    schedule_no_data:  'Sin rondas programadas',

    // Admin
    admin_title:           'Panel de Administración',
    admin_tab_entry:       'Entrada de Datos',
    admin_tab_drivers:     'Pilotos',
    admin_tab_season:      'Temporada',
    admin_tab_import:      'Importar',
    admin_select_day:      'Seleccionar Día de Carrera',
    admin_qualifying:      'Tiempos de Clasificación',
    admin_driver:          'Piloto',
    admin_lap_time:        'Tiempo (seg)',
    admin_save_qualifying: 'Guardar Clasificación',
    admin_race1:           'Carrera 1 — Resultados',
    admin_race2:           'Carrera 2 — Resultados',
    admin_position:        'Posición',
    admin_dnf:             'ABD',
    admin_save_race:       'Guardar Carrera',
    admin_drivers_title:   'Gestión de Pilotos',
    admin_add_driver:      'Agregar Piloto',
    admin_edit_driver:     'Editar Piloto',
    admin_name:            'Nombre',
    admin_nickname:        'Apodo',
    admin_car_number:      'Número de Auto',
    admin_car_type:        'Tipo de Auto',
    admin_role:            'Rol',
    admin_save:            'Guardar',
    admin_cancel:          'Cancelar',
    admin_season_title:    'Gestión de Temporada',
    admin_new_season:      'Nueva Temporada',
    admin_season_name:     'Nombre',
    admin_season_year:     'Año',
    admin_set_active_champ:'Campeonato Activo',
    admin_import_title:    'Importar Vueltas',
    admin_import_hint:     'Pega los tiempos de vuelta (uno por línea o separados por coma).\nFormato: PILOTO,TIEMPO o solo TIEMPO',
    admin_import_parse:    'Analizar',
    admin_import_confirm:  'Confirmar Importación',
    admin_import_preview:  'Vista Previa',
    admin_saved:           '¡Guardado!',
    admin_error:           'Error al guardar',
    admin_points_auto:     'Puntos calculados automáticamente',

    // Car types
    car_stock_plastica: 'Stock Plástica',
    car_modif:          'Modificado',
    car_pancar:         'Pancar',
    car_touring:        'Touring',

    // Directions
    dir_clockwise:     'Horario',
    dir_anti:          'Anti-horario',

    // Championship names
    champ_1: 'Stock Plástica — Horario',
    champ_2: 'Stock Plástica — Anti-horario',
    champ_3: 'Modif/Pancar — Horario',
    champ_4: 'Modif/Touring — Anti-horario',

    // Points
    points_pole:       'Pole',
    points_fast_lap:   'V. Rápida',
    points_suffix:     'pts',

    // General
    loading:     'Cargando…',
    error:       'Error',
    no_data:     'Sin datos',
    back:        'Volver',
    edit:        'Editar',
    delete:      'Eliminar',
    confirm:     'Confirmar',
    yes:         'Sí',
    no:          'No',
    optional:    'Opcional',
    required:    'Requerido',
    unknown:     'Desconocido',
    email:       'Correo',
    password:    'Contraseña',
    submit:      'Enviar',
    close:       'Cerrar',
  },

  en: {
    nav_dashboard:   'Home',
    nav_standings:   'Standings',
    nav_schedule:    'Schedule',
    nav_profile:     'My Profile',
    nav_admin:       'Admin',
    nav_logout:      'Log Out',
    nav_login:       'Log In',

    login_title:       'Miniseta RC',
    login_subtitle:    'Sign in to your account',
    login_email:       'Email address',
    login_password:    'Password',
    login_submit:      'Sign In',
    login_loading:     'Signing in…',
    login_error:       'Invalid email or password',

    dash_next_race:       'Next Race',
    dash_last_race:       'Last Race',
    dash_round:           'Round',
    dash_of:              'of',
    dash_countdown:       'Time remaining',
    dash_drivers:         'Drivers',
    dash_season_fastlap:  'Season Fast Lap',
    dash_pole_sitter:     'Pole Sitter',
    dash_champ_progress:  'Championship Progress',
    dash_starting_grid:   'Starting Grid',
    dash_standings_top5:  'Standings (Top 5)',
    dash_view_all:        'View All',
    dash_no_race:         'No races scheduled',
    dash_days:            'd',
    dash_hours:           'h',
    dash_mins:            'm',
    dash_secs:            's',

    standings_title:     'Standings',
    standings_pos:       'Pos',
    standings_number:    '#',
    standings_driver:    'Driver',
    standings_car_type:  'Category',
    standings_best_lap:  'Best Lap',
    standings_wins:      'Wins',
    standings_points:    'Points',
    standings_no_data:   'No results yet',

    profile_stats:         'Statistics',
    profile_total_points:  'Total Points',
    profile_wins:          'Wins',
    profile_poles:         'Poles',
    profile_fast_laps:     'Fast Laps',
    profile_best_lap:      'Best Lap',
    profile_lap_history:   'Lap Time Progression',
    profile_race_history:  'Race History',
    profile_no_results:    'No results yet',
    profile_dnf:           'DNF',
    profile_race:          'Race',
    profile_date:          'Date',
    profile_pos:           'Pos',
    profile_points:        'Pts',
    profile_lap:           'Lap',

    schedule_title:    'Race Calendar',
    schedule_round:    'Round',
    schedule_upcoming: 'Upcoming',
    schedule_completed:'Completed',
    schedule_qualifying:'Qualifying',
    schedule_racing:   'Racing',
    schedule_races:    'Races',
    schedule_location: 'Track',
    schedule_monday:   'Monday',
    schedule_no_data:  'No rounds scheduled',

    admin_title:           'Admin Panel',
    admin_tab_entry:       'Data Entry',
    admin_tab_drivers:     'Drivers',
    admin_tab_season:      'Season',
    admin_tab_import:      'Import',
    admin_select_day:      'Select Race Day',
    admin_qualifying:      'Qualifying Times',
    admin_driver:          'Driver',
    admin_lap_time:        'Time (sec)',
    admin_save_qualifying: 'Save Qualifying',
    admin_race1:           'Race 1 — Results',
    admin_race2:           'Race 2 — Results',
    admin_position:        'Position',
    admin_dnf:             'DNF',
    admin_save_race:       'Save Race',
    admin_drivers_title:   'Driver Management',
    admin_add_driver:      'Add Driver',
    admin_edit_driver:     'Edit Driver',
    admin_name:            'Name',
    admin_nickname:        'Nickname',
    admin_car_number:      'Car Number',
    admin_car_type:        'Car Type',
    admin_role:            'Role',
    admin_save:            'Save',
    admin_cancel:          'Cancel',
    admin_season_title:    'Season Management',
    admin_new_season:      'New Season',
    admin_season_name:     'Name',
    admin_season_year:     'Year',
    admin_set_active_champ:'Active Championship',
    admin_import_title:    'Import Lap Times',
    admin_import_hint:     'Paste lap times (one per line or comma-separated).\nFormat: DRIVER,TIME or just TIME',
    admin_import_parse:    'Parse',
    admin_import_confirm:  'Confirm Import',
    admin_import_preview:  'Preview',
    admin_saved:           'Saved!',
    admin_error:           'Error saving',
    admin_points_auto:     'Points calculated automatically',

    car_stock_plastica: 'Stock Plastic',
    car_modif:          'Modified',
    car_pancar:         'Pancar',
    car_touring:        'Touring',

    dir_clockwise:     'Clockwise',
    dir_anti:          'Anti-clockwise',

    champ_1: 'Stock Plastic — Clockwise',
    champ_2: 'Stock Plastic — Anti-clockwise',
    champ_3: 'Modif/Pancar — Clockwise',
    champ_4: 'Modif/Touring — Anti-clockwise',

    points_pole:       'Pole',
    points_fast_lap:   'Fast Lap',
    points_suffix:     'pts',

    loading:     'Loading…',
    error:       'Error',
    no_data:     'No data',
    back:        'Back',
    edit:        'Edit',
    delete:      'Delete',
    confirm:     'Confirm',
    yes:         'Yes',
    no:          'No',
    optional:    'Optional',
    required:    'Required',
    unknown:     'Unknown',
    email:       'Email',
    password:    'Password',
    submit:      'Submit',
    close:       'Close',
  },
}

const LangContext = createContext(null)

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('miniseta_lang') || 'es')

  function toggle() {
    const next = lang === 'es' ? 'en' : 'es'
    setLang(next)
    localStorage.setItem('miniseta_lang', next)
  }

  function t(key) {
    return strings[lang]?.[key] ?? strings['es']?.[key] ?? key
  }

  return (
    <LangContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used inside LangProvider')
  return ctx
}
