    import React, { useState } from 'react';
    import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
    import axios from 'axios';
    import AsyncStorage from '@react-native-async-storage/async-storage';

    const AbonoForm = ({ clienteId, onAddAbono }) => {
        const [monto, setMonto] = useState('');
        const [loading, setLoading] = useState(false);

        const handleAddAbono = async () => {
            if (loading) return;  // Evita solicitudes múltiples

            try {
                setLoading(true);
                const token = await AsyncStorage.getItem('token');
                if (!token) {
                    console.error('No token found');
                    setLoading(false);
                    return;
                }

                const fecha = new Date().toISOString().split('T')[0]; // Fecha actual en formato YYYY-MM-DD

                const response = await axios.post(`http://192.168.1.17:3000/clientes/${clienteId}/abonos`, { monto: parseFloat(monto), fecha }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.status === 201) {
                    console.log('Abono added successfully:', response.data);
                    onAddAbono();
                    setMonto('');
                } else {
                    console.error('Error al agregar abono:', response.data);
                }
            } catch (error) {
                console.error('Error en la solicitud de agregar abono:', error);
            } finally {
                setLoading(false);
            }
        };

        return (
            <View style={styles.container}>
                <Text style={styles.label}>Agregar monto:</Text>
                <TextInput
                    style={styles.input}
                    value={monto}
                    onChangeText={text => setMonto(text.replace(/[^0-9.]/g, ''))}  // Permitir solo números y punto decimal
                    keyboardType="numeric"
                />
                <Button title="Abonar" onPress={handleAddAbono} disabled={loading} />
            </View>
        );
    };

    const styles = StyleSheet.create({
        container: {
            marginBottom: 20,
        },
        label: {
            fontSize: 16,
            fontWeight: 'bold',
            marginBottom: 16,
        },
        input: {
            height: 40,
            borderColor: 'gray',
            borderWidth: 1,
            paddingHorizontal: 10,
            marginBottom: 10,
        },
    });

    export default AbonoForm;
