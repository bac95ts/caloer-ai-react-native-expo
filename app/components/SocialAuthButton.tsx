import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';

interface SocialAuthButtonProps {
  onPress: () => void;
  title: string;
  icon: 'google' | 'apple';
  loading?: boolean;
}

export function SocialAuthButton({
  onPress,
  title,
  icon,
  loading = false,
}: SocialAuthButtonProps) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="#374151" />
      ) : (
        <>
          {icon === 'google' && (
             // Replace with an actual Google icon when available, 
             // using an Expo vector icon or image for now
            <Image
              source={require('../../assets/images/favicon.png')} // Temporary placeholder
              style={styles.icon}
            />
          )}
          <Text style={styles.text}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 12,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  text: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '600',
  },
});
