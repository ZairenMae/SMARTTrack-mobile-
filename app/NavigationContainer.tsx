import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "./auth/login"; // Adjust path
import FacultyHome from "./facultypage/home"; // Adjust path
import UserHome from "./userpage/home"; // Adjust path

const Stack = createStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
                <Stack.Screen
                    name="Login"
                    component={Login}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="FacultyHome"
                    component={FacultyHome}
                    options={{ title: "Faculty Dashboard" }}
                />
                <Stack.Screen
                    name="UserHome"
                    component={UserHome}
                    options={{ title: "Student Dashboard" }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
