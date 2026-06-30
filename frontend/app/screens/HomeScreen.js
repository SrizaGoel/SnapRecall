import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, TextInput, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const generateCalendarDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < startOffset; i++) {
        days.push({ id: `empty-${i}`, dayNum: null, isActive: false });
    }

    // Mock active days for the current month (steel blue if used, white if missed)
    const mockActiveDays = [2, 3, 5, 8, 12, 15, 18, 19, 20, 22, 25, 27, 28, 29];

    for (let d = 1; d <= daysInMonth; d++) {
        days.push({
            id: `day-${d}`,
            dayNum: d,
            isActive: mockActiveDays.includes(d),
            isToday: d === today.getDate(),
        });
    }
    return days;
};

export function HomeScreen({ navigation }) {
    const today = new Date();
    const currentMonthName = monthNames[today.getMonth()];
    const currentYear = today.getFullYear();
    const calendarDays = generateCalendarDays();

    const [question, setQuestion] = useState("");
    const [loading, setLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState(null);
    const [sources, setSources] = useState([]);
    const [input, setInput] = useState("");

    const handleAskAI = () => {
        if (!question.trim()) {
            setInput("* Please enter a question ");
            return;
        }
        setInput("");
        setLoading(true);
        setAiResponse(null);
        setSources([]);

        setTimeout(() => {
            setLoading(false);
            setAiResponse(
                "Based on your React Native hooks slides, you should use useEffect when synchronizing with an external system. For performance optimizations, consider using useMemo or useCallback."
            );
            setSources([
                { id: "1", title: "React Hooks Slide.png", date: "June 25" },
                { id: "2", title: "UseEffect Notes.png", date: "June 26" }
            ]);
        }, 1500);
    };

    return (
        <LinearGradient
            colors={["#F5F8FA", "#ECF2F6", "#E3ECF1"]}
            style={{ flex: 1 }}
        >
            <View style={styles.container}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.modeContainer}>
                        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
                            <Text style={styles.activeText}>Home</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.tab} onPress={() => {
                            navigation.navigate('StudyModeScreen')
                        }}>
                            <Text style={styles.inactiveText}>Study Mode</Text>
                        </TouchableOpacity>
                    </View>

                    <View>
                        <Text style={styles.welcomMessage}>Welcome back, Sriza !</Text>
                    </View>

                    <View style={styles.streakContainer}>
                        <LinearGradient
                            colors={["#FDFDFD", "#F0F5FA"]}
                            style={styles.streakBox}
                        >
                            <View style={styles.leftSection}>
                                <Image source={require("../assets/streak-fire.png")} style={styles.streakImage} />
                                <Text style={styles.streakCountText}>5</Text>
                                <Text style={styles.streakLabel}>Day Streak</Text>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.rightSection}>
                                <View style={styles.calendarHeader}>
                                    <Text style={styles.monthText}>{currentMonthName}</Text>
                                    <Text style={styles.yearText}>{currentYear}</Text>
                                </View>

                                <View style={styles.weekdaysRow}>
                                    {["M", "T", "W", "T", "F", "S", "S"].map((day, idx) => (
                                        <Text key={idx} style={styles.weekdayLabel}>{day}</Text>
                                    ))}
                                </View>

                                <View style={styles.daysGrid}>
                                    {calendarDays.map((day) => (
                                        <View key={day.id} style={styles.dayCell}>
                                            {day.dayNum !== null ? (
                                                <View style={[
                                                    styles.dayInner,
                                                    day.isActive ? styles.dayActive : styles.dayInactive,
                                                    day.isToday && styles.dayToday
                                                ]}>
                                                    <Text style={[
                                                        styles.dayText,
                                                        day.isActive ? styles.dayTextActive : styles.dayTextInactive
                                                    ]}>
                                                        {day.dayNum}
                                                    </Text>
                                                </View>
                                            ) : null}
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </LinearGradient>
                    </View>
                    <View style={styles.aiContainer}>
                        <View style={styles.aiHeader}>
                            <Text style={styles.aiTitle}>Ask Cypher</Text>
                            <Text style={styles.aiSubtitle}>Query knowledge across all screenshots</Text>
                        </View>

                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Ask anything about your screenshots..."
                                placeholderTextColor="#6C8CA7"
                                value={question}
                                onChangeText={(text)=>{
                                    setQuestion(text);
                                    setInput("");
                                }}
                                onSubmitEditing={handleAskAI}
                            />
                            <TouchableOpacity style={styles.sendButton} onPress={handleAskAI}>
                                <Text style={styles.sendButtonText}>Ask</Text>
                            </TouchableOpacity>
                        </View>
                          {input !== "" && (
                                <Text style={styles.inputText}>
                                    {input}
                                </Text>
                            )}
                        {loading && (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color="#4682B4" />
                                <Text style={styles.loadingText}>AI is scanning your screenshots...</Text>
                            </View>
                        )}

                        {aiResponse && (
                            <View style={styles.responseContainer}>
                                <Text style={styles.responseTitle}>AI Answer</Text>
                                <Text style={styles.responseText}>{aiResponse}</Text>

                                <View style={styles.sourcesHeader}>
                                    <Text style={styles.sourcesTitle}>Sources Used</Text>
                                </View>

                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sourcesScroll}>
                                    {sources.map(source => (
                                        <View key={source.id} style={styles.sourceCard}>
                                            <View style={styles.sourceImagePlaceholder}>
                                                <Text style={styles.sourcePlaceholderText}>Image</Text>
                                            </View>
                                            <View style={styles.sourceInfo}>
                                                <Text style={styles.sourceTitleText} numberOfLines={1}>{source.title}</Text>
                                                <Text style={styles.sourceDateText}>{source.date}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </ScrollView>

                                <TouchableOpacity
                                    style={styles.clearButton}
                                    onPress={() => {
                                        setInput("");
                                        setQuestion("");
                                        setAiResponse(null);
                                        setSources([]);
                                    }}
                                >
                                    <Text style={styles.clearButtonText}>Clear</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    <TouchableOpacity style={styles.progressTracker}>
                        <Text style={styles.progressButton}>
                            Track your progress
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.myResources} onPress={()=>{
                        navigation.navigate('Resources')
                    }}>
                        <Text style={styles.resourceButton}>
                            My Resources
                        </Text>
                    </TouchableOpacity>


                </ScrollView>
            </View>
        </LinearGradient>
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
        backgroundColor: "#4682B4",
    },
    activeText: {
        color: "#fff",
        fontSize: 17,
        fontWeight: "700",
    },
    inactiveText: {
        color: "#2E5B82",
        fontSize: 17,
        fontWeight: "600",
    },
    welcomMessage: {
        fontWeight: 'bold',
        fontStyle: 'italic',
        marginTop: 20,
        fontSize: 18,
        color: "#2E5B82"
    },
    streakContainer: {
        marginTop: 20,
        alignItems: "stretch",
        justifyContent: "center",
    },
    streakBox: {
        width: "100%",
        height: 235,
        padding: 16,
        borderRadius: 24,
        borderWidth: 1.5,
        borderColor: "#E1ECF7",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        shadowColor: "#4682B4",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.12,
        shadowRadius: 18,
        elevation: 8,
        overflow: "hidden",
    },
    leftSection: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    streakImage: {
        width: 70,
        height: 70,
        resizeMode: "contain",
    },
    streakCountText: {
        fontSize: 32,
        fontWeight: "800",
        color: "#2E5B82",
        marginTop: 2,
        lineHeight: 34,
    },
    streakLabel: {
        fontSize: 11,
        fontWeight: "700",
        color: "#6C8CA7",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginTop: 2,
    },
    divider: {
        width: 1,
        height: "85%",
        backgroundColor: "rgba(70, 130, 180, 0.15)",
        marginHorizontal: 12,
    },
    rightSection: {
        flex: 1.6,
        paddingLeft: 2,
    },
    calendarHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "baseline",
        marginBottom: 8,
        paddingHorizontal: 4,
    },
    monthText: {
        fontSize: 16,
        fontWeight: "800",
        color: "#2E5B82",
    },
    yearText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#6C8CA7",
    },
    weekdaysRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 4,
    },
    weekdayLabel: {
        width: 22,
        textAlign: "center",
        fontSize: 9,
        fontWeight: "800",
        color: "#6C8CA7",
    },
    daysGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    dayCell: {
        width: 22,
        height: 22,
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 1,
    },
    dayInner: {
        width: 19,
        height: 19,
        borderRadius: 9.5,
        justifyContent: "center",
        alignItems: "center",
    },
    dayActive: {
        backgroundColor: "#4682B4",
        shadowColor: "#4682B4",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 1,
    },
    dayInactive: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E1ECF7",
    },
    dayToday: {
        borderWidth: 1.5,
        borderColor: "#2E5B82",
    },
    dayText: {
        fontSize: 8.5,
        fontWeight: "700",
        textAlign: "center",
    },
    dayTextActive: {
        color: "#FFFFFF",
    },
    dayTextInactive: {
        color: "#2E5B82",
    },
    aiContainer: {
        marginTop: 24,
        padding: 16,
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        borderWidth: 1.5,
        borderColor: "#E1ECF7",
        shadowColor: "#4682B4",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    aiHeader: {
        marginBottom: 4,
    },
    aiTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#2E5B82",
    },
    aiSubtitle: {
        fontSize: 12,
        color: "#6C8CA7",
        marginTop: 2,
    },
    inputContainer: {
        flexDirection: "row",
        marginTop: 16,
        backgroundColor: "#F5FAFE",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#E1ECF7",
        padding: 4,
        alignItems: "center",
    },
    input: {
        flex: 1,
        height: 44,
        paddingHorizontal: 12,
        fontSize: 14,
        color: "#2E5B82",
    },
    sendButton: {
        backgroundColor: "#4682B4",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    sendButtonText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 14,
    },
    loadingContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 16,
        gap: 8,
    },
    loadingText: {
        fontSize: 12,
        color: "#6C8CA7",
        fontWeight: "600",
    },
    responseContainer: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#E6EFF7",
    },
    responseTitle: {
        fontSize: 14,
        fontWeight: "800",
        color: "#2E5B82",
        marginBottom: 6,
    },
    responseText: {
        fontSize: 13,
        lineHeight: 18,
        color: "#2E5B82",
        backgroundColor: "#F5FAFE",
        padding: 12,
        borderRadius: 12,
    },
    sourcesHeader: {
        marginTop: 16,
        marginBottom: 8,
    },
    sourcesTitle: {
        fontSize: 12,
        fontWeight: "800",
        color: "#6C8CA7",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    sourcesScroll: {
        flexDirection: "row",
    },
    sourceCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E1ECF7",
        borderRadius: 12,
        padding: 6,
        marginRight: 10,
        width: 170,
    },
    sourceImagePlaceholder: {
        width: 36,
        height: 36,
        backgroundColor: "#E6EFF7",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    sourcePlaceholderText: {
        fontSize: 8,
        fontWeight: "700",
        color: "#4682B4",
        textTransform: "uppercase",
    },
    sourceInfo: {
        marginLeft: 8,
        flex: 1,
    },
    sourceTitleText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#2E5B82",
    },
    sourceDateText: {
        fontSize: 9,
        color: "#6C8CA7",
        marginTop: 1,
    },
    clearButton: {
        marginTop: 16,
        alignSelf: "center",
        paddingVertical: 6,
        paddingHorizontal: 16,
    },
    clearButtonText: {
        color: "#4682B4",
        fontSize: 12,
        fontWeight: "700",
    },
    progressTracker: {
        marginTop: 30,
        backgroundColor: "#649BC8",
        padding: 15,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    progressButton: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: 500,
        letterSpacing: 1.5,
        textAlign: "center"
    },
    myResources: {
        marginTop: 20,
        backgroundColor: "#649BC8",
        padding: 15,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    resourceButton: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: 500,
        letterSpacing: 1.5,
        textAlign: "center"
    },
    inputText: {
    color: "#851f1f",
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
},
});