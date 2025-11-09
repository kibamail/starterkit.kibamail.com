import { Text } from "@kibamail/owly";
import * as Tabs from "@kibamail/owly/tabs";

export default function SettingsUsage() {
  return (
    <Tabs.Content value="usage" className="py-4">
      <Text>This is the usage page of the settings page. Moment of truth.</Text>
    </Tabs.Content>
  );
}
