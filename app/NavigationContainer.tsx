import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "./auth/login"; // Adjust path to Login
import UserHome from "./userpage/home"; // Adjust path to User Dashboard
import FacultyHome from "./facultypage/home"; // Adjust path to Faculty Dashboard

const Stack = createStackNavigator();

export default function AppNavigation() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
                <Stack.Screen
                    name="Login"
                    component={Login}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="UserHome"
                    component={UserHome}
                    options={{ title: "Student Dashboard" }}
                />
                <Stack.Screen
                    name="FacultyHome"
                    component={FacultyHome}
                    options={{ title: "Faculty Dashboard" }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
