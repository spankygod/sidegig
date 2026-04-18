import { Feather, FontAwesome, Ionicons } from '@expo/vector-icons'
import { Redirect } from 'expo-router'
import React from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { GoogleMark } from '@/components/google-mark'
import { appTypography } from '@/constants/typography'
import { cn } from '@/lib/cn'
import { useSession } from '@/providers/session-provider'

export default function SignInScreen() {
  const { clearError, error, isReady, isSigningIn, session, signInWithGoogle } = useSession()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false)
  const [rememberMe, setRememberMe] = React.useState(false)
  const [formMessage, setFormMessage] = React.useState<string | null>(null)

  if (isReady && session != null) {
    return <Redirect href="/(tabs)" />
  }

  const surfaceMessage = error ?? formMessage

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
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 32
      }}
      className="flex-1 bg-[#f7f8fa]"
    >
      <View className="w-full max-w-[360px] self-center gap-6">
        <View className="items-center gap-5">
          <View
            className="h-14 w-14 items-center justify-center rounded-2xl bg-[#3d6bff]"
            style={{
              borderCurve: 'continuous'
            }}
          >
            <Ionicons name="shield-checkmark" size={28} color="#ffffff" />
          </View>

          <View className="w-full gap-2">
            <Text
              selectable
              className="text-[21px] leading-[30px] text-[#1f2937]"
              style={{
                fontFamily: appTypography.bold,
                fontWeight: '700'
              }}
            >
              Sign in to your{'\n'}Account
            </Text>
            <Text
              selectable
              className="text-[14px] leading-5 text-[#7a8393]"
              style={{
                fontFamily: appTypography.regular,
                fontWeight: '400'
              }}
            >
              Enter your email and password to log in
            </Text>
          </View>
        </View>

        <View className="gap-3.5">
          <View
            className="rounded-2xl border border-[#edf0f5] bg-white px-4"
            style={{
              borderCurve: 'continuous'
            }}
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
              className="min-h-14 text-[15px] text-[#111827]"
              style={{
                fontFamily: appTypography.regular,
                fontWeight: '400'
              }}
            />
          </View>

          <View
            className="min-h-14 flex-row items-center rounded-2xl border border-[#edf0f5] bg-white px-4"
            style={{
              borderCurve: 'continuous'
            }}
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
              className="flex-1 py-4 text-[15px] text-[#111827]"
              style={{
                fontFamily: appTypography.regular,
                fontWeight: '400'
              }}
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
                name={isPasswordVisible ? 'eye' : 'eye-off'}
                size={18}
                color="#9aa3b2"
              />
            </Pressable>
          </View>

          <View className="flex-row items-center justify-between gap-3 px-1">
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: rememberMe }}
              className="flex-row items-center gap-2"
              disabled={isSigningIn}
              onPress={() => {
                resetInlineMessage()
                setRememberMe((currentValue) => !currentValue)
              }}
            >
              <View
                className={cn(
                  'h-[16px] w-[16px] items-center justify-center rounded-[4px] border',
                  rememberMe ? 'border-[#2458f4] bg-[#2458f4]' : 'border-[#cfd6e3] bg-transparent'
                )}
                style={{
                  borderCurve: 'continuous'
                }}
              >
                {rememberMe
                  ? <Feather name="check" size={11} color="#ffffff" />
                  : null}
              </View>
              <Text
                selectable
                className="text-[13px] leading-4 text-[#6b7280]"
                style={{
                  fontFamily: appTypography.regular,
                  fontWeight: '400'
                }}
              >
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
              <Text
                selectable
                className="text-[13px] leading-4 text-[#4c73ff]"
                style={{
                  fontFamily: appTypography.medium,
                  fontWeight: '500'
                }}
              >
                Forgot Password ?
              </Text>
            </Pressable>
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={isSigningIn}
            onPress={handleEmailPasswordAction}
            className={cn(
              'min-h-14 items-center justify-center rounded-2xl bg-[#2458f4] px-4 active:bg-[#1f4cd4]',
              isSigningIn && 'opacity-70'
            )}
            style={{
              borderCurve: 'continuous'
            }}
          >
            <Text
              selectable
              className="text-[16px] leading-5 text-white"
              style={{
                fontFamily: appTypography.medium,
                fontWeight: '500'
              }}
            >
              Log In
            </Text>
          </Pressable>

          <View className="flex-row items-center gap-3 py-1">
            <View className="h-px flex-1 bg-[#d8dde6]" />
            <Text
              selectable
              className="text-[14px] leading-5 text-[#97a0af]"
              style={{
                fontFamily: appTypography.regular,
                fontWeight: '400'
              }}
            >
              Or
            </Text>
            <View className="h-px flex-1 bg-[#d8dde6]" />
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={isSigningIn}
            onPress={() => {
              resetInlineMessage()
              void signInWithGoogle()
            }}
            className={cn(
              'min-h-14 flex-row items-center justify-center gap-3 rounded-2xl border border-[#edf0f5] bg-white px-4 active:bg-[#f8faff]',
              isSigningIn && 'opacity-70'
            )}
            style={{
              borderCurve: 'continuous'
            }}
          >
            {isSigningIn
              ? (
                <ActivityIndicator color="#2458f4" />
                )
              : (
                <>
                  <GoogleMark size={20} />
                  <Text
                    selectable
                    className="text-[15px] leading-5 text-[#111827]"
                    style={{
                      fontFamily: appTypography.medium,
                      fontWeight: '500'
                    }}
                  >
                    Continue with Google
                  </Text>
                </>
                )}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            disabled={isSigningIn}
            onPress={() => {
              handleUnavailableAction('Facebook sign-in is not wired yet. Use Continue with Google for now.')
            }}
            className={cn(
              'min-h-14 flex-row items-center justify-center gap-3 rounded-2xl border border-[#edf0f5] bg-white px-4 active:bg-[#f8faff]',
              isSigningIn && 'opacity-70'
            )}
            style={{
              borderCurve: 'continuous'
            }}
          >
            <FontAwesome name="facebook" size={18} color="#1877f2" />
            <Text
              selectable
              className="text-[15px] leading-5 text-[#111827]"
              style={{
                fontFamily: appTypography.medium,
                fontWeight: '500'
              }}
            >
              Continue with Facebook
            </Text>
          </Pressable>

          {surfaceMessage == null
            ? null
            : (
              <View
                className={cn(
                  'rounded-2xl border px-4 py-3',
                  error == null
                    ? 'border-[#d6e4ff] bg-[#f4f8ff]'
                    : 'border-[#fecaca] bg-[#fff5f5]'
                )}
                style={{
                  borderCurve: 'continuous'
                }}
              >
                <Text
                  selectable
                  className={cn(
                    'text-[13px] leading-5',
                    error == null ? 'text-[#2458f4]' : 'text-[#b42318]'
                  )}
                  style={{
                    fontFamily: appTypography.medium,
                    fontWeight: '500'
                  }}
                >
                  {surfaceMessage}
                </Text>
              </View>
              )}
        </View>

        <View className="flex-row items-center justify-center gap-1 pt-2">
          <Text
            selectable
            className="text-[13px] leading-5 text-[#7a8393]"
            style={{
              fontFamily: appTypography.regular,
              fontWeight: '400'
            }}
          >
            {'Don\'t have an account?'}
          </Text>
          <Pressable
            accessibilityRole="button"
            disabled={isSigningIn}
            onPress={() => {
              handleUnavailableAction('Sign up is not wired in mobile yet. Use Continue with Google for now.')
            }}
          >
            <Text
              selectable
              className="text-[13px] leading-5 text-[#4c73ff]"
              style={{
                fontFamily: appTypography.medium,
                fontWeight: '500'
              }}
            >
              Sign Up
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  )
}
