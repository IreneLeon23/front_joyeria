import React from 'react';
import { Modal, View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';

const EliminarClientes = ({ cliente, visible, onEliminar, onClose, loading, deleteMessage }) => {

    const handleClose = () => {
        onClose();
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={handleClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#b22222" />
                    ) : deleteMessage ? (
                        <>
                            <Text style={styles.modalText}>{deleteMessage}</Text>
                            <Button
                                title="OK"
                                onPress={handleClose}
                                color="#4CAF50"
                            />
                        </>
                    ) : (
                        <>
                            <Text style={styles.modalText}>
                                ¿Estás seguro de que deseas eliminar a {cliente.nombre}?
                            </Text>
                            <View style={styles.buttonContainer}>
                                <Button
                                    title="Cancelar"
                                    onPress={handleClose}
                                    color="#888"
                                />
                                <Button
                                    title="Eliminar"
                                    onPress={() => onEliminar(cliente.id)}
                                    color="#b22222"
                                />
                            </View>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // marginTop: 22,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
    },
});

export default EliminarClientes;
