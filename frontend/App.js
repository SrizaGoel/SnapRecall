import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "./app/screens/HomeScreen";
import { StudyModeScreen } from "./app/screens/StudyModeScreen";

const Stack = createNativeStackNavigator();
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="StudyModeScreen" component={StudyModeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

