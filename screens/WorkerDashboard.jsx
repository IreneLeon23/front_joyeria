import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, FlatList, StyleSheet, TextInput, Text, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import ClienteCard from '../components/ClienteCard';

const WorkerDashboard = ({ navigation }) => {
    const [clientes, setClientes] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [filteredClientes, setFilteredClientes] = useState([]);
    const isFocused = useIsFocused();

    useEffect(() => {
        const fetchClientes = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (!token) {
                    console.error('No token found');
                    return;
                }

                const response = await axios.get('https://prestamos-back-production.up.railway.app/clientes', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const uniqueClientes = response.data.filter((cliente, index, self) =>
                    index === self.findIndex((c) => (
                        c.id === cliente.id
                    ))
                );

                console.log('Clientes recibidos:', uniqueClientes);
                setClientes(uniqueClientes);
                setFilteredClientes(uniqueClientes);
            } catch (error) {
                console.error(error);
            }
        };

        if (isFocused) {
            fetchClientes();
        }
    }, [isFocused]);

    useEffect(() => {
        const filtered = clientes.filter(cliente =>
            (cliente.estado !== 'completado' || cliente.monto_actual === 0) &&
            cliente.nombre.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredClientes(filtered);
    }, [searchText, clientes]);

    const handleLogout = async () => {
        await AsyncStorage.removeItem('token');
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Lista de clientes</Text>
            <TextInput
                style={styles.searchInput}
                placeholder="Buscar cliente por nombre"
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor="#aaa"
            />
            <FlatList
                data={filteredClientes}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <ClienteCard
                        cliente={{
                            ...item,
                            total_multas: item.total_multas !== undefined ? item.total_multas : 0
                        }}
                        onPress={() => navigation.navigate('ClienteDetails', { id: item.id })}
                    />
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1c1c1e',
        padding: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    searchInput: {
        height: 40,
        borderColor: '#555',
        borderWidth: 1,
        paddingHorizontal: 8,
        borderRadius: 4,
        color: '#fff',
        marginBottom: 10,
        backgroundColor: '#fff',
    },
    logoutButton: {
        marginRight: 15,
        paddingVertical: 5,
        paddingHorizontal: 10,
        backgroundColor: '#2e5c74', // Color de fondo
        borderRadius: 5,
    },
    logoutButtonText: {
        color: '#fff', // Color del texto
        fontWeight: 'bold',
    },
});

export default WorkerDashboard;
