/**
 * Official Medellín photo-detection points ("Cámaras Salvavidas" / ANSV).
 *
 * Source: authorized-points list published by the Alcaldía de Medellín and the
 * Agencia Nacional de Seguridad Vial (ANSV). Cameras rotate physically across
 * these authorized points, so `type` defaults to "velocidad" and is editable.
 *
 * Coordinates are GEOCODED and APPROXIMATE (landmark/sector level; a few were
 * hand-corrected against known locations). They are NOT survey-grade — the
 * operator can refine each point from the in-app camera admin (CRUD).
 *
 * No leaflet import here: safe to use from server and client components.
 */
import type { CameraType } from "../types";

export interface SeedCamera {
  id: string;
  name: string;
  type: CameraType;
  lat: number;
  lng: number;
  zone: string;
  max_speed_kmh: number;
  approximate: boolean;
  source: string;
}

export const MEDELLIN_CAMERAS: SeedCamera[] = [
  { id: "88888888-8888-4888-8888-000000000001", name: "Avenida 80 con Calle 2A", type: "velocidad", lat: 6.210186, lng: -75.603533, zone: "Avenida 80", max_speed_kmh: 50, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000002", name: "Avenida 80 con Carrera 76", type: "velocidad", lat: 6.2345, lng: -75.602, zone: "Avenida 80", max_speed_kmh: 50, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000003", name: "Avenida 80 con Calle 35", type: "velocidad", lat: 6.238723, lng: -75.602996, zone: "Avenida 80", max_speed_kmh: 50, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000004", name: "Avenida 80 con Calle 44 (San Juan)", type: "velocidad", lat: 6.2562, lng: -75.6013, zone: "Avenida 80", max_speed_kmh: 50, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000005", name: "Avenida 80 con Calle 48", type: "velocidad", lat: 6.256408, lng: -75.601404, zone: "Avenida 80", max_speed_kmh: 50, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000006", name: "Avenida 80 con Calle 65", type: "velocidad", lat: 6.279074, lng: -75.588767, zone: "Avenida 80", max_speed_kmh: 50, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000007", name: "Avenida 81 con Calle 73", type: "velocidad", lat: 6.279074, lng: -75.588767, zone: "Avenida 80", max_speed_kmh: 50, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000008", name: "Avenida 80 con Calle 12 Sur", type: "velocidad", lat: 6.211962, lng: -75.578077, zone: "Avenida 80", max_speed_kmh: 50, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000009", name: "Avenida del Río con Calle 77", type: "velocidad", lat: 6.287283, lng: -75.56708, zone: "Autopista Norte / Río", max_speed_kmh: 80, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000010", name: "Autopista Norte con Calle 95", type: "velocidad", lat: 6.301173, lng: -75.556653, zone: "Autopista Norte / Río", max_speed_kmh: 80, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000011", name: "Autopista Norte con Calle 103M", type: "velocidad", lat: 6.278649, lng: -75.57109, zone: "Autopista Norte / Río", max_speed_kmh: 80, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000012", name: "Carrera 64C con Calle 97A", type: "velocidad", lat: 6.270296, lng: -75.572714, zone: "Autopista Norte / Río", max_speed_kmh: 80, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000013", name: "Avenida Regional con Calle 57", type: "velocidad", lat: 6.257631, lng: -75.573456, zone: "Autopista Norte / Río", max_speed_kmh: 80, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000014", name: "Avenida Regional con Calle 18", type: "velocidad", lat: 6.243673, lng: -75.575332, zone: "Autopista Norte / Río", max_speed_kmh: 80, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000015", name: "Autopista Sur con Calle 44A (San Juan)", type: "velocidad", lat: 6.253019, lng: -75.583306, zone: "Autopista Sur", max_speed_kmh: 80, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000016", name: "Autopista Sur con Calle 32", type: "velocidad", lat: 6.243673, lng: -75.575332, zone: "Autopista Sur", max_speed_kmh: 80, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000017", name: "Autopista Sur con Calle 4 Sur", type: "velocidad", lat: 6.211962, lng: -75.578077, zone: "Autopista Sur", max_speed_kmh: 80, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000018", name: "Carrera 52 con Calle 2 Sur (Guayabal)", type: "velocidad", lat: 6.206137, lng: -75.587896, zone: "Autopista Sur", max_speed_kmh: 60, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000019", name: "Carrera 65 con Calle 72", type: "velocidad", lat: 6.269732, lng: -75.60256, zone: "Carrera 65", max_speed_kmh: 50, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000020", name: "Carrera 65 con Calle 59A", type: "velocidad", lat: 6.262958, lng: -75.57717, zone: "Carrera 65", max_speed_kmh: 50, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000021", name: "Carrera 65 con Calle 32D", type: "velocidad", lat: 6.235426, lng: -75.579848, zone: "Carrera 65", max_speed_kmh: 50, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000022", name: "Carrera 65 con Calle 8B", type: "velocidad", lat: 6.21331, lng: -75.584842, zone: "Carrera 65", max_speed_kmh: 50, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000023", name: "Avenida Las Vegas (Cra 48) con Calle 10 Sur", type: "velocidad", lat: 6.200202, lng: -75.578485, zone: "Corredor Sur", max_speed_kmh: 50, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000024", name: "Avenida Las Vegas (Cra 48) con Calle 4 Sur", type: "velocidad", lat: 6.214267, lng: -75.576787, zone: "Corredor Sur", max_speed_kmh: 50, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000025", name: "Avenida Las Vegas (Cra 48) con Calle 9", type: "velocidad", lat: 6.211661, lng: -75.574845, zone: "Corredor Sur", max_speed_kmh: 50, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000026", name: "Avenida Las Vegas (Cra 48) con Calle 16A Sur", type: "velocidad", lat: 6.1575, lng: -75.601, zone: "Corredor Sur", max_speed_kmh: 50, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000027", name: "Avenida El Poblado (Cra 43A) con Calle 9", type: "velocidad", lat: 6.190399, lng: -75.578917, zone: "Corredor Sur", max_speed_kmh: 50, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000028", name: "Avenida El Poblado (Cra 43A) con Calle 16A Sur", type: "velocidad", lat: 6.186978, lng: -75.573802, zone: "Corredor Sur", max_speed_kmh: 50, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000029", name: "Carrera 32 con Calle 5 Sur", type: "velocidad", lat: 6.20062, lng: -75.563683, zone: "Corredor Sur", max_speed_kmh: 50, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000030", name: "Carrera 25 con Calle 9A Sur", type: "velocidad", lat: 6.194208, lng: -75.572469, zone: "Corredor Sur", max_speed_kmh: 50, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000031", name: "Avenida Guayabal con Calle 6 Sur", type: "velocidad", lat: 6.206137, lng: -75.587896, zone: "Corredor Sur", max_speed_kmh: 50, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000032", name: "Avenida Guayabal con Calle 20", type: "velocidad", lat: 6.207303, lng: -75.586451, zone: "Corredor Sur", max_speed_kmh: 50, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000033", name: "Avenida Guayabal con Calle 14 Sur", type: "velocidad", lat: 6.206137, lng: -75.587896, zone: "Corredor Sur", max_speed_kmh: 50, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000034", name: "Avenida Industriales con Calle 29", type: "velocidad", lat: 6.230205, lng: -75.574406, zone: "Centro y conectoras", max_speed_kmh: 50, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000035", name: "Calle 30 con Carrera 66B", type: "velocidad", lat: 6.23253, lng: -75.603879, zone: "Centro y conectoras", max_speed_kmh: 50, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000036", name: "Calle 33 con Carrera 76", type: "velocidad", lat: 6.242, lng: -75.595833, zone: "Centro y conectoras", max_speed_kmh: 50, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000037", name: "Calle 44 (San Juan) con Carrera 52", type: "velocidad", lat: 6.245391, lng: -75.573424, zone: "Centro y conectoras", max_speed_kmh: 50, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000038", name: "Calle 44 (San Juan) con Carrera 53", type: "velocidad", lat: 6.245391, lng: -75.573424, zone: "Centro y conectoras", max_speed_kmh: 50, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000039", name: "Calle 44 (San Juan) con Carrera 70", type: "velocidad", lat: 6.256827, lng: -75.590147, zone: "Centro y conectoras", max_speed_kmh: 50, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000040", name: "Calle 50 (Colombia) con Carrera 65", type: "velocidad", lat: 6.222248, lng: -75.574545, zone: "Centro y conectoras", max_speed_kmh: 50, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000041", name: "Calle 50 (Colombia) con Carrera 55", type: "velocidad", lat: 6.257631, lng: -75.573456, zone: "Centro y conectoras", max_speed_kmh: 50, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000042", name: "Calle 55 con Carrera 67B", type: "velocidad", lat: 6.257775, lng: -75.580938, zone: "Centro y conectoras", max_speed_kmh: 50, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000043", name: "Calle 10 con Carrera 43D", type: "velocidad", lat: 6.20062, lng: -75.563683, zone: "Centro y conectoras", max_speed_kmh: 50, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000044", name: "Calle 10 con Carrera 48", type: "velocidad", lat: 6.211962, lng: -75.578077, zone: "Centro y conectoras", max_speed_kmh: 50, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000045", name: "Carrera 70 con Calle 25", type: "velocidad", lat: 6.232, lng: -75.6015, zone: "Centro y conectoras", max_speed_kmh: 50, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000046", name: "Calle 37 con Carrera 51", type: "velocidad", lat: 6.235159, lng: -75.568904, zone: "Centro y conectoras", max_speed_kmh: 50, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000047", name: "Calle 38 con Carrera 52", type: "velocidad", lat: 6.235159, lng: -75.568904, zone: "Centro y conectoras", max_speed_kmh: 50, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000048", name: "Carrera 46 con Calle 41", type: "velocidad", lat: 6.247, lng: -75.5665, zone: "Centro y conectoras", max_speed_kmh: 50, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000049", name: "Carrera 46 con Calle 57", type: "velocidad", lat: 6.257743, lng: -75.563728, zone: "Centro y conectoras", max_speed_kmh: 50, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000050", name: "Calle 67 con Carrera 45 (Av. Barranquilla)", type: "velocidad", lat: 6.26798, lng: -75.568759, zone: "Centro y conectoras", max_speed_kmh: 50, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000051", name: "Avenida Las Palmas (sector Chuscalito)", type: "velocidad", lat: 6.215632, lng: -75.55254, zone: "Las Palmas", max_speed_kmh: 60, approximate: true, source: "Alcaldía de Medellín / ANSV" },
  { id: "88888888-8888-4888-8888-000000000052", name: "Avenida Las Palmas (sector Dulce Jesús Mío)", type: "velocidad", lat: 6.223052, lng: -75.565318, zone: "Las Palmas", max_speed_kmh: 60, approximate: true, source: "Alcaldía de Medellín / ANSV" },
];
