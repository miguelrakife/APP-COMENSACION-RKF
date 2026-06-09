// Agrega estos estados al inicio del componente
const [asignatura, setAsignatura] = useState<Asignatura>('');
const [modoEscribirAsignatura, setModoEscribirAsignatura] = useState(false);
const [asignaturasGuardadas, setAsignaturasGuardadas] = useState<Asignatura[]>([]);

// Cargar materias guardadas al abrir la pantalla
useEffect(() => {
  const cargarAsignaturas = async () => {
    const lista = await getAsignaturasGuardadas();
    setAsignaturasGuardadas(lista);
    if (lista.length > 0) setAsignatura(lista[0]);
  };
  cargarAsignaturas();
}, []);

// --- En el formulario, agrega esto ANTES del Tipo de día ---
<Text style={styles.label}>📚 Asignatura / Materia</Text>

{/* Si hay materias guardadas, mostramos selector */}
{asignaturasGuardadas.length > 0 && !modoEscribirAsignatura ? (
  <>
    <View style={styles.segmented}>
      {asignaturasGuardadas.map(nombre => (
        <TouchableOpacity
          key={nombre}
          style={[styles.segment, asignatura === nombre && styles.segmentActive]}
          onPress={() => setAsignatura(nombre)}
        >
          <Text style={[styles.segmentText, asignatura === nombre && styles.segmentTextActive]}>
            {nombre}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
    <TouchableOpacity 
      style={styles.bloqueOption} 
      onPress={() => {
        setModoEscribirAsignatura(true);
        setAsignatura('');
      }}
    >
      <Ionicons name="add-circle-outline" size={18} color={theme.colors.primary} style={{marginRight:8}} />
      <Text style={styles.bloqueText}>Agregar nueva materia</Text>
    </TouchableOpacity>
  </>
) : (
  <>
    <TextInput
      style={styles.input}
      placeholder="Escribe el nombre de la materia (ej: Seguridad Militar)"
      placeholderTextColor={theme.colors.textFaint}
      value={asignatura}
      onChangeText={setAsignatura}
      autoCapitalize="words"
    />
    {modoEscribirAsignatura && (
      <TouchableOpacity 
        style={[styles.bloqueOption, {marginTop:4}]} 
        onPress={() => setModoEscribirAsignatura(false)}
      >
        <Ionicons name="arrow-back-outline" size={18} color={theme.colors.textMuted} style={{marginRight:8}} />
        <Text style={styles.bloqueText}>Volver a la lista</Text>
      </TouchableOpacity>
    )}
  </>
)}

// --- Al guardar, validamos que no esté vacío ---
const handleGuardar = async () => {
  if (!asignatura.trim()) {
    Alert.alert('Falta la materia', 'Escribe o selecciona una asignatura');
    return;
  }
  if (!ordenNumero.trim()) {
    Alert.alert('Falta N° de orden', 'Ingresa el número de orden (ej: 074).');
    return;
  }

  const g: Guardia = {
    id: generarId(),
    fecha,
    tipo,
    modalidad,
    ordenTipo,
    ordenNumero: ordenNumero.trim(),
    ordenFecha,
    asignatura: asignatura.trim(), // ✅ Se guarda limpio
    createdAt: new Date().toISOString(),
  };

  await addGuardia(g);
  await cargar();
  const listaActualizada = await getAsignaturasGuardadas();
  setAsignaturasGuardadas(listaActualizada);
  resetForm();
  setModalOpen(false);
};
