import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [hidePass, setHidePass] = useState(true);
    const [alertMessage, setAlertMessage] = useState(null);
    const [alertType, setAlertType] = useState(''); // 'success' o 'error'

    const predefinedUsers = {
        admin: {
            email: 'admin@example.com',
            password: 'admin123',
            role: 'admin'
        },
        worker: {
            email: 'worker@example.com',
            password: 'worker123',
            role: 'worker'
        }
    };

    const handleLogin = async () => {
        let user = null;
        if (email === predefinedUsers.admin.email && password === predefinedUsers.admin.password) {
            user = predefinedUsers.admin;
        } else if (email === predefinedUsers.worker.email && password === predefinedUsers.worker.password) {
            user = predefinedUsers.worker;
        }

        if (user) {
            await AsyncStorage.setItem('userRole', user.role);
            setAlertMessage('Inicio de sesión exitoso');
            setAlertType('success');

            setTimeout(() => {
                setAlertMessage(null);
                if (user.role === 'admin') {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'AdminDashboard' }],
                    });
                } else {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'WorkerDashboard' }],
                    });
                }
            }, 2000);
        } else {
            setAlertMessage('Correo o contraseña incorrectos');
            setAlertType('error');
            setTimeout(() => setAlertMessage(null), 3000);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.headerContainer}>
                <Text style={styles.title}>Joyería</Text>
                <Text style={styles.subtitle}>López</Text>
            </View>
            <View style={styles.loginBox}>
                {alertMessage && (
                    <View style={alertType === 'success' ? styles.successAlert : styles.errorAlert}>
                        <Text style={styles.alertText}>{alertMessage}</Text>
                    </View>
                )}
                <Text style={styles.text}>Correo electrónico</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Correo electrónico:"
                        onChangeText={(text) => setEmail(text)}
                        value={email}
                        placeholderTextColor="#ccc"
                    />
                </View>
                <Text style={styles.text}>Contraseña</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Contraseña:"
                        secureTextEntry={hidePass}
                        onChangeText={(text) => setPassword(text)}
                        value={password}
                        placeholderTextColor="#ccc"
                    />
                    <TouchableOpacity
                        style={styles.icon}
                        onPress={() => setHidePass(!hidePass)}
                    >
                        <Ionicons name={hidePass ? "eye-off" : "eye"} size={20} color="#ccc" />
                    </TouchableOpacity>
                </View>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                        <Text style={styles.loginButtonText}>Iniciar sesión</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000', // Fondo negro
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 48,
        fontStyle: 'italic',
        color: '#a87a53', // Cobre
    },
    subtitle: {
        fontSize: 36,
        fontStyle: 'italic',
        color: '#a87a53', // Cobre
    },
    loginBox: {
        width: '85%',
        backgroundColor: '#363f30', // Verde oscuro
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    text: {
        color: '#d1a980', // Dorado
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#d1a980', // Dorado
        borderWidth: 1,
        borderRadius: 8,
        marginTop: 10,
        width: '100%',
        padding: 5,
        backgroundColor: '#748873', // Verde oliva
    },
    input: {
        flex: 1,
        height: 40,
        paddingHorizontal: 10,
        color: '#d1a980', // Dorado
    },
    icon: {
        padding: 10,
    },
    buttonContainer: {
        width: '100%',
        marginTop: 20,
    },
    loginButton: {
        backgroundColor: '#a87a53', // Cobre
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    loginButtonText: {
        color: '#FFF', // Blanco
        fontWeight: 'bold',
    },
    successAlert: {
        backgroundColor: '#4caf50',
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
        width: '100%',
        alignItems: 'center',
    },
    errorAlert: {
        backgroundColor: '#f44336',
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
        width: '100%',
        alignItems: 'center',
    },
    alertText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
});

export default LoginScreen;
