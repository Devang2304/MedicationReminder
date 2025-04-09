import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Vibration } from 'react-native';
import Sound from 'react-native-sound';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';


type RootStackParamList = {
    Home: undefined;
    IncomingCall: undefined;
};

type IncomingCallScreenNavigationProp = StackNavigationProp<RootStackParamList, 'IncomingCall'>;

type Props = {
    navigation: IncomingCallScreenNavigationProp;
};

const IncomingCallScreen: React.FC<Props> = ({ navigation }) => {
    const [callTimer, setCallTimer] = useState<number>(0);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [soundPlaying,setSoundPlaying] = useState<boolean>(false);
    const [ringtone, setRingtone] = useState<Sound | null>(null);
    const [voiceMessage, setVoiceMessage] = useState<Sound | null>(null);

    useEffect(() => {
        Sound.setCategory('Playback');
        const ring = new Sound('ringtone.mp3', Sound.MAIN_BUNDLE, (error) => {
            if(error){
                console.log('Failed to load the ringtone', error);
                return;
            }
            ring.setNumberOfLoops(-1);
            setRingtone(ring);
            ring.play();
            setSoundPlaying(true);
        });

        const PATTERN = [1000, 2000, 1000];
        Vibration.vibrate(PATTERN, true);

        const message = new Sound('voice_message.mp3',Sound.MAIN_BUNDLE, (error) => {
            if(error){
                console.log('Failed to load the voice message', error);
                return;
            }
            setVoiceMessage(message);
        });

        const timer = setInterval(() => {
            setCallTimer(prev => {
                if(prev >= 40 ) {
                    if(ringtone){
                        ringtone.stop();
                        setSoundPlaying(false);
                    }
                    Vibration.cancel();
                    navigation.goBack();
                    return 40;
                }
                return prev + 1;
            });
        },1000);

        return () => {
            clearInterval(timer);
            if(ringtone) {ringtone.release();}
            if(voiceMessage) {voiceMessage.release();}
            Vibration.cancel();
        };
    },[ringtone, voiceMessage, navigation]);

    const handleAnswer  = async (): Promise<void> => {
        if(ringtone){
            ringtone.stop();
            setSoundPlaying(false);
        }
        Vibration.cancel();

        if(voiceMessage){
            voiceMessage.play((success) => {
                if(success){
                    console.log('Voice message played successfully');
                    recordMedicationTaken();

                    setTimeout(() => {
                        navigation.goBack();
                    }, 1000);
                } else {
                    console.log('Failed to play voice message');
                }
            });
        }
    };

    const handleDecline = (): void => {
        if(ringtone){
            ringtone.stop();
            setSoundPlaying(false);
        }
        Vibration.cancel();
        navigation.goBack();
    };


    const recordMedicationTaken = async () : Promise<void> => {
        try {
            const currentTime = Date.now();
            await AsyncStorage.setItem('lastTakenDate', currentTime.toString());
        } catch (error) {
            console.error('failed to save medication timestamp',error);
        }
    };

    return (
        <View style={styles.container}>
          <View style={styles.callerInfo}>
            <Image
              source={require('../../assets/medicine-icon.png')}
              style={styles.callerImage}
            />
            <Text style={styles.callerName}>Medication Reminder</Text>
            <Text style={styles.callStatus}>Incoming call...</Text>
            <Text style={styles.callTimer}>{callTimer}s</Text>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.declineButton} onPress={handleDecline}>
              <Text style={styles.buttonText}>Decline</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.answerButton} onPress={handleAnswer}>
              <Text style={styles.buttonText}>Answer</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    };

    const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: '#121212',
        justifyContent: 'space-between',
        padding: 20,
      },
      callerInfo: {
        alignItems: 'center',
        marginTop: 60,
      },
      callerImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 20,
        backgroundColor: '#333',
      },
      callerName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
      },
      callStatus: {
        fontSize: 16,
        color: '#bbb',
        marginBottom: 16,
      },
      callTimer: {
        fontSize: 14,
        color: '#999',
      },
      actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 40,
      },
      declineButton: {
        backgroundColor: '#FF3B30',
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
      },
      answerButton: {
        backgroundColor: '#34C759',
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
      },
      buttonText: {
        color: 'white',
        fontWeight: 'bold',
      },
    });

export default IncomingCallScreen;

