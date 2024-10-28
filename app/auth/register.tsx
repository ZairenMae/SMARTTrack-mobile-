import React, { useState } from 'react';
import { View, Text, TextInput, ImageBackground, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FIREBASE_AUTH } from '@/FirebaseConfig';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedUserType, setSelectedUserType] = useState(''); // state for selected user type

  // Function to toggle the password visibility state
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      alert('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
      console.log('User registered:', userCredential.user);
      // Navigate to another screen or show a success message
    } catch (error) {
      console.error('Error registering user:', error);
      alert('Error registering user: ' + (error as Error).message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground
        source={require('E:/4th yr/IT332/SmartTrack/NSTP/assets/images/Register_bg.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.formContainer}>
          <Text style={styles.title}>REGISTRATION</Text>

          {/* Email Input */}
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          {/* Name Inputs */}
          <View style={styles.nameContainer}>
            <TextInput
              style={[styles.input, styles.nameInput]}
              placeholder="Firstname"
              placeholderTextColor="#999"
            />
            <TextInput
              style={[styles.input, styles.nameInput]}
              placeholder="ML"
              placeholderTextColor="#999"
            />
            <TextInput
              style={[styles.input, styles.nameInput]}
              placeholder="Lastname"
              placeholderTextColor="#999"
            />
          </View>

          {/* ID Number Input */}
          <TextInput
            style={styles.input}
            placeholder="ID Number"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />

          {/* Password Input */}
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <MaterialCommunityIcons
              name={showPassword ? 'eye-off' : 'eye'}
              size={24}
              color="#aaa"
              style={styles.icon}
              onPress={toggleShowPassword}
            />
          </View>
          
          {/* Confirm Password Input */}
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <MaterialCommunityIcons
              name={showPassword ? 'eye-off' : 'eye'}
              size={24}
              color="#aaa"
              style={styles.icon}
              onPress={toggleShowPassword}
            />
          </View>

          {/* User Type Picker */}
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedUserType}
              onValueChange={(itemValue) => setSelectedUserType(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select User Type" value="" />
              <Picker.Item label="Teacher/Faculty" value="teacher" />
              <Picker.Item label="Student" value="student" />
            </Picker>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>SIGN UP</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 20,
    width: '85%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    width: '100%',
    borderColor: '#ddd',
    borderWidth: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  nameInput: {
    flex: 1,
    marginHorizontal: 5,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  icon: {
    position: 'absolute',
    right: 10,
  },
  pickerContainer: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 8,
    width: '100%',
    backgroundColor: '#fff',
  },
  picker: {
    width: '100%',
  },
  button: {
    backgroundColor: '#f1c40f',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Register;
