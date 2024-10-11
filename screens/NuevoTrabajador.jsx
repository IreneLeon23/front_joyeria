import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

const NuevoTrabajador = ({ navigation }) => {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('trabajador');
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const getToken = async () => {
            const token = await AsyncStorage.getItem('token');
            setToken(token);
        };
        getToken();
    }, []);

    const handleAddTrabajador = async () => {
        setIsLoading(true);
        if (!token) {
            console.error('No token found');
            return;
        }
        try {
            const response = await axios.post('https://prestamos-back-production.up.railway.app/trabajadores', {
                nombre,
                email,
                password,
                role,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('Trabajador agregado:', response.data);
            navigation.goBack(); // Volver a la pantalla anterior
        } catch (error) {
            console.error('Error al agregar trabajador:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Agregar Nuevo Trabajador</Text>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Nombre:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ingrese el nombre"
                    placeholderTextColor="#748873"  // Verde oliva para el placeholder
                    value={nombre}
                    onChangeText={setNombre}
                />
            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Email:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ingrese el email"
                    placeholderTextColor="#748873"  // Verde oliva para el placeholder
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                />
            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Contraseña:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ingrese la contraseña"
                    placeholderTextColor="#748873"  // Verde oliva para el placeholder
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Rol:</Text>
                <Picker
                    selectedValue={role}
                    onValueChange={(itemValue) => setRole(itemValue)}
                    style={styles.picker}
                >
                    <Picker.Item label="Trabajador" value="trabajador" />
                    <Picker.Item label="Admin" value="admin" />
                </Picker>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={handleAddTrabajador} disabled={isLoading}>
                {isLoading ? (
                    <ActivityIndicator size="large" color="#d1a980" />  // Dorado para el indicador de carga
                ) : (
                    <Text style={styles.addButtonText}>Agregar Trabajador</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#1c1c1e', // Fondo oscuro
    },
    header: {
        fontSize: 24,
        color: '#d1a980', // Dorado para el título
        marginBottom: 20,
        textAlign: 'center',
        fontWeight: "bold"
    },
    inputContainer: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        color: '#d1a980', // Dorado para las etiquetas
    },
    input: {
        height: 40,
        borderColor: '#748873', // Verde oliva para los bordes
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 10,
        borderRadius: 5,
        backgroundColor: '#1c1c1e',
        color: '#fff', // Texto blanco
    },
    picker: {
        height: 50,
        width: '100%',
        marginBottom: 12,
        backgroundColor: '#1c1c1e',
        color: '#fff', // Texto blanco
    },
    addButton: {
        backgroundColor: '#a87a53', // Cobre para el botón destacado
        padding: 15,
        margin: 'auto',
        borderRadius: 5,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default NuevoTrabajador;
