import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './src/screens/HomeScreen';
import IncomingCallScreen from './src/screens/IncomingCallScreen';
import notifee, { TriggerType, AndroidImportance, TimestampTrigger } from '@notifee/react-native';
import 'react-native-gesture-handler';


type RootStackParamList = {
  Home: undefined;
  IncomingCall: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  useEffect(() => {
    createNotificationChannel();
    scheduleDailyReminder();
  },[]);

  const createNotificationChannel = async ():Promise<void> => {
    await notifee.createChannel({
      id:'medication-reminder',
      name:'Medication Reminder',
      lights: false,
      vibration: true,
      importance: AndroidImportance.HIGH,
    });
  };

  const scheduleDailyReminder = async (): Promise<void> => {

    await notifee.cancelAllNotifications();


  const getNextReminderTime = (): number => {
    const now = new Date();
    const reminderTime = new Date();


    reminderTime.setHours(20, 0, 0, 0);


    if (now.getTime() > reminderTime.getTime()) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    return reminderTime.getTime();
  };

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: getNextReminderTime(),
    alarmManager: {
      allowWhileIdle: true,
    },
  };

  await notifee.createTriggerNotification(
    {
      title: 'Medication Reminder',
      body: 'Tap to answer the call',
      android: {
        channelId: 'medication-reminder',
        pressAction: {
          id: 'default',
          launchActivity: 'default',
        },
        fullScreenAction: {
          id: 'incoming-call',
          launchActivity: 'default',
        },
      },
      data: {
        screen: 'IncomingCall',
      },
    },
    trigger as TimestampTrigger,
  );
};
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Medication Reminder' }} />
          <Stack.Screen
            name="IncomingCall"
            component={IncomingCallScreen}
            options={{
              headerShown: false,
              presentation: 'modal',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
