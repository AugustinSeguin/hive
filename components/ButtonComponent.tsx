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
    const size = Sizes.AVATAR_SIZE_XL;
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
        fontSize: Sizes.FONT_SIZE_XXL,
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
  let { button, text } = getButtonStyles(type, colorScheme);

  const isDanger = typeof titre === 'string' && titre.toLowerCase().includes('supprimer');
  if (isDanger) {
    button = {
      ...styles.button,
      paddingVertical: Sizes.SPACING_MD,
      paddingHorizontal: Sizes.SPACING_MD,
      marginHorizontal: Sizes.SPACING_LG,
      borderRadius: Sizes.BUTTON_RADIUS,
      backgroundColor: Colors[colorScheme ?? 'light'].lateTask,
    };
    text = {
      ...styles.text,
      color: '#fff',
      fontSize: Sizes.FONT_SIZE_MD,
    };
  }
  const combinedStyle = isDanger ? [style, button] : [button, style];
  return (
    <TouchableOpacity onPress={action} style={combinedStyle}>
      <Text style={text}>{titre}</Text>
    </TouchableOpacity>
  );
};

export default ButtonComponent;
