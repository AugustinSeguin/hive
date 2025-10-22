import React, { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Gate() {
  const [loading, setLoading] = useState(true);
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        setHasToken(!!token);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || hasToken === null) return null;
  return <Redirect href={hasToken ? "/(tabs)" : "/login"} />;
}
