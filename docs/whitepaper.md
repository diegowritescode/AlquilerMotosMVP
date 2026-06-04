# Whitepaper Técnico-Funcional

## Plataforma Web Responsive para Gestión de Alquiler de Motocicletas

**Cliente:** Negocio de alquiler de motocicletas para trabajo diario
**Ubicación:** Medellín, Colombia
**Fuente visual analizada:** Mockup móvil “Moto Rental – Control Total de tu Flota”
**Versión:** Propuesta técnica y funcional para evaluación comercial
**Enfoque recomendado:** Web app responsive mobile-first, bajo costo, bajo mantenimiento y escalable por fases

---

# 1. Resumen Ejecutivo

El mockup adjunto representa una visión clara de una plataforma de gestión de alquiler de motocicletas orientada principalmente al administrador del negocio. La interfaz muestra un producto mobile-first con estética oscura, acentos amarillos, navegación inferior, dashboard operativo, gestión de motos, arrendatarios, pagos, vencimientos, mantenimientos, mapa de fotomultas y reportes.

Aunque visualmente el mockup se aproxima a una aplicación móvil nativa, la recomendación estratégica para la etapa actual del negocio es construir primero una **aplicación web responsive tipo PWA**, optimizada para celular, antes de invertir en una app nativa. El cliente actualmente opera una flota pequeña, aproximadamente cinco motocicletas, por lo cual una solución nativa incrementaría costo, mantenimiento y complejidad sin aportar suficiente retorno inmediato.

La solución recomendada es un **MVP administrativo y operativo**, enfocado en controlar la flota, los arrendatarios, los alquileres, los pagos, los vencimientos documentales, los mantenimientos y las infracciones. El portal público y el portal de cliente deben existir en una versión simple durante la primera fase, pero no deben desplazar la prioridad principal: permitir que el dueño controle el negocio desde su celular.

La arquitectura recomendada es una solución **serverless / Backend-as-a-Service** basada en:

* Frontend: Next.js / React.
* UI: Tailwind CSS, mobile-first.
* Backend: API Routes / Server Actions.
* Base de datos: PostgreSQL gestionado.
* Plataforma recomendada: Supabase.
* Hosting: Vercel o Cloudflare Pages.
* Storage: Supabase Storage.
* Autenticación: Supabase Auth.
* Mapas: OpenStreetMap + Leaflet.
* Pagos iniciales: manuales + links externos.
* Pagos integrados: Fase 2.

Esta arquitectura minimiza infraestructura, reduce DevOps, permite lanzar rápido y conserva una ruta razonable de crecimiento. Supabase ofrece una plataforma integrada con PostgreSQL, autenticación, storage, APIs y funciones serverless; su plan Pro se referencia públicamente desde USD 25/mes, aunque los costos finales dependen del uso real. [F1]

---

# 2. Lectura Visual del Mockup

## 2.1 Hallazgos principales

El mockup no representa únicamente una landing o catálogo de motos. Representa una **plataforma operativa de gestión de flota** con módulos administrativos completos.

### Pantallas identificadas

| Pantalla del mockup    | Funcionalidad implícita                                              |
| ---------------------- | -------------------------------------------------------------------- |
| Landing / presentación | Propuesta de valor, beneficios, WhatsApp, módulos principales        |
| Dashboard              | Indicadores operativos y financieros                                 |
| Mis motos              | Listado, búsqueda, estado, placa, precio semanal                     |
| Detalle de moto        | Información técnica, vencimientos, mantenimiento e historial         |
| Arrendatario actual    | Cliente asignado, contrato, teléfono, WhatsApp, estado de pago       |
| Calendario de pagos    | Pagos semanales, pagos registrados, botón de registrar pago          |
| Mantenimientos         | Próximos mantenimientos, historial y botón agregar                   |
| Mapa de fotomultas     | Visualización geográfica, alertas cercanas, valores y distancias     |
| Reportes               | Ingresos, motos activas, pagos pendientes, mantenimientos pendientes |

## 2.2 Funcionalidades explícitas observadas

El mockup incluye o sugiere los siguientes módulos:

| Módulo                      | Evidencia visual                                      |
| --------------------------- | ----------------------------------------------------- |
| Control de flota            | “Control de 10 motos”, dashboard de motos activas     |
| Conductores / arrendatarios | Pantalla “Arrendatario Actual”                        |
| Pagos semanales             | Calendario de pagos y registros por fecha             |
| Vencimientos y documentos   | SOAT, tecnomecánica, impuestos, cambio de aceite      |
| Mantenimientos              | Pantalla de mantenimientos próximos e historial       |
| Mapa de fotomultas          | Mapa de Medellín con pines y lista de fotomultas      |
| Reportes y estadísticas     | Pantalla de ingresos, motos activas, pagos pendientes |
| WhatsApp                    | Botón y número de contacto                            |
| Catálogo/listado de motos   | Pantalla “Mis Motos” con buscador                     |
| Estados de moto             | Disponible, alquilada, mantenimiento, inactiva        |

## 2.3 Requerimientos implícitos derivados del mockup

El diseño visual sugiere requerimientos que no siempre aparecen de forma explícita en el alcance textual:

| Requerimiento implícito    | Implicación técnica                                      |
| -------------------------- | -------------------------------------------------------- |
| Mobile-first real          | La app debe diseñarse primero para pantallas pequeñas    |
| Navegación inferior        | Arquitectura de módulos simple y accesible               |
| Búsqueda de motos          | Filtros por placa, marca, modelo y estado                |
| Historial por moto         | Modelo de datos relacional con eventos                   |
| Historial por arrendatario | Relación cliente-moto-alquiler-pago-incidente            |
| Alertas por fecha          | Jobs programados o consultas calculadas                  |
| Alertas por kilometraje    | Registro periódico de kilometraje                        |
| Pagos semanales            | Soporte para recurrencia de pagos                        |
| Estado de pago             | Cálculo de deuda y cumplimiento                          |
| WhatsApp operativo         | Acciones rápidas desde fichas de cliente                 |
| Evidencia visual           | Storage para fotos, licencias, documentos y comprobantes |
| Reportes agregados         | Consultas SQL y métricas predefinidas                    |
| Mapa de fotomultas         | Geolocalización opcional y visualización cartográfica    |

## 2.4 Observación importante

El mockup muestra una operación de “10 motos”, mientras que el negocio real tiene aproximadamente 5 motos. Esto debe interpretarse como una visión aspiracional, no como una restricción técnica. El sistema debe permitir operar desde 5 motos y crecer a 10, 20, 50 o más sin reescritura completa, pero sin diseñarse inicialmente como una plataforma enterprise.

---

# 3. Problema de Negocio

El negocio de alquiler de motocicletas para trabajo diario tiene una alta dependencia de control operativo, confianza documental y seguimiento financiero. En una operación manual, los principales riesgos son:

| Problema                                         | Consecuencia                          |
| ------------------------------------------------ | ------------------------------------- |
| Información dispersa en WhatsApp, fotos y notas  | Pérdida de trazabilidad               |
| No saber rápidamente qué moto tiene cada cliente | Riesgo operativo                      |
| Vencimiento de SOAT o tecnomecánica              | Riesgo legal y económico              |
| Mantenimientos no programados                    | Daños, paradas y pérdida de ingresos  |
| Pagos semanales no controlados                   | Mora y pérdida de caja                |
| Falta de evidencia documental                    | Conflictos con arrendatarios          |
| Fotomultas no asociadas al responsable           | Pérdida económica para el propietario |
| Ausencia de reportes                             | Decisiones sin datos                  |

La oportunidad es construir una solución simple, económica y escalable que funcione como el “centro de control” del negocio.

---

# 4. Objetivos del Sistema

## 4.1 Objetivo general

Construir una plataforma web responsive para administrar integralmente el alquiler de motocicletas, permitiendo al dueño controlar flota, arrendatarios, alquileres, pagos, vencimientos, mantenimientos, fotomultas, reportes y evidencia documental desde un teléfono móvil.

## 4.2 Objetivos específicos

| Objetivo                            | Resultado esperado                                          |
| ----------------------------------- | ----------------------------------------------------------- |
| Centralizar la información de motos | Ficha completa por vehículo                                 |
| Controlar estados de flota          | Disponible, alquilada, mantenimiento, inactiva              |
| Registrar arrendatarios             | Información personal, licencia, fotos y documentos          |
| Administrar alquileres              | Fechas, valores, estado y responsable                       |
| Controlar pagos                     | Registro manual, parcial, completo, deuda y acuerdos        |
| Generar alertas                     | Documentos, impuestos, aceite, mantenimiento y pagos        |
| Registrar fotomultas                | Asociar infracciones a moto y arrendatario responsable      |
| Visualizar reportes                 | Ingresos, pagos pendientes, utilización y mantenimiento     |
| Facilitar contacto                  | WhatsApp desde ficha de cliente o landing                   |
| Preparar crecimiento                | Base técnica para portal cliente, pagos online y app futura |

---

# 5. Alcance Funcional Recomendado

## 5.1 MVP — Primera versión

El MVP debe resolver la operación diaria del dueño, no construir todavía una plataforma completa tipo marketplace.

### MVP recomendado

| Módulo                         |  Incluir en MVP | Prioridad |
| ------------------------------ | --------------: | --------: |
| Landing pública                |              Sí |      Alta |
| Catálogo básico de motos       |              Sí |      Alta |
| Contacto por WhatsApp          |              Sí |      Alta |
| Login administrador            |              Sí |      Alta |
| Dashboard operativo            |              Sí |      Alta |
| Gestión de motos               |              Sí |      Alta |
| Fotos de motos                 |              Sí |      Alta |
| Vencimientos de documentos     |              Sí |      Alta |
| Gestión de arrendatarios       |              Sí |      Alta |
| Fotos de licencia / documentos |              Sí |      Alta |
| Alquileres manuales            |              Sí |      Alta |
| Pagos manuales                 |              Sí |      Alta |
| Calendario de pagos            |              Sí |      Alta |
| Mantenimientos                 |              Sí |      Alta |
| Cambios de aceite              |              Sí |      Alta |
| Fotomultas manuales            |              Sí |      Alta |
| Reportes básicos               |              Sí |     Media |
| Auditoría básica               |              Sí |     Media |
| Portal cliente completo        |         Parcial |     Media |
| Pagos online integrados        | No inicialmente |    Fase 2 |
| Mapa avanzado de fotomultas    | No inicialmente |  Fase 2/3 |
| App nativa                     | No inicialmente |    Fase 3 |

## 5.2 Qué debe hacer el MVP en términos prácticos

El dueño debe poder responder rápidamente:

1. ¿Cuántas motos tengo activas?
2. ¿Cuáles están alquiladas?
3. ¿Quién tiene cada moto?
4. ¿Cuánto debe cada arrendatario?
5. ¿Qué pagos vencen esta semana?
6. ¿Qué documentos vencen pronto?
7. ¿Qué motos requieren mantenimiento?
8. ¿Qué multas o incidentes tiene cada moto?
9. ¿Cuánto ingresó esta semana o este mes?

---

# 6. Fases del Producto

## 6.1 Fase 1 — MVP operativo

| Funcionalidad | Descripción                                                          |
| ------------- | -------------------------------------------------------------------- |
| Landing       | Presentación, beneficios, requisitos, WhatsApp                       |
| Dashboard     | Motos activas, alquiladas, mantenimiento, ingresos, pagos pendientes |
| Motos         | Crear, editar, eliminar lógicamente, cargar fotos                    |
| Vencimientos  | SOAT, tecnomecánica, impuestos, aceite                               |
| Arrendatarios | Datos personales, licencia, fotos, historial                         |
| Alquileres    | Crear manualmente, activar, finalizar, cancelar                      |
| Pagos         | Registrar efectivo, transferencia, parcial, completo                 |
| Calendario    | Vista semanal/mensual de pagos                                       |
| Mantenimiento | Programar, registrar costo, historial                                |
| Fotomultas    | Registro manual y asociación a moto/cliente                          |
| Reportes      | Ingresos, deudas, utilización, mantenimiento                         |
| Auditoría     | Registro de acciones críticas                                        |

## 6.2 Fase 2 — Automatización y portal cliente

| Funcionalidad             | Justificación                             |
| ------------------------- | ----------------------------------------- |
| Registro cliente completo | Autoservicio y menor carga administrativa |
| Verificación documental   | Flujo estructurado de documentos          |
| Solicitud de alquiler     | Cliente solicita moto desde catálogo      |
| Contrato PDF              | Formalización del proceso                 |
| Aceptación de términos    | Evidencia de consentimiento               |
| Pagos online              | Menor fricción de recaudo                 |
| Links de pago automáticos | Cobros por WhatsApp o portal              |
| Recordatorios             | Pago, vencimientos, mantenimientos        |
| Mapa simple de fotomultas | Ubicación manual sobre mapa               |
| Notificaciones por email  | Bajo costo frente a SMS o WhatsApp API    |

## 6.3 Fase 3 — Escalamiento futuro

| Funcionalidad                               | Cuándo construirla                                 |
| ------------------------------------------- | -------------------------------------------------- |
| PWA instalable avanzada                     | Cuando haya uso frecuente en móviles               |
| App nativa                                  | Cuando haya alto volumen de clientes o conductores |
| Multiusuario                                | Cuando existan empleados o cobradores              |
| Roles avanzados                             | Operador, mecánico, auditor, cobrador              |
| Multi-sede                                  | Si el negocio crece fuera de una zona              |
| Scoring de clientes                         | Cuando exista historial suficiente                 |
| Integración contable                        | Cuando aumente volumen financiero                  |
| Integración formal con proveedores de datos | Si el volumen de multas justifica costo            |
| Analítica avanzada                          | Cuando haya más de 30–50 motos                     |

---

# 7. Arquitectura Recomendada

## 7.1 Decisión principal

Se recomienda una arquitectura **serverless, monolítica modular y gestionada**, evitando infraestructura tradicional en la primera etapa.

## 7.2 Diagrama conceptual

```text
Usuarios móviles
Administrador / Cliente
        |
        v
Web App Responsive / PWA
Next.js + React + Tailwind
        |
        v
Backend modular
Next.js Server Actions / API Routes
        |
        +---------------------+----------------------+
        |                     |                      |
        v                     v                      v
Supabase Auth          Supabase PostgreSQL     Supabase Storage
Login / roles          Datos relacionales      Fotos / documentos
        |
        v
Funciones programadas / Cron
Alertas de vencimientos, pagos y mantenimiento
        |
        v
Integraciones externas
WhatsApp, pasarela de pagos, OpenStreetMap, consultas manuales SIMIT/RUNT
```

## 7.3 Componentes recomendados

| Capa          | Recomendación                        | Justificación                              |
| ------------- | ------------------------------------ | ------------------------------------------ |
| Frontend      | Next.js + React                      | SEO para landing y app web robusta         |
| UI            | Tailwind CSS                         | Rapidez, consistencia visual, mobile-first |
| Backend       | Next.js API Routes / Server Actions  | Simpleza y menor costo                     |
| Base de datos | PostgreSQL en Supabase               | Relaciones, reportes y consistencia        |
| Auth          | Supabase Auth                        | Login sin construir infraestructura propia |
| Storage       | Supabase Storage                     | Fotos de motos, licencias, comprobantes    |
| Hosting       | Vercel o Cloudflare Pages            | Deploy simple y bajo mantenimiento         |
| Mapas         | OpenStreetMap + Leaflet              | Bajo costo y suficiente para MVP           |
| Alertas       | Cron / Edge Functions                | Automatización sin servidor dedicado       |
| Pagos         | Manual + links externos inicialmente | Menor complejidad                          |
| Auditoría     | Tabla audit_logs                     | Trazabilidad de acciones críticas          |

---

# 8. Serverless vs Arquitectura Tradicional

## 8.1 Comparativo

| Criterio                         | Serverless / BaaS                      | VPS tradicional                 |
| -------------------------------- | -------------------------------------- | ------------------------------- |
| Costo inicial                    | Bajo                                   | Bajo/medio                      |
| Mantenimiento                    | Bajo                                   | Medio/alto                      |
| Backups                          | Gestionados parcialmente               | Manuales                        |
| Seguridad                        | Configurable con servicios gestionados | Requiere administración técnica |
| Escalabilidad                    | Gradual                                | Manual                          |
| Velocidad de desarrollo          | Alta                                   | Media                           |
| DevOps                           | Bajo                                   | Alto                            |
| Adecuado para cliente no técnico | Sí                                     | Menos recomendable              |
| Riesgo de sobreingeniería        | Bajo                                   | Medio                           |

## 8.2 Recomendación

Para este negocio, serverless/BaaS es más conveniente que una arquitectura tradicional porque:

* Evita administrar servidores.
* Reduce mantenimiento operativo.
* Permite lanzar rápido.
* Facilita autenticación y storage.
* Permite escalar por uso.
* Es suficiente para una operación inicial de 5–20 motos.
* Permite migrar o robustecer después si el negocio crece.

No se recomienda iniciar con Kubernetes, microservicios, VPS complejo, colas distribuidas o infraestructura empresarial.

---

# 9. Base de Datos Recomendada

## 9.1 PostgreSQL

Se recomienda PostgreSQL por la naturaleza relacional del negocio.

El sistema debe relacionar motos, arrendatarios, alquileres, pagos, documentos, mantenimientos, multas y auditoría. SQL permite consultas robustas para reportes financieros, vencimientos, historial y saldos.

## 9.2 Por qué no iniciar con MongoDB

| Motivo               | Explicación                                     |
| -------------------- | ----------------------------------------------- |
| Relaciones fuertes   | Cliente-moto-alquiler-pago requieren integridad |
| Reportes financieros | SQL es más adecuado                             |
| Auditoría            | Requiere consistencia                           |
| Pagos y saldos       | Mejor modelados relacionalmente                 |
| Vencimientos         | Consultas por fechas son naturales en SQL       |

---

# 10. Modelo de Datos Conceptual

## 10.1 Entidades principales

```text
User
 ├── Admin
 └── Customer

Customer
 ├── Identity Documents
 ├── Driver License
 ├── Rentals
 ├── Payments
 ├── Fines
 └── Incidents

Motorcycle
 ├── Documents
 ├── Photos
 ├── Rentals
 ├── Maintenance Records
 ├── Oil Changes
 └── Fines

Rental
 ├── Customer
 ├── Motorcycle
 ├── Payments
 ├── Contract Terms
 └── Audit Logs

Payment
 ├── Rental
 ├── Customer
 └── Evidence

Fine
 ├── Motorcycle
 ├── Responsible Customer
 ├── Location
 └── Payment Status
```

## 10.2 Tablas sugeridas

| Tabla                | Campos principales                                                                                               |
| -------------------- | ---------------------------------------------------------------------------------------------------------------- |
| users                | id, email, phone, role, status, created_at                                                                       |
| customers            | id, full_name, document_type, document_number, nationality, birth_date, phone, address, license_category, status |
| customer_documents   | id, customer_id, type, file_url, expiration_date, verified_at                                                    |
| motorcycles          | id, brand, model, cc, year, plate, mileage, color, current_status, weekly_price                                  |
| motorcycle_photos    | id, motorcycle_id, file_url, photo_type, created_at                                                              |
| motorcycle_documents | id, motorcycle_id, type, expiration_date, file_url, status                                                       |
| rentals              | id, customer_id, motorcycle_id, start_date, end_date, agreed_value, payment_frequency, status                    |
| payments             | id, rental_id, customer_id, amount, method, status, due_date, paid_at, evidence_url                              |
| payment_agreements   | id, payment_id, customer_id, commitment_date, amount_due, status, notes                                          |
| maintenance_records  | id, motorcycle_id, type, date, mileage, cost, notes                                                              |
| oil_changes          | id, motorcycle_id, date, mileage, next_mileage, next_date                                                        |
| fines                | id, motorcycle_id, customer_id, date, amount, reason, location_text, lat, lng, status                            |
| incidents            | id, motorcycle_id, customer_id, rental_id, date, description, evidence_url                                       |
| audit_logs           | id, actor_id, entity_type, entity_id, action, before_data, after_data, created_at                                |

---

# 11. Roles y Permisos

## 11.1 MVP

| Rol                    | Permisos                                                       |
| ---------------------- | -------------------------------------------------------------- |
| Administrador / Dueño  | Acceso total                                                   |
| Cliente / Arrendatario | Registro, documentos, solicitudes y consulta de su información |

## 11.2 Futuro

| Rol        | Uso                                 |
| ---------- | ----------------------------------- |
| Operador   | Gestionar motos, alquileres y pagos |
| Cobrador   | Ver deudas y registrar pagos        |
| Mecánico   | Registrar mantenimientos            |
| Auditor    | Solo lectura y reportes             |
| Superadmin | Gestión multi-sede o multiempresa   |

---

# 12. Diseño Funcional Basado en el Mockup

## 12.1 Navegación recomendada

El mockup muestra navegación inferior, ideal para uso móvil. Se recomienda mantener cinco secciones principales:

| Tab          | Módulo                                    |
| ------------ | ----------------------------------------- |
| Inicio       | Dashboard                                 |
| Motos        | Flota                                     |
| Alquileres   | Contratos y arrendatarios                 |
| Vencimientos | Documentos, pagos y mantenimiento         |
| Más          | Reportes, configuración, multas, usuarios |

## 12.2 Dashboard

Debe mostrar:

| Indicador               | Descripción                            |
| ----------------------- | -------------------------------------- |
| Total de motos          | Motos activas registradas              |
| Motos alquiladas        | Motos con alquiler activo              |
| Motos disponibles       | Motos listas para alquilar             |
| Motos en mantenimiento  | Motos no disponibles                   |
| Ingresos de la semana   | Pagos registrados                      |
| Pagos pendientes        | Saldos vencidos                        |
| Próximos vencimientos   | SOAT, tecnomecánica, impuestos, aceite |
| Mantenimientos próximos | Próximos 7/15/30 días                  |

## 12.3 Gestión de motos

Campos mínimos:

| Campo          | Tipo                                              |
| -------------- | ------------------------------------------------- |
| Marca          | Texto                                             |
| Modelo         | Texto                                             |
| Cilindraje     | Número                                            |
| Año            | Número                                            |
| Placa          | Texto único                                       |
| Color          | Texto                                             |
| Kilometraje    | Número                                            |
| Valor diario   | Moneda                                            |
| Valor semanal  | Moneda                                            |
| Valor mensual  | Moneda                                            |
| Estado general | Lista                                             |
| Estado motor   | Lista                                             |
| Estado llantas | Lista                                             |
| Estado actual  | Disponible / alquilada / mantenimiento / inactiva |
| Fotos          | Archivos                                          |
| Observaciones  | Texto                                             |

## 12.4 Arrendatarios

Campos mínimos:

| Campo              | Tipo        |
| ------------------ | ----------- |
| Nombre completo    | Texto       |
| Tipo documento     | Lista       |
| Número documento   | Texto único |
| Nacionalidad       | Texto       |
| Fecha nacimiento   | Fecha       |
| Edad               | Calculada   |
| Teléfono           | Texto       |
| Dirección          | Texto       |
| Licencia           | Texto       |
| Categoría licencia | Lista       |
| Foto licencia      | Archivo     |
| Foto frontal       | Archivo     |
| Referencias        | Texto       |
| Observaciones      | Texto       |
| Estado financiero  | Calculado   |

## 12.5 Alquileres

Campos:

| Campo                   | Descripción                              |
| ----------------------- | ---------------------------------------- |
| Arrendatario            | Cliente registrado                       |
| Moto                    | Moto disponible                          |
| Fecha inicio            | Fecha                                    |
| Fecha fin               | Fecha                                    |
| Valor acordado          | Moneda                                   |
| Frecuencia de pago      | Diario, semanal, mensual                 |
| Día de pago             | Ej. lunes                                |
| Estado                  | Pendiente, activo, finalizado, cancelado |
| Términos aceptados      | Fecha/hora                               |
| Evidencia de entrega    | Fotos opcionales                         |
| Evidencia de devolución | Fotos opcionales                         |

## 12.6 Pagos

El mockup muestra pagos semanales, por lo cual el sistema debe soportar:

| Función                         | MVP |
| ------------------------------- | --- |
| Registrar pago                  | Sí  |
| Registrar pago parcial          | Sí  |
| Marcar pago completo            | Sí  |
| Registrar transferencia         | Sí  |
| Registrar efectivo              | Sí  |
| Adjuntar comprobante            | Sí  |
| Calendario de pagos             | Sí  |
| Estado pagado/pendiente/vencido | Sí  |
| Acuerdo de pago                 | Sí  |

---

# 13. Sistema de Pagos en Colombia

## 13.1 Recomendación para MVP

La primera versión debe iniciar con pagos manuales y links externos.

### Por qué

* El negocio aún es pequeño.
* La mayoría de pagos pueden gestionarse por transferencia, Nequi, efectivo o link.
* Evita webhooks, conciliación automática y soporte de pasarela.
* Reduce costo y tiempo de desarrollo.
* Permite validar comportamiento de pago antes de automatizar.

## 13.2 Comparativo de pasarelas

| Pasarela     | Ventajas                                                    | Consideraciones                               | Recomendación                    |
| ------------ | ----------------------------------------------------------- | --------------------------------------------- | -------------------------------- |
| Wompi        | Fuerte en Colombia, Bancolombia/Nequi, PSE, tarjetas, links | Validar tarifas y requisitos vigentes         | Muy recomendada                  |
| Bold         | Fácil para emprendedores, links, PSE, tarjetas, billeteras  | Tarifas dependen de producto y volumen        | Muy recomendada                  |
| Mercado Pago | Reconocida, links y checkout                                | Tarifas varían por plazo de disponibilidad    | Recomendable                     |
| ePayco       | Muchos medios de pago, PSE y billeteras                     | Revisar costos de retiro y comisiones mínimas | Recomendable                     |
| PayU         | Robusta y tradicional                                       | Puede ser más pesada para MVP                 | Más adecuada para fase posterior |

## 13.3 Estrategia recomendada

| Fase   | Estrategia                                      |
| ------ | ----------------------------------------------- |
| MVP    | Registrar pagos manuales y guardar comprobantes |
| MVP+   | Enviar links de pago Wompi/Bold por WhatsApp    |
| Fase 2 | Integrar una pasarela con webhooks              |
| Fase 3 | Conciliación automática y reportes contables    |

No se recomienda integrar varias pasarelas al inicio. La decisión más eficiente es seleccionar una principal y dejar métodos manuales como respaldo.

---

# 14. Fotomultas e Infracciones

## 14.1 Evaluación técnica

El mockup incluye un mapa de fotomultas con pines en Medellín, valores de multa, ubicación, límite de velocidad y distancia. Esta es una funcionalidad visualmente atractiva, pero debe manejarse con cuidado.

En Colombia existen fuentes oficiales de consulta como SIMIT, RUNT y portales locales de movilidad. SIMIT permite consultar y pagar multas de tránsito a nivel nacional; RUNT referencia consultas ciudadanas relacionadas con licencia, vehículos y multas/comparendos; Medellín cuenta con un portal específico para consulta de comparendos electrónicos. [F6] [F7] [F8]

Sin embargo, para un MVP no se debe asumir que existe una API pública, estable y jurídicamente segura para consultar automáticamente fotomultas por placa y alimentar el sistema.

## 14.2 Recomendación para MVP

Construir un módulo manual de infracciones.

### Funciones MVP

| Función                          | Descripción                                                           |
| -------------------------------- | --------------------------------------------------------------------- |
| Crear infracción                 | Registro manual por el administrador                                  |
| Asociar moto                     | Por placa                                                             |
| Asociar arrendatario responsable | Según alquiler activo en la fecha                                     |
| Registrar fecha                  | Fecha de comparendo o fotomulta                                       |
| Registrar valor                  | Valor económico                                                       |
| Registrar motivo                 | Exceso de velocidad, semáforo, SOAT, etc.                             |
| Registrar ubicación              | Texto libre                                                           |
| Coordenadas                      | Opcional                                                              |
| Evidencia                        | PDF, foto o captura                                                   |
| Estado                           | Pendiente, en disputa, pagada, asumida por cliente, asumida por dueño |
| Observaciones                    | Notas internas                                                        |

## 14.3 Flujo operativo

```text
Administrador consulta fuente oficial
        |
        v
Encuentra comparendo o fotomulta
        |
        v
Registra infracción en el sistema
        |
        v
Selecciona moto por placa
        |
        v
Sistema sugiere arrendatario por fecha del alquiler
        |
        v
Administrador valida responsable
        |
        v
Carga evidencia
        |
        v
Registra pago, deuda, acuerdo o disputa
```

## 14.4 Mapa con OpenStreetMap

Sí es viable construir un mapa con OpenStreetMap y Leaflet.

| Función                                             | Viabilidad                       |
| --------------------------------------------------- | -------------------------------- |
| Mostrar pines de fotomultas registradas manualmente | Alta                             |
| Seleccionar ubicación en mapa                       | Alta                             |
| Ver historial geográfico por moto                   | Alta                             |
| Estadísticas por zona                               | Media                            |
| Mapa de calor                                       | Fase 3                           |
| Consulta automática de cámaras/fotomultas           | Baja para MVP                    |
| Integración oficial automática                      | Depende de convenios o proveedor |

## 14.5 Riesgo de scraping

No se recomienda scraping automático de SIMIT, RUNT o portales locales.

| Riesgo          | Motivo                                 |
| --------------- | -------------------------------------- |
| Legal           | Posibles restricciones de uso          |
| Técnico         | CAPTCHA, cambios de frontend, bloqueos |
| Confiabilidad   | Datos incompletos o fallidos           |
| Responsabilidad | Error puede afectar cobros o disputas  |
| Seguridad       | Manejo de datos personales y placas    |

---

# 15. Reportes

## 15.1 Reportes del MVP

| Reporte                      | Métrica                              |
| ---------------------------- | ------------------------------------ |
| Ingresos                     | Día, semana, mes                     |
| Pagos pendientes             | Cliente, moto, valor y fecha         |
| Utilización de motos         | Días alquilada / días disponibles    |
| Motos por estado             | Disponible, alquilada, mantenimiento |
| Documentos próximos a vencer | SOAT, tecnomecánica, impuestos       |
| Mantenimientos próximos      | Por fecha o kilometraje              |
| Multas                       | Pendientes, pagadas, en disputa      |
| Historial financiero         | Por cliente y por moto               |

## 15.2 Reportes futuros

| Reporte                | Valor                               |
| ---------------------- | ----------------------------------- |
| Rentabilidad por moto  | Decidir qué motos mantener o vender |
| Costo de mantenimiento | Controlar rentabilidad real         |
| Mora por cliente       | Gestión de riesgo                   |
| Incidentes por cliente | Decidir renovaciones                |
| Zonas con más multas   | Prevención                          |
| Tendencia de ingresos  | Planeación financiera               |

---

# 16. Seguridad, Auditoría y Cumplimiento

## 16.1 Datos personales

La plataforma manejará información sensible desde una perspectiva operativa:

* Documento de identidad.
* Licencia de conducción.
* Fotografías.
* Teléfono.
* Dirección.
* Historial financiero.
* Historial de alquileres.
* Incidentes.
* Multas.
* Comprobantes de pago.

En Colombia, el tratamiento de datos personales debe alinearse con la Ley 1581 de 2012 y su reglamentación. [F9]

## 16.2 Controles mínimos

| Control                              | Recomendación                          |
| ------------------------------------ | -------------------------------------- |
| Autorización de tratamiento de datos | Obligatoria                            |
| Política de privacidad               | Publicada en landing                   |
| Términos del alquiler                | Aceptación expresa                     |
| Storage privado                      | Obligatorio                            |
| URLs firmadas                        | Para documentos sensibles              |
| Roles                                | Administrador y cliente                |
| Auditoría                            | Acciones críticas                      |
| Backups                              | Automáticos                            |
| Eliminación lógica                   | No borrar registros críticos           |
| Exportación                          | CSV/Excel para independencia operativa |

## 16.3 Auditoría

Registrar:

| Entidad       | Eventos auditables                        |
| ------------- | ----------------------------------------- |
| Motos         | Creación, edición, cambio de estado       |
| Clientes      | Creación, edición, carga documental       |
| Alquileres    | Creación, activación, cierre, cancelación |
| Pagos         | Registro, edición, anulación              |
| Multas        | Creación, asignación, cambio de estado    |
| Mantenimiento | Registro, edición                         |
| Documentos    | Carga, actualización, vencimiento         |

---

# 17. Costos Estimados

## 17.1 Infraestructura mensual

| Servicio                      | Opción recomendada        | Rango mensual estimado |
| ----------------------------- | ------------------------- | ---------------------: |
| Hosting frontend              | Vercel / Cloudflare Pages |               USD 0–20 |
| Backend + DB + Auth + Storage | Supabase                  |              USD 0–25+ |
| Dominio                       | .com / .com.co            |    USD 1–3 prorrateado |
| Email transaccional           | Brevo / Resend / SMTP     |               USD 0–10 |
| Mapas                         | OpenStreetMap + Leaflet   |                  USD 0 |
| Monitoreo básico              | Logs plataforma           |               USD 0–10 |
| Total MVP                     |                           |         USD 5–75 / mes |

Para una solución productiva con documentos sensibles, se recomienda presupuestar al menos un plan pago de backend gestionado cuando el negocio empiece a depender operativamente del sistema. Supabase Pro se referencia públicamente desde USD 25/mes; Point-in-Time Recovery avanzado tiene costos adicionales relevantes y no se recomienda para el MVP salvo que el riesgo lo justifique. [F1] [F2]

## 17.2 Desarrollo estimado

| Fase   | Alcance                                                                       | Duración estimada |        Rango COP sugerido |
| ------ | ----------------------------------------------------------------------------- | ----------------: | ------------------------: |
| Fase 0 | Descubrimiento, alcance, prototipo, modelo de datos                           |       1–2 semanas |   $1.500.000 – $4.000.000 |
| MVP    | Landing, admin, motos, clientes, alquileres, pagos, alertas, reportes básicos |      6–10 semanas | $12.000.000 – $28.000.000 |
| Fase 2 | Portal cliente, pagos online, contratos PDF, recordatorios                    |       6–8 semanas | $10.000.000 – $25.000.000 |
| Fase 3 | Mapas avanzados, multiusuario, analítica, app/PWA avanzada                    |      8–16 semanas |              $20.000.000+ |

## 17.3 Operación mensual

| Concepto           |                  Rango sugerido |
| ------------------ | ------------------------------: |
| Infraestructura    |                            Bajo |
| Soporte correctivo |   $300.000 – $800.000 COP / mes |
| Mejoras evolutivas | $800.000 – $2.500.000 COP / mes |
| SLA formal         |        Cotización independiente |

---

# 18. Estrategia de Despliegue

## 18.1 Ambientes

| Ambiente   | Uso                     |
| ---------- | ----------------------- |
| Desarrollo | Trabajo técnico interno |
| Staging    | Validación del cliente  |
| Producción | Operación real          |

## 18.2 Flujo recomendado

```text
GitHub
  |
  v
Pull Request
  |
  v
Deploy automático a staging
  |
  v
Validación funcional
  |
  v
Deploy a producción
```

## 18.3 Buenas prácticas

* Repositorio GitHub.
* Variables de entorno separadas.
* Migraciones controladas.
* Backups configurados.
* Checklist de producción.
* Documentación básica.
* Manual de usuario para administrador.
* Exportaciones CSV/Excel.
* Pruebas de flujos críticos.

---

# 19. Estrategia de Backups

## 19.1 Qué respaldar

| Información            | Prioridad |
| ---------------------- | --------- |
| Base de datos          | Crítica   |
| Fotos de motos         | Alta      |
| Documentos de clientes | Crítica   |
| Comprobantes de pago   | Alta      |
| Evidencia de multas    | Alta      |
| Auditoría              | Crítica   |

## 19.2 Política recomendada

| Backup                 | Frecuencia |
| ---------------------- | ---------- |
| Base de datos          | Diario     |
| Storage/documentos     | Semanal    |
| Exportación CSV        | Mensual    |
| Prueba de restauración | Trimestral |
| Retención inicial      | 30–90 días |

El MVP no requiere soluciones costosas de recuperación punto a punto si el presupuesto es limitado; sí requiere backups automáticos, exportaciones y una prueba periódica de restauración.

---

# 20. Riesgos Técnicos

| Riesgo                                   | Impacto                    | Mitigación                 |
| ---------------------------------------- | -------------------------- | -------------------------- |
| Construir app nativa demasiado pronto    | Alto costo                 | Web responsive / PWA       |
| Integrar pagos prematuramente            | Retrasos y complejidad     | Iniciar manual             |
| Automatizar fotomultas sin API confiable | Riesgo legal/técnico       | Registro manual            |
| Subir documentos sin seguridad           | Riesgo de datos personales | Storage privado            |
| No tener backups                         | Pérdida crítica            | Backups automáticos        |
| UI compleja para cliente no técnico      | Baja adopción              | Diseño simple mobile-first |
| No registrar auditoría                   | Conflictos                 | audit_logs                 |
| Sobrediseñar arquitectura                | Costo innecesario          | Monolito modular           |

---

# 21. Riesgos Legales

| Riesgo                          | Recomendación                                            |
| ------------------------------- | -------------------------------------------------------- |
| Tratamiento de datos personales | Política de privacidad y autorización expresa            |
| Uso de fotos y documentos       | Finalidad clara y acceso restringido                     |
| Licencia de conducción          | Validación manual y conservación segura                  |
| Fotomultas                      | No automatizar sin base legal/proveedor confiable        |
| Responsabilidad de infracciones | Contrato claro con arrendatario                          |
| Pagos y mora                    | Términos claros, evidencias y acuerdos                   |
| Habeas Data                     | Procedimiento para consulta, actualización y eliminación |
| Contratos                       | Asesoría legal para formato final                        |

El sistema debe ser una herramienta de gestión y trazabilidad, no un sustituto de asesoría legal ni de las plataformas oficiales de tránsito.

---

# 22. Trade-offs Técnicos

| Decisión                            | Beneficio                        | Costo / Trade-off                 |
| ----------------------------------- | -------------------------------- | --------------------------------- |
| Web responsive en vez de app nativa | Menor costo y lanzamiento rápido | Menor acceso nativo               |
| Supabase en vez de backend propio   | Menor mantenimiento              | Dependencia parcial del proveedor |
| PostgreSQL en vez de NoSQL          | Mejor consistencia y reportes    | Requiere buen diseño relacional   |
| Pagos manuales en MVP               | Simplicidad                      | Menor automatización              |
| Fotomultas manuales                 | Menor riesgo legal               | Requiere disciplina operativa     |
| OpenStreetMap                       | Bajo costo                       | Menos servicios premium           |
| Monolito modular                    | Simple                           | Requiere disciplina de código     |

---

# 23. Recomendación Final

## 23.1 Qué construir primero

Construir una plataforma web responsive mobile-first con:

1. Landing pública.
2. Catálogo básico de motos.
3. Contacto por WhatsApp.
4. Dashboard administrativo.
5. Gestión de motos.
6. Gestión de arrendatarios.
7. Gestión de alquileres.
8. Pagos manuales y calendario de pagos.
9. Alertas de vencimientos.
10. Mantenimientos y cambios de aceite.
11. Registro manual de fotomultas.
12. Reportes básicos.
13. Auditoría mínima.
14. Storage seguro para fotos y documentos.

## 23.2 Qué no construir inicialmente

No construir en MVP:

| Funcionalidad                        | Razón                         |
| ------------------------------------ | ----------------------------- |
| App móvil nativa                     | Sobrecosto para flota pequeña |
| Microservicios                       | Sobreingeniería               |
| Kubernetes                           | Innecesario                   |
| Scraping de SIMIT/RUNT               | Riesgo legal y técnico        |
| Integración con múltiples pasarelas  | Complejidad innecesaria       |
| WhatsApp Business API                | Puede esperar                 |
| Scoring automático                   | Falta historial               |
| BI avanzado                          | Poca data inicial             |
| Mapa avanzado de calor               | Mejor en Fase 3               |
| Verificación automática de identidad | Costosa para MVP              |

## 23.3 Cómo reducir costos

* Construir web responsive, no app nativa.
* Usar Supabase para auth, base de datos y storage.
* Usar Vercel o Cloudflare para hosting.
* Iniciar pagos con registro manual y links externos.
* Usar OpenStreetMap.
* Mantener un único administrador inicialmente.
* Construir solo módulos operativos críticos.
* Diseñar base de datos escalable, pero no arquitectura enterprise.
* Exportar datos a CSV/Excel para independencia.

## 23.4 Cómo validar el negocio rápidamente

El MVP será exitoso si logra:

| Métrica                                  | Meta                 |
| ---------------------------------------- | -------------------- |
| Motos registradas                        | 100%                 |
| Clientes con documentación mínima        | 100%                 |
| Alquileres activos trazados              | 100%                 |
| Pagos pendientes visibles                | 100%                 |
| Vencimientos alertados                   | 100%                 |
| Mantenimientos próximos visibles         | 100%                 |
| Fotomultas registrables                  | Sí                   |
| Tiempo para saber quién tiene una moto   | Menos de 30 segundos |
| Tiempo para saber cuánto debe un cliente | Menos de 30 segundos |

---

# 24. Conclusión Ejecutiva

El mockup adjunto valida una dirección de producto sólida: una plataforma mobile-first para control total de flota, alquileres, pagos, vencimientos, mantenimiento, fotomultas y reportes.

Sin embargo, la implementación recomendada no debe ser una app móvil nativa en la primera fase. Para una operación de aproximadamente cinco motos, la decisión más eficiente es una aplicación web responsive tipo PWA, con arquitectura serverless, base de datos PostgreSQL gestionada y módulos administrativos bien priorizados.

La primera versión debe enfocarse en control operativo, trazabilidad y reducción de riesgo. Las automatizaciones más complejas —pagos integrados, fotomultas automáticas, app nativa, multiusuario avanzado y analítica geográfica— deben aplazarse hasta que exista mayor volumen y validación comercial.

La solución propuesta permite lanzar rápido, controlar costos, reducir mantenimiento y construir una base técnica que puede evolucionar gradualmente hacia una plataforma SaaS especializada en alquiler de motocicletas.

## Fuentes verificadas usadas para costos, pagos, nube, tránsito y marco legal

Supabase publica planes con Free y Pro, y su página de precios referencia el plan Pro desde USD 25/mes; la documentación de Point-in-Time Recovery muestra costos adicionales relevantes para recuperación granular, por lo que no lo recomiendo para MVP salvo necesidad crítica. ([Supabase][1])

Vercel y Cloudflare publican opciones para despliegue serverless/JAMstack, útiles para una web app responsive con bajo mantenimiento operativo. ([Vercel][2])

Para pagos en Colombia, Wompi, Bold, Mercado Pago, ePayco, PayU y Nequi/Wompi publican tarifas y medios de pago variables por producto, método y plazo de disponibilidad; por eso la recomendación es confirmar tarifas al cotizar e integrar solo una pasarela en Fase 2. ([Wompi][3])

Para fotomultas y comparendos, SIMIT permite consultar y pagar multas a nivel nacional; RUNT referencia consulta ciudadana relacionada con licencia, multas y comparendos; Medellín ofrece consulta de comparendos electrónicos; y Datos Abiertos Colombia contiene datasets de comparendos, aunque estos no sustituyen una integración oficial transaccional por placa. ([Federación Colombiana de Municipios][4])

Para riesgos legales, la Ley 1581 de 2012 regula el tratamiento de datos personales en Colombia, el Decreto 1377 de 2013 reglamenta parcialmente esa ley, la Ley 769 de 2002 corresponde al Código Nacional de Tránsito y la Ley 1843 de 2017 regula sistemas automáticos y tecnológicos de detección de infracciones. ([Función Pública][5])

[1]: https://supabase.com/pricing?utm_source=chatgpt.com "Pricing & Fees | Supabase"
[2]: https://vercel.com/pricing?utm_source=chatgpt.com "Vercel Pricing: Hobby, Pro, and Enterprise plans – Vercel"
[3]: https://wompi.com/es/co/planes-tarifas/?utm_source=chatgpt.com "Planes y Tarifas - Wompi"
[4]: https://www.fcm.org.co/simit/?utm_source=chatgpt.com "SIMIT | Inicio Federación Colombiana de Municipios"
[5]: https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981&utm_source=chatgpt.com "Ley 1581 de 2012 - Gestor Normativo - Función Pública"
