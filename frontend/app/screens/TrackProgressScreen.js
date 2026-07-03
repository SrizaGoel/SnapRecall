import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Pressable, Platform, Alert, Text, ScrollView, TouchableOpacity } from 'react-native';
import SelectedDate from '../utils/SelectDate';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from "expo-blur";
import api from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function TrackProgressScreen({ route, navigation }) {
    const [fromDate, setFromDate] = useState();
    const [toDate, setToDate] = useState();
    const [sessions, setSessions] = useState([]);
    const [userId, setUserId] = useState(null);

    const formatDate = (date) => {
        return date.toISOString().split("T")[0];
    };

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
                        console.log("Error parsing user data in TrackProgress:", e);
                    }
                }
            }
            if (id) {
                setUserId(id);
            }
        };
        loadUserId();
    }, [route?.params]);

    const fetchTodaysSession = async () => {
        if (!userId) return;
        const today = formatDate(new Date());

        try {
            const { data } = await api.get("/sessions_by_range", {
                params: {
                    user_id: userId,
                    start_date: today,
                    end_date: today,
                },
            });

            setSessions(data);
        } catch (err) {
            console.log(err);
            Alert.alert("Error", "Failed to fetch today's sessions.");
        }
    };

    useEffect(() => {
        if (userId) {
            fetchTodaysSession();
        }
    }, [userId]);
    const fetchRangeSessions = async () => {
        if (!userId) {
            Alert.alert("Authentication Required", "Please log in to track progress.");
            return;
        }
        if (!fromDate || !toDate) {
            Alert.alert(
                "Missing Dates",
                "Please select both From Date and To Date."
            );
            return;
        }

        try {
            const { data } = await api.get("/sessions_by_range", {
                params: {
                    user_id: userId,
                    start_date: formatDate(fromDate),
                    end_date: formatDate(toDate),
                },
            });

            setSessions(data);
        } catch (err) {
            console.log(err);
            Alert.alert("Error", "Failed to fetch sessions for the selected range.");
        }
    };
    const groupedSessions = sessions.reduce((acc, session) => {
        const date = session.study_date;

        if (!acc[date]) {
            acc[date] = [];
        }

        acc[date].push(session);

        return acc;
    }, {});
    const formatDuration = (seconds) => {
    const totalSeconds = Math.round(seconds);

    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hrs > 0) {
        return `${hrs}h ${mins}m ${secs}s`;
    }

    if (mins > 0) {
        return `${mins}m ${secs}s`;
    }

    return `${secs}s`;
};
    return (
        <LinearGradient
            colors={["#4F81BD", "#2E5B82", "#0F2C45"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <BlurView
                    intensity={35}
                    tint="light"
                    style={styles.backBlur}
                >
                    <Text style={styles.backArrow}>‹</Text>
                </BlurView>
            </TouchableOpacity>
            <View style={styles.card}>

                <Text style={styles.heading}>
                    Track Your Progress
                </Text>

                <Text style={styles.subHeading}>
                    Select a study period to view your statistics.
                </Text>

                <View style={styles.dateRow}>

                    <SelectedDate
                        label="From Date"
                        onDateChange={(date) => {
                            if (toDate && date > toDate) {
                                Alert.alert(
                                    "Invalid Date",
                                    "From Date cannot be later than To Date."
                                );
                                return;
                            }

                            setFromDate(date);
                        }}
                    />

                    <Text style={styles.hyphen}>→</Text>

                    <SelectedDate
                        label="To Date"
                        onDateChange={(date) => {
                            if (fromDate && date < fromDate) {
                                Alert.alert(
                                    "Invalid Date",
                                    "To Date cannot be earlier than From Date."
                                );
                                return;
                            }

                            setToDate(date);
                        }}
                    />

                </View>

                <Pressable style={styles.button} onPress={fetchRangeSessions}>
                    <Text style={styles.buttonText}>
                        View Progress
                    </Text>
                </Pressable>

            </View>
            <ScrollView
                style={{ flex: 1, marginTop: 20 }}
                showsVerticalScrollIndicator={false}
            >
                {Object.keys(groupedSessions).length === 0 ? (
                    <Text style={styles.emptyText}>
                        No study sessions found.
                    </Text>
                ) : (
                    Object.entries(groupedSessions).map(([date, sessions]) => (
                        <View key={date} style={styles.daySection}>

                            <Text style={styles.dayHeading}>
                                {date}
                            </Text>

                            <ScrollView
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                decelerationRate="fast"
                                contentContainerStyle={{ paddingRight: 20 }}
                            >
                                {sessions.map((session) => (
                                    <View
                                        key={session.session_id}
                                        style={styles.sessionCard}
                                    >

                                        <Text style={styles.sessionTitle}>
                                            {session.title}
                                        </Text>

                                        <Text style={styles.sessionTime}>
                                            {new Date(session.start_time).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                            {" - "}
                                            {new Date(session.end_time).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </Text>

                                        <Text style={styles.sessionDuration}>
                                            Duration • {formatDuration(session.duration)}
                                        </Text>

                                        <View style={styles.divider} />

                                        <Text style={styles.summaryHeading}>
                                            Summary
                                        </Text>

                                        <View style={styles.summaryContainer}>
                                            <ScrollView
                                                nestedScrollEnabled
                                                showsVerticalScrollIndicator={false}
                                            >
                                                <Text style={styles.summary}>
                                                    {session.summary}
                                                </Text>
                                            </ScrollView>
                                        </View>

                                    </View>
                                ))}
                            </ScrollView>

                        </View>
                    ))
                )}
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },

    card: {
        marginTop: 30,
        backgroundColor: "rgba(255,255,255,0.12)",
        borderRadius: 22,
        padding: 22,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
    },

    heading: {
        color: "white",
        fontSize: 26,
        fontWeight: "700",
        textAlign: "center",
    },

    subHeading: {
        color: "rgba(255,255,255,0.75)",
        textAlign: "center",
        marginTop: 8,
        marginBottom: 28,
        fontSize: 15,
    },

    dateRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },

    hyphen: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "700",
    },

    button: {
        marginTop: 30,
        backgroundColor: "#FFFFFF",
        borderRadius: 15,
        paddingVertical: 15,
        alignItems: "center",
    },

    buttonText: {
        color: "#24547E",
        fontWeight: "700",
        fontSize: 17,
    },
    emptyText: {
        color: "white",
        textAlign: "center",
        marginTop: 40,
        fontSize: 16,
    },

    daySection: {
        marginBottom: 25,
    },

    dayHeading: {
        color: "white",
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 12,
    },

    sessionCard: {
        width: 260,
        height: 340,
        backgroundColor: "white",
        borderRadius: 18,
        padding: 18,
        marginRight: 15,
    },

    sessionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#2E5B82",
        marginBottom: 10,
    },

    sessionDuration: {
        fontSize: 14,
        color: "#666",
        marginBottom: 12,
    },
    sessionCard: {
        width: 280,
        height: 370,

        backgroundColor: "#FFFFFF",

        borderRadius: 24,

        padding: 20,

        marginRight: 18,

        elevation: 6,
    },

    sessionTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#183B5B",
    },

    sessionTime: {
        marginTop: 10,
        fontSize: 14,
        color: "#667085",
    },

    sessionDuration: {
        marginTop: 4,
        fontSize: 14,
        color: "#667085",
    },

    divider: {
        marginVertical: 18,
        height: 1,
        backgroundColor: "#ECECEC",
    },

    summaryHeading: {
        fontSize: 16,
        fontWeight: "600",
        color: "#183B5B",
        marginBottom: 10,
    },

    summaryContainer: {
        flex: 1,
    },

    summary: {
        color: "#475467",
        fontSize: 15,
        lineHeight: 24,
        textAlign: "justify",
    },
    backButton: {
        width: 46,
        height: 46,
        borderRadius: 16,
        overflow: "hidden",
        elevation: 5,
        shadowColor: "#00416A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
    },

    backBlur: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.45)",
        backgroundColor: "rgba(255,255,255,0.18)",
    },

    backArrow: {
        fontSize: 30,
        color: "#00416A",
        fontWeight: "700",
        lineHeight: 30,
        marginLeft: -2,
    },
});

