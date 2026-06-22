import { Platform, useColorScheme } from 'react-native';

// --- Native Tab Layout (iOS / Android) ---
import { NativeTabs } from 'expo-router/unstable-native-tabs';

// --- Web Tab Layout ---
import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';

const Colors = {
  light: { background: '#ffffff', backgroundElement: '#F0F0F3', text: '#000000' },
  dark:  { background: '#000000', backgroundElement: '#212225', text: '#ffffff' },
} as const;

export default function TabLayout() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  if (Platform.OS === 'web') {
    return (
      <Tabs>
        <TabSlot style={{ height: '100%' }} />
        <TabList>
          <TabTrigger name="home" href={'/(tabs)/home' as any} />
          <TabTrigger name="explore" href={'/(tabs)/explore' as any} />
        </TabList>
      </Tabs>
    );
  }

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}
    >
      <NativeTabs.Trigger name="home">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('../../../assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>Explore</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('../../../assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
