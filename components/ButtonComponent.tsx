import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  StyleProp,
  ViewStyle,
} from "react-native";
import { Colors } from "../constants/Colors";
import Sizes from "../constants/Sizes";

import type { StyleProp, ViewStyle } from "react-native";
type ButtonProps = {
  type: "primary" | "secondary";
  action: () => void;
  titre: string;
  style?: StyleProp<ViewStyle>;
};

const styles = StyleSheet.create({
  button: {
    borderRadius: Sizes.BUTTON_RADIUS,
    alignItems: "center",
  },
  text: {
    fontSize: Sizes.FONT_SIZE_MD,
    fontWeight: "bold",
  },
});

function getButtonStyles(
  type: "primary" | "secondary",
  colorScheme: "light" | "dark" | null | undefined
) {
  if (type === "primary") {
    return {
      button: {
        ...styles.button,
        paddingVertical: Sizes.SPACING_MD,
        paddingHorizontal: Sizes.SPACING_MD,
        marginHorizontal: Sizes.SPACING_LG,
        backgroundColor: Colors[colorScheme ?? "light"].tint,
      },
      text: {
        ...styles.text,
        color: Colors[colorScheme ?? "light"].text,
      },
    };
  } else {
    const size = Sizes.AVATAR_SIZE_LG;
    return {
      button: {
        ...styles.button,
        backgroundColor: Colors[colorScheme ?? "light"].tint,
        borderWidth: 1,
        borderRadius: size / 2,
        width: size,
        height: size,
        justifyContent: "center" as const,
        alignItems: "center" as const,
      },
      text: {
        ...styles.text,
        color: Colors[colorScheme ?? "light"].text,
        fontSize: Sizes.FONT_SIZE_SM,
      },
    };
  }
}

const ButtonComponent: React.FC<ButtonProps> = ({
  action,
  titre,
  type,
  style,
}) => {
  const colorScheme = useColorScheme();
  const { button, text } = getButtonStyles(type, colorScheme);
  return (
    <TouchableOpacity onPress={action} style={[button, style]}>
      <Text style={text}>{titre}</Text>
    </TouchableOpacity>
  );
};

export default ButtonComponent;
