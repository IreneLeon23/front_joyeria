import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Table, Row, Rows } from 'react-native-table-component';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';
import DropDownPicker from 'react-native-dropdown-picker';
import { Divider } from 'react-native-elements';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(localizedFormat);

const screenWidth = Dimensions.get('window').width;

const EstadisticasTablas = () => {
    const [estadisticas, setEstadisticas] = useState(null);
    const [trabajadorEstadisticas, setTrabajadorEstadisticas] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [workerSearchQuery, setWorkerSearchQuery] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(rowsPerPage);
    const [items, setItems] = useState([
        { label: '5', value: 5 },
        { label: '10', value: 10 },
        { label: '15', value: 15 },
        { label: '20', value: 20 }
    ]);

    useEffect(() => {
        const fetchEstadisticas = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }

                const response = await axios.get('https://prestamos-back-production.up.railway.app/estadisticas/general', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const trabajadorResponse = await axios.get('https://prestamos-back-production.up.railway.app/estadisticas/trabajadores', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setEstadisticas(response.data);
                setTrabajadorEstadisticas(trabajadorResponse.data);
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };

        fetchEstadisticas();
    }, []);



    useEffect(() => {
        setValue(rowsPerPage);
    }, [rowsPerPage]);




    const s2ab = (s) => {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i !== s.length; ++i) {
            view[i] = s.charCodeAt(i) & 0xFF;
        }
        return buf;
    };

    const bufferToBase64 = (buffer) => {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    };

    const exportToCSV = async (data, filename) => {
        const formattedData = data.map((item, index) => ({
            'No': index + 1,
            'Nombre cliente': item.nombre,
            'Direccion': item.direccion,
            'Telefono': item.telefono,
            'Monto': item.monto_inicial,
            'Esquema de Dias-%': `${(item.dias_prestamo === 15 || item.dias_prestamo === 16) ?
                `15 días $85x1000 30%` :
                (item.dias_prestamo === 20 || item.dias_prestamo === 21) ?
                    `20 días $65x1000 30%` :
                    item.esquema_dias}`,
            'Fecha de inicio del prestamo': dayjs(item.fecha_inicio).tz('America/Mexico_City').locale('es').format('DD MMMM YYYY'),
            'Fecha de termino': dayjs(item.fecha_termino).tz('America/Mexico_City').locale('es').format('DD MMMM YYYY'),
            'Observaciones': item.ocupacion
        }));

        const ws = XLSX.utils.json_to_sheet(formattedData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Estadísticas");
        const wbout = XLSX.write(wb, { type: 'binary', bookType: "xlsx" });

        const uri = FileSystem.cacheDirectory + `${filename}.xlsx`;
        await FileSystem.writeAsStringAsync(uri, bufferToBase64(s2ab(wbout)), { encoding: FileSystem.EncodingType.Base64 });

        await Sharing.shareAsync(uri);
    };

    const exportTrabajadorToCSV = async (data, filename) => {
        try {
            console.log("Datos para exportar:", data); // Añade esta línea para depuración

            const formattedData = data.map((item, index) => ({
                'No': index + 1,
                'Nombre Trabajador': item.trabajador_nombre,
                'Fecha': dayjs().tz('America/Mexico_City').local('es').format('DD MMMM YYYY'),
                'Total Abonos Día': item.total_abonos_diario_hoy,
                'Total Abonos Semana': item.total_abonos_semanales,
                'Total Multas Día': item.total_multas_hoy,
                'Total Multas Semana': item.total_multas_semanales,
            }));

            console.log("Datos formateados para exportar:", formattedData); // Añade esta línea para depuración

            const ws = XLSX.utils.json_to_sheet(formattedData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Estadísticas Trabajador");

            const wbout = XLSX.write(wb, { type: 'binary', bookType: 'xlsx' });

            const uri = FileSystem.cacheDirectory + `${filename}.xlsx`;
            await FileSystem.writeAsStringAsync(uri, bufferToBase64(s2ab(wbout)), { encoding: FileSystem.EncodingType.Base64 });

            await Sharing.shareAsync(uri);
        } catch (error) {
            console.error("Error exporting CSV:", error);
        }
    };


    const handleSearch = (data, query, searchField) => {
        if (query.trim() === '') {
            return data;
        }
        return data.filter(item => (item[searchField] || '').toLowerCase().includes(query.toLowerCase()));
    };

    const filteredEstadisticas = estadisticas ? handleSearch(estadisticas, searchQuery, 'nombre').slice(0, rowsPerPage) : [];
    const filteredTrabajadorEstadisticas = trabajadorEstadisticas ? handleSearch(trabajadorEstadisticas, workerSearchQuery, 'trabajador_nombre').slice(0, rowsPerPage) : [];


    const tableHead = ['Nombre cliente', 'Direccion', 'Telefono', 'Monto', 'Esquema de Dias-%', 'Fecha de inicio del prestamo', 'Fecha de termino', 'Observaciones'];
    const tableData = filteredEstadisticas.map(item => [
        item.nombre,
        item.direccion,
        item.telefono,
        item.monto_inicial,
        // item.dias_prestamo === 15 ? `15 días - $85x1000 30%` : item.dias_prestamo === 20 ? `20 días - $65x1000` : item.esquema_dias,
        (item.dias_prestamo === 15 || item.dias_prestamo === 16) ?
            '15 días - $85x1000 30%' :
            (item.dias_prestamo === 20 || item.dias_prestamo === 21) ?
                '20 días - $65x1000' :
                item.esquema_dias,
        dayjs(item.fecha_inicio).tz('America/Mexico_City').local('es').format('DD MMMM YYYY'),
        dayjs(item.fecha_termino).tz('America/Mexico_City').local('es').format('DD MMMM YYYY'),
        // new Date(item.fecha_inicio).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }),
        // new Date(item.fecha_termino).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }),
        item.ocupacion
    ]);

    const trabajadorTableHead = ['Nombre Trabajador', 'Fecha', 'Abono x Día', 'Abono x Semana', 'Multas x Día', 'Multas x Semana'];
    const trabajadorTableData = filteredTrabajadorEstadisticas.map(item => [
        item.trabajador_nombre,
        dayjs().tz('America/Mexico_City').local('es').format('DD MMMM YYYY'),
        // new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }),
        item.total_abonos_diarios,
        item.total_abonos_semanales,
        item.total_multas_hoy,
        item.total_multas_semanales,
    ]);

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    if (error) {
        return <Text style={styles.errorText}>Error: {error.message}</Text>;
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Estadísticas Trabajadores</Text>

                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar por nombre"
                    value={workerSearchQuery}
                    onChangeText={setWorkerSearchQuery}
                />

                <DropDownPicker
                    open={open}
                    value={value}
                    items={items}
                    setOpen={setOpen}
                    setValue={setValue}
                    setItems={setItems}
                    placeholder="Seleccionar cantidad de filas por página"
                    onChangeValue={(val) => setRowsPerPage(val)}
                />

                <ScrollView style={{ marginTop: "8%", marginBottom: "8%" }}>
                    <ScrollView horizontal>
                        <Table borderStyle={styles.border} style={{ height: "100%" }}>
                            <Row data={trabajadorTableHead} style={styles.head} textStyle={styles.text} />
                            <Rows data={trabajadorTableData} textStyle={styles.text} />
                        </Table>
                    </ScrollView>
                </ScrollView>

                <Divider style={{ marginBottom: "2%" }}>
                    <Button
                        title="Exportar"
                        onPress={() => {
                            const fechaActual = dayjs()
                                .tz('America/Mexico_City')
                                .locale('es')
                                .format('DD MMMM YYYY');

                            exportTrabajadorToCSV(trabajadorEstadisticas, `estadisticas_trabajador_${fechaActual}`);
                        }}
                    />
                </Divider>


                <View style={styles.separator} />

                <Text style={styles.title}>Estadísticas Generales</Text>

                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar por nombre"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />

                <DropDownPicker
                    open={open}
                    value={value}
                    items={items}
                    setOpen={setOpen}
                    setValue={setValue}
                    setItems={setItems}
                    placeholder="Seleccionar cantidad de filas por página"
                    onChangeValue={(val) => setRowsPerPage(val)}
                    style={{ marginBottom: "7%" }}
                />

                <ScrollView >
                    <ScrollView horizontal>
                        <Table borderStyle={styles.border} style={{ height: "100%" }}>
                            <Row data={tableHead} style={styles.head} textStyle={styles.text} />
                            <Rows data={tableData} textStyle={styles.text} />
                        </Table>
                    </ScrollView>
                </ScrollView>

                <Divider style={{ marginTop: "8%" }}>
                    <Button
                        title="Exportar a CSV"
                        onPress={() => exportToCSV(estadisticas, 'estadisticas_general')}
                    />
                </Divider>

                <View style={styles.footerSpace} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 10,
        textAlign: 'center',
    },
    searchInput: {
        height: 50,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
        // width: screenWidth - 32,
        borderRadius: 4,
    },
    border: {
        borderWidth: 1,
        borderColor: '#c8e1ff',

    },
    head: {
        height: "auto",
        width: 'auto',
        backgroundColor: '#f1f8ff',
    },
    text: {
        margin: 10,
        textAlign: 'center',
        width: Dimensions.get('window').width / 8,
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
    },
    separator: {
        height: 0,
    },
    footerSpace: {
        height: 0,
    },

});

export default EstadisticasTablas;
