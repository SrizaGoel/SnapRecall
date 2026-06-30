import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "./app/screens/HomeScreen";
import { StudyModeScreen } from "./app/screens/StudyModeScreen";
import { ResourceScreen } from "./app/screens/ResourceScreen";
import WelcomeScreen from "./app/screens/WelcomeScreen"
import LoginScreen from "./app/screens/LoginScreen"
import SignupScreen from "./app/screens/SignupScreen"

const Stack = createNativeStackNavigator();
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="StudyModeScreen" component={StudyModeScreen} />
        <Stack.Screen name="Resources" component={ResourceScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

