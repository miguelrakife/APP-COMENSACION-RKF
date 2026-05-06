# Compensador Horario — PRD

## Resumen
Aplicación móvil Expo (React Native) en español para oficiales del Ejército de Chile que necesitan llevar el control de la **compensación de horas pedagógicas** entre clases dictadas y guardias/servicios de 24 hrs realizados fuera del horario regular.

## Tipo de App
Mobile app — Expo SDK 54 — almacenamiento 100% local (AsyncStorage). Sin login, sin backend.

## Lógica de negocio
- **Bloque de clase**: 90 min cronológicos = **2h pedagógicas (120 min pedag)**
- **Guardia día semana** (17:00 → 08:00, 15h crono) = **20h pedagógicas (1200 min)**
- **Guardia fin de semana** (08:00 → 08:00, 24h crono) = **32h pedagógicas (1920 min)**
- **Asignación**: clases ordenadas por fecha asc se asignan secuencialmente a guardias (por fecha asc) hasta llenar capacidad. Splits si una clase no cabe completa.

## Pantallas
1. **Resumen** — Balance pedagógico, total adeudado, total compensado, equivalencias, clases pendientes.
2. **Clases** — CRUD de clases. Bloques predefinidos: 08:00-09:30, 09:50-11:20, 11:40-13:10, 14:30-16:00, 15:00-16:30, 16:45-18:15. Opción "Otro" personalizado.
3. **Guardias** — CRUD de guardias/servicios. Tipo (semana/finde, auto-detectado), Modalidad (Guardia o Servicio), Tipo de orden (O/E, O/R, O/C), N° orden manual, Fecha de orden manual.
4. **Exportar** — Vista previa de tabla y exportación a Word (.docx) con 5 columnas: N.°, Fecha, Horario, Tiempos compensados, Modalidad.

## Stack técnico
- Expo Router 6 (file-based routing)
- @react-native-async-storage/async-storage (datos locales)
- @react-native-community/datetimepicker (picker nativo)
- expo-file-system + expo-sharing (guardar/compartir docx)
- docx (generación de Word .docx 100% client-side)
- @expo/vector-icons (Ionicons)

## Diseño
- Tema oscuro (navy/slate) tipo táctico militar.
- Verde tactical `#10B981` como color primario, ámbar `#F59E0B` como accent.
- Tipografía: system + Times New Roman para la tabla (coincide con formato del Word exportado).

## Estado
✅ MVP funcional 100%. Probado por testing agent, 11/11 flujos pasaron en web preview.
