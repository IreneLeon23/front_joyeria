import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropDownPicker from 'react-native-dropdown-picker';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const NuevoCliente = ({ navigation }) => {
    const [nombre, setNombre] = useState('');
    const [ocupacion, setOcupacion] = useState('');
    const [direccion, setDireccion] = useState('');
    const [telefono, setTelefono] = useState('');
    const [fechaTermino, setFechaTermino] = useState('');
    const [montoInicial, setMontoInicial] = useState('');
    const [token, setToken] = useState(null);
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const getToken = async () => {
            const token = await AsyncStorage.getItem('token');
            setToken(token);
        };

        getToken();

        // Set the array to start from the next day
        const fechaInicio = dayjs().startOf('day').add(1, 'day');
        fechaInicio.format();

        setItems([
            { label: 'Seleccionar fecha', value: '' },
            { label: '15 días', value: '15 días' },
            { label: '20 días', value: '20 días' },
        ]);
    }, []);

    const handleAddCliente = async () => {
        setIsLoading(true);

        if (!token) {
            console.error('No token found');
            Alert.alert('Error', 'No se encontró un token de autenticación');
            return;
        }

        // Nueva fecha de inicio
        const fechaInicio = dayjs().startOf('day');

        // const fechaInicio = new Date();
        // fechaInicio.setHours(0, 0, 0, 0); // Establece a medianoche

        let newFechaTermino;
        if (fechaTermino === '15 días') {
            // newFechaTermino = new Date(fechaInicio);
            // newFechaTermino.setDate(newFechaTermino.getDate() + 15); // Agrega 15 días
            newFechaTermino = fechaInicio.add(15, 'day');
        } else if (fechaTermino === '20 días') {
            // newFechaTermino = new Date(fechaInicio);
            // newFechaTermino.setDate(newFechaTermino.getDate() + 20); // Agrega 20 días
            newFechaTermino = fechaInicio.add(20, 'day');
        }

        const formattedFechaInicio = fechaInicio.format('YYYY-MM-DD');
        const formattedFechaTermino = newFechaTermino.format('YYYY-MM-DD');

        // // Verifica que el día de la nueva fecha no tenga horas adicionales
        // newFechaTermino.setHours(0, 0, 0, 0);

        // const formattedFechaInicio = fechaInicio.toISOString().split('T')[0];
        // const formattedFechaTermino = newFechaTermino.toISOString().split('T')[0];
        try {
            await axios.post('https://prestamos-back-production.up.railway.app/clientes', {
                nombre,
                ocupacion,
                direccion,
                telefono,
                fecha_inicio: formattedFechaInicio,
                fecha_termino: formattedFechaTermino,
                monto_inicial: parseFloat(montoInicial),
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Limpiar los campos después de agregar el cliente
            setNombre('');
            setOcupacion('');
            setDireccion('');
            setTelefono('');
            setFechaTermino('');
            setMontoInicial('');

            // Mostrar alerta de éxito
            Alert.alert('Éxito', 'Cliente agregado exitosamente');
        } catch (error) {
            console.error('Error al agregar cliente:', error);
            Alert.alert('Error', 'Hubo un error al agregar el cliente');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Agregar nuevo cliente</Text>
            <Text style={styles.label}>Nombre:</Text>
            <TextInput
                style={styles.input}
                value={nombre}
                onChangeText={setNombre}
                placeholder="Ingrese el nombre"
                placeholderTextColor="#888"
            />
            <Text style={styles.label}>Ocupación:</Text>
            <TextInput
                style={styles.input}
                value={ocupacion}
                onChangeText={setOcupacion}
                placeholder="Ingrese la ocupación"
                placeholderTextColor="#888"
            />
            <Text style={styles.label}>Dirección:</Text>
            <TextInput
                style={styles.input}
                value={direccion}
                onChangeText={setDireccion}
                placeholder="Ingrese la dirección"
                placeholderTextColor="#888"
            />
            <Text style={styles.label}>Teléfono:</Text>
            <TextInput
                style={styles.input}
                value={telefono}
                onChangeText={setTelefono}
                placeholder="Ingrese el teléfono"
                placeholderTextColor="#888"
                keyboardType="phone-pad"
            />
            <Text style={styles.label}>Fecha de Término:</Text>
            <DropDownPicker
                open={open}
                value={fechaTermino}
                items={items}
                setOpen={setOpen}
                setValue={setFechaTermino}
                setItems={setItems}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                placeholder="Seleccionar fecha"
                zIndex={1000}
                zIndexInverse={3000}
            />
            <Text style={styles.label}>Monto Inicial:</Text>
            <TextInput
                style={styles.input}
                value={montoInicial}
                onChangeText={setMontoInicial}
                placeholder="Ingrese el monto inicial"
                placeholderTextColor="#888"
                keyboardType="numeric"
            />
            <View style={styles.buttonContainer}>
                {isLoading ? (
                    <ActivityIndicator size="large" color="#28A745" />
                ) : (
                    <Button
                        title="Agregar Cliente"
                        onPress={handleAddCliente}
                        color="#28A745"
                        disabled={isLoading}
                    />
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#1c1c1e',
    },
    title: {
        fontSize: 24,
        color: '#fff',
        marginBottom: 20,
        textAlign: 'center',
        fontWeight: "bold"
    },
    label: {
        fontSize: 16,
        marginBottom: 4,
        color: '#fff',
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 8,
        borderRadius: 4,
        backgroundColor: '#fff',
        color: '#000',
    },
    buttonContainer: {
        width: 200,
        marginTop: 12,
        margin: 'auto',

    },
    dropdown: {
        backgroundColor: '#fff',
        borderColor: '#ccc',
        marginBottom: 12,
    },
    dropdownContainer: {
        backgroundColor: '#fff',
        borderColor: '#ccc',
    }
});

export default NuevoCliente;
