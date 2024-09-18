import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

const NuevoTrabajador = ({ navigation }) => {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('trabajador');
    const [token, setToken] = useState(null);

    useEffect(() => {
        const getToken = async () => {
            const token = await AsyncStorage.getItem('token');
            setToken(token);
        };
        
        getToken();
    }, []);

    const handleAddTrabajador = async () => {
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
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Agregar Nuevo Trabajador</Text>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Nombre:</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="Ingrese el nombre"
                    value={nombre} 
                    onChangeText={setNombre} 
                />
            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Email:</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="Ingrese el email"
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
            <TouchableOpacity style={styles.addButton} onPress={handleAddTrabajador}>
                <Text style={styles.addButtonText}>Agregar Trabajador</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#1c1c1e',
        justifyContent: 'center',
    },
    header: {
        fontSize: 24,
        color: '#fff',
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
        color: '#fff',
    },
    input: {
        height: 40,
        borderColor: '#fff',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 10,
        borderRadius: 5,
        backgroundColor: '#fff',
        color: '#000',
    },
    picker: {
        height: 50,
        width: '100%',
        marginBottom: 12,
        backgroundColor: '#fff',
        color: '#000',
    },
    addButton: {
        backgroundColor: '#28A745',
        padding: 15,
        width: 200,
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
