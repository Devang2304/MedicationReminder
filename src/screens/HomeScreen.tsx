import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';


type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  IncomingCall: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
    navigation : HomeScreenNavigationProp;
}

const HomeScreen : React.FC<Props> = ({ navigation }) => {
    const [isEnabled, setIsEnabled] = useState<boolean>(false);
    const [lastTaken,setLastTaken] = useState<string>('Not Taken yet');

    useFocusEffect(
        React.useCallback(()=>{
            loadSettings();
        },[])
    );

    const loadSettings = async (): Promise<void> => {
        try {
            const enabled = await AsyncStorage.getItem('reminderEnabled');
            if(enabled !== null){
                setIsEnabled(enabled === 'true');
            }

            const lastTakenDate = await AsyncStorage.getItem('lastTakenDate');
            if(lastTakenDate){
                setLastTaken(new Date(parseInt(lastTakenDate, 10)).toLocaleString());
            }
        } catch (error) {
            console.error('Failed to load settings', error);
        }
    };

    const toggleSwitch = async ():Promise<void> => {
        const newValue = !isEnabled;
        setIsEnabled(newValue);
        try {
            await AsyncStorage.setItem('reminderEnabled', newValue.toString());
        } catch (error) {
            console.error('Failed to save settings', error);
        }
    };

    const testCall = ():void => {
        navigation.navigate('IncomingCall');
    };

    return (
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>Daily Medication Reminder</Text>
            <Text style={styles.description}>
              This app will call your father at 8:00 PM every day to remind him to take his diabetes medication.
            </Text>

            <View style={styles.settingRow}>
              <Text style={styles.settingText}>Reminder Active</Text>
              <Switch
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={isEnabled ? '#0066cc' : '#f4f3f4'}
                onValueChange={toggleSwitch}
                value={isEnabled}
              />
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Last Medication Taken:</Text>
              <Text style={styles.infoValue}>{lastTaken}</Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={testCall}>
              <Text style={styles.buttonText}>Test Call Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    };

    const styles = StyleSheet.create({
      container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
      },
      card: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
      title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
      },
      description: {
        fontSize: 16,
        color: '#666',
        marginBottom: 24,
        lineHeight: 22,
      },
      settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
      },
      settingText: {
        fontSize: 16,
        color: '#333',
      },
      infoBox: {
        backgroundColor: '#f9f9f9',
        padding: 16,
        borderRadius: 8,
        marginBottom: 24,
      },
      infoTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666',
        marginBottom: 4,
      },
      infoValue: {
        fontSize: 16,
        color: '#333',
      },
      button: {
        backgroundColor: '#0066cc',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
      },
      buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
      },
});

export default HomeScreen;
