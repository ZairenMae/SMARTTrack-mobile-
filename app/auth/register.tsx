import React, { useState } from 'react';
import { View, Text, TextInput, ImageBackground, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FIREBASE_AUTH, FIREBASE_DB } from '@/FirebaseConfig';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';


const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedUserType, setSelectedUserType] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateIdNumber = (idNumber: string) => {
    const idNumberRegex = /^\d{2}-\d{4}-\d{3}$/;
    return idNumberRegex.test(idNumber);
  };

  const validatePassword = (password: string) => {
    // Password must be at least 8 characters long, contain at least one uppercase letter
    const passwordRegex = /^(?=.*[A-Z]).{8,}$/;
    return passwordRegex.test(password);
  };

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword || !selectedUserType || !firstName || !lastName || !idNumber) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email.');
      return;
    }

    if (!validateIdNumber(idNumber)) {
      setErrorMessage('Please enter a valid ID number (e.g., 12-3456-789).');
      return;
    }

    if (!validatePassword(password)) {
      setErrorMessage('Password must be at least 8 characters long and contain at least one uppercase letter.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
      console.log('User registered:', userCredential.user);

      // Store user data in Firestore (ensure not to store passwords in plain text)
      await setDoc(doc(FIREBASE_DB, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email,
        userType: selectedUserType,
        firstName,
        middleName,
        lastName,
        idNumber,
        createdAt: new Date(),
      });

      console.log('User added to Firestore');
      alert('Registration successful!');
    } catch (error) {
      console.error('Error registering user:', error);
      setErrorMessage((error as any).message || 'An error occurred during registration.');
    }
  };

  const deleteUserFromFirestore = async (uid: string) => {
    try {
      await deleteDoc(doc(FIREBASE_DB, 'users', uid));
      console.log('User deleted from Firestore');
    } catch (error) {
      console.error('Error deleting user from Firestore:', error);
    }
  };
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground
        source={require('../../assets/images/logo.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.formContainer}>
          <Text style={styles.title}>REGISTRATION</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <View style={styles.nameContainer}>
            <TextInput
              style={[styles.input, styles.nameInput]}
              placeholder="Firstname"
              placeholderTextColor="#999"
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              style={[styles.input, styles.nameInput]}
              placeholder="ML"
              placeholderTextColor="#999"
              value={middleName}
              onChangeText={setMiddleName}
            />
            <TextInput
              style={[styles.input, styles.nameInput]}
              placeholder="Lastname"
              placeholderTextColor="#999"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          <TextInput
            style={styles.input}
            placeholder="ID Number"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={idNumber}
            onChangeText={setIdNumber}
          />

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
