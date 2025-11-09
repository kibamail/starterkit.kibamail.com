import { Text } from "@kibamail/owly";
import * as Tabs from "@kibamail/owly/tabs";

export default function SettingsBilling() {
  return (
    <Tabs.Content value="billing" className="py-4">
      <Text>
        This is the billing page of the settings page. Moment of truth.
      </Text>
    </Tabs.Content>
  );
}
