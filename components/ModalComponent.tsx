import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

// Extend React.PropsWithChildren to automatically include 'children'
interface ModalComponentProps extends React.PropsWithChildren<{}> {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttons: { text: string; action: () => void; color: string }[];
}

const ModalComponent: React.FC<ModalComponentProps> = ({
  visible,
  onClose,
  title,
  message,
  buttons,
  children,
}) => {
  if (!visible) return null;

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modal}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <View>{children}</View> {/* Render children here */}
        <View style={styles.buttonContainer}>
          {buttons.map((button, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.button, { backgroundColor: button.color }]}
              onPress={button.action}
            >
              <Text style={styles.buttonText}>{button.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

// Add some basic styles to fix the missing 'styles' error
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  modal: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    margin: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});

export default ModalComponent;
