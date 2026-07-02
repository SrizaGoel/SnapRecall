import React, { useState } from "react";
import {
  View,
  TextInput,
  Pressable,
  Platform,
  StyleSheet,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function SelectedDate({
  label,
  onDateChange,
}) {
  const [show, setShow] = useState(false);
  const [date, setDate] = useState(new Date());
  const [text, setText] = useState("");

  const handleChange = (event, selectedDate) => {
    if (event.type === "dismissed") {
      setShow(false);
      return;
    }

    const current = selectedDate || date;

    setDate(current);
    setShow(false);

    const formatted = current.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    setText(formatted);

    onDateChange(current);
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.dateContainer}
        onPress={() => setShow(true)}
      >
        <TextInput
          style={styles.input}
          placeholder={label}
          placeholderTextColor="#8A94A6"
          value={text}
          editable={false}
          pointerEvents="none"
        />
      </Pressable>

      {show && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          maximumDate={new Date()}
          onChange={handleChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 4,
  },

  dateContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,

    paddingHorizontal: 16,
    paddingVertical: 14,

    borderWidth: 1,
    borderColor: "#D6E4F5",

    justifyContent: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    elevation: 3,
  },

  input: {
    fontSize: 15,
    color: "#1E293B",
    fontWeight: "500",
  },
});