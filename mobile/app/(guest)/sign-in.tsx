import { Feather, FontAwesome, Ionicons } from '@expo/vector-icons'
import React from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { GoogleMark } from '@/components/google-mark'
import { useSession } from '@/providers/session-provider'
import { signInScreenStyles as styles } from '@/styles/screens/sign-in-screen'

function getPasswordVisibilityIconName(isPasswordVisible: boolean): 'eye' | 'eye-off' {
  if (isPasswordVisible) {
    return 'eye'
  }

  return 'eye-off'
}

function getRememberMeCheckboxStyle(rememberMe: boolean) {
  if (rememberMe) {
    return { borderColor: '#2458f4', backgroundColor: '#2458f4' }
  }

  return { borderColor: '#cfd6e3', backgroundColor: 'transparent' }
}

function getSignInMessageCardStyle(hasError: boolean) {
  if (hasError) {
    return { borderColor: '#fecaca', backgroundColor: '#fff5f5' }
  }

  return { borderColor: '#d6e4ff', backgroundColor: '#f4f8ff' }
}

function getSignInMessageTextColor(hasError: boolean): string {
  if (hasError) {
    return '#b42318'
  }

  return '#2458f4'
}

export default function SignInScreen() {
  const { clearError, error, isSigningIn, signInWithGoogle } = useSession()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false)
  const [rememberMe, setRememberMe] = React.useState(false)
  const [formMessage, setFormMessage] = React.useState<string | null>(null)

  const surfaceMessage = error ?? formMessage
  const passwordVisibilityIconName = getPasswordVisibilityIconName(isPasswordVisible)
  const rememberMeCheckboxStyle = getRememberMeCheckboxStyle(rememberMe)
  const hasAuthenticationError = error != null
  const signInMessageCardStyle = getSignInMessageCardStyle(hasAuthenticationError)
  const signInMessageTextColor = getSignInMessageTextColor(hasAuthenticationError)

  let googleButtonContent = (
    <>
      <GoogleMark size={20} />
      <Text selectable style={[styles.secondaryButtonText, { color: '#111827' }]}>
        Continue with Google
      </Text>
    </>
  )

  if (isSigningIn) {
    googleButtonContent = <ActivityIndicator color="#2458f4" />
  }

  function resetInlineMessage() {
    clearError()
    setFormMessage(null)
  }

  function handleEmailPasswordAction() {
    clearError()
    setFormMessage('Email and password sign-in is not wired in mobile yet. Use Continue with Google.')
  }

  function handleUnavailableAction(message: string) {
    clearError()
    setFormMessage(message)
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.contentContainer}
      style={styles.screen}
    >
      <View style={styles.card}>
        <View style={styles.hero}>
          <View
            style={[styles.brandMark, { backgroundColor: '#3d6bff' }]}
          >
            <Ionicons name="shield-checkmark" size={28} color="#ffffff" />
          </View>

          <View style={styles.heroCopy}>
            <Text selectable style={[styles.heroTitle, { color: '#1f2937' }]}>
              Sign in to your{'\n'}Account
            </Text>
            <Text selectable style={[styles.heroBody, { color: '#7a8393' }]}>
              Enter your email and password to log in
            </Text>
          </View>
        </View>

        <View style={styles.form}>
          <View
            style={[styles.inputWrap, { borderColor: '#edf0f5', backgroundColor: '#ffffff' }]}
          >
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSigningIn}
              keyboardType="email-address"
              onChangeText={(nextValue) => {
                resetInlineMessage()
                setEmail(nextValue)
              }}
              placeholder="Enter your email"
              placeholderTextColor="#9aa3b2"
              selectionColor="#2458f4"
              value={email}
              style={[styles.input, { color: '#111827' }]}
            />
          </View>

          <View
            style={[
              styles.inputWrap,
              styles.passwordWrap,
              { borderColor: '#edf0f5', backgroundColor: '#ffffff' }
            ]}
          >
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSigningIn}
              onChangeText={(nextValue) => {
                resetInlineMessage()
                setPassword(nextValue)
              }}
              placeholder="Enter your password"
              placeholderTextColor="#9aa3b2"
              secureTextEntry={!isPasswordVisible}
              selectionColor="#2458f4"
              value={password}
              style={[styles.passwordInput, { color: '#111827' }]}
            />
            <Pressable
              accessibilityRole="button"
              disabled={isSigningIn}
              hitSlop={10}
              onPress={() => {
                resetInlineMessage()
                setIsPasswordVisible((currentValue) => !currentValue)
              }}
            >
              <Feather
                name={passwordVisibilityIconName}
                size={18}
                color="#9aa3b2"
              />
            </Pressable>
          </View>

          <View style={styles.utilityRow}>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: rememberMe }}
              style={styles.checkboxRow}
              disabled={isSigningIn}
              onPress={() => {
                resetInlineMessage()
                setRememberMe((currentValue) => !currentValue)
              }}
            >
              <View
                style={[
                  styles.checkbox,
                  rememberMeCheckboxStyle
                ]}
              >
                {rememberMe && <Feather name="check" size={11} color="#ffffff" />}
              </View>
              <Text selectable style={[styles.utilityText, { color: '#6b7280' }]}>
                Remember me
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={isSigningIn}
              onPress={() => {
                handleUnavailableAction('Forgot password is not wired yet. Use Continue with Google for now.')
              }}
            >
              <Text selectable style={[styles.utilityAction, { color: '#4c73ff' }]}>
                Forgot Password ?
              </Text>
            </Pressable>
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={isSigningIn}
            onPress={handleEmailPasswordAction}
            style={[
              styles.primaryButton,
              { backgroundColor: '#2458f4' },
              isSigningIn && styles.primaryButtonDisabled
            ]}
          >
            <Text selectable style={styles.primaryButtonText}>
              Log In
            </Text>
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: '#d8dde6' }]} />
            <Text selectable style={[styles.dividerText, { color: '#97a0af' }]}>
              Or
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: '#d8dde6' }]} />
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={isSigningIn}
            onPress={() => {
              resetInlineMessage()
              void signInWithGoogle()
            }}
            style={[
              styles.secondaryButton,
              { borderColor: '#edf0f5', backgroundColor: '#ffffff' },
              isSigningIn && styles.secondaryButtonDisabled
            ]}
          >
            {googleButtonContent}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            disabled={isSigningIn}
            onPress={() => {
              handleUnavailableAction('Facebook sign-in is not wired yet. Use Continue with Google for now.')
            }}
            style={[
              styles.secondaryButton,
              { borderColor: '#edf0f5', backgroundColor: '#ffffff' },
              isSigningIn && styles.secondaryButtonDisabled
            ]}
          >
            <FontAwesome name="facebook" size={18} color="#1877f2" />
            <Text selectable style={[styles.secondaryButtonText, { color: '#111827' }]}>
              Continue with Facebook
            </Text>
          </Pressable>

          {surfaceMessage != null && (
            <View
              style={[
                styles.messageCard,
                signInMessageCardStyle
              ]}
            >
              <Text selectable style={[styles.messageText, { color: signInMessageTextColor }]}>
                {surfaceMessage}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text selectable style={[styles.footerText, { color: '#7a8393' }]}>
            {'Don\'t have an account?'}
          </Text>
          <Pressable
            accessibilityRole="button"
            disabled={isSigningIn}
            onPress={() => {
              handleUnavailableAction('Sign up is not wired in mobile yet. Use Continue with Google for now.')
            }}
          >
            <Text selectable style={[styles.footerAction, { color: '#4c73ff' }]}>
              Sign Up
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  )
}
