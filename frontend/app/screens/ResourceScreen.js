import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput, ActivityIndicator, Image, Modal, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

export function ResourceScreen({ route, navigation }) {
    const [question, setQuestion] = useState("");
    const [loading, setLoading] = useState(false);
    const [sources, setSources] = useState([]);
    const [error, setError] = useState("");
    const [userId, setUserId] = useState(null);

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
                        console.log("Error parsing user data in ResourceScreen:", e);
                    }
                }
            }
            if (id) {
                setUserId(id);
            }
        };
        loadUserId();
    }, [route?.params]);
    const [selectedIndex, setSelectedIndex] = useState(null);

    const openImage = (index) => {
        setSelectedIndex(index);
    };
    const handleAskAI = async () => {
        if (!userId) {
            Alert.alert("Authentication Required", "Please log in to search resources.");
            return;
        }
        if (!question.trim()) {
            setError("Please enter a topic");
            return;
        }
        setError("");
        setLoading(true);
        setSources([]);

        try {
            const { data } = await api.get("/search", {
                params: {
                    user_id: userId,
                    query: question
                }
            })
            if (data.message) {
                setSources([]);
            } else {
                setSources(data);
            }
        } catch (err) {
            console.log(err);
            setError("Search failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient colors={["#F5F8FA", "#ECF2F6", "#E3ECF1"]} style={{ flex: 1 }}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <BlurView
                    intensity={60}
                    tint="light"
                    style={styles.backBlur}
                >
                    <Text style={styles.backArrow}>‹</Text>
                </BlurView>
            </TouchableOpacity>
            <View style={styles.aiContainer}>
                <View style={styles.aiHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.aiTitle}>My Resources</Text>
                        <Text style={styles.aiSubtitle}>Search what you've studied</Text>
                    </View>
                </View>

                <View style={[styles.inputContainer, error ? styles.inputContainerError : null]}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter the topic..."
                        placeholderTextColor="#9DB8CC"
                        value={question}
                        onChangeText={(text) => {
                            setQuestion(text);
                            setError("");
                        }}
                        onSubmitEditing={handleAskAI}
                        returnKeyType="search"
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={handleAskAI} activeOpacity={0.8}>
                        <Text style={styles.sendButtonText}>Search</Text>
                    </TouchableOpacity>
                </View>

                {error !== "" && <Text style={styles.errorText}>{error}</Text>}

                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#4682B4" />
                        <Text style={styles.loadingText}>Finding relevant study resources...</Text>
                    </View>
                )}

                {sources.length > 0 && (
                    <View style={styles.responseContainer}>
                        <View style={styles.sourcesHeader}>
                            <Text style={styles.sourcesTitle}>Search Results</Text>
                            <View style={styles.countBadge}>
                                <Text style={styles.countBadgeText}>{sources.length}</Text>
                            </View>
                        </View>

                        <FlatList
                            data={sources}
                            numColumns={2}
                            keyExtractor={(item) => item.screenshot_id.toString()}
                            contentContainerStyle={{ paddingBottom: 20 }}
                            columnWrapperStyle={{
                                justifyContent: "space-between",
                                marginBottom: 12,
                            }}
                            renderItem={({ item, index }) => (
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    onPress={() => openImage(index)}
                                >
                                    <Image
                                        source={{ uri: item.image_url }}
                                        style={styles.galleryImage}
                                    />
                                </TouchableOpacity>
                            )}
                        />
                        <Modal
                            visible={selectedIndex !== null}
                            transparent
                            animationType="fade"
                        >
                            <View style={styles.modalContainer}>

                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={() => setSelectedIndex(null)}
                                >
                                    <Text style={styles.closeText}>✕</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.leftButton}
                                    disabled={selectedIndex === 0}
                                    onPress={() => setSelectedIndex(selectedIndex - 1)}
                                >
                                    <Text style={styles.arrow}>❮</Text>
                                </TouchableOpacity>

                                <Image
                                    source={{ uri: sources[selectedIndex]?.image_url }}
                                    style={styles.fullImage}
                                    resizeMode="contain"
                                />

                                <TouchableOpacity
                                    style={styles.rightButton}
                                    disabled={selectedIndex === sources.length - 1}
                                    onPress={() => setSelectedIndex(selectedIndex + 1)}
                                >
                                    <Text style={styles.arrow}>❯</Text>
                                </TouchableOpacity>

                            </View>
                        </Modal>

                        <TouchableOpacity
                            style={styles.clearButton}
                            activeOpacity={0.7}
                            onPress={() => {
                                setError("");
                                setQuestion("");
                                setSources([]);
                            }}
                        >
                            <Text style={styles.clearButtonText}>Clear results</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    aiContainer: {
        marginTop: 24,
        marginHorizontal: 16,
        padding: 20,
        backgroundColor: "#FFFFFF",
        borderRadius: 28,
        borderWidth: 1,
        borderColor: "#E1ECF7",
        shadowColor: "#2E5B82",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        elevation: 6,
    },
    aiHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },
    aiTitle: {
        fontSize: 19,
        fontWeight: "800",
        color: "#1F4A6B",
        letterSpacing: 0.2,
    },
    aiSubtitle: {
        fontSize: 12.5,
        color: "#6C8CA7",
        marginTop: 2,
        fontWeight: "500",
    },
    inputContainer: {
        flexDirection: "row",
        marginTop: 18,
        backgroundColor: "#F5FAFE",
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: "#E1ECF7",
        padding: 5,
        alignItems: "center",
    },
    inputContainerError: {
        borderColor: "#E29A9A",
        backgroundColor: "#FDF5F5",
    },
    input: {
        flex: 1,
        height: 44,
        paddingHorizontal: 14,
        fontSize: 14.5,
        color: "#1F4A6B",
        fontWeight: "500",
    },
    sendButton: {
        backgroundColor: "#4682B4",
        borderRadius: 12,
        paddingHorizontal: 18,
        paddingVertical: 11,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#4682B4",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 3,
    },
    sendButtonText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 13.5,
        letterSpacing: 0.3,
    },
    errorText: {
        fontSize: 11.5,
        color: "#C75C5C",
        marginTop: 8,
        marginLeft: 4,
        fontWeight: "600",
    },
    loadingContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
        gap: 8,
    },
    loadingText: {
        fontSize: 12.5,
        color: "#6C8CA7",
        fontWeight: "600",
    },
    responseContainer: {
        marginTop: 20,
        paddingTop: 18,
        borderTopWidth: 1,
        borderTopColor: "#E6EFF7",
    },
    sourcesHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    sourcesTitle: {
        fontSize: 11.5,
        fontWeight: "800",
        color: "#6C8CA7",
        textTransform: "uppercase",
        letterSpacing: 0.8,
    },
    countBadge: {
        marginLeft: 8,
        backgroundColor: "#EAF3FB",
        borderRadius: 10,
        paddingHorizontal: 7,
        paddingVertical: 2,
        minWidth: 20,
        alignItems: "center",
    },
    countBadgeText: {
        fontSize: 11,
        fontWeight: "800",
        color: "#4682B4",
    },
    sourcesScroll: {
        paddingRight: 8,
        paddingBottom: 2,
    },
    sourceCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FCFEFF",
        borderWidth: 1,
        borderColor: "#E1ECF7",
        borderRadius: 16,
        padding: 10,
        marginRight: 10,
        width: 180,
        shadowColor: "#4682B4",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 1,
    },
    sourceImagePlaceholder: {
        width: 40,
        height: 40,
        backgroundColor: "#E6EFF7",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    sourcePlaceholderText: {
        fontSize: 9,
        fontWeight: "800",
        color: "#4682B4",
        textTransform: "uppercase",
        letterSpacing: 0.4,
    },
    sourceInfo: {
        marginLeft: 10,
        flex: 1,
    },
    sourceTitleText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#1F4A6B",
    },
    sourceDateText: {
        fontSize: 10,
        color: "#6C8CA7",
        marginTop: 3,
        fontWeight: "500",
    },
    sessionText: {
        fontSize: 10,
        color: "#8FAAC0",
        marginTop: 1,
        fontWeight: "500",
    },
    clearButton: {
        marginTop: 18,
        alignSelf: "center",
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: "#F5FAFE",
        borderWidth: 1,
        borderColor: "#E1ECF7",
    },
    clearButtonText: {
        color: "#4682B4",
        fontSize: 12,
        fontWeight: "700",
    },
    galleryImage: {
        width: "48%",
        aspectRatio: 0.7,
        borderRadius: 16,
        backgroundColor: "#EEE",
    },

    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.95)",
        justifyContent: "center",
        alignItems: "center",
    },

    fullImage: {
        width: "92%",
        height: "80%",
    },

    closeButton: {
        position: "absolute",
        top: 60,
        right: 25,
        zIndex: 100,
    },

    closeText: {
        color: "#fff",
        fontSize: 28,
        fontWeight: "bold",
    },

    leftButton: {
        position: "absolute",
        left: 15,
        top: "50%",
        zIndex: 10,
    },

    rightButton: {
        position: "absolute",
        right: 15,
        top: "50%",
        zIndex: 10,
    },

    arrow: {
        color: "white",
        fontSize: 38,
        fontWeight: "bold",
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
        marginLeft: 20,
        marginTop: 10
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
