import { LinearGradient } from "expo-linear-gradient";
import { View, TouchableOpacity } from 'react-native';
export function TrackProgressScreen() {
    return (
        <LinearGradient
            colors={["#F5F8FA", "#ECF2F6", "#E3ECF1"]}
            style={{ flex: 1 }} 
        ></LinearGradient>
    );
}