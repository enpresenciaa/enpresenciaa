import { Text } from "react-native";

type CurrentScreenLabelProps = {
  name: string;
};

export function CurrentScreenLabel({ name }: CurrentScreenLabelProps) {
  return <Text className="mb-4 text-sm font-medium text-text-secondary">Vista actual: {name}</Text>;
}
