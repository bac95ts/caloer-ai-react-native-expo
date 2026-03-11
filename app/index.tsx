import { Text, View, StyleSheet } from "react-native";
import { useAuth, useUser } from "@clerk/expo";
import { CustomButton } from "./components/CustomButton";

export default function Index() {
  const { signOut } = useAuth();
  const { user } = useUser();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back,</Text>
      <Text style={styles.email}>{user?.primaryEmailAddress?.emailAddress}</Text>

      <View style={styles.buttonContainer}>
        <CustomButton
          title="Sign Out"
          onPress={() => signOut()}
          variant="secondary"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
  }
});
