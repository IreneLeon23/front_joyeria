import React from 'react';
import { View, Button, StyleSheet } from 'react-native';

const Navbar = ({ navigation }) => {
    return (
        <View style={styles.navbar}>
            <Button
                title="Inicio"
                onPress={() => navigation.navigate('WorkerDashboard')}
                color="#a87a53"  // Copper color for buttons
            />
            <Button
                title="Agregar Cliente"
                onPress={() => navigation.navigate('NuevoCliente')}
                color="#a87a53"  // Copper color for buttons
            />
        </View>
    );
};

const styles = StyleSheet.create({
    navbar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#1e1e1e', // Black background to match the theme
        borderColor: '#748873',     // Olive green border
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        marginVertical: 8,
        marginHorizontal: 10,
    },
});

export default Navbar;
