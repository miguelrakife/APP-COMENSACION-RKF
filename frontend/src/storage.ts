// ==============================================
// ALMACENAMIENTO LOCAL (OFFLINE, ARRASTRE PERMANENTE)
// ==============================================
import AsyncStorage from "@react-native-async-storage/async-storage";
import { IGuardia, ICompensacion } from "./types";

export interface IDatosApp {
  guardias: IGuardia[];
  compensaciones: ICompensacion[];
}

// Datos iniciales vacíos
const DATOS_INICIALES: IDatosApp = {
  guardias: [],
  compensaciones: []
};

// Obtener todos los datos
export const obtenerDatos = async (): Promise<IDatosApp> => {
  try {
    const datosGuardados = await AsyncStorage.getItem("@app_compensaciones_rkf");
    return datosGuardados ? JSON.parse(datosGuardados) : DATOS_INICIALES;
  } catch (error) {
    return DATOS_INICIALES;
  }
};

// Guardar todos los datos
export const guardarDatos = async (datos: IDatosApp): Promise<void> => {
  try {
    await AsyncStorage.setItem("@app_compensaciones_rkf", JSON.stringify(datos));
  } catch (error) {
    throw new Error("No se pudo guardar la información");
  }
};

// Borrar todo (solo si lo necesitas)
export const borrarDatos = async (): Promise<void> => {
  await AsyncStorage.removeItem("@app_compensaciones_rkf");
};
