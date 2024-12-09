import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import DashboardReport from './userpage/report';
import Attendance from './userpage/attendance';

export type RootStackParamList = {
  DashboardReport: undefined;
  Attendance: { userid: string }; // Correctly define 'userid'
};


const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="DashboardReport">
        <Stack.Screen
          name="DashboardReport"
          component={DashboardReport}
          options={{ title: 'Dashboard' }}
        />
        <Stack.Screen
          name="Attendance"
          component={Attendance}
          options={{ title: 'Attendance' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
