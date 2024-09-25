import React from 'react';
import { View, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const MultaForm = ({ clienteId, onMultaAdded }) => {
    const handleAddMulta = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const lastActionDate = await AsyncStorage.getItem(`lastActionDate_${clienteId}_multa`);

            if (lastActionDate === today) {
                Alert.alert('Acción no permitida', 'Solo puedes agregar una multa por día.');
                return;
            }

            const token = await AsyncStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }

            if (!clienteId) {
                console.error('clienteId is not defined');
                return;
            }

            // const fechaActual = new Date().toISOString().split('T')[0]; // Fecha actual en formato YYYY-MM-DD
            const fechaActual = dayjs().tz('America/Mexico_City').format('YYYY-MM-DD');
            const formattedDate = fechaActual.split('T')[0];

            const response = await axios.post(`https://prestamos-back-production.up.railway.app/clientes/${clienteId}/multas`, { fecha: formattedDate }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.status === 201) {
                console.log('Multa added successfully:', response.data);
                onMultaAdded();
            } else {
                console.error('Error al agregar multa:', response.data);
            }
        } catch (error) {
            console.error('Error en la solicitud de agregar multa:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Button title="Agregar Multa" onPress={handleAddMulta} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    }
});

export default MultaForm;
