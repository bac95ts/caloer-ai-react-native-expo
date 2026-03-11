import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';

import { useRouter } from 'expo-router';
import { CustomTextInput } from '../components/CustomTextInput';
import { CustomButton } from '../components/CustomButton';
import { SocialAuthButton } from '../components/SocialAuthButton';
import { useSignUp, useOAuth } from '@clerk/expo';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const saveUserToFirestore = async (userId: string, email: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          id: userId,
          email: email,
          createdAt: new Date(),
        });
        console.log('User saved to Firestore');
      }
    } catch (err) {
      console.error('Error saving to Firestore', err);
    }
  };

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError('');

    try {
      await signUp.create({
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setError(err.errors[0].message || 'An error occurred during sign up.');
    } finally {
      setLoading(false);
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError('');

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        await saveUserToFirestore(completeSignUp.createdUserId!, emailAddress);
        router.replace('/');
      } else {
        console.error(JSON.stringify(completeSignUp, null, 2));
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setError(err.errors[0].message || 'An error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSignInPress = async () => {
    try {
      const { createdSessionId, signIn, signUp, setActive } = await startOAuthFlow();

      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
        // NOTE: signUp object might contain the created user details,
        // but for a robust solution, we might want to have an auth listener
        // in our root layout to sync Clerk state with Firebase.
        // For now, we perform a basic save if we can determine the user ID.
        if (signUp?.createdUserId && signUp?.emailAddress) {
          await saveUserToFirestore(signUp.createdUserId, signUp.emailAddress);
        } else if (signIn?.userData?.id && signIn?.userData?.emailAddresses?.[0]?.emailAddress) {
             // Example if signIn object has the data for an existing user
             await saveUserToFirestore(signIn.userData.id as string, signIn.userData.emailAddresses[0].emailAddress as string);
        }
        
        router.replace('/');
      }
    } catch (err) {
      console.error('OAuth error', err);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
           <Image
            source={require('../../assets/images/react-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join CaloerAI to get started</Text>
        </View>

        {!pendingVerification ? (
          <>
            <View style={styles.formContainer}>
              <CustomTextInput
                label="Email Address"
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={emailAddress}
                onChangeText={setEmailAddress}
              />
              <CustomTextInput
                label="Password"
                placeholder="Create a password"
                isPassword
                value={password}
                onChangeText={setPassword}
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <View style={{ marginTop: 24 }}>
                <CustomButton
                  title="Sign Up"
                  onPress={onSignUpPress}
                  loading={loading}
                />
              </View>
            </View>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialContainer}>
              <SocialAuthButton
                title="Continue with Google"
                icon="google"
                onPress={onGoogleSignInPress}
              />
            </View>

            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Text
                style={styles.footerLink}
                onPress={() => router.push('/sign-in' as any)}
              >
                Sign In
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.formContainer}>
            <Text style={styles.verificationText}>
              We&apos;ve sent a verification code to your email.
            </Text>
            <CustomTextInput
              label="Verification Code"
              placeholder="Enter code"
              keyboardType="number-pad"
              value={code}
              onChangeText={setCode}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={{ marginTop: 24 }}>
              <CustomButton
                title="Verify Email"
                onPress={onPressVerify}
                loading={loading}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 24,
  },
  verificationText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  socialContainer: {
    marginBottom: 32,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerText: {
    color: '#6B7280',
    fontSize: 15,
  },
  footerLink: {
    color: '#2563EB',
    fontSize: 15,
    fontWeight: '600',
  },
});
