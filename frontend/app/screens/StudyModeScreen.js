import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, TextInput, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import SessionUploads from "../components/SessionUploads";
import api from "../services/api";

export function StudyModeScreen({ route, navigation }) {
    const [isSessionActive, setIsSessionActive] = useState(false);
    // const [seconds, setSeconds] = useState(0);
    const [sessionId, setSessionId] = useState(null);
    const [userId, setUserId] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [sessionStartTime, setSessionStartTime] = useState(null);

    useEffect(() => {
        const loadUserId = async () => {
            let id = route?.params?.user_id;
            if (!id) {
                const userDataString = await AsyncStorage.getItem("userData");
                if (userDataString) {
                    try {
                        const userData = JSON.parse(userDataString);
                        id = userData.user_id;
                    } catch (e) {
                        console.log("Error parsing user data in StudyMode:", e);
                    }
                }
            }
            if (id) {
                setUserId(id);
            }
        };
        loadUserId();
    }, [route?.params]);

    // useEffect(() => {
    //     let interval = null;
    //     if (isSessionActive) {
    //         interval = setInterval(() => {
    //             setSeconds(prev => prev + 1);
    //         }, 1000)
    //     }
    //     return () => clearInterval(interval);
    // }, [isSessionActive])
    useEffect(() => {
        let interval;

        if (isSessionActive && sessionStartTime) {
            interval = setInterval(() => {
                setElapsedTime(
                    Math.floor((Date.now() - sessionStartTime) / 1000)
                );
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isSessionActive, sessionStartTime]);
    const formatTime = () => {
        const hrs = Math.floor(elapsedTime / 3600);
        const mins = Math.floor((elapsedTime % 3600) / 60);
        const secs = elapsedTime % 60;

        return (
            String(hrs).padStart(2, "0") + ":" +
            String(mins).padStart(2, "0") + ":" +
            String(secs).padStart(2, "0")
        );
    };
    useEffect(() => {
        const restoreSession = async () => {
            const stored = await AsyncStorage.getItem("activeSession");

            if (!stored) return;

            const session = JSON.parse(stored);

            setSessionId(session.sessionId);
            setSessionStartTime(session.startTime);
            setElapsedTime(
                Math.floor((Date.now() - session.startTime) / 1000)
            );
            setIsSessionActive(true);
        };

        restoreSession();
    }, []);
    const [showPopup, setShowPopup] = useState(false);

    const startSession = async () => {
        if (!userId) {
            Alert.alert("Authentication Required", "Please log in to start a study session.");
            return;
        }
        try {
            const { data } = await api.post("/start-session", null, {
                params: {
                    user_id: userId,
                },
            });

            console.log("Session started:", data.session_id);
            const startTime = Date.now();

            setSessionId(data.session_id);
            setSessionStartTime(startTime);
            setElapsedTime(
                Math.floor((Date.now() - startTime) / 1000)
            );
            setIsSessionActive(true);

            await AsyncStorage.setItem(
                "activeSession",
                JSON.stringify({
                    sessionId: data.session_id,
                    startTime,
                })
            );

        } catch (err) {
            console.log(err);
        }
    };
    const endSession = async () => {
        await AsyncStorage.removeItem("activeSession");

        setIsSessionActive(false);
        setElapsedTime(0);
        setSessionStartTime(null);

        setShowPopup(true);
    };
    return (

        <LinearGradient
            colors={["#F5F8FA", "#ECF2F6", "#E3ECF1"]}
            style={{ flex: 1 }}
        >
            <View style={styles.container}>
                <View style={styles.modeContainer}>
                    <TouchableOpacity style={styles.tab} onPress={() => {
                        navigation.navigate('Home')
                    }}>
                        <Text style={styles.inactiveText}>Home</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.tab, styles.activeTab]}>
                        <Text style={styles.activeText}>Study Mode</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.containerBox}>
                    <View style={styles.sessionStateContainer}>
                        <View style={styles.line} />
                        <Text style={[styles.sessionText, isSessionActive ? styles.ongoing : styles.stopped]}>
                            {isSessionActive ? "Session Ongoing" : "No Session"}
                        </Text>
                        <View style={styles.line} />
                    </View>
                    <View style={styles.timerContainer}>
                        <Text style={styles.timerText}>
                            {formatTime()}
                        </Text>
                    </View>
                    <TouchableOpacity style={isSessionActive ? styles.disableContainer : styles.enableContainerStart}
                        disabled={isSessionActive}
                        onPress={startSession}
                    >
                        <Text style={isSessionActive?styles.startButtonActive:styles.startButtonInactive}>
                            Start Session
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.endSession, isSessionActive ? styles.enableContainerEnd : styles.disableContainer]}
                        disabled={!isSessionActive}
                        onPress={ endSession}>
                        <Text style={isSessionActive?styles.endButtonActive:styles.endButtonInactive}>
                            End Session
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.quoteContainer}>
                    <Text style={styles.quoteText}>
                        "The beautiful thing about learning is that nobody can take it away from you."
                    </Text>
                    <Text style={styles.quoteAuthor}>- B.B. King</Text>
                </View>
            </View>
            <SessionUploads
                visible={showPopup}
                onClose={() => setShowPopup(false)}
                sessionId={sessionId}
            />

        </LinearGradient >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "transparent",
    },
    scrollContent: {
        paddingBottom: 30,
    },
    modeContainer: {
        flexDirection: "row",
        backgroundColor: "#E1ECF7",
        borderRadius: 30,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 26,
        alignItems: "center",
        justifyContent: "center",
    },
    activeTab: {
        backgroundColor: "#00416A",
    },
    activeText: {
        color: "#fff",
        fontSize: 17,
        fontWeight: "700",
    },
    
    inactiveText: {
        color: "#00416A",
        fontSize: 17,
        fontWeight: "600",
    },
    enableContainerStart: {
        padding: 10,
        backgroundColor: "#147729d6",
        borderRadius: 20,
        height: 80,
        marginTop: 20,
        alignItems: "center",
        justifyContent: "center",
    },
        enableContainerEnd: {
        padding: 10,
        backgroundColor: "#800020",
        borderRadius: 20,
        height: 80,
        marginTop: 20,
        alignItems: "center",
        justifyContent: "center",
    },

    disableContainer: {
        padding: 10,
        backgroundColor: "rgba(93, 138, 168,0.2)",
        borderRadius: 20,
        height: 80,
        marginTop: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    timerContainer: {
        marginTop: 40,
        paddingVertical: 60,
        paddingHorizontal: 20,
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#E1ECF7",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 5,
        marginBottom: 20
    },
    timerText: {
        fontSize: 44,
        fontWeight: "bold",
        color: "#00416A",
        letterSpacing: 3,
    },
    sessionText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#00416A",
        marginLeft: 10,
        marginRight: 10
    },
    sessionStateContainer: {
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row"
    },
    ongoing: {
        color: "#008000"
    },
    stopped: {
        color: "#800020"
    },
    line: {
        flex: 1,
        height: 1.5,
        backgroundColor: "#C5C5C5",
    },
    startButtonActive: {
        fontSize: 20,
        fontWeight: 500,

    },
        startButtonInactive: {
        fontSize: 20,
        fontWeight: 500,
        color:"white"

    },
    endButtonActive: {
        fontSize: 20,
        fontWeight: "500",
        color:"white"
    },
        endButtonInactive: {
        fontSize: 20,
        fontWeight: "500",
    },
    endSession: {
        marginTop: 30
    },
    containerBox: {
        marginTop: 30
    },
    quoteContainer: {
        marginTop: 40,
        paddingHorizontal: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    quoteText: {
        fontSize: 13,
        fontStyle: "italic",
        color: "#6C8CA7",
        textAlign: "center",
        lineHeight: 18,
    },
    quoteAuthor: {
        fontSize: 11,
        fontWeight: "600",
        color: "#6C8CA7",
        marginTop: 6,
        textAlign: "center",
    }
});
