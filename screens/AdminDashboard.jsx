import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ClienteCard from '../components/ClienteCard';
import { Ionicons } from '@expo/vector-icons';

const WorkerDashboard = ({ navigation }) => {
    const [clientes, setClientes] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [filteredClientes, setFilteredClientes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchClientes = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                throw new Error('Token no encontrado');
            }
            const response = await axios.get('https://prestamos-back-production.up.railway.app/clientes', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setClientes(response.data);
            setFilteredClientes(response.data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error al obtener clientes:', error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchClientes();
        const interval = setInterval(fetchClientes, 5000); // Polling cada 5 segundos
        return () => clearInterval(interval); // Limpiar el intervalo cuando el componente se desmonte
    }, []);

    const handleSearch = (text) => {
        setSearchText(text);
        if (text === '') {
            setFilteredClientes(clientes);
        } else {
            const filtered = clientes.filter(cliente =>
                cliente.nombre.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredClientes(filtered);
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem('token');
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.title}>Mis Clientes</Text>
                <Ionicons name={'exit'} size={40} color={"#a87a53"} onPress={handleLogout} /> {/* Copper color for icon */}
            </View>
            <TextInput
                style={styles.searchInput}
                placeholder="Buscar por nombre"
                placeholderTextColor="#748873"  // Olive green for placeholder text
                value={searchText}
                onChangeText={handleSearch}
            />
            {isLoading ? (
                <ActivityIndicator size="large" color="#d1a980" /> // Golden color for loader
            ) : (
                <FlatList
                    data={filteredClientes}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item }) => (
                        <ClienteCard cliente={item} navigation={navigation} />
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#000', // Black background
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#d1a980', // Golden color for the main title
        marginBottom: 20,
    },
    searchInput: {
        height: 40,
        borderColor: '#748873', // Verde oliva
        borderWidth: 1,
        paddingHorizontal: 8,
        borderRadius: 4,
        color: '#d1a980', // Texto dorado
        marginBottom: 10,
        backgroundColor: '#1c1c1e', // Fondo más oscuro
    },
    logoutButton: {
        marginRight: 15,
        paddingVertical: 5,
        paddingHorizontal: 10,
        backgroundColor: '#2e5c74', // Custom color for the logout button (optional to change)
        borderRadius: 5,
    },
    logoutButtonText: {
        color: '#fff', // White text color for logout button
        fontWeight: 'bold',
    },
});

export default WorkerDashboard;
