import { Modal, View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from "react-native";
import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import api from "../services/api";

export default function SessionUploads({ visible, onClose, sessionId, selectedImages, setSelectedImages }) {
    const [uploadStatus, setUploadStatus] = useState("");
    const [uploading, setUploading] = useState(false);
    const handleSelectImages = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission required", "Please allow access to your photo library.");
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.8,
        });
        if (!result.canceled && result.assets.length > 0) {
            const newImages = result.assets.map((asset) => ({
                uri: asset.uri,
                id: asset.uri + Date.now() + Math.random(),
            }));
            setSelectedImages((prev) => [...prev, ...newImages]);
        }
    }
    const handleRemoveImage = (id) => {
        setSelectedImages((prev) => prev.filter((img) => img.id !== id));
    };
    const handleUpload = async () => {
        try {
            if (!sessionId) {
                Alert.alert("Error", "Session not found.");
                return;
            }
            setUploading(true);
            setUploadStatus("Processing screenshots...");
            for (const image of selectedImages) {
                const formData = new FormData();

                formData.append("file", {
                    uri: image.uri,
                    name: "screenshot.jpg",
                    type: "image/jpeg",
                });

                await api.post(
                    `/upload?session_id=${sessionId}`,
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
                console.log("Uploading:", image.uri);
                console.log("Session:", sessionId);
            }

            await api.post(`/end-session/${sessionId}`);
            setUploading(false);
            Alert.alert("Success", "Study session saved successfully.");

            setSelectedImages([]);
            onClose();

        } catch (err) {
            console.log(err.response?.data || err.message);
            setUploading(false);
            Alert.alert("Upload Failed", "Couldn't upload screenshots.");
        }
        finally {
            setUploading(false);
        }
    };
    const handleCancel = async () => {
        try {

            await api.delete(`/sessions/${sessionId}`);

            setSelectedImages([]);

            onClose();

        } catch (err) {
            console.log(err);
            Alert.alert("Error", "Couldn't discard session.");
        }
    };

    const canUpload = selectedImages.length > 0;
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <BlurView
                    intensity={90}
                    tint="dark"
                    style={StyleSheet.absoluteFill}
                />

                <View style={styles.popupContainer}>
                    <Text style={styles.title}>Upload Session Images</Text>
                    <Text style={styles.subtitle}>
                        {selectedImages.length === 0
                            ? "No images selected"
                            : `${selectedImages.length} image${selectedImages.length > 1 ? "s" : ""} selected`}
                    </Text>
                    <TouchableOpacity style={styles.selectContainer} onPress={handleSelectImages} disabled={uploading}>
                        <Text style={styles.selectButton}>
                            +   SELECT   IMAGES
                        </Text>
                    </TouchableOpacity>
                    <ScrollView
                        style={styles.imageScroll}
                        contentContainerStyle={styles.imageScrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {selectedImages.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>Selected images will appear here</Text>
                            </View>
                        ) : (
                            <View style={styles.imageGrid}>
                                {selectedImages.map((img) => (
                                    <View key={img.id} style={styles.imageWrapper}>
                                        <Image source={{ uri: img.uri }} style={styles.thumbnail} />
                                        <TouchableOpacity
                                            style={styles.removeButton}
                                            onPress={() => handleRemoveImage(img.id)}
                                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                                        >
                                            <Text style={styles.removeButtonText}>✕</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}
                    </ScrollView>
                    <View style={styles.popupBottomContainer}>
                        <TouchableOpacity style={styles.cancelContainer} onPress={handleCancel} disabled={uploading}>
                            <Text style={styles.cancelButton}>
                                Cancel
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.uploadContainer} onPress={handleUpload} disabled={!canUpload || uploading}>
                            <Text style={styles.uploadButton}>
                                Upload
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {uploading && (
                        <View style={styles.processingOverlay}>
                            <Text style={styles.processingEmoji}>⏳</Text>
                            <Text style={styles.processingTitle}>Processing...</Text>
                            <Text style={styles.processingText}>
                                Uploading and indexing your screenshots.
                                {"\n"}
                                Please don't close the app.
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    popupContainer: {
        width: "90%",
        padding: 20,
        backgroundColor: "#fff",
        borderRadius: 20,
        height: 500
    },
    selectContainer: {
        height: 40,
        backgroundColor: "#4682B4",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20
    },
    selectButton: {
        color: "white",
        letterSpacing: 2,
    },
    popupBottomContainer: {
        flexDirection: "row",

    },
    title: {
        fontSize: 18,
        fontWeight: "800",
        color: "#2E5B82",
        marginBottom: 4,
        textAlign: "center",
    },

    subtitle: {
        fontSize: 12,
        color: "#6C8CA7",
        textAlign: "center",
        marginBottom: 14,
    },
    imageScroll: {
        flex: 1,
        minHeight: 160,
        maxHeight: 300,
        borderWidth: 1.5,
        borderColor: "#E1ECF7",
        borderRadius: 14,
        marginBottom: 16,
        backgroundColor: "#F5FAFE",
    },

    imageScrollContent: {
        padding: 10,
        flexGrow: 1,
    },

    emptyState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 36,
    },

    emptyText: {
        fontSize: 13,
        color: "#9DB8CE",
        fontWeight: "600",
        textAlign: "center",
    },

    imageGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },

    imageWrapper: {
        position: "relative",
        width: 88,
        height: 88,
        borderRadius: 10,
        overflow: "visible",
    },

    thumbnail: {
        width: 88,
        height: 88,
        borderRadius: 10,
        resizeMode: "cover",
        borderWidth: 1,
        borderColor: "#E1ECF7",
    },

    removeButton: {
        position: "absolute",
        top: -8,
        right: -8,
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: "#E74C3C",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
        zIndex: 10,
    },

    removeButtonText: {
        color: "#fff",
        fontSize: 10,
        fontWeight: "800",
        lineHeight: 12,
    },
    cancelContainer: {
        flex: 1,
        height: 40,
        backgroundColor: "#4682B4",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 7,
        marginRight: 10,
    },
    uploadContainer: {
        flex: 1,
        height: 40,
        backgroundColor: "#4682B4",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 7
    },
    cancelButton: {
        color: "white"
    },
    uploadButton: {
        color: "white"
    },
    processingOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255,255,255,0.96)",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 20,
        zIndex: 999,
    },

    processingEmoji: {
        fontSize: 42,
        marginBottom: 15,
    },

    processingTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: "#2E5B82",
        marginBottom: 10,
    },

    processingText: {
        textAlign: "center",
        color: "#6C8CA7",
        fontSize: 14,
        lineHeight: 22,
    },
});
