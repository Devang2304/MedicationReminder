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
    const [soundPlaying,setSoundPlaying] = useState<boolean>(false);
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
                    handleDecline();
                    return 40;
                }
                return prev + 1;
            });
        },1000);

        return () => {
            clearInterval(timer);
            if(ringtone) ringtone.release();
            if(voiceMessage) voiceMessage.release();
            Vibration.cancel();
        };
    },[]);

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
};

