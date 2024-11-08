// ModalComponent.tsx
import React from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";

type ButtonProps = {
    text: string;
    action: () => void;
    color: string;
};

type ModalComponentProps = {
    visible: boolean;
    title: string;
    message: string;
    buttons: ButtonProps[];
    onClose: () => void;
    onPress: () => void;
};

const ModalComponent = ({
    visible,
    title,
    message,
    buttons,
    onClose,
    onPress,
}: ModalComponentProps) => {
    return (
        <Modal
            transparent
            animationType="none"
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>{title}</Text>
                    <Text style={styles.modalMessage}>{message}</Text>
                    <View style={styles.buttonContainer}>
                        {buttons.map((button, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.button,
                                    { backgroundColor: button.color },
                                ]}
                                onPress={button.action}
                            >
                                <Text style={styles.buttonText}>
                                    {button.text}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        width: "80%",
        padding: 20,
        backgroundColor: "#fff",
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    modalMessage: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    button: {
        flex: 1,
        marginHorizontal: 5,
        paddingVertical: 10,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
    },
});

export default ModalComponent;
